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
import { TimeGranularity, TimeGranularityLabels, ServiceStatsResponse } from '../../../api/statsApi';

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

// Unified theme
const theme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    success: '#059669',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    border: '#e2e8f0',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
    },
    shadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
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
                backgroundColor: theme.text.primary,
                titleColor: theme.surface,
                bodyColor: theme.surface,
                borderColor: theme.border,
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
                    color: theme.text.muted,
                    font: {
                        size: 12,
                        weight: 500
                    }
                }
            },
            y: {
                grid: {
                    color: theme.border,
                    drawTicks: false
                },
                border: {
                    display: false
                },
                ticks: {
                    color: theme.text.muted,
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
            borderColor: theme.primary,
            backgroundColor: theme.primary + '15',
            fill: true,
            pointBackgroundColor: theme.primary,
            pointBorderColor: theme.surface,
            tension: 0.3
        }]
    };

    const ordersChartData = {
        labels: statsData?.data.map(d => formatPeriod(d.period)) || [],
        datasets: [{
            data: statsData?.data.map(d => d.orders) || [],
            backgroundColor: theme.success + '80',
            borderColor: theme.success,
            borderWidth: 1
        }]
    };

    // Calculate summary metrics
    const totalRevenue = statsData?.data.reduce((sum, d) => sum + Number(d.revenue), 0) || 0;
    const totalOrders = statsData?.data.reduce((sum, d) => sum + Number(d.orders), 0) || 0;
    const dataPoints = statsData?.data.length || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            closeOnBackdropClick={true}
        >
            <ModalContent>
                {/* Compact Header */}
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
                </ModalHeader>

                {/* Compact Filters */}
                <FiltersSection>
                    <FilterRow>
                        <FilterGroup>
                            <FilterLabel>Okres:</FilterLabel>
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
                                        {TimeGranularityLabels[granularity]}
                                    </GranularityButton>
                                ))}
                            </GranularitySelector>
                        </FilterGroup>
                        <RefreshButton onClick={loadStats} disabled={loading}>
                            <FaSync className={loading ? 'spinning' : ''} />
                        </RefreshButton>
                    </FilterRow>
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
                        {/* Compact Summary Cards */}
                        <SummarySection>
                            <SummaryCard>
                                <SummaryIcon $color={theme.primary}>
                                    <FaCalendarAlt />
                                </SummaryIcon>
                                <SummaryContent>
                                    <SummaryValue>{formatCurrency(totalRevenue)}</SummaryValue>
                                    <SummaryLabel>Łączny przychód</SummaryLabel>
                                </SummaryContent>
                            </SummaryCard>
                            <SummaryCard>
                                <SummaryIcon $color={theme.success}>
                                    <FaShoppingCart />
                                </SummaryIcon>
                                <SummaryContent>
                                    <SummaryValue>{totalOrders}</SummaryValue>
                                    <SummaryLabel>Zamówienia ({dataPoints} okresów)</SummaryLabel>
                                </SummaryContent>
                            </SummaryCard>
                        </SummarySection>

                        {/* Charts */}
                        <ChartsSection>
                            <ChartContainer>
                                <ChartHeader>
                                    <ChartTitle>Przychody w czasie</ChartTitle>
                                </ChartHeader>
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
                                <ChartHeader>
                                    <ChartTitle>Liczba zamówień</ChartTitle>
                                </ChartHeader>
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
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-bottom: 1px solid ${theme.border};
    background: ${theme.surface};
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const HeaderIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${theme.primary}15;
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 18px;
`;

const HeaderText = styled.div``;

const ModalTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 4px 0;
`;

const ServiceTitle = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    border: 1px solid ${theme.border};
    background: ${theme.surface};
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.text.muted};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #fee2e2;
        color: #dc2626;
        border-color: #dc2626;
    }
`;

const FiltersSection = styled.div`
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    background: ${theme.surfaceAlt};
    border-bottom: 1px solid ${theme.border};
`;

const FilterRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xl};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.md};
    }
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const FilterLabel = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.secondary};
    white-space: nowrap;
`;

const DateInputs = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const DateInput = styled.input`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    font-size: 14px;
    color: ${theme.text.primary};

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}15;
    }
`;

const DateSeparator = styled.span`
    color: ${theme.text.muted};
    font-weight: 500;
    `;

const GranularitySelector = styled.div`
    display: flex;
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    overflow: hidden;
`;

const GranularityButton = styled.button<{ $active: boolean }>`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: none;
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:not(:last-child) {
        border-right: 1px solid ${theme.border};
    }

    &:hover:not([data-active="true"]) {
        background: ${theme.primary}10;
        color: ${theme.primary};
    }
`;

const RefreshButton = styled.button`
    width: 36px;
    height: 36px;
    border: 1px solid ${theme.border};
    background: ${theme.surface};
    border-radius: ${theme.radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primary}10;
        color: ${theme.primary};
        border-color: ${theme.primary};
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

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxl};
    gap: ${theme.spacing.md};

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    color: ${theme.text.secondary};
    font-size: 16px;
`;

const ErrorContainer = styled.div`
    padding: ${theme.spacing.xxl};
    text-align: center;
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-size: 16px;
`;

const SummarySection = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surface};
`;

const SummaryCard = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    box-shadow: ${theme.shadow.sm};
`;

const SummaryIcon = styled.div<{ $color: string }>`
    width: 44px;
    height: 44px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
`;

const SummaryContent = styled.div`
    flex: 1;
`;

const SummaryValue = styled.div`
    font-size: 22px;
    font-weight: 700;
    color: ${theme.text.primary};
    line-height: 1.2;
`;

const SummaryLabel = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    margin-top: ${theme.spacing.xs};
`;

const ChartsSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    flex: 1;
    overflow-y: auto;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const ChartContainer = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    min-height: 300px;
`;

const ChartHeader = styled.div`
    padding: ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.border};
    background: ${theme.surfaceAlt};
`;

const ChartTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const ChartWrapper = styled.div`
    height: 250px;
    position: relative;
    padding: ${theme.spacing.lg};
`;