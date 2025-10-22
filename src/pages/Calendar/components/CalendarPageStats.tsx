import React from 'react';
import styled from 'styled-components';
import {FaChartLine, FaClock, FaInfoCircle, FaSignOutAlt, FaUsers} from 'react-icons/fa';
import {useCalendarPageContext} from '../CalendarPageProvider';
import {Tooltip} from '../../../components/common/Tooltip';
import {theme} from '../../../styles/theme';

export const CalendarPageStats: React.FC = () => {
    const { stats } = useCalendarPageContext();

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
    padding: ${theme.spacing.md} ${theme.spacing.lg} 0;

    @media (max-width: ${theme.breakpoints.lg}) {
        padding: ${theme.spacing.sm} ${theme.spacing.md} 0;
    }

    @media (max-width: ${theme.breakpoints.md}) {
        padding: ${theme.spacing.sm} ${theme.spacing.sm} 0;
    }

    @media (max-width: ${theme.breakpoints.sm}) {
        padding: ${theme.spacing.xs} ${theme.spacing.sm} 0;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};
    align-items: stretch;

    @media (max-width: ${theme.breakpoints.xxl}) {
        gap: ${theme.spacing.sm};
    }

    @media (max-width: ${theme.breakpoints.xl}) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: ${theme.breakpoints.lg}) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${theme.spacing.sm};
    }

    @media (max-width: ${theme.breakpoints.md}) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${theme.spacing.xs};
    }

    @media (max-width: ${theme.breakpoints.sm}) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.sm};
    }
`;

const StatCard = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.md};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${theme.shadow.xs};
    position: relative;
    overflow: hidden;
    height: 100%;
    min-height: 80px;

    @media (max-width: ${theme.breakpoints.xl}) {
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        min-height: 75px;
    }

    @media (max-width: ${theme.breakpoints.lg}) {
        padding: ${theme.spacing.sm};
        min-height: 70px;
    }

    @media (max-width: ${theme.breakpoints.md}) {
        padding: ${theme.spacing.sm};
        min-height: 65px;
    }

    @media (max-width: ${theme.breakpoints.sm}) {
        padding: ${theme.spacing.md};
        min-height: 70px;
    }

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
        height: 3px;
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
    top: ${theme.spacing.xs};
    right: ${theme.spacing.xs};
    color: ${theme.text.tertiary};
    font-size: 10px;
    opacity: 0.6;
    transition: opacity 0.2s ease;

    @media (max-width: ${theme.breakpoints.sm}) {
        font-size: 9px;
        top: 6px;
        right: 6px;
    }

    ${StatCard}:hover & {
        opacity: 1;
        color: ${theme.primary};
    }
`;

const StatIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);

    @media (max-width: ${theme.breakpoints.xl}) {
        width: 36px;
        height: 36px;
        font-size: 16px;
    }

    @media (max-width: ${theme.breakpoints.lg}) {
        width: 32px;
        height: 32px;
        font-size: 14px;
    }

    @media (max-width: ${theme.breakpoints.sm}) {
        width: 36px;
        height: 36px;
        font-size: 16px;
    }
`;

const StatContent = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const StatValue = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: 2px;
    letter-spacing: -0.025em;
    line-height: 1.1;

    @media (max-width: ${theme.breakpoints.xl}) {
        font-size: 18px;
    }

    @media (max-width: ${theme.breakpoints.lg}) {
        font-size: 16px;
    }

    @media (max-width: ${theme.breakpoints.md}) {
        font-size: 16px;
    }

    @media (max-width: ${theme.breakpoints.sm}) {
        font-size: 18px;
    }
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.secondary};
    font-weight: 500;
    line-height: 1.3;

    @media (max-width: ${theme.breakpoints.xl}) {
        font-size: 10px;
    }

    @media (max-width: ${theme.breakpoints.lg}) {
        font-size: 10px;
    }

    @media (max-width: ${theme.breakpoints.sm}) {
        font-size: 11px;
    }
`;

const ErrorMessage = styled.div`
    background: ${theme.errorBg};
    color: ${theme.error};
    padding: ${theme.spacing.sm};
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    text-align: center;
    margin-bottom: ${theme.spacing.md};

    @media (max-width: ${theme.breakpoints.sm}) {
        font-size: 11px;
        padding: ${theme.spacing.xs} ${theme.spacing.sm};
    }
`;