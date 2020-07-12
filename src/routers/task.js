const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
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

router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id });
    res.send(tasks);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'Invalid Object ID',
    });
  }
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    console.log(task);
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

router.patch('/tasks/:id', auth, async (req, res) => {
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
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send({
        error: 'Task not found!',
      });
    }
    updateBody.forEach((update) => {
      task[update] = req.body[update];
    });
    task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'Invalid Object ID',
    });
  }

  try {
    const task = await Task.findByIdAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
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
