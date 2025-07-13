'use client';

import { BarChart2, DollarSign, TrendingUp, TrendingDown, PieChart, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  formatCurrencyRobust,
  formatPercentageRobust,
  formatMarketCapRobust,
  safeParseFloat,
  safeParseString,
  getStockOverviewRobust
} from '@/lib/utils/robust-data-utils';

interface FinancialsProps {
  stock: any;
}

export default function Financials({ stock }: FinancialsProps) {
  // Use robust data handling
  const stockOverview = getStockOverviewRobust(stock);

  // Enhanced financial data with robust handling
  const financialData = {
    // Basic info
    sector: stockOverview.basic.sector,
    industry: stockOverview.basic.industry,
    
    // Market data
    marketCap: stockOverview.market.marketCap,
    volume: stockOverview.market.volume,
    
    // Financial ratios
    peRatio: stockOverview.financial.peRatio,
    priceToBook: stockOverview.financial.priceToBook,
    priceToSales: stockOverview.financial.priceToSales,
    dividendYield: stockOverview.financial.dividendYield,
    beta: stockOverview.financial.beta,
    
    // Technical data
    high52Week: stockOverview.technical.high52Week,
    low52Week: stockOverview.technical.low52Week,
    
    // Enhanced financial ratios from new schema
    bookValue: formatCurrencyRobust(stock.bookValue),
    debtToEquity: safeParseFloat(stock.debtToEquity, 0).toFixed(2),
    currentRatio: safeParseFloat(stock.currentRatio, 0).toFixed(2),
    quickRatio: safeParseFloat(stock.quickRatio, 0).toFixed(2),
    returnOnEquity: formatPercentageRobust(stock.returnOnEquity),
    returnOnAssets: formatPercentageRobust(stock.returnOnAssets),
    
    // Financial health metrics
    revenueGrowth: formatPercentageRobust(stock.revenueGrowth),
    grossMargin: formatPercentageRobust(stock.grossMargin),
    operatingMargin: formatPercentageRobust(stock.operatingMargin),
    netMargin: formatPercentageRobust(stock.netMargin),
    
    // Additional ratios
    pegRatio: safeParseFloat(stock.pegRatio, 0).toFixed(2),
    evToEbitda: safeParseFloat(stock.evToEbitda, 0).toFixed(2),
    
    // Institutional data
    institutionalPercent: formatPercentageRobust(stock.institutionalPercent),
    insiderPercent: formatPercentageRobust(stock.insiderPercent),
    
    // ESG scores
    esgEnvironmentalScore: safeParseString(stock.esgEnvironmentalScore, 'N/A'),
    esgSocialScore: safeParseString(stock.esgSocialScore, 'N/A'),
    esgGovernanceScore: safeParseString(stock.esgGovernanceScore, 'N/A'),
    
    // Valuation metrics (enhanced)
    valuationMetrics: {
      pegRatio: safeParseFloat(stock.pegRatio, 0).toFixed(2),
      evEbitda: safeParseFloat(stock.evToEbitda, 0).toFixed(2),
      dcf: 'N/A', // Not available from current APIs
      priceToSales: stockOverview.financial.priceToSales,
      priceToBook: stockOverview.financial.priceToBook
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Availability Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Data Availability</span>
        </div>
        <p className="text-sm text-blue-700">
          Financial data is sourced from multiple APIs. Some metrics may show 'N/A' if not available from the data providers.
        </p>
      </div>

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
            <Metric label="Volume" value={financialData.volume} />
            <Metric label="P/E Ratio" value={financialData.peRatio} />
            <Metric label="P/B Ratio" value={financialData.priceToBook} />
            <Metric label="P/S Ratio" value={financialData.priceToSales} />
            <Metric label="PEG Ratio" value={financialData.pegRatio} />
            <Metric label="EV/EBITDA" value={financialData.evToEbitda} />
            <Metric label="Book Value" value={financialData.bookValue} />
            <Metric label="Dividend Yield" value={financialData.dividendYield} />
            <Metric label="Beta" value={financialData.beta} />
            <Metric label="52-Week High" value={financialData.high52Week} />
            <Metric label="52-Week Low" value={financialData.low52Week} />
            <Metric label="Debt-to-Equity" value={financialData.debtToEquity} />
            <Metric label="Current Ratio" value={financialData.currentRatio} />
            <Metric label="Quick Ratio" value={financialData.quickRatio} />
            <Metric label="ROE" value={financialData.returnOnEquity} />
            <Metric label="ROA" value={financialData.returnOnAssets} />
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Metrics */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Financial Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Metric label="Revenue Growth" value={financialData.revenueGrowth} />
            <Metric label="Gross Margin" value={financialData.grossMargin} />
            <Metric label="Operating Margin" value={financialData.operatingMargin} />
            <Metric label="Net Margin" value={financialData.netMargin} />
            <Metric label="Institutional Holding" value={financialData.institutionalPercent} />
            <Metric label="Insider Holding" value={financialData.insiderPercent} />
            <Metric label="ESG Environmental" value={financialData.esgEnvironmentalScore} />
            <Metric label="ESG Social" value={financialData.esgSocialScore} />
            <Metric label="ESG Governance" value={financialData.esgGovernanceScore} />
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
            <Metric label="P/S Ratio" value={financialData.valuationMetrics.priceToSales} />
            <Metric label="P/B Ratio" value={financialData.valuationMetrics.priceToBook} />
            <Metric label="DCF Model" value={financialData.valuationMetrics.dcf} />
          </div>
        </CardContent>
      </Card>

      {/* Financial Statements - Enhanced with available data */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-600" />
            Financial Statements Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profit & Loss */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Profit & Loss Metrics
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Revenue Growth</span>
                  <span className="text-sm font-medium text-green-800">{financialData.revenueGrowth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Gross Margin</span>
                  <span className="text-sm font-medium text-green-800">{financialData.grossMargin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Operating Margin</span>
                  <span className="text-sm font-medium text-green-800">{financialData.operatingMargin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Net Margin</span>
                  <span className="text-sm font-medium text-green-800">{financialData.netMargin}</span>
                </div>
              </div>
            </div>

            {/* Balance Sheet */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Balance Sheet Metrics
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Book Value</span>
                  <span className="text-sm font-medium text-blue-800">{financialData.bookValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Debt-to-Equity</span>
                  <span className="text-sm font-medium text-blue-800">{financialData.debtToEquity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Current Ratio</span>
                  <span className="text-sm font-medium text-blue-800">{financialData.currentRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Quick Ratio</span>
                  <span className="text-sm font-medium text-blue-800">{financialData.quickRatio}</span>
                </div>
              </div>
            </div>

            {/* Returns & Performance */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Returns & Performance
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Return on Equity</span>
                  <span className="text-sm font-medium text-purple-800">{financialData.returnOnEquity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Return on Assets</span>
                  <span className="text-sm font-medium text-purple-800">{financialData.returnOnAssets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Institutional Holding</span>
                  <span className="text-sm font-medium text-purple-800">{financialData.institutionalPercent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Insider Holding</span>
                  <span className="text-sm font-medium text-purple-800">{financialData.insiderPercent}</span>
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
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

