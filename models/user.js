const mongoose = require('mongoose');
const joi = require('joi');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// User model
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    spending: [
        {
            timeStamp: {
                type: Date,
                required: true,
            },
            businessName: {
                type: String,
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            category: {
                type: String,
                required: true,
            },
        }
    ],
    budget: [
        {
            timeStamp: {
                type: Date,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            description: {
                type: String,
            }
        }
    ]
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_PRIVATE_KEY);
    return token;
};

const User = mongoose.model('User', userSchema);

// REST Validation
function validateUser(user) {
    const schema = joi.object({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: joi.string().required(),
        password: joi.string().required(),
    });

    return schema.validate(user);
};

// Export
module.exports = {
    User,
    validateUser,
}