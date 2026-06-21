import request from 'supertest';
import { createApp } from '../app';
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';

const app = createApp();

beforeAll(async () => {
  process.env['JWT_SECRET'] = 'test-secret-that-is-long-enough-32chars';
  process.env['MONGODB_URI'] = 'mongodb://localhost:27017/taskflow_test';
  process.env['CLIENT_ORIGIN'] = 'http://localhost:3000';
  await connectTestDb();
});

afterEach(async () => {
  await clearCollections();
});

afterAll(async () => {
  await disconnectTestDb();
});

describe('POST /api/auth/register', () => {
  it('creates a user and returns a JWT token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'Password1',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('alice@example.com');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate email with 409', async () => {
    const payload = { name: 'Alice', email: 'alice@example.com', password: 'Password1' };
    await request(app).post('/api/auth/register').send(payload);
    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects weak password with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'weak',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.details).toHaveProperty('password');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password1',
    });
  });

  it('returns a JWT on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'Password1',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'WrongPass1',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

