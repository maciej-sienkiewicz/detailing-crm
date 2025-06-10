// src/pages/Finances/components/FinancialReportsPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaChartLine,
    FaArrowUp,
    FaArrowDown,
    FaMinus,
    FaCalendarAlt,
    FaDownload,
    FaFilter,
    FaSync,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
    FaDollarSign,
    FaChartPie
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';
import {
    financialReportsApi,
    FinancialReportsResponse,
    RevenueAnalysis,
    ProfitAnalysis,
    BreakEvenAnalysis,
    TrendChartData,
    TimePeriodComparison,
    ReportsFilters
} from '../../api/financialReportsApi';
import {FaArrowTrendUp, FaGolang} from "react-icons/fa6";
import { brandTheme } from './styles/theme';
import { useToast } from '../../components/common/Toast/Toast';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const FinancialReportsPage: React.FC = () => {
    const { showToast } = useToast();

    // State
    const [reportsData, setReportsData] = useState<FinancialReportsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ReportsFilters>({
        includeFixedCosts: true,
        currency: 'PLN'
    });
    const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

    // Load data
    const loadReportsData = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await financialReportsApi.getFinancialReports(filters);
            setReportsData(data);
        } catch (err) {
            console.error('Error loading reports data:', err);
            setError('Nie udało się załadować danych raportów finansowych');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReportsData();
    }, [filters, selectedPeriod]);

    // Helper functions
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatPercent = (percent: number): string => {
        return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
    };

    const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
        switch (trend) {
            case 'UP':
                return <FaArrowUp style={{ color: brandTheme.status.success }} />;
            case 'DOWN':
                return <FaArrowDown style={{ color: brandTheme.status.error }} />;
            case 'STABLE':
                return <FaMinus style={{ color: brandTheme.text.muted }} />;
        }
    };

    const getBreakEvenIcon = (analysis: BreakEvenAnalysis) => {
        if (analysis.currentMonth.isBreakEvenReached) {
            return <FaCheckCircle style={{ color: brandTheme.status.success }} />;
        } else if (analysis.currentMonth.percentageToBreakEven > 80) {
            return <FaClock style={{ color: brandTheme.status.warning }} />;
        } else {
            return <FaExclamationTriangle style={{ color: brandTheme.status.error }} />;
        }
    };

    // Chart configurations
    const getLineChartOptions = (title: string): ChartOptions<'line'> => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: title
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return formatAmount(value as number);
                    }
                }
            }
        }
    });

    const getBarChartOptions = (title: string): ChartOptions<'bar'> => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: title
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return formatAmount(value as number);
                    }
                }
            }
        }
    });

    // Handle refresh
    const handleRefresh = () => {
        loadReportsData();
        showToast('info', 'Odświeżanie danych raportów...');
    };

    // Handle export
    const handleExport = () => {
        showToast('info', 'Eksport raportów - funkcjonalność w przygotowaniu');
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie raportów finansowych...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <ErrorContainer>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                    <RetryButton onClick={loadReportsData}>
                        <FaSync />
                        Spróbuj ponownie
                    </RetryButton>
                </ErrorContainer>
            </PageContainer>
        );
    }

    if (!reportsData) {
        return null;
    }

    const { revenueAnalysis, profitAnalysis, breakEvenAnalysis, trendData } = reportsData;

    // Chart data for trends
    const trendChartData = {
        labels: trendData.labels,
        datasets: [
            {
                label: 'Przychody',
                data: trendData.revenue.map(d => d.revenue),
                borderColor: brandTheme.status.success,
                backgroundColor: brandTheme.status.successLight,
                borderWidth: 3,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Wydatki',
                data: trendData.revenue.map(d => d.expenses),
                borderColor: brandTheme.status.error,
                backgroundColor: brandTheme.status.errorLight,
                borderWidth: 3,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Zysk',
                data: trendData.profit.map(d => d.profit),
                borderColor: brandTheme.primary,
                backgroundColor: brandTheme.primaryGhost,
                borderWidth: 3,
                fill: false,
                tension: 0.4
            }
        ]
    };

    // Break-even chart data
    const breakEvenChartData = {
        labels: breakEvenAnalysis.historicalData.map(d => d.month),
        datasets: [
            {
                label: 'Punkt break-even',
                data: breakEvenAnalysis.historicalData.map(d => d.breakEvenRevenue),
                backgroundColor: brandTheme.status.warningLight,
                borderColor: brandTheme.status.warning,
                borderWidth: 2
            },
            {
                label: 'Rzeczywiste przychody',
                data: breakEvenAnalysis.historicalData.map(d => d.actualRevenue),
                backgroundColor: breakEvenAnalysis.historicalData.map(d =>
                    d.reachedBreakEven ? brandTheme.status.successLight : brandTheme.status.errorLight
                ),
                borderColor: breakEvenAnalysis.historicalData.map(d =>
                    d.reachedBreakEven ? brandTheme.status.success : brandTheme.status.error
                ),
                borderWidth: 2
            }
        ]
    };

    return (
        <PageContainer>
            {/* Header */}
            {/* Key Metrics Summary */}
            <SummarySection>
                <SummaryGrid>
                    {/* Revenue Card */}
                    <MetricCard>
                        <MetricHeader>
                            <MetricIcon $color={brandTheme.status.success}>
                                <FaDollarSign />
                            </MetricIcon>
                            <MetricTitle>Przychody</MetricTitle>
                        </MetricHeader>
                        <MetricValue>{formatAmount(revenueAnalysis.revenue.mom.current)}</MetricValue>
                        <MetricSubtitle>W tym miesiącu</MetricSubtitle>
                        <ComparisonGrid>
                            <ComparisonItem>
                                <ComparisonLabel>WoW</ComparisonLabel>
                                <ComparisonValue $positive={revenueAnalysis.revenue.wow.change >= 0}>
                                    {getTrendIcon(revenueAnalysis.revenue.wow.trend)}
                                    {formatPercent(revenueAnalysis.revenue.wow.changePercent)}
                                </ComparisonValue>
                            </ComparisonItem>
                            <ComparisonItem>
                                <ComparisonLabel>MoM</ComparisonLabel>
                                <ComparisonValue $positive={revenueAnalysis.revenue.mom.change >= 0}>
                                    {getTrendIcon(revenueAnalysis.revenue.mom.trend)}
                                    {formatPercent(revenueAnalysis.revenue.mom.changePercent)}
                                </ComparisonValue>
                            </ComparisonItem>
                            <ComparisonItem>
                                <ComparisonLabel>YoY</ComparisonLabel>
                                <ComparisonValue $positive={revenueAnalysis.revenue.yoy.change >= 0}>
                                    {getTrendIcon(revenueAnalysis.revenue.yoy.trend)}
                                    {formatPercent(revenueAnalysis.revenue.yoy.changePercent)}
                                </ComparisonValue>
                            </ComparisonItem>
                        </ComparisonGrid>
                    </MetricCard>

                    {/* Profit Card */}
                    <MetricCard>
                        <MetricHeader>
                            <MetricIcon $color={brandTheme.primary}>
                                <FaArrowTrendUp />
                            </MetricIcon>
                            <MetricTitle>Zysk</MetricTitle>
                        </MetricHeader>
                        <MetricValue>{formatAmount(profitAnalysis.profit.mom.current)}</MetricValue>
                        <MetricSubtitle>W tym miesiącu</MetricSubtitle>
                        <ComparisonGrid>
                            <ComparisonItem>
                                <ComparisonLabel>WoW</ComparisonLabel>
                                <ComparisonValue $positive={profitAnalysis.profit.wow.change >= 0}>
                                    {getTrendIcon(profitAnalysis.profit.wow.trend)}
                                    {formatPercent(profitAnalysis.profit.wow.changePercent)}
                                </ComparisonValue>
                            </ComparisonItem>
                            <ComparisonItem>
                                <ComparisonLabel>MoM</ComparisonLabel>
                                <ComparisonValue $positive={profitAnalysis.profit.mom.change >= 0}>
                                    {getTrendIcon(profitAnalysis.profit.mom.trend)}
                                    {formatPercent(profitAnalysis.profit.mom.changePercent)}
                                </ComparisonValue>
                            </ComparisonItem>
                            <ComparisonItem>
                                <ComparisonLabel>YoY</ComparisonLabel>
                                <ComparisonValue $positive={profitAnalysis.profit.yoy.change >= 0}>
                                    {getTrendIcon(profitAnalysis.profit.yoy.trend)}
                                    {formatPercent(profitAnalysis.profit.yoy.changePercent)}
                                </ComparisonValue>
                            </ComparisonItem>
                        </ComparisonGrid>
                    </MetricCard>

                    {/* Break-Even Card */}
                    <MetricCard $type="break-even">
                        <MetricHeader>
                            <MetricIcon $color={breakEvenAnalysis.currentMonth.isBreakEvenReached ? brandTheme.status.success : brandTheme.status.warning}>
                                {getBreakEvenIcon(breakEvenAnalysis)}
                            </MetricIcon>
                            <MetricTitle>Break-Even Point</MetricTitle>
                        </MetricHeader>
                        <MetricValue $small>
                            {formatAmount(breakEvenAnalysis.currentMonth.breakEvenRevenue)}
                        </MetricValue>
                        <MetricSubtitle>Wymagane przychody</MetricSubtitle>
                        <BreakEvenProgress>
                            <ProgressBar>
                                <ProgressFill $percentage={breakEvenAnalysis.currentMonth.percentageToBreakEven} />
                            </ProgressBar>
                            <ProgressText>
                                {breakEvenAnalysis.currentMonth.percentageToBreakEven.toFixed(1)}% osiągnięte
                            </ProgressText>
                        </BreakEvenProgress>
                        <BreakEvenDetails>
                            <BreakEvenDetail>
                                <BreakEvenLabel>Brakuje:</BreakEvenLabel>
                                <BreakEvenValue $negative={!breakEvenAnalysis.currentMonth.isBreakEvenReached}>
                                    {breakEvenAnalysis.currentMonth.isBreakEvenReached
                                        ? 'Osiągnięte!'
                                        : formatAmount(breakEvenAnalysis.currentMonth.revenueNeeded)
                                    }
                                </BreakEvenValue>
                            </BreakEvenDetail>
                            <BreakEvenDetail>
                                <BreakEvenLabel>Dziennie potrzeba:</BreakEvenLabel>
                                <BreakEvenValue>
                                    {formatAmount(breakEvenAnalysis.currentMonth.dailyRevenueNeeded)}
                                </BreakEvenValue>
                            </BreakEvenDetail>
                        </BreakEvenDetails>
                    </MetricCard>
                </SummaryGrid>
            </SummarySection>

            {/* Break-Even Analysis Section */}
            <ReportsSection>
                <SectionHeader>
                    <SectionTitle>
                        <FaGolang />
                        Analiza Break-Even Point
                    </SectionTitle>
                    <SectionSubtitle>
                        Punkt rentowności i porównanie miesięczne
                    </SectionSubtitle>
                </SectionHeader>

                <BreakEvenGrid>
                    <BreakEvenCard>
                        <CardTitle>Obecny miesiąc</CardTitle>
                        <BreakEvenCurrentMonth>
                            <CurrentMonthItem>
                                <ItemLabel>Stałe koszty:</ItemLabel>
                                <ItemValue>{formatAmount(breakEvenAnalysis.currentMonth.totalFixedCosts)}</ItemValue>
                            </CurrentMonthItem>
                            <CurrentMonthItem>
                                <ItemLabel>Marża średnia:</ItemLabel>
                                <ItemValue>{(breakEvenAnalysis.currentMonth.averageContributionMargin * 100).toFixed(1)}%</ItemValue>
                            </CurrentMonthItem>
                            <CurrentMonthItem>
                                <ItemLabel>Aktualne przychody:</ItemLabel>
                                <ItemValue>{formatAmount(breakEvenAnalysis.currentMonth.currentRevenue)}</ItemValue>
                            </CurrentMonthItem>
                            <CurrentMonthItem>
                                <ItemLabel>Dni pozostało:</ItemLabel>
                                <ItemValue>{breakEvenAnalysis.currentMonth.daysRemaining}</ItemValue>
                            </CurrentMonthItem>
                        </BreakEvenCurrentMonth>
                    </BreakEvenCard>

                    <BreakEvenCard>
                        <CardTitle>Porównanie MoM</CardTitle>
                        <MonthComparison>
                            <ComparisonRow>
                                <ComparisonCell>
                                    <CellLabel>Obecny miesiąc</CellLabel>
                                    <CellValue $status={breakEvenAnalysis.monthlyComparison.thisMonth.reachedBreakEven ? 'success' : 'warning'}>
                                        {breakEvenAnalysis.monthlyComparison.thisMonth.reachedBreakEven
                                            ? `✓ Osiągnięte w ${breakEvenAnalysis.monthlyComparison.thisMonth.daysToBreakEven || 'N/A'} dni`
                                            : '⏳ W trakcie'
                                        }
                                    </CellValue>
                                </ComparisonCell>
                                <ComparisonCell>
                                    <CellLabel>Poprzedni miesiąc</CellLabel>
                                    <CellValue $status={breakEvenAnalysis.monthlyComparison.lastMonth.reachedBreakEven ? 'success' : 'error'}>
                                        {breakEvenAnalysis.monthlyComparison.lastMonth.reachedBreakEven
                                            ? `✓ Osiągnięte w ${breakEvenAnalysis.monthlyComparison.lastMonth.daysToBreakEven} dni`
                                            : '✗ Nieosiągnięte'
                                        }
                                    </CellValue>
                                </ComparisonCell>
                            </ComparisonRow>
                            <TrendIndicator $trend={breakEvenAnalysis.monthlyComparison.change.trend}>
                                {breakEvenAnalysis.monthlyComparison.change.trend === 'IMPROVED' && (
                                    <>
                                        <FaArrowTrendUp />
                                        <span>Poprawa o {formatPercent(Math.abs(breakEvenAnalysis.monthlyComparison.change.changePercent))}</span>
                                    </>
                                )}
                                {breakEvenAnalysis.monthlyComparison.change.trend === 'WORSENED' && (
                                    <>
                                        <FaArrowDown />
                                        <span>Pogorszenie o {formatPercent(Math.abs(breakEvenAnalysis.monthlyComparison.change.changePercent))}</span>
                                    </>
                                )}
                                {breakEvenAnalysis.monthlyComparison.change.trend === 'STABLE' && (
                                    <>
                                        <FaMinus />
                                        <span>Bez zmian</span>
                                    </>
                                )}
                            </TrendIndicator>
                        </MonthComparison>
                    </BreakEvenCard>
                </BreakEvenGrid>
            </ReportsSection>

            {/* Charts Section */}
            <ReportsSection>
                <SectionHeader>
                    <SectionTitle>
                        <FaChartLine />
                        Trendy Finansowe
                    </SectionTitle>
                    <SectionSubtitle>
                        Analiza trendów przychodów, wydatków i zysków
                    </SectionSubtitle>
                </SectionHeader>

                <ChartsGrid>
                    <ChartCard>
                        <ChartTitle>Trendy finansowe (12 miesięcy)</ChartTitle>
                        <ChartContainer>
                            <Line
                                data={trendChartData}
                                options={getLineChartOptions('Przychody, Wydatki i Zysk')}
                            />
                        </ChartContainer>
                    </ChartCard>

                    <ChartCard>
                        <ChartTitle>Break-Even Analysis (12 miesięcy)</ChartTitle>
                        <ChartContainer>
                            <Bar
                                data={breakEvenChartData}
                                options={getBarChartOptions('Punkt Break-Even vs Rzeczywiste Przychody')}
                            />
                        </ChartContainer>
                    </ChartCard>
                </ChartsGrid>
            </ReportsSection>

            {/* Detailed Break-Even History */}
            <ReportsSection>
                <SectionHeader>
                    <SectionTitle>
                        <FaChartPie />
                        Historia Break-Even Point
                    </SectionTitle>
                    <SectionSubtitle>
                        Szczegółowa analiza miesięczna osiągania punktu rentowności
                    </SectionSubtitle>
                </SectionHeader>

                <HistoryTable>
                    <HistoryHeader>
                        <HistoryHeaderCell>Miesiąc</HistoryHeaderCell>
                        <HistoryHeaderCell>Break-Even</HistoryHeaderCell>
                        <HistoryHeaderCell>Rzeczywiste</HistoryHeaderCell>
                        <HistoryHeaderCell>Status</HistoryHeaderCell>
                        <HistoryHeaderCell>Dni do BE</HistoryHeaderCell>
                        <HistoryHeaderCell>Surplus/Deficit</HistoryHeaderCell>
                    </HistoryHeader>
                    <HistoryBody>
                        {breakEvenAnalysis.historicalData.slice(-6).map((month, index) => (
                            <HistoryRow key={index}>
                                <HistoryCell>{month.month}</HistoryCell>
                                <HistoryCell>{formatAmount(month.breakEvenRevenue)}</HistoryCell>
                                <HistoryCell>{formatAmount(month.actualRevenue)}</HistoryCell>
                                <HistoryCell>
                                    <StatusBadge $status={month.reachedBreakEven ? 'success' : 'error'}>
                                        {month.reachedBreakEven ? 'Osiągnięte' : 'Nieosiągnięte'}
                                    </StatusBadge>
                                </HistoryCell>
                                <HistoryCell>
                                    {month.daysToBreakEven ? `${month.daysToBreakEven} dni` : '-'}
                                </HistoryCell>
                                <HistoryCell>
                                    <SurplusValue $positive={month.reachedBreakEven}>
                                        {month.surplus
                                            ? `+${formatAmount(month.surplus)}`
                                            : formatAmount(month.actualRevenue - month.breakEvenRevenue)
                                        }
                                    </SurplusValue>
                                </HistoryCell>
                            </HistoryRow>
                        ))}
                    </HistoryBody>
                </HistoryTable>
            </ReportsSection>

        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
        gap: ${brandTheme.spacing.lg};
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.md};
    min-height: 400px;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.status.error};
    gap: ${brandTheme.spacing.md};
    min-height: 400px;
`;

const ErrorIcon = styled.div`
    font-size: 48px;
`;

const ErrorText = styled.div`
    font-size: 16px;
    color: ${brandTheme.status.error};
    font-weight: 500;
    text-align: center;
`;

const RetryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: translateY(-1px);
    }
`;

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${brandTheme.surface};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.md};
        padding: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${brandTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

// Summary Section
const SummarySection = styled.section`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    padding: ${brandTheme.spacing.xl};
    box-shadow: ${brandTheme.shadow.sm};
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const MetricCard = styled.div<{ $type?: string }>`
    background: ${brandTheme.surface};
    border: 2px solid ${props =>
            props.$type === 'break-even' ? brandTheme.status.warning + '44' : brandTheme.border
    };
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.xs};
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.md};
        border-color: ${props =>
                props.$type === 'break-even' ? brandTheme.status.warning : brandTheme.primary
        };
    }
`;

const MetricHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.md};
`;

const MetricIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$color}22;
    border: 2px solid ${props => props.$color}44;
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 20px;
`;

const MetricTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
`;

const MetricValue = styled.div<{ $small?: boolean }>`
    font-size: ${props => props.$small ? '24px' : '32px'};
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;

    @media (max-width: 768px) {
        font-size: ${props => props.$small ? '20px' : '24px'};
    }
`;

const MetricSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.md};
`;

const ComparisonGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${brandTheme.spacing.sm};
`;

const ComparisonItem = styled.div`
    text-align: center;
`;

const ComparisonLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
    margin-bottom: ${brandTheme.spacing.xs};
`;

const ComparisonValue = styled.div<{ $positive: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$positive ? brandTheme.status.success : brandTheme.status.error};
`;

// Break-Even specific components
const BreakEvenProgress = styled.div`
    margin: ${brandTheme.spacing.md} 0;
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background: ${brandTheme.borderLight};
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: ${brandTheme.spacing.xs};
`;

const ProgressFill = styled.div<{ $percentage: number }>`
    width: ${props => Math.min(props.$percentage, 100)}%;
    height: 100%;
    background: linear-gradient(90deg,
    ${brandTheme.status.error} 0%,
    ${brandTheme.status.warning} 70%,
    ${brandTheme.status.success} 100%
    );
    transition: width 0.3s ease;
`;

const ProgressText = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    text-align: center;
`;

const BreakEvenDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const BreakEvenDetail = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const BreakEvenLabel = styled.span`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
`;

const BreakEvenValue = styled.span<{ $negative?: boolean }>`
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$negative ? brandTheme.status.error : brandTheme.text.primary};
`;

// Reports sections
const ReportsSection = styled.section`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    padding: ${brandTheme.spacing.xl};
    box-shadow: ${brandTheme.shadow.sm};
`;

const SectionHeader = styled.div`
    margin-bottom: ${brandTheme.spacing.xl};
`;

const SectionTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;

    svg {
        color: ${brandTheme.primary};
    }
`;

const SectionSubtitle = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0;
`;

// Break-Even Analysis Grid
const BreakEvenGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const BreakEvenCard = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
`;

const CardTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
`;

const BreakEvenCurrentMonth = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const CurrentMonthItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.sm} 0;
    border-bottom: 1px solid ${brandTheme.borderLight};

    &:last-child {
        border-bottom: none;
    }
`;

const ItemLabel = styled.span`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
`;

const ItemValue = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const MonthComparison = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const ComparisonRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${brandTheme.spacing.md};
`;

const ComparisonCell = styled.div`
    text-align: center;
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
`;

const CellLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const CellValue = styled.div<{ $status: 'success' | 'warning' | 'error' }>`
    font-size: 14px;
    font-weight: 600;
    color: ${props => {
        switch (props.$status) {
            case 'success': return brandTheme.status.success;
            case 'warning': return brandTheme.status.warning;
            case 'error': return brandTheme.status.error;
        }
    }};
`;

const TrendIndicator = styled.div<{ $trend: 'IMPROVED' | 'WORSENED' | 'STABLE' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md};
    background: ${props => {
        switch (props.$trend) {
            case 'IMPROVED': return brandTheme.status.successLight;
            case 'WORSENED': return brandTheme.status.errorLight;
            case 'STABLE': return brandTheme.surfaceAlt;
        }
    }};
    color: ${props => {
        switch (props.$trend) {
            case 'IMPROVED': return brandTheme.status.success;
            case 'WORSENED': return brandTheme.status.error;
            case 'STABLE': return brandTheme.text.secondary;
        }
    }};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
`;

// Charts
const ChartsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${brandTheme.spacing.xl};

    @media (min-width: 1200px) {
        grid-template-columns: 1fr 1fr;
    }
`;

const ChartCard = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.xs};
`;

const ChartTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.lg} 0;
    text-align: center;
`;

const ChartContainer = styled.div`
    height: 400px;
    position: relative;
`;

// History Table
const HistoryTable = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    overflow: hidden;
`;

const HistoryHeader = styled.div`
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr 1.5fr;
    background: ${brandTheme.surface};
    border-bottom: 2px solid ${brandTheme.border};

    @media (max-width: 768px) {
        display: none;
    }
`;

const HistoryHeaderCell = styled.div`
    padding: ${brandTheme.spacing.md};
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const HistoryBody = styled.div`
    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        gap: ${brandTheme.spacing.md};
        padding: ${brandTheme.spacing.md};
    }
`;

const HistoryRow = styled.div`
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr 1.5fr;
    border-bottom: 1px solid ${brandTheme.borderLight};
    transition: background-color 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
    }

    &:last-child {
        border-bottom: none;
    }

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        background: ${brandTheme.surface};
        border-radius: ${brandTheme.radius.md};
        padding: ${brandTheme.spacing.md};
        border: 1px solid ${brandTheme.border};
        gap: ${brandTheme.spacing.sm};
    }
`;

const HistoryCell = styled.div`
    padding: ${brandTheme.spacing.md};
    font-size: 14px;
    color: ${brandTheme.text.primary};
    border-right: 1px solid ${brandTheme.borderLight};
    display: flex;
    align-items: center;

    &:last-child {
        border-right: none;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.xs} 0;
        border-right: none;
        justify-content: space-between;

        &::before {
            content: attr(data-label);
            font-weight: 600;
            color: ${brandTheme.text.secondary};
            font-size: 12px;
        }
    }
`;

const StatusBadge = styled.span<{ $status: 'success' | 'error' }>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    background-color: ${props => props.$status === 'success' ? brandTheme.status.successLight : brandTheme.status.errorLight};
    color: ${props => props.$status === 'success' ? brandTheme.status.success : brandTheme.status.error};
    border: 1px solid ${props => props.$status === 'success' ? brandTheme.status.success + '44' : brandTheme.status.error + '44'};
`;

const SurplusValue = styled.span<{ $positive: boolean }>`
    font-weight: 600;
    color: ${props => props.$positive ? brandTheme.status.success : brandTheme.status.error};
`;

// Projections
const ProjectionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ProjectionCard = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    text-align: center;
    box-shadow: ${brandTheme.shadow.xs};
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.md};
        border-color: ${brandTheme.primary};
    }
`;

const ProjectionTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
`;

const ProjectionValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.primary};
    margin-bottom: ${brandTheme.spacing.sm};
    letter-spacing: -0.025em;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const ProjectionLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    margin: 0;
`;

export default FinancialReportsPage;