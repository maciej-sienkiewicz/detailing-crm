import {useState, useEffect, useMemo} from 'react';
import { ProtocolListItem, ProtocolStatus } from '../../../../types';
import { protocolsApi } from '../../../../api/protocolsApi';

type FilterType = 'Zaplanowane' | 'W realizacji' | 'Oczekujące na odbiór' | 'Archiwum' | 'Wszystkie' | 'Porzucone';

export const useProtocolList = () => {
    const [protocols, setProtocols] = useState<ProtocolListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('W realizacji');

    // Stan dla paginacji
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // Funkcja do pobierania danych protokołów
    const fetchProtocols = async () => {
        setLoading(true);
        setError(null);

        try {
            // Mapowanie filtrów na parametry API
            const status = mapFilterToStatus(activeFilter);

            // Pobierz protokoły z paginacją
            const response = await protocolsApi.getProtocolsList({
                status: status !== 'ALL' ? status as ProtocolStatus : undefined,
                page: pagination.currentPage,
                size: pagination.pageSize
            });

            setProtocols(response.data);
            setPagination({
                currentPage: response.pagination.currentPage,
                pageSize: response.pagination.pageSize,
                totalItems: response.pagination.totalItems,
                totalPages: response.pagination.totalPages
            });
        } catch (err) {
            console.error('Error fetching protocols:', err);
            setError('Nie udało się pobrać danych. Spróbuj ponownie później.');
            setProtocols([]);
        } finally {
            setLoading(false);
        }
    };

    // Efekt pobierający dane przy zmianie filtra lub strony
    useEffect(() => {
        fetchProtocols();
    }, [activeFilter, pagination.currentPage]);

    // Funkcja do zmiany aktualnej strony
    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage - 1 // API używa indeksowania od 0, a komponent paginacji od 1
        }));
    };

    // Lista protokołów po filtrowaniu
    const filteredProtocols = useMemo(() => {
        return protocols;
    }, [protocols]);

    // Funkcja odświeżająca listę protokołów
    const refreshProtocolsList = () => {
        fetchProtocols();
    };

    // Funkcja mapująca filtry UI na statusy API
    const mapFilterToStatus = (filter: FilterType): string => {
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
            case 'Wszystkie':
            default:
                return 'ALL';
        }
    };

    return {
        protocols,
        filteredProtocols,
        loading,
        error,
        activeFilter,
        setActiveFilter,
        refreshProtocolsList,
        pagination,
        handlePageChange
    };
};