import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayStr = `${currentMonthPrefix}-${String(now.getDate()).padStart(2, '0')}`;

    // 0. Dedicated Employee Sales & Incentives Dashboard
    if (auth.role === 'employee' && auth.staffId) {
      const staffId = auth.staffId;
      const staffMember = await prisma.staff.findUnique({
        where: { id: staffId },
      });
      const staffName = staffMember?.name || '';

      const [
        allSalesAgg,
        thisMonthSalesAgg,
        todaySalesAgg,
        studentsCount,
        incentives,
        recentInvoices,
        recentIncentives,
        studentPeople,
      ] = await Promise.all([
        prisma.invoice.aggregate({
          where: {
            OR: [
              { counselorStaffId: staffId },
              { counselorName: staffName },
            ],
          },
          _count: { id: true },
          _sum: { netAmount: true },
        }),
        prisma.invoice.aggregate({
          where: {
            OR: [
              { counselorStaffId: staffId },
              { counselorName: staffName },
            ],
            createdAt: { gte: new Date(`${currentMonthPrefix}-01T00:00:00Z`) },
          },
          _count: { id: true },
          _sum: { netAmount: true },
        }),
        prisma.invoice.aggregate({
          where: {
            OR: [
              { counselorStaffId: staffId },
              { counselorName: staffName },
            ],
            createdAt: { gte: new Date(`${todayStr}T00:00:00Z`) },
          },
          _count: { id: true },
          _sum: { netAmount: true },
        }),
        prisma.person.count({
          where: {
            type: 'student',
            OR: [
              { counselorStaffId: staffId },
              { counselorName: staffName },
            ],
          },
        }),
        prisma.staffIncentive.findMany({
          where: { staffId },
        }),
        prisma.invoice.findMany({
          where: {
            OR: [
              { counselorStaffId: staffId },
              { counselorName: staffName },
            ],
          },
          orderBy: { id: 'desc' },
          take: 10,
          include: {
            items: { take: 1 },
          },
        }),
        prisma.staffIncentive.findMany({
          where: { staffId },
          orderBy: { id: 'desc' },
          take: 10,
        }),
        prisma.person.findMany({
          where: {
            type: 'student',
            OR: [
              { counselorStaffId: staffId },
              { counselorName: staffName },
            ],
          },
          include: {
            studentFees: true,
          },
        }),
      ]);

      const dueIncentives = incentives
        .filter((i) => i.status === 'due')
        .reduce((sum, i) => sum + Number(i.amount), 0);
      const paidIncentives = incentives
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + Number(i.amount), 0);

      let studentFeeDueCount = 0;
      let studentFeeDueTotal = 0;
      studentPeople.forEach((p) => {
        const totalFee = Number(p.totalFee || 0);
        const paid = p.studentFees.reduce((s, f) => s + Number(f.amount || 0), 0);
        const due = totalFee - paid;
        if (due > 0) {
          studentFeeDueCount++;
          studentFeeDueTotal += due;
        }
      });

      const staffObj = {
        id: staffMember?.id,
        employee_id: staffMember?.employeeId || `EMP-${staffId}`,
        name: staffMember?.name || '',
        email: staffMember?.email || '',
        job_title: staffMember?.jobTitle || staffMember?.role || 'Course Counselor',
        department: staffMember?.department || 'Admissions',
        presence: staffMember?.presence || 'Present',
        avatar: staffMember?.avatar || '',
      };

      return NextResponse.json({
        isEmployee: true,
        staff: staffObj,
        metrics: {
          mySalesCount: allSalesAgg._count.id,
          mySalesTotal: Number(allSalesAgg._sum.netAmount || 0),
          myMonthlySales: Number(thisMonthSalesAgg._sum.netAmount || 0),
          myMonthlyCount: thisMonthSalesAgg._count.id,
          myTodaySales: Number(todaySalesAgg._sum.netAmount || 0),
          myTodayCount: todaySalesAgg._count.id,
          myStudentsCount: studentsCount,
          myIncentivesDue: dueIncentives,
          myIncentivesPaid: paidIncentives,
          myIncentivesTotal: dueIncentives + paidIncentives,
          myStudentsFeeDueCount: studentFeeDueCount,
          myStudentsFeeDueTotal: studentFeeDueTotal,
        },
        recentInvoices: recentInvoices.map((inv) => ({
          ...inv,
          invoice_number: inv.invoiceNumber,
          customer_name: inv.customerName,
          customer_phone: inv.customerPhone,
          net_amount: Number(inv.netAmount),
          amount_paid: Number(inv.amountPaid),
          due_amount: Number(inv.dueAmount),
          payment_mode: inv.paymentMode,
          counselor_name: inv.counselorName,
          course_name: inv.items[0]?.itemName || 'Course Admission',
          created_at: inv.createdAt.toISOString(),
        })),
        recentIncentives: recentIncentives.map((inc) => ({
          id: inc.id,
          student_name: inc.studentName,
          course_name: inc.courseName,
          admission_amount: Number(inc.admissionAmount),
          incentive_rule: inc.incentiveRule,
          amount: Number(inc.amount),
          status: inc.status,
          paid_date: inc.paidDate,
          created_at: inc.createdAt.toISOString(),
        })),
        recentTransactions: [],
        accounts: [],
        totalBalance: 0,
        monthlyIncome: Number(thisMonthSalesAgg._sum.netAmount || 0),
        monthlyExpense: 0,
        totalDue: studentFeeDueTotal,
        totalAdmissions: allSalesAgg._count.id,
      });
    }

    // Default: Admin Dashboard
    const accounts = await prisma.account.findMany({ orderBy: { id: 'asc' } });
    const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);

    const transactions = await prisma.transaction.findMany({
      where: { date: { startsWith: currentMonthPrefix } },
    });

    const monthlyIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const monthlyExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const invoices = await prisma.invoice.findMany({
      orderBy: { id: 'desc' },
      take: 10,
    });

    const allInvoices = await prisma.invoice.findMany();
    const totalDue = allInvoices.reduce((acc, curr) => acc + Number(curr.dueAmount), 0);
    const totalAdmissions = allInvoices.length;

    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { id: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      isEmployee: false,
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      totalDue,
      totalAdmissions,
      accounts: accounts.map((a) => ({
        ...a,
        balance: Number(a.balance),
        account_number: a.accountNumber,
        bank_name: a.bankName,
      })),
      recentTransactions: recentTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        account_id: t.accountId,
        payment_mode: t.paymentMode,
        party_name: t.partyName,
      })),
      recentInvoices: invoices.map((inv) => ({
        ...inv,
        invoice_number: inv.invoiceNumber,
        person_id: inv.personId,
        customer_name: inv.customerName,
        customer_phone: inv.customerPhone,
        subtotal: Number(inv.subtotal),
        discount: Number(inv.discount),
        tax: Number(inv.tax),
        net_amount: Number(inv.netAmount),
        payment_mode: inv.paymentMode,
        amount_paid: Number(inv.amountPaid),
        due_amount: Number(inv.dueAmount),
        counselor_name: inv.counselorName,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
