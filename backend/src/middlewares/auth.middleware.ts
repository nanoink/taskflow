import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError('Token de autenticação não informado.', 401));
    return;
  }

  try {
    const token = authorization.slice(7).trim();
    const payload = verifyAccessToken(token);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new jwt.JsonWebTokenError('Identificador inválido');
    }

    req.userId = userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Sua sessão expirou. Entre novamente.', 401));
      return;
    }

    next(new AppError('Token de autenticação inválido.', 401));
  }
}
