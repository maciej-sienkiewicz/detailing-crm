// src/pages/Protocols/form/hooks/useProtocolList.ts - Z OBSŁUGĄ REZERWACJI
import {useCallback, useEffect, useState} from 'react';
import {FilterType} from '../../list/ProtocolFilters';
import {ProtocolStatus} from '../../../../types';
import {SearchCriteria} from '../../list/ProtocolSearchFilters';
import visitsApiNew, {VisitListItem} from "../../../../api/visitsApiNew";
import {reservationsApi, Reservation} from "../../../../features/reservations/api/reservationsApi";

interface UseProtocolListReturn {
    protocols: VisitListItem[];
    filteredProtocols: VisitListItem[];
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
}

// ✅ ZMODYFIKOWANE: Mapowanie z uwzględnieniem rezerwacji
const mapFilterToStatus = (filter: FilterType): ProtocolStatus | 'reservations' | undefined => {
    switch (filter) {
        case 'Rezerwacje':
            return 'reservations';
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

// ✅ NOWE: Helper do konwersji Reservation na VisitListItem
const convertReservationToVisitListItem = (reservation: Reservation): VisitListItem => {
    return {
        id: reservation.id,
        vehicle: {
            make: reservation.vehicleMake,
            model: reservation.vehicleModel,
            licensePlate: '',
            productionYear: 0,
            color: undefined
        },
        period: {
            startDate: reservation.startDate,
            endDate: reservation.endDate || reservation.startDate
        },
        owner: {
            name: reservation.contactName || reservation.contactPhone,
            companyName: undefined
        },
        status: ProtocolStatus.IN_PROGRESS, // Rezerwacje wyświetlamy jako zaplanowane
        totalServiceCount: reservation.serviceCount,
        totalAmountNetto: reservation.totalPriceNetto,
        totalAmountBrutto: reservation.totalPriceBrutto,
        totalTaxAmount: reservation.totalTaxAmount,
        calendarColorId: reservation.calendarColorId,
        selectedServices: reservation.services.map(service => ({
            id: service.id,
            name: service.name,
            quantity: service.quantity,
            basePrice: service.basePrice,
            discountType: 'PERCENTAGE' as any,
            discountValue: 0,
            finalPrice: service.finalPrice,
            note: service.note
        })),
        title: reservation.title,
        lastUpdate: new Date(reservation.updatedAt).toLocaleDateString('pl-PL')
    };
};

export const useProtocolList = (): UseProtocolListReturn => {
    const [protocols, setProtocols] = useState<VisitListItem[]>([]);
    const [filteredProtocols, setFilteredProtocols] = useState<VisitListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('Rezerwacje');
    const [searchParams, setSearchParams] = useState<SearchCriteria>({});

    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // ✅ ZMODYFIKOWANE: Funkcja pobierania z obsługą rezerwacji
    const fetchProtocols = useCallback(async () => {
        setLoading(true);
        try {
            const status = mapFilterToStatus(activeFilter);

            // ✅ NOWE: Jeśli wybrane są rezerwacje, pobierz je
            if (status === 'reservations') {
                const result = await reservationsApi.listReservations({
                    page: pagination.currentPage,
                    size: pagination.pageSize,
                    sortBy: 'startDate',
                    sortDirection: 'ASC'
                });

                const convertedReservations = result.data.map(convertReservationToVisitListItem);
                setProtocols(convertedReservations);
                setFilteredProtocols(convertedReservations);

                setPagination({
                    currentPage: result.page,
                    pageSize: result.size,
                    totalItems: result.totalItems,
                    totalPages: result.totalPages
                });

                return;
            }

            // ✅ Standardowe pobieranie wizyt
            const queryParams: any = {
                page: pagination.currentPage,
                size: pagination.pageSize
            };

            if (status) {
                queryParams.status = status;
            }

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

            const result = await visitsApiNew.getVisitsList(queryParams);

            if (result.success && result.data) {
                setProtocols(result.data.data);
                setFilteredProtocols(result.data.data);

                setPagination({
                    currentPage: result.data.pagination.currentPage,
                    pageSize: result.data.pagination.pageSize,
                    totalItems: result.data.pagination.totalItems,
                    totalPages: result.data.pagination.totalPages
                });
            } else {
                console.error('Błąd pobierania wizyt:', result.error);
                setProtocols([]);
                setFilteredProtocols([]);
                setError(result.error || 'Nieznany błąd');

                setPagination({
                    currentPage: 0,
                    pageSize: 10,
                    totalItems: 0,
                    totalPages: 0
                });
            }
        } catch (err) {
            console.error('Error fetching protocols:', err);
            setProtocols([]);
            setFilteredProtocols([]);
        } finally {
            setLoading(false);
        }
    }, [activeFilter, pagination.currentPage, pagination.pageSize, searchParams]);

    useEffect(() => {
        fetchProtocols();
    }, [fetchProtocols]);

    const refreshProtocolsList = useCallback(async () => {
        await fetchProtocols();
    }, [fetchProtocols]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({
            ...prev,
            currentPage: page - 1
        }));
    };

    const handleFilterChange = (filter: FilterType) => {
        if (filter === activeFilter) return;

        setActiveFilter(filter);

        setPagination(prev => ({
            ...prev,
            currentPage: 0
        }));
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
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalItems: pagination.totalItems,
            totalPages: pagination.totalPages
        },
        handlePageChange,
    };
};