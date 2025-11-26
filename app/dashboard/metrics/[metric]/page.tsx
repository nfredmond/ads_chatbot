'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  MousePointerClick,
  Percent,
  Calendar,
  ChevronDown,
  Building2,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  AlertCircle,
  BarChart3,
  Eye,
  FileDown,
  FileSpreadsheet,
  HelpCircle
} from 'lucide-react';

// Tooltip definitions for marketing metrics
const METRIC_TOOLTIPS: Record<string, string> = {
  'Total Spend': 'The total amount of money spent on advertising across all campaigns and platforms.',
  'Revenue': 'Total revenue generated from ad campaigns. This is the value of conversions attributed to your ads.',
  'ROAS': 'Return on Ad Spend - how much revenue you earn for every dollar spent on ads. A 3x ROAS means $3 earned for every $1 spent.',
  'Conversions': 'The number of desired actions completed (purchases, sign-ups, leads, etc.) attributed to your ads.',
  'CTR': 'Click-Through Rate - the percentage of people who clicked your ad after seeing it. Higher is generally better.',
  'Avg CPC': 'Average Cost Per Click - the average amount you pay each time someone clicks on your ad.',
  'CPC': 'Cost Per Click - the amount paid for each click on your advertisement.',
  'Impressions': 'The number of times your ads were displayed to users, regardless of whether they clicked.',
  'Total Clicks': 'The total number of clicks your ads received across all campaigns.',
  'Conv. Rate': 'Conversion Rate - the percentage of clicks that resulted in a conversion. Higher rates indicate more effective landing pages.',
  'Spend': 'The amount of money spent on advertising for this client or campaign.',
  'Client': 'The business or account receiving advertising services.',
};

// Tooltip Component
function InfoTooltip({ text }: { text: string }) {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="ml-1 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
        aria-label="More information"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2 text-xs text-gray-200 bg-gray-900 border border-white/20 rounded-lg shadow-xl pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Table Header with Tooltip
function TableHeader({ label, align = 'right', className = '' }: { label: string; align?: 'left' | 'right'; className?: string }) {
  const tooltip = METRIC_TOOLTIPS[label];
  return (
    <th className={`pb-3 ${align === 'left' ? 'pr-4' : 'px-4'} text-${align} ${className}`}>
      <span className="inline-flex items-center">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
    </th>
  );
}
import { ExportDropdown } from '@/components/ExportButtons';
import {
  generateMetricPDF,
  downloadPDF,
  downloadExcel,
  type CustomerData,
} from '@/lib/reports/generator';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  Cell,
} from 'recharts';

// Date range types and presets
type DatePreset = 'last7' | 'last30' | 'lastQuarter' | 'thisQuarter' | 'ytd' | 'lastYear' | 'custom';

interface DateRange {
  startDate: string;
  endDate: string;
}

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'last7', label: 'Last 7 Days' },
  { id: 'last30', label: 'Last 30 Days' },
  { id: 'thisQuarter', label: 'This Quarter' },
  { id: 'lastQuarter', label: 'Last Quarter' },
  { id: 'ytd', label: 'Year to Date' },
  { id: 'lastYear', label: 'Last Year' },
  { id: 'custom', label: 'Custom Range' },
];

function getDateRangeFromPreset(preset: DatePreset): DateRange {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  
  switch (preset) {
    case 'last7': {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      return { startDate: start.toISOString().split('T')[0], endDate };
    }
    case 'last30': {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      return { startDate: start.toISOString().split('T')[0], endDate };
    }
    case 'thisQuarter': {
      const quarter = Math.floor(today.getMonth() / 3);
      const start = new Date(today.getFullYear(), quarter * 3, 1);
      return { startDate: start.toISOString().split('T')[0], endDate };
    }
    case 'lastQuarter': {
      const quarter = Math.floor(today.getMonth() / 3);
      const startMonth = (quarter - 1) * 3;
      const year = startMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
      const adjustedStartMonth = startMonth < 0 ? 9 : startMonth;
      const start = new Date(year, adjustedStartMonth, 1);
      const end = new Date(year, adjustedStartMonth + 3, 0);
      return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
    }
    case 'ytd': {
      const start = new Date(today.getFullYear(), 0, 1);
      return { startDate: start.toISOString().split('T')[0], endDate };
    }
    case 'lastYear': {
      const start = new Date(today.getFullYear() - 1, 0, 1);
      const end = new Date(today.getFullYear() - 1, 11, 31);
      return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
    }
    default:
      return { startDate: endDate, endDate };
  }
}

interface CustomerOption {
  id: string;
  name: string;
  platform: string;
}

interface CustomerMetrics {
  customer_name: string;
  customer_id: string;
  spend: number;
  revenue: number;
  conversions: number;
  clicks: number;
  impressions: number;
  ctr: number;
  cpc: number;
  convRate: number;
  roas: number;
  [key: string]: string | number; // Index signature for Recharts
}

interface MetricData {
  metrics: {
    totalSpend: number;
    totalConversions: number;
    averageROAS: number;
    totalImpressions: number;
    totalClicks: number;
    totalRevenue: number;
    ctr: number;
    cpc: number;
    convRate: number;
  };
  performanceData: Array<{
    date: string;
    spend: number;
    revenue: number;
    clicks: number;
    conversions: number;
  }>;
  customerMetrics: CustomerMetrics[];
  availableCustomers: CustomerOption[];
}

const METRIC_CONFIG: Record<string, {
  title: string;
  description: string;
  icon: any;
  color: string;
  dataKey: string;
  format: (value: number) => string;
  sortKey: keyof CustomerMetrics;
  compareKey?: keyof CustomerMetrics;
  benchmark?: { good: number; excellent: number };
}> = {
  spend: {
    title: 'Total Spend Analysis',
    description: 'Detailed breakdown of advertising spend across all clients',
    icon: DollarSign,
    color: 'blue',
    dataKey: 'spend',
    format: (v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    sortKey: 'spend',
    compareKey: 'revenue',
  },
  revenue: {
    title: 'Revenue Analysis',
    description: 'Revenue generated from advertising campaigns',
    icon: TrendingUp,
    color: 'emerald',
    dataKey: 'revenue',
    format: (v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    sortKey: 'revenue',
    compareKey: 'spend',
  },
  roas: {
    title: 'ROAS Analysis',
    description: 'Return on Ad Spend performance by client',
    icon: Target,
    color: 'purple',
    dataKey: 'roas',
    format: (v) => `${v.toFixed(2)}x`,
    sortKey: 'roas',
    benchmark: { good: 2, excellent: 4 },
  },
  conversions: {
    title: 'Conversions Analysis',
    description: 'Conversion performance and trends across campaigns',
    icon: MousePointerClick,
    color: 'amber',
    dataKey: 'conversions',
    format: (v) => v.toLocaleString(),
    sortKey: 'conversions',
  },
  ctr: {
    title: 'Click-Through Rate Analysis',
    description: 'CTR performance and engagement metrics',
    icon: Percent,
    color: 'cyan',
    dataKey: 'clicks',
    format: (v) => `${v.toFixed(2)}%`,
    sortKey: 'ctr',
    benchmark: { good: 2, excellent: 5 },
  },
  cpc: {
    title: 'Cost Per Click Analysis',
    description: 'CPC efficiency across clients and campaigns',
    icon: DollarSign,
    color: 'pink',
    dataKey: 'spend',
    format: (v) => `$${v.toFixed(2)}`,
    sortKey: 'cpc',
  },
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

export default function MetricDetailPage() {
  const params = useParams();
  const router = useRouter();
  const metricSlug = params.metric as string;
  
  const [data, setData] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Filter states - load from sessionStorage
  const [datePreset, setDatePreset] = useState<DatePreset>('last30');
  const [customDateRange, setCustomDateRange] = useState<DateRange>(() => getDateRangeFromPreset('last30'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);
  
  const [availableCustomers, setAvailableCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const customerPickerRef = useRef<HTMLDivElement>(null);

  // Load filter state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('dashboardFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.datePreset) setDatePreset(parsed.datePreset);
        if (parsed.customDateRange) setCustomDateRange(parsed.customDateRange);
        if (parsed.selectedCustomers) setSelectedCustomers(parsed.selectedCustomers);
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);

  // Save filter state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('dashboardFilters', JSON.stringify({
      datePreset,
      customDateRange,
      selectedCustomers,
    }));
  }, [datePreset, customDateRange, selectedCustomers]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (customerPickerRef.current && !customerPickerRef.current.contains(event.target as Node)) {
        setShowCustomerPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const demoModeEnabled = localStorage.getItem('demo_mode') === 'true';
      setIsDemoMode(demoModeEnabled);
      
      if (demoModeEnabled) {
        // Demo data
        setData({
          metrics: {
            totalSpend: 41340,
            totalConversions: 694,
            averageROAS: 3.7,
            totalImpressions: 2850000,
            totalClicks: 48500,
            totalRevenue: 152958,
            ctr: 1.7,
            cpc: 0.85,
            convRate: 1.43,
          },
          performanceData: [
            { date: '10/15', spend: 2800, revenue: 8400, clicks: 3200, conversions: 45 },
            { date: '10/17', spend: 3200, revenue: 9600, clicks: 3800, conversions: 52 },
            { date: '10/19', spend: 2900, revenue: 10200, clicks: 3400, conversions: 58 },
            { date: '10/21', spend: 3100, revenue: 11500, clicks: 3600, conversions: 61 },
            { date: '10/23', spend: 3400, revenue: 12100, clicks: 4000, conversions: 68 },
            { date: '10/25', spend: 3000, revenue: 11800, clicks: 3500, conversions: 64 },
            { date: '10/27', spend: 3500, revenue: 12500, clicks: 4100, conversions: 72 },
            { date: '10/29', spend: 2800, revenue: 10800, clicks: 3300, conversions: 55 },
          ],
          customerMetrics: [
            { customer_name: 'Demo Client A', customer_id: '1', spend: 15000, revenue: 60000, conversions: 250, clicks: 12000, impressions: 400000, ctr: 3.0, cpc: 1.25, convRate: 2.08, roas: 4.0 },
            { customer_name: 'Demo Client B', customer_id: '2', spend: 12000, revenue: 42000, conversions: 180, clicks: 10000, impressions: 350000, ctr: 2.86, cpc: 1.20, convRate: 1.80, roas: 3.5 },
            { customer_name: 'Demo Client C', customer_id: '3', spend: 8000, revenue: 28000, conversions: 120, clicks: 8000, impressions: 280000, ctr: 2.86, cpc: 1.00, convRate: 1.50, roas: 3.5 },
          ],
          availableCustomers: [],
        });
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
      params.set('startDate', range.startDate);
      params.set('endDate', range.endDate);
      if (selectedCustomers.length > 0) {
        params.set('customers', selectedCustomers.join(','));
      }
      
      const response = await fetch(`/api/data?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        
        if (result.availableCustomers?.length > 0) {
          setAvailableCustomers(result.availableCustomers);
        }
        
        setData({
          metrics: {
            totalSpend: result.metrics?.totalSpend || 0,
            totalConversions: result.metrics?.totalConversions || 0,
            averageROAS: result.metrics?.averageROAS || 0,
            totalImpressions: result.metrics?.totalImpressions || 0,
            totalClicks: result.metrics?.totalClicks || 0,
            totalRevenue: result.metrics?.totalRevenue || 0,
            ctr: result.metrics?.totalImpressions > 0 
              ? (result.metrics.totalClicks / result.metrics.totalImpressions) * 100 
              : 0,
            cpc: result.metrics?.totalClicks > 0 
              ? result.metrics.totalSpend / result.metrics.totalClicks 
              : 0,
            convRate: result.metrics?.totalClicks > 0 
              ? (result.metrics.totalConversions / result.metrics.totalClicks) * 100 
              : 0,
          },
          performanceData: result.performanceData || [],
          customerMetrics: result.customerMetrics || [],
          availableCustomers: result.availableCustomers || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [datePreset, customDateRange, selectedCustomers]);

  const config = METRIC_CONFIG[metricSlug];
  
  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-gray-400">Metric not found</p>
        <Link href="/dashboard" className="mt-4 text-purple-400 hover:text-purple-300">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-gray-400">No data available</p>
        <Link href="/dashboard" className="mt-4 text-purple-400 hover:text-purple-300">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const { metrics, performanceData, customerMetrics } = data;
  const Icon = config.icon;

  // Sort customers by the metric's sort key
  const sortedCustomers = [...customerMetrics].sort((a, b) => {
    const aVal = a[config.sortKey] as number;
    const bVal = b[config.sortKey] as number;
    // For CPC, lower is better
    if (config.sortKey === 'cpc') return aVal - bVal;
    return bVal - aVal;
  });

  // Export handlers
  const handleExportPDF = () => {
    const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
    const totalValue = (() => {
      switch (metricSlug) {
        case 'spend': return `$${metrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        case 'revenue': return `$${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        case 'roas': return `${metrics.averageROAS.toFixed(2)}x`;
        case 'conversions': return metrics.totalConversions.toLocaleString();
        case 'ctr': return `${metrics.ctr.toFixed(2)}%`;
        case 'cpc': return `$${metrics.cpc.toFixed(2)}`;
        default: return '0';
      }
    })();
    
    const doc = generateMetricPDF(
      config.title,
      config.description,
      totalValue,
      sortedCustomers as CustomerData[],
      { start: range.startDate, end: range.endDate },
      config.sortKey as keyof CustomerData
    );
    downloadPDF(doc, `${metricSlug}-analysis-${range.startDate}-to-${range.endDate}`);
  };

  const handleExportExcel = () => {
    const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      [`${config.title}`],
      [`Report Period: ${range.startDate} - ${range.endDate}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['Summary Metrics'],
      ['Metric', 'Value'],
      ['Total Spend', metrics.totalSpend],
      ['Total Revenue', metrics.totalRevenue],
      ['ROAS', metrics.averageROAS],
      ['Conversions', metrics.totalConversions],
      ['CTR (%)', metrics.ctr],
      ['CPC', metrics.cpc],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    // Client rankings sheet
    const headers = ['Rank', 'Client', config.title, 'Spend', 'Revenue', 'ROAS', 'Conversions', 'CTR (%)', 'CPC'];
    const clientData = sortedCustomers.map((c, i) => [
      i + 1,
      c.customer_name,
      c[config.sortKey],
      c.spend,
      c.revenue,
      c.roas,
      c.conversions,
      c.ctr,
      c.cpc,
    ]);
    const clientSheet = XLSX.utils.aoa_to_sheet([headers, ...clientData]);
    XLSX.utils.book_append_sheet(wb, clientSheet, 'Client Rankings');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${metricSlug}-analysis-${range.startDate}-to-${range.endDate}.xlsx`);
  };

  // Calculate metric-specific totals
  const getMetricValue = () => {
    switch (metricSlug) {
      case 'spend': return metrics.totalSpend;
      case 'revenue': return metrics.totalRevenue;
      case 'roas': return metrics.averageROAS;
      case 'conversions': return metrics.totalConversions;
      case 'ctr': return metrics.ctr;
      case 'cpc': return metrics.cpc;
      default: return 0;
    }
  };

  const getClientMetricValue = (customer: CustomerMetrics) => {
    switch (metricSlug) {
      case 'spend': return customer.spend;
      case 'revenue': return customer.revenue;
      case 'roas': return customer.roas;
      case 'conversions': return customer.conversions;
      case 'ctr': return customer.ctr;
      case 'cpc': return customer.cpc;
      default: return 0;
    }
  };

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === 'custom') {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
      const range = getDateRangeFromPreset(preset);
      setCustomDateRange(range);
      setShowDatePicker(false);
    }
  };

  const handleCustomDateApply = () => {
    setShowDatePicker(false);
  };

  const handleCustomerToggle = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
    );
  };

  const getDatePresetLabel = () => {
    if (datePreset === 'custom') {
      return `${customDateRange.startDate} - ${customDateRange.endDate}`;
    }
    return DATE_PRESETS.find(p => p.id === datePreset)?.label || 'Last 30 Days';
  };

  const getCustomerFilterLabel = () => {
    if (selectedCustomers.length === 0) return 'All Customers';
    if (selectedCustomers.length === 1) {
      const customer = availableCustomers.find(c => c.id === selectedCustomers[0]);
      return customer?.name || '1 Customer';
    }
    return `${selectedCustomers.length} Customers`;
  };

  const customersByPlatform = availableCustomers.reduce((acc, customer) => {
    if (!acc[customer.platform]) acc[customer.platform] = [];
    acc[customer.platform].push(customer);
    return acc;
  }, {} as Record<string, CustomerOption[]>);

  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
    pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400',
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-medium text-emerald-400">Demo Mode Active</p>
              <p className="text-sm text-gray-400">Viewing sample data</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[config.color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-gray-400 text-sm">{config.description}</p>
          </div>
        </div>
        
        {/* Export & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export */}
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            disabled={sortedCustomers.length === 0}
          />

          {/* Date Filter */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{getDatePresetLabel()}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 w-64 p-3 rounded-xl bg-gray-900 border border-white/10 shadow-xl z-50">
                <div className="space-y-1 mb-3">
                  {DATE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleDatePresetChange(preset.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        datePreset === preset.id ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {showCustomDates && (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                      />
                    </div>
                    <button onClick={handleCustomDateApply} className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium">
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Filter */}
          {!isDemoMode && availableCustomers.length > 0 && (
            <div className="relative" ref={customerPickerRef}>
              <button
                onClick={() => setShowCustomerPicker(!showCustomerPicker)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
              >
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>{getCustomerFilterLabel()}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showCustomerPicker && (
                <div className="absolute top-full right-0 mt-2 w-80 p-3 rounded-xl bg-gray-900 border border-white/10 shadow-xl z-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Filter by Client</span>
                    {selectedCustomers.length > 0 && (
                      <button onClick={() => setSelectedCustomers([])} className="text-xs text-purple-400 hover:text-purple-300">Clear</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {Object.entries(customersByPlatform).map(([platform, customers]) => (
                      <div key={platform}>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 px-1">{platform}</div>
                        {customers.map(customer => (
                          <label key={customer.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={() => handleCustomerToggle(customer.id)}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600"
                            />
                            <span className="text-sm truncate">{customer.name}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Total Metric Value */}
      <div className={`p-6 rounded-xl bg-gradient-to-br ${colorClasses[config.color]} border`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">Total {config.title.replace(' Analysis', '')}</p>
            <p className="text-4xl font-bold">{config.format(getMetricValue())}</p>
          </div>
          <Icon className="w-12 h-12 opacity-50" />
        </div>
      </div>

      {/* Trend Chart */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">{config.title.replace(' Analysis', '')} Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id={`gradient-${metricSlug}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => 
              metricSlug === 'spend' || metricSlug === 'revenue' ? `$${(v/1000).toFixed(0)}k` : v.toLocaleString()
            } />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              formatter={(value: number) => [config.format(value), config.title.replace(' Analysis', '')]}
            />
            <Area 
              type="monotone" 
              dataKey={config.dataKey} 
              stroke={COLORS[0]} 
              strokeWidth={2}
              fill={`url(#gradient-${metricSlug})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Client Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold">Top Performers</h3>
          </div>
          <div className="space-y-3">
            {sortedCustomers.slice(0, 5).map((customer, i) => (
              <Link
                key={customer.customer_id}
                href={`/dashboard/clients/${customer.customer_id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${i < 3 ? 'text-emerald-400' : 'text-gray-400'}`}>#{i + 1}</span>
                  <div>
                    <p className="font-medium">{customer.customer_name}</p>
                    <p className="text-sm text-gray-400">${customer.spend.toLocaleString()} spend</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{config.format(getClientMetricValue(customer))}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bar Chart Comparison */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="font-semibold mb-4">{config.title.replace(' Analysis', '')} by Client</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sortedCustomers.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" fontSize={11} tickFormatter={(v) => 
                metricSlug === 'spend' || metricSlug === 'revenue' ? `$${(v/1000).toFixed(0)}k` : v.toString()
              } />
              <YAxis type="category" dataKey="customer_name" stroke="#9ca3af" fontSize={10} width={100} tick={{ width: 90 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value: number) => [config.format(value), config.title.replace(' Analysis', '')]}
              />
              <Bar dataKey={config.sortKey} radius={[0, 4, 4, 0]}>
                {sortedCustomers.slice(0, 8).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Client Table */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All Clients - {config.title.replace(' Analysis', '')}</h3>
          <span className="text-sm text-gray-400">{sortedCustomers.length} clients</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-white/10">
                <th className="pb-3 pr-4">
                  <span className="inline-flex items-center">
                    Rank
                    <InfoTooltip text="Position based on the selected metric - lower rank is better." />
                  </span>
                </th>
                <TableHeader label="Client" align="left" />
                <th className="pb-3 px-4 text-right">
                  <span className="inline-flex items-center justify-end">
                    {config.title.replace(' Analysis', '')}
                    {METRIC_TOOLTIPS[config.title.replace(' Analysis', '')] && 
                      <InfoTooltip text={METRIC_TOOLTIPS[config.title.replace(' Analysis', '')] || ''} />
                    }
                  </span>
                </th>
                <TableHeader label="Spend" />
                <TableHeader label="Revenue" />
                <TableHeader label="ROAS" />
                <TableHeader label="Conversions" />
                <TableHeader label="CTR" className="pl-4" />
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.map((customer, i) => (
                <tr key={customer.customer_id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 pr-4">
                    <span className={`font-bold ${i < 3 ? 'text-emerald-400' : 'text-gray-500'}`}>#{i + 1}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <Link 
                      href={`/dashboard/clients/${customer.customer_id}`}
                      className="font-medium hover:text-purple-400 transition-colors"
                    >
                      {customer.customer_name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm font-bold">{config.format(getClientMetricValue(customer))}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm">${customer.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm">${customer.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono text-sm ${customer.roas >= 3 ? 'text-emerald-400' : customer.roas >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                      {customer.roas.toFixed(1)}x
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm">{customer.conversions.toLocaleString()}</td>
                  <td className="py-3 pl-4 text-right font-mono text-sm">{customer.ctr.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights for this Metric */}
      {config.benchmark && (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Performance Benchmarks</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 mb-1">Below Average</p>
              <p className="text-xl font-bold">
                {sortedCustomers.filter(c => getClientMetricValue(c) < config.benchmark!.good).length} clients
              </p>
              <p className="text-xs text-gray-400 mt-1">&lt; {config.format(config.benchmark.good)}</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-400 mb-1">Good</p>
              <p className="text-xl font-bold">
                {sortedCustomers.filter(c => getClientMetricValue(c) >= config.benchmark!.good && getClientMetricValue(c) < config.benchmark!.excellent).length} clients
              </p>
              <p className="text-xs text-gray-400 mt-1">{config.format(config.benchmark.good)} - {config.format(config.benchmark.excellent)}</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-400 mb-1">Excellent</p>
              <p className="text-xl font-bold">
                {sortedCustomers.filter(c => getClientMetricValue(c) >= config.benchmark!.excellent).length} clients
              </p>
              <p className="text-xs text-gray-400 mt-1">≥ {config.format(config.benchmark.excellent)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
