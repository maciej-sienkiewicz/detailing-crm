// src/pages/Finances/components/CategoryStatsModal.tsx
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
import { FaFolder, FaSync, FaCalendarAlt, FaShoppingCart } from 'react-icons/fa';
import Modal from '../../../components/common/Modal';
import { useCategoryStats } from '../hooks/useStatsData';
import { TimeGranularity, TimeGranularityLabels, CategoryStatsResponse } from '../../../api/statsApi';

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

// Unified theme - identyczny jak w ServiceStatsModal
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

interface CategoryStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: number;
    categoryName: string;
}

// Helper functions - identyczne jak w ServiceStatsModal
const getDefaultDateRange = (granularity: TimeGranularity) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (granularity) {
        case TimeGranularity.DAILY:
        case TimeGranularity.WEEKLY:
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            return {
                startDate: firstDay.toISOString().split('T')[0],
                endDate: lastDay.toISOString().split('T')[0]
            };

        case TimeGranularity.MONTHLY:
        case TimeGranularity.QUARTERLY:
            return {
                startDate: new Date(year, 1, 1).toISOString().split('T')[0],
                endDate: new Date(year, 11, 31).toISOString().split('T')[0]
            };

        case TimeGranularity.YEARLY:
            return {
                startDate: new Date(year, 1, 1).toISOString().split('T')[0],
                endDate: new Date(year, 11, 31).toISOString().split('T')[0]
            };

        default:
            return {
                startDate: new Date(year - 1, month, 1).toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0]
            };
    }
};

const formatDateForInput = (dateStr: string, granularity: TimeGranularity): string => {
    const date = new Date(dateStr);

    switch (granularity) {
        case TimeGranularity.MONTHLY:
        case TimeGranularity.QUARTERLY:
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        case TimeGranularity.YEARLY:
            return String(date.getFullYear());

        default:
            return dateStr;
    }
};

const parseDateFromInput = (inputValue: string, granularity: TimeGranularity, isEndDate: boolean = false): string => {
    switch (granularity) {
        case TimeGranularity.MONTHLY:
        case TimeGranularity.QUARTERLY:
            const [year, month] = inputValue.split('-').map(Number);
            if (isEndDate) {
                return new Date(year, month, 0).toISOString().split('T')[0];
            } else {
                return new Date(year, month - 1, 1).toISOString().split('T')[0];
            }

        case TimeGranularity.YEARLY:
            const yearNum = Number(inputValue);
            if (isEndDate) {
                return new Date(yearNum, 11, 31).toISOString().split('T')[0];
            } else {
                return new Date(yearNum, 0, 1).toISOString().split('T')[0];
            }

        default:
            return inputValue;
    }
};

export const CategoryStatsModal: React.FC<CategoryStatsModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          categoryId,
                                                                          categoryName
                                                                      }) => {
    const { fetchCategoryStats, loading, error } = useCategoryStats();
    const [statsData, setStatsData] = useState<CategoryStatsResponse | null>(null);
    const [selectedGranularity, setSelectedGranularity] = useState<TimeGranularity>(TimeGranularity.MONTHLY);
    const [dateRange, setDateRange] = useState(() => getDefaultDateRange(TimeGranularity.MONTHLY));

    const [displayStartDate, setDisplayStartDate] = useState('');
    const [displayEndDate, setDisplayEndDate] = useState('');

    useEffect(() => {
        const newRange = getDefaultDateRange(selectedGranularity);
        setDateRange(newRange);
        setDisplayStartDate(formatDateForInput(newRange.startDate, selectedGranularity));
        setDisplayEndDate(formatDateForInput(newRange.endDate, selectedGranularity));
    }, [selectedGranularity]);

    useEffect(() => {
        if (isOpen && categoryId) {
            loadStats();
        }
    }, [isOpen, categoryId, selectedGranularity, dateRange]);

    const loadStats = async () => {
        const stats = await fetchCategoryStats(
            categoryId,
            dateRange.startDate,
            dateRange.endDate,
            selectedGranularity
        );
        setStatsData(stats);
    };

    const handleStartDateChange = (value: string) => {
        setDisplayStartDate(value);
        const actualStartDate = parseDateFromInput(value, selectedGranularity, false);
        setDateRange(prev => ({ ...prev, startDate: actualStartDate }));
    };

    const handleEndDateChange = (value: string) => {
        setDisplayEndDate(value);
        const actualEndDate = parseDateFromInput(value, selectedGranularity, true);
        setDateRange(prev => ({ ...prev, endDate: actualEndDate }));
    };

    const getInputType = (granularity: TimeGranularity): string => {
        switch (granularity) {
            case TimeGranularity.MONTHLY:
            case TimeGranularity.QUARTERLY:
                return 'month';
            case TimeGranularity.YEARLY:
                return 'number';
            default:
                return 'date';
        }
    };

    const getInputProps = (granularity: TimeGranularity) => {
        if (granularity === TimeGranularity.YEARLY) {
            return {
                min: 2020,
                max: new Date().getFullYear() + 1,
                step: 1
            };
        }
        return {};
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

    const totalRevenue = statsData?.data.reduce((sum, d) => sum + Number(d.revenue), 0) || 0;
    const totalOrders = statsData?.data.reduce((sum, d) => sum + Number(d.orders), 0) || 0;
    const dataPoints = statsData?.data.length || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            closeOnBackdropClick={true}
            showCloseButton={false}
        >
            <ModalContent>
                {/* Professional Header - tylko jeden przycisk zamknięcia */}
                <ModalHeader>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaFolder />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Statystyki kategorii</ModalTitle>
                            <CategoryTitle>{categoryName}</CategoryTitle>
                        </HeaderText>
                    </HeaderLeft>
                    <HeaderRight>
                        <RefreshButton onClick={loadStats} disabled={loading} title="Odśwież dane">
                            <FaSync className={loading ? 'spinning' : ''} />
                        </RefreshButton>
                        <CloseButton onClick={onClose} title="Zamknij">
                            ✕
                        </CloseButton>
                    </HeaderRight>
                </ModalHeader>

                {/* Smooth Filters - stała wysokość, bez przeskoków */}
                <FiltersSection>
                    <FilterRow>
                        <FilterGroup>
                            <FilterLabel>Okres:</FilterLabel>
                            <DateInputsContainer>
                                {selectedGranularity === TimeGranularity.YEARLY ? (
                                    <YearInputsWrapper>
                                        <YearInput
                                            type="number"
                                            value={displayStartDate}
                                            onChange={(e) => handleStartDateChange(e.target.value)}
                                            placeholder="Od"
                                            {...getInputProps(selectedGranularity)}
                                        />
                                        <DateSeparator>-</DateSeparator>
                                        <YearInput
                                            type="number"
                                            value={displayEndDate}
                                            onChange={(e) => handleEndDateChange(e.target.value)}
                                            placeholder="Do"
                                            {...getInputProps(selectedGranularity)}
                                        />
                                    </YearInputsWrapper>
                                ) : (
                                    <DateInputsWrapper>
                                        <DateInput
                                            type={getInputType(selectedGranularity)}
                                            value={displayStartDate}
                                            onChange={(e) => handleStartDateChange(e.target.value)}
                                        />
                                        <DateSeparator>-</DateSeparator>
                                        <DateInput
                                            type={getInputType(selectedGranularity)}
                                            value={displayEndDate}
                                            onChange={(e) => handleEndDateChange(e.target.value)}
                                        />
                                    </DateInputsWrapper>
                                )}
                            </DateInputsContainer>
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
                    </FilterRow>
                </FiltersSection>

                {loading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie statystyk kategorii...</LoadingText>
                    </LoadingContainer>
                ) : error ? (
                    <ErrorContainer>
                        <ErrorText>{error}</ErrorText>
                    </ErrorContainer>
                ) : statsData ? (
                    <>
                        <SummarySection>
                            <SummaryCard>
                                <SummaryIcon $color={theme.primary}>
                                    <FaCalendarAlt />
                                </SummaryIcon>
                                <SummaryContent>
                                    <SummaryValue>{formatCurrency(totalRevenue)}</SummaryValue>
                                    <SummaryLabel>Łączny przychód kategorii</SummaryLabel>
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

                        <ChartsSection>
                            <ChartContainer>
                                <ChartHeader>
                                    <ChartTitle>Przychody kategorii w czasie</ChartTitle>
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
                                    <ChartTitle>Zamówienia kategorii</ChartTitle>
                                </ChartHeader>
                                <ChartWrapper>
                                    <Bar
                                        data={ordersChartData}
                                        options={{
                                            ...commonChartOptions,
                                            scales: {
                                                ...commonChartOptions.scales,
                                                y: {
                                                    type: 'linear', // Wymuś liniową skalę numeryczną
                                                    min: 0,
                                                    ticks: {
                                                        ...commonChartOptions.scales?.y?.ticks,
                                                        maxTicksLimit: 10,
                                                        precision: 0
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

// Styled Components - identyczne jak w ServiceStatsModal dla spójności
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
    flex-shrink: 0;
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

const CategoryTitle = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
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

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    border: 1px solid ${theme.border};
    background: ${theme.surface};
    border-radius: ${theme.radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.text.muted};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 18px;
    font-weight: 400;

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
    min-height: 80px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
`;

const FilterRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xl};
    width: 100%;

    @media (max-width: 1024px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.lg};
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
    min-width: 50px;
`;

const DateInputsContainer = styled.div`
    min-width: 300px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
`;

const DateInputsWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    transition: all 0.3s ease;
`;

const YearInputsWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    transition: all 0.3s ease;
`;

const DateInput = styled.input`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    font-size: 14px;
    color: ${theme.text.primary};
    width: 140px;
    height: 40px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}15;
    }
`;

const YearInput = styled.input`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    font-size: 14px;
    color: ${theme.text.primary};
    width: 100px;
    height: 40px;
    text-align: center;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}15;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    &[type=number] {
        -moz-appearance: textfield;
    }
`;

const DateSeparator = styled.span`
    color: ${theme.text.muted};
    font-weight: 500;
    font-size: 16px;
    margin: 0 4px;
`;

const GranularitySelector = styled.div`
    display: flex;
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    overflow: hidden;
    height: 40px;
`;

const GranularityButton = styled.button<{ $active: boolean }>`
    padding: 0 ${theme.spacing.md};
    border: none;
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    height: 38px;
    display: flex;
    align-items: center;

    &:not(:last-child) {
        border-right: 1px solid ${theme.border};
    }

    &:hover:not([data-active="true"]) {
        background: ${theme.primary}10;
        color: ${theme.primary};
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxl};
    gap: ${theme.spacing.lg};
    flex: 1;
`;

const LoadingSpinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid ${theme.border};
    border-top: 3px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

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
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
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
    flex-shrink: 0;
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
    flex-shrink: 0;
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
    min-height: 0;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const ChartContainer = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 320px;
`;

const ChartHeader = styled.div`
    padding: ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.border};
    background: ${theme.surfaceAlt};
    flex-shrink: 0;
`;

const ChartTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const ChartWrapper = styled.div`
    flex: 1;
    padding: ${theme.spacing.lg};
    position: relative;
    min-height: 250px;
`;