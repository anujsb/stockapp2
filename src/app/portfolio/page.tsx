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

// src/app/page.tsx
'use client';

import { useState } from 'react';
import { Plus, PieChart, TrendingUp } from 'lucide-react';
import AddStockModal from '@/components/AddStockModal';
import PortfolioTable from '@/components/PortfolioTable';

export default function PortfolioPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStockAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <PieChart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Stock Portfolio</h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Stock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">My Portfolio</h2>
          <p className="text-gray-600">Track your stock investments and performance</p>
        </div>

        <PortfolioTable refreshTrigger={refreshTrigger} />
      </main>

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStockAdded={handleStockAdded}
      />
    </div>
  );
}
