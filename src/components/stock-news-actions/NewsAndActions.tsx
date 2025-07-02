'use client';

import { TrendingUp, TrendingDown, Calendar, Award, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface NewsAndActionsProps {
  stock: any;
}

export default function NewsAndActions({ stock }: NewsAndActionsProps) {
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
