import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Search,
  Target,
  Globe,
  Download,
  FileText,
  Building2,
  Newspaper,
  DollarSign,
  BarChart3,
  ArrowRightLeft,
  PlusCircle,
  X,
  Calendar,
  Filter,
} from 'lucide-react';

// ============================================================================
// FMP API CONFIGURATION
// ============================================================================
const API_KEY = '6HC5r0WZ2ZAMpLbS5xu27Hj9Xa81XkDY';
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

// FMP API utility functions
const fetchFMP = async (endpoint, params = {}) => {
  const queryParams = new URLSearchParams({
    apikey: API_KEY,
    ...params,
  });
  
  try {
    const response = await fetch(`${FMP_BASE_URL}${endpoint}?${queryParams}`);
    if (!response.ok) {
      throw new Error(`FMP API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('FMP API Error:', error);
    throw error;
  }
};

// ============================================================================
// DESIGN SYSTEM - Corporate Blue Theme
// ============================================================================
const COLORS = {
  // Brand colors
  primary: '#457A9A',
  primaryLight: '#5A8FAF',
  primaryDark: '#365F7A',

  // Backgrounds
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F8F9FA',
  bgTertiary: '#EEF1F4',
  bgHeader: '#1C2834',
  bgDark: '#243442',

  // Text
  textPrimary: '#1C2834',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  textMuted: '#A0AEC0',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  borderDark: '#CBD5E0',

  // Status
  positive: '#059669',
  positiveLight: '#D1FAE5',
  negative: '#DC2626',
  negativeLight: '#FEE2E2',
  neutral: '#6B7280',
  warning: '#D97706',

  // Charts
  chart1: '#457A9A',
  chart2: '#059669',
  chart3: '#DC2626',
  chart4: '#D97706',
  chart5: '#7C3AED',
  chart6: '#0891B2',
  chart7: '#BE185D',
  chart8: '#65A30D',
};

// ============================================================================
// COMPREHENSIVE DATA
// ============================================================================
const generateHistory = (base, vol, days, trend = 0) => {
  const data = [];
  let price = base;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    price = price * (1 + trend / days + (Math.random() - 0.5) * vol);
    data.push({
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      fullDate: date.toISOString().split('T')[0],
      price: Math.round(price * 10000) / 10000,
      close: Math.round(price * 10000) / 10000,
      volume: Math.floor(Math.random() * 50000000) + 20000000,
    });
  }
  return data;
};

// ============================================================================
// INITIAL DATA (Used as baseline for state)
// ============================================================================

// Indices - Initial Values
const INITIAL_INDICES = {
  SPX: {
    name: 'S&P 500',
    price: 5234.18,
    change: 1.23,
    region: 'US',
    history: generateHistory(5000, 0.012, 365, 0.08),
  },
  NDX: {
    name: 'NASDAQ 100',
    price: 18384.47,
    change: 1.67,
    region: 'US',
    history: generateHistory(17500, 0.018, 365, 0.12),
  },
  INDU: {
    name: 'Dow Jones',
    price: 38671.69,
    change: 0.89,
    region: 'US',
    history: generateHistory(38000, 0.01, 365, 0.05),
  },
  RTY: {
    name: 'Russell 2000',
    price: 2048.32,
    change: -0.45,
    region: 'US',
    history: generateHistory(2000, 0.015, 365, 0.03),
  },
  DAX: {
    name: 'DAX 40',
    price: 17842.31,
    change: -0.34,
    region: 'EU',
    history: generateHistory(17500, 0.014, 365, 0.04),
  },
  UKX: {
    name: 'FTSE 100',
    price: 7687.25,
    change: 0.45,
    region: 'EU',
    history: generateHistory(7600, 0.012, 365, 0.02),
  },
  CAC: {
    name: 'CAC 40',
    price: 7628.44,
    change: 0.28,
    region: 'EU',
    history: generateHistory(7500, 0.013, 365, 0.03),
  },
  NKY: {
    name: 'Nikkei 225',
    price: 38487.24,
    change: 2.13,
    region: 'APAC',
    history: generateHistory(37000, 0.018, 365, 0.1),
  },
  HSI: {
    name: 'Hang Seng',
    price: 17089.42,
    change: -1.24,
    region: 'APAC',
    history: generateHistory(18000, 0.02, 365, -0.05),
  },
  SHCOMP: {
    name: 'Shanghai Comp',
    price: 3041.17,
    change: 0.67,
    region: 'APAC',
    history: generateHistory(3000, 0.015, 365, 0.02),
  },
};

// Forex - Initial Values
const INITIAL_FOREX = {
  EURUSD: {
    name: 'EUR/USD',
    price: 1.0847,
    change: -0.12,
    bid: 1.0845,
    ask: 1.0849,
    category: 'Major',
    history: generateHistory(1.08, 0.004, 365, -0.02),
  },
  GBPUSD: {
    name: 'GBP/USD',
    price: 1.2634,
    change: 0.23,
    bid: 1.2632,
    ask: 1.2636,
    category: 'Major',
    history: generateHistory(1.26, 0.005, 365, 0.01),
  },
  USDJPY: {
    name: 'USD/JPY',
    price: 154.82,
    change: 0.45,
    bid: 154.8,
    ask: 154.84,
    category: 'Major',
    history: generateHistory(150, 0.006, 365, 0.08),
  },
  USDCHF: {
    name: 'USD/CHF',
    price: 0.8912,
    change: 0.18,
    bid: 0.891,
    ask: 0.8914,
    category: 'Major',
    history: generateHistory(0.89, 0.004, 365, 0.02),
  },
  AUDUSD: {
    name: 'AUD/USD',
    price: 0.6534,
    change: -0.34,
    bid: 0.6532,
    ask: 0.6536,
    category: 'Major',
    history: generateHistory(0.66, 0.006, 365, -0.03),
  },
  USDCAD: {
    name: 'USD/CAD',
    price: 1.3678,
    change: 0.15,
    bid: 1.3676,
    ask: 1.368,
    category: 'Major',
    history: generateHistory(1.36, 0.004, 365, 0.02),
  },
  NZDUSD: {
    name: 'NZD/USD',
    price: 0.6012,
    change: -0.28,
    bid: 0.601,
    ask: 0.6014,
    category: 'Major',
    history: generateHistory(0.61, 0.006, 365, -0.02),
  },
  EURGBP: {
    name: 'EUR/GBP',
    price: 0.8587,
    change: -0.35,
    bid: 0.8585,
    ask: 0.8589,
    category: 'Cross',
    history: generateHistory(0.86, 0.004, 365, -0.02),
  },
  EURJPY: {
    name: 'EUR/JPY',
    price: 167.89,
    change: 0.33,
    bid: 167.87,
    ask: 167.91,
    category: 'Cross',
    history: generateHistory(165, 0.006, 365, 0.05),
  },
  GBPJPY: {
    name: 'GBP/JPY',
    price: 195.62,
    change: 0.68,
    bid: 195.6,
    ask: 195.64,
    category: 'Cross',
    history: generateHistory(192, 0.007, 365, 0.06),
  },
  USDMXN: {
    name: 'USD/MXN',
    price: 17.12,
    change: -0.89,
    bid: 17.1,
    ask: 17.14,
    category: 'EM',
    history: generateHistory(17.5, 0.01, 365, -0.04),
  },
  USDBRL: {
    name: 'USD/BRL',
    price: 4.97,
    change: 0.45,
    bid: 4.96,
    ask: 4.98,
    category: 'EM',
    history: generateHistory(4.9, 0.012, 365, 0.03),
  },
  USDCNY: {
    name: 'USD/CNY',
    price: 7.24,
    change: 0.08,
    bid: 7.23,
    ask: 7.25,
    category: 'EM',
    history: generateHistory(7.2, 0.003, 365, 0.01),
  },
  USDINR: {
    name: 'USD/INR',
    price: 83.42,
    change: 0.12,
    bid: 83.4,
    ask: 83.44,
    category: 'EM',
    history: generateHistory(83, 0.003, 365, 0.02),
  },
};

// Central Banks Data
const CENTRAL_BANKS = {
  FED: {
    name: 'Federal Reserve (USA)',
    rate: 5.50,
    change: 0.00,
    nextMeeting: '2026-03-18',
    stance: 'Restrictive',
    inflation: 2.9,
    unemployment: 3.7,
    gdp: 2.4,
    balanceSheet: 7840,
    history: [
      { date: '2022-01', rate: 0.25 },
      { date: '2022-03', rate: 0.50 },
      { date: '2022-05', rate: 1.00 },
      { date: '2022-07', rate: 2.50 },
      { date: '2022-09', rate: 3.25 },
      { date: '2022-11', rate: 4.00 },
      { date: '2023-01', rate: 4.50 },
      { date: '2023-03', rate: 5.00 },
      { date: '2023-05', rate: 5.25 },
      { date: '2023-07', rate: 5.50 },
      { date: '2023-09', rate: 5.50 },
      { date: '2023-11', rate: 5.50 },
      { date: '2024-01', rate: 5.50 },
      { date: '2024-03', rate: 5.50 },
      { date: '2024-05', rate: 5.50 },
      { date: '2024-07', rate: 5.50 },
      { date: '2024-09', rate: 5.50 },
      { date: '2024-11', rate: 5.50 },
      { date: '2025-01', rate: 5.50 },
      { date: '2025-03', rate: 5.50 },
      { date: '2025-05', rate: 5.50 },
      { date: '2025-07', rate: 5.50 },
      { date: '2025-09', rate: 5.50 },
      { date: '2025-11', rate: 5.50 },
      { date: '2026-01', rate: 5.50 },
    ],
  },
  ECB: {
    name: 'European Central Bank',
    rate: 4.50,
    change: 0.00,
    nextMeeting: '2026-03-12',
    stance: 'Restrictive',
    inflation: 2.4,
    unemployment: 6.5,
    gdp: 0.5,
    balanceSheet: 6920,
    history: [
      { date: '2022-01', rate: 0.00 },
      { date: '2022-03', rate: 0.00 },
      { date: '2022-05', rate: 0.00 },
      { date: '2022-07', rate: 0.50 },
      { date: '2022-09', rate: 1.25 },
      { date: '2022-11', rate: 2.00 },
      { date: '2023-01', rate: 2.50 },
      { date: '2023-03', rate: 3.50 },
      { date: '2023-05', rate: 3.75 },
      { date: '2023-07', rate: 4.25 },
      { date: '2023-09', rate: 4.50 },
      { date: '2023-11', rate: 4.50 },
      { date: '2024-01', rate: 4.50 },
      { date: '2024-03', rate: 4.50 },
      { date: '2024-05', rate: 4.50 },
      { date: '2024-07', rate: 4.50 },
      { date: '2024-09', rate: 4.50 },
      { date: '2024-11', rate: 4.50 },
      { date: '2025-01', rate: 4.50 },
      { date: '2025-03', rate: 4.50 },
      { date: '2025-05', rate: 4.50 },
      { date: '2025-07', rate: 4.50 },
      { date: '2025-09', rate: 4.50 },
      { date: '2025-11', rate: 4.50 },
      { date: '2026-01', rate: 4.50 },
    ],
  },
  BOE: {
    name: 'Bank of England',
    rate: 5.25,
    change: 0.00,
    nextMeeting: '2026-03-20',
    stance: 'Restrictive',
    inflation: 4.0,
    unemployment: 4.2,
    gdp: 0.3,
    balanceSheet: 880,
    history: [
      { date: '2022-01', rate: 0.25 },
      { date: '2022-03', rate: 0.75 },
      { date: '2022-05', rate: 1.00 },
      { date: '2022-07', rate: 1.75 },
      { date: '2022-09', rate: 2.25 },
      { date: '2022-11', rate: 3.00 },
      { date: '2023-01', rate: 4.00 },
      { date: '2023-03', rate: 4.25 },
      { date: '2023-05', rate: 4.50 },
      { date: '2023-07', rate: 5.25 },
      { date: '2023-09', rate: 5.25 },
      { date: '2023-11', rate: 5.25 },
      { date: '2024-01', rate: 5.25 },
      { date: '2024-03', rate: 5.25 },
      { date: '2024-05', rate: 5.25 },
      { date: '2024-07', rate: 5.25 },
      { date: '2024-09', rate: 5.25 },
      { date: '2024-11', rate: 5.25 },
      { date: '2025-01', rate: 5.25 },
      { date: '2025-03', rate: 5.25 },
      { date: '2025-05', rate: 5.25 },
      { date: '2025-07', rate: 5.25 },
      { date: '2025-09', rate: 5.25 },
      { date: '2025-11', rate: 5.25 },
      { date: '2026-01', rate: 5.25 },
    ],
  },
  BOJ: {
    name: 'Bank of Japan',
    rate: 0.10,
    change: 0.00,
    nextMeeting: '2026-03-19',
    stance: 'Accommodative',
    inflation: 2.6,
    unemployment: 2.5,
    gdp: 1.2,
    balanceSheet: 5840,
    history: [
      { date: '2022-01', rate: -0.10 },
      { date: '2022-03', rate: -0.10 },
      { date: '2022-05', rate: -0.10 },
      { date: '2022-07', rate: -0.10 },
      { date: '2022-09', rate: -0.10 },
      { date: '2022-11', rate: -0.10 },
      { date: '2023-01', rate: -0.10 },
      { date: '2023-03', rate: -0.10 },
      { date: '2023-05', rate: -0.10 },
      { date: '2023-07', rate: -0.10 },
      { date: '2023-09', rate: -0.10 },
      { date: '2023-11', rate: -0.10 },
      { date: '2024-01', rate: -0.10 },
      { date: '2024-03', rate: 0.00 },
      { date: '2024-05', rate: 0.10 },
      { date: '2024-07', rate: 0.10 },
      { date: '2024-09', rate: 0.10 },
      { date: '2024-11', rate: 0.10 },
      { date: '2025-01', rate: 0.10 },
      { date: '2025-03', rate: 0.10 },
      { date: '2025-05', rate: 0.10 },
      { date: '2025-07', rate: 0.10 },
      { date: '2025-09', rate: 0.10 },
      { date: '2025-11', rate: 0.10 },
      { date: '2026-01', rate: 0.10 },
    ],
  },
  BOC: {
    name: 'Bank of Canada',
    rate: 5.00,
    change: 0.00,
    nextMeeting: '2026-03-06',
    stance: 'Restrictive',
    inflation: 3.1,
    unemployment: 5.8,
    gdp: 1.1,
    balanceSheet: 280,
    history: [
      { date: '2022-01', rate: 0.25 },
      { date: '2022-03', rate: 0.50 },
      { date: '2022-05', rate: 1.50 },
      { date: '2022-07', rate: 2.50 },
      { date: '2022-09', rate: 3.25 },
      { date: '2022-11', rate: 4.25 },
      { date: '2023-01', rate: 4.50 },
      { date: '2023-03', rate: 4.75 },
      { date: '2023-05', rate: 5.00 },
      { date: '2023-07', rate: 5.00 },
      { date: '2023-09', rate: 5.00 },
      { date: '2023-11', rate: 5.00 },
      { date: '2024-01', rate: 5.00 },
      { date: '2024-03', rate: 5.00 },
      { date: '2024-05', rate: 5.00 },
      { date: '2024-07', rate: 5.00 },
      { date: '2024-09', rate: 5.00 },
      { date: '2024-11', rate: 5.00 },
      { date: '2025-01', rate: 5.00 },
      { date: '2025-03', rate: 5.00 },
      { date: '2025-05', rate: 5.00 },
      { date: '2025-07', rate: 5.00 },
      { date: '2025-09', rate: 5.00 },
      { date: '2025-11', rate: 5.00 },
      { date: '2026-01', rate: 5.00 },
    ],
  },
  RBA: {
    name: 'Reserve Bank of Australia',
    rate: 4.35,
    change: 0.00,
    nextMeeting: '2026-03-04',
    stance: 'Restrictive',
    inflation: 4.1,
    unemployment: 3.9,
    gdp: 1.5,
    balanceSheet: 380,
    history: [
      { date: '2022-01', rate: 0.10 },
      { date: '2022-03', rate: 0.10 },
      { date: '2022-05', rate: 0.35 },
      { date: '2022-07', rate: 1.35 },
      { date: '2022-09', rate: 2.35 },
      { date: '2022-11', rate: 2.85 },
      { date: '2023-01', rate: 3.35 },
      { date: '2023-03', rate: 3.60 },
      { date: '2023-05', rate: 3.85 },
      { date: '2023-07', rate: 4.10 },
      { date: '2023-09', rate: 4.10 },
      { date: '2023-11', rate: 4.35 },
      { date: '2024-01', rate: 4.35 },
      { date: '2024-03', rate: 4.35 },
      { date: '2024-05', rate: 4.35 },
      { date: '2024-07', rate: 4.35 },
      { date: '2024-09', rate: 4.35 },
      { date: '2024-11', rate: 4.35 },
      { date: '2025-01', rate: 4.35 },
      { date: '2025-03', rate: 4.35 },
      { date: '2025-05', rate: 4.35 },
      { date: '2025-07', rate: 4.35 },
      { date: '2025-09', rate: 4.35 },
      { date: '2025-11', rate: 4.35 },
      { date: '2026-01', rate: 4.35 },
    ],
  },
  SNB: {
    name: 'Swiss National Bank',
    rate: 1.75,
    change: 0.00,
    nextMeeting: '2026-03-21',
    stance: 'Neutral',
    inflation: 1.7,
    unemployment: 2.1,
    gdp: 1.3,
    balanceSheet: 720,
    history: [
      { date: '2022-01', rate: -0.75 },
      { date: '2022-03', rate: -0.75 },
      { date: '2022-05', rate: -0.75 },
      { date: '2022-07', rate: -0.25 },
      { date: '2022-09', rate: 0.50 },
      { date: '2022-11', rate: 1.00 },
      { date: '2023-01', rate: 1.00 },
      { date: '2023-03', rate: 1.50 },
      { date: '2023-05', rate: 1.50 },
      { date: '2023-07', rate: 1.75 },
      { date: '2023-09', rate: 1.75 },
      { date: '2023-11', rate: 1.75 },
      { date: '2024-01', rate: 1.75 },
      { date: '2024-03', rate: 1.75 },
      { date: '2024-05', rate: 1.75 },
      { date: '2024-07', rate: 1.75 },
      { date: '2024-09', rate: 1.75 },
      { date: '2024-11', rate: 1.75 },
      { date: '2025-01', rate: 1.75 },
      { date: '2025-03', rate: 1.75 },
      { date: '2025-05', rate: 1.75 },
      { date: '2025-07', rate: 1.75 },
      { date: '2025-09', rate: 1.75 },
      { date: '2025-11', rate: 1.75 },
      { date: '2026-01', rate: 1.75 },
    ],
  },
  PBOC: {
    name: "People's Bank of China",
    rate: 3.45,
    change: 0.00,
    nextMeeting: '2026-03-15',
    stance: 'Accommodative',
    inflation: 0.3,
    unemployment: 5.2,
    gdp: 5.2,
    balanceSheet: 5420,
    history: [
      { date: '2022-01', rate: 3.70 },
      { date: '2022-03', rate: 3.70 },
      { date: '2022-05', rate: 3.70 },
      { date: '2022-07', rate: 3.65 },
      { date: '2022-09', rate: 3.65 },
      { date: '2022-11', rate: 3.65 },
      { date: '2023-01', rate: 3.65 },
      { date: '2023-03', rate: 3.65 },
      { date: '2023-05', rate: 3.55 },
      { date: '2023-07', rate: 3.45 },
      { date: '2023-09', rate: 3.45 },
      { date: '2023-11', rate: 3.45 },
      { date: '2024-01', rate: 3.45 },
      { date: '2024-03', rate: 3.45 },
      { date: '2024-05', rate: 3.45 },
      { date: '2024-07', rate: 3.45 },
      { date: '2024-09', rate: 3.45 },
      { date: '2024-11', rate: 3.45 },
      { date: '2025-01', rate: 3.45 },
      { date: '2025-03', rate: 3.45 },
      { date: '2025-05', rate: 3.45 },
      { date: '2025-07', rate: 3.45 },
      { date: '2025-09', rate: 3.45 },
      { date: '2025-11', rate: 3.45 },
      { date: '2026-01', rate: 3.45 },
    ],
  },
};

// Function to extend Central Banks history with future projections
const extendCentralBanksHistory = (banks) => {
  const extended = JSON.parse(JSON.stringify(banks)); // Deep clone
  
  Object.keys(extended).forEach(code => {
    const bank = extended[code];
    const history = bank.history;
    const lastEntry = history[history.length - 1];
    const lastDate = new Date(lastEntry.date + '-01');
    const currentRate = bank.rate;
    
    // Generate future projections (next 12 months)
    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      const dateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Calculate projected rate with realistic variation
      let projectedRate;
      if (code === 'FED' || code === 'ECB' || code === 'BOE') {
        // For restrictive banks, project gradual cuts
        const cutSpeed = 0.25 * (i / 12); // Gradual easing
        projectedRate = Math.max(2.0, currentRate - cutSpeed + (Math.random() - 0.5) * 0.1);
      } else if (code === 'BOJ') {
        // For accommodative banks, project gradual increases
        const increaseSpeed = 0.15 * (i / 12);
        projectedRate = Math.min(0.5, currentRate + increaseSpeed + (Math.random() - 0.5) * 0.05);
      } else {
        // For neutral banks, slight variations
        projectedRate = currentRate + (Math.random() - 0.5) * 0.2;
      }
      
      history.push({
        date: dateStr,
        rate: Math.round(projectedRate * 100) / 100,
      });
    }
  });
  
  return extended;
};

// Extended Central Banks with future projections
const CENTRAL_BANKS_EXTENDED = extendCentralBanksHistory(CENTRAL_BANKS);

// Crypto - Initial Values
const INITIAL_CRYPTO = {
  BTCUSD: {
    name: 'Bitcoin',
    price: 67432.18,
    change: 3.45,
    marketCap: 1324,
    history: generateHistory(60000, 0.035, 365, 0.2),
  },
  ETHUSD: {
    name: 'Ethereum',
    price: 3284.56,
    change: 2.89,
    marketCap: 394,
    history: generateHistory(3000, 0.04, 365, 0.15),
  },
  SOLUSD: {
    name: 'Solana',
    price: 142.78,
    change: 5.23,
    marketCap: 64,
    history: generateHistory(120, 0.06, 365, 0.3),
  },
  XRPUSD: {
    name: 'XRP',
    price: 0.5234,
    change: 1.45,
    marketCap: 28,
    history: generateHistory(0.5, 0.05, 365, 0.08),
  },
};

// Commodities - Initial Values
const INITIAL_COMMODITIES = {
  XAUUSD: {
    name: 'Gold',
    price: 2342.8,
    change: 0.67,
    unit: '$/oz',
    history: generateHistory(2300, 0.008, 365, 0.05),
  },
  XAGUSD: {
    name: 'Silver',
    price: 27.84,
    change: 1.23,
    unit: '$/oz',
    history: generateHistory(26, 0.015, 365, 0.08),
  },
  CL1: {
    name: 'WTI Crude',
    price: 78.34,
    change: -1.23,
    unit: '$/bbl',
    history: generateHistory(75, 0.025, 365, 0.06),
  },
  NG1: {
    name: 'Natural Gas',
    price: 2.34,
    change: -2.45,
    unit: '$/MMBtu',
    history: generateHistory(2.5, 0.04, 365, -0.1),
  },
  HG1: {
    name: 'Copper',
    price: 4.12,
    change: 0.89,
    unit: '$/lb',
    history: generateHistory(4, 0.02, 365, 0.08),
  },
};

// Stocks for M&A Research - Initial Values
const INITIAL_STOCKS = {
  AAPL: {
    name: 'Apple Inc.',
    price: 189.84,
    change: 1.23,
    sector: 'Technology',
    pe: 28.4,
    pb: 45.2,
    ps: 7.8,
    evEbitda: 21.3,
    roe: 147.2,
    debt: 0.82,
    divYield: 0.51,
    marketCap: 2940,
    revenue: 383.3,
    ebitda: 123.1,
    netIncome: 97.0,
    employees: 164000,
    history: generateHistory(182, 0.015, 365, 0.18),
  },
  MSFT: {
    name: 'Microsoft Corp.',
    price: 415.32,
    change: 0.89,
    sector: 'Technology',
    pe: 35.2,
    pb: 12.4,
    ps: 13.2,
    evEbitda: 24.8,
    roe: 38.5,
    debt: 0.35,
    divYield: 0.74,
    marketCap: 3100,
    revenue: 227.6,
    ebitda: 108.8,
    netIncome: 82.5,
    employees: 221000,
    history: generateHistory(400, 0.014, 365, 0.20),
  },
  GOOGL: {
    name: 'Alphabet Inc.',
    price: 175.23,
    change: 2.15,
    sector: 'Technology',
    pe: 24.8,
    pb: 6.8,
    ps: 6.4,
    evEbitda: 14.2,
    roe: 28.4,
    debt: 0.12,
    divYield: 0.0,
    marketCap: 2180,
    revenue: 307.4,
    ebitda: 97.5,
    netIncome: 73.8,
    employees: 182000,
    history: generateHistory(168, 0.016, 365, 0.22),
  },
  AMZN: {
    name: 'Amazon.com Inc.',
    price: 186.45,
    change: 1.78,
    sector: 'Consumer',
    pe: 52.3,
    pb: 8.2,
    ps: 3.1,
    evEbitda: 18.5,
    roe: 17.8,
    debt: 0.45,
    divYield: 0.0,
    marketCap: 1940,
    revenue: 574.8,
    ebitda: 85.4,
    netIncome: 37.7,
    employees: 1540000,
    history: generateHistory(178, 0.017, 365, 0.19),
  },
  NVDA: {
    name: 'NVIDIA Corp.',
    price: 924.56,
    change: 4.23,
    sector: 'Technology',
    pe: 65.4,
    pb: 52.3,
    ps: 35.2,
    evEbitda: 58.2,
    roe: 91.5,
    debt: 0.28,
    divYield: 0.02,
    marketCap: 2280,
    revenue: 60.9,
    ebitda: 35.2,
    netIncome: 29.8,
    employees: 29600,
    history: generateHistory(880, 0.025, 365, 0.42),
  },
  META: {
    name: 'Meta Platforms',
    price: 523.45,
    change: 2.34,
    sector: 'Technology',
    pe: 27.8,
    pb: 8.5,
    ps: 9.2,
    evEbitda: 15.4,
    roe: 28.2,
    debt: 0.18,
    divYield: 0.42,
    marketCap: 1340,
    revenue: 134.9,
    ebitda: 58.4,
    netIncome: 46.8,
    employees: 67317,
    history: generateHistory(500, 0.022, 365, 0.28),
  },
  TSLA: {
    name: 'Tesla Inc.',
    price: 248.32,
    change: -1.89,
    sector: 'Auto',
    pe: 72.4,
    pb: 12.8,
    ps: 7.5,
    evEbitda: 42.5,
    roe: 21.5,
    debt: 0.15,
    divYield: 0.0,
    marketCap: 790,
    revenue: 96.8,
    ebitda: 14.2,
    netIncome: 12.6,
    employees: 140000,
    history: generateHistory(236, 0.028, 365, 0.15),
  },
  JPM: {
    name: 'JPMorgan Chase',
    price: 198.45,
    change: 0.67,
    sector: 'Financials',
    pe: 11.2,
    pb: 1.8,
    ps: 3.4,
    evEbitda: 8.5,
    roe: 15.2,
    debt: 2.45,
    divYield: 2.32,
    marketCap: 572,
    revenue: 158.1,
    ebitda: 0,
    netIncome: 49.6,
    employees: 309000,
    history: generateHistory(190, 0.011, 365, 0.12),
  },
  V: {
    name: 'Visa Inc.',
    price: 278.34,
    change: 0.45,
    sector: 'Financials',
    pe: 28.5,
    pb: 14.2,
    ps: 16.8,
    evEbitda: 22.4,
    roe: 48.5,
    debt: 0.52,
    divYield: 0.78,
    marketCap: 548,
    revenue: 32.7,
    ebitda: 21.4,
    netIncome: 17.3,
    employees: 29500,
    history: generateHistory(266, 0.013, 365, 0.14),
  },
  JNJ: {
    name: 'Johnson & Johnson',
    price: 147.89,
    change: -0.34,
    sector: 'Healthcare',
    pe: 15.8,
    pb: 5.8,
    ps: 4.2,
    evEbitda: 12.8,
    roe: 22.4,
    debt: 0.42,
    divYield: 3.12,
    marketCap: 356,
    revenue: 85.2,
    ebitda: 28.4,
    netIncome: 22.8,
    employees: 131900,
    history: generateHistory(142, 0.009, 365, 0.08),
  },
};

// Google Trends
const GOOGLE_TRENDS = [
  {
    week: 'W1',
    date: 'Jan 7',
    'Stock Market': 72,
    'Federal Reserve': 45,
    'Inflation News': 68,
    'Cryptocurrency': 54,
    'NVIDIA Stock': 89,
    'Interest Rates': 62,
  },
  {
    week: 'W2',
    date: 'Jan 14',
    'Stock Market': 68,
    'Federal Reserve': 52,
    'Inflation News': 71,
    'Cryptocurrency': 61,
    'NVIDIA Stock': 92,
    'Interest Rates': 65,
  },
  {
    week: 'W3',
    date: 'Jan 21',
    'Stock Market': 65,
    'Federal Reserve': 48,
    'Inflation News': 65,
    'Cryptocurrency': 78,
    'NVIDIA Stock': 95,
    'Interest Rates': 58,
  },
  {
    week: 'W4',
    date: 'Jan 28',
    'Stock Market': 58,
    'Federal Reserve': 42,
    'Inflation News': 58,
    'Cryptocurrency': 82,
    'NVIDIA Stock': 88,
    'Interest Rates': 52,
  },
  {
    week: 'W5',
    date: 'Feb 4',
    'Stock Market': 52,
    'Federal Reserve': 38,
    'Inflation News': 62,
    'Cryptocurrency': 71,
    'NVIDIA Stock': 91,
    'Interest Rates': 55,
  },
  {
    week: 'W6',
    date: 'Feb 11',
    'Stock Market': 48,
    'Federal Reserve': 35,
    'Inflation News': 75,
    'Cryptocurrency': 65,
    'NVIDIA Stock': 100,
    'Interest Rates': 68,
  },
  {
    week: 'W7',
    date: 'Feb 18',
    'Stock Market': 45,
    'Federal Reserve': 32,
    'Inflation News': 68,
    'Cryptocurrency': 72,
    'NVIDIA Stock': 97,
    'Interest Rates': 62,
  },
  {
    week: 'W8',
    date: 'Feb 25',
    'Stock Market': 42,
    'Federal Reserve': 29,
    'Inflation News': 72,
    'Cryptocurrency': 68,
    'NVIDIA Stock': 94,
    'Interest Rates': 58,
  },
];

// Polymarket
const POLYMARKET = [
  {
    id: 1,
    title: 'Trump wins 2024 Presidential Election',
    yes: 52.3,
    volume: 847.2,
    category: 'Politics',
    change: 2.1,
  },
  {
    id: 2,
    title: 'Fed cuts rates by June 2025',
    yes: 78.5,
    volume: 234.5,
    category: 'Macro',
    change: -1.8,
  },
  {
    id: 3,
    title: 'Bitcoin reaches $100,000 in 2025',
    yes: 34.2,
    volume: 156.8,
    category: 'Crypto',
    change: 4.5,
  },
  {
    id: 4,
    title: 'US enters recession in 2025',
    yes: 18.7,
    volume: 89.4,
    category: 'Macro',
    change: -0.9,
  },
  {
    id: 5,
    title: 'China invades Taiwan by 2027',
    yes: 8.4,
    volume: 67.2,
    category: 'Geopolitics',
    change: 0.3,
  },
  {
    id: 6,
    title: 'S&P 500 closes 2025 above 6,000',
    yes: 61.8,
    volume: 123.4,
    category: 'Markets',
    change: 3.2,
  },
  {
    id: 7,
    title: 'OpenAI valued above $150B',
    yes: 45.2,
    volume: 78.9,
    category: 'Tech',
    change: -2.4,
  },
  {
    id: 8,
    title: 'Ukraine conflict ends by Dec 2025',
    yes: 12.3,
    volume: 56.7,
    category: 'Geopolitics',
    change: 1.1,
  },
  {
    id: 9,
    title: 'Tesla reaches $500 stock price in 2025',
    yes: 28.4,
    volume: 95.3,
    category: 'Markets',
    change: 3.7,
  },
  {
    id: 10,
    title: 'Ethereum ETF launches by Q3 2025',
    yes: 67.2,
    volume: 112.8,
    category: 'Crypto',
    change: -0.5,
  },
  {
    id: 11,
    title: 'Major US bank fails in 2025',
    yes: 5.8,
    volume: 43.2,
    category: 'Markets',
    change: -1.2,
  },
  {
    id: 12,
    title: 'Apple releases AR glasses by end of 2025',
    yes: 42.1,
    volume: 87.6,
    category: 'Tech',
    change: 2.8,
  },
  {
    id: 13,
    title: 'Oil prices above $100/barrel by mid-2025',
    yes: 31.5,
    volume: 68.4,
    category: 'Commodities',
    change: 1.9,
  },
  {
    id: 14,
    title: 'Global inflation drops below 2% by 2026',
    yes: 55.7,
    volume: 91.2,
    category: 'Macro',
    change: -2.1,
  },
  {
    id: 15,
    title: 'Major AI breakthrough announced in 2025',
    yes: 73.4,
    volume: 134.5,
    category: 'Tech',
    change: 4.2,
  },
];

// News
const NEWS = [
  {
    id: 1,
    title: 'Federal Reserve maintains interest rates amid economic uncertainty',
    source: 'Reuters',
    time: '2 hours ago',
    category: 'Macro',
    impact: 'high',
    url: 'https://www.reuters.com/markets/us/',
  },
  {
    id: 2,
    title: 'Tech stocks rally as AI spending continues to surge',
    source: 'Bloomberg',
    time: '3 hours ago',
    category: 'Earnings',
    impact: 'high',
    url: 'https://www.bloomberg.com/markets',
  },
  {
    id: 3,
    title: 'European Central Bank signals potential policy changes',
    source: 'FT',
    time: '4 hours ago',
    category: 'Macro',
    impact: 'medium',
    url: 'https://www.ft.com/markets',
  },
  {
    id: 4,
    title: 'Major tech companies announce share buyback programs',
    source: 'CNBC',
    time: '5 hours ago',
    category: 'Corporate',
    impact: 'high',
    url: 'https://www.cnbc.com/stocks/',
  },
  {
    id: 5,
    title: 'Energy markets volatile as oil prices fluctuate',
    source: 'Reuters',
    time: '6 hours ago',
    category: 'Commodities',
    impact: 'medium',
    url: 'https://www.reuters.com/business/energy/',
  },
  {
    id: 6,
    title: 'Asian markets show mixed performance amid trade concerns',
    source: 'Bloomberg',
    time: '7 hours ago',
    category: 'Macro',
    impact: 'medium',
    url: 'https://www.bloomberg.com/asia',
  },
  {
    id: 7,
    title: 'Cloud computing revenue drives big tech earnings',
    source: 'WSJ',
    time: '8 hours ago',
    category: 'Earnings',
    impact: 'medium',
    url: 'https://www.wsj.com/tech',
  },
  {
    id: 8,
    title: 'Cryptocurrency markets see increased institutional interest',
    source: 'CoinDesk',
    time: '9 hours ago',
    category: 'Crypto',
    impact: 'medium',
    url: 'https://www.coindesk.com/markets/',
  },
  {
    id: 9,
    title: 'Automotive industry faces regulatory challenges',
    source: 'Reuters',
    time: '10 hours ago',
    category: 'Corporate',
    impact: 'high',
    url: 'https://www.reuters.com/business/autos-transportation/',
  },
  {
    id: 10,
    title: 'Currency markets react to central bank policies',
    source: 'Nikkei',
    time: '11 hours ago',
    category: 'Forex',
    impact: 'medium',
    url: 'https://asia.nikkei.com/Economy',
  },
];

// Economic Data
const ECONOMIC = {
  cpi: { value: 3.2, prev: 3.4, trend: 'down' },
  unemployment: { value: 3.8, prev: 3.7, trend: 'up' },
  gdp: { value: 2.8, prev: 3.2, trend: 'down' },
  fedRate: { value: 5.25, prev: 5.25, trend: 'flat' },
  pce: { value: 2.7, prev: 2.8, trend: 'down' },
  retail: { value: 0.6, prev: 0.8, trend: 'down' },
};

// Sectors
const SECTORS = [
  { ticker: 'XLK', name: 'Technology', change: 4.23, ytd: 12.8 },
  { ticker: 'XLV', name: 'Healthcare', change: 1.82, ytd: 5.2 },
  { ticker: 'XLF', name: 'Financials', change: 2.14, ytd: 8.9 },
  { ticker: 'XLE', name: 'Energy', change: -1.45, ytd: -2.1 },
  { ticker: 'XLY', name: 'Cons. Disc.', change: 3.11, ytd: 9.4 },
  { ticker: 'XLP', name: 'Cons. Staples', change: 0.67, ytd: 2.8 },
  { ticker: 'XLI', name: 'Industrials', change: 1.52, ytd: 6.1 },
  { ticker: 'XLB', name: 'Materials', change: 0.83, ytd: 3.2 },
  { ticker: 'XLU', name: 'Utilities', change: -0.34, ytd: -1.4 },
  { ticker: 'XLRE', name: 'Real Estate', change: -0.91, ytd: -3.8 },
  { ticker: 'XLC', name: 'Comm. Svcs', change: 2.45, ytd: 7.6 },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const fmt = (n, d = 2) =>
  n?.toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }) ?? '—';
const fmtChg = (c) => `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;
const fmtVol = (v) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${v.toFixed(1)}M`;
const fmtLargeNum = (n) =>
  n >= 1000
    ? `${(n / 1000).toFixed(1)}T`
    : n >= 1
    ? `${n.toFixed(0)}B`
    : `${(n * 1000).toFixed(0)}M`;

const calculatePeriodReturn = (history, period) => {
  if (!history || history.length < 2) return 0;
  const now = new Date();
  let startDate;

  switch (period) {
    case '1D':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      break;
    case '1W':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'WTD':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      break;
    case '1M':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'MTD':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case '3M':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6M':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 6);
      break;
    case 'YTD':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case '1Y':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case '3Y':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 3);
      break;
    case '5Y':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    default:
      return 0;
  }

  const filtered = history.filter((d) => new Date(d.fullDate) >= startDate);
  if (filtered.length < 2) return 0;
  return (filtered[filtered.length - 1].price / filtered[0].price - 1) * 100;
};

// ============================================================================
// COMPONENTS
// ============================================================================
const Tooltip2 = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: COLORS.bgHeader,
          border: `1px solid ${COLORS.primary}`,
          padding: '8px 12px',
          fontFamily: "'Consolas', monospace",
          fontSize: '11px',
        }}
      >
        <div
          style={{
            color: COLORS.primary,
            fontWeight: 700,
            marginBottom: '4px',
          }}
        >
          {label}
        </div>
        {payload.map((e, i) => (
          <div
            key={i}
            style={{
              color: COLORS.textInverse,
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <span style={{ color: e.color }}>{e.name}:</span>
            <span style={{ fontWeight: 600 }}>
              {typeof e.value === 'number' ? fmt(e.value, 4) : e.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Panel = ({ title, children, action, noPad }) => (
  <div
    style={{
      background: COLORS.bgPrimary,
      border: `1px solid ${COLORS.border}`,
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: COLORS.bgHeader,
        borderBottom: `2px solid ${COLORS.primary}`,
      }}
    >
      <span
        style={{
          color: COLORS.textInverse,
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </span>
      {action}
    </div>
    <div style={noPad ? {} : { padding: '12px' }}>{children}</div>
  </div>
);

const DataRow = ({ label, value, change, mono = true }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: `1px solid ${COLORS.borderLight}`,
    }}
  >
    <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>
      {label}
    </span>
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: mono ? "'Consolas', monospace" : 'inherit',
        }}
      >
        {value}
      </span>
      {change !== undefined && (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: change >= 0 ? COLORS.positive : COLORS.negative,
          }}
        >
          {fmtChg(change)}
        </span>
      )}
    </div>
  </div>
);

const AssetRow = ({ ticker, data, isSelected, onClick, showBidAsk }) => (
  <div
    onClick={onClick}
    style={{
      display: 'grid',
      gridTemplateColumns: showBidAsk
        ? '65px 1fr 70px 60px 60px 60px'
        : '65px 1fr 80px 65px',
      padding: '8px 10px',
      background: isSelected ? COLORS.bgTertiary : 'transparent',
      borderBottom: `1px solid ${COLORS.borderLight}`,
      cursor: 'pointer',
      alignItems: 'center',
    }}
    onMouseEnter={(e) =>
      !isSelected && (e.currentTarget.style.background = COLORS.bgSecondary)
    }
    onMouseLeave={(e) =>
      !isSelected && (e.currentTarget.style.background = 'transparent')
    }
  >
    <div
      style={{
        fontFamily: "'Consolas', monospace",
        fontWeight: 700,
        fontSize: '11px',
        color: COLORS.primary,
      }}
    >
      {ticker}
    </div>
    <div
      style={{
        fontSize: '10px',
        color: COLORS.textTertiary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {data.name}
    </div>
    {showBidAsk && (
      <>
        <div
          style={{
            fontFamily: "'Consolas', monospace",
            fontSize: '10px',
            textAlign: 'right',
            color: COLORS.textTertiary,
          }}
        >
          {fmt(data.bid, 4)}
        </div>
        <div
          style={{
            fontFamily: "'Consolas', monospace",
            fontSize: '10px',
            textAlign: 'right',
            color: COLORS.textTertiary,
          }}
        >
          {fmt(data.ask, 4)}
        </div>
      </>
    )}
    <div
      style={{
        fontFamily: "'Consolas', monospace",
        fontSize: '11px',
        fontWeight: 600,
        textAlign: 'right',
      }}
    >
      {fmt(data.price, data.price < 10 ? 4 : 2)}
    </div>
    <div
      style={{
        fontFamily: "'Consolas', monospace",
        fontSize: '10px',
        fontWeight: 600,
        textAlign: 'right',
        color: data.change >= 0 ? COLORS.positive : COLORS.negative,
      }}
    >
      {fmtChg(data.change)}
    </div>
  </div>
);

const SectorHeatmap = ({ sectors }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(11, 1fr)',
      gap: '2px',
    }}
  >
    {sectors.map((s) => {
      const int = Math.min(Math.abs(s.change) / 5, 1);
      const bg =
        s.change >= 0
          ? `rgba(5, 150, 105, ${0.15 + int * 0.4})`
          : `rgba(220, 38, 38, ${0.15 + int * 0.4})`;
      return (
        <div
          key={s.ticker}
          style={{
            background: bg,
            padding: '6px 4px',
            textAlign: 'center',
            border: `1px solid ${COLORS.borderLight}`,
          }}
        >
          <div
            style={{
              fontSize: '8px',
              fontWeight: 600,
              color: COLORS.textSecondary,
            }}
          >
            {s.ticker}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: "'Consolas', monospace",
              color: s.change >= 0 ? COLORS.positive : COLORS.negative,
            }}
          >
            {fmtChg(s.change)}
          </div>
        </div>
      );
    })}
  </div>
);

const NewsCard = ({ news, onClick }) => (
  <div
    onClick={() => onClick && onClick(news)}
    style={{
      padding: '10px 12px',
      borderBottom: `1px solid ${COLORS.borderLight}`,
      cursor: 'pointer',
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.background = COLORS.bgSecondary)
    }
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <div
        style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          marginTop: '6px',
          background: news.impact === 'high' ? COLORS.negative : COLORS.primary,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: COLORS.textPrimary,
            lineHeight: 1.4,
            marginBottom: '4px',
          }}
        >
          {news.title}
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
          <span style={{ color: COLORS.primary, fontWeight: 600 }}>
            {news.source}
          </span>
          <span style={{ color: COLORS.textMuted }}>{news.time}</span>
          <span
            style={{
              color: COLORS.textTertiary,
              background: COLORS.bgTertiary,
              padding: '1px 6px',
              borderRadius: '3px',
            }}
          >
            {news.category}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN APPLICATION
// ============================================================================
export default function IgeaOmnisPro() {
  const [tab, setTab] = useState('overview');
  const [time, setTime] = useState(new Date());
  const [selectedIndex, setSelectedIndex] = useState('SPX');
  const [selectedForex, setSelectedForex] = useState('EURUSD');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [selectedCentralBank, setSelectedCentralBank] = useState('FED');
  const [forexCategory, setForexCategory] = useState('All');
  const [compareAssets, setCompareAssets] = useState(['SPX', 'NDX', 'BTCUSD']);
  const [comparePeriod, setComparePeriod] = useState('YTD');
  const [compareInput, setCompareInput] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportAssets, setReportAssets] = useState(['AAPL', 'MSFT', 'GOOGL']);
  const [newsFilter, setNewsFilter] = useState('All');
  const [reportType, setReportType] = useState('Market Overview');
  const [trendSector, setTrendSector] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Period selection states for different tabs/charts
  const [marketsPeriod, setMarketsPeriod] = useState('1Y');
  const [forexPeriod, setForexPeriod] = useState('1Y');
  const [researchPeriod, setResearchPeriod] = useState('1Y');

  // ============================================================================
  // FMP API STATE
  // ============================================================================
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [realTimeQuote, setRealTimeQuote] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [financialStatements, setFinancialStatements] = useState({
    incomeStatement: [],
    balanceSheet: [],
    cashFlow: [],
  });
  const [selectedFinancialRows, setSelectedFinancialRows] = useState({
    revenue: true,
    netIncome: true,
    ebitda: true,
    totalDebt: true,
    totalAssets: true,
    operatingCashFlow: true,
  });
  const [assetColors, setAssetColors] = useState({});
  const [showNormalized, setShowNormalized] = useState(false);
  const [showCorrelation, setShowCorrelation] = useState(false);

  // ============================================================================
  // DYNAMIC MARKET DATA STATE
  // ============================================================================
  const [indices, setIndices] = useState(INITIAL_INDICES);
  const [forex, setForex] = useState(INITIAL_FOREX);
  const [crypto, setCrypto] = useState(INITIAL_CRYPTO);
  const [commodities, setCommodities] = useState(INITIAL_COMMODITIES);
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [liveMode, setLiveMode] = useState(true); // Enable simulated live updates

  // Backwards compatibility - create const references
  const INDICES = indices;
  const FOREX = forex;
  const CRYPTO = crypto;
  const COMMODITIES = commodities;
  const STOCKS = stocks;

  // ============================================================================
  // FMP API FUNCTIONS
  // ============================================================================
  
  // Search for companies
  const searchCompanies = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    setApiError(null);
    
    try {
      const data = await fetchFMP('/search', { query, limit: 10 });
      setSearchResults(data || []);
    } catch (error) {
      setApiError('Failed to search companies');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Get real-time quote
  const getRealTimeQuote = async (symbol) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const data = await fetchFMP(`/quote/${symbol}`);
      if (data && data.length > 0) {
        setRealTimeQuote(data[0]);
        return data[0];
      }
    } catch (error) {
      setApiError('Failed to fetch quote');
    } finally {
      setIsLoading(false);
    }
  };

  // Get historical price data
  const getHistoricalData = async (symbol, from = null, to = null) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      
      const data = await fetchFMP(`/historical-price-full/${symbol}`, params);
      
      if (data && data.historical) {
        const formatted = data.historical.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          fullDate: item.date,
          price: item.close,
          close: item.close,
          volume: item.volume,
        })).reverse();
        
        setHistoricalData(formatted);
        return formatted;
      }
    } catch (error) {
      setApiError('Failed to fetch historical data');
    } finally {
      setIsLoading(false);
    }
  };

  // Get financial statements
  const getFinancialStatements = async (symbol) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const [income, balance, cashFlow] = await Promise.all([
        fetchFMP(`/income-statement/${symbol}`, { limit: 5 }),
        fetchFMP(`/balance-sheet-statement/${symbol}`, { limit: 5 }),
        fetchFMP(`/cash-flow-statement/${symbol}`, { limit: 5 }),
      ]);
      
      setFinancialStatements({
        incomeStatement: income || [],
        balanceSheet: balance || [],
        cashFlow: cashFlow || [],
      });
      
      return { income, balance, cashFlow };
    } catch (error) {
      setApiError('Failed to fetch financial statements');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search result selection
  const handleSearchResultClick = async (result) => {
    setSelectedSearchResult(result);
    setSearchResults([]);
    
    // Fetch quote and historical data
    await getRealTimeQuote(result.symbol);
    await getHistoricalData(result.symbol);
  };

  // ============================================================================
  // SIMULATED LIVE UPDATES (3-second interval)
  // ============================================================================
  useEffect(() => {
    if (!liveMode) return;

    const simulateLiveUpdate = () => {
      // Update INDICES
      setIndices(prev => {
        const updated = {};
        Object.keys(prev).forEach(key => {
          const asset = prev[key];
          const priceVariation = (Math.random() - 0.5) * 0.02; // ±1% max variation
          const newPrice = asset.price * (1 + priceVariation);
          const newChange = asset.change + (Math.random() - 0.5) * 0.2; // Slight change variation
          
          updated[key] = {
            ...asset,
            price: Math.round(newPrice * 100) / 100,
            change: Math.round(newChange * 100) / 100,
          };
        });
        return updated;
      });

      // Update FOREX
      setForex(prev => {
        const updated = {};
        Object.keys(prev).forEach(key => {
          const asset = prev[key];
          const priceVariation = (Math.random() - 0.5) * 0.005; // ±0.25% max variation
          const newPrice = asset.price * (1 + priceVariation);
          const newChange = asset.change + (Math.random() - 0.5) * 0.1;
          
          updated[key] = {
            ...asset,
            price: Math.round(newPrice * 10000) / 10000,
            change: Math.round(newChange * 100) / 100,
            bid: Math.round((newPrice - 0.0002) * 10000) / 10000,
            ask: Math.round((newPrice + 0.0002) * 10000) / 10000,
          };
        });
        return updated;
      });

      // Update CRYPTO
      setCrypto(prev => {
        const updated = {};
        Object.keys(prev).forEach(key => {
          const asset = prev[key];
          const priceVariation = (Math.random() - 0.5) * 0.03; // ±1.5% max variation
          const newPrice = asset.price * (1 + priceVariation);
          const newChange = asset.change + (Math.random() - 0.5) * 0.3;
          
          updated[key] = {
            ...asset,
            price: Math.round(newPrice * 100) / 100,
            change: Math.round(newChange * 100) / 100,
          };
        });
        return updated;
      });

      // Update COMMODITIES
      setCommodities(prev => {
        const updated = {};
        Object.keys(prev).forEach(key => {
          const asset = prev[key];
          const priceVariation = (Math.random() - 0.5) * 0.015; // ±0.75% max variation
          const newPrice = asset.price * (1 + priceVariation);
          const newChange = asset.change + (Math.random() - 0.5) * 0.15;
          
          updated[key] = {
            ...asset,
            price: Math.round(newPrice * 100) / 100,
            change: Math.round(newChange * 100) / 100,
          };
        });
        return updated;
      });

      // Update STOCKS
      setStocks(prev => {
        const updated = {};
        Object.keys(prev).forEach(key => {
          const asset = prev[key];
          const priceVariation = (Math.random() - 0.5) * 0.02; // ±1% max variation
          const newPrice = asset.price * (1 + priceVariation);
          const newChange = asset.change + (Math.random() - 0.5) * 0.2;
          
          updated[key] = {
            ...asset,
            price: Math.round(newPrice * 100) / 100,
            change: Math.round(newChange * 100) / 100,
          };
        });
        return updated;
      });

      console.log('Live prices updated');
    };

    // Update every 3 seconds
    const interval = setInterval(simulateLiveUpdate, 3000);
    
    return () => clearInterval(interval);
  }, [liveMode]);

  // ============================================================================
  // PERIOD FILTERING HELPER
  // ============================================================================
  const filterHistoryByPeriod = (history, period) => {
    if (!history || history.length === 0) return [];
    
    const now = new Date();
    let daysAgo = 0;
    
    switch (period) {
      case '1D':
        daysAgo = 1;
        break;
      case '1W':
        daysAgo = 7;
        break;
      case 'WTD': // Week to date
        daysAgo = now.getDay() || 7;
        break;
      case '1M':
        daysAgo = 30;
        break;
      case 'MTD': // Month to date
        daysAgo = now.getDate();
        break;
      case '3M':
        daysAgo = 90;
        break;
      case 'YTD': // Year to date
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        daysAgo = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
        break;
      case '1Y':
        daysAgo = 365;
        break;
      default:
        return history; // Return full history if period not recognized
    }
    
    // Return last N days of data
    return history.slice(-daysAgo);
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-refresh data every 5 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Simulate data refresh - in production, this would call APIs
      console.log('Auto-refreshing data...');
      // Force re-render to simulate data update
      setTime(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Regime calculation
  const regimeScore = useMemo(() => {
    let s = 0;
    if (INDICES.SPX.change > 0) s++;
    if (COMMODITIES.XAUUSD.change < 2) s++;
    if (ECONOMIC.cpi.trend === 'down') s++;
    if (CRYPTO.BTCUSD.change > 0) s++;
    return s;
  }, []);
  const regime =
    regimeScore >= 3 ? 'RISK ON' : regimeScore >= 2 ? 'NEUTRAL' : 'RISK OFF';
  const regimeColor =
    regimeScore >= 3
      ? COLORS.positive
      : regimeScore >= 2
      ? COLORS.primary
      : COLORS.negative;

  // All assets for comparison
  const allAssets = useMemo(
    () => ({ ...INDICES, ...FOREX, ...CRYPTO, ...COMMODITIES, ...STOCKS }),
    []
  );

  // Compare data
  const compareData = useMemo(() => {
    if (!compareAssets.length) return [];
    const maxLen = Math.max(
      ...compareAssets.map((a) => allAssets[a]?.history?.length || 0)
    );
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      const point = { idx: i };
      compareAssets.forEach((a) => {
        const h = allAssets[a]?.history;
        if (h && h[i]) {
          point.date = h[i].date;
          point[a] = h[i].price;
        }
      });
      result.push(point);
    }
    
    // Filter by custom date range if specified
    let filtered = result;
    if (customStartDate || customEndDate) {
      filtered = result.filter((p) => {
        const pointDate = new Date(p.date);
        const start = customStartDate ? new Date(customStartDate) : new Date('2000-01-01');
        const end = customEndDate ? new Date(customEndDate) : new Date('2100-01-01');
        return pointDate >= start && pointDate <= end;
      });
    }
    
    // Normalize to 100
    const normalized = filtered.map((p, i) => {
      const norm = { date: p.date };
      compareAssets.forEach((a) => {
        const base = filtered[0]?.[a];
        if (base && p[a]) norm[a] = (p[a] / base) * 100;
      });
      return norm;
    });
    return normalized;
  }, [compareAssets, allAssets, customStartDate, customEndDate]);

  const addCompareAsset = () => {
    const ticker = compareInput.toUpperCase().trim();
    if (ticker && allAssets[ticker] && !compareAssets.includes(ticker)) {
      setCompareAssets([...compareAssets, ticker]);
      setCompareInput('');
    }
  };

  // Generate Excel Report Handler
  const generateExcelReport = () => {
    // Create CSV data
    const headers = ['Asset', 'Name', 'Price', 'Change %', 'P/E', 'Market Cap'];
    const rows = reportAssets.map((ticker) => {
      const asset = STOCKS[ticker] || allAssets[ticker];
      return [
        ticker,
        asset?.name || '-',
        asset?.price?.toFixed(2) || '-',
        asset?.change?.toFixed(2) || '-',
        asset?.pe?.toFixed(1) || '-',
        asset?.marketCap || '-',
      ];
    });

    // Convert to CSV
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `igea_${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Compare Data Handler
  const downloadCompareData = () => {
    if (!compareData.length) return;
    
    const headers = ['Date', ...compareAssets];
    const rows = compareData.map((row) => [
      row.date,
      ...compareAssets.map((asset) => row[asset]?.toFixed(2) || '-'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `igea_comparison_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle news click
  const handleNewsClick = (news) => {
    // Open news article in new tab
    if (news.url) {
      window.open(news.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get autocomplete suggestions
  const getAssetSuggestions = (input) => {
    if (!input) return [];
    const query = input.toUpperCase();
    return Object.keys(allAssets)
      .filter((ticker) => 
        ticker.startsWith(query) || 
        allAssets[ticker]?.name?.toUpperCase().includes(query)
      )
      .slice(0, 5);
  };

  // ============================================================================
  // CORRELATION MATRIX CALCULATION
  // ============================================================================
  const calculateCorrelationMatrix = (assets) => {
    if (assets.length < 2) return [];
    
    // Get price series for each asset
    const series = {};
    assets.forEach(ticker => {
      const asset = allAssets[ticker];
      if (asset && asset.history) {
        series[ticker] = asset.history.map(h => h.price);
      }
    });
    
    // Calculate Pearson correlation
    const correlate = (x, y) => {
      const n = Math.min(x.length, y.length);
      const xSlice = x.slice(-n);
      const ySlice = y.slice(-n);
      
      const meanX = xSlice.reduce((a, b) => a + b, 0) / n;
      const meanY = ySlice.reduce((a, b) => a + b, 0) / n;
      
      let num = 0, denX = 0, denY = 0;
      for (let i = 0; i < n; i++) {
        const dx = xSlice[i] - meanX;
        const dy = ySlice[i] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }
      
      return denX === 0 || denY === 0 ? 0 : num / Math.sqrt(denX * denY);
    };
    
    // Build correlation matrix
    const matrix = [];
    assets.forEach((ticker1, i) => {
      const row = { asset: ticker1 };
      assets.forEach((ticker2, j) => {
        if (series[ticker1] && series[ticker2]) {
          row[ticker2] = correlate(series[ticker1], series[ticker2]);
        } else {
          row[ticker2] = i === j ? 1 : 0;
        }
      });
      matrix.push(row);
    });
    
    return matrix;
  };

  // ============================================================================
  // CHART EXPORT TO PNG
  // ============================================================================
  const exportChartToPNG = (chartRef, filename = 'chart') => {
    if (!chartRef || !chartRef.current) {
      console.error('Chart reference not found');
      return;
    }
    
    // Create a canvas from the SVG
    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) {
      console.error('SVG element not found');
      return;
    }
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = svgElement.clientWidth || 800;
    canvas.height = svgElement.clientHeight || 400;
    
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = pngUrl;
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // ============================================================================
  // EXPORT FINANCIAL STATEMENTS
  // ============================================================================
  const exportFinancialData = () => {
    if (!financialStatements.incomeStatement.length) return;
    
    const headers = ['Metric'];
    const rows = [];
    
    // Add years as columns
    financialStatements.incomeStatement.forEach((stmt, i) => {
      headers.push(stmt.date || `Year ${i + 1}`);
    });
    
    // Selected rows based on checkboxes
    if (selectedFinancialRows.revenue && financialStatements.incomeStatement.length > 0) {
      const revenueRow = ['Revenue'];
      financialStatements.incomeStatement.forEach(stmt => {
        revenueRow.push(stmt.revenue || 0);
      });
      rows.push(revenueRow);
    }
    
    if (selectedFinancialRows.netIncome && financialStatements.incomeStatement.length > 0) {
      const netIncomeRow = ['Net Income'];
      financialStatements.incomeStatement.forEach(stmt => {
        netIncomeRow.push(stmt.netIncome || 0);
      });
      rows.push(netIncomeRow);
    }
    
    if (selectedFinancialRows.ebitda && financialStatements.incomeStatement.length > 0) {
      const ebitdaRow = ['EBITDA'];
      financialStatements.incomeStatement.forEach(stmt => {
        ebitdaRow.push(stmt.ebitda || 0);
      });
      rows.push(ebitdaRow);
    }
    
    if (selectedFinancialRows.totalDebt && financialStatements.balanceSheet.length > 0) {
      const debtRow = ['Total Debt'];
      financialStatements.balanceSheet.forEach(stmt => {
        debtRow.push(stmt.totalDebt || 0);
      });
      rows.push(debtRow);
    }
    
    if (selectedFinancialRows.totalAssets && financialStatements.balanceSheet.length > 0) {
      const assetsRow = ['Total Assets'];
      financialStatements.balanceSheet.forEach(stmt => {
        assetsRow.push(stmt.totalAssets || 0);
      });
      rows.push(assetsRow);
    }
    
    if (selectedFinancialRows.operatingCashFlow && financialStatements.cashFlow.length > 0) {
      const cashFlowRow = ['Operating Cash Flow'];
      financialStatements.cashFlow.forEach(stmt => {
        cashFlowRow.push(stmt.operatingCashFlow || 0);
      });
      rows.push(cashFlowRow);
    }
    
    // Convert to CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_statements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter predictions to only future events
  const futurePredictions = useMemo(() => {
    const now = new Date();
    return POLYMARKET.filter((pred) => {
      // Extract year from title
      const yearMatch = pred.title.match(/\b(202[4-9]|20[3-9]\d)\b/);
      if (!yearMatch) return true; // Keep if no year specified
      const predYear = parseInt(yearMatch[0]);
      return predYear >= now.getFullYear();
    });
  }, []);

  // Filtered companies by search
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return STOCKS;
    const query = searchQuery.toLowerCase();
    return Object.fromEntries(
      Object.entries(STOCKS).filter(([ticker, data]) =>
        ticker.toLowerCase().includes(query) ||
        data.name.toLowerCase().includes(query) ||
        data.sector.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  const chartColors = [
    COLORS.chart1,
    COLORS.chart2,
    COLORS.chart3,
    COLORS.chart4,
    COLORS.chart5,
    COLORS.chart6,
    COLORS.chart7,
    COLORS.chart8,
  ];

  const tabs = [
    { id: 'overview', label: 'OVERVIEW', icon: BarChart3 },
    { id: 'markets', label: 'MARKETS', icon: TrendingUp },
    { id: 'forex', label: 'FOREX', icon: ArrowRightLeft },
    { id: 'centralbanks', label: 'CENTRAL BANKS', icon: Building2 },
    { id: 'trends', label: 'TRENDS', icon: Search },
    { id: 'predictions', label: 'PREDICTIONS', icon: Target },
    { id: 'compare', label: 'COMPARE', icon: Activity },
    { id: 'research', label: 'RESEARCH', icon: Globe },
    { id: 'news', label: 'NEWS', icon: Newspaper },
    { id: 'reports', label: 'REPORTS', icon: FileText },
  ];

  return (
    <>
      <style>{`
        @keyframes tickerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-wrapper {
          overflow: hidden;
          position: relative;
        }
        
        .ticker-content {
          display: flex;
          animation: tickerScroll 60s linear infinite;
          will-change: transform;
        }
        
        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bgSecondary,
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        color: COLORS.textPrimary,
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: COLORS.bgHeader,
          borderBottom: `3px solid ${COLORS.primary}`,
          padding: '0 16px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: COLORS.primary,
                padding: '4px 8px',
                fontWeight: 800,
                fontSize: '13px',
                color: COLORS.textInverse,
              }}
            >
              IGEA
            </div>
            <span
              style={{
                color: COLORS.textInverse,
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              OMNIS
            </span>
            <span style={{ color: COLORS.textMuted, fontSize: '9px' }}>
              PRO v8.0
            </span>
          </div>
          <nav style={{ display: 'flex', gap: '1px' }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '5px 12px',
                  border: 'none',
                  background: tab === t.id ? COLORS.primary : 'transparent',
                  color: tab === t.id ? COLORS.textInverse : COLORS.textMuted,
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              background: `${regimeColor}22`,
              border: `1px solid ${regimeColor}`,
            }}
          >
            <div
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: regimeColor,
              }}
            />
            <span
              style={{ color: regimeColor, fontSize: '9px', fontWeight: 700 }}
            >
              {regime}
            </span>
          </div>
          <span
            style={{
              color: COLORS.textMuted,
              fontSize: '10px',
              fontFamily: "'Consolas', monospace",
            }}
          >
            <Clock size={10} />{' '}
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: autoRefresh ? COLORS.positive : 'transparent',
              border: `1px solid ${autoRefresh ? COLORS.positive : COLORS.textMuted}`,
              color: autoRefresh ? COLORS.textInverse : COLORS.textMuted,
              padding: '3px 8px',
              cursor: 'pointer',
              fontSize: '9px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              borderRadius: '3px',
            }}
          >
            <RefreshCw size={10} />
            {autoRefresh ? 'AUTO ON' : 'REFRESH'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.textMuted}`,
                color: COLORS.textMuted,
                padding: '3px 6px',
                cursor: 'pointer',
                fontSize: '9px',
                borderRadius: '3px',
              }}
            >
              -
            </button>
            <span style={{ color: COLORS.textMuted, fontSize: '9px', minWidth: '35px', textAlign: 'center' }}>
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.textMuted}`,
                color: COLORS.textMuted,
                padding: '3px 6px',
                cursor: 'pointer',
                fontSize: '9px',
                borderRadius: '3px',
              }}
            >
              +
            </button>
          </div>
        </div>
      </header>

      {/* ZOOMABLE CONTENT WRAPPER */}
      <div
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease',
        }}
      >
        {/* TICKER BAR */}
        <div
          className="ticker-wrapper"
          style={{
            background: COLORS.bgPrimary,
            borderBottom: `1px solid ${COLORS.border}`,
            padding: '5px 0',
          }}
        >
          <div className="ticker-content" style={{ gap: '20px', padding: '0 16px' }}>
            {/* First set of tickers */}
            {Object.entries(INDICES)
              .slice(0, 6)
              .map(([t, d]) => (
                <div
                  key={`${t}-1`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: COLORS.primary,
                    }}
                  >
                    {t}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {fmt(d.price, 0)}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '9px',
                      fontWeight: 600,
                      color: d.change >= 0 ? COLORS.positive : COLORS.negative,
                    }}
                  >
                    {fmtChg(d.change)}
                  </span>
                </div>
              ))}
            <div
              style={{ borderLeft: `1px solid ${COLORS.border}`, margin: '0 4px', height: '16px' }}
            />
            {Object.entries(FOREX)
              .slice(0, 4)
              .map(([t, d]) => (
                <div
                  key={`${t}-1`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: COLORS.primary,
                    }}
                  >
                    {t}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {fmt(d.price, 4)}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '9px',
                      fontWeight: 600,
                      color: d.change >= 0 ? COLORS.positive : COLORS.negative,
                    }}
                  >
                    {fmtChg(d.change)}
                  </span>
                </div>
              ))}
            {/* Duplicate set for seamless loop */}
            {Object.entries(INDICES)
              .slice(0, 6)
              .map(([t, d]) => (
                <div
                  key={`${t}-2`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: COLORS.primary,
                    }}
                  >
                    {t}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {fmt(d.price, 0)}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '9px',
                      fontWeight: 600,
                      color: d.change >= 0 ? COLORS.positive : COLORS.negative,
                    }}
                  >
                    {fmtChg(d.change)}
                  </span>
                </div>
              ))}
            <div
              style={{ borderLeft: `1px solid ${COLORS.border}`, margin: '0 4px', height: '16px' }}
            />
            {Object.entries(FOREX)
              .slice(0, 4)
              .map(([t, d]) => (
                <div
                  key={`${t}-2`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: COLORS.primary,
                    }}
                  >
                    {t}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {fmt(d.price, 4)}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '9px',
                      fontWeight: 600,
                      color: d.change >= 0 ? COLORS.positive : COLORS.negative,
                    }}
                  >
                    {fmtChg(d.change)}
                  </span>
                </div>
              ))}
          </div>
        </div>

      {/* MAIN */}
      <main
        style={{ padding: '12px 16px', maxWidth: '1700px', margin: '0 auto' }}
      >
        {/* ==================== OVERVIEW ==================== */}
        {tab === 'overview' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr 300px',
              gap: '12px',
            }}
          >
            <Panel title="Global Markets" noPad>
              <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
                {Object.entries(INDICES).map(([t, d]) => (
                  <AssetRow
                    key={t}
                    ticker={t}
                    data={d}
                    isSelected={selectedIndex === t}
                    onClick={() => setSelectedIndex(t)}
                  />
                ))}
                <div
                  style={{
                    background: COLORS.bgTertiary,
                    padding: '4px 10px',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: COLORS.textTertiary,
                  }}
                >
                  CRYPTO
                </div>
                {Object.entries(CRYPTO).map(([t, d]) => (
                  <AssetRow
                    key={t}
                    ticker={t}
                    data={d}
                    isSelected={selectedIndex === t}
                    onClick={() => setSelectedIndex(t)}
                  />
                ))}
                <div
                  style={{
                    background: COLORS.bgTertiary,
                    padding: '4px 10px',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: COLORS.textTertiary,
                  }}
                >
                  COMMODITIES
                </div>
                {Object.entries(COMMODITIES).map(([t, d]) => (
                  <AssetRow
                    key={t}
                    ticker={t}
                    data={d}
                    isSelected={selectedIndex === t}
                    onClick={() => setSelectedIndex(t)}
                  />
                ))}
              </div>
            </Panel>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <Panel
                title={`${selectedIndex} — ${
                  allAssets[selectedIndex]?.name || ''
                }`}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '26px',
                        fontWeight: 700,
                        fontFamily: "'Consolas', monospace",
                      }}
                    >
                      {fmt(
                        allAssets[selectedIndex]?.price,
                        allAssets[selectedIndex]?.price < 10 ? 4 : 2
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        fontFamily: "'Consolas', monospace",
                        marginLeft: '12px',
                        color:
                          allAssets[selectedIndex]?.change >= 0
                            ? COLORS.positive
                            : COLORS.negative,
                      }}
                    >
                      {fmtChg(allAssets[selectedIndex]?.change || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['1D', '1W', '1M', '3M', 'YTD', '1Y'].map((p) => {
                      const ret = calculatePeriodReturn(
                        allAssets[selectedIndex]?.history,
                        p
                      );
                      return (
                        <div
                          key={p}
                          onClick={() => setMarketsPeriod(p)}
                          style={{
                            textAlign: 'center',
                            padding: '4px 8px',
                            background: marketsPeriod === p ? COLORS.primary : COLORS.bgSecondary,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: marketsPeriod === p ? `2px solid ${COLORS.primaryDark}` : '2px solid transparent',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '8px',
                              color: marketsPeriod === p ? COLORS.textInverse : COLORS.textTertiary,
                            }}
                          >
                            {p}
                          </div>
                          <div
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              fontFamily: "'Consolas', monospace",
                              color: marketsPeriod === p 
                                ? COLORS.textInverse
                                : (ret >= 0 ? COLORS.positive : COLORS.negative),
                            }}
                          >
                            {fmtChg(ret)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={filterHistoryByPeriod(allAssets[selectedIndex]?.history || [], marketsPeriod)}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={COLORS.primary}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor={COLORS.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="1 1"
                      stroke={COLORS.borderLight}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={COLORS.textMuted}
                      fontSize={8}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke={COLORS.textMuted}
                      fontSize={8}
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => v.toLocaleString()}
                      width={50}
                    />
                    <Tooltip content={<Tooltip2 />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      fill="url(#g1)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="S&P 500 Sectors — 1D Change">
                <SectorHeatmap sectors={SECTORS} />
              </Panel>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <Panel
                title="Polymarket"
                action={
                  <span style={{ color: COLORS.primary, fontSize: '8px' }}>
                    ● LIVE
                  </span>
                }
                noPad
              >
                {futurePredictions.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 50px 40px',
                      padding: '8px 10px',
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        lineHeight: 1.3,
                      }}
                    >
                      {m.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '12px',
                        fontWeight: 700,
                        textAlign: 'right',
                        color:
                          m.yes >= 50 ? COLORS.positive : COLORS.textPrimary,
                      }}
                    >
                      {m.yes}%
                    </div>
                    <div
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '9px',
                        textAlign: 'right',
                        color:
                          m.change >= 0 ? COLORS.positive : COLORS.negative,
                      }}
                    >
                      {m.change >= 0 ? '+' : ''}
                      {m.change}
                    </div>
                  </div>
                ))}
              </Panel>
              <Panel title="Google Trends" noPad>
                {['NVIDIA Stock', 'Inflation News', 'Cryptocurrency', 'Stock Market'].map((kw) => {
                  const curr = GOOGLE_TRENDS[GOOGLE_TRENDS.length - 1][kw];
                  const prev = GOOGLE_TRENDS[0][kw];
                  const chg = curr - prev;
                  return (
                    <div
                      key={kw}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '70px 1fr 35px 40px',
                        padding: '6px 10px',
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 600 }}>
                        {kw}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: '1px',
                          height: '16px',
                        }}
                      >
                        {GOOGLE_TRENDS.map((d, i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: `${(d[kw] / 100) * 16}px`,
                              background:
                                chg >= 0 ? COLORS.positive : COLORS.negative,
                              opacity: 0.3 + (i / 8) * 0.7,
                            }}
                          />
                        ))}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                          textAlign: 'right',
                        }}
                      >
                        {curr}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '9px',
                          textAlign: 'right',
                          color: chg >= 0 ? COLORS.positive : COLORS.negative,
                        }}
                      >
                        {chg >= 0 ? '+' : ''}
                        {chg}
                      </div>
                    </div>
                  );
                })}
              </Panel>
              <Panel title="Latest News" noPad>
                {NEWS.slice(0, 4).map((n) => (
                  <NewsCard key={n.id} news={n} onClick={handleNewsClick} />
                ))}
              </Panel>
            </div>
          </div>
        )}

        {/* ==================== FOREX ==================== */}
        {tab === 'forex' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '320px 1fr',
              gap: '12px',
            }}
          >
            <Panel
              title="Currency Pairs"
              action={
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['All', 'Major', 'Cross', 'EM'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setForexCategory(c)}
                      style={{
                        padding: '2px 8px',
                        border: 'none',
                        background:
                          forexCategory === c ? COLORS.primary : 'transparent',
                        color:
                          forexCategory === c
                            ? COLORS.textInverse
                            : COLORS.textMuted,
                        fontSize: '9px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              }
              noPad
            >
              <div
                style={{
                  fontSize: '8px',
                  color: COLORS.textMuted,
                  padding: '4px 10px',
                  background: COLORS.bgSecondary,
                  display: 'grid',
                  gridTemplateColumns: '65px 1fr 70px 60px 60px 60px',
                  gap: '8px',
                }}
              >
                <span>PAIR</span>
                <span>NAME</span>
                <span style={{ textAlign: 'right' }}>BID</span>
                <span style={{ textAlign: 'right' }}>ASK</span>
                <span style={{ textAlign: 'right' }}>LAST</span>
                <span style={{ textAlign: 'right' }}>CHG</span>
              </div>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {Object.entries(FOREX)
                  .filter(
                    ([_, d]) =>
                      forexCategory === 'All' || d.category === forexCategory
                  )
                  .map(([t, d]) => (
                    <AssetRow
                      key={t}
                      ticker={t}
                      data={d}
                      isSelected={selectedForex === t}
                      onClick={() => setSelectedForex(t)}
                      showBidAsk
                    />
                  ))}
              </div>
            </Panel>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <Panel title={`${selectedForex} — ${FOREX[selectedForex]?.name}`}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        fontFamily: "'Consolas', monospace",
                      }}
                    >
                      {fmt(FOREX[selectedForex]?.price, 4)}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        fontFamily: "'Consolas', monospace",
                        marginLeft: '12px',
                        color:
                          FOREX[selectedForex]?.change >= 0
                            ? COLORS.positive
                            : COLORS.negative,
                      }}
                    >
                      {fmtChg(FOREX[selectedForex]?.change)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div
                        style={{ fontSize: '9px', color: COLORS.textTertiary }}
                      >
                        BID
                      </div>
                      <div
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {fmt(FOREX[selectedForex]?.bid, 4)}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{ fontSize: '9px', color: COLORS.textTertiary }}
                      >
                        ASK
                      </div>
                      <div
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {fmt(FOREX[selectedForex]?.ask, 4)}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{ fontSize: '9px', color: COLORS.textTertiary }}
                      >
                        SPREAD
                      </div>
                      <div
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {(
                          (FOREX[selectedForex]?.ask -
                            FOREX[selectedForex]?.bid) *
                          10000
                        ).toFixed(1)}{' '}
                        pips
                      </div>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filterHistoryByPeriod(FOREX[selectedForex]?.history || [], forexPeriod)}>
                    <defs>
                      <linearGradient id="fxGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={COLORS.primary}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor={COLORS.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="1 1"
                      stroke={COLORS.borderLight}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={COLORS.textMuted}
                      fontSize={9}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke={COLORS.textMuted}
                      fontSize={9}
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => v.toFixed(4)}
                      width={55}
                    />
                    <Tooltip content={<Tooltip2 />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      fill="url(#fxGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="Performance">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '8px',
                  }}
                >
                  {['1D', '1W', 'MTD', '1M', 'YTD', '1Y'].map((p) => {
                    const ret = calculatePeriodReturn(
                      FOREX[selectedForex]?.history,
                      p
                    );
                    return (
                      <div
                        key={p}
                        onClick={() => setForexPeriod(p)}
                        style={{
                          textAlign: 'center',
                          padding: '10px',
                          background: forexPeriod === p ? COLORS.primary : COLORS.bgSecondary,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: forexPeriod === p ? `2px solid ${COLORS.primaryDark}` : '2px solid transparent',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '10px',
                            color: forexPeriod === p ? COLORS.textInverse : COLORS.textTertiary,
                            marginBottom: '4px',
                          }}
                        >
                          {p}
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            fontFamily: "'Consolas', monospace",
                            color: forexPeriod === p
                              ? COLORS.textInverse
                              : (ret >= 0 ? COLORS.positive : COLORS.negative),
                          }}
                        >
                          {fmtChg(ret)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* ==================== COMPARE ==================== */}
        {tab === 'compare' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 280px',
              gap: '12px',
            }}
          >
            <Panel
              title="Custom Comparison — Normalized Performance (Base 100)"
              action={
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setShowNormalized(!showNormalized)}
                    style={{
                      padding: '2px 8px',
                      border: `1px solid ${COLORS.border}`,
                      background: showNormalized ? COLORS.primary : 'transparent',
                      color: showNormalized ? COLORS.textInverse : COLORS.textMuted,
                      fontSize: '9px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '3px',
                    }}
                  >
                    {showNormalized ? '✓' : ''} Normalize
                  </button>
                  <button
                    onClick={() => exportChartToPNG({ current: document.querySelector('#compare-chart') }, 'comparison_chart')}
                    style={{
                      padding: '2px 8px',
                      border: 'none',
                      background: COLORS.primary,
                      color: COLORS.textInverse,
                      fontSize: '9px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    📸 PNG
                  </button>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['1W', 'WTD', '1M', 'MTD', '3M', '6M', 'YTD', '1Y'].map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setComparePeriod(p);
                            setCustomStartDate('');
                            setCustomEndDate('');
                          }}
                          style={{
                            padding: '2px 8px',
                            border: 'none',
                            background:
                              comparePeriod === p && !customStartDate
                                ? COLORS.primary
                                : 'transparent',
                            color:
                              comparePeriod === p && !customStartDate
                                ? COLORS.textInverse
                                : COLORS.textMuted,
                            fontSize: '9px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', borderLeft: `1px solid ${COLORS.border}`, paddingLeft: '8px' }}>
                    <Calendar size={12} color={COLORS.textMuted} />
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setComparePeriod('Custom');
                      }}
                      style={{
                        padding: '2px 4px',
                        border: `1px solid ${COLORS.border}`,
                        background: COLORS.bgSecondary,
                        color: COLORS.textPrimary,
                        fontSize: '9px',
                        borderRadius: '2px',
                        fontFamily: "'Consolas', monospace",
                      }}
                    />
                    <span style={{ fontSize: '9px', color: COLORS.textMuted }}>to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setComparePeriod('Custom');
                      }}
                      style={{
                        padding: '2px 4px',
                        border: `1px solid ${COLORS.border}`,
                        background: COLORS.bgSecondary,
                        color: COLORS.textPrimary,
                        fontSize: '9px',
                        borderRadius: '2px',
                        fontFamily: "'Consolas', monospace",
                      }}
                    />
                  </div>
                </div>
              }
            >
              <div id="compare-chart">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={showNormalized ? compareData : compareData.map((p, i) => {
                    const denormalized = { date: p.date };
                    compareAssets.forEach((a) => {
                      const h = allAssets[a]?.history;
                      if (h && h[i]) denormalized[a] = h[i].price;
                    });
                    return denormalized;
                  })}>
                    <CartesianGrid
                      strokeDasharray="1 1"
                      stroke={COLORS.borderLight}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={COLORS.textMuted}
                      fontSize={9}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke={COLORS.textMuted}
                      fontSize={9}
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => v.toFixed(0)}
                      width={40}
                    />
                    {showNormalized && (
                      <ReferenceLine
                        y={100}
                        stroke={COLORS.textMuted}
                        strokeDasharray="3 3"
                      />
                    )}
                    <Tooltip content={<Tooltip2 />} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    {compareAssets.map((a, i) => {
                      const color = assetColors[a] || chartColors[i % chartColors.length];
                      const firstValue = showNormalized ? 100 : allAssets[a]?.history?.[0]?.price || 0;
                      const lastValue = showNormalized ? (compareData[compareData.length - 1]?.[a] || 100) : (allAssets[a]?.history?.[allAssets[a].history.length - 1]?.price || 0);
                      const performance = ((lastValue - firstValue) / firstValue) * 100;
                      
                      return (
                        <Line
                          key={a}
                          type="monotone"
                          dataKey={a}
                          stroke={color}
                          strokeWidth={2}
                          dot={false}
                          label={({ index, value, x, y }) => {
                            // Only show label on last data point
                            if (index === compareData.length - 1) {
                              return (
                                <text
                                  x={x + 10}
                                  y={y}
                                  fill={color}
                                  fontSize={10}
                                  fontWeight={700}
                                  fontFamily="Consolas, monospace"
                                >
                                  {performance >= 0 ? '+' : ''}{performance.toFixed(1)}%
                                </text>
                              );
                            }
                            return null;
                          }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Correlation Matrix */}
              {showCorrelation && compareAssets.length >= 2 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '8px', color: COLORS.textPrimary }}>
                    Correlation Matrix (Pearson)
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px', textAlign: 'left', background: COLORS.bgTertiary, borderBottom: `1px solid ${COLORS.border}` }}>
                            Asset
                          </th>
                          {compareAssets.map((a) => (
                            <th key={a} style={{ padding: '6px', textAlign: 'center', background: COLORS.bgTertiary, borderBottom: `1px solid ${COLORS.border}`, fontFamily: 'Consolas, monospace' }}>
                              {a}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {calculateCorrelationMatrix(compareAssets).map((row, i) => (
                          <tr key={row.asset}>
                            <td style={{ padding: '6px', fontWeight: 700, fontFamily: 'Consolas, monospace', background: COLORS.bgTertiary, borderRight: `1px solid ${COLORS.border}` }}>
                              {row.asset}
                            </td>
                            {compareAssets.map((a, j) => {
                              const corr = row[a];
                              const intensity = Math.abs(corr);
                              const bgColor = corr > 0 
                                ? `rgba(5, 150, 105, ${intensity * 0.5})` 
                                : `rgba(220, 38, 38, ${intensity * 0.5})`;
                              
                              return (
                                <td
                                  key={a}
                                  style={{
                                    padding: '6px',
                                    textAlign: 'center',
                                    background: i === j ? COLORS.bgTertiary : bgColor,
                                    fontFamily: 'Consolas, monospace',
                                    fontWeight: 600,
                                    color: intensity > 0.5 ? COLORS.textInverse : COLORS.textPrimary,
                                    borderBottom: `1px solid ${COLORS.borderLight}`,
                                  }}
                                >
                                  {corr.toFixed(2)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Panel>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <Panel title="Assets">
                <div style={{ position: 'relative' }}>
                  <div
                    style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}
                  >
                    <input
                      value={compareInput}
                      onChange={(e) => setCompareInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCompareAsset()}
                      placeholder="Add ticker or name..."
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}
                    />
                    <button
                      onClick={addCompareAsset}
                      style={{
                        padding: '6px 10px',
                        border: 'none',
                        background: COLORS.primary,
                        color: COLORS.textInverse,
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      <PlusCircle size={14} />
                    </button>
                  </div>
                  {compareInput && getAssetSuggestions(compareInput).length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        left: 0,
                        right: '50px',
                        background: COLORS.bgPrimary,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        zIndex: 1000,
                        maxHeight: '150px',
                        overflowY: 'auto',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      {getAssetSuggestions(compareInput).map((ticker) => (
                        <div
                          key={ticker}
                          onClick={() => {
                            if (!compareAssets.includes(ticker)) {
                              setCompareAssets([...compareAssets, ticker]);
                            }
                            setCompareInput('');
                          }}
                          style={{
                            padding: '8px 10px',
                            cursor: 'pointer',
                            borderBottom: `1px solid ${COLORS.borderLight}`,
                            fontSize: '11px',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = COLORS.bgSecondary)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'transparent')
                          }
                        >
                          <div style={{ fontWeight: 600, color: COLORS.primary }}>
                            {ticker}
                          </div>
                          <div style={{ fontSize: '9px', color: COLORS.textTertiary }}>
                            {allAssets[ticker]?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {compareAssets.map((a, i) => (
                  <div
                    key={a}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      background: COLORS.bgSecondary,
                      marginBottom: '4px',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${
                        assetColors[a] || chartColors[i % chartColors.length]
                      }`,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontWeight: 700,
                          fontSize: '12px',
                          color: COLORS.primary,
                        }}
                      >
                        {a}
                      </div>
                      <div
                        style={{ fontSize: '10px', color: COLORS.textTertiary }}
                      >
                        {allAssets[a]?.name}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={assetColors[a] || chartColors[i % chartColors.length]}
                        onChange={(e) => setAssetColors({ ...assetColors, [a]: e.target.value })}
                        style={{
                          width: '24px',
                          height: '24px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        title="Change color"
                      />
                      <button
                        onClick={() =>
                          setCompareAssets(compareAssets.filter((x) => x !== a))
                        }
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: COLORS.textMuted,
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </Panel>
              <Panel title="Tools">
                <button
                  onClick={() => setShowCorrelation(!showCorrelation)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '8px',
                    border: `1px solid ${COLORS.border}`,
                    background: showCorrelation ? COLORS.primary : 'transparent',
                    color: showCorrelation ? COLORS.textInverse : COLORS.textPrimary,
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {showCorrelation ? '✓' : ''} Correlation Matrix
                </button>
              </Panel>
              <Panel 
                title="Period Returns"
                action={
                  <button
                    onClick={downloadCompareData}
                    style={{
                      padding: '2px 8px',
                      border: 'none',
                      background: COLORS.primary,
                      color: COLORS.textInverse,
                      fontSize: '9px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download size={10} /> CSV
                  </button>
                }
              >
                            padding: '8px 10px',
                            cursor: 'pointer',
                            borderBottom: `1px solid ${COLORS.borderLight}`,
                            fontSize: '11px',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = COLORS.bgSecondary)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'transparent')
                          }
                        >
                          <div style={{ fontWeight: 600, color: COLORS.primary }}>
                            {ticker}
                          </div>
                          <div style={{ fontSize: '9px', color: COLORS.textTertiary }}>
                            {allAssets[ticker]?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {compareAssets.map((a, i) => (
                  <div
                    key={a}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      background: COLORS.bgSecondary,
                      marginBottom: '4px',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${
                        chartColors[i % chartColors.length]
                      }`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontWeight: 700,
                          fontSize: '12px',
                          color: COLORS.primary,
                        }}
                      >
                        {a}
                      </div>
                      <div
                        style={{ fontSize: '10px', color: COLORS.textTertiary }}
                      >
                        {allAssets[a]?.name}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setCompareAssets(compareAssets.filter((x) => x !== a))
                      }
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: COLORS.textMuted,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </Panel>
              <Panel 
                title="Period Returns"
                action={
                  <button
                    onClick={downloadCompareData}
                    style={{
                      padding: '2px 8px',
                      border: 'none',
                      background: COLORS.primary,
                      color: COLORS.textInverse,
                      fontSize: '9px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download size={10} /> CSV
                  </button>
                }
              >
                <div style={{ overflowX: 'auto' }}>
                  <div
                    style={{
                      fontSize: '8px',
                      color: COLORS.textMuted,
                      padding: '4px 0',
                      display: 'grid',
                      gridTemplateColumns: '60px repeat(6, 1fr)',
                      gap: '4px',
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                      minWidth: '240px',
                    }}
                  >
                    <span>TICKER</span>
                    {['1D', '1W', '1M', '3M', 'YTD', '1Y'].map((p) => (
                      <span key={p} style={{ textAlign: 'right' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                  {compareAssets.map((a) => (
                    <div
                      key={a}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px repeat(6, 1fr)',
                        gap: '4px',
                        padding: '6px 0',
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                        minWidth: '240px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontWeight: 700,
                          fontSize: '10px',
                          color: COLORS.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {a}
                      </span>
                      {['1D', '1W', '1M', '3M', 'YTD', '1Y'].map((p) => {
                        const ret = calculatePeriodReturn(
                          allAssets[a]?.history,
                          p
                        );
                        return (
                          <span
                            key={p}
                            style={{
                              fontFamily: "'Consolas', monospace",
                              fontSize: '10px',
                              fontWeight: 600,
                              textAlign: 'right',
                              color: ret >= 0 ? COLORS.positive : COLORS.negative,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {fmtChg(ret)}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* ==================== RESEARCH (M&A) ==================== */}
        {tab === 'research' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: '12px',
            }}
          >
            <Panel title="Companies" noPad>
              <div style={{ padding: '10px', borderBottom: `1px solid ${COLORS.borderLight}` }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Search size={14} color={COLORS.textMuted} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search companies..."
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {Object.entries(filteredStocks).map(([t, d]) => (
                  <div
                    key={t}
                    onClick={() => setSelectedStock(t)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '55px 1fr 60px 55px',
                      padding: '8px 10px',
                      background:
                        selectedStock === t ? COLORS.bgTertiary : 'transparent',
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                      cursor: 'pointer',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) =>
                      selectedStock !== t &&
                      (e.currentTarget.style.background = COLORS.bgSecondary)
                    }
                    onMouseLeave={(e) =>
                      selectedStock !== t &&
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <div
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontWeight: 700,
                        fontSize: '11px',
                        color: COLORS.primary,
                      }}
                    >
                      {t}
                    </div>
                    <div
                      style={{ fontSize: '9px', color: COLORS.textTertiary }}
                    >
                      {d.sector}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '11px',
                        fontWeight: 600,
                        textAlign: 'right',
                      }}
                    >
                      ${fmt(d.price, 2)}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '10px',
                        fontWeight: 600,
                        textAlign: 'right',
                        color:
                          d.change >= 0 ? COLORS.positive : COLORS.negative,
                      }}
                    >
                      {fmtChg(d.change)}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <Panel
                title={`${selectedStock} — ${STOCKS[selectedStock]?.name} — Corporate Profile`}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: COLORS.textTertiary,
                        marginBottom: '8px',
                        borderBottom: `1px solid ${COLORS.border}`,
                        paddingBottom: '4px',
                      }}
                    >
                      VALUATION METRICS
                    </div>
                    <DataRow
                      label="P/E Ratio (TTM)"
                      value={fmt(STOCKS[selectedStock]?.pe, 1)}
                    />
                    <DataRow
                      label="Price/Book"
                      value={fmt(STOCKS[selectedStock]?.pb, 1)}
                    />
                    <DataRow
                      label="Price/Sales"
                      value={fmt(STOCKS[selectedStock]?.ps, 1)}
                    />
                    <DataRow
                      label="EV/EBITDA"
                      value={fmt(STOCKS[selectedStock]?.evEbitda, 1)}
                    />
                    <DataRow
                      label="Market Cap"
                      value={`$${fmtLargeNum(
                        STOCKS[selectedStock]?.marketCap
                      )}`}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: COLORS.textTertiary,
                        marginBottom: '8px',
                        borderBottom: `1px solid ${COLORS.border}`,
                        paddingBottom: '4px',
                      }}
                    >
                      FINANCIALS (TTM)
                    </div>
                    <DataRow
                      label="Revenue"
                      value={`$${STOCKS[selectedStock]?.revenue}B`}
                    />
                    <DataRow
                      label="EBITDA"
                      value={`$${STOCKS[selectedStock]?.ebitda}B`}
                    />
                    <DataRow
                      label="Net Income"
                      value={`$${STOCKS[selectedStock]?.netIncome}B`}
                    />
                    <DataRow
                      label="EBITDA Margin"
                      value={`${(
                        (STOCKS[selectedStock]?.ebitda /
                          STOCKS[selectedStock]?.revenue) *
                        100
                      ).toFixed(1)}%`}
                    />
                    <DataRow
                      label="Net Margin"
                      value={`${(
                        (STOCKS[selectedStock]?.netIncome /
                          STOCKS[selectedStock]?.revenue) *
                        100
                      ).toFixed(1)}%`}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: COLORS.textTertiary,
                        marginBottom: '8px',
                        borderBottom: `1px solid ${COLORS.border}`,
                        paddingBottom: '4px',
                      }}
                    >
                      FUNDAMENTALS
                    </div>
                    <DataRow
                      label="ROE"
                      value={`${STOCKS[selectedStock]?.roe}%`}
                    />
                    <DataRow
                      label="Debt/Equity"
                      value={fmt(STOCKS[selectedStock]?.debt, 2)}
                    />
                    <DataRow
                      label="Dividend Yield"
                      value={`${STOCKS[selectedStock]?.divYield}%`}
                    />
                    <DataRow
                      label="Employees"
                      value={STOCKS[selectedStock]?.employees.toLocaleString()}
                    />
                    <DataRow
                      label="Sector"
                      value={STOCKS[selectedStock]?.sector}
                      mono={false}
                    />
                  </div>
                </div>
              </Panel>
              <Panel title="Peer Comparison — Valuation Multiples">
                <div
                  style={{
                    fontSize: '8px',
                    color: COLORS.textMuted,
                    padding: '6px 0',
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr repeat(5, 70px)',
                    gap: '4px',
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <span>TICKER</span>
                  <span>COMPANY</span>
                  <span style={{ textAlign: 'right' }}>MKT CAP</span>
                  <span style={{ textAlign: 'right' }}>P/E</span>
                  <span style={{ textAlign: 'right' }}>P/B</span>
                  <span style={{ textAlign: 'right' }}>EV/EBITDA</span>
                  <span style={{ textAlign: 'right' }}>ROE %</span>
                </div>
                {Object.entries(STOCKS)
                  .filter(
                    ([t]) => STOCKS[t].sector === STOCKS[selectedStock]?.sector
                  )
                  .map(([t, d]) => (
                    <div
                      key={t}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr repeat(5, 70px)',
                        gap: '4px',
                        padding: '8px 0',
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                        background:
                          t === selectedStock
                            ? COLORS.bgTertiary
                            : 'transparent',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontWeight: 700,
                          fontSize: '11px',
                          color: COLORS.primary,
                        }}
                      >
                        {t}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: COLORS.textSecondary,
                        }}
                      >
                        {d.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '10px',
                          textAlign: 'right',
                        }}
                      >
                        ${fmtLargeNum(d.marketCap)}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '10px',
                          textAlign: 'right',
                        }}
                      >
                        {fmt(d.pe, 1)}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '10px',
                          textAlign: 'right',
                        }}
                      >
                        {fmt(d.pb, 1)}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '10px',
                          textAlign: 'right',
                        }}
                      >
                        {fmt(d.evEbitda, 1)}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Consolas', monospace",
                          fontSize: '10px',
                          textAlign: 'right',
                        }}
                      >
                        {d.roe}%
                      </span>
                    </div>
                  ))}
              </Panel>
            </div>
          </div>
        )}

        {/* ==================== NEWS ==================== */}
        {tab === 'news' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: '12px',
            }}
          >
            <Panel
              title="Market News"
              action={
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    'All',
                    'Macro',
                    'Earnings',
                    'Corporate',
                    'Crypto',
                    'Forex',
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewsFilter(c)}
                      style={{
                        padding: '2px 8px',
                        border: 'none',
                        background:
                          newsFilter === c ? COLORS.primary : 'transparent',
                        color:
                          newsFilter === c
                            ? COLORS.textInverse
                            : COLORS.textMuted,
                        fontSize: '9px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              }
              noPad
            >
              {NEWS.filter(
                (n) => newsFilter === 'All' || n.category === newsFilter
              ).map((n) => (
                <NewsCard key={n.id} news={n} onClick={handleNewsClick} />
              ))}
            </Panel>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <Panel title="Market Movers">
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: COLORS.positive,
                    marginBottom: '8px',
                  }}
                >
                  ▲ TOP GAINERS
                </div>
                {[
                  { t: 'NVDA', c: 4.23 },
                  { t: 'BTCUSD', c: 3.45 },
                  { t: 'GOOGL', c: 2.15 },
                ].map((x) => (
                  <div
                    key={x.t}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontWeight: 700,
                        fontSize: '11px',
                        color: COLORS.primary,
                      }}
                    >
                      {x.t}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '11px',
                        fontWeight: 600,
                        color: COLORS.positive,
                      }}
                    >
                      {fmtChg(x.c)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: COLORS.negative,
                    marginTop: '12px',
                    marginBottom: '8px',
                  }}
                >
                  ▼ TOP LOSERS
                </div>
                {[
                  { t: 'TSLA', c: -1.89 },
                  { t: 'XLE', c: -1.45 },
                  { t: 'HSI', c: -1.24 },
                ].map((x) => (
                  <div
                    key={x.t}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontWeight: 700,
                        fontSize: '11px',
                        color: COLORS.primary,
                      }}
                    >
                      {x.t}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '11px',
                        fontWeight: 600,
                        color: COLORS.negative,
                      }}
                    >
                      {fmtChg(x.c)}
                    </span>
                  </div>
                ))}
              </Panel>
              <Panel title="Economic Calendar">
                {[
                  {
                    event: 'FOMC Meeting Minutes',
                    date: 'Feb 28',
                    impact: 'high',
                  },
                  {
                    event: 'US GDP (Q4 Final)',
                    date: 'Feb 29',
                    impact: 'high',
                  },
                  { event: 'PCE Price Index', date: 'Mar 1', impact: 'high' },
                  {
                    event: 'ISM Manufacturing PMI',
                    date: 'Mar 1',
                    impact: 'medium',
                  },
                ].map((e, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 500 }}>
                        {e.event}
                      </div>
                      <div
                        style={{ fontSize: '9px', color: COLORS.textTertiary }}
                      >
                        {e.date}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '3px',
                        background:
                          e.impact === 'high'
                            ? COLORS.negativeLight
                            : COLORS.bgTertiary,
                        color:
                          e.impact === 'high'
                            ? COLORS.negative
                            : COLORS.textTertiary,
                      }}
                    >
                      {e.impact.toUpperCase()}
                    </span>
                  </div>
                ))}
              </Panel>
            </div>
          </div>
        )}

        {/* ==================== CENTRAL BANKS ==================== */}
        {tab === 'centralbanks' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
            <Panel title="Central Banks Overview" noPad>
              <div
                style={{
                  fontSize: '8px',
                  color: COLORS.textMuted,
                  padding: '4px 10px',
                  background: COLORS.bgSecondary,
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 60px 60px 80px',
                  gap: '4px',
                }}
              >
                <span>CODE</span>
                <span>BANK</span>
                <span style={{ textAlign: 'right' }}>RATE</span>
                <span style={{ textAlign: 'right' }}>CHG</span>
                <span style={{ textAlign: 'right' }}>STANCE</span>
              </div>
              {Object.entries(CENTRAL_BANKS_EXTENDED).map(([code, bank]) => (
                <div
                  key={code}
                  style={{
                    padding: '8px 10px',
                    borderBottom: `1px solid ${COLORS.border}`,
                    display: 'grid',
                    gridTemplateColumns: '50px 1fr 60px 60px 80px',
                    gap: '4px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: selectedCentralBank === code ? COLORS.bgSecondary : 'transparent',
                  }}
                  onClick={() => setSelectedCentralBank(code)}
                  onMouseEnter={(e) => {
                    if (selectedCentralBank !== code) {
                      e.currentTarget.style.background = COLORS.bgSecondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCentralBank !== code) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '9px',
                      fontWeight: 700,
                      color: COLORS.primary,
                    }}
                  >
                    {code}
                  </span>
                  <span style={{ fontSize: '9px' }}>{bank.name}</span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '9px',
                      fontWeight: 600,
                      textAlign: 'right',
                    }}
                  >
                    {bank.rate.toFixed(2)}%
                  </span>
                  <span
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '9px',
                      fontWeight: 600,
                      textAlign: 'right',
                      color: bank.change >= 0 ? COLORS.positive : COLORS.negative,
                    }}
                  >
                    {bank.change >= 0 ? '+' : ''}{bank.change.toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontSize: '8px',
                      textAlign: 'right',
                      color:
                        bank.stance === 'Restrictive'
                          ? COLORS.negative
                          : bank.stance === 'Accommodative'
                          ? COLORS.positive
                          : COLORS.textMuted,
                    }}
                  >
                    {bank.stance}
                  </span>
                </div>
              ))}
            </Panel>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Panel title="Key Metrics Comparison">
                <div
                  style={{
                    fontSize: '8px',
                    color: COLORS.textMuted,
                    padding: '4px 10px',
                    background: COLORS.bgSecondary,
                    display: 'grid',
                    gridTemplateColumns: '50px 1fr 60px 60px 60px',
                    gap: '4px',
                    marginBottom: '4px',
                  }}
                >
                  <span>CODE</span>
                  <span>BANK</span>
                  <span style={{ textAlign: 'right' }}>INFLATION</span>
                  <span style={{ textAlign: 'right' }}>UNEMP</span>
                  <span style={{ textAlign: 'right' }}>GDP</span>
                </div>
                {Object.entries(CENTRAL_BANKS_EXTENDED).map(([code, bank]) => (
                  <div
                    key={code}
                    style={{
                      padding: '6px 10px',
                      borderBottom: `1px solid ${COLORS.border}`,
                      display: 'grid',
                      gridTemplateColumns: '50px 1fr 60px 60px 60px',
                      gap: '4px',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '9px',
                        fontWeight: 700,
                        color: COLORS.primary,
                      }}
                    >
                      {code}
                    </span>
                    <span style={{ fontSize: '9px' }}>{bank.name}</span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '9px',
                        textAlign: 'right',
                        color: bank.inflation > 2 ? COLORS.negative : COLORS.positive,
                      }}
                    >
                      {bank.inflation.toFixed(1)}%
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '9px',
                        textAlign: 'right',
                      }}
                    >
                      {bank.unemployment.toFixed(1)}%
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '9px',
                        textAlign: 'right',
                        color: bank.gdp >= 2 ? COLORS.positive : bank.gdp < 1 ? COLORS.negative : COLORS.textPrimary,
                      }}
                    >
                      {bank.gdp.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </Panel>
              
              <Panel title="Upcoming Meetings">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(CENTRAL_BANKS_EXTENDED)
                    .sort(([, a], [, b]) => new Date(a.nextMeeting) - new Date(b.nextMeeting))
                    .slice(0, 5)
                    .map(([code, bank]) => (
                      <div
                        key={code}
                        style={{
                          padding: '8px',
                          background: COLORS.bgSecondary,
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              color: COLORS.primary,
                              marginBottom: '2px',
                            }}
                          >
                            {code}
                          </div>
                          <div style={{ fontSize: '8px', color: COLORS.textMuted }}>
                            {bank.name}
                          </div>
                        </div>
                        <div
                          style={{
                            fontFamily: "'Consolas', monospace",
                            fontSize: '9px',
                            fontWeight: 700,
                            color: COLORS.textPrimary,
                          }}
                        >
                          {new Date(bank.nextMeeting).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </Panel>
            </div>
          </div>
          
          {/* Historical Interest Rates Chart */}
          <div style={{ marginTop: '12px' }}>
            <Panel title={`${selectedCentralBank} — ${CENTRAL_BANKS_EXTENDED[selectedCentralBank]?.name} — Historical Interest Rates`}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={CENTRAL_BANKS_EXTENDED[selectedCentralBank]?.history || []}>
                  <CartesianGrid strokeDasharray="1 1" stroke={COLORS.borderLight} />
                  <XAxis
                    dataKey="date"
                    stroke={COLORS.textMuted}
                    fontSize={9}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={COLORS.textMuted}
                    fontSize={9}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => `${v.toFixed(2)}%`}
                  />
                  <Tooltip content={<Tooltip2 />} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: COLORS.primary, r: 3 }}
                    name="Interest Rate (%)"
                  />
                  <ReferenceLine
                    y={CENTRAL_BANKS_EXTENDED[selectedCentralBank]?.rate}
                    stroke={COLORS.primary}
                    strokeDasharray="3 3"
                    label={{ 
                      value: `Current: ${CENTRAL_BANKS_EXTENDED[selectedCentralBank]?.rate.toFixed(2)}%`, 
                      position: 'right',
                      fill: COLORS.primary,
                      fontSize: 10,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>
          </div>
        )}

        {/* ==================== TRENDS ==================== */}
        {tab === 'trends' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '12px',
            }}
          >
            <Panel 
              title="Google Trends — Interest Over Time"
              action={
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['All', 'Markets', 'Macro', 'Tech', 'Crypto'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setTrendSector(c)}
                      style={{
                        padding: '2px 8px',
                        border: 'none',
                        background:
                          trendSector === c ? COLORS.primary : 'transparent',
                        color:
                          trendSector === c
                            ? COLORS.textInverse
                            : COLORS.textMuted,
                        fontSize: '9px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={GOOGLE_TRENDS}>
                  <CartesianGrid
                    strokeDasharray="1 1"
                    stroke={COLORS.borderLight}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={COLORS.textMuted}
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={COLORS.textMuted}
                    fontSize={10}
                    domain={[0, 100]}
                    tickLine={false}
                  />
                  <Tooltip content={<Tooltip2 />} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="NVIDIA Stock"
                    stroke={COLORS.chart5}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Inflation News"
                    stroke={COLORS.chart1}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Cryptocurrency"
                    stroke={COLORS.chart4}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Stock Market"
                    stroke={COLORS.chart3}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Federal Reserve"
                    stroke={COLORS.chart6}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Keyword Analysis" noPad>
              <div
                style={{
                  fontSize: '8px',
                  color: COLORS.textMuted,
                  padding: '4px 10px',
                  background: COLORS.bgSecondary,
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 40px 45px',
                  gap: '4px',
                }}
              >
                <span>KEYWORD</span>
                <span>TREND</span>
                <span style={{ textAlign: 'right' }}>NOW</span>
                <span style={{ textAlign: 'right' }}>Δ 8W</span>
              </div>
              {[
                'NVIDIA Stock',
                'Inflation News',
                'Cryptocurrency',
                'Stock Market',
                'Federal Reserve',
                'Interest Rates',
              ].map((kw) => {
                const curr = GOOGLE_TRENDS[GOOGLE_TRENDS.length - 1][kw];
                const prev = GOOGLE_TRENDS[0][kw];
                const chg = curr - prev;
                return (
                  <div
                    key={kw}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 40px 45px',
                      padding: '8px 10px',
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                      gap: '4px',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 600 }}>
                      {kw}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '1px',
                        height: '18px',
                      }}
                    >
                      {GOOGLE_TRENDS.map((d, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${(d[kw] / 100) * 18}px`,
                            background:
                              chg >= 0 ? COLORS.positive : COLORS.negative,
                            opacity: 0.3 + (i / 8) * 0.7,
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '12px',
                        fontWeight: 700,
                        textAlign: 'right',
                      }}
                    >
                      {curr}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '10px',
                        fontWeight: 600,
                        textAlign: 'right',
                        color: chg >= 0 ? COLORS.positive : COLORS.negative,
                      }}
                    >
                      {chg >= 0 ? '+' : ''}
                      {chg}
                    </div>
                  </div>
                );
              })}
            </Panel>
          </div>
        )}

        {/* ==================== PREDICTIONS ==================== */}
        {tab === 'predictions' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <Panel title="Polymarket — Prediction Markets" noPad>
              <div
                style={{
                  fontSize: '8px',
                  color: COLORS.textMuted,
                  padding: '6px 10px',
                  background: COLORS.bgSecondary,
                  display: 'grid',
                  gridTemplateColumns: '1fr 55px 45px 55px',
                  gap: '4px',
                }}
              >
                <span>EVENT</span>
                <span style={{ textAlign: 'right' }}>YES %</span>
                <span style={{ textAlign: 'right' }}>24H Δ</span>
                <span style={{ textAlign: 'right' }}>VOLUME</span>
              </div>
              {futurePredictions.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 55px 45px 55px',
                    padding: '10px',
                    borderBottom: `1px solid ${COLORS.borderLight}`,
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {m.title}
                    </div>
                    <div
                      style={{ fontSize: '9px', color: COLORS.textTertiary }}
                    >
                      {m.category}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '14px',
                      fontWeight: 700,
                      textAlign: 'right',
                      color: m.yes >= 50 ? COLORS.positive : COLORS.textPrimary,
                    }}
                  >
                    {m.yes}%
                  </div>
                  <div
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      textAlign: 'right',
                      color: m.change >= 0 ? COLORS.positive : COLORS.negative,
                    }}
                  >
                    {m.change >= 0 ? '+' : ''}
                    {m.change}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Consolas', monospace",
                      fontSize: '10px',
                      textAlign: 'right',
                      color: COLORS.textTertiary,
                    }}
                  >
                    ${m.volume}M
                  </div>
                </div>
              ))}
            </Panel>
            <Panel title="Probability Distribution">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={futurePredictions} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="1 1"
                    stroke={COLORS.borderLight}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke={COLORS.textMuted}
                    fontSize={9}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    stroke={COLORS.textMuted}
                    fontSize={8}
                    width={150}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v.length > 30 ? v.slice(0, 30) + '...' : v
                    }
                  />
                  <Tooltip content={<Tooltip2 />} />
                  <Bar
                    dataKey="yes"
                    fill={COLORS.primary}
                    radius={[0, 3, 3, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        )}

        {/* ==================== MARKETS ==================== */}
        {tab === 'markets' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <Panel title="Search Companies" noPad>
              {/* Search Bar */}
              <div style={{ padding: '12px', background: COLORS.bgSecondary }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search by company name or ticker..."
                    value={compareInput}
                    onChange={(e) => {
                      setCompareInput(e.target.value);
                      searchCompanies(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 32px 8px 12px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: COLORS.textMuted,
                    }}
                  />
                </div>
                {searchLoading && (
                  <div style={{ padding: '8px', fontSize: '12px', color: COLORS.textMuted }}>
                    Searching...
                  </div>
                )}
                {apiError && (
                  <div style={{ padding: '8px', fontSize: '12px', color: COLORS.negative }}>
                    {apiError}
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '8px',
                      color: COLORS.textMuted,
                      padding: '4px 10px',
                      background: COLORS.bgSecondary,
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 80px',
                      gap: '4px',
                    }}
                  >
                    <span>SYMBOL</span>
                    <span>NAME</span>
                    <span>EXCHANGE</span>
                  </div>
                  {searchResults.map((result) => (
                    <div
                      key={result.symbol}
                      onClick={() => handleSearchResultClick(result)}
                      style={{
                        padding: '10px',
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 80px',
                        gap: '4px',
                        alignItems: 'center',
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        background: selectedSearchResult?.symbol === result.symbol ? COLORS.primaryLight + '20' : 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.bgSecondary)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = selectedSearchResult?.symbol === result.symbol ? COLORS.primaryLight + '20' : 'transparent')}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '11px',
                          fontFamily: "'Consolas', monospace",
                        }}
                      >
                        {result.symbol}
                      </span>
                      <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>
                        {result.name}
                      </span>
                      <span style={{ fontSize: '9px', color: COLORS.textMuted }}>
                        {result.exchangeShortName || result.stockExchange}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Default view - Global Indices */}
              {!searchResults.length && !selectedSearchResult && (
                <div>
                  <div
                    style={{
                      fontSize: '8px',
                      color: COLORS.textMuted,
                      padding: '4px 10px',
                      background: COLORS.bgSecondary,
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 70px 60px',
                      gap: '4px',
                    }}
                  >
                    <span>TICKER</span>
                    <span>NAME</span>
                    <span style={{ textAlign: 'right' }}>LAST</span>
                    <span style={{ textAlign: 'right' }}>CHG %</span>
                  </div>
                  {Object.entries(INDICES).map(([t, d]) => (
                    <AssetRow
                      key={t}
                      ticker={t}
                      data={d}
                      isSelected={selectedIndex === t}
                      onClick={() => setSelectedIndex(t)}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel title={selectedSearchResult ? `${selectedSearchResult.symbol} — ${selectedSearchResult.name}` : `${selectedIndex} — ${INDICES[selectedIndex]?.name}`}>
              {isLoading && (
                <div style={{ padding: '20px', textAlign: 'center', color: COLORS.textMuted }}>
                  Loading data...
                </div>
              )}
              
              {!isLoading && (selectedSearchResult || !isLoading) && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        fontFamily: "'Consolas', monospace",
                      }}
                    >
                      {realTimeQuote ? fmt(realTimeQuote.price, 2) : fmt(INDICES[selectedIndex]?.price, 2)}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        fontFamily: "'Consolas', monospace",
                        marginLeft: '12px',
                        color:
                          (realTimeQuote?.changesPercentage || INDICES[selectedIndex]?.change || 0) >= 0
                            ? COLORS.positive
                            : COLORS.negative,
                      }}
                    >
                      {realTimeQuote ? fmtChg(realTimeQuote.changesPercentage) : fmtChg(INDICES[selectedIndex]?.change)}
                    </span>
                  </div>

                  {realTimeQuote && (
                    <div style={{ marginBottom: '12px', fontSize: '11px', color: COLORS.textSecondary }}>
                      <div>Market Cap: {realTimeQuote.marketCap ? `$${(realTimeQuote.marketCap / 1e9).toFixed(2)}B` : 'N/A'}</div>
                      <div>Volume: {realTimeQuote.volume ? realTimeQuote.volume.toLocaleString() : 'N/A'}</div>
                      <div>PE Ratio: {realTimeQuote.pe ? realTimeQuote.pe.toFixed(2) : 'N/A'}</div>
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: COLORS.textTertiary,
                        marginBottom: '8px',
                      }}
                    >
                      PERIOD RETURNS
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['1D', '1W', '1M', '3M', 'YTD', '1Y'].map((p) => {
                        const historyData = historicalData.length > 0 ? historicalData : INDICES[selectedIndex]?.history;
                        const ret = calculatePeriodReturn(historyData, p);
                        return (
                          <div
                            key={p}
                            style={{
                              flex: 1,
                              padding: '8px',
                              background: COLORS.bgSecondary,
                              borderRadius: '4px',
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '9px',
                                color: COLORS.textMuted,
                                marginBottom: '4px',
                              }}
                            >
                              {p}
                            </div>
                            <div
                              style={{
                                fontFamily: "'Consolas', monospace",
                                fontSize: '12px',
                                fontWeight: 700,
                                color: ret >= 0 ? COLORS.positive : COLORS.negative,
                              }}
                            >
                              {fmtChg(ret)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={(historicalData.length > 0 ? historicalData : INDICES[selectedIndex]?.history) || []}>
                      <defs>
                        <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={COLORS.chart2}
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="100%"
                            stopColor={COLORS.chart2}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="1 1"
                        stroke={COLORS.borderLight}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={COLORS.textMuted}
                        fontSize={9}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        stroke={COLORS.textMuted}
                        fontSize={9}
                        tickLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(v) => v.toLocaleString()}
                        width={50}
                      />
                      <Tooltip content={<Tooltip2 />} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={COLORS.chart2}
                        strokeWidth={2}
                        fill="url(#mktGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              )}
            </Panel>
          </div>
        )}

        {/* ==================== REPORTS ==================== */}
        {tab === 'reports' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              gap: '12px',
            }}
          >
            <Panel title="Financial Statements">
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: COLORS.textTertiary,
                    marginBottom: '8px',
                  }}
                >
                  COMPANY TICKER
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g., AAPL"
                    value={compareInput}
                    onChange={(e) => setCompareInput(e.target.value.toUpperCase())}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && compareInput.trim()) {
                        getFinancialStatements(compareInput.trim());
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    onClick={() => compareInput.trim() && getFinancialStatements(compareInput.trim())}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      background: COLORS.primary,
                      color: COLORS.textInverse,
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? 'Loading...' : 'Load'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: COLORS.textTertiary,
                    marginBottom: '8px',
                  }}
                >
                  SELECT DATA ROWS
                </div>
                {Object.entries({
                  revenue: 'Revenue',
                  netIncome: 'Net Income',
                  ebitda: 'EBITDA',
                  totalDebt: 'Total Debt',
                  totalAssets: 'Total Assets',
                  operatingCashFlow: 'Operating Cash Flow',
                }).map(([key, label]) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 0',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFinancialRows[key]}
                      onChange={(e) =>
                        setSelectedFinancialRows({
                          ...selectedFinancialRows,
                          [key]: e.target.checked,
                        })
                      }
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={exportFinancialData}
                disabled={financialStatements.incomeStatement.length === 0}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: COLORS.primary,
                  color: COLORS.textInverse,
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: financialStatements.incomeStatement.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: financialStatements.incomeStatement.length === 0 ? 0.5 : 1,
                }}
              >
                <Download size={16} /> EXPORT TO CSV
              </button>
            </Panel>

            <Panel title="Financial Data" noPad>
              {isLoading && (
                <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textMuted }}>
                  Loading financial statements...
                </div>
              )}

              {apiError && (
                <div style={{ padding: '20px', textAlign: 'center', color: COLORS.negative }}>
                  {apiError}
                </div>
              )}

              {!isLoading && !apiError && financialStatements.incomeStatement.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textMuted }}>
                  Enter a company ticker and click Load to view financial statements
                </div>
              )}

              {!isLoading && financialStatements.incomeStatement.length > 0 && (
                <div>
                  {/* Income Statement */}
                  <div style={{ padding: '12px', background: COLORS.bgSecondary, borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: COLORS.textPrimary }}>
                      INCOME STATEMENT
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: COLORS.bgTertiary }}>
                          <th style={{ padding: '8px', textAlign: 'left', position: 'sticky', left: 0, background: COLORS.bgTertiary, borderBottom: `1px solid ${COLORS.border}` }}>
                            Metric
                          </th>
                          {financialStatements.incomeStatement.slice(0, 5).map((stmt, i) => (
                            <th key={i} style={{ padding: '8px', textAlign: 'right', borderBottom: `1px solid ${COLORS.border}` }}>
                              {stmt.date}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFinancialRows.revenue && (
                          <tr>
                            <td style={{ padding: '8px', borderBottom: `1px solid ${COLORS.borderLight}`, position: 'sticky', left: 0, background: COLORS.bgPrimary }}>
                              Revenue
                            </td>
                            {financialStatements.incomeStatement.slice(0, 5).map((stmt, i) => (
                              <td key={i} style={{ padding: '8px', textAlign: 'right', fontFamily: 'Consolas, monospace', borderBottom: `1px solid ${COLORS.borderLight}` }}>
                                ${(stmt.revenue / 1e9).toFixed(2)}B
                              </td>
                            ))}
                          </tr>
                        )}
                        {selectedFinancialRows.netIncome && (
                          <tr>
                            <td style={{ padding: '8px', borderBottom: `1px solid ${COLORS.borderLight}`, position: 'sticky', left: 0, background: COLORS.bgPrimary }}>
                              Net Income
                            </td>
                            {financialStatements.incomeStatement.slice(0, 5).map((stmt, i) => (
                              <td key={i} style={{ padding: '8px', textAlign: 'right', fontFamily: 'Consolas, monospace', borderBottom: `1px solid ${COLORS.borderLight}` }}>
                                ${(stmt.netIncome / 1e9).toFixed(2)}B
                              </td>
                            ))}
                          </tr>
                        )}
                        {selectedFinancialRows.ebitda && (
                          <tr>
                            <td style={{ padding: '8px', borderBottom: `1px solid ${COLORS.borderLight}`, position: 'sticky', left: 0, background: COLORS.bgPrimary }}>
                              EBITDA
                            </td>
                            {financialStatements.incomeStatement.slice(0, 5).map((stmt, i) => (
                              <td key={i} style={{ padding: '8px', textAlign: 'right', fontFamily: 'Consolas, monospace', borderBottom: `1px solid ${COLORS.borderLight}` }}>
                                ${stmt.ebitda ? (stmt.ebitda / 1e9).toFixed(2) + 'B' : 'N/A'}
                              </td>
                            ))}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Balance Sheet */}
                  {financialStatements.balanceSheet.length > 0 && (
                    <>
                      <div style={{ padding: '12px', background: COLORS.bgSecondary, borderTop: `2px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: COLORS.textPrimary }}>
                          BALANCE SHEET
                        </div>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: COLORS.bgTertiary }}>
                              <th style={{ padding: '8px', textAlign: 'left', position: 'sticky', left: 0, background: COLORS.bgTertiary, borderBottom: `1px solid ${COLORS.border}` }}>
                                Metric
                              </th>
                              {financialStatements.balanceSheet.slice(0, 5).map((stmt, i) => (
                                <th key={i} style={{ padding: '8px', textAlign: 'right', borderBottom: `1px solid ${COLORS.border}` }}>
                                  {stmt.date}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedFinancialRows.totalAssets && (
                              <tr>
                                <td style={{ padding: '8px', borderBottom: `1px solid ${COLORS.borderLight}`, position: 'sticky', left: 0, background: COLORS.bgPrimary }}>
                                  Total Assets
                                </td>
                                {financialStatements.balanceSheet.slice(0, 5).map((stmt, i) => (
                                  <td key={i} style={{ padding: '8px', textAlign: 'right', fontFamily: 'Consolas, monospace', borderBottom: `1px solid ${COLORS.borderLight}` }}>
                                    ${(stmt.totalAssets / 1e9).toFixed(2)}B
                                  </td>
                                ))}
                              </tr>
                            )}
                            {selectedFinancialRows.totalDebt && (
                              <tr>
                                <td style={{ padding: '8px', borderBottom: `1px solid ${COLORS.borderLight}`, position: 'sticky', left: 0, background: COLORS.bgPrimary }}>
                                  Total Debt
                                </td>
                                {financialStatements.balanceSheet.slice(0, 5).map((stmt, i) => (
                                  <td key={i} style={{ padding: '8px', textAlign: 'right', fontFamily: 'Consolas, monospace', borderBottom: `1px solid ${COLORS.borderLight}` }}>
                                    ${(stmt.totalDebt / 1e9).toFixed(2)}B
                                  </td>
                                ))}
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Cash Flow */}
                  {financialStatements.cashFlow.length > 0 && selectedFinancialRows.operatingCashFlow && (
                    <>
                      <div style={{ padding: '12px', background: COLORS.bgSecondary, borderTop: `2px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: COLORS.textPrimary }}>
                          CASH FLOW STATEMENT
                        </div>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: COLORS.bgTertiary }}>
                              <th style={{ padding: '8px', textAlign: 'left', position: 'sticky', left: 0, background: COLORS.bgTertiary, borderBottom: `1px solid ${COLORS.border}` }}>
                                Metric
                              </th>
                              {financialStatements.cashFlow.slice(0, 5).map((stmt, i) => (
                                <th key={i} style={{ padding: '8px', textAlign: 'right', borderBottom: `1px solid ${COLORS.border}` }}>
                                  {stmt.date}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ padding: '8px', borderBottom: `1px solid ${COLORS.borderLight}`, position: 'sticky', left: 0, background: COLORS.bgPrimary }}>
                                Operating Cash Flow
                              </td>
                              {financialStatements.cashFlow.slice(0, 5).map((stmt, i) => (
                                <td key={i} style={{ padding: '8px', textAlign: 'right', fontFamily: 'Consolas, monospace', borderBottom: `1px solid ${COLORS.borderLight}` }}>
                                  ${(stmt.operatingCashFlow / 1e9).toFixed(2)}B
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Panel>
          </div>
        )}
                <span style={{ textAlign: 'right' }}>P/E</span>
                <span style={{ textAlign: 'right' }}>EV/EBITDA</span>
                <span style={{ textAlign: 'right' }}>ROE %</span>
              </div>
              {reportAssets.map((t) => {
                const d = STOCKS[t] || INDICES[t];
                if (!d) return null;
                return (
                  <div
                    key={t}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr repeat(6, 70px)',
                      gap: '4px',
                      padding: '8px 0',
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontWeight: 700,
                        fontSize: '11px',
                        color: COLORS.primary,
                      }}
                    >
                      {t}
                    </span>
                    <span
                      style={{ fontSize: '10px', color: COLORS.textSecondary }}
                    >
                      {d.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '10px',
                        textAlign: 'right',
                      }}
                    >
                      ${fmt(d.price, 2)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '10px',
                        textAlign: 'right',
                        color:
                          d.change >= 0 ? COLORS.positive : COLORS.negative,
                      }}
                    >
                      {fmtChg(d.change)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '10px',
                        textAlign: 'right',
                      }}
                    >
                      {d.marketCap ? `$${fmtLargeNum(d.marketCap)}` : '—'}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '10px',
                        textAlign: 'right',
                      }}
                    >
                      {d.pe ? fmt(d.pe, 1) : '—'}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '10px',
                        textAlign: 'right',
                      }}
                    >
                      {d.evEbitda ? fmt(d.evEbitda, 1) : '—'}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Consolas', monospace",
                        fontSize: '10px',
                        textAlign: 'right',
                      }}
                    >
                      {d.roe ? `${d.roe}%` : '—'}
                    </span>
                  </div>
                );
              })}
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: COLORS.bgSecondary,
                  borderRadius: '4px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    color: COLORS.textTertiary,
                    marginBottom: '8px',
                  }}
                >
                  EXPORT OPTIONS
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.bgPrimary,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileText size={14} /> Export CSV
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: 'none',
                      background: COLORS.positive,
                      color: COLORS.textInverse,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={14} /> Export Excel
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          background: COLORS.bgHeader,
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{ color: COLORS.primary, fontSize: '10px', fontWeight: 700 }}
          >
            IGEA OMNIS PRO v8.0
          </span>
          <span style={{ color: COLORS.textMuted, fontSize: '9px' }}>
            Institutional Market Intelligence Platform
          </span>
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: '8px' }}>
          Data: Yahoo Finance • FRED • Polymarket • Google Trends | For
          informational purposes only — Not financial advice
        </div>
      </footer>
      </div>
      {/* END ZOOMABLE CONTENT WRAPPER */}
    </div>
    </>
  );
}
