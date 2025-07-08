'use client';

import { BarChart2, ArrowDown, ArrowUp, Activity, Shield, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AIAnalysisProps {
  stock: any;
}

export default function AIAnalysis({ stock }: AIAnalysisProps) {
  // AI analysis data - not available from Yahoo Finance
  const sentimentData = {
    sentiment: "N/A",
    recommendation: "N/A",
    riskScore: 0,
    volatility: "N/A",
    prediction: "N/A"
  };

  const patternDetection = [
    "No pattern detection available from Yahoo Finance"
  ];

  return (
    <div className="space-y-6">
      {/* AI Sentiment Analysis */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-pink-600" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:flex gap-4 justify-around">
            <div className="text-center">
              <p className="text-sm text-gray-600">Overall Sentiment</p>
              <p className={`text-lg font-bold ${sentimentData.sentiment === 'Positive' ? 'text-green-600' : sentimentData.sentiment === 'N/A' ? 'text-gray-500' : 'text-red-600'}`}>
                {sentimentData.sentiment}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Buy / Hold / Sell</p>
              <p className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-lg font-bold 
                ${sentimentData.recommendation === 'BUY' ? 'text-green-600 bg-green-100' :
                  sentimentData.recommendation === 'SELL' ? 'text-red-600 bg-red-100' :
                  sentimentData.recommendation === 'N/A' ? 'text-gray-500 bg-gray-100' :
                  'text-yellow-600 bg-yellow-100'}`}>
                {sentimentData.recommendation}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Risk Score</p>
              <p className="text-lg font-bold text-gray-900">{sentimentData.riskScore === 0 ? 'N/A' : (sentimentData.riskScore * 100).toFixed(1) + '%'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Volatility</p>
              <p className="text-lg font-bold text-gray-900">{sentimentData.volatility}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-based Predictions */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-green-600" />
            AI-based Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-green-50 rounded-lg flex items-center justify-center border border-green-200">
            <p className="text-lg font-bold text-gray-500">{sentimentData.prediction}</p>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Detection */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Pattern Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            {patternDetection.map((pattern, index) => (
              <li key={index} className="text-sm text-gray-800">{pattern}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Technical Health Summary */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300">
            <p className="text-sm text-gray-800">
              AI analysis data is not available from Yahoo Finance. This feature requires additional data sources or AI services.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
