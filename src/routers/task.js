const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const mongoose = require('mongoose');

router.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.get('/tasks/:id', async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'Invalid Object ID',
    });
  }
  try {
    const task = await Task.findById(_id);
    if (!task) {
      return res.status(404).send({
        error: 'Task not found',
      });
    }
    res.send(task);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.patch('/tasks/:id', async (req, res) => {
  const updateBody = Object.keys(req.body);
  const allowedOperation = ['description', 'completed'];

  const isValidOperation = updateBody.every((update) =>
    allowedOperation.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({
      error: `Update on field '${updateBody}' not allowed`,
    });
  }

  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'Invalid Object ID',
    });
  }

  try {
    const task = await Task.findById(_id);
    if (!task) {
      return res.status(404).send({
        error: 'Task not found!',
      });
    }
    updateBody.forEach((update) => {
      task[update] = req.body[update];
    });
    task.save();
    // const task = await Task.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    res.send(task);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'Invalid Object ID',
    });
  }

  try {
    const task = await Task.findByIdAndDelete(_id);
    if (!task) {
      return res.status(404).send({
        error: 'Task not found',
      });
    }
    res.send(task);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

module.exports = router;
