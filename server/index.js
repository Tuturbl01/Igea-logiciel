import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for development
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get quote for a single ticker
app.get('/api/quote/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const quote = await yahooFinance.quote(ticker);
    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get quotes for multiple tickers
app.post('/api/quotes', async (req, res) => {
  try {
    const { tickers } = req.body;
    const quotes = await Promise.all(
      tickers.map(ticker => 
        yahooFinance.quote(ticker).catch(err => ({
          symbol: ticker,
          error: err.message
        }))
      )
    );
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get financial data
app.get('/api/financials/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const results = await yahooFinance.quoteSummary(ticker, {
      modules: ['incomeStatementHistory', 'balanceSheetHistory', 'cashflowStatementHistory', 'defaultKeyStatistics', 'financialData']
    });
    res.json(results);
  } catch (error) {
    console.error('Error fetching financials:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get historical data
app.get('/api/historical/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { period1, period2, interval = '1d' } = req.query;
    
    const queryOptions = {
      period1: period1 || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      period2: period2 || new Date(),
      interval
    };
    
    const history = await yahooFinance.historical(ticker, queryOptions);
    res.json(history);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Yahoo Finance API Server running on port ${PORT}`);
});
