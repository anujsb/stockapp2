
// src/app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userPortfolio, stocks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'default-user'; // For demo purposes

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
          industry: stocks.industry
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
  try {
    const body = await request.json();
    const { userId = 'default-user', stockId, quantity, avgPurchasePrice, notes } = body;

    // Check if stock already exists in portfolio
    const existingEntry = await db
      .select()
      .from(userPortfolio)
      .where(and(eq(userPortfolio.userId, userId), eq(userPortfolio.stockId, stockId)))
      .limit(1);

    if (existingEntry.length > 0) {
      // Update existing entry
      const current = existingEntry[0];
      const currentQuantity = parseFloat(current.quantity);
      const currentAvgPrice = parseFloat(current.avgPurchasePrice || '0');
      const newQuantity = parseFloat(quantity);
      const newAvgPrice = parseFloat(avgPurchasePrice);

      const totalQuantity = currentQuantity + newQuantity;
      const totalValue = (currentQuantity * currentAvgPrice) + (newQuantity * newAvgPrice);
      const newAvgPurchasePrice = totalValue / totalQuantity;

      const [updatedEntry] = await db
        .update(userPortfolio)
        .set({
          quantity: totalQuantity.toString(),
          avgPurchasePrice: newAvgPurchasePrice.toString(),
          notes: notes || current.notes,
          updatedAt: new Date()
        })
        .where(eq(userPortfolio.id, current.id))
        .returning();

      return NextResponse.json(updatedEntry);
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