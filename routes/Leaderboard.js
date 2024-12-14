const express = require('express');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User'); // To fetch user details (e.g., username)
const router = express.Router();

// Get leaderboard for a specific quiz (top 10 scorers)
router.get('/:quizId', async (req, res) => {
    try {
        // Fetch quiz attempts sorted by score in descending order
        const quizAttempts = await QuizAttempt.find({ quiz: req.params.quizId })
            .sort({ score: -1 })  // Sort by score, descending
            .limit(10);  // Limit to top 10 attempts

        // Map through the quiz attempts to retrieve user details
        const leaderboard = await Promise.all(
            quizAttempts.map(async (attempt) => {
                const user = await User.findById(attempt.user); // Fetch user by ID
                return {
                    user: user ? user.username : 'Unknown',  // Provide username (fallback to 'Unknown')
                    score: attempt.score
                };
            })
        );

        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
