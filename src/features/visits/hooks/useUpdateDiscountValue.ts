import React from 'react';
import {SelectedService} from "../../../types";
import {calculateLocalFinalPrice} from "../../services/hooks/useServiceCalculations";

type SetServices = React.Dispatch<React.SetStateAction<SelectedService[]>>;

export const useUpdateDiscountValue = (setServices: SetServices) => {
    return (serviceId: string, discountValue: number) => {
        setServices(prev => prev.map(service => {
            if (service.id === serviceId) {
                const newFinalPrice = calculateLocalFinalPrice(
                    service.basePrice,
                    service.discountType,
                    discountValue
                );

                return { ...service, discountValue: discountValue, finalPrice: newFinalPrice };
            }
            return service;
        }));
    };
};