const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel'); // Adjust the path based on your actual file structure

const resetPassword = (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
        if (err) {
            return res.json({ Status: "Error with token" });
        } else {
            bcrypt.hash(password, 10)
                .then(hash => {
                    UserModel.findByIdAndUpdate({ _id: id }, { password: hash })
                        .then(user => res.send({ Status: "Success" }))
                        .catch(err => res.send({ Status: err.message }));
                })
                .catch(err => res.send({ Status: err.message }));
        }
    });
};

module.exports = resetPassword;
