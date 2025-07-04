// src/components/PortfolioTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { Trash2, TrendingUp, TrendingDown, Eye } from 'lucide-react';

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

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPortfolio();
    }, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/portfolio/');
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
        // Find the most recent lastUpdated
        const times = data.map((item: any) => item.stock.lastUpdated).filter(Boolean);
        if (times.length > 0) {
          setLastUpdated(new Date(Math.max(...times.map((t: string) => new Date(t).getTime()))));
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setIsLoading(false);
      setMarketOpen(isIndianMarketOpen());
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [refreshTrigger]);

  const calculateGainLoss = (item: PortfolioItem) => {
    const currentPrice = parseFloat(item.stock.currentPrice);
    const avgPrice = parseFloat(item.avgPurchasePrice);
    const quantity = parseFloat(item.quantity);
    
    const currentValue = currentPrice * quantity;
    const investedValue = avgPrice * quantity;
    const gainLoss = currentValue - investedValue;
    const gainLossPercent = ((gainLoss / investedValue) * 100);
    
    return {
      gainLoss,
      gainLossPercent,
      currentValue,
      investedValue
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalPortfolioValue = portfolio.reduce((total, item) => {
    const { currentValue } = calculateGainLoss(item);
    return total + currentValue;
  }, 0);

  const totalInvested = portfolio.reduce((total, item) => {
    const { investedValue } = calculateGainLoss(item);
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

    try {
      const response = await fetch(`/api/portfolio/?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPortfolio(portfolio.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
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
      {/* Last Updated and Market Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              Last updated: {lastUpdated.toLocaleString('en-IN', { hour12: true })}
              {isFetching && (
                <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full ml-1"></span>
              )}
            </div>
          )}
        </div>
        {!marketOpen && (
          <div className="text-xs text-red-600 font-semibold">Indian stock market is closed. Showing last close price.</div>
        )}
      </div>
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalPortfolioValue)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Invested</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalInvested)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Gain/Loss</div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${
            totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalGainLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            {formatCurrency(Math.abs(totalGainLoss))} ({totalGainLossPercent.toFixed(2)}%)
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
                const { gainLoss, gainLossPercent, currentValue } = calculateGainLoss(item);
                const dayChange = parseFloat(item.stock.dayChange);
                const dayChangePercent = parseFloat(item.stock.dayChangePercent);
                
                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onStockClick && onStockClick({
                      id: item.stock.id,
                      symbol: item.stock.symbol,
                      name: item.stock.name,
                      quantity: parseFloat(item.quantity),
                      avgPurchasePrice: parseFloat(item.avgPurchasePrice),
                      currentPrice: parseFloat(item.stock.currentPrice),
                      dayChange: parseFloat(item.stock.dayChange),
                      dayChangePercent: parseFloat(item.stock.dayChangePercent),
                      sector: item.stock.sector,
                      industry: item.stock.industry || '',
                      exchange: item.stock.exchange || '',
                      marketCap: '0',
                      pe: 0,
                      dividend: 0,
                      beta: 0,
                      volume: '0',
                      recommendation: 'HOLD',
                      aiSummary: '',
                      aiReason: ''
                    })}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{item.stock.symbol}</div>
                        <div className="text-sm text-gray-500">{item.stock.name}</div>
                        {item.stock.sector && (
                          <div className="text-xs text-gray-400">{item.stock.sector}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(item.quantity).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(parseFloat(item.avgPurchasePrice))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(parseFloat(item.stock.currentPrice))}
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${
                        dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dayChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(dayChange).toFixed(2)} ({Math.abs(dayChangePercent).toFixed(2)}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium flex items-center gap-1 ${
                        gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {gainLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {formatCurrency(Math.abs(gainLoss))}
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
                              name: item.stock.name,
                              quantity: parseFloat(item.quantity),
                              avgPurchasePrice: parseFloat(item.avgPurchasePrice),
                              currentPrice: parseFloat(item.stock.currentPrice),
                              dayChange: parseFloat(item.stock.dayChange),
                              dayChangePercent: parseFloat(item.stock.dayChangePercent),
                              sector: item.stock.sector,
                              industry: item.stock.industry || '',
                              exchange: item.stock.exchange || '',
                              marketCap: '0',
                              pe: 0,
                              dividend: 0,
                              beta: 0,
                              volume: '0',
                              recommendation: 'HOLD',
                              aiSummary: '',
                              aiReason: ''
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