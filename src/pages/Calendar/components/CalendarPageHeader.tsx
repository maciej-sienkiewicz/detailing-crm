// src/pages/Calendar/components/CalendarPageHeader.tsx
import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaPlus } from 'react-icons/fa';
import { useCalendarPageContext } from '../CalendarPageProvider';
import { theme } from '../../../styles/theme';

export const CalendarPageHeader: React.FC = () => {
    const { actions } = useCalendarPageContext();

    return (
        <HeaderContainer>
            <PageHeader>
                <HeaderLeft>
                    <HeaderTitle>
                        <TitleIcon>
                            <FaCalendarAlt />
                        </TitleIcon>
                        <TitleContent>
                            <MainTitle>Kalendarz wizyt</MainTitle>
                            <Subtitle>Zarządzanie terminami i protokołami</Subtitle>
                        </TitleContent>
                    </HeaderTitle>
                </HeaderLeft>

                <HeaderActions>
                    <PrimaryAction onClick={actions.handleNewAppointmentClick}>
                        <FaPlus />
                        <span>Nowa wizyta</span>
                    </PrimaryAction>
                </HeaderActions>
            </PageHeader>
        </HeaderContainer>
    );
};

const HeaderContainer = styled.header`
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const PageHeader = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${theme.spacing.md} ${theme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${theme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

const TitleIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${theme.shadow.md};
    flex-shrink: 0;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const MainTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const Subtitle = styled.div`
    font-size: 16px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${theme.spacing.lg};
    align-items: center;

    @media (max-width: 1024px) {
        width: 100%;
        justify-content: flex-start;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.md};

        > * {
            width: 100%;
        }
    }
`;

const PrimaryAction = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    color: white;
    box-shadow: ${theme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
        box-shadow: ${theme.shadow.md};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;
