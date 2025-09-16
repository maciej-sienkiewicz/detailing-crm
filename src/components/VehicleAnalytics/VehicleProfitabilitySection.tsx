import React from 'react';
import styled from 'styled-components';
import { FaChartLine, FaMoneyBillWave, FaMinus } from 'react-icons/fa';
import { ProfitabilityAnalysisDto } from '../../api/vehicleAnalyticsApi';
import { theme } from '../../styles/theme';
import {FaArrowTrendDown, FaArrowTrendUp} from "react-icons/fa6";

interface VehicleProfitabilitySectionProps {
    data: ProfitabilityAnalysisDto;
}

const VehicleProfitabilitySection: React.FC<VehicleProfitabilitySectionProps> = ({ data }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getTrendIcon = (changeIndicator: string) => {
        switch (changeIndicator) {
            case 'POSITIVE':
                return <FaArrowTrendUp style={{ color: theme.success }} />;
            case 'NEGATIVE':
                return <FaArrowTrendDown style={{ color: theme.error }} />;
            case 'NEUTRAL':
                return <FaMinus style={{ color: theme.text.muted }} />;
            default:
                return <FaMinus style={{ color: theme.text.muted }} />;
        }
    };

    const getTrendColor = (changeIndicator: string) => {
        switch (changeIndicator) {
            case 'POSITIVE':
                return theme.success;
            case 'NEGATIVE':
                return theme.error;
            case 'NEUTRAL':
                return theme.text.muted;
            default:
                return theme.text.muted;
        }
    };

    const getProfitabilityColor = (score: number) => {
        if (score >= 8) return theme.success;
        if (score >= 6) return theme.warning;
        if (score >= 4) return '#ff9800';
        return theme.error;
    };

    const renderStars = (score: number) => {
        const fullStars = Math.floor(score / 2);
        const hasHalfStar = score % 2 === 1;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <StarContainer>
                {Array(fullStars).fill(0).map((_, i) => (
                    <Star key={`full-${i}`} filled>⭐</Star>
                ))}
                {hasHalfStar && <Star key="half">⭐</Star>}
                {Array(emptyStars).fill(0).map((_, i) => (
                    <Star key={`empty-${i}`}>☆</Star>
                ))}
            </StarContainer>
        );
    };

    // Zabezpieczenie przed undefined values
    const averageVisitValue = data.averageVisitValue || 0;
    const monthlyRevenue = data.monthlyRevenue || 0;
    const trendPercentage = data.trendPercentage || 0;
    const profitabilityScore = data.profitabilityScore || 0;
    const trendDisplayName = data.trendDisplayName || 'Brak danych';
    const trendChangeIndicator = data.trendChangeIndicator || 'NEUTRAL';

    return (
        <Section>
            <SectionTitle>
                <FaChartLine />
                Analiza rentowności
            </SectionTitle>

            <MetricsGrid>
                <MetricCard>
                    <MetricIcon $color={theme.primary}>
                        <FaMoneyBillWave />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{formatCurrency(averageVisitValue)}</MetricValue>
                        <MetricLabel>Średnia wartość wizyty</MetricLabel>
                    </MetricContent>
                </MetricCard>

                <MetricCard>
                    <MetricIcon $color={theme.info}>
                        <FaChartLine />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{formatCurrency(monthlyRevenue)}</MetricValue>
                        <MetricLabel>Miesięczny przychód</MetricLabel>
                    </MetricContent>
                </MetricCard>

                <TrendCard>
                    <TrendIcon>
                        {getTrendIcon(trendChangeIndicator)}
                    </TrendIcon>
                    <TrendContent>
                        <TrendValue $color={getTrendColor(trendChangeIndicator)}>
                            {trendDisplayName}
                            {trendPercentage !== 0 && (
                                <span> ({trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%)</span>
                            )}
                        </TrendValue>
                        <TrendLabel>Trend przychodów</TrendLabel>
                    </TrendContent>
                </TrendCard>
            </MetricsGrid>
        </Section>
    );
};

// Styled components pozostają bez zmian...
const Section = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.xl};
    box-shadow: ${theme.shadow.sm};
    border: 1px solid ${theme.border};
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.lg} 0;
    padding-bottom: ${theme.spacing.md};
    border-bottom: 2px solid ${theme.primaryGhost};

    svg {
        color: ${theme.primary};
        font-size: 16px;
    }
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const MetricCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};
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
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.2;
`;

const MetricLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TrendCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    grid-column: 1 / -1;

    @media (max-width: 768px) {
        grid-column: auto;
    }
`;

const TrendIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.xs};
`;

const TrendContent = styled.div`
    flex: 1;
`;

const TrendValue = styled.div<{ $color: string }>`
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.$color};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.2;
`;

const TrendLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ProfitabilityCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    grid-column: 1 / -1;

    @media (max-width: 768px) {
        grid-column: auto;
    }
`;

const ProfitabilityScore = styled.div<{ $color: string }>`
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, ${props => props.$color}20 0%, ${props => props.$color}10 100%);
    border: 2px solid ${props => props.$color};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: ${props => props.$color};
    flex-shrink: 0;
`;

const ProfitabilityContent = styled.div`
    flex: 1;
`;

const ProfitabilityLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${theme.spacing.xs};
`;

const StarContainer = styled.div`
    display: flex;
    gap: 2px;
`;

const Star = styled.span<{ filled?: boolean }>`
    font-size: 14px;
    opacity: ${props => props.filled ? 1 : 0.3};
`;

export default VehicleProfitabilitySection;