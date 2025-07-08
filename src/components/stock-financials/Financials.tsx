'use client';

import { BarChart2, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FinancialsProps {
  stock: any;
}

export default function Financials({ stock }: FinancialsProps) {
  const formatMarketCap = (marketCap: number | null | undefined) => {
    if (typeof marketCap !== 'number' || isNaN(marketCap)) return 'N/A';
    if (marketCap >= 1e12) return `₹${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `₹${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `₹${(marketCap / 1e6).toFixed(2)}M`;
    return `₹${marketCap.toFixed(0)}`;
  };

  // Use real Yahoo Finance data instead of mock data
  const financialData = {
    sector: stock.sector || 'N/A',
    industry: stock.industry || 'N/A',
    marketCap: stock.marketCap ? formatMarketCap(stock.marketCap) : 'N/A',
    peRatio: stock.trailingPE && typeof stock.trailingPE === 'number' ? stock.trailingPE.toFixed(2) : 'N/A',
    eps: stock.trailingEps && typeof stock.trailingEps === 'number' ? stock.trailingEps.toFixed(2) : 'N/A',
    roe: stock.returnOnEquity && typeof stock.returnOnEquity === 'number' ? (stock.returnOnEquity * 100).toFixed(2) + '%' : 'N/A',
    roce: stock.returnOnEquity && typeof stock.returnOnEquity === 'number' ? (stock.returnOnEquity * 100).toFixed(2) + '%' : 'N/A', // Using ROE as proxy
    debtToEquity: stock.debtToEquity && typeof stock.debtToEquity === 'number' ? stock.debtToEquity.toFixed(2) : 'N/A',
    bookValue: stock.bookValue && typeof stock.bookValue === 'number' ? stock.bookValue.toFixed(2) : 'N/A',
    pbRatio: stock.priceToBook && typeof stock.priceToBook === 'number' ? stock.priceToBook.toFixed(2) : 'N/A',
    dividendYield: stock.dividendYield && typeof stock.dividendYield === 'number' ? stock.dividendYield.toFixed(2) + '%' : 'N/A',
    promoterHolding: 'N/A', // Not available from Yahoo Finance
    institutionalHolding: 'N/A', // Not available from Yahoo Finance
    insiderTrades: 'N/A', // Not available from Yahoo Finance
    valuationMetrics: {
      pegRatio: stock.pegRatio && typeof stock.pegRatio === 'number' ? stock.pegRatio.toFixed(2) : 'N/A',
      evEbitda: stock.enterpriseToEbitda && typeof stock.enterpriseToEbitda === 'number' ? stock.enterpriseToEbitda.toFixed(2) : 'N/A',
      dcf: 'N/A' // Not available from Yahoo Finance
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Key Financial Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Metric label="Sector" value={financialData.sector} />
            <Metric label="Industry" value={financialData.industry} />
            <Metric label="Market Cap" value={financialData.marketCap} />
            <Metric label="P/E Ratio" value={financialData.peRatio} />
            <Metric label="EPS" value={financialData.eps} />
            <Metric label="ROE" value={financialData.roe} />
            <Metric label="ROCE" value={financialData.roce} />
            <Metric label="Debt-to-Equity" value={financialData.debtToEquity} />
            <Metric label="Book Value" value={financialData.bookValue} />
            <Metric label="P/B Ratio" value={financialData.pbRatio} />
            <Metric label="Dividend Yield" value={financialData.dividendYield} />
            <Metric label="Promoter Holding" value={financialData.promoterHolding} />
            <Metric label="Institutional Holding" value={financialData.institutionalHolding} />
            <Metric label="Insider Trades" value={financialData.insiderTrades} />
          </div>
        </CardContent>
      </Card>

      {/* Valuation Metrics */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Valuation Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Metric label="PEG Ratio" value={financialData.valuationMetrics.pegRatio} />
            <Metric label="EV/EBITDA" value={financialData.valuationMetrics.evEbitda} />
            <Metric label="DCF / Dividend Model" value={financialData.valuationMetrics.dcf} />
          </div>
        </CardContent>
      </Card>

      {/* Financial Statements - Not available from Yahoo Finance quote API */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-600" />
            Financial Statements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profit & Loss */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Profit & Loss
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Revenue</span>
                  <span className="text-sm font-medium text-green-800">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Gross Profit</span>
                  <span className="text-sm font-medium text-green-800">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Operating Income</span>
                  <span className="text-sm font-medium text-green-800">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Net Income</span>
                  <span className="text-sm font-medium text-green-800">N/A</span>
                </div>
              </div>
            </div>

            {/* Balance Sheet */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Balance Sheet
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Assets</span>
                  <span className="text-sm font-medium text-blue-800">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Liabilities</span>
                  <span className="text-sm font-medium text-blue-800">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Shareholders' Equity</span>
                  <span className="text-sm font-medium text-blue-800">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Debt</span>
                  <span className="text-sm font-medium text-blue-800">N/A</span>
                </div>
              </div>
            </div>

            {/* Cash Flow */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cash Flow (TTM)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Operating Cash Flow</span>
                  <span className="text-sm font-medium text-purple-800">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Free Cash Flow</span>
                  <span className="text-sm font-medium text-purple-800">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Investing Cash Flow</span>
                  <span className="text-sm font-medium text-purple-800">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Financing Cash Flow</span>
                  <span className="text-sm font-medium text-purple-800">N/A</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

