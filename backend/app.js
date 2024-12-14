const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const leaderboardRoutes = require('./routes/Leaderboard');

app.use(cors());
app.use(express.json());
app.use('/api/quiz', quizRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.log(err);
});

app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/quiz', quizRoutes); // Mount quiz routes
app.use('/api/leaderboard', leaderboardRoutes);
// Default Route
app.get('/', (req, res) => res.send('Quiz App Backend'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
``