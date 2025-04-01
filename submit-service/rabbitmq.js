const amqp = require('amqplib');

let channel;
const QUEUE_NAME = 'SUBMITTED_QUESTIONS';

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

const ensureChannel = async () => {
  if (channel) return channel;

  const connection = await connectWithRetry(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log(`Queue '${QUEUE_NAME}' asserted`);
  return channel;
};

const publishToQueue = async (data) => {
  try {
    const ch = await ensureChannel();
    const buffer = Buffer.from(JSON.stringify(data));
    await ch.sendToQueue(QUEUE_NAME, buffer, { persistent: true });
    console.log('Message published to queue');
  } catch (err) {
    console.error('Error publishing to queue:', err.message);
  }
};

module.exports = {
  publishToQueue,
};
