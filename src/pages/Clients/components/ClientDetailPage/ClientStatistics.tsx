import React from 'react';
import { FaChartLine, FaEye, FaEuroSign, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { Section, SectionTitle } from './ClientDetailStyles';
import styled from 'styled-components';
import { theme } from "../../../../styles/theme";
import { ClientExpanded } from '../../../../types';

interface ClientStatisticsProps {
    client: ClientExpanded;
}

const ClientStatistics: React.FC<ClientStatisticsProps> = ({ client }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    return (
        <Section>
            <SectionTitle>
                <FaChartLine />
                Statystyki klienta
            </SectionTitle>

            <StatsGrid>
                <StatCard>
                    <StatIcon color={theme.status.success}>
                        <FaEye />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{client.totalVisits}</StatValue>
                        <StatLabel>Wizyt w sumie</StatLabel>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon color={theme.status.success}>
                        <FaEuroSign />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{formatCurrency(client.totalRevenue)}</StatValue>
                        <StatLabel>Całkowite przychody</StatLabel>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon color={theme.status.errorLight}>
                        <FaPhone />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{client.contactAttempts}</StatValue>
                        <StatLabel>Próby kontaktu</StatLabel>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon color={theme.primary}>
                        <FaCalendarAlt />
                    </StatIcon>
                    <StatContent>
                        <StatValue>
                            {client.lastVisitDate
                                ? new Date(client.lastVisitDate).toLocaleDateString('pl-PL')
                                : 'Brak'
                            }
                        </StatValue>
                        <StatLabel>Ostatnia wizyta</StatLabel>
                    </StatContent>
                </StatCard>
            </StatsGrid>
        </Section>
    );
};

// Styled components...
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.md};
    }
`;

const StatCard = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    transition: all ${theme.transitions.normal};
    box-shadow: ${theme.shadow.xs};
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.lg};
        border-color: ${theme.primary};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    &:hover::before {
        opacity: 1;
    }
`;

const StatIcon = styled.div<{ color: string }>`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${props => props.color}15 0%, ${props => props.color}08 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.color};
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const StatContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const StatValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
    letter-spacing: -0.025em;
    line-height: 1.1;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
`;

export default ClientStatistics;