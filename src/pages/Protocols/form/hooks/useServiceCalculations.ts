import { useState } from 'react';
import { DiscountType, SelectedService, PriceResponse } from '../../../../types';

// --- NOWA FUNKCJA DO LOKALNEGO PRZELICZANIA CENY KOŃCOWEJ ---
const calculateLocalFinalPrice = (
    basePrice: PriceResponse,
    discountType: DiscountType,
    discountValue: number
): PriceResponse => {

    // Założenie: Używamy ceny netto do kalkulacji, a VAT to 23% (jak w updateBasePrice)
    const baseNetto = basePrice.priceNetto;
    let finalNetto = baseNetto;
    let discountAmount = 0;

    switch (discountType) {
        case DiscountType.PERCENTAGE:
            // Obliczenie kwoty rabatu: baseNetto * (discountValue / 100)
            discountAmount = baseNetto * (discountValue / 100);
            finalNetto = baseNetto - discountAmount;
            break;

        case DiscountType.AMOUNT:
            // Odejmujemy kwotę rabatu. Zakładamy, że kwota rabatu jest netto.
            discountAmount = discountValue;
            finalNetto = baseNetto - discountAmount;
            break;

        case DiscountType.FIXED_PRICE:
            // Cena końcowa netto jest równa podanej wartości.
            finalNetto = discountValue;
            // Kwota rabatu: baseNetto - finalNetto
            discountAmount = baseNetto - finalNetto;
            break;

        default:
            finalNetto = baseNetto;
            break;
    }

    // Upewniamy się, że cena netto nie jest ujemna
    if (finalNetto < 0) {
        finalNetto = 0;
    }

    // Obliczenie brutto i VAT na podstawie nowej ceny netto (zakładamy 23% VAT)
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
 * Hook do zarządzania usługami i rabatami w protokole.
 *
 * WAŻNE: Ten hook TERAZ LICZY ceny finalne LOKALNIE dla PODGLĄDU.
 * Backend nadal jest źródłem prawdy przy zapisie.
 * * Logika rabatów:
 * - Frontend ustawia typ rabatu i wartość
 * - **Frontend przelicza finalPrice LOKALNIE dla UX**
 * - Backend przelicza finalPrice autorytatywnie przy zapisie
 */
export const useServiceCalculations = (initialServices: SelectedService[] = []) => {
    const servicesWithQuantity = initialServices.map(service => ({
        ...service,
    }));

    const [services, setServices] = useState<SelectedService[]>(servicesWithQuantity);

    /**
     * Oblicza sumy dla tabeli usług.
     * Operuje na wartościach NETTO.
     */
    const calculateTotals = () => {
        // ... (reszta funkcji bez zmian)
        const totalPrice = services.reduce((sum, service) =>
            sum + service.basePrice.priceNetto, 0);

        // Suma rabatów (różnica między basePrice a finalPrice, netto)
        const totalDiscount = services.reduce((sum, service) =>
            sum + (service.basePrice.priceNetto - service.finalPrice.priceNetto), 0);

        // Suma cen końcowych (netto)
        const totalFinalPrice = services.reduce((sum, service) =>
            sum + service.finalPrice.priceNetto, 0);

        return {
            totalPrice: parseFloat(totalPrice.toFixed(2)),
            totalDiscount: parseFloat(totalDiscount.toFixed(2)),
            totalFinalPrice: parseFloat(totalFinalPrice.toFixed(2))
        };
    };

    /**
     * Dodaje nową usługę do listy.
     */
    const addService = (newService: Omit<SelectedService, 'finalPrice'>) => {
        // Jeśli nie ma finalPrice, użyj basePrice (brak rabatu)
        const finalPrice = newService.basePrice;

        const serviceWithFinalPrice: SelectedService = {
            ...newService,
            finalPrice: finalPrice
        };

        setServices([...services, serviceWithFinalPrice]);
        return [...services, serviceWithFinalPrice];
    };

    /**
     * Usuwa usługę z listy.
     */
    const removeService = (serviceId: string) => {
        const updatedServices = services.filter(s => s.id !== serviceId);
        setServices(updatedServices);
        return updatedServices;
    };

    /**
     * Aktualizuje cenę bazową usługi.
     * UWAGA: Tymczasowo ustawiamy finalPrice = basePrice,
     * a backend przeliczy rabaty przy zapisie.
     */
    const updateBasePrice = (serviceId: string, newPrice: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                // Tymczasowo zakładamy że to cena netto dla lokalnego wyświetlania
                // Backend przelczy to poprawnie
                const newBaseNetto = newPrice;
                const newBasePrice = {
                    priceNetto: newBaseNetto,
                    priceBrutto: newBaseNetto * 1.23, // Tymczasowe oszacowanie
                    taxAmount: newBaseNetto * 0.23
                };

                // LOKALNIE PRZELICZAMY FINAL PRICE NA BIEŻĄCO Z UWZGLĘDNIENIEM ISTNIEJĄCEGO RABATU
                const newFinalPrice = calculateLocalFinalPrice(
                    newBasePrice,
                    service.discountType,
                    service.discountValue
                );

                return {
                    ...service,
                    basePrice: newBasePrice,
                    finalPrice: newFinalPrice // Aktualizujemy finalPrice
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    /**
     * Aktualizuje ilość usługi (na przyszłość, jeśli będzie potrzebne).
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
     * Aktualizuje typ rabatu.
     * UWAGA: Backend przeliczy finalPrice na podstawie tego typu.
     */
    const updateDiscountType = (serviceId: string, discountType: DiscountType) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                const resetDiscountValue = 0; // Resetujemy wartość rabatu przy zmianie typu

                // LOKALNIE PRZELICZAMY FINAL PRICE
                const newFinalPrice = calculateLocalFinalPrice(
                    service.basePrice,
                    discountType,
                    resetDiscountValue
                );

                return {
                    ...service,
                    discountType,
                    discountValue: resetDiscountValue,
                    finalPrice: newFinalPrice // LOKALNA AKTUALIZACJA
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    /**
     * Aktualizuje wartość rabatu.
     * UWAGA: Backend przeliczy finalPrice na podstawie tej wartości.
     */
    const updateDiscountValue = (serviceId: string, discountValue: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {

                // LOKALNIE PRZELICZAMY FINAL PRICE
                const newFinalPrice = calculateLocalFinalPrice(
                    service.basePrice,
                    service.discountType,
                    discountValue
                );

                return {
                    ...service,
                    discountValue: discountValue,
                    finalPrice: newFinalPrice // LOKALNA AKTUALIZACJA
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    /**
     * Aktualizuje notatkę dla usługi.
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