import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const invId = parseInt(id, 10);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invId },
      include: { items: true },
    });

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

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

