// src/pages/Finances/hooks/useFinancialData.ts
import {useCallback, useEffect, useState} from 'react';
import {
    DocumentType,
    UnifiedDocumentFilters,
    UnifiedDocumentSummary,
    UnifiedFinancialDocument
} from '../../../types/finance';
import {unifiedFinancialApi} from '../../../api/unifiedFinancialApi';

type FilterType = DocumentType | 'ALL';

interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export const useFinancialData = () => {
    // State
    const [documents, setDocuments] = useState<UnifiedFinancialDocument[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<UnifiedFinancialDocument[]>([]);
    const [summary, setSummary] = useState<UnifiedDocumentSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters and pagination
    const [filters, setFilters] = useState<UnifiedDocumentFilters>({});
    const [activeTypeFilter, setActiveTypeFilter] = useState<FilterType>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // Fetch documents
    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await unifiedFinancialApi.fetchDocuments(
                filters,
                pagination.currentPage,
                pagination.pageSize
            );

            setDocuments(response.data);
            setPagination({
                currentPage: response.pagination.currentPage,
                pageSize: response.pagination.pageSize,
                totalItems: response.pagination.totalItems,
                totalPages: response.pagination.totalPages
            });

            setError(null);
        } catch (err) {
            console.error('Error loading documents:', err);
            setError('Nie udało się załadować dokumentów finansowych');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.currentPage, pagination.pageSize]);

    // Fetch summary
    const fetchSummary = useCallback(async () => {
        try {
            const summaryData = await unifiedFinancialApi.getFinancialSummary();
            setSummary(summaryData);
        } catch (err) {
            console.error('Error loading summary:', err);
            // Summary error is not critical, don't show main error
        }
    }, []);

    // Refresh all data
    const refreshData = useCallback(async () => {
        await Promise.all([fetchDocuments(), fetchSummary()]);
    }, [fetchDocuments, fetchSummary]);

    // Filter documents based on active filters
    const applyFilters = useCallback(() => {
        let result = [...documents];

        // Type filter
        if (activeTypeFilter !== 'ALL') {
            result = result.filter(doc => doc.type === activeTypeFilter);
        }

        // Search term filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(doc =>
                doc.title.toLowerCase().includes(searchLower) ||
                doc.buyerName.toLowerCase().includes(searchLower) ||
                doc.number.toLowerCase().includes(searchLower) ||
                (doc.description && doc.description.toLowerCase().includes(searchLower))
            );
        }

        // Advanced filters
        if (Object.keys(filters).length > 0) {
            if (filters.title) {
                const titleQuery = filters.title.toLowerCase();
                result = result.filter(doc =>
                    doc.title.toLowerCase().includes(titleQuery)
                );
            }

            if (filters.buyerName) {
                const buyerQuery = filters.buyerName.toLowerCase();
                result = result.filter(doc =>
                    doc.buyerName.toLowerCase().includes(buyerQuery)
                );
            }

            if (filters.status) {
                result = result.filter(doc => doc.status === filters.status);
            }

            if (filters.direction) {
                result = result.filter(doc => doc.direction === filters.direction);
            }

            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                result = result.filter(doc => new Date(doc.issuedDate) >= fromDate);
            }

            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                result = result.filter(doc => new Date(doc.issuedDate) <= toDate);
            }

            if (filters.minAmount !== undefined) {
                result = result.filter(doc => doc.totalGross >= filters.minAmount!);
            }

            if (filters.maxAmount !== undefined) {
                result = result.filter(doc => doc.totalGross <= filters.maxAmount!);
            }
        }

        setFilteredDocuments(result);
    }, [documents, activeTypeFilter, searchTerm, filters]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters: UnifiedDocumentFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
    }, []);

    const handleTypeFilterChange = useCallback((filter: FilterType) => {
        setActiveTypeFilter(filter);
        const newFilters = { ...filters };

        if (filter === 'ALL') {
            delete newFilters.type;
        } else {
            newFilters.type = filter;
        }

        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
    }, [filters]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    }, []);

    // Effects
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    return {
        // Data
        documents,
        filteredDocuments,
        summary,
        loading,
        error,

        // Filters and pagination
        filters,
        activeTypeFilter,
        searchTerm,
        pagination,

        // Actions
        refreshData,
        handleFilterChange,
        handleTypeFilterChange,
        handleSearch,
        handlePageChange
    };
};