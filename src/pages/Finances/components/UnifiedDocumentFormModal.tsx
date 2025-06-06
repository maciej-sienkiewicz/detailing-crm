// src/pages/Finances/components/UnifiedDocumentFormModal.tsx - Professional Premium Automotive CRM
import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaFileInvoiceDollar, FaReceipt, FaExchangeAlt } from 'react-icons/fa';
import { UnifiedFinancialDocument, DocumentType, DocumentTypeLabels } from '../../../types/finance';
import UnifiedDocumentForm from './UnifiedDocumentForm';

// Professional Brand Theme - Premium Automotive CRM (identical to VehiclesPage)
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

interface UnifiedDocumentFormModalProps {
    isOpen: boolean;
    document?: UnifiedFinancialDocument;
    onSave: (document: Partial<UnifiedFinancialDocument>, file?: File | null) => void;
    onClose: () => void;
    initialData?: Partial<UnifiedFinancialDocument>;
}

const UnifiedDocumentFormModal: React.FC<UnifiedDocumentFormModalProps> = ({
                                                                               isOpen,
                                                                               document,
                                                                               onSave,
                                                                               onClose,
                                                                               initialData = {}
                                                                           }) => {
    if (!isOpen) return null;

    // Funkcja zwracająca ikonę dla typu dokumentu
    const getDocumentIcon = (type?: DocumentType) => {
        switch (type) {
            case DocumentType.INVOICE:
                return <FaFileInvoiceDollar />;
            case DocumentType.RECEIPT:
                return <FaReceipt />;
            case DocumentType.OTHER:
                return <FaExchangeAlt />;
            default:
                return <FaFileInvoiceDollar />;
        }
    };

    const documentType = document?.type || initialData.type || DocumentType.INVOICE;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        <TitleIcon $type={documentType}>
                            {getDocumentIcon(documentType)}
                        </TitleIcon>
                        <TitleContent>
                            <TitleText>
                                {document ? 'Edytuj dokument' : 'Dodaj nowy dokument'}
                            </TitleText>
                            <TitleSubtext>
                                {DocumentTypeLabels[documentType]} - Premium Detailing CRM
                            </TitleSubtext>
                        </TitleContent>
                    </ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>
                <ModalContent>
                    <UnifiedDocumentForm
                        document={document}
                        initialData={initialData}
                        onSave={(documentData, file) => onSave(documentData, file)}
                        onCancel={onClose}
                    />
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Professional Styled Components - Premium Automotive Design
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: ${brandTheme.spacing.lg};
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

const ModalContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xxl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 1000px;
    max-width: 95vw;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${brandTheme.border};
    animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: 768px) {
        width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.xl};
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, ${brandTheme.surface} 100%);
    border-bottom: 2px solid ${brandTheme.borderLight};
    flex-shrink: 0;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
        opacity: 0.6;
    }
`;

const ModalTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    flex: 1;
`;

const TitleIcon = styled.div<{ $type: DocumentType }>`
    width: 56px;
    height: 56px;
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
    background: ${props => {
        switch (props.$type) {
            case DocumentType.INVOICE:
                return `linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%)`;
            case DocumentType.RECEIPT:
                return `linear-gradient(135deg, ${brandTheme.status.success} 0%, #34d399 100%)`;
            case DocumentType.OTHER:
                return `linear-gradient(135deg, ${brandTheme.status.warning} 0%, #fbbf24 100%)`;
            default:
                return `linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%)`;
        }
    }};
    color: white;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: ${brandTheme.shadow.lg};
    }
`;

const TitleContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const TitleText = styled.h2`
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const TitleSubtext = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.4;
`;

const CloseButton = styled.button`
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, ${brandTheme.surfaceElevated} 0%, ${brandTheme.surface} 100%);
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    color: ${brandTheme.text.tertiary};
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.status.errorLight} 0%, #fef2f2 100%);
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }
`;

const ModalContent = styled.div`
    flex: 1;
    overflow-y: auto;
    min-height: 0;

    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, ${brandTheme.border} 0%, ${brandTheme.borderHover} 100%);
        border-radius: 4px;
        
        &:hover {
            background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
        }
    }
`;

export default UnifiedDocumentFormModal;