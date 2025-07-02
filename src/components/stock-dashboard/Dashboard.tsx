'use client';

import { TrendingUp, TrendingDown, Star, AlertCircle, Calendar, Users, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DashboardProps {
  stock: any;
  formatCurrency: (amount: number) => string;
  calculateGainLoss: (stock: any) => any;
}

export default function Dashboard({ stock, formatCurrency, calculateGainLoss }: DashboardProps) {
  const gainLossData = calculateGainLoss(stock);

  // DUMMY DATA - Replace with real data when available
  const analystRatings = {
    buy: 0,
    hold: 0,
    sell: 0,
    average: 0
  };

  const newsItems = [
    {
      id: 1,
      title: "DUMMY - No real news data available",
      time: "N/A",
      type: "dummy",
      sentiment: "neutral"
    }
  ];

  const corporateActions = [
    {
      type: "DUMMY",
      date: "N/A",
      amount: "N/A",
      status: "N/A"
    }
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
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
              <p className="text-lg font-bold text-gray-900">{stock.quantity.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Avg Buy Price</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stock.avgPurchasePrice)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Invested Value</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(gainLossData.investedValue)}</p>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Current Price</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stock.currentPrice)}</p>
              <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${stock.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.dayChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(stock.dayChangePercent).toFixed(2)}%
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Unrealized P&L</p>
              <p className={`text-lg font-bold ${gainLossData.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(gainLossData.gainLoss))}
              </p>
              <p className={`text-xs ${gainLossData.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({gainLossData.gainLossPercent.toFixed(2)}%)
              </p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Annualized Return</p>
              <p className={`text-lg font-bold ${gainLossData.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                DUMMY%
              </p>
              <p className="text-xs text-gray-500">DUMMY calculation</p>
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
                  <span className="text-sm text-gray-600">Name</span>
                  <span className="text-sm font-medium">{stock.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ticker</span>
                  <span className="text-sm font-medium">{stock.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sector</span>
                  <span className="text-sm font-medium">{stock.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Industry</span>
                  <span className="text-sm font-medium">{stock.industry}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Data</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Cap</span>
                  <span className="text-sm font-medium">
                    {stock.marketCap ? new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(stock.marketCap) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">52W High</span>
                  <span className="text-sm font-medium">
                    {stock.high52Week > 0 ? formatCurrency(stock.high52Week) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">52W Low</span>
                  <span className="text-sm font-medium">
                    {stock.low52Week > 0 ? formatCurrency(stock.low52Week) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Volume</span>
                  <span className="text-sm font-medium">
                    {stock.volume ? new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(stock.volume) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Valuation</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">P/E Ratio</span>
                  <span className="text-sm font-medium">{stock.pe > 0 ? stock.pe.toFixed(2) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Beta</span>
                  <span className="text-sm font-medium">{stock.beta > 0 ? stock.beta.toFixed(2) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dividend Yield</span>
                  <span className="text-sm font-medium">{stock.dividend > 0 ? stock.dividend.toFixed(2) + '%' : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Exchange</span>
                  <span className="text-sm font-medium">{stock.exchange || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Currency</span>
                  <span className="text-sm font-medium">{stock.currency || 'USD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Book Value</span>
                  <span className="text-sm font-medium">DUMMY</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Add to Watchlist</span>
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Set Price Alert</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News & Events */}
      
    </div>
  );
}
