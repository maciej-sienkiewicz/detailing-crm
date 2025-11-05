import React from 'react';
import {SelectedService} from "../../../types";

type SetServices = React.Dispatch<React.SetStateAction<SelectedService[]>>;

export const useUpdateServiceNote = (setServices: SetServices) => {
    return (serviceId: string, note: string) => {
        setServices(prev => prev.map(service => {
            if (service.id === serviceId) {
                return { ...service, note };
            }
            return service;
        }));
    };
};