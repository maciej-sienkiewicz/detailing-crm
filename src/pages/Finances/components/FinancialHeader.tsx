// src/pages/Finances/components/FinancialHeader.tsx - Professional Premium Automotive CRM
import React from 'react';
import styled from 'styled-components';
import { FaFileInvoiceDollar, FaReceipt, FaExchangeAlt, FaPlus } from 'react-icons/fa';
import { DocumentType } from '../../../types/finance';

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

interface FinancialHeaderProps {
    onAddDocument: (type?: DocumentType) => void;
}

const FinancialHeader: React.FC<FinancialHeaderProps> = ({ onAddDocument }) => {
    return (
        <HeaderContainer>
            <HeaderContent>
                <HeaderLeft>
                    <HeaderIcon>
                        <FaFileInvoiceDollar />
                    </HeaderIcon>
                    <HeaderTextContent>
                        <HeaderTitle>Dokumenty finansowe</HeaderTitle>
                        <HeaderSubtitle>
                            Zarządzanie dokumentacją finansową premium detailing
                        </HeaderSubtitle>
                    </HeaderTextContent>
                </HeaderLeft>

                <HeaderActions>
                    <ActionButton
                        onClick={() => onAddDocument(DocumentType.INVOICE)}
                        $variant="primary"
                    >
                        <FaFileInvoiceDollar />
                        <span>Faktura</span>
                    </ActionButton>

                    <ActionButton
                        onClick={() => onAddDocument(DocumentType.RECEIPT)}
                        $variant="success"
                    >
                        <FaReceipt />
                        <span>Paragon</span>
                    </ActionButton>

                    <ActionButton
                        onClick={() => onAddDocument(DocumentType.OTHER)}
                        $variant="warning"
                    >
                        <FaExchangeAlt />
                        <span>Operacja</span>
                    </ActionButton>

                    <QuickAddButton onClick={() => onAddDocument()}>
                        <FaPlus />
                        <span>Szybkie dodanie</span>
                    </QuickAddButton>
                </HeaderActions>
            </HeaderContent>
        </HeaderContainer>
    );
};

// Professional Styled Components - Minimal & Elegant (wzorowane na OwnersPage)
const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const HeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const HeaderTextContent = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${brandTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.xs};

        > * {
            width: 100%;
        }
    }
`;

const ActionButton = styled.button<{
    $variant: 'primary' | 'success' | 'warning';
}>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    ${({ $variant }) => {
        switch ($variant) {
            case 'primary':
                return `
                    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
                    color: white;
                    box-shadow: ${brandTheme.shadow.sm};

                    &:hover {
                        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'success':
                return `
                    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #10b981 100%);
                    color: white;
                    box-shadow: ${brandTheme.shadow.sm};

                    &:hover {
                        background: linear-gradient(135deg, #059669 0%, ${brandTheme.status.success} 100%);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'warning':
                return `
                    background: linear-gradient(135deg, ${brandTheme.status.warning} 0%, #f59e0b 100%);
                    color: white;
                    box-shadow: ${brandTheme.shadow.sm};

                    &:hover {
                        background: linear-gradient(135deg, #b45309 0%, ${brandTheme.status.warning} 100%);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            default:
                return '';
        }
    }}

    span {
        @media (max-width: 480px) {
            display: none;
        }
    }
`;

const QuickAddButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${brandTheme.shadow.xs};
    min-height: 44px;

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }

    span {
        @media (max-width: 480px) {
            display: none;
        }
    }
`;

export default FinancialHeader;