const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Mike',
  email: 'mike@gmail.com',
  password: 'mikepass123!',
  tokens: {
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
  },
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

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

test('should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens.token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('should not delete account for unauthorized user', async () => {
  await request(app).delete('/users/me').send().expect(403);
});
