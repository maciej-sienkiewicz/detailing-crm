import { useState, useEffect, useCallback } from 'react';
import { FilterType } from '../../list/ProtocolFilters';
import { ProtocolListItem, ProtocolStatus } from '../../../../types';
import { protocolsApi } from '../../../../api/protocolsApi';
import { SearchCriteria } from '../../list/ProtocolSearchFilters';

interface UseProtocolListReturn {
    protocols: ProtocolListItem[];
    filteredProtocols: ProtocolListItem[];
    loading: boolean;
    error: string | null;
    activeFilter: FilterType;
    setActiveFilter: (filter: FilterType) => void;
    refreshProtocolsList: () => Promise<void>;
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
    handlePageChange: (page: number) => void;
    searchProtocols: (criteria: SearchCriteria) => Promise<void>;
}

const mapFilterToStatus = (filter: FilterType): ProtocolStatus | undefined => {
    switch (filter) {
        case 'Zaplanowane':
            return ProtocolStatus.SCHEDULED;
        case 'W realizacji':
            return ProtocolStatus.IN_PROGRESS;
        case 'Oczekujące na odbiór':
            return ProtocolStatus.READY_FOR_PICKUP;
        case 'Archiwum':
            return ProtocolStatus.COMPLETED;
        case 'Porzucone':
            return ProtocolStatus.CANCELLED;
        default:
            return undefined;
    }
};

export const useProtocolList = (): UseProtocolListReturn => {
    const [protocols, setProtocols] = useState<ProtocolListItem[]>([]);
    const [filteredProtocols, setFilteredProtocols] = useState<ProtocolListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('W realizacji');
    const [searchParams, setSearchParams] = useState<SearchCriteria>({});

    const [pagination, setPagination] = useState({
        currentPage: 0,  // Indeksowanie od 0 dla API
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    const fetchProtocols = useCallback(async () => {
        setLoading(true);
        try {
            // Określenie statusu na podstawie aktywnego filtra
            const status = mapFilterToStatus(activeFilter);

            // Przygotowanie parametrów filtrowania
            const queryParams: any = {
                page: pagination.currentPage,  // Używamy currentPage z obiektu pagination
                size: pagination.pageSize
            };

            // Dodanie statusu tylko jeśli nie jest to filtr "Wszystkie"
            if (activeFilter !== 'Wszystkie' && status) {
                queryParams.status = status;
            }

            // Dodanie parametrów wyszukiwania, jeśli są dostępne
            if (Object.keys(searchParams).length > 0) {
                if (searchParams.clientName) queryParams.clientName = searchParams.clientName;
                if (searchParams.licensePlate) queryParams.licensePlate = searchParams.licensePlate;
                if (searchParams.make) queryParams.make = searchParams.make;
                if (searchParams.model) queryParams.model = searchParams.model;
                if (searchParams.dateFrom) queryParams.startDate = searchParams.dateFrom?.toISOString();
                if (searchParams.dateTo) queryParams.endDate = searchParams.dateTo?.toISOString();
                if (searchParams.serviceName) queryParams.serviceName = searchParams.serviceName;
                if (searchParams.price?.min) queryParams.minPrice = searchParams.price.min;
                if (searchParams.price?.max) queryParams.maxPrice = searchParams.price.max;
            }

            console.log('Pobieranie protokołów z parametrami:', queryParams);

            // Wywołanie API z paginacją
            const response = await protocolsApi.getProtocolsList(queryParams);

            console.log('Odpowiedź z API po przetworzeniu:', {
                dataLength: response.data.length,
                pagination: response.pagination
            });

            setProtocols(response.data);
            setFilteredProtocols(response.data);

            // Aktualizacja informacji o paginacji z odpowiedzi API
            setPagination({
                currentPage: response.pagination.currentPage,
                pageSize: response.pagination.pageSize,
                totalItems: response.pagination.totalItems,
                totalPages: response.pagination.totalPages
            });

            setError(null);
        } catch (err) {
            console.error('Error fetching protocols:', err);
            setError('Wystąpił błąd podczas pobierania danych. Spróbuj ponownie później.');
            setProtocols([]);
            setFilteredProtocols([]);
        } finally {
            setLoading(false);
        }
    }, [activeFilter, pagination.currentPage, pagination.pageSize, searchParams]);

    // Efekt pobierający dane przy inicjalizacji i zmianie zależności
    useEffect(() => {
        fetchProtocols();
    }, [fetchProtocols]);

    // Funkcja pomocnicza do odświeżenia listy
    const refreshProtocolsList = useCallback(async () => {
        await fetchProtocols();
    }, [fetchProtocols]);

    // Obsługa zmiany strony - upraszczamy tę funkcję
    const handlePageChange = (page: number) => {
        console.log(`Zmiana strony z ${pagination.currentPage + 1} na ${page}`);

        // Aktualizacja strony (zmniejszenie o 1 dla API)
        setPagination(prev => ({
            ...prev,
            currentPage: page - 1  // Konwersja z indeksowania od 1 (UI) na indeksowanie od 0 (API)
        }));

        // Nie wywołujemy fetchProtocols() bezpośrednio -
        // useEffect zrobi to za nas po zmianie pagination.currentPage
    };

    // Obsługa zmiany filtra
    const handleFilterChange = (filter: FilterType) => {
        if (filter === activeFilter) return;

        setActiveFilter(filter);

        // Reset paginacji przy zmianie filtra
        setPagination(prev => ({
            ...prev,
            currentPage: 0
        }));

        // Nie wywołujemy fetchProtocols() bezpośrednio -
        // useEffect zrobi to za nas po zmianie activeFilter i pagination.currentPage
    };

    // Obsługa wyszukiwania protokołów
    const searchProtocols = async (criteria: SearchCriteria) => {

    };

    return {
        protocols,
        filteredProtocols,
        loading,
        error,
        activeFilter,
        setActiveFilter: handleFilterChange,
        refreshProtocolsList,
        pagination: {
            currentPage: pagination.currentPage, // W UI strony są liczone od 1
            pageSize: pagination.pageSize,
            totalItems: pagination.totalItems,
            totalPages: pagination.totalPages
        },
        handlePageChange,
        searchProtocols
    };
};