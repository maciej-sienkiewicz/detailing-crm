// src/pages/ActivityFeed/ActivityFeedPage.tsx
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';
import {FaChevronDown, FaExclamationTriangle, FaFilter, FaRss, FaSync} from 'react-icons/fa';
import {ActivityFilter, ActivityItem} from '../../types/activity';
import {format, subDays} from 'date-fns';
import {pl} from 'date-fns/locale';
import {activityApi} from '../../api/activity';
import ActivityFiltersPanel from "./components/ActivityFiltersPanelProps";
import ActivityTimelineList from "./components/ActivitiTimelineList";
import {PageHeader, PrimaryButton, SecondaryButton} from '../../components/common/PageHeader';
import {theme} from '../../styles/theme';

const ActivityFeedPage: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<ActivityFilter[]>([
        { type: 'category', value: 'all' },
        { type: 'user', value: 'all' }
    ]);

    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });

    const [hasMoreData, setHasMoreData] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 50;

    const apiParams = useMemo(() => {
        const params: any = {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };

        const categoryFilter = activeFilters.find(f => f.type === 'category');
        if (categoryFilter && categoryFilter.value !== 'all') {
            params.category = categoryFilter.value;
        }

        const userFilter = activeFilters.find(f => f.type === 'user');
        if (userFilter && userFilter.value !== 'all') {
            params.userId = userFilter.value;
        }

        return params;
    }, [dateRange, activeFilters]);

    const loadActivities = useCallback(async (
        showRefreshLoader = false,
        resetData = true
    ) => {
        try {
            console.log('🔄 Ładowanie aktywności...', { apiParams, resetData });

            if (showRefreshLoader) {
                setRefreshing(true);
            } else if (resetData) {
                setLoading(true);
            }

            setError(null);

            if (resetData) {
                setCurrentPage(0);
                setHasMoreData(true);
            }

            const result = await activityApi.getActivities({
                ...apiParams,
                page: resetData ? 0 : currentPage,
                size: pageSize
            });

            if (result.success && result.data) {
                console.log('✅ Dane załadowane:', {
                    count: result.data.data.length,
                    totalItems: result.data.pagination.totalItems,
                    currentPage: result.data.pagination.currentPage
                });

                if (resetData) {
                    setActivities(result.data.data);
                } else {
                    setActivities(prev => [...prev, ...result.data!.data]);
                }

                setHasMoreData(result.data.pagination.hasNext);
                setCurrentPage(result.data.pagination.currentPage + 1);
                setLastRefresh(new Date());
            } else {
                console.error('❌ Błąd API:', result.error);
                setError(result.error || 'Wystąpił nieoczekiwany błąd');

                if (resetData) {
                    setActivities([]);
                }
            }
        } catch (err) {
            console.error('❌ Błąd krytyczny:', err);
            setError('Nie udało się połączyć z serwerem. Sprawdź połączenie internetowe.');

            if (resetData) {
                setActivities([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiParams, currentPage, pageSize]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const endDate = new Date(dateRange.endDate);

            if (endDate.toDateString() === now.toDateString()) {
                console.log('🔄 Auto-refresh aktywności...');
                loadActivities(false, true);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [loadActivities, dateRange.endDate]);

    useEffect(() => {
        console.log('📅 Zmiana parametrów wyszukiwania');
        loadActivities(false, true);
    }, [apiParams]);

    const handleRefresh = useCallback(() => {
        console.log('🔄 Manualne odświeżanie...');
        loadActivities(true, true);
    }, [loadActivities]);

    const handleFilterChange = useCallback((filters: ActivityFilter[]) => {
        console.log('🔍 Zmiana filtrów:', filters);
        setActiveFilters(filters);
    }, []);

    const handleDateRangeChange = useCallback((newDateRange: { startDate: string; endDate: string }) => {
        console.log('📅 Zmiana zakresu dat:', newDateRange);
        setDateRange(newDateRange);
    }, []);

    const loadMoreActivities = useCallback(() => {
        if (!loading && !refreshing && hasMoreData) {
            console.log('📄 Ładowanie kolejnej strony...');
            loadActivities(false, false);
        }
    }, [loading, refreshing, hasMoreData, loadActivities]);

    const filteredActivities = useMemo(() => {
        return activities;
    }, [activities]);

    const getDateRangeTitle = useCallback(() => {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);

        if (dateRange.startDate === dateRange.endDate) {
            return format(start, 'd MMMM yyyy', { locale: pl });
        }

        return `${format(start, 'd MMM', { locale: pl })} - ${format(end, 'd MMM yyyy', { locale: pl })}`;
    }, [dateRange]);

    const isDataFresh = useMemo(() => {
        if (!lastRefresh) return false;
        const now = new Date();
        const diffMinutes = (now.getTime() - lastRefresh.getTime()) / (1000 * 60);
        return diffMinutes < 2;
    }, [lastRefresh]);

    const headerSubtitle = `${getDateRangeTitle()} • ${filteredActivities.length} ${filteredActivities.length === 1 ? 'aktywność' : 'aktywności'}${lastRefresh ? ` • Aktualizacja: ${format(lastRefresh, 'HH:mm:ss')}` : ''}`;

    const headerActions = (
        <>
            <SecondaryButton onClick={handleRefresh} disabled={refreshing}>
                <FaSync className={refreshing ? 'spinning' : ''} />
                {refreshing ? 'Odświeżanie...' : 'Odśwież'}
            </SecondaryButton>

            <PrimaryButton onClick={() => setShowFilters(!showFilters)}>
                <FaFilter />
                Filtry
                <FaChevronDown className={showFilters ? 'rotated' : ''} />
            </PrimaryButton>
        </>
    );

    return (
        <PageContainer>
            <PageHeader
                icon={FaRss}
                title="Aktywności firmy"
                subtitle={headerSubtitle}
                actions={headerActions}
            />

            <ContentContainer>
                <MainLayout>
                    {showFilters && (
                        <FiltersPanel>
                            <ActivityFiltersPanel
                                activeFilters={activeFilters}
                                dateRange={dateRange}
                                onFilterChange={handleFilterChange}
                                onDateRangeChange={handleDateRangeChange}
                            />
                        </FiltersPanel>
                    )}

                    <ActivityContent $hasFilters={showFilters}>
                        {error && (
                            <ErrorAlert>
                                <ErrorIcon>
                                    <FaExclamationTriangle />
                                </ErrorIcon>
                                <ErrorContent>
                                    <ErrorMessage>{error}</ErrorMessage>
                                    <RetryButton onClick={handleRefresh}>
                                        Spróbuj ponownie
                                    </RetryButton>
                                </ErrorContent>
                            </ErrorAlert>
                        )}

                        <ActivityTimelineList
                            activities={filteredActivities}
                            loading={loading}
                        />

                        {!loading && !error && filteredActivities.length === 0 && (
                            <EmptyState>
                                <EmptyIcon>📋</EmptyIcon>
                                <EmptyTitle>Brak aktywności</EmptyTitle>
                                <EmptyDescription>
                                    W wybranym okresie nie zarejestrowano żadnych aktywności.
                                    Spróbuj zmienić zakres dat lub filtry.
                                </EmptyDescription>
                            </EmptyState>
                        )}
                    </ActivityContent>
                </MainLayout>
            </ContentContainer>

            <style>{`
                .spinning {
                    animation: spin 1s linear infinite;
                }

                .rotated {
                    transform: rotate(180deg);
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    background: ${theme.surfaceHover};
    min-height: 100vh;
    padding: 0;
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

const MainLayout = styled.div`
    display: flex;
    gap: ${theme.spacing.lg};
    align-items: flex-start;

    @media (max-width: 992px) {
        flex-direction: column;
        gap: ${theme.spacing.md};
    }
`;

const FiltersPanel = styled.aside`
    width: 320px;
    flex-shrink: 0;

    @media (max-width: 992px) {
        width: 100%;
    }
`;

const ActivityContent = styled.main<{ $hasFilters: boolean }>`
    flex: 1;
    min-width: 0;
    width: ${props => props.$hasFilters ? 'calc(100% - 340px)' : '100%'};

    @media (max-width: 992px) {
        width: 100%;
    }
`;

const ErrorAlert = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    background: ${theme.errorBg};
    color: ${theme.error};
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    margin-bottom: ${theme.spacing.lg};
    box-shadow: ${theme.shadow.sm};
`;

const ErrorIcon = styled.div`
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const ErrorContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const ErrorMessage = styled.div`
    font-weight: 500;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    align-self: flex-start;
    padding: ${theme.spacing.xs} ${theme.spacing.md};
    background: ${theme.error};
    color: white;
    border: none;
    border-radius: ${theme.radius.md};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primaryDark};
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl} ${theme.spacing.lg};
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    border: 2px dashed ${theme.border};
    text-align: center;
    min-height: 300px;
`;

const EmptyIcon = styled.div`
    font-size: 48px;
    margin-bottom: ${theme.spacing.lg};
    opacity: 0.5;
`;

const EmptyTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
    font-size: 14px;
    color: ${theme.text.muted};
    margin: 0;
    line-height: 1.5;
    max-width: 400px;
`;

export default ActivityFeedPage;