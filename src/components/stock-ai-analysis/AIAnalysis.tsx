// 'use client';

// import { useEffect, useState } from 'react';
// import { BarChart2, ArrowUp, Activity, Shield, RefreshCw, Info, CheckCircle, AlertTriangle, TrendingUp, Target } from 'lucide-react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// interface AIAnalysisProps {
//   stock: any;
// }

// function parseAIResponse(data: any): any {
//   // Handles code block, stringified JSON, or object
//   if (!data) return null;
//   if (typeof data === 'object' && !('raw' in data)) return data;
//   if (typeof data === 'string') {
//     let str = data.trim();
//     if (str.startsWith('```json')) str = str.replace(/^```json/, '').replace(/```$/, '').trim();
//     if (str.startsWith('```')) str = str.replace(/^```/, '').replace(/```$/, '').trim();
//     try {
//       return JSON.parse(str);
//     } catch {
//       try {
//         // eslint-disable-next-line no-eval
//         return eval('(' + str + ')');
//       } catch {
//         return { raw: data };
//       }
//     }
//   }
//   // If we have a { raw: ... } object, try to parse its value
//   if (typeof data === 'object' && 'raw' in data && typeof data.raw === 'string') {
//     let str = data.raw.trim();
//     if (str.startsWith('```json')) str = str.replace(/^```json/, '').replace(/```$/, '').trim();
//     if (str.startsWith('```')) str = str.replace(/^```/, '').replace(/```$/, '').trim();
//     try {
//       return JSON.parse(str);
//     } catch {
//       try {
//         // eslint-disable-next-line no-eval
//         return eval('(' + str + ')');
//       } catch {
//         return data;
//       }
//     }
//   }
//   return data;
// }

// function getBadgeColor(val: string) {
//   if (!val) return 'bg-gray-200 text-gray-600';
//   if (/buy/i.test(val)) return 'bg-green-100 text-green-700';
//   if (/sell/i.test(val)) return 'bg-red-100 text-red-700';
//   if (/hold/i.test(val)) return 'bg-yellow-100 text-yellow-700';
//   if (/positive/i.test(val)) return 'bg-green-100 text-green-700';
//   if (/negative/i.test(val)) return 'bg-red-100 text-red-700';
//   if (/neutral/i.test(val)) return 'bg-gray-100 text-gray-700';
//   return 'bg-blue-100 text-blue-700';
// }

// function RiskBar({ score }: { score: number }) {
//   const percent = Math.max(0, Math.min(1, score || 0));
//   let color = 'bg-green-400';
//   if (percent > 0.66) color = 'bg-red-500';
//   else if (percent > 0.33) color = 'bg-yellow-400';
//   return (
//     <div className="flex items-center gap-2">
//       <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
//         <div className={`h-2 rounded-full transition-all duration-300 ${color}`} style={{ width: `${percent * 100}%` }} />
//       </div>
//       <span className="text-xs text-gray-700 font-medium">{(percent * 100).toFixed(0)}%</span>
//     </div>
//   );
// }

// function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
//   return (
//     <span className="relative group cursor-pointer">
//       {children}
//       <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap shadow-lg">
//         {text}
//       </span>
//     </span>
//   );
// }

// const metricTooltips = {
//   sentiment: 'AI-determined overall market sentiment for this stock.',
//   recommendation: 'AI recommendation: Buy, Hold, or Sell.',
//   riskScore: 'AI-assigned risk score (0 = low risk, 1 = high risk).',
//   volatility: 'AI-assessed price volatility.',
// };

// export default function AIAnalysis({ stock }: AIAnalysisProps) {
//   const [analysis, setAnalysis] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [timestamp, setTimestamp] = useState<string | null>(null);
//   const [regenKey, setRegenKey] = useState(0);

//   const fetchAnalysis = () => {
//     if (!stock || !stock.symbol) return;
//     setLoading(true);
//     setError(null);
//     setAnalysis(null);
//     setTimestamp(null);
//     const payload = {
//       symbol: stock.symbol,
//       name: stock.name || stock.longName || '',
//       sector: stock.sector || '',
//       industry: stock.industry || '',
//       description: stock.description || '',
//       currentPrice: stock.currentPrice || stock.regularMarketPrice || '',
//       peRatio: stock.trailingPE || '',
//       marketCap: stock.marketCap || '',
//       otherData: stock
//     };
//     fetch(`/api/stocks/${encodeURIComponent(stock.symbol)}/ai-analysis`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     })
//       .then(async (res) => {
//         if (!res.ok) throw new Error(await res.text());
//         return res.json();
//       })
//       .then((data) => {
//         setAnalysis(parseAIResponse(data.analysis));
//         setTimestamp(data.generatedAt || null);
//         setLoading(false);
//       })
//       .catch(() => {
//         setError('Failed to fetch AI analysis');
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchAnalysis();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [stock, regenKey]);

//   const sentiment = analysis?.sentiment || 'N/A';
//   const recommendation = analysis?.recommendation || 'N/A';
//   const riskScore = typeof analysis?.riskScore === 'number' ? analysis.riskScore : (parseFloat(analysis?.riskScore) || 0);
//   const volatility = analysis?.volatility || 'N/A';
//   const prediction = analysis?.prediction || '';
//   const explanation = analysis?.explanation || '';

//   const strengths = analysis?.strengths || '';
//   const weaknesses = analysis?.weaknesses || '';
//   const confidence = analysis?.confidence || '';
//   const nextSteps = analysis?.nextSteps || '';

//   // Only show extra fields if there are any besides the standard ones
//   const extraFields = analysis && typeof analysis === 'object'
//     ? Object.entries(analysis).filter(([k]) => !['sentiment','recommendation','riskScore','volatility','prediction','explanation'].includes(k))
//     : [];

//   // Loading skeletons
//   const Skeleton = ({ className = '' }: { className?: string }) => (
//     <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center mb-2">
//         {timestamp && (
//           <span className="text-xs text-gray-400">Last updated: {new Date(timestamp).toLocaleString()}</span>
//         )}
//         <button
//           className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 transition"
//           onClick={() => setRegenKey((k) => k + 1)}
//           disabled={loading}
//         >
//           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//           Regenerate
//         </button>
//       </div>
//       {loading && (
//         <div className="space-y-4">
//           <Skeleton className="h-24 w-full" />
//           <Skeleton className="h-20 w-full" />
//           <Skeleton className="h-20 w-full" />
//         </div>
//       )}
//       {error && <div className="text-center text-red-500">{error}</div>}
//       {!loading && !error && (
//         <>
//           {/* Sentiment & Recommendation */}
//           <Card className="shadow-md border border-gray-100">
//             <CardHeader className="pb-2 flex flex-row items-center gap-2">
//               <BarChart2 className="h-5 w-5 text-pink-600" />
//               <CardTitle className="text-lg font-bold">Sentiment & Recommendation</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                 <div className="flex flex-col items-center">
//                   <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
//                     Sentiment
//                     <Tooltip text={metricTooltips.sentiment}><Info className="w-3 h-3 text-gray-400" /></Tooltip>
//                   </span>
//                   <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getBadgeColor(sentiment)}`}>{sentiment}</span>
//                 </div>
//                 <div className="flex flex-col items-center">
//                   <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
//                     Recommendation
//                     <Tooltip text={metricTooltips.recommendation}><Info className="w-3 h-3 text-gray-400" /></Tooltip>
//                   </span>
//                   <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getBadgeColor(recommendation)}`}>{recommendation}</span>
//                 </div>
//                 <div className="flex flex-col items-center">
//                   <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
//                     Risk Score
//                     <Tooltip text={metricTooltips.riskScore}><Info className="w-3 h-3 text-gray-400" /></Tooltip>
//                   </span>
//                   <RiskBar score={riskScore} />
//                 </div>
//                 <div className="flex flex-col items-center">
//                   <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
//                     Volatility
//                     <Tooltip text={metricTooltips.volatility}><Info className="w-3 h-3 text-gray-400" /></Tooltip>
//                   </span>
//                   <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getBadgeColor(volatility)}`}>{volatility}</span>
//                 </div>
//               </div>
//               {explanation && (
//                 <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded text-sm text-gray-800 mt-2">
//                   <span className="font-semibold text-blue-700">AI Explanation:</span> {explanation}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* AI-based Prediction */}
//           {prediction && (
//             <Card className="shadow-md border border-gray-100">
//               <CardHeader className="pb-2 flex flex-row items-center gap-2">
//                 <ArrowUp className="h-5 w-5 text-green-600" />
//                 <CardTitle className="text-lg font-bold">AI-based Prediction</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="bg-green-50 border border-green-200 rounded p-4 text-center text-lg font-semibold text-green-800">
//                   {prediction}
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Pattern Detection */}
//           <Card className="shadow-md border border-gray-100">
//             <CardHeader className="pb-2 flex flex-row items-center gap-2">
//               <Activity className="h-5 w-5 text-orange-600" />
//               <CardTitle className="text-lg font-bold">Pattern Detection</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="list-disc list-inside space-y-2 text-gray-700">
//                 <li>Pattern detection is not available in this version.</li>
//               </ul>
//             </CardContent>
//           </Card>

//           {/* Technical Health Summary */}
//           <Card className="shadow-md border border-gray-100">
//             <CardHeader className="pb-2 flex flex-row items-center gap-2">
//               <Shield className="h-5 w-5 text-blue-600" />
//               <CardTitle className="text-lg font-bold">Health Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded text-sm text-gray-800">
//                 {explanation || 'AI analysis data is not available from Yahoo Finance. This feature requires additional data sources or AI services.'}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Strengths */}
//           {strengths && (
//             <Card className="shadow-md border border-green-200">
//               <CardHeader className="pb-2 flex flex-row items-center gap-2">
//                 <CheckCircle className="h-5 w-5 text-green-600" />
//                 <CardTitle className="text-lg font-bold">Strengths</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-green-800 text-sm">{strengths}</div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Weaknesses */}
//           {weaknesses && (
//             <Card className="shadow-md border border-yellow-200">
//               <CardHeader className="pb-2 flex flex-row items-center gap-2">
//                 <AlertTriangle className="h-5 w-5 text-yellow-600" />
//                 <CardTitle className="text-lg font-bold">Weaknesses / Risks</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-yellow-800 text-sm">{weaknesses}</div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Confidence */}
//           {confidence && (
//             <Card className="shadow-md border border-blue-200">
//               <CardHeader className="pb-2 flex flex-row items-center gap-2">
//                 <TrendingUp className="h-5 w-5 text-blue-600" />
//                 <CardTitle className="text-lg font-bold">AI Confidence</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-blue-800 text-sm">{confidence}</div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Next Steps */}
//           {nextSteps && (
//             <Card className="shadow-md border border-purple-200">
//               <CardHeader className="pb-2 flex flex-row items-center gap-2">
//                 <Target className="h-5 w-5 text-purple-600" />
//                 <CardTitle className="text-lg font-bold">Next Steps</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-purple-800 text-sm">{nextSteps}</div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Extra fields if present */}
//           {extraFields.length > 0 && (
//             <Card className="shadow-md border border-gray-100">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-base font-semibold text-gray-700">Other AI Insights</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ul className="text-sm text-gray-700 space-y-1">
//                   {extraFields.map(([k, v]) => (
//                     <li key={k}><span className="font-medium">{k}:</span> {String(v)}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>
//           )}
//         </>
//       )}
//     </div>
//   );
// }



'use client';

import { useEffect, useState } from 'react';
import { BarChart2, ArrowUp, Activity, Shield, RefreshCw, Info, CheckCircle, AlertTriangle, TrendingUp, Target, Brain, Clock, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface AIAnalysisProps {
  stock: any;
}

function parseAIResponse(data: any): any {
  // Handles code block, stringified JSON, or object
  if (!data) return null;
  if (typeof data === 'object' && !('raw' in data)) return data;
  if (typeof data === 'string') {
    let str = data.trim();
    if (str.startsWith('```json')) str = str.replace(/^```json/, '').replace(/```$/, '').trim();
    if (str.startsWith('```')) str = str.replace(/^```/, '').replace(/```$/, '').trim();
    try {
      return JSON.parse(str);
    } catch {
      try {
        // eslint-disable-next-line no-eval
        return eval('(' + str + ')');
      } catch {
        return { raw: data };
      }
    }
  }
  // If we have a { raw: ... } object, try to parse its value
  if (typeof data === 'object' && 'raw' in data && typeof data.raw === 'string') {
    let str = data.raw.trim();
    if (str.startsWith('```json')) str = str.replace(/^```json/, '').replace(/```$/, '').trim();
    if (str.startsWith('```')) str = str.replace(/^```/, '').replace(/```$/, '').trim();
    try {
      return JSON.parse(str);
    } catch {
      try {
        // eslint-disable-next-line no-eval
        return eval('(' + str + ')');
      } catch {
        return data;
      }
    }
  }
  return data;
}

function getBadgeVariant(val: string): "default" | "secondary" | "destructive" | "outline" {
  if (!val) return 'secondary';
  if (/buy|positive/i.test(val)) return 'default';
  if (/sell|negative/i.test(val)) return 'destructive';
  if (/hold|neutral/i.test(val)) return 'outline';
  return 'secondary';
}

function getBadgeColor(val: string) {
  if (!val) return 'bg-gray-100 text-gray-600 border-gray-200';
  if (/buy/i.test(val)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (/sell/i.test(val)) return 'bg-red-50 text-red-700 border-red-200';
  if (/hold/i.test(val)) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (/positive/i.test(val)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (/negative/i.test(val)) return 'bg-red-50 text-red-700 border-red-200';
  if (/neutral/i.test(val)) return 'bg-slate-50 text-slate-700 border-slate-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
}

function RiskBar({ score }: { score: number }) {
  const percent = Math.max(0, Math.min(1, score || 0));
  const percentValue = percent * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Risk Level</span>
        <span className="text-sm font-semibold text-gray-900">{percentValue.toFixed(0)}%</span>
      </div>
      <Progress value={percentValue} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Low Risk</span>
        <span>High Risk</span>
      </div>
    </div>
  );
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

const metricTooltips = {
  sentiment: 'AI-determined overall market sentiment for this stock based on multiple data points.',
  recommendation: 'AI-generated investment recommendation: Buy, Hold, or Sell.',
  riskScore: 'AI-calculated risk assessment score (0 = low risk, 1 = high risk).',
  volatility: 'AI-assessed price volatility and market stability indicators.',
};

export default function AIAnalysis({ stock }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [regenKey, setRegenKey] = useState(0);

  const fetchAnalysis = () => {
    if (!stock || !stock.symbol) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setTimestamp(null);
    const payload = {
      symbol: stock.symbol,
      name: stock.name || stock.longName || '',
      sector: stock.sector || '',
      industry: stock.industry || '',
      description: stock.description || '',
      currentPrice: stock.currentPrice || stock.regularMarketPrice || '',
      peRatio: stock.trailingPE || '',
      marketCap: stock.marketCap || '',
      otherData: stock
    };
    fetch(`/api/stocks/${encodeURIComponent(stock.symbol)}/ai-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setAnalysis(parseAIResponse(data.analysis));
        setTimestamp(data.generatedAt || null);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch AI analysis');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock, regenKey]);

  const sentiment = analysis?.sentiment || 'N/A';
  const recommendation = analysis?.recommendation || 'N/A';
  const riskScore = typeof analysis?.riskScore === 'number' ? analysis.riskScore : (parseFloat(analysis?.riskScore) || 0);
  const volatility = analysis?.volatility || 'N/A';
  const prediction = analysis?.prediction || '';
  const explanation = analysis?.explanation || '';

  const strengths = analysis?.strengths || '';
  const weaknesses = analysis?.weaknesses || '';
  const confidence = analysis?.confidence || '';
  const nextSteps = analysis?.nextSteps || '';

  // Only show extra fields if there are any besides the standard ones
  const extraFields = analysis && typeof analysis === 'object'
    ? Object.entries(analysis).filter(([k]) => !['sentiment','recommendation','riskScore','volatility','prediction','explanation'].includes(k))
    : [];

  // Loading skeletons
  const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg ${className}`} />
  );

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Analysis</h2>
            <p className="text-sm text-gray-600">Advanced AI-powered stock analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {timestamp && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Updated: {new Date(timestamp).toLocaleString()}</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRegenKey((k) => k + 1)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {loading && <LoadingSkeleton />}
      
      {error && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Analysis Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Sentiment</span>
                    <Tooltip text={metricTooltips.sentiment}>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </div>
                <Badge className={`${getBadgeColor(sentiment)} border font-medium`}>
                  {sentiment}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Recommendation</span>
                    <Tooltip text={metricTooltips.recommendation}>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
                <Badge className={`${getBadgeColor(recommendation)} border font-medium`}>
                  {recommendation}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Volatility</span>
                    <Tooltip text={metricTooltips.volatility}>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <Activity className="h-4 w-4 text-orange-500" />
                </div>
                <Badge className={`${getBadgeColor(volatility)} border font-medium`}>
                  {volatility}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Risk Assessment</span>
                    <Tooltip text={metricTooltips.riskScore}>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <Shield className="h-4 w-4 text-red-500" />
                </div>
                <RiskBar score={riskScore} />
              </CardContent>
            </Card>
          </div>

          {/* AI Explanation */}
          {explanation && (
            <Card className="border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed">{explanation}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Prediction */}
          {prediction && (
            <Card className="border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Market Prediction
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-lg font-semibold text-green-800">{prediction}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths and Weaknesses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {strengths && (
              <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-white/70 backdrop-blur-sm border border-emerald-200 rounded-lg p-4">
                    <p className="text-emerald-800 leading-relaxed">{strengths}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {weaknesses && (
              <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-white/70 backdrop-blur-sm border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 leading-relaxed">{weaknesses}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {confidence && (
              <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                    Confidence Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 leading-relaxed">{confidence}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {nextSteps && (
              <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
                    <Target className="h-5 w-5 text-purple-600" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-white/70 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-800 leading-relaxed">{nextSteps}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pattern Detection Placeholder */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-orange-600" />
                Pattern Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Advanced Pattern Analysis</p>
                <p className="text-sm text-gray-500 mt-1">Pattern detection features are coming soon</p>
              </div>
            </CardContent>
          </Card>

          {/* Extra Fields */}
          {extraFields.length > 0 && (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-gray-600" />
                  Additional Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extraFields.map(([key, value]) => (
                    <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm text-gray-800 font-medium">{String(value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}