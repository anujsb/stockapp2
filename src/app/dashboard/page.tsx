// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Eye, Plus } from 'lucide-react';
import Link from 'next/link';
import { SideBar } from '@/components/SideBar';

interface PortfolioSummary {
  totalStocks: number;
  currentValue: number;
  investedValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}

interface PortfolioItem {
  id: number;
  quantity: number;
  avg_purchase_price: number;
  stock: {
    id: number;
    symbol: string;
    name: string;
    current_price: number;
    day_change: number;
    day_change_percent: number;
    sector: string;
  };
}

interface TrendingStock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  day_change: number;
  day_change_percent: number;
  volume: number;
}

export default function Dashboard() {
  const { user } = useUser();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [topPerformers, setTopPerformers] = useState<PortfolioItem[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch portfolio data
      const portfolioResponse = await fetch('/api/portfolio');
      if (portfolioResponse.ok) {
        const portfolioArray = await portfolioResponse.json();
        setPortfolio(portfolioArray);

        // Calculate summary
        let currentValue = 0;
        let investedValue = 0;
        portfolioArray.forEach((item: any) => {
          const qty = parseFloat(item.quantity);
          const avgPrice = parseFloat(item.avgPurchasePrice);
          const currPrice = parseFloat(item.stock.currentPrice);
          investedValue += qty * avgPrice;
          currentValue += qty * currPrice;
        });
        const totalPnL = currentValue - investedValue;
        const totalPnLPercent = investedValue > 0 ? (totalPnL / investedValue) * 100 : 0;
        setPortfolioSummary({
          totalStocks: portfolioArray.length,
          currentValue,
          investedValue,
          totalPnL,
          totalPnLPercent,
        });

        // Get top 5 performers
        const sorted = portfolioArray
          .map((item: any) => ({
            ...item,
            pnl: (parseFloat(item.stock.currentPrice) - parseFloat(item.avgPurchasePrice)) * parseFloat(item.quantity),
            pnlPercent: ((parseFloat(item.stock.currentPrice) - parseFloat(item.avgPurchasePrice)) / parseFloat(item.avgPurchasePrice)) * 100
          }))
          .sort((a: any, b: any) => b.pnlPercent - a.pnlPercent)
          .slice(0, 5);

        setTopPerformers(sorted);
      }

      // Fetch trending stocks
      const trendingResponse = await fetch('/api/stocks?trending=true');
      if (trendingResponse.ok) {
        const trending = await trendingResponse.json();
        setTrendingStocks(trending.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center ">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'Investor'}!
              </h1>
              <p className="text-gray-600 mt-1">Here's your portfolio overview</p>
            </div>
            <div className="flex gap-3">
              <Link href="/portfolio">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock
                </Button>
              </Link>
            </div>
          </div>

          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {portfolioSummary ? formatCurrency(portfolioSummary.currentValue) : '₹0'}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {portfolioSummary?.totalStocks || 0} stocks
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${portfolioSummary && portfolioSummary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioSummary ? formatCurrency(portfolioSummary.totalPnL) : '₹0'}
                </div>
                <div className="flex items-center text-sm mt-1">
                  {portfolioSummary && portfolioSummary.totalPnLPercent >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                  )}
                  <span className={portfolioSummary && portfolioSummary.totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {portfolioSummary ? `${portfolioSummary.totalPnLPercent.toFixed(2)}%` : '0%'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Invested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {portfolioSummary ? formatCurrency(portfolioSummary.investedValue) : '₹0'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Cost basis
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Day Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ₹0
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Today's movement
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topPerformers.length > 0 ? (
                  <div className="space-y-4">
                    {topPerformers.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{item.stock.symbol}</div>
                          <div className="text-sm text-gray-600">{item.stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(item.stock.current_price)}</div>
                          <div className={`text-sm flex items-center ${item.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.pnlPercent >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {item.pnlPercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No portfolio data available</p>
                    <Link href="/portfolio">
                      <Button className="mt-3" variant="outline">
                        Add Your First Stock
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trending Stocks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Market Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingStocks.map((stock) => (
                    <div key={stock.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-gray-600 truncate max-w-40">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(stock.current_price)}</div>
                        <div className={`text-sm flex items-center ${stock.day_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.day_change >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {stock.day_change_percent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/portfolio">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Plus className="w-6 h-6 mb-2" />
                    Add Stock
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    View Portfolio
                  </Button>
                </Link>
                <Link href="/watchlist">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Eye className="w-6 h-6 mb-2" />
                    Watchlist
                  </Button>
                </Link>
                <Link href="/news">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <TrendingUp className="w-6 h-6 mb-2" />
                    Market News
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}