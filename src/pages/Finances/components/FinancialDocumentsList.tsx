// src/pages/Finances/components/FinancialDocumentsList.tsx - Professional Premium Automotive CRM
import React, { useState } from 'react';
import styled from 'styled-components';
import {
    FaFileInvoiceDollar,
    FaReceipt,
    FaExchangeAlt,
    FaCalendarAlt,
    FaEye,
    FaEdit,
    FaTrashAlt,
    FaBuilding,
    FaUser,
    FaTh,
    FaList
} from 'react-icons/fa';
import {
    UnifiedFinancialDocument,
    DocumentType,
    DocumentTypeLabels,
    DocumentStatus,
    DocumentStatusLabels,
    TransactionDirection,
    TransactionDirectionLabels,
    PaymentMethodLabels
} from '../../../types/finance';

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

interface FinancialDocumentsListProps {
    documents: UnifiedFinancialDocument[];
    onViewDocument: (document: UnifiedFinancialDocument) => void;
    onEditDocument: (document: UnifiedFinancialDocument) => void;
    onDeleteDocument: (id: string) => void;
}

const FinancialDocumentsList: React.FC<FinancialDocumentsListProps> = ({
                                                                           documents,
                                                                           onViewDocument,
                                                                           onEditDocument,
                                                                           onDeleteDocument
                                                                       }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

    // Formatowanie daty
    const formatDate = (dateString: string): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    // Formatowanie kwoty
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Funkcja zwracająca ikonę dla typu dokumentu
    const getDocumentIcon = (type: DocumentType) => {
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

    if (documents.length === 0) {
        return (
            <EmptyStateContainer>
                <EmptyStateIcon>
                    <FaFileInvoiceDollar />
                </EmptyStateIcon>
                <EmptyStateTitle>Brak dokumentów finansowych</EmptyStateTitle>
                <EmptyStateDescription>
                    Nie znaleziono żadnych dokumentów spełniających kryteria wyszukiwania
                </EmptyStateDescription>
                <EmptyStateAction>
                    Kliknij "Dodaj dokument", aby utworzyć pierwszy wpis
                </EmptyStateAction>
            </EmptyStateContainer>
        );
    }

    return (
        <ListContainer>
            <ListHeader>
                <ListHeaderLeft>
                    <ListTitle>
                        Lista dokumentów ({documents.length})
                    </ListTitle>
                    <ListSubtitle>
                        Kliknij na dokument aby wyświetlić szczegóły
                    </ListSubtitle>
                </ListHeaderLeft>

                <ViewModeToggle>
                    <ViewModeButton
                        $active={viewMode === 'table'}
                        onClick={() => setViewMode('table')}
                        title="Widok tabeli"
                    >
                        <FaList />
                    </ViewModeButton>
                    <ViewModeButton
                        $active={viewMode === 'grid'}
                        onClick={() => setViewMode('grid')}
                        title="Widok kafelków"
                    >
                        <FaTh />
                    </ViewModeButton>
                </ViewModeToggle>
            </ListHeader>

            {viewMode === 'table' ? (
                <TableWrapper>
                    <TableContent>
                        <TableHead>
                            <HeaderCell $width="12%">Typ</HeaderCell>
                            <HeaderCell $width="25%">Identyfikator</HeaderCell>
                            <HeaderCell $width="15%">Daty</HeaderCell>
                            <HeaderCell $width="18%">Kontrahent</HeaderCell>
                            <HeaderCell $width="8%">Kierunek</HeaderCell>
                            <HeaderCell $width="12%">Kwota</HeaderCell>
                            <HeaderCell $width="8%">Status</HeaderCell>
                            <HeaderCell $width="2%">Akcje</HeaderCell>
                        </TableHead>

                        <TableBody>
                            {documents.map(document => (
                                <StyledTableRow
                                    key={document.id}
                                    onClick={() => onViewDocument(document)}
                                >
                                    <TableCell $width="12%">
                                        <DocumentTypeCell $type={document.type}>
                                            {getDocumentIcon(document.type)}
                                            {DocumentTypeLabels[document.type]}
                                        </DocumentTypeCell>
                                    </TableCell>

                                    <TableCell $width="25%">
                                        <DocumentIdentifier>
                                            <DocumentNumber>{document.number}</DocumentNumber>
                                            <DocumentTitle>{document.title}</DocumentTitle>
                                        </DocumentIdentifier>
                                    </TableCell>

                                    <TableCell $width="15%">
                                        <DatesCell>
                                            <DateRow>
                                                <DateLabel>Wyst.</DateLabel>
                                                <DateValue>{formatDate(document.issuedDate)}</DateValue>
                                            </DateRow>
                                            {document.dueDate && (
                                                <DateRow>
                                                    <DateLabel>Term.</DateLabel>
                                                    <DateValue>{formatDate(document.dueDate)}</DateValue>
                                                </DateRow>
                                            )}
                                        </DatesCell>
                                    </TableCell>

                                    <TableCell $width="18%">
                                        <ContractorCell>
                                            <ContractorName>{document.buyerName}</ContractorName>
                                            <ContractorMeta>
                                                {document.buyerTaxId && `NIP: ${document.buyerTaxId} • `}
                                                {PaymentMethodLabels[document.paymentMethod]}
                                            </ContractorMeta>
                                        </ContractorCell>
                                    </TableCell>

                                    <TableCell $width="8%">
                                        <DirectionCell $direction={document.direction}>
                                            {TransactionDirectionLabels[document.direction]}
                                        </DirectionCell>
                                    </TableCell>

                                    <TableCell $width="12%">
                                        <AmountCell>
                                            <AmountPrimary>
                                                {formatAmount(document.totalGross)} {document.currency}
                                            </AmountPrimary>
                                            {document.totalNet > 0 && document.totalNet !== document.totalGross && (
                                                <AmountSecondary>
                                                    netto: {formatAmount(document.totalNet)}
                                                </AmountSecondary>
                                            )}
                                        </AmountCell>
                                    </TableCell>

                                    <TableCell $width="8%">
                                        <StatusCell $status={document.status}>
                                            {DocumentStatusLabels[document.status]}
                                        </StatusCell>
                                    </TableCell>

                                    <TableCell $width="2%" onClick={(e) => e.stopPropagation()}>
                                        <ActionsCell>
                                            <ActionDropdown>
                                                <ActionTrigger>⋯</ActionTrigger>
                                                <ActionMenu>
                                                    <ActionMenuItem onClick={() => onViewDocument(document)}>
                                                        <FaEye /> Zobacz
                                                    </ActionMenuItem>
                                                    <ActionMenuItem onClick={() => onEditDocument(document)}>
                                                        <FaEdit /> Edytuj
                                                    </ActionMenuItem>
                                                    <ActionMenuItem
                                                        onClick={() => onDeleteDocument(document.id)}
                                                        $danger
                                                    >
                                                        <FaTrashAlt /> Usuń
                                                    </ActionMenuItem>
                                                </ActionMenu>
                                            </ActionDropdown>
                                        </ActionsCell>
                                    </TableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </TableContent>
                </TableWrapper>
            ) : (
                <DocumentsGrid>
                    {documents.map(document => (
                        <DocumentCard
                            key={document.id}
                            onClick={() => onViewDocument(document)}
                        >
                            <CardHeader>
                                <DocumentTypeIcon $type={document.type}>
                                    {getDocumentIcon(document.type)}
                                </DocumentTypeIcon>
                                <HeaderContent>
                                    <DocumentNumber>{document.number}</DocumentNumber>
                                    <DocumentTypeLabel>{DocumentTypeLabels[document.type]}</DocumentTypeLabel>
                                </HeaderContent>
                                <CardActions onClick={(e) => e.stopPropagation()}>
                                    <ActionButton
                                        title="Zobacz szczegóły"
                                        $variant="view"
                                        onClick={() => onViewDocument(document)}
                                    >
                                        <FaEye />
                                    </ActionButton>
                                    <ActionButton
                                        title="Edytuj dokument"
                                        $variant="edit"
                                        onClick={() => onEditDocument(document)}
                                    >
                                        <FaEdit />
                                    </ActionButton>
                                    <ActionButton
                                        title="Usuń dokument"
                                        $variant="delete"
                                        onClick={() => onDeleteDocument(document.id)}
                                    >
                                        <FaTrashAlt />
                                    </ActionButton>
                                </CardActions>
                            </CardHeader>

                            <CardContent>
                                <DocumentTitleCard>{document.title}</DocumentTitleCard>
                                {document.description && (
                                    <DocumentDescriptionCard>{document.description}</DocumentDescriptionCard>
                                )}

                                <DocumentDetailsCard>
                                    <DetailRow>
                                        <DetailIcon><FaCalendarAlt /></DetailIcon>
                                        <DetailContent>
                                            <DetailLabel>Data wystawienia</DetailLabel>
                                            <DetailValue>{formatDate(document.issuedDate)}</DetailValue>
                                        </DetailContent>
                                    </DetailRow>

                                    {document.dueDate && (
                                        <DetailRow>
                                            <DetailIcon><FaCalendarAlt /></DetailIcon>
                                            <DetailContent>
                                                <DetailLabel>Termin płatności</DetailLabel>
                                                <DetailValue>{formatDate(document.dueDate)}</DetailValue>
                                            </DetailContent>
                                        </DetailRow>
                                    )}

                                    <DetailRow>
                                        <DetailIcon><FaUser /></DetailIcon>
                                        <DetailContent>
                                            <DetailLabel>Kontrahent</DetailLabel>
                                            <DetailValue>{document.buyerName}</DetailValue>
                                        </DetailContent>
                                    </DetailRow>
                                </DocumentDetailsCard>
                            </CardContent>

                            <CardFooter>
                                <FooterRight>
                                    <AmountDisplay $direction={document.direction}>
                                        <AmountValue>
                                            {formatAmount(document.totalGross)} {document.currency}
                                        </AmountValue>
                                        {document.totalNet > 0 && document.totalNet !== document.totalGross && (
                                            <AmountNet>
                                                netto: {formatAmount(document.totalNet)} {document.currency}
                                            </AmountNet>
                                        )}
                                    </AmountDisplay>
                                </FooterRight>
                            </CardFooter>
                        </DocumentCard>
                    ))}
                </DocumentsGrid>
            )}
        </ListContainer>
    );
};

// Professional Styled Components - Minimal & Elegant
const ListContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xxl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const ListHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.xl};
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, ${brandTheme.surface} 100%);
    border-bottom: 1px solid ${brandTheme.borderLight};
    flex-shrink: 0;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }
`;

const ListHeaderLeft = styled.div`
    flex: 1;
`;

const ViewModeToggle = styled.div`
    display: flex;
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.xs};
`;

const ViewModeButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 40px;
    background: ${props => props.$active ? brandTheme.primary : brandTheme.surface};
    color: ${props => props.$active ? 'white' : brandTheme.text.muted};
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;

    &:hover {
        background: ${props => props.$active ? brandTheme.primaryDark : brandTheme.surfaceHover};
        color: ${props => props.$active ? 'white' : brandTheme.primary};
    }
`;

// Table Components
const TableWrapper = styled.div`
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const TableContent = styled.div`
    flex: 1;
    overflow: auto;
    min-height: 0;
`;

const TableHead = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    min-height: 56px;
    position: sticky;
    top: 0;
    z-index: 10;
`;

const HeaderCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    display: flex;
    align-items: center;
    padding: 0 ${brandTheme.spacing.md};
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    border-right: 1px solid ${brandTheme.border};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:last-child {
        border-right: none;
    }
`;

const TableBody = styled.div`
    background: ${brandTheme.surface};
`;

const StyledTableRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${brandTheme.borderLight};
    cursor: pointer;
    transition: all 0.15s ease;
    background: ${brandTheme.surface};
    height: 48px; /* Fixed compact height */
    align-items: center;

    &:hover {
        background: ${brandTheme.surfaceHover};
        border-left: 3px solid ${brandTheme.primary};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    display: flex;
    align-items: center;
    height: 48px;
    border-right: 1px solid ${brandTheme.borderLight};
    overflow: hidden;

    &:last-child {
        border-right: none;
    }
`;

// Compact Document Type Cell
const DocumentTypeCell = styled.div<{ $type: DocumentType }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 11px;
    font-weight: 600;
    color: ${props => {
        switch (props.$type) {
            case DocumentType.INVOICE:
                return brandTheme.primary;
            case DocumentType.RECEIPT:
                return brandTheme.status.success;
            case DocumentType.OTHER:
                return brandTheme.status.warning;
            default:
                return brandTheme.text.secondary;
        }
    }};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
        font-size: 12px;
        flex-shrink: 0;
    }
`;

// Compact Document Identifier
const DocumentIdentifier = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
`;

// Compact Dates Cell
const DatesCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
`;

const DateRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
`;

const DateLabel = styled.span`
    color: ${brandTheme.text.muted};
    font-weight: 500;
    min-width: 30px;
    font-size: 10px;
    text-transform: uppercase;
`;

const DateValue = styled.span`
    color: ${brandTheme.text.primary};
    font-weight: 600;
    font-family: monospace;
    font-size: 11px;
`;

// Compact Contractor Cell
const ContractorCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
`;

const ContractorName = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ContractorMeta = styled.div`
    font-size: 10px;
    color: ${brandTheme.text.muted};
    font-weight: 400;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

// Compact Direction Cell
const DirectionCell = styled.div<{ $direction: TransactionDirection }>`
    font-size: 11px;
    font-weight: 600;
    color: ${props => props.$direction === 'INCOME' ? brandTheme.status.success : brandTheme.status.error};
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

// Compact Amount Cell
const AmountCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1px;
    align-items: flex-end;
`;

const AmountPrimary = styled.div`
    font-weight: 700;
    font-size: 13px;
    color: ${brandTheme.text.primary};
    line-height: 1.2;
    font-family: monospace;
`;

const AmountSecondary = styled.div`
    font-size: 9px;
    color: ${brandTheme.text.muted};
    font-weight: 400;
    font-family: monospace;
`;

// Compact Status Cell
const StatusCell = styled.div<{ $status: DocumentStatus }>`
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 6px;
    border-radius: 4px;
    text-align: center;
    background: ${props => {
        switch (props.$status) {
            case 'PAID':
                return brandTheme.status.successLight;
            case 'NOT_PAID':
                return brandTheme.status.errorLight;
            case 'OVERDUE':
                return brandTheme.status.warningLight;
            default:
                return brandTheme.surfaceAlt;
        }
    }};
    color: ${props => {
        switch (props.$status) {
            case 'PAID':
                return brandTheme.status.success;
            case 'NOT_PAID':
                return brandTheme.status.error;
            case 'OVERDUE':
                return brandTheme.status.warning;
            default:
                return brandTheme.text.secondary;
        }
    }};
`;

// Compact Actions Cell with Dropdown
const ActionsCell = styled.div`
    display: flex;
    justify-content: center;
    position: relative;
`;

const ActionDropdown = styled.div`
    position: relative;

    &:hover .action-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
`;

const ActionTrigger = styled.button`
    background: none;
    border: none;
    font-size: 16px;
    color: ${brandTheme.text.muted};
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.primary};
    }
`;

const ActionMenu = styled.div.attrs({
    className: 'action-menu'
})`
    position: absolute;
    top: 100%;
    right: 0;
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    box-shadow: ${brandTheme.shadow.lg};
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: all 0.2s ease;
    z-index: 1000;
    min-width: 120px;
    overflow: hidden;
`;

const ActionMenuItem = styled.button<{ $danger?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    width: 100%;
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: none;
    border: none;
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.$danger ? brandTheme.status.error : brandTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$danger ? brandTheme.status.errorLight : brandTheme.surfaceHover};
    }

    svg {
        font-size: 10px;
    }
`;

// Rename grid-specific components
const DocumentTitleCard = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    line-height: 1.3;
`;

const DocumentDescriptionCard = styled.p`
    font-size: 13px;
    color: ${brandTheme.text.tertiary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
    line-height: 1.4;
    font-style: italic;
`;

const DocumentDetailsCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const ListTitle = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    letter-spacing: -0.02em;
`;

const ListSubtitle = styled.p`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    margin: 0;
    font-weight: 500;
`;

const DocumentsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.xl};
    overflow-y: auto;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
        padding: ${brandTheme.spacing.md};
    }
`;

const DocumentCard = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.xl};
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        transform: translateY(-4px);
        box-shadow: ${brandTheme.shadow.lg};
        border-color: ${brandTheme.primary}40;
    }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 1px solid ${brandTheme.borderLight};
`;

const DocumentTypeIcon = styled.div<{ $type: DocumentType }>`
    width: 48px;
    height: 48px;
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
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
    box-shadow: ${brandTheme.shadow.sm};
`;

const HeaderContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const DocumentNumber = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: 0.5px;
    text-transform: uppercase;
`;

const DocumentTypeLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CardActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.muted};
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
        
        ${({ $variant }) => {
    switch ($variant) {
        case 'view':
            return `
                        background: ${brandTheme.primary};
                        color: white;
                    `;
        case 'edit':
            return `
                        background: ${brandTheme.status.warning};
                        color: white;
                    `;
        case 'delete':
            return `
                        background: ${brandTheme.status.error};
                        color: white;
                    `;
        default:
            return '';
    }
}}
    }
`;

const CardContent = styled.div`
    padding: ${brandTheme.spacing.lg};
`;

const DocumentTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    line-height: 1.3;
`;

const DocumentDescription = styled.p`
    font-size: 13px;
    color: ${brandTheme.text.tertiary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
    line-height: 1.4;
    font-style: italic;
`;

const DocumentDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const DetailRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const DetailIcon = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.muted};
    font-size: 10px;
    flex-shrink: 0;
`;

const DetailContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const DetailLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
`;

const DetailValue = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-top: 1px solid ${brandTheme.borderLight};
`;

const FooterLeft = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;
`;

const FooterRight = styled.div`
    text-align: right;
`;

const DirectionBadge = styled.div<{ $direction: TransactionDirection }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${brandTheme.surfaceElevated};
    color: ${brandTheme.text.muted};
    border: 1px solid ${brandTheme.border};
`;

const StatusBadge = styled.div<{ $status: DocumentStatus }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => {
    switch (props.$status) {
        case 'PAID':
            return brandTheme.status.successLight;
        case 'NOT_PAID':
            return brandTheme.status.errorLight;
        case 'OVERDUE':
            return brandTheme.status.warningLight;
        default:
            return brandTheme.surfaceAlt;
    }
}};
    color: ${props => {
    switch (props.$status) {
        case 'PAID':
            return brandTheme.status.success;
        case 'NOT_PAID':
            return brandTheme.status.error;
        case 'OVERDUE':
            return brandTheme.status.warning;
        default:
            return brandTheme.text.secondary;
    }
}};
    border: 1px solid ${props => {
    switch (props.$status) {
        case 'PAID':
            return `${brandTheme.status.success}30`;
        case 'NOT_PAID':
            return `${brandTheme.status.error}30`;
        case 'OVERDUE':
            return `${brandTheme.status.warning}30`;
        default:
            return brandTheme.border;
    }
}};
`;

const AmountDisplay = styled.div<{ $direction: TransactionDirection }>`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${brandTheme.spacing.xs};
`;

const AmountValue = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: ${brandTheme.text.primary};
    line-height: 1.2;
`;

const AmountNet = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    font-weight: 400;
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xxl};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
    min-height: 400px;
    margin: ${brandTheme.spacing.lg};
`;

const EmptyStateIcon = styled.div`
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, ${brandTheme.surfaceElevated} 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

const EmptyStateTitle = styled.h3`
    font-size: 24px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    letter-spacing: -0.02em;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    line-height: 1.5;
`;

const EmptyStateAction = styled.p`
    font-size: 14px;
    color: ${brandTheme.primary};
    margin: 0;
    font-weight: 500;
`;

export default FinancialDocumentsList;