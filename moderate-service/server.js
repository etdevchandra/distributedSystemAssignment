require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Serve frontend UI from /moderate-ui
app.use('/moderate-ui', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/moderate', require('./routes/moderate'));
app.use('/categories', require('./routes/categories')); 

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => console.log(`Moderate service running on port ${PORT}`));
