// src/pages/Finances/hooks/useStatsData.ts
import { useState, useEffect, useCallback } from 'react';
import { statsApi, UncategorizedService, Category, CreateCategoryRequest, AddToCategoryRequest } from '../../../api/statsApi';

export const useStatsData = () => {
    // State
    const [uncategorizedServices, setUncategorizedServices] = useState<UncategorizedService[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Operations state
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [assigningToCategory, setAssigningToCategory] = useState(false);

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
    const assignToCategory = useCallback(async (categoryId: number, serviceIds: number[]): Promise<boolean> => {
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
        loading,
        error,

        // Operation states
        creatingCategory,
        assigningToCategory,

        // Actions
        refreshData,
        createCategory,
        assignToCategory,
        clearError
    };
};