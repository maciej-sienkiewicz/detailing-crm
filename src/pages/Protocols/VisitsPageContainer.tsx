// src/pages/Protocols/VisitsPageContainer.tsx - Z OBSŁUGĄ REZERWACJI
import React, {useCallback, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {FaClipboardCheck, FaPlus} from 'react-icons/fa';
import {useLocation, useNavigate} from 'react-router-dom';
import {VisitListItem, visitsApi} from '../../api/visitsApiNew';
import {ProtocolStatus} from '../../types';
import {servicesApi} from '../../api/servicesApi';
import {protocolsApi} from '../../api/protocolsApi';
import {reservationsApi, Reservation} from '../../api/reservationsApi';
import {PageHeader, PrimaryButton} from '../../components/common/PageHeader';
import {theme} from '../../styles/theme';
import Pagination from '../../components/common/Pagination';

type StatusFilterType = 'all' | ProtocolStatus;

// Helper to map Reservation to VisitListItem
const mapReservationToVisitListItem = (reservation: Reservation): VisitListItem => {
    return {
        id: reservation.id,
        title: reservation.title,
        vehicle: {
            make: reservation.vehicleMake,
            model: reservation.vehicleModel,
            licensePlate: '', // Not available yet
            productionYear: 0,
            color: undefined
        },
        period: {
            startDate: reservation.startDate,
            endDate: reservation.endDate
        },
        owner: {
            name: reservation.contactName || reservation.contactPhone,
            companyName: undefined
        },
        status: ProtocolStatus.SCHEDULED,
        totalAmountNetto: 0,
        totalAmountBrutto: 0,
        totalTaxAmount: 0,
        calendarColorId: reservation.calendarColorId,
        selectedServices: [],
        totalServiceCount: 0,
        lastUpdate: reservation.updatedAt
    };
};

interface AppData {
    services: any[];
    counters: Record<string, number>;
    servicesLoading: boolean;
    countersLoading: boolean;
    servicesLoaded: boolean;
    countersLoaded: boolean;
}

export const VisitsPageContainer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isFirstLoad = useRef(true);

    const [visits, setVisits] = useState<VisitListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilterType>(ProtocolStatus.IN_PROGRESS);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalItems: 0,
        totalPages: 0
    });

    const [appData, setAppData] = useState<AppData>({
        services: [],
        counters: {},
        servicesLoading: false,
        countersLoading: false,
        servicesLoaded: false,
        countersLoaded: false
    });

    const loadServices = useCallback(async () => {
        if (appData.servicesLoaded || appData.servicesLoading) return;

        setAppData(prev => ({ ...prev, servicesLoading: true }));

        try {
            const servicesData = await servicesApi.fetchServices();
            setAppData(prev => ({
                ...prev,
                services: servicesData,
                servicesLoading: false,
                servicesLoaded: true
            }));
        } catch (error) {
            console.error('Error loading services:', error);
            setAppData(prev => ({
                ...prev,
                servicesLoading: false,
                servicesLoaded: false
            }));
        }
    }, [appData.servicesLoaded, appData.servicesLoading]);

    const loadCounters = useCallback(async () => {
        if (appData.countersLoaded || appData.countersLoading) return;

        setAppData(prev => ({ ...prev, countersLoading: true }));

        try {
            const [protocolCounters, reservationCounters] = await Promise.all([
                protocolsApi.getProtocolCounters(),
                reservationsApi.getCounters()
            ]);

            setAppData(prev => ({
                ...prev,
                counters: {
                    all: protocolCounters.all + reservationCounters.all,
                    [ProtocolStatus.SCHEDULED]: reservationCounters.pending + reservationCounters.confirmed,
                    [ProtocolStatus.IN_PROGRESS]: protocolCounters.inProgress || 0,
                    [ProtocolStatus.READY_FOR_PICKUP]: protocolCounters.readyForPickup || 0,
                    [ProtocolStatus.COMPLETED]: protocolCounters.completed || 0,
                    [ProtocolStatus.CANCELLED]: protocolCounters.cancelled || 0
                },
                countersLoading: false,
                countersLoaded: true
            }));
        } catch (error) {
            console.error('Error loading counters:', error);
            setAppData(prev => ({
                ...prev,
                countersLoading: false,
                countersLoaded: false
            }));
        }
    }, [appData.countersLoaded, appData.countersLoading]);

    const fetchData = useCallback(async (status: StatusFilterType, page: number = 0) => {
        setLoading(true);
        setError(null);

        try {
            // For SCHEDULED status, fetch reservations instead of visits
            if (status === ProtocolStatus.SCHEDULED) {
                const reservationsResponse = await reservationsApi.listReservations({
                    page,
                    size: 20,
                    sortBy: 'startDate',
                    sortDirection: 'ASC'
                });

                const mappedVisits = reservationsResponse.data.map(mapReservationToVisitListItem);

                setVisits(mappedVisits);
                setPagination({
                    page: reservationsResponse.page,
                    size: reservationsResponse.size,
                    totalItems: reservationsResponse.totalItems,
                    totalPages: reservationsResponse.totalPages
                });
            } else {
                // For other statuses, fetch regular visits
                const searchFilters: any = {
                    page,
                    size: 20
                };

                if (status !== 'all') {
                    searchFilters.status = status;
                }

                const result = await visitsApi.getVisitsList(searchFilters);

                if (result.success && result.data) {
                    setVisits(result.data.data);
                    setPagination({
                        page: result.data.pagination.currentPage,
                        size: result.data.pagination.pageSize,
                        totalItems: result.data.pagination.totalItems,
                        totalPages: result.data.pagination.totalPages
                    });
                } else {
                    setError(result.error || 'Błąd podczas ładowania danych');
                    setVisits([]);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Wystąpił błąd podczas ładowania danych');
            setVisits([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleStatusFilterChange = useCallback(async (status: StatusFilterType) => {
        if (status === activeStatusFilter) return;

        setActiveStatusFilter(status);
        await fetchData(status, 0);
    }, [activeStatusFilter, fetchData]);

    const handlePageChange = useCallback(async (page: number) => {
        await fetchData(activeStatusFilter, page - 1);
    }, [activeStatusFilter, fetchData]);

    const handleVisitClick = useCallback((visit: VisitListItem) => {
        // Check if this is a reservation (no license plate = reservation)
        if (activeStatusFilter === ProtocolStatus.SCHEDULED && !visit.vehicle.licensePlate) {
            // Navigate to reservation conversion page
            navigate(`/reservations/${visit.id}/convert`);
        } else {
            navigate(`/visits/${visit.id}`);
        }
    }, [navigate, activeStatusFilter]);

    const handleViewVisit = useCallback((visit: VisitListItem) => {
        if (activeStatusFilter === ProtocolStatus.SCHEDULED && !visit.vehicle.licensePlate) {
            navigate(`/reservations/${visit.id}/convert`);
        } else {
            navigate(`/visits/${visit.id}`);
        }
    }, [navigate, activeStatusFilter]);

    const handleEditVisit = useCallback((visitId: string) => {
        navigate(`/visits/${visitId}/edit`);
    }, [navigate]);

    const handleDeleteVisit = useCallback(async (visitId: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć?')) {
            try {
                if (activeStatusFilter === ProtocolStatus.SCHEDULED) {
                    await reservationsApi.deleteReservation(visitId);
                } else {
                    await visitsApi.deleteVisit(visitId);
                }
                await fetchData(activeStatusFilter, pagination.page);
                await loadCounters();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    }, [activeStatusFilter, pagination.page, fetchData, loadCounters]);

    const handleAddVisit = useCallback(() => {
        // Navigate to reservation creation page
        navigate('/reservations/new');
    }, [navigate]);

    useEffect(() => {
        if (isFirstLoad.current) {
            loadServices();
            loadCounters();
            fetchData(activeStatusFilter, 0);
            isFirstLoad.current = false;
        }
    }, [loadServices, loadCounters, fetchData, activeStatusFilter]);

    const headerActions = (
        <PrimaryButton onClick={handleAddVisit}>
            <FaPlus /> Nowa rezerwacja
        </PrimaryButton>
    );

    return (
        <PageContainer>
            <PageHeader
                icon={FaClipboardCheck}
                title="Wizyty i Rezerwacje"
                subtitle="Zarządzanie wizytami i rezerwacjami klientów"
                actions={headerActions}
            />

            <ContentContainer>
                <StatusFilters>
                    {[
                        { key: ProtocolStatus.SCHEDULED, label: 'Zaplanowane' },
                        { key: ProtocolStatus.IN_PROGRESS, label: 'W realizacji' },
                        { key: ProtocolStatus.READY_FOR_PICKUP, label: 'Gotowe do odbioru' },
                        { key: ProtocolStatus.COMPLETED, label: 'Zakończone' },
                        { key: ProtocolStatus.CANCELLED, label: 'Anulowane' }
                    ].map(({ key, label }) => (
                        <StatusButton
                            key={key}
                            $active={activeStatusFilter === key}
                            onClick={() => handleStatusFilterChange(key)}
                        >
                            {label}
                            {appData.counters[key] !== undefined && (
                                <CountBadge>{appData.counters[key]}</CountBadge>
                            )}
                        </StatusButton>
                    ))}
                </StatusFilters>

                <ResultsSection>
                    {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

                    {loading ? (
                        <LoadingState>Ładowanie...</LoadingState>
                    ) : (
                        <TableWrapper>
                            <SimpleTable>
                                <thead>
                                <tr>
                                    <Th>Pojazd</Th>
                                    <Th>Nr rej.</Th>
                                    <Th>Klient</Th>
                                    <Th>Okres</Th>
                                    <Th>Status</Th>
                                    <Th>Akcje</Th>
                                </tr>
                                </thead>
                                <tbody>
                                {visits.map(visit => (
                                    <Tr key={visit.id} onClick={() => handleVisitClick(visit)}>
                                        <Td>{visit.vehicle.make} {visit.vehicle.model}</Td>
                                        <Td>{visit.vehicle.licensePlate || '—'}</Td>
                                        <Td>{visit.owner.name}</Td>
                                        <Td>
                                            {new Date(visit.period.startDate).toLocaleDateString('pl-PL')}
                                        </Td>
                                        <Td>
                                            <StatusBadge $status={visit.status}>
                                                {visit.status}
                                            </StatusBadge>
                                        </Td>
                                        <Td onClick={(e) => e.stopPropagation()}>
                                            <ActionButton
                                                onClick={() => handleDeleteVisit(visit.id)}
                                            >
                                                Usuń
                                            </ActionButton>
                                        </Td>
                                    </Tr>
                                ))}
                                </tbody>
                            </SimpleTable>
                        </TableWrapper>
                    )}

                    {pagination.totalPages > 1 && (
                        <PaginationWrapper>
                            <Pagination
                                currentPage={pagination.page + 1}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                                totalItems={pagination.totalItems}
                                pageSize={pagination.size}
                                showTotalItems={true}
                            />
                        </PaginationWrapper>
                    )}
                </ResultsSection>
            </ContentContainer>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    background: ${theme.surfaceHover};
    min-height: 100vh;
`;

const ContentContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.xxl};
`;

const StatusFilters = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.xl};
    flex-wrap: wrap;
`;

const StatusButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: 2px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }
`;

const CountBadge = styled.span`
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
`;

const ResultsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

const ErrorMessage = styled.div`
    background: ${theme.errorBg};
    color: ${theme.error};
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radius.lg};
`;

const LoadingState = styled.div`
    padding: ${theme.spacing.xxl};
    text-align: center;
    color: ${theme.text.muted};
`;

const TableWrapper = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const SimpleTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th`
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.md};
    text-align: left;
    font-weight: 600;
    font-size: 13px;
    color: ${theme.text.primary};
    border-bottom: 2px solid ${theme.border};
`;

const Tr = styled.tr`
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: ${theme.surfaceHover};
    }

    &:not(:last-child) {
        border-bottom: 1px solid ${theme.border};
    }
`;

const Td = styled.td`
    padding: ${theme.spacing.md};
    font-size: 13px;
    color: ${theme.text.secondary};
`;

const StatusBadge = styled.span<{ $status: string }>`
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    background: ${theme.primaryGhost};
    color: ${theme.primary};
`;

const ActionButton = styled.button`
    padding: 6px 12px;
    background: ${theme.errorBg};
    color: ${theme.error};
    border: none;
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        background: ${theme.error};
        color: white;
    }
`;

const PaginationWrapper = styled.div`
    padding: ${theme.spacing.xl} 0;
    display: flex;
    justify-content: center;
`;