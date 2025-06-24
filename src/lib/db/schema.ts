import {
  pgTable,
  serial,
  varchar,
  timestamp,
  numeric,
  bigint,
  integer,
  date,
  uniqueIndex,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';

export const stocks = pgTable('stocks', {
  stockId: serial('stock_id').primaryKey(),
  symbol: varchar('symbol').unique().notNull(),
  name: varchar('name'),
});

export const latestStockPrices = pgTable('latest_stock_prices', {
  stockId: integer('stock_id')
    .primaryKey()
    .references(() => stocks.stockId, { onDelete: 'cascade' }),
  lastUpdated: timestamp('last_updated', { withTimezone: false }).notNull().defaultNow(),
  open: numeric('open'),
  high: numeric('high'),
  low: numeric('low'),
  close: numeric('close'),
  volume: bigint('volume'),
});

export const portfolios = pgTable('portfolios', {
  portfolioId: serial('portfolio_id').primaryKey(),
  userId: varchar('user_id').notNull(),
  portfolioName: varchar('portfolio_name').notNull(),
}, (table) => ({
  userIdx: index('idx_portfolios_user_id').on(table.userId),
}));

export const portfolioStocks = pgTable('portfolio_stocks', {
  portfolioStockId: serial('portfolio_stock_id').primaryKey(),
  portfolioId: integer('portfolio_id')
    .references(() => portfolios.portfolioId, { onDelete: 'cascade' }),
  stockId: integer('stock_id')
    .references(() => stocks.stockId, { onDelete: 'cascade' }),
  quantity: numeric('quantity').notNull(),
  purchasePrice: numeric('purchase_price'),
  purchaseDate: date('purchase_date').defaultNow(),
}, (table) => ({
  uniquePortfolioStock: uniqueIndex('unique_portfolio_stock').on(table.portfolioId, table.stockId),
  portfolioIdIdx: index('idx_portfolio_stocks_portfolio_id').on(table.portfolioId),
}));

export const watchlists = pgTable('watchlists', {
  watchlistId: serial('watchlist_id').primaryKey(),
  userId: varchar('user_id').notNull(),
  watchlistName: varchar('watchlist_name').notNull(),
}, (table) => ({
  userIdx: index('idx_watchlists_user_id').on(table.userId),
}));

export const watchlistStocks = pgTable('watchlist_stocks', {
  watchlistStockId: serial('watchlist_stock_id').primaryKey(),
  watchlistId: integer('watchlist_id')
    .references(() => watchlists.watchlistId, { onDelete: 'cascade' }),
  stockId: integer('stock_id')
    .references(() => stocks.stockId, { onDelete: 'cascade' }),
}, (table) => ({
  uniqueWatchlistStock: uniqueIndex('unique_watchlist_stock').on(table.watchlistId, table.stockId),
  watchlistIdIdx: index('idx_watchlist_stocks_watchlist_id').on(table.watchlistId),
}));

export const news = pgTable('news', {
  newsId: serial('news_id').primaryKey(),
  stockId: integer('stock_id')
    .references(() => stocks.stockId, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  summary: varchar('summary'),
  url: varchar('url'),
  publishedAt: timestamp('published_at', { withTimezone: false }).notNull(),
});
