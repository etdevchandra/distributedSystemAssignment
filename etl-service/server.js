require('dotenv').config();
const amqp = require('amqplib');

const DB_TYPE = process.env.DB_TYPE || 'mongo';

const connectWithRetry = async (connectFn, label = 'Service', retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await connectFn();
      console.log(`${label} connected`);
      return result;
    } catch (err) {
      console.warn(`${label} connection failed (attempt ${i + 1}/${retries}). Retrying in ${delay / 1000}s...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error(`Failed to connect to ${label} after multiple attempts`);
};

let saveToDatabase;

const initDatabase = async () => {
  if (DB_TYPE === 'mongo') {
    const mongoose = require('mongoose');
    const Question = require('./models/Question');

    await connectWithRetry(
      () => mongoose.connect(process.env.MONGO_URI),
      'MongoDB'
    );

    saveToDatabase = async (data) => {
      const exists = await Question.findOne({ question: data.question, category: data.category });
      if (!exists) {
        await Question.create(data);
        console.log('Question inserted into MongoDB');
      } else {
        console.log('Duplicate question skipped (MongoDB)');
      }
    };
  }

  else if (DB_TYPE === 'mysql') {
    const mysql = require('mysql2/promise');
    const pool = await connectWithRetry(
      () => mysql.createPool({
        host: process.env.MYSQL_HOST || 'mysql',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'password',
        database: process.env.MYSQL_DB || 'questiondb',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      }),
      'MySQL'
    );

    // Auto-create table if not exists
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
        const answers = Array.isArray(data.answers)
          ? JSON.stringify(data.answers)
          : JSON.stringify([data.answers]);

        await pool.execute(
          'INSERT INTO questions (question, answers, correct, category) VALUES (?, ?, ?, ?)',
          [data.question, answers, data.correct, data.category]
        );
        console.log('Question inserted into MySQL');
      } else {
        console.log('Duplicate question skipped (MySQL)');
      }
    };
  }

  else {
    throw new Error('Invalid DB_TYPE: must be "mongo" or "mysql"');
  }
};

const startETL = async () => {
  try {
    await initDatabase();

    const conn = await connectWithRetry(() => amqp.connect(process.env.RABBITMQ_URL), 'RabbitMQ');
    const channel = await conn.createChannel();
    await channel.assertQueue('MODERATED_QUESTIONS', { durable: true });
    console.log('ETL listening on MODERATED_QUESTIONS queue');
    console.log('Waiting for messages...');

    channel.consume('MODERATED_QUESTIONS', async (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log('Message received:', messageContent);

        try {
          const data = JSON.parse(messageContent);
          await saveToDatabase(data);
          channel.ack(msg);
        } catch (err) {
          console.error('Error processing message:', err.message);
          channel.nack(msg, false, false); // Discard bad message
        }
      }
    });

  } catch (err) {
    console.error('ETL Startup Error:', err.message);
    process.exit(1);
  }
};

startETL();
