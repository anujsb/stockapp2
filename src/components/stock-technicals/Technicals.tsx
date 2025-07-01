'use client';

import { Activity, TrendingUp, TrendingDown, BarChart3, Target, Zap, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TechnicalsProps {
  stock: any;
  formatCurrency: (amount: number) => string;
}

export default function Technicals({ stock, formatCurrency }: TechnicalsProps) {
  // Mock technical data
  const technicalData = {
    rsi: 64.2,
    macd: { value: 2.45, signal: 'Bullish' },
    movingAverages: {
      sma20: stock.currentPrice * 0.98,
      sma50: stock.currentPrice * 0.95,
      sma200: stock.currentPrice * 0.92,
      ema20: stock.currentPrice * 0.985,
      ema50: stock.currentPrice * 0.96
    },
    bollingerBands: {
      upper: stock.currentPrice * 1.05,
      middle: stock.currentPrice,
      lower: stock.currentPrice * 0.95
    },
    volume: {
      current: '45.2M',
      average: '42.1M',
      relative: 1.07
    },
    supportResistance: {
      resistance1: stock.currentPrice * 1.08,
      resistance2: stock.currentPrice * 1.15,
      support1: stock.currentPrice * 0.92,
      support2: stock.currentPrice * 0.85
    },
    beta: stock.beta,
    momentum: 'Strong Bullish'
  };

  const getIndicatorColor = (value: number, type: 'rsi' | 'relative_volume') => {
    if (type === 'rsi') {
      if (value > 70) return 'text-red-600 bg-red-50';
      if (value < 30) return 'text-green-600 bg-green-50';
      return 'text-yellow-600 bg-yellow-50';
    }
    if (type === 'relative_volume') {
      if (value > 1.2) return 'text-green-600 bg-green-50';
      if (value < 0.8) return 'text-red-600 bg-red-50';
      return 'text-gray-600 bg-gray-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getMomentumColor = (momentum: string) => {
    if (momentum.includes('Strong Bullish')) return 'text-green-700 bg-green-100 border-green-300';
    if (momentum.includes('Bullish')) return 'text-green-600 bg-green-50 border-green-200';
    if (momentum.includes('Strong Bearish')) return 'text-red-700 bg-red-100 border-red-300';
    if (momentum.includes('Bearish')) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Key Technical Indicators */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Key Technical Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg border ${getIndicatorColor(technicalData.rsi, 'rsi')}`}>
              <p className="text-sm font-medium mb-1">RSI (14)</p>
              <p className="text-xl font-bold">{technicalData.rsi.toFixed(1)}</p>
              <p className="text-xs">
                {technicalData.rsi > 70 ? 'Overbought' : technicalData.rsi < 30 ? 'Oversold' : 'Neutral'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium mb-1 text-blue-700">MACD</p>
              <p className="text-xl font-bold text-blue-700">{technicalData.macd.value.toFixed(2)}</p>
              <p className="text-xs text-blue-600">{technicalData.macd.signal}</p>
            </div>
            
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm font-medium mb-1 text-indigo-700">Beta</p>
              <p className="text-xl font-bold text-indigo-700">{technicalData.beta}</p>
              <p className="text-xs text-indigo-600">vs Market</p>
            </div>
            
            <div className={`text-center p-4 rounded-lg border ${getMomentumColor(technicalData.momentum)}`}>
              <p className="text-sm font-medium mb-1">Momentum</p>
              <p className="text-sm font-bold">{technicalData.momentum}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moving Averages */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Moving Averages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Simple Moving Averages (SMA)</h4>
              <div className="space-y-3">
                <MovingAverageRow 
                  period="20-Day SMA" 
                  value={formatCurrency(technicalData.movingAverages.sma20)} 
                  currentPrice={stock.currentPrice}
                  maValue={technicalData.movingAverages.sma20}
                />
                <MovingAverageRow 
                  period="50-Day SMA" 
                  value={formatCurrency(technicalData.movingAverages.sma50)} 
                  currentPrice={stock.currentPrice}
                  maValue={technicalData.movingAverages.sma50}
                />
                <MovingAverageRow 
                  period="200-Day SMA" 
                  value={formatCurrency(technicalData.movingAverages.sma200)} 
                  currentPrice={stock.currentPrice}
                  maValue={technicalData.movingAverages.sma200}
                />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Exponential Moving Averages (EMA)</h4>
              <div className="space-y-3">
                <MovingAverageRow 
                  period="20-Day EMA" 
                  value={formatCurrency(technicalData.movingAverages.ema20)} 
                  currentPrice={stock.currentPrice}
                  maValue={technicalData.movingAverages.ema20}
                />
                <MovingAverageRow 
                  period="50-Day EMA" 
                  value={formatCurrency(technicalData.movingAverages.ema50)} 
                  currentPrice={stock.currentPrice}
                  maValue={technicalData.movingAverages.ema50}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bollinger Bands & Volume Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Bollinger Bands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-700">Upper Band</span>
                <span className="font-bold text-red-700">{formatCurrency(technicalData.bollingerBands.upper)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Middle Band (SMA 20)</span>
                <span className="font-bold text-blue-700">{formatCurrency(technicalData.bollingerBands.middle)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-700">Lower Band</span>
                <span className="font-bold text-green-700">{formatCurrency(technicalData.bollingerBands.lower)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Volume Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Volume</span>
                <span className="font-semibold text-gray-900">{technicalData.volume.current}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Volume (30D)</span>
                <span className="font-semibold text-gray-900">{technicalData.volume.average}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Relative Volume</span>
                <span className={`font-semibold px-2 py-1 rounded ${getIndicatorColor(technicalData.volume.relative, 'relative_volume')}`}>
                  {technicalData.volume.relative.toFixed(2)}x
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support & Resistance Levels */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Support & Resistance Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Resistance Levels
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-600">R2 (Strong)</span>
                  <span className="font-semibold text-red-700">{formatCurrency(technicalData.supportResistance.resistance2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-600">R1 (Near-term)</span>
                  <span className="font-semibold text-red-700">{formatCurrency(technicalData.supportResistance.resistance1)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Support Levels
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-600">S1 (Near-term)</span>
                  <span className="font-semibold text-green-700">{formatCurrency(technicalData.supportResistance.support1)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-600">S2 (Strong)</span>
                  <span className="font-semibold text-green-700">{formatCurrency(technicalData.supportResistance.support2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MovingAverageRowProps {
  period: string;
  value: string;
  currentPrice: number;
  maValue: number;
}

function MovingAverageRow({ period, value, currentPrice, maValue }: MovingAverageRowProps) {
  const isAbove = currentPrice > maValue;
  
  return (
    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
      <span className="text-sm text-gray-600">{period}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">{value}</span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
          isAbove ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isAbove ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isAbove ? 'Above' : 'Below'}
        </span>
      </div>
    </div>
  );
}
