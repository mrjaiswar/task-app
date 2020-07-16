const request = require('supertest');
const Task = require('../src/models/task');
const app = require('../src/app');
const {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens.token}`)
    .send({
      description: 'Task created from test',
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test('should not return tasks for an unauthorized user', async () => {
  const response = await request(app).get('/tasks').send().expect(403);
});

test('should return tasks for an authorized user', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens.token}`)
    .send()
    .expect(200);

  expect(response.body.length).toBe(2);
});

test('should not delete other users task', async () => {
  const response = await request(app)
    .delete(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens.token}`)
    .send()
    .expect(404);
});