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
} from "drizzle-orm/pg-core";

// STOCKS table
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 4 }),
  previousClose: decimal("previous_close", { precision: 15, scale: 4 }),
  dayChange: decimal("day_change", { precision: 15, scale: 4 }),
  dayChangePercent: decimal("day_change_percent", { precision: 8, scale: 4 }),
  marketCap: bigint("market_cap", { mode: "number" }),
  volume: bigint("volume", { mode: "number" }),
  high52Week: decimal("high_52_week", { precision: 15, scale: 4 }),
  low52Week: decimal("low_52_week", { precision: 15, scale: 4 }),
  peRatio: decimal("pe_ratio", { precision: 8, scale: 4 }),
  dividendYield: decimal("dividend_yield", { precision: 8, scale: 4 }),
  sector: varchar("sector", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  exchange: varchar("exchange", { length: 10 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  lastRefreshed: timestamp("last_refreshed").defaultNow(),
});

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

// STOCK UPDATE LOGS
export const stockUpdateLogs = pgTable("stock_update_logs", {
  id: serial("id").primaryKey(),
  endpoint: varchar("endpoint", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // success, fail, throttled
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// STOCK CORPORATE ACTIONS
export const stockCorporateActions = pgTable("stock_corporate_actions", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  exDividendDate: bigint("ex_dividend_date", { mode: "number" }), // store as unix timestamp
  dividendDate: bigint("dividend_date", { mode: "number" }), // store as unix timestamp
  splitDate: bigint("split_date", { mode: "number" }), // store as unix timestamp
  earnings: text("earnings"), // store as JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});