const express = require('express');
const router = express.Router();
const { publishToQueue } = require('../rabbitmq'); // Import publisher

/**
 * @swagger
 * /submit:
 *   post:
 *     summary: Submit a new question
 *     tags: [Submit]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: string
 *               correct:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question submitted
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  const { question, answers, correct, category } = req.body;

  // Validate input
  if (!question || !answers || answers.length !== 4 || !correct || !category) {
    return res.status(400).json({ error: 'All fields are required, including four answers.' });
  }

  if (!answers.includes(correct)) {
    return res.status(400).json({ error: 'Correct answer must be one of the provided answers.' });
  }

  try {
    const payload = { question, answers, correct, category };
    await publishToQueue(payload); 

    res.status(201).json({ message: 'Question submitted to queue successfully!' });
  } catch (err) {
    console.error('Queue Error:', err);
    res.status(500).json({ error: 'Error publishing to queue.' });
  }
});

module.exports = router;
