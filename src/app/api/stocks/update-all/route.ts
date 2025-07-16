import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';
import { fetchStockData } from '@/lib/stock-details-api';
import { eq } from 'drizzle-orm';
import { stockUpdateLogs } from '@/lib/db/schema';
import { stockCorporateActions } from '@/lib/db/schema';
import { fetchCorporateActions } from '@/lib/stock-details-api';

// Helper: Check if Indian market is open (NSE/BSE: 09:15 to 15:30 IST)
function isIndianMarketOpen() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(utc + istOffset);
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  // Market open: 09:15 (9*60+15=555), close: 15:30 (15*60+30=930)
  const mins = hours * 60 + minutes;
  return mins >= 555 && mins <= 930 && ist.getDay() >= 1 && ist.getDay() <= 5; // Mon-Fri
}

// In-memory throttle: track last update time
let lastGlobalUpdate: number | null = null;
const THROTTLE_MS = 60 * 1000; // 1 minute

export async function POST(request: NextRequest) {
  const nowMs = Date.now();
  const endpoint = '/api/stocks/update-all';
  if (lastGlobalUpdate && nowMs - lastGlobalUpdate < THROTTLE_MS) {
    await db.insert(stockUpdateLogs).values({
      endpoint,
      status: 'throttled',
      message: 'Update throttled: Please wait before updating again.'
    });
    return NextResponse.json({ message: 'Update throttled: Please wait before updating again.' }, { status: 429 });
  }
  if (!isIndianMarketOpen()) {
    await db.insert(stockUpdateLogs).values({
      endpoint,
      status: 'throttled',
      message: 'Indian stock market is closed. No updates performed.'
    });
    return NextResponse.json({ message: 'Indian stock market is closed. No updates performed.' }, { status: 200 });
  }
  lastGlobalUpdate = nowMs;

  // Get all stocks from DB
  const allStocks = await db.select().from(stocks);
  const updated = [];
  const failed = [];
  const now = new Date();

  for (const stock of allStocks) {
    try {
      const stockData = await fetchStockData(stock.symbol);
      if (stockData && stockData.info) {
        await db.update(stocks)
          .set({
            name: stockData.info.longName || stock.name,
            currentPrice: stockData.info.currentPrice.toString(),
            previousClose: stockData.info.regularMarketPreviousClose.toString(),
            dayChange: stockData.info.regularMarketChange.toString(),
            dayChangePercent: stockData.info.regularMarketChangePercent.toString(),
            volume: stockData.info.regularMarketVolume || null,
            high52Week: stockData.info.fiftyTwoWeekHigh?.toString() || null,
            low52Week: stockData.info.fiftyTwoWeekLow?.toString() || null,
            peRatio: stockData.info.trailingPE?.toString() || null,
            dividendYield: stockData.info.dividendYield?.toString() || null,
            sector: stockData.info.sector || stock.sector,
            industry: stockData.info.industry || stock.industry,
            marketCap: stockData.info.marketCap || stock.marketCap,
            lastUpdated: now,
            lastRefreshed: now
          })
          .where(eq(stocks.id, stock.id));
        // Fetch and upsert corporate actions
        try {
          const ca = await fetchCorporateActions(stock.symbol);
          await db.insert(stockCorporateActions).values({
            stockId: stock.id,
            exDividendDate: ca.exDividendDate || null,
            dividendDate: ca.dividendDate || null,
            splitDate: ca.splitDate || null,
            earnings: ca.earnings ? JSON.stringify(ca.earnings) : null,
            updatedAt: new Date(),
          }).onConflictDoUpdate({
            target: [stockCorporateActions.stockId],
            set: {
              exDividendDate: ca.exDividendDate || null,
              dividendDate: ca.dividendDate || null,
              splitDate: ca.splitDate || null,
              earnings: ca.earnings ? JSON.stringify(ca.earnings) : null,
              updatedAt: new Date(),
            }
          });
        } catch (caErr) {
          // Optionally log error but don't fail the stock update
        }
        updated.push(stock.symbol);
      } else {
        failed.push(stock.symbol);
      }
    } catch (err) {
      failed.push(stock.symbol);
    }
  }

  await db.insert(stockUpdateLogs).values({
    endpoint,
    status: failed.length === 0 ? 'success' : 'fail',
    message: `Updated: ${updated.join(', ')}; Failed: ${failed.join(', ')}`
  });

  return NextResponse.json({
    message: 'Stock update complete',
    updated,
    failed,
    lastUpdated: now
  });
} 