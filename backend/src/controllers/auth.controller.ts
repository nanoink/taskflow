import type { Request, Response } from 'express';
import { z } from 'zod';
import { getUserById, loginUser, registerUser } from '../services/auth.service.js';
import { AppError } from '../utils/app-error.js';

const emailSchema = z
  .email('Informe um e-mail válido.')
  .trim()
  .transform((email) => email.toLowerCase());

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe seu nome.'),
    email: emailSchema,
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha.'),
});

export async function register(req: Request, res: Response): Promise<void> {
  const { confirmPassword: _confirmPassword, ...data } = registerSchema.parse(req.body);
  const user = await registerUser(data);
  res.status(201).json({ message: 'Conta criada com sucesso.', user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const data = loginSchema.parse(req.body);
  const result = await loginUser(data);
  res.status(200).json({ message: 'Login realizado com sucesso.', ...result });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  const user = await getUserById(req.userId);
  res.status(200).json({ user });
}
