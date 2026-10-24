import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const authUser = await authenticateRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
