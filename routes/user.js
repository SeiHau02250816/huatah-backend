// Import packages
const express = require("express");
const router = express.Router();
const {User, validateUser} = require("../models/user");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const _ = require("lodash");

// Routes for create account
router.post("/create-account", async (req, res) => {
    const {error} = validateUser(req.body);

    // Validation failed
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Find if the same email existed
    let user = await User.findOne({email: req.body.email});

    // Email existed
    if (user) {
        return res.status(400).send("A user with this email already existed.");
    }

    // Create a new user
    user = new User(_.pick(req.body, ["firstName", "lastName", "email", "password"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const token = user.generateAuthToken();
    user.save();
    return res.send("Successfully created a new account.");
})

// Routes for sign in
function validateSignIn(credentials) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });

    return schema.validate(credentials);
}

router.post('/sign-in', async (req, res) => {
    const {error} = validateSignIn(req.body);
    // Validation failed
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({email: req.body.email});
    // Email not existed
    if (!user) {
        return res.status(400).send("Invalid email");
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send("Invalid password");
    }

    const token = user.generateAuthToken();
    response = {
        'token': token,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'email': user.email,
        'spending': user.spending,
        'budget': user.budget,
    }

    return res.send(response); 
})

// Route for add spending
function validateSpending(spending) {
    const schema = Joi.object({
        date: Joi.date().required(),
        businessName: Joi.string().required(),
        category: Joi.string().required(),
        amount: Joi.number().greater(0).required(),
    });

    return schema.validate(spending);
}

router.post('/add-spending', auth, async (req, res) => {
    const {error} = validateSpending(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(401).send("Not authorized to perform this action");
    }

    user.spending.push({
        timeStamp: req.body.date,
        businessName: req.body.businessName,
        amount: req.body.amount,
        category: req.body.category,
    });

    // Sort transactions by timeStamp (newest to oldest)
    user.spending.sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp));
    user.save();
    return res.send(user.spending);
})

// Route for delete spending
function validateDeleteSpendingRequest(req) {
    const schema = Joi.object({
        index: Joi.number().integer().required(),
    });

    return schema.validate(req);
}

router.post('/delete-spending', auth, async (req, res) => {
    const {error} = validateDeleteSpendingRequest(req.body);

    if (error) {
        return res.status(400).send("Invalid delete-spending request");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(401).send("Not authorized to perform this action");
    }

    user.spending.splice(req.body.index, 1);
    user.save();

    return res.send(user.spending);
})

// Route for add budget
// function validateBudget(budget) {
//     const schema = Joi.object({
//         type: Joi.string().required(),
//         amount: Joi.number().required(),
//     });

//     return schema.validate(budget);
// }

// router.post('/add-budget', auth, async (req, res) => {
//     const {error} = validateBudget(req.body);

//     if (error) {
//         return res.status(400).send(error.details[0].message);
//     }

//     const user = await User.findById(req.user._id);
//     if (!user) {
//         return res.status(401).send("Not authorized to perform this action");
//     }

//     user.budget.push({
//         timeStamp: Date(),
//         type: req.body.type,
//         amount: req.body.amount,
//     });
//     user.save();

//     return res.send(user.budget);
// })

// Export
module.exports = router;