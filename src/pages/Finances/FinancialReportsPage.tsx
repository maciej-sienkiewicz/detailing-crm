import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaChartLine,
    FaUsers,
    FaDollarSign,
    FaCog,
    FaClock,
    FaEquals,
    FaCalendarAlt,
    FaDownload,
    FaSync,
    FaFilter,
    FaUserPlus,
    FaWrench,
    FaPercentage,
    FaChartPie,
    FaChartBar,
    FaArrowUp,
    FaArrowDown,
    FaEye,
    FaAngleRight
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend
);

// Professional enterprise theme
const theme = {
    colors: {
        primary: '#0f172a',
        primaryLight: '#1e293b',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        text: {
            primary: '#0f172a',
            secondary: '#64748b',
            muted: '#94a3b8',
            inverse: '#ffffff'
        },
        background: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#f1f5f9',
            dark: '#0f172a'
        },
        border: '#e2e8f0',
        borderLight: '#f1f5f9'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    }
};

type TimeFrame = '7d' | '30d' | '90d' | '12m';
type MetricCategory = 'financial' | 'operational' | 'customer';

interface TimeFrameOption {
    value: TimeFrame;
    label: string;
}

const timeFrameOptions: TimeFrameOption[] = [
    { value: '7d', label: '7 dni' },
    { value: '30d', label: '30 dni' },
    { value: '90d', label: '90 dni' },
    { value: '12m', label: '12 miesięcy' }
];

// Mock data with time series
const generateTimeSeriesData = (timeFrame: TimeFrame) => {
    const getDataPoints = (timeFrame: TimeFrame) => {
        switch (timeFrame) {
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 12; // Weekly points
            case '12m': return 12;
            default: return 12;
        }
    };

    const points = getDataPoints(timeFrame);
    const labels = Array.from({ length: points }, (_, i) => {
        const date = new Date();
        if (timeFrame === '7d') {
            date.setDate(date.getDate() - (points - 1 - i));
            return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
        } else if (timeFrame === '30d') {
            date.setDate(date.getDate() - (points - 1 - i));
            return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
        } else if (timeFrame === '90d') {
            date.setDate(date.getDate() - (points - 1 - i) * 7);
            return `Tydz. ${points - i}`;
        } else {
            date.setMonth(date.getMonth() - (points - 1 - i));
            return date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' });
        }
    });

    const fixedCosts = 45000; // Monthly fixed costs
    const revenue = Array.from({ length: points }, () => Math.floor(Math.random() * 50000 + 180000));

    return {
        labels,
        financialMetrics: {
            revenue,
            fixedCosts: Array.from({ length: points }, () => fixedCosts + Math.floor(Math.random() * 5000 - 2500)),
            breakEvenPoint: Array.from({ length: points }, () => fixedCosts + Math.floor(Math.random() * 10000)),
            aov: Array.from({ length: points }, () => Math.floor(Math.random() * 200 + 750)),
            revenuePerWorker: Array.from({ length: points }, () => Math.floor(Math.random() * 8000 + 42000)),
            profitPerWorker: Array.from({ length: points }, () => Math.floor(Math.random() * 5000 + 15000))
        },
        operationalMetrics: {
            deliveryTime: Array.from({ length: points }, () => Math.random() * 1 + 3.5),
            onTimeRate: Array.from({ length: points }, () => Math.random() * 15 + 80),
            utilization: Array.from({ length: points }, () => Math.random() * 20 + 75),
            topService: {
                name: 'Detailing Premium',
                percentage: 35.2,
                trend: 'up'
            },
            serviceDemandTrend: Array.from({ length: points }, () => Math.floor(Math.random() * 20 + 80))
        },
        customerMetrics: {
            retention: Array.from({ length: points }, () => Math.random() * 10 + 65),
            newCustomers: Array.from({ length: points }, () => Math.floor(Math.random() * 15 + 15)),
            rejectionRate: Array.from({ length: points }, () => Math.random() * 8 + 5)
        }
    };
};

const FinancialReportsPage: React.FC = () => {
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('30d');
    const [selectedCategory, setSelectedCategory] = useState<MetricCategory>('financial');
    const [data, setData] = useState(generateTimeSeriesData('30d'));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setData(generateTimeSeriesData(selectedTimeFrame));
    }, [selectedTimeFrame]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatPercent = (percent: number): string => {
        return `${percent.toFixed(1)}%`;
    };

    const getCurrentValue = (dataArray: number[]) => dataArray[dataArray.length - 1];
    const getPreviousValue = (dataArray: number[]) => dataArray[dataArray.length - 2] || dataArray[dataArray.length - 1];
    const getChange = (current: number, previous: number) => ((current - previous) / previous) * 100;

    const getMetricTrend = (current: number, previous: number) => {
        const change = getChange(current, previous);
        if (Math.abs(change) < 1) return 'stable';
        return change > 0 ? 'up' : 'down';
    };

    // Current period data
    const currentRevenue = getCurrentValue(data.financialMetrics.revenue);
    const previousRevenue = getPreviousValue(data.financialMetrics.revenue);
    const revenueChange = getChange(currentRevenue, previousRevenue);

    const currentBreakEven = getCurrentValue(data.financialMetrics.breakEvenPoint);
    const currentAOV = getCurrentValue(data.financialMetrics.aov);
    const previousAOV = getPreviousValue(data.financialMetrics.aov);
    const aovChange = getChange(currentAOV, previousAOV);

    const currentRetention = getCurrentValue(data.customerMetrics.retention);
    const previousRetention = getPreviousValue(data.customerMetrics.retention);
    const retentionChange = getChange(currentRetention, previousRetention);

    const currentDeliveryTime = getCurrentValue(data.operationalMetrics.deliveryTime);
    const currentOnTimeRate = getCurrentValue(data.operationalMetrics.onTimeRate);
    const currentRejectionRate = getCurrentValue(data.customerMetrics.rejectionRate);

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: theme.colors.background.dark,
                titleColor: theme.colors.text.inverse,
                bodyColor: theme.colors.text.inverse,
                borderColor: theme.colors.border,
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                border: {
                    display: false
                },
                ticks: {
                    color: theme.colors.text.muted,
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                grid: {
                    color: theme.colors.borderLight
                },
                border: {
                    display: false
                },
                ticks: {
                    color: theme.colors.text.muted,
                    font: {
                        size: 12
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        elements: {
            point: {
                radius: 0,
                hoverRadius: 6
            },
            line: {
                tension: 0.3
            }
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setData(generateTimeSeriesData(selectedTimeFrame));
            setLoading(false);
        }, 800);
    };

    return (
        <DashboardContainer>
            {/* Header */}
            <Header>
                <HeaderContent>
                    <Title>Analityka Biznesowa</Title>
                    <Subtitle>Kluczowe wskaźniki efektywności i trendy czasowe</Subtitle>
                </HeaderContent>
                <HeaderActions>
                    <TimeFrameSelector>
                        {timeFrameOptions.map(option => (
                            <TimeFrameButton
                                key={option.value}
                                $active={selectedTimeFrame === option.value}
                                onClick={() => setSelectedTimeFrame(option.value)}
                            >
                                {option.label}
                            </TimeFrameButton>
                        ))}
                    </TimeFrameSelector>
                    <ActionButton onClick={handleRefresh} disabled={loading}>
                        <FaSync className={loading ? 'spinning' : ''} />
                    </ActionButton>
                    <ActionButton>
                        <FaDownload />
                    </ActionButton>
                </HeaderActions>
            </Header>

            {/* Category Navigation */}
            <CategoryNav>
                <CategoryButton
                    $active={selectedCategory === 'financial'}
                    onClick={() => setSelectedCategory('financial')}
                >
                    <FaDollarSign />
                    Finansowe
                </CategoryButton>
                <CategoryButton
                    $active={selectedCategory === 'operational'}
                    onClick={() => setSelectedCategory('operational')}
                >
                    <FaCog />
                    Operacyjne
                </CategoryButton>
                <CategoryButton
                    $active={selectedCategory === 'customer'}
                    onClick={() => setSelectedCategory('customer')}
                >
                    <FaUsers />
                    Klienci
                </CategoryButton>
            </CategoryNav>

            {/* Main Content Based on Category */}
            {selectedCategory === 'financial' && (
                <ContentSection>
                    {/* Primary KPIs */}
                    <KPIGrid>
                        <KPICard>
                            <KPIHeader>
                                <KPILabel>Przychody</KPILabel>
                                <KPIValue>{formatCurrency(currentRevenue)}</KPIValue>
                            </KPIHeader>
                            <KPITrend $trend={getMetricTrend(currentRevenue, previousRevenue)}>
                                {revenueChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
                                {Math.abs(revenueChange).toFixed(1)}% vs poprzedni okres
                            </KPITrend>
                        </KPICard>

                        <KPICard>
                            <KPIHeader>
                                <KPILabel>Break-Even Point</KPILabel>
                                <KPIValue>{formatCurrency(currentBreakEven)}</KPIValue>
                            </KPIHeader>
                            <KPINote>punkt przecięcia kosztów z przychodami</KPINote>
                        </KPICard>

                        <KPICard>
                            <KPIHeader>
                                <KPILabel>AOV (średnia wartość zamówienia)</KPILabel>
                                <KPIValue>{formatCurrency(currentAOV)}</KPIValue>
                            </KPIHeader>
                            <KPITrend $trend={getMetricTrend(currentAOV, previousAOV)}>
                                {aovChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
                                {Math.abs(aovChange).toFixed(1)}%
                            </KPITrend>
                        </KPICard>
                    </KPIGrid>

                    {/* Charts */}
                    <ChartsGrid>
                        <ChartSection>
                            <ChartHeader>
                                <ChartTitle>Trendy Przychodów vs Koszty Stałe</ChartTitle>
                                <ChartAction>
                                    <FaEye />
                                    Szczegóły
                                    <FaAngleRight />
                                </ChartAction>
                            </ChartHeader>
                            <ChartContainer>
                                <Line
                                    data={{
                                        labels: data.labels,
                                        datasets: [
                                            {
                                                label: 'Przychody',
                                                data: data.financialMetrics.revenue,
                                                borderColor: theme.colors.accent,
                                                backgroundColor: theme.colors.accent + '10',
                                                borderWidth: 2,
                                                fill: false
                                            },
                                            {
                                                label: 'Koszty stałe',
                                                data: data.financialMetrics.fixedCosts,
                                                borderColor: theme.colors.error,
                                                backgroundColor: theme.colors.error + '10',
                                                borderWidth: 2,
                                                fill: false,
                                                borderDash: [5, 5]
                                            }
                                        ]
                                    }}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                display: true,
                                                position: 'top' as const,
                                                align: 'end' as const,
                                                labels: {
                                                    usePointStyle: true,
                                                    padding: 20,
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </ChartContainer>
                        </ChartSection>

                        <ChartSection>
                            <ChartHeader>
                                <ChartTitle>Zysk na Pracownika</ChartTitle>
                                <ChartAction>
                                    <FaEye />
                                    Szczegóły
                                    <FaAngleRight />
                                </ChartAction>
                            </ChartHeader>
                            <ChartContainer>
                                <Line
                                    data={{
                                        labels: data.labels,
                                        datasets: [{
                                            data: data.financialMetrics.profitPerWorker,
                                            borderColor: theme.colors.success,
                                            backgroundColor: theme.colors.success + '10',
                                            borderWidth: 2,
                                            fill: true
                                        }]
                                    }}
                                    options={{
                                        ...chartOptions,
                                        scales: {
                                            ...chartOptions.scales,
                                            y: {
                                                ...chartOptions.scales?.y,
                                                ticks: {
                                                    ...chartOptions.scales?.y?.ticks,
                                                    callback: function(value) {
                                                        return formatCurrency(value as number);
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </ChartContainer>
                        </ChartSection>
                    </ChartsGrid>
                </ContentSection>
            )}

            {selectedCategory === 'operational' && (
                <ContentSection>
                    <KPIGrid>
                        <KPICard>
                            <KPIHeader>
                                <KPILabel>Czas Realizacji</KPILabel>
                                <KPIValue>{currentDeliveryTime.toFixed(1)} dni</KPIValue>
                            </KPIHeader>
                            <KPINote>średni czas dostawy</KPINote>
                        </KPICard>

                        <KPICard>
                            <KPIHeader>
                                <KPILabel>Punktualność</KPILabel>
                                <KPIValue>{currentOnTimeRate.toFixed(1)}%</KPIValue>
                            </KPIHeader>
                            <KPINote>dostaw na czas</KPINote>
                        </KPICard>

                        <KPICard>
                            <KPIHeader>
                                <KPILabel>Najpopularniejsza Usługa</KPILabel>
                                <KPIValue>{data.operationalMetrics.topService.name}</KPIValue>
                            </KPIHeader>
                            <KPITrend $trend={data.operationalMetrics.topService.trend}>
                                <FaArrowUp />
                                {data.operationalMetrics.topService.percentage}% zamówień
                            </KPITrend>
                        </KPICard>
                    </KPIGrid>

                    <ChartsGrid>
                        <ChartSection>
                            <ChartHeader>
                                <ChartTitle>Czas Realizacji</ChartTitle>
                                <ChartAction>
                                    <FaEye />
                                    Szczegóły
                                    <FaAngleRight />
                                </ChartAction>
                            </ChartHeader>
                            <ChartContainer>
                                <Line
                                    data={{
                                        labels: data.labels,
                                        datasets: [{
                                            data: data.operationalMetrics.deliveryTime,
                                            borderColor: theme.colors.warning,
                                            backgroundColor: theme.colors.warning + '10',
                                            borderWidth: 2,
                                            fill: true
                                        }]
                                    }}
                                    options={chartOptions}
                                />
                            </ChartContainer>
                        </ChartSection>

                        <ChartSection>
                            <ChartHeader>
                                <ChartTitle>Trend Popytu na Usługi</ChartTitle>
                                <ChartAction>
                                    <FaEye />
                                    Szczegóły
                                    <FaAngleRight />
                                </ChartAction>
                            </ChartHeader>
                            <ChartContainer>
                                <Bar
                                    data={{
                                        labels: data.labels,
                                        datasets: [{
                                            label: 'Liczba zamówień',
                                            data: data.operationalMetrics.serviceDemandTrend,
                                            backgroundColor: theme.colors.accent + '60',
                                            borderColor: theme.colors.accent,
                                            borderWidth: 1,
                                            borderRadius: 4
                                        }]
                                    }}
                                    options={{
                                        ...chartOptions,
                                        scales: {
                                            ...chartOptions.scales,
                                            y: {
                                                ...chartOptions.scales?.y,
                                                beginAtZero: true,
                                                ticks: {
                                                    ...chartOptions.scales?.y?.ticks,
                                                    callback: function(value) {
                                                        return value + ' zam.';
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </ChartContainer>
                        </ChartSection>
                    </ChartsGrid>
                </ContentSection>
            )}

            {selectedCategory === 'customer' && (
                <ContentSection>
                    <KPIGrid>
                        <KPICard>
                            <KPIHeader>
                                <KPILabel>Retention Rate</KPILabel>
                                <KPIValue>{currentRetention.toFixed(1)}%</KPIValue>
                            </KPIHeader>
                            <KPINote>klientów wraca w ciągu 12 miesięcy</KPINote>
                            <KPITrend $trend={getMetricTrend(currentRetention, previousRetention)}>
                                {retentionChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
                                {Math.abs(retentionChange).toFixed(1)}%
                            </KPITrend>
                        </KPICard>

                        <KPICard>
                            <KPIHeader>
                                <KPILabel>Nowi Klienci</KPILabel>
                                <KPIValue>{getCurrentValue(data.customerMetrics.newCustomers)}</KPIValue>
                            </KPIHeader>
                            <KPINote>w tym okresie</KPINote>
                        </KPICard>

                        <KPICard>
                            <KPIHeader>
                                <KPILabel>Odrzucone Wizyty</KPILabel>
                                <KPIValue>{currentRejectionRate.toFixed(1)}%</KPIValue>
                            </KPIHeader>
                            <KPINote>wizyt odrzuconych przez klientów</KPINote>
                        </KPICard>
                    </KPIGrid>

                    <ChartsGrid>
                        <ChartSection>
                            <ChartHeader>
                                <ChartTitle>Wskaźnik Retencji</ChartTitle>
                                <ChartAction>
                                    <FaEye />
                                    Szczegóły
                                    <FaAngleRight />
                                </ChartAction>
                            </ChartHeader>
                            <ChartContainer>
                                <Line
                                    data={{
                                        labels: data.labels,
                                        datasets: [{
                                            data: data.customerMetrics.retention,
                                            borderColor: theme.colors.accent,
                                            backgroundColor: theme.colors.accent + '10',
                                            borderWidth: 2,
                                            fill: true
                                        }]
                                    }}
                                    options={{
                                        ...chartOptions,
                                        scales: {
                                            ...chartOptions.scales,
                                            y: {
                                                ...chartOptions.scales?.y,
                                                ticks: {
                                                    ...chartOptions.scales?.y?.ticks,
                                                    callback: function(value) {
                                                        return value + '%';
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </ChartContainer>
                        </ChartSection>

                        <ChartSection>
                            <ChartHeader>
                                <ChartTitle>Wskaźnik Odrzuceń</ChartTitle>
                                <ChartAction>
                                    <FaEye />
                                    Szczegóły
                                    <FaAngleRight />
                                </ChartAction>
                            </ChartHeader>
                            <ChartContainer>
                                <Line
                                    data={{
                                        labels: data.labels,
                                        datasets: [{
                                            data: data.customerMetrics.rejectionRate,
                                            borderColor: theme.colors.error,
                                            backgroundColor: theme.colors.error + '10',
                                            borderWidth: 2,
                                            fill: true
                                        }]
                                    }}
                                    options={{
                                        ...chartOptions,
                                        scales: {
                                            ...chartOptions.scales,
                                            y: {
                                                ...chartOptions.scales?.y,
                                                ticks: {
                                                    ...chartOptions.scales?.y?.ticks,
                                                    callback: function(value) {
                                                        return value + '%';
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </ChartContainer>
                        </ChartSection>
                    </ChartsGrid>
                </ContentSection>
            )}

        </DashboardContainer>
    );
};

// Styled Components
const DashboardContainer = styled.div`
    min-height: 100vh;
    background: ${theme.colors.background.secondary};
    padding: ${theme.spacing.xxl};
    
    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg};
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${theme.spacing.xxl};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.lg};
    }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
    font-size: 36px;
    font-weight: 600;
    color: ${theme.colors.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
    letter-spacing: -0.025em;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const Subtitle = styled.p`
    font-size: 18px;
    color: ${theme.colors.text.secondary};
    margin: 0;
    font-weight: 400;

    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const TimeFrameSelector = styled.div`
    display: flex;
    background: ${theme.colors.background.primary};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.md};
    overflow: hidden;
`;

const TimeFrameButton = styled.button<{ $active: boolean }>`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${props => props.$active ? theme.colors.primary : 'transparent'};
    color: ${props => props.$active ? theme.colors.text.inverse : theme.colors.text.secondary};
    border: none;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$active ? theme.colors.primary : theme.colors.background.tertiary};
    }
`;

const ActionButton = styled.button`
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.colors.background.primary};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.md};
    color: ${theme.colors.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.colors.background.tertiary};
        color: ${theme.colors.text.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const CategoryNav = styled.div`
    display: flex;
    gap: ${theme.spacing.xs};
    margin-bottom: ${theme.spacing.xxl};
    border-bottom: 1px solid ${theme.colors.border};
`;

const CategoryButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: transparent;
    border: none;
    border-bottom: 2px solid ${props => props.$active ? theme.colors.accent : 'transparent'};
    color: ${props => props.$active ? theme.colors.accent : theme.colors.text.secondary};
    font-weight: 500;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: ${theme.colors.accent};
        background: ${theme.colors.background.tertiary};
    }
`;

const ContentSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xxl};
`;

const KPIGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${theme.spacing.xl};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

const KPICard = styled.div`
    background: ${theme.colors.background.primary};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
    transition: all 0.2s ease;

    &:hover {
        border-color: ${theme.colors.accent}40;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
`;

const KPIHeader = styled.div`
    margin-bottom: ${theme.spacing.md};
`;

const KPILabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const KPIValue = styled.div`
    font-size: 32px;
    font-weight: 600;
    color: ${theme.colors.text.primary};
    letter-spacing: -0.025em;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const KPITrend = styled.div<{ $trend: 'up' | 'down' | 'stable' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 14px;
    font-weight: 500;
    color: ${props => {
    switch (props.$trend) {
        case 'up': return theme.colors.success;
        case 'down': return theme.colors.error;
        default: return theme.colors.text.muted;
    }
}};
`;

const KPINote = styled.div`
    font-size: 14px;
    color: ${theme.colors.text.muted};
`;

const ChartsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.xl};

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const ChartSection = styled.div`
    background: ${theme.colors.background.primary};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
`;

const ChartHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.xl};
`;

const ChartTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.text.primary};
    margin: 0;
`;

const ChartAction = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: transparent;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.sm};
    color: ${theme.colors.text.secondary};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.colors.background.tertiary};
        color: ${theme.colors.text.primary};
    }
`;

const ChartContainer = styled.div`
    height: 320px;
    position: relative;
`;

export default FinancialReportsPage;