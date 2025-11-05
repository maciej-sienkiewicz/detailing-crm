import React from 'react';
import {PriceResponse, SelectedService} from "../../../types";
import {calculateLocalFinalPrice} from "./calculateLocalFinalPrice";

const TAX_RATE = 0.23;
type SetServices = React.Dispatch<React.SetStateAction<SelectedService[]>>;

export const useUpdateBasePrice = (setServices: SetServices) => {
    return (serviceId: string, newPriceNetto: number) => {
        setServices(prev => prev.map(service => {
            if (service.id === serviceId) {
                const newBasePrice: PriceResponse = {
                    priceNetto: newPriceNetto,
                    priceBrutto: newPriceNetto * (1 + TAX_RATE),
                    taxAmount: newPriceNetto * TAX_RATE
                };

                const newFinalPrice = calculateLocalFinalPrice(
                    newBasePrice,
                    service.discountType,
                    service.discountValue
                );

                return { ...service, basePrice: newBasePrice, finalPrice: newFinalPrice };
            }
            return service;
        }));
    };
};