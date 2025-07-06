// ClientListTable/hooks/useTableConfiguration.ts - Zaktualizowane z szerokościami do pełnej tabeli
import { useState, useEffect } from 'react';
import { TableColumn } from '../types';

const COLUMN_ORDER_KEY = 'client_table_columns_order';

// Zaktualizowane kolumny z szerokościami dopasowanymi do pełnej tabeli
const defaultColumns: TableColumn[] = [
    { id: 'selection', label: '', width: '60px', sortable: false },
    { id: 'client', label: 'Klient', width: '200px', sortable: true },
    { id: 'contact', label: 'Kontakt', width: '220px', sortable: true },
    { id: 'company', label: 'Firma', width: '180px', sortable: true },
    { id: 'lastVisit', label: 'Ostatnia wizyta', width: '140px', sortable: true },
    { id: 'metrics', label: 'Wizyty / Pojazdy', width: '140px', sortable: true },
    { id: 'revenue', label: 'Przychody', width: '120px', sortable: true },
    { id: 'actions', label: 'Akcje', width: '120px', sortable: false }, // Ostatnia kolumna bez width - zajmie pozostałą przestrzeń
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