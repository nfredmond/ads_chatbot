module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[project]/lib/reports/generator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "downloadExcel",
    ()=>downloadExcel,
    "downloadPDF",
    ()=>downloadPDF,
    "generateClientExcel",
    ()=>generateClientExcel,
    "generateClientPDF",
    ()=>generateClientPDF,
    "generateDashboardExcel",
    ()=>generateDashboardExcel,
    "generateDashboardPDF",
    ()=>generateDashboardPDF,
    "generateMetricPDF",
    ()=>generateMetricPDF
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.node.min.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/file-saver/dist/FileSaver.min.js [app-ssr] (ecmascript)");
;
;
;
;
// Utility functions
const formatCurrency = (num)=>`$${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
const formatNumber = (num)=>num.toLocaleString(undefined, {
        maximumFractionDigits: 0
    });
const formatPercent = (num)=>`${num.toFixed(2)}%`;
const formatROAS = (num)=>`${num.toFixed(2)}x`;
// PDF Color Theme
const COLORS = {
    primary: [
        99,
        102,
        241
    ],
    secondary: [
        16,
        185,
        129
    ],
    warning: [
        245,
        158,
        11
    ],
    danger: [
        239,
        68,
        68
    ],
    dark: [
        15,
        23,
        42
    ],
    light: [
        241,
        245,
        249
    ]
};
function generateDashboardPDF(metrics, customers, performanceData, dateRange, title = 'Marketing Analytics Report') {
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
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
            {
                label: 'Total Spend',
                value: formatCurrency(metrics.totalSpend),
                color: COLORS.primary
            },
            {
                label: 'Total Revenue',
                value: formatCurrency(metrics.totalRevenue),
                color: COLORS.secondary
            },
            {
                label: 'ROAS',
                value: formatROAS(metrics.averageROAS),
                color: COLORS.primary
            }
        ],
        [
            {
                label: 'Conversions',
                value: formatNumber(metrics.totalConversions),
                color: COLORS.warning
            },
            {
                label: 'CTR',
                value: formatPercent(metrics.ctr),
                color: COLORS.primary
            },
            {
                label: 'Avg CPC',
                value: formatCurrency(metrics.cpc),
                color: COLORS.danger
            }
        ]
    ];
    const cardWidth = 58;
    const cardHeight = 25;
    const cardSpacing = 4;
    metricsGrid.forEach((row, rowIndex)=>{
        row.forEach((metric, colIndex)=>{
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
        const tableData = customers.slice(0, 15).map((c, i)=>[
                (i + 1).toString(),
                c.customer_name,
                formatCurrency(c.spend),
                formatCurrency(c.revenue),
                formatROAS(c.roas),
                formatNumber(c.conversions),
                formatPercent(c.ctr)
            ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
            startY: y,
            head: [
                [
                    '#',
                    'Client',
                    'Spend',
                    'Revenue',
                    'ROAS',
                    'Conv.',
                    'CTR'
                ]
            ],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: COLORS.primary,
                textColor: [
                    255,
                    255,
                    255
                ],
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8,
                textColor: COLORS.dark
            },
            alternateRowStyles: {
                fillColor: [
                    248,
                    250,
                    252
                ]
            },
            columnStyles: {
                0: {
                    cellWidth: 10
                },
                1: {
                    cellWidth: 45
                },
                2: {
                    cellWidth: 25,
                    halign: 'right'
                },
                3: {
                    cellWidth: 25,
                    halign: 'right'
                },
                4: {
                    cellWidth: 20,
                    halign: 'right'
                },
                5: {
                    cellWidth: 20,
                    halign: 'right'
                },
                6: {
                    cellWidth: 20,
                    halign: 'right'
                }
            },
            margin: {
                left: 14,
                right: 14
            }
        });
        y = doc.lastAutoTable.finalY + 15;
    }
    // Top Performers section
    const topPerformers = customers.filter((c)=>c.roas >= metrics.averageROAS).slice(0, 5);
    if (topPerformers.length > 0 && y < 240) {
        doc.setTextColor(...COLORS.dark);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Performers (Above Average ROAS)', 14, y);
        y += 8;
        topPerformers.forEach((c, i)=>{
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
    for(let i = 1; i <= pageCount; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount} | Marketing Analytics Report | Confidential`, pageWidth / 2, doc.internal.pageSize.height - 10, {
            align: 'center'
        });
    }
    return doc;
}
function generateClientPDF(clientName, metrics, campaigns, performanceData, dateRange) {
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
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
        {
            label: 'Total Spend',
            value: formatCurrency(metrics.totalSpend)
        },
        {
            label: 'Revenue',
            value: formatCurrency(metrics.totalRevenue)
        },
        {
            label: 'ROAS',
            value: formatROAS(metrics.averageROAS)
        },
        {
            label: 'Conversions',
            value: formatNumber(metrics.totalConversions)
        },
        {
            label: 'CTR',
            value: formatPercent(metrics.ctr)
        },
        {
            label: 'CPC',
            value: formatCurrency(metrics.cpc)
        }
    ];
    const cols = 3;
    const metricCardWidth = 55;
    const metricCardHeight = 22;
    summaryMetrics.forEach((metric, i)=>{
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
        const tableData = campaigns.map((c, i)=>[
                (i + 1).toString(),
                c.name.substring(0, 30) + (c.name.length > 30 ? '...' : ''),
                c.status,
                formatCurrency(c.spend),
                formatCurrency(c.revenue),
                formatROAS(c.roas),
                formatNumber(c.conversions)
            ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
            startY: y,
            head: [
                [
                    '#',
                    'Campaign',
                    'Status',
                    'Spend',
                    'Revenue',
                    'ROAS',
                    'Conv.'
                ]
            ],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: COLORS.primary,
                textColor: [
                    255,
                    255,
                    255
                ],
                fontStyle: 'bold',
                fontSize: 8
            },
            bodyStyles: {
                fontSize: 7,
                textColor: COLORS.dark
            },
            columnStyles: {
                0: {
                    cellWidth: 8
                },
                1: {
                    cellWidth: 55
                },
                2: {
                    cellWidth: 20
                },
                3: {
                    cellWidth: 22,
                    halign: 'right'
                },
                4: {
                    cellWidth: 22,
                    halign: 'right'
                },
                5: {
                    cellWidth: 18,
                    halign: 'right'
                },
                6: {
                    cellWidth: 18,
                    halign: 'right'
                }
            },
            margin: {
                left: 14,
                right: 14
            }
        });
    }
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()} | Marketing Analytics | Confidential`, pageWidth / 2, doc.internal.pageSize.height - 10, {
        align: 'center'
    });
    return doc;
}
function generateMetricPDF(metricName, metricDescription, totalValue, customers, dateRange, sortKey) {
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
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
    const sortedCustomers = [
        ...customers
    ].sort((a, b)=>{
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        return sortKey === 'cpc' ? aVal - bVal : bVal - aVal;
    });
    const tableData = sortedCustomers.map((c, i)=>{
        let metricValue;
        switch(sortKey){
            case 'spend':
            case 'revenue':
            case 'cpc':
                metricValue = formatCurrency(c[sortKey]);
                break;
            case 'roas':
                metricValue = formatROAS(c[sortKey]);
                break;
            case 'ctr':
            case 'convRate':
                metricValue = formatPercent(c[sortKey]);
                break;
            default:
                metricValue = formatNumber(c[sortKey]);
        }
        return [
            (i + 1).toString(),
            c.customer_name,
            metricValue,
            formatCurrency(c.spend),
            formatCurrency(c.revenue),
            formatROAS(c.roas)
        ];
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: y,
        head: [
            [
                'Rank',
                'Client',
                metricName,
                'Spend',
                'Revenue',
                'ROAS'
            ]
        ],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: COLORS.primary,
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 8,
            textColor: COLORS.dark
        },
        columnStyles: {
            0: {
                cellWidth: 15
            },
            1: {
                cellWidth: 55
            },
            2: {
                cellWidth: 30,
                halign: 'right',
                fontStyle: 'bold'
            },
            3: {
                cellWidth: 28,
                halign: 'right'
            },
            4: {
                cellWidth: 28,
                halign: 'right'
            },
            5: {
                cellWidth: 22,
                halign: 'right'
            }
        },
        margin: {
            left: 14,
            right: 14
        }
    });
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Marketing Analytics | ${metricName} Report | Confidential`, pageWidth / 2, doc.internal.pageSize.height - 10, {
        align: 'center'
    });
    return doc;
}
function generateDashboardExcel(metrics, customers, performanceData, dateRange) {
    const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_new();
    // Summary Sheet
    const summaryData = [
        [
            'Marketing Analytics Report'
        ],
        [
            `Report Period: ${dateRange.start} - ${dateRange.end}`
        ],
        [
            `Generated: ${new Date().toLocaleString()}`
        ],
        [],
        [
            'Key Metrics'
        ],
        [
            'Metric',
            'Value'
        ],
        [
            'Total Spend',
            metrics.totalSpend
        ],
        [
            'Total Revenue',
            metrics.totalRevenue
        ],
        [
            'Average ROAS',
            metrics.averageROAS
        ],
        [
            'Total Conversions',
            metrics.totalConversions
        ],
        [
            'Total Clicks',
            metrics.totalClicks
        ],
        [
            'Total Impressions',
            metrics.totalImpressions
        ],
        [
            'CTR (%)',
            metrics.ctr
        ],
        [
            'CPC',
            metrics.cpc
        ],
        [
            'Conversion Rate (%)',
            metrics.convRate
        ]
    ];
    const summarySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet(summaryData);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, summarySheet, 'Summary');
    // Client Performance Sheet
    const clientHeaders = [
        'Client Name',
        'Client ID',
        'Spend',
        'Revenue',
        'ROAS',
        'Conversions',
        'Clicks',
        'Impressions',
        'CTR (%)',
        'CPC',
        'Conv Rate (%)'
    ];
    const clientData = customers.map((c)=>[
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
            c.convRate
        ]);
    const clientSheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        clientHeaders,
        ...clientData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, clientSheet, 'Client Performance');
    // Daily Performance Sheet
    const dailyHeaders = [
        'Date',
        'Spend',
        'Revenue',
        'Clicks',
        'Conversions'
    ];
    const dailyData = performanceData.map((d)=>[
            d.date,
            d.spend,
            d.revenue,
            d.clicks,
            d.conversions
        ]);
    const dailySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        dailyHeaders,
        ...dailyData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, dailySheet, 'Daily Performance');
    return wb;
}
function generateClientExcel(clientName, metrics, campaigns, performanceData, dateRange) {
    const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_new();
    // Summary Sheet
    const summaryData = [
        [
            `Client Report: ${clientName}`
        ],
        [
            `Report Period: ${dateRange.start} - ${dateRange.end}`
        ],
        [
            `Generated: ${new Date().toLocaleString()}`
        ],
        [],
        [
            'Performance Summary'
        ],
        [
            'Metric',
            'Value'
        ],
        [
            'Total Spend',
            metrics.totalSpend
        ],
        [
            'Total Revenue',
            metrics.totalRevenue
        ],
        [
            'ROAS',
            metrics.averageROAS
        ],
        [
            'Conversions',
            metrics.totalConversions
        ],
        [
            'Clicks',
            metrics.totalClicks
        ],
        [
            'Impressions',
            metrics.totalImpressions
        ],
        [
            'CTR (%)',
            metrics.ctr
        ],
        [
            'CPC',
            metrics.cpc
        ],
        [
            'Conversion Rate (%)',
            metrics.convRate
        ]
    ];
    const summarySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet(summaryData);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, summarySheet, 'Summary');
    // Campaigns Sheet
    const campaignHeaders = [
        'Campaign Name',
        'Status',
        'Spend',
        'Revenue',
        'ROAS',
        'Conversions',
        'Clicks',
        'Impressions',
        'CTR (%)',
        'CPC',
        'Conv Rate (%)'
    ];
    const campaignData = campaigns.map((c)=>[
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
            c.convRate
        ]);
    const campaignSheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        campaignHeaders,
        ...campaignData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, campaignSheet, 'Campaigns');
    // Daily Performance Sheet
    const dailyHeaders = [
        'Date',
        'Spend',
        'Revenue',
        'Clicks',
        'Conversions'
    ];
    const dailyData = performanceData.map((d)=>[
            d.date,
            d.spend,
            d.revenue,
            d.clicks,
            d.conversions
        ]);
    const dailySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        dailyHeaders,
        ...dailyData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, dailySheet, 'Daily Performance');
    return wb;
}
function downloadPDF(doc, filename) {
    doc.save(`${filename}.pdf`);
}
function downloadExcel(wb, filename) {
    const excelBuffer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["write"](wb, {
        bookType: 'xlsx',
        type: 'array'
    });
    const blob = new Blob([
        excelBuffer
    ], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveAs"])(blob, `${filename}.xlsx`);
}
}),
"[project]/app/dashboard/clients/[clientId]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/app/dashboard/clients/[clientId]/page.tsx'\n\nUnexpected token. Did you mean `{'}'}` or `&rbrace;`?");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8ee15c28._.js.map