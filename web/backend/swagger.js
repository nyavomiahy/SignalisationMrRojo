const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SignalisationMrRojo API',
      version: '1.0.0',
      description: 'API documentation for SignalisationMrRojo backend'
    },
    servers: [
      { url: process.env.SWAGGER_BASE_URL || `http://localhost:${process.env.PORT || 5000}` }
    ]
  },
  apis: [__dirname + '/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
