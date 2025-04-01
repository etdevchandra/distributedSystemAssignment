require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Serve frontend UI (moderator panel)
app.use('/moderate-ui', express.static(path.join(__dirname, 'public')));

// Moderate and category routes (no authentication required)
app.use('/moderate', require('./routes/moderate'));
app.use('/categories', require('./routes/categories'));

// Debug route
app.get('/debug', (req, res) => {
  res.json({
    authenticated: false,
    user: null
  });
});

// Root route
app.get('/', (req, res) => {
  res.redirect('/moderate-ui');
});

// Start server
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => console.log(`Moderate service running on port ${PORT}`));
