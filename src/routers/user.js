const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { response } = require('express');

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save();
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

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).send({
      error: 'Logout failed',
      errorMessage: error,
    });
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({
      message: 'Logged out of all sessions',
    });
  } catch (error) {
    res.status(500).send({
      error: 'Logout failed',
      errorMessage: error,
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

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    response.status(500).send({
      error: 'Delete user failed',
    });
  }
});

router.patch('/users/:id', auth, async (req, res) => {
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
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
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
