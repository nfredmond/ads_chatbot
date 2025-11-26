'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Users, X, Check } from 'lucide-react';
import { useFilters, DATE_PRESETS, DatePreset, CustomerOption } from '@/lib/context/FilterContext';

interface FilterBarProps {
  showCustomerFilter?: boolean;
  className?: string;
}

export function FilterBar({ showCustomerFilter = true, className = '' }: FilterBarProps) {
  const {
    datePreset,
    setDatePreset,
    customDateRange,
    setCustomDateRange,
    selectedCustomers,
    setSelectedCustomers,
    availableCustomers,
  } = useFilters();

  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  
  const dateRef = useRef<HTMLDivElement>(null);
  const customerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
        setShowCustomRange(false);
      }
      if (customerRef.current && !customerRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDatePresetSelect = (preset: DatePreset) => {
    if (preset === 'custom') {
      setShowCustomRange(true);
    } else {
      setDatePreset(preset);
      setShowDateDropdown(false);
      setShowCustomRange(false);
    }
  };

  const handleCustomRangeApply = () => {
    setDatePreset('custom');
    setShowDateDropdown(false);
    setShowCustomRange(false);
  };

  const handleCustomerToggle = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  const getDateLabel = () => {
    if (datePreset === 'custom') {
      return `${customDateRange.startDate} - ${customDateRange.endDate}`;
    }
    return DATE_PRESETS.find(p => p.id === datePreset)?.label || 'Last 30 Days';
  };

  const getCustomerLabel = () => {
    if (selectedCustomers.length === 0) {
      return 'All Customers';
    }
    if (selectedCustomers.length === 1) {
      const customer = availableCustomers.find(c => c.id === selectedCustomers[0]);
      return customer?.name || '1 Customer';
    }
    return `${selectedCustomers.length} Customers`;
  };

  // Group customers by platform
  const customersByPlatform = availableCustomers.reduce((acc, customer) => {
    if (!acc[customer.platform]) {
      acc[customer.platform] = [];
    }
    acc[customer.platform].push(customer);
    return acc;
  }, {} as Record<string, CustomerOption[]>);

  const platformLabels: Record<string, string> = {
    google_ads: 'Google Ads',
    meta_ads: 'Meta Ads',
    linkedin_ads: 'LinkedIn Ads',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Date Range Filter */}
      <div className="relative" ref={dateRef}>
        <button
          onClick={() => setShowDateDropdown(!showDateDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white text-sm hover:border-purple-500 transition-colors"
        >
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{getDateLabel()}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showDateDropdown && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="p-2">
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleDatePresetSelect(preset.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    datePreset === preset.id && preset.id !== 'custom'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {showCustomRange && (
              <div className="border-t border-gray-700 p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <button
                    onClick={handleCustomRangeApply}
                    className="w-full py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Filter */}
      {showCustomerFilter && availableCustomers.length > 0 && (
        <div className="relative" ref={customerRef}>
          <button
            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white text-sm hover:border-purple-500 transition-colors"
          >
            <Users className="w-4 h-4 text-gray-400" />
            <span>{getCustomerLabel()}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showCustomerDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-xl z-50">
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <span className="text-sm font-medium text-white">Select Customers</span>
                {selectedCustomers.length > 0 && (
                  <button
                    onClick={() => setSelectedCustomers([])}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="p-2">
                {/* All Customers option */}
                <button
                  onClick={() => setSelectedCustomers([])}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCustomers.length === 0
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span>All Customers</span>
                  {selectedCustomers.length === 0 && <Check className="w-4 h-4" />}
                </button>

                {/* Customers grouped by platform */}
                {Object.entries(customersByPlatform).map(([platform, customers]) => (
                  <div key={platform} className="mt-3">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                      {platformLabels[platform] || platform}
                    </div>
                    {customers.map(customer => (
                      <button
                        key={customer.id}
                        onClick={() => handleCustomerToggle(customer.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCustomers.includes(customer.id)
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <span className="truncate">{customer.name}</span>
                        {selectedCustomers.includes(customer.id) && <Check className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active filter badges */}
      {selectedCustomers.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCustomers.slice(0, 3).map(customerId => {
            const customer = availableCustomers.find(c => c.id === customerId);
            return (
              <span
                key={customerId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-300"
              >
                {customer?.name || customerId}
                <button
                  onClick={() => handleCustomerToggle(customerId)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          {selectedCustomers.length > 3 && (
            <span className="text-xs text-gray-400">+{selectedCustomers.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  );
}
