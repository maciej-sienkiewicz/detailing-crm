import { useState, useCallback, useMemo } from 'react';
import { ProtocolStatus } from '../../../types';

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
        setFilters(prev => {
            if (isFilterEmpty(value)) {
                const newFilters = { ...prev };
                delete newFilters[key];
                return newFilters;
            }
            return {
                ...prev,
                [key]: value
            };
        });
    }, []);

    const updateFilters = useCallback((newFilters: Partial<VisitsFilterState>) => {
        setFilters(prev => {
            const updated = { ...prev };

            Object.entries(newFilters).forEach(([key, value]) => {
                const filterKey = key as keyof VisitsFilterState;
                if (isFilterEmpty(value)) {
                    delete updated[filterKey];
                } else {
                    (updated as any)[filterKey] = value;
                }
            });

            return updated;
        });
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

        Object.entries(apiFilters).forEach(([key, value]) => {
            if (!isFilterEmpty(value)) {
                const filterKey = key as keyof VisitFilterParams;
                (cleanFilters as any)[filterKey] = value;
            }
        });

        if (quickSearch && quickSearch.trim()) {
            const searchTerm = quickSearch.trim();
            cleanFilters.clientName = searchTerm;
            cleanFilters.licensePlate = searchTerm;
            cleanFilters.make = searchTerm;
            cleanFilters.model = searchTerm;
        }

        return cleanFilters;
    }, [filters]);

    const { activeFiltersCount, hasActiveFilters } = useMemo(() => {
        const activeFilters = Object.entries(filters).filter(([_, value]) => !isFilterEmpty(value));
        return {
            activeFiltersCount: activeFilters.length,
            hasActiveFilters: activeFilters.length > 0
        };
    }, [filters]);

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