const express = require('express');
require('./db/mongoose');
const mongoose = require('mongoose');
const User = require('./models/user');
const Task = require('./models/task');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Application is listening on ${port}`);
});
