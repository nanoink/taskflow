import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';
import { createAccessToken } from '../utils/jwt.js';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

export async function registerUser(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError('Este e-mail já está cadastrado.', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
    },
    select: publicUserSelect,
  });
}

export async function loginUser(input: LoginInput) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const token = createAccessToken(user.id);
  const { passwordHash: _passwordHash, updatedAt: _updatedAt, ...safeUser } = user;
  return { token, user: safeUser };
}

export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return user;
}
