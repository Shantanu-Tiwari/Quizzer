const express = require('express');
const Quiz = require('../models/Quiz');
const Score = require('../models/Score');
const auth = require('../middleware/auth');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');  // Add User import here
const router = express.Router();

router.post('/create', auth, async (req, res) => {
    const { title, description, questions } = req.body;
    const quiz = new Quiz({ title, description, questions, createdBy: req.user.id });
    await quiz.save();
    res.status(201).json(quiz);
});

router.post('/attempt/:quizId', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const { answers } = req.body;
        if (!answers || answers.length !== quiz.questions.length) {
            return res.status(400).json({ message: 'Incorrect number of answers' });
        }

        // Calculate the score
        let score = 0;
        answers.forEach((answer, index) => {
            if (answer.answer === quiz.questions[index].answer) {
                score++;
            }
        });

        const attempt = new QuizAttempt({
            quiz: quiz._id,
            user: req.user.id,
            answers,
            score
        });

        await attempt.save();
        res.status(201).json({ score });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});


router.get('/test', (req, res) => {
    res.send('Quiz routes are working!');
});

router.post('/:quizId/submit', auth, async (req, res) => {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);
    let score = 0;
    quiz.questions.forEach((question, index) => {
        if (question.answer === answers[index]) {
            score++;
        }
    });
    const newScore = new Score({ userId: req.user.id, quizId: quiz._id, score });
    await newScore.save();
    res.json({ score });
});

router.get('/:quizId/leaderboard', async (req, res) => {
    const scores = await Score.find({ quizId: req.params.quizId })
        .sort({ score: -1 })
        .limit(10);
    res.json(scores);
});

router.get('/leaderboard/:quizId', async (req, res) => {
    try {
        const quizAttempts = await QuizAttempt.find({ quiz: req.params.quizId })
            .sort({ score: -1 })  // Sort by score in descending order
            .limit(10);  // Limit to top 10 scorers

        const leaderboard = await Promise.all(
            quizAttempts.map(async (attempt) => {
                const user = await User.findById(attempt.user);
                return {
                    user: user.username,  // Assuming there's a 'username' field in User
                    score: attempt.score
                };
            })
        );

        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

router.get('/:quizId', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
