// src/api/financialReportsApi.ts
import {apiClient} from '../shared/api/apiClient';

// Types for time period analysis
export interface TimePeriodComparison {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface PeriodData {
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
    date: string;
}

// WoW, MoM, YoY Analysis Types
export interface PeriodAnalysis {
    wow: TimePeriodComparison;
    mom: TimePeriodComparison;
    yoy: TimePeriodComparison;
}

export interface RevenueAnalysis {
    revenue: PeriodAnalysis;
    lastUpdated: string;
    periodData: {
        thisWeek: PeriodData;
        lastWeek: PeriodData;
        thisMonth: PeriodData;
        lastMonth: PeriodData;
        thisYear: PeriodData;
        lastYear: PeriodData;
    };
}

export interface ProfitAnalysis {
    profit: PeriodAnalysis;
    lastUpdated: string;
    periodData: {
        thisWeek: PeriodData;
        lastWeek: PeriodData;
        thisMonth: PeriodData;
        lastMonth: PeriodData;
        thisYear: PeriodData;
        lastYear: PeriodData;
    };
}

// Break-even Analysis Types
export interface BreakEvenAnalysis {
    currentMonth: {
        totalFixedCosts: number;
        averageContributionMargin: number;
        breakEvenRevenue: number;
        currentRevenue: number;
        revenueNeeded: number;
        percentageToBreakEven: number;
        daysRemaining: number;
        dailyRevenueNeeded: number;
        isBreakEvenReached: boolean;
    };
    monthlyComparison: {
        thisMonth: {
            breakEvenRevenue: number;
            actualRevenue: number;
            reachedBreakEven: boolean;
            daysToBreakEven?: number;
        };
        lastMonth: {
            breakEvenRevenue: number;
            actualRevenue: number;
            reachedBreakEven: boolean;
            daysToBreakEven?: number;
        };
        change: {
            breakEvenRevenue: number;
            actualRevenue: number;
            changePercent: number;
            trend: 'IMPROVED' | 'WORSENED' | 'STABLE';
        };
    };
    historicalData: Array<{
        month: string;
        date: string;
        breakEvenRevenue: number;
        actualRevenue: number;
        reachedBreakEven: boolean;
        daysToBreakEven?: number;
        surplus?: number;
    }>;
    projections: {
        nextMonthBreakEven: number;
        recommendedDailyTarget: number;
        confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    };
}

// Chart data types
export interface ChartDataPoint {
    period: string;
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
    breakEvenTarget?: number;
}

export interface TrendChartData {
    revenue: ChartDataPoint[];
    profit: ChartDataPoint[];
    labels: string[];
}

// API response types
export interface FinancialReportsResponse {
    revenueAnalysis: RevenueAnalysis;
    profitAnalysis: ProfitAnalysis;
    breakEvenAnalysis: BreakEvenAnalysis;
    trendData: TrendChartData;
    generatedAt: string;
}

// Filters for reports
export interface ReportsFilters {
    startDate?: string;
    endDate?: string;
    includeFixedCosts?: boolean;
    currency?: string;
}

export const financialReportsApi = {
    // Get comprehensive financial reports
    getFinancialReports: async (filters?: ReportsFilters): Promise<FinancialReportsResponse> => {
        try {
            const params = new URLSearchParams();

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        params.append(key, value.toString());
                    }
                });
            }

            const response = await apiClient.getNot<FinancialReportsResponse>(
                `/financial-reports/comprehensive?${params.toString()}`
            );

            return response;
        } catch (error) {
            console.error('Error fetching financial reports:', error);

            // Return mock data for development
            return getMockFinancialReports();
        }
    },

    // Get revenue analysis (WoW, MoM, YoY)
    getRevenueAnalysis: async (filters?: ReportsFilters): Promise<RevenueAnalysis> => {
        try {
            const params = new URLSearchParams();

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        params.append(key, value.toString());
                    }
                });
            }

            return await apiClient.getNot<RevenueAnalysis>(
                `/financial-reports/revenue-analysis?${params.toString()}`
            );
        } catch (error) {
            console.error('Error fetching revenue analysis:', error);
            return getMockRevenueAnalysis();
        }
    },

    // Get profit analysis (WoW, MoM, YoY)
    getProfitAnalysis: async (filters?: ReportsFilters): Promise<ProfitAnalysis> => {
        try {
            const params = new URLSearchParams();

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        params.append(key, value.toString());
                    }
                });
            }

            return await apiClient.getNot<ProfitAnalysis>(
                `/financial-reports/profit-analysis?${params.toString()}`
            );
        } catch (error) {
            console.error('Error fetching profit analysis:', error);
            return getMockProfitAnalysis();
        }
    },

    // Get break-even analysis
    getBreakEvenAnalysis: async (filters?: ReportsFilters): Promise<BreakEvenAnalysis> => {
        try {
            const params = new URLSearchParams();

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        params.append(key, value.toString());
                    }
                });
            }

            return await apiClient.getNot<BreakEvenAnalysis>(
                `/financial-reports/break-even-analysis?${params.toString()}`
            );
        } catch (error) {
            console.error('Error fetching break-even analysis:', error);
            return getMockBreakEvenAnalysis();
        }
    },

    // Get trend chart data
    getTrendData: async (period: 'month' | 'quarter' | 'year' = 'month', filters?: ReportsFilters): Promise<TrendChartData> => {
        try {
            const params = new URLSearchParams();
            params.append('period', period);

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        params.append(key, value.toString());
                    }
                });
            }

            return await apiClient.getNot<TrendChartData>(
                `/financial-reports/trend-data?${params.toString()}`
            );
        } catch (error) {
            console.error('Error fetching trend data:', error);
            return getMockTrendData();
        }
    }
};

// Mock data generators for development
function getMockFinancialReports(): FinancialReportsResponse {
    return {
        revenueAnalysis: getMockRevenueAnalysis(),
        profitAnalysis: getMockProfitAnalysis(),
        breakEvenAnalysis: getMockBreakEvenAnalysis(),
        trendData: getMockTrendData(),
        generatedAt: new Date().toISOString()
    };
}

function getMockRevenueAnalysis(): RevenueAnalysis {
    return {
        revenue: {
            wow: {
                current: 45000,
                previous: 42000,
                change: 3000,
                changePercent: 7.14,
                trend: 'UP'
            },
            mom: {
                current: 185000,
                previous: 170000,
                change: 15000,
                changePercent: 8.82,
                trend: 'UP'
            },
            yoy: {
                current: 185000,
                previous: 155000,
                change: 30000,
                changePercent: 19.35,
                trend: 'UP'
            }
        },
        lastUpdated: new Date().toISOString(),
        periodData: {
            thisWeek: {
                period: 'This Week',
                revenue: 45000,
                expenses: 32000,
                profit: 13000,
                date: new Date().toISOString()
            },
            lastWeek: {
                period: 'Last Week',
                revenue: 42000,
                expenses: 30000,
                profit: 12000,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            thisMonth: {
                period: 'This Month',
                revenue: 185000,
                expenses: 135000,
                profit: 50000,
                date: new Date().toISOString()
            },
            lastMonth: {
                period: 'Last Month',
                revenue: 170000,
                expenses: 125000,
                profit: 45000,
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            thisYear: {
                period: 'This Year',
                revenue: 1850000,
                expenses: 1350000,
                profit: 500000,
                date: new Date().toISOString()
            },
            lastYear: {
                period: 'Last Year',
                revenue: 1550000,
                expenses: 1200000,
                profit: 350000,
                date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    };
}

function getMockProfitAnalysis(): ProfitAnalysis {
    return {
        profit: {
            wow: {
                current: 13000,
                previous: 12000,
                change: 1000,
                changePercent: 8.33,
                trend: 'UP'
            },
            mom: {
                current: 50000,
                previous: 45000,
                change: 5000,
                changePercent: 11.11,
                trend: 'UP'
            },
            yoy: {
                current: 500000,
                previous: 350000,
                change: 150000,
                changePercent: 42.86,
                trend: 'UP'
            }
        },
        lastUpdated: new Date().toISOString(),
        periodData: {
            thisWeek: {
                period: 'This Week',
                revenue: 45000,
                expenses: 32000,
                profit: 13000,
                date: new Date().toISOString()
            },
            lastWeek: {
                period: 'Last Week',
                revenue: 42000,
                expenses: 30000,
                profit: 12000,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            thisMonth: {
                period: 'This Month',
                revenue: 185000,
                expenses: 135000,
                profit: 50000,
                date: new Date().toISOString()
            },
            lastMonth: {
                period: 'Last Month',
                revenue: 170000,
                expenses: 125000,
                profit: 45000,
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            thisYear: {
                period: 'This Year',
                revenue: 1850000,
                expenses: 1350000,
                profit: 500000,
                date: new Date().toISOString()
            },
            lastYear: {
                period: 'Last Year',
                revenue: 1550000,
                expenses: 1200000,
                profit: 350000,
                date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
            }
        }
    };
}

function getMockBreakEvenAnalysis(): BreakEvenAnalysis {
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysPassed = currentDate.getDate();
    const daysRemaining = daysInMonth - daysPassed;

    return {
        currentMonth: {
            totalFixedCosts: 85000,
            averageContributionMargin: 0.65, // 65%
            breakEvenRevenue: 130769, // 85000 / 0.65
            currentRevenue: 115000,
            revenueNeeded: 15769,
            percentageToBreakEven: 88.0,
            daysRemaining: daysRemaining,
            dailyRevenueNeeded: Math.round(15769 / daysRemaining),
            isBreakEvenReached: false
        },
        monthlyComparison: {
            thisMonth: {
                breakEvenRevenue: 130769,
                actualRevenue: 115000,
                reachedBreakEven: false
            },
            lastMonth: {
                breakEvenRevenue: 125000,
                actualRevenue: 170000,
                reachedBreakEven: true,
                daysToBreakEven: 18
            },
            change: {
                breakEvenRevenue: 5769,
                actualRevenue: -55000,
                changePercent: -32.35,
                trend: 'WORSENED'
            }
        },
        historicalData: Array.from({ length: 12 }, (_, index) => {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() - (11 - index));
            const monthName = monthDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
            const baseBreakEven = 120000 + (Math.random() * 20000);
            const actualRevenue = baseBreakEven + (Math.random() * 80000) - 40000;

            return {
                month: monthName,
                date: monthDate.toISOString(),
                breakEvenRevenue: Math.round(baseBreakEven),
                actualRevenue: Math.round(actualRevenue),
                reachedBreakEven: actualRevenue > baseBreakEven,
                daysToBreakEven: actualRevenue > baseBreakEven ? Math.floor(Math.random() * 25) + 5 : undefined,
                surplus: actualRevenue > baseBreakEven ? Math.round(actualRevenue - baseBreakEven) : undefined
            };
        }),
        projections: {
            nextMonthBreakEven: 135000,
            recommendedDailyTarget: 4500,
            confidenceLevel: 'MEDIUM'
        }
    };
}

function getMockTrendData(): TrendChartData {
    const months = Array.from({ length: 12 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - index));
        return {
            period: date.toLocaleDateString('pl-PL', { month: 'short' }),
            date: date.toISOString(),
            revenue: Math.round(120000 + Math.random() * 80000),
            expenses: Math.round(80000 + Math.random() * 40000),
            profit: 0,
            breakEvenTarget: Math.round(115000 + Math.random() * 20000)
        };
    });

    // Calculate profit
    months.forEach(month => {
        month.profit = month.revenue - month.expenses;
    });

    return {
        revenue: months,
        profit: months,
        labels: months.map(m => m.period)
    };
}