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
  expect(response.body).toEqual({
    error: 'Task not found',
  });
  const task = await Task.findById(taskTwo._id);
  expect(task).not.toBeNull();
});

test('should not create task with invalid description/completed', async () => {});

test('should not update task with invalid description/completed', async () => {});

test('should delete user task', async () => {});

test('should not delete task if unauthenticated', async () => {});

test('should not update other users task', async () => {});

test('should fetch user task by id', async () => {});

test('should not fetch user task by id if unauthenticated', async () => {});

test('should not fetch other users task by id', async () => {});

test('should fetch only completed tasks', async () => {});

test('should fetch only incomplete tasks', async () => {});

test('should sort tasks by description/completed/createdAt/updatedAt', async () => {});

test('should fetch page of tasks', async () => {});
