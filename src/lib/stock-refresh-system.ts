// Comprehensive Stock Data Refresh System
// Implements the refresh categorization and frequency management

import { db } from '@/lib/db';
import { stocks, stockRefreshLog, stockEarnings, stockFinancials, stockInstitutionalHolders } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// API Configuration
const YAHOO_QUOTE_API = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YAHOO_CHART_API = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_SUMMARY_API = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary';
const YAHOO_SEARCH_API = 'https://query1.finance.yahoo.com/v1/finance/search';
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

// Refresh Types
export type RefreshType = 'realtime' | 'daily' | 'weekly' | 'quarterly';

// Market Hours Check (Indian Market: 09:15 to 15:30 IST, Mon-Fri)
export function isIndianMarketOpen(): boolean {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(utc + istOffset);
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const mins = hours * 60 + minutes;
  return mins >= 555 && mins <= 930 && ist.getDay() >= 1 && ist.getDay() <= 5;
}

// Helper: Check if refresh is needed based on last update time
function needsRefresh(lastUpdate: Date | null, refreshType: RefreshType): boolean {
  if (!lastUpdate) return true;
  
  const now = new Date();
  const diffMs = now.getTime() - lastUpdate.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  switch (refreshType) {
    case 'realtime': return diffMinutes >= 5; // 5 minutes
    case 'daily': return diffMinutes >= 1440; // 24 hours
    case 'weekly': return diffMinutes >= 10080; // 7 days
    case 'quarterly': return diffMinutes >= 131400; // ~3 months
    default: return false;
  }
}

// Helper: Log refresh attempt
async function logRefreshAttempt(
  stockId: number, 
  refreshType: RefreshType, 
  status: 'success' | 'failed' | 'partial',
  dataUpdated?: string[],
  errorMessage?: string,
  apiEndpoint?: string,
  responseTime?: number
) {
  try {
    await db.insert(stockRefreshLog).values({
      stockId,
      refreshType,
      status,
      dataUpdated: dataUpdated ? JSON.stringify(dataUpdated) : null,
      errorMessage,
      apiEndpoint,
      responseTime,
    });
  } catch (error) {
    console.error('Failed to log refresh attempt:', error);
  }
}

// 🔴 REAL-TIME DATA REFRESH (1-5 min)
export async function refreshRealTimeData(symbol: string): Promise<boolean> {
  const startTime = Date.now();
  const stock = await db.select().from(stocks).where(eq(stocks.symbol, symbol)).limit(1);
  
  if (stock.length === 0) {
    await logRefreshAttempt(0, 'realtime', 'failed', [], 'Stock not found in database');
    return false;
  }
  
  const stockId = stock[0].id;
  
  try {
    // 1. Current Price, Bid, Ask, Previous Close
    const quoteResponse = await fetch(`${YAHOO_QUOTE_API}?symbols=${symbol}`);
    const quoteData = await quoteResponse.json();
    
    if (!quoteData.quoteSummary?.result?.[0]) {
      throw new Error('No quote data available');
    }
    
    const quote = quoteData.quoteSummary.result[0];
    const updatedFields: string[] = [];
    
    const updateData: any = {};
    
    if (quote.regularMarketPrice) {
      updateData.currentPrice = quote.regularMarketPrice.toString();
      updatedFields.push('currentPrice');
    }
    
    if (quote.regularMarketPreviousClose) {
      updateData.previousClose = quote.regularMarketPreviousClose.toString();
      updatedFields.push('previousClose');
    }
    
    if (quote.regularMarketPrice && quote.regularMarketPreviousClose) {
      const change = quote.regularMarketPrice - quote.regularMarketPreviousClose;
      const changePercent = (change / quote.regularMarketPreviousClose) * 100;
      updateData.dayChange = change.toString();
      updateData.dayChangePercent = changePercent.toString();
      updatedFields.push('dayChange', 'dayChangePercent');
    }
    
    if (quote.regularMarketVolume) {
      updateData.volume = quote.regularMarketVolume;
      updatedFields.push('volume');
    }
    
    if (quote.bid) {
      updateData.bid = quote.bid.toString();
      updatedFields.push('bid');
    }
    
    if (quote.ask) {
      updateData.ask = quote.ask.toString();
      updatedFields.push('ask');
    }
    
    // 2. Intraday OHLC (1 min bars)
    const chartResponse = await fetch(`${YAHOO_CHART_API}/${symbol}?range=1d&interval=1m`);
    const chartData = await chartResponse.json();
    
    if (chartData.chart?.result?.[0]) {
      const result = chartData.chart.result[0];
      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0] || {};
      
      if (quotes.close && quotes.close.length > 0) {
        const latestClose = quotes.close[quotes.close.length - 1];
        if (latestClose && latestClose !== updateData.currentPrice) {
          updateData.currentPrice = latestClose.toString();
          updatedFields.push('currentPrice');
        }
      }
    }
    
    // 3. Compute technical indicators from chart data
    if (chartData.chart?.result?.[0]) {
      const technicalData = await computeTechnicalIndicators(chartData.chart.result[0]);
      Object.assign(updateData, technicalData);
      updatedFields.push(...Object.keys(technicalData));
    }
    
    // Update database
    if (Object.keys(updateData).length > 0) {
      updateData.lastRealTimeUpdate = new Date();
      updateData.lastUpdated = new Date();
      
      await db.update(stocks)
        .set(updateData)
        .where(eq(stocks.id, stockId));
      
      const responseTime = Date.now() - startTime;
      await logRefreshAttempt(stockId, 'realtime', 'success', updatedFields, undefined, YAHOO_QUOTE_API, responseTime);
      return true;
    }
    
    await logRefreshAttempt(stockId, 'realtime', 'partial', updatedFields);
    return false;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logRefreshAttempt(stockId, 'realtime', 'failed', [], error.message, YAHOO_QUOTE_API, responseTime);
    console.error(`Real-time refresh failed for ${symbol}:`, error);
    return false;
  }
}

// 🟡 DAILY DATA REFRESH (once per market close)
export async function refreshDailyData(symbol: string): Promise<boolean> {
  const startTime = Date.now();
  const stock = await db.select().from(stocks).where(eq(stocks.symbol, symbol)).limit(1);
  
  if (stock.length === 0) {
    await logRefreshAttempt(0, 'daily', 'failed', [], 'Stock not found in database');
    return false;
  }
  
  const stockId = stock[0].id;
  
  try {
    const updatedFields: string[] = [];
    const updateData: any = {};
    
    // 1. Market Cap, Shares Outstanding, Float, Currency, Exchange
    const quoteResponse = await fetch(`${YAHOO_QUOTE_API}?symbols=${symbol}`);
    const quoteData = await quoteResponse.json();
    
    if (quoteData.quoteSummary?.result?.[0]) {
      const quote = quoteData.quoteSummary.result[0];
      
      if (quote.marketCap) {
        updateData.marketCap = quote.marketCap;
        updatedFields.push('marketCap');
      }
      
      if (quote.sharesOutstanding) {
        updateData.sharesOutstanding = quote.sharesOutstanding;
        updatedFields.push('sharesOutstanding');
      }
      
      if (quote.currency) {
        updateData.currency = quote.currency;
        updatedFields.push('currency');
      }
      
      if (quote.exchange) {
        updateData.exchange = quote.exchange;
        updatedFields.push('exchange');
      }
    }
    
    // 2. Sector, Industry, Full Company Name, Long Exchange Name
    const summaryResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=price,summaryDetail`);
    const summaryData = await summaryResponse.json();
    
    if (summaryData.quoteSummary?.result?.[0]) {
      const summary = summaryData.quoteSummary.result[0];
      
      if (summary.price?.longName) {
        updateData.longName = summary.price.longName;
        updatedFields.push('longName');
      }
      
      if (summary.summaryDetail?.sector) {
        updateData.sector = summary.summaryDetail.sector;
        updatedFields.push('sector');
      }
      
      if (summary.summaryDetail?.industry) {
        updateData.industry = summary.summaryDetail.industry;
        updatedFields.push('industry');
      }
    }
    
    // 3. P/E, P/B, P/S, EV/EBITDA, PEG, Book Value, Dividend Yield
    const statsResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=defaultKeyStatistics,summaryDetail`);
    const statsData = await statsResponse.json();
    
    if (statsData.quoteSummary?.result?.[0]) {
      const stats = statsData.quoteSummary.result[0];
      
      if (stats.defaultKeyStatistics?.trailingPE) {
        updateData.peRatio = stats.defaultKeyStatistics.trailingPE.toString();
        updatedFields.push('peRatio');
      }
      
      if (stats.defaultKeyStatistics?.priceToBook) {
        updateData.priceToBook = stats.defaultKeyStatistics.priceToBook.toString();
        updatedFields.push('priceToBook');
      }
      
      if (stats.defaultKeyStatistics?.priceToSalesTrailing12Months) {
        updateData.priceToSales = stats.defaultKeyStatistics.priceToSalesTrailing12Months.toString();
        updatedFields.push('priceToSales');
      }
      
      if (stats.defaultKeyStatistics?.enterpriseToEbitda) {
        updateData.evToEbitda = stats.defaultKeyStatistics.enterpriseToEbitda.toString();
        updatedFields.push('evToEbitda');
      }
      
      if (stats.defaultKeyStatistics?.pegRatio) {
        updateData.pegRatio = stats.defaultKeyStatistics.pegRatio.toString();
        updatedFields.push('pegRatio');
      }
      
      if (stats.defaultKeyStatistics?.bookValue) {
        updateData.bookValue = stats.defaultKeyStatistics.bookValue.toString();
        updatedFields.push('bookValue');
      }
      
      if (stats.summaryDetail?.dividendYield) {
        updateData.dividendYield = stats.summaryDetail.dividendYield.toString();
        updatedFields.push('dividendYield');
      }
      
      if (stats.summaryDetail?.dividendRate) {
        updateData.dividendRate = stats.summaryDetail.dividendRate.toString();
        updatedFields.push('dividendRate');
      }
    }
    
    // 4. Financial Health Data
    const financialResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=financialData`);
    const financialData = await financialResponse.json();
    
    if (financialData.quoteSummary?.result?.[0]?.financialData) {
      const financial = financialData.quoteSummary.result[0].financialData;
      
      if (financial.revenueGrowth?.raw) {
        updateData.revenueGrowth = financial.revenueGrowth.raw.toString();
        updatedFields.push('revenueGrowth');
      }
      
      if (financial.grossMargins?.raw) {
        updateData.grossMargin = financial.grossMargins.raw.toString();
        updatedFields.push('grossMargin');
      }
      
      if (financial.operatingMargins?.raw) {
        updateData.operatingMargin = financial.operatingMargins.raw.toString();
        updatedFields.push('operatingMargin');
      }
      
      if (financial.netMargins?.raw) {
        updateData.netMargin = financial.netMargins.raw.toString();
        updatedFields.push('netMargin');
      }
      
      if (financial.debtToEquity?.raw) {
        updateData.debtToEquity = financial.debtToEquity.raw.toString();
        updatedFields.push('debtToEquity');
      }
      
      if (financial.currentRatio?.raw) {
        updateData.currentRatio = financial.currentRatio.raw.toString();
        updatedFields.push('currentRatio');
      }
      
      if (financial.returnOnEquity?.raw) {
        updateData.returnOnEquity = financial.returnOnEquity.raw.toString();
        updatedFields.push('returnOnEquity');
      }
      
      if (financial.returnOnAssets?.raw) {
        updateData.returnOnAssets = financial.returnOnAssets.raw.toString();
        updatedFields.push('returnOnAssets');
      }
      
      if (financial.beta?.raw) {
        updateData.beta = financial.beta.raw.toString();
        updatedFields.push('beta');
      }
    }
    
    // 5. Calendar Events (Dividends, Splits)
    const calendarResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=calendarEvents`);
    const calendarData = await calendarResponse.json();
    
    if (calendarData.quoteSummary?.result?.[0]?.calendarEvents) {
      const calendar = calendarData.quoteSummary.result[0].calendarEvents;
      
      if (calendar.dividendDate) {
        updateData.nextExDividendDate = new Date(calendar.dividendDate * 1000);
        updatedFields.push('nextExDividendDate');
      }
      
      if (calendar.exDividendDate) {
        updateData.nextExDividendDate = new Date(calendar.exDividendDate * 1000);
        updatedFields.push('nextExDividendDate');
      }
    }
    
    // 6. Analyst Ratings
    const recommendationResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=recommendationTrend`);
    const recommendationData = await recommendationResponse.json();
    
    if (recommendationData.quoteSummary?.result?.[0]?.recommendationTrend) {
      const recommendation = recommendationData.quoteSummary.result[0].recommendationTrend;
      
      if (recommendation.trend?.[0]) {
        const trend = recommendation.trend[0];
        updateData.analystBuyCount = trend.buy || 0;
        updateData.analystHoldCount = trend.hold || 0;
        updateData.analystSellCount = trend.sell || 0;
        updateData.analystRecommendation = trend.period || 'unknown';
        updatedFields.push('analystBuyCount', 'analystHoldCount', 'analystSellCount', 'analystRecommendation');
      }
    }
    
    // 7. Daily OHLC & Volume history (1 month)
    const chartResponse = await fetch(`${YAHOO_CHART_API}/${symbol}?range=1mo&interval=1d`);
    const chartData = await chartResponse.json();
    
    if (chartData.chart?.result?.[0]) {
      const result = chartData.chart.result[0];
      const meta = result.meta;
      
      if (meta.fiftyTwoWeekHigh) {
        updateData.high52Week = meta.fiftyTwoWeekHigh.toString();
        updatedFields.push('high52Week');
      }
      
      if (meta.fiftyTwoWeekLow) {
        updateData.low52Week = meta.fiftyTwoWeekLow.toString();
        updatedFields.push('low52Week');
      }
    }
    
    // Update database
    if (Object.keys(updateData).length > 0) {
      updateData.lastDailyUpdate = new Date();
      updateData.lastUpdated = new Date();
      
      await db.update(stocks)
        .set(updateData)
        .where(eq(stocks.id, stockId));
      
      const responseTime = Date.now() - startTime;
      await logRefreshAttempt(stockId, 'daily', 'success', updatedFields, undefined, YAHOO_SUMMARY_API, responseTime);
      return true;
    }
    
    await logRefreshAttempt(stockId, 'daily', 'partial', updatedFields);
    return false;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logRefreshAttempt(stockId, 'daily', 'failed', [], error.message, YAHOO_SUMMARY_API, responseTime);
    console.error(`Daily refresh failed for ${symbol}:`, error);
    return false;
  }
}

// 🟢 WEEKLY/MONTHLY/QUARTERLY DATA REFRESH
export async function refreshWeeklyData(symbol: string): Promise<boolean> {
  const startTime = Date.now();
  const stock = await db.select().from(stocks).where(eq(stocks.symbol, symbol)).limit(1);
  
  if (stock.length === 0) {
    await logRefreshAttempt(0, 'weekly', 'failed', [], 'Stock not found in database');
    return false;
  }
  
  const stockId = stock[0].id;
  
  try {
    const updatedFields: string[] = [];
    const updateData: any = {};
    
    // 1. Long business summary, Website, HQ Location, Full-time employees, CEO
    const profileResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=assetProfile`);
    const profileData = await profileResponse.json();
    
    if (profileData.quoteSummary?.result?.[0]?.assetProfile) {
      const profile = profileData.quoteSummary.result[0].assetProfile;
      
      if (profile.longBusinessSummary) {
        updateData.description = profile.longBusinessSummary;
        updatedFields.push('description');
      }
      
      if (profile.website) {
        updateData.website = profile.website;
        updatedFields.push('website');
      }
      
      if (profile.city && profile.state) {
        updateData.hqLocation = `${profile.city}, ${profile.state}`;
        updatedFields.push('hqLocation');
      }
      
      if (profile.fullTimeEmployees) {
        updateData.employees = profile.fullTimeEmployees;
        updatedFields.push('employees');
      }
      
      if (profile.companyOfficers?.[0]?.name) {
        updateData.ceo = profile.companyOfficers[0].name;
        updatedFields.push('ceo');
      }
    }
    
    // 2. ESG Scores
    const esgResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=esgScores`);
    const esgData = await esgResponse.json();
    
    if (esgData.quoteSummary?.result?.[0]?.esgScores) {
      const esg = esgData.quoteSummary.result[0].esgScores;
      
      if (esg.environmentalScore) {
        updateData.esgEnvironmentalScore = esg.environmentalScore;
        updatedFields.push('esgEnvironmentalScore');
      }
      
      if (esg.socialScore) {
        updateData.esgSocialScore = esg.socialScore;
        updatedFields.push('esgSocialScore');
      }
      
      if (esg.governanceScore) {
        updateData.esgGovernanceScore = esg.governanceScore;
        updatedFields.push('esgGovernanceScore');
      }
    }
    
    // Update database
    if (Object.keys(updateData).length > 0) {
      updateData.lastWeeklyUpdate = new Date();
      updateData.lastUpdated = new Date();
      
      await db.update(stocks)
        .set(updateData)
        .where(eq(stocks.id, stockId));
      
      const responseTime = Date.now() - startTime;
      await logRefreshAttempt(stockId, 'weekly', 'success', updatedFields, undefined, YAHOO_SUMMARY_API, responseTime);
      return true;
    }
    
    await logRefreshAttempt(stockId, 'weekly', 'partial', updatedFields);
    return false;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logRefreshAttempt(stockId, 'weekly', 'failed', [], error.message, YAHOO_SUMMARY_API, responseTime);
    console.error(`Weekly refresh failed for ${symbol}:`, error);
    return false;
  }
}

// 🟢 QUARTERLY DATA REFRESH
export async function refreshQuarterlyData(symbol: string): Promise<boolean> {
  const startTime = Date.now();
  const stock = await db.select().from(stocks).where(eq(stocks.symbol, symbol)).limit(1);
  
  if (stock.length === 0) {
    await logRefreshAttempt(0, 'quarterly', 'failed', [], 'Stock not found in database');
    return false;
  }
  
  const stockId = stock[0].id;
  
  try {
    // 1. Earnings data
    const earningsResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=earnings,earningsHistory`);
    const earningsData = await earningsResponse.json();
    
    if (earningsData.quoteSummary?.result?.[0]) {
      const earnings = earningsData.quoteSummary.result[0];
      
      // Clear existing earnings data
      await db.delete(stockEarnings).where(eq(stockEarnings.stockId, stockId));
      
      // Insert new earnings data
      if (earnings.earnings?.earningsChart?.quarterly) {
        for (const earning of earnings.earnings.earningsChart.quarterly) {
          await db.insert(stockEarnings).values({
            stockId,
            earningsDate: new Date(earning.date * 1000),
            estimate: earning.estimate?.raw || null,
            actual: earning.actual?.raw || null,
            surprise: earning.surprise?.raw || null,
            surprisePercent: earning.surprisePercent?.raw || null,
            period: earning.period || null,
            year: new Date(earning.date * 1000).getFullYear(),
          });
        }
      }
    }
    
    // 2. Financial statements
    const financialsResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=incomeStatementHistoryQuarterly,balanceSheetHistoryQuarterly,cashflowStatementHistoryQuarterly`);
    const financialsData = await financialsResponse.json();
    
    if (financialsData.quoteSummary?.result?.[0]) {
      const financials = financialsData.quoteSummary.result[0];
      
      // Clear existing financial data
      await db.delete(stockFinancials).where(eq(stockFinancials.stockId, stockId));
      
      // Insert income statement
      if (financials.incomeStatementHistoryQuarterly?.incomeStatementHistory) {
        for (const statement of financials.incomeStatementHistoryQuarterly.incomeStatementHistory) {
          await db.insert(stockFinancials).values({
            stockId,
            statementType: 'income',
            period: 'quarterly',
            date: new Date(statement.endDate.raw),
            data: JSON.stringify(statement),
          });
        }
      }
      
      // Insert balance sheet
      if (financials.balanceSheetHistoryQuarterly?.balanceSheetStatements) {
        for (const statement of financials.balanceSheetHistoryQuarterly.balanceSheetStatements) {
          await db.insert(stockFinancials).values({
            stockId,
            statementType: 'balance',
            period: 'quarterly',
            date: new Date(statement.endDate.raw),
            data: JSON.stringify(statement),
          });
        }
      }
      
      // Insert cash flow
      if (financials.cashflowStatementHistoryQuarterly?.cashflowStatements) {
        for (const statement of financials.cashflowStatementHistoryQuarterly.cashflowStatements) {
          await db.insert(stockFinancials).values({
            stockId,
            statementType: 'cashflow',
            period: 'quarterly',
            date: new Date(statement.endDate.raw),
            data: JSON.stringify(statement),
          });
        }
      }
    }
    
    // 3. Institutional holders
    const holdersResponse = await fetch(`${YAHOO_SUMMARY_API}/${symbol}?modules=majorHoldersBreakdown`);
    const holdersData = await holdersResponse.json();
    
    if (holdersData.quoteSummary?.result?.[0]?.majorHoldersBreakdown) {
      const holders = holdersData.quoteSummary.result[0].majorHoldersBreakdown;
      
      // Clear existing holders data
      await db.delete(stockInstitutionalHolders).where(eq(stockInstitutionalHolders.stockId, stockId));
      
      // Insert institutional holders
      if (holders.ownershipList) {
        for (const holder of holders.ownershipList) {
          await db.insert(stockInstitutionalHolders).values({
            stockId,
            holderName: holder.organization || 'Unknown',
            shares: holder.raw || null,
            percentHeld: holder.raw ? (holder.raw / 100) : null,
            value: holder.raw ? (holder.raw * (stock[0].currentPrice || 0)) : null,
            reportDate: new Date(),
          });
        }
      }
    }
    
    // Update stock with institutional percentages
    const updateData: any = {};
    const updatedFields: string[] = [];
    
    if (holdersData.quoteSummary?.result?.[0]?.majorHoldersBreakdown) {
      const holders = holdersData.quoteSummary.result[0].majorHoldersBreakdown;
      
      if (holders.insidersPercentHeld?.raw) {
        updateData.insiderPercent = holders.insidersPercentHeld.raw;
        updatedFields.push('insiderPercent');
      }
      
      if (holders.institutionsPercentHeld?.raw) {
        updateData.institutionalPercent = holders.institutionsPercentHeld.raw;
        updatedFields.push('institutionalPercent');
      }
    }
    
    // Update database
    if (Object.keys(updateData).length > 0) {
      updateData.lastQuarterlyUpdate = new Date();
      updateData.lastUpdated = new Date();
      
      await db.update(stocks)
        .set(updateData)
        .where(eq(stocks.id, stockId));
    }
    
    const responseTime = Date.now() - startTime;
    await logRefreshAttempt(stockId, 'quarterly', 'success', updatedFields, undefined, YAHOO_SUMMARY_API, responseTime);
    return true;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logRefreshAttempt(stockId, 'quarterly', 'failed', [], error.message, YAHOO_SUMMARY_API, responseTime);
    console.error(`Quarterly refresh failed for ${symbol}:`, error);
    return false;
  }
}

// Technical Indicators Computation
async function computeTechnicalIndicators(chartResult: any): Promise<any> {
  const timestamps = chartResult.timestamp || [];
  const quotes = chartResult.indicators?.quote?.[0] || {};
  const closes = quotes.close || [];
  
  if (closes.length < 20) return {};
  
  const updateData: any = {};
  
  // SMA 20
  if (closes.length >= 20) {
    const sma20 = closes.slice(-20).reduce((sum: number, price: number) => sum + price, 0) / 20;
    updateData.sma20 = sma20.toString();
  }
  
  // SMA 50
  if (closes.length >= 50) {
    const sma50 = closes.slice(-50).reduce((sum: number, price: number) => sum + price, 0) / 50;
    updateData.sma50 = sma50.toString();
  }
  
  // RSI (14-period)
  if (closes.length >= 14) {
    const rsi = calculateRSI(closes, 14);
    updateData.rsi = rsi.toString();
  }
  
  // MACD
  if (closes.length >= 26) {
    const macd = calculateMACD(closes);
    updateData.macdLine = macd.macdLine.toString();
    updateData.macdSignal = macd.signalLine.toString();
    updateData.macdHistogram = macd.histogram.toString();
  }
  
  // ATR (14-period)
  if (closes.length >= 14) {
    const atr = calculateATR(chartResult, 14);
    updateData.atr = atr.toString();
  }
  
  // Support & Resistance levels
  const levels = calculateSupportResistance(closes);
  updateData.supportLevel1 = levels.support1.toString();
  updateData.supportLevel2 = levels.support2.toString();
  updateData.resistanceLevel1 = levels.resistance1.toString();
  updateData.resistanceLevel2 = levels.resistance2.toString();
  
  return updateData;
}

// Helper functions for technical indicators
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macdLine: number; signalLine: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  const signalLine = calculateEMA([...Array(26).fill(0), macdLine], 9);
  const histogram = macdLine - signalLine;
  
  return { macdLine, signalLine, histogram };
}

function calculateEMA(prices: number[], period: number): number {
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

function calculateATR(chartResult: any, period: number = 14): number {
  const highs = chartResult.indicators?.quote?.[0]?.high || [];
  const lows = chartResult.indicators?.quote?.[0]?.low || [];
  const closes = chartResult.indicators?.quote?.[0]?.close || [];
  
  if (highs.length < period) return 0;
  
  let atr = 0;
  for (let i = 1; i < period; i++) {
    const high = highs[i];
    const low = lows[i];
    const prevClose = closes[i - 1];
    
    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);
    
    atr += Math.max(tr1, tr2, tr3);
  }
  
  return atr / period;
}

function calculateSupportResistance(prices: number[]): { support1: number; support2: number; resistance1: number; resistance2: number } {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  
  return {
    support1: min + range * 0.1,
    support2: min + range * 0.2,
    resistance1: max - range * 0.1,
    resistance2: max - range * 0.2,
  };
}

// Main refresh orchestrator
export async function refreshStockData(symbol: string, refreshType: RefreshType = 'realtime'): Promise<boolean> {
  const stock = await db.select().from(stocks).where(eq(stocks.symbol, symbol)).limit(1);
  
  if (stock.length === 0) {
    console.error(`Stock ${symbol} not found in database`);
    return false;
  }
  
  // Check if refresh is needed
  const lastUpdateField = `last${refreshType.charAt(0).toUpperCase() + refreshType.slice(1)}Update`;
  const lastUpdate = stock[0][lastUpdateField as keyof typeof stock[0]] as Date | null;
  
  if (!needsRefresh(lastUpdate, refreshType)) {
    console.log(`Skipping ${refreshType} refresh for ${symbol} - too recent`);
    return true;
  }
  
  // Check market hours for real-time updates
  if (refreshType === 'realtime' && !isIndianMarketOpen()) {
    console.log(`Skipping real-time refresh for ${symbol} - market closed`);
    return true;
  }
  
  switch (refreshType) {
    case 'realtime':
      return await refreshRealTimeData(symbol);
    case 'daily':
      return await refreshDailyData(symbol);
    case 'weekly':
      return await refreshWeeklyData(symbol);
    case 'quarterly':
      return await refreshQuarterlyData(symbol);
    default:
      console.error(`Unknown refresh type: ${refreshType}`);
      return false;
  }
}

// Batch refresh for multiple stocks
export async function refreshMultipleStocks(symbols: string[], refreshType: RefreshType = 'realtime'): Promise<{
  successful: string[];
  failed: string[];
  total: number;
}> {
  const results = {
    successful: [] as string[],
    failed: [] as string[],
    total: symbols.length,
  };
  
  console.log(`Starting ${refreshType} refresh for ${symbols.length} stocks...`);
  
  for (const symbol of symbols) {
    try {
      const success = await refreshStockData(symbol, refreshType);
      if (success) {
        results.successful.push(symbol);
      } else {
        results.failed.push(symbol);
      }
    } catch (error) {
      console.error(`Error refreshing ${symbol}:`, error);
      results.failed.push(symbol);
    }
    
    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`${refreshType} refresh complete: ${results.successful.length} successful, ${results.failed.length} failed`);
  return results;
} 