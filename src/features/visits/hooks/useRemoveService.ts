import React from 'react';
import {SelectedService} from "../../../types";

type SetServices = React.Dispatch<React.SetStateAction<SelectedService[]>>;

export const useRemoveService = (setServices: SetServices) => {
    return (serviceId: string) => {
        setServices(prev => prev.filter(s => s.id !== serviceId));
    };
};