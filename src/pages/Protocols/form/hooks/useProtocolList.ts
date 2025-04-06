import { useState, useEffect } from 'react';
import { ProtocolListItem, ProtocolStatus } from '../../../../types';
import { protocolsApi } from '../../../../api/protocolsApi';

type FilterType = 'Zaplanowane' | 'W realizacji' | 'Oczekujące na odbiór' | 'Archiwum' | 'Wszystkie' | 'Porzucone';

interface UseProtocolListResult {
    protocols: ProtocolListItem[];
    filteredProtocols: ProtocolListItem[];
    loading: boolean;
    error: string | null;
    activeFilter: FilterType;
    setActiveFilter: (filter: FilterType) => void;
    refreshProtocolsList: () => void;
}

// Definiujemy mapowanie filtrów na statusy protokołów
const filterMapping: Record<FilterType, ProtocolStatus[]> = {
    'Zaplanowane': [ProtocolStatus.SCHEDULED],
    'W realizacji': [ProtocolStatus.IN_PROGRESS],
    'Oczekujące na odbiór': [ProtocolStatus.READY_FOR_PICKUP],
    'Archiwum': [ProtocolStatus.COMPLETED],
    'Wszystkie': [ProtocolStatus.SCHEDULED, ProtocolStatus.IN_PROGRESS, ProtocolStatus.READY_FOR_PICKUP, ProtocolStatus.COMPLETED, ProtocolStatus.CANCELLED],
    'Porzucone': [ProtocolStatus.CANCELLED]
};

export const useProtocolList = (): UseProtocolListResult => {
    const [protocols, setProtocols] = useState<ProtocolListItem[]>([]);
    const [filteredProtocols, setFilteredProtocols] = useState<ProtocolListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('W realizacji');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Funkcja do wymuszenia odświeżenia listy protokołów
    const refreshProtocolsList = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Efekt do pobierania danych
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Pobieranie listy protokołów
                const protocolsData = await protocolsApi.getProtocolsList();
                setProtocols(protocolsData);

                // Zastosuj aktualny filtr
                applyFilter(protocolsData, activeFilter);

                setError(null);
            } catch (err) {
                setError('Nie udało się pobrać danych protokołów');
                console.error('Error fetching car reception protocols:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshTrigger]);

    // Funkcja do zastosowania filtru
    const applyFilter = (data: ProtocolListItem[], filter: FilterType) => {
        if (filter === 'Wszystkie') {
            setFilteredProtocols(data);
        } else {
            const statusesToFilter = filterMapping[filter];
            setFilteredProtocols(data.filter(protocol =>
                statusesToFilter.includes(protocol.status)
            ));
        }
    };

    // Obsługa zmiany filtra
    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
        applyFilter(protocols, filter);
    };

    return {
        protocols,
        filteredProtocols,
        loading,
        error,
        activeFilter,
        setActiveFilter: handleFilterChange,
        refreshProtocolsList,
    };
};