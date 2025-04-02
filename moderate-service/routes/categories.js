const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const router = express.Router();
const CACHE_FILE = path.join(__dirname, '../cache/categories.json');
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL;

router.get('/', async (req, res) => {
  try {
    const response = await axios.get(QUESTION_SERVICE_URL);
    const categories = response.data;

    if (!Array.isArray(categories)) {
      throw new Error('Invalid response format — expected array.');
    }

    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(categories, null, 2), 'utf-8');

    return res.json(categories);
  } catch (err) {
    console.warn('Could not fetch from Question service. Falling back to cache...');
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const cached = fs.readFileSync(CACHE_FILE, 'utf-8');
        return res.json(JSON.parse(cached));
      } catch (readErr) {
        console.error('Failed to read categories cache:', readErr.message);
      }
    }

    return res.status(500).json({ error: 'Failed to fetch categories and no valid cache.' });
  }
});

module.exports = router;
