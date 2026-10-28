import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const whereClause: any = {};
    if (auth.role === 'employee' && auth.staffId) {
      whereClause.staffId = auth.staffId;
    }

    const incentives = await prisma.staffIncentive.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(
      incentives.map((inc) => ({
        ...inc,
        amount: Number(inc.amount),
        admission_amount: Number(inc.admissionAmount),
        staff_name: inc.staffName,
        student_name: inc.studentName,
        course_name: inc.courseName,
        incentive_rule: inc.incentiveRule,
        payment_mode: inc.paymentMode,
        paid_date: inc.paidDate,
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

