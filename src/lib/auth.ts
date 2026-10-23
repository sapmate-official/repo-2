import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'alkaa-business-plus-secure-jwt-key-2026';

export async function authenticateRequest(req: NextRequest): Promise<{ id: number; username: string } | null> {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    try {
      const user = await prisma.user.findFirst({ where: { apiKey } });
      if (user) {
        return { id: user.id, username: user.username };
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
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    return decoded;
  } catch {
    return null;
  }
}

export function signToken(payload: { id: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

