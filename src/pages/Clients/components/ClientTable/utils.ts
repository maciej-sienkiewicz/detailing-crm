// src/pages/Clients/components/ClientTable/utils.ts
import { ClientExpanded } from '../../../../types';
import { dataTableTheme } from '../../../../components/common/DataTable';

export interface ClientStatus {
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

export const getClientStatus = (client: ClientExpanded): ClientStatus => {
    if (client.totalRevenue.totalAmountNetto > 50000) {
        return {
            label: 'VIP',
            color: dataTableTheme.status.error
        };
    }
    if (client.totalRevenue.totalAmountNetto > 20000) {
        return {
            label: 'Premium',
            color: dataTableTheme.status.warning
        };
    }
    return {
        label: 'Standard',
        color: dataTableTheme.text.tertiary
    };
};