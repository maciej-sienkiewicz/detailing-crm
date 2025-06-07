// src/pages/Finances/components/FinancialHeader.tsx
import React from 'react';
import styled from 'styled-components';
import {
    FaFileInvoiceDollar,
    FaPlus,
    FaReceipt,
    FaExchangeAlt,
    FaFileExport
} from 'react-icons/fa';
import { DocumentType } from '../../../types/finance';
import { brandTheme } from '../styles/theme';

interface FinancialHeaderProps {
    onAddDocument: (type?: DocumentType) => void;
    onExport: () => void;
}

const FinancialHeader: React.FC<FinancialHeaderProps> = ({
                                                             onAddDocument,
                                                             onExport
                                                         }) => {
    return (
        <HeaderContainer>
            <HeaderContent>
                <HeaderLeft>
                    <HeaderIcon>
                        <FaFileInvoiceDollar />
                    </HeaderIcon>
                    <HeaderText>
                        <HeaderTitle>Moduł Finansów</HeaderTitle>
                        <HeaderSubtitle>
                            Zarządzanie dokumentami i przepływami finansowymi
                        </HeaderSubtitle>
                    </HeaderText>
                </HeaderLeft>

                <HeaderActions>
                    <SecondaryButton onClick={onExport}>
                        <FaFileExport />
                        <span>Eksport</span>
                    </SecondaryButton>

                    <AddButtonGroup>
                        <PrimaryButton onClick={() => onAddDocument(DocumentType.INVOICE)}>
                            <FaFileInvoiceDollar />
                            <span>Faktura</span>
                        </PrimaryButton>

                        <PrimaryButton onClick={() => onAddDocument(DocumentType.RECEIPT)}>
                            <FaReceipt />
                            <span>Paragon</span>
                        </PrimaryButton>

                        <PrimaryButton onClick={() => onAddDocument(DocumentType.OTHER)}>
                            <FaExchangeAlt />
                            <span>Inna operacja</span>
                        </PrimaryButton>
                    </AddButtonGroup>
                </HeaderActions>
            </HeaderContent>
        </HeaderContainer>
    );
};

// Styled Components
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

const HeaderText = styled.div`
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

const AddButtonGroup = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
    }
`;

const BaseButton = styled.button`
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

    span {
        @media (max-width: 480px) {
            display: block;
        }
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

export default FinancialHeader;