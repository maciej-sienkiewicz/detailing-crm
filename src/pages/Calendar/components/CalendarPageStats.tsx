// src/pages/Calendar/components/CalendarPageStats.tsx - ZAKTUALIZOWANA WERSJA
import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaChartLine, FaClock, FaSignOutAlt, FaUsers, FaInfoCircle, FaSync } from 'react-icons/fa';
import { useCalendarPageContext } from '../CalendarPageProvider';
import { Tooltip } from '../../../components/common/Tooltip';
import { theme } from '../../../styles/theme';

export const CalendarPageStats: React.FC = () => {
    const { stats, actions } = useCalendarPageContext();

    const tooltipContent = {
        inProgress: "Pojazdy aktualnie znajdujące się na terenie zakładu, które są w trakcie realizacji usług detailingowych lub naprawczych.",
        today: "Liczba pojazdów zaplanowanych do przyjęcia w bieżącym dniu roboczym.",
        readyForPickup: "Pojazdy, dla których wszystkie zlecone prace zostały zakończone i oczekują na odbiór przez właściciela.",
        thisWeek: "Łączna liczba wizyt i protokołów zaplanowanych do realizacji w bieżącym tygodniu kalendarzowym.",
        cancelled: "Liczba wizyt, które były zaplanowane na poprzedni dzień roboczy, ale z różnych przyczyn nie doszły do skutku."
    };

    return (
        <StatsSection>

            <StatsGrid>
                <Tooltip text={tooltipContent.today} position="bottom">
                    <StatCard>
                        <StatIcon $color={theme.text.primary}><FaUsers /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.loading ? '...' : stats.today}</StatValue>
                            <StatLabel>Do przyjęcia dzisiaj</StatLabel>
                        </StatContent>
                        <StatTooltipIcon>
                            <FaInfoCircle />
                        </StatTooltipIcon>
                    </StatCard>
                </Tooltip>
                <Tooltip text={tooltipContent.inProgress} position="bottom">
                    <StatCard>
                        <StatIcon $color={theme.text.primary}><FaClock /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.loading ? '...' : stats.inProgress}</StatValue>
                            <StatLabel>W trakcie realizacji</StatLabel>
                        </StatContent>
                        <StatTooltipIcon>
                            <FaInfoCircle />
                        </StatTooltipIcon>
                    </StatCard>
                </Tooltip>

                <Tooltip text={tooltipContent.readyForPickup} position="bottom">
                    <StatCard>
                        <StatIcon $color={theme.text.primary}><FaClock /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.loading ? '...' : stats.readyForPickup}</StatValue>
                            <StatLabel>Oczekujące na odbiór</StatLabel>
                        </StatContent>
                        <StatTooltipIcon>
                            <FaInfoCircle />
                        </StatTooltipIcon>
                    </StatCard>
                </Tooltip>

                <Tooltip text={tooltipContent.thisWeek} position="bottom">
                    <StatCard>
                        <StatIcon $color={theme.text.primary}><FaChartLine /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.loading ? '...' : stats.thisWeek}</StatValue>
                            <StatLabel>Łącznie w tym tygodniu</StatLabel>
                        </StatContent>
                        <StatTooltipIcon>
                            <FaInfoCircle />
                        </StatTooltipIcon>
                    </StatCard>
                </Tooltip>

                <Tooltip text={tooltipContent.cancelled} position="bottom">
                    <StatCard>
                        <StatIcon $color={theme.text.primary}><FaSignOutAlt /></StatIcon>
                        <StatContent>
                            <StatValue>{stats.loading ? '...' : stats.cancelled}</StatValue>
                            <StatLabel>Wczoraj przucono</StatLabel>
                        </StatContent>
                        <StatTooltipIcon>
                            <FaInfoCircle />
                        </StatTooltipIcon>
                    </StatCard>
                </Tooltip>
            </StatsGrid>

            {stats.error && (
                <ErrorMessage>
                    ⚠️ {stats.error}
                </ErrorMessage>
            )}
        </StatsSection>
    );
};

const StatsSection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.lg} ${theme.spacing.xl} 0;

    @media (max-width: 1024px) {
        padding: ${theme.spacing.md} ${theme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.md} ${theme.spacing.md} 0;
    }
`;

const StatsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.lg};
`;

const StatsTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        color: ${theme.primary};
        border-color: ${theme.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};

    @media (max-width: 1400px) {
        grid-template-columns: repeat(3, 1fr);
        gap: ${theme.spacing.md};
    }

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        gap: ${theme.spacing.md};
    }

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
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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

const StatTooltipIcon = styled.div`
    position: absolute;
    top: ${theme.spacing.sm};
    right: ${theme.spacing.sm};
    color: ${theme.text.tertiary};
    font-size: 12px;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    ${StatCard}:hover & {
        opacity: 1;
        color: ${theme.primary};
    }
`;

const StatIcon = styled.div<{ $color: string }>`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const StatContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const StatValue = styled.div`
    font-size: 28px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
    letter-spacing: -0.025em;
    line-height: 1.1;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
`;

const ErrorMessage = styled.div`
    background: ${theme.errorBg};
    color: ${theme.error};
    padding: ${theme.spacing.md};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    text-align: center;
    margin-bottom: ${theme.spacing.lg};
`;