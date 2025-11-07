// src/features/reservations/utils/discountValidation.ts
/**
 * Validation utilities for discount handling
 */

import { Discount, DiscountType } from '../api/reservationsApi';

export interface DiscountValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validates discount configuration
 */
export const validateDiscount = (
    discount: Discount | null | undefined,
    basePrice: number,
    quantity: number
): DiscountValidationResult => {
    // No discount is valid
    if (!discount || discount.discountValue === 0) {
        return { isValid: true };
    }

    const totalBasePrice = basePrice * quantity;

    // Validate discount value is not negative
    if (discount.discountValue < 0) {
        return {
            isValid: false,
            error: 'Wartość zniżki nie może być ujemna'
        };
    }

    // Validate based on discount type
    switch (discount.discountType) {
        case DiscountType.PERCENT:
            if (discount.discountValue > 100) {
                return {
                    isValid: false,
                    error: 'Zniżka procentowa nie może przekraczać 100%'
                };
            }
            break;

        case DiscountType.FIXED_AMOUNT_OFF_BRUTTO:
        case DiscountType.FIXED_AMOUNT_OFF_NETTO:
            if (discount.discountValue > totalBasePrice) {
                return {
                    isValid: false,
                    error: 'Kwota zniżki nie może być większa niż cena bazowa'
                };
            }
            break;

        case DiscountType.FIXED_FINAL_BRUTTO:
        case DiscountType.FIXED_FINAL_NETTO:
            if (discount.discountValue > totalBasePrice) {
                return {
                    isValid: false,
                    error: 'Końcowa cena nie może być większa niż cena bazowa'
                };
            }
            if (discount.discountValue < 0) {
                return {
                    isValid: false,
                    error: 'Końcowa cena nie może być ujemna'
                };
            }
            break;

        default:
            return {
                isValid: false,
                error: 'Nieznany typ zniżki'
            };
    }

    return { isValid: true };
};

/**
 * Calculates final price after discount
 */
export const calculateDiscountedPrice = (
    basePrice: number,
    quantity: number,
    discount: Discount | null | undefined
): number => {
    const totalBase = basePrice * quantity;

    if (!discount || discount.discountValue === 0) {
        return totalBase;
    }

    switch (discount.discountType) {
        case DiscountType.PERCENT:
            return totalBase * (1 - discount.discountValue / 100);

        case DiscountType.FIXED_AMOUNT_OFF_BRUTTO:
        case DiscountType.FIXED_AMOUNT_OFF_NETTO:
            return Math.max(0, totalBase - discount.discountValue);

        case DiscountType.FIXED_FINAL_BRUTTO:
        case DiscountType.FIXED_FINAL_NETTO:
            return discount.discountValue;

        default:
            return totalBase;
    }
};

/**
 * Formats discount for display
 */
export const formatDiscountDisplay = (discount: Discount): string => {
    switch (discount.discountType) {
        case DiscountType.PERCENT:
            return `${discount.discountValue}%`;

        case DiscountType.FIXED_AMOUNT_OFF_BRUTTO:
            return `-${discount.discountValue.toFixed(2)} zł (brutto)`;

        case DiscountType.FIXED_AMOUNT_OFF_NETTO:
            return `-${discount.discountValue.toFixed(2)} zł (netto)`;

        case DiscountType.FIXED_FINAL_BRUTTO:
            return `=${discount.discountValue.toFixed(2)} zł (brutto)`;

        case DiscountType.FIXED_FINAL_NETTO:
            return `=${discount.discountValue.toFixed(2)} zł (netto)`;

        default:
            return '';
    }
};

/**
 * Gets user-friendly label for discount type
 */
export const getDiscountTypeLabel = (type: DiscountType): string => {
    switch (type) {
        case DiscountType.PERCENT:
            return 'Procent (%)';
        case DiscountType.FIXED_AMOUNT_OFF_BRUTTO:
            return 'Kwota od ceny brutto';
        case DiscountType.FIXED_AMOUNT_OFF_NETTO:
            return 'Kwota od ceny netto';
        case DiscountType.FIXED_FINAL_BRUTTO:
            return 'Końcowa cena brutto';
        case DiscountType.FIXED_FINAL_NETTO:
            return 'Końcowa cena netto';
        default:
            return 'Nieznany typ';
    }
};