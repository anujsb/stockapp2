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
import { searchStocks } from '@/lib/alpha-vantage';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    console.log(`Searching for stocks with query: ${query}`);
    const results = await searchStocks(query);
    
    if (results.length === 0) {
      console.log(`No results found for query: ${query}`);
      return NextResponse.json([]);
    }
    
    console.log(`Found ${results.length} results for query: ${query}`);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error in API route:', error);
    // Return empty array instead of error to maintain UI functionality
    return NextResponse.json([]);
  }
}