// src/lib/trading-view-utils.ts

/**
 * Maps stock symbols to TradingView compatible format
 * This handles different exchanges and their prefixes for TradingView
 */

interface Stock {
  symbol: string;
  exchange?: string;
}

/**
 * Converts a stock symbol to TradingView format
 * @param stock - Stock object with symbol and optional exchange
 * @returns TradingView compatible symbol string
 */
export function formatSymbolForTradingView(stock: Stock): string {
  let symbol = stock.symbol;
  let exchange = stock.exchange?.toUpperCase();

  // Remove exchange suffix from symbol if present
  if (symbol.includes('.')) {
    const parts = symbol.split('.');
    symbol = parts[0];
    
    // If no exchange is provided, try to determine from suffix
    if (!exchange) {
      const suffix = parts[1];
      switch (suffix) {
        case 'BSE':
          exchange = 'BSE';
          break;
        case 'NS':
        case 'NSE':
          exchange = 'NSE';
          break;
        case 'BO':
          exchange = 'BSE';
          break;
        default:
          exchange = 'NSE'; // Default to NSE for Indian stocks
          break;
      }
    }
  }

  // Map exchange to TradingView format
  switch (exchange) {
    case 'BSE':
      return `BSE:${symbol}`;
    case 'NSE':
      return `NSE:${symbol}`;
    case 'NASDAQ':
      return `NASDAQ:${symbol}`;
    case 'NYSE':
      return `NYSE:${symbol}`;
    case 'AMEX':
      return `AMEX:${symbol}`;
    case 'LSE':
      return `LSE:${symbol}`;
    case 'TSE':
      return `TSE:${symbol}`;
    case 'HKEX':
      return `HKEX:${symbol}`;
    case 'SSE':
      return `SSE:${symbol}`;
    case 'SZSE':
      return `SZSE:${symbol}`;
    default:
      // For Indian stocks without clear exchange, try NSE first
      if (isIndianStock(symbol)) {
        return `NSE:${symbol}`;
      }
      // For US stocks without clear exchange, default to NASDAQ
      return `NASDAQ:${symbol}`;
  }
}

/**
 * Determines if a stock is likely an Indian stock based on symbol patterns
 * @param symbol - Stock symbol
 * @returns boolean indicating if it's likely an Indian stock
 */
function isIndianStock(symbol: string): boolean {
  // Common Indian stock patterns
  const indianPatterns = [
    /^[A-Z]{2,}$/, // Most Indian stocks are all caps, 2+ letters
    /^[A-Z]+\d*$/, // Some have numbers at the end
  ];
  
  // Common Indian stock symbols
  const commonIndianStocks = [
    'TCS', 'INFY', 'RELIANCE', 'HDFC', 'ICICIBANK', 'SBIN', 'BHARTIARTL',
    'ITC', 'KOTAKBANK', 'LT', 'HDFCBANK', 'ASIANPAINT', 'MARUTI', 'BAJFINANCE',
    'TITAN', 'NESTLEIND', 'ULTRACEMCO', 'POWERGRID', 'NTPC', 'ONGC'
  ];

  // Check if symbol matches common Indian stocks
  if (commonIndianStocks.includes(symbol.toUpperCase())) {
    return true;
  }

  // Check if symbol matches Indian patterns
  return indianPatterns.some(pattern => pattern.test(symbol));
}

/**
 * Cleans up a stock symbol by removing exchange suffixes
 * @param symbol - Stock symbol with potential exchange suffix
 * @returns Clean symbol without exchange suffix
 */
export function cleanSymbol(symbol: string): string {
  if (symbol.includes('.')) {
    return symbol.split('.')[0];
  }
  return symbol;
}

/**
 * Extracts exchange information from symbol suffix
 * @param symbol - Stock symbol with potential exchange suffix
 * @returns Exchange code or null if not found
 */
export function extractExchangeFromSymbol(symbol: string): string | null {
  if (!symbol.includes('.')) {
    return null;
  }

  const suffix = symbol.split('.')[1];
  switch (suffix) {
    case 'BSE':
    case 'BO':
      return 'BSE';
    case 'NS':
    case 'NSE':
      return 'NSE';
    default:
      return suffix;
  }
}

/**
 * Maps a stock symbol to Yahoo Finance's expected format
 * @param symbol - Stock symbol (may include exchange suffix)
 * @returns Yahoo-compatible symbol string
 */
export function mapToYahooSymbol(symbol: string): string {
  let base = symbol.split('.')[0];
  let suffix = symbol.split('.')[1];
  if (suffix === 'NS' || suffix === 'NSE' || !suffix) {
    return `${base}.NS`;
  } else if (suffix === 'BO' || suffix === 'BSE') {
    return `${base}.BO`;
  }
  return base;
}
