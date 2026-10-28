import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const whereClause: any = { type: 'student' };
    if (auth.role === 'employee' && auth.staffId) {
      const staffMember = await prisma.staff.findUnique({ where: { id: auth.staffId } });
      const staffName = staffMember?.name || '';
      whereClause.OR = [
        { counselorStaffId: auth.staffId },
        { counselorName: staffName },
      ];
    }

    const students = await prisma.person.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
      include: {
        invoices: true,
        studentFees: true,
      },
    });

    return NextResponse.json(
      students.map((st) => {
        const totalFee = Number(st.totalFee);
        const feePayments = st.studentFees.reduce((acc, curr) => acc + Number(curr.amount), 0);
        // Also check if invoices had direct amount_paid
        const invoicePaid = st.invoices.reduce((acc, curr) => acc + Number(curr.amountPaid), 0);
        const totalPaid = Math.max(feePayments, invoicePaid);
        const dueAmount = Math.max(0, totalFee - totalPaid);

        return {
          id: st.id,
          name: st.name,
          phone: st.phone,
          email: st.email,
          course_or_details: st.courseOrDetails,
          total_fee: totalFee,
          total_paid: totalPaid,
          due_amount: dueAmount,
          counselor_name: st.counselorName,
          created_at: st.createdAt.toISOString(),
        };
      })
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
    const { name, phone, email, course_or_details, total_fee, counselor_staff_id, counselor_name, notes } = body;

    const student = await prisma.person.create({
      data: {
        type: 'student',
        name,
        phone: phone || '',
        email: email || '',
        courseOrDetails: course_or_details || '',
        totalFee: Number(total_fee || 0),
        counselorStaffId: counselor_staff_id ? Number(counselor_staff_id) : null,
        counselorName: counselor_name || '',
        notes: notes || '',
      },
    });

    return NextResponse.json({
      ...student,
      course_or_details: student.courseOrDetails,
      total_fee: Number(student.totalFee),
      counselor_name: student.counselorName,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

