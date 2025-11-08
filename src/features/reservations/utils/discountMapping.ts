// src/features/reservations/utils/discountMapping.ts
/**
 * Mapping utilities between shared component DiscountType and Reservation API DiscountType
 * This adapter layer allows us to use shared components without modifying them
 */

import {DiscountType as ReservationDiscountType, Discount, DiscountType} from '../api/reservationsApi';


/**
 * Service with extended discount metadata
 */
export interface ServiceWithExtendedDiscount {
    id: string;
    rowId: string;
    name: string;
    quantity: number;
    basePrice: {
        priceNetto: number;
        priceBrutto: number;
        taxAmount: number;
    };
    // Shared component fields
    discountType: DiscountType;
    discountValue: number;
    finalPrice: {
        priceNetto: number;
        priceBrutto: number;
        taxAmount: number;
    };
    note?: string;
}