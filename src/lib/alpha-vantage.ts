// // src/lib/alpha-vantage.ts
// export interface StockQuote {
//   symbol: string;
//   name: string;
//   price: string;
//   change: string;
//   changePercent: string;
//   volume: string;
//   previousClose: string;
//   marketCap?: string;
//   peRatio?: string;
//   high52Week?: string;
//   low52Week?: string;
// }

// export interface StockSearchResult {
//   symbol: string;
//   name: string;
//   type: string;
//   region: string;
//   marketOpen: string;
//   marketClose: string;
//   timezone: string;
//   currency: string;
//   matchScore: string;
// }

// const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
// const BASE_URL = 'https://www.alphavantage.co/query';

// export async function searchStocks(keywords: string): Promise<StockSearchResult[]> {
//   try {
//     const response = await fetch(
//       `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${ALPHA_VANTAGE_API_KEY}`
//     );
    
//     if (!response.ok) {
//       throw new Error('Failed to search stocks');
//     }
    
//     const data = await response.json();
    
//     if (data['Error Message']) {
//       throw new Error(data['Error Message']);
//     }
    
//     return data.bestMatches?.map((match: any) => ({
//       symbol: match['1. symbol'],
//       name: match['2. name'],
//       type: match['3. type'],
//       region: match['4. region'],
//       marketOpen: match['5. marketOpen'],
//       marketClose: match['6. marketClose'],
//       timezone: match['7. timezone'],
//       currency: match['8. currency'],
//       matchScore: match['9. matchScore']
//     })) || [];
//   } catch (error) {
//     console.error('Error searching stocks:', error);
//     return [];
//   }
// }

// export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
//   try {
//     const response = await fetch(
//       `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
//     );
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch stock quote');
//     }
    
//     const data = await response.json();
    
//     if (data['Error Message']) {
//       throw new Error(data['Error Message']);
//     }
    
//     const quote = data['Global Quote'];
//     if (!quote) {
//       return null;
//     }
    
//     return {
//       symbol: quote['01. symbol'],
//       name: quote['01. symbol'], // Alpha Vantage doesn't provide name in quote
//       price: quote['05. price'],
//       change: quote['09. change'],
//       changePercent: quote['10. change percent']?.replace('%', ''),
//       volume: quote['06. volume'],
//       previousClose: quote['08. previous close'],
//       marketCap: undefined,
//       peRatio: undefined,
//       high52Week: quote['03. high'],
//       low52Week: quote['04. low']
//     };
//   } catch (error) {
//     console.error('Error fetching stock quote:', error);
//     return null;
//   }
// }

// export async function getStockOverview(symbol: string) {
//   try {
//     const response = await fetch(
//       `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
//     );
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch stock overview');
//     }
    
//     const data = await response.json();
    
//     if (data['Error Message']) {
//       throw new Error(data['Error Message']);
//     }
    
//     return {
//       symbol: data.Symbol,
//       name: data.Name,
//       sector: data.Sector,
//       industry: data.Industry,
//       marketCap: data.MarketCapitalization,
//       peRatio: data.PERatio,
//       dividendYield: data.DividendYield,
//       high52Week: data['52WeekHigh'],
//       low52Week: data['52WeekLow'],
//       exchange: data.Exchange
//     };
//   } catch (error) {
//     console.error('Error fetching stock overview:', error);
//     return null;
//   }
// }



// src/lib/alpha-vantage.ts
export interface StockQuote {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  volume: string;
  previousClose: string;
  marketCap?: string;
  peRatio?: string;
  high52Week?: string;
  low52Week?: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: string;
}

// Yahoo Finance interfaces
interface YahooFinanceResponse {
  quoteResponse: {
    result: Array<{
      symbol: string;
      shortName: string;
      longName?: string;
      regularMarketPrice: number;
      regularMarketPreviousClose: number;
      regularMarketChange: number;
      regularMarketChangePercent: number;
      marketCap?: number;
      regularMarketVolume: number;
      fiftyTwoWeekHigh: number;
      fiftyTwoWeekLow: number;
      trailingPE?: number;
      dividendYield?: number;
      sector?: string;
      industry?: string;
      exchange: string;
      currency: string;
    }>;
  };
}

interface YahooSearchResult {
  quotes: Array<{
    symbol: string;
    shortname: string;
    longname?: string;
    exchange: string;
    sector?: string;
    industry?: string;
  }>;
}

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const ALPHA_BASE_URL = 'https://www.alphavantage.co/query';
const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search';

// Utility function to clean stock symbols
function cleanStockSymbol(symbol: string): string {
  // Remove exchange suffixes like .BSE, .NSE, .TO, etc.
  return symbol.split('.')[0].toUpperCase();
}

// Utility function to get the appropriate exchange for TradingView
function getTradingViewExchange(symbol: string, exchange?: string): string {
  const originalSymbol = symbol;
  const cleanSymbol = cleanStockSymbol(symbol);
  
  // Indian stocks - check by common Indian stock symbols
  const indianStocks = [
    'TCS', 'RELIANCE', 'INFY', 'HDFC', 'HDFCBANK', 'ICICIBANK', 'KOTAKBANK', 
    'ITC', 'LT', 'AXISBANK', 'SBIN', 'BHARTIARTL', 'ASIANPAINT', 'MARUTI',
    'BAJFINANCE', 'HCLTECH', 'WIPRO', 'ULTRACEMCO', 'TATAMOTORS', 'SUNPHARMA',
    'ONGC', 'TECHM', 'TATASTEEL', 'TITAN', 'POWERGRID', 'NTPC', 'NESTLEIND',
    'BAJAJFINSV', 'ADANIGREEN', 'ADANIPORTS'
  ];
  
  if (originalSymbol.includes('.BSE') || originalSymbol.includes('.NS') || 
      exchange?.includes('BSE') || exchange?.includes('NSE') ||
      indianStocks.includes(cleanSymbol.toUpperCase())) {
    return 'BSE';
  }
  
  // Canadian stocks
  if (originalSymbol.includes('.TO') || exchange?.includes('TSX')) {
    return 'TSX';
  }
  
  // UK stocks
  if (originalSymbol.includes('.L') || exchange?.includes('LSE')) {
    return 'LSE';
  }
  
  // Default to NASDAQ for US stocks
  return 'NASDAQ';
}

// Export the utility functions
export { cleanStockSymbol, getTradingViewExchange };

// Alpha Vantage functions
async function searchStocksAlphaVantage(keywords: string): Promise<StockSearchResult[]> {
  try {
    const response = await fetch(
      `${ALPHA_BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Alpha Vantage search: API request failed');
      return [];
    }
    
    const data = await response.json();
    
    if (data['Error Message'] || data['Note']) {
      console.error('Alpha Vantage search error:', data['Error Message'] || data['Note']);
      return [];
    }
    
    return data.bestMatches?.map((match: any) => ({
      symbol: cleanStockSymbol(match['1. symbol']), // Clean the symbol
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      marketOpen: match['5. marketOpen'],
      marketClose: match['6. marketClose'],
      timezone: match['7. timezone'],
      currency: match['8. currency'],
      matchScore: match['9. matchScore']
    })) || [];
  } catch (error) {
    console.error('Alpha Vantage search error:', error);
    return [];
  }
}

async function getStockQuoteAlphaVantage(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${ALPHA_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Alpha Vantage quote: API request failed');
      return null;
    }
    
    const data = await response.json();
    
    if (data['Error Message'] || data['Note']) {
      console.error('Alpha Vantage quote error:', data['Error Message'] || data['Note']);
      return null;
    }
    
    const quote = data['Global Quote'];
    if (!quote) {
      console.error('Alpha Vantage: No quote data available');
      return null;
    }
    
    return {
      symbol: quote['01. symbol'],
      name: quote['01. symbol'],
      price: quote['05. price'],
      change: quote['09. change'],
      changePercent: quote['10. change percent']?.replace('%', ''),
      volume: quote['06. volume'],
      previousClose: quote['08. previous close'],
      marketCap: undefined,
      peRatio: undefined,
      high52Week: quote['03. high'],
      low52Week: quote['04. low']
    };
  } catch (error) {
    console.error('Alpha Vantage quote error:', error);
    return null;
  }
}

async function getStockOverviewAlphaVantage(symbol: string) {
  try {
    const response = await fetch(
      `${ALPHA_BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Alpha Vantage overview: API request failed');
      return null;
    }
    
    const data = await response.json();
    
    if (data['Error Message'] || data['Note']) {
      console.error('Alpha Vantage overview error:', data['Error Message'] || data['Note']);
      return null;
    }
    
    return {
      symbol: data.Symbol,
      name: data.Name,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: data.MarketCapitalization,
      peRatio: data.PERatio,
      dividendYield: data.DividendYield,
      high52Week: data['52WeekHigh'],
      low52Week: data['52WeekLow'],
      exchange: data.Exchange
    };
  } catch (error) {
    console.error('Alpha Vantage overview error:', error);
    return null;
  }
}

// Yahoo Finance functions
async function searchStocksYahoo(query: string): Promise<StockSearchResult[]> {
  try {
    const response = await fetch(`${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.error('Yahoo Finance search: API request failed');
      return [];
    }
    
    const data: YahooSearchResult = await response.json();
    
    return data.quotes?.slice(0, 10).map(quote => ({
      symbol: cleanStockSymbol(quote.symbol), // Clean the symbol
      name: quote.shortname || quote.longname || cleanStockSymbol(quote.symbol),
      type: 'Equity', // Yahoo doesn't provide type, defaulting to Equity
      region: 'United States', // Default region
      marketOpen: '09:30',
      marketClose: '16:00',
      timezone: 'US/Eastern',
      currency: 'USD',
      matchScore: '1.0000' // Yahoo doesn't provide match score
    })) || [];
  } catch (error) {
    console.error('Yahoo Finance search error:', error);
    return [];
  }
}

async function getStockQuoteYahoo(symbol: string): Promise<StockQuote | null> {
  // Try different symbol formats for different exchanges
  const symbolVariants = [
    symbol.toUpperCase(),
    `${symbol.toUpperCase()}.NS`, // NSE format
    `${symbol.toUpperCase()}.BO`, // BSE format
    `${symbol.toUpperCase()}.TO`, // TSX format
    `${symbol.toUpperCase()}.L`   // London format
  ];
  
  for (const symbolVariant of symbolVariants) {
    try {
      console.log(`Trying Yahoo Finance with symbol: ${symbolVariant}`);
      const response = await fetch(`${YAHOO_BASE_URL}?symbols=${symbolVariant}`);
      
      if (!response.ok) {
        console.error(`Yahoo Finance quote: API request failed for ${symbolVariant}`);
        continue;
      }
      
      const data: YahooFinanceResponse = await response.json();
      
      if (!data.quoteResponse.result || data.quoteResponse.result.length === 0) {
        console.error(`Yahoo Finance: Stock symbol ${symbolVariant} not found`);
        continue;
      }

      const stock = data.quoteResponse.result[0];
      
      console.log(`Yahoo Finance: Found data for ${symbolVariant}`);
      return {
        symbol: cleanStockSymbol(stock.symbol), // Clean the symbol
        name: stock.shortName || stock.longName || cleanStockSymbol(stock.symbol),
        price: stock.regularMarketPrice?.toString() || '0',
        change: stock.regularMarketChange?.toString() || '0',
        changePercent: stock.regularMarketChangePercent?.toString() || '0',
        volume: stock.regularMarketVolume?.toString() || '0',
        previousClose: stock.regularMarketPreviousClose?.toString() || '0',
        marketCap: stock.marketCap?.toString() || undefined,
        peRatio: stock.trailingPE?.toString() || undefined,
        high52Week: stock.fiftyTwoWeekHigh?.toString() || '0',
        low52Week: stock.fiftyTwoWeekLow?.toString() || '0'
      };
    } catch (error) {
      console.error(`Yahoo Finance quote error for ${symbolVariant}:`, error);
      continue;
    }
  }
  
  console.error(`Yahoo Finance: All symbol variants failed for ${symbol}`);
  return null;
}

async function getStockOverviewYahoo(symbol: string) {
  try {
    const response = await fetch(`${YAHOO_BASE_URL}?symbols=${symbol.toUpperCase()}`);
    
    if (!response.ok) {
      console.error('Yahoo Finance overview: API request failed');
      return null;
    }
    
    const data: YahooFinanceResponse = await response.json();
    
    if (!data.quoteResponse.result || data.quoteResponse.result.length === 0) {
      console.error(`Yahoo Finance overview: Stock symbol ${symbol} not found`);
      return null;
    }

    const stock = data.quoteResponse.result[0];
    
    return {
      symbol: stock.symbol,
      name: stock.shortName || stock.longName || stock.symbol,
      sector: stock.sector || null,
      industry: stock.industry || null,
      marketCap: stock.marketCap?.toString() || null,
      peRatio: stock.trailingPE?.toString() || null,
      dividendYield: stock.dividendYield?.toString() || null,
      high52Week: stock.fiftyTwoWeekHigh?.toString() || null,
      low52Week: stock.fiftyTwoWeekLow?.toString() || null,
      exchange: stock.exchange || 'UNKNOWN'
    };
  } catch (error) {
    console.error('Yahoo Finance overview error:', error);
    return null;
  }
}

// Main exported functions with fallback logic
export async function searchStocks(keywords: string): Promise<StockSearchResult[]> {
  console.log('Attempting stock search with Alpha Vantage...');
  
  const alphaResults = await searchStocksAlphaVantage(keywords);
  
  if (alphaResults && alphaResults.length > 0) {
    console.log('Alpha Vantage search successful');
    return alphaResults;
  }
  
  console.log('Alpha Vantage search failed or empty, falling back to Yahoo Finance...');
  
  const yahooResults = await searchStocksYahoo(keywords);
  
  if (yahooResults && yahooResults.length > 0) {
    console.log('Yahoo Finance search successful');
    return yahooResults;
  }
  
  console.error('Both Alpha Vantage and Yahoo Finance search failed or returned empty results');
  return [];
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  console.log(`Attempting stock quote for ${symbol} with Alpha Vantage...`);
  
  const alphaQuote = await getStockQuoteAlphaVantage(symbol);
  
  if (alphaQuote) {
    console.log('Alpha Vantage quote successful');
    return alphaQuote;
  }
  
  console.log(`Alpha Vantage quote failed for ${symbol}, falling back to Yahoo Finance...`);
  
  const yahooQuote = await getStockQuoteYahoo(symbol);
  
  if (yahooQuote) {
    console.log('Yahoo Finance quote successful');
    return yahooQuote;
  }
  
  console.error(`Both Alpha Vantage and Yahoo Finance quote failed for ${symbol}`);
  return null;
}

export async function getStockOverview(symbol: string) {
  console.log(`Attempting stock overview for ${symbol} with Alpha Vantage...`);
  
  const alphaOverview = await getStockOverviewAlphaVantage(symbol);
  
  if (alphaOverview) {
    console.log('Alpha Vantage overview successful');
    return alphaOverview;
  }
  
  console.log(`Alpha Vantage overview failed for ${symbol}, falling back to Yahoo Finance...`);
  
  const yahooOverview = await getStockOverviewYahoo(symbol);
  
  if (yahooOverview) {
    console.log('Yahoo Finance overview successful');
    return yahooOverview;
  }
  
  console.error(`Both Alpha Vantage and Yahoo Finance overview failed for ${symbol}`);
  return null;
}
