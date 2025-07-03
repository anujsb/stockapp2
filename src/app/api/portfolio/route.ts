// src/app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userPortfolio, stocks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const portfolio = await db
      .select({
        id: userPortfolio.id,
        quantity: userPortfolio.quantity,
        avgPurchasePrice: userPortfolio.avgPurchasePrice,
        purchaseDate: userPortfolio.purchaseDate,
        notes: userPortfolio.notes,
        stock: {
          id: stocks.id,
          symbol: stocks.symbol,
          name: stocks.name,
          currentPrice: stocks.currentPrice,
          dayChange: stocks.dayChange,
          dayChangePercent: stocks.dayChangePercent,
          sector: stocks.sector,
          industry: stocks.industry,
          exchange: stocks.exchange,
          lastUpdated: stocks.lastUpdated
        }
      })
      .from(userPortfolio)
      .innerJoin(stocks, eq(userPortfolio.stockId, stocks.id))
      .where(eq(userPortfolio.userId, userId));

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    let { stockId, symbol, quantity, avgPurchasePrice, notes } = body;
    // If stockId is not a valid integer, try to look up by symbol
    if (!stockId || isNaN(Number(stockId)) || Number(stockId) > 2147483647) {
      if (!symbol) {
        return NextResponse.json({ error: 'Stock symbol required if stockId is not valid' }, { status: 400 });
      }
      // Look up stock by symbol
      const stockRecord = await db.select().from(stocks).where(eq(stocks.symbol, symbol)).limit(1);
      if (stockRecord.length === 0) {
        return NextResponse.json({ error: 'Stock not found in database' }, { status: 404 });
      }
      stockId = stockRecord[0].id;
    }
    // Check if stock already exists in portfolio
    const existingEntry = await db
      .select()
      .from(userPortfolio)
      .where(and(eq(userPortfolio.userId, userId), eq(userPortfolio.stockId, stockId)))
      .limit(1);
    if (existingEntry.length > 0) {
      // Instead of updating, notify user
      return NextResponse.json({
        message: 'Stock already exists in your portfolio.',
        alreadyExists: true,
        entry: existingEntry[0]
      }, { status: 200 });
    } else {
      // Create new entry
      const [newEntry] = await db
        .insert(userPortfolio)
        .values({
          userId,
          stockId,
          quantity,
          avgPurchasePrice,
          notes,
          purchaseDate: new Date()
        })
        .returning();
      return NextResponse.json(newEntry);
    }
  } catch (error) {
    console.error('Error adding to portfolio:', error);
    return NextResponse.json({ error: 'Failed to add to portfolio' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const portfolioId = searchParams.get('id');

  if (!portfolioId) {
    return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
  }

  try {
    await db.delete(userPortfolio).where(eq(userPortfolio.id, parseInt(portfolioId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting portfolio entry:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio entry' }, { status: 500 });
  }
}