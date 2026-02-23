'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  DollarSign, 
  MousePointerClick, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Lightbulb,
  AlertTriangle,
  Check,
  Settings,
  Link2,
  Calendar,
  ChevronDown,
  Building2,
  X,
  Target,
  Percent,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Zap,
  Award,
  AlertCircle,
  FileDown,
  FileSpreadsheet,
  HelpCircle,
  Minimize2,
  Maximize2
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
  generateDashboardPDF,
  generateDashboardExcel,
  downloadPDF,
  downloadExcel,
  type ReportMetrics,
  type CustomerData,
  type PerformanceData as ReportPerformanceData,
} from '@/lib/reports/generator';
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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';

// Date range presets
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

interface AccountOption {
  id: string;
  name: string;
  platform: string;
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

interface DashboardData {
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
    spendChange: number;
    conversionsChange: number;
    roasChange: number;
    impressionsChange: number;
  };
  performanceData: Array<{
    date: string;
    spend: number;
    revenue: number;
    clicks: number;
    conversions: number;
  }>;
  platformData: Array<{
    platform: string;
    spend: number;
    conversions: number;
  }>;
  customerMetrics: CustomerMetrics[];
  connectedPlatforms: {
    google: boolean;
    meta: boolean;
    linkedin: boolean;
  };
  insights: Array<{
    id: string;
    title: string;
    description: string;
    type: 'opportunity' | 'warning' | 'trend' | 'success';
    platform: string;
    metric?: string;
    value?: string;
  }>;
  metaSummary?: {
    totalCampaigns: number;
    activeCampaigns: number;
    duplicateNameCount: number;
    duplicateCampaigns: Array<{
      customerName: string;
      campaignName: string;
      count: number;
    }>;
  };
}

// Comprehensive demo data with realistic client portfolio
const DEMO_DATA: DashboardData = {
  metrics: {
    totalSpend: 107712.75,
    totalConversions: 11032,
    averageROAS: 2.13,
    totalImpressions: 8424573,
    totalClicks: 179607,
    totalRevenue: 229486.50,
    ctr: 2.13,
    cpc: 0.60,
    convRate: 6.14,
    spendChange: 8.2,
    conversionsChange: 15.4,
    roasChange: 0.5,
    impressionsChange: 12.1,
  },
  performanceData: [
    { date: '10/29', spend: 3200, revenue: 6800, clicks: 5400, conversions: 320 },
    { date: '10/31', spend: 3500, revenue: 7400, clicks: 5800, conversions: 355 },
    { date: '11/02', spend: 3100, revenue: 6600, clicks: 5200, conversions: 310 },
    { date: '11/04', spend: 3800, revenue: 8100, clicks: 6100, conversions: 380 },
    { date: '11/06', spend: 3400, revenue: 7200, clicks: 5600, conversions: 345 },
    { date: '11/08', spend: 3900, revenue: 8300, clicks: 6300, conversions: 395 },
    { date: '11/10', spend: 3600, revenue: 7700, clicks: 5900, conversions: 365 },
    { date: '11/12', spend: 4100, revenue: 8700, clicks: 6600, conversions: 420 },
    { date: '11/14', spend: 3700, revenue: 7900, clicks: 6000, conversions: 375 },
    { date: '11/16', spend: 4200, revenue: 8900, clicks: 6800, conversions: 430 },
    { date: '11/18', spend: 3800, revenue: 8100, clicks: 6200, conversions: 390 },
    { date: '11/20', spend: 4400, revenue: 9400, clicks: 7100, conversions: 450 },
    { date: '11/22', spend: 4000, revenue: 8500, clicks: 6500, conversions: 410 },
    { date: '11/24', spend: 4500, revenue: 9600, clicks: 7300, conversions: 465 },
  ],
  platformData: [
    { platform: 'Google Ads', spend: 85500, conversions: 8850 },
    { platform: 'Meta Ads', spend: 15200, conversions: 1575 },
    { platform: 'LinkedIn Ads', spend: 7012.75, conversions: 607 },
  ],
  customerMetrics: [
    { customer_name: 'Velocity Sports Agency', customer_id: 'demo-1', spend: 93518.47, revenue: 448565.87, conversions: 10157, clicks: 136124, impressions: 7874042, ctr: 1.73, cpc: 0.69, convRate: 7.46, roas: 4.80 },
    { customer_name: 'Pinnacle Tech Solutions', customer_id: 'demo-2', spend: 2867.56, revenue: 281.36, conversions: 281, clicks: 4198, impressions: 56443, ctr: 7.44, cpc: 0.68, convRate: 6.69, roas: 0.10 },
    { customer_name: 'Summit Industrial', customer_id: 'demo-3', spend: 2227.83, revenue: 77.00, conversions: 65, clicks: 483, impressions: 7334, ctr: 6.59, cpc: 4.61, convRate: 13.46, roas: 0.03 },
    { customer_name: 'Horizon Wellness', customer_id: 'demo-4', spend: 1605.38, revenue: 715.00, conversions: 22, clicks: 390, impressions: 9959, ctr: 3.92, cpc: 4.12, convRate: 5.64, roas: 0.45 },
    { customer_name: 'Atlas Creative Studio', customer_id: 'demo-5', spend: 1146.11, revenue: 7471.00, conversions: 133, clicks: 444, impressions: 10443, ctr: 4.25, cpc: 2.58, convRate: 29.95, roas: 6.52 },
    { customer_name: 'Catalyst Marketing Co', customer_id: 'demo-6', spend: 983.79, revenue: 3400.00, conversions: 36, clicks: 144, impressions: 1143, ctr: 12.60, cpc: 6.83, convRate: 25.00, roas: 3.46 },
    { customer_name: 'Nexus Machinery', customer_id: 'demo-7', spend: 968.36, revenue: 555.00, conversions: 63, clicks: 105, impressions: 431, ctr: 24.36, cpc: 9.22, convRate: 60.00, roas: 0.57 },
    { customer_name: 'Evergreen Landscaping', customer_id: 'demo-8', spend: 2757.80, revenue: 12350.00, conversions: 276, clicks: 34963, impressions: 426213, ctr: 8.20, cpc: 0.08, convRate: 0.79, roas: 4.48 },
    { customer_name: 'Quantum Analytics', customer_id: 'demo-9', spend: 1119.37, revenue: 4830.00, conversions: 141, clicks: 800, impressions: 10443, ctr: 7.66, cpc: 1.40, convRate: 17.63, roas: 4.32 },
    { customer_name: 'Sterling Financial', customer_id: 'demo-10', spend: 584.87, revenue: 1200.00, conversions: 4, clicks: 956, impressions: 28122, ctr: 3.40, cpc: 0.61, convRate: 0.42, roas: 2.05 },
    { customer_name: 'Pacific Coast Imports', customer_id: 'demo-11', spend: 2109.49, revenue: 8500.00, conversions: 85, clicks: 2198, impressions: 56443, ctr: 3.89, cpc: 0.96, convRate: 3.87, roas: 4.03 },
    { customer_name: 'Northern Lights Events', customer_id: 'demo-12', spend: 823.72, revenue: 2541.27, conversions: 69, clicks: 802, impressions: 43556, ctr: 1.84, cpc: 1.03, convRate: 8.60, roas: 3.09 },
  ],
  connectedPlatforms: {
    google: true,
    meta: true,
    linkedin: true,
  },
  insights: [
    {
      id: '1',
      title: 'Velocity Sports Agency Excelling',
      description: 'Top client with 4.8x ROAS driving 87% of total revenue. Consider this as benchmark for other clients.',
      type: 'success' as const,
      platform: 'Google Ads',
    },
    {
      id: '2',
      title: 'Atlas Creative Studio Outstanding',
      description: '6.52x ROAS with 29.95% conversion rate - exceptional performance. Analyze their campaign structure.',
      type: 'opportunity' as const,
      platform: 'Google Ads',
    },
    {
      id: '3',
      title: 'Summit Industrial Needs Review',
      description: 'Only 0.03x ROAS despite $2,227 spend. Consider pausing or restructuring campaigns.',
      type: 'warning' as const,
      platform: 'Google Ads',
    },
    {
      id: '4',
      title: 'High CTR on Nexus Machinery',
      description: '24.36% CTR indicates strong ad relevance but low ROAS. Check landing page conversion.',
      type: 'trend' as const,
      platform: 'Google Ads',
    },
  ],
  metaSummary: {
    totalCampaigns: 80,
    activeCampaigns: 7,
    duplicateNameCount: 6,
    duplicateCampaigns: [
      { customerName: 'UncommonGood', campaignName: '[03/08/2022] Promoting https://uncommongood.io/fundraisers/standwithukraine', count: 2 },
      { customerName: 'UncommonGood', campaignName: '[03/01/2022] Promoting https://uncommongood.io/sweepstakes/glamping-safari-style', count: 2 },
      { customerName: 'Borderlands Bakery', campaignName: 'Abandoned Cart Retargetting', count: 2 },
    ],
  },
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasRealData, setHasRealData] = useState(false);
  
  // Filter states
  const [datePreset, setDatePreset] = useState<DatePreset>('last30');
  const [customDateRange, setCustomDateRange] = useState<DateRange>(() => getDateRangeFromPreset('last30'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);
  
  // Account filter states
  const [availableAccounts, setAvailableAccounts] = useState<AccountOption[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  
  // Customer filter states
  const [availableCustomers, setAvailableCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showMetaDuplicates, setShowMetaDuplicates] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const accountPickerRef = useRef<HTMLDivElement>(null);
  const customerPickerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (accountPickerRef.current && !accountPickerRef.current.contains(event.target as Node)) {
        setShowAccountPicker(false);
      }
      if (customerPickerRef.current && !customerPickerRef.current.contains(event.target as Node)) {
        setShowCustomerPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async (forceDemo: boolean, dateRange?: DateRange, accounts?: string[], customers?: string[]) => {
    try {
      if (forceDemo) {
        setIsDemoMode(true);
        setData(DEMO_DATA);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      const range = dateRange || getDateRangeFromPreset(datePreset);
      params.set('startDate', range.startDate);
      params.set('endDate', range.endDate);
      if (accounts && accounts.length > 0) {
        params.set('accounts', accounts.join(','));
      }
      if (customers && customers.length > 0) {
        params.set('customers', customers.join(','));
      }
      
      const response = await fetch(`/api/data?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        
        const hasData = result.hasData || 
                        result.metrics?.totalSpend > 0 || 
                        result.metrics?.totalConversions > 0 ||
                        result.metrics?.totalImpressions > 0;
        
        setHasRealData(hasData);
        
        if (result.availableAccounts?.length > 0) {
          setAvailableAccounts(result.availableAccounts);
        }
        
        if (result.availableCustomers?.length > 0) {
          setAvailableCustomers(result.availableCustomers);
        }
        
        if (hasData) {
          const allCampaigns = Array.isArray(result.campaigns) ? result.campaigns : [];
          const metaCampaigns = allCampaigns.filter((c: any) => c.platform === 'meta_ads');
          const activeMetaCampaigns = metaCampaigns.filter((c: any) => String(c.status || '').toLowerCase() === 'active');
          const duplicateMetaKeys = new Set<string>();
          const seenMetaKeys = new Set<string>();
          const duplicateMetaMap = new Map<string, { customerName: string; campaignName: string; count: number }>();
          for (const campaign of metaCampaigns) {
            const customerName = campaign.customer_name || campaign.customer_id || 'Unknown';
            const campaignName = String(campaign.campaign_name || '').trim();
            const key = `${customerName}::${campaignName.toLowerCase()}`;
            if (seenMetaKeys.has(key)) {
              duplicateMetaKeys.add(key);
              const existing = duplicateMetaMap.get(key) || { customerName, campaignName, count: 1 };
              existing.count += 1;
              duplicateMetaMap.set(key, existing);
            } else {
              seenMetaKeys.add(key);
            }
          }
          const duplicateMetaCampaigns = Array.from(duplicateMetaMap.values()).sort((a, b) => b.count - a.count || a.customerName.localeCompare(b.customerName));

          const dashboardData: DashboardData = {
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
              spendChange: result.metrics?.spendChange || 0,
              conversionsChange: result.metrics?.conversionsChange || 0,
              roasChange: result.metrics?.roasChange || 0,
              impressionsChange: result.metrics?.impressionsChange || 0,
            },
            performanceData: result.performanceData || [],
            platformData: result.platformData || [],
            customerMetrics: result.customerMetrics || [],
            connectedPlatforms: result.connectedPlatforms || { google: false, meta: false, linkedin: false },
            insights: result.insights || [],
            metaSummary: {
              totalCampaigns: metaCampaigns.length,
              activeCampaigns: activeMetaCampaigns.length,
              duplicateNameCount: duplicateMetaKeys.size,
              duplicateCampaigns: duplicateMetaCampaigns,
            },
          };
          setData(dashboardData);
        } else {
          setData(null);
        }
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const demoModeEnabled = localStorage.getItem('demo_mode') === 'true';
    setIsDemoMode(demoModeEnabled);
    fetchData(demoModeEnabled, getDateRangeFromPreset(datePreset), selectedAccounts, selectedCustomers);
  }, []);

  // Filter handlers
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === 'custom') {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
      const range = getDateRangeFromPreset(preset);
      setCustomDateRange(range);
      setShowDatePicker(false);
      fetchData(isDemoMode, range, selectedAccounts, selectedCustomers);
    }
  };

  const handleCustomDateApply = () => {
    setShowDatePicker(false);
    fetchData(isDemoMode, customDateRange, selectedAccounts, selectedCustomers);
  };

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId]
    );
  };

  const applyAccountFilter = () => {
    setShowAccountPicker(false);
    fetchData(isDemoMode, datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset), selectedAccounts, selectedCustomers);
  };

  const clearAccountFilter = () => {
    setSelectedAccounts([]);
    setShowAccountPicker(false);
    fetchData(isDemoMode, datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset), [], selectedCustomers);
  };

  const handleCustomerToggle = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
    );
  };

  const applyCustomerFilter = () => {
    setShowCustomerPicker(false);
    fetchData(isDemoMode, datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset), selectedAccounts, selectedCustomers);
  };

  const clearCustomerFilter = () => {
    setSelectedCustomers([]);
    setShowCustomerPicker(false);
    fetchData(isDemoMode, datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset), selectedAccounts, []);
  };

  const getDatePresetLabel = () => {
    if (datePreset === 'custom') {
      return `${customDateRange.startDate} - ${customDateRange.endDate}`;
    }
    return DATE_PRESETS.find(p => p.id === datePreset)?.label || 'Last 30 Days';
  };

  const getAccountFilterLabel = () => {
    if (selectedAccounts.length === 0) return 'All Accounts';
    if (selectedAccounts.length === 1) {
      const account = availableAccounts.find(a => a.id === selectedAccounts[0]);
      return account?.name || '1 Account';
    }
    return `${selectedAccounts.length} Accounts`;
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

  const formatCurrency = (num: number) => `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const formatNumber = (num: number, decimals: number = 0) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  const formatPercent = (num: number) => `${num.toFixed(2)}%`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Empty state
  if (!isDemoMode && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Marketing Analytics" width={48} height={48} className="rounded-lg" />
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">Connect your ad platforms to get started</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
            <Link2 className="w-12 h-12 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Data Connected</h2>
          <p className="text-gray-400 text-center max-w-md mb-8">
            Connect your advertising platforms to see your campaign performance, analytics, and AI-powered insights.
          </p>
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Connect Ad Platforms
          </Link>
        </div>
      </div>
    );
  }

  const displayData = data!;
  const { metrics, performanceData, platformData, customerMetrics, connectedPlatforms, insights } = displayData;

  // Sort customers by spend for rankings
  const sortedCustomers = [...(customerMetrics || [])].sort((a, b) => b.spend - a.spend);
  const topPerformers = sortedCustomers.filter(c => c.roas > metrics.averageROAS).slice(0, 3);
  const needsAttention = sortedCustomers.filter(c => c.roas < metrics.averageROAS * 0.5 && c.spend > 100).slice(0, 3);

  // Export handlers
  const handleExportPDF = () => {
    const reportMetrics: ReportMetrics = {
      totalSpend: metrics.totalSpend,
      totalRevenue: metrics.totalRevenue,
      totalConversions: metrics.totalConversions,
      totalClicks: metrics.totalClicks,
      totalImpressions: metrics.totalImpressions,
      averageROAS: metrics.averageROAS,
      ctr: metrics.ctr,
      cpc: metrics.cpc,
      convRate: metrics.convRate,
    };
    const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
    const doc = generateDashboardPDF(
      reportMetrics,
      sortedCustomers as CustomerData[],
      performanceData as ReportPerformanceData[],
      { start: range.startDate, end: range.endDate },
      'Marketing Analytics Report'
    );
    downloadPDF(doc, `marketing-report-${range.startDate}-to-${range.endDate}`);
  };

  const handleExportExcel = () => {
    const reportMetrics: ReportMetrics = {
      totalSpend: metrics.totalSpend,
      totalRevenue: metrics.totalRevenue,
      totalConversions: metrics.totalConversions,
      totalClicks: metrics.totalClicks,
      totalImpressions: metrics.totalImpressions,
      averageROAS: metrics.averageROAS,
      ctr: metrics.ctr,
      cpc: metrics.cpc,
      convRate: metrics.convRate,
    };
    const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
    const wb = generateDashboardExcel(
      reportMetrics,
      sortedCustomers as CustomerData[],
      performanceData as ReportPerformanceData[],
      { start: range.startDate, end: range.endDate }
    );
    downloadExcel(wb, `marketing-data-${range.startDate}-to-${range.endDate}`);
  };

  return (
    <div className={compactMode ? 'space-y-4' : 'space-y-6'}>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-emerald-400">Demo Mode Active</p>
              <p className="text-sm text-gray-400">You're viewing sample data. Sign up to connect your real ad accounts.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Marketing Analytics" width={48} height={48} className="rounded-lg" />
          <div>
            <h1 className="text-3xl font-bold">Performance Dashboard</h1>
            <p className="text-gray-400 mt-1">{isDemoMode ? 'Sample Data Preview' : `${sortedCustomers.length} active clients`}</p>
          </div>
        </div>
        
        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCompactMode((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
            title={compactMode ? 'Disable compact mode' : 'Enable compact mode'}
          >
            {compactMode ? <Maximize2 className="w-4 h-4 text-gray-400" /> : <Minimize2 className="w-4 h-4 text-gray-400" />}
            <span>{compactMode ? 'Comfortable' : 'Compact'}</span>
          </button>

          {/* Export Button */}
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            disabled={!data || sortedCustomers.length === 0}
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
                      <button onClick={clearCustomerFilter} className="text-xs text-purple-400 hover:text-purple-300">Clear</button>
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
                  <button onClick={applyCustomerFilter} className="w-full mt-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium">
                    Apply Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Grid - Clickable */}
      <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 ${compactMode ? 'gap-2' : 'gap-3'}`}>
        <MetricCard title="Total Spend" value={formatCurrency(metrics.totalSpend)} icon={DollarSign} color="blue" href="/dashboard/metrics/spend" compact={compactMode} />
        <MetricCard title="Revenue" value={formatCurrency(metrics.totalRevenue)} icon={TrendingUp} color="emerald" href="/dashboard/metrics/revenue" compact={compactMode} />
        <MetricCard title="ROAS" value={`${metrics.averageROAS.toFixed(1)}x`} icon={Target} color="purple" subtitle={metrics.averageROAS >= 3 ? 'Excellent' : metrics.averageROAS >= 2 ? 'Good' : 'Needs Work'} href="/dashboard/metrics/roas" compact={compactMode} />
        <MetricCard title="Conversions" value={formatNumber(metrics.totalConversions)} icon={MousePointerClick} color="amber" href="/dashboard/metrics/conversions" compact={compactMode} />
        <MetricCard title="CTR" value={formatPercent(metrics.ctr)} icon={Percent} color="cyan" subtitle={metrics.ctr >= 2 ? 'Above Avg' : 'Below Avg'} href="/dashboard/metrics/ctr" compact={compactMode} />
        <MetricCard title="Avg CPC" value={formatCurrency(metrics.cpc)} icon={DollarSign} color="pink" href="/dashboard/metrics/cpc" compact={compactMode} />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 inline-flex items-center">
              Impressions
              <InfoTooltip text={METRIC_TOOLTIPS['Impressions']} />
            </span>
            <Eye className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-xl font-bold">{formatNumber(metrics.totalImpressions)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 inline-flex items-center">
              Total Clicks
              <InfoTooltip text={METRIC_TOOLTIPS['Total Clicks']} />
            </span>
            <MousePointerClick className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-xl font-bold">{formatNumber(metrics.totalClicks)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 inline-flex items-center">
              Conv. Rate
              <InfoTooltip text={METRIC_TOOLTIPS['Conv. Rate']} />
            </span>
            <Percent className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-xl font-bold">{formatPercent(metrics.convRate)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 inline-flex items-center">
              Active Clients
              <InfoTooltip text="The number of clients with advertising activity in the selected time period." />
            </span>
            <Users className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-xl font-bold">{sortedCustomers.length}</p>
        </div>
      </div>

      {/* Meta Ops Snapshot */}
      {connectedPlatforms.meta && displayData.metaSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300">Meta Campaigns (Total)</span>
              <BarChart3 className="w-4 h-4 text-fuchsia-300" />
            </div>
            <p className="text-xl font-bold text-fuchsia-200">{displayData.metaSummary.totalCampaigns}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300">Meta Campaigns (Active)</span>
              <Check className="w-4 h-4 text-emerald-300" />
            </div>
            <p className="text-xl font-bold text-emerald-200">{displayData.metaSummary.activeCampaigns}</p>
          </div>
          <button
            onClick={() => setShowMetaDuplicates((prev) => !prev)}
            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-400/40 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300">Possible Duplicate Names</span>
              <AlertTriangle className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-xl font-bold text-amber-200">{displayData.metaSummary.duplicateNameCount}</p>
            <p className="text-[11px] text-amber-300/80 mt-1">Click to {showMetaDuplicates ? 'hide' : 'view'} duplicate details</p>
          </button>
        </div>
      )}

      {/* Meta Duplicate Campaigns Detail */}
      {connectedPlatforms.meta && displayData.metaSummary && showMetaDuplicates && (
        <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-300">Meta Duplicate Campaign Names</h3>
            <button
              onClick={() => setShowMetaDuplicates(false)}
              className="text-xs px-2 py-1 rounded bg-black/20 hover:bg-black/30 text-amber-100"
            >
              Close
            </button>
          </div>
          {displayData.metaSummary.duplicateCampaigns.length === 0 ? (
            <p className="text-sm text-gray-300">No duplicate campaign names detected.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-300 border-b border-amber-500/20">
                    <th className="pb-2 pr-4">Account</th>
                    <th className="pb-2 px-4">Campaign Name</th>
                    <th className="pb-2 pl-4 text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.metaSummary.duplicateCampaigns.map((dup, idx) => (
                    <tr key={`${dup.customerName}-${dup.campaignName}-${idx}`} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-sm">{dup.customerName}</td>
                      <td className="py-2 px-4 text-sm text-gray-200">{dup.campaignName}</td>
                      <td className="py-2 pl-4 text-right font-mono text-sm">{dup.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Over Time */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
              <YAxis yAxisId="left" stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value: number, name: string) => [
                  name === 'Revenue' || name === 'Spend' ? formatCurrency(value) : formatNumber(value),
                  name
                ]}
              />
              <Legend />
              <Bar yAxisId="right" dataKey="conversions" fill="#8b5cf6" opacity={0.7} name="Conversions" radius={[2, 2, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Spend" />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#10b981' }} name="Revenue" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Client Distribution */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Spend by Client</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sortedCustomers.slice(0, 8)}
                dataKey="spend"
                nameKey="customer_name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {sortedCustomers.slice(0, 8).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #6366f1', 
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                }}
                itemStyle={{ color: '#f1f5f9' }}
                labelStyle={{ color: '#f1f5f9', fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {sortedCustomers.slice(0, 5).map((c, i) => (
              <div key={c.customer_id} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-gray-400 truncate max-w-[80px]">{c.customer_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Performance Table */}
      {sortedCustomers.length > 0 && (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Client Performance</h3>
            <span className="text-sm text-gray-400">{sortedCustomers.length} clients</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-white/10">
                  <TableHeader label="Client" align="left" />
                  <TableHeader label="Spend" />
                  <TableHeader label="Revenue" />
                  <TableHeader label="ROAS" />
                  <TableHeader label="Conversions" />
                  <TableHeader label="CTR" />
                  <TableHeader label="CPC" />
                  <TableHeader label="Conv. Rate" className="pl-4" />
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.map((customer, i) => (
                  <tr key={customer.customer_id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                    <td className="py-3 pr-4">
                      <Link href={`/dashboard/clients/${customer.customer_id}`} className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="font-medium truncate max-w-[220px] md:max-w-none">{customer.customer_name}</span>
                        {customer.roas >= metrics.averageROAS * 1.5 && <Award className="w-4 h-4 text-yellow-400" />}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm">{formatCurrency(customer.spend)}</td>
                    <td className="py-3 px-4 text-right font-mono text-sm">{formatCurrency(customer.revenue)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-mono text-sm ${customer.roas >= 3 ? 'text-emerald-400' : customer.roas >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                        {customer.roas.toFixed(1)}x
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm">{formatNumber(customer.conversions)}</td>
                    <td className="py-3 px-4 text-right font-mono text-sm">{formatPercent(customer.ctr)}</td>
                    <td className="py-3 px-4 text-right font-mono text-sm">{formatCurrency(customer.cpc)}</td>
                    <td className="py-3 pl-4 text-right font-mono text-sm">{formatPercent(customer.convRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-emerald-400">Top Performers</h3>
            </div>
            <div className="space-y-3">
              {topPerformers.map((c, i) => (
                <Link key={c.customer_id} href={`/dashboard/clients/${c.customer_id}`} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-emerald-400">#{i + 1}</span>
                    <div>
                      <p className="font-medium">{c.customer_name}</p>
                      <p className="text-sm text-gray-400">{formatCurrency(c.spend)} spend</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-400">{c.roas.toFixed(1)}x</p>
                    <p className="text-xs text-gray-400">ROAS</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-amber-400">Needs Attention</h3>
            </div>
            <div className="space-y-3">
              {needsAttention.map((c) => (
                <Link key={c.customer_id} href={`/dashboard/clients/${c.customer_id}`} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                  <div>
                    <p className="font-medium">{c.customer_name}</p>
                    <p className="text-sm text-gray-400">{formatCurrency(c.spend)} spend</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-amber-400">{c.roas.toFixed(1)}x</p>
                    <p className="text-xs text-gray-400">Below avg ROAS</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg border ${
                insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                insight.type === 'opportunity' ? 'bg-emerald-500/10 border-emerald-500/20' :
                insight.type === 'success' ? 'bg-blue-500/10 border-blue-500/20' :
                'bg-purple-500/10 border-purple-500/20'
              }`}>
                <div className="flex items-start gap-3">
                  {insight.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" /> :
                   insight.type === 'opportunity' ? <TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5" /> :
                   <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5" />}
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Metric Card Component - Clickable with Tooltip
function MetricCard({ title, value, icon: Icon, color, subtitle, href, compact = false }: {
  title: string;
  value: string;
  icon: any;
  color: string;
  subtitle?: string;
  href?: string;
  compact?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 hover:border-blue-400/40',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-400/40',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 hover:border-purple-400/40',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 hover:border-amber-400/40',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-400/40',
    pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/20 hover:border-pink-400/40',
  };
  
  const iconColors: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
  };

  const tooltip = METRIC_TOOLTIPS[title];

  const content = (
    <>
      <div className={`flex items-center justify-between ${compact ? 'mb-1' : 'mb-2'}`}>
        <span className="text-xs text-gray-400 inline-flex items-center">
          {title}
          {tooltip && <InfoTooltip text={tooltip} />}
        </span>
        <Icon className={`w-4 h-4 ${iconColors[color]}`} />
      </div>
      <p className={`${compact ? 'text-lg' : 'text-xl'} font-bold whitespace-nowrap`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`block ${compact ? 'p-3' : 'p-4'} rounded-xl bg-gradient-to-br ${colorClasses[color]} border transition-colors cursor-pointer`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`${compact ? 'p-3' : 'p-4'} rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}>
      {content}
    </div>
  );
}
