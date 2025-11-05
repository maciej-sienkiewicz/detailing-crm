// src/api/reservationsApi.ts
/**
 * API client for Reservations
 * Handles reservation operations before converting to full visits
 */

import { apiClientNew } from '../../../api/apiClientNew';
import { ProtocolStatus } from '../../../types';
import { PriceResponse, ServicePriceInput } from '../../../types/service';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

/**
 * Reservation status enum (matches backend)
 */
export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CONVERTED = 'CONVERTED',
    CANCELLED = 'CANCELLED'
}

/**
 * Service object as returned within a Reservation
 */
export interface ReservationService {
    id: string;
    name: string;
    basePrice: PriceResponse;
    quantity: number;
    finalPrice: PriceResponse;
    note?: string;
}

/**
 * Service input object for creating/updating a Reservation
 */
export interface ReservationSelectedServiceInput {
    serviceId: string; // Odpowiada 'service_id' w API
    name: string;
    basePrice: ServicePriceInput; // Odpowiada 'base_price' w API
    quantity: number;
    note?: string;
}

/**
 * Reservation entity (minimal data before visit creation)
 */
export interface Reservation {
    id: string;
    title: string;
    contactPhone: string;
    contactName?: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleDisplay: string; // Backend computed field: "Make Model"
    startDate: string; // ISO 8601
    endDate: string; // ISO 8601
    status: ReservationStatus;
    notes?: string;
    calendarColorId: string;
    visitId?: number; // Set after conversion
    canBeConverted: boolean; // Backend computed: status === CONFIRMED && !visitId

    services: ReservationService[];
    serviceCount: number;
    totalPriceNetto: number;
    totalPriceBrutto: number;
    totalTaxAmount: number;

    createdAt: string;
    updatedAt: string;
}

/**
 * Create reservation request
 */
export interface CreateReservationRequest {
    title: string;
    contactPhone: string;
    contactName?: string;
    vehicleMake: string;
    vehicleModel: string;
    startDate: string;
    endDate?: string;
    notes?: string;
    calendarColorId: string;
    selectedServices?: ReservationSelectedServiceInput[];
}

/**
 * Update reservation request
 */
export interface UpdateReservationRequest {
    title: string;
    contactPhone: string;
    contactName?: string;
    vehicleMake: string;
    vehicleModel: string;
    startDate: string;
    endDate?: string;
    notes?: string;
    calendarColorId: string;
    selectedServices?: ReservationSelectedServiceInput[];
}

/**
 * Change status request
 */
export interface ChangeStatusRequest {
    status: ReservationStatus;
    reason?: string;
}

/**
 * Reservation counters
 */
export interface ReservationCounters {
    pending: number;
    confirmed: number;
    converted: number;
    cancelled: number;
    all: number;
}

/**
 * Convert to visit request
 */
export interface ConvertToVisitRequest {
    ownerName: string;
    email?: string;
    companyName?: string;
    taxId?: string;
    address?: string;
    licensePlate: string;
    productionYear?: number;
    vin?: string;
    color?: string;
    mileage?: number;
    selectedServices: Array<{
        id: string;
        name: string;
        price: {
            inputPrice: number;
            inputType: 'netto' | 'brutto';
        };
        quantity: number;
        vatRate: number;
        discountType?: string;
        discountValue?: number;
        note?: string;
    }>;
    keysProvided?: boolean;
    documentsProvided?: boolean;
    additionalNotes?: string;
}

/**
 * Visit response after conversion
 */
export interface VisitResponse {
    id: string;
    title: string;
    clientId: string;
    vehicleId: string;
    startDate: string;
    endDate: string;
    status: ProtocolStatus;
    services: Array<{
        id: string;
        name: string;
        quantity: number;
        basePrice: PriceResponse;
        discount?: {
            type: string;
            value: number;
        };
        finalPrice: PriceResponse;
        approvalStatus: string;
        note?: string;
    }>;
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
 * List reservations query params
 */
export interface ListReservationsParams {
    page?: number;
    size?: number;
    sortBy?: 'id' | 'startDate' | 'endDate' | 'status' | 'createdAt' | 'updatedAt';
    sortDirection?: 'ASC' | 'DESC';
    status?: ReservationStatus;
}

// ========================================================================================
// RESERVATIONS API CLASS
// ========================================================================================

class ReservationsApi {
    /**
     * Creates a new reservation
     */
    async createReservation(data: CreateReservationRequest): Promise<Reservation> {
        try {
            const response = await apiClientNew.post<Reservation>(
                '/v1/reservations',
                data,
                { timeout: 15000 }
            );

            return response;
        } catch (error) {
            console.error('❌ Error creating reservation:', error);
            throw error;
        }
    }

    /**
     * Gets a single reservation by ID
     */
    async getReservation(reservationId: string): Promise<Reservation> {
        try {
            const response = await apiClientNew.get<Reservation>(
                `/v1/reservations/${reservationId}`,
                {},
                { timeout: 10000 }
            );

            return response;
        } catch (error) {
            console.error('❌ Error fetching reservation:', error);
            throw error;
        }
    }

    /**
     * Lists reservations with pagination and filtering
     */
    async listReservations(params: ListReservationsParams = {}): Promise<{
        data: Reservation[];
        page: number;
        size: number;
        totalItems: number;
        totalPages: number;
    }> {
        try {
            const queryParams: Record<string, any> = {
                page: params.page ?? 0,
                size: params.size ?? 20,
                sortBy: params.sortBy ?? 'startDate',
                sortDirection: params.sortDirection ?? 'ASC'
            };

            if (params.status) {
                queryParams.status = params.status;
            }

            const response = await apiClientNew.get<{
                data: Reservation[];
                page: number;
                size: number;
                totalItems: number;
                totalPages: number;
            }>(
                '/v1/reservations',
                queryParams,
                { timeout: 15000 }
            );

            return response;
        } catch (error) {
            console.error('❌ Error listing reservations:', error);
            throw error;
        }
    }

    /**
     * Updates an existing reservation
     */
    async updateReservation(
        reservationId: string,
        data: UpdateReservationRequest
    ): Promise<Reservation> {
        try {
            const response = await apiClientNew.put<Reservation>(
                `/v1/reservations/${reservationId}`,
                data,
                { timeout: 15000 }
            );

            return response;
        } catch (error) {
            console.error('❌ Error updating reservation:', error);
            throw error;
        }
    }

    /**
     * Changes reservation status
     */
    async changeStatus(
        reservationId: string,
        data: ChangeStatusRequest
    ): Promise<Reservation> {
        try {
            const response = await apiClientNew.patch<Reservation>(
                `/v1/reservations/${reservationId}/status`,
                data,
                { timeout: 10000 }
            );

            return response;
        } catch (error) {
            console.error('❌ Error changing reservation status:', error);
            throw error;
        }
    }

    /**
     * Deletes a reservation
     */
    async deleteReservation(reservationId: string): Promise<void> {
        try {
            await apiClientNew.delete(
                `/v1/reservations/${reservationId}`,
                { timeout: 10000 }
            );
        } catch (error) {
            console.error('❌ Error deleting reservation:', error);
            throw error;
        }
    }

    /**
     * Gets reservation counters by status
     */
    async getCounters(): Promise<ReservationCounters> {
        try {
            const response = await apiClientNew.get<ReservationCounters>(
                '/v1/reservations/counters',
                {},
                { timeout: 10000 }
            );

            return response;
        } catch (error) {
            console.error('❌ Error fetching reservation counters:', error);
            throw error;
        }
    }

    /**
     * Converts reservation to full visit
     * This creates Client, Vehicle, and Visit entities
     */
    async convertToVisit(
        reservationId: string,
        data: ConvertToVisitRequest
    ): Promise<VisitResponse> {
        try {
            const response = await apiClientNew.post<VisitResponse>(
                `/v1/reservations/${reservationId}/convert-to-visit`,
                data,
                { timeout: 20000 } // Longer timeout for complex operation
            );

            return response;
        } catch (error) {
            console.error('❌ Error converting reservation to visit:', error);
            throw error;
        }
    }
}

// ========================================================================================
// EXPORTS
// ========================================================================================

export const reservationsApi = new ReservationsApi();
export default reservationsApi;