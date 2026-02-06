import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { loadHoldingsFromExcel, getHoldings } from './data.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',') || ['https://financedashboardk.netlify.app','http://localhost:5173', 'http://localhost:3000'];
const DEBUG = process.env.DEBUG === 'true';

// ==================== FINANCE API FUNCTIONS ====================

// Mock data for fallback
const mockData = {
  'AAPL': { current_price: 195.45, pe_ratio: 28.5, eps: 6.05, market_cap: 2.8e12, fifty_two_week_high: 199.62, fifty_two_week_low: 124.17, dividend_yield: 0.005 },
  'MSFT': { current_price: 425.30, pe_ratio: 32.1, eps: 11.25, market_cap: 3.2e12, fifty_two_week_high: 445.10, fifty_two_week_low: 275.00, dividend_yield: 0.007 },
  'GOOGL': { current_price: 165.80, pe_ratio: 24.3, eps: 6.75, market_cap: 1.1e12, fifty_two_week_high: 192.30, fifty_two_week_low: 102.21, dividend_yield: 0.0 },
  'AMZN': { current_price: 180.50, pe_ratio: 42.8, eps: 4.20, market_cap: 1.9e12, fifty_two_week_high: 198.88, fifty_two_week_low: 81.43, dividend_yield: 0.0 },
  'JPM': { current_price: 205.75, pe_ratio: 12.5, eps: 16.45, market_cap: 589e9, fifty_two_week_high: 223.50, fifty_two_week_low: 144.35, dividend_yield: 0.025 },
  'BAC': { current_price: 35.90, pe_ratio: 10.2, eps: 3.52, market_cap: 312e9, fifty_two_week_high: 40.25, fifty_two_week_low: 28.12, dividend_yield: 0.028 },
  'JNJ': { current_price: 158.20, pe_ratio: 15.8, eps: 10.00, market_cap: 416e9, fifty_two_week_high: 165.79, fifty_two_week_low: 143.70, dividend_yield: 0.031 },
  'PFE': { current_price: 26.45, pe_ratio: 11.3, eps: 2.34, market_cap: 147e9, fifty_two_week_high: 40.05, fifty_two_week_low: 23.85, dividend_yield: 0.062 },
  'PG': { current_price: 168.90, pe_ratio: 27.2, eps: 6.20, market_cap: 408e9, fifty_two_week_high: 186.14, fifty_two_week_low: 129.50, dividend_yield: 0.024 },
  'WMT': { current_price: 89.50, pe_ratio: 31.5, eps: 2.84, market_cap: 233e9, fifty_two_week_high: 99.98, fifty_two_week_low: 70.28, dividend_yield: 0.013 },
};

// Stock data cache
const stockDataCache = new Map();
const CACHE_DURATION = 15 * 1000; // 15 seconds

/**
 * Fetch Yahoo Finance price data
 */
async function fetchYahooFinancePrice(symbol) {
  try {
    // Check cache first
    const cached = stockDataCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Using cached data for ${symbol}`);
      return cached.data;
    }

    // Using Yahoo Finance v10 endpoint
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}`,
      {
        params: { modules: 'price,summaryDetail,financialData' },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://finance.yahoo.com/',
        },
        timeout: 8000,
      }
    );

    const result = response.data?.quoteSummary?.result?.[0];
    if (!result) throw new Error('No data found');

    const priceData = {
      symbol,
      current_price: result.price?.regularMarketPrice || 0,
      currency: result.price?.currency || 'USD',
      pe_ratio: result.summaryDetail?.trailingPE?.raw || 0,
      market_cap: result.price?.marketCap?.raw || 0,
      fifty_two_week_high: result.summaryDetail?.fiftyTwoWeekHigh?.raw || 0,
      fifty_two_week_low: result.summaryDetail?.fiftyTwoWeekLow?.raw || 0,
      dividend_yield: result.summaryDetail?.dividendYield?.raw || 0,
      eps: result.financialData?.trailingEps?.raw || 0,
      timestamp: Date.now(),
      source: 'yahoo-finance',
    };

    stockDataCache.set(symbol, { data: priceData, timestamp: Date.now() });
    console.log(`✓ Fetched real data from Yahoo Finance for ${symbol}`);
    return priceData;
  } catch (error) {
    console.warn(`⚠ Error fetching Yahoo Finance for ${symbol}: ${error.message}`);
    
    // Use fallback mock data
    if (mockData[symbol]) {
      console.log(`📊 Using fallback data for ${symbol}`);
      const fallbackData = {
        symbol,
        ...mockData[symbol],
        currency: 'USD',
        timestamp: Date.now(),
        source: 'fallback-mock',
      };
      stockDataCache.set(symbol, { data: fallbackData, timestamp: Date.now() });
      return fallbackData;
    }
    return null;
  }
}

/**
 * Fetch Google Finance data via scraping
 */
async function fetchGoogleFinanceData(symbol) {
  try {
    const url = `https://www.google.com/finance/quote/${symbol}:NASDAQ`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(response.data);
    let peRatio = 0;
    let eps = 0;

    $('div[data-attrid]').each((i, el) => {
      const text = $(el).text();
      if (text.includes('PE Ratio') || text.includes('P/E')) {
        const match = text.match(/[\d.]+/);
        if (match) peRatio = parseFloat(match[0]);
      }
      if (text.includes('EPS') || text.includes('Earnings Per Share')) {
        const match = text.match(/[\d.]+/);
        if (match) eps = parseFloat(match[0]);
      }
    });

    if (peRatio > 0 || eps > 0) {
      console.log(`✓ Fetched Google Finance for ${symbol}: PE=${peRatio}, EPS=${eps}`);
      return { pe_ratio: peRatio, eps };
    }
    return { pe_ratio: 0, eps: 0 };
  } catch (error) {
    console.warn(`⚠ Could not fetch Google Finance for ${symbol}`);
    return { pe_ratio: 0, eps: 0 };
  }
}

/**
 * Fetch consolidated stock data (Yahoo + Google)
 */
async function fetchCompleteStockData(symbols) {
  const results = [];

  for (const symbol of symbols) {
    try {
      const yahooData = await fetchYahooFinancePrice(symbol);
      if (!yahooData) continue;

      const googleData = await fetchGoogleFinanceData(symbol);

      const enrichedData = {
        symbol,
        current_price: yahooData.current_price,
        currency: yahooData.currency || 'USD',
        pe_ratio: googleData?.pe_ratio || yahooData.pe_ratio || 0,
        latest_earnings: yahooData.eps || googleData?.eps || 0,
        market_cap: yahooData.market_cap,
        fifty_two_week_high: yahooData.fifty_two_week_high,
        fifty_two_week_low: yahooData.fifty_two_week_low,
        dividend_yield: yahooData.dividend_yield,
        timestamp: Date.now(),
      };

      results.push(enrichedData);
    } catch (error) {
      console.error(`❌ Error fetching ${symbol}: ${error.message}`);
    }
  }

  return results;
}

// ==================== MIDDLEWARE ====================

app.use(cors({
  origin: CORS_ORIGIN.map(origin => origin.trim()),
  credentials: true
}));
app.use(express.json());

if (DEBUG) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// ==================== STARTUP ====================

console.log('📂 Loading portfolio data from Excel...');
try {
  loadHoldingsFromExcel();
  console.log('✓ Portfolio data loaded successfully');
} catch (error) {
  console.error('❌ Failed to load portfolio data:', error.message);
  process.exit(1);
}

// ==================== ROUTES ====================

// Get all holdings with real-time enriched data
app.get('/api/holdings', async (req, res) => {
  try {
    const holdings = getHoldings();
    const symbols = holdings.map(h => h.symbol);
    const priceData = await fetchCompleteStockData(symbols);
    const pricesMap = new Map(priceData.map(p => [p.symbol, p]));

    const enriched = holdings.map(holding => {
      const price = pricesMap.get(holding.symbol) || { current_price: 0, pe_ratio: 0, latest_earnings: 0 };
      const investment = holding.purchase_price * holding.quantity;
      const current_price = price.current_price || holding.purchase_price;
      const present_value = current_price * holding.quantity;
      const gain_loss = present_value - investment;
      const gain_loss_percentage = investment > 0 ? (gain_loss / investment) * 100 : 0;

      return {
        ...holding,
        current_price,
        pe_ratio: price.pe_ratio || 0,
        latest_earnings: price.latest_earnings || 0,
        market_cap: price.market_cap,
        fifty_two_week_high: price.fifty_two_week_high,
        fifty_two_week_low: price.fifty_two_week_low,
        investment,
        present_value,
        gain_loss,
        gain_loss_percentage,
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Error getting holdings:', error);
    res.status(500).json({ error: 'Failed to get holdings' });
  }
});

// Get portfolio summary
app.get('/api/portfolio-summary', async (req, res) => {
  try {
    const holdings = getHoldings();
    const symbols = holdings.map(h => h.symbol);
    const priceData = await fetchCompleteStockData(symbols);

    let total_investment = 0;
    let total_present_value = 0;

    holdings.forEach(holding => {
      const price = priceData.find(p => p.symbol === holding.symbol) || { current_price: 0 };
      const investment = holding.purchase_price * holding.quantity;
      const current_price = price.current_price || holding.purchase_price;
      const present_value = current_price * holding.quantity;

      total_investment += investment;
      total_present_value += present_value;
    });

    const total_gain_loss = total_present_value - total_investment;
    const gain_loss_percentage = total_investment > 0 ? (total_gain_loss / total_investment) * 100 : 0;

    res.json({
      total_investment,
      total_present_value,
      total_gain_loss,
      gain_loss_percentage,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    res.status(500).json({ error: 'Failed to get portfolio summary' });
  }
});

// Get sector summaries
app.get('/api/sector-summaries', async (req, res) => {
  try {
    const holdings = getHoldings();
    const symbols = holdings.map(h => h.symbol);
    const priceData = await fetchCompleteStockData(symbols);
    const sectorMap = new Map();

    holdings.forEach(holding => {
      const price = priceData.find(p => p.symbol === holding.symbol) || { current_price: 0, pe_ratio: 0, latest_earnings: 0 };
      const investment = holding.purchase_price * holding.quantity;
      const current_price = price.current_price || holding.purchase_price;
      const present_value = current_price * holding.quantity;
      const gain_loss = present_value - investment;
      const gain_loss_percentage = investment > 0 ? (gain_loss / investment) * 100 : 0;

      const enriched = {
        ...holding,
        current_price,
        pe_ratio: price.pe_ratio || 0,
        latest_earnings: price.latest_earnings || 0,
        investment,
        present_value,
        gain_loss,
        gain_loss_percentage,
      };

      const sectorHoldings = sectorMap.get(holding.sector_name) || [];
      sectorHoldings.push(enriched);
      sectorMap.set(holding.sector_name, sectorHoldings);
    });

    const summaries = Array.from(sectorMap.entries()).map(([sector_name, holdingsList]) => {
      const total_investment = holdingsList.reduce((sum, h) => sum + h.investment, 0);
      const total_present_value = holdingsList.reduce((sum, h) => sum + h.present_value, 0);
      const total_gain_loss = total_present_value - total_investment;
      const gain_loss_percentage = total_investment > 0 ? (total_gain_loss / total_investment) * 100 : 0;

      return {
        sector_name,
        total_investment,
        total_present_value,
        total_gain_loss,
        gain_loss_percentage,
        holdings: holdingsList,
      };
    });

    res.json(summaries);
  } catch (error) {
    console.error('Error getting sector summaries:', error);
    res.status(500).json({ error: 'Failed to get sector summaries' });
  }
});

// Refresh stock data
app.post('/api/refresh-prices', async (req, res) => {
  try {
    const { symbols } = req.body;
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ error: 'Invalid symbols array' });
    }
    
    symbols.forEach(s => stockDataCache.delete(s));
    const data = await fetchCompleteStockData(symbols);
    res.json({ success: true, message: `Refreshed ${symbols.length} symbols`, data });
  } catch (error) {
    console.error('Error refreshing prices:', error);
    res.status(500).json({ error: 'Failed to refresh prices' });
  }
});

// Cache stats
app.get('/api/cache-stats', (req, res) => {
  const stats = {
    cached_symbols: stockDataCache.size,
    cache_duration_seconds: CACHE_DURATION / 1000,
    symbols: Array.from(stockDataCache.entries()).map(([symbol, data]) => ({
      symbol,
      cached_at: new Date(data.timestamp),
      age_seconds: Math.round((Date.now() - data.timestamp) / 1000),
    })),
  };
  res.json(stats);
});

// Clear cache
app.post('/api/clear-cache', (req, res) => {
  stockDataCache.clear();
  console.log('🗑 Cache cleared');
  res.json({ success: true, message: 'Cache cleared' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: DEBUG ? err.message : undefined });
});

// ==================== SERVER STARTUP ====================

app.listen(PORT, () => {
  console.log('\n📊 Portfolio API Server');
  console.log('═'.repeat(50));
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Debug mode: ${DEBUG ? 'ON' : 'OFF'}`);
  console.log('\n📡 Data Sources:');
  console.log('  • Yahoo Finance API - Real-time stock prices');
  console.log('  • Google Finance - P/E Ratio and earnings (via scraping)');
  console.log('\n📋 Available Endpoints:');
  console.log('  GET    /health - Health check');
  console.log('  GET    /api/holdings - Get all holdings with prices');
  console.log('  GET    /api/portfolio-summary - Get portfolio summary');
  console.log('  GET    /api/sector-summaries - Get sector summaries');
  console.log('  POST   /api/refresh-prices - Refresh prices');
  console.log('  GET    /api/cache-stats - Cache statistics');
  console.log('  POST   /api/clear-cache - Clear cache');
  console.log('\n═'.repeat(50) + '\n');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('💡 Try: npx kill-port 5000');
    process.exit(1);
  } else {
    throw err;
  }
});

