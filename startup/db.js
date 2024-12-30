const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async function connectToDB() {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI,
        )
        console.log('Connected to Database');
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}