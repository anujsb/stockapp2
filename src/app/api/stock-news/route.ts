// src/app/api/stock-news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stockNews, stocks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stockId = searchParams.get('stockId');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    if (stockId) {
      // Fetch news for a specific stock
      const news = await db
        .select({
          id: stockNews.id,
          title: stockNews.title,
          summary: stockNews.summary,
          url: stockNews.url,
          source: stockNews.source,
          publishedAt: stockNews.publishedAt,
          sentiment: stockNews.sentiment,
          createdAt: stockNews.createdAt,
          stock: {
            id: stocks.id,
            symbol: stocks.symbol,
            name: stocks.name
          }
        })
        .from(stockNews)
        .innerJoin(stocks, eq(stockNews.stockId, stocks.id))
        .where(eq(stockNews.stockId, parseInt(stockId)))
        .orderBy(desc(stockNews.publishedAt))
        .limit(limit);

      return NextResponse.json(news);
    } else {
      // Fetch latest news for all stocks
      const news = await db
        .select({
          id: stockNews.id,
          title: stockNews.title,
          summary: stockNews.summary,
          url: stockNews.url,
          source: stockNews.source,
          publishedAt: stockNews.publishedAt,
          sentiment: stockNews.sentiment,
          createdAt: stockNews.createdAt,
          stock: {
            id: stocks.id,
            symbol: stocks.symbol,
            name: stocks.name
          }
        })
        .from(stockNews)
        .innerJoin(stocks, eq(stockNews.stockId, stocks.id))
        .orderBy(desc(stockNews.publishedAt))
        .limit(limit);

      return NextResponse.json(news);
    }
  } catch (error) {
    console.error('Error fetching stock news:', error);
    return NextResponse.json({ error: 'Failed to fetch stock news' }, { status: 500 });
  }
}
