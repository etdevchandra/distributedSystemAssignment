const express = require('express');
const router = express.Router();

const DB_TYPE = process.env.DB_TYPE || 'mongo';

if (DB_TYPE === 'mongo') {
  const Question = require('../models/Question');

  router.get('/', async (req, res) => {
    try {
      const categories = await Question.distinct('category');
      res.json(categories); // Must return an array
    } catch (err) {
      console.error('MongoDB category fetch error:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  });

} else if (DB_TYPE === 'mysql') {
  router.get('/', async (req, res) => {
    try {
      // Make sure global.mysqlConnection is set in server.js
      const [rows] = await global.mysqlConnection.execute(
        'SELECT DISTINCT category FROM questions'
      );

      const categories = rows.map(row => row.category);
      res.json(categories); // Return array, not object
    } catch (err) {
      console.error('MySQL category fetch error:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  });
}

module.exports = router;
