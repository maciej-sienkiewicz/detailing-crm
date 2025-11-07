// src/features/services/hooks/useServiceCalculations.ts
import { useState } from 'react';
import { SelectedService, PriceResponse } from '../../../types';
import {DiscountType} from "../../reservations/api/reservationsApi";
const VAT_RATE = 1.23;
/**
 * Locally calculates final price based on discount type and value
 * This is for immediate UX feedback - backend is the source of truth on save
 */
export const calculateLocalFinalPrice = (
    basePrice: PriceResponse,
    discountType: DiscountType,
    discountValue: number
): PriceResponse => {
    const baseNetto = basePrice.priceNetto;
    const baseBrutto = basePrice.priceBrutto;

    let finalNetto;
    let finalBrutto;
    let taxAmount;

    switch (discountType) {
        case DiscountType.PERCENT:
            finalNetto = baseNetto * (1 - discountValue / 100);
            finalBrutto = baseBrutto * (1 - discountValue / 100);
            taxAmount = finalBrutto - finalNetto;
            break;

        case DiscountType.FIXED_AMOUNT_OFF_BRUTTO:
            finalBrutto = baseBrutto - discountValue;
            finalNetto = finalBrutto / VAT_RATE;
            taxAmount = finalBrutto - finalNetto;
            break;

        case DiscountType.FIXED_AMOUNT_OFF_NETTO:
            finalNetto = baseNetto - discountValue;
            finalBrutto = finalNetto * VAT_RATE;
            taxAmount = finalBrutto - finalNetto;
            break;

        case DiscountType.FIXED_FINAL_BRUTTO:
            finalBrutto = discountValue;
            finalNetto = finalBrutto / VAT_RATE;
            taxAmount = finalBrutto - finalNetto;
            break;

        case DiscountType.FIXED_FINAL_NETTO:
            finalNetto = discountValue;
            finalBrutto = finalNetto * VAT_RATE;
            taxAmount = finalBrutto - finalNetto;
            break;

        default:
            return {
                priceNetto: parseFloat(baseNetto.toFixed(2)),
                priceBrutto: parseFloat(baseBrutto.toFixed(2)),
                taxAmount: parseFloat((baseBrutto - baseNetto).toFixed(2))
            };
    }

    // Kluczowe dla poprawności księgowej: zaokrąglamy składniki (Netto i VAT),
    // a Brutto ustalamy na podstawie tych zaokrągleń.
    const roundedNetto = parseFloat(finalNetto.toFixed(2));
    const roundedTaxAmount = parseFloat(taxAmount.toFixed(2));
    const calculatedBrutto = roundedNetto + roundedTaxAmount;


    return {
        priceNetto: roundedNetto,
        priceBrutto: parseFloat(calculatedBrutto.toFixed(2)), // W ten sposób suma netto i VAT zgadza się z brutto
        taxAmount: roundedTaxAmount
    };
};

/**
 * Hook for managing services and discounts
 * Provides local calculations for immediate UX feedback
 * Backend recalculates authoritatively on save
 */
export const useServiceCalculations = (initialServices: SelectedService[] = []) => {
    const servicesWithQuantity = initialServices.map(service => ({
        ...service,
    }));

    const [services, setServices] = useState<SelectedService[]>(servicesWithQuantity);

    /**
     * Calculate totals for the services table (operates on NETTO values)
     */
    const calculateTotals = () => {
        const totalPrice = services.reduce((sum, service) =>
            sum + service.basePrice.priceNetto, 0);

        const totalDiscount = services.reduce((sum, service) =>
            sum + (service.basePrice.priceNetto - service.finalPrice.priceNetto), 0);

        const totalFinalPrice = services.reduce((sum, service) =>
            sum + service.finalPrice.priceNetto, 0);

        return {
            totalPrice: parseFloat(totalPrice.toFixed(2)),
            totalDiscount: parseFloat(totalDiscount.toFixed(2)),
            totalFinalPrice: parseFloat(totalFinalPrice.toFixed(2))
        };
    };

    /**
     * Add a new service to the list
     */
    const addService = (newService: Omit<SelectedService, 'finalPrice'>, note?: string) => {
        const finalPrice = newService.basePrice;

        const serviceWithFinalPrice: SelectedService = {
            ...newService,
            finalPrice: finalPrice,
            note: note
        };

        setServices([...services, serviceWithFinalPrice]);
        return [...services, serviceWithFinalPrice];
    };

    /**
     * Remove a service from the list
     */
    const removeService = (serviceId: string) => {
        const updatedServices = services.filter(s => s.id !== serviceId);
        setServices(updatedServices);
        return updatedServices;
    };

    /**
     * Update service base price
     * Recalculates final price locally based on existing discount
     */
    const updateBasePrice = (serviceId: string, newPrice: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                const newBaseNetto = newPrice;
                const newBasePrice = {
                    priceNetto: newBaseNetto,
                    priceBrutto: newBaseNetto * 1.23,
                    taxAmount: newBaseNetto * 0.23
                };

                const newFinalPrice = calculateLocalFinalPrice(
                    newBasePrice,
                    service.discountType,
                    service.discountValue
                );

                return {
                    ...service,
                    basePrice: newBasePrice,
                    finalPrice: newFinalPrice
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    /**
     * Update service quantity (for future use if needed)
     */
    const updateQuantity = (serviceId: string, newQuantity: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                return {
                    ...service,
                    quantity: newQuantity
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    /**
     * Update discount type
     * Resets discount value and recalculates final price
     */
    const updateDiscountType = (serviceId: string, discountType: DiscountType) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                const resetDiscountValue = 0;

                const newFinalPrice = calculateLocalFinalPrice(
                    service.basePrice,
                    discountType,
                    resetDiscountValue
                );

                return {
                    ...service,
                    discountType,
                    discountValue: resetDiscountValue,
                    finalPrice: newFinalPrice
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    /**
     * Update discount value
     * Recalculates final price locally
     */
    const updateDiscountValue = (serviceId: string, discountValue: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                const newFinalPrice = calculateLocalFinalPrice(
                    service.basePrice,
                    service.discountType,
                    discountValue
                );

                return {
                    ...service,
                    discountValue: discountValue,
                    finalPrice: newFinalPrice
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    /**
     * Update service note
     */
    const updateServiceNote = (serviceId: string, note: string) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                return {
                    ...service,
                    note
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    return {
        services,
        setServices,
        calculateTotals,
        addService,
        removeService,
        updateBasePrice,
        updateDiscountType,
        updateDiscountValue,
        updateServiceNote,
        updateQuantity
    };
};