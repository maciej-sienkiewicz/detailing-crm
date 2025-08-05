import { VehicleStatus } from '../types';
import { brandTheme } from '../styles/themes';
import {VehicleExpanded} from "../../../../types";

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
            color: brandTheme.status.warning
        };
    }
    if (vehicle.totalSpent > 10000) {
        return {
            label: 'VIP',
            color: brandTheme.status.info
        };
    }
    return {
        label: 'Standard',
        color: brandTheme.text.tertiary
    };
};