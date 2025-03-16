import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ActivityHeader from './components/ActivityHeader';
import ActivityFilters from './components/ActivityFilters';
import ActivityList from './components/ActivityList';
import DailySummary from './components/DailySummary';
import { fetchActivityItems, fetchDailySummary } from '../../api/mocks/activityMocks';
import { ActivityItem, ActivityFilter, DailySummaryData } from '../../types/activity';

const ActivityFeedPage: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
    const [dailySummary, setDailySummary] = useState<DailySummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<ActivityFilter[]>([]);
    const [dateRange, setDateRange] = useState<{
        startDate: string;
        endDate: string;
    }>({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ostatnie 7 dni
        endDate: new Date().toISOString().split('T')[0], // Dzisiaj
    });

    // Pobieranie danych aktywności
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Pobierz aktywności
                const activitiesData = await fetchActivityItems(dateRange.startDate, dateRange.endDate);
                setActivities(activitiesData);
                setFilteredActivities(activitiesData);

                // Pobierz dzienne podsumowanie
                const summaryData = await fetchDailySummary();
                setDailySummary(summaryData);

                setError(null);
            } catch (err) {
                setError('Nie udało się załadować danych aktywności.');
                console.error('Error loading activity data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [dateRange]);

    // Filtrowanie aktywności
    useEffect(() => {
        if (activeFilters.length === 0) {
            setFilteredActivities(activities);
            return;
        }

        const filtered = activities.filter(activity =>
            activeFilters.some(filter => filter.type === 'all') || // "Wszystkie" filter
            activeFilters.some(filter => {
                if (filter.type === 'category') {
                    return activity.category === filter.value;
                }
                if (filter.type === 'entity') {
                    return activity.entityType === filter.value;
                }
                if (filter.type === 'user') {
                    return activity.userId === filter.value;
                }
                return false;
            })
        );

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

            <MainContent>
                <LeftColumn>
                    <ActivityFilters
                        onFilterChange={handleFilterChange}
                        onDateRangeChange={handleDateRangeChange}
                        activeFilters={activeFilters}
                        dateRange={dateRange}
                    />
                    <DailySummaryContainer>
                        <DailySummary summaryData={dailySummary} loading={loading} />
                    </DailySummaryContainer>
                </LeftColumn>

                <RightColumn>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <ActivityList
                        activities={filteredActivities}
                        loading={loading}
                    />
                </RightColumn>
            </MainContent>
        </PageContainer>
    );
};

const PageContainer = styled.div`
  padding: 20px;
  max-width: 100%;
`;

const MainContent = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  
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

const DailySummaryContainer = styled.div`
  margin-top: 20px;
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