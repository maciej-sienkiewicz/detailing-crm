// src/hooks/useEmployees.ts - Updated with Real API Integration
/**
 * Custom hook for managing employees state with optimized API operations
 * Features:
 * - Smart caching and state management
 * - Optimistic updates with rollback
 * - Error handling with recovery
 * - Loading states management
 * - Real-time data synchronization
 * - Debounced API calls
 * - Pagination management
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    employeesApi,
    EmployeeSearchParams,
    EmployeeCreatePayload,
    EmployeeUpdatePayload,
    EmployeesApiResult
} from '../api/employeesApi';
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
    isRefreshing: boolean;

    // Error states
    error: string | null;
    validationErrors: Record<string, string>;

    // Documents
    documents: EmployeeDocument[];
    documentError: string | null;

    // Cache info
    lastFetch: Date | null;
    cacheValid: boolean;
}

export interface UseEmployeesActions {
    // Data operations
    fetchEmployees: (params?: EmployeeSearchParams) => Promise<void>;
    createEmployee: (data: EmployeeCreatePayload) => Promise<ExtendedEmployee | null>;
    updateEmployee: (data: EmployeeUpdatePayload) => Promise<ExtendedEmployee | null>;
    deleteEmployee: (id: string) => Promise<boolean>;
    downloadDocument: (documentId: string) => Promise<boolean>; // 🔧 ADDED: Download function

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
    sortEmployees: (field: 'fullName' | 'position' | 'email' | 'hireDate' | 'role' | 'hourlyRate' | 'isActive', direction: 'asc' | 'desc') => void;
    invalidateCache: () => void;
}

export interface UseEmployeesOptions {
    initialPageSize?: number;
    autoFetch?: boolean;
    enableCaching?: boolean;
    refreshInterval?: number;
    cacheTimeout?: number;
    optimisticUpdates?: boolean;
}

export type UseEmployeesReturn = UseEmployeesState & UseEmployeesActions;

// ========================================================================================
// CONSTANTS
// ========================================================================================

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_DELAY = 300;
const MAX_RETRIES = 3;

// ========================================================================================
// CUSTOM HOOK IMPLEMENTATION
// ========================================================================================

/**
 * Main hook for employees management with API integration
 */
export const useEmployees = (options: UseEmployeesOptions = {}): UseEmployeesReturn => {
    const {
        initialPageSize = DEFAULT_PAGE_SIZE,
        autoFetch = true,
        enableCaching = true,
        refreshInterval = 0,
        cacheTimeout = DEFAULT_CACHE_TIMEOUT,
        optimisticUpdates = true
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
        isRefreshing: false,

        // Error states
        error: null,
        validationErrors: {},

        // Documents
        documents: [],
        documentError: null,

        // Cache info
        lastFetch: null,
        cacheValid: false
    });

    // Refs for avoiding stale closure issues and debouncing
    const currentFiltersRef = useRef<EmployeeFilters>({});
    const sortConfigRef = useRef<{ field: 'fullName' | 'position' | 'email' | 'hireDate' | 'role' | 'hourlyRate' | 'isActive'; direction: 'asc' | 'desc' }>({
        field: 'fullName',
        direction: 'asc'
    });
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const retryCountRef = useRef<number>(0);

    // Memoized cache validity check
    const isCacheValid = useMemo(() => {
        if (!enableCaching || !state.lastFetch) return false;
        return Date.now() - state.lastFetch.getTime() < cacheTimeout;
    }, [enableCaching, state.lastFetch, cacheTimeout]);

    // ========================================================================================
    // CORE DATA OPERATIONS
    // ========================================================================================

    /**
     * Fetches employees with smart caching and error handling
     */
    const fetchEmployees = useCallback(async (params?: EmployeeSearchParams) => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        try {
            // Check cache validity for repeated requests
            if (isCacheValid && !params && state.employees.length > 0) {
                console.log('📦 Using cached employees data');
                return;
            }

            setState(prev => ({
                ...prev,
                isLoading: true,
                error: null,
                isRefreshing: !!params
            }));

            const searchParams: EmployeeSearchParams = {
                page: params?.page ?? state.currentPage,
                size: params?.size ?? state.pageSize,
                sortBy: params?.sortBy ?? sortConfigRef.current.field,
                sortOrder: params?.sortOrder ?? sortConfigRef.current.direction,
                ...currentFiltersRef.current,
                ...params
            };

            console.log('🔄 Fetching employees with params:', searchParams);

            const result = await employeesApi.getEmployeesList(searchParams);

            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    employees: result.data!.data as ExtendedEmployee[],
                    filteredEmployees: result.data!.data as ExtendedEmployee[],
                    currentPage: result.data!.pagination.currentPage,
                    totalPages: result.data!.pagination.totalPages,
                    totalItems: result.data!.pagination.totalItems,
                    pageSize: result.data!.pagination.pageSize,
                    hasNext: result.data!.pagination.hasNext,
                    hasPrevious: result.data!.pagination.hasPrevious,
                    isLoading: false,
                    isRefreshing: false,
                    error: null,
                    lastFetch: new Date(),
                    cacheValid: true
                }));

                retryCountRef.current = 0;
                console.log('✅ Successfully fetched employees:', result.data.data.length);
            } else {
                throw new Error(result.error || 'Failed to fetch employees');
            }
        } catch (error: any) {
            console.error('❌ Error in fetchEmployees:', error);

            // Handle different error types
            let errorMessage = 'Wystąpił nieoczekiwany błąd podczas pobierania pracowników';

            if (error.name === 'AbortError') {
                return; // Request was cancelled, don't update state
            }

            if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage = 'Błąd połączenia z serwerem. Sprawdź połączenie internetowe.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setState(prev => ({
                ...prev,
                isLoading: false,
                isRefreshing: false,
                error: errorMessage,
                cacheValid: false
            }));

            // Implement retry logic for network errors
            if (retryCountRef.current < MAX_RETRIES && !error.message?.includes('401')) {
                retryCountRef.current++;
                console.log(`🔄 Retrying fetch (attempt ${retryCountRef.current}/${MAX_RETRIES})`);

                const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
                setTimeout(() => fetchEmployees(params), retryDelay);
            }
        }
    }, [state.currentPage, state.pageSize, state.employees.length, isCacheValid]);

    /**
     * Creates a new employee with optimistic updates and validation
     */
    const createEmployee = useCallback(async (data: EmployeeCreatePayload): Promise<ExtendedEmployee | null> => {
        try {
            setState(prev => ({
                ...prev,
                isCreating: true,
                error: null,
                validationErrors: {}
            }));

            console.log('📝 Creating new employee:', data.fullName);

            const result = await employeesApi.createEmployee(data);

            if (result.success && result.data) {
                const newEmployee = result.data;

                if (optimisticUpdates) {
                    // Optimistic update - add to current list
                    setState(prev => ({
                        ...prev,
                        employees: [newEmployee, ...prev.employees],
                        filteredEmployees: [newEmployee, ...prev.filteredEmployees],
                        totalItems: prev.totalItems + 1,
                        isCreating: false,
                        cacheValid: false // Invalidate cache
                    }));
                } else {
                    // Conservative approach - refetch data
                    setState(prev => ({ ...prev, isCreating: false }));
                    await fetchEmployees();
                }

                console.log('✅ Successfully created employee:', newEmployee.id);
                return newEmployee;
            } else {
                throw new Error(result.error || 'Failed to create employee');
            }
        } catch (error: any) {
            console.error('❌ Error in createEmployee:', error);

            // Extract validation errors if available
            const validationErrors = error.details?.validationErrors || {};

            setState(prev => ({
                ...prev,
                isCreating: false,
                error: error.message || 'Nie udało się utworzyć pracownika',
                validationErrors
            }));
            return null;
        }
    }, [optimisticUpdates, fetchEmployees]);

    /**
     * Updates an employee with optimistic updates and rollback
     */
    const updateEmployee = useCallback(async (data: EmployeeUpdatePayload): Promise<ExtendedEmployee | null> => {
        if (!data.id) {
            console.error('❌ Employee ID is required for update');
            return null;
        }

        // Store original state for rollback
        const originalEmployees = state.employees;
        const originalFiltered = state.filteredEmployees;
        const originalSelected = state.selectedEmployee;

        try {
            setState(prev => ({
                ...prev,
                isUpdating: true,
                error: null,
                validationErrors: {}
            }));

            console.log('📝 Updating employee:', data.id);

            if (optimisticUpdates) {
                // Optimistic update
                const updateEmployeeInArray = (employees: ExtendedEmployee[]) =>
                    employees.map(emp => emp.id === data.id ? { ...emp, ...data } : emp);

                setState(prev => ({
                    ...prev,
                    employees: updateEmployeeInArray(prev.employees),
                    filteredEmployees: updateEmployeeInArray(prev.filteredEmployees),
                    selectedEmployee: prev.selectedEmployee?.id === data.id
                        ? { ...prev.selectedEmployee, ...data }
                        : prev.selectedEmployee
                }));
            }

            const result = await employeesApi.updateEmployee(data);

            if (result.success && result.data) {
                const updatedEmployee = result.data;

                // Update with server response
                const serverUpdate = (employees: ExtendedEmployee[]) =>
                    employees.map(emp => emp.id === data.id ? updatedEmployee : emp);

                setState(prev => ({
                    ...prev,
                    employees: serverUpdate(prev.employees),
                    filteredEmployees: serverUpdate(prev.filteredEmployees),
                    selectedEmployee: prev.selectedEmployee?.id === data.id ? updatedEmployee : prev.selectedEmployee,
                    isUpdating: false,
                    cacheValid: false
                }));

                console.log('✅ Successfully updated employee:', updatedEmployee.id);
                return updatedEmployee;
            } else {
                throw new Error(result.error || 'Failed to update employee');
            }
        } catch (error: any) {
            console.error('❌ Error in updateEmployee:', error);

            // Rollback optimistic update
            if (optimisticUpdates) {
                setState(prev => ({
                    ...prev,
                    employees: originalEmployees,
                    filteredEmployees: originalFiltered,
                    selectedEmployee: originalSelected,
                    isUpdating: false,
                    error: error.message || 'Nie udało się zaktualizować pracownika',
                    validationErrors: error.details?.validationErrors || {}
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isUpdating: false,
                    error: error.message || 'Nie udało się zaktualizować pracownika'
                }));
            }
            return null;
        }
    }, [state.employees, state.filteredEmployees, state.selectedEmployee, optimisticUpdates]);

    /**
     * Deletes an employee with optimistic updates and rollback
     */
    const deleteEmployee = useCallback(async (id: string): Promise<boolean> => {
        // Store original state for rollback
        const originalEmployees = state.employees;
        const originalFiltered = state.filteredEmployees;
        const originalSelected = state.selectedEmployee;
        const originalTotalItems = state.totalItems;

        try {
            setState(prev => ({ ...prev, isDeleting: true, error: null }));

            console.log('🗑️ Deleting employee:', id);

            if (optimisticUpdates) {
                // Optimistic update - remove from lists
                setState(prev => ({
                    ...prev,
                    employees: prev.employees.filter(emp => emp.id !== id),
                    filteredEmployees: prev.filteredEmployees.filter(emp => emp.id !== id),
                    selectedEmployee: prev.selectedEmployee?.id === id ? null : prev.selectedEmployee,
                    totalItems: Math.max(0, prev.totalItems - 1)
                }));
            }

            const result = await employeesApi.deleteEmployee(id);

            if (result.success) {
                setState(prev => ({
                    ...prev,
                    isDeleting: false,
                    cacheValid: false
                }));

                console.log('✅ Successfully deleted employee:', id);
                return true;
            } else {
                throw new Error(result.error || 'Failed to delete employee');
            }
        } catch (error: any) {
            console.error('❌ Error in deleteEmployee:', error);

            // Rollback optimistic update
            if (optimisticUpdates) {
                setState(prev => ({
                    ...prev,
                    employees: originalEmployees,
                    filteredEmployees: originalFiltered,
                    selectedEmployee: originalSelected,
                    totalItems: originalTotalItems,
                    isDeleting: false,
                    error: error.message || 'Nie udało się usunąć pracownika'
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isDeleting: false,
                    error: error.message || 'Nie udało się usunąć pracownika'
                }));
            }
            return false;
        }
    }, [state.employees, state.filteredEmployees, state.selectedEmployee, state.totalItems, optimisticUpdates]);

    // ========================================================================================
    // SELECTION AND FILTERING
    // ========================================================================================

    /**
     * Selects an employee and fetches detailed data if needed
     */
    const selectEmployee = useCallback(async (employee: ExtendedEmployee | null) => {
        // 🔧 FIX: Wyczyść dokumenty przy zmianie pracownika
        setState(prev => ({
            ...prev,
            selectedEmployee: employee,
            // Wyczyść cache dokumentów
            documents: [],
            documentError: null,
            isLoadingDocuments: false
        }));

        // Fetch detailed data if employee is selected and doesn't have all details
        if (employee && !employee.emergencyContact) {
            try {
                console.log('🔍 Fetching detailed employee data:', employee.id);
                const result = await employeesApi.getEmployeeById(employee.id);

                if (result.success && result.data) {
                    setState(prev => ({
                        ...prev,
                        selectedEmployee: result.data!
                    }));
                }
            } catch (error) {
                console.error('❌ Error fetching employee details:', error);
            }
        }
    }, []);

    /**
     * Updates filters with debouncing
     */
    const setFilters = useCallback(async (filters: EmployeeFilters) => {
        // Clear existing debounce timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        currentFiltersRef.current = filters;

        // Debounce the API call
        debounceTimeoutRef.current = setTimeout(async () => {
            setState(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
            await fetchEmployees({ page: 0, ...filters });
        }, DEBOUNCE_DELAY);
    }, [fetchEmployees]);

    /**
     * Clears all filters
     */
    const clearFilters = useCallback(async () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        currentFiltersRef.current = {};
        setState(prev => ({ ...prev, currentPage: 0 }));
        await fetchEmployees({ page: 0 });
    }, [fetchEmployees]);

    /**
     * Performs client-side search for immediate feedback
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
     * Sorts employees with API integration
     */
    const sortEmployees = useCallback(async (field: 'fullName' | 'position' | 'email' | 'hireDate' | 'role' | 'hourlyRate' | 'isActive', direction: 'asc' | 'desc') => {
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
        if (page !== state.currentPage) {
            setState(prev => ({ ...prev, currentPage: page }));
            await fetchEmployees({ page });
        }
    }, [state.currentPage, fetchEmployees]);

    const setPageSize = useCallback(async (size: number) => {
        if (size !== state.pageSize) {
            setState(prev => ({ ...prev, pageSize: size, currentPage: 0 }));
            await fetchEmployees({ page: 0, size });
        }
    }, [state.pageSize, fetchEmployees]);

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
            setState(prev => ({
                ...prev,
                isLoadingDocuments: true,
                documentError: null,
                documents: []
            }));

            console.log('📄 Fetching documents for employee:', employeeId);

            const result = await employeesApi.getEmployeeDocuments(employeeId);

            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    documents: result.data!,
                    isLoadingDocuments: false
                }));
                console.log('✅ Successfully fetched documents:', result.data.length);
            } else {
                throw new Error(result.error || 'Failed to fetch documents');
            }
        } catch (error: any) {
            console.error('❌ Error in fetchDocuments:', error);
            setState(prev => ({
                ...prev,
                isLoadingDocuments: false,
                documentError: error.message || 'Nie udało się pobrać dokumentów',
                // 🔧 FIX: Wyczyść dokumenty przy błędzie
                documents: []
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
            setState(prev => ({
                ...prev,
                isLoadingDocuments: true,
                documentError: null
            }));

            console.log('📤 Uploading document for employee:', employeeId);

            const result = await employeesApi.uploadEmployeeDocument({
                employeeId,
                name,
                type,
                file
            });

            if (result.success && result.data) {
                // 🔧 FIX: Sprawdź czy dokument jest dla aktualnie wybranego pracownika
                setState(prev => {
                    // Tylko dodaj dokument jeśli to ten sam pracownik
                    if (prev.selectedEmployee?.id === employeeId) {
                        return {
                            ...prev,
                            documents: [...prev.documents, result.data!],
                            isLoadingDocuments: false
                        };
                    } else {
                        // Jeśli to inny pracownik, tylko zakończ loading
                        return {
                            ...prev,
                            isLoadingDocuments: false
                        };
                    }
                });

                console.log('✅ Successfully uploaded document:', result.data.id);
                return result.data;
            } else {
                throw new Error(result.error || 'Failed to upload document');
            }
        } catch (error: any) {
            console.error('❌ Error in uploadDocument:', error);
            setState(prev => ({
                ...prev,
                isLoadingDocuments: false,
                documentError: error.message || 'Nie udało się przesłać dokumentu'
            }));
            return null;
        }
    }, []);

    const downloadDocument = useCallback(async (documentId: string): Promise<boolean> => {
        try {
            console.log('📥 Starting document download:', documentId);

            const result = await employeesApi.downloadEmployeeDocument(documentId);

            if (result.success && result.data) {
                const { blob, filename } = result.data;

                // Utwórz URL dla blob'a
                const url = window.URL.createObjectURL(blob);

                // Utwórz tymczasowy link do pobrania
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';

                // Dodaj do DOM, kliknij i usuń
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Zwolnij pamięć
                window.URL.revokeObjectURL(url);

                console.log('✅ Document downloaded successfully:', filename);
                return true;
            } else {
                throw new Error(result.error || 'Failed to download document');
            }
        } catch (error: any) {
            console.error('❌ Error in downloadDocument:', error);
            return false;
        }
    }, []);


    /**
     * Deletes a document
     */
    const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, documentError: null }));

            console.log('🗑️ Deleting document:', documentId);

            const result = await employeesApi.deleteEmployeeDocument(documentId);

            if (result.success) {
                setState(prev => ({
                    ...prev,
                    documents: prev.documents.filter(doc => doc.id !== documentId)
                }));

                console.log('✅ Successfully deleted document:', documentId);
                return true;
            } else {
                throw new Error(result.error || 'Failed to delete document');
            }
        } catch (error: any) {
            console.error('❌ Error in deleteDocument:', error);
            setState(prev => ({
                ...prev,
                documentError: error.message || 'Nie udało się usunąć dokumentu'
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
        setState(prev => ({ ...prev, cacheValid: false }));
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

    /**
     * Invalidates cache manually
     */
    const invalidateCache = useCallback(() => {
        setState(prev => ({
            ...prev,
            cacheValid: false,
            lastFetch: null
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

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [autoFetch]); // Only run on mount

    /**
     * Set up refresh interval if specified
     */
    useEffect(() => {
        if (refreshInterval && refreshInterval > 0) {
            refreshIntervalRef.current = setInterval(() => {
                if (!state.isLoading && !state.isCreating && !state.isUpdating && !state.isDeleting) {
                    console.log('⏰ Auto-refreshing employees data');
                    refreshData();
                }
            }, refreshInterval);

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [refreshInterval, state.isLoading, state.isCreating, state.isUpdating, state.isDeleting, refreshData]);

    /**
     * Update cache validity based on time
     */
    useEffect(() => {
        setState(prev => ({ ...prev, cacheValid: isCacheValid }));
    }, [isCacheValid]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
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
        downloadDocument,
        refreshData,
        clearError,
        searchEmployees,
        sortEmployees,
        invalidateCache
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

            console.log('🔍 Fetching single employee:', employeeId);

            const result = await employeesApi.getEmployeeById(employeeId);

            if (result.success && result.data) {
                setEmployee(result.data);
                console.log('✅ Successfully fetched employee:', result.data.id);
            } else {
                throw new Error(result.error || 'Employee not found');
            }
        } catch (error: any) {
            console.error('❌ Error fetching employee:', error);
            setError(error.message || 'Nie udało się pobrać danych pracownika');
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
    const [statistics, setStatistics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatistics = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('📊 Fetching employee statistics');

            const result = await employeesApi.getEmployeeStatistics();

            if (result.success && result.data) {
                setStatistics(result.data);
                console.log('✅ Successfully fetched statistics');
            } else {
                throw new Error(result.error || 'Failed to fetch statistics');
            }
        } catch (error: any) {
            console.error('❌ Error fetching statistics:', error);
            setError(error.message || 'Nie udało się pobrać statystyk');
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