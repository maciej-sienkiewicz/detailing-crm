import React from 'react';
import {SelectedService} from "../../../types";
import {DiscountType} from "../../reservations/api/reservationsApi";
import {calculateLocalFinalPrice} from "../../services/hooks/useServiceCalculations";

type SetServices = React.Dispatch<React.SetStateAction<SelectedService[]>>;

export const useUpdateDiscountType = (setServices: SetServices) => {
    return (serviceId: string, discountType: DiscountType) => {
        setServices(prev => prev.map(service => {
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
        }));
    };
};