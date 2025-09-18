// src/components/ClientAnalytics/AnalyticsToggle.tsx
import React from 'react';
import styled from 'styled-components';
import { FaChartLine, FaChevronUp, FaChevronDown, FaEye, FaEyeSlash } from 'react-icons/fa';
import { theme } from '../../styles/theme';

interface AnalyticsToggleProps {
    isVisible: boolean;
    onToggle: () => void;
    isLoading?: boolean;
    hasError?: boolean;
    clientName?: string;
}

const AnalyticsToggle: React.FC<AnalyticsToggleProps> = ({
                                                             isVisible,
                                                             onToggle,
                                                             isLoading = false,
                                                             hasError = false,
                                                             clientName
                                                         }) => {
    const getStatusInfo = () => {
        if (isLoading) {
            return {
                icon: <LoadingSpinner />,
                text: 'Ładowanie analityki...',
                color: theme.text.muted
            };
        }

        if (hasError) {
            return {
                icon: <FaEyeSlash />,
                text: 'Błąd ładowania analityki',
                color: theme.status.error
            };
        }

        if (isVisible) {
            return {
                icon: <FaEye />,
                text: 'Ukryj szczegółową analitykę',
                color: theme.primary
            };
        }

        return {
            icon: <FaChartLine />,
            text: 'Pokaż szczegółową analitykę',
            color: theme.text.secondary
        };
    };

    const statusInfo = getStatusInfo();

    return (
        <ToggleContainer onClick={onToggle} $isVisible={isVisible} disabled={isLoading}>
            <ToggleMain>
                <ToggleIcon $color={statusInfo.color}>
                    {statusInfo.icon}
                </ToggleIcon>

                <ToggleContent>
                    <ToggleTitle>
                        Analityka klienta
                        {clientName && (
                            <ClientNameBadge>
                                {clientName}
                            </ClientNameBadge>
                        )}
                    </ToggleTitle>
                    <ToggleSubtext $color={statusInfo.color}>
                        {statusInfo.text}
                    </ToggleSubtext>
                </ToggleContent>
            </ToggleMain>

            <ToggleActions>
                {!isLoading && !hasError && (
                    <>
                        <VisibilityIndicator $isVisible={isVisible}>
                            {isVisible ? <FaEye /> : <FaEyeSlash />}
                        </VisibilityIndicator>
                        <ChevronIcon $isVisible={isVisible}>
                            {isVisible ? <FaChevronUp /> : <FaChevronDown />}
                        </ChevronIcon>
                    </>
                )}
            </ToggleActions>
        </ToggleContainer>
    );
};

// ========================================================================================
// STYLED COMPONENTS
// ========================================================================================

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid ${theme.borderLight};
    border-top: 2px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const ToggleContainer = styled.button<{ $isVisible: boolean }>`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing.lg};
    background: ${props => props.$isVisible
    ? `linear-gradient(135deg, ${theme.primary}08 0%, ${theme.primary}04 100%)`
    : theme.surface
};
    border: 1px solid ${props => props.$isVisible ? theme.primary + '30' : theme.border};
    border-radius: ${theme.radius.xl};
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    box-shadow: ${theme.shadow.xs};
    margin-bottom: ${theme.spacing.lg};
    position: relative;
    overflow: hidden;
    
    /* Hover effect */
    &:hover:not(:disabled) {
        background: ${props => props.$isVisible
    ? `linear-gradient(135deg, ${theme.primary}12 0%, ${theme.primary}08 100%)`
    : theme.surfaceHover
};
        border-color: ${theme.primary}50;
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.lg};
    }
    
    /* Active effect */
    &:active:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }
    
    /* Disabled state */
    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
    }
    
    /* Subtle animation effect */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.6s;
    }
    
    &:hover:not(:disabled)::before {
        left: 100%;
    }
`;

const ToggleMain = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    flex: 1;
    min-width: 0;
`;

const ToggleIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.xs};
    transition: all ${theme.transitions.normal};
    
    ${ToggleContainer}:hover:not(:disabled) & {
        transform: scale(1.05);
        box-shadow: ${theme.shadow.sm};
    }
`;

const ToggleContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.xs};
    flex: 1;
    min-width: 0;
`;

const ToggleTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 18px;
    font-weight: 700;
    color: ${theme.text.primary};
    letter-spacing: -0.02em;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

const ClientNameBadge = styled.span`
    display: inline-block;
    background: ${theme.primary};
    color: white;
    padding: 2px 8px;
    border-radius: ${theme.radius.sm};
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: ${theme.shadow.xs};
    white-space: nowrap;

    @media (max-width: 480px) {
        display: none;
    }
`;

const ToggleSubtext = styled.div<{ $color: string }>`
    font-size: 14px;
    color: ${props => props.$color};
    font-weight: 500;
    line-height: 1.3;

    @media (max-width: 768px) {
        font-size: 13px;
    }
`;

const ToggleActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    flex-shrink: 0;
`;

const VisibilityIndicator = styled.div<{ $isVisible: boolean }>`
    width: 32px;
    height: 32px;
    background: ${props => props.$isVisible ? theme.primary : theme.text.muted}15;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$isVisible ? theme.primary : theme.text.muted};
    font-size: 12px;
    transition: all ${theme.transitions.normal};
    
    ${ToggleContainer}:hover:not(:disabled) & {
        background: ${props => props.$isVisible ? theme.primary + '25' : theme.text.secondary + '20'};
        color: ${props => props.$isVisible ? theme.primaryDark : theme.text.secondary};
        transform: scale(1.1);
    }
`;

const ChevronIcon = styled.div<{ $isVisible: boolean }>`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.text.muted};
    font-size: 12px;
    transition: all ${theme.transitions.normal};
    transform: ${props => props.$isVisible ? 'rotate(180deg)' : 'rotate(0deg)'};
    
    ${ToggleContainer}:hover:not(:disabled) & {
        color: ${theme.text.secondary};
        transform: ${props => props.$isVisible ? 'rotate(180deg) scale(1.2)' : 'rotate(0deg) scale(1.2)'};
    }
`;

export default AnalyticsToggle;