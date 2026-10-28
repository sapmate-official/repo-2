import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'alkaa-business-plus-secure-jwt-key-2026';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  staffId?: number | null;
}

export async function authenticateRequest(req: NextRequest): Promise<AuthUser | null> {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    try {
      const user = await prisma.user.findFirst({ where: { apiKey } });
      if (user) {
        return {
          id: user.id,
          username: user.username,
          role: user.role || 'admin',
          staffId: user.staffId,
        };
      }
    } catch {
      return null;
    }
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role || 'admin',
      staffId: decoded.staffId,
    };
  } catch {
    return null;
  }
}

export function signToken(payload: { id: number; username: string; role?: string; staffId?: number | null }): string {
  return jwt.sign(
    {
      id: payload.id,
      username: payload.username,
      role: payload.role || 'admin',
      staffId: payload.staffId ?? null,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}
