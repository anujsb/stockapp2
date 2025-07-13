// src/components/PortfolioTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { Trash2, TrendingUp, TrendingDown, Eye, AlertCircle, Clock } from 'lucide-react';
import { calculateGainLoss, formatCurrency } from '@/lib/utils/portfolio-utils';
import { 
  calculateGainLossRobust, 
  getStockDisplayName, 
  getStockStatusRobust,
  formatCurrencyRobust,
  formatPercentageRobust,
  safeParseFloat,
  safeParseString
} from '@/lib/utils/robust-data-utils';
import { formatLastUpdated, getDataFreshnessLevel, getFreshnessColor } from '@/lib/utils/time-utils';

interface Stock {
  id: number;
  symbol: string;
  name: string;
  currentPrice: string;
  dayChange: string;
  dayChangePercent: string;
  sector: string;
  industry: string;
  exchange?: string;
  // Enhanced fields from new schema
  longName?: string;
  bid?: string;
  ask?: string;
  marketCap?: string;
  volume?: string;
  peRatio?: string;
  dividendYield?: string;
  high52Week?: string;
  low52Week?: string;
  // Technical indicators
  sma20?: string;
  sma50?: string;
  rsi?: string;
  // Financial ratios
  beta?: string;
  // Analyst ratings
  analystRecommendation?: string;
  analystBuyCount?: string;
  analystHoldCount?: string;
  analystSellCount?: string;
  analystTargetPrice?: string;
  // Timestamps
  lastUpdated?: string;
  lastRealTimeUpdate?: string;
  lastDailyUpdate?: string;
  lastWeeklyUpdate?: string;
  lastQuarterlyUpdate?: string;
}

interface PortfolioItem {
  id: number;
  quantity: string;
  avgPurchasePrice: string;
  purchaseDate: string;
  notes: string;
  stock: Stock;
}

interface PortfolioTableProps {
  refreshTrigger: number;
  onDataUpdate?: (portfolio: PortfolioItem[], summary: { totalPortfolioValue: number; totalInvested: number; totalGainLoss: number; totalGainLossPercent: number; }) => void;
  onStockClick?: (stock: any) => void;
}

// Helper to check if Indian market is open
function isIndianMarketOpen() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(utc + istOffset);
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const mins = hours * 60 + minutes;
  return mins >= 555 && mins <= 930 && ist.getDay() >= 1 && ist.getDay() <= 5; // Mon-Fri
}

export default function PortfolioTable({ refreshTrigger, onDataUpdate, onStockClick }: PortfolioTableProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [marketOpen, setMarketOpen] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-refresh every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPortfolio();
    }, 1 * 60 * 1000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    setIsFetching(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/portfolio/');
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
        // Find the most recent lastUpdated from stock data
        const times = data.map((item: any) => item.stock.lastUpdated).filter(Boolean);
        if (times.length > 0) {
          const mostRecentTime = new Date(Math.max(...times.map((t: string) => new Date(t).getTime())));
          setLastUpdated(mostRecentTime);
        } else {
          // If no lastUpdated found, use current time
          setLastUpdated(new Date());
        }
      } else {
        setErrorMessage('Could not load portfolio. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setErrorMessage('Could not load portfolio. Please try again.');
    } finally {
      setIsLoading(false);
      setMarketOpen(isIndianMarketOpen());
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [refreshTrigger]);

  const totalPortfolioValue = portfolio.reduce((total, item) => {
    const { currentValue } = calculateGainLossRobust({
      currentPrice: item.stock.currentPrice,
      avgPurchasePrice: item.avgPurchasePrice,
      quantity: item.quantity
    });
    return total + currentValue;
  }, 0);

  const totalInvested = portfolio.reduce((total, item) => {
    const { investedValue } = calculateGainLossRobust({
      currentPrice: item.stock.currentPrice,
      avgPurchasePrice: item.avgPurchasePrice,
      quantity: item.quantity
    });
    return total + investedValue;
  }, 0);

  const totalGainLoss = totalPortfolioValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  useEffect(() => {
    if (onDataUpdate && portfolio.length >= 0) {
      const summary = {
        totalPortfolioValue,
        totalInvested,
        totalGainLoss,
        totalGainLossPercent
      };
      onDataUpdate(portfolio, summary);
    }
  }, [portfolio, totalPortfolioValue, totalInvested, totalGainLoss, totalGainLossPercent]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this stock from your portfolio?')) {
      return;
    }
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/portfolio/?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPortfolio(portfolio.filter(item => item.id !== id));
      } else {
        setErrorMessage('Failed to remove stock. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      setErrorMessage('Failed to remove stock. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">Your portfolio is empty</div>
        <div className="text-gray-500">Add some stocks to get started</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded flex items-center justify-between text-sm">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-4 text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}
      
      {/* Last Updated and Market Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated: {formatLastUpdated(lastUpdated)}
              {isFetching && (
                <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full ml-1"></span>
              )}
            </div>
          )}
        </div>
        {!marketOpen && (
          <div className="text-xs text-red-600 font-semibold flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Indian stock market is closed. Showing last close price.
          </div>
        )}
      </div>
      
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrencyRobust(totalPortfolioValue)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Invested</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrencyRobust(totalInvested)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Gain/Loss</div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${
            totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalGainLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            {formatCurrencyRobust(Math.abs(totalGainLoss))} ({totalGainLossPercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gain/Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolio.map((item) => {
                const { gainLoss, gainLossPercent, currentValue } = calculateGainLossRobust({
                  currentPrice: item.stock.currentPrice,
                  avgPurchasePrice: item.avgPurchasePrice,
                  quantity: item.quantity
                });
                
                const dayChange = safeParseFloat(item.stock.dayChange, 0);
                const dayChangePercent = safeParseFloat(item.stock.dayChangePercent, 0);
                const stockStatus = getStockStatusRobust(item.stock);
                
                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onStockClick && onStockClick({
                      id: item.stock.id,
                      symbol: item.stock.symbol,
                      name: getStockDisplayName(item.stock),
                      quantity: safeParseFloat(item.quantity, 0),
                      avgPurchasePrice: safeParseFloat(item.avgPurchasePrice, 0),
                      currentPrice: safeParseFloat(item.stock.currentPrice, 0),
                      dayChange: dayChange,
                      dayChangePercent: dayChangePercent,
                      sector: safeParseString(item.stock.sector, 'Diversified'),
                      industry: safeParseString(item.stock.industry, 'Diversified'),
                      exchange: safeParseString(item.stock.exchange, 'NSE'),
                      marketCap: item.stock.marketCap || 'N/A',
                      pe: item.stock.peRatio || 'N/A',
                      dividend: item.stock.dividendYield || 'N/A',
                      beta: item.stock.beta || 'N/A',
                      volume: item.stock.volume || 'N/A',
                      recommendation: item.stock.analystRecommendation || 'N/A',
                      aiSummary: 'N/A',
                      aiReason: 'N/A',
                      // Enhanced data
                      longName: item.stock.longName,
                      bid: item.stock.bid,
                      ask: item.stock.ask,
                      high52Week: item.stock.high52Week,
                      low52Week: item.stock.low52Week,
                      sma20: item.stock.sma20,
                      sma50: item.stock.sma50,
                      rsi: item.stock.rsi,
                      analystBuyCount: item.stock.analystBuyCount,
                      analystHoldCount: item.stock.analystHoldCount,
                      analystSellCount: item.stock.analystSellCount,
                      analystTargetPrice: item.stock.analystTargetPrice,
                      lastUpdated: item.stock.lastUpdated,
                      lastRealTimeUpdate: item.stock.lastRealTimeUpdate,
                      isMarketOpen: stockStatus.isMarketOpen,
                      dataFreshness: stockStatus.dataFreshness
                    })}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{item.stock.symbol}</div>
                        <div className="text-sm text-gray-500">{getStockDisplayName(item.stock)}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          {safeParseString(item.stock.sector, 'Diversified')}
                          {item.stock.sector && item.stock.industry && ' • '}
                          {safeParseString(item.stock.industry, '')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {safeParseFloat(item.quantity, 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrencyRobust(item.avgPurchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrencyRobust(item.stock.currentPrice)}
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${
                        dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dayChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatCurrencyRobust(Math.abs(dayChange))} ({formatPercentageRobust(Math.abs(dayChangePercent))})
                      </div>
                      {/* Data freshness indicator */}
                      <div className="text-xs text-gray-400 mt-1">
                        {stockStatus.dataFreshness === 'real-time' && <span className="text-green-600">● Live</span>}
                        {stockStatus.dataFreshness === 'recent' && <span className="text-yellow-600">● Recent</span>}
                        {stockStatus.dataFreshness === 'stale' && <span className="text-red-600">● Stale</span>}
                        {stockStatus.dataFreshness === 'unknown' && <span className="text-gray-600">● Unknown</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrencyRobust(currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium flex items-center gap-1 ${
                        gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {gainLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {formatCurrencyRobust(Math.abs(gainLoss))}
                      </div>
                      <div className={`text-xs ${
                        gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({gainLossPercent.toFixed(2)}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStockClick && onStockClick({
                              id: item.stock.id,
                              symbol: item.stock.symbol,
                              name: getStockDisplayName(item.stock),
                              quantity: safeParseFloat(item.quantity, 0),
                              avgPurchasePrice: safeParseFloat(item.avgPurchasePrice, 0),
                              currentPrice: safeParseFloat(item.stock.currentPrice, 0),
                              dayChange: dayChange,
                              dayChangePercent: dayChangePercent,
                              sector: safeParseString(item.stock.sector, 'Diversified'),
                              industry: safeParseString(item.stock.industry, 'Diversified'),
                              exchange: safeParseString(item.stock.exchange, 'NSE'),
                              marketCap: item.stock.marketCap || 'N/A',
                              pe: item.stock.peRatio || 'N/A',
                              dividend: item.stock.dividendYield || 'N/A',
                              beta: item.stock.beta || 'N/A',
                              volume: item.stock.volume || 'N/A',
                              recommendation: item.stock.analystRecommendation || 'N/A',
                              aiSummary: 'N/A',
                              aiReason: 'N/A',
                              // Enhanced data
                              longName: item.stock.longName,
                              bid: item.stock.bid,
                              ask: item.stock.ask,
                              high52Week: item.stock.high52Week,
                              low52Week: item.stock.low52Week,
                              sma20: item.stock.sma20,
                              sma50: item.stock.sma50,
                              rsi: item.stock.rsi,
                              analystBuyCount: item.stock.analystBuyCount,
                              analystHoldCount: item.stock.analystHoldCount,
                              analystSellCount: item.stock.analystSellCount,
                              analystTargetPrice: item.stock.analystTargetPrice,
                              lastUpdated: item.stock.lastUpdated,
                              lastRealTimeUpdate: item.stock.lastRealTimeUpdate,
                              isMarketOpen: stockStatus.isMarketOpen,
                              dataFreshness: stockStatus.dataFreshness
                            })
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View stock details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Remove from portfolio"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}