// // import {
// //   pgTable,
// //   serial,
// //   varchar,
// //   timestamp,
// //   numeric,
// //   bigint,
// //   integer,
// //   date,
// //   uniqueIndex,
// //   primaryKey,
// //   index,
// // } from 'drizzle-orm/pg-core';

// // export const stocks = pgTable('stocks', {
// //   stockId: serial('stock_id').primaryKey(),
// //   symbol: varchar('symbol').unique().notNull(),
// //   name: varchar('name'),
// // });

// // export const latestStockPrices = pgTable('latest_stock_prices', {
// //   stockId: integer('stock_id')
// //     .primaryKey()
// //     .references(() => stocks.stockId, { onDelete: 'cascade' }),
// //   lastUpdated: timestamp('last_updated', { withTimezone: false }).notNull().defaultNow(),
// //   open: numeric('open'),
// //   high: numeric('high'),
// //   low: numeric('low'),
// //   close: numeric('close'),
// //   volume: bigint('volume'),
// // });

// // export const portfolios = pgTable('portfolios', {
// //   portfolioId: serial('portfolio_id').primaryKey(),
// //   userId: varchar('user_id').notNull(),
// //   portfolioName: varchar('portfolio_name').notNull(),
// // }, (table) => ({
// //   userIdx: index('idx_portfolios_user_id').on(table.userId),
// // }));

// // export const portfolioStocks = pgTable('portfolio_stocks', {
// //   portfolioStockId: serial('portfolio_stock_id').primaryKey(),
// //   portfolioId: integer('portfolio_id')
// //     .references(() => portfolios.portfolioId, { onDelete: 'cascade' }),
// //   stockId: integer('stock_id')
// //     .references(() => stocks.stockId, { onDelete: 'cascade' }),
// //   quantity: numeric('quantity').notNull(),
// //   purchasePrice: numeric('purchase_price'),
// //   purchaseDate: date('purchase_date').defaultNow(),
// // }, (table) => ({
// //   uniquePortfolioStock: uniqueIndex('unique_portfolio_stock').on(table.portfolioId, table.stockId),
// //   portfolioIdIdx: index('idx_portfolio_stocks_portfolio_id').on(table.portfolioId),
// // }));

// // export const watchlists = pgTable('watchlists', {
// //   watchlistId: serial('watchlist_id').primaryKey(),
// //   userId: varchar('user_id').notNull(),
// //   watchlistName: varchar('watchlist_name').notNull(),
// // }, (table) => ({
// //   userIdx: index('idx_watchlists_user_id').on(table.userId),
// // }));

// // export const watchlistStocks = pgTable('watchlist_stocks', {
// //   watchlistStockId: serial('watchlist_stock_id').primaryKey(),
// //   watchlistId: integer('watchlist_id')
// //     .references(() => watchlists.watchlistId, { onDelete: 'cascade' }),
// //   stockId: integer('stock_id')
// //     .references(() => stocks.stockId, { onDelete: 'cascade' }),
// // }, (table) => ({
// //   uniqueWatchlistStock: uniqueIndex('unique_watchlist_stock').on(table.watchlistId, table.stockId),
// //   watchlistIdIdx: index('idx_watchlist_stocks_watchlist_id').on(table.watchlistId),
// // }));

// // export const news = pgTable('news', {
// //   newsId: serial('news_id').primaryKey(),
// //   stockId: integer('stock_id')
// //     .references(() => stocks.stockId, { onDelete: 'cascade' }),
// //   title: varchar('title').notNull(),
// //   summary: varchar('summary'),
// //   url: varchar('url'),
// //   publishedAt: timestamp('published_at', { withTimezone: false }).notNull(),
// // });


// import {
//   pgTable,
//   serial,
//   varchar,
//   decimal,
//   bigint,
//   timestamp,
//   text,
//   uniqueIndex,
//   index,
//   integer,
//   primaryKey,
// } from "drizzle-orm/pg-core";

// // STOCKS table
// export const stocks = pgTable("stocks", {
//   id: serial("id").primaryKey(),
//   symbol: varchar("symbol", { length: 20 }).notNull().unique(),
//   name: varchar("name", { length: 255 }).notNull(),
//   currentPrice: decimal("current_price", { precision: 15, scale: 4 }),
//   previousClose: decimal("previous_close", { precision: 15, scale: 4 }),
//   dayChange: decimal("day_change", { precision: 15, scale: 4 }),
//   dayChangePercent: decimal("day_change_percent", { precision: 8, scale: 4 }),
//   marketCap: bigint("market_cap", { mode: "number" }),
//   volume: bigint("volume", { mode: "number" }),
//   high52Week: decimal("high_52_week", { precision: 15, scale: 4 }),
//   low52Week: decimal("low_52_week", { precision: 15, scale: 4 }),
//   peRatio: decimal("pe_ratio", { precision: 8, scale: 4 }),
//   dividendYield: decimal("dividend_yield", { precision: 8, scale: 4 }),
//   sector: varchar("sector", { length: 100 }),
//   industry: varchar("industry", { length: 100 }),
//   exchange: varchar("exchange", { length: 10 }),
//   currency: varchar("currency", { length: 3 }).default("INR"),
//   lastUpdated: timestamp("last_updated").defaultNow(),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// // USER PORTFOLIO
// export const userPortfolio = pgTable(
//   "user_portfolio",
//   {
//     id: serial("id").primaryKey(),
//     userId: varchar("user_id", { length: 255 }).notNull(),
//     stockId: integer("stock_id")
//       .notNull()
//       .references(() => stocks.id, { onDelete: "cascade" }),
//     quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
//     avgPurchasePrice: decimal("avg_purchase_price", {
//       precision: 15,
//       scale: 4,
//     }),
//     purchaseDate: timestamp("purchase_date"),
//     notes: text("notes"),
//     createdAt: timestamp("created_at").defaultNow(),
//     updatedAt: timestamp("updated_at").defaultNow(),
//   },
//   (table) => ({
//     uniqUserStock: uniqueIndex("uniq_user_stock").on(table.userId, table.stockId),
//     userIndex: index("idx_user_portfolio_user_id").on(table.userId),
//   })
// );

// // USER WATCHLIST
// export const userWatchlist = pgTable(
//   "user_watchlist",
//   {
//     id: serial("id").primaryKey(),
//     userId: varchar("user_id", { length: 255 }).notNull(),
//     stockId: integer("stock_id")
//       .notNull()
//       .references(() => stocks.id, { onDelete: "cascade" }),
//     addedAt: timestamp("added_at").defaultNow(),
//     notes: text("notes"),
//   },
//   (table) => ({
//     uniqUserWatch: uniqueIndex("uniq_user_watchlist").on(
//       table.userId,
//       table.stockId
//     ),
//     userIndex: index("idx_user_watchlist_user_id").on(table.userId),
//   })
// );

// // STOCK NEWS
// export const stockNews = pgTable(
//   "stock_news",
//   {
//     id: serial("id").primaryKey(),
//     stockId: integer("stock_id")
//       .notNull()
//       .references(() => stocks.id, { onDelete: "cascade" }),
//     title: varchar("title", { length: 500 }).notNull(),
//     summary: text("summary"),
//     url: varchar("url", { length: 1000 }),
//     source: varchar("source", { length: 100 }),
//     publishedAt: timestamp("published_at"),
//     sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral
//     createdAt: timestamp("created_at").defaultNow(),
//   },
//   (table) => ({
//     stockIndex: index("idx_stock_news_stock_id").on(table.stockId),
//     publishedIndex: index("idx_stock_news_published_at").on(table.publishedAt),
//   })
// );

// // PORTFOLIO UPLOADS
// export const portfolioUploads = pgTable("portfolio_uploads", {
//   id: serial("id").primaryKey(),
//   userId: varchar("user_id", { length: 255 }).notNull(),
//   filename: varchar("filename", { length: 255 }),
//   totalStocks: integer("total_stocks"),
//   successfulImports: integer("successful_imports"),
//   failedImports: integer("failed_imports"),
//   uploadDate: timestamp("upload_date").defaultNow(),
// });


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