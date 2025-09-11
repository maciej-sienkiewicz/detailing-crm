import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaMoneyBillWave, FaTools } from 'react-icons/fa';
import { Section, SectionTitle } from './VehicleDetailStyles';
import {VehicleStatistics} from "../../../../types";
import {theme} from "../../../../styles/theme";

interface VehicleStatisticsSectionProps {
    stats: VehicleStatistics;
    lastServiceDate?: string;
}

const VehicleStatisticsSection: React.FC<VehicleStatisticsSectionProps> = ({
                                                                               stats,
                                                                               lastServiceDate
                                                                           }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Brak danych';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <Section>
            <SectionTitle>
                <FaTools />
                Statystyki serwisowe
            </SectionTitle>

            <MetricsGrid>
                <MetricCard>
                    <MetricIcon $color={theme.info}>
                        <FaTools />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{stats.servicesNo}</MetricValue>
                        <MetricLabel>Liczba usług</MetricLabel>
                    </MetricContent>
                </MetricCard>

                <MetricCard>
                    <MetricIcon $color={theme.success}>
                        <FaMoneyBillWave />
                    </MetricIcon>
                    <MetricContent>
                        <MetricValue>{formatCurrency(stats.totalRevenue)}</MetricValue>
                        <MetricLabel>Suma przychodów</MetricLabel>
                    </MetricContent>
                </MetricCard>

                {lastServiceDate && (
                    <MetricCard $fullWidth>
                        <MetricIcon $color={theme.warning}>
                            <FaCalendarAlt />
                        </MetricIcon>
                        <MetricContent>
                            <MetricValue>{formatDate(lastServiceDate)}</MetricValue>
                            <MetricLabel>Ostatnia usługa</MetricLabel>
                        </MetricContent>
                    </MetricCard>
                )}
            </MetricsGrid>
        </Section>
    );
};

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const MetricCard = styled.div<{ $fullWidth?: boolean }>`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    transition: all ${theme.transitions.normal};

    ${props => props.$fullWidth && `
        grid-column: 1 / -1;
    `}

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary};
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

export default VehicleStatisticsSection;