require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const Question = require('./models/Question');

const connectWithRetry = async (url, retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(url);
      console.log('Connected to RabbitMQ');
      return conn;
    } catch (err) {
      console.warn(`RabbitMQ connection failed (attempt ${i + 1}/${retries}). Retrying in ${delay / 1000}s...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to connect to RabbitMQ after multiple attempts');
};

const startETL = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected in ETL');

    // Connect to RabbitMQ with retry logic
    const conn = await connectWithRetry(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue('SUBMITTED_QUESTIONS', { durable: true });
    console.log('ETL listening on SUBMITTED_QUESTIONS queue');

    
    console.log("Waiting for messages...");
    // Consume messages
    channel.consume('SUBMITTED_QUESTIONS', async (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log('Message received:', messageContent);

        try {
          const data = JSON.parse(messageContent);

          // Prevent duplicate insertions
          const exists = await Question.findOne({ question: data.question, category: data.category });
          if (!exists) {
            await Question.create(data);
            console.log('Question inserted into MongoDB');
          } else {
            console.log('Duplicate question skipped');
          }

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
