import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 px-4">
      <header className="w-full max-w-3xl flex flex-col items-center mt-12 mb-8">
        <Image
          src="/next.svg"
          alt="StockApp Logo"
          width={120}
          height={40}
          className="mb-4 dark:invert"
        />
        <h1 className="text-4xl font-bold mb-2 text-center">
          Welcome to StockApp
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
          Your all-in-one platform for smarter stock research and portfolio
          management.
        </p>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2">
          <h2 className="text-xl font-semibold mb-1">📊 Dashboard</h2>
          <p className="text-gray-700 dark:text-gray-300">
            View a summary of your entire stock portfolio, including performance,
            allocation, and key insights at a glance.
          </p>
        </section>
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2">
          <h2 className="text-xl font-semibold mb-1">📁 Portfolio</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Upload your portfolio via CSV or add stocks manually. Easily manage
            and expand your holdings.
          </p>
        </section>
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2">
          <h2 className="text-xl font-semibold mb-1">📰 News</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Get the latest news related to your stocks, plus trending market
            updates and insights.
          </p>
        </section>
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2">
          <h2 className="text-xl font-semibold mb-1">🤖 AI Predictions</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Leverage LLM-powered predictions based on real-time prices and news.
            Get actionable suggestions on your stocks.
          </p>
        </section>
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-2 md:col-span-2">
          <h2 className="text-xl font-semibold mb-1">👀 Watchlist</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Track stocks outside your portfolio. Stay updated on potential
            opportunities and market movers.
          </p>
        </section>
      </main>

      <footer className="mt-12 flex flex-col items-center gap-4">
        <Link
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          Get Started
        </Link>
        <span className="text-gray-500 text-sm">
          Already have an account?{" "}
          <Link href="/dashboard" className="underline">
            Sign in
          </Link>
        </span>
      </footer>
    </div>
  );
}
