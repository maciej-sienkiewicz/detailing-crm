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
                    <ActionGroup>
                        <PrimaryActionButton onClick={() => onAddDocument(DocumentType.INVOICE)}>
                            <ActionIcon>
                                <FaFileInvoiceDollar />
                            </ActionIcon>
                            <ActionContent>
                                <ActionTitle>Faktura</ActionTitle>
                                <ActionSubtitle>Utwórz nową fakturę</ActionSubtitle>
                            </ActionContent>
                        </PrimaryActionButton>

                        <SecondaryActionButton onClick={() => onAddDocument(DocumentType.RECEIPT)}>
                            <ActionIcon>
                                <FaReceipt />
                            </ActionIcon>
                            <ActionContent>
                                <ActionTitle>Paragon</ActionTitle>
                                <ActionSubtitle>Dodaj paragon</ActionSubtitle>
                            </ActionContent>
                        </SecondaryActionButton>

                        <TertiaryActionButton onClick={() => onAddDocument(DocumentType.OTHER)}>
                            <ActionIcon>
                                <FaExchangeAlt />
                            </ActionIcon>
                            <ActionContent>
                                <ActionTitle>Operacja</ActionTitle>
                                <ActionSubtitle>Inna operacja</ActionSubtitle>
                            </ActionContent>
                        </TertiaryActionButton>
                    </ActionGroup>

                    <QuickAddButton onClick={() => onAddDocument()}>
                        <FaPlus />
                        <span>Szybkie dodanie</span>
                    </QuickAddButton>
                </HeaderActions>
            </HeaderContent>
        </HeaderContainer>
    );
};

// Professional Styled Components - Minimal & Elegant
const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.borderLight};
    box-shadow: ${brandTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.95);
`;

const HeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.xl};

    @media (max-width: 1200px) {
        padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
        gap: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    min-width: 0;
    flex: 1;

    @media (max-width: 1200px) {
        justify-content: center;
        text-align: center;
    }
`;

const HeaderIcon = styled.div`
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.xl};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 28px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;

    @media (max-width: 768px) {
        width: 56px;
        height: 56px;
        font-size: 24px;
    }
`;

const HeaderTextContent = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 36px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    letter-spacing: -0.02em;
    line-height: 1.1;

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
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
    align-items: flex-end;

    @media (max-width: 1200px) {
        align-items: stretch;
    }
`;

const ActionGroup = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: stretch;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const BaseActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 60px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.lg};
    }

    &:active {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        justify-content: center;
        text-align: center;
    }
`;

const PrimaryActionButton = styled(BaseActionButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.md};

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
    }
`;

const SecondaryActionButton = styled(BaseActionButton)`
    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #34d399 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.md};

    &:hover {
        background: linear-gradient(135deg, #047857 0%, ${brandTheme.status.success} 100%);
    }
`;

const TertiaryActionButton = styled(BaseActionButton)`
    background: linear-gradient(135deg, ${brandTheme.status.warning} 0%, #fbbf24 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.md};

    &:hover {
        background: linear-gradient(135deg, #b45309 0%, ${brandTheme.status.warning} 100%);
    }
`;

const ActionIcon = styled.div`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
`;

const ActionContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    flex: 1;

    @media (max-width: 768px) {
        align-items: center;
    }
`;

const ActionTitle = styled.span`
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
`;

const ActionSubtitle = styled.span`
    font-size: 11px;
    font-weight: 400;
    opacity: 0.9;
    line-height: 1;
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
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.primary};
        border-color: ${brandTheme.primary}40;
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