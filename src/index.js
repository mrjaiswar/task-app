const express = require('express');
require('./db/mongoose');
const mongoose = require('mongoose');
const User = require('./models/user');
const Task = require('./models/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/users', (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => {
      res.status(201).send(user);
    })
    .catch((error) => {
      res.status(500).send({
        message: 'Server Error!',
        error: error,
      });
    });
});

app.get('/users', (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      res.status(500).send({
        message: 'Server Error!',
        error: error,
      });
    });
});

app.get('/users/:id', (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      message: 'Invalid Object ID',
    });
  }
  User.findById(_id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: 'User not found',
        });
      }
      res.send(user);
    })
    .catch((error) => {
      res.status(500).send({
        message: 'Server Error!',
        error: error,
      });
    });
});

app.post('/tasks', (req, res) => {
  const task = new Task(req.body);
  task
    .save()
    .then(() => {
      res.status(201).send(task);
    })
    .catch((error) => {
      res.status(500).send({
        message: 'Server Error!',
        error: error,
      });
    });
});

app.get('/tasks', (req, res) => {
  Task.find({})
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((error) => {
      res.status(500).send({
        message: 'Server Error!',
        error: error,
      });
    });
});

app.get('/tasks/:id', (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      message: 'Invalid Object ID',
    });
  }
  Task.findById(_id)
    .then((task) => {
      if (!task) {
        return res.status(404).send({
          message: 'Task not found',
        });
      }
      res.send(task);
    })
    .catch((error) => {
      res.status(500).send({
        message: 'Server Error!',
        error: error,
      });
    });
});

app.get('*', (req, res) => {
  res.status(404).send({
    message: 'Invalid route',
  });
});

app.listen(port, () => {
  console.log(`Application is listening on ${port}`);
});
