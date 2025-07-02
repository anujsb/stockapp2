'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Award, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface NewsAndActionsProps {
  stock: any;
}

interface NewsItem {
  id: number;
  title: string;
  summary?: string;
  url?: string;
  source?: string;
  publishedAt?: string;
  sentiment?: string;
  createdAt?: string;
  stock?: {
    id: number;
    symbol: string;
    name: string;
  };
}

export default function NewsAndActions({ stock }: NewsAndActionsProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  // Mock data for additional features
  const analystRatings = {
    buy: 12,
    hold: 5,
    sell: 1,
    average: 4.2
  };

  // Fetch real news data from database
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoadingNews(true);
        const response = await fetch(`/api/stock-news?stockId=${stock.id}&limit=10`);
        if (response.ok) {
          const newsData = await response.json();
          setNewsItems(newsData);
        } else {
          // Fallback to mock data if no news found
          setNewsItems([
            {
              id: 1,
              title: "Q4 Earnings Beat Expectations by 15%",
              publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
              sentiment: "positive",
              source: "Financial Times"
            },
            {
              id: 2,
              title: "Board Announces 8% Dividend Increase",
              publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
              sentiment: "positive",
              source: "Reuters"
            },
            {
              id: 3,
              title: "New Product Launch in Asian Markets",
              publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
              sentiment: "neutral",
              source: "Bloomberg"
            },
            {
              id: 4,
              title: "Upcoming Stock Split Announcement",
              publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
              sentiment: "positive",
              source: "MarketWatch"
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback to mock data on error
        setNewsItems([]);
      } finally {
        setIsLoadingNews(false);
      }
    };

    if (stock?.id) {
      fetchNews();
    }
  }, [stock?.id]);

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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 10080) { // 7 days
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNewsType = (title: string, source: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('earnings') || lowerTitle.includes('revenue') || lowerTitle.includes('profit')) {
      return 'earnings';
    } else if (lowerTitle.includes('dividend')) {
      return 'dividend';
    } else if (lowerTitle.includes('split') || lowerTitle.includes('merger') || lowerTitle.includes('acquisition')) {
      return 'corporate';
    } else {
      return 'news';
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
              {isLoadingNews ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading news...</span>
                </div>
              ) : newsItems.length > 0 ? (
                newsItems.map((news) => {
                  const newsType = getNewsType(news.title, news.source || '');
                  const timeAgo = news.publishedAt ? getTimeAgo(news.publishedAt) : 'Unknown time';
                  
                  return (
                    <div 
                      key={news.id} 
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => news.url && window.open(news.url, '_blank')}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getSentimentIcon(news.sentiment || 'neutral')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{news.title}</p>
                        {news.summary && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{news.summary}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{timeAgo}</span>
                          {news.source && (
                            <span className="text-xs text-gray-500">• {news.source}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            newsType === 'earnings' ? 'bg-blue-100 text-blue-800' :
                            newsType === 'dividend' ? 'bg-green-100 text-green-800' :
                            newsType === 'corporate' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {newsType}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No recent news available for {stock.symbol}</p>
                </div>
              )}
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
