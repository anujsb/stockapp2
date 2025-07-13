// src/app/api/cron/refresh-scheduler/route.ts
// Cron job endpoint for automatic stock data refresh scheduling

import { NextRequest, NextResponse } from 'next/server';
import { refreshMultipleStocks, isIndianMarketOpen } from '@/lib/stock-refresh-system';
import { db } from '@/lib/db';
import { stocks, stockRefreshLog } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// Cron job authentication (you can use a secret token or other auth method)
const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret';

export async function POST(request: NextRequest) {
  try {
    // Verify cron job authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { schedule = 'realtime' } = body;

    if (!['realtime', 'daily', 'weekly', 'quarterly'].includes(schedule)) {
      return NextResponse.json({ error: 'Invalid schedule type' }, { status: 400 });
    }

    console.log(`🕐 Starting ${schedule} refresh schedule...`);

    // Get all stocks that need refresh
    const allStocks = await db.select({ symbol: stocks.symbol }).from(stocks);
    const symbols = allStocks.map(stock => stock.symbol);

    if (symbols.length === 0) {
      return NextResponse.json({ message: 'No stocks found to refresh' });
    }

    let results;
    let shouldRun = true;

    switch (schedule) {
      case 'realtime':
        // 🔴 REAL-TIME: Every 1-5 minutes during market hours
        if (!isIndianMarketOpen()) {
          console.log('📈 Market is closed, skipping real-time refresh');
          shouldRun = false;
        } else {
          console.log('📈 Market is open, running real-time refresh');
          results = await refreshMultipleStocks(symbols, 'realtime');
        }
        break;

      case 'daily':
        // 🟡 DAILY: Once per market close or next morning
        console.log('📊 Running daily refresh for all stocks');
        results = await refreshMultipleStocks(symbols, 'daily');
        break;

      case 'weekly':
        // 🟢 WEEKLY: Once per week
        console.log('📅 Running weekly refresh for all stocks');
        results = await refreshMultipleStocks(symbols, 'weekly');
        break;

      case 'quarterly':
        // 🟢 QUARTERLY: Once per quarter
        console.log('📋 Running quarterly refresh for all stocks');
        results = await refreshMultipleStocks(symbols, 'quarterly');
        break;
    }

    if (!shouldRun) {
      return NextResponse.json({
        message: 'Schedule skipped - market closed or other condition not met',
        schedule,
        timestamp: new Date().toISOString()
      });
    }

    // Log the refresh results
    console.log(`✅ ${schedule} refresh complete:`, results);

    return NextResponse.json({
      message: `${schedule} refresh completed`,
      schedule,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in refresh scheduler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schedule = searchParams.get('schedule') || 'realtime';

    if (!['realtime', 'daily', 'weekly', 'quarterly'].includes(schedule)) {
      return NextResponse.json({ error: 'Invalid schedule type' }, { status: 400 });
    }

    // Get refresh statistics for the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const refreshStats = await db
      .select({
        refreshType: stockRefreshLog.refreshType,
        status: stockRefreshLog.status,
        count: stockRefreshLog.id,
      })
      .from(stockRefreshLog)
      .where(
        and(
          eq(stockRefreshLog.refreshType, schedule),
          gte(stockRefreshLog.createdAt, yesterday)
        )
      );

    const successCount = refreshStats.filter(stat => stat.status === 'success').length;
    const failedCount = refreshStats.filter(stat => stat.status === 'failed').length;
    const partialCount = refreshStats.filter(stat => stat.status === 'partial').length;

    return NextResponse.json({
      schedule,
      last24Hours: {
        total: refreshStats.length,
        successful: successCount,
        failed: failedCount,
        partial: partialCount,
        successRate: refreshStats.length > 0 ? (successCount / refreshStats.length * 100).toFixed(2) : 0
      },
      marketStatus: isIndianMarketOpen() ? 'open' : 'closed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting refresh statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 