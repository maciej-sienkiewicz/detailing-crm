import React from 'react';
import {SelectedService} from "../../../types";
import {calculateLocalFinalPrice} from "../../services/hooks/useServiceCalculations";

type SetServices = React.Dispatch<React.SetStateAction<SelectedService[]>>;

export const useAddService = (setServices: SetServices) => {
    return (newService: Omit<SelectedService, 'finalPrice'>) => {
        const finalPrice = calculateLocalFinalPrice(
            newService.basePrice,
            newService.discountType,
            newService.discountValue
        );

        const serviceWithFinalPrice: SelectedService = {
            ...newService,
            finalPrice: finalPrice
        };

        setServices(prev => [...prev, serviceWithFinalPrice]);
    };
};