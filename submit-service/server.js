require('dotenv').config();
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { initRabbitMQ } = require('./rabbitmq');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Only initialize RabbitMQ (no MongoDB needed)
initRabbitMQ()
  .then(() => {
    console.log('RabbitMQ initialized');
  })
  .catch(err => {
    console.error('RabbitMQ connection error:', err.message);
  });

// Routes
app.use('/submit', require('./routes/submit'));
app.use('/categories', require('./routes/categories'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => console.log(`Submit service running on port ${PORT}`));

