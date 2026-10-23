import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    const res = await seedDatabase();
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const res = await seedDatabase();
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

