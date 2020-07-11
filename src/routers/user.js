const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send(user);
  } catch (error) {
    res.status(400).send({
      error: 'Invalid credentials!',
    });
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'Invalid Object ID',
    });
  }
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send({
        error: 'User not found',
      });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.patch('/users/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdateFields = ['name', 'email', 'password'];
  const isValidOperation = updates.every((update) =>
    allowedUpdateFields.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({
      error: `Update on field '${updates}' not allowed`,
    });
  }

  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'Invalid Object ID',
    });
  }
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send({
        error: 'User not found to update',
      });
    }
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'Invalid Object ID',
    });
  }

  try {
    const user = await User.findByIdAndDelete(_id);
    if (!user) {
      return res.status(404).send({
        error: 'User not found!',
      });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

module.exports = router;
