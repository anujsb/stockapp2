// src/app/api/stocks/[symbol]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getStockQuote, getStockOverview } from '@/lib/alpha-vantage';
import { cleanSymbol, extractExchangeFromSymbol } from '@/lib/trading-view-utils';

// Fixed interface - should match Next.js 15 expectations
interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  // Await the params in Next.js 15
  const { symbol } = await context.params;

  try {
    console.log(`Fetching stock data for symbol: ${symbol}`);
    
    // Clean the symbol and extract exchange info
    const cleanedSymbol = cleanSymbol(symbol.toUpperCase());
    const extractedExchange = extractExchangeFromSymbol(symbol.toUpperCase());
    
    // First check if stock exists in database
    let stock = await db.select().from(stocks).where(eq(stocks.symbol, cleanedSymbol)).limit(1);

    if (stock.length === 0) {
      console.log(`Stock ${symbol} not found in database, fetching from APIs...`);
      
      // Fetch from APIs with fallback and store in database
      const [quote, overview] = await Promise.all([
        getStockQuote(symbol),
        getStockOverview(symbol)
      ]);

      if (!quote) {
        console.log(`No quote data available for ${symbol}`);
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
      }

      console.log(`Successfully fetched data for ${symbol}, storing in database...`);

      const stockData = {
        symbol: cleanedSymbol,
        name: overview?.name || quote.name || cleanedSymbol,
        currentPrice: quote.price,
        previousClose: quote.previousClose,
        dayChange: quote.change,
        dayChangePercent: quote.changePercent,
        volume: quote.volume ? parseInt(quote.volume) : null,
        high52Week: overview?.high52Week || quote.high52Week,
        low52Week: overview?.low52Week || quote.low52Week,
        peRatio: overview?.peRatio || quote.peRatio,
        dividendYield: overview?.dividendYield,
        sector: overview?.sector,
        industry: overview?.industry,
        exchange: extractedExchange || overview?.exchange,
        marketCap: overview?.marketCap ? parseInt(overview.marketCap) : (quote.marketCap ? parseInt(quote.marketCap) : null),
        currency: 'USD'
      };

      try {
        const [insertedStock] = await db.insert(stocks).values(stockData).returning();
        console.log(`Successfully stored ${symbol} in database`);
        return NextResponse.json(insertedStock);
      } catch (dbError) {
        console.error(`Database insert error for ${symbol}:`, dbError);
        // Return the stock data even if database insert fails
        return NextResponse.json({
          ...stockData,
          id: Date.now(), // Temporary ID
          createdAt: new Date(),
          lastUpdated: new Date()
        });
      }
    } else {
      console.log(`Stock ${symbol} found in database, updating with fresh data...`);
      
      // Update existing stock with fresh data
      const [quote, overview] = await Promise.all([
        getStockQuote(symbol),
        getStockOverview(symbol)
      ]);

      if (quote) {
        console.log(`Got fresh data for ${symbol}, updating database...`);
        
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

        try {
          const [updatedStock] = await db
            .update(stocks)
            .set(updateData)
            .where(eq(stocks.id, stock[0].id))
            .returning();

          console.log(`Successfully updated ${symbol} in database`);
          return NextResponse.json(updatedStock);
        } catch (dbError) {
          console.error(`Database update error for ${symbol}:`, dbError);
          // Return the existing stock data if update fails
          return NextResponse.json(stock[0]);
        }
      } else {
        console.log(`No fresh data available for ${symbol}, returning cached data`);
        return NextResponse.json(stock[0]);
      }
    }
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}