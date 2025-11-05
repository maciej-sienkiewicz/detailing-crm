// src/api/visitsApiNew.ts
/**
 * Production-ready Visits API
 * Handles all visit/protocol-related API operations with proper typing and error handling
 */

import {apiClientNew, ApiError, PaginatedApiResponse, PaginationParams} from '../shared/api/apiClientNew';
import {ProtocolStatus, DiscountType} from '../types';
import {PriceResponse, PriceType} from '../types/service';

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
    // ✅ ZMIANA: zamiast totalAmount: number
    totalAmountNetto: number;
    totalAmountBrutto: number;
    totalTaxAmount: number;
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
    revenue: PriceResponse;
    title: string;
}

/**
 * Service summary for visit lists
 */
export interface VisitServiceSummary {
    id: string;
    name: string;
    quantity: number;
    basePrice: PriceResponse;      // ✅ ZMIANA: było price: number
    finalPrice: PriceResponse;     // ✅ ZMIANA: było finalPrice: number
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
    price: {
        inputPrice: number;
        inputType: PriceType;
    };
    quantity: number;
    discountType?: string | null;
    discountValue?: number | null;
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
 * Remove service from visit request
 */
export interface RemoveServiceFromVisitRequest {
    serviceId: string;
    reason?: string | null;
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
    // ✅ ZMIANA: zamiast totalAmount: number
    totalAmountNetto: number;
    totalAmountBrutto: number;
    totalTaxAmount: number;
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
    quantity: number;
    basePrice: PriceResponse;      // ✅ ZMIANA
    discount?: {
        type: string;
        value: number;
    };
    finalPrice: PriceResponse;     // ✅ ZMIANA
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
            const { page = 0, size = 10, ...filterParams } = params;

            // Prepare filter parameters for the API
            const apiParams = this.prepareFilterParams(filterParams);

            // Call the API
            const response = await apiClientNew.getWithPagination<any>(
                `/v1/protocols/list`,
                apiParams,
                { page, size },
                { timeout: 15000 }
            );

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

    async deleteVisit(visitId: string): Promise<void> {
        await apiClientNew.delete(`/v1/protocols/${visitId}`, {timeout: 10000})
    }

    /**
     * Fetches client visit history for display in client detail panel
     */
    async getClientVisitHistory(
        clientId: string,
        params: PaginationParams = {}
    ): Promise<VisitsApiResult<PaginatedApiResponse<ClientVisitHistoryItem>>> {
        try {
            const { page = 0, size = 5 } = params;

            // Call the new API endpoint for client visit history
            const response = await apiClientNew.getWithPagination<ClientVisitHistoryItem>(
                `/v1/protocols/client/${clientId}`,
                {},
                { page, size },
                { timeout: 10000 }
            );

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
     * ✅ ZAKTUALIZOWANE: Adds services to an existing visit
     */
    async addServicesToVisit(
        visitId: string,
        services: Array<{
            id: string;
            name: string;
            basePrice: PriceResponse;    // ✅ ZMIANA
            discountType?: DiscountType;
            discountValue?: number;
            finalPrice: PriceResponse;   // ✅ ZMIANA (chociaż może nie być używane w request)
            note?: string;
        }>
    ): Promise<VisitsApiResult<VisitResponse>> {
        try {
            // Map services to API request format
            const servicesRequest: AddServiceItemRequest[] = services.map(service => ({
                serviceId: service.id.startsWith('custom-') ? null : service.id,
                name: service.name,
                price: {
                    inputPrice: service.basePrice.priceNetto,  // ✅ Używamy priceNetto
                    inputType: PriceType.NET
                },
                quantity: 1,
                discountType: service.discountType || null,
                discountValue: service.discountValue || null,
                note: service.note || null,
                description: null,
                vatRate: 23
            }));

            const requestData: AddServicesToVisitRequest = {
                services: servicesRequest
            };

            const response = await apiClientNew.post<VisitResponse>(
                `/v1/protocols/${visitId}/services`,
                requestData,
                { timeout: 15000 }
            );

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

    /**
     * Removes a service from an existing visit
     */
    async removeServiceFromVisit(
        visitId: string,
        serviceId: string,
        reason?: string
    ): Promise<VisitsApiResult<VisitResponse>> {
        try {
            const requestData = {
                serviceId,
                reason: reason || null
            };

            // Make API call using fetch directly since DELETE with body needs custom handling
            const url = `${'/api'}/v1/protocols/${visitId}/services`;
            const token = localStorage.getItem('auth_token');

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    service_id: serviceId,
                    reason: reason || null
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Transform snake_case to camelCase
            const transformedData = this.transformToCamelCase(data);

            return {
                success: true,
                data: transformedData
            };

        } catch (error) {
            console.error('❌ Error removing service from visit:', error);

            const errorMessage = this.extractErrorMessage(error);

            return {
                success: false,
                error: errorMessage,
                details: error
            };
        }
    }

    /**
     * Helper method to transform snake_case to camelCase
     */
    private transformToCamelCase(obj: any): any {
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.transformToCamelCase(item));
        }

        const converted: Record<string, any> = {};

        for (const [key, value] of Object.entries(obj)) {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            converted[camelKey] = this.transformToCamelCase(value);
        }

        return converted;
    }

    // ========================================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================================

    /**
     * ✅ ZAKTUALIZOWANE: Transforms raw API data to match VisitListItem interface
     */
    private transformVisitListData(rawData: any[]): VisitListItem[] {
        if (!Array.isArray(rawData)) {
            console.warn('Raw data is not an array:', rawData);
            return [];
        }

        return rawData.map(item => {
            try {
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
                        name: item.client?.name || item.owner?.name || '',
                        companyName: item.client?.companyName || item.client?.company_name || item.owner?.companyName || undefined
                    },
                    status: item.status as ProtocolStatus,
                    // ✅ ZMIANA: Obsługa nowych pól z cenami
                    totalAmountNetto: parseFloat(item.totalAmountNetto?.toString() || item.total_amount_netto?.toString() || '0'),
                    totalAmountBrutto: parseFloat(item.totalAmountBrutto?.toString() || item.total_amount_brutto?.toString() || '0'),
                    totalTaxAmount: parseFloat(item.totalTaxAmount?.toString() || item.total_tax_amount?.toString() || '0'),
                    lastUpdate: item.lastUpdate || item.last_update || '',
                    calendarColorId: item.calendarColorId || item.calendar_color_id || '1',
                    selectedServices: this.transformServices(item.services || item.selected_services || []),
                    totalServiceCount: parseInt(item.totalServiceCount?.toString() || item.total_service_count?.toString() || '0')
                };
                return transformed;
            } catch (error) {
                console.error('❌ Error transforming visit item:', error, item);
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
                    status: (item.status as ProtocolStatus) || ProtocolStatus.IN_PROGRESS,
                    totalAmountNetto: 0,
                    totalAmountBrutto: 0,
                    totalTaxAmount: 0,
                    lastUpdate: item.lastUpdate || item.last_update || '',
                    calendarColorId: item.calendarColorId || item.calendar_color_id || '1',
                    selectedServices: this.transformServices(item.services || item.selected_services || []),
                    totalServiceCount: parseInt(item.totalServiceCount?.toString() || item.total_service_count?.toString() || '0')
                } as VisitListItem;
            }
        });
    }

    /**
     * ✅ ZAKTUALIZOWANE: Transforms services data
     */
    /**
     * ✅ POPRAWIONE: Transforms services data
     */
    private transformServices(services: any[]): VisitServiceSummary[] {
        if (!Array.isArray(services)) {
            return [];
        }

        return services.map(service => ({
            id: service.id?.toString() || '',
            name: service.name || '',
            quantity: parseInt(service.quantity?.toString() || '1'),
            // ✅ POPRAWKA: basePrice jako PriceResponse - obsługa zarówno zagnieżdżonej jak i płaskiej struktury
            basePrice: {
                priceNetto: parseFloat(
                    service.basePrice?.priceNetto?.toString() ||
                    service.base_price?.price_netto?.toString() ||
                    service.basePriceNetto?.toString() ||
                    service.base_price_netto?.toString() ||
                    '0'
                ),
                priceBrutto: parseFloat(
                    service.basePrice?.priceBrutto?.toString() ||
                    service.base_price?.price_brutto?.toString() ||
                    service.basePriceBrutto?.toString() ||
                    service.base_price_brutto?.toString() ||
                    '0'
                ),
                taxAmount: parseFloat(
                    service.basePrice?.taxAmount?.toString() ||
                    service.base_price?.tax_amount?.toString() ||
                    service.baseTaxAmount?.toString() ||
                    service.base_tax_amount?.toString() ||
                    '0'
                )
            },
            // ✅ POPRAWKA: finalPrice jako PriceResponse - obsługa zarówno zagnieżdżonej jak i płaskiej struktury
            finalPrice: {
                priceNetto: parseFloat(
                    service.finalPrice?.priceNetto?.toString() ||
                    service.final_price?.price_netto?.toString() ||
                    service.finalPriceNetto?.toString() ||          // ✅ Dodane!
                    service.final_price_netto?.toString() ||
                    '0'
                ),
                priceBrutto: parseFloat(
                    service.finalPrice?.priceBrutto?.toString() ||
                    service.final_price?.price_brutto?.toString() ||
                    service.finalPriceBrutto?.toString() ||         // ✅ Dodane!
                    service.final_price_brutto?.toString() ||
                    '0'
                ),
                taxAmount: parseFloat(
                    service.finalPrice?.taxAmount?.toString() ||
                    service.final_price?.tax_amount?.toString() ||
                    service.finalTaxAmount?.toString() ||           // ✅ Dodane!
                    service.final_tax_amount?.toString() ||
                    '0'
                )
            },
            discountType: service.discountType || service.discount_type,
            discountValue: service.discountValue || service.discount_value,
            approvalStatus: service.approvalStatus || service.approval_status,
            note: service.note
        }));
    }

    /**
     * Improved filter parameters preparation with better status mapping
     */
    private prepareFilterParams(params: VisitFilterParams): Record<string, any> {
        const apiParams: Record<string, any> = {};

        if (params.clientName) apiParams.clientName = params.clientName;
        if (params.licensePlate) apiParams.licensePlate = params.licensePlate;
        if (params.startDate) apiParams.startDate = params.startDate;
        if (params.endDate) apiParams.endDate = params.endDate;
        if (params.make) apiParams.make = params.make;
        if (params.model) apiParams.model = params.model;
        if (params.serviceName) apiParams.serviceName = params.serviceName;
        if (params.minPrice !== undefined) apiParams.minPrice = params.minPrice;
        if (params.maxPrice !== undefined) apiParams.maxPrice = params.maxPrice;

        if (params.status) {
            apiParams.status = params.status;
        }

        if (params.serviceIds && Array.isArray(params.serviceIds) && params.serviceIds.length > 0) {
            apiParams.serviceIds = params.serviceIds;
        }
        return apiParams;
    }

    /**
     * Extracts user-friendly error message from various error types
     */
    private extractErrorMessage(error: unknown): string {
        if (ApiError.isApiError(error)) {
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

export const visitsApi = new VisitsApi();
export default visitsApi;