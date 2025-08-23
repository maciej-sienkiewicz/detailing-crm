// src/pages/Finances/components/ServiceStatsModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
import { FaTimes, FaChartLine, FaSync, FaCalendarAlt, FaShoppingCart } from 'react-icons/fa';
import Modal from '../../../components/common/Modal';
import { useServiceStats } from '../hooks/useStatsData';
import { TimeGranularity, ServiceStatsResponse } from '../../../api/statsApi';

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

// Professional theme for charts
const chartTheme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    success: '#059669',
    warning: '#d97706',
    neutral: '#64748b',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    }
};

interface ServiceStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceId: string;
    serviceName: string;
}

export const ServiceStatsModal: React.FC<ServiceStatsModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        serviceId,
                                                                        serviceName
                                                                    }) => {
    const { fetchServiceStats, loading, error } = useServiceStats();
    const [statsData, setStatsData] = useState<ServiceStatsResponse | null>(null);
    const [selectedGranularity, setSelectedGranularity] = useState<TimeGranularity>(TimeGranularity.MONTHLY);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
        endDate: new Date().toISOString().split('T')[0] // today
    });

    // Load stats data when modal opens
    useEffect(() => {
        if (isOpen && serviceId) {
            loadStats();
        }
    }, [isOpen, serviceId, selectedGranularity, dateRange]);

    const loadStats = async () => {
        const stats = await fetchServiceStats(
            serviceId,
            dateRange.startDate,
            dateRange.endDate,
            selectedGranularity
        );
        setStatsData(stats);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatPeriod = (period: string): string => {
        // Format period string for better display
        return period;
    };

    // Professional chart configuration
    const commonChartOptions: ChartOptions<'line' | 'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: chartTheme.text.primary,
                titleColor: chartTheme.surface,
                bodyColor: chartTheme.surface,
                borderColor: chartTheme.border,
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                titleFont: {
                    size: 14,
                    weight: 600
                },
                bodyFont: {
                    size: 13
                }
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
                    color: chartTheme.text.muted,
                    font: {
                        size: 12,
                        weight: 500
                    }
                }
            },
            y: {
                grid: {
                    color: chartTheme.border,
                    drawTicks: false
                },
                border: {
                    display: false
                },
                ticks: {
                    color: chartTheme.text.muted,
                    font: {
                        size: 12,
                        weight: 500
                    },
                    padding: 12
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        elements: {
            point: {
                radius: 0,
                hoverRadius: 6,
                borderWidth: 2
            },
            line: {
                tension: 0.3,
                borderWidth: 3
            },
            bar: {
                borderRadius: 4,
                borderSkipped: false
            }
        }
    };

    // Chart data preparation
    const revenueChartData = {
        labels: statsData?.data.map(d => formatPeriod(d.period)) || [],
        datasets: [{
            data: statsData?.data.map(d => d.revenue) || [],
            borderColor: chartTheme.primary,
            backgroundColor: chartTheme.primary + '15',
            fill: true,
            pointBackgroundColor: chartTheme.primary,
            pointBorderColor: chartTheme.surface,
            tension: 0.3
        }]
    };

    const ordersChartData = {
        labels: statsData?.data.map(d => formatPeriod(d.period)) || [],
        datasets: [{
            data: statsData?.data.map(d => d.orders) || [],
            backgroundColor: chartTheme.success + '80',
            borderColor: chartTheme.success,
            borderWidth: 1
        }]
    };

    // Calculate summary metrics
    const totalRevenue = statsData?.data.reduce((sum, d) => sum + Number(d.revenue), 0) || 0;
    const totalOrders = statsData?.data.reduce((sum, d) => sum + Number(d.orders), 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const dataPoints = statsData?.data.length || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            closeOnBackdropClick={true}
        >
            <ModalContent>
                <ModalHeader>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaChartLine />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Statystyki usługi</ModalTitle>
                            <ServiceTitle>{serviceName}</ServiceTitle>
                        </HeaderText>
                    </HeaderLeft>
                    <HeaderRight>
                        <RefreshButton onClick={loadStats} disabled={loading}>
                            <FaSync className={loading ? 'spinning' : ''} />
                        </RefreshButton>
                        <CloseButton onClick={onClose}>
                            <FaTimes />
                        </CloseButton>
                    </HeaderRight>
                </ModalHeader>

                <FiltersSection>
                    <FilterGroup>
                        <FilterLabel>Zakres dat:</FilterLabel>
                        <DateInputs>
                            <DateInput
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                            <DateSeparator>-</DateSeparator>
                            <DateInput
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </DateInputs>
                    </FilterGroup>
                    <FilterGroup>
                        <FilterLabel>Grupowanie:</FilterLabel>
                        <GranularitySelector>
                            {Object.values(TimeGranularity).map(granularity => (
                                <GranularityButton
                                    key={granularity}
                                    $active={selectedGranularity === granularity}
                                    onClick={() => setSelectedGranularity(granularity)}
                                >
                                    {granularity}
                                </GranularityButton>
                            ))}
                        </GranularitySelector>
                    </FilterGroup>
                </FiltersSection>

                {loading ? (
                    <LoadingContainer>
                        <FaSync className="spinning" />
                        <LoadingText>Ładowanie statystyk...</LoadingText>
                    </LoadingContainer>
                ) : error ? (
                    <ErrorContainer>
                        <ErrorText>{error}</ErrorText>
                    </ErrorContainer>
                ) : statsData ? (
                    <>
                        {/* Summary Cards */}
                        <SummarySection>
                            <SummaryCard>
                                <SummaryIcon $color={chartTheme.primary}>
                                    <FaCalendarAlt />
                                </SummaryIcon>
                                <SummaryContent>
                                    <SummaryValue>{formatCurrency(totalRevenue)}</SummaryValue>
                                    <SummaryLabel>Łączny przychód</SummaryLabel>
                                </SummaryContent>
                            </SummaryCard>
                            <SummaryCard>
                                <SummaryIcon $color={chartTheme.success}>
                                    <FaShoppingCart />
                                </SummaryIcon>
                                <SummaryContent>
                                    <SummaryValue>{totalOrders}</SummaryValue>
                                    <SummaryLabel>Łączna liczba zamówień</SummaryLabel>
                                </SummaryContent>
                            </SummaryCard>
                            <SummaryCard>
                                <SummaryIcon $color={chartTheme.warning}>
                                    <FaCalendarAlt />
                                </SummaryIcon>
                                <SummaryContent>
                                    <SummaryValue>{formatCurrency(avgOrderValue)}</SummaryValue>
                                    <SummaryLabel>Średnia wartość zamówienia</SummaryLabel>
                                </SummaryContent>
                            </SummaryCard>
                        </SummarySection>

                        {/* Charts */}
                        <ChartsSection>
                            <ChartContainer>
                                <ChartTitle>
                                    <ChartTitleText>Przychody w czasie</ChartTitleText>
                                    <ChartSubtitle>{dataPoints} okresów</ChartSubtitle>
                                </ChartTitle>
                                <ChartWrapper>
                                    <Line
                                        data={revenueChartData}
                                        options={{
                                            ...commonChartOptions,
                                            scales: {
                                                ...commonChartOptions.scales,
                                                y: {
                                                    ...commonChartOptions.scales?.y,
                                                    ticks: {
                                                        ...commonChartOptions.scales?.y?.ticks,
                                                        callback: function(value: any) {
                                                            return formatCurrency(Number(value));
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </ChartWrapper>
                            </ChartContainer>

                            <ChartContainer>
                                <ChartTitle>
                                    <ChartTitleText>Liczba zamówień</ChartTitleText>
                                    <ChartSubtitle>według okresów</ChartSubtitle>
                                </ChartTitle>
                                <ChartWrapper>
                                    <Bar
                                        data={ordersChartData}
                                        options={{
                                            ...commonChartOptions,
                                            scales: {
                                                ...commonChartOptions.scales,
                                                y: {
                                                    ...commonChartOptions.scales?.y,
                                                    beginAtZero: true,
                                                    ticks: {
                                                        ...commonChartOptions.scales?.y?.ticks,
                                                        stepSize: 1
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </ChartWrapper>
                            </ChartContainer>
                        </ChartsSection>
                    </>
                ) : null}
            </ModalContent>
        </Modal>
    );
};

// Styled Components
const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 85vh;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    border-bottom: 1px solid ${chartTheme.border};
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const HeaderIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${chartTheme.primary}15;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${chartTheme.primary};
    font-size: 20px;
`;

const HeaderText = styled.div``;

const ModalTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: ${chartTheme.text.primary};
    margin: 0 0 4px 0;
`;

const ServiceTitle = styled.div`
    font-size: 16px;
    color: ${chartTheme.text.secondary};
    font-weight: 500;
`;

const HeaderRight = styled.div`
    display: flex;
    gap: 8px;
`;

const RefreshButton = styled.button`
    width: 40px;
    height: 40px;
    border: 1px solid ${chartTheme.border};
    background: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${chartTheme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${chartTheme.primary}10;
        color: ${chartTheme.primary};
        border-color: ${chartTheme.primary};
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

const CloseButton = styled.button`
    width: 40px;
    height: 40px;
    border: 1px solid ${chartTheme.border};
    background: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${chartTheme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #fee2e2;
        color: #dc2626;
        border-color: #dc2626;
    }
`;

const FiltersSection = styled.div`
    display: flex;
    gap: 24px;
    padding: 20px 32px;
    background: #fafbfc;
    border-bottom: 1px solid ${chartTheme.border};
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const FilterLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${chartTheme.text.secondary};
`;

const DateInputs = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const DateInput = styled.input`
    padding: 8px 12px;
    border: 1px solid ${chartTheme.border};
    border-radius: 6px;
    font-size: 14px;
    color: ${chartTheme.text.primary};

    &:focus {
        outline: none;
        border-color: ${chartTheme.primary};
        box-shadow: 0 0 0 3px ${chartTheme.primary}15;
    }
`;

const DateSeparator = styled.span`
    color: ${chartTheme.text.muted};
    font-weight: 500;
`;

const GranularitySelector = styled.div`
    display: flex;
    border: 1px solid ${chartTheme.border};
    border-radius: 6px;
    overflow: hidden;
`;

const GranularityButton = styled.button<{ $active: boolean }>`
    padding: 8px 12px;
    border: none;
    background: ${props => props.$active ? chartTheme.primary : 'white'};
    color: ${props => props.$active ? 'white' : chartTheme.text.secondary};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:not(:last-child) {
        border-right: 1px solid ${chartTheme.border};
    }

    &:hover:not(.active) {
        background: ${chartTheme.primary}10;
        color: ${chartTheme.primary};
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    gap: 16px;
`;

const LoadingText = styled.div`
    color: ${chartTheme.text.secondary};
    font-size: 16px;
`;

const ErrorContainer = styled.div`
    padding: 40px;
    text-align: center;
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-size: 16px;
`;

const SummarySection = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 24px 32px;
    background: white;
`;

const SummaryCard = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: white;
    border: 1px solid ${chartTheme.border};
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SummaryIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
`;

const SummaryContent = styled.div`
    flex: 1;
`;

const SummaryValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: ${chartTheme.text.primary};
    line-height: 1.2;
`;

const SummaryLabel = styled.div`
    font-size: 14px;
    color: ${chartTheme.text.secondary};
    margin-top: 4px;
`;

const ChartsSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 24px 32px;
    flex: 1;
    overflow-y: auto;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const ChartContainer = styled.div`
    background: white;
    border: 1px solid ${chartTheme.border};
    border-radius: 12px;
    padding: 20px;
    min-height: 300px;
`;

const ChartTitle = styled.div`
    margin-bottom: 20px;
`;

const ChartTitleText = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${chartTheme.text.primary};
    margin: 0 0 4px 0;
`;

const ChartSubtitle = styled.div`
    font-size: 14px;
    color: ${chartTheme.text.muted};
`;

const ChartWrapper = styled.div`
    height: 250px;
    position: relative;
`;