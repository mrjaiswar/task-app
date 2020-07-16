const express = require('express');
require('./db/mongoose');
const mongoose = require('mongoose');
const User = require('./models/user');
const Task = require('./models/task');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Task Manager API',
      description: 'Task Manager API Specifications',
      contact: {
        name: 'Riju Vijayan',
      },
    },
  },
  apis: ['src/routers/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get('*', (req, res) => {
  return res.status(404).send({
    error: 'Invalid route',
  });
});

module.exports = app;
