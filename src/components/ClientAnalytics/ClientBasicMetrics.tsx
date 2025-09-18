// src/components/ClientAnalytics/ClientBasicMetrics.tsx
import React from 'react';
import styled from 'styled-components';
import { FaMoneyBillWave, FaEye, FaCalendarCheck, FaClock } from 'react-icons/fa';
import { BasicMetricsResponse } from '../../api/clientAnalyticsApi';
import { theme } from '../../styles/theme';
import { formatCurrency, formatNumber, formatDaysAgo } from '../../utils/clientAnalyticsUtils';

interface ClientBasicMetricsProps {
    data: BasicMetricsResponse;
    compact?: boolean;
}

const ClientBasicMetrics: React.FC<ClientBasicMetricsProps> = ({ data, compact = false }) => {
    const calculateMonthlyRevenue = (): number => {
        if (data.monthsSinceFirstVisit <= 0) {
            return data.totalRevenue;
        }
        return data.totalRevenue / data.monthsSinceFirstVisit;
    };

    if (compact) {
        return (
            <CompactContainer>
                <CompactMetric>
                    <CompactValue>{formatCurrency(data.averageVisitValue)}</CompactValue>
                    <CompactLabel>Średnia wizyta</CompactLabel>
                </CompactMetric>
                <CompactDivider />
                <CompactMetric>
                    <CompactValue>{formatNumber(data.totalVisits)}</CompactValue>
                    <CompactLabel>Wizyt</CompactLabel>
                </CompactMetric>
                <CompactDivider />
                <CompactMetric>
                    <CompactValue>{formatCurrency(data.totalRevenue)}</CompactValue>
                    <CompactLabel>Łącznie</CompactLabel>
                </CompactMetric>
            </CompactContainer>
        );
    }

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <TitleIcon>
                        <FaMoneyBillWave />
                    </TitleIcon>
                    <TitleText>Kluczowe metryki</TitleText>
                </SectionTitle>
                <SectionSubtitle>
                    Podstawowe wskaźniki wydajności klienta
                </SectionSubtitle>
            </SectionHeader>

            <MetricsGrid>
                <MetricCard $color={theme.primary}>
                    <MetricIcon $color={theme.primary}>
                        <FaMoneyBillWave />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{formatCurrency(data.averageVisitValue)}</MetricValue>
                        <MetricLabel>Średnia wartość wizyty</MetricLabel>
                        <MetricSubtext>Na podstawie {formatNumber(data.totalVisits)} wizyt</MetricSubtext>
                    </MetricContent>
                </MetricCard>

                <MetricCard $color={theme.success}>
                    <MetricIcon $color={theme.success}>
                        <FaEye />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{formatNumber(data.totalVisits)}</MetricValue>
                        <MetricLabel>Całkowita liczba wizyt</MetricLabel>
                        <MetricSubtext>
                            {data.monthsSinceFirstVisit > 0
                                ? `${(data.totalVisits / data.monthsSinceFirstVisit).toFixed(1)} wizyt/miesiąc`
                                : 'Nowy klient'
                            }
                        </MetricSubtext>
                    </MetricContent>
                </MetricCard>

                <MetricCard $color={theme.info}>
                    <MetricIcon $color={theme.info}>
                        <FaCalendarCheck />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{formatCurrency(data.totalRevenue)}</MetricValue>
                        <MetricLabel>Łączne przychody</MetricLabel>
                        <MetricSubtext>
                            {formatCurrency(calculateMonthlyRevenue())}/miesiąc średnio
                        </MetricSubtext>
                    </MetricContent>
                </MetricCard>

                <MetricCard $color={data.daysSinceLastVisit && data.daysSinceLastVisit > 90 ? theme.warning : theme.text.muted}>
                    <MetricIcon $color={data.daysSinceLastVisit && data.daysSinceLastVisit > 90 ? theme.warning : theme.text.muted}>
                        <FaClock />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>
                            {data.daysSinceLastVisit ? formatDaysAgo(data.daysSinceLastVisit) : 'Brak danych'}
                        </MetricValue>
                        <MetricLabel>Ostatnia wizyta</MetricLabel>
                        <MetricSubtext>
                            {data.daysSinceLastVisit && data.daysSinceLastVisit > 90
                                ? 'Klient wymaga uwagi'
                                : data.daysSinceLastVisit && data.daysSinceLastVisit > 30
                                    ? 'Długa przerwa'
                                    : 'Aktywny klient'
                            }
                        </MetricSubtext>
                    </MetricContent>
                </MetricCard>
            </MetricsGrid>

            {/* Summary insight */}
            <SummaryInsight $hasWarning={data.daysSinceLastVisit ? data.daysSinceLastVisit > 90 : false}>
                <InsightIcon>
                    {data.daysSinceLastVisit && data.daysSinceLastVisit > 90 ? '⚠️' :
                        data.totalRevenue > data.averageVisitValue * 10 ? '⭐' : '💡'}
                </InsightIcon>
                <InsightText>
                    {data.daysSinceLastVisit && data.daysSinceLastVisit > 90
                        ? `Klient nie odwiedzał przez ${formatDaysAgo(data.daysSinceLastVisit)}. Rozważ kontakt.`
                        : data.totalRevenue > data.averageVisitValue * 10
                            ? 'To wartościowy klient z wysokimi przychodami. Warto go zatrzymać.'
                            : `Klient z ${data.monthsSinceFirstVisit > 0 ? `${data.monthsSinceFirstVisit} miesięczną` : 'nową'} historią współpracy.`
                    }
                </InsightText>
            </SummaryInsight>
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
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.sm};
`;

const TitleIcon = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 18px;
`;

const TitleText = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
`;

const SectionSubtitle = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin-left: 48px;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.xl};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.md};
    }
`;

const MetricCard = styled.div<{ $color: string }>`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    transition: all ${theme.transitions.normal};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${props => props.$color};
        opacity: 0;
        transition: opacity ${theme.transitions.normal};
    }

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};

        &::before {
            opacity: 1;
        }
    }
`;

const MetricIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.xs};
`;

const MetricContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const MetricValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.2;
    letter-spacing: -0.02em;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const MetricLabel = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 600;
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.3;
`;

const MetricSubtext = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    font-style: italic;
    line-height: 1.4;
`;

const SummaryInsight = styled.div<{ $hasWarning: boolean }>`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${props => props.$hasWarning ? '#fef2f2' : theme.primaryGhost};
    border: 1px solid ${props => props.$hasWarning ? '#fecaca' : theme.primary}20;
    border-radius: ${theme.radius.lg};
    position: relative;
`;

const InsightIcon = styled.div`
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const InsightText = styled.div`
    font-size: 14px;
    color: ${theme.text.primary};
    line-height: 1.5;
    font-weight: 500;
`;

// Compact components
const CompactContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
`;

const CompactMetric = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xs};
    min-width: 80px;
`;

const CompactValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${theme.text.primary};
    text-align: center;
    line-height: 1.2;
`;

const CompactLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
    font-weight: 500;
`;

const CompactDivider = styled.div`
    width: 1px;
    height: 32px;
    background: ${theme.border};
    flex-shrink: 0;
`;

export default ClientBasicMetrics;