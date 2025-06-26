// src/app/portfolio/page.tsx
'use client';

import { useState } from 'react';
import { Plus, PieChart, Upload, TrendingUp, TrendingDown, BarChart3, FileText, Brain, Target, AlertTriangle } from 'lucide-react';
import AddStockModal from '@/components/AddStockModal';
import PortfolioTable from '@/components/PortfolioTable';
import { SideBar } from '@/components/SideBar';
import { Button } from '@/components/ui/button';

// 1. Define a Stock type
type Stock = {
  id: number;
  symbol: string;
  name: string;
  quantity: number;
  avgPurchasePrice: number;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  sector: string;
  industry: string;
  marketCap: string;
  pe: number;
  dividend: number;
  beta: number;
  volume: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | string;
  aiSummary: string;
  aiReason: string;
};

// 2. Update mockPortfolioData type
const mockPortfolioData: {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  stocks: Stock[];
} = {
  totalValue: 125430.50,
  totalInvested: 118000.00,
  totalGainLoss: 7430.50,
  totalGainLossPercent: 6.30,
  stocks: [
    {
      id: 1,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 50,
      avgPurchasePrice: 150.00,
      currentPrice: 175.50,
      dayChange: 2.35,
      dayChangePercent: 1.36,
      sector: 'Technology',
      industry: 'Consumer Electronics',
      marketCap: '2.8T',
      pe: 28.5,
      dividend: 0.96,
      beta: 1.2,
      volume: '45.2M',
      recommendation: 'HOLD',
      aiSummary: 'Apple continues to show strong fundamentals with consistent revenue growth. The stock is fairly valued at current levels.',
      aiReason: 'Strong brand loyalty, diversified product portfolio, and solid cash flow generation support the hold recommendation.'
    },
    {
      id: 2,
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 25,
      avgPurchasePrice: 2800.00,
      currentPrice: 2950.75,
      dayChange: -15.25,
      dayChangePercent: -0.51,
      sector: 'Technology',
      industry: 'Internet Services',
      marketCap: '1.9T',
      pe: 24.2,
      dividend: 0.00,
      beta: 1.1,
      volume: '28.7M',
      recommendation: 'BUY',
      aiSummary: 'Google maintains dominant position in search and cloud computing. Recent AI developments position it well for future growth.',
      aiReason: 'Strong moat in search business, growing cloud segment, and AI leadership create compelling investment opportunity.'
    }
  ]
};

export default function PortfolioPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStockAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 4. Type your function parameters
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateGainLoss = (stock: Stock) => {
    const currentValue = stock.currentPrice * stock.quantity;
    const investedValue = stock.avgPurchasePrice * stock.quantity;
    const gainLoss = currentValue - investedValue;
    const gainLossPercent = ((gainLoss / investedValue) * 100);
    
    return {
      gainLoss,
      gainLossPercent,
      currentValue,
      investedValue
    };
  };

  const getRecommendationColor = (rec: string) => {
    switch(rec) {
      case 'BUY': return 'bg-green-100 text-green-800 border-green-200';
      case 'SELL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch(rec) {
      case 'BUY': return <TrendingUp className="h-4 w-4" />;
      case 'SELL': return <TrendingDown className="h-4 w-4" />;
      case 'HOLD': return <Target className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <PieChart className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stock Portfolio</h1>
                  <p className="text-sm text-gray-500">Manage and track your investments</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCSVModalOpen(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  Import CSV
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Stock
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(mockPortfolioData.totalValue)}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(mockPortfolioData.totalInvested)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                  <p className={`text-2xl font-bold ${mockPortfolioData.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(mockPortfolioData.totalGainLoss))}
                  </p>
                  <p className={`text-sm ${mockPortfolioData.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {mockPortfolioData.totalGainLossPercent.toFixed(2)}%
                  </p>
                </div>
                <div className={`p-3 rounded-full ${mockPortfolioData.totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  {mockPortfolioData.totalGainLoss >= 0 ? 
                    <TrendingUp className="h-6 w-6 text-green-600" /> : 
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  }
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Holdings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockPortfolioData.stocks.length}
                  </p>
                  <p className="text-sm text-gray-500">Active positions</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Holdings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Portfolio Holdings</h2>
              <p className="text-gray-600 mt-1">Click on any stock to view detailed analysis</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Recommendation</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockPortfolioData.stocks.map((stock) => {
                    const { gainLoss, gainLossPercent, currentValue } = calculateGainLoss(stock);
                    
                    return (
                      <tr 
                        key={stock.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedStock(stock)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{stock.symbol}</div>
                            <div className="text-sm text-gray-500">{stock.name}</div>
                            <div className="text-xs text-gray-400">{stock.sector}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(stock.avgPurchasePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(stock.currentPrice)}
                          </div>
                          <div className={`text-xs flex items-center gap-1 ${
                            stock.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.dayChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(stock.dayChange).toFixed(2)} ({Math.abs(stock.dayChangePercent).toFixed(2)}%)
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRecommendationColor(stock.recommendation)}`}>
                            {getRecommendationIcon(stock.recommendation)}
                            {stock.recommendation}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Detail Modal */}
          {selectedStock && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedStock.symbol}</h2>
                      <p className="text-gray-600">{selectedStock.name}</p>
                      <p className="text-sm text-gray-500">{selectedStock.sector} • {selectedStock.industry}</p>
                    </div>
                    <Button
                      onClick={() => setSelectedStock(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Chart and Key Metrics */}
                  <div className="space-y-6">
                    {/* TradingView Chart */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Chart</h3>
                      <div className="h-64 bg-white rounded border flex items-center justify-center">
                        <p className="text-gray-500">TradingView Chart for {selectedStock.symbol}</p>
                        {/* TradingView widget will be integrated here */}
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Market Cap</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedStock.marketCap}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">P/E Ratio</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedStock.pe}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Beta</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedStock.beta}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Volume</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedStock.volume}</p>
                        </div>
                      </div>
                    </div>

                    {/* Your Position */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Position</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Shares Owned</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedStock.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Average Cost</p>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedStock.avgPurchasePrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Value</p>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(calculateGainLoss(selectedStock).currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Gain/Loss</p>
                          <p className={`text-lg font-semibold ${calculateGainLoss(selectedStock).gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(calculateGainLoss(selectedStock).gainLoss))} ({calculateGainLoss(selectedStock).gainLossPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - AI Analysis */}
                  <div className="space-y-6">
                    {/* AI Recommendation */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">AI Recommendation</h3>
                      </div>
                      <div className="mb-4">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getRecommendationColor(selectedStock.recommendation)}`}>
                          {getRecommendationIcon(selectedStock.recommendation)}
                          {selectedStock.recommendation}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                          <p className="text-sm text-gray-700">{selectedStock.aiSummary}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Reasoning</h4>
                          <p className="text-sm text-gray-700">{selectedStock.aiReason}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Analysis */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Analysis</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">RSI (14)</span>
                          <span className="text-sm font-medium text-gray-900">65.2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">MACD</span>
                          <span className="text-sm font-medium text-green-600">Bullish</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">50-Day MA</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedStock.currentPrice * 0.98)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">200-Day MA</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedStock.currentPrice * 0.95)}</span>
                        </div>
                      </div>
                    </div>

                    {/* News & Updates */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent News</h3>
                      <div className="space-y-3">
                        <div className="border-l-4 border-blue-500 pl-3">
                          <p className="text-sm font-medium text-gray-900">Q3 Earnings Beat Expectations</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-3">
                          <p className="text-sm font-medium text-gray-900">New Product Launch Announced</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-3">
                          <p className="text-sm font-medium text-gray-900">Analyst Upgrades Rating</p>
                          <p className="text-xs text-gray-500">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CSV Upload Modal */}
          {isCSVModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Import Portfolio from CSV</h2>
                  <Button
                    onClick={() => setIsCSVModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Select File
                    </label>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p className="mb-2">CSV should contain columns:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Symbol (required)</li>
                      <li>Quantity (required)</li>
                      <li>Average Price (required)</li>
                      <li>Notes (optional)</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsCSVModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Import
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Add Stock Modal */}
        <AddStockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStockAdded={handleStockAdded}
        />
      </div>
    </div>
  );
}