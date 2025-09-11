// src/components/recurringEvents/FormComponents/FormHeader.tsx
/**
 * Form Header Component
 * Displays title, subtitle and icon for the form
 */

import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt } from 'react-icons/fa';
import { theme } from '../../../styles/theme';

interface FormHeaderProps {
    mode: 'create' | 'edit';
    title: string;
    subtitle: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
                                                          mode,
                                                          title,
                                                          subtitle
                                                      }) => {
    return (
        <HeaderContainer>
            <HeaderIcon>
                <FaCalendarAlt />
            </HeaderIcon>
            <HeaderContent>
                <HeaderTitle>{title}</HeaderTitle>
                <HeaderSubtitle>{subtitle}</HeaderSubtitle>
            </HeaderContent>
        </HeaderContainer>
    );
};

// Styled Components
const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: ${theme.radius.lg};
    font-size: 24px;
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const HeaderTitle = styled.h2`
    font-size: 22px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
`;

const HeaderSubtitle = styled.p`
    font-size: 15px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.4;
`;