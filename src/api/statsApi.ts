// src/api/statsApi.ts
import { apiClientNew } from './apiClientNew';

// Type definitions based on server responses
export interface UncategorizedService {
    id: string;
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
    serviceIds: number[];
}

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
            console.log('🔍 Fetching uncategorized services');

            const response = await apiClientNew.get<UncategorizedService[]>(
                `${this.baseEndpoint}/services/uncategorized`
            );

            console.log('✅ Successfully fetched uncategorized services:', response.length);
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
            console.log('🔍 Fetching categories');

            const response = await apiClientNew.get<Category[]>(
                `${this.baseEndpoint}/categories`
            );

            console.log('✅ Successfully fetched categories:', response.length);
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
            console.log('🔍 Creating category:', data);

            const response = await apiClientNew.post<Category>(
                `${this.baseEndpoint}/categories`,
                data
            );

            console.log('✅ Successfully created category:', response);
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
            console.log('🔍 Adding services to category:', { categoryId, data });

            await apiClientNew.post<{ message: string; categoryId: number }>(
                `${this.baseEndpoint}/categories/${categoryId}/services`,
                data
            );

            console.log('✅ Successfully added services to category:', categoryId);
        } catch (error) {
            console.error('❌ Error adding services to category:', error);
            throw new Error('Nie udało się przypisać usług do kategorii');
        }
    }
}

export const statsApi = new StatsApi();
export default statsApi;