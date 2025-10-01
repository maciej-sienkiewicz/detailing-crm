import { apiClientNew } from './apiClientNew';

export interface VehicleAnalyticsResponse {
    profitabilityAnalysis?: ProfitabilityAnalysisDto;
    visitPattern?: VisitPatternDto;
    servicePreferences?: ServicePreferencesDto;
}

export interface ProfitabilityAnalysisDto {
    averageVisitValue: number;
    monthlyRevenue: number;
    revenueTrend: string;
    trendPercentage: number;
    trendDisplayName: string;
    trendChangeIndicator: string;
    profitabilityScore: number;
}

export interface VisitPatternDto {
    daysSinceLastVisit?: number;
    averageDaysBetweenVisits?: number;
    visitRegularityStatus: string;
    regularityDisplayName: string;
    riskLevel: string;
    nextRecommendedVisitDate?: string;
    totalVisits: number;
}

export interface ServicePreferencesDto {
    topServices: ServiceUsageDto[];
}

export interface ServiceUsageDto {
    serviceId: string;
    serviceName: string;
    usageCount: number;
    totalRevenue: number;
    averagePrice: number;
    lastUsedDate?: number[]; // Array format from server [year, month, day, hour, minute, second]
}

class VehicleAnalyticsApi {
    async getVehicleAnalytics(vehicleId: string): Promise<VehicleAnalyticsResponse> {
        try {

            const response = await apiClientNew.get<VehicleAnalyticsResponse>(
                `/vehicles/${vehicleId}/analytics`
            );
            return response;
        } catch (error) {
            console.error('❌ Error fetching vehicle analytics:', error);
            throw new Error('Nie udało się pobrać analiz pojazdu');
        }
    }

    async getBatchVehicleAnalytics(vehicleIds: string[]): Promise<Record<string, VehicleAnalyticsResponse>> {
        try {

            const response = await apiClientNew.post<Record<string, VehicleAnalyticsResponse>>(
                '/vehicles/batch-analytics',
                { vehicle_ids: vehicleIds }
            );
            return response;
        } catch (error) {
            console.error('❌ Error fetching batch vehicle analytics:', error);
            throw new Error('Nie udało się pobrać analiz pojazdów');
        }
    }
}

export const vehicleAnalyticsApi = new VehicleAnalyticsApi();