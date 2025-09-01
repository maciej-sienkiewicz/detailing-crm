import {useState} from 'react';
import {DiscountType, SelectedService} from '../../../../types';

export const useServiceCalculations = (initialServices: SelectedService[] = []) => {
    const servicesWithQuantity = initialServices.map(service => ({
        ...service,
    }));

    const [services, setServices] = useState<SelectedService[]>(servicesWithQuantity);

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

    const addService = (newService: Omit<SelectedService, 'finalPrice'>) => {
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

    const removeService = (serviceId: string) => {
        const updatedServices = services.filter(s => s.id !== serviceId);
        setServices(updatedServices);
        return updatedServices;
    };

    const updateBasePrice = (serviceId: string, newPrice: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                let newFinalPrice = newPrice;

                switch (service.discountType) {
                    case DiscountType.PERCENTAGE:
                        newFinalPrice = newPrice * (1 - service.discountValue / 100);
                        break;
                    case DiscountType.AMOUNT:
                        newFinalPrice = Math.max(0, newPrice - service.discountValue);
                        break;
                    case DiscountType.FIXED_PRICE:
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

    const updateQuantity = (serviceId: string) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
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

    const updateDiscountType = (serviceId: string, discountType: DiscountType) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                let newFinalPrice = service.price;
                let newDiscountValue = 0;

                switch (discountType) {
                    case DiscountType.PERCENTAGE:
                        if (service.discountType === DiscountType.AMOUNT) {
                            newDiscountValue = (service.discountValue / (service.price)) * 100;
                            if (newDiscountValue > 100) newDiscountValue = 100;
                        } else if (service.discountType === DiscountType.FIXED_PRICE) {
                            newDiscountValue = ((service.price - service.discountValue) / (service.price)) * 100;
                            if (newDiscountValue < 0) newDiscountValue = 0;
                        }
                        newFinalPrice = service.price * (1 - newDiscountValue / 100);
                        break;

                    case DiscountType.AMOUNT:
                        if (service.discountType === DiscountType.PERCENTAGE) {
                            newDiscountValue = service.price * (service.discountValue / 100);
                        } else if (service.discountType === DiscountType.FIXED_PRICE) {
                            newDiscountValue = service.price - service.discountValue;
                            if (newDiscountValue < 0) newDiscountValue = 0;
                        }
                        newFinalPrice = service.price - newDiscountValue;
                        break;

                    case DiscountType.FIXED_PRICE:
                        if (service.discountType === DiscountType.PERCENTAGE) {
                            newDiscountValue = service.price * (1 - service.discountValue / 100);
                        } else if (service.discountType === DiscountType.AMOUNT) {
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

    const updateDiscountValue = (serviceId: string, discountValue: number) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                let newDiscountValue = discountValue;
                let newFinalPrice = service.price;

                switch (service.discountType) {
                    case DiscountType.PERCENTAGE:
                        if (newDiscountValue < 0) newDiscountValue = 0;
                        if (newDiscountValue > 100) newDiscountValue = 100;
                        newFinalPrice = service.price * (1 - newDiscountValue / 100);
                        break;

                    case DiscountType.AMOUNT:
                        if (newDiscountValue < 0) newDiscountValue = 0;
                        if (newDiscountValue > service.price) newDiscountValue = service.price;
                        newFinalPrice = service.price - newDiscountValue;
                        break;

                    case DiscountType.FIXED_PRICE:
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