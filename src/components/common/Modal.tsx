// components/common/Modal.tsx - Enhanced with Backdrop Blur
import React, {useEffect} from 'react';
import styled, {keyframes} from 'styled-components';
import {FaTimes} from 'react-icons/fa';

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',

    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
    },

    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnBackdropClick?: boolean;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({
                                         isOpen,
                                         onClose,
                                         title,
                                         children,
                                         size = 'md',
                                         showCloseButton = true,
                                         closeOnBackdropClick = true,
                                         className
                                     }) => {
    // Handle ESC key press
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={handleBackdropClick} className={className}>
            <ModalContainer $size={size}>
                {(title || showCloseButton) && (
                    <ModalHeader>
                        {title && (
                            <ModalTitle>{title}</ModalTitle>
                        )}
                        {showCloseButton && (
                            <CloseButton onClick={onClose} aria-label="Zamknij modal">
                                <FaTimes />
                            </CloseButton>
                        )}
                    </ModalHeader>
                )}

                <ModalBody>
                    {children}
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Animation keyframes
const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

// Professional Styled Components with Backdrop Blur
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;

    /* Premium Backdrop Effect */
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    /* Subtle overlay pattern for premium feel */
    background-image:
            radial-gradient(circle at 25% 25%, rgba(26, 54, 93, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(44, 90, 160, 0.1) 0%, transparent 50%);

    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.lg};

    /* Smooth animations */
    animation: ${fadeIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    /* Handle overflow on mobile */
    overflow-y: auto;

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
        align-items: flex-start;
        padding-top: ${brandTheme.spacing.xl};
    }
`;

const ModalContainer = styled.div<{ $size: 'sm' | 'md' | 'lg' | 'xl' | 'full' }>`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    border: 1px solid ${brandTheme.borderLight};
    
    /* Professional glass morphism effect */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.95);
    
    /* Original width settings - PRESERVED */
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    
    /* Smooth entrance animation */
    animation: ${slideIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Ensure it doesn't exceed viewport */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    
    /* Premium border glow effect */
    box-shadow: 
        ${brandTheme.shadow.xl},
        0 0 0 1px rgba(255, 255, 255, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    
    @media (max-width: 768px) {
        width: 95%;
        max-height: 85vh;
        border-radius: ${brandTheme.radius.lg};
        margin: ${brandTheme.spacing.md} 0;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.borderLight};
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, ${brandTheme.surface} 100%);
    border-radius: ${brandTheme.radius.xl} ${brandTheme.radius.xl} 0 0;
    flex-shrink: 0;
    
    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        border-radius: ${brandTheme.radius.lg} ${brandTheme.radius.lg} 0 0;
    }
`;

const ModalTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${brandTheme.surfaceElevated};
    border: 1px solid ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.md};
    color: ${brandTheme.text.secondary};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 16px;
    
    /* Hover effect */
    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }
    
    &:active {
        transform: translateY(0);
    }
    
    /* Focus state for accessibility */
    &:focus-visible {
        outline: 2px solid ${brandTheme.primary};
        outline-offset: 2px;
    }
`;

const ModalBody = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0;
    min-height: 0;

    /* Custom scrollbar for premium feel */
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 4px;

        &:hover {
            background: ${brandTheme.text.muted};
        }
    }

    /* Smooth scrolling */
    scroll-behavior: smooth;
`;

export default Modal;