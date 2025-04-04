import { useState } from 'react';
import { DiscountType, SelectedService } from '../../../../types';

export const useServiceCalculations = (initialServices: SelectedService[] = []) => {
    // Upewniamy się, że wszystkie usługi mają pole quantity z wartością przynajmniej 1
    const servicesWithQuantity = initialServices.map(service => ({
        ...service,
        quantity: service.quantity || 1
    }));

    const [services, setServices] = useState<SelectedService[]>(servicesWithQuantity);

    // Oblicz sumy w tabeli usług
    const calculateTotals = () => {
        const totalPrice = services.reduce((sum, service) =>
            sum + (service.price * (service.quantity || 1)), 0);

        const totalDiscount = services.reduce((sum, service) =>
            sum + ((service.price * (service.quantity || 1)) - service.finalPrice), 0);

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
        const quantity = newService.quantity || 1;

        // Oblicz cenę końcową w zależności od ilości, ceny i rabatu
        let finalPrice = newService.price * quantity;

        if (newService.discountType === DiscountType.PERCENTAGE) {
            finalPrice = finalPrice * (1 - newService.discountValue / 100);
        } else if (newService.discountType === DiscountType.AMOUNT) {
            finalPrice = Math.max(0, finalPrice - newService.discountValue);
        } else if (newService.discountType === DiscountType.FIXED_PRICE) {
            finalPrice = newService.discountValue;
        }

        const serviceWithFinalPrice: SelectedService = {
            ...newService,
            quantity,
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
                const quantity = service.quantity || 1;
                let newFinalPrice = newPrice * quantity;

                switch (service.discountType) {
                    case DiscountType.PERCENTAGE:
                        // Rabat procentowy - przelicz na podstawie procentu
                        newFinalPrice = newPrice * quantity * (1 - service.discountValue / 100);
                        break;
                    case DiscountType.AMOUNT:
                        // Rabat kwotowy - odejmij kwotę od nowej ceny bazowej * ilość
                        newFinalPrice = Math.max(0, newPrice * quantity - service.discountValue);
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
    const updateQuantity = (serviceId: string, newQuantity: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                // Ograniczenie do minimum 1 sztuki
                const quantity = Math.max(1, newQuantity);

                // Przelicz cenę końcową na podstawie nowej ilości
                let newFinalPrice = service.price * quantity;

                switch (service.discountType) {
                    case DiscountType.PERCENTAGE:
                        newFinalPrice = service.price * quantity * (1 - service.discountValue / 100);
                        break;
                    case DiscountType.AMOUNT:
                        newFinalPrice = Math.max(0, service.price * quantity - service.discountValue);
                        break;
                    case DiscountType.FIXED_PRICE:
                        newFinalPrice = service.discountValue;
                        break;
                }

                return {
                    ...service,
                    quantity,
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
                const quantity = service.quantity || 1;
                let newFinalPrice = service.price * quantity;
                let newDiscountValue = 0;

                // W zależności od nowego typu rabatu, konwertujemy wartość rabatu
                switch (discountType) {
                    case DiscountType.PERCENTAGE:
                        // Konwersja z innych typów na procenty
                        if (service.discountType === DiscountType.AMOUNT) {
                            // Z kwotowego na procentowy
                            newDiscountValue = (service.discountValue / (service.price * quantity)) * 100;
                            if (newDiscountValue > 100) newDiscountValue = 100;
                        } else if (service.discountType === DiscountType.FIXED_PRICE) {
                            // Z ceny finalnej na procentowy
                            newDiscountValue = ((service.price * quantity - service.discountValue) / (service.price * quantity)) * 100;
                            if (newDiscountValue < 0) newDiscountValue = 0;
                        }
                        newFinalPrice = service.price * quantity * (1 - newDiscountValue / 100);
                        break;

                    case DiscountType.AMOUNT:
                        // Konwersja z innych typów na kwotowy
                        if (service.discountType === DiscountType.PERCENTAGE) {
                            // Z procentowego na kwotowy
                            newDiscountValue = service.price * quantity * (service.discountValue / 100);
                        } else if (service.discountType === DiscountType.FIXED_PRICE) {
                            // Z ceny finalnej na kwotowy
                            newDiscountValue = service.price * quantity - service.discountValue;
                            if (newDiscountValue < 0) newDiscountValue = 0;
                        }
                        newFinalPrice = service.price * quantity - newDiscountValue;
                        break;

                    case DiscountType.FIXED_PRICE:
                        // Konwersja na cenę finalną
                        if (service.discountType === DiscountType.PERCENTAGE) {
                            // Z procentowego na cenę finalną
                            newDiscountValue = service.price * quantity * (1 - service.discountValue / 100);
                        } else if (service.discountType === DiscountType.AMOUNT) {
                            // Z kwotowego na cenę finalną
                            newDiscountValue = service.price * quantity - service.discountValue;
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
                    quantity: service.quantity || 1
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
                const quantity = service.quantity || 1;
                let newFinalPrice = service.price * quantity;

                // Różna logika w zależności od typu rabatu
                switch (service.discountType) {
                    case DiscountType.PERCENTAGE:
                        // Limit procentowy od 0 do 100
                        if (newDiscountValue < 0) newDiscountValue = 0;
                        if (newDiscountValue > 100) newDiscountValue = 100;
                        newFinalPrice = service.price * quantity * (1 - newDiscountValue / 100);
                        break;

                    case DiscountType.AMOUNT:
                        // Limit kwotowy od 0 do łącznej ceny (cena * ilość)
                        if (newDiscountValue < 0) newDiscountValue = 0;
                        if (newDiscountValue > service.price * quantity) newDiscountValue = service.price * quantity;
                        newFinalPrice = service.price * quantity - newDiscountValue;
                        break;

                    case DiscountType.FIXED_PRICE:
                        // Limit ceny finalnej od 0 do ceny początkowej * ilość
                        if (newDiscountValue < 0) newDiscountValue = 0;
                        if (newDiscountValue > service.price * quantity) newDiscountValue = service.price * quantity;
                        newFinalPrice = newDiscountValue;
                        break;
                }

                return {
                    ...service,
                    discountValue: newDiscountValue,
                    finalPrice: parseFloat(newFinalPrice.toFixed(2)),
                    quantity: service.quantity || 1
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