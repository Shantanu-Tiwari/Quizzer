const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    // Extract token from 'Authorization' header
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

    // If no token is provided
    if (!token) return res.status(401).json({ message: 'Token missing in Authorization header' });

    try {
        // Verify the token with the JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user data using the decoded ID, avoid fetching entire user details if unnecessary
        req.user = await User.findById(decoded.id).select('-password'); // Avoid sending password in response

        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        // Handle invalid or expired token
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = auth;
