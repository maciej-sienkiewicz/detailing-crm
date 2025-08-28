// src/pages/Clients/components/VehicleTable/utils.ts
import { VehicleExpanded } from '../../../../types';
import { dataTableTheme } from '../../../../components/common/DataTable';

export interface VehicleStatus {
    label: string;
    color: string;
}

export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
    }).format(amount);
};

export const getVehicleStatus = (vehicle: VehicleExpanded): VehicleStatus => {
    if (vehicle.totalSpent > 20000) {
        return {
            label: 'Premium',
            color: dataTableTheme.status.warning
        };
    }
    if (vehicle.totalSpent > 10000) {
        return {
            label: 'VIP',
            color: dataTableTheme.status.info
        };
    }
    return {
        label: 'Standard',
        color: dataTableTheme.text.tertiary
    };
};