// src/components/common/DataTable/hooks.ts
import { useEffect, useState, useCallback } from 'react';
import { TableColumn, SortDirection, ViewMode, BaseDataItem } from './types';

export const useTableConfiguration = (
    defaultColumns: TableColumn[],
    storageKey: string
) => {
    const [columns, setColumns] = useState<TableColumn[]>(() => {
        try {
            const savedOrder = localStorage.getItem(storageKey);
            return savedOrder ? JSON.parse(savedOrder) : defaultColumns;
        } catch (e) {
            return defaultColumns;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(columns));
        } catch (e) {
            console.error("Error saving column configuration:", e);
        }
    }, [columns, storageKey]);

    const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
        const draggedColumn = columns[dragIndex];
        const newColumns = [...columns];
        newColumns.splice(dragIndex, 1);
        newColumns.splice(hoverIndex, 0, draggedColumn);
        setColumns(newColumns);
    }, [columns]);

    return { columns, moveColumn };
};

export const useTableSorting = <T extends BaseDataItem>(
    data: T[],
    getSortValue: (item: T, columnId: string) => any
) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [sortedData, setSortedData] = useState<T[]>(data);

    useEffect(() => {
        let sorted = [...data];

        if (sortColumn && sortDirection) {
            sorted.sort((a, b) => {
                const aValue = getSortValue(a, sortColumn);
                const bValue = getSortValue(b, sortColumn);

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

        setSortedData(sorted);
    }, [data, sortColumn, sortDirection, getSortValue]);

    const handleSort = useCallback((columnId: string) => {
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
    }, [sortColumn, sortDirection]);

    return {
        sortedData,
        sortColumn,
        sortDirection,
        handleSort
    };
};

export const useViewMode = (
    defaultMode: ViewMode,
    storageKey: string
) => {
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem(storageKey);
        return (saved as ViewMode) || defaultMode;
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, viewMode);
        } catch (e) {
            console.error("Error saving view mode:", e);
        }
    }, [viewMode, storageKey]);

    return { viewMode, setViewMode };
};