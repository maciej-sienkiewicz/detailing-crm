import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { FaClipboardCheck, FaPlus } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { VisitListItem } from '../../api/visitsApiNew';
import { ProtocolStatus } from '../../types';
import { servicesApi } from '../../api/servicesApi';
import { useVisitsData } from './hooks/useVisitsData';
import { useVisitsFilters, VisitFilterParams } from './hooks/useVisitsFilters';
import { useVisitsSelection } from './hooks/useVisitsSelection';
import { VisitsFilterBar } from './components/VisitsFilterBar';
import { VisitsStatusFilters } from './components/VisitsStatusFilters';
import { VisitsActiveFilters } from './components/VisitsActiveFilters';
import { VisitsTable } from './components/VisitsTable';
import { ServiceOption } from './components/ServiceAutocomplete';
import Pagination from '../../components/common/Pagination';

const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',
    shadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
};

type StatusFilterType = 'all' | ProtocolStatus;

export const VisitsPageContainer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilterType>('all');
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [availableServices, setAvailableServices] = useState<ServiceOption[]>([]);

    const {
        visits,
        loading,
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

    const performSearch = useCallback(async () => {
        const apiFilters: VisitFilterParams = getApiFilters();

        if (activeStatusFilter !== 'all') {
            apiFilters.status = activeStatusFilter;
        }

        console.log('🎯 Final search filters:', apiFilters);
        console.log('📊 Active status filter:', activeStatusFilter);

        await searchVisits(apiFilters, {
            page: 0,
            size: pagination.size
        });
    }, [getApiFilters, activeStatusFilter, searchVisits, pagination.size]);

    const handleStatusFilterChange = useCallback((status: StatusFilterType) => {
        setActiveStatusFilter(status);
        selection.clearSelection();
    }, [selection]);

    const handleFiltersChange = useCallback((newFilters: Partial<typeof filters>) => {
        console.log('📝 Updating filters with:', newFilters);
        console.log('🗂️ Current filters before update:', filters);
        updateFilters(newFilters);
    }, [updateFilters, filters]);

    const handleClearAllFilters = useCallback(() => {
        clearAllFilters();
        setActiveStatusFilter('all');
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

    const handleAddVisit = useCallback(() => {
        navigate('/visits/new');
    }, [navigate]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesData = await servicesApi.fetchServices();
                const serviceOptions: ServiceOption[] = servicesData.map(service => ({
                    id: service.id,
                    name: service.name
                }));
                setAvailableServices(serviceOptions);
            } catch (error) {
                console.error('Error fetching services:', error);
                setAvailableServices([]);
            }
        };

        fetchServices();
    }, []);

    useEffect(() => {
        if (!hasInitialLoad) {
            performSearch();
            setHasInitialLoad(true);
        }
    }, [hasInitialLoad, performSearch]);

    useEffect(() => {
        if (hasInitialLoad) {
            performSearch();
        }
    }, [activeStatusFilter]);

    useEffect(() => {
        resetData();
        setHasInitialLoad(false);
        setActiveStatusFilter('all');
        clearAllFilters();
    }, [location.pathname, resetData, clearAllFilters]);

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
                />

                <FiltersSection>
                    <VisitsFilterBar
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onSearch={performSearch}
                        onClear={handleClearAllFilters}
                        loading={loading}
                        availableServices={availableServices}
                    />

                    <VisitsActiveFilters
                        filters={filters}
                        onRemoveFilter={clearFilter}
                        onClearAll={handleClearAllFilters}
                    />
                </FiltersSection>

                <ResultsSection>
                    {error && (
                        <ErrorMessage>
                            ⚠️ {error}
                        </ErrorMessage>
                    )}

                    <VisitsTable
                        visits={visits}
                        loading={loading}
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

const PageContainer = styled.div`
    background: ${brandTheme.accent};
    min-height: 100vh;
    padding: 0;
`;

const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const PageHeader = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: 24px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;

    @media (max-width: 1024px) {
        padding: 16px 24px;
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    @media (max-width: 768px) {
        padding: 16px;
    }
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
`;

const TitleIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const MainTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const Subtitle = styled.div`
    font-size: 16px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const PrimaryAction = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${brandTheme.shadow.sm};
    white-space: nowrap;
    min-height: 44px;

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
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
    padding: 24px 32px;
    position: relative;

    @media (max-width: 1024px) {
        padding: 16px 24px;
    }

    @media (max-width: 768px) {
        padding: 16px;
    }
`;

const FiltersSection = styled.div`
    margin-bottom: 24px;
    position: relative;
    z-index: 10;
`;

const ResultsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ErrorMessage = styled.div`
    background: linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%);
    color: #dc2626;
    padding: 16px 20px;
    border-radius: 12px;
    border: 1px solid #fecaca;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
`;

const PaginationWrapper = styled.div`
    padding: 20px 0;
    display: flex;
    justify-content: center;
`;