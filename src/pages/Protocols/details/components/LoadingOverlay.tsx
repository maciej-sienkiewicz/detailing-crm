import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCarSide } from 'react-icons/fa';

const brand = {
    primary: 'var(--brand-primary, #1a365d)',
    surface: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    space: {
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px'
    },
    radius: {
        lg: '12px',
        xl: '16px'
    },
    shadow: {
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
};

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
    icon?: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
                                                           isVisible,
                                                           message = "Wydawanie pojazdu...",
                                                           icon = <FaCarSide />
                                                       }) => {
    if (!isVisible) return null;

    return (
        <OverlayContainer>
            <LoadingCard>
                <SpinnerContainer>
                    <LoadingSpinner />
                </SpinnerContainer>
                <LoadingMessage>{message}</LoadingMessage>
                <LoadingSubtext>Proszę czekać, trwa przetwarzanie...</LoadingSubtext>
            </LoadingCard>
        </OverlayContainer>
    );
};

// Animation keyframes
const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
`;

const pulse = keyframes`
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
`;

// CRITICAL: Very high z-index to ensure it's above everything, including modals
const OverlayContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000000; /* Higher than modal z-index */

    /* Premium Backdrop Effect with Blur */
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);

    /* Subtle overlay pattern for premium feel */
    background-image:
            radial-gradient(circle at 25% 25%, rgba(26, 54, 93, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(44, 90, 160, 0.1) 0%, transparent 50%);

    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${brand.space.xxl};

    /* Smooth animations */
    animation: ${fadeIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    /* Handle overflow on mobile */
    overflow-y: auto;

    @media (max-width: 768px) {
        padding: ${brand.space.lg};
    }
`;

const LoadingCard = styled.div`
    background: ${brand.surface};
    border-radius: ${brand.radius.xl};
    padding: ${brand.space.xxl};
    box-shadow: ${brand.shadow.elevated};
    border: 1px solid rgba(255, 255, 255, 0.2);

    /* Professional glass morphism effect */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.98);

    /* Center content */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brand.space.lg};
    text-align: center;
    min-width: 300px;
    max-width: 400px;

    /* Entrance animation */
    animation: ${fadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;

    /* Premium border glow effect */
    box-shadow:
            ${brand.shadow.elevated},
            0 0 0 1px rgba(255, 255, 255, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);

    @media (max-width: 768px) {
        min-width: 280px;
        padding: ${brand.space.xl};
        border-radius: ${brand.radius.lg};
    }
`;

const LoadingIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: ${brand.primary}15;
    color: ${brand.primary};
    border-radius: 50%;
    font-size: 28px;
    margin-bottom: ${brand.space.md};
    
    /* Subtle pulsing animation */
    animation: ${pulse} 2s ease-in-out infinite;
    
    /* Soft glow effect */
    box-shadow: 0 0 0 8px ${brand.primary}08;
`;

const SpinnerContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: ${brand.space.md} 0;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 4px solid rgba(26, 54, 93, 0.1);
    border-top: 4px solid ${brand.primary};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    
    /* Smooth rotation with hardware acceleration */
    will-change: transform;
    
    /* Premium shadow effect */
    box-shadow: 0 2px 8px rgba(26, 54, 93, 0.15);
`;

const LoadingMessage = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${brand.textPrimary};
    margin-top: ${brand.space.md};
    line-height: 1.3;
`;

const LoadingSubtext = styled.div`
    font-size: 14px;
    color: ${brand.textSecondary};
    margin-top: ${brand.space.md};
    line-height: 1.4;
    opacity: 0.8;
`;

export default LoadingOverlay;