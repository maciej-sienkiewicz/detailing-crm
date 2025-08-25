// src/pages/Protocols/VisitsPageContainer.tsx - FIXED VERSION
import React, {useCallback, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {FaArrowLeft, FaClipboardCheck, FaPlus} from 'react-icons/fa';
import {useLocation, useNavigate} from 'react-router-dom';
import {VisitListItem} from '../../api/visitsApiNew';
import {ProtocolStatus} from '../../types';
import {servicesApi} from '../../api/servicesApi';
import {protocolsApi} from '../../api/protocolsApi';
import {useVisitsData} from './hooks/useVisitsData';
import {useVisitsFilters} from './hooks/useVisitsFilters';
import {useVisitsSelection} from './hooks/useVisitsSelection';
import {VisitsFilterBar} from './components/VisitsFilterBar';
import {VisitsStatusFilters} from './components/VisitsStatusFilters';
import {VisitsActiveFilters} from './components/VisitsActiveFilters';
import {VisitsTable} from './components/VisitsTable';
import {ServiceOption} from './components/ServiceAutocomplete';
import Pagination from '../../components/common/Pagination';
import {theme} from '../../styles/theme';

// Import form components
import {EditProtocolForm} from './form/components/EditProtocolForm';
import ProtocolConfirmationModal from './shared/modals/ProtocolConfirmationModal';

type StatusFilterType = 'all' | ProtocolStatus;

interface AppData {
    services: ServiceOption[];
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
    const lastStatusFilter = useRef<StatusFilterType>(ProtocolStatus.IN_PROGRESS);

    // Form state
    const [showForm, setShowForm] = useState(false);
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

    const selection = useVisitsSelection();

    // POPRAWIONE: Stabilne funkcje ładowania z flagami kontrolnymi
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

    // FIXED: Funkcja wykonująca wyszukiwanie z aktualnym statusem
    const performSearch = useCallback(async () => {
        console.log('🔍 Performing search with status:', activeStatusFilter);

        const searchFilters = getApiFilters();

        // Dodaj status filtr jeśli nie jest 'all'
        if (activeStatusFilter !== 'all') {
            searchFilters.status = activeStatusFilter;
        }

        console.log('📋 Final search filters:', searchFilters);

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

    // FIXED: Obsługa zmiany statusu z automatycznym wyszukiwaniem
    const handleStatusFilterChange = useCallback(async (status: StatusFilterType) => {
        console.log('🎯 Status filter changed from', activeStatusFilter, 'to', status);

        if (status === activeStatusFilter) {
            console.log('📝 Status unchanged, skipping search');
            return;
        }

        setActiveStatusFilter(status);
        lastStatusFilter.current = status;
        selection.clearSelection();

        // Natychmiastowe wyszukiwanie z nowym statusem
        const searchFilters = getApiFilters();
        if (status !== 'all') {
            searchFilters.status = status;
        }

        console.log('🔎 Searching with new status filter:', searchFilters);

        await searchVisits(searchFilters, {
            page: 0,
            size: pagination.size || 10
        });
    }, [activeStatusFilter, getApiFilters, searchVisits, selection, pagination.size]);

    const handleClearAllFilters = useCallback(async () => {
        clearAllFilters();
        setActiveStatusFilter(ProtocolStatus.IN_PROGRESS);
        lastStatusFilter.current = ProtocolStatus.IN_PROGRESS;
        selection.clearSelection();

        // Wykonaj wyszukiwanie z resetowanymi filtrami
        await searchVisits({ status: ProtocolStatus.IN_PROGRESS }, {
            page: 0,
            size: pagination.size || 10
        });
    }, [clearAllFilters, selection, searchVisits, pagination.size]);

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
            await refreshVisits();
        }
    }, [refreshVisits]);

    const handleAddVisit = useCallback(() => {
        setEditingVisit(null);
        setShowForm(true);
    }, []);

    // Form handlers
    const handleFormCancel = useCallback(() => {
        setShowForm(false);
        setEditingVisit(null);
    }, []);

    const handleSaveProtocol = useCallback((protocol: any, showConfirmationModal: boolean) => {
        setCurrentProtocol(protocol);

        if (showConfirmationModal) {
            setIsShowingConfirmationModal(true);
        } else {
            setShowForm(false);
            setEditingVisit(null);
            refreshVisits();
            navigate(`/visits/${protocol.id}`);
        }
    }, [navigate, refreshVisits]);

    const handleConfirmationClose = useCallback(() => {
        setIsShowingConfirmationModal(false);
        if (currentProtocol) {
            setShowForm(false);
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

    // EFFECTS

    // 1. Initial data loading
    useEffect(() => {
        if (isFirstLoad.current) {
            console.log('🚀 Initial load - loading services and counters');
            loadServices();
            loadCounters();
            isFirstLoad.current = false;
        }
    }, [loadServices, loadCounters]);

    // 2. First search after data is loaded
    useEffect(() => {
        const canPerformSearch = appData.servicesLoaded && appData.countersLoaded &&
            !appData.servicesLoading && !appData.countersLoading && !isFirstLoad.current;

        if (canPerformSearch) {
            console.log('📊 Data loaded, performing initial search with status:', activeStatusFilter);
            performSearch();
        }
    }, [appData.servicesLoaded, appData.countersLoaded, appData.servicesLoading, appData.countersLoading, performSearch]);

    // 3. Reset on location change
    useEffect(() => {
        console.log('🔄 Location changed, resetting data');
        resetData();
        setActiveStatusFilter(ProtocolStatus.IN_PROGRESS);
        clearAllFilters();
        isFirstLoad.current = true;
    }, [location.pathname, resetData, clearAllFilters]);

    // Debug log for current state
    useEffect(() => {
        console.log('📈 Current state:', {
            visits: visits.length,
            loading: visitsLoading,
            error,
            activeStatusFilter,
            pagination
        });
    }, [visits.length, visitsLoading, error, activeStatusFilter, pagination]);

    // If form is shown, render the form view
    if (showForm) {
        return (
            <PageContainer>
                <HeaderContainer>
                    <PageHeader>
                        <HeaderLeft>
                            <BackButton onClick={handleFormCancel}>
                                <FaArrowLeft />
                            </BackButton>
                            <h1>{editingVisit ? 'Edycja wizyty' : 'Nowa wizyta'}</h1>
                        </HeaderLeft>
                    </PageHeader>
                </HeaderContainer>

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

    // Regular visits list view
    return (
        <PageContainer>
            <HeaderContainer>
                <PageHeader>
                    <HeaderTitle>
                        <TitleIcon>
                            <FaClipboardCheck />
                        </TitleIcon>
                        <TitleContent>
                            <MainTitle>Wizyty</MainTitle>
                            <Subtitle>Zarządzanie wizytami klientów</Subtitle>
                        </TitleContent>
                    </HeaderTitle>
                    <PrimaryAction onClick={handleAddVisit}>
                        <FaPlus /> Nowa wizyta
                    </PrimaryAction>
                </PageHeader>
            </HeaderContainer>

            <ContentContainer>
                <VisitsStatusFilters
                    activeStatus={activeStatusFilter}
                    onStatusChange={handleStatusFilterChange}
                    counters={appData.counters}
                    loading={appData.countersLoading}
                />

                <FiltersSection>
                    <VisitsFilterBar
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onApplyFilters={handleApplyFilters}
                        onClearAll={handleClearAllFilters}
                        loading={visitsLoading}
                        availableServices={appData.services}
                        servicesLoading={appData.servicesLoading}
                    />

                    {hasActiveFilters && (
                        <VisitsActiveFilters
                            filters={filters}
                            onRemoveFilter={clearFilter}
                            onClearAll={handleClearAllFilters}
                        />
                    )}
                </FiltersSection>

                <ResultsSection>
                    {error && (
                        <ErrorMessage>
                            ⚠️ {error}
                        </ErrorMessage>
                    )}

                    <VisitsTable
                        visits={visits}
                        loading={visitsLoading}
                        selection={selection}
                        onVisitClick={handleVisitClick}
                        onViewVisit={handleViewVisit}
                        onEditVisit={handleEditVisit}
                        onDeleteVisit={handleDeleteVisit}
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

// Styled components remain the same...
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

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};

    h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: ${theme.text.primary};
    }
`;

const PageContainer = styled.div`
    background: ${theme.surfaceHover};
    min-height: 100vh;
    padding: 0;
`;

const HeaderContainer = styled.header`
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.sm};
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const PageHeader = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.xxl} ${theme.spacing.xxxl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.spacing.xxl};

    @media (max-width: 1024px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xxl};
        flex-direction: column;
        align-items: stretch;
        gap: ${theme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg};
    }
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xxl};
`;

const TitleIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${theme.shadow.md};
    flex-shrink: 0;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const MainTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const Subtitle = styled.div`
    font-size: 16px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const PrimaryAction = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    color: white;
    border: none;
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    box-shadow: ${theme.shadow.sm};
    white-space: nowrap;
    min-height: 44px;

    &:hover {
        background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
        box-shadow: ${theme.shadow.md};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const ContentContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.xxl} ${theme.spacing.xxxl};
    position: relative;

    @media (max-width: 1024px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xxl};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg};
    }
`;

const FiltersSection = styled.div`
    margin-bottom: ${theme.spacing.xxl};
    position: relative;
    z-index: 10;
`;

const ResultsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
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