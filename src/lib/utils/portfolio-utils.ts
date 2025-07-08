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

// Formats a number as currency (INR by default)
export function formatCurrency(amount: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
} 