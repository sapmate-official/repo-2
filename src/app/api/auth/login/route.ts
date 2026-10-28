import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const identifier = String(username).trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: { equals: identifier, mode: 'insensitive' } },
          ...(identifier.toLowerCase() === 'kabir' ? [{ username: 'admin' }] : []),
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Auto-sync admin identity to Kabir Khan if currently using default placeholder
    if (user.username === 'admin' && (!user.email || user.email === 'contact@alkaabusiness.com' || identifier.toLowerCase().includes('kabir'))) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: 'Kabir.khan@shapenxt.com' },
      });
      user.email = 'Kabir.khan@shapenxt.com';
    }

    const role = user.role || 'admin';
    const token = signToken({
      id: user.id,
      username: user.username,
      role,
      staffId: user.staffId,
    });

    let employeeData = null;
    if (user.staffId) {
      employeeData = await prisma.staff.findUnique({
        where: { id: user.staffId },
      });
    }

    const { passwordHash: _passwordHash, ...profile } = user;

    return NextResponse.json({
      token,
      profile: {
        ...profile,
        role,
        staff_id: user.staffId,
        avatar: user.avatar || '',
        employee: employeeData,
        business_name: profile.businessName,
        invoice_prefix: profile.invoicePrefix,
        api_key: profile.apiKey,
        created_at: profile.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
