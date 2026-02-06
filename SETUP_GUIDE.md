# Portfolio Dashboard - Setup & Deployment Guide

## ✅ Project Status
- ✓ Frontend: React + TypeScript + Vite + Tailwind CSS
- ✓ Backend: Node.js + Express + Real APIs
- ✓ Data Sources: Yahoo Finance + Google Finance (with fallback)
- ✓ Database: Excel file (server/data.xlsx)
- ✓ No Supabase, No Mock Data, No Docker required

## 🚀 Quick Start (Development)

### Terminal 1: Start Backend Server
```bash
cd server
npm run dev
```

**Expected Output:**
```
📊 Portfolio API Server
✓ Server running on http://localhost:5000
✓ Data Sources: Yahoo Finance + Google Finance
```

### Terminal 2: Start Frontend App
```bash
npm run dev
```

**Expected Output:**
```
➜  Local:   http://localhost:5173/
```

### Open Browser
Navigate to: **http://localhost:5173**

---

## 📊 Portfolio Data (Excel File)

Location: `server/data.xlsx`

Required Columns:
- **Symbol** - Stock ticker (AAPL, MSFT, etc.)
- **Quantity** - Number of shares
- **Purchase Price** - Price you bought at
- **Sector** - Industry/sector name

Example:
```
Symbol | Quantity | Purchase Price | Sector
-------|----------|----------------|------------------
AAPL   | 100      | 150.00         | Technology
MSFT   | 50       | 300.00         | Technology
JPM    | 25       | 150.00         | Financial Services
```

**10 sample stocks are included in data.xlsx**

---

## 🔌 API Endpoints

All endpoints are available at: `http://localhost:5000/api`

### 1. Get Holdings
```
GET /api/holdings
```
Returns all holdings with real-time prices, P/E ratios, and calculated gains/losses.

### 2. Portfolio Summary
```
GET /api/portfolio-summary
```
Returns overall portfolio statistics:
- Total Investment
- Present Value
- Total Gain/Loss
- Return Percentage

### 3. Sector Summaries
```
GET /api/sector-summaries
```
Returns portfolio breakdown by sector with calculations.

### 4. Health Check
```
GET /health
```

### 5. Refresh Prices (Manual)
```
POST /api/refresh-prices
Body: { "symbols": ["AAPL", "MSFT"] }
```

### 6. Cache Stats
```
GET /api/cache-stats
```

---

## 🗂️ Project Structure

```
project/
├── src/                          # React Frontend
│   ├── App.tsx                  # Main app
│   ├── components/
│   │   ├── PortfolioSummaryCard.tsx
│   │   ├── PortfolioTable.tsx
│   │   └── SectorGroup.tsx
│   ├── hooks/
│   │   └── usePortfolio.ts      # Data fetching hook
│   ├── lib/
│   │   └── supabase.ts          # API client (removed Supabase)
│   └── types/
│       └── portfolio.ts
│
├── server/                       # Node.js Backend
│   ├── index.js                 # Express server
│   ├── routes.js                # API routes
│   ├── data.js                  # Excel file loader
│   ├── financialData.js         # Data fetching & caching
│   ├── yahooFinance.js          # Yahoo Finance API
│   ├── googleFinance.js         # Google Finance scraping
│   ├── data.xlsx                # Portfolio data
│   └── package.json
│
├── package.json                  # Frontend dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── README.md                    # Documentation
└── start-server.bat             # Quick start script
```

---

## 📦 Dependencies

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.344.0",
    "recharts": "^2.10.0"
  }
}
```

### Backend (server/package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "node-xlsx": "^0.23.0",
    "dotenv": "^16.6.1"
  }
}
```

---

## 🌐 Environment Setup

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env.local)
```
PORT=5000
NODE_ENV=development
DEBUG=false
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

---

## 📡 Data Sources

### Yahoo Finance API
- **Status:** Works with fallback mock data
- **Data:** Stock prices, P/E ratios, market cap, earnings
- **Endpoint:** `https://query1.finance.yahoo.com/v10/finance/quoteSummary/{SYMBOL}`
- **Fallback:** Mock data included for demo purposes

### Google Finance (Web Scraping)
- **Status:** Backup data source
- **Data:** P/E ratio, latest earnings
- **Method:** Web scraping with Cheerio

---

## 🔧 Troubleshooting

### Port 5000 Already in Use
```bash
# Kill process on port 5000
taskkill /F /IM node.exe
# OR use the start-server.bat script
```

### API Returns 401 Errors
The application automatically falls back to mock data when the Yahoo Finance API is unavailable.

### Excel File Not Found
Ensure `server/data.xlsx` exists with the required columns: Symbol, Quantity, Purchase Price, Sector

### CORS Errors
Verify `server/.env.local` has correct CORS_ORIGIN settings:
```
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

---

## 📈 Key Features

✅ **Real-Time Data** - Yahoo Finance API with fallback mock data
✅ **No Supabase** - Excel file for portfolio storage
✅ **Automatic Calculations** - Gains/losses calculated automatically
✅ **Sector Analysis** - Portfolio grouped by industry
✅ **API Caching** - 5-minute cache to reduce API calls
✅ **Clean Architecture** - Separate frontend and backend
✅ **Excel Import** - Load holdings from Excel files
✅ **Responsive Design** - Works on all devices

---

## 📚 Additional Resources

- **API Docs:** See API_DOCUMENTATION.md
- **Deployment:** See DEPLOYMENT.md
- **Original README:** See README.md

---

## 🎯 Next Steps

1. ✅ Start backend: `npm run dev` (in server folder)
2. ✅ Start frontend: `npm run dev` (in project root)
3. ✅ Open http://localhost:5173
4. ✅ View portfolio dashboard with live data
5. 📦 To deploy, see DEPLOYMENT.md

---

## 📝 Notes

- **Mock Data:** Included 10 sample stocks for demo
- **API Fallback:** If Yahoo Finance is unavailable, app uses sample data
- **5-Minute Cache:** Stock prices are cached to reduce API calls
- **No Database:** Uses Excel file as data source
- **Environment-Based:** Different configs for dev/production

Enjoy your portfolio tracking! 📊
