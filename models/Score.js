const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: { type: Number, required: true }
});

module.exports = mongoose.model('Score', scoreSchema);
