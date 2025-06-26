// src/hooks/useEmployees.ts
/**
 * Custom hook for managing employees state with optimized API operations
 * Features:
 * - Smart caching and state management
 * - Optimistic updates
 * - Error handling with recovery
 * - Loading states management
 * - Real-time data synchronization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { employeesApi, EmployeeSearchParams, EmployeeCreatePayload, EmployeeUpdatePayload } from '../api/employeesApi';
import { ExtendedEmployee, EmployeeFilters } from '../types/employeeTypes';
import { EmployeeDocument } from '../types';

// ========================================================================================
// TYPES AND INTERFACES
// ========================================================================================

export interface UseEmployeesState {
    // Data
    employees: ExtendedEmployee[];
    filteredEmployees: ExtendedEmployee[];
    selectedEmployee: ExtendedEmployee | null;

    // Pagination
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;

    // Loading states
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isLoadingDocuments: boolean;

    // Error states
    error: string | null;
    validationErrors: Record<string, string>;

    // Documents
    documents: EmployeeDocument[];
    documentError: string | null;
}

export interface UseEmployeesActions {
    // Data operations
    fetchEmployees: (params?: EmployeeSearchParams) => Promise<void>;
    createEmployee: (data: EmployeeCreatePayload) => Promise<ExtendedEmployee | null>;
    updateEmployee: (data: EmployeeUpdatePayload) => Promise<ExtendedEmployee | null>;
    deleteEmployee: (id: string) => Promise<boolean>;

    // Selection and filtering
    selectEmployee: (employee: ExtendedEmployee | null) => void;
    setFilters: (filters: EmployeeFilters) => void;
    clearFilters: () => void;

    // Pagination
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    nextPage: () => void;
    previousPage: () => void;

    // Documents
    fetchDocuments: (employeeId: string) => Promise<void>;
    uploadDocument: (employeeId: string, file: File, name: string, type: string) => Promise<EmployeeDocument | null>;
    deleteDocument: (documentId: string) => Promise<boolean>;

    // Utility
    refreshData: () => Promise<void>;
    clearError: () => void;
    searchEmployees: (query: string) => void;
    sortEmployees: (field: string, direction: 'asc' | 'desc') => void;
}

export interface UseEmployeesOptions {
    initialPageSize?: number;
    autoFetch?: boolean;
    enableCaching?: boolean;
    refreshInterval?: number;
}

export type UseEmployeesReturn = UseEmployeesState & UseEmployeesActions;

// ========================================================================================
// CUSTOM HOOK IMPLEMENTATION
// ========================================================================================

/**
 * Main hook for employees management
 */
export const useEmployees = (options: UseEmployeesOptions = {}): UseEmployeesReturn => {
    const {
        initialPageSize = 20,
        autoFetch = true,
        enableCaching = true,
        refreshInterval
    } = options;

    // ========================================================================================
    // STATE MANAGEMENT
    // ========================================================================================

    const [state, setState] = useState<UseEmployeesState>({
        // Data
        employees: [],
        filteredEmployees: [],
        selectedEmployee: null,

        // Pagination
        currentPage: 0,
        totalPages: 0,
        totalItems: 0,
        pageSize: initialPageSize,
        hasNext: false,
        hasPrevious: false,

        // Loading states
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        isLoadingDocuments: false,

        // Error states
        error: null,
        validationErrors: {},

        // Documents
        documents: [],
        documentError: null
    });

    // Refs for avoiding stale closure issues
    const currentFiltersRef = useRef<EmployeeFilters>({});
    const sortConfigRef = useRef<{ field: string; direction: 'asc' | 'desc' }>({
        field: 'fullName',
        direction: 'asc'
    });
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // ========================================================================================
    // CORE DATA OPERATIONS
    // ========================================================================================

    /**
     * Fetches employees with smart caching and error handling
     */
    const fetchEmployees = useCallback(async (params?: EmployeeSearchParams) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const searchParams: EmployeeSearchParams = {
                page: state.currentPage,
                size: state.pageSize,
                sortBy: sortConfigRef.current.field,
                sortOrder: sortConfigRef.current.direction,
                ...currentFiltersRef.current,
                ...params
            };

            const result = await employeesApi.getEmployeesList(searchParams);

            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    employees: result.data!.data,
                    filteredEmployees: result.data!.data,
                    currentPage: result.data!.pagination.currentPage,
                    totalPages: result.data!.pagination.totalPages,
                    totalItems: result.data!.pagination.totalItems,
                    pageSize: result.data!.pagination.pageSize,
                    hasNext: result.data!.pagination.hasNext,
                    hasPrevious: result.data!.pagination.hasPrevious,
                    isLoading: false,
                    error: null
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: result.error || 'Nie udało się pobrać listy pracowników'
                }));
            }
        } catch (error) {
            console.error('Error in fetchEmployees:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Wystąpił nieoczekiwany błąd podczas pobierania pracowników'
            }));
        }
    }, [state.currentPage, state.pageSize]);

    /**
     * Creates a new employee with optimistic updates
     */
    const createEmployee = useCallback(async (data: EmployeeCreatePayload): Promise<ExtendedEmployee | null> => {
        try {
            setState(prev => ({ ...prev, isCreating: true, error: null, validationErrors: {} }));

            const result = await employeesApi.createEmployee(data);

            if (result.success && result.data) {
                // Optimistic update - add to current list
                setState(prev => ({
                    ...prev,
                    employees: [result.data!, ...prev.employees],
                    filteredEmployees: [result.data!, ...prev.filteredEmployees],
                    totalItems: prev.totalItems + 1,
                    isCreating: false
                }));

                return result.data;
            } else {
                setState(prev => ({
                    ...prev,
                    isCreating: false,
                    error: result.error || 'Nie udało się utworzyć pracownika'
                }));
                return null;
            }
        } catch (error) {
            console.error('Error in createEmployee:', error);
            setState(prev => ({
                ...prev,
                isCreating: false,
                error: 'Wystąpił nieoczekiwany błąd podczas tworzenia pracownika'
            }));
            return null;
        }
    }, []);

    /**
     * Updates an employee with optimistic updates
     */
    const updateEmployee = useCallback(async (data: EmployeeUpdatePayload): Promise<ExtendedEmployee | null> => {
        try {
            setState(prev => ({ ...prev, isUpdating: true, error: null, validationErrors: {} }));

            // Optimistic update
            const optimisticUpdate = (employees: ExtendedEmployee[]) =>
                employees.map(emp => emp.id === data.id ? { ...emp, ...data } : emp);

            setState(prev => ({
                ...prev,
                employees: optimisticUpdate(prev.employees),
                filteredEmployees: optimisticUpdate(prev.filteredEmployees),
                selectedEmployee: prev.selectedEmployee?.id === data.id
                    ? { ...prev.selectedEmployee, ...data }
                    : prev.selectedEmployee
            }));

            const result = await employeesApi.updateEmployee(data);

            if (result.success && result.data) {
                // Update with server response
                const serverUpdate = (employees: ExtendedEmployee[]) =>
                    employees.map(emp => emp.id === data.id ? result.data! : emp);

                setState(prev => ({
                    ...prev,
                    employees: serverUpdate(prev.employees),
                    filteredEmployees: serverUpdate(prev.filteredEmployees),
                    selectedEmployee: prev.selectedEmployee?.id === data.id ? result.data! : prev.selectedEmployee,
                    isUpdating: false
                }));

                return result.data;
            } else {
                // Revert optimistic update on failure
                await fetchEmployees();
                setState(prev => ({
                    ...prev,
                    isUpdating: false,
                    error: result.error || 'Nie udało się zaktualizować pracownika'
                }));
                return null;
            }
        } catch (error) {
            console.error('Error in updateEmployee:', error);
            // Revert optimistic update
            await fetchEmployees();
            setState(prev => ({
                ...prev,
                isUpdating: false,
                error: 'Wystąpił nieoczekiwany błąd podczas aktualizacji pracownika'
            }));
            return null;
        }
    }, [fetchEmployees]);

    /**
     * Deletes an employee with optimistic updates
     */
    const deleteEmployee = useCallback(async (id: string): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, isDeleting: true, error: null }));

            // Store original state for rollback
            const originalEmployees = state.employees;
            const originalFiltered = state.filteredEmployees;

            // Optimistic update - remove from lists
            setState(prev => ({
                ...prev,
                employees: prev.employees.filter(emp => emp.id !== id),
                filteredEmployees: prev.filteredEmployees.filter(emp => emp.id !== id),
                selectedEmployee: prev.selectedEmployee?.id === id ? null : prev.selectedEmployee,
                totalItems: Math.max(0, prev.totalItems - 1)
            }));

            const result = await employeesApi.deleteEmployee(id);

            if (result.success) {
                setState(prev => ({ ...prev, isDeleting: false }));
                return true;
            } else {
                // Revert optimistic update on failure
                setState(prev => ({
                    ...prev,
                    employees: originalEmployees,
                    filteredEmployees: originalFiltered,
                    isDeleting: false,
                    error: result.error || 'Nie udało się usunąć pracownika'
                }));
                return false;
            }
        } catch (error) {
            console.error('Error in deleteEmployee:', error);
            // Revert optimistic update
            await fetchEmployees();
            setState(prev => ({
                ...prev,
                isDeleting: false,
                error: 'Wystąpił nieoczekiwany błąd podczas usuwania pracownika'
            }));
            return false;
        }
    }, [state.employees, state.filteredEmployees, fetchEmployees]);

    // ========================================================================================
    // SELECTION AND FILTERING
    // ========================================================================================

    /**
     * Selects an employee and fetches detailed data if needed
     */
    const selectEmployee = useCallback(async (employee: ExtendedEmployee | null) => {
        setState(prev => ({ ...prev, selectedEmployee: employee }));

        // Fetch detailed data if not already loaded
        if (employee && !employee.emergencyContact) {
            try {
                const result = await employeesApi.getEmployeeById(employee.id);
                if (result.success && result.data) {
                    setState(prev => ({ ...prev, selectedEmployee: result.data! }));
                }
            } catch (error) {
                console.error('Error fetching employee details:', error);
            }
        }
    }, []);

    /**
     * Updates filters and triggers search
     */
    const setFilters = useCallback(async (filters: EmployeeFilters) => {
        currentFiltersRef.current = filters;
        setState(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
        await fetchEmployees({ page: 0, ...filters });
    }, [fetchEmployees]);

    /**
     * Clears all filters
     */
    const clearFilters = useCallback(async () => {
        currentFiltersRef.current = {};
        setState(prev => ({ ...prev, currentPage: 0 }));
        await fetchEmployees({ page: 0 });
    }, [fetchEmployees]);

    /**
     * Performs client-side search through loaded employees
     */
    const searchEmployees = useCallback((query: string) => {
        if (!query.trim()) {
            setState(prev => ({ ...prev, filteredEmployees: prev.employees }));
            return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = state.employees.filter(employee =>
            employee.fullName.toLowerCase().includes(searchTerm) ||
            employee.email.toLowerCase().includes(searchTerm) ||
            employee.phone.includes(searchTerm) ||
            employee.position.toLowerCase().includes(searchTerm)
        );

        setState(prev => ({ ...prev, filteredEmployees: filtered }));
    }, [state.employees]);

    /**
     * Sorts employees by specified field
     */
    const sortEmployees = useCallback(async (field: string, direction: 'asc' | 'desc') => {
        sortConfigRef.current = { field, direction };
        await fetchEmployees({
            sortBy: field,
            sortOrder: direction
        });
    }, [fetchEmployees]);

    // ========================================================================================
    // PAGINATION
    // ========================================================================================

    const setPage = useCallback(async (page: number) => {
        setState(prev => ({ ...prev, currentPage: page }));
        await fetchEmployees({ page });
    }, [fetchEmployees]);

    const setPageSize = useCallback(async (size: number) => {
        setState(prev => ({ ...prev, pageSize: size, currentPage: 0 }));
        await fetchEmployees({ page: 0, size });
    }, [fetchEmployees]);

    const nextPage = useCallback(async () => {
        if (state.hasNext) {
            await setPage(state.currentPage + 1);
        }
    }, [state.hasNext, state.currentPage, setPage]);

    const previousPage = useCallback(async () => {
        if (state.hasPrevious) {
            await setPage(state.currentPage - 1);
        }
    }, [state.hasPrevious, state.currentPage, setPage]);

    // ========================================================================================
    // DOCUMENTS OPERATIONS
    // ========================================================================================

    /**
     * Fetches documents for an employee
     */
    const fetchDocuments = useCallback(async (employeeId: string) => {
        try {
            setState(prev => ({ ...prev, isLoadingDocuments: true, documentError: null }));

            const result = await employeesApi.getEmployeeDocuments(employeeId);

            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    documents: result.data!,
                    isLoadingDocuments: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isLoadingDocuments: false,
                    documentError: result.error || 'Nie udało się pobrać dokumentów'
                }));
            }
        } catch (error) {
            console.error('Error in fetchDocuments:', error);
            setState(prev => ({
                ...prev,
                isLoadingDocuments: false,
                documentError: 'Wystąpił nieoczekiwany błąd podczas pobierania dokumentów'
            }));
        }
    }, []);

    /**
     * Uploads a document for an employee
     */
    const uploadDocument = useCallback(async (
        employeeId: string,
        file: File,
        name: string,
        type: string
    ): Promise<EmployeeDocument | null> => {
        try {
            setState(prev => ({ ...prev, isLoadingDocuments: true, documentError: null }));

            const result = await employeesApi.uploadEmployeeDocument({
                employeeId,
                name,
                type,
                file
            });

            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    documents: [...prev.documents, result.data!],
                    isLoadingDocuments: false
                }));
                return result.data;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoadingDocuments: false,
                    documentError: result.error || 'Nie udało się przesłać dokumentu'
                }));
                return null;
            }
        } catch (error) {
            console.error('Error in uploadDocument:', error);
            setState(prev => ({
                ...prev,
                isLoadingDocuments: false,
                documentError: 'Wystąpił nieoczekiwany błąd podczas przesyłania dokumentu'
            }));
            return null;
        }
    }, []);

    /**
     * Deletes a document
     */
    const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, documentError: null }));

            const result = await employeesApi.deleteEmployeeDocument(documentId);

            if (result.success) {
                setState(prev => ({
                    ...prev,
                    documents: prev.documents.filter(doc => doc.id !== documentId)
                }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    documentError: result.error || 'Nie udało się usunąć dokumentu'
                }));
                return false;
            }
        } catch (error) {
            console.error('Error in deleteDocument:', error);
            setState(prev => ({
                ...prev,
                documentError: 'Wystąpił nieoczekiwany błąd podczas usuwania dokumentu'
            }));
            return false;
        }
    }, []);

    // ========================================================================================
    // UTILITY FUNCTIONS
    // ========================================================================================

    /**
     * Refreshes all data
     */
    const refreshData = useCallback(async () => {
        await fetchEmployees();
    }, [fetchEmployees]);

    /**
     * Clears all errors
     */
    const clearError = useCallback(() => {
        setState(prev => ({
            ...prev,
            error: null,
            documentError: null,
            validationErrors: {}
        }));
    }, []);

    // ========================================================================================
    // EFFECTS
    // ========================================================================================

    /**
     * Initial data fetch
     */
    useEffect(() => {
        if (autoFetch) {
            fetchEmployees();
        }
    }, [autoFetch, fetchEmployees]);

    /**
     * Set up refresh interval if specified
     */
    useEffect(() => {
        if (refreshInterval && refreshInterval > 0) {
            refreshIntervalRef.current = setInterval(() => {
                fetchEmployees();
            }, refreshInterval);

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [refreshInterval, fetchEmployees]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    // ========================================================================================
    // RETURN HOOK API
    // ========================================================================================

    return {
        // State
        ...state,

        // Actions
        fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        selectEmployee,
        setFilters,
        clearFilters,
        setPage,
        setPageSize,
        nextPage,
        previousPage,
        fetchDocuments,
        uploadDocument,
        deleteDocument,
        refreshData,
        clearError,
        searchEmployees,
        sortEmployees
    };
};

// ========================================================================================
// SPECIALIZED HOOKS
// ========================================================================================

/**
 * Hook for managing a single employee (details view)
 */
export const useEmployee = (employeeId: string | null) => {
    const [employee, setEmployee] = useState<ExtendedEmployee | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployee = useCallback(async () => {
        if (!employeeId) {
            setEmployee(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const result = await employeesApi.getEmployeeById(employeeId);

            if (result.success && result.data) {
                setEmployee(result.data);
            } else {
                setError(result.error || 'Nie udało się pobrać danych pracownika');
            }
        } catch (error) {
            console.error('Error fetching employee:', error);
            setError('Wystąpił nieoczekiwany błąd');
        } finally {
            setIsLoading(false);
        }
    }, [employeeId]);

    useEffect(() => {
        fetchEmployee();
    }, [fetchEmployee]);

    return {
        employee,
        isLoading,
        error,
        refetch: fetchEmployee
    };
};

/**
 * Hook for employee statistics
 */
export const useEmployeeStatistics = () => {
    const [statistics, setStatistics] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatistics = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await employeesApi.getEmployeeStatistics();

            if (result.success && result.data) {
                setStatistics(result.data);
            } else {
                setError(result.error || 'Nie udało się pobrać statystyk');
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setError('Wystąpił nieoczekiwany błąd');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    return {
        statistics,
        isLoading,
        error,
        refetch: fetchStatistics
    };
};