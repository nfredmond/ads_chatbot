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
  Eye,
  Users,
  Award,
  AlertCircle,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet
} from 'lucide-react';
import { ExportDropdown } from '@/components/ExportButtons';
import {
  generateClientPDF,
  generateClientExcel,
  downloadPDF,
  downloadExcel,
  type ReportMetrics,
  type CampaignData as ReportCampaignData,
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
  Area,
  AreaChart,
  ComposedChart,
  PieChart,
  Pie,
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

interface CampaignData {
  id: string;
  name: string;
  status: string;
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

interface ClientData {
  client: {
    id: string;
    name: string;
    platform: string;
  };
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
  campaigns: CampaignData[];
  allClients: CustomerOption[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Filter states
  const [datePreset, setDatePreset] = useState<DatePreset>('last30');
  const [customDateRange, setCustomDateRange] = useState<DateRange>(() => getDateRangeFromPreset('last30'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [showClientSwitcher, setShowClientSwitcher] = useState(false);
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const clientSwitcherRef = useRef<HTMLDivElement>(null);

  // Load filter state from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('dashboardFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.datePreset) setDatePreset(parsed.datePreset);
        if (parsed.customDateRange) setCustomDateRange(parsed.customDateRange);
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);

  // Save filter state
  useEffect(() => {
    sessionStorage.setItem('dashboardFilters', JSON.stringify({
      datePreset,
      customDateRange,
    }));
  }, [datePreset, customDateRange]);

  // Close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (clientSwitcherRef.current && !clientSwitcherRef.current.contains(event.target as Node)) {
        setShowClientSwitcher(false);
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
        // Demo data for a single client
        setData({
          client: {
            id: clientId,
            name: clientId === '1' ? 'Acme Corporation' : clientId === '2' ? 'TechStart Inc' : 'Global Retail Co',
            platform: 'google_ads',
          },
          metrics: {
            totalSpend: 15000 + Math.random() * 10000,
            totalConversions: 250 + Math.floor(Math.random() * 100),
            averageROAS: 3 + Math.random() * 2,
            totalImpressions: 400000 + Math.floor(Math.random() * 100000),
            totalClicks: 12000 + Math.floor(Math.random() * 5000),
            totalRevenue: 60000 + Math.random() * 20000,
            ctr: 2.5 + Math.random(),
            cpc: 1 + Math.random() * 0.5,
            convRate: 1.5 + Math.random(),
          },
          performanceData: Array.from({ length: 14 }, (_, i) => ({
            date: `11/${(i + 1).toString().padStart(2, '0')}`,
            spend: 800 + Math.random() * 400,
            revenue: 3000 + Math.random() * 2000,
            clicks: 700 + Math.floor(Math.random() * 300),
            conversions: 15 + Math.floor(Math.random() * 10),
          })),
          campaigns: [
            { id: '1', name: 'Brand Awareness Campaign', status: 'active', spend: 5000, revenue: 20000, conversions: 85, clicks: 4000, impressions: 150000, ctr: 2.67, cpc: 1.25, convRate: 2.13, roas: 4.0 },
            { id: '2', name: 'Product Launch Q4', status: 'active', spend: 4500, revenue: 18000, conversions: 72, clicks: 3500, impressions: 120000, ctr: 2.92, cpc: 1.29, convRate: 2.06, roas: 4.0 },
            { id: '3', name: 'Retargeting - Cart Abandoners', status: 'active', spend: 3000, revenue: 15000, conversions: 55, clicks: 2500, impressions: 80000, ctr: 3.13, cpc: 1.20, convRate: 2.20, roas: 5.0 },
            { id: '4', name: 'Competitor Targeting', status: 'paused', spend: 2000, revenue: 6000, conversions: 25, clicks: 1800, impressions: 60000, ctr: 3.00, cpc: 1.11, convRate: 1.39, roas: 3.0 },
            { id: '5', name: 'Holiday Special Promo', status: 'active', spend: 500, revenue: 1000, conversions: 13, clicks: 200, impressions: 10000, ctr: 2.00, cpc: 2.50, convRate: 6.50, roas: 2.0 },
          ],
          allClients: [
            { id: '1', name: 'Acme Corporation', platform: 'google_ads' },
            { id: '2', name: 'TechStart Inc', platform: 'google_ads' },
            { id: '3', name: 'Global Retail Co', platform: 'google_ads' },
            { id: '4', name: 'FinanceFirst LLC', platform: 'google_ads' },
            { id: '5', name: 'HealthPlus Medical', platform: 'meta_ads' },
          ],
        });
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
      params.set('startDate', range.startDate);
      params.set('endDate', range.endDate);
      params.set('clientId', clientId);
      
      const response = await fetch(`/api/data/client?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch client data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId, datePreset, customDateRange]);

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

  const switchToClient = (newClientId: string) => {
    setShowClientSwitcher(false);
    router.push(`/dashboard/clients/${newClientId}`);
  };

  const getDatePresetLabel = () => {
    if (datePreset === 'custom') {
      return `${customDateRange.startDate} - ${customDateRange.endDate}`;
    }
    return DATE_PRESETS.find(p => p.id === datePreset)?.label || 'Last 30 Days';
  };

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

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-gray-400">Client not found</p>
        <Link href="/dashboard" className="mt-4 text-purple-400 hover:text-purple-300">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const { client, metrics, performanceData, campaigns, allClients } = data;

  // Find current client index for prev/next navigation
  const currentIndex = allClients.findIndex(c => c.id === clientId);
  const prevClient = currentIndex > 0 ? allClients[currentIndex - 1] : null;
  const nextClient = currentIndex < allClients.length - 1 ? allClients[currentIndex + 1] : null;

  // Sort campaigns by spend
  const sortedCampaigns = [...campaigns].sort((a, b) => b.spend - a.spend);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

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
    const campaignData: ReportCampaignData[] = sortedCampaigns.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      spend: c.spend,
      revenue: c.revenue,
      conversions: c.conversions,
      clicks: c.clicks,
      impressions: c.impressions,
      ctr: c.ctr,
      cpc: c.cpc,
      convRate: c.convRate,
      roas: c.roas,
    }));
    const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
    const doc = generateClientPDF(
      client.name,
      reportMetrics,
      campaignData,
      performanceData as ReportPerformanceData[],
      { start: range.startDate, end: range.endDate }
    );
    downloadPDF(doc, `${client.name.replace(/\s+/g, '-').toLowerCase()}-report-${range.startDate}-to-${range.endDate}`);
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
    const campaignDataExcel: ReportCampaignData[] = sortedCampaigns.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      spend: c.spend,
      revenue: c.revenue,
      conversions: c.conversions,
      clicks: c.clicks,
      impressions: c.impressions,
      ctr: c.ctr,
      cpc: c.cpc,
      convRate: c.convRate,
      roas: c.roas,
    }));
    const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
    const wb = generateClientExcel(
      client.name,
      reportMetrics,
      campaignDataExcel,
      performanceData as ReportPerformanceData[],
      { start: range.startDate, end: range.endDate }
    );
    downloadExcel(wb, `${client.name.replace(/\s+/g, '-').toLowerCase()}-data-${range.startDate}-to-${range.endDate}`);
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
              <p className="text-sm text-gray-400">Viewing sample client data</p>
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
          
          {/* Client Switcher */}
          <div className="relative" ref={clientSwitcherRef}>
            <button
              onClick={() => setShowClientSwitcher(!showClientSwitcher)}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold">{client.name}</h1>
                <p className="text-sm text-gray-400">{client.platform.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
            </button>

            {showClientSwitcher && (
              <div className="absolute top-full left-0 mt-2 w-80 p-3 rounded-xl bg-gray-900 border border-white/10 shadow-xl z-50">
                <div className="text-sm font-medium text-gray-400 mb-2 px-2">Switch Client</div>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {allClients.map(c => (
                    <button
                      key={c.id}
                      onClick={() => switchToClient(c.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        c.id === clientId ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs opacity-70">{c.platform.replace('_', ' ')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prev/Next Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => prevClient && switchToClient(prevClient.id)}
              disabled={!prevClient}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={prevClient?.name || 'No previous client'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => nextClient && switchToClient(nextClient.id)}
              disabled={!nextClient}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={nextClient?.name || 'No next client'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Export & Date Filter */}
        <div className="flex items-center gap-2">
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            disabled={!data || sortedCampaigns.length === 0}
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
        </div>
      </div>

      {/* Key Metrics Grid - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Link href="/dashboard/metrics/spend" className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 hover:border-blue-400/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Total Spend</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold">{formatCurrency(metrics.totalSpend)}</p>
        </Link>
        
        <Link href="/dashboard/metrics/revenue" className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-400/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
        </Link>
        
        <Link href="/dashboard/metrics/roas" className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/20 hover:border-purple-400/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">ROAS</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold">{metrics.averageROAS.toFixed(1)}x</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.averageROAS >= 3 ? 'Excellent' : metrics.averageROAS >= 2 ? 'Good' : 'Needs Work'}</p>
        </Link>
        
        <Link href="/dashboard/metrics/conversions" className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/20 hover:border-amber-400/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Conversions</span>
            <MousePointerClick className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold">{formatNumber(metrics.totalConversions)}</p>
        </Link>
        
        <Link href="/dashboard/metrics/ctr" className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/20 hover:border-cyan-400/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">CTR</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold">{formatPercent(metrics.ctr)}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.ctr >= 2 ? 'Above Avg' : 'Below Avg'}</p>
        </Link>
        
        <Link href="/dashboard/metrics/cpc" className="p-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/5 border border-pink-500/20 hover:border-pink-400/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Avg CPC</span>
            <DollarSign className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-xl font-bold">{formatCurrency(metrics.cpc)}</p>
        </Link>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Impressions</span>
            <Eye className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-xl font-bold">{formatNumber(metrics.totalImpressions)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-xl font-bold">{formatNumber(metrics.totalClicks)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Conv. Rate</span>
            <Percent className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-xl font-bold">{formatPercent(metrics.convRate)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Active Campaigns</span>
            <BarChart3 className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-xl font-bold">{activeCampaigns}</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Campaign Distribution */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Spend by Campaign</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sortedCampaigns.slice(0, 5)}
                dataKey="spend"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {sortedCampaigns.slice(0, 5).map((_, index) => (
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
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Campaigns</h3>
          <span className="text-sm text-gray-400">{campaigns.length} campaigns</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-white/10">
                <th className="pb-3 pr-4">Campaign</th>
                <th className="pb-3 px-4 text-center">Status</th>
                <th className="pb-3 px-4 text-right">Spend</th>
                <th className="pb-3 px-4 text-right">Revenue</th>
                <th className="pb-3 px-4 text-right">ROAS</th>
                <th className="pb-3 px-4 text-right">Conversions</th>
                <th className="pb-3 px-4 text-right">CTR</th>
                <th className="pb-3 pl-4 text-right">CPC</th>
              </tr>
            </thead>
            <tbody>
              {sortedCampaigns.map((campaign, i) => (
                <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-medium">{campaign.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      campaign.status === 'paused' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm">{formatCurrency(campaign.spend)}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm">{formatCurrency(campaign.revenue)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono text-sm ${campaign.roas >= 3 ? 'text-emerald-400' : campaign.roas >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                      {campaign.roas.toFixed(1)}x
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm">{formatNumber(campaign.conversions)}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm">{formatPercent(campaign.ctr)}</td>
                  <td className="py-3 pl-4 text-right font-mono text-sm">{formatCurrency(campaign.cpc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Performing Campaign */}
        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400">Best Performing Campaign</h3>
          </div>
          {sortedCampaigns[0] && (
            <div className="p-4 rounded-lg bg-black/20">
              <p className="font-medium text-lg">{sortedCampaigns[0].name}</p>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-400">ROAS</p>
                  <p className="text-xl font-bold text-emerald-400">{sortedCampaigns[0].roas.toFixed(1)}x</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Revenue</p>
                  <p className="text-xl font-bold">{formatCurrency(sortedCampaigns[0].revenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Conversions</p>
                  <p className="text-xl font-bold">{formatNumber(sortedCampaigns[0].conversions)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Needs Optimization */}
        {sortedCampaigns.filter(c => c.roas < 2).length > 0 && (
          <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-amber-400">Needs Optimization</h3>
            </div>
            <div className="space-y-2">
              {sortedCampaigns.filter(c => c.roas < 2).slice(0, 3).map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(campaign.spend)} spent</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-400">{campaign.roas.toFixed(1)}x</p>
                    <p className="text-xs text-gray-400">ROAS</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
