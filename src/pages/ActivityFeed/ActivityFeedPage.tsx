// src/pages/ActivityFeed/ActivityFeedPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FaRss, FaFilter, FaSync, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { ActivityItem, ActivityFilter } from '../../types/activity';
import { format, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { activityApi } from '../../api/activity';
import ActivityFiltersPanel from "./components/ActivityFiltersPanelProps";
import ActivityTimelineList from "./components/ActivitiTimelineList";

// Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    neutral: '#64748b',
    border: '#e2e8f0',
    text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#64748b'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
};

const ActivityFeedPage: React.FC = () => {
    // Stan aplikacji
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    // Kontrola UI
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<ActivityFilter[]>([
        { type: 'category', value: 'all' },
        { type: 'user', value: 'all' }
    ]);

    // Zakres dat - domyślnie ostatnie 7 dni
    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });

    // Paginacja i cache
    const [hasMoreData, setHasMoreData] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 50;

    // Memoizowane parametry API
    const apiParams = useMemo(() => {
        const params: any = {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };

        // Dodaj filtry kategorii
        const categoryFilter = activeFilters.find(f => f.type === 'category');
        if (categoryFilter && categoryFilter.value !== 'all') {
            params.category = categoryFilter.value;
        }

        // Dodaj filtry użytkownika
        const userFilter = activeFilters.find(f => f.type === 'user');
        if (userFilter && userFilter.value !== 'all') {
            params.userId = userFilter.value;
        }

        return params;
    }, [dateRange, activeFilters]);

    // Główna funkcja ładowania danych
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

            // Reset paginacji przy nowym ładowaniu
            if (resetData) {
                setCurrentPage(0);
                setHasMoreData(true);
            }

            // Wywołanie API z paginacją
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
                    // Append przy ładowaniu kolejnych stron
                    setActivities(prev => [...prev, ...result.data!.data]);
                }

                // Sprawdź czy są jeszcze dane do załadowania
                setHasMoreData(result.data.pagination.hasNext);
                setCurrentPage(result.data.pagination.currentPage + 1);
                setLastRefresh(new Date());
            } else {
                console.error('❌ Błąd API:', result.error);
                setError(result.error || 'Wystąpił nieoczekiwany błąd');

                // Jeśli to nie refresh, wyczyść dane
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

    // Auto-refresh co 30 sekund dla najnowszych danych
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const endDate = new Date(dateRange.endDate);

            // Auto-refresh tylko jeśli pokazujemy dzisiejsze dane
            if (endDate.toDateString() === now.toDateString()) {
                console.log('🔄 Auto-refresh aktywności...');
                loadActivities(false, true);
            }
        }, 30000); // 30 sekund

        return () => clearInterval(interval);
    }, [loadActivities, dateRange.endDate]);

    // Ładowanie przy zmianie parametrów
    useEffect(() => {
        console.log('📅 Zmiana parametrów wyszukiwania');
        loadActivities(false, true);
    }, [apiParams]);

    // Obsługa odświeżania przez użytkownika
    const handleRefresh = useCallback(() => {
        console.log('🔄 Manualne odświeżanie...');
        loadActivities(true, true);
    }, [loadActivities]);

    // Obsługa zmiany filtrów
    const handleFilterChange = useCallback((filters: ActivityFilter[]) => {
        console.log('🔍 Zmiana filtrów:', filters);
        setActiveFilters(filters);
    }, []);

    // Obsługa zmiany zakresu dat
    const handleDateRangeChange = useCallback((newDateRange: { startDate: string; endDate: string }) => {
        console.log('📅 Zmiana zakresu dat:', newDateRange);
        setDateRange(newDateRange);
    }, []);

    // Ładowanie kolejnych stron (infinite scroll)
    const loadMoreActivities = useCallback(() => {
        if (!loading && !refreshing && hasMoreData) {
            console.log('📄 Ładowanie kolejnej strony...');
            loadActivities(false, false);
        }
    }, [loading, refreshing, hasMoreData, loadActivities]);

    // Filtrowanie aktywności (tylko lokalne dla UI)
    const filteredActivities = useMemo(() => {
        // API już zwraca przefiltrowane dane, ale można dodać dodatkowe filtrowanie UI
        return activities;
    }, [activities]);

    // Formatowanie tytułu z zakresem dat
    const getDateRangeTitle = useCallback(() => {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);

        if (dateRange.startDate === dateRange.endDate) {
            return format(start, 'd MMMM yyyy', { locale: pl });
        }

        return `${format(start, 'd MMM', { locale: pl })} - ${format(end, 'd MMM yyyy', { locale: pl })}`;
    }, [dateRange]);

    // Sprawdzenie czy dane są aktualne
    const isDataFresh = useMemo(() => {
        if (!lastRefresh) return false;
        const now = new Date();
        const diffMinutes = (now.getTime() - lastRefresh.getTime()) / (1000 * 60);
        return diffMinutes < 2; // Dane świeże przez 2 minuty
    }, [lastRefresh]);

    return (
        <PageContainer>
            {/* Header */}
            <HeaderSection>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaRss />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Aktywności firmy</HeaderTitle>
                            <HeaderSubtitle>
                                {getDateRangeTitle()} • {filteredActivities.length} {filteredActivities.length === 1 ? 'aktywność' : 'aktywności'}
                                {lastRefresh && (
                                    <LastRefreshInfo $fresh={isDataFresh}>
                                        • Aktualizacja: {format(lastRefresh, 'HH:mm:ss')}
                                    </LastRefreshInfo>
                                )}
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        <RefreshButton
                            onClick={handleRefresh}
                            disabled={refreshing}
                            $fresh={isDataFresh}
                        >
                            <FaSync className={refreshing ? 'spinning' : ''} />
                            {refreshing ? 'Odświeżanie...' : 'Odśwież'}
                        </RefreshButton>

                        <FiltersToggle
                            onClick={() => setShowFilters(!showFilters)}
                            $active={showFilters}
                        >
                            <FaFilter />
                            Filtry
                            <FaChevronDown className={showFilters ? 'rotated' : ''} />
                        </FiltersToggle>
                    </HeaderActions>
                </HeaderContent>
            </HeaderSection>

            {/* Main Content */}
            <ContentContainer>
                <MainLayout>
                    {/* Panel filtrów */}
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

                    {/* Lista aktywności */}
                    <ActivityContent $hasFilters={showFilters}>
                        {/* Alert błędu */}
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

                        {/* Lista aktywności z infinite scroll */}
                        <ActivityTimelineList
                            activities={filteredActivities}
                            loading={loading}
                        />

                        {/* Informacja o braku danych */}
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
        </PageContainer>
    );
};

// Styled Components (rozszerzone o nowe style)
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
`;

const HeaderSection = styled.div`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};
`;

const HeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: ${brandTheme.shadow.sm};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 28px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 4px 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${brandTheme.text.secondary};
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    flex-wrap: wrap;
`;

const LastRefreshInfo = styled.span<{ $fresh: boolean }>`
    color: ${props => props.$fresh ? '#22c55e' : brandTheme.text.muted};
    font-size: 12px;
    font-weight: 400;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const RefreshButton = styled.button<{ $fresh?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${props => props.$fresh ? '#f0fdf4' : brandTheme.surface};
    color: ${props => props.$fresh ? '#22c55e' : brandTheme.text.secondary};
    border: 1px solid ${props => props.$fresh ? '#22c55e' : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;

    &:hover:not(:disabled) {
        background: ${props => props.$fresh ? '#dcfce7' : brandTheme.surfaceAlt};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.neutral};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const FiltersToggle = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    border: 1px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;

    &:hover {
        background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surfaceAlt};
        color: ${brandTheme.primary};
        border-color: ${brandTheme.primary};
    }

    .rotated {
        transform: rotate(180deg);
    }

    svg:last-child {
        transition: transform 0.2s ease;
    }
`;

const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    padding: 0 ${brandTheme.spacing.xl};

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md};
    }
`;

const MainLayout = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg} 0;
    align-items: flex-start;

    @media (max-width: 992px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.md};
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
    gap: ${brandTheme.spacing.md};
    background: #fef2f2;
    color: #dc2626;
    padding: ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid #fecaca;
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.sm};
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
    gap: ${brandTheme.spacing.sm};
`;

const ErrorMessage = styled.div`
    font-weight: 500;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    align-self: flex-start;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.md};
    background: #dc2626;
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #b91c1c;
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xl} ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
    min-height: 300px;
`;

const EmptyIcon = styled.div`
    font-size: 48px;
    margin-bottom: ${brandTheme.spacing.lg};
    opacity: 0.5;
`;

const EmptyTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
    font-size: 14px;
    color: ${brandTheme.text.muted};
    margin: 0;
    line-height: 1.5;
    max-width: 400px;
`;

export default ActivityFeedPage;