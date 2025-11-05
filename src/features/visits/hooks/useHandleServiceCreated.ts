import React from 'react';
import {PriceResponse, SelectedService} from "../../../types";
import {calculateLocalFinalPrice} from "./calculateLocalFinalPrice";

type SetServices = React.Dispatch<React.SetStateAction<SelectedService[]>>;

export const useHandleServiceCreated = (setServices: SetServices) => {
    return (oldId: string, newService: { id: string, price: PriceResponse }) => {
        setServices(prevServices =>
            prevServices.map(service =>
                service.id === oldId
                    ? {
                        ...service,
                        id: newService.id,
                        basePrice: newService.price,
                        finalPrice: calculateLocalFinalPrice(
                            newService.price,
                            service.discountType,
                            service.discountValue
                        ),
                    }
                    : service
            )
        );
    };
};