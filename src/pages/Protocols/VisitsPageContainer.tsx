// src/pages/Protocols/VisitsPageContainer.tsx - FIXED VERSION
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FaClipboardCheck, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { VisitListItem } from '../../api/visitsApiNew';
import { ProtocolStatus } from '../../types';
import { servicesApi } from '../../api/servicesApi';
import { protocolsApi } from '../../api/protocolsApi';
import { useVisitsData } from './hooks/useVisitsData';
import { useVisitsFilters, VisitFilterParams } from './hooks/useVisitsFilters';
import { useVisitsSelection } from './hooks/useVisitsSelection';
import { VisitsFilterBar } from './components/VisitsFilterBar';
import { VisitsStatusFilters } from './components/VisitsStatusFilters';
import { VisitsActiveFilters } from './components/VisitsActiveFilters';
import { VisitsTable } from './components/VisitsTable';
import { ServiceOption } from './components/ServiceAutocomplete';
import Pagination from '../../components/common/Pagination';
import { theme } from '../../styles/theme';

// Import form components
import { EditProtocolForm } from './form/components/EditProtocolForm';
import ProtocolConfirmationModal from './shared/modals/ProtocolConfirmationModal';

type StatusFilterType = 'all' | ProtocolStatus;

interface AppData {
    services: ServiceOption[];
    counters: Record<string, number>;
    loading: boolean;
}

export const VisitsPageContainer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingVisit, setEditingVisit] = useState<any>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
    const [currentProtocol, setCurrentProtocol] = useState<any>(null);

    const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilterType>(ProtocolStatus.IN_PROGRESS);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [appData, setAppData] = useState<AppData>({
        services: [],
        counters: {},
        loading: true
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

    const loadAppData = useCallback(async () => {
        if (!appData.loading && appData.services.length > 0) return;

        setAppData(prev => ({ ...prev, loading: true }));

        try {
            const [servicesData, countersData] = await Promise.all([
                servicesApi.fetchServices(),
                protocolsApi.getProtocolCounters()
            ]);

            const serviceOptions: ServiceOption[] = servicesData.map(service => ({
                id: service.id,
                name: service.name
            }));

            setAvailableServices(servicesData); // Store full services data

            setAppData({
                services: serviceOptions,
                counters: {
                    all: countersData.all || 0,
                    [ProtocolStatus.SCHEDULED]: countersData.scheduled || 0,
                    [ProtocolStatus.IN_PROGRESS]: countersData.inProgress || 0,
                    [ProtocolStatus.READY_FOR_PICKUP]: countersData.readyForPickup || 0,
                    [ProtocolStatus.COMPLETED]: countersData.completed || 0,
                    [ProtocolStatus.CANCELLED]: countersData.cancelled || 0
                },
                loading: false
            });
        } catch (error) {
            console.error('Error loading app data:', error);
            setAppData(prev => ({ ...prev, loading: false }));
        }
    }, [appData.loading, appData.services.length]);

    const performSearch = useCallback(async (customFilters?: VisitFilterParams) => {
        const apiFilters: VisitFilterParams = customFilters || getApiFilters();

        if (activeStatusFilter !== 'all') {
            apiFilters.status = activeStatusFilter;
        }

        await searchVisits(apiFilters, {
            page: 0,
            size: pagination.size
        });
    }, [getApiFilters, activeStatusFilter, searchVisits, pagination.size]);

    const handleFiltersChange = useCallback((newFilters: Partial<typeof filters>) => {
        updateFilters(newFilters);
    }, [updateFilters]);

    const handleApplyFilters = useCallback(async () => {
        await performSearch();
    }, [performSearch]);

    const handleStatusFilterChange = useCallback((status: StatusFilterType) => {
        setActiveStatusFilter(status);
        selection.clearSelection();
    }, [selection]);

    const handleClearAllFilters = useCallback(() => {
        clearAllFilters();
        setActiveStatusFilter(ProtocolStatus.IN_PROGRESS);
        selection.clearSelection();
    }, [clearAllFilters, selection]);

    const handlePageChange = useCallback(async (page: number) => {
        const apiFilters: VisitFilterParams = getApiFilters();

        if (activeStatusFilter !== 'all') {
            apiFilters.status = activeStatusFilter;
        }

        await searchVisits(apiFilters, {
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

    // FIXED: Proper handleAddVisit logic
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
            // Direct completion without modal
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
        // Handle print and email options if needed
        handleConfirmationClose();
    }, [handleConfirmationClose]);

    const refreshServices = useCallback(async () => {
        try {
            const servicesData = await servicesApi.fetchServices();
            setAvailableServices(prevServices => {
                if (!servicesData || servicesData.length === 0) {
                    console.warn("Pobrano pustą listę usług, zachowuję poprzedni stan");
                    return prevServices;
                }
                return servicesData;
            });
        } catch (err) {
            console.error('Error refreshing services list:', err);
        }
    }, []);

    useEffect(() => {
        loadAppData();
    }, [loadAppData]);

    useEffect(() => {
        if (!hasInitialLoad && !appData.loading) {
            performSearch();
            setHasInitialLoad(true);
        }
    }, [hasInitialLoad, appData.loading, performSearch]);

    useEffect(() => {
        if (hasInitialLoad && !appData.loading) {
            performSearch();
        }
    }, [activeStatusFilter]);

    useEffect(() => {
        resetData();
        setHasInitialLoad(false);
        setActiveStatusFilter(ProtocolStatus.IN_PROGRESS);
        clearAllFilters();
    }, [location.pathname, resetData, clearAllFilters]);

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

                {/* Confirmation Modal */}
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
                    loading={appData.loading}
                />

                <FiltersSection>
                    <VisitsFilterBar
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onApplyFilters={handleApplyFilters}
                        onClearAll={handleClearAllFilters}
                        loading={visitsLoading}
                        availableServices={appData.services}
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

// Additional styled components for form view
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

// Existing styled components...
const PageContainer = styled.div`
    background: ${theme.surfaceHover};
    min-height: 100vh;
    padding: 0;
`;

const HeaderContainer = styled.header`
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
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