import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
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
        { error: 'Permission denied: You can only view your own employee profile' },
        { status: 403 }
      );
    }

    const s = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        incentives: true,
      },
    });

    if (!s) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const [salesAgg, studentsCount, user] = await Promise.all([
      prisma.invoice.aggregate({
        where: { counselorStaffId: s.id },
        _count: { id: true },
        _sum: { netAmount: true },
      }),
      prisma.person.count({
        where: { counselorStaffId: s.id, type: 'student' },
      }),
      s.userId
        ? prisma.user.findUnique({
            where: { id: s.userId },
            select: { username: true, role: true },
          })
        : null,
    ]);

    const incentivesDue = s.incentives
      .filter((i) => i.status === 'due')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const incentivesPaid = s.incentives
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const employee = {
      id: s.id,
      employee_id: s.employeeId || `EMP-${s.id}`,
      name: s.name,
      email: s.email || '',
      phone: s.phone || '',
      job_title: s.jobTitle || s.role || 'Staff',
      role: s.role || 'Course Counselor',
      department: s.department || 'General',
      location: s.location || 'Headquarters (HQ)',
      employment_type: s.employmentType || 'Full-Time',
      presence: s.presence || 'Present',
      cohorts: s.cohorts || 'None',
      courses: s.courses || '0 enrolled',
      dob: s.dob || '',
      joining_date: s.joiningDate || '',
      address: s.address || '',
      emergency_contact: s.emergencyContact || '',
      avatar: s.avatar || '',
      monthly_salary: Number(s.monthlySalary),
      incentive_rule: s.incentiveRule || '',
      status: s.status || 'active',
      system_access: s.systemAccess || 'none',
      user_id: s.userId,
      last_modified: (s.lastModified || s.createdAt).toISOString(),
      created_at: s.createdAt.toISOString(),
      username: user?.username || null,
      user_role: user?.role || null,
      sales_count: salesAgg._count.id,
      sales_amount: Number(salesAgg._sum.netAmount || 0),
      students_count: studentsCount,
      incentives_due: incentivesDue,
      incentives_paid: incentivesPaid,
    };

    return NextResponse.json(employee);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required to delete employees' },
        { status: 403 }
      );
    }

    const params = await props.params;
    const staffId = parseInt(params.id, 10);
    if (isNaN(staffId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const staffMember = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staffMember) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Delete linked user if any
    if (staffMember.userId) {
      await prisma.user.deleteMany({ where: { id: staffMember.userId } });
    }
    await prisma.user.deleteMany({ where: { staffId: staffId } });
    await prisma.staff.delete({ where: { id: staffId } });

    return NextResponse.json({ success: true, message: 'Employee deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
