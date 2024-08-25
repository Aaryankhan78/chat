const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const getUserDetailsFromToken = async (token) => {
    if (!token) {
        return {
            message: "session out",
            logout: true,
        };
    }

    try {
        const decode = await jwt.verify(token, process.env.JWT_SECREAT_KEY);
        console.log("Decoded token:", decode);

        const user = await UserModel.findById(decode.id).select('-password');
        if (!user) {
            throw new Error("User not found");
        }

        return user;
    } catch (error) {
        console.error("Error during token verification or user retrieval:", error.message);
        return {
            message: "User authentication failed",
            logout: true,
        };
    }
};

module.exports = getUserDetailsFromToken;
