// src/pages/Finances/components/FinancialLoadingState.tsx - Professional Premium Automotive CRM
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaFileInvoiceDollar } from 'react-icons/fa';

// Professional Brand Theme - Premium Automotive CRM
const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

const FinancialLoadingState: React.FC = () => {
    return (
        <LoadingContainer>
            <LoadingContent>
                <LoadingIcon>
                    <FaFileInvoiceDollar />
                </LoadingIcon>
                <LoadingSpinner />
                <LoadingText>Ładowanie dokumentów finansowych...</LoadingText>
                <LoadingSubtext>Przygotowywanie danych dla premium detailing</LoadingSubtext>
            </LoadingContent>

            {/* Skeleton Cards */}
            <SkeletonGrid>
                {[...Array(6)].map((_, index) => (
                    <SkeletonCard key={index} $delay={index * 0.1}>
                        <SkeletonHeader>
                            <SkeletonIcon />
                            <SkeletonHeaderContent>
                                <SkeletonLine $width="120px" $height="16px" />
                                <SkeletonLine $width="80px" $height="12px" />
                            </SkeletonHeaderContent>
                            <SkeletonActions>
                                <SkeletonActionButton />
                                <SkeletonActionButton />
                                <SkeletonActionButton />
                            </SkeletonActions>
                        </SkeletonHeader>

                        <SkeletonContent>
                            <SkeletonLine $width="100%" $height="18px" />
                            <SkeletonLine $width="75%" $height="14px" />

                            <SkeletonDetails>
                                <SkeletonDetailRow>
                                    <SkeletonDetailIcon />
                                    <SkeletonLine $width="140px" $height="12px" />
                                </SkeletonDetailRow>
                                <SkeletonDetailRow>
                                    <SkeletonDetailIcon />
                                    <SkeletonLine $width="120px" $height="12px" />
                                </SkeletonDetailRow>
                                <SkeletonDetailRow>
                                    <SkeletonDetailIcon />
                                    <SkeletonLine $width="160px" $height="12px" />
                                </SkeletonDetailRow>
                            </SkeletonDetails>
                        </SkeletonContent>

                        <SkeletonFooter>
                            <SkeletonFooterLeft>
                                <SkeletonBadge $width="60px" />
                                <SkeletonBadge $width="80px" />
                            </SkeletonFooterLeft>
                            <SkeletonFooterRight>
                                <SkeletonLine $width="100px" $height="16px" />
                                <SkeletonLine $width="80px" $height="12px" />
                            </SkeletonFooterRight>
                        </SkeletonFooter>
                    </SkeletonCard>
                ))}
            </SkeletonGrid>
        </LoadingContainer>
    );
};

// Animations
const pulse = keyframes`
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
    100% {
        opacity: 1;
    }
`;

const spin = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

const shimmer = keyframes`
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
`;

const fadeInUp = keyframes`
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Professional Styled Components - Minimal & Elegant
const LoadingContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xxl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 500px;
`;

const LoadingContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, ${brandTheme.surface} 100%);
    border-bottom: 1px solid ${brandTheme.borderLight};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(26, 54, 93, 0.03) 50%,
            transparent 100%
        );
        animation: ${shimmer} 2s infinite;
    }
`;

const LoadingIcon = styled.div`
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.xl};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 28px;
    box-shadow: ${brandTheme.shadow.lg};
    margin-bottom: ${brandTheme.spacing.md};
    animation: ${pulse} 2s infinite;
    position: relative;
    z-index: 1;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-bottom: ${brandTheme.spacing.lg};
`;

const LoadingText = styled.div`
    font-size: 18px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
    margin-bottom: ${brandTheme.spacing.xs};
    text-align: center;
    letter-spacing: -0.02em;
`;

const LoadingSubtext = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    text-align: center;
`;

const SkeletonGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.xl};
    flex: 1;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
        padding: ${brandTheme.spacing.md};
    }
`;

const SkeletonCard = styled.div<{ $delay: number }>`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.xl};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.xs};
    animation: ${fadeInUp} 0.6s ease-out ${props => props.$delay}s both;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
        );
        animation: ${shimmer} 2s infinite ${props => props.$delay}s;
        z-index: 1;
    }
`;

const SkeletonHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.borderLight};
`;

const SkeletonIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.lg};
    flex-shrink: 0;
    animation: ${pulse} 2s infinite;
`;

const SkeletonHeaderContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const SkeletonActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
`;

const SkeletonActionButton = styled.div`
    width: 32px;
    height: 32px;
    background: ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.md};
    animation: ${pulse} 2s infinite;
`;

const SkeletonContent = styled.div`
    padding: ${brandTheme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SkeletonDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
    margin-top: ${brandTheme.spacing.md};
`;

const SkeletonDetailRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const SkeletonDetailIcon = styled.div`
    width: 20px;
    height: 20px;
    background: ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.sm};
    flex-shrink: 0;
    animation: ${pulse} 2s infinite;
`;

const SkeletonFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-top: 1px solid ${brandTheme.borderLight};
`;

const SkeletonFooterLeft = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;
`;

const SkeletonFooterRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${brandTheme.spacing.xs};
`;

const SkeletonBadge = styled.div<{ $width: string }>`
    width: ${props => props.$width};
    height: 24px;
    background: ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.sm};
    animation: ${pulse} 2s infinite;
`;

const SkeletonLine = styled.div<{ $width: string; $height: string }>`
    width: ${props => props.$width};
    height: ${props => props.$height};
    background: ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.sm};
    animation: ${pulse} 2s infinite;
`;

export default FinancialLoadingState;