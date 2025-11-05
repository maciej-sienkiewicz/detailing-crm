// src/features/services/hooks/useServiceCalculations.ts
import { useState } from 'react';
import { DiscountType, SelectedService, PriceResponse } from '../../../types';

/**
 * Locally calculates final price based on discount type and value
 * This is for immediate UX feedback - backend is the source of truth on save
 */
const calculateLocalFinalPrice = (
    basePrice: PriceResponse,
    discountType: DiscountType,
    discountValue: number
): PriceResponse => {
    const baseNetto = basePrice.priceNetto;
    let finalNetto = baseNetto;
    let discountAmount = 0;

    switch (discountType) {
        case DiscountType.PERCENTAGE:
            discountAmount = baseNetto * (discountValue / 100);
            finalNetto = baseNetto - discountAmount;
            break;

        case DiscountType.AMOUNT:
            discountAmount = discountValue;
            finalNetto = baseNetto - discountAmount;
            break;

        case DiscountType.FIXED_PRICE:
            finalNetto = discountValue;
            discountAmount = baseNetto - finalNetto;
            break;

        default:
            finalNetto = baseNetto;
            break;
    }

    if (finalNetto < 0) {
        finalNetto = 0;
    }

    const taxRate = 0.23;
    const priceBrutto = finalNetto * (1 + taxRate);
    const taxAmount = priceBrutto - finalNetto;

    return {
        priceNetto: parseFloat(finalNetto.toFixed(2)),
        priceBrutto: parseFloat(priceBrutto.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2))
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
    const addService = (newService: Omit<SelectedService, 'finalPrice'>) => {
        const finalPrice = newService.basePrice;

        const serviceWithFinalPrice: SelectedService = {
            ...newService,
            finalPrice: finalPrice
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