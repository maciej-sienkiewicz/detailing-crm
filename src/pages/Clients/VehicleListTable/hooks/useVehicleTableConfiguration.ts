import { useState, useEffect } from 'react';
import { TableColumn } from '../types';

const COLUMN_ORDER_KEY = 'vehicle_table_columns_order';

const defaultColumns: TableColumn[] = [
    { id: 'licensePlate', label: 'Nr rejestracyjny', width: '200px', sortable: true },
    { id: 'vehicle', label: 'Pojazd', width: '220px', sortable: true },
    { id: 'owners', label: 'Właściciele', width: '200px', sortable: true },
    { id: 'services', label: 'Liczba wizyt', width: '140px', sortable: true },
    { id: 'lastService', label: 'Ostatnia wizyta', width: '160px', sortable: true },
    { id: 'revenue', label: 'Przychody', width: '140px', sortable: true },
    { id: 'actions', label: 'Akcje', width: '120px', sortable: false },
];

export const useVehicleTableConfiguration = () => {
    const [columns, setColumns] = useState<TableColumn[]>(() => {
        try {
            const savedOrder = localStorage.getItem(COLUMN_ORDER_KEY);
            return savedOrder ? JSON.parse(savedOrder) : defaultColumns;
        } catch (e) {
            return defaultColumns;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columns));
        } catch (e) {
            console.error("Error saving column configuration:", e);
        }
    }, [columns]);

    const moveColumn = (dragIndex: number, hoverIndex: number) => {
        const draggedColumn = columns[dragIndex];
        const newColumns = [...columns];
        newColumns.splice(dragIndex, 1);
        newColumns.splice(hoverIndex, 0, draggedColumn);
        setColumns(newColumns);
    };

    return { columns, moveColumn };
};