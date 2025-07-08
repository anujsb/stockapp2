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