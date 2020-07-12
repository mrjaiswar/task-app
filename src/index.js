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

// const Task1 = require('./models/task');
// const User1 = require('./models/user');

// const main = async () => {
//   // const task = await Task1.findById('5f0a6886e9a4a60175ea7225');
//   // await task.populate('owner').execPopulate();
//   // console.log(task.owner);

//   const user = await User1.findById('5f083eed4ccc6a698a74a8ec');
//   await user.populate('tasks').execPopulate();
//   console.log(user.tasks);
// };

// main();
