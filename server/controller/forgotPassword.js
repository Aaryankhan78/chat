const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserModel = require('../models/UserModel'); // Adjust the path based on your actual file structure

const forgotPassword = (req, res) => {
    const { email } = req.body;

    UserModel.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.send({ Status: "User not existed" });
            }
            const token = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "1d" });

            var transporter = nodemailer.createTransport({
                service: "gmail",
                secure: true,
                port: 465, 
                auth: {
                    user: 'chatapp800@gmail.com',
                    pass: 'asexlmbbojfrzvui' // Replace with your actual credentials
                }
            });

            var mailOptions = {
                from: 'chatapp800@gmail.com',
                to: 'aaryankhan1655544@gmail.com',
                subject: 'Reset Password Link',
                text: `http://localhost:3000/reset-password/${user._id}/${token}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ Status: "Error", Message: error.message });
                } else {
                    return res.send({ Status: "Success", Message: "Reset password link sent successfully." });
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ Status: "Error", Message: err.message });
        });
}

module.exports = forgotPassword;
