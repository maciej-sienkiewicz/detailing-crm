import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaChartLine,
    FaChartBar,
    FaChartPie,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaTasks,
    FaClock,
    FaMoneyBillWave,
    FaUserTie,
    FaStopwatch,
    FaSmile,
    FaUsers,
    FaCar
} from 'react-icons/fa';

// Importy komponentów
import CurrentTasksWidget from './components/CurrentTasksWidget';
import MonthlyComparisonChart from './components/MonthlyComparisonChart';
import RevenueComparisonWidget from './components/RevenueComparisonWidget';
import TasksStatusPieChart from './components/TasksStatusPieChart';
import MonthlyRevenueChart from './components/MonthlyRevenueChart';
import TopServicesChart from './components/TopServicesChart';
import OverdueTasksWidget from './components/OverdueTasksWidget';
import KPICard from './components/KPICard';
import EmployeeProductivityChart from './components/EmployeeProductivityChart';
import AverageTaskDurationChart from './components/AverageTaskDurationChart';
import SeasonalityChart from './components/SeasonalityChart';
import CustomerSatisfactionChart from './components/CustomerSatisfactionChart';
import CustomerLTVChart from './components/CustomerLTVChart';
import ReportFilters from './components/ReportFilters';

// Importy API
import {
    fetchTasksStats,
    fetchRevenueStats,
    fetchTopServices
} from './api/reportsApi';


import {
    fetchEmployeeProductivity,
    fetchSeasonalityData,
    fetchTaskDurationData,
    fetchCustomerSatisfactionData,
    fetchCustomerLTVData,
    fetchVehicleStatsData
} from './api/reportsApiExtensions';

import { mockEmployees } from '../../api/mocks/employeesMocks';
import { mockServices } from '../../api/mocks/servicesMocks';

const ReportsPage: React.FC = () => {
    // State dla danych raportów
    const [taskStats, setTaskStats] = useState<any>(null);
    const [revenueStats, setRevenueStats] = useState<any>(null);
    const [topServices, setTopServices] = useState<any[]>([]);
    const [employeeStats, setEmployeeStats] = useState<any[]>([]);
    const [seasonalityData, setSeasonalityData] = useState<any[]>([]);
    const [taskDurationData, setTaskDurationData] = useState<any[]>([]);
    const [customerSatisfactionData, setCustomerSatisfactionData] = useState<any>(null);
    const [customerLTVData, setCustomerLTVData] = useState<any>(null);
    const [vehicleStats, setVehicleStats] = useState<any>(null);

    // State dla filtrów
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
    const [reportType, setReportType] = useState<string>('overview');
    const [additionalFilters, setAdditionalFilters] = useState({
        employeeId: '',
        serviceType: '',
        clientType: ''
    });

    // State dla stanu ładowania i błędów
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Efekt ładujący dane przy zmianie filtrów
    useEffect(() => {
        const fetchReportsData = async () => {
            try {
                setLoading(true);

                const apiTimeRange: 'month' | 'quarter' | 'year' =
                    (timeRange === 'day' || timeRange === 'week') ? 'month' : timeRange;

                const [
                    tasks,
                    revenue,
                    services,
                    employees,
                    seasonality,
                    durations,
                    satisfaction,
                    ltv,
                    vehicles
                ] = await Promise.all([
                    fetchTasksStats(apiTimeRange),
                    fetchRevenueStats(apiTimeRange),
                    fetchTopServices(apiTimeRange),
                    fetchEmployeeProductivity(apiTimeRange),
                    fetchSeasonalityData(),
                    fetchTaskDurationData(),
                    fetchCustomerSatisfactionData(),
                    fetchCustomerLTVData(),
                    fetchVehicleStatsData()
                ]);

                // Aktualizacja stanu komponentu
                setTaskStats(tasks);
                setRevenueStats(revenue);
                setTopServices(services);
                setEmployeeStats(employees);
                setSeasonalityData(seasonality);
                setTaskDurationData(durations);
                setCustomerSatisfactionData(satisfaction);
                setCustomerLTVData(ltv);
                setVehicleStats(vehicles);

                setError(null);
            } catch (err) {
                console.error('Error fetching reports data:', err);
                setError('Nie udało się pobrać danych raportów. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        };

        fetchReportsData();
    }, [timeRange, additionalFilters]);

    // Obsługa zmiany filtrów
    const handleTimeRangeChange = (newRange: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
        setTimeRange(newRange);
    };

    const handleReportTypeChange = (type: string) => {
        setReportType(type);
    };

    const handleFilterChange = (name: string, value: string) => {
        setAdditionalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Przygotowanie danych dla filtrów
    const employeeOptions = mockEmployees.map(emp => ({
        id: emp.id,
        name: emp.fullName
    }));

    const serviceOptions = mockServices.map(service => ({
        id: service.id,
        name: service.name
    }));

    return (
        <PageContainer>
            <PageHeader>
                <h1>Raporty i statystyki</h1>
            </PageHeader>

            <ReportFilters
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
                reportType={reportType}
                onReportTypeChange={handleReportTypeChange}
                additionalFilters={additionalFilters}
                onFilterChange={handleFilterChange}
                employees={employeeOptions}
                serviceTypes={serviceOptions}
            />

            {loading ? (
                <LoadingMessage>Ładowanie danych raportów...</LoadingMessage>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <>
                    {reportType === 'overview' && (
                        <>
                            <SectionTitle>Kluczowe wskaźniki efektywności</SectionTitle>
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
                                            <FaMoneyBillWave /> Przychód - porównanie
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

                                <ReportCard wide>
                                    <ReportHeader>
                                        <ReportTitle>
                                            <FaChartLine /> Sezonowość biznesu
                                        </ReportTitle>
                                    </ReportHeader>
                                    <ReportContent>
                                        <SeasonalityChart data={seasonalityData || []} />
                                    </ReportContent>
                                </ReportCard>
                            </ReportsGrid>
                        </>
                    )}

                    {reportType === 'tasks' && (
                        <>
                            <SectionTitle>Analiza zleceń</SectionTitle>
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
                                    title="Średni czas realizacji"
                                    value={`${taskDurationData.reduce((acc, item) => acc + item.duration, 0) / taskDurationData.length || 0} godz.`}
                                    icon={<FaStopwatch />}
                                    color="#9b59b6"
                                />
                            </KPISection>

                            <ReportsGrid>
                                <ReportCard wide>
                                    <ReportHeader>
                                        <ReportTitle>
                                            <FaStopwatch /> Średni czas realizacji usług
                                        </ReportTitle>
                                    </ReportHeader>
                                    <ReportContent>
                                        <AverageTaskDurationChart data={taskDurationData || []} />
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
                                            <FaChartBar /> Zlecenia - porównanie miesięczne
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

                    {reportType === 'revenue' && (
                        <>
                            <SectionTitle>Analiza przychodów</SectionTitle>
                            <KPISection>
                                <KPICard
                                    title="Przychód w tym miesiącu"
                                    value={`${revenueStats?.monthlyRevenue?.toFixed(2) || 0} zł`}
                                    prevValue={revenueStats?.prevMonthlyRevenue || 0}
                                    icon={<FaMoneyBillWave />}
                                    color="#f39c12"
                                    isCurrency
                                />
                                <KPICard
                                    title="Średnia wartość zlecenia"
                                    value={`${(revenueStats?.monthlyRevenue / taskStats?.monthlyTasks)?.toFixed(2) || 0} zł`}
                                    icon={<FaChartLine />}
                                    color="#3498db"
                                    isCurrency
                                />
                                <KPICard
                                    title="Najlepsza usługa"
                                    value={`${topServices[0]?.totalValue?.toFixed(2) || 0} zł`}
                                    icon={<FaChartBar />}
                                    color="#2ecc71"
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
                                            <FaMoneyBillWave /> Przychód - porównanie
                                        </ReportTitle>
                                    </ReportHeader>
                                    <ReportContent>
                                        <RevenueComparisonWidget
                                            currentRevenue={revenueStats?.monthlyRevenue || 0}
                                            previousRevenue={revenueStats?.prevMonthlyRevenue || 0}
                                        />
                                    </ReportContent>
                                </ReportCard>

                                <ReportCard wide>
                                    <ReportHeader>
                                        <ReportTitle>
                                            <FaUserTie /> Przychód według pracowników
                                        </ReportTitle>
                                    </ReportHeader>
                                    <ReportContent>
                                        <EmployeeProductivityChart
                                            data={employeeStats || []}
                                            metricType="revenue"
                                        />
                                    </ReportContent>
                                </ReportCard>

                                <ReportCard wide>
                                    <ReportHeader>
                                        <ReportTitle>
                                            <FaChartLine /> Sezonowość przychodów
                                        </ReportTitle>
                                    </ReportHeader>
                                    <ReportContent>
                                        <SeasonalityChart data={seasonalityData || []} showRevenue={true} />
                                    </ReportContent>
                                </ReportCard>
                            </ReportsGrid>
                        </>
                    )}

                    {reportType === 'customers' && (
                        <>
                            <SectionTitle>Analiza klientów</SectionTitle>
                            <KPISection>
                                <KPICard
                                    title="Satysfakcja klientów"
                                    value={`${customerSatisfactionData?.averageRating?.toFixed(1) || 0}/5`}
                                    icon={<FaSmile />}
                                    color="#2ecc71"
                                />
                                <KPICard
                                    title="Wskaźnik powrotu klientów"
                                    value={`${customerLTVData?.repeatRate || 0}%`}
                                    icon={<FaUsers />}
                                    color="#3498db"
                                />
                                <KPICard
                                    title="Średnia liczba wizyt"
                                    value={customerLTVData?.averageVisitsPerClient || 0}
                                    icon={<FaCalendarAlt />}
                                    color="#9b59b6"
                                />
                            </KPISection>

                            <ReportsGrid>
                                <ReportCard wide>
                                    <ReportHeader>
                                        <ReportTitle>
                                            <FaUsers /> Wartość klienta w czasie (LTV)
                                        </ReportTitle>
                                    </ReportHeader>
                                    <ReportContent>
                                        <CustomerLTVChart
                                            customerValueData={customerLTVData?.customerValueData || []}
                                            loyaltyData={customerLTVData?.loyaltyData || {newClients: 0, returningClients: 0, loyalClients: 0}}
                                            repeatRate={customerLTVData?.repeatRate || 0}
                                            averageVisitsPerClient={customerLTVData?.averageVisitsPerClient || 0}
                                        />
                                    </ReportContent>
                                </ReportCard>

                                <ReportCard wide>
                                    <ReportHeader>
                                        <ReportTitle>
                                            <FaSmile /> Satysfakcja klientów
                                        </ReportTitle>
                                    </ReportHeader>
                                    <ReportContent>
                                        <CustomerSatisfactionChart
                                            data={customerSatisfactionData?.satisfactionData || []}
                                            averageRating={customerSatisfactionData?.averageRating || 0}
                                            totalReviews={customerSatisfactionData?.totalReviews || 0}
                                        />
                                    </ReportContent>
                                </ReportCard>
                            </ReportsGrid>
                        </>
                    )}

                    {reportType === 'services' && (
                        <>
                            <SectionTitle>Analiza usług</SectionTitle>
                            <KPISection>
                                <KPICard
                                    title="Najpopularniejsza usługa"
                                    value={topServices[0]?.name || "Brak danych"}
                                    icon={<FaChartBar />}
                                    color="#3498db"
                                />
                                <KPICard
                                    title="Średni czas realizacji"
                                    value={`${taskDurationData.reduce((acc, item) => acc + item.duration, 0) / taskDurationData.length || 0} godz.`}
                                    icon={<FaStopwatch />}
                                    color="#9b59b6"
                                />
                                <KPICard
                                    title="Średnia wartość usługi"
                                    value={`${topServices.reduce((acc, service) => acc + service.totalValue / service.count, 0) / topServices.length || 0} zł`}
                                    icon={<FaMoneyBillWave />}
                                    color="#2ecc71"
                                    isCurrency
                                />
                            </KPISection>

                            <ReportsGrid>
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
                                            <FaUserTie /> Wydajność pracowników
                                        </ReportTitle>
                                    </ReportHeader>
                                    <ReportContent>
                                        <EmployeeProductivityChart
                                            data={employeeStats || []}
                                            metricType="tasks"
                                        />
                                    </ReportContent>
                                </ReportCard>

                                <ReportCard wide>
                                    <ReportHeader>
                                        <ReportTitle>
                                            <FaStopwatch /> Średni czas realizacji usług
                                        </ReportTitle>
                                    </ReportHeader>
                                    <ReportContent>
                                        <AverageTaskDurationChart data={taskDurationData || []} />
                                    </ReportContent>
                                </ReportCard>
                            </ReportsGrid>
                        </>
                    )}
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

const SectionTitle = styled.h2`
    font-size: 20px;
    color: #2c3e50;
    margin: 30px 0 20px 0;
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