'use client';

import { BarChart2, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FinancialsProps {
  stock: any;
}

export default function Financials({ stock }: FinancialsProps) {
  // Format market cap using DB value
  const formatMarketCap = (marketCap: number | string | null | undefined) => {
    const num = typeof marketCap === 'string' ? Number(marketCap) : marketCap;
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `₹${(num / 1e6).toFixed(2)}M`;
    return `₹${num.toFixed(0)}`;
  };

  // Format number with 2 decimals if present
  const formatNumber = (val: number | string | null | undefined, decimals = 2) => {
    const num = typeof val === 'string' ? Number(val) : val;
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return num.toFixed(decimals);
  };

  // Format percent (e.g. dividend yield)
  const formatPercent = (val: number | string | null | undefined, decimals = 2) => {
    const num = typeof val === 'string' ? Number(val) : val;
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return num.toFixed(decimals) + '%';
  };

  // Use DB fields directly, fallback to 'N/A' if missing
  const financialData = {
    sector: stock.sector || 'N/A',
    industry: stock.industry || 'N/A',
    marketCap: formatMarketCap(stock.marketCap),
    peRatio: formatNumber(stock.peRatio),
    bookValue: formatNumber(stock.bookValue),
    pbRatio: formatNumber(stock.priceToBook),
    dividendYield: formatPercent(stock.dividendYield),
    high52Week: formatNumber(stock.high52Week),
    low52Week: formatNumber(stock.low52Week),
    debtToEquity: formatNumber(stock.debtToEquity),
    // Removed currency and previousClose from here
    roe: 'N/A',
    roce: 'N/A',
    promoterHolding: 'N/A',
    institutionalHolding: 'N/A',
    insiderTrades: 'N/A',
    valuationMetrics: {
      pegRatio: 'N/A',
      evEbitda: 'N/A',
      dcf: 'N/A'
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
            <Metric label="Book Value" value={financialData.bookValue} />
            <Metric label="P/B Ratio" value={financialData.pbRatio} />
            <Metric label="Dividend Yield" value={financialData.dividendYield} />
            <Metric label="52-Week High" value={financialData.high52Week} />
            <Metric label="52-Week Low" value={financialData.low52Week} />
            <Metric label="Debt-to-Equity" value={financialData.debtToEquity} />
            <Metric label="ROE" value={financialData.roe} />
            <Metric label="ROCE" value={financialData.roce} />
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

