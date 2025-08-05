import { useState, useCallback } from 'react';
import { ProtocolStatus } from '../../../types';

// Rozszerzony interfejs filtrów dla wizyt
export interface VisitFilterParams {
    clientName?: string;
    licensePlate?: string;
    status?: ProtocolStatus;
    startDate?: string;
    endDate?: string;
    make?: string;
    model?: string;
    serviceName?: string;
    serviceIds?: string[];
    title?: string;
    minPrice?: number;
    maxPrice?: number;
}

export interface VisitsFilterState extends VisitFilterParams {
    quickSearch?: string;
    title?: string;
}

export interface UseVisitsFiltersReturn {
    filters: VisitsFilterState;
    activeFiltersCount: number;
    hasActiveFilters: boolean;
    updateFilter: (key: keyof VisitsFilterState, value: any) => void;
    updateFilters: (newFilters: Partial<VisitsFilterState>) => void;
    clearFilter: (key: keyof VisitsFilterState) => void;
    clearAllFilters: () => void;
    getApiFilters: () => VisitFilterParams;
}

const isFilterEmpty = (value: any): boolean => {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && !Array.isArray(value)) {
        return Object.values(value).every(v => v === undefined || v === null || v === '');
    }
    return false;
};

export const useVisitsFilters = (initialFilters: VisitsFilterState = {}): UseVisitsFiltersReturn => {
    const [filters, setFilters] = useState<VisitsFilterState>(initialFilters);

    const updateFilter = useCallback((key: keyof VisitsFilterState, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const updateFilters = useCallback((newFilters: Partial<VisitsFilterState>) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    }, []);

    const clearFilter = useCallback((key: keyof VisitsFilterState) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
        });
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({});
    }, []);

    const getApiFilters = useCallback((): VisitFilterParams => {
        const { quickSearch, ...apiFilters } = filters;

        const cleanFilters: VisitFilterParams = {};

        // Przetwarzamy wszystkie filtry oprócz quickSearch
        Object.entries(apiFilters).forEach(([key, value]) => {
            if (!isFilterEmpty(value)) {
                const filterKey = key as keyof VisitFilterParams;
                (cleanFilters as any)[filterKey] = value;
            }
        });

        // Obsługa quickSearch - dodajemy do wielu pól jednocześnie
        if (quickSearch && quickSearch.trim()) {
            cleanFilters.clientName = quickSearch.trim();
            cleanFilters.licensePlate = quickSearch.trim();
            cleanFilters.make = quickSearch.trim();
            cleanFilters.model = quickSearch.trim();
        }

        console.log('🔍 Generated API filters:', cleanFilters);
        return cleanFilters;
    }, [filters]);

    const activeFilters = Object.entries(filters).filter(([_, value]) => !isFilterEmpty(value));
    const activeFiltersCount = activeFilters.length;
    const hasActiveFilters = activeFiltersCount > 0;

    return {
        filters,
        activeFiltersCount,
        hasActiveFilters,
        updateFilter,
        updateFilters,
        clearFilter,
        clearAllFilters,
        getApiFilters
    };
};