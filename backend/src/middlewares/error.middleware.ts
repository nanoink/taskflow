import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '../generated/prisma/client.js';
import { ZodError, flattenError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(`Rota ${req.method} ${req.path} não encontrada.`, 404));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Confira os dados informados.',
      errors: flattenError(error).fieldErrors,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    message: 'Ocorreu um erro interno. Tente novamente em instantes.',
    ...(env.NODE_ENV === 'development' && error instanceof Error
      ? { debug: error.message }
      : {}),
  });
};
