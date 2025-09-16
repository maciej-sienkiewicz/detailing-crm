import React from 'react';
import styled from 'styled-components';
import { FaClock, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { VisitPatternDto } from '../../api/vehicleAnalyticsApi';
import { theme } from '../../styles/theme';

interface VehicleVisitPatternSectionProps {
    data: VisitPatternDto;
}

const VehicleVisitPatternSection: React.FC<VehicleVisitPatternSectionProps> = ({ data }) => {
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Brak danych';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getStatusColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'LOW':
                return theme.success;
            case 'MEDIUM':
                return theme.warning;
            case 'HIGH':
                return theme.error;
            case 'CRITICAL':
                return '#d32f2f';
            default:
                return theme.text.muted;
        }
    };

    const getStatusIcon = (riskLevel: string) => {
        switch (riskLevel) {
            case 'LOW':
                return <FaCheckCircle />;
            case 'MEDIUM':
                return <FaClock />;
            case 'HIGH':
            case 'CRITICAL':
                return <FaExclamationTriangle />;
            default:
                return <FaClock />;
        }
    };

    const calculateNextVisitDays = (): number | null => {
        if (!data.next_recommended_visit_date) return null;

        const nextDate = new Date(data.next_recommended_visit_date);
        const today = new Date();
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    const nextVisitDays = calculateNextVisitDays();

    return (
        <Section>
            <SectionTitle>
                <FaClock />
                Regularność wizyt
            </SectionTitle>

            <PatternGrid>
                <PatternCard>
                    <PatternIcon $color={theme.info}>
                        <FaCalendarAlt />
                    </PatternIcon>
                    <PatternContent>
                        <PatternValue>
                            {data.days_since_last_visit !== null ? `${data.days_since_last_visit} dni` : 'Brak danych'}
                        </PatternValue>
                        <PatternLabel>Ostatnia wizyta</PatternLabel>
                    </PatternContent>
                </PatternCard>

                <PatternCard>
                    <PatternIcon $color={theme.primary}>
                        <FaClock />
                    </PatternIcon>
                    <PatternContent>
                        <PatternValue>
                            {data.average_days_between_visits !== null ? `${data.average_days_between_visits} dni` : 'Brak danych'}
                        </PatternValue>
                        <PatternLabel>Średni odstęp</PatternLabel>
                    </PatternContent>
                </PatternCard>

                <StatusCard $riskLevel={data.risk_level}>
                    <StatusIcon $color={getStatusColor(data.risk_level)}>
                        {getStatusIcon(data.risk_level)}
                    </StatusIcon>
                    <StatusContent>
                        <StatusValue $color={getStatusColor(data.risk_level)}>
                            {data.regularity_display_name}
                        </StatusValue>
                        <StatusLabel>Status klienta</StatusLabel>
                    </StatusContent>
                </StatusCard>

                {data.next_recommended_visit_date && (
                    <NextVisitCard>
                        <NextVisitIcon $color={theme.success}>
                            <FaCalendarAlt />
                        </NextVisitIcon>
                        <NextVisitContent>
                            <NextVisitValue>
                                {nextVisitDays !== null && nextVisitDays > 0
                                    ? `za ${nextVisitDays} dni`
                                    : nextVisitDays !== null && nextVisitDays <= 0
                                        ? 'już teraz'
                                        : formatDate(data.next_recommended_visit_date)
                                }
                            </NextVisitValue>
                            <NextVisitLabel>Następna sugerowana</NextVisitLabel>
                        </NextVisitContent>
                    </NextVisitCard>
                )}
            </PatternGrid>
        </Section>
    );
};

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

const PatternGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const PatternCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const PatternIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 16px;
    flex-shrink: 0;
`;

const PatternContent = styled.div`
    flex: 1;
`;

const PatternValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const PatternLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatusCard = styled.div<{ $riskLevel: string }>`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    grid-column: 1 / -1;
`;

const StatusIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 16px;
    flex-shrink: 0;
`;

const StatusContent = styled.div`
    flex: 1;
`;

const StatusValue = styled.div<{ $color: string }>`
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$color};
    margin-bottom: ${theme.spacing.xs};
`;

const StatusLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const NextVisitCard = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    grid-column: 1 / -1;
`;

const NextVisitIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 16px;
    flex-shrink: 0;
`;

const NextVisitContent = styled.div`
    flex: 1;
`;

const NextVisitValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

const NextVisitLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export default VehicleVisitPatternSection;