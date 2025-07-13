// src/app/api/stocks/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { refreshStockData, refreshMultipleStocks, RefreshType } from '@/lib/stock-refresh-system';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, symbols, refreshType = 'realtime' } = body;
    
    if (!symbol && !symbols) {
      return NextResponse.json({ error: 'Symbol or symbols array is required' }, { status: 400 });
    }
    
    if (symbols && !Array.isArray(symbols)) {
      return NextResponse.json({ error: 'Symbols must be an array' }, { status: 400 });
    }
    
    if (!['realtime', 'daily', 'weekly', 'quarterly'].includes(refreshType)) {
      return NextResponse.json({ error: 'Invalid refresh type' }, { status: 400 });
    }
    
    // Single symbol refresh
    if (symbol) {
      const success = await refreshStockData(symbol, refreshType as RefreshType);
      return NextResponse.json({
        success,
        symbol,
        refreshType,
        message: success ? 'Stock refreshed successfully' : 'Failed to refresh stock'
      });
    }
    
    // Multiple symbols refresh
    if (symbols) {
      const results = await refreshMultipleStocks(symbols, refreshType as RefreshType);
      return NextResponse.json({
        ...results,
        refreshType,
        message: `Refreshed ${results.successful.length} out of ${results.total} stocks`
      });
    }
    
  } catch (error) {
    console.error('Error in stock refresh API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const refreshType = searchParams.get('type') || 'realtime';
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }
    
    if (!['realtime', 'daily', 'weekly', 'quarterly'].includes(refreshType)) {
      return NextResponse.json({ error: 'Invalid refresh type' }, { status: 400 });
    }
    
    const success = await refreshStockData(symbol, refreshType as RefreshType);
    
    return NextResponse.json({
      success,
      symbol,
      refreshType,
      message: success ? 'Stock refreshed successfully' : 'Failed to refresh stock'
    });
    
  } catch (error) {
    console.error('Error in stock refresh API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 