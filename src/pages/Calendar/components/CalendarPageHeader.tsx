// src/pages/Calendar/components/CalendarPageHeader.tsx
import React from 'react';
import styled from 'styled-components';
import {FaCalendarAlt, FaPlus} from 'react-icons/fa';
import {useCalendarPageContext} from '../CalendarPageProvider';
import {theme} from '../../../styles/theme';

export const CalendarPageHeader: React.FC = () => {
    const { actions } = useCalendarPageContext();

    return (
        <HeaderContainer>
            <PageHeader>
                <HeaderTitle>
                    <TitleIcon>
                        <FaCalendarAlt />
                    </TitleIcon>
                    <TitleContent>
                        <MainTitle>Kalendarz wizyt</MainTitle>
                        <Subtitle>Zarządzanie terminami i protokołami</Subtitle>
                    </TitleContent>
                </HeaderTitle>
                <PrimaryAction onClick={actions.handleNewAppointmentClick}>
                    <FaPlus /> Nowa wizyta
                </PrimaryAction>
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
    padding: ${theme.spacing.xxl} ${theme.spacing.xxxl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.spacing.xxl};

    @media (max-width: 1024px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xxl};
        flex-direction: column;
        align-items: stretch;
        gap: ${theme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg};
    }
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xxl};
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

const PrimaryAction = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    color: white;
    border: none;
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    box-shadow: ${theme.shadow.sm};
    white-space: nowrap;
    min-height: 44px;

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