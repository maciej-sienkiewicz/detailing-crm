// src/components/ClientAnalytics/ClientRevenueTrend.tsx
import React from 'react';
import styled from 'styled-components';
import { FaMinus, FaArrowRight } from 'react-icons/fa';
import { RevenueTrendResponse } from '../../api/clientAnalyticsApi';
import { theme } from '../../styles/theme';
import { formatCurrency, formatPercentage, getTrendInfo } from '../../utils/clientAnalyticsUtils';
import {FaArrowTrendDown, FaArrowTrendUp} from "react-icons/fa6";

interface ClientRevenueTrendProps {
    data: RevenueTrendResponse;
}

const ClientRevenueTrend: React.FC<ClientRevenueTrendProps> = ({ data }) => {
    const trendInfo = getTrendInfo(data.trendDirection);
    const isPositive = data.trendPercentage >= 0;

    // Calculate the visual representation of the trend
    const getProgressBarWidth = (): number => {
        const absPercentage = Math.abs(data.trendPercentage);
        // Cap at 100% for visual purposes
        return Math.min(absPercentage, 100);
    };

    const getTrendIcon = () => {
        if (data.trendPercentage > 5) {
            return <FaArrowTrendUp />;
        } else if (data.trendPercentage < -5) {
            return <FaArrowTrendDown />;
        } else {
            return <FaMinus />;
        }
    };

    const getTrendColor = () => {
        if (data.trendPercentage > 15) return theme.success;
        if (data.trendPercentage > 5) return '#10b981';
        if (data.trendPercentage >= -5) return theme.text.muted;
        if (data.trendPercentage >= -15) return theme.warning;
        return theme.error;
    };

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <TitleIcon $color={getTrendColor()}>
                        {getTrendIcon()}
                    </TitleIcon>
                    <TitleText>Trend przychodów</TitleText>
                    <TrendBadge $color={getTrendColor()}>
                        {trendInfo.icon} {data.trendDescription}
                    </TrendBadge>
                </SectionTitle>
                <SectionSubtitle>
                    Porównanie ostatnich 3 miesięcy z poprzednimi 3 miesiącami
                </SectionSubtitle>
            </SectionHeader>

            <TrendContent>
                {/* Revenue Comparison */}
                <RevenueComparison>
                    <PeriodCard>
                        <PeriodLabel>Poprzednie 3 miesiące</PeriodLabel>
                        <PeriodValue $isPrimary={false}>
                            {formatCurrency(data.previousRevenue)}
                        </PeriodValue>
                        <PeriodDate>Podstawa porównania</PeriodDate>
                    </PeriodCard>

                    <TrendArrow $color={getTrendColor()}>
                        <ArrowIcon>
                            <FaArrowRight />
                        </ArrowIcon>
                        <ChangeIndicator $isPositive={isPositive} $color={getTrendColor()}>
                            {isPositive ? '+' : ''}{formatPercentage(data.trendPercentage)}
                        </ChangeIndicator>
                    </TrendArrow>

                    <PeriodCard>
                        <PeriodLabel>Ostatnie 3 miesiące</PeriodLabel>
                        <PeriodValue $isPrimary={true}>
                            {formatCurrency(data.recentRevenue)}
                        </PeriodValue>
                        <PeriodDate>Aktualny okres</PeriodDate>
                    </PeriodCard>
                </RevenueComparison>
            </TrendContent>
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
    flex-wrap: wrap;
`;

const TitleIcon = styled.div<{ $color: string }>`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 18px;
`;

const TitleText = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
`;

const TrendBadge = styled.div<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    border-radius: ${theme.radius.md};
    font-size: 12px;
    font-weight: 600;
    margin-left: auto;

    @media (max-width: 768px) {
        margin-left: 0;
        margin-top: ${theme.spacing.sm};
    }
`;

const SectionSubtitle = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin-left: 48px;

    @media (max-width: 768px) {
        margin-left: 0;
    }
`;

const TrendContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

const RevenueComparison = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: ${theme.spacing.lg};
    align-items: center;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.md};
        text-align: center;
    }
`;

const PeriodCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    text-align: center;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};
    }
`;

const PeriodLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
    margin-bottom: ${theme.spacing.sm};
`;

const PeriodValue = styled.div<{ $isPrimary: boolean }>`
    font-size: 24px;
    font-weight: 700;
    color: ${props => props.$isPrimary ? theme.primary : theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const PeriodDate = styled.div`
    font-size: 11px;
    color: ${theme.text.tertiary};
    font-style: italic;
`;

const TrendArrow = styled.div<{ $color: string }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.sm};
    color: ${props => props.$color};

    @media (max-width: 768px) {
        transform: rotate(90deg);
        margin: ${theme.spacing.md} 0;
    }
`;

const ArrowIcon = styled.div`
    width: 32px;
    height: 32px;
    background: ${theme.surfaceAlt};
    border: 2px solid currentColor;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
`;

const ChangeIndicator = styled.div<{ $isPositive: boolean; $color: string }>`
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.$color};
    background: ${props => props.$color}15;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.radius.sm};
    border: 1px solid ${props => props.$color}30;
`;

const TrendVisualization = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
`;

const TrendBarContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const TrendBarLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
`;

const TrendBarWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const TrendBarBackground = styled.div`
    flex: 1;
    height: 12px;
    background: ${theme.borderLight};
    border-radius: 6px;
    overflow: hidden;
    position: relative;
`;

const TrendBarFill = styled.div<{ $width: number; $color: string; $isPositive: boolean }>`
    height: 100%;
    width: ${props => props.$width}%;
    background: linear-gradient(90deg, ${props => props.$color} 0%, ${props => props.$color}CC 100%);
    border-radius: 6px;
    transition: width 0.8s ease-out;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
`;

const TrendBarValue = styled.div<{ $color: string }>`
    font-size: 16px;
    font-weight: 700;
    color: ${props => props.$color};
    min-width: 60px;
    text-align: right;
`;

const TrendAnalysis = styled.div`
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
`;

const AnalysisTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.md};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};

    &::before {
        content: '📊';
        font-size: 14px;
    }
`;

const AnalysisContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const AnalysisItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm} 0;
    border-bottom: 1px solid ${theme.primary}10;

    &:last-child {
        border-bottom: none;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.xs};
    }
`;

const AnalysisLabel = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const AnalysisValue = styled.div<{ $color: string }>`
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$color};
    text-align: right;

    @media (max-width: 768px) {
        text-align: left;
    }
`;

export default ClientRevenueTrend;