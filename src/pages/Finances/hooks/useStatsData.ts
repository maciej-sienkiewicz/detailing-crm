// src/pages/Finances/hooks/useStatsData.ts
import { useState, useEffect, useCallback } from 'react';
import {
    statsApi,
    UncategorizedService,
    Category,
    CreateCategoryRequest,
    CategoryService,
    ServiceStatsResponse,
    TimeGranularity, CategoryStatsResponse
} from '../../../api/statsApi';

export const useStatsData = () => {
    // State
    const [uncategorizedServices, setUncategorizedServices] = useState<UncategorizedService[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryServices, setCategoryServices] = useState<Record<number, CategoryService[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Operations state
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [assigningToCategory, setAssigningToCategory] = useState(false);
    const [loadingCategoryServices, setLoadingCategoryServices] = useState<Set<number>>(new Set());

    // Fetch uncategorized services
    const fetchUncategorizedServices = useCallback(async () => {
        try {
            const services = await statsApi.getUncategorizedServices();
            setUncategorizedServices(services);
        } catch (err) {
            console.error('Error fetching uncategorized services:', err);
            setError(err instanceof Error ? err.message : 'Błąd pobierania usług');
        }
    }, []);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const categoriesData = await statsApi.getCategories();
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err instanceof Error ? err.message : 'Błąd pobierania kategorii');
        }
    }, []);

    // Fetch services for a specific category
    const fetchCategoryServices = useCallback(async (categoryId: number): Promise<CategoryService[]> => {
        try {
            setLoadingCategoryServices(prev => new Set([...prev, categoryId]));

            const services = await statsApi.getCategoryServices(categoryId);
            setCategoryServices(prev => ({ ...prev, [categoryId]: services }));

            return services;
        } catch (err) {
            console.error('Error fetching category services:', err);
            setError(err instanceof Error ? err.message : 'Błąd pobierania usług kategorii');
            return [];
        } finally {
            setLoadingCategoryServices(prev => {
                const newSet = new Set(prev);
                newSet.delete(categoryId);
                return newSet;
            });
        }
    }, []);

    // Refresh all data
    const refreshData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            await Promise.all([
                fetchUncategorizedServices(),
                fetchCategories()
            ]);
        } catch (err) {
            console.error('Error refreshing data:', err);
            setError('Nie udało się odświeżyć danych');
        } finally {
            setLoading(false);
        }
    }, [fetchUncategorizedServices, fetchCategories]);

    // Create new category
    const createCategory = useCallback(async (data: CreateCategoryRequest): Promise<boolean> => {
        try {
            setCreatingCategory(true);
            setError(null);

            const newCategory = await statsApi.createCategory(data);
            setCategories(prev => [...prev, newCategory]);

            return true;
        } catch (err) {
            console.error('Error creating category:', err);
            setError(err instanceof Error ? err.message : 'Nie udało się utworzyć kategorii');
            return false;
        } finally {
            setCreatingCategory(false);
        }
    }, []);

    // Assign services to category
    const assignToCategory = useCallback(async (categoryId: number, serviceIds: string[]): Promise<boolean> => {
        try {
            setAssigningToCategory(true);
            setError(null);

            await statsApi.addToCategory(categoryId, { serviceIds });

            // Remove assigned services from uncategorized list
            setUncategorizedServices(prev =>
                prev.filter(service => !serviceIds.includes(service.id))
            );

            // Update category services count (optimistic update)
            setCategories(prev =>
                prev.map(category =>
                    category.id === categoryId
                        ? { ...category, servicesCount: category.servicesCount + serviceIds.length }
                        : category
                )
            );

            // Clear cached category services to force refresh
            setCategoryServices(prev => {
                const newServices = { ...prev };
                delete newServices[categoryId];
                return newServices;
            });

            return true;
        } catch (err) {
            console.error('Error assigning to category:', err);
            setError(err instanceof Error ? err.message : 'Nie udało się przypisać do kategorii');
            return false;
        } finally {
            setAssigningToCategory(false);
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Load data on mount
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return {
        // Data
        uncategorizedServices,
        categories,
        categoryServices,
        loading,
        error,

        // Operation states
        creatingCategory,
        assigningToCategory,
        loadingCategoryServices,

        // Actions
        refreshData,
        fetchCategoryServices,
        createCategory,
        assignToCategory,
        clearError
    };
};

//Hook for service statistics
export const useServiceStats = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchServiceStats = useCallback(async (
        serviceId: string,
        startDate: string,
        endDate: string,
        granularity: TimeGranularity = TimeGranularity.MONTHLY
    ): Promise<ServiceStatsResponse | null> => {
        try {
            setLoading(true);
            setError(null);

            const stats = await statsApi.getServiceStats(serviceId, startDate, endDate, granularity);
            return stats;
        } catch (err) {
            console.error('Error fetching service stats:', err);
            setError(err instanceof Error ? err.message : 'Nie udało się pobrać statystyk usługi');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        fetchServiceStats,
        loading,
        error,
        clearError
    };
};

// Hook for category statistics
export const useCategoryStats = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategoryStats = useCallback(async (
        categoryId: number,
        startDate: string,
        endDate: string,
        granularity: TimeGranularity = TimeGranularity.MONTHLY
    ): Promise<CategoryStatsResponse | null> => {
        try {
            setLoading(true);
            setError(null);

            const stats = await statsApi.getCategoryStats(categoryId, startDate, endDate, granularity);
            return stats;
        } catch (err) {
            console.error('Error fetching category stats:', err);
            setError(err instanceof Error ? err.message : 'Nie udało się pobrać statystyk kategorii');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        fetchCategoryStats,
        loading,
        error,
        clearError
    };
};