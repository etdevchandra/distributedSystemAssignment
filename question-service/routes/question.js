const express = require('express');
const router = express.Router();
const dbType = process.env.DB_TYPE || 'mongodb';

if (dbType === 'mysql') {
  // MySQL setup
  const mysql = require('mysql2/promise');

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'mysql',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'questiondb',
  });

  // GET /categories - get distinct categories from MySQL
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT DISTINCT category FROM questions');
      const categories = rows.map(row => row.category);
      res.json(categories);
    } catch (err) {
      console.error('MySQL error:', err.message);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // GET /:category?count=x - get questions by category
  router.get('/:category', async (req, res) => {
    const { category } = req.params;
    const count = parseInt(req.query.count) || 1;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM questions WHERE category = ? ORDER BY RAND() LIMIT ?',
        [category, count]
      );

      // Parse the answers JSON
      const parsed = rows.map(row => ({
        question: row.question,
        answers: row.answers,
        correct: row.correct,
        category: row.category
      }));

      res.json(parsed);
    } catch (err) {
      console.error('MySQL error:', err.message);
      res.status(500).json({ error: 'Database error' });
    }
  });

} else {
  // MongoDB (Mongoose) setup
  const Question = require('../models/Question');

  // GET /categories - get distinct categories from MongoDB
  router.get('/', async (req, res) => {
    try {
      const categories = await Question.distinct('category');
      res.json(categories);
    } catch (err) {
      console.error('MongoDB error:', err.message);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // GET /:category?count=x - get questions by category
  router.get('/:category', async (req, res) => {
    const { category } = req.params;
    const count = parseInt(req.query.count) || 1;

    try {
      const questions = await Question.aggregate([
        { $match: { category } },
        { $sample: { size: count } }
      ]);

      res.json(questions);
    } catch (err) {
      console.error('MongoDB error:', err.message);
      res.status(500).json({ error: 'Database error' });
    }
  });
}

module.exports = router;
