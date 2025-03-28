require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());

// Serve Question UI from /question-ui
app.use('/question-ui', express.static(path.join(__dirname, 'public')));

// Add debug route to confirm service is running
app.get('/debug', (req, res) => {
  res.send('Question service is alive and responding');
});

const DB_TYPE = process.env.DB_TYPE || 'mongo';

const startServer = async () => {
  try {
    if (DB_TYPE === 'mongo') {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB connected in Question Service');
    } else if (DB_TYPE === 'mysql') {
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'mysql',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'password',
        database: process.env.MYSQL_DATABASE || 'questiondb'
      });
      console.log('MySQL connected in Question Service');
      global.mysqlConnection = connection;
    } else {
      console.error(`Unsupported DB_TYPE: ${DB_TYPE}`);
      process.exit(1);
    }

    // API routes
    const categoryRoutes = require('./routes/categories');
    const questionRoutes = require('./routes/question');
    app.use('/categories', categoryRoutes);
    app.use('/question', questionRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
};

startServer();
