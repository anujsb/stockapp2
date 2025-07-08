'use client';

import { Users, TrendingUp, TrendingDown, AlertCircle, BarChart3, Target, DollarSign, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DashboardProps {
  stock: any;
  formatCurrency: (amount: number) => string;
  calculateGainLoss: (stock: any) => { gainLoss: number; gainLossPercent: number; currentValue: number; investedValue: number; };
}

export default function Dashboard({ stock, formatCurrency, calculateGainLoss }: DashboardProps) {
  const gainLossData = calculateGainLoss(stock);

  const formatMarketCap = (marketCap: number | null | undefined) => {
    if (typeof marketCap !== 'number' || isNaN(marketCap)) return 'N/A';
    if (marketCap >= 1e12) return `₹${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `₹${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `₹${(marketCap / 1e6).toFixed(2)}M`;
    return `₹${marketCap.toFixed(0)}`;
  };

  // Analyst ratings - not available from Yahoo Finance
  const analystRatings = {
    buy: 'N/A',
    hold: 'N/A',
    sell: 'N/A',
    average: 'N/A'
  };

  // Use real data for stock overview
  const stockOverview = {
    name: stock.name || stock.longName || stock.symbol,
    symbol: stock.symbol,
    sector: stock.sector || 'N/A',
    industry: stock.industry || 'N/A',
    exchange: stock.exchange || 'NSE',
    marketCap: stock.marketCap ? formatMarketCap(stock.marketCap) : 'N/A',
    peRatio: stock.trailingPE && typeof stock.trailingPE === 'number' ? stock.trailingPE.toFixed(2) : 'N/A',
    dividendYield: stock.dividendYield && typeof stock.dividendYield === 'number' ? stock.dividendYield.toFixed(2) + '%' : 'N/A',
    high52Week: stock.fiftyTwoWeekHigh ? formatCurrency(stock.fiftyTwoWeekHigh) : 'N/A',
    low52Week: stock.fiftyTwoWeekLow ? formatCurrency(stock.fiftyTwoWeekLow) : 'N/A',
    beta: stock.beta && typeof stock.beta === 'number' ? stock.beta.toFixed(2) : 'N/A',
    eps: stock.trailingEps && typeof stock.trailingEps === 'number' ? stock.trailingEps.toFixed(2) : 'N/A',
    description: stock.description || 'No description available'
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'SELL':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Your Position */}
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Your Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Quantity Held</p>
              <p className="text-lg font-bold text-blue-600">{stock.quantity?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Invested Value</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(gainLossData.investedValue)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Current Value</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(gainLossData.currentValue)}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Gain/Loss</p>
              <p className={`text-lg font-bold ${gainLossData.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(gainLossData.gainLoss))}
              </p>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Gain/Loss %</p>
              <p className={`text-lg font-bold ${gainLossData.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossData.gainLossPercent.toFixed(2)}%
              </p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Est. Yearly Return</p>
              <p className="text-lg font-bold text-yellow-600">
                {(gainLossData.gainLossPercent * 1.2).toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500">Est. yearly</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Overview Info */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-indigo-600" />
            Stock Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Basic Info</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Company</span>
                  <span className="text-sm font-medium">{stockOverview.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ticker</span>
                  <span className="text-sm font-medium">{stockOverview.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sector</span>
                  <span className="text-sm font-medium">{stockOverview.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Industry</span>
                  <span className="text-sm font-medium">{stockOverview.industry}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Data</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Cap</span>
                  <span className="text-sm font-medium">{stockOverview.marketCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">P/E Ratio</span>
                  <span className="text-sm font-medium">{stockOverview.peRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dividend Yield</span>
                  <span className="text-sm font-medium">{stockOverview.dividendYield}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Beta</span>
                  <span className="text-sm font-medium">{stockOverview.beta}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">52-Week High</span>
                  <span className="text-sm font-medium text-green-600">{stockOverview.high52Week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">52-Week Low</span>
                  <span className="text-sm font-medium text-red-600">{stockOverview.low52Week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">EPS</span>
                  <span className="text-sm font-medium">{stockOverview.eps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Exchange</span>
                  <span className="text-sm font-medium">{stockOverview.exchange}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Analyst Ratings</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Buy</span>
                  <span className="text-sm font-medium text-green-600">{analystRatings.buy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hold</span>
                  <span className="text-sm font-medium text-yellow-600">{analystRatings.hold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sell</span>
                  <span className="text-sm font-medium text-red-600">{analystRatings.sell}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Rating</span>
                  <span className="text-sm font-medium">{analystRatings.average}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Description */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Company Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {stockOverview.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
