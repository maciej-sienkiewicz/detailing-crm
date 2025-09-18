// src/components/ClientAnalytics/ClientGrowthChart.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaChartLine, FaEye, FaEuroSign, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { MonthlyRevenueResponse } from '../../api/clientAnalyticsApi';
import { theme } from '../../styles/theme';
import { formatCurrency, formatNumber, formatMonthName } from '../../utils/clientAnalyticsUtils';

interface ClientGrowthChartProps {
    data: MonthlyRevenueResponse[];
}

const ClientGrowthChart: React.FC<ClientGrowthChartProps> = ({ data }) => {
    const [showCumulative, setShowCumulative] = useState(false);
    const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

    // Filter out months with no data
    const filteredData = data.filter(month => month.revenue > 0 || month.visitCount > 0);

    if (filteredData.length === 0) {
        return (
            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <TitleIcon>
                            <FaChartLine />
                        </TitleIcon>
                        <TitleText>Wykres wzrostu klienta</TitleText>
                    </SectionTitle>
                </SectionHeader>

                <EmptyState>
                    <EmptyIcon>
                        <FaChartLine />
                    </EmptyIcon>
                    <EmptyText>Brak danych historycznych</EmptyText>
                    <EmptySubtext>
                        Potrzebujesz więcej danych aby zobaczyć wykres wzrostu w czasie
                    </EmptySubtext>
                </EmptyState>
            </Section>
        );
    }

    // Calculate scales
    const maxRevenue = Math.max(...filteredData.map(d => d.revenue));
    const maxCumulativeRevenue = Math.max(...filteredData.map(d => d.cumulativeRevenue));
    const maxVisits = Math.max(...filteredData.map(d => d.visitCount));

    const getBarHeight = (value: number, maxValue: number): number => {
        if (maxValue === 0) return 0;
        return Math.max((value / maxValue) * 100, 2);
    };

    const getDisplayValue = (month: MonthlyRevenueResponse): number => {
        return showCumulative ? month.cumulativeRevenue : month.revenue;
    };

    const getMaxDisplayValue = (): number => {
        return showCumulative ? maxCumulativeRevenue : maxRevenue;
    };

    // Calculate growth metrics
    const totalRevenue = filteredData.reduce((sum, month) => sum + month.revenue, 0);
    const totalVisits = filteredData.reduce((sum, month) => sum + month.visitCount, 0);
    const averageMonthlyRevenue = totalRevenue / filteredData.length;
    const averageMonthlyVisits = totalVisits / filteredData.length;

    // Growth rate calculation
    const firstMonth = filteredData[0];
    const lastMonth = filteredData[filteredData.length - 1];
    const growthRate = firstMonth.revenue > 0
        ? ((lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue) * 100
        : 0;

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <TitleIcon>
                        <FaChartLine />
                    </TitleIcon>
                    <TitleText>Wykres wzrostu klienta</TitleText>
                    <ChartControls>
                        <ControlToggle
                            $active={!showCumulative}
                            onClick={() => setShowCumulative(false)}
                        >
                            Miesięczne
                        </ControlToggle>
                        <ControlToggle
                            $active={showCumulative}
                            onClick={() => setShowCumulative(true)}
                        >
                            Skumulowane
                        </ControlToggle>
                    </ChartControls>
                </SectionTitle>
                <SectionSubtitle>
                    {showCumulative
                        ? 'Skumulowane przychody w czasie - widok całościowy'
                        : 'Miesięczne przychody i liczba wizyt'
                    }
                </SectionSubtitle>
            </SectionHeader>

            {/* Summary metrics */}
            <GrowthSummary>
                <SummaryMetric>
                    <SummaryIcon $color={theme.primary}>
                        <FaEuroSign />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue>{formatCurrency(totalRevenue)}</SummaryValue>
                        <SummaryLabel>Łączny przychód</SummaryLabel>
                    </SummaryContent>
                </SummaryMetric>

                <SummaryMetric>
                    <SummaryIcon $color={theme.success}>
                        <FaEye />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue>{formatNumber(totalVisits)}</SummaryValue>
                        <SummaryLabel>Łączne wizyty</SummaryLabel>
                    </SummaryContent>
                </SummaryMetric>

                <SummaryMetric>
                    <SummaryIcon $color={theme.info}>
                        <FaChartLine />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue $isPositive={growthRate >= 0}>
                            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                        </SummaryValue>
                        <SummaryLabel>Wzrost miesięczny</SummaryLabel>
                    </SummaryContent>
                </SummaryMetric>

                <SummaryMetric>
                    <SummaryIcon $color={theme.warning}>
                        <FaEuroSign />
                    </SummaryIcon>
                    <SummaryContent>
                        <SummaryValue>{formatCurrency(averageMonthlyRevenue)}</SummaryValue>
                        <SummaryLabel>Średnia/miesiąc</SummaryLabel>
                    </SummaryContent>
                </SummaryMetric>
            </GrowthSummary>

            {/* Chart */}
            <ChartContainer>
                <ChartHeader>
                    <ChartTitle>
                        {showCumulative ? 'Skumulowany wzrost przychodów' : 'Miesięczne przychody i wizyty'}
                    </ChartTitle>
                    <ChartLegend>
                        <LegendItem>
                            <LegendColor $color={theme.primary} />
                            <LegendLabel>
                                {showCumulative ? 'Skumulowane przychody' : 'Przychody miesięczne'}
                            </LegendLabel>
                        </LegendItem>
                        {!showCumulative && (
                            <LegendItem>
                                <LegendColor $color={theme.success} />
                                <LegendLabel>Liczba wizyt</LegendLabel>
                            </LegendItem>
                        )}
                    </ChartLegend>
                </ChartHeader>

                <ChartArea>
                    <ChartGrid>
                        {filteredData.map((monthData, index) => (
                            <MonthColumn
                                key={index}
                                onMouseEnter={() => setHoveredMonth(index)}
                                onMouseLeave={() => setHoveredMonth(null)}
                            >
                                <MonthBars>
                                    {/* Revenue bar */}
                                    <BarContainer>
                                        <Bar
                                            $height={getBarHeight(getDisplayValue(monthData), getMaxDisplayValue())}
                                            $color={theme.primary}
                                            $isHovered={hoveredMonth === index}
                                            title={formatCurrency(getDisplayValue(monthData))}
                                        />
                                        <BarValue $visible={getDisplayValue(monthData) > 0}>
                                            {formatCurrency(getDisplayValue(monthData))}
                                        </BarValue>
                                    </BarContainer>

                                    {/* Visits bar (only for monthly view) */}
                                    {!showCumulative && (
                                        <BarContainer>
                                            <Bar
                                                $height={getBarHeight(monthData.visitCount, maxVisits)}
                                                $color={theme.success}
                                                $isHovered={hoveredMonth === index}
                                                title={`${monthData.visitCount} wizyt`}
                                            />
                                            <BarValue $visible={monthData.visitCount > 0}>
                                                {monthData.visitCount}
                                            </BarValue>
                                        </BarContainer>
                                    )}
                                </MonthBars>

                                <MonthLabel $isActive={getDisplayValue(monthData) > 0}>
                                    {formatMonthName(monthData.month).slice(0, 3)} {monthData.year.toString().slice(-2)}
                                </MonthLabel>

                                {/* Tooltip on hover */}
                                {hoveredMonth === index && (
                                    <TooltipContainer>
                                        <Tooltip>
                                            <TooltipTitle>
                                                {formatMonthName(monthData.month)} {monthData.year}
                                            </TooltipTitle>
                                            <TooltipContent>
                                                <TooltipRow>
                                                    <TooltipLabel>Przychód:</TooltipLabel>
                                                    <TooltipValue>{formatCurrency(monthData.revenue)}</TooltipValue>
                                                </TooltipRow>
                                                <TooltipRow>
                                                    <TooltipLabel>Wizyty:</TooltipLabel>
                                                    <TooltipValue>{formatNumber(monthData.visitCount)}</TooltipValue>
                                                </TooltipRow>
                                                {showCumulative && (
                                                    <TooltipRow>
                                                        <TooltipLabel>Skumulowane:</TooltipLabel>
                                                        <TooltipValue>{formatCurrency(monthData.cumulativeRevenue)}</TooltipValue>
                                                    </TooltipRow>
                                                )}
                                                <TooltipRow>
                                                    <TooltipLabel>Średnia/wizyta:</TooltipLabel>
                                                    <TooltipValue>
                                                        {monthData.visitCount > 0
                                                            ? formatCurrency(monthData.revenue / monthData.visitCount)
                                                            : '0 zł'
                                                        }
                                                    </TooltipValue>
                                                </TooltipRow>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipContainer>
                                )}
                            </MonthColumn>
                        ))}
                    </ChartGrid>
                </ChartArea>
            </ChartContainer>

            {/* Growth insights */}
            <GrowthInsights>
                <InsightsTitle>Analiza wzrostu</InsightsTitle>
                <InsightsGrid>
                    <InsightItem>
                        <InsightLabel>Najlepszy miesiąc:</InsightLabel>
                        <InsightValue>
                            {(() => {
                                const bestMonth = filteredData.reduce((prev, current) =>
                                    current.revenue > prev.revenue ? current : prev
                                );
                                return `${formatMonthName(bestMonth.month)} ${bestMonth.year} (${formatCurrency(bestMonth.revenue)})`;
                            })()}
                        </InsightValue>
                    </InsightItem>

                    <InsightItem>
                        <InsightLabel>Najaktywniejszy miesiąc:</InsightLabel>
                        <InsightValue>
                            {(() => {
                                const mostActiveMonth = filteredData.reduce((prev, current) =>
                                    current.visitCount > prev.visitCount ? current : prev
                                );
                                return `${formatMonthName(mostActiveMonth.month)} ${mostActiveMonth.year} (${mostActiveMonth.visitCount} wizyt)`;
                            })()}
                        </InsightValue>
                    </InsightItem>

                    <InsightItem>
                        <InsightLabel>Średnia wizyta w okresie:</InsightLabel>
                        <InsightValue>
                            {formatCurrency(totalRevenue / totalVisits)}
                        </InsightValue>
                    </InsightItem>

                    <InsightItem>
                        <InsightLabel>Aktywnych miesięcy:</InsightLabel>
                        <InsightValue>
                            {filteredData.length} z {data.length}
                        </InsightValue>
                    </InsightItem>
                </InsightsGrid>
            </GrowthInsights>
        </Section>
    );
};

// ========================================================================================
// STYLED COMPONENTS
// ========================================================================================

const Section = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.xl};
    box-shadow: ${theme.shadow.sm};
    border: 1px solid ${theme.border};
`;

const SectionHeader = styled.div`
    margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.sm};
    flex-wrap: wrap;
`;

const TitleIcon = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 16px;
`;

const TitleText = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    flex: 1;
`;

const ChartControls = styled.div`
    display: flex;
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    overflow: hidden;
`;

const ControlToggle = styled.button<{ $active: boolean }>`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${props => props.$active ? theme.primary : 'transparent'};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${props => props.$active ? theme.primaryDark : theme.primary}20;
    }
`;

const SectionSubtitle = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    margin-left: 44px;
`;

const GrowthSummary = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.xl};

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.md};
    }
`;

const SummaryMetric = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};
    }
`;

const SummaryIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: ${props => props.$color}15;
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 16px;
    flex-shrink: 0;
`;

const SummaryContent = styled.div`
    flex: 1;
`;

const SummaryValue = styled.div<{ $isPositive?: boolean }>`
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.$isPositive !== undefined
    ? (props.$isPositive ? theme.success : theme.error)
    : theme.text.primary
};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

const SummaryLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
`;

const ChartContainer = styled.div`
    margin-bottom: ${theme.spacing.xl};
`;

const ChartHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.lg};
    flex-wrap: wrap;
    gap: ${theme.spacing.md};
`;

const ChartTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const ChartLegend = styled.div`
    display: flex;
    gap: ${theme.spacing.lg};
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const LegendColor = styled.div<{ $color: string }>`
    width: 12px;
    height: 12px;
    background: ${props => props.$color};
    border-radius: 2px;
`;

const LegendLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
`;

const ChartArea = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    min-height: 300px;
    overflow-x: auto;
`;

const ChartGrid = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    height: 260px;
    align-items: end;
    min-width: ${props => `${Math.max(800, 60 * 12)}px`}; // Ensure scrollable
`;

const MonthColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.sm};
    height: 100%;
    position: relative;
    flex: 1;
    min-width: 60px;
    cursor: pointer;
`;

const MonthBars = styled.div`
    display: flex;
    gap: 4px;
    height: 200px;
    align-items: end;
    flex: 1;
    width: 100%;
    justify-content: center;
`;

const BarContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    height: 100%;
    width: 100%;
    max-width: 24px;
    position: relative;
`;

const Bar = styled.div<{ $height: number; $color: string; $isHovered?: boolean }>`
    width: 100%;
    height: ${props => props.$height}%;
    background: linear-gradient(to top, ${props => props.$color} 0%, ${props => props.$color}CC 100%);
    border-radius: 2px 2px 0 0;
    transition: all ${theme.transitions.normal};
    position: relative;
    min-height: ${props => props.$height > 0 ? '4px' : '0'};
    transform: ${props => props.$isHovered ? 'scaleY(1.1)' : 'scaleY(1)'};
    filter: ${props => props.$isHovered ? 'brightness(1.1)' : 'brightness(1)'};

    &:hover {
        transform: scaleY(1.1);
        filter: brightness(1.1);
    }
`;

const BarValue = styled.div<{ $visible: boolean }>`
    font-size: 8px;
    color: ${theme.text.muted};
    font-weight: 600;
    text-align: center;
    opacity: ${props => props.$visible ? 1 : 0};
    transition: opacity ${theme.transitions.normal};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    transform: rotate(-45deg);
    transform-origin: center;
`;

const MonthLabel = styled.div<{ $isActive: boolean }>`
    font-size: 10px;
    color: ${props => props.$isActive ? theme.text.secondary : theme.text.muted};
    font-weight: ${props => props.$isActive ? 600 : 500};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
    white-space: nowrap;
`;

// Tooltip components
const TooltipContainer = styled.div`
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
`;

const Tooltip = styled.div`
    background: ${theme.text.primary};
    color: white;
    padding: ${theme.spacing.md};
    border-radius: ${theme.radius.md};
    box-shadow: ${theme.shadow.lg};
    min-width: 200px;
    font-size: 12px;

    &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: ${theme.text.primary};
    }
`;

const TooltipTitle = styled.div`
    font-weight: 700;
    margin-bottom: ${theme.spacing.sm};
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: ${theme.spacing.xs};
`;

const TooltipContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const TooltipLabel = styled.div`
    color: rgba(255,255,255,0.8);
`;

const TooltipValue = styled.div`
    font-weight: 600;
`;

const GrowthInsights = styled.div`
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
`;

const InsightsTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.md};
`;

const InsightsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const InsightItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm} 0;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.xs};
    }
`;

const InsightLabel = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const InsightValue = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${theme.text.primary};
    text-align: right;

    @media (max-width: 768px) {
        text-align: left;
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    text-align: center;
    gap: ${theme.spacing.md};
`;

const EmptyIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${theme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: ${theme.text.tertiary};
`;

const EmptyText = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.secondary};
`;

const EmptySubtext = styled.div`
    font-size: 13px;
    color: ${theme.text.muted};
    max-width: 400px;
    line-height: 1.4;
`;

export default ClientGrowthChart;