'use client';

import { Users, TrendingUp, TrendingDown, AlertCircle, BarChart3, Target, DollarSign, PieChart, Clock, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  getStockOverviewRobust, 
  calculateGainLossRobust,
  getStockStatusRobust,
  formatCurrencyRobust,
  formatPercentageRobust,
  formatMarketCapRobust,
  formatVolumeRobust,
  safeParseFloat,
  safeParseString
} from '@/lib/utils/robust-data-utils';

interface DashboardProps {
  stock: any;
  formatCurrency: (amount: number) => string;
  calculateGainLoss: (stock: any) => { gainLoss: number; gainLossPercent: number; currentValue: number; investedValue: number; };
}

export default function Dashboard({ stock, formatCurrency, calculateGainLoss }: DashboardProps) {
  console.log('Stock in Dashboard:', stock);
  
  // Use robust data handling
  const stockOverview = getStockOverviewRobust(stock);
  const gainLossData = calculateGainLossRobust(stock);
  const stockStatus = getStockStatusRobust(stock);

  // Enhanced analyst ratings with real data
  const analystRatings = {
    buy: safeParseString(stock.analystBuyCount, 'N/A'),
    hold: safeParseString(stock.analystHoldCount, 'N/A'),
    sell: safeParseString(stock.analystSellCount, 'N/A'),
    average: stockOverview.analyst.recommendation
  };

  // Get data freshness indicator
  const getDataFreshnessIcon = () => {
    switch (stockStatus.dataFreshness) {
      case 'real-time':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'recent':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'stale':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'SELL':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'HOLD':
        return <Target className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Status Indicator */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          {getDataFreshnessIcon()}
          <span className="text-sm font-medium">
            Data Status: {stockStatus.dataFreshness === 'real-time' ? 'Live' : 
                         stockStatus.dataFreshness === 'recent' ? 'Recent' :
                         stockStatus.dataFreshness === 'stale' ? 'Stale' : 'Unknown'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {stockStatus.lastUpdateTime}
        </div>
      </div>

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
              <p className="text-lg font-bold text-blue-600">
                {safeParseFloat(stock.quantity, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Invested Value</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrencyRobust(gainLossData.investedValue)}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Current Value</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrencyRobust(gainLossData.currentValue)}
              </p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Gain/Loss</p>
              <p className={`text-lg font-bold ${gainLossData.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrencyRobust(Math.abs(gainLossData.gainLoss))}
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
                  <span className="text-sm font-medium">{stockOverview.basic.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ticker</span>
                  <span className="text-sm font-medium">{stockOverview.basic.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sector</span>
                  <span className="text-sm font-medium">{stockOverview.basic.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Industry</span>
                  <span className="text-sm font-medium">{stockOverview.basic.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Exchange</span>
                  <span className="text-sm font-medium">{stockOverview.basic.exchange}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Data</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Cap</span>
                  <span className="text-sm font-medium">{stockOverview.market.marketCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Volume</span>
                  <span className="text-sm font-medium">{stockOverview.market.volume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">P/E Ratio</span>
                  <span className="text-sm font-medium">{stockOverview.financial.peRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dividend Yield</span>
                  <span className="text-sm font-medium">{stockOverview.financial.dividendYield}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Beta</span>
                  <span className="text-sm font-medium">{stockOverview.financial.beta}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">52-Week High</span>
                  <span className="text-sm font-medium text-green-600">{stockOverview.technical.high52Week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">52-Week Low</span>
                  <span className="text-sm font-medium text-red-600">{stockOverview.technical.low52Week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SMA 20</span>
                  <span className="text-sm font-medium">{stockOverview.technical.sma20}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SMA 50</span>
                  <span className="text-sm font-medium">{stockOverview.technical.sma50}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">RSI</span>
                  <span className="text-sm font-medium">{stockOverview.technical.rsi}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Analyst Ratings</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Recommendation</span>
                  <div className="flex items-center gap-1">
                    {getRecommendationIcon(stockOverview.analyst.recommendation)}
                    <span className="text-sm font-medium">{stockOverview.analyst.recommendation}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Buy</span>
                  <span className="text-sm font-medium text-green-600">{stockOverview.analyst.buyCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hold</span>
                  <span className="text-sm font-medium text-yellow-600">{stockOverview.analyst.holdCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sell</span>
                  <span className="text-sm font-medium text-red-600">{stockOverview.analyst.sellCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Target Price</span>
                  <span className="text-sm font-medium">{stockOverview.analyst.targetPrice}</span>
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
          <div className="text-sm text-gray-700 leading-relaxed">
            {safeParseString(stock.description, 'No company description available.')}
          </div>
        </CardContent>
      </Card>

      {/* Market Status */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Market Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Market Status</span>
              <span className={`text-sm font-medium ${stockStatus.isMarketOpen ? 'text-green-600' : 'text-red-600'}`}>
                {stockStatus.isMarketOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Data Freshness</span>
              <span className={`text-sm font-medium ${
                stockStatus.dataFreshness === 'real-time' ? 'text-green-600' :
                stockStatus.dataFreshness === 'recent' ? 'text-yellow-600' :
                stockStatus.dataFreshness === 'stale' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stockStatus.dataFreshness === 'real-time' ? 'Live' :
                 stockStatus.dataFreshness === 'recent' ? 'Recent' :
                 stockStatus.dataFreshness === 'stale' ? 'Stale' : 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
