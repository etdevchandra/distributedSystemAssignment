const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const router = express.Router();

const CACHE_FILE = path.join(__dirname, '../cache/categories.json');
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL;

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
    console.log('Fetching categories from:', QUESTION_SERVICE_URL);
    const response = await axios.get(QUESTION_SERVICE_URL);
    const categories = response.data;

    if (!Array.isArray(categories)) {
      throw new Error('Invalid response format — expected array.');
    }

    // Ensure cache directory exists
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });

    // Cache the categories (even if empty)
    fs.writeFileSync(CACHE_FILE, JSON.stringify(categories, null, 2), 'utf-8');
    console.log('Categories cached:', categories);

    res.json(categories);
  } catch (err) {
    console.warn('Could not fetch from Question service, using cache...');
    console.warn(err.message);

    if (fs.existsSync(CACHE_FILE)) {
      try {
        const cached = fs.readFileSync(CACHE_FILE, 'utf-8');
        console.log('Serving categories from cache.');
        return res.json(JSON.parse(cached));
      } catch (parseErr) {
        console.error('Failed to read from cache:', parseErr.message);
      }
    }

    res.status(500).json({ error: 'Failed to fetch categories and no valid cache available.' });
  }
});

module.exports = router;
