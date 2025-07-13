# Comprehensive Stock Data Refresh System

This document explains the implementation of the comprehensive stock data refresh system that categorizes data by refresh frequency and manages updates automatically.

## 🎯 Overview

The system implements the refresh categorization as specified:

- **🔴 REAL-TIME** (1-5 min): Current price, bid/ask, volume, technical indicators
- **🟡 DAILY** (once per market close): Financial ratios, analyst ratings, market data
- **🟢 WEEKLY** (once per week): Company profile, ESG scores
- **🟢 QUARTERLY** (once per quarter): Earnings, financial statements, institutional holdings

## 📊 Database Schema

### Enhanced Stocks Table

The `stocks` table has been expanded with comprehensive fields:

```sql
-- 🔴 REAL-TIME DATA (1-5 min refresh)
currentPrice, previousClose, dayChange, dayChangePercent, volume
bid, ask

-- 🟡 DAILY DATA (once per market close)
marketCap, sharesOutstanding, float, high52Week, low52Week
sector, industry, exchange, currency, longName, website, hqLocation
employees, ceo

-- Financial Ratios (Daily)
peRatio, priceToBook, priceToSales, evToEbitda, pegRatio, bookValue
dividendYield, dividendRate, nextExDividendDate, splitDate, splitFactor

-- Financial Health (Daily)
revenueGrowth, grossMargin, operatingMargin, netMargin
debtToEquity, currentRatio, quickRatio, returnOnEquity, returnOnAssets, beta

-- 🟢 WEEKLY/MONTHLY/QUARTERLY DATA
description, institutionalPercent, insiderPercent
esgEnvironmentalScore, esgSocialScore, esgGovernanceScore

-- Technical Indicators (computed)
sma20, sma50, rsi, macdLine, macdSignal, macdHistogram, atr

-- Support & Resistance levels
supportLevel1, supportLevel2, resistanceLevel1, resistanceLevel2

-- Analyst Ratings
analystBuyCount, analystHoldCount, analystSellCount
analystTargetPrice, analystRecommendation

-- Timestamps
lastUpdated, lastRealTimeUpdate, lastDailyUpdate, lastWeeklyUpdate, lastQuarterlyUpdate
```

### New Tables

- **`stock_refresh_log`**: Tracks refresh attempts and performance
- **`stock_earnings`**: Stores earnings data and estimates
- **`stock_financials`**: Stores financial statements (income, balance, cash flow)
- **`stock_institutional_holders`**: Stores institutional ownership data

## 🔄 Refresh System Implementation

### Core Functions

#### `refreshRealTimeData(symbol: string)`
- Fetches current price, bid/ask, volume from Yahoo Finance
- Computes technical indicators (SMA, RSI, MACD, ATR)
- Calculates support/resistance levels
- Updates every 1-5 minutes during market hours

#### `refreshDailyData(symbol: string)`
- Fetches market cap, shares outstanding, financial ratios
- Gets analyst ratings and recommendations
- Updates dividend and split information
- Runs once per market close

#### `refreshWeeklyData(symbol: string)`
- Fetches company profile and business summary
- Gets ESG scores and sustainability data
- Updates company information
- Runs once per week

#### `refreshQuarterlyData(symbol: string)`
- Fetches earnings data and estimates
- Gets financial statements (quarterly/annual)
- Updates institutional holdings
- Runs once per quarter

### Market Hours Check

```typescript
function isIndianMarketOpen(): boolean {
  // Indian Market: 09:15 to 15:30 IST, Mon-Fri
  // Returns true if market is currently open
}
```

### Refresh Frequency Logic

```typescript
function needsRefresh(lastUpdate: Date | null, refreshType: RefreshType): boolean {
  // realtime: 5 minutes
  // daily: 24 hours
  // weekly: 7 days
  // quarterly: ~3 months
}
```

## 🚀 API Endpoints

### 1. Manual Refresh
```http
POST /api/stocks/refresh
{
  "symbol": "RELIANCE",
  "refreshType": "realtime"
}
```

### 2. Batch Refresh
```http
POST /api/stocks/refresh
{
  "symbols": ["RELIANCE", "TCS", "INFY"],
  "refreshType": "daily"
}
```

### 3. Cron Job Scheduler
```http
POST /api/cron/refresh-scheduler
Authorization: Bearer your-cron-secret
{
  "schedule": "realtime"
}
```

### 4. Refresh Statistics
```http
GET /api/cron/refresh-scheduler?schedule=realtime
```

## ⚙️ Configuration

### Environment Variables

```env
# Yahoo Finance API (no key required)
YAHOO_QUOTE_API=https://query1.finance.yahoo.com/v7/finance/quote
YAHOO_CHART_API=https://query1.finance.yahoo.com/v8/finance/chart
YAHOO_SUMMARY_API=https://query1.finance.yahoo.com/v10/finance/quoteSummary

# Alpha Vantage API (optional, for enhanced data)
ALPHA_VANTAGE_API_KEY=your-api-key

# Cron job authentication
CRON_SECRET=your-cron-secret
```

### Cron Job Setup

Set up cron jobs to automatically run the refresh schedules:

```bash
# Real-time refresh (every 5 minutes during market hours)
*/5 9-15 * * 1-5 curl -X POST https://your-domain.com/api/cron/refresh-scheduler \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{"schedule": "realtime"}'

# Daily refresh (once per day at market close)
0 16 * * 1-5 curl -X POST https://your-domain.com/api/cron/refresh-scheduler \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{"schedule": "daily"}'

# Weekly refresh (every Sunday at 6 AM)
0 6 * * 0 curl -X POST https://your-domain.com/api/cron/refresh-scheduler \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{"schedule": "weekly"}'

# Quarterly refresh (first day of each quarter at 6 AM)
0 6 1 1,4,7,10 * curl -X POST https://your-domain.com/api/cron/refresh-scheduler \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{"schedule": "quarterly"}'
```

## 📈 Usage Examples

### 1. Manual Stock Refresh

```typescript
import { refreshStockData } from '@/lib/stock-refresh-system';

// Refresh real-time data for a single stock
const success = await refreshStockData('RELIANCE', 'realtime');

// Refresh daily data for multiple stocks
const results = await refreshMultipleStocks(['RELIANCE', 'TCS'], 'daily');
```

### 2. Portfolio Auto-Refresh

```typescript
// In your portfolio component
useEffect(() => {
  if (portfolio.length === 0) return;
  
  const updateAllStocks = async () => {
    try {
      await fetch('/api/stocks/update-all', { method: 'POST' });
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Auto-refresh failed:', e);
    }
  };
  
  updateAllStocks();
  const interval = setInterval(updateAllStocks, 5 * 60 * 1000); // 5 minutes
  return () => clearInterval(interval);
}, [portfolio.length]);
```

### 3. Refresh Monitoring

```typescript
// Check refresh statistics
const response = await fetch('/api/cron/refresh-scheduler?schedule=realtime');
const stats = await response.json();

console.log(`Success rate: ${stats.last24Hours.successRate}%`);
console.log(`Market status: ${stats.marketStatus}`);
```

## 🔧 Migration

Run the migration script to add all new fields to your existing database:

```bash
# Run the migration
npx tsx scripts/migrate-stock-schema.ts
```

This will:
- Add all new columns to the `stocks` table
- Create new tables for earnings, financials, and institutional holders
- Add indexes for optimal performance
- Add refresh logging capabilities

## 📊 Monitoring & Logging

### Refresh Logs

The system automatically logs all refresh attempts:

```sql
SELECT * FROM stock_refresh_log 
WHERE refresh_type = 'realtime' 
AND created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Performance Metrics

- **Success Rate**: Percentage of successful refreshes
- **Response Time**: Average API response time
- **Error Tracking**: Failed refresh attempts with error messages
- **Market Status**: Whether market is open/closed

### Dashboard Integration

```typescript
// Get refresh statistics for dashboard
const getRefreshStats = async () => {
  const response = await fetch('/api/cron/refresh-scheduler?schedule=realtime');
  return response.json();
};
```

## 🚨 Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Graceful fallback to alternative data sources
2. **Rate Limiting**: Automatic delays between requests
3. **Market Hours**: Skips real-time updates when market is closed
4. **Database Errors**: Logs errors without crashing the system
5. **Network Issues**: Retry logic for failed requests

## 🔒 Security

- **Cron Authentication**: Uses Bearer token for cron job security
- **Rate Limiting**: Built-in delays to prevent API abuse
- **Error Logging**: No sensitive data in error messages
- **Input Validation**: All inputs are validated before processing

## 📋 Best Practices

1. **Monitor Performance**: Check refresh logs regularly
2. **Adjust Frequencies**: Modify refresh intervals based on your needs
3. **Handle Errors**: Implement proper error handling in your UI
4. **Cache Data**: Use cached data when APIs are unavailable
5. **Test Thoroughly**: Test all refresh types before production

## 🎯 Next Steps

1. Run the migration script to update your database
2. Set up cron jobs for automatic refresh
3. Update your UI to use the new comprehensive data fields
4. Monitor refresh performance and adjust as needed
5. Consider adding more data sources for enhanced reliability

This comprehensive refresh system provides a robust foundation for real-time stock data management with proper categorization and frequency management as specified in your requirements. 