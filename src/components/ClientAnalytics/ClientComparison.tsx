// src/components/ClientAnalytics/ClientComparison.tsx
import React from 'react';
import styled from 'styled-components';
import { FaBalanceScale, FaChartLine, FaTrophy, FaExclamationTriangle } from 'react-icons/fa';
import { ClientComparisonResponse } from '../../api/clientAnalyticsApi';
import { theme } from '../../styles/theme';
import { formatCurrency, formatPercentage, formatNumber, getPerformanceInfo, getClientScoreInfo } from '../../utils/clientAnalyticsUtils';

interface ClientComparisonProps {
    data: ClientComparisonResponse;
    compact?: boolean;
}

const ClientComparison: React.FC<ClientComparisonProps> = ({ data, compact = false }) => {
    const scoreInfo = getClientScoreInfo(data.overallScore);

    if (compact) {
        return (
            <CompactContainer>
                <CompactScore $color={scoreInfo.color} $bgColor={scoreInfo.backgroundColor}>
                    {scoreInfo.label}
                </CompactScore>
                <CompactMetrics>
                    <CompactMetric>
                        <CompactValue $isPositive={data.visitValueComparison.percentageDifference >= 0}>
                            {data.visitValueComparison.percentageDifference >= 0 ? '+' : ''}
                            {formatPercentage(data.visitValueComparison.percentageDifference)}
                        </CompactValue>
                        <CompactLabel>vs średnia</CompactLabel>
                    </CompactMetric>
                </CompactMetrics>
            </CompactContainer>
        );
    }

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <TitleIcon>
                        <FaBalanceScale />
                    </TitleIcon>
                    <TitleText>Porównanie z firmą</TitleText>
                    <ClientScoreBadge $color={scoreInfo.color} $bgColor={scoreInfo.backgroundColor}>
                        <ScoreIcon>
                            {data.overallScore === 'VIP' && <FaTrophy />}
                            {data.overallScore === 'AT_RISK' && <FaExclamationTriangle />}
                            {!['VIP', 'AT_RISK'].includes(data.overallScore) && <FaChartLine />}
                        </ScoreIcon>
                        <ScoreText>{scoreInfo.label}</ScoreText>
                    </ClientScoreBadge>
                </SectionTitle>
                <SectionSubtitle>
                    {scoreInfo.description}
                </SectionSubtitle>
            </SectionHeader>

            <ComparisonGrid>
                {/* Visit Value Comparison */}
                <ComparisonCard>
                    <ComparisonHeader>
                        <ComparisonTitle>Wartość wizyty</ComparisonTitle>
                        <PerformanceBadge $level={data.visitValueComparison.performanceLevel}>
                            {getPerformanceInfo(data.visitValueComparison.performanceLevel).icon}
                            {getPerformanceInfo(data.visitValueComparison.performanceLevel).label}
                        </PerformanceBadge>
                    </ComparisonHeader>

                    <ComparisonValues>
                        <ValueRow>
                            <ValueLabel>Klient</ValueLabel>
                            <ValueAmount $isPrimary={true}>
                                {formatCurrency(data.visitValueComparison.clientValue)}
                            </ValueAmount>
                        </ValueRow>
                        <ValueRow>
                            <ValueLabel>Średnia firmowa</ValueLabel>
                            <ValueAmount $isPrimary={false}>
                                {formatCurrency(data.visitValueComparison.companyAverage)}
                            </ValueAmount>
                        </ValueRow>
                    </ComparisonValues>

                    <ComparisonDifference $isPositive={data.visitValueComparison.percentageDifference >= 0}>
                        <DifferenceIcon>
                            {data.visitValueComparison.percentageDifference >= 0 ? '📈' : '📉'}
                        </DifferenceIcon>
                        <DifferenceText>
                            {data.visitValueComparison.percentageDifference >= 0 ? '+' : ''}
                            {formatPercentage(data.visitValueComparison.percentageDifference)} vs średnia
                        </DifferenceText>
                    </ComparisonDifference>
                </ComparisonCard>

                {/* Monthly Revenue Comparison */}
                <ComparisonCard>
                    <ComparisonHeader>
                        <ComparisonTitle>Miesięczny przychód</ComparisonTitle>
                        <PerformanceBadge $level={data.monthlyRevenueComparison.performanceLevel}>
                            {getPerformanceInfo(data.monthlyRevenueComparison.performanceLevel).icon}
                            {getPerformanceInfo(data.monthlyRevenueComparison.performanceLevel).label}
                        </PerformanceBadge>
                    </ComparisonHeader>

                    <ComparisonValues>
                        <ValueRow>
                            <ValueLabel>Klient</ValueLabel>
                            <ValueAmount $isPrimary={true}>
                                {formatCurrency(data.monthlyRevenueComparison.clientValue)}
                            </ValueAmount>
                        </ValueRow>
                        <ValueRow>
                            <ValueLabel>Średnia firmowa</ValueLabel>
                            <ValueAmount $isPrimary={false}>
                                {formatCurrency(data.monthlyRevenueComparison.companyAverage)}
                            </ValueAmount>
                        </ValueRow>
                    </ComparisonValues>

                    <ComparisonDifference $isPositive={data.monthlyRevenueComparison.percentageDifference >= 0}>
                        <DifferenceIcon>
                            {data.monthlyRevenueComparison.percentageDifference >= 0 ? '💰' : '💸'}
                        </DifferenceIcon>
                        <DifferenceText>
                            {data.monthlyRevenueComparison.percentageDifference >= 0 ? '+' : ''}
                            {formatPercentage(data.monthlyRevenueComparison.percentageDifference)} vs średnia
                        </DifferenceText>
                    </ComparisonDifference>
                </ComparisonCard>

                {/* Visits Frequency Comparison */}
                <ComparisonCard>
                    <ComparisonHeader>
                        <ComparisonTitle>Częstotliwość wizyt</ComparisonTitle>
                        <PerformanceBadge $level={data.visitsFrequencyComparison.performanceLevel}>
                            {getPerformanceInfo(data.visitsFrequencyComparison.performanceLevel).icon}
                            {getPerformanceInfo(data.visitsFrequencyComparison.performanceLevel).label}
                        </PerformanceBadge>
                    </ComparisonHeader>

                    <ComparisonValues>
                        <ValueRow>
                            <ValueLabel>Klient</ValueLabel>
                            <ValueAmount $isPrimary={true}>
                                {formatNumber(data.visitsFrequencyComparison.clientValue)}/mies.
                            </ValueAmount>
                        </ValueRow>
                        <ValueRow>
                            <ValueLabel>Średnia firmowa</ValueLabel>
                            <ValueAmount $isPrimary={false}>
                                {formatNumber(data.visitsFrequencyComparison.companyAverage)}/mies.
                            </ValueAmount>
                        </ValueRow>
                    </ComparisonValues>

                    <ComparisonDifference $isPositive={data.visitsFrequencyComparison.percentageDifference >= 0}>
                        <DifferenceIcon>
                            {data.visitsFrequencyComparison.percentageDifference >= 0 ? '⏰' : '🕘'}
                        </DifferenceIcon>
                        <DifferenceText>
                            {data.visitsFrequencyComparison.percentageDifference >= 0 ? '+' : ''}
                            {formatPercentage(data.visitsFrequencyComparison.percentageDifference)} vs średnia
                        </DifferenceText>
                    </ComparisonDifference>
                </ComparisonCard>

                {/* Lifespan Comparison */}
                <ComparisonCard>
                    <ComparisonHeader>
                        <ComparisonTitle>Długość współpracy</ComparisonTitle>
                        <PerformanceBadge $level={data.lifespanComparison.performanceLevel}>
                            {getPerformanceInfo(data.lifespanComparison.performanceLevel).icon}
                            {getPerformanceInfo(data.lifespanComparison.performanceLevel).label}
                        </PerformanceBadge>
                    </ComparisonHeader>

                    <ComparisonValues>
                        <ValueRow>
                            <ValueLabel>Klient</ValueLabel>
                            <ValueAmount $isPrimary={true}>
                                {formatNumber(data.lifespanComparison.clientValue)} mies.
                            </ValueAmount>
                        </ValueRow>
                        <ValueRow>
                            <ValueLabel>Średnia firmowa</ValueLabel>
                            <ValueAmount $isPrimary={false}>
                                {formatNumber(data.lifespanComparison.companyAverage)} mies.
                            </ValueAmount>
                        </ValueRow>
                    </ComparisonValues>

                    <ComparisonDifference $isPositive={data.lifespanComparison.percentageDifference >= 0}>
                        <DifferenceIcon>
                            {data.lifespanComparison.percentageDifference >= 0 ? '🤝' : '👋'}
                        </DifferenceIcon>
                        <DifferenceText>
                            {data.lifespanComparison.percentageDifference >= 0 ? '+' : ''}
                            {formatPercentage(data.lifespanComparison.percentageDifference)} vs średnia
                        </DifferenceText>
                    </ComparisonDifference>
                </ComparisonCard>
            </ComparisonGrid>

            {/* Overall insight */}
            <OverallInsight $scoreType={data.overallScore}>
                <InsightIcon>
                    {scoreInfo.priority >= 4 ? '⭐' : scoreInfo.priority >= 3 ? '👍' : scoreInfo.priority >= 2 ? '⚠️' : '🚨'}
                </InsightIcon>
                <InsightContent>
                    <InsightTitle>Ocena ogólna: {scoreInfo.label}</InsightTitle>
                    <InsightText>{data.scoreDescription}</InsightText>
                    <InsightRecommendation>
                        {data.overallScore === 'VIP' && 'Zapewnij najwyższą jakość obsługi i rozważ programy lojalnościowe.'}
                        {data.overallScore === 'HIGH_VALUE' && 'Doskonały klient - warto inwestować w długotrwałą relację.'}
                        {data.overallScore === 'AVERAGE' && 'Solidny klient - rozważ akcje zwiększające wartość wizyt.'}
                        {data.overallScore === 'LOW_VALUE' && 'Przeanalizuj potrzeby klienta i dostosuj ofertę.'}
                        {data.overallScore === 'AT_RISK' && 'Natychmiastowy kontakt i analiza przyczyn spadku aktywności.'}
                    </InsightRecommendation>
                </InsightContent>
            </OverallInsight>
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

const ClientScoreBadge = styled.div<{ $color: string; $bgColor: string }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${props => props.$bgColor};
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    border-radius: ${theme.radius.md};
    font-size: 12px;
    font-weight: 700;
    box-shadow: ${theme.shadow.sm};
`;

const ScoreIcon = styled.div`
    font-size: 12px;
`;

const ScoreText = styled.span`
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const SectionSubtitle = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    margin-left: 44px;
    font-style: italic;
`;

const ComparisonGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.xl};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.md};
    }
`;

const ComparisonCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};
    }
`;

const ComparisonHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.md};
    gap: ${theme.spacing.sm};
`;

const ComparisonTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const PerformanceBadge = styled.div<{ $level: string }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: 2px ${theme.spacing.xs};
    background: ${props => getPerformanceInfo(props.$level).color}15;
    color: ${props => getPerformanceInfo(props.$level).color};
    border-radius: ${theme.radius.sm};
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

const ComparisonValues = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.md};
`;

const ValueRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ValueLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
`;

const ValueAmount = styled.div<{ $isPrimary: boolean }>`
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.$isPrimary ? theme.primary : theme.text.primary};
`;

const ComparisonDifference = styled.div<{ $isPositive: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm};
    background: ${props => props.$isPositive ? theme.success + '10' : theme.error + '10'};
    border: 1px solid ${props => props.$isPositive ? theme.success + '30' : theme.error + '30'};
    border-radius: ${theme.radius.sm};
`;

const DifferenceIcon = styled.div`
    font-size: 14px;
`;

const DifferenceText = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const OverallInsight = styled.div<{ $scoreType: string }>`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
    background: ${props => {
    if (props.$scoreType === 'AT_RISK') return '#dc262630';
    return theme.border;
}};
    border-radius: ${theme.radius.lg};
`;

const InsightIcon = styled.div`
    font-size: 24px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const InsightContent = styled.div`
    flex: 1;
`;

const InsightTitle = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const InsightText = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.5;
    margin-bottom: ${theme.spacing.sm};
`;

const InsightRecommendation = styled.div`
    font-size: 13px;
    color: ${theme.text.primary};
    background: white;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radius.sm};
    border: 1px solid ${theme.border};
    font-weight: 500;
    line-height: 1.4;
`;

// Compact components
const CompactContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
`;

const CompactScore = styled.div<{ $color: string; $bgColor: string }>`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => props.$bgColor};
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    border-radius: ${theme.radius.sm};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CompactMetrics = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const CompactMetric = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
`;

const CompactValue = styled.div<{ $isPositive: boolean }>`
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.$isPositive ? theme.success : theme.error};
`;

const CompactLabel = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export default ClientComparison;