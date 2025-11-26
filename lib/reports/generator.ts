import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Types
export interface ReportMetrics {
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  totalClicks: number;
  totalImpressions: number;
  averageROAS: number;
  ctr: number;
  cpc: number;
  convRate: number;
}

export interface CustomerData {
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
}

export interface PerformanceData {
  date: string;
  spend: number;
  revenue: number;
  clicks: number;
  conversions: number;
}

export interface CampaignData {
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
}

// Utility functions
const formatCurrency = (num: number) => `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 });
const formatPercent = (num: number) => `${num.toFixed(2)}%`;
const formatROAS = (num: number) => `${num.toFixed(2)}x`;

// PDF Color Theme
const COLORS = {
  primary: [99, 102, 241] as [number, number, number], // Purple
  secondary: [16, 185, 129] as [number, number, number], // Emerald
  warning: [245, 158, 11] as [number, number, number], // Amber
  danger: [239, 68, 68] as [number, number, number], // Red
  dark: [15, 23, 42] as [number, number, number], // Slate
  light: [241, 245, 249] as [number, number, number], // Gray
};

// Generate PDF Report for Dashboard
export function generateDashboardPDF(
  metrics: ReportMetrics,
  customers: CustomerData[],
  performanceData: PerformanceData[],
  dateRange: { start: string; end: string },
  title: string = 'Marketing Analytics Report'
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let y = 20;

  // Header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Period: ${dateRange.start} - ${dateRange.end}`, 14, 35);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, 35);

  y = 55;

  // Executive Summary
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, y);
  y += 10;

  // Key Metrics Grid (2x3)
  const metricsGrid = [
    [
      { label: 'Total Spend', value: formatCurrency(metrics.totalSpend), color: COLORS.primary },
      { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue), color: COLORS.secondary },
      { label: 'ROAS', value: formatROAS(metrics.averageROAS), color: COLORS.primary },
    ],
    [
      { label: 'Conversions', value: formatNumber(metrics.totalConversions), color: COLORS.warning },
      { label: 'CTR', value: formatPercent(metrics.ctr), color: COLORS.primary },
      { label: 'Avg CPC', value: formatCurrency(metrics.cpc), color: COLORS.danger },
    ],
  ];

  const cardWidth = 58;
  const cardHeight = 25;
  const cardSpacing = 4;

  metricsGrid.forEach((row, rowIndex) => {
    row.forEach((metric, colIndex) => {
      const x = 14 + (cardWidth + cardSpacing) * colIndex;
      const cardY = y + (cardHeight + cardSpacing) * rowIndex;
      
      // Card background
      doc.setFillColor(245, 245, 250);
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'F');
      
      // Card accent
      doc.setFillColor(...metric.color);
      doc.rect(x, cardY, 3, cardHeight, 'F');
      
      // Label
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + 8, cardY + 8);
      
      // Value
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value, x + 8, cardY + 18);
    });
  });

  y += (cardHeight + cardSpacing) * 2 + 15;

  // Client Performance Table
  if (customers.length > 0) {
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Client Performance', 14, y);
    y += 5;

    const tableData = customers.slice(0, 15).map((c, i) => [
      (i + 1).toString(),
      c.customer_name,
      formatCurrency(c.spend),
      formatCurrency(c.revenue),
      formatROAS(c.roas),
      formatNumber(c.conversions),
      formatPercent(c.ctr),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Client', 'Spend', 'Revenue', 'ROAS', 'Conv.', 'CTR']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.dark,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 45 },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 20, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // Top Performers section
  const topPerformers = customers.filter(c => c.roas >= metrics.averageROAS).slice(0, 5);
  if (topPerformers.length > 0 && y < 240) {
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Performers (Above Average ROAS)', 14, y);
    y += 8;

    topPerformers.forEach((c, i) => {
      doc.setFillColor(...COLORS.secondary);
      doc.setTextColor(255, 255, 255);
      doc.roundedRect(14, y, 180, 12, 2, 2, 'F');
      doc.setFontSize(9);
      doc.text(`${i + 1}. ${c.customer_name} - ${formatROAS(c.roas)} ROAS | ${formatCurrency(c.revenue)} revenue`, 18, y + 8);
      y += 15;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Marketing Analytics Report | Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc;
}

// Generate PDF for Client Detail
export function generateClientPDF(
  clientName: string,
  metrics: ReportMetrics,
  campaigns: CampaignData[],
  performanceData: PerformanceData[],
  dateRange: { start: string; end: string }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let y = 20;

  // Header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Client Performance Report', 14, 22);
  
  doc.setFontSize(16);
  doc.text(clientName, 14, 35);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dateRange.start} - ${dateRange.end}`, pageWidth - 60, 35);

  y = 60;

  // Performance Summary
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Summary', 14, y);
  y += 10;

  // Metrics cards
  const summaryMetrics = [
    { label: 'Total Spend', value: formatCurrency(metrics.totalSpend) },
    { label: 'Revenue', value: formatCurrency(metrics.totalRevenue) },
    { label: 'ROAS', value: formatROAS(metrics.averageROAS) },
    { label: 'Conversions', value: formatNumber(metrics.totalConversions) },
    { label: 'CTR', value: formatPercent(metrics.ctr) },
    { label: 'CPC', value: formatCurrency(metrics.cpc) },
  ];

  const cols = 3;
  const metricCardWidth = 55;
  const metricCardHeight = 22;

  summaryMetrics.forEach((metric, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 14 + col * (metricCardWidth + 8);
    const cardY = y + row * (metricCardHeight + 5);

    doc.setFillColor(245, 245, 250);
    doc.roundedRect(x, cardY, metricCardWidth, metricCardHeight, 2, 2, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(metric.label, x + 5, cardY + 8);
    
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(metric.value, x + 5, cardY + 17);
    doc.setFont('helvetica', 'normal');
  });

  y += Math.ceil(summaryMetrics.length / cols) * (metricCardHeight + 5) + 15;

  // Campaign Performance Table
  if (campaigns.length > 0) {
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Campaign Performance', 14, y);
    y += 5;

    const tableData = campaigns.map((c, i) => [
      (i + 1).toString(),
      c.name.substring(0, 30) + (c.name.length > 30 ? '...' : ''),
      c.status,
      formatCurrency(c.spend),
      formatCurrency(c.revenue),
      formatROAS(c.roas),
      formatNumber(c.conversions),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Campaign', 'Status', 'Spend', 'Revenue', 'ROAS', 'Conv.']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: COLORS.dark,
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 55 },
        2: { cellWidth: 20 },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 18, halign: 'right' },
        6: { cellWidth: 18, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated: ${new Date().toLocaleString()} | Marketing Analytics | Confidential`,
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );

  return doc;
}

// Generate PDF for Metric Analysis
export function generateMetricPDF(
  metricName: string,
  metricDescription: string,
  totalValue: string,
  customers: CustomerData[],
  dateRange: { start: string; end: string },
  sortKey: keyof CustomerData
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let y = 20;

  // Header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${metricName} Analysis`, 14, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dateRange.start} - ${dateRange.end}`, pageWidth - 60, 25);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, 35);

  y = 55;

  // Total metric value
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, 'F');
  doc.setFillColor(...COLORS.primary);
  doc.rect(14, y, 4, 30, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Total ${metricName}`, 24, y + 10);
  
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(totalValue, 24, y + 24);
  doc.setFont('helvetica', 'normal');

  y += 45;

  // Client Ranking Table
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Client Ranking by ${metricName}`, 14, y);
  y += 5;

  const sortedCustomers = [...customers].sort((a, b) => {
    const aVal = a[sortKey] as number;
    const bVal = b[sortKey] as number;
    return sortKey === 'cpc' ? aVal - bVal : bVal - aVal;
  });

  const tableData = sortedCustomers.map((c, i) => {
    let metricValue: string;
    switch (sortKey) {
      case 'spend':
      case 'revenue':
      case 'cpc':
        metricValue = formatCurrency(c[sortKey] as number);
        break;
      case 'roas':
        metricValue = formatROAS(c[sortKey]);
        break;
      case 'ctr':
      case 'convRate':
        metricValue = formatPercent(c[sortKey] as number);
        break;
      default:
        metricValue = formatNumber(c[sortKey] as number);
    }
    return [
      (i + 1).toString(),
      c.customer_name,
      metricValue,
      formatCurrency(c.spend),
      formatCurrency(c.revenue),
      formatROAS(c.roas),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Rank', 'Client', metricName, 'Spend', 'Revenue', 'ROAS']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.dark,
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 55 },
      2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Marketing Analytics | ${metricName} Report | Confidential`,
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );

  return doc;
}

// Generate Excel for Dashboard
export function generateDashboardExcel(
  metrics: ReportMetrics,
  customers: CustomerData[],
  performanceData: PerformanceData[],
  dateRange: { start: string; end: string }
) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Marketing Analytics Report'],
    [`Report Period: ${dateRange.start} - ${dateRange.end}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Key Metrics'],
    ['Metric', 'Value'],
    ['Total Spend', metrics.totalSpend],
    ['Total Revenue', metrics.totalRevenue],
    ['Average ROAS', metrics.averageROAS],
    ['Total Conversions', metrics.totalConversions],
    ['Total Clicks', metrics.totalClicks],
    ['Total Impressions', metrics.totalImpressions],
    ['CTR (%)', metrics.ctr],
    ['CPC', metrics.cpc],
    ['Conversion Rate (%)', metrics.convRate],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Client Performance Sheet
  const clientHeaders = ['Client Name', 'Client ID', 'Spend', 'Revenue', 'ROAS', 'Conversions', 'Clicks', 'Impressions', 'CTR (%)', 'CPC', 'Conv Rate (%)'];
  const clientData = customers.map(c => [
    c.customer_name,
    c.customer_id,
    c.spend,
    c.revenue,
    c.roas,
    c.conversions,
    c.clicks,
    c.impressions,
    c.ctr,
    c.cpc,
    c.convRate,
  ]);
  const clientSheet = XLSX.utils.aoa_to_sheet([clientHeaders, ...clientData]);
  XLSX.utils.book_append_sheet(wb, clientSheet, 'Client Performance');

  // Daily Performance Sheet
  const dailyHeaders = ['Date', 'Spend', 'Revenue', 'Clicks', 'Conversions'];
  const dailyData = performanceData.map(d => [d.date, d.spend, d.revenue, d.clicks, d.conversions]);
  const dailySheet = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyData]);
  XLSX.utils.book_append_sheet(wb, dailySheet, 'Daily Performance');

  return wb;
}

// Generate Excel for Client
export function generateClientExcel(
  clientName: string,
  metrics: ReportMetrics,
  campaigns: CampaignData[],
  performanceData: PerformanceData[],
  dateRange: { start: string; end: string }
) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    [`Client Report: ${clientName}`],
    [`Report Period: ${dateRange.start} - ${dateRange.end}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Performance Summary'],
    ['Metric', 'Value'],
    ['Total Spend', metrics.totalSpend],
    ['Total Revenue', metrics.totalRevenue],
    ['ROAS', metrics.averageROAS],
    ['Conversions', metrics.totalConversions],
    ['Clicks', metrics.totalClicks],
    ['Impressions', metrics.totalImpressions],
    ['CTR (%)', metrics.ctr],
    ['CPC', metrics.cpc],
    ['Conversion Rate (%)', metrics.convRate],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Campaigns Sheet
  const campaignHeaders = ['Campaign Name', 'Status', 'Spend', 'Revenue', 'ROAS', 'Conversions', 'Clicks', 'Impressions', 'CTR (%)', 'CPC', 'Conv Rate (%)'];
  const campaignData = campaigns.map(c => [
    c.name,
    c.status,
    c.spend,
    c.revenue,
    c.roas,
    c.conversions,
    c.clicks,
    c.impressions,
    c.ctr,
    c.cpc,
    c.convRate,
  ]);
  const campaignSheet = XLSX.utils.aoa_to_sheet([campaignHeaders, ...campaignData]);
  XLSX.utils.book_append_sheet(wb, campaignSheet, 'Campaigns');

  // Daily Performance Sheet
  const dailyHeaders = ['Date', 'Spend', 'Revenue', 'Clicks', 'Conversions'];
  const dailyData = performanceData.map(d => [d.date, d.spend, d.revenue, d.clicks, d.conversions]);
  const dailySheet = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyData]);
  XLSX.utils.book_append_sheet(wb, dailySheet, 'Daily Performance');

  return wb;
}

// Download helpers
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(`${filename}.pdf`);
}

export function downloadExcel(wb: XLSX.WorkBook, filename: string) {
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}
