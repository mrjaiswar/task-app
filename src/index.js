const express = require('express');
require('./db/mongoose');
const mongoose = require('mongoose');
const User = require('./models/user');
const Task = require('./models/task');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get('*', (req, res) => {
  return res.status(404).send({
    error: 'Invalid route',
  });
});

app.listen(port, () => {
  console.log(`Application is listening on ${port}`);
});
