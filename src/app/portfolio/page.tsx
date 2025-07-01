// // app/portfolio/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// import { Plus, Upload, TrendingUp, TrendingDown, Trash2, Edit, Search, FileText } from 'lucide-react';
// import { toast } from 'sonner';

// interface PortfolioItem {
//   id: number;
//   quantity: number;
//   avg_purchase_price: number;
//   purchase_date: string;
//   stock: {
//     id: number;
//     symbol: string;
//     name: string;
//     current_price: number;
//     day_change: number;
//     day_change_percent: number;
//     sector: string;
//     exchange: string;
//   };
// }

// interface PortfolioSummary {
//   totalStocks: number;
//   currentValue: number;
//   investedValue: number;
//   totalPnL: number;
//   totalPnLPercent: number;
// }

// export default function Portfolio() {
//   const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
//   const [summary, setSummary] = useState<PortfolioSummary | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState<any[]>([]);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [uploadLoading, setUploadLoading] = useState(false);

//   // Add stock form
//   const [newStock, setNewStock] = useState({
//     symbol: '',
//     quantity: '',
//     avgPrice: '',
//     purchaseDate: ''
//   });

//   useEffect(() => {
//     fetchPortfolio();
//   }, []);

//   const fetchPortfolio = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/portfolio');
//       if (response.ok) {
//         const data = await response.json();
//         setPortfolio(data.portfolio);
//         setSummary(data.summary);
//       }
//     } catch (error) {
//       console.error('Error fetching portfolio:', error);
//       toast.error('Failed to fetch portfolio');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const searchStocks = async (query: string) => {
//     if (query.length < 2) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       const response = await fetch(`/api/stocks?search=${encodeURIComponent(query)}`);
//       if (response.ok) {
//         const results = await response.json();
//         setSearchResults(results);
//       }
//     } catch (error) {
//       console.error('Error searching stocks:', error);
//     }
//   };

//   const addStock = async () => {
//     if (!newStock.symbol || !newStock.quantity || !newStock.avgPrice) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     try {
//       const response = await fetch('/api/portfolio', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           symbol: newStock.symbol,
//           quantity: parseFloat(newStock.quantity),
//           avgPrice: parseFloat(newStock.avgPrice),
//           purchaseDate: newStock.purchaseDate || new Date().toISOString()
//         })
//       });

//       if (response.ok) {
//         toast.success('Stock added to portfolio');
//         setNewStock({ symbol: '', quantity: '', avgPrice: '', purchaseDate: '' });
//         setIsAddDialogOpen(false);
//         fetchPortfolio();
//       } else {
//         const error = await response.json();
//         toast.error(error.error || 'Failed to add stock');
//       }
//     } catch (error) {
//       console.error('Error adding stock:', error);
//       toast.error('Failed to add stock');
//     }
//   };

//   const removeStock = async (stockId: number) => {
//     try {
//       const response = await fetch(`/api/portfolio?stockId=${stockId}`, {
//         method: 'DELETE'
//       });

//       if (response.ok) {
//         toast.success('Stock removed from portfolio');
//         fetchPortfolio();
//       } else {
//         toast.error('Failed to remove stock');
//       }
//     } catch (error) {
//       console.error('Error removing stock:', error);
//       toast.error('Failed to remove stock');
//     }
//   };

//   const handleFileUpload = async () => {
//     if (!selectedFile) {
//       toast.error('Please select a CSV file');
//       return;
//     }

//     try {
//       setUploadLoading(true);
//       const formData = new FormData();
//       formData.append('file', selectedFile);

//       const response = await fetch('/api/upload-csv', {
//         method: 'POST',
//         body: formData
//       });

//       const result = await response.json();

//       if (response.ok) {
//         toast.success(`CSV uploaded successfully! ${result.results.successful} stocks added, ${result.results.failed} failed.`);
//         setIsUploadDialogOpen(false);
//         setSelectedFile(null);
//         fetchPortfolio();
//       } else {
//         toast.error(result.error || 'Failed to upload CSV');
//       }
//     } catch (error) {
//       console.error('Error uploading CSV:', error);
//       toast.error('Failed to upload CSV');
//     } finally {
//       setUploadLoading(false);
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const calculatePnL = (item: PortfolioItem) => {
//     const currentValue = item.quantity * item.stock.current_price;
//     const investedValue = item.quantity * item.avg_purchase_price;
//     const pnl = currentValue - investedValue;
//     const pnlPercent = ((pnl / investedValue) * 100);
//     return { pnl, pnlPercent, currentValue, investedValue };
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-6xl mx-auto">
//           <div className="animate-pulse space-y-6">
//             <div className="h-8 bg-gray-200 rounded w-1/4"></div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[...Array(3)].map((_, i) => (
//                 <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
//             <p className="text-gray-600 mt-1">Manage your stock investments</p>
//           </div>
//           <div className="flex gap-3">
//             <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
//               <DialogTrigger asChild>
//                 <Button variant="outline">
//                   <Upload className="w-4 h-4 mr-2" />
//                   Upload CSV
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Upload Portfolio CSV</DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="csv-file">Select CSV File</Label>
//                     <Input
//                       id="csv-file"
//                       type="file"
//                       accept=".csv"
//                       onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
//                     />
//                     <p className="text-sm text-gray-500 mt-2">
//                       CSV should have columns: symbol, quantity, avg_price, purchase_date (optional)
//                     </p>
//                   </div>
//                   <div className="flex justify-end gap-3">
//                     <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
//                       Cancel
//                     </Button>
//                     <Button onClick={handleFileUpload} disabled={!selectedFile || uploadLoading}>
//                       {uploadLoading ? 'Uploading...' : 'Upload'}
//                     </Button>
//                   </div>
//                 </div>
//               </DialogContent>
//             </Dialog>

//             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//               <DialogTrigger asChild>
//                 <Button>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add Stock
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Add Stock to Portfolio</DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="stock-symbol">Stock Symbol</Label>
//                     <div className="relative">
//                       <Input
//                         id="stock-symbol"
//                         placeholder="Search symbol (e.g. TCS)"
//                         value={newStock.symbol}
//                         onChange={async (e) => {
//                           setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() });
//                           setSearchQuery(e.target.value);
//                           await searchStocks(e.target.value);
//                         }}
//                         autoComplete="off"
//                       />
//                       {searchQuery.length > 1 && searchResults.length > 0 && (
//                         <div className="absolute z-10 bg-white border rounded shadow w-full mt-1 max-h-40 overflow-y-auto">
//                           {searchResults.map((stock: any) => (
//                             <div
//                               key={stock.symbol}
//                               className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
//                               onClick={() => {
//                                 setNewStock({ ...newStock, symbol: stock.symbol });
//                                 setSearchQuery('');
//                                 setSearchResults([]);
//                               }}
//                             >
//                               <span className="font-medium">{stock.symbol}</span>
//                               <span className="ml-2 text-gray-500">{stock.name}</span>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <div>
//                     <Label htmlFor="quantity">Quantity</Label>
//                     <Input
//                       id="quantity"
//                       type="number"
//                       min={1}
//                       placeholder="Enter quantity"
//                       value={newStock.quantity}
//                       onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="avgPrice">Average Purchase Price</Label>
//                     <Input
//                       id="avgPrice"
//                       type="number"
//                       min={0}
//                       step="0.01"
//                       placeholder="Enter average price"
//                       value={newStock.avgPrice}
//                       onChange={(e) => setNewStock({ ...newStock, avgPrice: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="purchaseDate">Purchase Date</Label>
//                     <Input
//                       id="purchaseDate"
//                       type="date"
//                       value={newStock.purchaseDate}
//                       onChange={(e) => setNewStock({ ...newStock, purchaseDate: e.target.value })}
//                     />
//                   </div>
//                   <div className="flex justify-end gap-3">
//                     <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                       Cancel
//                     </Button>
//                     <Button onClick={addStock}>
//                       Add
//                     </Button>
//                   </div>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </div>

//         {/* Portfolio Summary */}
//         {summary && (
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Total Stocks</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{summary.totalStocks}</div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Current Value</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{formatCurrency(summary.currentValue)}</div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Invested Value</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{formatCurrency(summary.investedValue)}</div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Total P&amp;L</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className={`text-2xl font-bold ${summary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                   {formatCurrency(summary.totalPnL)} ({summary.totalPnLPercent.toFixed(2)}%)
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         )}

//         {/* Portfolio Table */}
//         <div className="bg-white rounded-lg shadow mt-6">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Price</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Price</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Value</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invested Value</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">P&amp;L</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Day Change</th>
//                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {portfolio.length === 0 ? (
//                   <tr>
//                     <td colSpan={10} className="text-center py-8 text-gray-500">
//                       No stocks in your portfolio yet.
//                     </td>
//                   </tr>
//                 ) : (
//                   portfolio.map((item) => {
//                     const { pnl, pnlPercent, currentValue, investedValue } = calculatePnL(item);
//                     return (
//                       <tr key={item.id}>
//                         <td className="px-6 py-4 whitespace-nowrap font-semibold">{item.stock.symbol}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">{item.stock.name}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right">{item.quantity}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(item.avg_purchase_price)}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(item.stock.current_price)}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(currentValue)}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(investedValue)}</td>
//                         <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                           {formatCurrency(pnl)} ({pnlPercent.toFixed(2)}%)
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right">
//                           <span className={`inline-flex items-center gap-1 ${item.stock.day_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                             {item.stock.day_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
//                             {item.stock.day_change} ({item.stock.day_change_percent}%)
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-center">
//                           <AlertDialog>
//                             <AlertDialogTrigger asChild>
//                               <Button variant="ghost" size="icon">
//                                 <Trash2 className="w-4 h-4 text-red-500" />
//                               </Button>
//                             </AlertDialogTrigger>
//                             <AlertDialogContent>
//                               <AlertDialogHeader>
//                                 <AlertDialogTitle>Remove Stock</AlertDialogTitle>
//                                 <AlertDialogDescription>
//                                   Are you sure you want to remove <span className="font-semibold">{item.stock.symbol}</span> from your portfolio?
//                                 </AlertDialogDescription>
//                               </AlertDialogHeader>
//                               <AlertDialogFooter>
//                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                 <AlertDialogAction onClick={() => removeStock(item.id)}>
//                                   Remove
//                                 </AlertDialogAction>
//                               </AlertDialogFooter>
//                             </AlertDialogContent>
//                           </AlertDialog>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/app/portfolio/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Plus, PieChart, Upload, TrendingUp, TrendingDown, BarChart3, FileText, Brain, Target, AlertTriangle } from 'lucide-react';
import AddStockModal from '@/components/AddStockModal';
import PortfolioTable from '@/components/PortfolioTable';
import { SideBar } from '@/components/SideBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Dashboard from '@/components/stock-dashboard/Dashboard';
import Chart from '@/components/stock-chart/Chart';
import AIAnalysis from '@/components/stock-ai-analysis/AIAnalysis';
import Financials from '@/components/stock-financials/Financials';
import Technicals from '@/components/stock-technicals/Technicals';

interface PortfolioStock {
  id: number;
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  currentPrice: number;
  avgPurchasePrice: number;
  quantity: number;
  [key: string]: any;
}

function mapPortfolioItemsToStocks(items: any[]): PortfolioStock[] {
  return items.map((item) => ({
    id: item.id,
    symbol: item.stock.symbol,
    name: item.stock.name,
    sector: item.stock.sector,
    industry: item.stock.industry,
    currentPrice: item.stock.current_price,
    avgPurchasePrice: item.avg_purchase_price,
    quantity: item.quantity,
    // add other fields as needed
  }));
}

export default function PortfolioPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalPortfolioValue: 0,
    totalInvested: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0
  });

  const handleStockAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  interface PortfolioStock {
    id: number;
    symbol: string;
    name: string;
    sector?: string;
    industry?: string;
    currentPrice: number;
    avgPurchasePrice: number;
    quantity: number;
    [key: string]: any;
  }

  interface PortfolioSummary {
    totalPortfolioValue: number;
    totalInvested: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
  }

    interface Stock {
    id: number;
    symbol: string;
    name: string;
    sector?: string;
    industry?: string;
    currentPrice: number;
    avgPurchasePrice: number;
    quantity: number;
    [key: string]: any;
  }

    interface FormatCurrencyOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }



  type HandleDataUpdate = (portfolioData: PortfolioStock[], summary: { totalPortfolioValue: number; totalInvested: number; totalGainLoss: number; totalGainLossPercent: number; }) => void;

  const handleDataUpdate = useCallback(
    (portfolioData: any[], summary: PortfolioSummary) => {
      setPortfolio(mapPortfolioItemsToStocks(portfolioData));
      setPortfolioSummary(summary);
    },
    []
  );


  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock);
  };


  const formatCurrency = (amount: number, options?: FormatCurrencyOptions): string => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  };

  interface GainLossResult {
    gainLoss: number;
    gainLossPercent: number;
    currentValue: number;
    investedValue: number;
  }

  const calculateGainLoss = (stock: Stock): GainLossResult => {
    const currentValue = stock.currentPrice * stock.quantity;
    const investedValue = stock.avgPurchasePrice * stock.quantity;
    const gainLoss = currentValue - investedValue;
    const gainLossPercent = ((gainLoss / investedValue) * 100);

    return {
      gainLoss,
      gainLossPercent,
      currentValue,
      investedValue
    };
  };

  interface RecommendationColorMap {
    [key: string]: string;
  }

  type Recommendation = 'BUY' | 'SELL' | 'HOLD' | string;

  const getRecommendationColor = (rec: Recommendation): string => {
    const colorMap: RecommendationColorMap = {
      BUY: 'bg-green-100 text-green-800 border-green-200',
      SELL: 'bg-red-100 text-red-800 border-red-200',
      HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colorMap[rec] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  interface RecommendationIconProps {
    rec: Recommendation;
  }

  const getRecommendationIcon = (rec: Recommendation): React.ReactElement => {
    switch (rec) {
      case 'BUY': return <TrendingUp className="h-4 w-4" />;
      case 'SELL': return <TrendingDown className="h-4 w-4" />;
      case 'HOLD': return <Target className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <PieChart className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stock Portfolio</h1>
                  <p className="text-sm text-gray-500">Manage and track your investments</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCSVModalOpen(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  Import CSV
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Stock
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(portfolioSummary.totalPortfolioValue)}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(portfolioSummary.totalInvested)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                  <p className={`text-2xl font-bold ${portfolioSummary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(portfolioSummary.totalGainLoss))}
                  </p>
                  <p className={`text-sm ${portfolioSummary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioSummary.totalGainLossPercent.toFixed(2)}%
                  </p>
                </div>
                <div className={`p-3 rounded-full ${portfolioSummary.totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  {portfolioSummary.totalGainLoss >= 0 ?
                    <TrendingUp className="h-6 w-6 text-green-600" /> :
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  }
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Holdings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolio.length}
                  </p>
                  <p className="text-sm text-gray-500">Active positions</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <PortfolioTable 
            refreshTrigger={refreshTrigger}
            onDataUpdate={handleDataUpdate}
            onStockClick={handleStockClick}
          />

          {selectedStock && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedStock.symbol}</h2>
                      <p className="text-gray-600">{selectedStock.name}</p>
                      <p className="text-sm text-gray-500">{selectedStock.sector} • {selectedStock.industry}</p>
                    </div>
                    <Button
                      onClick={() => setSelectedStock(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="technicals">Technicals</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="p-6">
                    <Dashboard 
                      stock={selectedStock} 
                      formatCurrency={formatCurrency} 
                      calculateGainLoss={calculateGainLoss} 
                    />
                  </TabsContent>

                  <TabsContent value="chart" className="p-6">
                    <Chart stock={selectedStock} />
                  </TabsContent>

                  <TabsContent value="analysis" className="p-6">
                    <AIAnalysis stock={selectedStock} />
                  </TabsContent>

                  <TabsContent value="financials" className="p-6">
                    <Financials stock={selectedStock} />
                  </TabsContent>

                  <TabsContent value="technicals" className="p-6">
                    <Technicals 
                      stock={selectedStock} 
                      formatCurrency={formatCurrency} 
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {isCSVModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Import Portfolio from CSV</h2>
                  <Button
                    onClick={() => setIsCSVModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Select File
                    </label>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p className="mb-2">CSV should contain columns:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Symbol (required)</li>
                      <li>Quantity (required)</li>
                      <li>Average Price (required)</li>
                      <li>Notes (optional)</li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsCSVModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Import
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <AddStockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStockAdded={handleStockAdded}
        />
      </div>
    </div>
  );
}
