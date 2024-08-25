const mongoose = require('mongoose');
require("dotenv").config()

const connect = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Database Connection established")
    })
    .catch((err) => {
        // console.error(err)
        console.log("Connection Issues with Database");
        process.exit(1);
    })
}

module.exports = connect;