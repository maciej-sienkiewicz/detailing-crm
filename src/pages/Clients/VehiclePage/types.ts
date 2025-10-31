import {MostActiveVehicleInfo, VehicleExpanded} from "../../../types";
import {PriceDetails} from "../../../shared/types/price";

export interface VehiclesPageContentProps {
    onSetRef?: (ref: {
        handleAddVehicle?: () => void;
        handleExportVehicles?: () => void;
    }) => void;
    initialVehicleId?: string;
    filterByOwnerId?: string;
    onNavigateToClient?: (clientId: string) => void;
    onClearDetailParams?: () => void;
    onVehicleSelected?: (vehicleId: string) => void;
    onVehicleClosed?: () => void;
}

export interface VehiclesPageRef {
    handleAddVehicle: () => void;
    handleExportVehicles: () => void;
}

export interface VehicleFilters {
    licensePlate: string;
    make: string;
    model: string;
    ownerName: string;
    minServices: string;
    maxServices: string;
}

export interface VehicleStats {
    totalVehicles: number;
    premiumVehicles: number;
    totalRevenue: PriceDetails;
    visitRevenueMedian: number;
    mostActiveVehicle?: MostActiveVehicleInfo | null;
}

export interface VehiclesPageState {
    vehicles: VehicleExpanded[];
    loading: boolean;
    currentPage: number;
    totalItems: number;
    totalPages: number;
    showFilters: boolean;
    showAddModal: boolean;
    showDeleteConfirm: boolean;
    showHistoryModal: boolean;
    selectedVehicle: VehicleExpanded | null;
    filters: VehicleFilters;
    appliedFilters: VehicleFilters;
    stats: VehicleStats;
    ownerName: string | null;
    error: string | null;
}