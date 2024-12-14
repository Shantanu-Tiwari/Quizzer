const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        return res.status(400).json({ message: 'Username already in use' });
    }

    // Hash the password and create a new user
    const user = new User({
        username,
        email,
        password: await bcrypt.hash(password, 10)
    });

    try {
        await user.save();
        res.status(201).send('User created');
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});



// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

module.exports = router;
