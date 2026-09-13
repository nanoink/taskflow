import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

type TokenPayload = {
  sub: string;
};

export function createAccessToken(userId: number): string {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
