import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  role: Role;
}

const accessOptions: SignOptions = {
  expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as SignOptions['expiresIn'],
};

const refreshOptions: SignOptions = {
  expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as SignOptions['expiresIn'],
};

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, accessOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, refreshOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}
