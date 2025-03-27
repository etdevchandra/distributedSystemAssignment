const amqp = require('amqplib');

const submitQueue = 'SUBMITTED_QUESTIONS';
const moderateQueue = 'MODERATED_QUESTIONS';

let submitChannel = null;
let moderateChannel = null;

// Retry logic wrapper
const connectWithRetry = async (url, retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(url);
      console.log(`Connected to RabbitMQ at ${url}`);
      return conn;
    } catch (err) {
      console.warn(`RabbitMQ connection failed (attempt ${i + 1}/${retries}): ${err.message}`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to connect to RabbitMQ after multiple attempts');
};

// Safely check if a channel is closed or invalid
const isChannelClosed = (channel) => {
  try {
    return !channel || !channel.connection || !channel.connection.connection || channel.connection.connection.stream.destroyed;
  } catch {
    return true;
  }
};

// Connect to Submit RabbitMQ for consuming
const connectToSubmitRabbit = async (url) => {
  if (isChannelClosed(submitChannel)) {
    const conn = await connectWithRetry(url);
    submitChannel = await conn.createChannel();
    await submitChannel.assertQueue(submitQueue, { durable: true });
    console.log(`Channel ready to consume from: ${submitQueue}`);
  }
  return submitChannel;
};

// Connect to Moderate RabbitMQ for publishing
const connectToModerateRabbit = async (url) => {
  if (isChannelClosed(moderateChannel)) {
    const conn = await connectWithRetry(url);
    moderateChannel = await conn.createChannel();
    await moderateChannel.assertQueue(moderateQueue, { durable: true });
    console.log(`Channel ready to publish to: ${moderateQueue}`);
  }
  return moderateChannel;
};

// Queue accessors
const getSubmitQueueName = () => submitQueue;
const getModerateQueueName = () => moderateQueue;

module.exports = {
  connectToSubmitRabbit,
  connectToModerateRabbit,
  getSubmitQueueName,
  getModerateQueueName
};
