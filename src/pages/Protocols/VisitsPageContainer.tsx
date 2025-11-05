// src/pages/Protocols/VisitsPageContainer.tsx - Z PRZYCISKIEM REZERWACJI
import React, {useCallback, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {FaArrowLeft, FaCalendarPlus, FaClipboardCheck, FaPlus} from 'react-icons/fa';
import {useLocation, useNavigate} from 'react-router-dom';
import {VisitListItem, visitsApi} from '../../api/visitsApiNew';
import {ProtocolStatus} from '../../types';
import {servicesApi} from '../../api/servicesApi';
import {protocolsApi} from '../../api/protocolsApi';
import {useVisitsData} from './hooks/useVisitsData';
import {useVisitsFilters} from './hooks/useVisitsFilters';
import {VisitsFilterBar} from './components/VisitsFilterBar';
import {VisitsStatusFilters} from './components/VisitsStatusFilters';
import {VisitsTable} from './components/VisitsTable';
import {ServiceOption} from './components/ServiceAutocomplete';
import Pagination from '../../components/common/Pagination';
import {PageHeader, PrimaryButton} from '../../components/common/PageHeader';
import {theme} from '../../styles/theme';

import {EditProtocolForm} from './form/components/EditProtocolForm';
import ProtocolConfirmationModal from './shared/modals/ProtocolConfirmationModal';
import {BiPen} from "react-icons/bi";
import {ReservationForm} from "../../features/reservations";

type StatusFilterType = 'all' | ProtocolStatus;

interface AppData {
    services: ServiceOption[];
    counters: Record<string, number>;
    servicesLoading: boolean;
    countersLoading: boolean;
    servicesLoaded: boolean;
    countersLoaded: boolean;
}

// Typ formularza do wyświetlenia
type FormType = 'none' | 'visit' | 'reservation';

export const VisitsPageContainer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isFirstLoad = useRef(true);
    const lastStatusFilter = useRef<StatusFilterType>(ProtocolStatus.IN_PROGRESS);

    const [activeForm, setActiveForm] = useState<FormType>('none');
    const [editingVisit, setEditingVisit] = useState<any>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
    const [currentProtocol, setCurrentProtocol] = useState<any>(null);

    const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilterType>(ProtocolStatus.IN_PROGRESS);

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
            const countersData = await protocolsApi.getProtocolCounters();
            setAppData(prev => ({
                ...prev,
                counters: {
                    all: countersData.all || 0,
                    [ProtocolStatus.SCHEDULED]: countersData.scheduled || 0,
                    [ProtocolStatus.IN_PROGRESS]: countersData.inProgress || 0,
                    [ProtocolStatus.READY_FOR_PICKUP]: countersData.readyForPickup || 0,
                    [ProtocolStatus.COMPLETED]: countersData.completed || 0,
                    [ProtocolStatus.CANCELLED]: countersData.cancelled || 0
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

    const performSearch = useCallback(async () => {
        const searchFilters = getApiFilters();

        if (activeStatusFilter !== 'all') {
            searchFilters.status = activeStatusFilter;
        }

        await searchVisits(searchFilters, {
            page: 0,
            size: pagination.size || 10
        });
    }, [activeStatusFilter, getApiFilters, searchVisits, pagination.size]);

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

        const searchFilters = getApiFilters();
        if (status !== 'all') {
            searchFilters.status = status;
        }

        await searchVisits(searchFilters, {
            page: 0,
            size: pagination.size || 10
        });
    }, [activeStatusFilter, getApiFilters, searchVisits, pagination.size]);

    const handleClearAllFilters = useCallback(async () => {
        clearAllFilters();
        setActiveStatusFilter(ProtocolStatus.IN_PROGRESS);
        lastStatusFilter.current = ProtocolStatus.IN_PROGRESS;

        await searchVisits({ status: ProtocolStatus.IN_PROGRESS }, {
            page: 0,
            size: pagination.size || 10
        });
    }, [clearAllFilters, searchVisits, pagination.size]);

    const handlePageChange = useCallback(async (page: number) => {
        const searchFilters = getApiFilters();
        if (activeStatusFilter !== 'all') {
            searchFilters.status = activeStatusFilter;
        }

        await searchVisits(searchFilters, {
            page: page - 1,
            size: pagination.size
        });
    }, [getApiFilters, activeStatusFilter, searchVisits, pagination.size]);

    const handleVisitClick = useCallback((visit: VisitListItem) => {
        navigate(`/visits/${visit.id}`);
    }, [navigate]);

    const handleViewVisit = useCallback((visit: VisitListItem) => {
        navigate(`/visits/${visit.id}`);
    }, [navigate]);

    const handleEditVisit = useCallback((visitId: string) => {
        navigate(`/visits/${visitId}/edit`);
    }, [navigate]);

    const handleDeleteVisit = useCallback(async (visitId: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę wizytę?')) {
            await visitsApi.deleteVisit(visitId)
            await resetData()
        }
    }, [refreshVisits]);

    // ✅ NOWE: Handler dla przycisku "Nowa wizyta"
    const handleAddVisit = useCallback(() => {
        setEditingVisit(null);
        setActiveForm('visit');
    }, []);

    // ✅ NOWE: Handler dla przycisku "Nowa rezerwacja"
    const handleAddReservation = useCallback(() => {
        setActiveForm('reservation');
    }, []);

    // ✅ ZMODYFIKOWANE: Uniwersalny handler zamykania formularzy
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

    // ✅ NOWE: Handler sukcesu rezerwacji
    const handleReservationSuccess = useCallback((reservationId: string) => {
        console.log('✅ Reservation created:', reservationId);
        setActiveForm('none');
        refreshVisits();
        // Możesz nawigować do szczegółów rezerwacji jeśli masz taki widok
        // navigate(`/reservations/${reservationId}`);
    }, [refreshVisits]);

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
            visits.length === 0;

        if (shouldPerformInitialSearch) {
            performSearch();
        }
    }, [appData.servicesLoaded, appData.countersLoaded, appData.servicesLoading, appData.countersLoading, visits.length]);

    useEffect(() => {
        resetData();
        setActiveStatusFilter(ProtocolStatus.IN_PROGRESS);
        clearAllFilters();
        isFirstLoad.current = true;
    }, [location.pathname, resetData, clearAllFilters]);

    // ✅ NOWE: Renderowanie formularza wizyty
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

                <EditProtocolForm
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

    // ✅ NOWE: Renderowanie formularza rezerwacji
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

    // ✅ ZMODYFIKOWANE: Dodano oba przyciski w nagłówku
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
                loading={visitsLoading}
                availableServices={appData.services}
                servicesLoading={appData.servicesLoading}
            />
        </FiltersContainer>
    );

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

                    {pagination && pagination.totalPages > 1 && pagination.page !== undefined && (
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

// ========================================================================================
// STYLED COMPONENTS
// ========================================================================================

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

// ✅ NOWE: Style dla grupy przycisków
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

// ✅ NOWE: Styl dla przycisku wtórnego (rezerwacja)
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

// ✅ NOWE: Wrapper dla formularza rezerwacji
const FormWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: ${theme.spacing.xxl};

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg};
    }
`;