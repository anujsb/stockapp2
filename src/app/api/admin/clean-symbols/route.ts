// src/app/api/admin/clean-symbols/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cleanStockSymbol } from '@/lib/alpha-vantage';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting symbol cleanup process...');
    
    // Get all stocks from database
    const allStocks = await db.select().from(stocks);
    
    console.log(`Found ${allStocks.length} stocks to process`);
    
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];
    
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
        const errorMsg = `Failed to update stock ${stock.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    console.log(`Symbol cleanup completed: ${updated} updated, ${skipped} skipped, ${errors.length} errors`);
    
    return NextResponse.json({
      success: true,
      message: 'Symbol cleanup completed',
      results: {
        total: allStocks.length,
        updated,
        skipped,
        errors: errors.length,
        errorDetails: errors
      }
    });
    
  } catch (error) {
    console.error('Symbol cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clean symbols',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
