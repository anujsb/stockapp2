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

  // Mock data for additional features
  const analystRatings = {
    buy: 12,
    hold: 5,
    sell: 1,
    average: 4.2
  };

  const newsItems = [
    {
      id: 1,
      title: "Q4 Earnings Beat Expectations by 15%",
      time: "2 hours ago",
      type: "earnings",
      sentiment: "positive"
    },
    {
      id: 2,
      title: "Board Announces 8% Dividend Increase",
      time: "1 day ago",
      type: "dividend",
      sentiment: "positive"
    },
    {
      id: 3,
      title: "New Product Launch in Asian Markets",
      time: "2 days ago",
      type: "news",
      sentiment: "neutral"
    },
    {
      id: 4,
      title: "Upcoming Stock Split Announcement",
      time: "1 week ago",
      type: "corporate",
      sentiment: "positive"
    }
  ];

  const corporateActions = [
    {
      type: "Dividend",
      date: "2024-03-15",
      amount: "$2.50",
      status: "upcoming"
    },
    {
      type: "Stock Split",
      date: "2024-04-01",
      ratio: "2:1",
      status: "announced"
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
                  <span className="text-sm font-medium">{stock.marketCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">52W High</span>
                  <span className="text-sm font-medium">{formatCurrency(stock.currentPrice * 1.15)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">52W Low</span>
                  <span className="text-sm font-medium">{formatCurrency(stock.currentPrice * 0.75)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Volume</span>
                  <span className="text-sm font-medium">{stock.volume}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Valuation</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">P/E Ratio</span>
                  <span className="text-sm font-medium">{stock.pe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Beta</span>
                  <span className="text-sm font-medium">{stock.beta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dividend Yield</span>
                  <span className="text-sm font-medium">{stock.dividend}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Book Value</span>
                  <span className="text-sm font-medium">{formatCurrency(stock.currentPrice * 0.8)}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Latest News & Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {newsItems.map((news) => (
                <div key={news.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSentimentIcon(news.sentiment)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{news.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{news.time}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        news.type === 'earnings' ? 'bg-blue-100 text-blue-800' :
                        news.type === 'dividend' ? 'bg-green-100 text-green-800' :
                        news.type === 'corporate' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {news.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Corporate Actions & Analyst Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Corporate Actions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Upcoming Corporate Actions</h4>
                <div className="space-y-2">
                  {corporateActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{action.type}</p>
                        <p className="text-xs text-gray-600">{action.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">
                          {action.amount || action.ratio}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          {action.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyst Ratings */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Analyst Ratings</h4>
                <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <span className="text-lg font-bold text-gray-900">{analystRatings.average}/5.0</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-100 p-2 rounded">
                      <p className="text-lg font-bold text-green-800">{analystRatings.buy}</p>
                      <p className="text-xs text-green-600">Buy</p>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded">
                      <p className="text-lg font-bold text-yellow-800">{analystRatings.hold}</p>
                      <p className="text-xs text-yellow-600">Hold</p>
                    </div>
                    <div className="bg-red-100 p-2 rounded">
                      <p className="text-lg font-bold text-red-800">{analystRatings.sell}</p>
                      <p className="text-xs text-red-600">Sell</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
