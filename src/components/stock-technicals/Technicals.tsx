'use client';

import { Activity, TrendingUp, TrendingDown, BarChart3, Target, Zap, Shield, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  formatCurrencyRobust,
  formatVolumeRobust,
  safeParseFloat,
  safeParseString,
  getStockOverviewRobust
} from '@/lib/utils/robust-data-utils';

interface TechnicalsProps {
  stock: any;
  formatCurrency: (amount: number) => string;
}

export default function Technicals({ stock, formatCurrency }: TechnicalsProps) {
  // Use robust data handling
  const stockOverview = getStockOverviewRobust(stock);

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
        current: currentVolume ? formatVolumeRobust(currentVolume) : 'N/A',
        average: 'N/A',
        relative: 'N/A'
      };
    }

    const volumes = historicalData.map(d => d.volume).filter(v => v && v > 0);
    if (volumes.length === 0) {
      return {
        current: currentVolume ? formatVolumeRobust(currentVolume) : 'N/A',
        average: 'N/A',
        relative: 'N/A'
      };
    }

    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const relativeVolume = currentVolume && avgVolume > 0 ? currentVolume / avgVolume : null;

    return {
      current: currentVolume ? formatVolumeRobust(currentVolume) : 'N/A',
      average: formatVolumeRobust(avgVolume),
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

  // Enhanced technical data with robust handling
  const currentPrice = safeParseFloat(stock.currentPrice, 0);
  const technicalData = {
    rsi: safeParseFloat(stock.rsi, 0),
    macd: {
      line: safeParseFloat(stock.macdLine, 0),
      signal: safeParseFloat(stock.macdSignal, 0),
      histogram: safeParseFloat(stock.macdHistogram, 0),
      trend: safeParseFloat(stock.macdLine, 0) > safeParseFloat(stock.macdSignal, 0) ? 'Bullish' : 'Bearish'
    },
    movingAverages: {
      sma20: safeParseFloat(stock.sma20, 0),
      sma50: safeParseFloat(stock.sma50, 0),
      sma200: safeParseFloat(stock.sma200, 0),
      ema20: safeParseFloat(stock.ema20, 0),
      ema50: safeParseFloat(stock.ema50, 0)
    },
    bollingerBands: calculateBollingerBands(currentPrice, stock.historicalData || []),
    volume: calculateVolumeMetrics(safeParseFloat(stock.volume, 0), stock.historicalData || []),
    supportResistance: {
      resistance1: safeParseFloat(stock.resistanceLevel1, currentPrice * 1.08),
      resistance2: safeParseFloat(stock.resistanceLevel2, currentPrice * 1.15),
      support1: safeParseFloat(stock.supportLevel1, currentPrice * 0.92),
      support2: safeParseFloat(stock.supportLevel2, currentPrice * 0.85)
    },
    atr: safeParseFloat(stock.atr, 0),
    beta: stockOverview.financial.beta,
    momentum: calculateMomentum(stock.historicalData || [], currentPrice)
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
      {/* Data Availability Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Technical Data Availability</span>
        </div>
        <p className="text-sm text-blue-700">
          Technical indicators are calculated from available price data. Some indicators may show 'N/A' if insufficient historical data is available.
        </p>
      </div>

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
              <p className="text-xl font-bold">
                {technicalData.rsi > 0 ? technicalData.rsi.toFixed(1) : 'N/A'}
              </p>
              <p className="text-xs">
                {technicalData.rsi > 0 ? 
                  (technicalData.rsi > 70 ? 'Overbought' : technicalData.rsi < 30 ? 'Oversold' : 'Neutral') : 'N/A'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium mb-1 text-blue-700">MACD</p>
              <p className="text-xl font-bold text-blue-800">
                {technicalData.macd.line > 0 ? technicalData.macd.line.toFixed(2) : 'N/A'}
              </p>
              <p className="text-xs text-blue-600">
                {technicalData.macd.trend}
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium mb-1 text-green-700">Beta</p>
              <p className="text-xl font-bold text-green-800">{technicalData.beta}</p>
              <p className="text-xs text-green-600">
                {technicalData.beta !== 'N/A' ? 
                  (parseFloat(technicalData.beta) > 1 ? 'High Volatility' : 'Low Volatility') : 'N/A'}
              </p>
            </div>

            <div className={`text-center p-4 rounded-lg border ${getMomentumColor(technicalData.momentum)}`}>
              <p className="text-sm font-medium mb-1">Momentum</p>
              <p className="text-xl font-bold">{technicalData.momentum}</p>
              <p className="text-xs">10-day trend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moving Averages */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Moving Averages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <MovingAverageRow 
              period="SMA 20" 
              value={technicalData.movingAverages.sma20 > 0 ? formatCurrencyRobust(technicalData.movingAverages.sma20) : 'N/A'} 
              currentPrice={currentPrice} 
              maValue={technicalData.movingAverages.sma20} 
            />
            <MovingAverageRow 
              period="SMA 50" 
              value={technicalData.movingAverages.sma50 > 0 ? formatCurrencyRobust(technicalData.movingAverages.sma50) : 'N/A'} 
              currentPrice={currentPrice} 
              maValue={technicalData.movingAverages.sma50} 
            />
            <MovingAverageRow 
              period="SMA 200" 
              value={technicalData.movingAverages.sma200 > 0 ? formatCurrencyRobust(technicalData.movingAverages.sma200) : 'N/A'} 
              currentPrice={currentPrice} 
              maValue={technicalData.movingAverages.sma200} 
            />
            <MovingAverageRow 
              period="EMA 20" 
              value={technicalData.movingAverages.ema20 > 0 ? formatCurrencyRobust(technicalData.movingAverages.ema20) : 'N/A'} 
              currentPrice={currentPrice} 
              maValue={technicalData.movingAverages.ema20} 
            />
            <MovingAverageRow 
              period="EMA 50" 
              value={technicalData.movingAverages.ema50 > 0 ? formatCurrencyRobust(technicalData.movingAverages.ema50) : 'N/A'} 
              currentPrice={currentPrice} 
              maValue={technicalData.movingAverages.ema50} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Support & Resistance */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Support & Resistance Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-700 mb-3">Resistance Levels</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                  <span className="text-sm text-red-700">R1</span>
                  <span className="text-sm font-bold text-red-800">
                    {formatCurrencyRobust(technicalData.supportResistance.resistance1)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                  <span className="text-sm text-red-700">R2</span>
                  <span className="text-sm font-bold text-red-800">
                    {formatCurrencyRobust(technicalData.supportResistance.resistance2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 mb-3">Support Levels</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700">S1</span>
                  <span className="text-sm font-bold text-green-800">
                    {formatCurrencyRobust(technicalData.supportResistance.support1)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700">S2</span>
                  <span className="text-sm font-bold text-green-800">
                    {formatCurrencyRobust(technicalData.supportResistance.support2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Analysis */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Volume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700 mb-1">Current Volume</p>
              <p className="text-xl font-bold text-blue-800">{technicalData.volume.current}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700 mb-1">Average Volume</p>
              <p className="text-xl font-bold text-green-800">{technicalData.volume.average}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-700 mb-1">Relative Volume</p>
              <p className="text-xl font-bold text-purple-800">{technicalData.volume.relative}</p>
              <p className="text-xs text-purple-600">
                {technicalData.volume.relative !== 'N/A' ? 
                  (parseFloat(technicalData.volume.relative) > 1.5 ? 'High' : 
                   parseFloat(technicalData.volume.relative) < 0.5 ? 'Low' : 'Normal') : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bollinger Bands */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Bollinger Bands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-700 mb-1">Upper Band</p>
              <p className="text-xl font-bold text-red-800">
                {formatCurrencyRobust(technicalData.bollingerBands.upper)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700 mb-1">Middle Band (SMA)</p>
              <p className="text-xl font-bold text-blue-800">
                {formatCurrencyRobust(technicalData.bollingerBands.middle)}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700 mb-1">Lower Band</p>
              <p className="text-xl font-bold text-green-800">
                {formatCurrencyRobust(technicalData.bollingerBands.lower)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Current Position:</strong> {currentPrice > technicalData.bollingerBands.upper ? 'Above Upper Band (Overbought)' :
                                                currentPrice < technicalData.bollingerBands.lower ? 'Below Lower Band (Oversold)' :
                                                'Within Bands (Normal)'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Technical Metrics */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Additional Technical Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">ATR</span>
              <span className="text-sm font-medium text-gray-900">
                {technicalData.atr > 0 ? formatCurrencyRobust(technicalData.atr) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">MACD Signal</span>
              <span className="text-sm font-medium text-gray-900">
                {technicalData.macd.signal > 0 ? formatCurrencyRobust(technicalData.macd.signal) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">MACD Histogram</span>
              <span className="text-sm font-medium text-gray-900">
                {technicalData.macd.histogram !== 0 ? formatCurrencyRobust(technicalData.macd.histogram) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Volatility (Beta)</span>
              <span className="text-sm font-medium text-gray-900">{technicalData.beta}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
