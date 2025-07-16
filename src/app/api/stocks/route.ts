import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    const allStocks = await db.select().from(stocks);
    return NextResponse.json(allStocks);
  } catch (error) {
    console.error('Error fetching all stocks:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
} 