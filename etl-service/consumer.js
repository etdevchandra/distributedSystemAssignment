const amqp = require('amqplib');

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

async function startConsumer(saveToDatabase) {
  const conn = await connectWithRetry(() => amqp.connect(process.env.RABBITMQ_URL), 'RabbitMQ');
  const channel = await conn.createChannel();
  await channel.assertQueue('MODERATED_QUESTIONS', { durable: true });

  channel.consume('MODERATED_QUESTIONS', async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        await saveToDatabase(data);
        channel.ack(msg);
      } catch (err) {
        console.error('Error:', err.message);
        channel.nack(msg, false, false);
      }
    }
  });

  console.log('Consumer is listening to MODERATED_QUESTIONS queue...');
}

module.exports = { startConsumer };
