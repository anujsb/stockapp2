// src/app/api/stocks/[symbol]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getStockQuote, getStockOverview, cleanStockSymbol } from '@/lib/alpha-vantage';

// Function to clean existing symbols in database
async function cleanExistingSymbols() {
  try {
    console.log('Starting symbol cleanup process...');
    
    // Get all stocks from database
    const allStocks = await db.select().from(stocks);
    
    console.log(`Found ${allStocks.length} stocks to process`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const stock of allStocks) {
      try {
        const cleanedSymbol = cleanStockSymbol(stock.symbol);
        
        // Only update if the symbol has changed
        if (cleanedSymbol !== stock.symbol) {
          console.log(`Updating ${stock.symbol} to ${cleanedSymbol}`);
          
          await db
            .update(stocks)
            .set({ symbol: cleanedSymbol })
            .where(eq(stocks.id, stock.id));
          
          updated++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Failed to update stock ${stock.symbol}:`, error);
      }
    }
    
    console.log(`Symbol cleanup completed: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped, total: allStocks.length };
    
  } catch (error) {
    console.error('Symbol cleanup error:', error);
    throw error;
  }
}

// Fixed interface - should match Next.js 15 expectations
interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  // Await the params in Next.js 15
  const { symbol } = await context.params;
  
  // Special cleanup trigger
  if (symbol === 'CLEANUP_SYMBOLS_NOW') {
    try {
      const result = await cleanExistingSymbols();
      return NextResponse.json({
        success: true,
        message: 'Symbol cleanup completed',
        results: result
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to clean symbols',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }
  
  // Clean the symbol to remove exchange suffixes
  const cleanedSymbol = cleanStockSymbol(symbol);

  try {
    console.log(`Fetching stock data for symbol: ${symbol} (cleaned: ${cleanedSymbol})`);
    
    // First check if stock exists in database using cleaned symbol
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
        
        // If we have overview data but no quote, create stock with overview data only
        if (overview) {
          console.log(`Creating stock with overview data only for ${symbol}`);
          
          const stockData = {
            symbol: cleanedSymbol,
            name: overview.name || cleanedSymbol,
            currentPrice: '0', // Default price
            previousClose: '0',
            dayChange: '0',
            dayChangePercent: '0',
            volume: null,
            high52Week: overview.high52Week || '0',
            low52Week: overview.low52Week || '0',
            peRatio: overview.peRatio,
            dividendYield: overview.dividendYield,
            sector: overview.sector,
            industry: overview.industry,
            exchange: overview.exchange,
            marketCap: overview.marketCap ? parseInt(overview.marketCap) : null,
            currency: 'USD'
          };
          
          try {
            const [insertedStock] = await db.insert(stocks).values(stockData).returning();
            console.log(`Successfully stored ${symbol} with overview data only`);
            return NextResponse.json(insertedStock);
          } catch (dbError) {
            console.error(`Database insert error for ${symbol}:`, dbError);
            return NextResponse.json({
              ...stockData,
              id: Date.now(),
              createdAt: new Date(),
              lastUpdated: new Date()
            });
          }
        }
        
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
        exchange: overview?.exchange,
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