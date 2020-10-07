const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const {
  response
} = require('express');
const {
  sendEmail,
  sendCancellationEmail
} = require('../emails/account');

/**
 * @swagger
 * /users:
 *  post:
 *    tags:
 *      - users
 *    description: Use to create new users
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: user
 *        description: The user to create.
 *        schema:
 *          type: object
 *          required:
 *            - userName
 *          properties:
 *            name:
 *              type: string
 *            email:
 *              type: string
 *            password:
 *              type: string
 *    responses:
 *      '201':
 *        description: User creation successful
 */
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.generateAuthToken();
    await user.save();
    sendEmail(user.name, user.email);
    res.status(201).send(user);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error!',
      errorMessage: error,
    });
  }
});

/**
 * @swagger
 * /users/login:
 *  post:
 *    tags:
 *      - users
 *    description: Use to login
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: user
 *        description: The user to create.
 *        schema:
 *          type: object
 *          required:
 *            - userName
 *          properties:
 *            email:
 *              type: string
 *            password:
 *              type: string
 *    responses:
 *      '201':
 *        description: User creation successful
 */
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

/**
 * @swagger
 * /users/logout:
 *  post:
 *    tags:
 *      - users
 *    description: Use to logout of current session of the user
 *    parameters:
 *       - name: Authorization
 *         description: JWT Token
 *         in: header
 *         required: true
 *         type: string
 *    responses:
 *      '200':
 *        description: Logout successful
 *      '403':
 *        description: Invalid jwt token
 */
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

/**
 * @swagger
 * /users/logoutAll:
 *  post:
 *    tags:
 *      - users
 *    description: Use to logout all sessions of an user
 *    parameters:
 *       - name: Authorization
 *         description: JWT Token
 *         in: header
 *         required: true
 *         type: string
 *    responses:
 *      '200':
 *        description: Logout successful
 *      '403':
 *        description: Invalid jwt token
 */
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

/**
 * @swagger
 * /users/me:
 *  get:
 *    tags:
 *      - users
 *    description: Use to get current logged in user profile information
 *    parameters:
 *       - name: Authorization
 *         description: JWT Token
 *         in: header
 *         required: true
 *         type: string
 *    responses:
 *      '200':
 *        description: Logout successful
 *      '403':
 *        description: Invalid jwt token
 */
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

/**
 * @swagger
 * /users:
 *  get:
 *    tags:
 *      - users
 *    description: Use to get details of all registered users in the system
 *    parameters:
 *       - name: Authorization
 *         description: JWT Token
 *         in: header
 *         required: true
 *         type: string
 *    responses:
 *      '200':
 *        description: Logout successful
 *      '403':
 *        description: Invalid jwt token
 */
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error',
      errorMessage: error,
    });
  }
});

/**
 * @swagger
 * /users/me:
 *  delete:
 *    tags:
 *      - users
 *    description: Use to remove user profile
 *    parameters:
 *       - name: Authorization
 *         description: JWT Token
 *         in: header
 *         required: true
 *         type: string
 *    responses:
 *      '200':
 *        description: Logout successful
 *      '403':
 *        description: Invalid jwt token
 */
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.name, req.user.email);
    res.send(req.user);
  } catch (error) {
    response.status(500).send({
      error: 'Delete user failed',
    });
  }
});

/**
 * @swagger
 * /users/me:
 *  patch:
 *    tags:
 *      - users
 *    description: Use to update user details
 *    parameters:
 *       - name: Authorization
 *         description: JWT Token
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: User Id
 *         in: path
 *         required: true
 *         type: string
 *    responses:
 *      '200':
 *        description: Logout successful
 *      '403':
 *        description: Invalid jwt token
 */
router.patch('/users/me', auth, async (req, res) => {
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

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error',
      errorMessage: error,
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'User not found',
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
      error: 'Server Error',
      errorMessage: error,
    });
  }
});

module.exports = router;