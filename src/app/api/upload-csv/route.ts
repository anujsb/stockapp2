// src/app/api/upload-csv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks, userPortfolio } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getStockQuote, getStockOverview, cleanStockSymbol } from '@/lib/alpha-vantage';

interface CSVRow {
  symbol: string;
  quantity: number;
  avgPrice: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'text/csv') {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have at least a header and one data row' }, { status: 400 });
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Validate required headers
    const requiredHeaders = ['symbol', 'quantity', 'avgprice'];
    const missingHeaders = requiredHeaders.filter(h => 
      !headers.some(header => header.includes(h.replace('avgprice', 'avg') || h.replace('avgprice', 'price')))
    );
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingHeaders.join(', ')}. Expected: symbol, quantity, avgprice/avg_price` 
      }, { status: 400 });
    }

    const symbolIndex = headers.findIndex(h => h.includes('symbol'));
    const quantityIndex = headers.findIndex(h => h.includes('quantity'));
    const avgPriceIndex = headers.findIndex(h => h.includes('avg') || h.includes('price'));
    const notesIndex = headers.findIndex(h => h.includes('notes'));

    const userId = 'default-user'; // For demo purposes
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(c => c.trim());
      
      try {
        const rawSymbol = columns[symbolIndex]?.toUpperCase();
        const cleanedSymbol = cleanStockSymbol(rawSymbol);
        const quantity = parseFloat(columns[quantityIndex]);
        const avgPrice = parseFloat(columns[avgPriceIndex]);
        const notes = notesIndex >= 0 ? columns[notesIndex] : '';

        if (!rawSymbol || isNaN(quantity) || isNaN(avgPrice)) {
          results.errors.push(`Row ${i + 1}: Invalid data - symbol: ${rawSymbol}, quantity: ${quantity}, avgPrice: ${avgPrice}`);
          results.failed++;
          continue;
        }

        // Check if stock exists using cleaned symbol, if not fetch and create it
        let stockRecord = await db.select().from(stocks).where(eq(stocks.symbol, cleanedSymbol)).limit(1);
        
        if (stockRecord.length === 0) {
          console.log(`Fetching data for new stock: ${rawSymbol} (cleaned: ${cleanedSymbol})`);
          
          const [quote, overview] = await Promise.all([
            getStockQuote(rawSymbol),
            getStockOverview(rawSymbol)
          ]);

          if (!quote) {
            results.errors.push(`Row ${i + 1}: Could not fetch data for symbol ${rawSymbol}`);
            results.failed++;
            continue;
          }

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

          const [newStock] = await db.insert(stocks).values(stockData).returning();
          stockRecord = [newStock];
        }

        // Check if portfolio entry already exists
        const existingEntry = await db
          .select()
          .from(userPortfolio)
          .where(and(eq(userPortfolio.userId, userId), eq(userPortfolio.stockId, stockRecord[0].id)))
          .limit(1);

        if (existingEntry.length > 0) {
          // Update existing entry by averaging the prices
          const current = existingEntry[0];
          const currentQuantity = parseFloat(current.quantity);
          const currentAvgPrice = parseFloat(current.avgPurchasePrice || '0');
          
          const totalQuantity = currentQuantity + quantity;
          const totalValue = (currentQuantity * currentAvgPrice) + (quantity * avgPrice);
          const newAvgPurchasePrice = totalValue / totalQuantity;

          await db
            .update(userPortfolio)
            .set({
              quantity: totalQuantity.toString(),
              avgPurchasePrice: newAvgPurchasePrice.toString(),
              notes: notes || current.notes,
              updatedAt: new Date()
            })
            .where(eq(userPortfolio.id, current.id));
        } else {
          // Create new entry
          await db
            .insert(userPortfolio)
            .values({
              userId,
              stockId: stockRecord[0].id,
              quantity: quantity.toString(),
              avgPurchasePrice: avgPrice.toString(),
              notes,
              purchaseDate: new Date()
            });
        }

        results.successful++;
        
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.failed++;
      }
    }

    return NextResponse.json({
      message: 'CSV upload completed',
      results
    });

  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CSV file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
