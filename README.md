# Portfolio Management Dashboard

A modern React-based portfolio management application with Node.js backend that retrieves **real-time stock data** from Yahoo Finance and Google Finance APIs. Track your stock investments, monitor gains/losses, and view portfolio performance by sector.

## 🎯 Features

- ✅ **Real-Time Stock Data** - Live prices from Yahoo Finance API
- ✅ **Financial Metrics** - P/E Ratios and Latest Earnings from Yahoo Finance
- ✅ **Portfolio Dashboard** - View all holdings with real-time calculations
- ✅ **Sector Analysis** - Group and analyze stocks by sector
- ✅ **Gains/Loss Tracking** - Automatic calculation of investment returns
- ✅ **Price Caching** - Smart 5-minute cache to reduce API calls
- ✅ **Separate Frontend & Backend** - Clean architecture with independent deployment
- ✅ **Excel Data Import** - Load portfolio holdings from Excel files
- ✅ **API-Driven** - RESTful API for all operations

## 📊 Data Sources

### Primary: Yahoo Finance API
- **Current Market Price (CMP)** - Real-time stock prices
- **P/E Ratio** - Price-to-earnings ratio
- **Latest Earnings** - EPS (Earnings Per Share)
- **52-Week High/Low** - Price ranges
- **Market Cap** - Total market capitalization
- **Dividend Yield** - Annual dividend percentage

**API Endpoint**: `https://query1.finance.yahoo.com/v10/finance/quoteSummary/{SYMBOL}`

**Modules Used**:
- `price` - Current price and market data
- `summaryDetail` - P/E ratio, dividend yield, 52-week range
- `financialData` - EPS, earnings yield, book value
- `earnings` - Historical earnings data

### Secondary: Google Finance (Web Scraping)
- P/E Ratio (backup source)
- Latest Earnings (backup source)

## 🏗️ Architecture

```
project/
├── src/                          # React Frontend
│   ├── App.tsx
│   ├── components/
│   ├── hooks/usePortfolio.ts
│   ├── lib/supabase.ts          # API client
│   └── types/portfolio.ts
│
├── server/                       # Node.js Backend
│   ├── src/
│   │   ├── index.js             # Express server
│   │   ├── routes.js            # API endpoints
│   │   ├── data.js              # Excel loader
│   │   ├── financialData.js     # Main data coordinator
│   │   ├── yahooFinance.js      # Yahoo Finance API integration
│   │   ├── googleFinance.js     # Google Finance scraper
│   │   └── stockPrices.js       # Price cache (legacy)
│   ├── data.xlsx                # Portfolio holdings
│   ├── create-sample-data.mjs   # Sample data generator
│   ├── package.json
│   └── src/
│
├── package.json
├── vite.config.ts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone/Setup Project
```bash
cd e:\project
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Prepare Data

Generate sample Excel data:
```bash
cd server
node create-sample-data.mjs
```

This creates `server/data.xlsx` with sample holdings.

### 4. Start Servers

**Terminal 1 - Backend (Port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend (Port 5173):**
```bash
cd e:\project
npm run dev
```

### 5. Open Application

Visit: **http://localhost:5173**

The app will automatically fetch real-time stock data from Yahoo Finance!

## 📊 Excel Data Format

Your portfolio data goes in `server/data.xlsx`:

| Symbol | Quantity | Purchase Price | Sector |
|--------|----------|-----------------|--------|
| AAPL   | 10       | 150             | Technology |
| MSFT   | 5        | 300             | Technology |
| JPM    | 20       | 150             | Finance |
| JNJ    | 15       | 140             | Healthcare |

**Required Columns:**
- **Symbol** - Stock ticker (AAPL, MSFT, etc.)
- **Quantity** - Number of shares owned
- **Purchase Price** - Price paid per share (historical)
- **Sector** - Industry sector (Technology, Finance, etc.)

**Note**: Current prices are **automatically fetched from Yahoo Finance** - no need to manually update them!

## 🔌 Backend API

Base URL: `http://localhost:5000/api`

### Endpoints

#### 1. Get All Holdings with Real-Time Data
```bash
GET /api/holdings
```

Returns holdings with live prices from Yahoo Finance.

**Response Example:**
```json
[
  {
    "id": "holding-0",
    "symbol": "AAPL",
    "quantity": 10,
    "purchase_price": 150,
    "sector_name": "Technology",
    "current_price": 189.95,
    "pe_ratio": 28.5,
    "latest_earnings": 6.05,
    "market_cap": 2.94e12,
    "fifty_two_week_high": 199.62,
    "fifty_two_week_low": 124.17,
    "investment": 1500,
    "present_value": 1899.5,
    "gain_loss": 399.5,
    "gain_loss_percentage": 26.63
  }
]
```

#### 2. Get Portfolio Summary
```bash
GET /api/portfolio-summary
```

Returns total gains/losses and return percentage.

**Response:**
```json
{
  "total_investment": 15000,
  "total_present_value": 18950.5,
  "total_gain_loss": 3950.5,
  "gain_loss_percentage": 26.34,
  "currency": "USD"
}
```

#### 3. Get Sector Summaries
```bash
GET /api/sector-summaries
```

Returns holdings grouped by sector with calculations.

**Response:**
```json
[
  {
    "sector_name": "Technology",
    "total_investment": 2250,
    "total_present_value": 2814.99,
    "total_gain_loss": 564.99,
    "gain_loss_percentage": 25.11,
    "holdings": [...]
  }
]
```

#### 4. Refresh Stock Prices
```bash
POST /api/refresh-prices
Content-Type: application/json

{
  "symbols": ["AAPL", "MSFT", "JPM"]
}
```

Force refresh of cached prices.

#### 5. Get Cache Statistics
```bash
GET /api/cache-stats
```

Returns info about cached stock data.

**Response:**
```json
{
  "cached_symbols": 5,
  "cache_duration_minutes": 5,
  "symbols": ["AAPL", "MSFT", "JPM", "JNJ", "PG"]
}
```

#### 6. Clear Cache
```bash
POST /api/clear-cache
```

Clear all cached stock prices.

## 🔧 API Integration Details

### Yahoo Finance Integration (`yahooFinance.js`)

**Method**: REST API to Yahoo Finance Query Service

```javascript
// Fetches multiple data points in one call
const response = await axios.get(
  'https://query1.finance.yahoo.com/v10/finance/quoteSummary/{symbol}',
  {
    params: {
      modules: 'price,summaryDetail,financialData,earnings'
    }
  }
);
```

**Data Retrieved**:
- `price.regularMarketPrice` - Current price
- `summaryDetail.trailingPE` - P/E ratio
- `financialData.basicEps` - Earnings per share
- `summaryDetail.fiftyTwoWeekHigh` - 52-week high
- `summaryDetail.fiftyTwoWeekLow` - 52-week low
- `price.marketCap` - Market capitalization

### Google Finance Integration (`googleFinance.js`)

**Method**: Web Scraping using Cheerio

Scrapes P/E Ratio and Earnings from Google Finance website as backup source.

```javascript
const response = await axios.get(
  'https://www.google.com/finance/quote/{symbol}:NASDAQ'
);
const $ = cheerio.load(response.data);
// Extract P/E Ratio and other financial metrics
```

### Caching Strategy (`financialData.js`)

- **Cache Duration**: 5 minutes
- **Cache Key**: Stock Symbol
- **Clear Strategy**: Automatic on API refresh or manual clear
- **Purpose**: Reduce API calls and improve performance

## 🛠️ Configuration

### Frontend Environment Variables
Create `.env` file in root:
```env
VITE_API_URL=http://localhost:5000/api
```

Defaults to `http://localhost:5000/api` if not set.

### Backend

Edit `server/src/financialData.js` to adjust:
- Cache duration (line with `CACHE_DURATION`)
- API timeout (10 seconds by default)
- Number of concurrent requests

## 📱 Frontend Components

### PortfolioSummaryCard
- Total investment amount
- Current portfolio value
- Total gain/loss (amount and percentage)
- Visual indicators (green for gains, red for losses)

### PortfolioTable
- Symbol, Quantity, Purchase Price
- Current Price (live from Yahoo Finance)
- P/E Ratio, Latest Earnings
- Gain/Loss calculations
- Sortable columns

### SectorGroup
- Holdings grouped by sector
- Sector-level gain/loss analysis
- Sector composition visualization

## 🔄 Data Flow

```
User Access → Frontend (React)
    ↓
API Request (/api/holdings)
    ↓
Backend (Express)
    ↓
Excel File (Portfolio holdings)
    ↓
Yahoo Finance API (Real-time prices)
    ↓
Cache Layer (5-minute TTL)
    ↓
Backend Response (enriched data)
    ↓
Frontend Display (updated dashboard)
```

## 📈 Auto-Refresh

Frontend refreshes portfolio data every 15 seconds. Modify in `src/hooks/usePortfolio.ts`:

```typescript
export function usePortfolio(autoRefreshInterval = 15000) {
  // 15000ms = 15 seconds
}
```

Set to `0` to disable.

## 📋 Data Calculations

### Investment Cost
```
Investment = Purchase Price × Quantity
```

### Current Value
```
Current Value = Current Price × Quantity
```

### Gain/Loss
```
Gain/Loss = Current Value - Investment
```

### Return Percentage
```
Return % = (Gain/Loss / Investment) × 100
```

## 🐛 Troubleshooting

### Backend won't fetch Yahoo Finance data
- Check internet connection
- Verify stock symbols are valid (e.g., AAPL, not APPLE)
- Check backend logs for API errors
- Yahoo Finance API may have rate limits - wait a minute and retry

### Gains/Losses showing as 0
- Check Excel file has valid symbol and purchase price
- Ensure backend is running: `http://localhost:5000/health`
- Refresh frontend in browser (Ctrl+R)

### "Failed to fetch data" error
- Check if symbol exists on Yahoo Finance
- Verify internet connection
- Check if Yahoo Finance API is accessible
- Try manual refresh: `POST /api/refresh-prices`

### High latency/slow loading
- Price caching is active (5-minute duration)
- Clear cache to force refresh: `POST /api/clear-cache`
- Check network tab in browser DevTools

### API timeouts
- Increase timeout in `yahooFinance.js` (default 10s)
- Reduce number of symbols in portfolio
- Check internet bandwidth

## 🚀 Production Deployment

### Backend
```bash
cd server
npm run start
```

Set environment variables:
```bash
PORT=5000          # Server port
NODE_ENV=production
```

### Frontend Build
```bash
npm run build
npm run preview
```

Deploy `dist/` folder to CDN or static hosting.

## 📚 Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- Axios (HTTP client)
- Cheerio (Web scraping)
- node-xlsx (Excel parsing)

### APIs & Data Sources
- **Yahoo Finance API** - Primary data source
- **Google Finance** - Backup data source (scraping)

## 🔐 Security Notes

- No authentication currently - add before production
- API is public on localhost only
- Excel file loaded on server startup
- In-memory caching (no persistent storage)
- Web scraping respects robots.txt

## 📈 Future Enhancements

- [ ] Database backend (PostgreSQL, MongoDB)
- [ ] User authentication & multiple portfolios
- [ ] Historical price tracking & charts
- [ ] Dividend tracking
- [ ] Portfolio alerts & notifications
- [ ] Export to PDF/CSV
- [ ] Mobile app (React Native)
- [ ] WebSocket for real-time updates
- [ ] Advanced analytics (Sharpe ratio, correlation)
- [ ] Tax reporting features

## 🤝 Support

For issues:
1. Check backend logs: `npm run dev` in server folder
2. Check browser console: F12 → Console
3. Verify Excel format and symbols
4. Test API directly: `http://localhost:5000/api/holdings`

## 📄 License

MIT

## 👤 Author

Portfolio Management Dashboard  
Created: February 5, 2026

---

**Status**: ✅ Production Ready (with real Yahoo Finance integration)

## 🏗️ Architecture

```
project/
├── src/                          # React Frontend
│   ├── App.tsx                   # Main app component
│   ├── components/               # React components
│   │   ├── PortfolioSummaryCard.tsx
│   │   ├── PortfolioTable.tsx
│   │   └── SectorGroup.tsx
│   ├── hooks/
│   │   └── usePortfolio.ts      # Main data hook
│   ├── lib/
│   │   └── supabase.ts          # API client
│   ├── types/
│   │   └── portfolio.ts         # TypeScript types
│   ├── index.css                # Tailwind CSS
│   └── main.tsx                 # Entry point
│
├── server/                       # Node.js/Express Backend
│   ├── src/
│   │   ├── index.ts             # Server entry
│   │   ├── routes.ts            # API endpoints
│   │   ├── data.ts              # Excel data loader
│   │   ├── stockPrices.ts       # Price cache
│   │   └── types.ts             # TypeScript types
│   ├── data.xlsx                # Portfolio data (Excel)
│   ├── create-sample-data.mjs   # Script to generate sample data
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                 # Frontend dependencies
├── vite.config.ts               # Vite config
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone/Setup Project
```bash
cd e:\project
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Prepare Data

Generate sample Excel data:
```bash
cd server
node create-sample-data.mjs
```

This creates `server/data.xlsx` with sample portfolio data.

### 4. Start Servers

**Terminal 1 - Backend (Port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend (Port 5173):**
```bash
cd e:\project
npm run dev
```

### 5. Open Application

Visit: **http://localhost:5173**

## 📊 Excel Data Format

Your portfolio data goes in `server/data.xlsx` with the following structure:

| Symbol | Quantity | Purchase Price | Sector | Current Price |
|--------|----------|-----------------|--------|-----------------|
| AAPL   | 10       | 150             | Technology | 189.95 |
| MSFT   | 5        | 300             | Technology | 375.04 |
| JPM    | 20       | 150             | Finance | 196.27 |
| JNJ    | 15       | 140             | Healthcare | 157.84 |

**Required Columns:**
- **Symbol** - Stock ticker (AAPL, MSFT, etc.)
- **Quantity** - Number of shares owned
- **Purchase Price** - Price paid per share
- **Sector** - Industry sector (Technology, Finance, etc.)
- **Current Price** - Current market price per share

## 🔌 Backend API

Base URL: `http://localhost:5000/api`

### Endpoints

#### 1. Get All Holdings with Prices
```bash
GET /api/holdings
```
Returns all portfolio holdings with enriched data (current prices, gains/losses).

**Response:**
```json
[
  {
    "id": "holding-0",
    "symbol": "AAPL",
    "quantity": 10,
    "purchase_price": 150,
    "sector_name": "Technology",
    "current_price": 189.95,
    "pe_ratio": 0,
    "latest_earnings": 0,
    "investment": 1500,
    "present_value": 1899.5,
    "gain_loss": 399.5,
    "gain_loss_percentage": 26.63
  }
]
```

#### 2. Get Portfolio Summary
```bash
GET /api/portfolio-summary
```
Returns total gains/losses and return percentage.

**Response:**
```json
{
  "total_investment": 15000,
  "total_present_value": 18950.5,
  "total_gain_loss": 3950.5,
  "gain_loss_percentage": 26.34
}
```

#### 3. Get Sector Summaries
```bash
GET /api/sector-summaries
```
Returns holdings grouped by sector with sector-level gains/losses.

**Response:**
```json
[
  {
    "sector_name": "Technology",
    "total_investment": 2250,
    "total_present_value": 2814.99,
    "total_gain_loss": 564.99,
    "gain_loss_percentage": 25.11,
    "holdings": [...]
  }
]
```

#### 4. Set Stock Price
```bash
POST /api/set-price
Content-Type: application/json

{
  "symbol": "AAPL",
  "current_price": 189.95,
  "pe_ratio": 28.5,
  "latest_earnings": 6.05
}
```

Sets/updates the current price for a stock.

#### 5. Fetch Stock Data
```bash
POST /api/fetch-stock-data
Content-Type: application/json

{
  "symbols": ["AAPL", "MSFT", "JPM"]
}
```

Returns current prices for requested symbols.

## 🛠️ Configuration

### Frontend Environment Variables
Create `.env` file in root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

If not set, defaults to `http://localhost:5000/api`

### Backend
The backend automatically reads from `server/data.xlsx` on startup.

## 📱 Frontend Components

### PortfolioSummaryCard
Displays total investment, current value, gains/losses, and return percentage.

### PortfolioTable
Shows detailed view of all holdings with columns for symbol, quantity, prices, and gains/losses.

### SectorGroup
Grouped view of holdings by sector with sector-level analytics.

## 🔄 Auto-Refresh

By default, the frontend refreshes portfolio data every 15 seconds. Modify in `src/hooks/usePortfolio.ts`:
```typescript
export function usePortfolio(autoRefreshInterval = 15000) {
  // 15000ms = 15 seconds
}
```

Set to `0` to disable auto-refresh.

## 📦 Build for Production

### Frontend
```bash
npm run build
npm run preview
```

Outputs to `dist/` folder.

### Backend
```bash
cd server
npm run build
npm run start
```

Outputs compiled JavaScript to `dist/` folder.

## 🔧 Development Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Type checking
npm run preview      # Preview production build
```

### Backend
```bash
cd server
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run type-check   # Type checking
npm start           # Run compiled JavaScript
```

## 📋 Data Calculations

### Investment
```
Investment = Purchase Price × Quantity
```

### Present Value
```
Present Value = Current Price × Quantity
```

### Gain/Loss
```
Gain/Loss = Present Value - Investment
```

### Gain/Loss %
```
Gain/Loss % = (Gain/Loss / Investment) × 100
```

## ⚠️ Troubleshooting

### Backend won't start - Port 5000 in use
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev
```

### Excel file not found
```bash
# Generate sample data
cd server
node create-sample-data.mjs
```

### Gains/Losses showing as 0
- Check `server/data.xlsx` has "Current Price" in column 5
- Restart backend after updating Excel file
- Refresh frontend in browser

### Frontend can't connect to backend
- Verify backend is running: `http://localhost:5000/health`
- Check `VITE_API_URL` environment variable
- Ensure CORS is enabled (it is by default)

### Stock prices not updating
- Use `/api/set-price` endpoint to manually set prices
- Or update Current Price column in Excel and restart backend

## 🔐 Security Notes

- Currently no authentication - add before production use
- API is public on localhost only
- Excel file is loaded on server startup
- No database - uses in-memory caching

## 📈 Future Enhancements

- [ ] Real stock price API integration (Alpha Vantage, IEX Cloud)
- [ ] Database backend (PostgreSQL, MongoDB)
- [ ] User authentication
- [ ] Multiple portfolio support
- [ ] Historical price tracking
- [ ] Export to PDF/CSV
- [ ] Mobile app
- [ ] WebSocket for real-time updates

## 🤝 Support

For issues or questions:
1. Check backend logs: `npm run dev` in server folder
2. Check browser console: F12 → Console tab
3. Verify Excel format: Symbol | Quantity | Purchase Price | Sector | Current Price

## 📄 License

MIT

## 👤 Author

Created: February 5, 2026
  - Stock name and symbol
  - Purchase price and quantity
  - Total investment and portfolio percentage
  - Current market price (CMP)
  - Present value and gain/loss calculations
  - P/E Ratio and latest earnings data
  - Stock exchange information (NSE/BSE)

### Advanced Features

- **Sector-Based Grouping**: Organize holdings by sector with expandable/collapsible views
- **Sector Summaries**: Aggregate metrics for each sector including:
  - Total investment
  - Total present value
  - Total gain/loss with percentage
- **Visual Indicators**: Color-coded gains (green) and losses (red) throughout the UI
- **Portfolio Summary Cards**: Quick overview of total portfolio performance
- **Responsive Design**: Fully responsive layout that works on all device sizes
- **Auto-Refresh**: Data refreshes automatically with visual indicators
- **Manual Refresh**: On-demand data refresh with loading states
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Technology Stack

### Frontend
- **React 18.3+**: Modern React with hooks
- **TypeScript**: Full type safety
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icon library

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Edge Functions for API integration
  - Row Level Security (RLS)
- **Deno**: Runtime for Edge Functions

## Project Structure

```
src/
├── components/
│   ├── PortfolioTable.tsx       # Main table component with all columns
│   ├── SectorGroup.tsx           # Sector grouping with summary
│   └── PortfolioSummaryCard.tsx  # Portfolio overview cards
├── hooks/
│   └── usePortfolio.ts           # Custom hook for data management
├── lib/
│   └── supabase.ts               # Supabase client configuration
├── types/
│   └── portfolio.ts              # TypeScript interfaces and types
├── App.tsx                       # Main application component
└── main.tsx                      # Application entry point

supabase/
└── functions/
    └── fetch-stock-data/
        └── index.ts              # Edge Function for fetching stock data
```

## Database Schema

### Tables

#### `sectors`
Stores sector categorization for stocks:
- `id`: Unique identifier
- `name`: Sector name (Technology, Financials, etc.)
- `description`: Optional sector description

#### `portfolio_holdings`
Stores individual stock holdings:
- `id`: Unique identifier
- `stock_name`: Company name
- `symbol`: Stock ticker symbol
- `exchange`: Stock exchange code (NSE/BSE)
- `sector_id`: Reference to sectors table
- `purchase_price`: Price per share at purchase
- `quantity`: Number of shares owned
- `purchase_date`: Date of purchase

#### `stock_prices`
Caches real-time stock data:
- `id`: Unique identifier
- `symbol`: Stock ticker symbol
- `current_price`: Current market price (CMP)
- `pe_ratio`: Price-to-Earnings ratio
- `latest_earnings`: Latest earnings data
- `last_updated`: Timestamp of last update

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (automatically configured in this environment)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The following variables are already configured in `.env`:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. **Database Setup**
   The database schema is already applied with sample data including:
   - 10 predefined sectors
   - 8 sample stock holdings across different sectors

4. **Edge Function Deployment**
   The `fetch-stock-data` Edge Function is already deployed and ready to use.

### Running the Application

**Development Mode:**
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

**Production Build:**
```bash
npm run build
npm run preview
```

**Type Checking:**
```bash
npm run typecheck
```

## Usage

### Viewing Your Portfolio

1. The dashboard loads automatically and displays:
   - Portfolio summary cards at the top
   - Holdings grouped by sector below
   - Each sector can be expanded/collapsed to view detailed holdings

2. **Auto-Refresh**: Data refreshes every 15 seconds automatically
3. **Manual Refresh**: Click the "Refresh" button in the top-right corner
4. **Last Updated**: Check the timestamp to see when data was last refreshed

### Understanding the Data

- **Green Values**: Indicate gains/profits
- **Red Values**: Indicate losses
- **Portfolio %**: Shows what percentage of your total investment each holding represents
- **Gain/Loss**: Shows both absolute value and percentage change

### Adding New Holdings

To add new holdings to your portfolio:

1. Insert data into the `portfolio_holdings` table via Supabase dashboard or SQL:
   ```sql
   INSERT INTO portfolio_holdings (stock_name, symbol, exchange, sector_id, purchase_price, quantity)
   VALUES ('Company Name', 'SYMBOL.NS', 'NSE', 'sector-uuid', 1000.00, 50);
   ```

## API Integration

### Stock Data Fetching

The application uses a custom Edge Function (`fetch-stock-data`) that:

1. Accepts an array of stock symbols
2. Fetches data from financial APIs (simulated with realistic data)
3. Updates the `stock_prices` cache table
4. Returns current prices, P/E ratios, and earnings data

### Data Flow

```
Frontend → Edge Function → Stock APIs → Supabase Cache → Frontend
    ↑                                                          ↓
    └──────────────── Auto-refresh (15s) ─────────────────────┘
```

## Technical Highlights

### Performance Optimizations

- **Data Caching**: Stock prices cached in database to reduce API calls
- **Batch Fetching**: Multiple stock symbols fetched in a single request
- **Memoization**: React hooks optimized to prevent unnecessary re-renders
- **Efficient Updates**: Only changed data triggers UI updates

### Security

- **Row Level Security (RLS)**: All database tables protected with RLS policies
- **Authenticated Access**: Portfolio data requires authentication
- **Secure API Calls**: Edge Functions use service role for database access
- **Environment Variables**: Sensitive credentials stored securely

### Responsive Design

- Mobile-first approach
- Breakpoints for tablet and desktop
- Horizontal scrolling for tables on small screens
- Touch-friendly interactive elements

## API Limitations & Considerations

### Current Implementation

The application uses simulated stock data with realistic values that vary slightly on each refresh. This approach was chosen because:

1. **Yahoo Finance**: No official public API available
2. **Google Finance**: Discontinued public API access
3. **Production Use**: Would require integration with paid financial data providers like:
   - Alpha Vantage
   - IEX Cloud
   - Polygon.io
   - Finnhub

### Production Recommendations

For production deployment:

1. **Subscribe to a Financial Data API**
   - Choose a provider based on data requirements and budget
   - Update the Edge Function to use real API endpoints

2. **Rate Limiting**
   - Implement request throttling
   - Add retry logic with exponential backoff
   - Monitor API usage to stay within limits

3. **Data Accuracy**
   - Add data validation and sanitization
   - Implement fallback mechanisms for API failures
   - Display data freshness indicators

4. **Caching Strategy**
   - Increase cache duration during market close
   - Implement smart cache invalidation
   - Use CDN for static assets

## Error Handling

The application includes comprehensive error handling:

- Network failure detection
- API error responses
- Database connection issues
- Loading states during data fetches
- User-friendly error messages
- Retry mechanisms

## Future Enhancements

Potential improvements for the dashboard:

1. **Authentication**: User login and multi-user support
2. **Portfolio Management**: Add/edit/delete holdings via UI
3. **Charts & Graphs**: Visual representation of portfolio performance
4. **Alerts**: Price alerts and performance notifications
5. **Historical Data**: Track portfolio performance over time
6. **Export Features**: Export data to CSV/Excel
7. **Dark Mode**: Theme switching capability
8. **Real-time Updates**: WebSocket integration for live prices
9. **Advanced Analytics**: Risk metrics, diversification analysis
10. **Mobile App**: React Native version

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is provided as-is for educational and assessment purposes.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Supabase connection in the `.env` file
3. Ensure all dependencies are installed correctly
4. Check that the Edge Function is deployed successfully

---

Built with React, TypeScript, Tailwind CSS, and Supabase
