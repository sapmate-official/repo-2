import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import { authenticateRequest, signToken } from '@/lib/auth';

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

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');

    let mobileBaseUrl: string;
    let localIp = '127.0.0.1';
    let port = 3000;

    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      localIp = getLocalIpAddress();
      const parts = host.split(':');
      port = parts[1] ? parseInt(parts[1], 10) : 3000;
      mobileBaseUrl = `http://${localIp}:${port}`;
    } else {
      mobileBaseUrl = `${proto}://${host}`;
    }

    let quickLoginUrl: string | null = null;
    let quickLoginQr: string | null = null;
    let role = 'admin';
    let targetUsername = 'admin';

    // 1. If user is currently authenticated, generate quick login token for them
    const auth = await authenticateRequest(req);
    if (auth) {
      role = auth.role || 'admin';
      targetUsername = auth.username || 'admin';
      const token = signToken({
        id: auth.id,
        username: auth.username,
        role: auth.role,
        staffId: auth.staffId,
      });
      quickLoginUrl = `${mobileBaseUrl}/?auth=${token}`;
      quickLoginQr = await QRCode.toDataURL(quickLoginUrl, { margin: 2, scale: 6 });
    } else {
      // 2. Default fallback: Admin user
      const adminUser = await prisma.user.findFirst({
        where: { OR: [{ role: 'admin' }, { id: 1 }] },
      });
      if (adminUser) {
        targetUsername = adminUser.username;
        const token = signToken({
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role || 'admin',
          staffId: adminUser.staffId || undefined,
        });
        quickLoginUrl = `${mobileBaseUrl}/?auth=${token}`;
        quickLoginQr = await QRCode.toDataURL(quickLoginUrl, { margin: 2, scale: 6 });
      }
    }

    // Direct web app QR code without query params
    const appQr = await QRCode.toDataURL(mobileBaseUrl, { margin: 2, scale: 6 });

    return NextResponse.json({
      localIp,
      port,
      mobileBaseUrl,
      appQr,
      quickLoginUrl,
      quickLoginQr,
      role,
      username: targetUsername,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

