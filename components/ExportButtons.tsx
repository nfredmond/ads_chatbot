'use client';

import { useState } from 'react';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ExportButtonsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
  className?: string;
}

export function ExportButtons({ onExportPDF, onExportExcel, disabled = false, className = '' }: ExportButtonsProps) {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handlePDFExport = async () => {
    setExportingPDF(true);
    try {
      await onExportPDF();
    } finally {
      setTimeout(() => setExportingPDF(false), 500);
    }
  };

  const handleExcelExport = async () => {
    setExportingExcel(true);
    try {
      await onExportExcel();
    } finally {
      setTimeout(() => setExportingExcel(false), 500);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePDFExport}
        disabled={disabled || exportingPDF}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm"
        title="Export PDF Report"
      >
        {exportingPDF ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">PDF</span>
      </button>
      
      <button
        onClick={handleExcelExport}
        disabled={disabled || exportingExcel}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50 text-sm"
        title="Export Excel Data"
      >
        {exportingExcel ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Excel</span>
      </button>
    </div>
  );
}

// Dropdown version for more compact UI
export function ExportDropdown({ onExportPDF, onExportExcel, disabled = false }: ExportButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: 'pdf' | 'excel') => {
    setExporting(type);
    try {
      if (type === 'pdf') {
        await onExportPDF();
      } else {
        await onExportExcel();
      }
    } finally {
      setTimeout(() => {
        setExporting(null);
        setIsOpen(false);
      }, 500);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 text-sm"
      >
        <FileDown className="w-4 h-4" />
        Export
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 p-2 rounded-xl bg-gray-900 border border-white/10 shadow-xl z-50">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {exporting === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
              ) : (
                <FileDown className="w-4 h-4 text-red-400" />
              )}
              <div>
                <p className="font-medium text-sm">PDF Report</p>
                <p className="text-xs text-gray-400">Beautiful formatted report</p>
              </div>
            </button>
            
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting !== null}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {exporting === 'excel' ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              )}
              <div>
                <p className="font-medium text-sm">Excel Export</p>
                <p className="text-xs text-gray-400">Raw data for analysis</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
