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

describe('Board CRUD', () => {
  it('creates a board and sets the creator as owner', async () => {
    const { token } = await registerAndLogin('owner@example.com', 'Owner');

    const res = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Board', description: 'Test board' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('My Board');
    expect(res.body.data.myRole).toBe('owner');
    expect(res.body.data.members).toHaveLength(1);
    expect(res.body.data.members[0].role).toBe('owner');
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/boards');
    expect(res.status).toBe(401);
  });

  it('lists only boards the user belongs to', async () => {
    const alice = await registerAndLogin('alice@example.com', 'Alice');
    const bob = await registerAndLogin('bob@example.com', 'Bob');

    await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ name: "Alice's Board" });

    await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${bob.token}`)
      .send({ name: "Bob's Board" });

    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${alice.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Alice's Board");
  });
});

describe('RBAC — Member Management', () => {
  it('allows owner to add a member', async () => {
    const owner = await registerAndLogin('owner@example.com', 'Owner');
    await registerAndLogin('editor@example.com', 'Editor');

    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Team Board' });

    const boardId = boardRes.body.data.id as string;

    const addRes = await request(app)
      .post(`/api/boards/${boardId}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ email: 'editor@example.com', role: 'editor' });

    expect(addRes.status).toBe(201);
    expect(addRes.body.data.members).toHaveLength(2);
  });

  it('prevents editor from adding members (403)', async () => {
    const owner = await registerAndLogin('owner@example.com', 'Owner');
    const editor = await registerAndLogin('editor@example.com', 'Editor');
    await registerAndLogin('viewer@example.com', 'Viewer');

    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Team Board' });
    const boardId = boardRes.body.data.id as string;

    await request(app)
      .post(`/api/boards/${boardId}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ email: 'editor@example.com', role: 'editor' });

    const res = await request(app)
      .post(`/api/boards/${boardId}/members`)
      .set('Authorization', `Bearer ${editor.token}`)
      .send({ email: 'viewer@example.com', role: 'viewer' });

    expect(res.status).toBe(403);
  });
});

describe('RBAC — Task Modification', () => {
  it('prevents viewers from creating tasks (403)', async () => {
    const owner = await registerAndLogin('owner@example.com', 'Owner');
    const viewer = await registerAndLogin('viewer@example.com', 'Viewer');

    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Team Board' });
    const boardId = boardRes.body.data.id as string;

    await request(app)
      .post(`/api/boards/${boardId}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ email: 'viewer@example.com', role: 'viewer' });

    const res = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${viewer.token}`)
      .send({ title: 'Task', description: '', status: 'todo' });

    expect(res.status).toBe(403);
  });
});
