// routes/question.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /question/:category?count=3
router.get('/:category', async (req, res) => {
  const count = parseInt(req.query.count) || 1;
  const category = req.params.category;

  try {
    const questions = await Question.aggregate([
      { $match: { category } },
      { $sample: { size: count } }
    ]);

    if (!questions.length) {
      return res.json(null); // no data
    }

    // FRONTEND expects ONE question object
    const q = questions[0];

    res.json({
      question: q.question,
      answers: q.answers,
      correct: q.correct
    });

  } catch (err) {
    res.status(500).json({ error: 'Error fetching questions' });
  }
});

module.exports = router;
