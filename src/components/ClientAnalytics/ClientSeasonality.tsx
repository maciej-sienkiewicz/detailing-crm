// src/components/ClientAnalytics/ClientSeasonality.tsx
import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaCrown, FaChartBar } from 'react-icons/fa';
import { SeasonalityResponse } from '../../api/clientAnalyticsApi';
import { theme } from '../../styles/theme';
import { formatCurrency, formatMonthName, formatNumber } from '../../utils/clientAnalyticsUtils';

interface ClientSeasonalityProps {
    data: SeasonalityResponse;
}

const ClientSeasonality: React.FC<ClientSeasonalityProps> = ({ data }) => {
    // Find max values for scaling
    const maxVisits = Math.max(...data.monthlyData.map(m => m.visitCount));
    const maxRevenue = Math.max(...data.monthlyData.map(m => m.revenue));

    const getBarHeight = (value: number, maxValue: number): number => {
        if (maxValue === 0) return 0;
        return Math.max((value / maxValue) * 100, 2); // Minimum 2% for visibility
    };

    const getMonthColor = (monthData: any): string => {
        if (data.peakMonth && monthData.month === data.peakMonth) {
            return theme.success;
        }
        if (data.leastActiveMonth && monthData.month === data.leastActiveMonth) {
            return theme.warning;
        }
        if (monthData.visitCount === 0) {
            return theme.borderLight;
        }
        return theme.primary;
    };

    const hasSeasonalityData = data.monthlyData.some(m => m.visitCount > 0);

    if (!hasSeasonalityData) {
        return (
            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <TitleIcon>
                            <FaCalendarAlt />
                        </TitleIcon>
                        <TitleText>Sezonowość wizyt</TitleText>
                    </SectionTitle>
                </SectionHeader>

                <EmptyState>
                    <EmptyIcon>
                        <FaCalendarAlt />
                    </EmptyIcon>
                    <EmptyText>Brak danych sezonowych</EmptyText>
                    <EmptySubtext>
                        Potrzebujesz więcej danych historycznych aby zobaczyć wzorce sezonowe
                    </EmptySubtext>
                </EmptyState>
            </Section>
        );
    }

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <TitleIcon>
                        <FaCalendarAlt />
                    </TitleIcon>
                    <TitleText>Sezonowość wizyt</TitleText>
                </SectionTitle>
                <SectionSubtitle>
                    Aktywność klienta w poszczególnych miesiącach
                </SectionSubtitle>
            </SectionHeader>

            {/* Peak months summary */}
            {(data.peakMonth || data.leastActiveMonth) && (
                <SeasonalitySummary>
                    {data.peakMonth && (
                        <SummaryItem $color={theme.success}>
                            <SummaryIcon>
                                <FaCrown />
                            </SummaryIcon>
                            <SummaryContent>
                                <SummaryLabel>Najaktywniejszy miesiąc</SummaryLabel>
                                <SummaryValue>{formatMonthName(data.peakMonth)}</SummaryValue>
                            </SummaryContent>
                        </SummaryItem>
                    )}

                    {data.leastActiveMonth && (
                        <SummaryItem $color={theme.warning}>
                            <SummaryIcon>
                                <FaChartBar />
                            </SummaryIcon>
                            <SummaryContent>
                                <SummaryLabel>Najmniej aktywny</SummaryLabel>
                                <SummaryValue>{formatMonthName(data.leastActiveMonth)}</SummaryValue>
                            </SummaryContent>
                        </SummaryItem>
                    )}
                </SeasonalitySummary>
            )}

            {/* Monthly chart */}
            <ChartContainer>
                <ChartHeader>
                    <ChartTitle>Rozkład wizyt i przychodów</ChartTitle>
                    <ChartLegend>
                        <LegendItem>
                            <LegendColor $color={theme.primary} />
                            <LegendLabel>Liczba wizyt</LegendLabel>
                        </LegendItem>
                        <LegendItem>
                            <LegendColor $color={theme.info} />
                            <LegendLabel>Przychody</LegendLabel>
                        </LegendItem>
                    </ChartLegend>
                </ChartHeader>

                <ChartArea>
                    <ChartGrid>
                        {data.monthlyData.map((monthData, index) => (
                            <MonthColumn key={index}>
                                <MonthBars>
                                    {/* Visits bar */}
                                    <BarContainer>
                                        <Bar
                                            $height={getBarHeight(monthData.visitCount, maxVisits)}
                                            $color={getMonthColor(monthData)}
                                            title={`${monthData.visitCount} wizyt`}
                                        />
                                        <BarValue $visible={monthData.visitCount > 0}>
                                            {monthData.visitCount}
                                        </BarValue>
                                    </BarContainer>

                                    {/* Revenue bar */}
                                    <BarContainer>
                                        <Bar
                                            $height={getBarHeight(monthData.revenue, maxRevenue)}
                                            $color={theme.info}
                                            title={formatCurrency(monthData.revenue)}
                                        />
                                        <BarValue $visible={monthData.revenue > 0}>
                                            {formatCurrency(monthData.revenue)}
                                        </BarValue>
                                    </BarContainer>
                                </MonthBars>

                                <MonthLabel $isActive={monthData.visitCount > 0}>
                                    {formatMonthName(monthData.month).slice(0, 3)}
                                </MonthLabel>

                                {/* Special indicators */}
                                {data.peakMonth === monthData.month && (
                                    <MonthIndicator $color={theme.success}>
                                        <FaCrown />
                                    </MonthIndicator>
                                )}
                                {data.leastActiveMonth === monthData.month && monthData.visitCount > 0 && (
                                    <MonthIndicator $color={theme.warning}>
                                        ⚠️
                                    </MonthIndicator>
                                )}
                            </MonthColumn>
                        ))}
                    </ChartGrid>
                </ChartArea>
            </ChartContainer>

            {/* Detailed stats */}
            <SeasonalityStats>
                <StatsTitle>Szczegółowe statystyki</StatsTitle>
                <StatsGrid>
                    <StatItem>
                        <StatLabel>Łączne wizyty</StatLabel>
                        <StatValue>{formatNumber(data.monthlyData.reduce((sum, m) => sum + m.visitCount, 0))}</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Łączne przychody</StatLabel>
                        <StatValue>{formatCurrency(data.monthlyData.reduce((sum, m) => sum + m.revenue, 0))}</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Aktywnych miesięcy</StatLabel>
                        <StatValue>{data.monthlyData.filter(m => m.visitCount > 0).length}/12</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Średnia/miesiąc</StatLabel>
                        <StatValue>
                            {formatCurrency(data.monthlyData.reduce((sum, m) => sum + m.revenue, 0) / 12)}
                        </StatValue>
                    </StatItem>
                </StatsGrid>
            </SeasonalityStats>
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
    height: fit-content;
`;

const SectionHeader = styled.div`
    margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.sm};
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
`;

const SectionSubtitle = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    margin-left: 44px;
`;

const SeasonalitySummary = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.xl};

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SummaryItem = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    background: ${props => props.$color}10;
    border: 1px solid ${props => props.$color}30;
    border-radius: ${theme.radius.lg};
    flex: 1;
`;

const SummaryIcon = styled.div`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
`;

const SummaryContent = styled.div`
    flex: 1;
`;

const SummaryLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
`;

const SummaryValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
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
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
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
    min-height: 200px;
`;

const ChartGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: ${theme.spacing.sm};
    height: 180px;
    align-items: end;
`;

const MonthColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.sm};
    height: 100%;
    position: relative;
`;

const MonthBars = styled.div`
    display: flex;
    gap: 2px;
    height: 140px;
    align-items: end;
    flex: 1;
`;

const BarContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    height: 100%;
    width: 100%;
    position: relative;
`;

const Bar = styled.div<{ $height: number; $color: string }>`
    width: 100%;
    height: ${props => props.$height}%;
    background: linear-gradient(to top, ${props => props.$color} 0%, ${props => props.$color}CC 100%);
    border-radius: 2px 2px 0 0;
    transition: all ${theme.transitions.normal};
    cursor: pointer;
    position: relative;
    min-height: ${props => props.$height > 0 ? '4px' : '0'};

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
`;

const MonthLabel = styled.div<{ $isActive: boolean }>`
    font-size: 11px;
    color: ${props => props.$isActive ? theme.text.secondary : theme.text.muted};
    font-weight: ${props => props.$isActive ? 600 : 500};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
`;

const MonthIndicator = styled.div<{ $color: string }>`
    position: absolute;
    top: -8px;
    right: -4px;
    width: 16px;
    height: 16px;
    background: ${props => props.$color};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    box-shadow: ${theme.shadow.sm};
`;

const SeasonalityStats = styled.div`
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
`;

const StatsTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.md};
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const StatItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const StatLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
`;

const StatValue = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
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
    max-width: 300px;
    line-height: 1.4;
`;

export default ClientSeasonality;