require('dotenv').config();
const DB_TYPE = process.env.DB_TYPE || 'mongo';

const connectWithRetry = async (connectFn, label, retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await connectFn();
    } catch {
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error(`Failed to connect to ${label}`);
};

async function initDatabase() {
  let saveToDatabase;

  if (DB_TYPE === 'mongo') {
    const mongoose = require('mongoose');
    const Question = require('./models/Question');

    await connectWithRetry(() => mongoose.connect(process.env.MONGO_URI), 'MongoDB');

    saveToDatabase = async (data) => {
      const exists = await Question.findOne({ question: data.question, category: data.category });
      if (!exists) await Question.create(data);
    };

  } else if (DB_TYPE === 'mysql') {
    const mysql = require('mysql2/promise');
    const pool = await connectWithRetry(() => mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'password',
      database: process.env.MYSQL_DB || 'questiondb'
    }), 'MySQL');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answers JSON NOT NULL,
        correct VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL
      )
    `);

    saveToDatabase = async (data) => {
      const [rows] = await pool.execute(
        'SELECT * FROM questions WHERE question = ? AND category = ? LIMIT 1',
        [data.question, data.category]
      );

      if (rows.length === 0) {
        const answers = JSON.stringify(data.answers);
        await pool.execute(
          'INSERT INTO questions (question, answers, correct, category) VALUES (?, ?, ?, ?)',
          [data.question, answers, data.correct, data.category]
        );
      }
    };
  }

  return saveToDatabase;
}

module.exports = { initDatabase };
