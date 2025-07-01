'use client';

import { BarChart2, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FinancialsProps {
  stock: any;
}

export default function Financials({ stock }: FinancialsProps) {
  // Mock financial data
  const financialData = {
    sector: stock.sector,
    industry: stock.industry,
    marketCap: stock.marketCap,
    peRatio: stock.pe,
    eps: '5.73', // Example EPS
    roe: '27%',
    roce: '18%',
    debtToEquity: '0.25',
    bookValue: '23.34',
    pbRatio: '3.45',
    dividendYield: stock.dividend.toFixed(2),
    promoterHolding: '45%',
    institutionalHolding: '35%',
    insiderTrades: '2',
    valuationMetrics: {
      pegRatio: '1.15',
      evEbitda: '7.8',
      dcf: '15.2'
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
            <Metric label="Dividend Yield" value={financialData.dividendYield + '%'} />
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

      {/* Financial Statements */}
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
                Profit & Loss (TTM)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Revenue</span>
                  <span className="text-sm font-medium text-green-800">$394.3B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Gross Profit</span>
                  <span className="text-sm font-medium text-green-800">$169.1B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Operating Income</span>
                  <span className="text-sm font-medium text-green-800">$114.3B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Net Income</span>
                  <span className="text-sm font-medium text-green-800">$99.8B</span>
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
                  <span className="text-sm font-medium text-blue-800">$352.8B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Liabilities</span>
                  <span className="text-sm font-medium text-blue-800">$290.4B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Shareholders' Equity</span>
                  <span className="text-sm font-medium text-blue-800">$62.4B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Debt</span>
                  <span className="text-sm font-medium text-blue-800">$104.6B</span>
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
                  <span className="text-sm font-medium text-purple-800">$104.0B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Free Cash Flow</span>
                  <span className="text-sm font-medium text-purple-800">$99.6B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Investing Cash Flow</span>
                  <span className="text-sm font-medium text-purple-800">-$4.4B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Financing Cash Flow</span>
                  <span className="text-sm font-medium text-purple-800">-$93.4B</span>
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
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

