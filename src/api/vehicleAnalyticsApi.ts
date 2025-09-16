import { apiClientNew } from './apiClientNew';

export interface VehicleAnalyticsResponse {
    profitabilityAnalysis?: ProfitabilityAnalysisDto;
    visitPattern?: VisitPatternDto;
    servicePreferences?: ServicePreferencesDto;
}

export interface ProfitabilityAnalysisDto {
    average_visit_value: number;
    monthly_revenue: number;
    revenue_trend: string;
    trend_percentage: number;
    trend_display_name: string;
    trend_change_indicator: string;
    profitability_score: number;
}

export interface VisitPatternDto {
    days_since_last_visit?: number;
    average_days_between_visits?: number;
    visit_regularity_status: string;
    regularity_display_name: string;
    risk_level: string;
    next_recommended_visit_date?: string;
    total_visits: number;
}

export interface ServicePreferencesDto {
    top_services: ServiceUsageDto[];
}

export interface ServiceUsageDto {
    service_id: string;
    service_name: string;
    usage_count: number;
    total_revenue: number;
    average_price: number;
    last_used_date?: string;
}

class VehicleAnalyticsApi {
    async getVehicleAnalytics(vehicleId: string): Promise<VehicleAnalyticsResponse> {
        try {
            console.log('🔍 Fetching vehicle analytics for:', vehicleId);

            const response = await apiClientNew.get<VehicleAnalyticsResponse>(
                `/vehicles/${vehicleId}/analytics`
            );

            console.log('✅ Vehicle analytics loaded successfully');
            return response;
        } catch (error) {
            console.error('❌ Error fetching vehicle analytics:', error);
            throw new Error('Nie udało się pobrać analiz pojazdu');
        }
    }

    async getBatchVehicleAnalytics(vehicleIds: string[]): Promise<Record<string, VehicleAnalyticsResponse>> {
        try {
            console.log('🔍 Fetching batch vehicle analytics for:', vehicleIds.length, 'vehicles');

            const response = await apiClientNew.post<Record<string, VehicleAnalyticsResponse>>(
                '/vehicles/batch-analytics',
                { vehicle_ids: vehicleIds }
            );

            console.log('✅ Batch vehicle analytics loaded successfully');
            return response;
        } catch (error) {
            console.error('❌ Error fetching batch vehicle analytics:', error);
            throw new Error('Nie udało się pobrać analiz pojazdów');
        }
    }
}

export const vehicleAnalyticsApi = new VehicleAnalyticsApi();