import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaChartLine,
    FaChartBar,
    FaChartPie,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaArrowUp,
    FaArrowDown,
    FaEquals,
    FaTasks,
    FaClock,
    FaMoneyBillWave
} from 'react-icons/fa';
import CurrentTasksWidget from './components/CurrentTasksWidget';
import MonthlyComparisonChart from './components/MonthlyComparisonChart';
import RevenueComparisonWidget from './components/RevenueComparisonWidget';
import TasksStatusPieChart from './components/TasksStatusPieChart';
import MonthlyRevenueChart from './components/MonthlyRevenueChart';
import TopServicesChart from './components/TopServicesChart';
import OverdueTasksWidget from './components/OverdueTasksWidget';
import KPICard from './components/KPICard';
import { fetchTasksStats, fetchRevenueStats, fetchTopServices } from './api/reportsApi';

const ReportsPage: React.FC = () => {
    const [taskStats, setTaskStats] = useState<any>(null);
    const [revenueStats, setRevenueStats] = useState<any>(null);
    const [topServices, setTopServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

    useEffect(() => {
        const fetchReportsData = async () => {
            try {
                setLoading(true);

                // Fetch data from mock APIs (or real APIs in production)
                const [tasks, revenue, services] = await Promise.all([
                    fetchTasksStats(timeRange),
                    fetchRevenueStats(timeRange),
                    fetchTopServices(timeRange)
                ]);

                setTaskStats(tasks);
                setRevenueStats(revenue);
                setTopServices(services);
                setError(null);
            } catch (err) {
                console.error('Error fetching reports data:', err);
                setError('Nie udało się pobrać danych raportów. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        };

        fetchReportsData();
    }, [timeRange]);

    const handleTimeRangeChange = (newRange: 'month' | 'quarter' | 'year') => {
        setTimeRange(newRange);
    };

    return (
        <PageContainer>
            <PageHeader>
                <h1>Raporty i statystyki</h1>
                <TimeRangeSelector>
                    <TimeRangeButton
                        active={timeRange === 'month'}
                        onClick={() => handleTimeRangeChange('month')}
                    >
                        Miesiąc
                    </TimeRangeButton>
                    <TimeRangeButton
                        active={timeRange === 'quarter'}
                        onClick={() => handleTimeRangeChange('quarter')}
                    >
                        Kwartał
                    </TimeRangeButton>
                    <TimeRangeButton
                        active={timeRange === 'year'}
                        onClick={() => handleTimeRangeChange('year')}
                    >
                        Rok
                    </TimeRangeButton>
                </TimeRangeSelector>
            </PageHeader>

            {loading ? (
                <LoadingMessage>Ładowanie danych raportów...</LoadingMessage>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <>
                    <KPISection>
                        <KPICard
                            title="Zlecenia w realizacji"
                            value={taskStats?.currentTasks || 0}
                            icon={<FaTasks />}
                            color="#3498db"
                        />
                        <KPICard
                            title="Przeterminowane"
                            value={taskStats?.overdueTasks || 0}
                            icon={<FaExclamationTriangle />}
                            color="#e74c3c"
                        />
                        <KPICard
                            title="Zlecenia w tym miesiącu"
                            value={taskStats?.monthlyTasks || 0}
                            prevValue={taskStats?.prevMonthTasks || 0}
                            icon={<FaCalendarAlt />}
                            color="#2ecc71"
                        />
                        <KPICard
                            title="Przychód w tym miesiącu"
                            value={`${revenueStats?.monthlyRevenue?.toFixed(2) || 0} zł`}
                            prevValue={revenueStats?.prevMonthlyRevenue || 0}
                            icon={<FaMoneyBillWave />}
                            color="#f39c12"
                            isCurrency
                        />
                    </KPISection>

                    <ReportsGrid>
                        <ReportCard wide>
                            <ReportHeader>
                                <ReportTitle>
                                    <FaChartLine /> Przychód - porównanie miesięczne
                                </ReportTitle>
                            </ReportHeader>
                            <ReportContent>
                                <MonthlyRevenueChart data={revenueStats?.monthlyData || []} />
                            </ReportContent>
                        </ReportCard>

                        <ReportCard>
                            <ReportHeader>
                                <ReportTitle>
                                    <FaChartPie /> Status zleceń
                                </ReportTitle>
                            </ReportHeader>
                            <ReportContent>
                                <TasksStatusPieChart data={taskStats?.statusDistribution || []} />
                            </ReportContent>
                        </ReportCard>

                        <ReportCard>
                            <ReportHeader>
                                <ReportTitle>
                                    <FaChartBar /> Najpopularniejsze usługi
                                </ReportTitle>
                            </ReportHeader>
                            <ReportContent>
                                <TopServicesChart data={topServices} />
                            </ReportContent>
                        </ReportCard>

                        <ReportCard>
                            <ReportHeader>
                                <ReportTitle>
                                    <FaCalendarAlt /> Zlecenia - porównanie miesięczne
                                </ReportTitle>
                            </ReportHeader>
                            <ReportContent>
                                <MonthlyComparisonChart
                                    currentMonth={taskStats?.monthlyTasks || 0}
                                    previousMonth={taskStats?.prevMonthTasks || 0}
                                />
                            </ReportContent>
                        </ReportCard>

                        <ReportCard>
                            <ReportHeader>
                                <ReportTitle>
                                    <FaMoneyBillWave /> Przychód - porównanie z poprzednim miesiącem
                                </ReportTitle>
                            </ReportHeader>
                            <ReportContent>
                                <RevenueComparisonWidget
                                    currentRevenue={revenueStats?.monthlyRevenue || 0}
                                    previousRevenue={revenueStats?.prevMonthlyRevenue || 0}
                                />
                            </ReportContent>
                        </ReportCard>

                        <ReportCard>
                            <ReportHeader>
                                <ReportTitle>
                                    <FaTasks /> Bieżące zlecenia
                                </ReportTitle>
                            </ReportHeader>
                            <ReportContent>
                                <CurrentTasksWidget tasks={taskStats?.currentTasksList || []} />
                            </ReportContent>
                        </ReportCard>

                        <ReportCard>
                            <ReportHeader>
                                <ReportTitle>
                                    <FaClock /> Przeterminowane zlecenia
                                </ReportTitle>
                            </ReportHeader>
                            <ReportContent>
                                <OverdueTasksWidget tasks={taskStats?.overdueTasksList || []} />
                            </ReportContent>
                        </ReportCard>
                    </ReportsGrid>
                </>
            )}
        </PageContainer>
    );
};

// Styled components
const PageContainer = styled.div`
  padding: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: 24px;
    margin: 0;
    color: #2c3e50;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

const TimeRangeButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.active ? '#3498db' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#3498db' : '#ddd'};
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#e9e9e9'};
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const KPISection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ReportCard = styled.div<{ wide?: boolean }>`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  grid-column: ${props => props.wide ? '1 / -1' : 'auto'};
  
  @media (max-width: 1200px) {
    grid-column: 1;
  }
`;

const ReportHeader = styled.div`
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
`;

const ReportTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ReportContent = styled.div`
  padding: 20px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
  font-size: 16px;
  color: #7f8c8d;
`;

const ErrorMessage = styled.div`
  background-color: #fdecea;
  color: #e74c3c;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

export default ReportsPage;