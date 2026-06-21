import request from 'supertest';
import { createApp } from '../app';
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';

const app = createApp();

async function registerAndLogin(email: string, name = 'User') {
  const res = await request(app).post('/api/auth/register').send({
    name,
    email,
    password: 'Password1',
  });
  return res.body.data as { token: string; user: { id: string } };
}

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

describe('Task CRUD', () => {
  let ownerToken: string;
  let boardId: string;

  beforeEach(async () => {
    const owner = await registerAndLogin('owner@example.com', 'Owner');
    ownerToken = owner.token;

    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Test Board' });
    boardId = boardRes.body.data.id as string;
  });

  it('creates a task with default status todo', async () => {
    const res = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Implement login', description: 'JWT auth' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Implement login');
    expect(res.body.data.status).toBe('todo');
  });

  it('returns tasks grouped by status when no filter is applied (Kanban view)', async () => {
    await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Task A', status: 'todo' });

    await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Task B', status: 'in_progress' });

    await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Task C', status: 'done' });

    const res = await request(app)
      .get(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('todo');
    expect(res.body.data).toHaveProperty('in_progress');
    expect(res.body.data).toHaveProperty('done');
    expect(res.body.data.todo).toHaveLength(1);
    expect(res.body.data.in_progress).toHaveLength(1);
    expect(res.body.data.done).toHaveLength(1);
  });

  it('filters tasks by status', async () => {
    await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Todo Task', status: 'todo' });

    await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Done Task', status: 'done' });

    const res = await request(app)
      .get(`/api/boards/${boardId}/tasks?status=todo`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Todo Task');
  });

  it('updates a task status', async () => {
    const createRes = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Start me', status: 'todo' });

    const taskId = createRes.body.data.id as string;

    const updateRes = await request(app)
      .put(`/api/boards/${boardId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'in_progress' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('in_progress');
  });

  it('rejects invalid status value with 400', async () => {
    const res = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Bad status', status: 'invalid_status' });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('status');
  });
});
