const amqp = require('amqplib');

let channel;

const connectWithRetry = async (url, retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect(url);
      console.log('Connected to RabbitMQ');
      return connection;
    } catch (err) {
      console.warn(`RabbitMQ connection failed (attempt ${i + 1}/${retries}). Retrying in ${delay / 1000}s...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to connect to RabbitMQ after multiple attempts');
};

const initRabbitMQ = async () => {
  try {
    const connection = await connectWithRetry(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('SUBMITTED_QUESTIONS', { durable: true });
    console.log('Queue asserted');
  } catch (err) {
    console.error('Failed to initialize RabbitMQ:', err.message);
  }
};

const publishToQueue = async (data) => {
  if (!channel) {
    console.error('RabbitMQ channel not initialized.');
    return;
  }

  try {
    const buffer = Buffer.from(JSON.stringify(data));
    channel.sendToQueue('SUBMITTED_QUESTIONS', buffer, { persistent: true });
    console.log('Message published to queue');
  } catch (err) {
    console.error('Error publishing to queue:', err.message);
  }
};

module.exports = {
  initRabbitMQ,
  publishToQueue,
};
