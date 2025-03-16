import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ActivityHeader from './components/ActivityHeader';
import ActivityFilters from './components/ActivityFilters';
import ActivityList from './components/ActivityList';
import ActivityStatistics from './components/ActivityStatistics';
import ActivityDateRange from './components/ActivityDateRange';
import { fetchActivityItems, fetchDailySummary } from '../../api/mocks/activityMocks';
import { ActivityItem, ActivityFilter, DailySummaryData } from '../../types/activity';

const ActivityFeedPage: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
    const [dailySummary, setDailySummary] = useState<DailySummaryData | null>(null);
    const [loading, setLoading] = useState({
        activities: true,
        summary: true
    });
    const [error, setError] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<ActivityFilter[]>([
        { type: 'category', value: 'all' },
        { type: 'entity', value: 'all' },
        { type: 'user', value: 'all' }
    ]);
    const [dateRange, setDateRange] = useState<{
        startDate: string;
        endDate: string;
    }>({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ostatnie 7 dni
        endDate: new Date().toISOString().split('T')[0], // Dzisiaj
    });

    // Pobieranie danych aktywności
    useEffect(() => {
        const loadActivities = async () => {
            try {
                setLoading(prev => ({ ...prev, activities: true }));
                setError(null);

                // Pobierz aktywności
                const activitiesData = await fetchActivityItems(dateRange.startDate, dateRange.endDate);
                setActivities(activitiesData);

                // Początkowe filtrowanie
                setFilteredActivities(activitiesData);
            } catch (err) {
                setError('Nie udało się załadować danych aktywności.');
                console.error('Error loading activity data:', err);
            } finally {
                setLoading(prev => ({ ...prev, activities: false }));
            }
        };

        loadActivities();
    }, [dateRange]);

    // Pobieranie danych podsumowania dziennego
    useEffect(() => {
        const loadSummary = async () => {
            try {
                setLoading(prev => ({ ...prev, summary: true }));

                // Pobierz dzienne podsumowanie
                const summaryData = await fetchDailySummary();
                setDailySummary(summaryData);
            } catch (err) {
                console.error('Error loading summary data:', err);
                // Nie ustawiamy ogólnego błędu, aby nie przeszkadzać w wyświetlaniu aktywności
            } finally {
                setLoading(prev => ({ ...prev, summary: false }));
            }
        };

        loadSummary();
    }, [dateRange.endDate]); // Odświeżanie tylko przy zmianie daty końcowej

    // Filtrowanie aktywności
    useEffect(() => {
        if (activeFilters.length === 0) {
            setFilteredActivities(activities);
            return;
        }

        // Sprawdzenie czy wszystkie typy filtrów mają ustawioną wartość 'all'
        const allFilterTypes = ['category', 'entity', 'user'];
        const hasOnlyAllFilters = allFilterTypes.every(type =>
            activeFilters.some(filter => filter.type === type && filter.value === 'all')
        );

        if (hasOnlyAllFilters) {
            setFilteredActivities(activities);
            return;
        }

        const filtered = activities.filter(activity => {
            // Sprawdzenie dla kategorii
            const categoryFilter = activeFilters.find(filter => filter.type === 'category');
            if (categoryFilter && categoryFilter.value !== 'all' && activity.category !== categoryFilter.value) {
                return false;
            }

            // Sprawdzenie dla encji
            const entityFilter = activeFilters.find(filter => filter.type === 'entity');
            if (entityFilter && entityFilter.value !== 'all' && activity.entityType !== entityFilter.value) {
                return false;
            }

            // Sprawdzenie dla użytkownika
            const userFilter = activeFilters.find(filter => filter.type === 'user');
            if (userFilter && userFilter.value !== 'all' && activity.userId !== userFilter.value) {
                return false;
            }

            return true;
        });

        setFilteredActivities(filtered);
    }, [activities, activeFilters]);

    // Obsługa zmiany filtrów
    const handleFilterChange = (filters: ActivityFilter[]) => {
        setActiveFilters(filters);
    };

    // Obsługa zmiany zakresu dat
    const handleDateRangeChange = (startDate: string, endDate: string) => {
        setDateRange({ startDate, endDate });
    };

    return (
        <PageContainer>
            <ActivityHeader />

            <ActivityDateRange
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
            />

            <ActivityStatistics
                summaryData={dailySummary}
                loading={loading.summary}
            />

            <MainContent>
                <LeftColumn>
                    <ActivityFilters
                        onFilterChange={handleFilterChange}
                        activeFilters={activeFilters}
                    />
                </LeftColumn>

                <RightColumn>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <ActivityList
                        activities={filteredActivities}
                        loading={loading.activities}
                    />
                </RightColumn>
            </MainContent>
        </PageContainer>
    );
};

// Styled components
const PageContainer = styled.div`
    padding: 20px;
    max-width: 100%;
`;

const MainContent = styled.div`
    display: flex;
    gap: 20px;

    @media (max-width: 992px) {
        flex-direction: column;
    }
`;

const LeftColumn = styled.div`
    width: 300px;
    flex-shrink: 0;

    @media (max-width: 992px) {
        width: 100%;
    }
`;

const RightColumn = styled.div`
    flex: 1;
    min-width: 0;
`;

const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
`;

export default ActivityFeedPage;