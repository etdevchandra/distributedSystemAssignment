const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get list of all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Question.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

module.exports = router;
