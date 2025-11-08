import React from 'react';
import { SelectedService } from "../../../types";
import { calculateLocalFinalPrice } from "../../services/hooks/useServiceCalculations";

type SetServices = React.Dispatch<React.SetStateAction<SelectedService[]>>;

const generateRowId = () => `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAddService = (setServices: SetServices) => {
    return (newService: Omit<SelectedService, 'finalPrice' | 'rowId'>, note?: string) => {
        const finalPrice = calculateLocalFinalPrice(
            newService.basePrice,
            newService.discountType,
            newService.discountValue
        );

        const serviceWithFinalPrice: SelectedService = {
            ...newService,
            rowId: generateRowId(),
            finalPrice: finalPrice,
            note: note
        };

        setServices(prev => [...prev, serviceWithFinalPrice]);
    };
};