const express = require('express');
const cors = require('cors');
const auth = require('../middleware/auth');
const user = require('../routes/user');

module.exports = function(app) {
    app.use(express.json());
    app.use(cors());
    app.use('/api/auth', auth);
    app.use('/api/user', user);
}