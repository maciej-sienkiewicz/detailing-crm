// src/api/clientAnalyticsApi.ts
import { apiClientNew } from './apiClientNew';

// ========================================================================================
// INTERFACE DEFINITIONS - Frontend Types
// ========================================================================================

export interface ClientAnalyticsResponse {
    basicMetrics: BasicMetricsResponse;
    revenueTrend?: RevenueTrendResponse;
    seasonality: SeasonalityResponse;
    topServices: ServiceUsageResponse[];
    referralSources: ReferralSourceResponse[];
    growthChart: MonthlyRevenueResponse[];
    comparison?: ClientComparisonResponse;
    calculatedAt: string;
}

export interface BasicMetricsResponse {
    averageVisitValue: number;
    totalRevenue: number;
    totalVisits: number;
    monthsSinceFirstVisit: number;
    daysSinceLastVisit?: number;
}

export interface RevenueTrendResponse {
    recentRevenue: number;
    previousRevenue: number;
    trendPercentage: number;
    trendDirection: string;
    trendDescription: string;
}

export interface SeasonalityResponse {
    monthlyData: MonthlyDataResponse[];
    peakMonth?: string;
    leastActiveMonth?: string;
    calculatedAt: string;
}

export interface MonthlyDataResponse {
    month: string;
    monthNumber: number;
    visitCount: number;
    revenue: number;
    averageVisitValue: number;
}

export interface ServiceUsageResponse {
    serviceId: string;
    serviceName: string;
    usageCount: number;
    totalRevenue: number;
    averagePrice: number;
    lastUsedDate?: string;
}

export interface ReferralSourceResponse {
    source: string;
    sourceDisplayName: string;
    visitCount: number;
    firstVisitDate: string;
    totalRevenue: number;
}

export interface MonthlyRevenueResponse {
    year: number;
    month: string;
    monthNumber: number;
    revenue: number;
    visitCount: number;
    cumulativeRevenue: number;
}

export interface ClientComparisonResponse {
    visitValueComparison: ComparisonMetricResponse;
    monthlyRevenueComparison: ComparisonMetricResponse;
    visitsFrequencyComparison: ComparisonMetricResponse;
    lifespanComparison: ComparisonMetricResponse;
    overallScore: string;
    scoreDescription: string;
}

export interface ComparisonMetricResponse {
    clientValue: number;
    companyAverage: number;
    percentageDifference: number;
    performanceLevel: string;
    performanceDescription: string;
}

export interface CompanyAveragesResponse {
    averageVisitValue: number;
    averageMonthlyRevenue: number;
    averageVisitsPerMonth: number;
    averageClientLifespanMonths: number;
    calculatedAt: string;
}

export interface ClientAnalyticsSummaryResponse {
    averageVisitValue: number;
    totalRevenue: number;
    totalVisits: number;
    clientScore?: string;
    scoreBadgeColor: string;
    daysSinceLastVisit?: number;
}

// ========================================================================================
// API CLIENT CLASS
// ========================================================================================

class ClientAnalyticsApi {
    private readonly baseEndpoint = '/clients';

    /**
     * Get comprehensive analytics for a single client
     */
    async getClientAnalytics(clientId: string): Promise<ClientAnalyticsResponse> {
        try {
            console.log('🔍 Fetching comprehensive analytics for client:', clientId);

            const response = await apiClientNew.get<ClientAnalyticsResponse>(
                `${this.baseEndpoint}/${clientId}/analytics`,
                undefined,
                { timeout: 15000 }
            );

            console.log('✅ Client analytics loaded successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching client analytics:', error);
            throw new Error('Nie udało się pobrać analiz klienta');
        }
    }

    /**
     * Get lightweight analytics summary for client
     */
    async getClientAnalyticsSummary(clientId: string): Promise<ClientAnalyticsSummaryResponse> {
        try {
            console.log('🔍 Fetching analytics summary for client:', clientId);

            const response = await apiClientNew.get<ClientAnalyticsSummaryResponse>(
                `${this.baseEndpoint}/${clientId}/analytics/summary`,
                undefined,
                { timeout: 10000 }
            );

            console.log('✅ Client analytics summary loaded successfully');
            return response;
        } catch (error) {
            console.error('❌ Error fetching client analytics summary:', error);
            throw new Error('Nie udało się pobrać podsumowania analiz');
        }
    }

    /**
     * Get company-wide averages for comparison
     */
    async getCompanyAverages(): Promise<CompanyAveragesResponse> {
        try {
            console.log('🔍 Fetching company averages');

            const response = await apiClientNew.get<CompanyAveragesResponse>(
                '/company/analytics/averages',
                undefined,
                { timeout: 10000 }
            );

            console.log('✅ Company averages loaded successfully');
            return response;
        } catch (error) {
            console.error('❌ Error fetching company averages:', error);
            throw new Error('Nie udało się pobrać średnich firmowych');
        }
    }

    /**
     * Get batch analytics for multiple clients
     */
    async getBatchClientAnalytics(clientIds: string[]): Promise<Record<string, ClientAnalyticsResponse>> {
        try {
            console.log('🔍 Fetching batch analytics for clients:', clientIds.length);

            if (clientIds.length === 0) {
                return {};
            }

            if (clientIds.length > 100) {
                throw new Error('Maksymalnie 100 klientów na żądanie');
            }

            const response = await apiClientNew.post<Record<string, ClientAnalyticsResponse>>(
                '/company/analytics/clients/batch',
                clientIds.map(id => parseInt(id, 10)),
                { timeout: 20000 }
            );

            console.log('✅ Batch analytics loaded successfully for', Object.keys(response).length, 'clients');
            return response;
        } catch (error) {
            console.error('❌ Error fetching batch analytics:', error);
            throw new Error('Nie udało się pobrać analiz dla wielu klientów');
        }
    }
}

// ========================================================================================
// SINGLETON EXPORT
// ========================================================================================

export const clientAnalyticsApi = new ClientAnalyticsApi();
export default clientAnalyticsApi;