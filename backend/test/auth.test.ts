import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

const testEmail = 'api-test@taskflow.com';

before(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
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
});
