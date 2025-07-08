'use client';

import { Activity, TrendingUp, TrendingDown, BarChart3, Target, Zap, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TechnicalsProps {
  stock: any;
  formatCurrency: (amount: number) => string;
}

export default function Technicals({ stock, formatCurrency }: TechnicalsProps) {
  const formatVolume = (volume: number | null | undefined) => {
    if (typeof volume !== 'number' || isNaN(volume)) return 'N/A';
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  // Calculate proper technical indicators from available data
  const calculateBollingerBands = (currentPrice: number, historicalData: any[]) => {
    if (!historicalData || historicalData.length < 20) {
      // Fallback calculation if no historical data
      const volatility = 0.05; // 5% volatility assumption
      return {
        upper: currentPrice * (1 + volatility * 2),
        middle: currentPrice,
        lower: currentPrice * (1 - volatility * 2)
      };
    }

    // Calculate SMA and standard deviation from last 20 days
    const last20Days = historicalData.slice(-20);
    const closes = last20Days.map(d => d.close).filter(c => c && c > 0);
    
    if (closes.length < 20) {
      const volatility = 0.05;
      return {
        upper: currentPrice * (1 + volatility * 2),
        middle: currentPrice,
        lower: currentPrice * (1 - volatility * 2)
      };
    }

    const sma = closes.reduce((sum, price) => sum + price, 0) / closes.length;
    const variance = closes.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / closes.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2)
    };
  };

  const calculateVolumeMetrics = (currentVolume: number | null, historicalData: any[]) => {
    if (!historicalData || historicalData.length === 0) {
      return {
        current: currentVolume ? formatVolume(currentVolume) : 'N/A',
        average: 'N/A',
        relative: 'N/A'
      };
    }

    const volumes = historicalData.map(d => d.volume).filter(v => v && v > 0);
    if (volumes.length === 0) {
      return {
        current: currentVolume ? formatVolume(currentVolume) : 'N/A',
        average: 'N/A',
        relative: 'N/A'
      };
    }

    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const relativeVolume = currentVolume && avgVolume > 0 ? currentVolume / avgVolume : null;

    return {
      current: currentVolume ? formatVolume(currentVolume) : 'N/A',
      average: formatVolume(avgVolume),
      relative: relativeVolume ? relativeVolume.toFixed(2) : 'N/A'
    };
  };

  const calculateMomentum = (historicalData: any[], currentPrice: number) => {
    if (!historicalData || historicalData.length < 10) {
      return 'Neutral';
    }

    const recentPrices = historicalData.slice(-10).map(d => d.close).filter(c => c && c > 0);
    if (recentPrices.length < 5) {
      return 'Neutral';
    }

    const priceChange = currentPrice - recentPrices[0];
    const percentChange = (priceChange / recentPrices[0]) * 100;
    
    // Calculate trend strength
    const priceChanges = [];
    for (let i = 1; i < recentPrices.length; i++) {
      priceChanges.push(recentPrices[i] - recentPrices[i-1]);
    }
    
    const positiveChanges = priceChanges.filter(change => change > 0).length;
    const negativeChanges = priceChanges.filter(change => change < 0).length;
    
    if (percentChange > 5 && positiveChanges > negativeChanges) {
      return 'Strong Bullish';
    } else if (percentChange > 2 && positiveChanges > negativeChanges) {
      return 'Bullish';
    } else if (percentChange < -5 && negativeChanges > positiveChanges) {
      return 'Strong Bearish';
    } else if (percentChange < -2 && negativeChanges > positiveChanges) {
      return 'Bearish';
    } else {
      return 'Neutral';
    }
  };

  // Use real technical data from Yahoo Finance historical data
  const technicalData = {
    rsi: typeof stock.technicalIndicators?.rsi === 'number' ? stock.technicalIndicators.rsi : 'N/A',
    macd: {
      value: typeof stock.technicalIndicators?.macd?.line === 'number' ? stock.technicalIndicators.macd.line : 'N/A',
      signal: typeof stock.technicalIndicators?.macd?.line === 'number' && typeof stock.technicalIndicators?.macd?.signal === 'number' 
        ? (stock.technicalIndicators.macd.line > stock.technicalIndicators.macd.signal ? 'Bullish' : 'Bearish')
        : 'N/A'
    },
    movingAverages: {
      sma20: typeof stock.technicalIndicators?.sma20 === 'number' ? stock.technicalIndicators.sma20 : 'N/A',
      sma50: typeof stock.technicalIndicators?.sma50 === 'number' ? stock.technicalIndicators.sma50 : 'N/A',
      sma200: typeof stock.technicalIndicators?.sma200 === 'number' ? stock.technicalIndicators.sma200 : 'N/A',
      ema20: typeof stock.technicalIndicators?.ema20 === 'number' ? stock.technicalIndicators.ema20 : 'N/A',
      ema50: typeof stock.technicalIndicators?.ema50 === 'number' ? stock.technicalIndicators.ema50 : 'N/A'
    },
    bollingerBands: calculateBollingerBands(stock.currentPrice, stock.historicalData),
    volume: calculateVolumeMetrics(stock.volume, stock.historicalData),
    supportResistance: {
      resistance1: stock.fiftyTwoWeekHigh ? stock.fiftyTwoWeekHigh * 0.95 : stock.currentPrice * 1.08,
      resistance2: stock.fiftyTwoWeekHigh || stock.currentPrice * 1.15,
      support1: stock.fiftyTwoWeekLow ? stock.fiftyTwoWeekLow * 1.05 : stock.currentPrice * 0.92,
      support2: stock.fiftyTwoWeekLow || stock.currentPrice * 0.85
    },
    beta: typeof stock.beta === 'number' ? stock.beta : 'N/A',
    momentum: calculateMomentum(stock.historicalData, stock.currentPrice)
  };

  const getIndicatorColor = (value: number | string, type: 'rsi' | 'relative_volume') => {
    if (type === 'rsi') {
      if (typeof value !== 'number' || isNaN(value)) return 'bg-gray-50 border-gray-200 text-gray-700';
      if (value > 70) return 'bg-red-50 border-red-200 text-red-700';
      if (value < 30) return 'bg-green-50 border-green-200 text-green-700';
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
    return 'bg-blue-50 border-blue-200 text-blue-700';
  };

  const getMomentumColor = (momentum: string) => {
    if (momentum.includes('Bullish')) return 'bg-green-50 border-green-200 text-green-700';
    if (momentum.includes('Bearish')) return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-yellow-50 border-yellow-200 text-yellow-700';
  };

  const MovingAverageRow = ({ period, value, currentPrice, maValue }: { period: string; value: string; currentPrice: number; maValue: number }) => {
    const isAbove = currentPrice > maValue;
    const isBelow = currentPrice < maValue;
    
    return (
      <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
        <span className="text-sm font-medium text-gray-700">{period}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{value}</span>
          {isAbove && <TrendingUp className="h-4 w-4 text-green-500" />}
          {isBelow && <TrendingDown className="h-4 w-4 text-red-500" />}
        </div>
      </div>
    );
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
              <p className="text-xl font-bold">{typeof technicalData.rsi === 'number' ? technicalData.rsi.toFixed(1) : technicalData.rsi}</p>
              <p className="text-xs">
                {typeof technicalData.rsi === 'number' ? (technicalData.rsi > 70 ? 'Overbought' : technicalData.rsi < 30 ? 'Oversold' : 'Neutral') : 'N/A'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium mb-1 text-blue-700">MACD</p>
              <p className="text-xl font-bold text-blue-700">{typeof technicalData.macd.value === 'number' ? technicalData.macd.value.toFixed(2) : technicalData.macd.value}</p>
              <p className="text-xs text-blue-600">{technicalData.macd.signal}</p>
            </div>
            
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm font-medium mb-1 text-indigo-700">Beta</p>
              <p className="text-xl font-bold text-indigo-700">{typeof technicalData.beta === 'number' ? technicalData.beta.toFixed(2) : technicalData.beta}</p>
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
                  value={typeof technicalData.movingAverages.sma20 === 'number' ? formatCurrency(technicalData.movingAverages.sma20) : 'N/A'} 
                  currentPrice={stock.currentPrice}
                  maValue={typeof technicalData.movingAverages.sma20 === 'number' ? technicalData.movingAverages.sma20 : 0}
                />
                <MovingAverageRow 
                  period="50-Day SMA" 
                  value={typeof technicalData.movingAverages.sma50 === 'number' ? formatCurrency(technicalData.movingAverages.sma50) : 'N/A'} 
                  currentPrice={stock.currentPrice}
                  maValue={typeof technicalData.movingAverages.sma50 === 'number' ? technicalData.movingAverages.sma50 : 0}
                />
                <MovingAverageRow 
                  period="200-Day SMA" 
                  value={typeof technicalData.movingAverages.sma200 === 'number' ? formatCurrency(technicalData.movingAverages.sma200) : 'N/A'} 
                  currentPrice={stock.currentPrice}
                  maValue={typeof technicalData.movingAverages.sma200 === 'number' ? technicalData.movingAverages.sma200 : 0}
                />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Exponential Moving Averages (EMA)</h4>
              <div className="space-y-3">
                <MovingAverageRow 
                  period="20-Day EMA" 
                  value={typeof technicalData.movingAverages.ema20 === 'number' ? formatCurrency(technicalData.movingAverages.ema20) : 'N/A'} 
                  currentPrice={stock.currentPrice}
                  maValue={typeof technicalData.movingAverages.ema20 === 'number' ? technicalData.movingAverages.ema20 : 0}
                />
                <MovingAverageRow 
                  period="50-Day EMA" 
                  value={typeof technicalData.movingAverages.ema50 === 'number' ? formatCurrency(technicalData.movingAverages.ema50) : 'N/A'} 
                  currentPrice={stock.currentPrice}
                  maValue={typeof technicalData.movingAverages.ema50 === 'number' ? technicalData.movingAverages.ema50 : 0}
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
              <BarChart3 className="h-5 w-5 text-green-600" />
              Bollinger Bands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-sm font-medium text-red-700">Upper Band</span>
                <span className="text-sm font-bold text-red-700">{formatCurrency(technicalData.bollingerBands.upper)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Middle Band</span>
                <span className="text-sm font-bold text-gray-700">{formatCurrency(technicalData.bollingerBands.middle)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-700">Lower Band</span>
                <span className="text-sm font-bold text-green-700">{formatCurrency(technicalData.bollingerBands.lower)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Volume Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Current Volume</span>
                <span className="text-sm font-bold text-blue-700">{technicalData.volume.current}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Average Volume</span>
                <span className="text-sm font-bold text-gray-700">{technicalData.volume.average}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-sm font-medium text-purple-700">Relative Volume</span>
                <span className="text-sm font-bold text-purple-700">{technicalData.volume.relative}x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support & Resistance Levels */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Support & Resistance Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-red-600">Resistance Levels</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm font-medium text-red-700">R1</span>
                  <span className="text-sm font-bold text-red-700">{formatCurrency(technicalData.supportResistance.resistance1)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm font-medium text-red-700">R2</span>
                  <span className="text-sm font-bold text-red-700">{formatCurrency(technicalData.supportResistance.resistance2)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-green-600">Support Levels</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-700">S1</span>
                  <span className="text-sm font-bold text-green-700">{formatCurrency(technicalData.supportResistance.support1)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-700">S2</span>
                  <span className="text-sm font-bold text-green-700">{formatCurrency(technicalData.supportResistance.support2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
