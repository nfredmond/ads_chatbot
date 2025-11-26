(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/reports/generator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/file-saver/dist/FileSaver.min.js [app-client] (ecmascript)");
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
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
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
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
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
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
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
    const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_new();
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
    const summarySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet(summaryData);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, summarySheet, 'Summary');
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
    const clientSheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        clientHeaders,
        ...clientData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, clientSheet, 'Client Performance');
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
    const dailySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        dailyHeaders,
        ...dailyData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, dailySheet, 'Daily Performance');
    return wb;
}
function generateClientExcel(clientName, metrics, campaigns, performanceData, dateRange) {
    const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_new();
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
    const summarySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet(summaryData);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, summarySheet, 'Summary');
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
    const campaignSheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        campaignHeaders,
        ...campaignData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, campaignSheet, 'Campaigns');
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
    const dailySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
        dailyHeaders,
        ...dailyData
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, dailySheet, 'Daily Performance');
    return wb;
}
function downloadPDF(doc, filename) {
    doc.save(`${filename}.pdf`);
}
function downloadExcel(wb, filename) {
    const excelBuffer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["write"](wb, {
        bookType: 'xlsx',
        type: 'array'
    });
    const blob = new Blob([
        excelBuffer
    ], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAs"])(blob, `${filename}.xlsx`);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/dashboard/metrics/[metric]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MetricDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-click.js [app-client] (ecmascript) <export default as MousePointerClick>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$percent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Percent$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/percent.js [app-client] (ecmascript) <export default as Percent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/award.js [app-client] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$reports$2f$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/reports/generator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/file-saver/dist/FileSaver.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/BarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Bar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Area.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/AreaChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
const DATE_PRESETS = [
    {
        id: 'last7',
        label: 'Last 7 Days'
    },
    {
        id: 'last30',
        label: 'Last 30 Days'
    },
    {
        id: 'thisQuarter',
        label: 'This Quarter'
    },
    {
        id: 'lastQuarter',
        label: 'Last Quarter'
    },
    {
        id: 'ytd',
        label: 'Year to Date'
    },
    {
        id: 'lastYear',
        label: 'Last Year'
    },
    {
        id: 'custom',
        label: 'Custom Range'
    }
];
function getDateRangeFromPreset(preset) {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    switch(preset){
        case 'last7':
            {
                const start = new Date(today);
                start.setDate(today.getDate() - 7);
                return {
                    startDate: start.toISOString().split('T')[0],
                    endDate
                };
            }
        case 'last30':
            {
                const start = new Date(today);
                start.setDate(today.getDate() - 30);
                return {
                    startDate: start.toISOString().split('T')[0],
                    endDate
                };
            }
        case 'thisQuarter':
            {
                const quarter = Math.floor(today.getMonth() / 3);
                const start = new Date(today.getFullYear(), quarter * 3, 1);
                return {
                    startDate: start.toISOString().split('T')[0],
                    endDate
                };
            }
        case 'lastQuarter':
            {
                const quarter = Math.floor(today.getMonth() / 3);
                const startMonth = (quarter - 1) * 3;
                const year = startMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
                const adjustedStartMonth = startMonth < 0 ? 9 : startMonth;
                const start = new Date(year, adjustedStartMonth, 1);
                const end = new Date(year, adjustedStartMonth + 3, 0);
                return {
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0]
                };
            }
        case 'ytd':
            {
                const start = new Date(today.getFullYear(), 0, 1);
                return {
                    startDate: start.toISOString().split('T')[0],
                    endDate
                };
            }
        case 'lastYear':
            {
                const start = new Date(today.getFullYear() - 1, 0, 1);
                const end = new Date(today.getFullYear() - 1, 11, 31);
                return {
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0]
                };
            }
        default:
            return {
                startDate: endDate,
                endDate
            };
    }
}
const METRIC_CONFIG = {
    spend: {
        title: 'Total Spend Analysis',
        description: 'Detailed breakdown of advertising spend across all clients',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"],
        color: 'blue',
        dataKey: 'spend',
        format: (v)=>`$${v.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
        sortKey: 'spend',
        compareKey: 'revenue'
    },
    revenue: {
        title: 'Revenue Analysis',
        description: 'Revenue generated from advertising campaigns',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
        color: 'emerald',
        dataKey: 'revenue',
        format: (v)=>`$${v.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
        sortKey: 'revenue',
        compareKey: 'spend'
    },
    roas: {
        title: 'ROAS Analysis',
        description: 'Return on Ad Spend performance by client',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"],
        color: 'purple',
        dataKey: 'roas',
        format: (v)=>`${v.toFixed(2)}x`,
        sortKey: 'roas',
        benchmark: {
            good: 2,
            excellent: 4
        }
    },
    conversions: {
        title: 'Conversions Analysis',
        description: 'Conversion performance and trends across campaigns',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__["MousePointerClick"],
        color: 'amber',
        dataKey: 'conversions',
        format: (v)=>v.toLocaleString(),
        sortKey: 'conversions'
    },
    ctr: {
        title: 'Click-Through Rate Analysis',
        description: 'CTR performance and engagement metrics',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$percent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Percent$3e$__["Percent"],
        color: 'cyan',
        dataKey: 'clicks',
        format: (v)=>`${v.toFixed(2)}%`,
        sortKey: 'ctr',
        benchmark: {
            good: 2,
            excellent: 5
        }
    },
    cpc: {
        title: 'Cost Per Click Analysis',
        description: 'CPC efficiency across clients and campaigns',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"],
        color: 'pink',
        dataKey: 'spend',
        format: (v)=>`$${v.toFixed(2)}`,
        sortKey: 'cpc'
    }
};
const COLORS = [
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316'
];
function MetricDetailPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const metricSlug = params.metric;
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isDemoMode, setIsDemoMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Filter states - load from sessionStorage
    const [datePreset, setDatePreset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('last30');
    const [customDateRange, setCustomDateRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "MetricDetailPage.useState": ()=>getDateRangeFromPreset('last30')
    }["MetricDetailPage.useState"]);
    const [showDatePicker, setShowDatePicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showCustomDates, setShowCustomDates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [availableCustomers, setAvailableCustomers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedCustomers, setSelectedCustomers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showCustomerPicker, setShowCustomerPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const datePickerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const customerPickerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load filter state from sessionStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MetricDetailPage.useEffect": ()=>{
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
        }
    }["MetricDetailPage.useEffect"], []);
    // Save filter state to sessionStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MetricDetailPage.useEffect": ()=>{
            sessionStorage.setItem('dashboardFilters', JSON.stringify({
                datePreset,
                customDateRange,
                selectedCustomers
            }));
        }
    }["MetricDetailPage.useEffect"], [
        datePreset,
        customDateRange,
        selectedCustomers
    ]);
    // Close dropdowns when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MetricDetailPage.useEffect": ()=>{
            function handleClickOutside(event) {
                if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                    setShowDatePicker(false);
                }
                if (customerPickerRef.current && !customerPickerRef.current.contains(event.target)) {
                    setShowCustomerPicker(false);
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "MetricDetailPage.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
            })["MetricDetailPage.useEffect"];
        }
    }["MetricDetailPage.useEffect"], []);
    const fetchData = async ()=>{
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
                        convRate: 1.43
                    },
                    performanceData: [
                        {
                            date: '10/15',
                            spend: 2800,
                            revenue: 8400,
                            clicks: 3200,
                            conversions: 45
                        },
                        {
                            date: '10/17',
                            spend: 3200,
                            revenue: 9600,
                            clicks: 3800,
                            conversions: 52
                        },
                        {
                            date: '10/19',
                            spend: 2900,
                            revenue: 10200,
                            clicks: 3400,
                            conversions: 58
                        },
                        {
                            date: '10/21',
                            spend: 3100,
                            revenue: 11500,
                            clicks: 3600,
                            conversions: 61
                        },
                        {
                            date: '10/23',
                            spend: 3400,
                            revenue: 12100,
                            clicks: 4000,
                            conversions: 68
                        },
                        {
                            date: '10/25',
                            spend: 3000,
                            revenue: 11800,
                            clicks: 3500,
                            conversions: 64
                        },
                        {
                            date: '10/27',
                            spend: 3500,
                            revenue: 12500,
                            clicks: 4100,
                            conversions: 72
                        },
                        {
                            date: '10/29',
                            spend: 2800,
                            revenue: 10800,
                            clicks: 3300,
                            conversions: 55
                        }
                    ],
                    customerMetrics: [
                        {
                            customer_name: 'Demo Client A',
                            customer_id: '1',
                            spend: 15000,
                            revenue: 60000,
                            conversions: 250,
                            clicks: 12000,
                            impressions: 400000,
                            ctr: 3.0,
                            cpc: 1.25,
                            convRate: 2.08,
                            roas: 4.0
                        },
                        {
                            customer_name: 'Demo Client B',
                            customer_id: '2',
                            spend: 12000,
                            revenue: 42000,
                            conversions: 180,
                            clicks: 10000,
                            impressions: 350000,
                            ctr: 2.86,
                            cpc: 1.20,
                            convRate: 1.80,
                            roas: 3.5
                        },
                        {
                            customer_name: 'Demo Client C',
                            customer_id: '3',
                            spend: 8000,
                            revenue: 28000,
                            conversions: 120,
                            clicks: 8000,
                            impressions: 280000,
                            ctr: 2.86,
                            cpc: 1.00,
                            convRate: 1.50,
                            roas: 3.5
                        }
                    ],
                    availableCustomers: []
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
                        ctr: result.metrics?.totalImpressions > 0 ? result.metrics.totalClicks / result.metrics.totalImpressions * 100 : 0,
                        cpc: result.metrics?.totalClicks > 0 ? result.metrics.totalSpend / result.metrics.totalClicks : 0,
                        convRate: result.metrics?.totalClicks > 0 ? result.metrics.totalConversions / result.metrics.totalClicks * 100 : 0
                    },
                    performanceData: result.performanceData || [],
                    customerMetrics: result.customerMetrics || [],
                    availableCustomers: result.availableCustomers || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MetricDetailPage.useEffect": ()=>{
            fetchData();
        }
    }["MetricDetailPage.useEffect"], [
        datePreset,
        customDateRange,
        selectedCustomers
    ]);
    const config = METRIC_CONFIG[metricSlug];
    if (!config) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center h-full",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xl text-gray-400",
                    children: "Metric not found"
                }, void 0, false, {
                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                    lineNumber: 386,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/dashboard",
                    className: "mt-4 text-purple-400 hover:text-purple-300",
                    children: "← Back to Dashboard"
                }, void 0, false, {
                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                    lineNumber: 387,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
            lineNumber: 385,
            columnNumber: 7
        }, this);
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-full",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                lineNumber: 397,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
            lineNumber: 396,
            columnNumber: 7
        }, this);
    }
    if (!data) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center h-full",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xl text-gray-400",
                    children: "No data available"
                }, void 0, false, {
                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                    lineNumber: 405,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/dashboard",
                    className: "mt-4 text-purple-400 hover:text-purple-300",
                    children: "← Back to Dashboard"
                }, void 0, false, {
                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                    lineNumber: 406,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
            lineNumber: 404,
            columnNumber: 7
        }, this);
    }
    const { metrics, performanceData, customerMetrics } = data;
    const Icon = config.icon;
    // Sort customers by the metric's sort key
    const sortedCustomers = [
        ...customerMetrics
    ].sort((a, b)=>{
        const aVal = a[config.sortKey];
        const bVal = b[config.sortKey];
        // For CPC, lower is better
        if (config.sortKey === 'cpc') return aVal - bVal;
        return bVal - aVal;
    });
    // Export handlers
    const handleExportPDF = ()=>{
        const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
        const totalValue = (()=>{
            switch(metricSlug){
                case 'spend':
                    return `$${metrics.totalSpend.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`;
                case 'revenue':
                    return `$${metrics.totalRevenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`;
                case 'roas':
                    return `${metrics.averageROAS.toFixed(2)}x`;
                case 'conversions':
                    return metrics.totalConversions.toLocaleString();
                case 'ctr':
                    return `${metrics.ctr.toFixed(2)}%`;
                case 'cpc':
                    return `$${metrics.cpc.toFixed(2)}`;
                default:
                    return '0';
            }
        })();
        const doc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$reports$2f$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateMetricPDF"])(config.title, config.description, totalValue, sortedCustomers, {
            start: range.startDate,
            end: range.endDate
        }, config.sortKey);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$reports$2f$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["downloadPDF"])(doc, `${metricSlug}-analysis-${range.startDate}-to-${range.endDate}`);
    };
    const handleExportExcel = ()=>{
        const range = datePreset === 'custom' ? customDateRange : getDateRangeFromPreset(datePreset);
        const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_new();
        // Summary sheet
        const summaryData = [
            [
                `${config.title}`
            ],
            [
                `Report Period: ${range.startDate} - ${range.endDate}`
            ],
            [
                `Generated: ${new Date().toLocaleString()}`
            ],
            [],
            [
                'Summary Metrics'
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
                'CTR (%)',
                metrics.ctr
            ],
            [
                'CPC',
                metrics.cpc
            ]
        ];
        const summarySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet(summaryData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, summarySheet, 'Summary');
        // Client rankings sheet
        const headers = [
            'Rank',
            'Client',
            config.title,
            'Spend',
            'Revenue',
            'ROAS',
            'Conversions',
            'CTR (%)',
            'CPC'
        ];
        const clientData = sortedCustomers.map((c, i)=>[
                i + 1,
                c.customer_name,
                c[config.sortKey],
                c.spend,
                c.revenue,
                c.roas,
                c.conversions,
                c.ctr,
                c.cpc
            ]);
        const clientSheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet([
            headers,
            ...clientData
        ]);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(wb, clientSheet, 'Client Rankings');
        const excelBuffer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["write"](wb, {
            bookType: 'xlsx',
            type: 'array'
        });
        const blob = new Blob([
            excelBuffer
        ], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAs"])(blob, `${metricSlug}-analysis-${range.startDate}-to-${range.endDate}.xlsx`);
    };
    // Calculate metric-specific totals
    const getMetricValue = ()=>{
        switch(metricSlug){
            case 'spend':
                return metrics.totalSpend;
            case 'revenue':
                return metrics.totalRevenue;
            case 'roas':
                return metrics.averageROAS;
            case 'conversions':
                return metrics.totalConversions;
            case 'ctr':
                return metrics.ctr;
            case 'cpc':
                return metrics.cpc;
            default:
                return 0;
        }
    };
    const getClientMetricValue = (customer)=>{
        switch(metricSlug){
            case 'spend':
                return customer.spend;
            case 'revenue':
                return customer.revenue;
            case 'roas':
                return customer.roas;
            case 'conversions':
                return customer.conversions;
            case 'ctr':
                return customer.ctr;
            case 'cpc':
                return customer.cpc;
            default:
                return 0;
        }
    };
    const handleDatePresetChange = (preset)=>{
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
    const handleCustomDateApply = ()=>{
        setShowDatePicker(false);
    };
    const handleCustomerToggle = (customerId)=>{
        setSelectedCustomers((prev)=>prev.includes(customerId) ? prev.filter((id)=>id !== customerId) : [
                ...prev,
                customerId
            ]);
    };
    const getDatePresetLabel = ()=>{
        if (datePreset === 'custom') {
            return `${customDateRange.startDate} - ${customDateRange.endDate}`;
        }
        return DATE_PRESETS.find((p)=>p.id === datePreset)?.label || 'Last 30 Days';
    };
    const getCustomerFilterLabel = ()=>{
        if (selectedCustomers.length === 0) return 'All Customers';
        if (selectedCustomers.length === 1) {
            const customer = availableCustomers.find((c)=>c.id === selectedCustomers[0]);
            return customer?.name || '1 Customer';
        }
        return `${selectedCustomers.length} Customers`;
    };
    const customersByPlatform = availableCustomers.reduce((acc, customer)=>{
        if (!acc[customer.platform]) acc[customer.platform] = [];
        acc[customer.platform].push(customer);
        return acc;
    }, {});
    const colorClasses = {
        blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
        emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
        purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
        amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
        cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
        pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            isDemoMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                            className: "w-5 h-5 text-emerald-400"
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                            lineNumber: 578,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-medium text-emerald-400",
                                    children: "Demo Mode Active"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 580,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-400",
                                    children: "Viewing sample data"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 581,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                            lineNumber: 579,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                    lineNumber: 577,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                lineNumber: 576,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.push('/dashboard'),
                                className: "p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 594,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 590,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `p-3 rounded-xl bg-gradient-to-br ${colorClasses[config.color]}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                    className: "w-6 h-6"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 597,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 596,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-bold",
                                        children: config.title
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 600,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400 text-sm",
                                        children: config.description
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 601,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 599,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 589,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                ref: datePickerRef,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowDatePicker(!showDatePicker),
                                        className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                className: "w-4 h-4 text-gray-400"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 613,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: getDatePresetLabel()
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 614,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                className: "w-4 h-4 text-gray-400"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 615,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 609,
                                        columnNumber: 13
                                    }, this),
                                    showDatePicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-full right-0 mt-2 w-64 p-3 rounded-xl bg-gray-900 border border-white/10 shadow-xl z-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1 mb-3",
                                                children: DATE_PRESETS.map((preset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleDatePresetChange(preset.id),
                                                        className: `w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${datePreset === preset.id ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-gray-300'}`,
                                                        children: preset.label
                                                    }, preset.id, false, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 622,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 620,
                                                columnNumber: 17
                                            }, this),
                                            showCustomDates && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pt-3 border-t border-white/10 space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-xs text-gray-400 mb-1",
                                                                children: "Start Date"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                lineNumber: 636,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "date",
                                                                value: customDateRange.startDate,
                                                                onChange: (e)=>setCustomDateRange((prev)=>({
                                                                            ...prev,
                                                                            startDate: e.target.value
                                                                        })),
                                                                className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                lineNumber: 637,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 635,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-xs text-gray-400 mb-1",
                                                                children: "End Date"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                lineNumber: 645,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "date",
                                                                value: customDateRange.endDate,
                                                                onChange: (e)=>setCustomDateRange((prev)=>({
                                                                            ...prev,
                                                                            endDate: e.target.value
                                                                        })),
                                                                className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                lineNumber: 646,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 644,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleCustomDateApply,
                                                        className: "w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium",
                                                        children: "Apply"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 653,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 634,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 619,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 608,
                                columnNumber: 11
                            }, this),
                            !isDemoMode && availableCustomers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                ref: customerPickerRef,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowCustomerPicker(!showCustomerPicker),
                                        className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                className: "w-4 h-4 text-gray-400"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 669,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: getCustomerFilterLabel()
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 670,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                className: "w-4 h-4 text-gray-400"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 671,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 665,
                                        columnNumber: 15
                                    }, this),
                                    showCustomerPicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-full right-0 mt-2 w-80 p-3 rounded-xl bg-gray-900 border border-white/10 shadow-xl z-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between mb-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium",
                                                        children: "Filter by Client"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 677,
                                                        columnNumber: 21
                                                    }, this),
                                                    selectedCustomers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setSelectedCustomers([]),
                                                        className: "text-xs text-purple-400 hover:text-purple-300",
                                                        children: "Clear"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 679,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 676,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-64 overflow-y-auto space-y-2",
                                                children: Object.entries(customersByPlatform).map(([platform, customers])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 px-1",
                                                                children: platform
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                lineNumber: 685,
                                                                columnNumber: 25
                                                            }, this),
                                                            customers.map((customer)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "checkbox",
                                                                            checked: selectedCustomers.includes(customer.id),
                                                                            onChange: ()=>handleCustomerToggle(customer.id),
                                                                            className: "w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                            lineNumber: 688,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-sm truncate",
                                                                            children: customer.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                            lineNumber: 694,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, customer.id, true, {
                                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                    lineNumber: 687,
                                                                    columnNumber: 27
                                                                }, this))
                                                        ]
                                                    }, platform, true, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 684,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 682,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 675,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 664,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 606,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                lineNumber: 588,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `p-6 rounded-xl bg-gradient-to-br ${colorClasses[config.color]} border`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm opacity-80 mb-1",
                                    children: [
                                        "Total ",
                                        config.title.replace(' Analysis', '')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 711,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-4xl font-bold",
                                    children: config.format(getMetricValue())
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 712,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                            lineNumber: 710,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                            className: "w-12 h-12 opacity-50"
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                            lineNumber: 714,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                    lineNumber: 709,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                lineNumber: 708,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6 rounded-xl bg-white/5 border border-white/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold mb-4",
                        children: [
                            config.title.replace(' Analysis', ''),
                            " Over Time"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 720,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                        width: "100%",
                        height: 300,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AreaChart"], {
                            data: performanceData,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                        id: `gradient-${metricSlug}`,
                                        x1: "0",
                                        y1: "0",
                                        x2: "0",
                                        y2: "1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                offset: "5%",
                                                stopColor: COLORS[0],
                                                stopOpacity: 0.3
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 725,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                offset: "95%",
                                                stopColor: COLORS[0],
                                                stopOpacity: 0
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 726,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 724,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 723,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                    strokeDasharray: "3 3",
                                    stroke: "#374151"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 729,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                    dataKey: "date",
                                    stroke: "#9ca3af",
                                    fontSize: 11
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 730,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                    stroke: "#9ca3af",
                                    fontSize: 11,
                                    tickFormatter: (v)=>metricSlug === 'spend' || metricSlug === 'revenue' ? `$${(v / 1000).toFixed(0)}k` : v.toLocaleString()
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 731,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                    contentStyle: {
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    },
                                    formatter: (value)=>[
                                            config.format(value),
                                            config.title.replace(' Analysis', '')
                                        ]
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 734,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                    type: "monotone",
                                    dataKey: config.dataKey,
                                    stroke: COLORS[0],
                                    strokeWidth: 2,
                                    fill: `url(#gradient-${metricSlug})`
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 738,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                            lineNumber: 722,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 721,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                lineNumber: 719,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 rounded-xl bg-white/5 border border-white/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                                        className: "w-5 h-5 text-emerald-400"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 754,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-semibold",
                                        children: "Top Performers"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 755,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 753,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: sortedCustomers.slice(0, 5).map((customer, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/dashboard/clients/${customer.customer_id}`,
                                        className: "flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-lg font-bold ${i < 3 ? 'text-emerald-400' : 'text-gray-400'}`,
                                                        children: [
                                                            "#",
                                                            i + 1
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 765,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "font-medium",
                                                                children: customer.customer_name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                lineNumber: 767,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-400",
                                                                children: [
                                                                    "$",
                                                                    customer.spend.toLocaleString(),
                                                                    " spend"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                                lineNumber: 768,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 766,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 764,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-right",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-lg font-bold",
                                                    children: config.format(getClientMetricValue(customer))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 772,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 771,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, customer.customer_id, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 759,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 757,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 752,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 rounded-xl bg-white/5 border border-white/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-semibold mb-4",
                                children: [
                                    config.title.replace(' Analysis', ''),
                                    " by Client"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 781,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                width: "100%",
                                height: 280,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                                    data: sortedCustomers.slice(0, 8),
                                    layout: "vertical",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                            strokeDasharray: "3 3",
                                            stroke: "#374151"
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                            lineNumber: 784,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                            type: "number",
                                            stroke: "#9ca3af",
                                            fontSize: 11,
                                            tickFormatter: (v)=>metricSlug === 'spend' || metricSlug === 'revenue' ? `$${(v / 1000).toFixed(0)}k` : v.toString()
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                            lineNumber: 785,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                            type: "category",
                                            dataKey: "customer_name",
                                            stroke: "#9ca3af",
                                            fontSize: 10,
                                            width: 100,
                                            tick: {
                                                width: 90
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                            lineNumber: 788,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                            contentStyle: {
                                                backgroundColor: '#1f2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px'
                                            },
                                            formatter: (value)=>[
                                                    config.format(value),
                                                    config.title.replace(' Analysis', '')
                                                ]
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                            lineNumber: 789,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                            dataKey: config.sortKey,
                                            radius: [
                                                0,
                                                4,
                                                4,
                                                0
                                            ],
                                            children: sortedCustomers.slice(0, 8).map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                                                    fill: COLORS[index % COLORS.length]
                                                }, index, false, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 795,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                            lineNumber: 793,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 783,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 782,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 780,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                lineNumber: 750,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6 rounded-xl bg-white/5 border border-white/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold",
                                children: [
                                    "All Clients - ",
                                    config.title.replace(' Analysis', '')
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 806,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-gray-400",
                                children: [
                                    sortedCustomers.length,
                                    " clients"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 807,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 805,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "text-left text-xs text-gray-400 border-b border-white/10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "pb-3 pr-4",
                                                children: "Rank"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 813,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "pb-3 pr-4",
                                                children: "Client"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 814,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "pb-3 px-4 text-right",
                                                children: config.title.replace(' Analysis', '')
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 815,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "pb-3 px-4 text-right",
                                                children: "Spend"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 816,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "pb-3 px-4 text-right",
                                                children: "Revenue"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 817,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "pb-3 px-4 text-right",
                                                children: "ROAS"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 818,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "pb-3 px-4 text-right",
                                                children: "Conversions"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 819,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "pb-3 pl-4 text-right",
                                                children: "CTR"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                lineNumber: 820,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 812,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 811,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: sortedCustomers.map((customer, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "border-b border-white/5 hover:bg-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3 pr-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `font-bold ${i < 3 ? 'text-emerald-400' : 'text-gray-500'}`,
                                                        children: [
                                                            "#",
                                                            i + 1
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 827,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 826,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3 pr-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: `/dashboard/clients/${customer.customer_id}`,
                                                        className: "font-medium hover:text-purple-400 transition-colors",
                                                        children: customer.customer_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 830,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 829,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3 px-4 text-right font-mono text-sm font-bold",
                                                    children: config.format(getClientMetricValue(customer))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 837,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3 px-4 text-right font-mono text-sm",
                                                    children: [
                                                        "$",
                                                        customer.spend.toLocaleString(undefined, {
                                                            minimumFractionDigits: 2
                                                        })
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 838,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3 px-4 text-right font-mono text-sm",
                                                    children: [
                                                        "$",
                                                        customer.revenue.toLocaleString(undefined, {
                                                            minimumFractionDigits: 2
                                                        })
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 839,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3 px-4 text-right",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `font-mono text-sm ${customer.roas >= 3 ? 'text-emerald-400' : customer.roas >= 2 ? 'text-amber-400' : 'text-red-400'}`,
                                                        children: [
                                                            customer.roas.toFixed(1),
                                                            "x"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                        lineNumber: 841,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 840,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3 px-4 text-right font-mono text-sm",
                                                    children: customer.conversions.toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 845,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3 pl-4 text-right font-mono text-sm",
                                                    children: [
                                                        customer.ctr.toFixed(2),
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                                    lineNumber: 846,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, customer.customer_id, true, {
                                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                            lineNumber: 825,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                    lineNumber: 823,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                            lineNumber: 810,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 809,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                lineNumber: 804,
                columnNumber: 7
            }, this),
            config.benchmark && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6 rounded-xl bg-white/5 border border-white/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold mb-4",
                        children: "Performance Benchmarks"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 857,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 rounded-lg bg-red-500/10 border border-red-500/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-red-400 mb-1",
                                        children: "Below Average"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 860,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xl font-bold",
                                        children: [
                                            sortedCustomers.filter((c)=>getClientMetricValue(c) < config.benchmark.good).length,
                                            " clients"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 861,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400 mt-1",
                                        children: [
                                            "< ",
                                            config.format(config.benchmark.good)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 864,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 859,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 rounded-lg bg-amber-500/10 border border-amber-500/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-amber-400 mb-1",
                                        children: "Good"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 867,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xl font-bold",
                                        children: [
                                            sortedCustomers.filter((c)=>getClientMetricValue(c) >= config.benchmark.good && getClientMetricValue(c) < config.benchmark.excellent).length,
                                            " clients"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 868,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400 mt-1",
                                        children: [
                                            config.format(config.benchmark.good),
                                            " - ",
                                            config.format(config.benchmark.excellent)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 871,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 866,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-emerald-400 mb-1",
                                        children: "Excellent"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 874,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xl font-bold",
                                        children: [
                                            sortedCustomers.filter((c)=>getClientMetricValue(c) >= config.benchmark.excellent).length,
                                            " clients"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 875,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400 mt-1",
                                        children: [
                                            "≥ ",
                                            config.format(config.benchmark.excellent)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                        lineNumber: 878,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                                lineNumber: 873,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                        lineNumber: 858,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
                lineNumber: 856,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/metrics/[metric]/page.tsx",
        lineNumber: 573,
        columnNumber: 5
    }, this);
}
_s(MetricDetailPage, "ANGcWq2B0xaCLfmg9jlq5AyqsRg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = MetricDetailPage;
var _c;
__turbopack_context__.k.register(_c, "MetricDetailPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_7c1941d2._.js.map