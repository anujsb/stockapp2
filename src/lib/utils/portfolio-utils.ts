// Portfolio utility types
export interface GainLossResult {
  gainLoss: number;
  gainLossPercent: number;
  currentValue: number;
  investedValue: number;
}

export interface PortfolioStockLike {
  currentPrice: number;
  avgPurchasePrice: number;
  quantity: number;
}

// Calculates gain/loss and related values for a stock/portfolio item
export function calculateGainLoss(stock: PortfolioStockLike): GainLossResult {
  const currentValue = stock.currentPrice * stock.quantity;
  const investedValue = stock.avgPurchasePrice * stock.quantity;
  const gainLoss = currentValue - investedValue;
  const gainLossPercent = investedValue !== 0 ? ((gainLoss / investedValue) * 100) : 0;
  return {
    gainLoss,
    gainLossPercent,
    currentValue,
    investedValue
  };
}

// Currency formatting options
export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Format currency with Indian Rupee as default
export function formatCurrency(amount: number, options?: FormatCurrencyOptions): string {
  const defaultOptions: FormatCurrencyOptions = {
    currency: 'INR',
    locale: 'en-IN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };

  return new Intl.NumberFormat(defaultOptions.locale!, {
    style: 'currency',
    currency: defaultOptions.currency!,
    minimumFractionDigits: defaultOptions.minimumFractionDigits,
    maximumFractionDigits: defaultOptions.maximumFractionDigits,
  }).format(amount);
} 

/**
 * Checks if the lastRefreshed date is stale based on the given frequency.
 * @param lastRefreshed - Date string or Date object of last refresh
 * @param frequency - "daily" | "weekly" | "quarterly"
 * @returns true if data is stale, false otherwise
 */
export function isDataStale(lastRefreshed: string | Date | null | undefined, frequency: 'daily' | 'weekly' | 'quarterly'): boolean {
  if (!lastRefreshed) return true;
  const now = new Date();
  const last = new Date(lastRefreshed);
  let diffMs = now.getTime() - last.getTime();
  let thresholdMs = 0;
  switch (frequency) {
    case 'daily':
      thresholdMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case 'weekly':
      thresholdMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      break;
    case 'quarterly':
      thresholdMs = 90 * 24 * 60 * 60 * 1000; // 90 days
      break;
    default:
      thresholdMs = 24 * 60 * 60 * 1000;
  }
  return diffMs > thresholdMs;
} 