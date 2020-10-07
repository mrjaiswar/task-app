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
      version: '1.0.0',
      title: 'Task Manager',
      description: 'Task Manager API',
      termsOfService: 'http://api_url/terms/',
      contact: {
        name: 'QualIT Test Engineering',
        email: 'riju.vijayan@qualit.co.nz',
        url: 'https://qualitnz.sharepoint.com/TestEngineering/Training/Forms/AllItems.aspx'
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
      },
    },
    host: "localhost:3000",
    tags: [{
        name: 'users',
        description: 'everything about users'
      },
      {
        name: 'tasks',
        description: 'access to tasks apis'
      }
    ],
    servers: [{
      "url": "/api/v3"
    }]

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