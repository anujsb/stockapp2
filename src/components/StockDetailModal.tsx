"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Brain, BarChart3, DollarSign, Calendar, Target } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface StockDetailModalProps {
  stock: any
  isOpen: boolean
  onClose: () => void
}

export default function StockDetailModal({ stock, isOpen, onClose }: StockDetailModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis - replace with actual Gemini API call
    setTimeout(() => {
      setAiAnalysis({
        recommendation: "BUY",
        confidence: 85,
        targetPrice: stock.currentPrice * 1.15,
        reasoning: [
          "Strong quarterly earnings growth of 12% YoY",
          "Expanding market share in key segments",
          "Solid balance sheet with low debt-to-equity ratio",
          "Positive analyst sentiment and upgrades",
        ],
        risks: [
          "Market volatility concerns",
          "Regulatory challenges in key markets",
          "Competition from emerging players",
        ],
        keyMetrics: {
          fairValue: stock.currentPrice * 1.12,
          supportLevel: stock.currentPrice * 0.92,
          resistanceLevel: stock.currentPrice * 1.08,
        },
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const currentValue = stock.currentPrice * stock.quantity
  const investedValue = stock.avgPrice * stock.quantity
  const gainLoss = currentValue - investedValue
  const gainLossPercent = (gainLoss / investedValue) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">{stock.symbol}</DialogTitle>
              <p className="text-gray-600 mt-1">{stock.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(stock.currentPrice)}</div>
              <div className={`flex items-center gap-1 ${stock.dayChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stock.dayChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(stock.dayChange).toFixed(2)} ({Math.abs(stock.dayChangePercent).toFixed(2)}%)
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Position Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Your Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="text-xl font-bold">{stock.quantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Price</p>
                    <p className="text-xl font-bold">{formatCurrency(stock.avgPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Market Value</p>
                    <p className="text-xl font-bold">{formatCurrency(currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gain/Loss</p>
                    <p className={`text-xl font-bold ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(Math.abs(gainLoss))}
                    </p>
                    <p className={`text-sm ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ({gainLossPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sector</span>
                    <Badge variant="outline">{stock.sector}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Cap</span>
                    <span className="font-medium">{stock.marketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">P/E Ratio</span>
                    <span className="font-medium">{stock.pe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dividend Yield</span>
                    <span className="font-medium">{stock.dividend}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Set Price Alert
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Watchlist
                  </Button>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View News
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
                <CardDescription>TradingView integration will be implemented here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">TradingView Chart</p>
                    <p className="text-sm text-gray-500">Interactive chart will be embedded here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Analysis
                    </CardTitle>
                    <CardDescription>Powered by Gemini AI</CardDescription>
                  </div>
                  <Button onClick={handleAIAnalysis} disabled={isAnalyzing} className="flex items-center gap-2">
                    {isAnalyzing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Brain className="h-4 w-4" />
                    )}
                    {isAnalyzing ? "Analyzing..." : "Get AI Analysis"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {aiAnalysis ? (
                  <div className="space-y-6">
                    {/* Recommendation */}
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <Badge
                        variant={
                          aiAnalysis.recommendation === "BUY"
                            ? "default"
                            : aiAnalysis.recommendation === "SELL"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-lg px-4 py-2"
                      >
                        {aiAnalysis.recommendation}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">Confidence: {aiAnalysis.confidence}%</p>
                      <p className="text-lg font-semibold mt-2">
                        Target Price: {formatCurrency(aiAnalysis.targetPrice)}
                      </p>
                    </div>

                    <Separator />

                    {/* Key Metrics */}
                    <div>
                      <h4 className="font-semibold mb-3">Key Metrics</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Fair Value</p>
                          <p className="font-semibold">{formatCurrency(aiAnalysis.keyMetrics.fairValue)}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Support</p>
                          <p className="font-semibold">{formatCurrency(aiAnalysis.keyMetrics.supportLevel)}</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600">Resistance</p>
                          <p className="font-semibold">{formatCurrency(aiAnalysis.keyMetrics.resistanceLevel)}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Reasoning */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-green-700">Positive Factors</h4>
                        <ul className="space-y-2">
                          {aiAnalysis.reasoning.map((reason: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-red-700">Risk Factors</h4>
                        <ul className="space-y-2">
                          {aiAnalysis.risks.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <TrendingDown className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click "Get AI Analysis" to receive detailed insights</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Our AI will analyze market trends, financials, and sentiment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Metrics</CardTitle>
                <CardDescription>Key financial indicators and ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Revenue (TTM)</p>
                    <p className="text-lg font-bold">$394.3B</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Net Income</p>
                    <p className="text-lg font-bold">$99.8B</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">EPS</p>
                    <p className="text-lg font-bold">$6.16</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">ROE</p>
                    <p className="text-lg font-bold">175.1%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
