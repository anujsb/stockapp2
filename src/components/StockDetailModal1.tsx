"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Brain, BarChart3, X, Target, Bell, Star } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    setTimeout(() => {
      setAiAnalysis({
        recommendation: "BUY",
        confidence: 85,
        targetPrice: stock.currentPrice * 1.15,
        summary: "Strong fundamentals with positive growth trajectory. Recent earnings beat expectations.",
        keyPoints: [
          "Revenue growth of 12% YoY",
          "Strong market position",
          "Positive analyst sentiment",
          "Solid balance sheet",
        ],
        risks: ["Market volatility", "Regulatory concerns"],
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
              {stock.logo}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{stock.symbol}</h2>
              <p className="text-gray-600">{stock.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(stock.currentPrice)}</div>
              <div className={`flex items-center gap-1 ${stock.dayChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stock.dayChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(stock.dayChangePercent).toFixed(2)}%
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Your Position */}
                <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Shares Owned</p>
                        <p className="text-2xl font-bold text-gray-900">{stock.quantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Avg Cost</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stock.avgPrice)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Market Value</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Return</p>
                        <p className={`text-2xl font-bold ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {gainLoss >= 0 ? "+" : ""}
                          {formatCurrency(Math.abs(gainLoss))}
                        </p>
                        <p className={`text-sm ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {gainLossPercent >= 0 ? "+" : ""}
                          {gainLossPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="h-12">
                    <Target className="h-4 w-4 mr-2" />
                    Set Alert
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Bell className="h-4 w-4 mr-2" />
                    Watch
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Star className="h-4 w-4 mr-2" />
                    Favorite
                  </Button>
                </div>

                {/* Key Stats */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Key Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Market Cap</p>
                        <p className="text-lg font-semibold">$2.8T</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">P/E Ratio</p>
                        <p className="text-lg font-semibold">28.5</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">52W High</p>
                        <p className="text-lg font-semibold">$199.62</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">52W Low</p>
                        <p className="text-lg font-semibold">$164.08</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chart" className="mt-0">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8">
                    <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium">TradingView Chart</p>
                        <p className="text-sm text-gray-500 mt-2">Interactive chart will be embedded here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="mt-0">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          AI Analysis
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Powered by Gemini AI</p>
                      </div>
                      <Button onClick={handleAIAnalysis} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Brain className="h-4 w-4 mr-2" />
                        )}
                        {isAnalyzing ? "Analyzing..." : "Get Analysis"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {aiAnalysis ? (
                      <div className="space-y-6">
                        {/* Recommendation */}
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                          <Badge
                            variant={
                              aiAnalysis.recommendation === "BUY"
                                ? "default"
                                : aiAnalysis.recommendation === "SELL"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-lg px-6 py-2 mb-3"
                          >
                            {aiAnalysis.recommendation}
                          </Badge>
                          <p className="text-lg font-semibold mb-2">Target: {formatCurrency(aiAnalysis.targetPrice)}</p>
                          <p className="text-sm text-gray-600">Confidence: {aiAnalysis.confidence}%</p>
                        </div>

                        {/* Summary */}
                        <div>
                          <h4 className="font-semibold mb-3">Analysis Summary</h4>
                          <p className="text-gray-700 leading-relaxed">{aiAnalysis.summary}</p>
                        </div>

                        {/* Key Points */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 text-green-700">Positive Factors</h4>
                            <ul className="space-y-2">
                              {aiAnalysis.keyPoints.map((point: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{point}</span>
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
                                  <span className="text-sm text-gray-700">{risk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Get AI-powered insights</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Analyze market trends, financials, and get buy/sell recommendations
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
