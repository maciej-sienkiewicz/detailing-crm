import React from 'react';
import styled from 'styled-components';
import { FaMoneyBillWave, FaWrench, FaClock, FaCalendarCheck } from 'react-icons/fa';
import { theme } from '../../styles/theme';

interface VehicleBasicMetricsSectionProps {
    data: {
        // Dane po konwersji camelCase z API
        averageVisitValue: number;
        monthlyRevenue: number;
        trendPercentage?: number;
        trendDisplayName?: string;
        trendChangeIndicator?: string;
        profitabilityScore?: number;
        // Dodatkowe pola przekazywane z komponentu nadrzędnego
        totalServices?: number;
        totalRevenue?: number;
        daysSinceLastService?: number;
        lastServiceDate?: string;
    };
    compact?: boolean;
}

const VehicleBasicMetricsSection: React.FC<VehicleBasicMetricsSectionProps> = ({ data, compact = false }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatNumber = (value: number): string => {
        return new Intl.NumberFormat('pl-PL').format(value || 0);
    };

    const formatDaysAgo = (days: number): string => {
        if (days === 0) return 'Dzisiaj';
        if (days === 1) return 'Wczoraj';
        if (days < 7) return `${days} dni temu`;
        if (days < 30) return `${Math.floor(days / 7)} tyg. temu`;
        if (days < 365) return `${Math.floor(days / 30)} mies. temu`;
        return `${Math.floor(days / 365)} lat temu`;
    };

    const calculateDaysAgo = (dateString: string): number => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Zabezpieczenie przed undefined values - używamy danych po konwersji camelCase
    const averageVisitValue = data.averageVisitValue || 0;
    const monthlyRevenue = data.monthlyRevenue || 0;
    const totalServices = data.totalServices || 0;
    const totalRevenue = data.totalRevenue || (monthlyRevenue * 12);
    const daysSinceLastService = data.daysSinceLastService;
    const lastServiceDate = data.lastServiceDate;

    if (compact) {
        return (
            <CompactContainer>
                <CompactMetric>
                    <CompactValue>{formatCurrency(averageVisitValue)}</CompactValue>
                    <CompactLabel>Średnia wizyta</CompactLabel>
                </CompactMetric>
                <CompactDivider />
                <CompactMetric>
                    <CompactValue>{formatNumber(totalServices)}</CompactValue>
                    <CompactLabel>Wizyt</CompactLabel>
                </CompactMetric>
                <CompactDivider />
                <CompactMetric>
                    <CompactValue>{formatCurrency(totalRevenue)}</CompactValue>
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
                    <TitleText>Kluczowe metryki pojazdu</TitleText>
                </SectionTitle>
                <SectionSubtitle>
                    Podstawowe wskaźniki finansowe i użytkowania - identyczne jak u klientów
                </SectionSubtitle>
            </SectionHeader>

            <MetricsGrid>
                <MetricCard $color={theme.primary}>
                    <MetricIcon $color={theme.primary}>
                        <FaMoneyBillWave />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{formatCurrency(averageVisitValue)}</MetricValue>
                        <MetricLabel>Średnia wartość wizyty</MetricLabel>
                        <MetricSubtext>Na podstawie historii wizyt serwisowych</MetricSubtext>
                    </MetricContent>
                </MetricCard>

                <MetricCard $color={theme.success}>
                    <MetricIcon $color={theme.success}>
                        <FaWrench />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{formatNumber(totalServices)}</MetricValue>
                        <MetricLabel>Całkowita liczba wizyt</MetricLabel>
                        <MetricSubtext>
                            {totalServices > 0
                                ? `${(totalRevenue / totalServices).toFixed(0)} zł/wizyta średnio`
                                : 'Nowy pojazd w serwisie'
                            }
                        </MetricSubtext>
                    </MetricContent>
                </MetricCard>

                <MetricCard $color={theme.info}>
                    <MetricIcon $color={theme.info}>
                        <FaCalendarCheck />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{formatCurrency(totalRevenue)}</MetricValue>
                        <MetricLabel>Łączne przychody</MetricLabel>
                        <MetricSubtext>
                            {formatCurrency(monthlyRevenue)}/miesiąc średnio
                        </MetricSubtext>
                    </MetricContent>
                </MetricCard>

                <MetricCard $color={daysSinceLastService !== undefined && daysSinceLastService > 90 ? theme.warning : theme.text.muted}>
                    <MetricIcon $color={daysSinceLastService !== undefined && daysSinceLastService > 90 ? theme.warning : theme.text.muted}>
                        <FaClock />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>
                            {daysSinceLastService !== undefined
                                ? formatDaysAgo(daysSinceLastService)
                                : lastServiceDate
                                    ? formatDaysAgo(calculateDaysAgo(lastServiceDate))
                                    : 'Brak danych'}
                        </MetricValue>
                        <MetricLabel>Ostatnia wizyta</MetricLabel>
                        <MetricSubtext>
                            {daysSinceLastService !== undefined
                                ? daysSinceLastService > 90
                                    ? 'Pojazd wymaga uwagi'
                                    : daysSinceLastService > 30
                                        ? 'Długa przerwa w serwisie'
                                        : 'Regularny serwis'
                                : 'Brak informacji o wizytach'
                            }
                        </MetricSubtext>
                    </MetricContent>
                </MetricCard>
            </MetricsGrid>
        </Section>
    );
};

// ========================================================================================
// STYLED COMPONENTS - Identyczne jak w ClientBasicMetrics
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

// Compact components - identyczne jak w ClientBasicMetrics
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

export default VehicleBasicMetricsSection;