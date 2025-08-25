// ClientListTable/utils/clientUtils.ts
import {ClientStatus} from '../types';
import {brandTheme} from '../styles/theme';
import {ClientExpanded} from "../../../../../types";

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

export const getClientStatus = (client: ClientExpanded): ClientStatus => {
    if (client.totalRevenue > 50000) {
        return {
            label: 'VIP',
            color: brandTheme.status.error
        };
    }
    if (client.totalRevenue > 20000) {
        return {
            label: 'Premium',
            color: brandTheme.status.warning
        };
    }
    return {
        label: 'Standard',
        color: brandTheme.text.tertiary
    };
};