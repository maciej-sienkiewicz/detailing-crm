import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaRss, FaFilter, FaCalendarAlt, FaSync, FaChevronDown } from 'react-icons/fa';
import { fetchActivityItems } from '../../api/mocks/activityMocks';
import { ActivityItem, ActivityFilter } from '../../types/activity';
import { format, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import ActivityFiltersPanel from "./components/ActivityFiltersPanelProps";
import ActivityTimelineList from "./components/ActivitiTimelineList";

// Brand Theme - zgodne z resztą aplikacji
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
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Filtry i kontrola
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

    // Pobieranie danych aktywności
    const loadActivities = async (showRefreshLoader = false) => {
        try {
            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const activitiesData = await fetchActivityItems(dateRange.startDate, dateRange.endDate);
            setActivities(activitiesData);
            setFilteredActivities(activitiesData);
        } catch (err) {
            setError('Nie udało się załadować aktywności. Sprawdź połączenie z internetem.');
            console.error('Error loading activities:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Efekt pobierania danych przy zmianie zakresu dat
    useEffect(() => {
        loadActivities();
    }, [dateRange]);

    // Filtrowanie aktywności
    useEffect(() => {
        const filtered = activities.filter(activity => {
            // Filtr kategorii
            const categoryFilter = activeFilters.find(f => f.type === 'category');
            if (categoryFilter && categoryFilter.value !== 'all' && activity.category !== categoryFilter.value) {
                return false;
            }

            // Filtr użytkownika
            const userFilter = activeFilters.find(f => f.type === 'user');
            if (userFilter && userFilter.value !== 'all' && activity.userId !== userFilter.value) {
                return false;
            }

            return true;
        });

        setFilteredActivities(filtered);
    }, [activities, activeFilters]);

    // Obsługa odświeżania
    const handleRefresh = () => {
        loadActivities(true);
    };

    // Obsługa zmiany filtrów
    const handleFilterChange = (filters: ActivityFilter[]) => {
        setActiveFilters(filters);
    };

    // Obsługa zmiany zakresu dat
    const handleDateRangeChange = (newDateRange: { startDate: string; endDate: string }) => {
        setDateRange(newDateRange);
    };

    // Formatowanie tytułu z zakresem dat
    const getDateRangeTitle = () => {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);

        if (dateRange.startDate === dateRange.endDate) {
            return format(start, 'd MMMM yyyy', { locale: pl });
        }

        return `${format(start, 'd MMM', { locale: pl })} - ${format(end, 'd MMM yyyy', { locale: pl })}`;
    };

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
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        <RefreshButton onClick={handleRefresh} disabled={refreshing}>
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
                    {/* Filtry - panel boczny */}
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
                        {error && (
                            <ErrorAlert>
                                <ErrorIcon>⚠️</ErrorIcon>
                                <ErrorMessage>{error}</ErrorMessage>
                            </ErrorAlert>
                        )}

                        <ActivityTimelineList
                            activities={filteredActivities}
                            loading={loading}
                        />
                    </ActivityContent>
                </MainLayout>
            </ContentContainer>
        </PageContainer>
    );
};

// Styled Components
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

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceAlt};
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
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: #fef2f2;
    color: #dc2626;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid #fecaca;
    margin-bottom: ${brandTheme.spacing.lg};
    font-weight: 500;
`;

const ErrorIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorMessage = styled.div`
    flex: 1;
`;

export default ActivityFeedPage;