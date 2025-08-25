// src/types/fleetFilters.ts

import {FleetVehicleCategory, FleetVehicleStatus, FleetVehicleUsageType} from './fleet';
import {FleetRentalStatus} from './fleetRental';

// Filtr dla pojazdów flotowych
export interface FleetVehicleFilter {
    make?: string;
    model?: string;
    category?: FleetVehicleCategory;
    usageType?: FleetVehicleUsageType;
    status?: FleetVehicleStatus;
    minYear?: number;
    maxYear?: number;
    licensePlate?: string;
}

// Filtr dla wypożyczeń
export interface FleetRentalFilter {
    vehicleId?: string;
    clientId?: string;
    employeeId?: string;
    status?: FleetRentalStatus;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    protocolId?: string;
}