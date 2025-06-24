// import Image from "next/image";
// import Link from "next/link";

// export default function Home() {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 px-4">
//       <header className="w-full max-w-3xl flex flex-col items-center mt-12 mb-8">
//         <Image
//           src="/next.svg"
//           alt="StockApp Logo"
//           width={120}
//           height={40}
//           className="mb-4 dark:invert"
//         />
//         <h1 className="text-4xl font-bold mb-2 text-center">
//           Welcome to StockApp
//         </h1>
//         <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
//           Your all-in-one platform for smarter stock research and portfolio
//           management.
//         </p>
//       </header>

//       <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
//         <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2">
//           <h2 className="text-xl font-semibold mb-1">📊 Dashboard</h2>
//           <p className="text-gray-700 dark:text-gray-300">
//             View a summary of your entire stock portfolio, including performance,
//             allocation, and key insights at a glance.
//           </p>
//         </section>
//         <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2">
//           <h2 className="text-xl font-semibold mb-1">📁 Portfolio</h2>
//           <p className="text-gray-700 dark:text-gray-300">
//             Upload your portfolio via CSV or add stocks manually. Easily manage
//             and expand your holdings.
//           </p>
//         </section>
//         <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2">
//           <h2 className="text-xl font-semibold mb-1">📰 News</h2>
//           <p className="text-gray-700 dark:text-gray-300">
//             Get the latest news related to your stocks, plus trending market
//             updates and insights.
//           </p>
//         </section>
//         <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2">
//           <h2 className="text-xl font-semibold mb-1">🤖 AI Predictions</h2>
//           <p className="text-gray-700 dark:text-gray-300">
//             Leverage LLM-powered predictions based on real-time prices and news.
//             Get actionable suggestions on your stocks.
//           </p>
//         </section>
//         <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2 md:col-span-2">
//           <h2 className="text-xl font-semibold mb-1">👀 Watchlist</h2>
//           <p className="text-gray-700 dark:text-gray-300">
//             Track stocks outside your portfolio. Stay updated on potential
//             opportunities and market movers.
//           </p>
//         </section>
//       </main>

//       <footer className="mt-12 flex flex-col items-center gap-4">
//         <Link
//           href="/dashboard"
//           className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
//         >
//           Get Started
//         </Link>
//         <span className="text-gray-500 text-sm">
//           Already have an account?{" "}
//           <Link href="/dashboard" className="underline">
//             Sign in
//           </Link>
//         </span>
//       </footer>
//     </div>
//   );
// }


import React from 'react';
import { ArrowRight, BarChart3, Brain, Eye, FileText, TrendingUp, Upload, Users, Zap, Star, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-50 px-6 py-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StockSense</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How it Works
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white">
            <Zap className="mr-2 h-4 w-4" />
            AI-Powered Stock Analysis
          </div>
          <h1 className="mb-6 text-5xl md:text-7xl font-bold text-white leading-tight">
            Smart Stock Research
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Made Simple
            </span>
          </h1>
          <p className="mb-10 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Upload your portfolio, get AI-powered insights, track real-time news, and make informed investment decisions with our comprehensive stock research platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard" className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#demo" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-medium text-white hover:bg-white/20 transition-all">
              Watch Demo
            </Link>
          </div>
        </div>
        
        {/* Hero Visual */}
        <div className="mt-16 mx-auto max-w-5xl">
          <div className="rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <BarChart3 className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="text-white font-semibold mb-2">Portfolio Dashboard</h3>
                <p className="text-gray-300 text-sm">Complete overview of your investments</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Brain className="h-8 w-8 text-purple-400 mb-3" />
                <h3 className="text-white font-semibold mb-2">AI Predictions</h3>
                <p className="text-gray-300 text-sm">Smart recommendations based on real-time data</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <FileText className="h-8 w-8 text-green-400 mb-3" />
                <h3 className="text-white font-semibold mb-2">Live News Feed</h3>
                <p className="text-gray-300 text-sm">Relevant news for your portfolio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gradient-to-b from-transparent to-black/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Smart Investing
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our comprehensive suite of tools helps you make informed investment decisions with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dashboard */}
            <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <BarChart3 className="h-12 w-12 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Portfolio Dashboard</h3>
              <p className="text-gray-300 mb-6">
                Get a comprehensive view of all your investments with detailed analytics, performance metrics, and visual representations of your portfolio distribution.
              </p>
              <div className="flex items-center text-blue-400">
                <span className="text-sm font-medium">View Dashboard</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Portfolio Management */}
            <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Upload className="h-12 w-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Portfolio Management</h3>
              <p className="text-gray-300 mb-6">
                Upload CSV files or manually add stocks to your portfolio. Easily manage your holdings and track performance across multiple investment accounts.
              </p>
              <div className="flex items-center text-purple-400">
                <span className="text-sm font-medium">Manage Portfolio</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* News Feed */}
            <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileText className="h-12 w-12 text-green-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Smart News Feed</h3>
              <p className="text-gray-300 mb-6">
                Stay informed with personalized news related to your stocks, plus trending market news and analysis that could impact your investments.
              </p>
              <div className="flex items-center text-green-400">
                <span className="text-sm font-medium">Read News</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* AI Predictions */}
            <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Brain className="h-12 w-12 text-yellow-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Insights</h3>
              <p className="text-gray-300 mb-6">
                Advanced machine learning analyzes real-time prices and news to provide actionable recommendations and predict stock movements.
              </p>
              <div className="flex items-center text-yellow-400">
                <span className="text-sm font-medium">Get Insights</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Watchlist */}
            <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-red-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Eye className="h-12 w-12 text-red-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Smart Watchlist</h3>
              <p className="text-gray-300 mb-6">
                Monitor potential investments and track stocks you're interested in but don't own yet. Get alerts when opportunities arise.
              </p>
              <div className="flex items-center text-red-400">
                <span className="text-sm font-medium">Build Watchlist</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Real-time Data */}
            <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="h-12 w-12 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Data</h3>
              <p className="text-gray-300 mb-6">
                Access live stock prices, market data, and financial metrics powered by Yahoo Finance API for the most up-to-date information.
              </p>
              <div className="flex items-center text-indigo-400">
                <span className="text-sm font-medium">View Data</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Upload Portfolio</h3>
              <p className="text-gray-300">
                Upload your existing portfolio via CSV or add stocks manually to get started with comprehensive tracking.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Analysis</h3>
              <p className="text-gray-300">
                Our AI analyzes your portfolio, real-time market data, and relevant news to provide intelligent insights.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Make Decisions</h3>
              <p className="text-gray-300">
                Receive actionable recommendations and make informed investment decisions based on comprehensive analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent to-black/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Trusted by Smart Investors
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                10,000+
              </div>
              <p className="text-gray-300">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                $50M+
              </div>
              <p className="text-gray-300">Assets Tracked</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
                98%
              </div>
              <p className="text-gray-300">User Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Investment Strategy?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Join thousands of smart investors who use StockSense to make better investment decisions with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up" className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-sm text-gray-400">
              No credit card required • 14-day free trial
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">StockSense</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            © 2025 StockSense. All rights reserved. Built with Next.js, Tailwind CSS, and powered by AI.
          </div>
        </div>
      </footer>
    </div>
  );
}