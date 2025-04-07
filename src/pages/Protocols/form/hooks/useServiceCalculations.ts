import { useState } from 'react';
import { DiscountType, SelectedService } from '../../../../types';

export const useServiceCalculations = (initialServices: SelectedService[] = []) => {
    // Upewniamy się, że wszystkie usługi mają pole quantity z wartością przynajmniej 1
    const servicesWithQuantity = initialServices.map(service => ({
        ...service,
    }));

    const [services, setServices] = useState<SelectedService[]>(servicesWithQuantity);

    // Oblicz sumy w tabeli usług
    const calculateTotals = () => {
        const totalPrice = services.reduce((sum, service) =>
            sum + (service.price), 0);

        const totalDiscount = services.reduce((sum, service) =>
            sum + ((service.price) - service.finalPrice), 0);

        const totalFinalPrice = services.reduce((sum, service) =>
            sum + service.finalPrice, 0);

        return {
            totalPrice,
            totalDiscount,
            totalFinalPrice
        };
    };

    // Dodaj wybraną usługę do tabeli
    const addService = (newService: Omit<SelectedService, 'finalPrice'>) => {
        // Ustaw domyślną ilość na 1 jeśli nie została określona

        // Oblicz cenę końcową w zależności od ilości, ceny i rabatu
        let finalPrice = newService.price;

        if (newService.discountType === DiscountType.PERCENTAGE) {
            finalPrice = finalPrice * (1 - newService.discountValue / 100);
        } else if (newService.discountType === DiscountType.AMOUNT) {
            finalPrice = Math.max(0, finalPrice - newService.discountValue);
        } else if (newService.discountType === DiscountType.FIXED_PRICE) {
            finalPrice = newService.discountValue;
        }

        const serviceWithFinalPrice: SelectedService = {
            ...newService,
            finalPrice: parseFloat(finalPrice.toFixed(2))
        };

        setServices([...services, serviceWithFinalPrice]);
        return [...services, serviceWithFinalPrice];
    };

    // Usuń usługę z tabeli
    const removeService = (serviceId: string) => {
        const updatedServices = services.filter(s => s.id !== serviceId);
        setServices(updatedServices);
        return updatedServices;
    };

    // Zmiana ceny bazowej usługi
    const updateBasePrice = (serviceId: string, newPrice: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                // Zachowaj obecne wartości rabatu i ilości, ale przelicz cenę końcową
                let newFinalPrice = newPrice;

                switch (service.discountType) {
                    case DiscountType.PERCENTAGE:
                        // Rabat procentowy - przelicz na podstawie procentu
                        newFinalPrice = newPrice * (1 - service.discountValue / 100);
                        break;
                    case DiscountType.AMOUNT:
                        // Rabat kwotowy - odejmij kwotę od nowej ceny bazowej * ilość
                        newFinalPrice = Math.max(0, newPrice - service.discountValue);
                        break;
                    case DiscountType.FIXED_PRICE:
                        // Cena stała - nie zmieniaj finalnej ceny
                        newFinalPrice = service.discountValue;
                        break;
                }

                return {
                    ...service,
                    price: newPrice,
                    finalPrice: parseFloat(newFinalPrice.toFixed(2))
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    // Nowa funkcja: aktualizacja ilości
    const updateQuantity = (serviceId: string) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                // Ograniczenie do minimum 1 sztuki

                // Przelicz cenę końcową na podstawie nowej ilości
                let newFinalPrice = service.price;

                switch (service.discountType) {
                    case DiscountType.PERCENTAGE:
                        newFinalPrice = service.price * (1 - service.discountValue / 100);
                        break;
                    case DiscountType.AMOUNT:
                        newFinalPrice = Math.max(0, service.price - service.discountValue);
                        break;
                    case DiscountType.FIXED_PRICE:
                        newFinalPrice = service.discountValue;
                        break;
                }

                return {
                    ...service,
                    finalPrice: parseFloat(newFinalPrice.toFixed(2))
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    // Aktualizacja typu rabatu
    const updateDiscountType = (serviceId: string, discountType: DiscountType) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                // Zachowujemy aktualną wartość rabatu i ilość, ale zmieniamy typ
                // i przeliczamy cenę końcową
                let newFinalPrice = service.price;
                let newDiscountValue = 0;

                // W zależności od nowego typu rabatu, konwertujemy wartość rabatu
                switch (discountType) {
                    case DiscountType.PERCENTAGE:
                        // Konwersja z innych typów na procenty
                        if (service.discountType === DiscountType.AMOUNT) {
                            // Z kwotowego na procentowy
                            newDiscountValue = (service.discountValue / (service.price)) * 100;
                            if (newDiscountValue > 100) newDiscountValue = 100;
                        } else if (service.discountType === DiscountType.FIXED_PRICE) {
                            // Z ceny finalnej na procentowy
                            newDiscountValue = ((service.price - service.discountValue) / (service.price)) * 100;
                            if (newDiscountValue < 0) newDiscountValue = 0;
                        }
                        newFinalPrice = service.price * (1 - newDiscountValue / 100);
                        break;

                    case DiscountType.AMOUNT:
                        // Konwersja z innych typów na kwotowy
                        if (service.discountType === DiscountType.PERCENTAGE) {
                            // Z procentowego na kwotowy
                            newDiscountValue = service.price * (service.discountValue / 100);
                        } else if (service.discountType === DiscountType.FIXED_PRICE) {
                            // Z ceny finalnej na kwotowy
                            newDiscountValue = service.price - service.discountValue;
                            if (newDiscountValue < 0) newDiscountValue = 0;
                        }
                        newFinalPrice = service.price - newDiscountValue;
                        break;

                    case DiscountType.FIXED_PRICE:
                        // Konwersja na cenę finalną
                        if (service.discountType === DiscountType.PERCENTAGE) {
                            // Z procentowego na cenę finalną
                            newDiscountValue = service.price * (1 - service.discountValue / 100);
                        } else if (service.discountType === DiscountType.AMOUNT) {
                            // Z kwotowego na cenę finalną
                            newDiscountValue = service.price - service.discountValue;
                            if (newDiscountValue < 0) newDiscountValue = 0;
                        }
                        newFinalPrice = newDiscountValue;
                        break;
                }

                return {
                    ...service,
                    discountType,
                    discountValue: parseFloat(newDiscountValue.toFixed(2)),
                    finalPrice: parseFloat(newFinalPrice.toFixed(2)),
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    // Aktualizacja wartości rabatu
    const updateDiscountValue = (serviceId: string, discountValue: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                let newDiscountValue = discountValue;
                let newFinalPrice = service.price;

                // Różna logika w zależności od typu rabatu
                switch (service.discountType) {
                    case DiscountType.PERCENTAGE:
                        // Limit procentowy od 0 do 100
                        if (newDiscountValue < 0) newDiscountValue = 0;
                        if (newDiscountValue > 100) newDiscountValue = 100;
                        newFinalPrice = service.price * (1 - newDiscountValue / 100);
                        break;

                    case DiscountType.AMOUNT:
                        // Limit kwotowy od 0 do łącznej ceny (cena * ilość)
                        if (newDiscountValue < 0) newDiscountValue = 0;
                        if (newDiscountValue > service.price) newDiscountValue = service.price;
                        newFinalPrice = service.price - newDiscountValue;
                        break;

                    case DiscountType.FIXED_PRICE:
                        // Limit ceny finalnej od 0 do ceny początkowej * ilość
                        if (newDiscountValue < 0) newDiscountValue = 0;
                        if (newDiscountValue > service.price) newDiscountValue = service.price;
                        newFinalPrice = newDiscountValue;
                        break;
                }

                return {
                    ...service,
                    discountValue: newDiscountValue,
                    finalPrice: parseFloat(newFinalPrice.toFixed(2)),
                };
            }
            return service;
        });

        setServices(updatedServices);
        return updatedServices;
    };

    // Dodajemy nową funkcję do aktualizacji notatki dla usługi
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
        updateQuantity // Eksportujemy nową funkcję do aktualizacji ilości
    };
};