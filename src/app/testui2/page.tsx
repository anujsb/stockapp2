"use client"

import { useState } from "react"
import {
  Plus,
  Upload,
  PieChart,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SideBar } from "@/components/SideBar"
import AddStockModal from "@/components/AddStockModal"
import StockDetailModal from "@/components/StockDetailModal"
import CSVUploadModal from "@/components/CSVUploadModal"

// Mock data - replace with your actual data fetching
const mockPortfolioData = {
  totalValue: 125430.5,
  totalInvested: 98750.0,
  totalGainLoss: 26680.5,
  totalGainLossPercent: 27.02,
  dayChange: 1250.3,
  dayChangePercent: 1.01,
}

const mockStocks = [
  {
    id: 1,
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 50,
    avgPrice: 150.25,
    currentPrice: 175.8,
    dayChange: 2.45,
    dayChangePercent: 1.41,
    sector: "Technology",
    marketCap: "2.8T",
    pe: 28.5,
    dividend: 0.24,
  },
  {
    id: 2,
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    quantity: 25,
    avgPrice: 2450.0,
    currentPrice: 2680.3,
    dayChange: -15.2,
    dayChangePercent: -0.56,
    sector: "Technology",
    marketCap: "1.7T",
    pe: 24.2,
    dividend: 0.0,
  },
  {
    id: 3,
    symbol: "TSLA",
    name: "Tesla, Inc.",
    quantity: 30,
    avgPrice: 220.5,
    currentPrice: 245.75,
    dayChange: 8.9,
    dayChangePercent: 3.76,
    sector: "Consumer Cyclical",
    marketCap: "780B",
    pe: 65.8,
    dividend: 0.0,
  },
]

export default function PortfolioPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleStockAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const calculateStockValue = (stock: any) => {
    const currentValue = stock.currentPrice * stock.quantity
    const investedValue = stock.avgPrice * stock.quantity
    const gainLoss = currentValue - investedValue
    const gainLossPercent = (gainLoss / investedValue) * 100

    return { currentValue, investedValue, gainLoss, gainLossPercent }
  }

  const filteredStocks = mockStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SideBar />
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <PieChart className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
                  <p className="text-sm text-gray-600">Track and analyze your investments</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setIsCSVModalOpen(true)} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </Button>
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Stock
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
                <PieChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockPortfolioData.totalValue)}</div>
                <div
                  className={`text-xs flex items-center gap-1 mt-1 ${
                    mockPortfolioData.dayChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {mockPortfolioData.dayChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatCurrency(Math.abs(mockPortfolioData.dayChange))} (
                  {mockPortfolioData.dayChangePercent.toFixed(2)}%) today
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockPortfolioData.totalInvested)}</div>
                <p className="text-xs text-gray-600 mt-1">Initial investment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Gain/Loss</CardTitle>
                {mockPortfolioData.totalGainLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    mockPortfolioData.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(Math.abs(mockPortfolioData.totalGainLoss))}
                </div>
                <p
                  className={`text-xs mt-1 ${mockPortfolioData.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {mockPortfolioData.totalGainLossPercent.toFixed(2)}% return
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Holdings</CardTitle>
                <Badge variant="secondary">{mockStocks.length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStocks.length}</div>
                <p className="text-xs text-gray-600 mt-1">Active positions</p>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Content */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Holdings</CardTitle>
                  <CardDescription>Manage and analyze your stock positions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="table" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="cards">Card View</TabsTrigger>
                </TabsList>

                <TabsContent value="table" className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Avg Price</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Current Price</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Market Value</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Gain/Loss</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStocks.map((stock) => {
                          const { currentValue, gainLoss, gainLossPercent } = calculateStockValue(stock)
                          return (
                            <tr key={stock.id} className="border-b hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div>
                                  <div className="font-semibold text-gray-900">{stock.symbol}</div>
                                  <div className="text-sm text-gray-600">{stock.name}</div>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {stock.sector}
                                  </Badge>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-900">{stock.quantity.toLocaleString()}</td>
                              <td className="py-4 px-4 text-gray-900">{formatCurrency(stock.avgPrice)}</td>
                              <td className="py-4 px-4">
                                <div className="text-gray-900">{formatCurrency(stock.currentPrice)}</div>
                                <div
                                  className={`text-xs flex items-center gap-1 ${
                                    stock.dayChange >= 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {stock.dayChange >= 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {Math.abs(stock.dayChange).toFixed(2)} ({Math.abs(stock.dayChangePercent).toFixed(2)}
                                  %)
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-900 font-medium">{formatCurrency(currentValue)}</td>
                              <td className="py-4 px-4">
                                <div
                                  className={`font-medium flex items-center gap-1 ${
                                    gainLoss >= 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {gainLoss >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4" />
                                  )}
                                  {formatCurrency(Math.abs(gainLoss))}
                                </div>
                                <div className={`text-xs ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  ({gainLossPercent.toFixed(2)}%)
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedStock(stock)}
                                    className="flex items-center gap-1"
                                  >
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                                    <Brain className="h-3 w-3" />
                                    AI Analysis
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>Edit Position</DropdownMenuItem>
                                      <DropdownMenuItem>Add to Watchlist</DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="cards" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStocks.map((stock) => {
                      const { currentValue, gainLoss, gainLossPercent } = calculateStockValue(stock)
                      return (
                        <Card key={stock.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{stock.symbol}</CardTitle>
                                <CardDescription className="text-sm">{stock.name}</CardDescription>
                              </div>
                              <Badge variant="outline">{stock.sector}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Quantity</p>
                                <p className="font-medium">{stock.quantity}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Avg Price</p>
                                <p className="font-medium">{formatCurrency(stock.avgPrice)}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Current Price</p>
                                <p className="font-medium">{formatCurrency(stock.currentPrice)}</p>
                                <div
                                  className={`text-xs flex items-center gap-1 ${
                                    stock.dayChange >= 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {stock.dayChange >= 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {Math.abs(stock.dayChangePercent).toFixed(2)}%
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-600">Market Value</p>
                                <p className="font-medium">{formatCurrency(currentValue)}</p>
                              </div>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-gray-600 text-sm">Gain/Loss</p>
                                  <p className={`font-medium ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {formatCurrency(Math.abs(gainLoss))} ({gainLossPercent.toFixed(2)}%)
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setSelectedStock(stock)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Brain className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>

        {/* Modals */}
        <AddStockModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onStockAdded={handleStockAdded}
        />

        <CSVUploadModal
          isOpen={isCSVModalOpen}
          onClose={() => setIsCSVModalOpen(false)}
          onUploadComplete={handleStockAdded}
        />

        {selectedStock && (
          <StockDetailModal stock={selectedStock} isOpen={!!selectedStock} onClose={() => setSelectedStock(null)} />
        )}
      </div>
    </div>
  )
}
