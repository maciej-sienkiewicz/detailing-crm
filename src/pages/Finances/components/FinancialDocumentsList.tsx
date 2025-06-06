// Premium Financial Documents Table - Professional UX/UI Design for Automotive Detailing Industry
import React, { useState } from 'react';
import styled from 'styled-components';
import {
    FaFileInvoiceDollar,
    FaReceipt,
    FaExchangeAlt,
    FaEye,
    FaEdit,
    FaTrashAlt,
    FaExternalLinkAlt,
    FaCalendarAlt,
    FaUser,
    FaCreditCard,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaTimes,
    FaEllipsisH
} from 'react-icons/fa';
import {
    UnifiedFinancialDocument,
    DocumentType,
    DocumentStatus,
    TransactionDirection,
    PaymentMethodLabels
} from '../../../types/finance';

// Premium Automotive Brand Theme
const theme = {
    // Professional Color Palette
    colors: {
        primary: '#1a365d',
        primaryLight: '#2c5aa0',
        primaryDark: '#0f2027',

        surface: '#ffffff',
        surfaceAlt: '#fafbfc',
        surfaceHover: '#f1f5f9',

        text: {
            primary: '#0f172a',
            secondary: '#475569',
            tertiary: '#64748b',
            muted: '#94a3b8'
        },

        border: '#e2e8f0',
        borderLight: '#f1f5f9',

        status: {
            success: '#059669',
            successLight: '#ecfdf5',
            warning: '#d97706',
            warningLight: '#fffbeb',
            error: '#dc2626',
            errorLight: '#fef2f2',
            info: '#0ea5e9',
            infoLight: '#f0f9ff'
        }
    },

    // Spacing System
    space: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    },

    // Shadows
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
};

interface PremiumFinancialTableProps {
    documents: UnifiedFinancialDocument[];
    onViewDocument: (document: UnifiedFinancialDocument) => void;
    onEditDocument: (document: UnifiedFinancialDocument) => void;
    onDeleteDocument: (id: string) => void;
}

const FinancialDocumentsList: React.FC<PremiumFinancialTableProps> = ({
                                                                         documents,
                                                                         onViewDocument,
                                                                         onEditDocument,
                                                                         onDeleteDocument
                                                                     }) => {
    // Helper Functions
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatAmount = (amount: number, currency: string = 'PLN'): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const getDocumentTypeConfig = (type: DocumentType) => {
        const configs = {
            [DocumentType.INVOICE]: {
                icon: <FaFileInvoiceDollar />,
                label: 'Faktura',
                color: theme.colors.primary,
                bgColor: `${theme.colors.primary}08`
            },
            [DocumentType.RECEIPT]: {
                icon: <FaReceipt />,
                label: 'Paragon',
                color: theme.colors.status.success,
                bgColor: theme.colors.status.successLight
            },
            [DocumentType.OTHER]: {
                icon: <FaExchangeAlt />,
                label: 'Operacja',
                color: theme.colors.status.warning,
                bgColor: theme.colors.status.warningLight
            }
        };
        return configs[type] || configs[DocumentType.OTHER];
    };

    const getStatusConfig = (status: DocumentStatus) => {
        const configs = {
            PAID: {
                icon: <FaCheckCircle />,
                label: 'Opłacona',
                color: theme.colors.status.success,
                bgColor: theme.colors.status.successLight
            },
            NOT_PAID: {
                icon: <FaClock />,
                label: 'Nieopłacona',
                color: theme.colors.status.info,
                bgColor: theme.colors.status.infoLight
            },
            OVERDUE: {
                icon: <FaExclamationTriangle />,
                label: 'Przeterminowana',
                color: theme.colors.status.error,
                bgColor: theme.colors.status.errorLight
            },
            CANCELLED: {
                icon: <FaTimes />,
                label: 'Anulowana',
                color: theme.colors.text.muted,
                bgColor: theme.colors.surfaceAlt
            }
        };
        return configs[status] || configs.NOT_PAID;
    };

    if (documents.length === 0) {
        return (
            <EmptyState>
                <EmptyIcon>
                    <FaFileInvoiceDollar />
                </EmptyIcon>
                <EmptyTitle>Brak dokumentów</EmptyTitle>
                <EmptyDescription>
                    Nie znaleziono dokumentów finansowych spełniających kryteria
                </EmptyDescription>
            </EmptyState>
        );
    }

    return (
        <TableContainer>
            <Table>
                <TableHeader>
                    <HeaderRow>
                        <HeaderCell $width="12%">Dokument</HeaderCell>
                        <HeaderCell $width="22%">Szczegóły transakcji</HeaderCell>
                        <HeaderCell $width="16%">Kontrahent</HeaderCell>
                        <HeaderCell $width="12%">Terminy</HeaderCell>
                        <HeaderCell $width="14%">Kwota i płatność</HeaderCell>
                        <HeaderCell $width="10%">Status</HeaderCell>
                        <HeaderCell $width="10%">Wizyta</HeaderCell>
                        <HeaderCell $width="4%">Akcje</HeaderCell>
                    </HeaderRow>
                </TableHeader>

                <TableBody>
                    {documents.map((document, index) => {
                        const typeConfig = getDocumentTypeConfig(document.type);
                        const statusConfig = getStatusConfig(document.status);
                        const isOverdue = document.dueDate && new Date(document.dueDate) < new Date() && document.status !== 'PAID';

                        return (
                            <TableRow
                                key={document.id}
                                onClick={() => onViewDocument(document)}
                                $isOverdue={isOverdue}
                            >
                                {/* Document Type & Number */}
                                <TableCell $width="12%">
                                    <DocumentInfo>
                                        <DocumentTypeWrapper>
                                            <DocumentTypeIcon
                                                $color={typeConfig.color}
                                                $bgColor={typeConfig.bgColor}
                                            >
                                                {typeConfig.icon}
                                            </DocumentTypeIcon>
                                            <DocumentTypeLabel $color={typeConfig.color}>
                                                {typeConfig.label}
                                            </DocumentTypeLabel>
                                        </DocumentTypeWrapper>
                                        <DocumentNumber>{document.number}</DocumentNumber>
                                    </DocumentInfo>
                                </TableCell>

                                {/* Transaction Details */}
                                <TableCell $width="22%">
                                    <TransactionDetails>
                                        <TransactionTitle>{document.title}</TransactionTitle>
                                        <TransactionMeta>
                                            <DirectionBadge $direction={document.direction}>
                                                {document.direction === 'INCOME' ? 'Przychód' : 'Wydatek'}
                                            </DirectionBadge>
                                            <PaymentMethod>
                                                <FaCreditCard />
                                                {PaymentMethodLabels[document.paymentMethod]}
                                            </PaymentMethod>
                                        </TransactionMeta>
                                    </TransactionDetails>
                                </TableCell>

                                {/* Contractor */}
                                <TableCell $width="16%">
                                    <ContractorInfo>
                                        <ContractorName>
                                            <FaUser />
                                            {document.buyerName}
                                        </ContractorName>
                                        {document.buyerTaxId && (
                                            <ContractorTax>NIP: {document.buyerTaxId}</ContractorTax>
                                        )}
                                    </ContractorInfo>
                                </TableCell>

                                {/* Dates */}
                                <TableCell $width="12%">
                                    <DatesInfo>
                                        <DateItem>
                                            <DateLabel>Wystawiona</DateLabel>
                                            <DateValue>{formatDate(document.issuedDate)}</DateValue>
                                        </DateItem>
                                        {document.dueDate && (
                                            <DateItem $isOverdue={isOverdue}>
                                                <DateLabel>Termin płatności</DateLabel>
                                                <DateValue>{formatDate(document.dueDate)}</DateValue>
                                            </DateItem>
                                        )}
                                    </DatesInfo>
                                </TableCell>

                                {/* Amount */}
                                <TableCell $width="14%">
                                    <AmountInfo>
                                        <AmountMain $direction={document.direction}>
                                            {formatAmount(document.totalGross, document.currency)}
                                        </AmountMain>
                                        {document.totalNet !== document.totalGross && (
                                            <AmountSecondary>
                                                netto: {formatAmount(document.totalNet, document.currency)}
                                            </AmountSecondary>
                                        )}
                                    </AmountInfo>
                                </TableCell>

                                {/* Status */}
                                <TableCell $width="10%">
                                    <StatusBadge
                                        $color={statusConfig.color}
                                        $bgColor={statusConfig.bgColor}
                                    >
                                        {statusConfig.icon}
                                        <StatusLabel>{statusConfig.label}</StatusLabel>
                                    </StatusBadge>
                                </TableCell>

                                {/* Visit Link */}
                                <TableCell $width="10%">
                                    {document.protocolId ? (
                                        <VisitLink
                                            href={`/orders/car-reception/${document.protocolId}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FaExternalLinkAlt />
                                            <VisitLinkText>
                                                {document.protocolNumber || document.protocolId.slice(-6)}
                                            </VisitLinkText>
                                        </VisitLink>
                                    ) : (
                                        <NoVisit>—</NoVisit>
                                    )}
                                </TableCell>

                                {/* Actions */}
                                <TableCell $width="4%" onClick={(e) => e.stopPropagation()}>
                                    <ActionsMenu>
                                        <ActionsButton>
                                            <FaEllipsisH />
                                        </ActionsButton>
                                        <ActionsDropdown>
                                            <ActionItem onClick={() => onViewDocument(document)}>
                                                <FaEye />
                                                Zobacz
                                            </ActionItem>
                                            <ActionItem onClick={() => onEditDocument(document)}>
                                                <FaEdit />
                                                Edytuj
                                            </ActionItem>
                                            <ActionItem
                                                onClick={() => onDeleteDocument(document.id)}
                                                $danger
                                            >
                                                <FaTrashAlt />
                                                Usuń
                                            </ActionItem>
                                        </ActionsDropdown>
                                    </ActionsMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// Premium Styled Components
const TableContainer = styled.div`
    background: ${theme.colors.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.colors.border};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const Table = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const TableHeader = styled.div`
    background: linear-gradient(135deg, ${theme.colors.surfaceAlt} 0%, ${theme.colors.surface} 100%);
    border-bottom: 2px solid ${theme.colors.border};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    padding: ${theme.space.lg} 0;
`;

const HeaderCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    padding: 0 ${theme.space.lg};
    font-size: 12px;
    font-weight: 700;
    color: ${theme.colors.text.primary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.2;
`;

const TableBody = styled.div`
    background: ${theme.colors.surface};
`;

const TableRow = styled.div<{ $isOverdue?: boolean }>`
    display: flex;
    align-items: center;
    padding: ${theme.space.xl} 0;
    border-bottom: 1px solid ${theme.colors.borderLight};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    &:hover {
        background: ${theme.colors.surfaceHover};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
        
        &::before {
            opacity: 1;
        }
    }

    &:last-child {
        border-bottom: none;
    }

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: ${props => props.$isOverdue
    ? `linear-gradient(180deg, ${theme.colors.status.error} 0%, ${theme.colors.status.warning} 100%)`
    : `linear-gradient(180deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%)`
};
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    ${props => props.$isOverdue && `
        background: ${theme.colors.status.errorLight};
        
        &::before {
            opacity: 0.3;
        }
    `}
`;

const TableCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    padding: 0 ${theme.space.lg};
    display: flex;
    align-items: center;
    min-height: 60px;
`;

// Document Info Components
const DocumentInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.sm};
`;

const DocumentTypeWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.space.sm};
`;

const DocumentTypeIcon = styled.div<{ $color: string; $bgColor: string }>`
    width: 32px;
    height: 32px;
    border-radius: ${theme.radius.md};
    background: ${props => props.$bgColor};
    color: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    border: 1px solid ${props => props.$color}20;
`;

const DocumentTypeLabel = styled.span<{ $color: string }>`
    font-size: 11px;
    font-weight: 600;
    color: ${props => props.$color};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DocumentNumber = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: ${theme.colors.text.primary};
    font-family: 'Monaco', 'Menlo', monospace;
    letter-spacing: 0.5px;
`;

// Transaction Details
const TransactionDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.sm};
    width: 100%;
`;

const TransactionTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.colors.text.primary};
    line-height: 1.3;
    margin-bottom: ${theme.space.xs};
`;

const TransactionMeta = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.space.md};
    flex-wrap: wrap;
`;

const DirectionBadge = styled.div<{ $direction: TransactionDirection }>`
    display: flex;
    align-items: center;
    padding: ${theme.space.xs} ${theme.space.sm};
    border-radius: ${theme.radius.sm};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => props.$direction === 'INCOME'
    ? theme.colors.status.successLight
    : theme.colors.status.errorLight
};
    color: ${props => props.$direction === 'INCOME'
    ? theme.colors.status.success
    : theme.colors.status.error
};
    border: 1px solid ${props => props.$direction === 'INCOME'
    ? `${theme.colors.status.success}30`
    : `${theme.colors.status.error}30`
};
`;

const PaymentMethod = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.space.xs};
    font-size: 11px;
    color: ${theme.colors.text.tertiary};
    font-weight: 500;

    svg {
        font-size: 10px;
    }
`;

// Contractor Info
const ContractorInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xs};
`;

const ContractorName = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.space.sm};
    font-size: 13px;
    font-weight: 600;
    color: ${theme.colors.text.primary};
    line-height: 1.3;

    svg {
        font-size: 11px;
        color: ${theme.colors.text.muted};
        flex-shrink: 0;
    }
`;

const ContractorTax = styled.div`
    font-size: 11px;
    color: ${theme.colors.text.muted};
    font-weight: 500;
    font-family: 'Monaco', 'Menlo', monospace;
    letter-spacing: 0.5px;
`;

// Dates Info
const DatesInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.sm};
`;

const DateItem = styled.div<{ $isOverdue?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    ${props => props.$isOverdue && `
        padding: ${theme.space.xs};
        background: ${theme.colors.status.errorLight};
        border-radius: ${theme.radius.sm};
        border: 1px solid ${theme.colors.status.error}30;
    `}
`;

const DateLabel = styled.span`
    font-size: 10px;
    color: ${theme.colors.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DateValue = styled.span`
    font-size: 12px;
    color: ${theme.colors.text.secondary};
    font-weight: 600;
    font-family: 'Monaco', 'Menlo', monospace;
`;

// Amount Info
const AmountInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xs};
    align-items: flex-end;
`;

const AmountMain = styled.div<{ $direction: TransactionDirection }>`
    font-size: 16px;
    font-weight: 700;
    color: ${props => props.$direction === 'INCOME'
    ? theme.colors.status.success
    : theme.colors.status.error
};
    font-family: 'Monaco', 'Menlo', monospace;
    letter-spacing: 0.5px;
`;

const AmountSecondary = styled.div`
    font-size: 11px;
    color: ${theme.colors.text.muted};
    font-weight: 500;
    font-family: 'Monaco', 'Menlo', monospace;
`;

// Status Badge
const StatusBadge = styled.div<{ $color: string; $bgColor: string }>`
    display: flex;
    align-items: center;
    gap: ${theme.space.xs};
    padding: ${theme.space.sm} ${theme.space.md};
    border-radius: ${theme.radius.md};
    background: ${props => props.$bgColor};
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    font-size: 11px;
    font-weight: 600;

    svg {
        font-size: 12px;
    }
`;

const StatusLabel = styled.span`
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

// Visit Link
const VisitLink = styled.a`
    display: flex;
    align-items: center;
    gap: ${theme.space.xs};
    padding: ${theme.space.sm} ${theme.space.md};
    border-radius: ${theme.radius.md};
    background: ${theme.colors.primary}08;
    color: ${theme.colors.primary};
    text-decoration: none;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid ${theme.colors.primary}30;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.colors.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }

    svg {
        font-size: 10px;
    }
`;

const VisitLinkText = styled.span`
    font-family: 'Monaco', 'Menlo', monospace;
    text-transform: uppercase;
`;

const NoVisit = styled.div`
    color: ${theme.colors.text.muted};
    font-size: 14px;
    text-align: center;
    font-weight: 300;
`;

// Actions Menu
const ActionsMenu = styled.div`
    position: relative;

    &:hover .actions-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
`;

const ActionsButton = styled.button`
    width: 32px;
    height: 32px;
    border: none;
    background: ${theme.colors.surfaceAlt};
    border-radius: ${theme.radius.md};
    color: ${theme.colors.text.muted};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border: 1px solid ${theme.colors.border};

    &:hover {
        background: ${theme.colors.primary};
        color: white;
        border-color: ${theme.colors.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }
`;

const ActionsDropdown = styled.div.attrs({
    className: 'actions-dropdown'
})`
    position: absolute;
    top: 100%;
    right: 0;
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.md};
    box-shadow: ${theme.shadow.lg};
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: all 0.2s ease;
    z-index: 1000;
    min-width: 140px;
    overflow: hidden;
    margin-top: ${theme.space.xs};
`;

const ActionItem = styled.button<{ $danger?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.space.sm};
    width: 100%;
    padding: ${theme.space.md};
    background: none;
    border: none;
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.$danger ? theme.colors.status.error : theme.colors.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$danger ? theme.colors.status.errorLight : theme.colors.surfaceHover};
    }

    svg {
        font-size: 12px;
    }
`;

// Empty State
const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.space.xxl} ${theme.space.xl};
    background: ${theme.colors.surface};
    border-radius: ${theme.radius.xl};
    border: 2px dashed ${theme.colors.border};
    text-align: center;
    min-height: 400px;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${theme.colors.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: ${theme.colors.text.muted};
    margin-bottom: ${theme.space.xl};
`;

const EmptyTitle = styled.h3`
    font-size: 24px;
    font-weight: 600;
    color: ${theme.colors.text.primary};
    margin: 0 0 ${theme.space.md} 0;
`;

const EmptyDescription = styled.p`
    font-size: 16px;
    color: ${theme.colors.text.secondary};
    margin: 0;
    line-height: 1.5;
`;

export default FinancialDocumentsList;