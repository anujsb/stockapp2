// import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';
// import React from 'react';

// export type Recommendation = 'BUY' | 'SELL' | 'HOLD' | string;

// const colorMap: Record<Recommendation, string> = {
//   BUY: 'bg-green-100 text-green-800 border-green-200',
//   SELL: 'bg-red-100 text-red-800 border-red-200',
//   HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
// };

// export function getRecommendationColor(rec: Recommendation): string {
//   return colorMap[rec] || 'bg-gray-100 text-gray-800 border-gray-200';
// }

// export function getRecommendationIcon(rec: Recommendation): React.ReactElement {
//   switch (rec) {
//     case 'BUY': return <TrendingUp className="h-4 w-4" />;
//     case 'SELL': return <TrendingDown className="h-4 w-4" />;
//     case 'HOLD': return <Target className="h-4 w-4" />;
//     default: return <AlertTriangle className="h-4 w-4" />;
//   }
// }
