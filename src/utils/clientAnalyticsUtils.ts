// src/utils/clientAnalyticsUtils.ts
import { theme } from '../styles/theme';

// ========================================================================================
// FORMATTING UTILITIES
// ========================================================================================

export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0,00 zł';
    }

    try {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch (error) {
        return `${amount.toFixed(0)} zł`;
    }
};

export const formatCurrencyDetailed = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0,00 zł';
    }

    try {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (error) {
        return `${amount.toFixed(2)} zł`;
    }
};

export const formatCompactCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0 zł';
    }

    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M zł`;
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}k zł`;
    }

    return formatCurrency(amount);
};

export const formatPercentage = (percentage: number | null | undefined, decimals: number = 1): string => {
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
        return '0%';
    }

    return `${percentage.toFixed(decimals)}%`;
};

export const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }

    return new Intl.NumberFormat('pl-PL').format(num);
};

export const formatDaysAgo = (days: number | null | undefined): string => {
    if (days === null || days === undefined || isNaN(days)) {
        return 'Nieznane';
    }

    if (days === 0) return 'Dzisiaj';
    if (days === 1) return 'Wczoraj';
    if (days < 7) return `${days} dni temu`;
    if (days < 30) return `${Math.floor(days / 7)} tyg. temu`;
    if (days < 365) return `${Math.floor(days / 30)} mies. temu`;

    return `${Math.floor(days / 365)} lat temu`;
};

export const formatMonthName = (monthName: string | null | undefined): string => {
    if (!monthName) return 'Nieznany';

    const monthMap: Record<string, string> = {
        'JANUARY': 'Styczeń',
        'FEBRUARY': 'Luty',
        'MARCH': 'Marzec',
        'APRIL': 'Kwiecień',
        'MAY': 'Maj',
        'JUNE': 'Czerwiec',
        'JULY': 'Lipiec',
        'AUGUST': 'Sierpień',
        'SEPTEMBER': 'Wrzesień',
        'OCTOBER': 'Październik',
        'NOVEMBER': 'Listopad',
        'DECEMBER': 'Grudzień'
    };

    return monthMap[monthName.toUpperCase()] || monthName;
};

// ========================================================================================
// TREND ANALYSIS UTILITIES
// ========================================================================================

export interface TrendInfo {
    color: string;
    icon: string;
    description: string;
    isPositive: boolean;
}

export const getTrendInfo = (trendDirection: string): TrendInfo => {
    switch (trendDirection.toUpperCase()) {
        case 'STRONG_GROWTH':
            return {
                color: theme.success,
                icon: '📈',
                description: 'Silny wzrost',
                isPositive: true
            };
        case 'GROWTH':
            return {
                color: theme.success,
                icon: '📊',
                description: 'Wzrost',
                isPositive: true
            };
        case 'STABLE':
            return {
                color: theme.text.muted,
                icon: '➡️',
                description: 'Stabilnie',
                isPositive: true
            };
        case 'DECLINE':
            return {
                color: theme.warning,
                icon: '📉',
                description: 'Spadek',
                isPositive: false
            };
        case 'STRONG_DECLINE':
            return {
                color: theme.error,
                icon: '⛔',
                description: 'Silny spadek',
                isPositive: false
            };
        default:
            return {
                color: theme.text.muted,
                icon: '❓',
                description: 'Nieznany trend',
                isPositive: true
            };
    }
};

// ========================================================================================
// CLIENT SCORE UTILITIES
// ========================================================================================

export interface ClientScoreInfo {
    label: string;
    color: string;
    backgroundColor: string;
    description: string;
    priority: number;
}

export const getClientScoreInfo = (score?: string): ClientScoreInfo => {
    switch (score?.toUpperCase()) {
        case 'VIP':
            return {
                label: 'VIP',
                color: '#8b5cf6',
                backgroundColor: '#8b5cf615',
                description: 'Klient VIP - należy do top 5% najlepszych klientów',
                priority: 5
            };
        case 'HIGH_VALUE':
        case 'HIGH':
            return {
                label: 'HIGH',
                color: theme.primary,
                backgroundColor: theme.primaryGhost,
                description: 'Klient wysokiej wartości - należy do top 20% klientów',
                priority: 4
            };
        case 'AVERAGE':
        case 'AVG':
            return {
                label: 'AVG',
                color: theme.success,
                backgroundColor: '#05966915',
                description: 'Klient przeciętny - wyniki zgodne ze średnią firmową',
                priority: 3
            };
        case 'LOW_VALUE':
        case 'LOW':
            return {
                label: 'LOW',
                color: theme.warning,
                backgroundColor: '#d9770615',
                description: 'Klient niskiej wartości - poniżej średniej firmowej',
                priority: 2
            };
        case 'AT_RISK':
        case 'RISK':
            return {
                label: 'RISK',
                color: theme.error,
                backgroundColor: '#dc262615',
                description: 'Klient zagrożony - spadające wskaźniki, wymaga uwagi',
                priority: 1
            };
        default:
            return {
                label: 'BRAK',
                color: theme.text.muted,
                backgroundColor: '#94a3b815',
                description: 'Brak wystarczających danych do oceny',
                priority: 0
            };
    }
};

// ========================================================================================
// PERFORMANCE LEVEL UTILITIES
// ========================================================================================

export interface PerformanceInfo {
    label: string;
    color: string;
    description: string;
    icon: string;
}

export const getPerformanceInfo = (level: string): PerformanceInfo => {
    switch (level.toUpperCase()) {
        case 'EXCELLENT':
            return {
                label: 'Wybitny',
                color: theme.success,
                description: 'Ponad 50% powyżej średniej',
                icon: '🌟'
            };
        case 'GOOD':
            return {
                label: 'Dobry',
                color: theme.primary,
                description: '20-50% powyżej średniej',
                icon: '👍'
            };
        case 'AVERAGE':
            return {
                label: 'Przeciętny',
                color: theme.text.muted,
                description: 'Zgodny ze średnią firmową',
                icon: '➡️'
            };
        case 'BELOW':
            return {
                label: 'Poniżej średniej',
                color: theme.warning,
                description: '20-50% poniżej średniej',
                icon: '⚠️'
            };
        case 'POOR':
            return {
                label: 'Słaby',
                color: theme.error,
                description: 'Ponad 50% poniżej średniej',
                icon: '❌'
            };
        default:
            return {
                label: 'Nieznany',
                color: theme.text.muted,
                description: 'Brak danych',
                icon: '❓'
            };
    }
};

// ========================================================================================
// CHART DATA UTILITIES
// ========================================================================================

export const generateChartColors = (count: number): string[] => {
    const colors = [
        theme.primary,
        theme.success,
        theme.warning,
        theme.info,
        '#8b5cf6',
        '#f59e0b',
        '#10b981',
        '#3b82f6',
        '#ef4444',
        '#6366f1'
    ];

    return Array.from({ length: count }, (_, index) => colors[index % colors.length]);
};

export const calculateGrowthRate = (current: number, previous: number): number => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }

    return ((current - previous) / previous) * 100;
};

// ========================================================================================
// DATE UTILITIES
// ========================================================================================

export const formatAnalyticsDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Brak danych';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Nieprawidłowa data';

        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Błąd formatowania';
    }
};

export const getRelativeTimeString = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Nieznane';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        return formatDaysAgo(diffInDays);
    } catch (error) {
        return 'Błąd obliczania';
    }
};

// ========================================================================================
// VALIDATION UTILITIES
// ========================================================================================

export const isValidAnalyticsData = (data: any): boolean => {
    return data &&
        typeof data === 'object' &&
        data.basicMetrics &&
        typeof data.basicMetrics.totalRevenue === 'number' &&
        typeof data.basicMetrics.totalVisits === 'number';
};

export const hasMinimumDataForAnalytics = (totalVisits: number, totalRevenue: number): boolean => {
    return totalVisits > 0 && totalRevenue > 0;
};