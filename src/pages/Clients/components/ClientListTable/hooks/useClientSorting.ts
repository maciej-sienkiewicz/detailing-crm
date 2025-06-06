// ClientListTable/hooks/useClientSorting.ts
import { useState, useEffect } from 'react';
import { SortDirection } from '../types';
import {ClientExpanded} from "../../../../../types";

export const useClientSorting = (clients: ClientExpanded[]) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [sortedClients, setSortedClients] = useState<ClientExpanded[]>(clients);

    // Sort functionality
    useEffect(() => {
        let sorted = [...clients];

        if (sortColumn && sortDirection) {
            sorted.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortColumn) {
                    case 'client':
                        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                        break;
                    case 'contact':
                        aValue = a.email.toLowerCase();
                        bValue = b.email.toLowerCase();
                        break;
                    case 'company':
                        aValue = (a.company || '').toLowerCase();
                        bValue = (b.company || '').toLowerCase();
                        break;
                    case 'metrics':
                        aValue = a.totalVisits;
                        bValue = b.totalVisits;
                        break;
                    case 'revenue':
                        aValue = a.totalRevenue;
                        bValue = b.totalRevenue;
                        break;
                    default:
                        return 0;
                }

                if (typeof aValue === 'string') {
                    return sortDirection === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                } else {
                    return sortDirection === 'asc'
                        ? aValue - bValue
                        : bValue - aValue;
                }
            });
        }

        setSortedClients(sorted);
    }, [clients, sortColumn, sortDirection]);

    const handleSort = (columnId: string) => {
        if (sortColumn === columnId) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortColumn(null);
                setSortDirection(null);
            } else {
                setSortDirection('asc');
            }
        } else {
            setSortColumn(columnId);
            setSortDirection('asc');
        }
    };

    return {
        sortedClients,
        sortColumn,
        sortDirection,
        handleSort
    };
};