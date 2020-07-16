const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Riju',
      email: 'riju@gmail.com',
      password: 'rijuvijayan',
    })
    .expect(201);
  const user = await User.findById(response.body._id);
  expect(user).not.toBeNull();
  expect(response.body.name).toBe('Riju');
  expect(response.body).toMatchObject({
    name: 'Riju',
    email: 'riju@gmail.com',
  });
  expect(user.password).not.toBe('rijuvijayan');
});

test('should not signup user with invalid name', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name:
        'invalidnameinvalidnameinvalidnameinvalidnameinvalidnameinvalidname',
      email: 'invalid@gmail.com',
      password: 'invalidusername',
    })
    .expect(500);
});

test('should not signup user with invalid email', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Riju',
      email: 'rijutest@gmail.com',
      password: 'rijupass123!',
    })
    .expect(500);
});

test('should not signup user with invalid password', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Riju',
      email: 'newemail@gmail.com',
      password: 'rijupa',
    })
    .expect(500);
});

test('should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findOne(userOneId);
  expect(user).not.toBeNull();
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not login with non existent email', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'nonexistent@gmail.com',
      password: userOne.password,
    })
    .expect(400);
});

test('should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens.token}`)
    .send()
    .expect(200);
});

test('should not get profile for unauthorized user', async () => {
  await request(app).get('/users/me').send().expect(403);
});

test('should not delete account for unauthorized user', async () => {
  await request(app).delete('/users/me').send().expect(403);
});

test('should update valid user fields', async () => {
  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens.token}`)
    .send({
      name: 'Updated Name',
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe('Updated Name');
});

test('should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens.token}`)
    .send({
      location: 'Invalid',
    })
    .expect(400);
});

test('should not update user if unauthenticated', async () => {
  const response = await request(app)
    .patch('/users/me')
    .send({
      name: 'Updated Name',
    })
    .expect(403);

  const user = await User.findOne(userOneId);
  expect(user.name).not.toBe('Updated Name');
});

test('should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens.token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});
