const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /tasks:
 *  post:
 *    tags:
 *      - tasks
 *    description: Use to create tasks
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: Authorization
 *        description: JWT Token
 *        in: header
 *        required: true
 *        type: string
 *      - in: body
 *        name: task
 *        description: The task to create.
 *        required: true
 *        schema:
 *          type: object
 *          required:
 *            - task
 *          properties:
 *            description:
 *              type: string
 *            completed:
 *              type: boolean
 *    responses:
 *      '201':
 *        description: Task creation successful
 *      '403':
 *        description: Invalid jwt token
 */
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
      error: 'Server Error',
      errorMessage: error,
    });
  }
});

/**
 * @swagger
 * /tasks:
 *  get:
 *    tags:
 *      - tasks
 *    description: Use to query tasks
 *    consumes:
 *      - application/json
 *    parameters:
 *       - name: completed
 *         description: Filter for completion flag
 *         in: query
 *         required: false
 *         type: string
 *       - name: limit
 *         description: Limit the number of search records
 *         in: query
 *         required: false
 *         type: int
 *       - name: sortBy
 *         description: Sort the results by creation date or completion status
 *         in: query
 *         required: false
 *         type: String
 *         example: sortBy=createdAt:desc
 *       - name: Authorization
 *         description: JWT Token
 *         in: header
 *         required: true
 *         type: string
 *    responses:
 *      '201':
 *        description: Task query successful
 *      '403':
 *        description: Invalid jwt token
 */
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    //const tasks = await Task.find({ owner: req.user._id });
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error',
      errorMessage: error,
    });
  }
});


/**
 * @swagger
 * /tasks/{id}:
 *  get:
 *    tags:
 *      - tasks
 *    description: Use to get a specific task
 *    parameters:
 *       - name: Authorization
 *         description: JWT Token
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: Task Id
 *         in: path
 *         required: true
 *         type: string
 *    responses:
 *      '200':
 *        description: Fetch task successful
 *      '403':
 *        description: Invalid jwt token
 *      '404':
 *        description: Task not found
 */
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send({
      error: 'Invalid Object ID',
    });
  }
  try {
    const task = await Task.findOne({
      _id,
      owner: req.user._id
    });
    if (!task) {
      return res.status(404).send({
        error: 'Task not found',
      });
    }
    res.send(task);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error',
      errorMessage: error,
    });
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *  patch:
 *    tags:
 *      - tasks
 *    description: Use to task user details
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
 *       - name: task
 *         in: body
 *         description: The task to update.
 *         required: true
 *         schema:
 *          type: object
 *          required:
 *            - task
 *          properties:
 *            description:
 *              type: string
 *            completed:
 *              type: string
 *    responses:
 *      '200':
 *        description: Task update successful
 *      '403':
 *        description: Invalid jwt token
 */
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
      error: 'Server Error',
      errorMessage: error,
    });
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *  delete:
 *    tags:
 *      - tasks
 *    description: Use to remove task
 *    parameters:
 *       - name: Authorization
 *         description: JWT Token
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: Task Id
 *         in: path
 *         required: true
 *         type: string
 *    responses:
 *      '200':
 *        description: Delete task successful
 *      '403':
 *        description: Invalid jwt token
 */
router.delete('/tasks/:id', auth, async (req, res) => {
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
        error: 'Task not found',
      });
    } else {
      await task.deleteOne({
        _id: task._id
      });
    }
    res.send(task);
  } catch (error) {
    res.status(500).send({
      error: 'Server Error',
      errorMessage: error,
    });
  }
});

module.exports = router;