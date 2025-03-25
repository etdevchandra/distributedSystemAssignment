const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

router.get('/', async (req, res) => {
  try {
    const categories = await Question.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
