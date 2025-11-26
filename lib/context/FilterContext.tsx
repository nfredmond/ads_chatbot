'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type DatePreset = 'last7' | 'last30' | 'lastQuarter' | 'thisQuarter' | 'ytd' | 'lastYear' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'last7', label: 'Last 7 Days' },
  { id: 'last30', label: 'Last 30 Days' },
  { id: 'thisQuarter', label: 'This Quarter' },
  { id: 'lastQuarter', label: 'Last Quarter' },
  { id: 'ytd', label: 'Year to Date' },
  { id: 'lastYear', label: 'Last Year' },
  { id: 'custom', label: 'Custom Range' },
];

export function getDateRangeFromPreset(preset: DatePreset): DateRange {
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

export interface CustomerOption {
  id: string;
  name: string;
  platform: string;
}

interface FilterContextType {
  datePreset: DatePreset;
  setDatePreset: (preset: DatePreset) => void;
  customDateRange: DateRange;
  setCustomDateRange: (range: DateRange) => void;
  selectedCustomers: string[];
  setSelectedCustomers: (customers: string[]) => void;
  availableCustomers: CustomerOption[];
  setAvailableCustomers: (customers: CustomerOption[]) => void;
  getEffectiveDateRange: () => DateRange;
  buildQueryParams: () => URLSearchParams;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [datePreset, setDatePreset] = useState<DatePreset>('last30');
  const [customDateRange, setCustomDateRange] = useState<DateRange>(() => getDateRangeFromPreset('last30'));
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<CustomerOption[]>([]);

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

  // Save filter state to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem('dashboardFilters', JSON.stringify({
      datePreset,
      customDateRange,
      selectedCustomers,
    }));
  }, [datePreset, customDateRange, selectedCustomers]);

  const getEffectiveDateRange = (): DateRange => {
    if (datePreset === 'custom') {
      return customDateRange;
    }
    return getDateRangeFromPreset(datePreset);
  };

  const buildQueryParams = (): URLSearchParams => {
    const params = new URLSearchParams();
    const range = getEffectiveDateRange();
    params.set('startDate', range.startDate);
    params.set('endDate', range.endDate);
    if (selectedCustomers.length > 0) {
      params.set('customers', selectedCustomers.join(','));
    }
    return params;
  };

  return (
    <FilterContext.Provider value={{
      datePreset,
      setDatePreset,
      customDateRange,
      setCustomDateRange,
      selectedCustomers,
      setSelectedCustomers,
      availableCustomers,
      setAvailableCustomers,
      getEffectiveDateRange,
      buildQueryParams,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

