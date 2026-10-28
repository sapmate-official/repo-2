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

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
