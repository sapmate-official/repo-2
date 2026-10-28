import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await props.params;
    const staffId = parseInt(params.id, 10);
    if (isNaN(staffId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    if (auth.role !== 'admin' && auth.staffId !== staffId) {
      return NextResponse.json(
        { error: 'Permission denied: You can only reset your own password' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const newPassword = body.new_password || body.newPassword || body.password;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
      return NextResponse.json(
        { error: 'New password must be at least 4 characters long' },
        { status: 400 }
      );
    }

    const staffMember = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staffMember) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const hash = await bcrypt.hash(newPassword.trim(), 10);

    if (staffMember.userId) {
      await prisma.user.update({
        where: { id: staffMember.userId },
        data: { passwordHash: hash },
      });
    } else {
      const candidateUsername = (staffMember.email || staffMember.employeeId || `staff_${staffId}`).toLowerCase();
      // Ensure unique username
      let finalUsername = candidateUsername;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
        finalUsername = `${candidateUsername}_${counter++}`;
      }

      const role = staffMember.systemAccess === 'admin' ? 'admin' : 'employee';
      const newUser = await prisma.user.create({
        data: {
          username: finalUsername,
          passwordHash: hash,
          email: staffMember.email || undefined,
          role,
          staffId: staffMember.id,
          avatar: staffMember.avatar || undefined,
        },
      });

      await prisma.staff.update({
        where: { id: staffMember.id },
        data: {
          userId: newUser.id,
          systemAccess: role,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Password updated successfully for ${staffMember.name}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

