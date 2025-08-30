// src/api/activity.ts
/**
 * Production-ready Activity API
 * Updated for new server response model
 */

import {apiClientNew, ApiError, PaginatedApiResponse, PaginationParams} from './apiClientNew';
import {ActivityCategory, ActivityItem, ActivityStatus, EntityType} from '../types/activity';

// ========================================================================================
// TYPE DEFINITIONS - New types for updated server response model
// ========================================================================================

/**
 * New server response structure (what we actually receive from API)
 */
export interface ServerActivityResponse {
    content: ServerActivityItem[];
    page: number;
    size: number;
    total_elements: number;
    total_pages: number;
    is_last: boolean;
}

/**
 * Our internal paginated response structure for activities
 */
export interface ActivityPaginatedResponse {
    data: ActivityItem[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

/**
 * Server activity item structure
 */
export interface ServerActivityItem {
    id: string;
    timestamp: string;
    category: string; // Server uses uppercase: "SYSTEM", "APPOINTMENT", etc.
    message: string;
    description?: string; // Optional description field
    user_id?: string;
    userName?: string;
    status?: string; // "SUCCESS", "PENDING", "ERROR"
    status_text?: string;
    primary_entity?: ServerActivityEntity | null;
    related_entities?: ServerActivityEntity[];
    metadata?: Record<string, any>;
}

/**
 * Server entity structure
 */
export interface ServerActivityEntity {
    id: string;
    type: string;
    display_name: string;
    related_id?: string;
    metadata?: Record<string, any>;
}

/**
 * Activity search and filter parameters
 */
export interface ActivitySearchParams extends PaginationParams {
    category?: ActivityCategory;
    userId?: string;
    entityType?: EntityType;
    entityId?: string;
    status?: ActivityStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: 'timestamp' | 'category' | 'user';
    sortOrder?: 'asc' | 'desc';
}

/**
 * API operation result - using our internal pagination type
 */
export interface ActivityApiResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

// ========================================================================================
// ACTIVITY API CLASS
// ========================================================================================

/**
 * Production-ready Activity API updated for new response model
 */
class ActivityApi {
    private readonly baseEndpoint = '/activities';
    private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
    private cache = new Map<string, { data: any; timestamp: number }>();

    // ========================================================================================
    // CORE READ OPERATIONS
    // ========================================================================================

    /**
     * Fetches paginated list of activities with advanced filtering and sorting
     * Primary method for the activity feed
     */
    async getActivities(params: ActivitySearchParams = {}): Promise<ActivityApiResult<PaginatedApiResponse<ActivityItem>>> {
        try {
            console.log('🔍 Fetching activities with params:', params);

            const {
                page = 0,
                size = 20,
                sortBy = 'timestamp',
                sortOrder = 'desc',
                ...filterParams
            } = params;

            const queryParams = this.buildQueryParams({
                ...filterParams,
                sortBy,
                sortOrder
            });

            const cacheKey = `activities-${JSON.stringify(params)}`;
            const cachedResult = this.getCachedResult(cacheKey);
            if (cachedResult && !this.includesRecentData(params)) {
                console.log('📋 Returning cached activities');
                return cachedResult;
            }

            // ✅ POPRAWKA: Używamy zwykłego get zamiast getWithPagination
            const allParams = { ...queryParams, page, size };
            const response = await apiClientNew.get<any>(
                this.baseEndpoint,
                allParams,
                {
                    timeout: 15000,
                    retries: 2
                }
            );

            // 🐛 DEBUG: Sprawdźmy co zwraca API
            console.log('🐛 RAW API RESPONSE:', {
                responseKeys: Object.keys(response),
                hasContent: 'content' in response,
                contentLength: response.content?.length || 0,
                firstItem: response.content?.[0],
                firstItemKeys: response.content?.[0] ? Object.keys(response.content[0]) : [],
                firstItemRelatedEntities: response.content?.[0]?.related_entities
            });

            // ✅ POPRAWKA: Obsługa formatu Spring Boot z 'content'
            const activities = response.content || [];

            // Process and enhance activity data
            const processedActivities = activities.map((activity: any) => {
                const enhanced = this.enhanceActivityItem(activity);
                return enhanced;
            });

            // 🐛 DEBUG: Sprawdźmy co mamy po enhancement
            console.log('🐛 AFTER ENHANCEMENT:', {
                processedLength: processedActivities.length,
                firstProcessed: processedActivities[0],
                firstProcessedKeys: processedActivities[0] ? Object.keys(processedActivities[0]) : [],
                firstProcessedRelatedEntities: processedActivities[0]?.related_entities,
                firstProcessedRelatedEntitiesCamel: processedActivities[0]?.relatedEntities,
                firstProcessedEntities: processedActivities[0]?.entities
            });

            // ✅ POPRAWKA: Tworzymy własną strukturę paginacji
            const paginationInfo = {
                currentPage: response.page || page,
                pageSize: response.size || size,
                totalItems: response.total_elements || 0,
                totalPages: response.total_pages || 0,
                hasNext: !response.is_last,
                hasPrevious: response.page > 0
            };

            const result: ActivityApiResult<PaginatedApiResponse<ActivityItem>> = {
                success: true,
                data: {
                    data: processedActivities,
                    pagination: paginationInfo,
                    success: true
                }
            };

            if (!this.includesRecentData(params)) {
                this.setCachedResult(cacheKey, result);
            }

            console.log('✅ Successfully fetched activities:', {
                count: processedActivities.length,
                totalItems: paginationInfo.totalItems,
                currentPage: paginationInfo.currentPage
            });

            return result;

        } catch (error) {
            console.error('❌ Error fetching activities:', error);
            return this.handleApiError(error, 'pobrania aktywności');
        }
    }

    /**
     * Fetches a single activity by ID with full details
     */
    async getActivityById(activityId: string): Promise<ActivityApiResult<ActivityItem>> {
        try {
            console.log('🔍 Fetching activity by ID:', activityId);

            if (!activityId?.trim()) {
                return {
                    success: false,
                    error: 'ID aktywności jest wymagane'
                };
            }

            const serverResponse = await apiClientNew.get<ServerActivityItem>(
                `${this.baseEndpoint}/${activityId}`,
                undefined,
                { timeout: 10000 }
            );

            const transformedActivity = this.transformServerActivityItem(serverResponse);

            console.log('✅ Successfully fetched activity:', transformedActivity.id);

            return {
                success: true,
                data: transformedActivity
            };

        } catch (error) {
            console.error('❌ Error fetching activity by ID:', error);
            return this.handleApiError(error, 'pobrania aktywności');
        }
    }

    // ========================================================================================
    // TRANSFORMATION METHODS
    // ========================================================================================

    /**
     * Transforms server response to our internal activity pagination format
     */
    private transformServerResponse(serverResponse: ServerActivityResponse): ActivityPaginatedResponse {
        const transformedActivities = serverResponse.content.map(item =>
            this.transformServerActivityItem(item)
        );

        return {
            data: transformedActivities,
            pagination: {
                currentPage: serverResponse.page,
                totalPages: serverResponse.total_pages,
                totalItems: serverResponse.total_elements,
                itemsPerPage: serverResponse.size,
                hasNext: !serverResponse.is_last,
                hasPrevious: serverResponse.page > 0
            }
        };
    }

    /**
     * Transforms single server activity item to client format
     */
    private transformServerActivityItem(serverItem: ServerActivityItem): ActivityItem {
        const entities = [];

        // Add primary entity if exists
        if (serverItem.primary_entity) {
            entities.push(this.transformServerEntity(serverItem.primary_entity));
        }

        // Add related entities
        if (serverItem.related_entities && serverItem.related_entities.length > 0) {
            entities.push(...serverItem.related_entities.map(entity =>
                this.transformServerEntity(entity)
            ));
        }

        console.log(serverItem.userName);
        console.log("dupa dupa");
        return {
            id: serverItem.id,
            timestamp: serverItem.timestamp,
            category: this.normalizeCategory(serverItem.category),
            message: serverItem.message,
            description: serverItem.description,
            user_id: serverItem.user_id,
            userName: serverItem.userName,
            userColor: this.generateUserColor(serverItem.userName),
            status: this.normalizeStatus(serverItem.status),
            statusText: serverItem.status_text,
            entities: entities.length > 0 ? entities : undefined,
            metadata: serverItem.metadata
        };
    }

    /**
     * Transforms server entity to client format
     */
    private transformServerEntity(serverEntity: ServerActivityEntity) {
        return {
            id: serverEntity.id,
            type: serverEntity.type as EntityType,
            displayName: serverEntity.display_name,
            relatedId: serverEntity.related_id,
            metadata: serverEntity.metadata
        };
    }

    private enhanceActivityItem(activity: ActivityItem): ActivityItem {
        // 🐛 DEBUG: Sprawdźmy co otrzymujemy z API
        console.log('🐛 BEFORE enhance:', {
            id: activity.id,
            keys: Object.keys(activity),
            related_entities: activity.related_entities,
            relatedEntities: activity.relatedEntities,
            entities: activity.entities
        });

        const enhanced = {
            ...activity,
            // Ensure timestamp is properly formatted
            timestamp: new Date(activity.timestamp).toISOString(),

            // ✅ POPRAWKA: Konwertujemy related_entities na relatedEntities (camelCase)
            relatedEntities: activity.related_entities || activity.relatedEntities || [],

            primaryEntity: activity.primaryEntity || activity.primaryEntity || [],

            // ✅ POPRAWKA: Zachowujemy też oryginalne pole dla kompatybilności
            related_entities: activity.related_entities || [],

            // ✅ POPRAWKA: Mapowanie na starą strukturę entities dla kompatybilności
            entities: (activity.related_entities || activity.relatedEntities || []).map((entity: any) => ({
                id: entity.id,
                type: entity.type,
                displayName: entity.name,
                relatedId: entity.id
            })),

            // ✅ POPRAWKA: Mapowanie user_name na userName dla kompatybilności
            userName: activity.user_name || activity.userName,

            // ✅ POPRAWKA: Mapowanie status_text na statusText dla kompatybilności
            statusText: activity.status_text || activity.statusText
        };

        // 🐛 DEBUG: Sprawdźmy co zwracamy
        console.log('🐛 AFTER enhance:', {
            id: enhanced.id,
            keys: Object.keys(enhanced),
            related_entities: enhanced.related_entities,
            relatedEntities: enhanced.relatedEntities,
            entities: enhanced.entities
        });

        return enhanced;
    }

    /**
     * Normalizes category from server format (uppercase) to client format
     */
    private normalizeCategory(serverCategory: string): ActivityCategory {
        const categoryMap: Record<string, ActivityCategory> = {
            'SYSTEM': 'SYSTEM',
            'APPOINTMENT': 'APPOINTMENT',
            'PROTOCOL': 'PROTOCOL',
            'COMMENT': 'COMMENT',
            'CLIENT': 'CLIENT',
            'VEHICLE': 'VEHICLE',
            'NOTIFICATION': 'NOTIFICATION'
        };

        return categoryMap[serverCategory.toUpperCase()] || 'system';
    }

    /**
     * Normalizes status from server format
     */
    private normalizeStatus(serverStatus?: string): ActivityStatus {
        if (!serverStatus) return null;

        const statusMap: Record<string, ActivityStatus> = {
            'SUCCESS': 'success',
            'PENDING': 'pending',
            'ERROR': 'error'
        };

        return statusMap[serverStatus.toUpperCase()] || null;
    }

    /**
     * Generates consistent color for user based on username
     */
    private generateUserColor(userName?: string): string {
        if (!userName) return '#64748b';

        const colors = [
            '#ef4444', '#f97316', '#eab308', '#22c55e',
            '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
        ];

        let hash = 0;
        for (let i = 0; i < userName.length; i++) {
            hash = userName.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    }

    // ========================================================================================
    // CONVENIENCE METHODS
    // ========================================================================================

    /**
     * Gets recent activities (optimized for dashboard)
     */
    async getRecentActivities(limit: number = 50): Promise<ActivityApiResult<ActivityItem[]>> {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const result = await this.getActivities({
            startDate: sevenDaysAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            size: limit,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        return {
            success: result.success,
            data: result.data?.data,
            error: result.error,
            details: result.details
        };
    }

    /**
     * Gets activities for date range (used by ActivityFeedPage)
     */
    async getActivitiesForDateRange(
        startDate: string,
        endDate: string,
        filters: Omit<ActivitySearchParams, 'startDate' | 'endDate'> = {}
    ): Promise<ActivityApiResult<ActivityItem[]>> {
        console.log('📅 Fetching activities for date range:', startDate, 'to', endDate);

        const result = await this.getActivities({
            ...filters,
            startDate,
            endDate,
            size: 1000, // Large limit for date range queries
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        return {
            success: result.success,
            data: result.data?.data,
            error: result.error,
            details: result.details
        };
    }

    // ========================================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================================

    /**
     * Builds query parameters for API requests
     */
    private buildQueryParams(params: Record<string, any>): Record<string, any> {
        const queryParams: Record<string, any> = {};

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    queryParams[key] = value.join(',');
                } else {
                    queryParams[key] = value;
                }
            }
        });

        return queryParams;
    }

    /**
     * Checks if parameters include recent/today's data
     */
    private includesRecentData(params: ActivitySearchParams): boolean {
        const today = new Date().toISOString().split('T')[0];
        return !params.endDate || params.endDate >= today;
    }

    /**
     * Validates date format
     */
    private isValidDate(dateString: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;

        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * Cache management
     */
    private getCachedResult(key: string): any {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    private setCachedResult(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Handles API errors consistently with Polish messages
     */
    private handleApiError(error: unknown, operation: string): ActivityApiResult {
        if (ApiError.isApiError(error)) {
            switch (error.status) {
                case 401:
                    return {
                        success: false,
                        error: 'Sesja wygasła. Zaloguj się ponownie.',
                        details: error
                    };
                case 403:
                    return {
                        success: false,
                        error: 'Brak uprawnień do przeglądania aktywności.',
                        details: error
                    };
                case 404:
                    return {
                        success: false,
                        error: 'Nie znaleziono żądanych aktywności.',
                        details: error
                    };
                case 422:
                    return {
                        success: false,
                        error: error.data?.message || 'Nieprawidłowe parametry wyszukiwania.',
                        details: error
                    };
                case 429:
                    return {
                        success: false,
                        error: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.',
                        details: error
                    };
                case 500:
                    return {
                        success: false,
                        error: 'Błąd serwera. Spróbuj ponownie później.',
                        details: error
                    };
                case 503:
                    return {
                        success: false,
                        error: 'Serwis tymczasowo niedostępny.',
                        details: error
                    };
                default:
                    return {
                        success: false,
                        error: error.data?.message || error.message || `Błąd podczas ${operation}.`,
                        details: error
                    };
            }
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Żądanie zostało anulowane (przekroczono limit czasu).',
                    details: error
                };
            }
            if (error.message.includes('network') || error.message.includes('fetch')) {
                return {
                    success: false,
                    error: 'Błąd połączenia z serwerem.',
                    details: error
                };
            }
            return {
                success: false,
                error: error.message,
                details: error
            };
        }

        return {
            success: false,
            error: `Wystąpił nieoczekiwany błąd podczas ${operation}.`,
            details: error
        };
    }
}

// ========================================================================================
// EXPORTS
// ========================================================================================

// Export singleton instance
export const activityApi = new ActivityApi();

// Export for testing
export { ActivityApi };

// Default export
export default activityApi;