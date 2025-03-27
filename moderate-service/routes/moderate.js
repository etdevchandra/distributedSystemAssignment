const express = require('express');
const router = express.Router();

const {
  connectToSubmitRabbit,
  connectToModerateRabbit,
  getSubmitQueueName,
  getModerateQueueName
} = require('../rabbitmq');

let submitChannel = null;
let lastDeliveryTag = null;

// GET /moderate → Pull from SUBMITTED_QUESTIONS on Submit RabbitMQ
router.get('/', async (req, res) => {
  try {
    submitChannel = await connectToSubmitRabbit(process.env.RABBITMQ_URL);
    const msg = await submitChannel.get(getSubmitQueueName(), { noAck: false });

    if (msg) {
      const parsed = JSON.parse(msg.content.toString());
      lastDeliveryTag = msg.fields.deliveryTag;

      return res.json({
        data: {
          question: parsed.question,
          answers: parsed.answers,
          correct: parsed.correct,
          category: parsed.category
        },
        ackTag: lastDeliveryTag // send for UI display (optional)
      });
    } else {
      lastDeliveryTag = null;
      return res.status(204).json({ message: 'No pending messages' });
    }
  } catch (err) {
    console.error('Error in GET /moderate:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve message from queue' });
  }
});

// POST /moderate → Approve or Reject
router.post('/', async (req, res) => {
  const { question, answers, correct, category, approved } = req.body;

  try {
    const moderateChannel = await connectToModerateRabbit(process.env.MODERATE_RABBITMQ_URL);

    if (approved) {
      const payload = { question, answers, correct, category };
      await moderateChannel.sendToQueue(
        getModerateQueueName(),
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
      console.log('Sent to MODERATED_QUESTIONS');
    } else {
      console.log('Question rejected by moderator');
    }

    // Acknowledge using the SAME CHANNEL used in GET
    if (submitChannel && lastDeliveryTag !== null) {
      submitChannel.ack({ fields: { deliveryTag: lastDeliveryTag } });
      console.log(`Acknowledged message with tag ${lastDeliveryTag}`);
      lastDeliveryTag = null;
    }

    return res.status(200).json({
      message: approved ? 'Approved and forwarded' : 'Rejected and removed'
    });
  } catch (err) {
    console.error('Error in POST /moderate:', err.message);
    return res.status(500).json({ error: 'Moderation processing failed' });
  }
});

module.exports = router;
