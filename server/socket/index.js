const express = require('express')
const { Server } = require('socket.io')
const http  = require('http')
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
const UserModel = require('../models/UserModel')
const { ConversationModel, MessageModel } = require('../models/ConversationModel')
const getConversation = require('../helpers/getConversation')

const app = express()

/***socket connection */
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
})

// Online users
const onlineUser = new Set()

io.on('connection', async (socket) => {
    console.log("User connected", socket.id)

    const token = socket.handshake.auth.token

    // Current user details
    let user;
    try {
        user = await getUserDetailsFromToken(token)

        if (!user || !user._id) {
            throw new Error("User authentication failed");
        }

        // Create a room
        socket.join(user._id.toString())
        onlineUser.add(user._id.toString())

        io.emit('onlineUser', Array.from(onlineUser))

    } catch (error) {
        console.error("Error during user authentication or room joining:", error.message)
        socket.disconnect()
        return
    }

    socket.on('message-page', async (userId) => {
        try {
            console.log('userId', userId)
            const userDetails = await UserModel.findById(userId).select("-password")
            const payload = {
                _id: userDetails?._id,
                name: userDetails?.name,
                email: userDetails?.email,
                profile_pic: userDetails?.profile_pic,
                online: onlineUser.has(userId)
            }
            socket.emit('message-user', payload)

            // Get previous messages
            const getConversationMessage = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: userId },
                    { sender: userId, receiver: user._id }
                ]
            }).populate('messages').sort({ updatedAt: -1 })

            socket.emit('message', getConversationMessage?.messages || [])
        } catch (error) {
            console.error("Error fetching message page data:", error.message)
        }
    })

    socket.on('new message', async (data) => {
        try {
            // Check if a conversation exists between the two users
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender }
                ]
            })

            // If no conversation exists, create a new one
            if (!conversation) {
                const createConversation = new ConversationModel({
                    sender: data?.sender,
                    receiver: data?.receiver
                })
                conversation = await createConversation.save()
            }

            // Save the new message
            const message = new MessageModel({
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                msgByUserId: data?.msgByUserId,
            })
            const saveMessage = await message.save()

            // Update the conversation with the new message
            await ConversationModel.updateOne({ _id: conversation?._id }, {
                "$push": { messages: saveMessage?._id }
            })

            const getConversationMessage = await ConversationModel.findOne({
                "$or": [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender }
                ]
            }).populate('messages').sort({ updatedAt: -1 })

            io.to(data?.sender).emit('message', getConversationMessage?.messages || [])
            io.to(data?.receiver).emit('message', getConversationMessage?.messages || [])

            // Send updated conversations
            const conversationSender = await getConversation(data?.sender)
            const conversationReceiver = await getConversation(data?.receiver)

            io.to(data?.sender).emit('conversation', conversationSender)
            io.to(data?.receiver).emit('conversation', conversationReceiver)

        } catch (error) {
            console.error("Error handling new message:", error.message)
        }
    })

    // Handle sidebar request
    socket.on('sidebar', async (currentUserId) => {
        try {
            console.log("current user", currentUserId)

            const conversation = await getConversation(currentUserId)

            socket.emit('conversation', conversation)
        } catch (error) {
            console.error("Error handling sidebar request:", error.message)
        }
    })

    // Mark messages as seen
    socket.on('seen', async (msgByUserId) => {
        try {
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: msgByUserId },
                    { sender: msgByUserId, receiver: user._id }
                ]
            })

            const conversationMessageIds = conversation?.messages || []

            await MessageModel.updateMany(
                { _id: { "$in": conversationMessageIds }, msgByUserId: msgByUserId },
                { "$set": { seen: true } }
            )

            // Send updated conversations
            const conversationSender = await getConversation(user?._id?.toString())
            const conversationReceiver = await getConversation(msgByUserId)

            io.to(user?._id?.toString()).emit('conversation', conversationSender)
            io.to(msgByUserId).emit('conversation', conversationReceiver)

        } catch (error) {
            console.error("Error marking messages as seen:", error.message)
        }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
        if (user?._id) {
            onlineUser.delete(user._id.toString())
            io.emit('onlineUser', Array.from(onlineUser))
        }
        console.log('User disconnected', socket.id)
    })
})

module.exports = {
    app,
    server
}
