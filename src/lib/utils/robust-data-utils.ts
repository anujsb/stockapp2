// Robust data utilities for handling missing/null values in stock data
// Provides fallbacks and safe data formatting

export interface RobustStockData {
  // Basic info
  symbol: string;
  name: string;
  longName?: string;
  
  // Price data
  currentPrice: number;
  previousClose: number;
  dayChange: number;
  dayChangePercent: number;
  bid?: number;
  ask?: number;
  
  // Market data
  marketCap?: number;
  volume?: number;
  sharesOutstanding?: number;
  float?: number;
  
  // Technical data
  high52Week?: number;
  low52Week?: number;
  
  // Financial ratios
  peRatio?: number;
  priceToBook?: number;
  priceToSales?: number;
  evToEbitda?: number;
  pegRatio?: number;
  bookValue?: number;
  dividendYield?: number;
  dividendRate?: number;
  
  // Financial health
  revenueGrowth?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  beta?: number;
  
  // Company info
  sector?: string;
  industry?: string;
  exchange?: string;
  currency?: string;
  website?: string;
  hqLocation?: string;
  employees?: number;
  ceo?: string;
  description?: string;
  
  // Technical indicators
  sma20?: number;
  sma50?: number;
  rsi?: number;
  macdLine?: number;
  macdSignal?: number;
  macdHistogram?: number;
  atr?: number;
  
  // Support & Resistance
  supportLevel1?: number;
  supportLevel2?: number;
  resistanceLevel1?: number;
  resistanceLevel2?: number;
  
  // Analyst ratings
  analystBuyCount?: number;
  analystHoldCount?: number;
  analystSellCount?: number;
  analystTargetPrice?: number;
  analystRecommendation?: string;
  
  // ESG & Institutional
  institutionalPercent?: number;
  insiderPercent?: number;
  esgEnvironmentalScore?: number;
  esgSocialScore?: number;
  esgGovernanceScore?: number;
  
  // Timestamps
  lastUpdated?: Date;
  lastRealTimeUpdate?: Date;
  lastDailyUpdate?: Date;
  lastWeeklyUpdate?: Date;
  lastQuarterlyUpdate?: Date;
}

// Safe number parsing with fallback
export function safeParseFloat(value: any, fallback: number = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

// Safe string parsing with fallback
export function safeParseString(value: any, fallback: string = 'N/A'): string {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value).trim() || fallback;
}

// Safe date parsing
export function safeParseDate(value: any): Date | null {
  if (!value) return null;
  try {
    return new Date(value);
  } catch {
    return null;
  }
}

// Format currency with fallback
export function formatCurrencyRobust(value: any, currency: string = '₹'): string {
  const num = safeParseFloat(value);
  if (num === 0) return 'N/A';
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format percentage with fallback
export function formatPercentageRobust(value: any): string {
  const num = safeParseFloat(value);
  if (num === 0) return 'N/A';
  return `${num.toFixed(2)}%`;
}

// Format market cap with appropriate units
export function formatMarketCapRobust(value: any): string {
  const num = safeParseFloat(value);
  if (num === 0) return 'N/A';
  
  if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `₹${(num / 1e6).toFixed(2)}M`;
  return `₹${num.toLocaleString('en-IN')}`;
}

// Format volume with appropriate units
export function formatVolumeRobust(value: any): string {
  const num = safeParseFloat(value);
  if (num === 0) return 'N/A';
  
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString('en-IN');
}

// Get stock display name with fallbacks
export function getStockDisplayName(stock: any): string {
  return safeParseString(stock.longName, 
    safeParseString(stock.name, 
      safeParseString(stock.symbol, 'Unknown Stock')));
}

// Get sector with fallback
export function getSectorRobust(stock: any): string {
  return safeParseString(stock.sector, 'Diversified');
}

// Get industry with fallback
export function getIndustryRobust(stock: any): string {
  return safeParseString(stock.industry, 'Diversified');
}

// Get exchange with fallback
export function getExchangeRobust(stock: any): string {
  return safeParseString(stock.exchange, 'NSE');
}

// Get currency with fallback
export function getCurrencyRobust(stock: any): string {
  return safeParseString(stock.currency, 'INR');
}

// Check if value is available (not null, undefined, empty, or 0)
export function isValueAvailable(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'number') return !isNaN(value) && value !== 0;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

// Get analyst recommendation with fallback
export function getAnalystRecommendationRobust(stock: any): string {
  const recommendation = safeParseString(stock.analystRecommendation, 'N/A');
  if (recommendation === 'N/A') return 'N/A';
  
  // Normalize recommendation text
  const normalized = recommendation.toUpperCase();
  if (normalized.includes('BUY')) return 'BUY';
  if (normalized.includes('SELL')) return 'SELL';
  if (normalized.includes('HOLD') || normalized.includes('NEUTRAL')) return 'HOLD';
  return recommendation;
}

// Get technical indicator with fallback
export function getTechnicalIndicatorRobust(stock: any, indicator: string): number {
  const value = stock[indicator];
  return safeParseFloat(value, 0);
}

// Get financial ratio with fallback
export function getFinancialRatioRobust(stock: any, ratio: string): number {
  const value = stock[ratio];
  return safeParseFloat(value, 0);
}

// Calculate gain/loss with robust data handling
export function calculateGainLossRobust(stock: any): {
  gainLoss: number;
  gainLossPercent: number;
  currentValue: number;
  investedValue: number;
} {
  const currentPrice = safeParseFloat(stock.currentPrice, 0);
  const avgPurchasePrice = safeParseFloat(stock.avgPurchasePrice, 0);
  const quantity = safeParseFloat(stock.quantity, 0);
  
  if (currentPrice === 0 || avgPurchasePrice === 0 || quantity === 0) {
    return {
      gainLoss: 0,
      gainLossPercent: 0,
      currentValue: 0,
      investedValue: 0
    };
  }
  
  const currentValue = currentPrice * quantity;
  const investedValue = avgPurchasePrice * quantity;
  const gainLoss = currentValue - investedValue;
  const gainLossPercent = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;
  
  return {
    gainLoss,
    gainLossPercent,
    currentValue,
    investedValue
  };
}

// Get stock status (market open/closed indicator)
export function getStockStatusRobust(stock: any): {
  isMarketOpen: boolean;
  lastUpdateTime: string;
  dataFreshness: 'real-time' | 'recent' | 'stale' | 'unknown';
} {
  const now = new Date();
  const lastUpdated = safeParseDate(stock.lastUpdated);
  const lastRealTimeUpdate = safeParseDate(stock.lastRealTimeUpdate);
  
  // Check if Indian market is open (09:15 to 15:30 IST, Mon-Fri)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(utc + istOffset);
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const mins = hours * 60 + minutes;
  const isMarketOpen = mins >= 555 && mins <= 930 && ist.getDay() >= 1 && ist.getDay() <= 5;
  
  // Determine data freshness
  let dataFreshness: 'real-time' | 'recent' | 'stale' | 'unknown' = 'unknown';
  if (lastRealTimeUpdate) {
    const diffMinutes = (now.getTime() - lastRealTimeUpdate.getTime()) / (1000 * 60);
    if (diffMinutes <= 5) dataFreshness = 'real-time';
    else if (diffMinutes <= 60) dataFreshness = 'recent';
    else dataFreshness = 'stale';
  } else if (lastUpdated) {
    const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
    if (diffMinutes <= 60) dataFreshness = 'recent';
    else dataFreshness = 'stale';
  }
  
  return {
    isMarketOpen,
    lastUpdateTime: lastUpdated ? lastUpdated.toLocaleString('en-IN') : 'Unknown',
    dataFreshness
  };
}

// Get comprehensive stock overview with all fallbacks
export function getStockOverviewRobust(stock: any): {
  basic: {
    name: string;
    symbol: string;
    sector: string;
    industry: string;
    exchange: string;
    currency: string;
  };
  price: {
    current: string;
    previous: string;
    change: string;
    changePercent: string;
    bid: string;
    ask: string;
  };
  market: {
    marketCap: string;
    volume: string;
    sharesOutstanding: string;
    float: string;
  };
  technical: {
    high52Week: string;
    low52Week: string;
    sma20: string;
    sma50: string;
    rsi: string;
  };
  financial: {
    peRatio: string;
    priceToBook: string;
    priceToSales: string;
    dividendYield: string;
    beta: string;
  };
  analyst: {
    recommendation: string;
    buyCount: string;
    holdCount: string;
    sellCount: string;
    targetPrice: string;
  };
  status: {
    isMarketOpen: boolean;
    lastUpdateTime: string;
    dataFreshness: string;
  };
} {
  const status = getStockStatusRobust(stock);
  
  return {
    basic: {
      name: getStockDisplayName(stock),
      symbol: safeParseString(stock.symbol, 'N/A'),
      sector: getSectorRobust(stock),
      industry: getIndustryRobust(stock),
      exchange: getExchangeRobust(stock),
      currency: getCurrencyRobust(stock),
    },
    price: {
      current: formatCurrencyRobust(stock.currentPrice),
      previous: formatCurrencyRobust(stock.previousClose),
      change: formatCurrencyRobust(stock.dayChange),
      changePercent: formatPercentageRobust(stock.dayChangePercent),
      bid: formatCurrencyRobust(stock.bid),
      ask: formatCurrencyRobust(stock.ask),
    },
    market: {
      marketCap: formatMarketCapRobust(stock.marketCap),
      volume: formatVolumeRobust(stock.volume),
      sharesOutstanding: formatVolumeRobust(stock.sharesOutstanding),
      float: formatVolumeRobust(stock.float),
    },
    technical: {
      high52Week: formatCurrencyRobust(stock.high52Week),
      low52Week: formatCurrencyRobust(stock.low52Week),
      sma20: formatCurrencyRobust(stock.sma20),
      sma50: formatCurrencyRobust(stock.sma50),
      rsi: formatPercentageRobust(stock.rsi),
    },
    financial: {
      peRatio: safeParseFloat(stock.peRatio, 0).toFixed(2),
      priceToBook: safeParseFloat(stock.priceToBook, 0).toFixed(2),
      priceToSales: safeParseFloat(stock.priceToSales, 0).toFixed(2),
      dividendYield: formatPercentageRobust(stock.dividendYield),
      beta: safeParseFloat(stock.beta, 0).toFixed(2),
    },
    analyst: {
      recommendation: getAnalystRecommendationRobust(stock),
      buyCount: safeParseString(stock.analystBuyCount, 'N/A'),
      holdCount: safeParseString(stock.analystHoldCount, 'N/A'),
      sellCount: safeParseString(stock.analystSellCount, 'N/A'),
      targetPrice: formatCurrencyRobust(stock.analystTargetPrice),
    },
    status,
  };
} 