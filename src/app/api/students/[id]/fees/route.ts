import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const studentId = parseInt(id, 10);
    const body = await req.json();
    const { amount, payment_mode, account_id, payment_date, notes } = body;

    const student = await prisma.person.findUnique({
      where: { id: studentId },
    });
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const feeCount = await prisma.studentFee.count();
    const receipt_number = `FEE-${2001 + feeCount}`;
    const payDate = payment_date || new Date().toISOString().split('T')[0];

    // 1. Create fee record
    const fee = await prisma.studentFee.create({
      data: {
        studentId,
        studentName: student.name,
        amount: Number(amount),
        paymentMode: payment_mode || 'cash',
        accountId: account_id ? Number(account_id) : null,
        receiptNumber: receipt_number,
        paymentDate: payDate,
        notes: notes || '',
      },
    });

    // 2. Credit financial account
    if (account_id) {
      await prisma.account.update({
        where: { id: Number(account_id) },
        data: { balance: { increment: Number(amount) } },
      });
    }

    // 3. Record transaction in universal ledger
    await prisma.transaction.create({
      data: {
        date: payDate,
        type: 'income',
        category: 'student_fee',
        amount: Number(amount),
        accountId: account_id ? Number(account_id) : null,
        paymentMode: payment_mode || 'cash',
        referenceType: 'fee_receipt',
        referenceId: receipt_number,
        partyName: student.name,
        description: `Student Fee Installment Receipt #${receipt_number} (${student.courseOrDetails || 'Course'})`,
      },
    });

    // 4. Update student invoices due amounts
    const studentInvoices = await prisma.invoice.findMany({
      where: { personId: studentId },
      orderBy: { id: 'asc' },
    });

    const totalFeesPaid = await prisma.studentFee.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });

    let remainingPaid = Number(totalFeesPaid._sum.amount || 0);
    for (const inv of studentInvoices) {
      const net = Number(inv.netAmount);
      const paidForThis = Math.min(net, remainingPaid);
      const dueForThis = Math.max(0, net - paidForThis);
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { amountPaid: paidForThis, dueAmount: dueForThis },
      });
      remainingPaid = Math.max(0, remainingPaid - paidForThis);
    }

    return NextResponse.json({
      receipt: {
        ...fee,
        receipt_number: fee.receiptNumber,
        payment_date: fee.paymentDate,
        payment_mode: fee.paymentMode,
        student_id: fee.studentId,
        student_name: fee.studentName,
        amount: Number(fee.amount),
      },
      student: {
        ...student,
        course_or_details: student.courseOrDetails,
        total_fee: Number(student.totalFee),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

