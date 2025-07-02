# TradingView Chart Fix

## Problem
The TradingView charts in the portfolio popup were not displaying because stock symbols were being stored with exchange suffixes (e.g., `TCS.BSE`) and the chart component was hardcoded to use `NASDAQ:` prefix for all symbols.

## Solution
1. **Created TradingView utility functions** (`src/lib/trading-view-utils.ts`):
   - `formatSymbolForTradingView()` - Converts stock symbols to proper TradingView format
   - `cleanSymbol()` - Removes exchange suffixes from symbols
   - `extractExchangeFromSymbol()` - Extracts exchange info from symbol suffixes

2. **Updated Chart component** (`src/components/stock-chart/Chart.tsx`):
   - Added import for `formatSymbolForTradingView`
   - Updated TradingView iframe URL to use proper symbol formatting
   - Now correctly maps symbols like `TCS.BSE` to `BSE:TCS` for TradingView

3. **Updated stock storage** (`src/app/api/stocks/[symbol]/route.ts`):
   - Clean symbols are now stored without exchange suffixes
   - Exchange information is extracted and stored in the exchange field
   - This prevents future issues with symbol formatting

4. **Updated portfolio data flow**:
   - Portfolio API now includes exchange information
   - PortfolioTable passes exchange data to chart components

## Exchange Mapping
The utility correctly maps exchange suffixes to TradingView prefixes:
- `.BSE` or `.BO` → `BSE:` (Bombay Stock Exchange)
- `.NS` or `.NSE` → `NSE:` (National Stock Exchange)
- No suffix for Indian stocks → defaults to `NSE:`
- US stocks → defaults to `NASDAQ:`

## Migration
If you have existing data with exchange suffixes, run the cleanup script:
```bash
npx ts-node scripts/clean-stock-symbols.ts
```

## Result
TradingView charts now display correctly for all stock symbols, regardless of their original format or exchange.
