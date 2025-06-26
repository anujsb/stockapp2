"use client"

import { useState } from "react"
import { Plus, Upload, Search, TrendingUp, TrendingDown, Eye, Brain, MoreVertical, Grid3X3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SideBar } from "@/components/SideBar"
import AddStockModal from "@/components/AddStockModal"
import StockDetailModal from "@/components/StockDetailModal1"
import CSVUploadModal from "@/components/CSVUploadModal1"

// Mock data
const portfolioSummary = {
  totalValue: 125430.5,
  totalInvested: 98750.0,
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
    logo: "🍎",
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
    logo: "🔍",
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
    sector: "Automotive",
    logo: "⚡",
  },
  {
    id: 4,
    symbol: "MSFT",
    name: "Microsoft Corporation",
    quantity: 40,
    avgPrice: 280.0,
    currentPrice: 295.5,
    dayChange: 3.2,
    dayChangePercent: 1.09,
    sector: "Technology",
    logo: "🪟",
  },
]

export default function PortfolioPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyDetailed = (amount: number) => {
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

  const totalGainLoss = portfolioSummary.totalValue - portfolioSummary.totalInvested
  const totalGainLossPercent = (totalGainLoss / portfolioSummary.totalInvested) * 100

  const filteredStocks = mockStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your investments</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsCSVModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Portfolio Summary */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Portfolio Value</p>
                  <h2 className="text-4xl font-bold mt-1">{formatCurrency(portfolioSummary.totalValue)}</h2>
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        totalGainLoss >= 0 ? "bg-green-500/20 text-green-100" : "bg-red-500/20 text-red-100"
                      }`}
                    >
                      {totalGainLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {formatCurrency(Math.abs(totalGainLoss))} ({Math.abs(totalGainLossPercent).toFixed(1)}%)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Today's Change</p>
                  <div
                    className={`text-xl font-semibold ${
                      portfolioSummary.dayChange >= 0 ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {portfolioSummary.dayChange >= 0 ? "+" : ""}
                    {formatCurrency(portfolioSummary.dayChange)}
                  </div>
                  <p className="text-blue-200 text-sm">
                    {portfolioSummary.dayChangePercent >= 0 ? "+" : ""}
                    {portfolioSummary.dayChangePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-gray-600 text-sm">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(portfolioSummary.totalInvested)}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-gray-600 text-sm">Holdings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{mockStocks.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-gray-600 text-sm">Best Performer</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">TSLA</p>
                  <p className="text-sm text-green-600">+3.76%</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Holdings Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Your Holdings</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search stocks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-gray-200"
                  />
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stock Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStocks.map((stock) => {
                  const { currentValue, gainLoss, gainLossPercent } = calculateStockValue(stock)
                  return (
                    <Card
                      key={stock.id}
                      className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => setSelectedStock(stock)}
                    >
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                              {stock.logo}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{stock.symbol}</h4>
                              <p className="text-sm text-gray-600 truncate max-w-32">{stock.name}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedStock(stock)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Brain className="h-4 w-4 mr-2" />
                                AI Analysis
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Current Price</span>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrencyDetailed(stock.currentPrice)}</p>
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
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Holdings</span>
                            <span className="font-medium">{stock.quantity} shares</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Market Value</span>
                            <span className="font-semibold">{formatCurrency(currentValue)}</span>
                          </div>

                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Gain/Loss</span>
                              <div className="text-right">
                                <p className={`font-semibold ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {gainLoss >= 0 ? "+" : ""}
                                  {formatCurrency(Math.abs(gainLoss))}
                                </p>
                                <p className={`text-xs ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {gainLossPercent >= 0 ? "+" : ""}
                                  {gainLossPercent.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {filteredStocks.map((stock) => {
                      const { currentValue, gainLoss, gainLossPercent } = calculateStockValue(stock)
                      return (
                        <div
                          key={stock.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedStock(stock)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                                {stock.logo}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{stock.symbol}</h4>
                                <p className="text-sm text-gray-600">{stock.name}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {stock.sector}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-8 text-sm">
                              <div className="text-center">
                                <p className="text-gray-600">Shares</p>
                                <p className="font-medium">{stock.quantity}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600">Price</p>
                                <p className="font-medium">{formatCurrencyDetailed(stock.currentPrice)}</p>
                                <div
                                  className={`text-xs flex items-center gap-1 justify-center ${
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
                              <div className="text-center">
                                <p className="text-gray-600">Value</p>
                                <p className="font-semibold">{formatCurrency(currentValue)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600">Gain/Loss</p>
                                <p className={`font-semibold ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {gainLoss >= 0 ? "+" : ""}
                                  {formatCurrency(Math.abs(gainLoss))}
                                </p>
                                <p className={`text-xs ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {gainLossPercent >= 0 ? "+" : ""}
                                  {gainLossPercent.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modals */}
        <AddStockModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onStockAdded={() => {}} />

        <CSVUploadModal isOpen={isCSVModalOpen} onClose={() => setIsCSVModalOpen(false)} onUploadComplete={() => {}} />

        {selectedStock && (
          <StockDetailModal stock={selectedStock} isOpen={!!selectedStock} onClose={() => setSelectedStock(null)} />
        )}
      </div>
    </div>
  )
}
