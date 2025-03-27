require('dotenv').config();
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
app.use(express.json());

// Serve static frontend files
app.use('/submit-ui', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/submit', require('./routes/submit'));
app.use('/categories', require('./routes/categories'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => console.log(`Submit service running on port ${PORT}`));
