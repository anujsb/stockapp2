'use client';

import React, { useState, useEffect } from 'react'; // <-- Add React import
import { Trash2, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TradingViewChart from '@/components/TradingViewChart';

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
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this stock from your portfolio?')) return;
    try {
      const response = await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setPortfolio(portfolio.filter((item) => item.id !== id)); // <-- Fix: compare number to number
        setExpandedId(null); // Close expanded row if deleted
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
    const gainLossPercent = investedValue !== 0 ? (gainLoss / investedValue) * 100 : 0;
    return { gainLoss, gainLossPercent, currentValue, investedValue };
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const totalPortfolioValue = portfolio.reduce(
    (total, item) => total + calculateGainLoss(item).currentValue,
    0
  );
  const totalInvested = portfolio.reduce(
    (total, item) => total + calculateGainLoss(item).investedValue, // <-- Fix: remove stray "стратеги"
    0
  );
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalPortfolioValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalInvested)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold flex items-center gap-2 ${
                totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {formatCurrency(Math.abs(totalGainLoss))} ({totalGainLossPercent.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stock</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Avg Price</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead>Gain/Loss</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolio.map((item) => {
            const { gainLoss, gainLossPercent, currentValue } = calculateGainLoss(item);
            const dayChange = parseFloat(item.stock.dayChange);
            const isExpanded = expandedId === item.id;

            return (
              <React.Fragment key={item.id}>
                <TableRow
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.stock.symbol}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{item.stock.name}</div>
                    {item.stock.sector && (
                      <div className="text-xs text-gray-400">{item.stock.sector}</div>
                    )}
                  </TableCell>
                  <TableCell>{parseFloat(item.quantity).toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(parseFloat(item.avgPurchasePrice))}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {formatCurrency(parseFloat(item.stock.currentPrice))}
                    </div>
                    <div
                      className={`text-xs flex items-center gap-1 ${
                        dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {dayChange >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(dayChange).toFixed(2)}%
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(currentValue)}</TableCell>
                  <TableCell>
                    <div
                      className={`text-sm font-medium flex items-center gap-1 ${
                        gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {gainLoss >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {formatCurrency(Math.abs(gainLoss))}
                    </div>
                    <div
                      className={`text-xs ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      ({gainLossPercent.toFixed(2)}%)
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-gray-100">
                      <div className="p-4 space-y-4">
                        {/* TradingView Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Price Chart</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <TradingViewChart symbol={item.stock.symbol} />
                          </CardContent>
                        </Card>
                        {/* Gemini Analysis Placeholder */}
                        <Card>
                          <CardHeader>
                            <CardTitle>AI Analysis (Gemini)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600">
                              Summary: Loading stock analysis...
                            </p>
                            <p className="text-gray-600 mt-2">
                              Recommendation: [Buy/Hold/Sell] (Coming soon)
                            </p>
                          </CardContent>
                        </Card>
                        {/* Additional Stock Info */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Stock Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Sector: {item.stock.sector || 'N/A'}</p>
                            <p>Industry: {item.stock.industry || 'N/A'}</p>
                            <p>Notes: {item.notes || 'None'}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}