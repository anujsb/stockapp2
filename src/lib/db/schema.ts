// src/lib/schema.ts
import {
  pgTable,
  serial,
  varchar,
  decimal,
  bigint,
  timestamp,
  text,
  uniqueIndex,
  index,
  integer,
  primaryKey,
  boolean,
  json,
} from "drizzle-orm/pg-core";

// STOCKS table - Enhanced with comprehensive fields
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  
  // 🔴 REAL-TIME DATA (1-5 min refresh)
  currentPrice: decimal("current_price", { precision: 15, scale: 4 }),
  previousClose: decimal("previous_close", { precision: 15, scale: 4 }),
  dayChange: decimal("day_change", { precision: 15, scale: 4 }),
  dayChangePercent: decimal("day_change_percent", { precision: 8, scale: 4 }),
  volume: bigint("volume", { mode: "number" }),
  bid: decimal("bid", { precision: 15, scale: 4 }),
  ask: decimal("ask", { precision: 15, scale: 4 }),
  
  // 🟡 DAILY DATA (once per market close)
  marketCap: bigint("market_cap", { mode: "number" }),
  sharesOutstanding: bigint("shares_outstanding", { mode: "number" }),
  float: bigint("float", { mode: "number" }),
  high52Week: decimal("high_52_week", { precision: 15, scale: 4 }),
  low52Week: decimal("low_52_week", { precision: 15, scale: 4 }),
  sector: varchar("sector", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  exchange: varchar("exchange", { length: 10 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  longName: varchar("long_name", { length: 500 }),
  website: varchar("website", { length: 500 }),
  hqLocation: varchar("hq_location", { length: 500 }),
  employees: integer("employees"),
  ceo: varchar("ceo", { length: 100 }),
  
  // Financial Ratios (Daily)
  peRatio: decimal("pe_ratio", { precision: 8, scale: 4 }),
  priceToBook: decimal("price_to_book", { precision: 8, scale: 4 }),
  priceToSales: decimal("price_to_sales", { precision: 8, scale: 4 }),
  evToEbitda: decimal("ev_to_ebitda", { precision: 8, scale: 4 }),
  pegRatio: decimal("peg_ratio", { precision: 8, scale: 4 }),
  bookValue: decimal("book_value", { precision: 15, scale: 4 }),
  dividendYield: decimal("dividend_yield", { precision: 8, scale: 4 }),
  dividendRate: decimal("dividend_rate", { precision: 15, scale: 4 }),
  nextExDividendDate: timestamp("next_ex_dividend_date"),
  splitDate: timestamp("split_date"),
  splitFactor: varchar("split_factor", { length: 50 }),
  
  // Financial Health (Daily)
  revenueGrowth: decimal("revenue_growth", { precision: 8, scale: 4 }),
  grossMargin: decimal("gross_margin", { precision: 8, scale: 4 }),
  operatingMargin: decimal("operating_margin", { precision: 8, scale: 4 }),
  netMargin: decimal("net_margin", { precision: 8, scale: 4 }),
  debtToEquity: decimal("debt_to_equity", { precision: 8, scale: 4 }),
  currentRatio: decimal("current_ratio", { precision: 8, scale: 4 }),
  quickRatio: decimal("quick_ratio", { precision: 8, scale: 4 }),
  returnOnEquity: decimal("return_on_equity", { precision: 8, scale: 4 }),
  returnOnAssets: decimal("return_on_assets", { precision: 8, scale: 4 }),
  beta: decimal("beta", { precision: 8, scale: 4 }),
  
  // 🟢 WEEKLY/MONTHLY/QUARTERLY DATA
  description: text("description"),
  institutionalPercent: decimal("institutional_percent", { precision: 8, scale: 4 }),
  insiderPercent: decimal("insider_percent", { precision: 8, scale: 4 }),
  esgEnvironmentalScore: integer("esg_environmental_score"),
  esgSocialScore: integer("esg_social_score"),
  esgGovernanceScore: integer("esg_governance_score"),
  
  // Technical Indicators (computed)
  sma20: decimal("sma_20", { precision: 15, scale: 4 }),
  sma50: decimal("sma_50", { precision: 15, scale: 4 }),
  rsi: decimal("rsi", { precision: 8, scale: 4 }),
  macdLine: decimal("macd_line", { precision: 15, scale: 4 }),
  macdSignal: decimal("macd_signal", { precision: 15, scale: 4 }),
  macdHistogram: decimal("macd_histogram", { precision: 15, scale: 4 }),
  atr: decimal("atr", { precision: 15, scale: 4 }),
  
  // Support & Resistance levels
  supportLevel1: decimal("support_level_1", { precision: 15, scale: 4 }),
  supportLevel2: decimal("support_level_2", { precision: 15, scale: 4 }),
  resistanceLevel1: decimal("resistance_level_1", { precision: 15, scale: 4 }),
  resistanceLevel2: decimal("resistance_level_2", { precision: 15, scale: 4 }),
  
  // Analyst Ratings
  analystBuyCount: integer("analyst_buy_count"),
  analystHoldCount: integer("analyst_hold_count"),
  analystSellCount: integer("analyst_sell_count"),
  analystTargetPrice: decimal("analyst_target_price", { precision: 15, scale: 4 }),
  analystRecommendation: varchar("analyst_recommendation", { length: 20 }),
  
  // Timestamps
  lastUpdated: timestamp("last_updated").defaultNow(),
  lastRealTimeUpdate: timestamp("last_real_time_update"),
  lastDailyUpdate: timestamp("last_daily_update"),
  lastWeeklyUpdate: timestamp("last_weekly_update"),
  lastQuarterlyUpdate: timestamp("last_quarterly_update"),
  createdAt: timestamp("created_at").defaultNow(),
});

// STOCK REFRESH TRACKING
export const stockRefreshLog = pgTable("stock_refresh_log", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  refreshType: varchar("refresh_type", { length: 20 }).notNull(), // realtime, daily, weekly, quarterly
  status: varchar("status", { length: 20 }).notNull(), // success, failed, partial
  dataUpdated: json("data_updated"), // JSON array of updated fields
  errorMessage: text("error_message"),
  apiEndpoint: varchar("api_endpoint", { length: 500 }),
  responseTime: integer("response_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  stockRefreshIndex: index("idx_stock_refresh_stock_type").on(table.stockId, table.refreshType),
  createdAtIndex: index("idx_stock_refresh_created_at").on(table.createdAt),
}));

// STOCK EARNINGS DATA
export const stockEarnings = pgTable("stock_earnings", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  earningsDate: timestamp("earnings_date").notNull(),
  estimate: decimal("estimate", { precision: 15, scale: 4 }),
  actual: decimal("actual", { precision: 15, scale: 4 }),
  surprise: decimal("surprise", { precision: 15, scale: 4 }),
  surprisePercent: decimal("surprise_percent", { precision: 8, scale: 4 }),
  period: varchar("period", { length: 20 }), // q1, q2, q3, q4, annual
  year: integer("year"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  stockEarningsIndex: index("idx_stock_earnings_stock_date").on(table.stockId, table.earningsDate),
}));

// STOCK FINANCIAL STATEMENTS
export const stockFinancials = pgTable("stock_financials", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  statementType: varchar("statement_type", { length: 20 }).notNull(), // income, balance, cashflow
  period: varchar("period", { length: 20 }).notNull(), // quarterly, annual
  date: timestamp("date").notNull(),
  data: json("data").notNull(), // JSON object with financial data
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  stockFinancialsIndex: index("idx_stock_financials_stock_type_date").on(table.stockId, table.statementType, table.date),
}));

// STOCK INSTITUTIONAL HOLDERS
export const stockInstitutionalHolders = pgTable("stock_institutional_holders", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  holderName: varchar("holder_name", { length: 255 }).notNull(),
  shares: bigint("shares", { mode: "number" }),
  percentHeld: decimal("percent_held", { precision: 8, scale: 4 }),
  value: bigint("value", { mode: "number" }),
  reportDate: timestamp("report_date"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  stockHoldersIndex: index("idx_stock_holders_stock_id").on(table.stockId),
}));

// USER PORTFOLIO
export const userPortfolio = pgTable(
  "user_portfolio",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    stockId: integer("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
    avgPurchasePrice: decimal("avg_purchase_price", {
      precision: 15,
      scale: 4,
    }),
    purchaseDate: timestamp("purchase_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    uniqUserStock: uniqueIndex("uniq_user_stock").on(table.userId, table.stockId),
    userIndex: index("idx_user_portfolio_user_id").on(table.userId),
  })
);

// USER WATCHLIST
export const userWatchlist = pgTable(
  "user_watchlist",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    stockId: integer("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").defaultNow(),
    notes: text("notes"),
  },
  (table) => ({
    uniqUserWatch: uniqueIndex("uniq_user_watchlist").on(
      table.userId,
      table.stockId
    ),
    userIndex: index("idx_user_watchlist_user_id").on(table.userId),
  })
);

// STOCK NEWS
export const stockNews = pgTable(
  "stock_news",
  {
    id: serial("id").primaryKey(),
    stockId: integer("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 500 }).notNull(),
    summary: text("summary"),
    url: varchar("url", { length: 1000 }),
    source: varchar("source", { length: 100 }),
    publishedAt: timestamp("published_at"),
    sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral
    relevanceScore: decimal("relevance_score", { precision: 8, scale: 4 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    stockIndex: index("idx_stock_news_stock_id").on(table.stockId),
    publishedIndex: index("idx_stock_news_published_at").on(table.publishedAt),
  })
);

// PORTFOLIO UPLOADS
export const portfolioUploads = pgTable("portfolio_uploads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }),
  totalStocks: integer("total_stocks"),
  successfulImports: integer("successful_imports"),
  failedImports: integer("failed_imports"),
  uploadDate: timestamp("upload_date").defaultNow(),
});