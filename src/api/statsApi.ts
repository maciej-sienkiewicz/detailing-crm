// src/api/statsApi.ts
import {apiClientNew} from '../shared/api/apiClientNew';

// Type definitions based on server responses
export interface UncategorizedService {
    id: string; // Changed from number to string to match backend
    name: string;
    servicesCount: number;
    totalRevenue: number;
}

export interface Category {
    id: number;
    name: string;
    servicesCount: number;
}

export interface CreateCategoryRequest {
    name: string;
}

export interface AddToCategoryRequest {
    serviceIds: string[]; // Changed from number[] to string[] based on backend
}

export interface CategoryStatsSummary {
    categoryId: number;
    categoryName: string;
    totalOrders: number;
    totalRevenue: number;
    servicesCount: number;
}

export interface TimeSeriesDataPoint {
    period: string;
    periodStart: string;
    periodEnd: string;
    orders: number;
    revenue: number;
}

export interface ServiceStatsResponse {
    serviceId: string;
    serviceName: string;
    granularity: TimeGranularity;
    data: TimeSeriesDataPoint[];
}

export interface CategoryService {
    id: string;
    name: string;
    servicesCount: number;
    totalRevenue: number;
}

export interface CategoryStatsResponse {
    categoryId: number;
    categoryName: string;
    granularity: TimeGranularity;
    data: TimeSeriesDataPoint[];
}

export enum TimeGranularity {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    YEARLY = 'YEARLY'
}

// Polish translations for granularity
export const TimeGranularityLabels: Record<TimeGranularity, string> = {
    [TimeGranularity.DAILY]: 'Dzienne',
    [TimeGranularity.WEEKLY]: 'Tygodniowe',
    [TimeGranularity.MONTHLY]: 'Miesięczne',
    [TimeGranularity.QUARTERLY]: 'Kwartalne',
    [TimeGranularity.YEARLY]: 'Roczne'
};

export interface StatsApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

class StatsApi {
    private readonly baseEndpoint = '/stats';

    /**
     * Fetch all uncategorized services
     */
    async getUncategorizedServices(): Promise<UncategorizedService[]> {
        try {

            const response = await apiClientNew.get<UncategorizedService[]>(
                `${this.baseEndpoint}/services/uncategorized`
            );
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('❌ Error fetching uncategorized services:', error);
            throw new Error('Nie udało się pobrać niekategoryzowanych usług');
        }
    }

    /**
     * Get all categories
     */
    async getCategories(): Promise<Category[]> {
        try {

            const response = await apiClientNew.get<Category[]>(
                `${this.baseEndpoint}/categories`
            );
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            throw new Error('Nie udało się pobrać kategorii');
        }
    }

    /**
     * Create a new category
     */
    async createCategory(data: CreateCategoryRequest): Promise<Category> {
        try {

            const response = await apiClientNew.post<Category>(
                `${this.baseEndpoint}/categories`,
                data
            );
            return response;
        } catch (error) {
            console.error('❌ Error creating category:', error);
            throw new Error('Nie udało się utworzyć kategorii');
        }
    }

    /**
     * Add services to category
     */
    async addToCategory(categoryId: number, data: AddToCategoryRequest): Promise<void> {
        try {

            await apiClientNew.post<{ message: string; categoryId: number }>(
                `${this.baseEndpoint}/categories/${categoryId}/services`,
                data
            );
        } catch (error) {
            console.error('❌ Error adding services to category:', error);
            throw new Error('Nie udało się przypisać usług do kategorii');
        }
    }

    /**
     * Get category summary stats
     */
    async getCategorySummary(categoryId: number): Promise<CategoryStatsSummary> {
        try {

            const response = await apiClientNew.get<CategoryStatsSummary>(
                `${this.baseEndpoint}/categories/${categoryId}/summary`
            );
            return response;
        } catch (error) {
            console.error('❌ Error fetching category summary:', error);
            throw new Error('Nie udało się pobrać podsumowania kategorii');
        }
    }

    /**
     * Get services for a specific category
     */
    async getCategoryServices(categoryId: number): Promise<CategoryService[]> {
        try {

            // Using the actual backend endpoint: GET /api/stats/services/{categoryId}
            const response = await apiClientNew.get<CategoryService[]>(
                `${this.baseEndpoint}/services/${categoryId}`
            );
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('❌ Error fetching category services:', error);

            // Return empty array instead of throwing to prevent UI crashes
            return [];
        }
    }

    /**
     * Get category statistics time series
     */
    async getCategoryStats(
        categoryId: number,
        startDate: string,
        endDate: string,
        granularity: TimeGranularity = TimeGranularity.MONTHLY
    ): Promise<CategoryStatsResponse> {
        try {

            const params = {
                startDate,
                endDate,
                granularity
            };

            const response = await apiClientNew.get<CategoryStatsResponse>(
                `${this.baseEndpoint}/categories/${categoryId}/timeseries`,
                params
            );
            return response;
        } catch (error) {
            console.error('❌ Error fetching category stats:', error);
            throw new Error('Nie udało się pobrać statystyk kategorii');
        }
    }
    async getServiceStats(
        serviceId: string,
        startDate: string,
        endDate: string,
        granularity: TimeGranularity = TimeGranularity.MONTHLY
    ): Promise<ServiceStatsResponse> {
        try {

            const params = {
                startDate,
                endDate,
                granularity
            };

            const response = await apiClientNew.get<ServiceStatsResponse>(
                `${this.baseEndpoint}/services/${serviceId}/timeseries`,
                params
            );
            return response;
        } catch (error) {
            console.error('❌ Error fetching service stats:', error);
            throw new Error('Nie udało się pobrać statystyk usługi');
        }
    }
}

export const statsApi = new StatsApi();
export default statsApi;