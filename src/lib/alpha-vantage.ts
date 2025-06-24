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

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

export async function searchStocks(keywords: string): Promise<StockSearchResult[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search stocks');
    }
    
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    return data.bestMatches?.map((match: any) => ({
      symbol: match['1. symbol'],
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
    console.error('Error searching stocks:', error);
    return [];
  }
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock quote');
    }
    
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    const quote = data['Global Quote'];
    if (!quote) {
      return null;
    }
    
    return {
      symbol: quote['01. symbol'],
      name: quote['01. symbol'], // Alpha Vantage doesn't provide name in quote
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
    console.error('Error fetching stock quote:', error);
    return null;
  }
}

export async function getStockOverview(symbol: string) {
  try {
    const response = await fetch(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock overview');
    }
    
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
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
    console.error('Error fetching stock overview:', error);
    return null;
  }
}