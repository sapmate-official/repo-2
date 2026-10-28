import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

function getLocalIpAddress() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const ifaces = interfaces[name];
      if (!ifaces) continue;
      for (const iface of ifaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch {
    // fallback
  }
  return '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { targetRole, staffId, username } = body;

    let targetUser = null;
    if (staffId) {
      targetUser = await prisma.user.findFirst({
        where: { staffId: parseInt(staffId, 10) },
      });
    } else if (username) {
      targetUser = await prisma.user.findUnique({
        where: { username },
      });
    } else if (targetRole === 'admin') {
      targetUser = await prisma.user.findFirst({
        where: { OR: [{ role: 'admin' }, { id: 1 }] },
      });
    } else {
      targetUser = await prisma.user.findFirst({
        where: { role: 'employee' },
      }) || await prisma.user.findFirst({ where: { id: 1 } });
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');

    let mobileBaseUrl: string;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      const localIp = getLocalIpAddress();
      const parts = host.split(':');
      const port = parts[1] ? parseInt(parts[1], 10) : 3000;
      mobileBaseUrl = `http://${localIp}:${port}`;
    } else {
      mobileBaseUrl = `${proto}://${host}`;
    }

    const mobileToken = signToken({
      id: targetUser.id,
      username: targetUser.username,
      role: targetUser.role || 'employee',
      staffId: targetUser.staffId || undefined,
    });

    const quickLoginUrl = `${mobileBaseUrl}/?auth=${mobileToken}`;
    const qrCode = await QRCode.toDataURL(quickLoginUrl, { margin: 2, scale: 6 });

    return NextResponse.json({
      mobileToken,
      quickLoginUrl,
      qrCode,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        role: targetUser.role || 'employee',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

