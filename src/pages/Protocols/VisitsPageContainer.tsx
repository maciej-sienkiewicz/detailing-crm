// src/pages/Protocols/VisitsPageContainer.tsx - POPRAWIONA WERSJA
import React, {useCallback, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {FaArrowLeft, FaCalendarPlus, FaClipboardCheck, FaPlus} from 'react-icons/fa';
import {useLocation, useNavigate} from 'react-router-dom';
import {VisitListItem, visitsApi} from '../../api/visitsApiNew';
import {ProtocolStatus} from '../../types';
import {protocolsApi} from '../../api/protocolsApi';
import {reservationsApi, Reservation, ReservationStatus} from '../../features/reservations/api/reservationsApi';
import {useVisitsData} from './hooks/useVisitsData';
import {useVisitsFilters} from './hooks/useVisitsFilters';
import {VisitsFilterBar} from './components/VisitsFilterBar';
import {VisitsStatusFilters} from './components/VisitsStatusFilters';
import {VisitsTable} from './components/VisitsTable';
import {ServiceOption} from './components/ServiceAutocomplete';
import Pagination from '../../components/common/Pagination';
import {PageHeader, PrimaryButton} from '../../components/common/PageHeader';
import {theme} from '../../styles/theme';

import ProtocolConfirmationModal from './shared/modals/ProtocolConfirmationModal';
import {BiPen} from "react-icons/bi";
import {ReservationForm} from "../../features/reservations";
import {servicesApi} from "../../features/services/api/servicesApi";
import {ReservationsTable} from "../../features/reservations/components/ReservationsTable/ReservationsTable";
import {EditVisitForm} from "../../features/visits/components/EditVisitForm/EditVisitForm";
import {mapReservationToProtocol} from "../../features/reservations/hooks/mapReservationToProtocol";

type StatusFilterType = 'reservations' | 'all' | ProtocolStatus;

interface AppData {
    services: ServiceOption[];
    counters: Record<string, number>;
    servicesLoading: boolean;
    countersLoading: boolean;
    servicesLoaded: boolean;
    countersLoaded: boolean;
}

type FormType = 'none' | 'visit' | 'reservation';

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
            endDate: reservation.endDate
        },
        owner: {
            name: reservation.contactName || reservation.contactPhone,
            companyName: undefined
        },
        status: convertReservationStatusToProtocolStatus(reservation.status),
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
        lastUpdate: reservation.updatedAt
    };
};

const convertReservationStatusToProtocolStatus = (status: ReservationStatus): ProtocolStatus => {
    switch (status) {
        case ReservationStatus.PENDING:
        case ReservationStatus.CONFIRMED:
            return ProtocolStatus.IN_PROGRESS;
        case ReservationStatus.CONVERTED:
            return ProtocolStatus.COMPLETED;
        case ReservationStatus.CANCELLED:
            return ProtocolStatus.CANCELLED;
        default:
            return ProtocolStatus.IN_PROGRESS;
    }
};

export const VisitsPageContainer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isFirstLoad = useRef(true);
    const lastStatusFilter = useRef<StatusFilterType>('reservations');

    const [activeForm, setActiveForm] = useState<FormType>('none');
    const [editingVisit, setEditingVisit] = useState<any>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
    const [currentProtocol, setCurrentProtocol] = useState<any>(null);
    const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilterType>('reservations');

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [reservationsLoading, setReservationsLoading] = useState(false);
    const [reservationsPagination, setReservationsPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalItems: 0
    });

    const [appData, setAppData] = useState<AppData>({
        services: [],
        counters: {},
        servicesLoading: false,
        countersLoading: false,
        servicesLoaded: false,
        countersLoaded: false
    });

    const {
        visits,
        loading: visitsLoading,
        error,
        pagination,
        searchVisits,
        refreshVisits,
        resetData
    } = useVisitsData();

    const {
        filters,
        activeFiltersCount,
        hasActiveFilters,
        updateFilter,
        updateFilters,
        clearFilter,
        clearAllFilters,
        getApiFilters
    } = useVisitsFilters();

    const loadServices = useCallback(async () => {
        if (appData.servicesLoaded || appData.servicesLoading) return;

        setAppData(prev => ({ ...prev, servicesLoading: true }));

        try {
            const servicesData = await servicesApi.fetchServices();
            const serviceOptions: ServiceOption[] = servicesData.map(service => ({
                id: service.id,
                name: service.name
            }));

            setAvailableServices(servicesData);
            setAppData(prev => ({
                ...prev,
                services: serviceOptions,
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
                    all: (protocolCounters.all || 0) + (reservationCounters.all || 0) - (reservationCounters.all || 0),
                    reservations: reservationCounters.pending + reservationCounters.confirmed,
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

    const loadReservations = useCallback(async (page: number = 0, size: number = 10) => {
        setReservationsLoading(true);
        try {
            const result = await reservationsApi.listReservations({
                page,
                size,
                sortBy: 'startDate',
                sortDirection: 'ASC'
            });

            setReservations(result.data);
            setReservationsPagination({
                page: result.page,
                size: result.size,
                totalPages: result.totalPages,
                totalItems: result.totalItems
            });
        } catch (error) {
            console.error('Error loading reservations:', error);
            setReservations([]);
        } finally {
            setReservationsLoading(false);
        }
    }, []);

    const performSearch = useCallback(async () => {
        const searchFilters = getApiFilters();

        if (activeStatusFilter === 'reservations') {
            await loadReservations(0, pagination.size || 10);
        } else if (activeStatusFilter !== 'all') {
            searchFilters.status = activeStatusFilter;
            await searchVisits(searchFilters, {
                page: 0,
                size: pagination.size || 10
            });
        } else {
            await searchVisits(searchFilters, {
                page: 0,
                size: pagination.size || 10
            });
        }
    }, [activeStatusFilter, getApiFilters, searchVisits, loadReservations, pagination.size]);

    const handleFiltersChange = useCallback((newFilters: Partial<typeof filters>) => {
        updateFilters(newFilters);
    }, [updateFilters]);

    const handleApplyFilters = useCallback(async () => {
        await performSearch();
    }, [performSearch]);

    const handleStatusFilterChange = useCallback(async (status: StatusFilterType) => {
        if (status === activeStatusFilter) {
            return;
        }

        setActiveStatusFilter(status);
        lastStatusFilter.current = status;

        if (status === 'reservations') {
            await loadReservations(0, pagination.size || 10);
        } else {
            const searchFilters = getApiFilters();
            if (status !== 'all') {
                searchFilters.status = status;
            }

            await searchVisits(searchFilters, {
                page: 0,
                size: pagination.size || 10
            });
        }
    }, [activeStatusFilter, getApiFilters, searchVisits, loadReservations, pagination.size]);

    const handleClearAllFilters = useCallback(async () => {
        clearAllFilters();
        setActiveStatusFilter('reservations');
        lastStatusFilter.current = 'reservations';

        await loadReservations(0, pagination.size || 10);
    }, [clearAllFilters, loadReservations, pagination.size]);

    const handlePageChange = useCallback(async (page: number) => {
        if (activeStatusFilter === 'reservations') {
            await loadReservations(page - 1, reservationsPagination.size);
        } else {
            const searchFilters = getApiFilters();
            if (activeStatusFilter !== 'all') {
                searchFilters.status = activeStatusFilter;
            }

            await searchVisits(searchFilters, {
                page: page - 1,
                size: pagination.size
            });
        }
    }, [activeStatusFilter, getApiFilters, searchVisits, loadReservations, pagination.size, reservationsPagination.size]);

    const handleVisitClick = useCallback((visit: VisitListItem) => {
        if (activeStatusFilter === 'reservations') {
            navigate(`/reservations/${visit.id}`);
        } else {
            navigate(`/visits/${visit.id}`);
        }
    }, [navigate, activeStatusFilter]);

    const handleViewVisit = useCallback((visit: VisitListItem) => {
        if (activeStatusFilter === 'reservations') {
            navigate(`/reservations/${visit.id}`);
        } else {
            navigate(`/visits/${visit.id}`);
        }
    }, [navigate, activeStatusFilter]);

    const handleEditVisit = useCallback((visitId: string) => {
        if (activeStatusFilter === 'reservations') {
            console.log('Edit reservation:', visitId);
        } else {
            navigate(`/visits/${visitId}/edit`);
        }
    }, [navigate, activeStatusFilter]);

    const handleDeleteVisit = useCallback(async (visitId: string) => {
        if (activeStatusFilter === 'reservations') {
            if (window.confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
                await reservationsApi.deleteReservation(visitId);
                await loadReservations(reservationsPagination.page, reservationsPagination.size);
            }
        } else {
            if (window.confirm('Czy na pewno chcesz usunąć tę wizytę?')) {
                await visitsApi.deleteVisit(visitId);
                await resetData();
            }
        }
    }, [activeStatusFilter, loadReservations, resetData, reservationsPagination]);

    const handleAddVisit = useCallback(() => {
        setEditingVisit(null);
        setActiveForm('visit');
    }, []);

    const handleAddReservation = useCallback(() => {
        setActiveForm('reservation');
    }, []);

    const handleFormCancel = useCallback(() => {
        setActiveForm('none');
        setEditingVisit(null);
    }, []);

    const handleSaveProtocol = useCallback((protocol: any, showConfirmationModal: boolean) => {
        setCurrentProtocol(protocol);

        if (showConfirmationModal) {
            setIsShowingConfirmationModal(true);
        } else {
            setActiveForm('none');
            setEditingVisit(null);
            refreshVisits();
            navigate(`/visits/${protocol.id}`);
        }
    }, [navigate, refreshVisits]);

    const handleReservationSuccess = useCallback((reservationId: string) => {
        console.log('✅ Reservation created:', reservationId);
        setActiveForm('none');

        if (activeStatusFilter === 'reservations') {
            loadReservations(0, reservationsPagination.size);
        } else {
            refreshVisits();
        }
    }, [activeStatusFilter, loadReservations, refreshVisits, reservationsPagination.size]);

    const handleConfirmationClose = useCallback(() => {
        setIsShowingConfirmationModal(false);
        if (currentProtocol) {
            setActiveForm('none');
            setEditingVisit(null);
            refreshVisits();
            navigate(`/visits/${currentProtocol.id}`);
        }
    }, [currentProtocol, navigate, refreshVisits]);

    const handleConfirmationConfirm = useCallback((options: { print: boolean; sendEmail: boolean }) => {
        handleConfirmationClose();
    }, [handleConfirmationClose]);

    const refreshServices = useCallback(async () => {
        try {
            setAppData(prev => ({ ...prev, servicesLoading: true, servicesLoaded: false }));
            const servicesData = await servicesApi.fetchServices();

            if (!servicesData || servicesData.length === 0) {
                console.warn("Pobrano pustą listę usług, zachowuję poprzedni stan");
                setAppData(prev => ({ ...prev, servicesLoading: false, servicesLoaded: true }));
                return;
            }

            const serviceOptions: ServiceOption[] = servicesData.map(service => ({
                id: service.id,
                name: service.name
            }));

            setAvailableServices(servicesData);
            setAppData(prev => ({
                ...prev,
                services: serviceOptions,
                servicesLoading: false,
                servicesLoaded: true
            }));
        } catch (err) {
            console.error('Error refreshing services list:', err);
            setAppData(prev => ({ ...prev, servicesLoading: false }));
        }
    }, []);

    const [showFilters, setShowFilters] = useState(false);

    const handleToggleFilters = useCallback(() => {
        setShowFilters(prev => !prev);
    }, []);

    useEffect(() => {
        if (isFirstLoad.current) {
            loadServices();
            loadCounters();
            isFirstLoad.current = false;
        }
    }, [loadServices, loadCounters]);

    useEffect(() => {
        const shouldPerformInitialSearch =
            appData.servicesLoaded &&
            appData.countersLoaded &&
            !appData.servicesLoading &&
            !appData.countersLoading &&
            visits.length === 0 &&
            reservations.length === 0;

        if (shouldPerformInitialSearch) {
            performSearch();
        }
    }, [appData.servicesLoaded, appData.countersLoaded, appData.servicesLoading, appData.countersLoading, visits.length, reservations.length]);

    useEffect(() => {
        resetData();
        setActiveStatusFilter('reservations');
        clearAllFilters();
        isFirstLoad.current = true;
    }, [location.pathname, resetData, clearAllFilters]);

    if (activeForm === 'visit') {
        return (
            <PageContainer>
                <PageHeader
                    icon={BiPen}
                    title={editingVisit ? 'Edycja wizyty' : 'Nowa wizyta'}
                    subtitle=""
                    actions={
                        <BackButton onClick={handleFormCancel}>
                            <FaArrowLeft />
                        </BackButton>
                    }
                />

                <EditVisitForm
                    protocol={editingVisit}
                    availableServices={availableServices}
                    initialData={undefined}
                    appointmentId={undefined}
                    isFullProtocol={true}
                    onSave={handleSaveProtocol}
                    onCancel={handleFormCancel}
                    onServiceAdded={refreshServices}
                />

                {isShowingConfirmationModal && currentProtocol && (
                    <ProtocolConfirmationModal
                        isOpen={isShowingConfirmationModal}
                        onClose={handleConfirmationClose}
                        protocolId={currentProtocol.id}
                        clientEmail={currentProtocol.email || ''}
                        onConfirm={handleConfirmationConfirm}
                    />
                )}
            </PageContainer>
        );
    }

    if (activeForm === 'reservation') {
        return (
            <PageContainer>
                <PageHeader
                    icon={FaCalendarPlus}
                    title="Nowa rezerwacja"
                    subtitle="Utwórz szybką rezerwację bez pełnych danych klienta"
                    actions={
                        <BackButton onClick={handleFormCancel}>
                            <FaArrowLeft />
                        </BackButton>
                    }
                />

                <FormWrapper>
                    <ReservationForm
                        onSuccess={handleReservationSuccess}
                        onCancel={handleFormCancel}
                    />
                </FormWrapper>
            </PageContainer>
        );
    }

    const headerActions = (
        <ButtonGroup>
            <SecondaryButton onClick={handleAddReservation}>
                <FaCalendarPlus /> Nowa rezerwacja
            </SecondaryButton>
            <PrimaryButton onClick={handleAddVisit}>
                <FaPlus /> Nowa wizyta
            </PrimaryButton>
        </ButtonGroup>
    );

    const filtersComponent = (
        <FiltersContainer>
            <VisitsFilterBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                onClearAll={handleClearAllFilters}
                loading={activeStatusFilter === 'reservations' ? reservationsLoading : visitsLoading}
                availableServices={appData.services}
                servicesLoading={appData.servicesLoading}
            />
        </FiltersContainer>
    );

    const currentPagination = activeStatusFilter === 'reservations'
        ? reservationsPagination
        : pagination;

    const isLoading = activeStatusFilter === 'reservations' ? reservationsLoading : visitsLoading;

    const handleStartVisit = useCallback((reservation: Reservation) => {
        console.log('🚀 Starting visit from reservation:', reservation);
        const protocolData = mapReservationToProtocol(reservation);
        console.log('📋 Mapped protocol data:', protocolData);

        setEditingVisit(protocolData as any);
        setActiveForm('visit');
    }, []);

    return (
        <PageContainer>
            <PageHeader
                icon={FaClipboardCheck}
                title="Wizyty"
                subtitle="Zarządzanie wizytami klientów"
                actions={headerActions}
            />

            <ContentContainer>
                <VisitsStatusFilters
                    activeStatus={activeStatusFilter}
                    onStatusChange={handleStatusFilterChange}
                    counters={appData.counters}
                    loading={appData.countersLoading}
                />

                <ResultsSection>
                    {error && (
                        <ErrorMessage>
                            ⚠️ {error}
                        </ErrorMessage>
                    )}

                    {activeStatusFilter === 'reservations' ? (
                        <ReservationsTable
                            reservations={reservations}
                            loading={reservationsLoading}
                            showFilters={showFilters}
                            hasActiveFilters={hasActiveFilters}
                            onReservationClick={(reservation) => navigate(`/reservations/${reservation.id}`)}
                            onViewReservation={(reservation) => navigate(`/reservations/${reservation.id}`)}
                            onEditReservation={(id) => navigate(`/reservations/${id}/edit`)}
                            onCancelReservation={(id) => console.log('Cancel reservation:', id)}
                            onDeleteReservation={handleDeleteVisit}
                            onToggleFilters={handleToggleFilters}
                            filtersComponent={filtersComponent}
                            onStartVisit={handleStartVisit}
                        />
                    ) : (
                        <VisitsTable
                            visits={visits}
                            loading={visitsLoading}
                            showFilters={showFilters}
                            hasActiveFilters={hasActiveFilters}
                            onVisitClick={handleVisitClick}
                            onViewVisit={handleViewVisit}
                            onEditVisit={handleEditVisit}
                            onDeleteVisit={handleDeleteVisit}
                            onToggleFilters={handleToggleFilters}
                            filtersComponent={filtersComponent}
                        />
                    )}

                    {currentPagination && currentPagination.totalPages > 1 && currentPagination.page !== undefined && (
                        <PaginationWrapper>
                            <Pagination
                                currentPage={currentPagination.page + 1}
                                totalPages={currentPagination.totalPages}
                                onPageChange={handlePageChange}
                                totalItems={currentPagination.totalItems}
                                pageSize={currentPagination.size}
                                showTotalItems={true}
                            />
                        </PaginationWrapper>
                    )}
                </ResultsSection>
            </ContentContainer>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    background: ${theme.surfaceHover};
    min-height: 100vh;
    padding: 0;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.primary};
        border-color: ${theme.primary};
        transform: translateX(-2px);
    }

    svg {
        font-size: 16px;
    }
`;

const ContentContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.xxl} ${theme.spacing.xxl};
    position: relative;

    @media (max-width: 1024px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xxl};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg};
    }
`;

const FiltersContainer = styled.div`
    background: ${theme.surfaceAlt};
    padding: 0;
`;

const ResultsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    margin-top: ${theme.spacing.xxl};
`;

const ErrorMessage = styled.div`
    background: ${theme.errorBg};
    color: ${theme.error};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    font-weight: 500;
    box-shadow: ${theme.shadow.sm};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const PaginationWrapper = styled.div`
    padding: ${theme.spacing.xl} 0;
    display: flex;
    justify-content: center;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;

        button {
            width: 100%;
        }
    }
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    color: ${theme.primary};
    border: 2px solid ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        background: ${theme.primaryLight};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }

    svg {
        font-size: 16px;
    }

    @media (max-width: 768px) {
        font-size: 13px;
        padding: ${theme.spacing.sm} ${theme.spacing.md};
    }
`;

const FormWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: ${theme.spacing.xxl};

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg};
    }
`;