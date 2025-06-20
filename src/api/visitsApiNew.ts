// src/api/visitsApi.ts
/**
 * Production-ready Visits API
 * Handles all visit/protocol-related API operations with proper typing and error handling
 */

import { apiClientNew, PaginatedApiResponse, PaginationParams, ApiError } from './apiClientNew';
import { ProtocolStatus } from '../types';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

/**
 * Visit list item (lightweight representation for lists)
 */
export interface VisitListItem {
    id: string;
    title: string;
    vehicle: {
        make: string;
        model: string;
        licensePlate: string;
        productionYear: number;
        color?: string;
    };
    period: {
        startDate: string;
        endDate: string;
    };
    owner: {
        name: string;
        companyName?: string;
    };
    status: ProtocolStatus;
    totalAmount: number;
    lastUpdate: string;
    calendarColorId: string;
    selectedServices: VisitServiceSummary[];
    totalServiceCount: number;
}

/**
 * Service summary for visit lists
 */
export interface VisitServiceSummary {
    id: string;
    name: string;
    price: number;
    finalPrice: number;
    quantity: number;
    discountType?: string;
    discountValue?: number;
    approvalStatus?: string;
    note?: string;
}

/**
 * Visit filter parameters
 */
export interface VisitFilterParams {
    clientName?: string;
    licensePlate?: string;
    status?: ProtocolStatus;
    startDate?: string;
    endDate?: string;
    make?: string;
    model?: string;
    serviceName?: string;
    minPrice?: number;
    maxPrice?: number;
}

/**
 * Visit search parameters (extends filter with pagination)
 */
export interface VisitSearchParams extends VisitFilterParams, PaginationParams {}

/**
 * Visit counters by status
 */
export interface VisitCounters {
    scheduled: number;
    inProgress: number;
    readyForPickup: number;
    completed: number;
    cancelled: number;
    all: number;
}

/**
 * Visits API operation result
 */
export interface VisitsApiResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

// ========================================================================================
// VISITS API CLASS
// ========================================================================================

/**
 * Production-ready Visits API
 * All methods include proper error handling and logging
 */
class VisitsApi {
    private readonly baseEndpoint = '/receptions';

    /**
     * Fetches a paginated list of visits with optional filtering
     *
     * @param params - Search and filter parameters
     * @returns Promise<VisitsApiResult<PaginatedApiResponse<VisitListItem>>>
     *
     * @example
     * ```typescript
     * const result = await visitsApi.getVisitsList({
     *   status: ProtocolStatus.IN_PROGRESS,
     *   page: 0,
     *   size: 20
     * });
     *
     * if (result.success) {
     *   console.log('Visits:', result.data);
     *   console.log('Total:', result.pagination.totalItems);
     * }
     * ```
     */
    async getVisitsList(params: VisitSearchParams = {}): Promise<VisitsApiResult<PaginatedApiResponse<VisitListItem>>> {
        try {
            console.log('🔍 Fetching visits list with params:', params);

            const { page = 0, size = 10, ...filterParams } = params;

            // Prepare filter parameters for the API
            const apiParams = this.prepareFilterParams(filterParams);

            // Call the API
            const response = await apiClientNew.getWithPagination<VisitListItem>(
                `${this.baseEndpoint}/list`,
                apiParams,
                { page, size },
                { timeout: 15000 } // 15 second timeout for list operations
            );

            console.log('✅ Successfully fetched visits list:', {
                count: response.data.length,
                totalItems: response.pagination.totalItems,
                currentPage: response.pagination.currentPage
            });

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching visits list:', error);

            const errorMessage = this.extractErrorMessage(error);

            return {
                success: false,
                error: errorMessage,
                details: error,
                data: {
                    data: [],
                    pagination: {
                        currentPage: params.page || 0,
                        pageSize: params.size || 10,
                        totalItems: 0,
                        totalPages: 0,
                        hasNext: false,
                        hasPrevious: false
                    },
                    success: false,
                    message: errorMessage
                }
            };
        }
    }

    // ========================================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================================

    /**
     * Prepares filter parameters for API call
     * Converts client-side parameter names to server-expected format
     */
    private prepareFilterParams(params: VisitFilterParams): Record<string, any> {
        const apiParams: Record<string, any> = {};

        // Map client params to server params
        if (params.clientName) apiParams.clientName = params.clientName;
        if (params.licensePlate) apiParams.licensePlate = params.licensePlate;
        if (params.status) apiParams.status = params.status;
        if (params.startDate) apiParams.startDate = params.startDate;
        if (params.endDate) apiParams.endDate = params.endDate;
        if (params.make) apiParams.make = params.make;
        if (params.model) apiParams.model = params.model;
        if (params.serviceName) apiParams.serviceName = params.serviceName;
        if (params.minPrice !== undefined) apiParams.minPrice = params.minPrice;
        if (params.maxPrice !== undefined) apiParams.maxPrice = params.maxPrice;

        return apiParams;
    }

    /**
     * Extracts user-friendly error message from various error types
     */
    private extractErrorMessage(error: unknown): string {
        if (ApiError.isApiError(error)) {
            // Handle specific API errors
            switch (error.status) {
                case 401:
                    return 'Sesja wygasła. Zaloguj się ponownie.';
                case 403:
                    return 'Brak uprawnień do tej operacji.';
                case 404:
                    return 'Nie znaleziono żądanych danych.';
                case 422:
                    return 'Nieprawidłowe dane wejściowe.';
                case 429:
                    return 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.';
                case 500:
                    return 'Błąd serwera. Spróbuj ponownie później.';
                case 503:
                    return 'Serwis tymczasowo niedostępny.';
                default:
                    return error.data?.message || error.message || 'Nieznany błąd API';
            }
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return 'Żądanie zostało anulowane (timeout).';
            }
            if (error.message.includes('fetch')) {
                return 'Błąd połączenia z serwerem.';
            }
            return error.message;
        }

        return 'Wystąpił nieoczekiwany błąd.';
    }
}

// ========================================================================================
// EXPORTS
// ========================================================================================

// Export singleton instance
export const visitsApi = new VisitsApi();

// Default export
export default visitsApi;