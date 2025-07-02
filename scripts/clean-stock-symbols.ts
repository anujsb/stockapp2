// scripts/clean-stock-symbols.ts
import { db } from '../src/lib/db';
import { stocks } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cleanSymbol, extractExchangeFromSymbol } from '../src/lib/trading-view-utils';

async function cleanStockSymbols() {
  try {
    console.log('Starting stock symbol cleanup...');
    
    // Get all stocks from database
    const allStocks = await db.select().from(stocks);
    console.log(`Found ${allStocks.length} stocks to process`);
    
    let updatedCount = 0;
    
    for (const stock of allStocks) {
      const originalSymbol = stock.symbol;
      const cleanedSymbol = cleanSymbol(originalSymbol);
      const extractedExchange = extractExchangeFromSymbol(originalSymbol);
      
      // Check if symbol needs cleaning or exchange needs updating
      const needsSymbolUpdate = originalSymbol !== cleanedSymbol;
      const needsExchangeUpdate = extractedExchange && (!stock.exchange || stock.exchange !== extractedExchange);
      
      if (needsSymbolUpdate || needsExchangeUpdate) {
        console.log(`Updating stock ${originalSymbol}:`);
        console.log(`  Symbol: ${originalSymbol} -> ${cleanedSymbol}`);
        if (extractedExchange) {
          console.log(`  Exchange: ${stock.exchange || 'null'} -> ${extractedExchange}`);
        }
        
        const updateData: any = {};
        if (needsSymbolUpdate) {
          updateData.symbol = cleanedSymbol;
        }
        if (needsExchangeUpdate) {
          updateData.exchange = extractedExchange;
        }
        
        await db
          .update(stocks)
          .set(updateData)
          .where(eq(stocks.id, stock.id));
        
        updatedCount++;
      }
    }
    
    console.log(`\nStock symbol cleanup completed!`);
    console.log(`Updated ${updatedCount} out of ${allStocks.length} stocks`);
    
  } catch (error) {
    console.error('Error during stock symbol cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanStockSymbols()
    .then(() => {
      console.log('Cleanup finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

export { cleanStockSymbols };
