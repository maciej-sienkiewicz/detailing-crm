import { useState, useEffect } from 'react';
import { SortDirection } from '../types';
import {VehicleExpanded} from "../../../../types";

export const useVehicleSorting = (vehicles: VehicleExpanded[]) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [sortedVehicles, setSortedVehicles] = useState<VehicleExpanded[]>(vehicles);

    useEffect(() => {
        let sorted = [...vehicles];

        if (sortColumn && sortDirection) {
            sorted.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortColumn) {
                    case 'licensePlate':
                        aValue = a.licensePlate.toLowerCase();
                        bValue = b.licensePlate.toLowerCase();
                        break;
                    case 'vehicle':
                        aValue = `${a.make} ${a.model}`.toLowerCase();
                        bValue = `${b.make} ${b.model}`.toLowerCase();
                        break;
                    case 'owners':
                        aValue = a.owners?.[0]?.fullName || '';
                        bValue = b.owners?.[0]?.fullName || '';
                        break;
                    case 'services':
                        aValue = a.totalServices;
                        bValue = b.totalServices;
                        break;
                    case 'lastService':
                        aValue = a.lastServiceDate ? new Date(a.lastServiceDate).getTime() : 0;
                        bValue = b.lastServiceDate ? new Date(b.lastServiceDate).getTime() : 0;
                        break;
                    case 'revenue':
                        aValue = a.totalSpent;
                        bValue = b.totalSpent;
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

        setSortedVehicles(sorted);
    }, [vehicles, sortColumn, sortDirection]);

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
        sortedVehicles,
        sortColumn,
        sortDirection,
        handleSort
    };
};