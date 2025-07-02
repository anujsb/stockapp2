// // src/app/api/stocks/search/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { searchStocks } from '@/lib/alpha-vantage';

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const query = searchParams.get('q');

//   if (!query) {
//     return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
//   }

//   try {
//     const results = await searchStocks(query);
//     return NextResponse.json(results);
//   } catch (error) {
//     console.error('Search error:', error);
//     return NextResponse.json({ error: 'Failed to search stocks' }, { status: 500 });
//   }
// }


// src/app/api/stocks/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchStocks, searchIndianStocks } from '@/lib/alpha-vantage';
import { fetchStockData } from '@/lib/stock-api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    console.log(`Searching for stocks with query: ${query}`);
    
    // First, search Indian stocks for better NSE/BSE results
    const indianResults = await searchIndianStocks(query);
    console.log(`Found ${indianResults.length} Indian stock results`);
    
    // If we have Indian results, return them first
    if (indianResults.length > 0) {
      // Also try global search to complement Indian results
      try {
        const globalResults = await searchStocks(query);
        console.log(`Found ${globalResults.length} global results`);
        
        // Combine results, prioritizing Indian stocks
        const combinedResults = [
          ...indianResults,
          ...globalResults.filter(global => 
            !indianResults.some(indian => indian.symbol === global.symbol)
          )
        ].slice(0, 10);
        
        console.log(`Returning ${combinedResults.length} combined results`);
        return NextResponse.json(combinedResults);
      } catch (globalError) {
        console.warn('Global search failed, returning Indian results only:', globalError);
        return NextResponse.json(indianResults);
      }
    }
    
    // If no Indian results, fall back to global search
    const globalResults = await searchStocks(query);
    console.log(`Found ${globalResults.length} global results`);
    
    if (globalResults.length === 0) {
      console.log(`No results found for query: ${query}`);
      return NextResponse.json([]);
    }
    
    return NextResponse.json(globalResults);
  } catch (error) {
    console.error('Search error in API route:', error);
    
    // Last resort: try Indian stock search even if global search fails
    try {
      const indianFallback = await searchIndianStocks(query);
      console.log(`Fallback: Found ${indianFallback.length} Indian results`);
      return NextResponse.json(indianFallback);
    } catch (indianError) {
      console.error('All search methods failed:', { error, indianError });
      return NextResponse.json([]);
    }
  }
}