import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const staffId = parseInt(id, 10);
    const amount = Number(req.nextUrl.searchParams.get('amount') || 0);

    const pastSalesCount = await prisma.invoice.count({
      where: { counselorStaffId: staffId },
    });

    const currentSaleNumber = pastSalesCount + 1;
    let ruleName = `Sale #${currentSaleNumber}`;
    let bonusAmount = 500;

    if (currentSaleNumber === 1) {
      ruleName = '1st Sale Bonus (₹600)';
      bonusAmount = 600;
    } else if (currentSaleNumber === 3) {
      ruleName = '3rd Sale Special (₹800)';
      bonusAmount = 800;
    } else if (amount >= 50000) {
      ruleName = 'High Value Course Bonus (₹1,500)';
      bonusAmount = 1500;
    } else if (amount >= 25000) {
      ruleName = 'Standard Course Incentive (₹800)';
      bonusAmount = 800;
    }

    return NextResponse.json({
      staff_id: staffId,
      sale_number: currentSaleNumber,
      rule_name: ruleName,
      bonus_amount: bonusAmount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

