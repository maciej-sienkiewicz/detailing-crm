import {useState} from 'react';
import {DiscountType, SelectedService} from '../../../../types';

/**
 * Hook do zarządzania usługami i rabatami w protokole.
 *
 * WAŻNE: Ten hook NIE LICZY cen brutto/netto - tylko wyświetla wartości z backendu.
 * Backend zwraca już przeliczone wartości finalPrice, które zawierają rabaty.
 *
 * Logika rabatów:
 * - Frontend ustawia typ rabatu i wartość
 * - Backend przelicza finalPrice na podstawie basePrice i rabatu
 * - Frontend tylko wyświetla przeliczone wartości
 */
export const useServiceCalculations = (initialServices: SelectedService[] = []) => {
    const servicesWithQuantity = initialServices.map(service => ({
        ...service,
    }));

    const [services, setServices] = useState<SelectedService[]>(servicesWithQuantity);

    /**
     * Oblicza sumy dla tabeli usług.
     * UWAGA: Operuje na wartościach NETTO (zgodnie z modelem SelectedService).
     * Wyświetlanie brutto/netto jest w komponencie ServiceTable.
     */
    const calculateTotals = () => {
        // Suma cen bazowych (netto)
        const totalPrice = services.reduce((sum, service) =>
            sum + service.basePrice.priceNetto, 0);

        // Suma rabatów (różnica między basePrice a finalPrice, netto)
        const totalDiscount = services.reduce((sum, service) =>
            sum + (service.basePrice.priceNetto - service.finalPrice.priceNetto), 0);

        // Suma cen końcowych (netto)
        const totalFinalPrice = services.reduce((sum, service) =>
            sum + service.finalPrice.priceNetto, 0);

        return {
            totalPrice,
            totalDiscount,
            totalFinalPrice
        };
    };

    /**
     * Dodaje nową usługę do listy.
     * UWAGA: finalPrice jest opcjonalny - jeśli nie podano, używamy basePrice.
     * Backend przy zapisie protokołu przeliczy finalPrice na podstawie rabatu.
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
     * UWAGA: Przekazywana wartość newPrice jest z inputu użytkownika.
     * Backend przy zapisie protokołu ustawi prawidłowe wartości PriceResponse.
     *
     * Tymczasowo ustawiamy wartości lokalnie dla podglądu:
     * - Jeśli to wartość brutto, backend ją przeliczy
     * - Jeśli to wartość netto, backend ją przeliczy
     */
    const updateBasePrice = (serviceId: string, newPrice: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                // Tymczasowo zakładamy że to cena netto dla lokalnego wyświetlania
                // Backend przelczy to poprawnie
                const newBasePrice = {
                    priceNetto: newPrice,
                    priceBrutto: newPrice * 1.23, // Tymczasowe oszacowanie
                    taxAmount: newPrice * 0.23
                };

                // finalPrice też aktualizujemy tymczasowo
                // Backend przelczy to poprawnie z uwzględnieniem rabatu
                const newFinalPrice = {
                    priceNetto: newPrice,
                    priceBrutto: newPrice * 1.23,
                    taxAmount: newPrice * 0.23
                };

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
                return {
                    ...service,
                    discountType,
                    // Resetujemy wartość rabatu przy zmianie typu
                    discountValue: 0,
                    // finalPrice pozostaje bez zmian do momentu zapisu
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
                return {
                    ...service,
                    discountValue: discountValue,
                    // finalPrice pozostaje bez zmian do momentu zapisu
                    // Backend przeliczy to przy zapisie protokołu
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