import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

const testEmail = 'api-test@taskflow.com';
const secondTestEmail = 'api-test-secondary@taskflow.com';

before(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [testEmail, secondTestEmail] } } });
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [testEmail, secondTestEmail] } } });
  await prisma.$disconnect();
});

describe('TaskFlow API', () => {
  it('responde no health check', async () => {
    const response = await request(app).get('/api/health').expect(200);
    assert.equal(response.body.status, 'ok');
  });

  it('cadastra, protege senha, autentica e retorna o usuário atual', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuário API',
        email: testEmail,
        password: '123456',
        confirmPassword: '123456',
      })
      .expect(201);

    assert.equal(registerResponse.body.user.email, testEmail);
    assert.equal('passwordHash' in registerResponse.body.user, false);

    const storedUser = await prisma.user.findUniqueOrThrow({ where: { email: testEmail } });
    assert.notEqual(storedUser.passwordHash, '123456');
    assert.equal(await bcrypt.compare('123456', storedUser.passwordHash), true);

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuário API',
        email: testEmail,
        password: '123456',
        confirmPassword: '123456',
      })
      .expect(409);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: '123456' })
      .expect(200);

    assert.equal(typeof loginResponse.body.token, 'string');
    assert.equal('passwordHash' in loginResponse.body.user, false);

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(200);

    assert.equal(meResponse.body.user.name, 'Usuário API');
  });

  it('rejeita credenciais e acessos inválidos', async () => {
    await request(app).get('/api/auth/me').expect(401);
    await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'senha-errada' })
      .expect(401);
  });

  it('executa o CRUD de projetos com isolamento entre usuários', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: '123456' })
      .expect(200);
    const token = loginResponse.body.token as string;

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Outro Usuário',
        email: secondTestEmail,
        password: '123456',
        confirmPassword: '123456',
      })
      .expect(201);
    const secondLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: secondTestEmail, password: '123456' })
      .expect(200);
    const secondToken = secondLoginResponse.body.token as string;

    await request(app).post('/api/projects').send({ name: 'Sem token' }).expect(401);
    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' })
      .expect(400);

    const createResponse = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Projeto acadêmico', description: 'Entrega da segunda fase.' })
      .expect(201);
    const projectId = createResponse.body.project.id as number;

    assert.equal(createResponse.body.project.name, 'Projeto acadêmico');
    assert.equal(createResponse.body.project.taskCount, 0);

    const listResponse = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    assert.equal(listResponse.body.projects.length, 1);
    assert.equal(listResponse.body.projects[0].id, projectId);

    const detailResponse = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    assert.equal(detailResponse.body.project.description, 'Entrega da segunda fase.');

    await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .expect(404);
    await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ name: 'Tentativa indevida' })
      .expect(404);
    await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .expect(404);

    const updateResponse = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Projeto atualizado', description: 'Descrição atualizada.' })
      .expect(200);
    assert.equal(updateResponse.body.project.name, 'Projeto atualizado');

    await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
