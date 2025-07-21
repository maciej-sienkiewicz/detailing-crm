// src/pages/Finances/components/DocumentTable.tsx
import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import {
    FaFileInvoiceDollar,
    FaReceipt,
    FaExchangeAlt,
    FaEye,
    FaEdit,
    FaTrashAlt,
    FaList,
    FaTable,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaPrint,
    FaDownload,
    FaSpinner // <-- Dodaj ten import
} from 'react-icons/fa';
import {
    UnifiedFinancialDocument,
    DocumentType,
    DocumentTypeLabels,
    DocumentStatus,
    DocumentStatusLabels,
    DocumentStatusColors,
    TransactionDirection,
    TransactionDirectionLabels,
    TransactionDirectionColors,
} from '../../../types/finance';
import { brandTheme } from '../styles/theme';
import { useDocumentOperations } from '../hooks/useDocumentOperations';

type ViewMode = 'table' | 'cards';
type SortField = 'issuedDate' | 'totalGross' | 'buyerName' | 'number';
type SortDirection = 'asc' | 'desc' | null;

interface DocumentTableProps {
    documents: UnifiedFinancialDocument[];
    loading: boolean;
    onView: (document: UnifiedFinancialDocument) => void;
    onEdit: (document: UnifiedFinancialDocument) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: DocumentStatus) => void;
    onError: (message: string) => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
                                                         documents,
                                                         loading,
                                                         onView,
                                                         onEdit,
                                                         onDelete,
                                                         onStatusChange,
                                                         onError
                                                     }) => {
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        try {
            const saved = localStorage.getItem('financial_view_mode');
            return (saved as ViewMode) || 'table';
        } catch {
            return 'table';
        }
    });

    const [sortField, setSortField] = useState<SortField>('issuedDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const {
        handlePrintDocument,
        handleDownloadDocument,
        isPrinting,
        isDownloading
    } = useDocumentOperations({ onError });

    // Save view mode preference
    React.useEffect(() => {
        try {
            localStorage.setItem('financial_view_mode', viewMode);
        } catch (e) {
            console.error("Error saving view mode:", e);
        }
    }, [viewMode]);

    // Sorting logic
    const sortedDocuments = useMemo(() => {
        if (!sortDirection) return documents;

        return [...documents].sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'issuedDate') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [documents, sortField, sortDirection]);

    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev =>
                prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
            );
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    }, [sortField]);

    const getSortIcon = useCallback((field: SortField) => {
        if (sortField !== field) return <FaSort />;
        if (sortDirection === 'asc') return <FaSortUp />;
        if (sortDirection === 'desc') return <FaSortDown />;
        return <FaSort />;
    }, [sortField, sortDirection]);

    // Helper functions
    const formatDate = useCallback((dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pl-PL');
    }, []);

    const formatAmount = useCallback((amount: number, currency: string = 'PLN'): string => {
        return new Intl.NumberFormat('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ` ${currency}`;
    }, []);

    const getDocumentIcon = useCallback((type: DocumentType) => {
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
    }, []);

    const handleQuickAction = useCallback((action: string, document: UnifiedFinancialDocument, e: React.MouseEvent) => {
        e.stopPropagation();

        switch (action) {
            case 'view':
                onView(document);
                break;
            case 'edit':
                onEdit(document);
                break;
            case 'delete':
                if (window.confirm(`Czy na pewno chcesz usunąć ${DocumentTypeLabels[document.type].toLowerCase()} ${document.number}?`)) {
                    onDelete(document.id);
                }
                break;
            case 'print':
                handlePrintDocument(document);
                break;
            case 'download':
                handleDownloadDocument(document);
                break;
        }
    }, [onView, onEdit, onDelete, handlePrintDocument, handleDownloadDocument]);

    if (loading && documents.length === 0) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie dokumentów...</LoadingText>
            </LoadingContainer>
        );
    }

    if (documents.length === 0) {
        return (
            <EmptyStateContainer>
                <EmptyStateIcon>
                    <FaFileInvoiceDollar />
                </EmptyStateIcon>
                <EmptyStateTitle>Brak dokumentów</EmptyStateTitle>
                <EmptyStateDescription>
                    Nie znaleziono żadnych dokumentów finansowych spełniających kryteria wyszukiwania
                </EmptyStateDescription>
                <EmptyStateAction>
                    Kliknij jeden z przycisków powyżej, aby dodać pierwszy dokument
                </EmptyStateAction>
            </EmptyStateContainer>
        );
    }

    return (
        <TableContainer>
            {/* Header with view controls */}
            <TableHeader>
                <TableTitle>
                    Dokumenty finansowe ({documents.length})
                </TableTitle>
                <ViewControls>
                    <ViewButton
                        $active={viewMode === 'table'}
                        onClick={() => setViewMode('table')}
                        title="Widok tabeli"
                    >
                        <FaTable />
                    </ViewButton>
                    <ViewButton
                        $active={viewMode === 'cards'}
                        onClick={() => setViewMode('cards')}
                        title="Widok kart"
                    >
                        <FaList />
                    </ViewButton>
                </ViewControls>
            </TableHeader>

            {/* Content based on view mode */}
            {viewMode === 'table' ? (
                <TableWrapper>
                    <Table>
                        <TableHead>
                            <TableRowHeader>
                                <TableHeaderCell>Typ</TableHeaderCell>
                                <SortableHeaderCell onClick={() => handleSort('number')}>
                                    Numer
                                    <SortIconWrapper>
                                        {getSortIcon('number')}
                                    </SortIconWrapper>
                                </SortableHeaderCell>
                                <TableHeaderCell>Nazwa</TableHeaderCell>
                                <SortableHeaderCell onClick={() => handleSort('issuedDate')}>
                                    Data wystawienia
                                    <SortIconWrapper>
                                        {getSortIcon('issuedDate')}
                                    </SortIconWrapper>
                                </SortableHeaderCell>
                                <SortableHeaderCell onClick={() => handleSort('buyerName')}>
                                    Kontrahent
                                    <SortIconWrapper>
                                        {getSortIcon('buyerName')}
                                    </SortIconWrapper>
                                </SortableHeaderCell>
                                <TableHeaderCell>Kierunek</TableHeaderCell>
                                <SortableHeaderCell onClick={() => handleSort('totalGross')}>
                                    Kwota brutto
                                    <SortIconWrapper>
                                        {getSortIcon('totalGross')}
                                    </SortIconWrapper>
                                </SortableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Akcje</TableHeaderCell>
                            </TableRowHeader>
                        </TableHead>
                        <TableBody>
                            {sortedDocuments.map(document => (
                                <TableRow key={document.id} onClick={() => onView(document)}>
                                    <TableCell>
                                        <DocumentTypeBadge type={document.type}>
                                            {getDocumentIcon(document.type)}
                                            {DocumentTypeLabels[document.type]}
                                        </DocumentTypeBadge>
                                    </TableCell>
                                    <TableCell>{document.number}</TableCell>
                                    <TableCell>
                                        <DocumentTitleCell>
                                            <DocumentTitle>{document.title}</DocumentTitle>
                                            {document.description && (
                                                <DocumentDescription>{document.description}</DocumentDescription>
                                            )}
                                        </DocumentTitleCell>
                                    </TableCell>
                                    <TableCell>{formatDate(document.issuedDate)}</TableCell>
                                    <TableCell>{document.buyerName}</TableCell>
                                    <TableCell>
                                        <DirectionBadge direction={document.direction}>
                                            {TransactionDirectionLabels[document.direction]}
                                        </DirectionBadge>
                                    </TableCell>
                                    <TableCell>
                                        {formatAmount(document.totalGross, document.currency)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={document.status}>
                                            {DocumentStatusLabels[document.status]}
                                        </StatusBadge>
                                    </TableCell>
                                    <TableCell>
                                        <ActionButtons>
                                            <ActionButton
                                                onClick={(e) => handleQuickAction('view', document, e)}
                                                title="Podgląd"
                                                $variant="view"
                                            >
                                                <FaEye />
                                            </ActionButton>
                                            <ActionButton
                                                onClick={(e) => handleQuickAction('print', document, e)}
                                                title="Drukuj"
                                                $variant="view"
                                                disabled={isPrinting(document.id)}
                                            >
                                                {isPrinting(document.id) ? (
                                                    <FaSpinner className="spinning" />
                                                ) : (
                                                    <FaPrint />
                                                )}
                                            </ActionButton>
                                            <ActionButton
                                                onClick={(e) => handleQuickAction('download', document, e)}
                                                title="Pobierz"
                                                $variant="view"
                                                disabled={isDownloading(document.id)}
                                            >
                                                {isDownloading(document.id) ? (
                                                    <FaSpinner className="spinning" />
                                                ) : (
                                                    <FaDownload />
                                                )}
                                            </ActionButton>
                                            <ActionButton
                                                onClick={(e) => handleQuickAction('edit', document, e)}
                                                title="Edytuj"
                                                $variant="view"
                                            >
                                                <FaEdit />
                                            </ActionButton>
                                            <ActionButton
                                                onClick={(e) => handleQuickAction('delete', document, e)}
                                                title="Usuń"
                                                $variant="view"
                                            >
                                                <FaTrashAlt />
                                            </ActionButton>
                                        </ActionButtons>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableWrapper>
            ) : (
                <CardsContainer>
                    {sortedDocuments.map(document => (
                        <DocumentCard key={document.id} onClick={() => onView(document)}>
                            <CardHeader>
                                <CardTitle>
                                    <DocumentTypeBadge type={document.type} $small>
                                        {getDocumentIcon(document.type)}
                                        {DocumentTypeLabels[document.type]}
                                    </DocumentTypeBadge>
                                    <CardNumber>{document.number}</CardNumber>
                                </CardTitle>
                                <CardActions>
                                    <ActionButton
                                        onClick={(e) => handleQuickAction('view', document, e)}
                                        title="Podgląd"
                                        $variant="view"
                                        $small
                                    >
                                        <FaEye />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={(e) => handleQuickAction('print', document, e)}
                                        title="Drukuj"
                                        $variant="print"
                                        $small
                                        disabled={isPrinting(document.id)}
                                    >
                                        {isPrinting(document.id) ? (
                                            <FaSpinner className="spinning" />
                                        ) : (
                                            <FaPrint />
                                        )}
                                    </ActionButton>
                                    <ActionButton
                                        onClick={(e) => handleQuickAction('download', document, e)}
                                        title="Pobierz"
                                        $variant="download"
                                        $small
                                        disabled={isDownloading(document.id)}
                                    >
                                        {isDownloading(document.id) ? (
                                            <FaSpinner className="spinning" />
                                        ) : (
                                            <FaDownload />
                                        )}
                                    </ActionButton>
                                    <ActionButton
                                        onClick={(e) => handleQuickAction('edit', document, e)}
                                        title="Edytuj"
                                        $variant="edit"
                                        $small
                                    >
                                        <FaEdit />
                                    </ActionButton>
                                </CardActions>
                            </CardHeader>

                            <CardContent>
                                <CardRow>
                                    <CardLabel>Nazwa:</CardLabel>
                                    <CardValue>{document.title}</CardValue>
                                </CardRow>
                                <CardRow>
                                    <CardLabel>Kontrahent:</CardLabel>
                                    <CardValue>{document.buyerName}</CardValue>
                                </CardRow>
                                <CardRow>
                                    <CardLabel>Data:</CardLabel>
                                    <CardValue>{formatDate(document.issuedDate)}</CardValue>
                                </CardRow>
                                <CardRow>
                                    <CardLabel>Kwota:</CardLabel>
                                    <AmountCell direction={document.direction}>
                                        {formatAmount(document.totalGross, document.currency)}
                                    </AmountCell>
                                </CardRow>
                                <CardRow>
                                    <CardLabel>Status:</CardLabel>
                                    <StatusBadge status={document.status} $small>
                                        {DocumentStatusLabels[document.status]}
                                    </StatusBadge>
                                </CardRow>
                                <CardRow>
                                    <CardLabel>Wizyta:</CardLabel>
                                    {document.protocolNumber ? (
                                        <ProtocolLink href={`/orders/car-reception/${document.protocolId}`}>
                                            #{document.protocolNumber}
                                        </ProtocolLink>
                                    ) : document.visitId ? (
                                        <ProtocolLink href={`/appointments/${document.visitId}`}>
                                            #{document.visitId}
                                        </ProtocolLink>
                                    ) : (
                                        <NoProtocol>-</NoProtocol>
                                    )}
                                </CardRow>
                            </CardContent>
                        </DocumentCard>
                    ))}
                </CardsContainer>
            )}
        </TableContainer>
    );
};

// Styled Components
const TableContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const TableTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

const ViewControls = styled.div`
    display: flex;
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    overflow: hidden;
    background: ${brandTheme.surface};
`;

const ViewButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 40px;
    border: none;
    background: ${props => props.$active ? brandTheme.primary : brandTheme.surface};
    color: ${props => props.$active ? 'white' : brandTheme.text.tertiary};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 16px;

    &:hover {
        background: ${props => props.$active ? brandTheme.primaryDark : brandTheme.primaryGhost};
        color: ${props => props.$active ? 'white' : brandTheme.primary};
    }

    &:not(:last-child) {
        border-right: 1px solid ${brandTheme.border};
    }
`;

// Table Components
const TableWrapper = styled.div`
    flex: 1;
    overflow: auto;
    min-height: 0;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const TableRowHeader = styled.tr``;

const TableHeaderCell = styled.th`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md};
    text-align: left;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const SortableHeaderCell = styled(TableHeaderCell)`
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    position: relative;
    display: table-cell;

    &:hover {
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
    }
`;

const SortIconWrapper = styled.span`
    margin-left: ${brandTheme.spacing.xs};
    opacity: 0.6;
    font-size: 12px;
`;

const TableBody = styled.tbody`
    background: ${brandTheme.surface};
`;

const TableRow = styled.tr`
    border-bottom: 1px solid ${brandTheme.borderLight};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        background: ${brandTheme.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.td`
    padding: ${brandTheme.spacing.md};
    border-right: 1px solid ${brandTheme.borderLight};
    vertical-align: middle;

    &:last-child {
        border-right: none;
    }
`;

// Document Type Badge
const DocumentTypeBadge = styled.span<{ type: DocumentType; $small?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${props => props.$small ? '4px 8px' : '6px 12px'};
    border-radius: ${brandTheme.radius.md};
    font-size: ${props => props.$small ? '11px' : '12px'};
    font-weight: 600;
    background-color: ${props => {
        switch (props.type) {
            case DocumentType.INVOICE:
                return 'rgba(52, 152, 219, 0.15)';
            case DocumentType.RECEIPT:
                return 'rgba(46, 204, 113, 0.15)';
            case DocumentType.OTHER:
                return 'rgba(149, 165, 166, 0.15)';
        }
    }};
    color: ${props => {
        switch (props.type) {
            case DocumentType.INVOICE:
                return '#3498db';
            case DocumentType.RECEIPT:
                return '#2ecc71';
            case DocumentType.OTHER:
                return '#95a5a6';
        }
    }};
    border: 1px solid ${props => {
        switch (props.type) {
            case DocumentType.INVOICE:
                return 'rgba(52, 152, 219, 0.3)';
            case DocumentType.RECEIPT:
                return 'rgba(46, 204, 113, 0.3)';
            case DocumentType.OTHER:
                return 'rgba(149, 165, 166, 0.3)';
        }
    }};
`;

const DocumentTitleCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const DocumentTitle = styled.div`
    font-weight: 500;
    color: ${brandTheme.text.primary};
`;

const DocumentDescription = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DirectionBadge = styled.span<{ direction: TransactionDirection }>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    background-color: ${props => `${TransactionDirectionColors[props.direction]}22`};
    color: ${props => TransactionDirectionColors[props.direction]};
    border: 1px solid ${props => `${TransactionDirectionColors[props.direction]}44`};
`;

const AmountCell = styled.div<{ direction: TransactionDirection }>`
    font-weight: 600;
    color: ${brandTheme.text.tertiary};
`;

const StatusBadge = styled.span<{ status: DocumentStatus; $small?: boolean }>`
    display: inline-block;
    padding: ${props => props.$small ? '4px 8px' : '6px 12px'};
    border-radius: ${brandTheme.radius.md};
    font-size: ${props => props.$small ? '11px' : '12px'};
    font-weight: 600;
    background-color: ${props => `${DocumentStatusColors[props.status]}22`};
    color: ${props => DocumentStatusColors[props.status]};
    border: 1px solid ${props => `${DocumentStatusColors[props.status]}44`};
`;

// Action Components
const ActionButtons = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'print' | 'download';
    $small?: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${props => props.$small ? '28px' : '32px'};
    height: ${props => props.$small ? '28px' : '32px'};
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: ${props => props.$small ? '12px' : '13px'};
    position: relative;
    overflow: hidden;

    ${({ $variant }) => {
        switch ($variant) {
            case 'view':
                return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                    &:hover:not(:disabled) {
                        background: ${brandTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'print':
                return `
                    background: ${brandTheme.status.infoLight};
                    color: ${brandTheme.status.info};
                    &:hover:not(:disabled) {
                        background: ${brandTheme.status.info};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'download':
                return `
                    background: ${brandTheme.status.successLight};
                    color: ${brandTheme.status.success};
                    &:hover:not(:disabled) {
                        background: ${brandTheme.status.success};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'edit':
                return `
                    background: ${brandTheme.status.warningLight};
                    color: ${brandTheme.status.warning};
                    &:hover:not(:disabled) {
                        background: ${brandTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'delete':
                return `
                    background: ${brandTheme.status.errorLight};
                    color: ${brandTheme.status.error};
                    &:hover:not(:disabled) {
                        background: ${brandTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
        }
    }}

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Card Components
const CardsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    overflow-y: auto;
    flex: 1;
`;

const DocumentCard = styled.div`
    background: ${brandTheme.surface};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.lg};
        border-color: ${brandTheme.primary};
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${brandTheme.spacing.md};
    gap: ${brandTheme.spacing.sm};
`;

const CardTitle = styled.div`
    flex: 1;
    min-width: 0;
`;

const CardNumber = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-top: ${brandTheme.spacing.xs};
`;

const CardActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const CardRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const CardLabel = styled.span`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    flex-shrink: 0;
`;

const CardValue = styled.span`
    font-size: 13px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
    text-align: right;
    word-break: break-all;
`;

const ProtocolLink = styled.a`
    color: ${brandTheme.primary};
    text-decoration: none;
    font-weight: 600;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    transition: all ${brandTheme.transitions.normal};
    display: inline-block;

    &:hover {
        background: ${brandTheme.primaryGhost};
        text-decoration: underline;
        transform: translateY(-1px);
    }
`;

const NoProtocol = styled.span`
    color: ${brandTheme.text.muted};
    font-style: italic;
    font-size: 13px;
`;

// Loading and Empty States
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.md};
    min-height: 400px;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
    min-height: 400px;
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.text.tertiary};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
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

export default DocumentTable;