import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const staffList = await prisma.staff.findMany({
      orderBy: { id: 'asc' },
      include: {
        incentives: { where: { status: 'due' } },
      },
    });

    return NextResponse.json(
      staffList.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        phone: s.phone,
        monthly_salary: Number(s.monthlySalary),
        status: s.status,
        due_incentives: s.incentives.reduce((acc, curr) => acc + Number(curr.amount), 0),
        created_at: s.createdAt.toISOString(),
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, role, phone, monthly_salary } = body;

    const staff = await prisma.staff.create({
      data: {
        name,
        role: role || 'Course Counselor',
        phone: phone || '',
        monthlySalary: Number(monthly_salary || 0),
      },
    });

    return NextResponse.json({
      ...staff,
      monthly_salary: Number(staff.monthlySalary),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

