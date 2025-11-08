import { useState } from 'react';
import { SelectedService, PriceResponse } from '../../../types';
import { DiscountType } from "../../reservations/api/reservationsApi";

const VAT_RATE = 1.23;

const generateRowId = () => `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

    const roundedNetto = parseFloat(finalNetto.toFixed(2));
    const roundedTaxAmount = parseFloat(taxAmount.toFixed(2));
    const calculatedBrutto = roundedNetto + roundedTaxAmount;

    return {
        priceNetto: roundedNetto,
        priceBrutto: parseFloat(calculatedBrutto.toFixed(2)),
        taxAmount: roundedTaxAmount
    };
};

export const useServiceCalculations = (initialServices: SelectedService[] = []) => {
    const servicesWithRowIds = initialServices.map(service => ({
        ...service,
        rowId: service.rowId || generateRowId()
    }));

    const [services, setServices] = useState<SelectedService[]>(servicesWithRowIds);

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

    const addService = (newService: Omit<SelectedService, 'finalPrice' | 'rowId'>, note?: string) => {
        const finalPrice = calculateLocalFinalPrice(
            newService.basePrice,
            newService.discountType,
            newService.discountValue
        );

        const serviceWithFinalPrice: SelectedService = {
            ...newService,
            rowId: generateRowId(),
            finalPrice: finalPrice,
            note: note
        };

        setServices([...services, serviceWithFinalPrice]);
        return [...services, serviceWithFinalPrice];
    };

    const removeService = (rowId: string) => {
        const updatedServices = services.filter(s => s.rowId !== rowId);
        setServices(updatedServices);
        return updatedServices;
    };

    const updateBasePrice = (rowId: string, newPrice: number) => {
        const updatedServices = services.map(service => {
            if (service.rowId === rowId) {
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

    const updateQuantity = (rowId: string, newQuantity: number) => {
        const updatedServices = services.map(service => {
            if (service.rowId === rowId) {
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

    const updateDiscountType = (rowId: string, discountType: DiscountType) => {
        const updatedServices = services.map(service => {
            if (service.rowId === rowId) {
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

    const updateDiscountValue = (rowId: string, discountValue: number) => {
        const updatedServices = services.map(service => {
            if (service.rowId === rowId) {
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

    const updateServiceNote = (rowId: string, note: string) => {
        const updatedServices = services.map(service => {
            if (service.rowId === rowId) {
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