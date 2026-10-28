import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let whereClause: any = undefined;
    if (auth.role === 'employee' && auth.staffId) {
      const staffMember = await prisma.staff.findUnique({ where: { id: auth.staffId } });
      const staffName = staffMember?.name || '';
      whereClause = {
        OR: [
          { counselorStaffId: auth.staffId },
          { counselorName: staffName },
        ],
      };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
      include: { items: true },
    });

    return NextResponse.json(
      invoices.map((inv) => ({
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
        account_id: inv.accountId,
        amount_paid: Number(inv.amountPaid),
        due_amount: Number(inv.dueAmount),
        counselor_name: inv.counselorName,
        incentive_amount: Number(inv.incentiveAmount),
        created_at: inv.createdAt.toISOString(),
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
    const {
      customer_name,
      customer_phone,
      items,
      discount = 0,
      tax = 0,
      payment_mode = 'cash',
      account_id,
      amount_paid = 0,
      counselor_staff_id,
      counselor_name = '',
      incentive_amount = 0,
      incentive_rule = '',
      notes = '',
    } = body;

    const subtotal = items && items.length > 0
      ? items.reduce((acc: number, item: any) => acc + (Number(item.total_price) || (Number(item.quantity || 1) * Number(item.unit_price || 0))), 0)
      : Number(body.subtotal || 0);

    const net_amount = subtotal - Number(discount) + Number(tax);
    const paid = payment_mode === 'unpaid' ? 0 : (amount_paid > 0 ? Number(amount_paid) : net_amount);
    const due = Math.max(0, net_amount - paid);

    // Get prefix
    const user = await prisma.user.findUnique({ where: { id: auth.id } });
    const prefix = user?.invoicePrefix || 'ADM';
    const count = await prisma.invoice.count();
    const invoice_number = `${prefix}-${1001 + count}`;

    // 1. Create or link student person
    const courseName = items && items[0] ? items[0].item_name : 'Course Admission';
    const person = await prisma.person.create({
      data: {
        type: 'student',
        name: customer_name,
        phone: customer_phone || '',
        courseOrDetails: courseName,
        totalFee: net_amount,
        counselorStaffId: counselor_staff_id ? Number(counselor_staff_id) : null,
        counselorName: counselor_name || '',
        notes: notes || '',
      },
    });

    // 2. Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoice_number,
        personId: person.id,
        customerName: customer_name,
        customerPhone: customer_phone || '',
        subtotal,
        discount: Number(discount),
        tax: Number(tax),
        netAmount: net_amount,
        paymentMode: payment_mode,
        accountId: account_id ? Number(account_id) : null,
        amountPaid: paid,
        dueAmount: due,
        counselorStaffId: counselor_staff_id ? Number(counselor_staff_id) : null,
        counselorName: counselor_name || '',
        incentiveAmount: Number(incentive_amount),
        incentiveRule: incentive_rule || '',
        incentiveStatus: Number(incentive_amount) > 0 ? 'due' : 'none',
        notes: notes || '',
        items: {
          create: (items || [{ item_name: courseName, quantity: 1, unit_price: subtotal, total_price: subtotal }]).map((it: any) => ({
            itemName: it.item_name || 'Course Package',
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unit_price || 0),
            totalPrice: Number(it.total_price || (Number(it.quantity || 1) * Number(it.unit_price || 0))),
          })),
        },
      },
      include: { items: true },
    });

    // 3. Update account balance and record transaction if payment received
    if (paid > 0 && account_id) {
      await prisma.account.update({
        where: { id: Number(account_id) },
        data: { balance: { increment: paid } },
      });

      const today = new Date().toISOString().split('T')[0];
      await prisma.transaction.create({
        data: {
          date: today,
          type: 'income',
          category: 'course_sale',
          amount: paid,
          accountId: Number(account_id),
          paymentMode: payment_mode,
          referenceType: 'admission_bill',
          referenceId: invoice_number,
          partyName: customer_name,
          description: `Course Admission Bill #${invoice_number} (${courseName})`,
        },
      });
    }

    // 4. Create counselor incentive if applicable
    if (counselor_staff_id && Number(incentive_amount) > 0) {
      await prisma.staffIncentive.create({
        data: {
          staffId: Number(counselor_staff_id),
          staffName: counselor_name || 'Counselor',
          studentName: customer_name,
          courseName,
          admissionAmount: net_amount,
          incentiveRule: incentive_rule || 'Sales Incentive',
          amount: Number(incentive_amount),
          status: 'due',
        },
      });
    }

    return NextResponse.json({
      ...invoice,
      invoice_number: invoice.invoiceNumber,
      person_id: invoice.personId,
      customer_name: invoice.customerName,
      customer_phone: invoice.customerPhone,
      subtotal: Number(invoice.subtotal),
      discount: Number(invoice.discount),
      tax: Number(invoice.tax),
      net_amount: Number(invoice.netAmount),
      amount_paid: Number(invoice.amountPaid),
      due_amount: Number(invoice.dueAmount),
      created_at: invoice.createdAt.toISOString(),
      items: invoice.items.map((it) => ({
        ...it,
        item_name: it.itemName,
        quantity: Number(it.quantity),
        unit_price: Number(it.unitPrice),
        total_price: Number(it.totalPrice),
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

