# Yahoo Finance API Integration Guide

This document explains how to integrate live data from Yahoo Finance into IGEA OMNIS PRO.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install the following new dependencies:
- `express` - Backend server
- `cors` - CORS middleware
- `yahoo-finance2` - Yahoo Finance API client
- `concurrently` - Run multiple scripts simultaneously

### 2. Run the Application

**Option A: Run both frontend and backend simultaneously (recommended for development)**
```bash
npm run dev:all
```

**Option B: Run frontend and backend separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run server
```

### 3. API Endpoints

The backend server runs on `http://localhost:3001` with the following endpoints:

#### Health Check
```
GET /api/health
```

#### Get Quote for Single Ticker
```
GET /api/quote/:ticker
Example: GET /api/quote/AAPL
```

#### Get Quotes for Multiple Tickers
```
POST /api/quotes
Body: { "tickers": ["AAPL", "MSFT", "GOOGL"] }
```

#### Get Financial Data
```
GET /api/financials/:ticker
Example: GET /api/financials/AAPL
Returns: Balance sheet, income statement, cash flow, and key statistics
```

#### Get Historical Data
```
GET /api/historical/:ticker?period1=YYYY-MM-DD&period2=YYYY-MM-DD&interval=1d
Example: GET /api/historical/AAPL?interval=1d
```

## Integration Steps for Live Data

### Step 1: Update Stock Prices

In `src/App.jsx`, add a function to fetch live quotes:

```javascript
const fetchLiveQuotes = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tickers: ['AAPL', 'MSFT', 'GOOGL', 'SPY', 'QQQ'] 
      })
    });
    const quotes = await response.json();
    // Update state with live data
    quotes.forEach(quote => {
      if (quote.symbol && !quote.error) {
        // Update your STOCKS or INDICES data
        console.log(`${quote.symbol}: $${quote.regularMarketPrice}`);
      }
    });
  } catch (error) {
    console.error('Error fetching live quotes:', error);
  }
};
```

### Step 2: Fetch Financial Reports

```javascript
const fetchFinancials = async (ticker) => {
  try {
    const response = await fetch(`http://localhost:3001/api/financials/${ticker}`);
    const data = await response.json();
    
    // Access balance sheet
    const balanceSheet = data.balanceSheet?.balanceSheetHistory?.balanceSheetStatements;
    
    // Access income statement
    const incomeStatement = data.incomeStatement?.incomeStatementHistory?.incomeStatements;
    
    // Access key statistics
    const stats = data.summary?.defaultKeyStatistics;
    
    return { balanceSheet, incomeStatement, stats };
  } catch (error) {
    console.error('Error fetching financials:', error);
  }
};
```

### Step 3: Auto-refresh Live Data

Add to your existing auto-refresh effect:

```javascript
useEffect(() => {
  if (!autoRefresh) return;
  
  const interval = setInterval(async () => {
    console.log('Auto-refreshing data...');
    await fetchLiveQuotes();
    setTime(new Date());
  }, 5000);
  
  return () => clearInterval(interval);
}, [autoRefresh]);
```

### Step 4: Update Historical Charts

```javascript
const fetchHistoricalData = async (ticker, days = 365) => {
  try {
    const period2 = new Date();
    const period1 = new Date();
    period1.setDate(period1.getDate() - days);
    
    const response = await fetch(
      `http://localhost:3001/api/historical/${ticker}?` +
      `period1=${period1.toISOString().split('T')[0]}&` +
      `period2=${period2.toISOString().split('T')[0]}&` +
      `interval=1d`
    );
    const history = await response.json();
    
    // Transform to your data format
    return history.map(h => ({
      date: h.date,
      price: h.close,
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
  }
};
```

## Production Deployment

### Environment Variables

Create a `.env` file:
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

### CORS Configuration

Update `server/index.js` for production:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Deployment Options

1. **Separate Deployments:**
   - Frontend: Vercel, Netlify, or GitHub Pages
   - Backend: Heroku, Railway, or DigitalOcean

2. **Single Deployment:**
   - Build frontend and serve from backend
   - Deploy to Heroku, Railway, or AWS

## Rate Limiting Considerations

Yahoo Finance has usage limits. Implement caching:

```javascript
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

app.get('/api/quote/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const cached = cache.get(ticker);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.json(cached.data);
  }
  
  try {
    const quote = await yahooFinance.quote(ticker);
    cache.set(ticker, { data: quote, timestamp: Date.now() });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 3001
- Check CORS configuration in `server/index.js`

### Yahoo Finance API Errors
- Some tickers may not be available
- Add error handling for failed requests
- Implement retry logic

### Performance Issues
- Implement caching (see above)
- Batch requests when possible
- Use WebSockets for real-time updates

## Example: Complete Integration

See `INTEGRATION_EXAMPLE.md` for a complete working example of integrating all features.
