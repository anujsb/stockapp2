
// src/components/PortfolioTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface Stock {
  id: number;
  symbol: string;
  name: string;
  currentPrice: string;
  dayChange: string;
  dayChangePercent: string;
  sector: string;
  industry: string;
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
}

export default function PortfolioTable({ refreshTrigger }: PortfolioTableProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this stock from your portfolio?')) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPortfolio(portfolio.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
    }
  };

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
                  <tr key={item.id} className="hover:bg-gray-50">
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
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Remove from portfolio"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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