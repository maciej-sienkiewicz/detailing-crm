import { useState } from 'react';
import {SelectedService} from "../../../types";

export const useVisitServicesState = (initialServices: SelectedService[] = []) => {
    const [services, setServices] = useState<SelectedService[]>(initialServices);

    return {
        services,
        setServices,
    };
};