// src/app/api/stocks/[symbol]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fetchStockData } from '@/lib/stock-details-api';
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
      console.log(`Stock ${symbol} not found in database, fetching from comprehensive APIs...`);
      
      // Fetch comprehensive stock data with Alpha Vantage primary and Yahoo fallback
      const stockData = await fetchStockData(symbol);

      if (!stockData) {
        console.log(`No stock data available for ${symbol}`);
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
      }

      console.log(`Successfully fetched comprehensive data for ${symbol}, storing in database...`);

      const dbStockData = {
        symbol: stockData.symbol,
        name: stockData.info.longName || stockData.symbol,
        currentPrice: stockData.info.currentPrice != null ? String(stockData.info.currentPrice) : null,
        previousClose: stockData.info.regularMarketPreviousClose != null ? String(stockData.info.regularMarketPreviousClose) : null,
        dayChange: stockData.info.regularMarketChange != null ? String(stockData.info.regularMarketChange) : null,
        dayChangePercent: stockData.info.regularMarketChangePercent != null ? String(stockData.info.regularMarketChangePercent) : null,
        volume: stockData.info.regularMarketVolume != null ? Number(stockData.info.regularMarketVolume) : null,
        high52Week: stockData.info.fiftyTwoWeekHigh != null ? String(stockData.info.fiftyTwoWeekHigh) : null,
        low52Week: stockData.info.fiftyTwoWeekLow != null ? String(stockData.info.fiftyTwoWeekLow) : null,
        peRatio: stockData.info.trailingPE != null ? String(stockData.info.trailingPE) : null,
        dividendYield: stockData.info.dividendYield != null ? String(stockData.info.dividendYield) : null,
        sector: stockData.info.sector,
        industry: stockData.info.industry,
        exchange: 'NSE', // Default to NSE for Indian stocks
        marketCap: stockData.info.marketCap != null ? Number(stockData.info.marketCap) : null,
        currency: 'INR' // Set to INR for Indian stocks
      };

      // Check again before insert (race condition safe)
      const existingStock = await db.select().from(stocks).where(eq(stocks.symbol, dbStockData.symbol)).limit(1);
      if (existingStock.length > 0) {
        // Already exists, return it with technical/historical data if available
        return NextResponse.json({
          ...existingStock[0],
          technicalIndicators: stockData.technicalIndicators,
          historicalData: stockData.historicalData.slice(-30),
          fundamentalData: {
            isEstimated: stockData.info.isEstimated || false,
            marketCap: stockData.info.marketCap,
            trailingPE: stockData.info.trailingPE,
            priceToBook: stockData.info.priceToBook,
            dividendYield: stockData.info.dividendYield,
            returnOnEquity: stockData.info.returnOnEquity,
            currentRatio: stockData.info.currentRatio,
            debtToEquity: stockData.info.debtToEquity,
            beta: stockData.info.beta
          }
        });
      }

      try {
        const [insertedStock] = await db.insert(stocks).values(dbStockData).returning();
        console.log(`Successfully stored ${symbol} in database`);
        return NextResponse.json({
          ...insertedStock,
          technicalIndicators: stockData.technicalIndicators,
          historicalData: stockData.historicalData.slice(-30), // Last 30 days
          fundamentalData: {
            isEstimated: stockData.info.isEstimated || false,
            marketCap: stockData.info.marketCap,
            trailingPE: stockData.info.trailingPE,
            priceToBook: stockData.info.priceToBook,
            dividendYield: stockData.info.dividendYield,
            returnOnEquity: stockData.info.returnOnEquity,
            currentRatio: stockData.info.currentRatio,
            debtToEquity: stockData.info.debtToEquity,
            beta: stockData.info.beta
          }
        });
      } catch (dbError) {
        console.error(`Database insert error for ${symbol}:`, dbError);
        // Return the stock data even if database insert fails
        return NextResponse.json({
          ...dbStockData,
          id: Date.now(), // Temporary ID
          createdAt: new Date(),
          lastUpdated: new Date(),
          technicalIndicators: stockData.technicalIndicators,
          historicalData: stockData.historicalData.slice(-30)
        });
      }
    } else {
      console.log(`Stock ${symbol} found in database, updating with fresh comprehensive data...`);
      
      // Update existing stock with fresh comprehensive data
      const stockData = await fetchStockData(symbol);

      if (stockData) {
        console.log(`Got fresh comprehensive data for ${symbol}, updating database...`);
        
        const updateData = {
          name: stockData.info.longName || stock[0].name,
          currentPrice: stockData.info.currentPrice != null ? String(stockData.info.currentPrice) : null,
          previousClose: stockData.info.regularMarketPreviousClose != null ? String(stockData.info.regularMarketPreviousClose) : null,
          dayChange: stockData.info.regularMarketChange != null ? String(stockData.info.regularMarketChange) : null,
          dayChangePercent: stockData.info.regularMarketChangePercent != null ? String(stockData.info.regularMarketChangePercent) : null,
          volume: stockData.info.regularMarketVolume != null ? Number(stockData.info.regularMarketVolume) : null,
          high52Week: stockData.info.fiftyTwoWeekHigh != null ? String(stockData.info.fiftyTwoWeekHigh) : null,
          low52Week: stockData.info.fiftyTwoWeekLow != null ? String(stockData.info.fiftyTwoWeekLow) : null,
          peRatio: stockData.info.trailingPE != null ? String(stockData.info.trailingPE) : null,
          dividendYield: stockData.info.dividendYield != null ? String(stockData.info.dividendYield) : null,
          sector: stockData.info.sector || stock[0].sector,
          industry: stockData.info.industry || stock[0].industry,
          marketCap: stockData.info.marketCap != null ? Number(stockData.info.marketCap) : stock[0].marketCap,
          lastUpdated: new Date()
        };

        try {
          const [updatedStock] = await db
            .update(stocks)
            .set(updateData)
            .where(eq(stocks.id, stock[0].id))
            .returning();

          console.log(`Successfully updated ${symbol} in database`);
          return NextResponse.json({
            ...updatedStock,
            technicalIndicators: stockData.technicalIndicators,
            historicalData: stockData.historicalData.slice(-30), // Last 30 days
            fundamentalData: {
              isEstimated: stockData.info.isEstimated || false,
              marketCap: stockData.info.marketCap,
              trailingPE: stockData.info.trailingPE,
              priceToBook: stockData.info.priceToBook,
              dividendYield: stockData.info.dividendYield,
              returnOnEquity: stockData.info.returnOnEquity,
              currentRatio: stockData.info.currentRatio,
              debtToEquity: stockData.info.debtToEquity,
              beta: stockData.info.beta
            }
          });
        } catch (dbError) {
          console.error(`Database update error for ${symbol}:`, dbError);
          // Return the existing stock data with fresh technical data if update fails
          return NextResponse.json({
            ...stock[0],
            technicalIndicators: stockData.technicalIndicators,
            historicalData: stockData.historicalData.slice(-30)
          });
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