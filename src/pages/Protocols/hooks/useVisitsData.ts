import {useCallback, useRef, useState} from 'react';
import {VisitListItem, visitsApi} from '../../../api/visitsApiNew';
import {PaginationParams} from '../../../api/apiClientNew';
import {VisitFilterParams} from './useVisitsFilters';

export interface UseVisitsDataReturn {
    visits: VisitListItem[];
    loading: boolean;
    error: string | null;
    pagination: PaginationParams & {
        totalItems: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    searchVisits: (filters: VisitFilterParams, paginationParams?: PaginationParams) => Promise<void>;
    refreshVisits: () => Promise<void>;
    resetData: () => void;
}

export const useVisitsData = (): UseVisitsDataReturn => {
    const [visits, setVisits] = useState<VisitListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
    });

    const lastFiltersRef = useRef<VisitFilterParams>({});
    const lastPaginationRef = useRef<PaginationParams>({ page: 0, size: 20 });

    const searchVisits = useCallback(async (
        filters: VisitFilterParams,
        paginationParams: PaginationParams = { page: 0, size: 20 }
    ) => {
        setLoading(true);
        setError(null);

        lastFiltersRef.current = filters;
        lastPaginationRef.current = paginationParams;

        console.log('🚀 Executing search with filters:', filters);
        console.log('📄 Pagination params:', paginationParams);

        try {
            const result = await visitsApi.getVisitsList({
                ...filters,
                ...paginationParams
            });

            if (result.success && result.data) {
                setVisits(result.data.data);
                setPagination({
                    page: result.data.pagination.currentPage,
                    size: result.data.pagination.pageSize,
                    totalItems: result.data.pagination.totalItems,
                    totalPages: result.data.pagination.totalPages,
                    hasNext: result.data.pagination.hasNext,
                    hasPrevious: result.data.pagination.hasPrevious
                });
            } else {
                setError(result.error || 'Błąd podczas ładowania wizyt');
                setVisits([]);
                setPagination({
                    page: 0,
                    size: 20,
                    totalItems: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrevious: false
                });
            }
        } catch (err) {
            console.error('❌ Search error:', err);
            setError(err instanceof Error ? err.message : 'Nieoczekiwany błąd');
            setVisits([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshVisits = useCallback(async () => {
        await searchVisits(lastFiltersRef.current, lastPaginationRef.current);
    }, [searchVisits]);

    const resetData = useCallback(() => {
        setVisits([]);
        setError(null);
        setPagination({
            page: 0,
            size: 20,
            totalItems: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false
        });
        lastFiltersRef.current = {};
        lastPaginationRef.current = { page: 0, size: 20 };
    }, []);

    return {
        visits,
        loading,
        error,
        pagination,
        searchVisits,
        refreshVisits,
        resetData
    };
};