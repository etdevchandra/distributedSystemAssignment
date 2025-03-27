require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

// Serve Question UI from /question-ui
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/question-ui', express.static(path.join(__dirname, 'public')));

// Add debug route to confirm service is running
app.get('/debug', (req, res) => {
  res.send('Question service is alive and responding');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// API routes
const categoryRoutes = require('./routes/categories');
const questionRoutes = require('./routes/question');

app.use('/categories', categoryRoutes);
app.use('/question', questionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
