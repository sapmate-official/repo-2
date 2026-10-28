import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        username: true,
        role: true,
        staffId: true,
        avatar: true,
        businessName: true,
        tagline: true,
        phone: true,
        email: true,
        address: true,
        currency: true,
        gstin: true,
        invoicePrefix: true,
        apiKey: true,
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Auto-sync admin identity to Kabir Khan if currently using default placeholder
    if (user.username === 'admin' && (!user.email || user.email === 'contact@alkaabusiness.com')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: 'Kabir.khan@shapenxt.com' },
      });
      user.email = 'Kabir.khan@shapenxt.com';
    }

    let employeeData = null;
    if (user.staffId) {
      employeeData = await prisma.staff.findUnique({
        where: { id: user.staffId },
      });
    }

    return NextResponse.json({
      ...user,
      role: user.role || 'admin',
      staff_id: user.staffId,
      avatar: user.avatar || '',
      employee: employeeData,
      business_name: user.businessName,
      invoice_prefix: user.invoicePrefix,
      api_key: user.apiKey,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { business_name, tagline, phone, email, address, currency, gstin, invoice_prefix, avatar } = body;

    const user = await prisma.user.update({
      where: { id: auth.id },
      data: {
        businessName: business_name !== undefined ? business_name : undefined,
        tagline: tagline !== undefined ? tagline : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined,
        currency: currency !== undefined ? currency : undefined,
        gstin: gstin !== undefined ? gstin : undefined,
        invoicePrefix: invoice_prefix !== undefined ? invoice_prefix : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
      },
    });

    let employeeData = null;
    if (user.staffId) {
      employeeData = await prisma.staff.findUnique({
        where: { id: user.staffId },
      });
    }

    return NextResponse.json({
      ...user,
      role: user.role || 'admin',
      staff_id: user.staffId,
      avatar: user.avatar || '',
      employee: employeeData,
      business_name: user.businessName,
      invoice_prefix: user.invoicePrefix,
      api_key: user.apiKey,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
