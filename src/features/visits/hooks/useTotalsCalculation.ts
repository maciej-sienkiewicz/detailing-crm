import {SelectedService} from "../../../types";

export const useTotalsCalculation = (services: SelectedService[]) => {
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

    return calculateTotals;
};