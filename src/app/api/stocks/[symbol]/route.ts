
// src/app/api/stocks/[symbol]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getStockQuote, getStockOverview } from '@/lib/alpha-vantage';

interface RouteParams {
  params: {
    symbol: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { symbol } = params;

  try {
    // First check if stock exists in database
    let stock = await db.select().from(stocks).where(eq(stocks.symbol, symbol.toUpperCase())).limit(1);

    if (stock.length === 0) {
      // Fetch from Alpha Vantage and store in database
      const [quote, overview] = await Promise.all([
        getStockQuote(symbol),
        getStockOverview(symbol)
      ]);

      if (!quote) {
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
      }

      const stockData = {
        symbol: symbol.toUpperCase(),
        name: overview?.name || quote.symbol,
        currentPrice: quote.price,
        previousClose: quote.previousClose,
        dayChange: quote.change,
        dayChangePercent: quote.changePercent,
        volume: quote.volume ? parseInt(quote.volume) : null,
        high52Week: overview?.high52Week || quote.high52Week,
        low52Week: overview?.low52Week || quote.low52Week,
        peRatio: overview?.peRatio,
        dividendYield: overview?.dividendYield,
        sector: overview?.sector,
        industry: overview?.industry,
        exchange: overview?.exchange,
        marketCap: overview?.marketCap ? parseInt(overview.marketCap) : null,
        currency: 'USD'
      };

      const [insertedStock] = await db.insert(stocks).values(stockData).returning();
      return NextResponse.json(insertedStock);
    } else {
      // Update existing stock with fresh data
      const [quote, overview] = await Promise.all([
        getStockQuote(symbol),
        getStockOverview(symbol)
      ]);

      if (quote) {
        const updateData = {
          currentPrice: quote.price,
          previousClose: quote.previousClose,
          dayChange: quote.change,
          dayChangePercent: quote.changePercent,
          volume: quote.volume ? parseInt(quote.volume) : null,
          lastUpdated: new Date()
        };

        if (overview) {
          Object.assign(updateData, {
            name: overview.name,
            sector: overview.sector,
            industry: overview.industry,
            peRatio: overview.peRatio,
            dividendYield: overview.dividendYield,
            high52Week: overview.high52Week,
            low52Week: overview.low52Week,
            marketCap: overview.marketCap ? parseInt(overview.marketCap) : null
          });
        }

        const [updatedStock] = await db
          .update(stocks)
          .set(updateData)
          .where(eq(stocks.id, stock[0].id))
          .returning();

        return NextResponse.json(updatedStock);
      }

      return NextResponse.json(stock[0]);
    }
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}
