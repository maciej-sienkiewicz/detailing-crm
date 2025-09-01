// src/api/visitsApiNew.ts
/**
 * Production-ready Visits API
 * Handles all visit/protocol-related API operations with proper typing and error handling
 */

import {apiClientNew, ApiError, PaginatedApiResponse, PaginationParams} from './apiClientNew';
import {ProtocolStatus, DiscountType} from '../types';

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
 * Client visit history item (for client detail panel)
 */
export interface ClientVisitHistoryItem {
    id: string;
    startDate: string;
    endDate: string;
    status: ProtocolStatus;
    make: string;
    model: string;
    licensePlate: string;
    totalAmount: number;
    title: string;
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
    startDate?: string;
    endDate?: string;
    make?: string;
    model?: string;
    serviceName?: string;
    serviceIds?: string[];
    minPrice?: number;
    maxPrice?: number;
    status?: ProtocolStatus;
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
 * Add service item request
 */
export interface AddServiceItemRequest {
    serviceId?: string | null;
    name: string;
    basePrice: number;
    quantity: number;
    discountType?: string | null;
    discountValue?: number | null;
    finalPrice?: number | null;
    note?: string | null;
    description?: string | null;
    vatRate?: number;
}

/**
 * Add services to visit request
 */
export interface AddServicesToVisitRequest {
    services: AddServiceItemRequest[];
}

/**
 * Visit response from server
 */
export interface VisitResponse {
    id: string;
    title: string;
    clientId: string;
    vehicleId: string;
    startDate: string;
    endDate: string;
    status: ProtocolStatus;
    services: VisitServiceResponse[];
    totalAmount: number;
    serviceCount: number;
    notes?: string;
    referralSource?: string;
    appointmentId?: string;
    calendarColorId: string;
    keysProvided: boolean;
    documentsProvided: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Visit service response from server
 */
export interface VisitServiceResponse {
    id: string;
    name: string;
    basePrice: number;
    quantity: number;
    discount?: {
        type: string;
        value: number;
    };
    finalPrice: number;
    approvalStatus: string;
    note?: string;
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
     */
    async getVisitsList(params: VisitSearchParams = {}): Promise<VisitsApiResult<PaginatedApiResponse<VisitListItem>>> {
        try {
            console.log('🔍 Fetching visits list with params:', params);

            const { page = 0, size = 10, ...filterParams } = params;

            // Prepare filter parameters for the API
            const apiParams = this.prepareFilterParams(filterParams);
            console.log('🎯 Prepared API params:', apiParams);

            // Call the API
            const response = await apiClientNew.getWithPagination<any>(
                `/v1/protocols/list`,
                apiParams,
                { page, size },
                { timeout: 15000 }
            );

            console.log('✅ Raw API response:', response);

            // Transform the data to match expected interface
            const transformedData = this.transformVisitListData(response.data);

            const transformedResponse: PaginatedApiResponse<VisitListItem> = {
                data: transformedData,
                pagination: {
                    currentPage: response.pagination?.currentPage || page,
                    pageSize: response.pagination?.pageSize || size,
                    totalItems: response.pagination?.totalItems || 0,
                    totalPages: response.pagination?.totalPages || 0,
                    hasNext: response.pagination?.hasNext || false,
                    hasPrevious: response.pagination?.hasPrevious || false
                },
                success: true,
                message: response.message
            };

            console.log('✅ Successfully fetched visits list:', {
                count: transformedData.length,
                totalItems: transformedResponse.pagination.totalItems,
                currentPage: transformedResponse.pagination.currentPage,
                appliedFilters: apiParams
            });

            return {
                success: true,
                data: transformedResponse
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

    /**
     * Fetches client visit history for display in client detail panel
     */
    async getClientVisitHistory(
        clientId: string,
        params: PaginationParams = {}
    ): Promise<VisitsApiResult<PaginatedApiResponse<ClientVisitHistoryItem>>> {
        try {
            console.log('🔍 Fetching client visit history:', { clientId, params });

            const { page = 0, size = 5 } = params;

            // Call the new API endpoint for client visit history
            const response = await apiClientNew.getWithPagination<ClientVisitHistoryItem>(
                `/v1/protocols/client/${clientId}`,
                {},
                { page, size },
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched client visit history:', {
                clientId,
                visitCount: response.data.length,
                totalItems: response.pagination.totalItems,
                currentPage: response.pagination.currentPage
            });

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching client visit history:', error);

            const errorMessage = this.extractErrorMessage(error);

            return {
                success: false,
                error: errorMessage,
                details: error,
                data: {
                    data: [],
                    pagination: {
                        currentPage: params.page || 0,
                        pageSize: params.size || 5,
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

    /**
     * Adds services to an existing visit
     */
    async addServicesToVisit(
        visitId: string,
        services: Array<{
            id: string;
            name: string;
            price: number;
            discountType?: DiscountType;
            discountValue?: number;
            finalPrice: number;
            note?: string;
        }>
    ): Promise<VisitsApiResult<VisitResponse>> {
        try {
            console.log('🔧 Adding services to visit:', { visitId, servicesCount: services.length });

            // Map services to API request format
            const servicesRequest: AddServiceItemRequest[] = services.map(service => ({
                // If service ID is custom-generated (starts with 'custom-'), don't send it
                serviceId: service.id.startsWith('custom-') ? null : service.id,
                name: service.name,
                basePrice: service.price,
                quantity: 1, // Default quantity
                discountType: service.discountType || null,
                discountValue: service.discountValue || null,
                finalPrice: service.finalPrice,
                note: service.note || null,
                description: null, // Not used in current implementation
                vatRate: 23 // Default VAT rate
            }));

            const requestData: AddServicesToVisitRequest = {
                services: servicesRequest
            };

            console.log('📤 Sending services request:', requestData);

            // Make API call
            const response = await apiClientNew.post<VisitResponse>(
                `/v1/protocols/${visitId}/services`,
                requestData,
                { timeout: 15000 }
            );

            console.log('✅ Successfully added services to visit:', {
                visitId,
                responseId: response.id,
                serviceCount: response.services?.length || 0
            });

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error adding services to visit:', error);

            const errorMessage = this.extractErrorMessage(error);

            return {
                success: false,
                error: errorMessage,
                details: error
            };
        }
    }

    // ========================================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================================

    /**
     * FIXED: Transforms raw API data to match VisitListItem interface
     */
    private transformVisitListData(rawData: any[]): VisitListItem[] {
        if (!Array.isArray(rawData)) {
            console.warn('Raw data is not an array:', rawData);
            return [];
        }

        return rawData.map(item => {
            try {
                // Log individual item for debugging
                console.log('📋 Transforming visit item:', item);

                const transformed: VisitListItem = {
                    id: item.id?.toString() || '',
                    title: item.title || '',
                    vehicle: {
                        make: item.vehicle?.make || '',
                        model: item.vehicle?.model || '',
                        licensePlate: item.vehicle?.licensePlate || item.vehicle?.license_plate || '',
                        productionYear: item.vehicle?.productionYear || item.vehicle?.production_year || 0,
                        color: item.vehicle?.color || undefined
                    },
                    period: {
                        startDate: item.period?.startDate || item.period?.start_date || '',
                        endDate: item.period?.endDate || item.period?.end_date || ''
                    },
                    owner: {
                        // FIXED: Obsługa właściwego pola 'client' z odpowiedzi serwera
                        name: item.client?.name || item.owner?.name || '',
                        companyName: item.client?.companyName || item.client?.company_name || item.owner?.companyName || undefined
                    },
                    status: item.status as ProtocolStatus,
                    totalAmount: parseFloat(item.totalAmount?.toString() || item.total_amount?.toString() || '0'),
                    lastUpdate: item.lastUpdate || item.last_update || '',
                    calendarColorId: item.calendarColorId || item.calendar_color_id || '1',
                    // FIXED: Obsługa właściwego pola 'services' z odpowiedzi serwera
                    selectedServices: this.transformServices(item.services || item.selected_services || []),
                    totalServiceCount: parseInt(item.totalServiceCount?.toString() || item.total_service_count?.toString() || '0')
                };

                console.log('✅ Transformed visit item:', transformed);
                return transformed;
            } catch (error) {
                console.error('❌ Error transforming visit item:', error, item);
                // Return a fallback object instead of failing
                return {
                    id: item.id?.toString() || 'unknown',
                    title: item.title || 'Unknown Visit',
                    vehicle: {
                        make: item.vehicle?.make || 'Unknown',
                        model: item.vehicle?.model || 'Unknown',
                        licensePlate: item.vehicle?.licensePlate || item.vehicle?.license_plate || 'Unknown',
                        productionYear: item.vehicle?.productionYear || item.vehicle?.production_year || 0
                    },
                    period: {
                        startDate: item.period?.startDate || item.period?.start_date || '',
                        endDate: item.period?.endDate || item.period?.end_date || ''
                    },
                    owner: {
                        name: item.client?.name || item.owner?.name || 'Unknown Client'
                    },
                    status: (item.status as ProtocolStatus) || ProtocolStatus.SCHEDULED,
                    totalAmount: parseFloat(item.totalAmount?.toString() || item.total_amount?.toString() || '0'),
                    lastUpdate: item.lastUpdate || item.last_update || '',
                    calendarColorId: item.calendarColorId || item.calendar_color_id || '1',
                    selectedServices: this.transformServices(item.services || item.selected_services || []),
                    totalServiceCount: parseInt(item.totalServiceCount?.toString() || item.total_service_count?.toString() || '0')
                } as VisitListItem;
            }
        });
    }

    /**
     * Transforms services data
     */
    private transformServices(services: any[]): VisitServiceSummary[] {
        if (!Array.isArray(services)) {
            return [];
        }

        return services.map(service => ({
            id: service.id?.toString() || '',
            name: service.name || '',
            price: parseFloat(service.price?.toString() || '0'),
            finalPrice: parseFloat(service.finalPrice?.toString() || service.final_price?.toString() || service.price?.toString() || '0'),
            quantity: parseInt(service.quantity?.toString() || '1'),
            discountType: service.discountType || service.discount_type,
            discountValue: service.discountValue || service.discount_value,
            approvalStatus: service.approvalStatus || service.approval_status,
            note: service.note
        }));
    }

    /**
     * FIXED: Improved filter parameters preparation with better status mapping
     */
    private prepareFilterParams(params: VisitFilterParams): Record<string, any> {
        const apiParams: Record<string, any> = {};

        // Map client params to server params
        if (params.clientName) apiParams.clientName = params.clientName;
        if (params.licensePlate) apiParams.licensePlate = params.licensePlate;
        if (params.startDate) apiParams.startDate = params.startDate;
        if (params.endDate) apiParams.endDate = params.endDate;
        if (params.make) apiParams.make = params.make;
        if (params.model) apiParams.model = params.model;
        if (params.serviceName) apiParams.serviceName = params.serviceName;
        if (params.minPrice !== undefined) apiParams.minPrice = params.minPrice;
        if (params.maxPrice !== undefined) apiParams.maxPrice = params.maxPrice;

        // Handle status filter properly
        if (params.status) {
            apiParams.status = params.status;
            console.log('🎯 Added status filter:', params.status);
        }

        // Handle serviceIds array
        if (params.serviceIds && Array.isArray(params.serviceIds) && params.serviceIds.length > 0) {
            apiParams.serviceIds = params.serviceIds;
            console.log('🔧 Added serviceIds to API params:', params.serviceIds);
        }

        console.log('📋 Final prepared params:', apiParams);
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