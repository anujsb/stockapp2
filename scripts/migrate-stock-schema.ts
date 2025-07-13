// scripts/migrate-stock-schema.ts
// Migration script to add comprehensive fields to existing stocks table

import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function migrateStockSchema() {
  console.log('🔄 Starting stock schema migration...');

  try {
    // Add new columns to stocks table
    const alterQueries = [
      // 🔴 REAL-TIME DATA fields
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS bid DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS ask DECIMAL(15,4)`,
      
      // 🟡 DAILY DATA fields
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS shares_outstanding BIGINT`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS float BIGINT`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS long_name VARCHAR(500)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS website VARCHAR(500)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS hq_location VARCHAR(500)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS employees INTEGER`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS ceo VARCHAR(100)`,
      
      // Financial Ratios
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS price_to_book DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS price_to_sales DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS ev_to_ebitda DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS peg_ratio DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS book_value DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS dividend_rate DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS next_ex_dividend_date TIMESTAMP`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS split_date TIMESTAMP`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS split_factor VARCHAR(50)`,
      
      // Financial Health
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS revenue_growth DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS gross_margin DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS operating_margin DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS net_margin DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS debt_to_equity DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS current_ratio DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS quick_ratio DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS return_on_equity DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS return_on_assets DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS beta DECIMAL(8,4)`,
      
      // 🟢 WEEKLY/MONTHLY/QUARTERLY DATA
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS description TEXT`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS institutional_percent DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS insider_percent DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS esg_environmental_score INTEGER`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS esg_social_score INTEGER`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS esg_governance_score INTEGER`,
      
      // Technical Indicators
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sma_20 DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sma_50 DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS rsi DECIMAL(8,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS macd_line DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS macd_signal DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS macd_histogram DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS atr DECIMAL(15,4)`,
      
      // Support & Resistance levels
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS support_level_1 DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS support_level_2 DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS resistance_level_1 DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS resistance_level_2 DECIMAL(15,4)`,
      
      // Analyst Ratings
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS analyst_buy_count INTEGER`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS analyst_hold_count INTEGER`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS analyst_sell_count INTEGER`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS analyst_target_price DECIMAL(15,4)`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS analyst_recommendation VARCHAR(20)`,
      
      // Timestamps
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS last_real_time_update TIMESTAMP`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS last_daily_update TIMESTAMP`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS last_weekly_update TIMESTAMP`,
      sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS last_quarterly_update TIMESTAMP`,
    ];

    console.log('📝 Adding new columns to stocks table...');
    for (const query of alterQueries) {
      await db.execute(query);
    }

    // Create new tables
    console.log('📝 Creating stock_refresh_log table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS stock_refresh_log (
        id SERIAL PRIMARY KEY,
        stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
        refresh_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        data_updated JSON,
        error_message TEXT,
        api_endpoint VARCHAR(500),
        response_time INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('📝 Creating indexes for stock_refresh_log...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_stock_refresh_stock_type 
      ON stock_refresh_log(stock_id, refresh_type)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_stock_refresh_created_at 
      ON stock_refresh_log(created_at)
    `);

    console.log('📝 Creating stock_earnings table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS stock_earnings (
        id SERIAL PRIMARY KEY,
        stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
        earnings_date TIMESTAMP NOT NULL,
        estimate DECIMAL(15,4),
        actual DECIMAL(15,4),
        surprise DECIMAL(15,4),
        surprise_percent DECIMAL(8,4),
        period VARCHAR(20),
        year INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('📝 Creating indexes for stock_earnings...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_stock_earnings_stock_date 
      ON stock_earnings(stock_id, earnings_date)
    `);

    console.log('📝 Creating stock_financials table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS stock_financials (
        id SERIAL PRIMARY KEY,
        stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
        statement_type VARCHAR(20) NOT NULL,
        period VARCHAR(20) NOT NULL,
        date TIMESTAMP NOT NULL,
        data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('📝 Creating indexes for stock_financials...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_stock_financials_stock_type_date 
      ON stock_financials(stock_id, statement_type, date)
    `);

    console.log('📝 Creating stock_institutional_holders table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS stock_institutional_holders (
        id SERIAL PRIMARY KEY,
        stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
        holder_name VARCHAR(255) NOT NULL,
        shares BIGINT,
        percent_held DECIMAL(8,4),
        value BIGINT,
        report_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('📝 Creating indexes for stock_institutional_holders...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_stock_holders_stock_id 
      ON stock_institutional_holders(stock_id)
    `);

    // Add relevance_score to stock_news table
    console.log('📝 Adding relevance_score to stock_news table...');
    await db.execute(sql`
      ALTER TABLE stock_news ADD COLUMN IF NOT EXISTS relevance_score DECIMAL(8,4)
    `);

    console.log('✅ Migration completed successfully!');
    console.log('📊 New comprehensive stock data fields have been added to the database.');
    console.log('🔄 The refresh system is now ready to use the enhanced data structure.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateStockSchema()
    .then(() => {
      console.log('🎉 Migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateStockSchema }; 