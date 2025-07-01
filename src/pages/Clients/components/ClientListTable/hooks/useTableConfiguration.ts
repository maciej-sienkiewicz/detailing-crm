// ClientListTable/hooks/useTableConfiguration.ts - Updated with new columns
import { useState, useEffect } from 'react';
import { TableColumn } from '../types';

const COLUMN_ORDER_KEY = 'client_table_columns_order';

const defaultColumns: TableColumn[] = [
    { id: 'selection', label: '', width: '50px', sortable: false },
    { id: 'client', label: 'Klient', width: '16%', sortable: true },
    { id: 'contact', label: 'Kontakt', width: '15%', sortable: true },
    { id: 'company', label: 'Firma', width: '12%', sortable: true },
    { id: 'lastVisit', label: 'Ostatnia wizyta', width: '10%', sortable: true },
    { id: 'metrics', label: 'Wizyty / Pojazdy', width: '12%', sortable: true },
    { id: 'revenue', label: 'Przychody', width: '10%', sortable: true },
    { id: 'actions', label: 'Akcje', width: '15%', sortable: false },
];

export const useTableConfiguration = () => {
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