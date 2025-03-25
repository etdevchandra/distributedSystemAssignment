const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Submit API',
      version: '1.0.0',
      description: 'API for submitting multiple choice questions',
    },
  },
  apis: ['./routes/*.js'], // This tells Swagger to scan route files for JSDoc comments
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
