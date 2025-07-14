import { NextRequest, NextResponse } from 'next/server';
import { refreshMultipleStocks, isIndianMarketOpen } from '@/lib/stock-refresh-system';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    // Check if market is open for real-time updates
    const marketOpen = isIndianMarketOpen();
    
    if (!marketOpen) {
      return NextResponse.json({ 
        message: 'Indian stock market is closed. No real-time updates performed.',
        marketStatus: 'closed',
        timestamp: new Date().toISOString()
      }, { status: 200 });
  }

  // Get all stocks from DB
    const allStocks = await db.select({ symbol: stocks.symbol }).from(stocks);
    const symbols = allStocks.map(stock => stock.symbol);

    if (symbols.length === 0) {
      return NextResponse.json({ 
        message: 'No stocks found in database',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔄 Starting comprehensive refresh for ${symbols.length} stocks...`);

    // Use the new refresh system for real-time data
    const results = await refreshMultipleStocks(symbols, 'realtime');

    console.log(`✅ Refresh complete: ${results.successful.length} successful, ${results.failed.length} failed`);

  return NextResponse.json({
      message: 'Comprehensive stock refresh complete',
      results,
      marketStatus: 'open',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in comprehensive stock refresh:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh stocks',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 