// src/app/portfolio/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Plus, PieChart, Upload, TrendingUp, TrendingDown, BarChart3, FileText, Brain, Target, AlertTriangle } from 'lucide-react';
import AddStockModal from '@/components/AddStockModal';
import PortfolioTable from '@/components/PortfolioTable';
import { SideBar } from '@/components/SideBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Dashboard from '@/components/stock-dashboard/Dashboard';
import Chart from '@/components/stock-chart/Chart';
import AIAnalysis from '@/components/stock-ai-analysis/AIAnalysis';
import Financials from '@/components/stock-financials/Financials';
import Technicals from '@/components/stock-technicals/Technicals';
import NewsAndActions from '@/components/stock-news-actions/NewsAndActions';
import { calculateGainLoss, formatCurrency } from '@/lib/utils/portfolio-utils';

interface PortfolioStock {
  id: number;
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  currentPrice: number;
  avgPurchasePrice: number;
  quantity: number;
  [key: string]: any;
}

function mapPortfolioItemsToStocks(items: any[]): PortfolioStock[] {
  return items.map((item) => ({
    id: item.id,
    symbol: item.stock.symbol,
    name: item.stock.name,
    sector: item.stock.sector,
    industry: item.stock.industry,
    currentPrice: item.stock.current_price,
    avgPurchasePrice: item.avg_purchase_price,
    quantity: item.quantity,
    // add other fields as needed
  }));
}

interface RecommendationColorMap {
  [key: string]: string;
}

type Recommendation = 'BUY' | 'SELL' | 'HOLD' | string;

export default function PortfolioPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalPortfolioValue: 0,
    totalInvested: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleStockAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  interface PortfolioStock {
    id: number;
    symbol: string;
    name: string;
    sector?: string;
    industry?: string;
    currentPrice: number;
    avgPurchasePrice: number;
    quantity: number;
    [key: string]: any;
  }

  interface PortfolioSummary {
    totalPortfolioValue: number;
    totalInvested: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
  }

    interface Stock {
    id: number;
    symbol: string;
    name: string;
    sector?: string;
    industry?: string;
    currentPrice: number;
    avgPurchasePrice: number;
    quantity: number;
    [key: string]: any;
  }

    interface FormatCurrencyOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }



  type HandleDataUpdate = (portfolioData: PortfolioStock[], summary: { totalPortfolioValue: number; totalInvested: number; totalGainLoss: number; totalGainLossPercent: number; }) => void;

  const handleDataUpdate = useCallback(
    (portfolioData: any[], summary: PortfolioSummary) => {
      setPortfolio(mapPortfolioItemsToStocks(portfolioData));
      setPortfolioSummary(summary);
    },
    []
  );


  const handleStockClick = (stock: Stock) => {
    // Map all Yahoo Finance data fields to the stock object
    const enrichedStock = {
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      industry: stock.industry,
      currentPrice: stock.currentPrice,
      avgPurchasePrice: stock.avgPurchasePrice,
      quantity: stock.quantity,
      dayChange: stock.dayChange,
      dayChangePercent: stock.dayChangePercent,
      exchange: stock.exchange,
      // Yahoo Finance data fields
      longName: stock.name,
      regularMarketPrice: stock.currentPrice,
      regularMarketChange: stock.dayChange,
      regularMarketChangePercent: stock.dayChangePercent,
      regularMarketPreviousClose: stock.currentPrice - stock.dayChange,
      regularMarketDayHigh: stock.currentPrice * 1.02, // Estimate
      regularMarketDayLow: stock.currentPrice * 0.98, // Estimate
      regularMarketVolume: stock.volume || 0,
      marketCap: stock.marketCap || 0,
      trailingPE: stock.pe || 0,
      priceToBook: stock.priceToBook || 0,
      dividendYield: stock.dividend || 0,
      returnOnEquity: stock.roe || 0,
      currentRatio: stock.currentRatio || 0,
      debtToEquity: stock.debtToEquity || 0,
      trailingEps: stock.eps || 0,
      beta: stock.beta || 1.0,
      description: stock.description || '',
      // Use DB fields for 52-week high/low, fallback to Yahoo fields if present
      high52Week: stock.high52Week ?? stock.fiftyTwoWeekHigh ?? (stock.currentPrice ? stock.currentPrice * 1.15 : undefined),
      low52Week: stock.low52Week ?? stock.fiftyTwoWeekLow ?? (stock.currentPrice ? stock.currentPrice * 0.85 : undefined),
      currency: stock.currency || 'INR',
      volume: stock.volume || 0,
      bookValue: stock.bookValue || 0,
      pegRatio: stock.pegRatio || 0,
      enterpriseToEbitda: stock.enterpriseToEbitda || 0,
      // Technical indicators (if available)
      technicalIndicators: stock.technicalIndicators || {
        sma20: stock.currentPrice * 0.98,
        sma50: stock.currentPrice * 0.95,
        rsi: 64.2,
        macd: { line: 2.45, signal: 2.1, histogram: 0.35 }
      },
      // Historical data (if available)
      historicalData: stock.historicalData || []
    };
    
    setSelectedStock(enrichedStock);
  };


  const getRecommendationColor = (rec: Recommendation): string => {
    const colorMap: RecommendationColorMap = {
      BUY: 'bg-green-100 text-green-800 border-green-200',
      SELL: 'bg-red-100 text-red-800 border-red-200',
      HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colorMap[rec] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  interface RecommendationIconProps {
    rec: Recommendation;
  }

  const getRecommendationIcon = (rec: Recommendation): React.ReactElement => {
    switch (rec) {
      case 'BUY': return <TrendingUp className="h-4 w-4" />;
      case 'SELL': return <TrendingDown className="h-4 w-4" />;
      case 'HOLD': return <Target className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    if (portfolio.length === 0) return;
    // Function to update all stocks
    const updateAllStocks = async () => {
      try {
        await fetch('/api/stocks/update-all', { method: 'POST' });
        setLastUpdated(new Date());
      } catch (e) {
      }
    };
    updateAllStocks(); // On mount if portfolio is not empty
    const interval = setInterval(updateAllStocks, 1 * 60 * 1000); // Every 1 minute
    return () => clearInterval(interval);
  }, [portfolio.length]);

  // Real-time ticking for the "Last updated" display
  useEffect(() => {
    if (!lastUpdated) return;
    const tick = setInterval(() => setLastUpdated(new Date(lastUpdated)), 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50">
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Last updated time */}
          <div className="mb-2 text-right text-sm text-gray-500">
            {lastUpdated && (
              <span>
                Last updated: {lastUpdated.toLocaleTimeString()} ({lastUpdated.toLocaleDateString()})
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(portfolioSummary.totalPortfolioValue)}
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
                    {formatCurrency(portfolioSummary.totalInvested)}
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
                  <p className={`text-2xl font-bold ${portfolioSummary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(portfolioSummary.totalGainLoss))}
                  </p>
                  <p className={`text-sm ${portfolioSummary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{portfolioSummary.totalGainLossPercent.toFixed(2)}%</p>
                </div>
                <div className={`p-3 rounded-full ${portfolioSummary.totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  {portfolioSummary.totalGainLoss >= 0 ? <TrendingUp className="h-6 w-6 text-green-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Holdings</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolio.length}</p>
                  <p className="text-sm text-gray-500">Active positions</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <PortfolioTable 
            refreshTrigger={refreshTrigger}
            onDataUpdate={handleDataUpdate}
            onStockClick={handleStockClick}
          />

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

                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                    <TabsTrigger value="news">News & Actions</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="technicals">Technicals</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="p-6">
                    <Dashboard 
                      stock={selectedStock} 
                      formatCurrency={formatCurrency} 
                      calculateGainLoss={calculateGainLoss} 
                    />
                  </TabsContent>

                  <TabsContent value="chart" className="p-6">
                    <Chart stock={selectedStock} />
                  </TabsContent>

                  <TabsContent value="analysis" className="p-6">
                    <AIAnalysis stock={selectedStock} />
                  </TabsContent>

                  <TabsContent value="news" className="p-6">
                    <NewsAndActions stock={selectedStock} />
                  </TabsContent>

                  <TabsContent value="financials" className="p-6">
                    <Financials stock={selectedStock} />
                  </TabsContent>

                  <TabsContent value="technicals" className="p-6">
                    <Technicals 
                      stock={selectedStock} 
                      formatCurrency={formatCurrency} 
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

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

        <AddStockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStockAdded={handleStockAdded}
        />
      </div>
    </div>
  );
}