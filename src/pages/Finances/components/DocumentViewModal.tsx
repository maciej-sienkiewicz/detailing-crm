// src/pages/Finances/components/DocumentViewModal.tsx
import React from 'react';
import styled from 'styled-components';
import {
    FaTimes,
    FaFilePdf,
    FaEdit,
    FaDownload,
    FaPrint,
    FaTrashAlt,
    FaFileInvoiceDollar,
    FaReceipt,
    FaExchangeAlt
} from 'react-icons/fa';
import {
    UnifiedFinancialDocument,
    DocumentStatus,
    DocumentStatusLabels,
    DocumentStatusColors,
    DocumentType,
    DocumentTypeLabels,
    TransactionDirectionLabels,
    TransactionDirectionColors,
    PaymentMethodLabels
} from '../../../types/finance';
import { brandTheme } from '../styles/theme';

interface DocumentViewModalProps {
    isOpen: boolean;
    document: UnifiedFinancialDocument;
    onClose: () => void;
    onEdit: (document: UnifiedFinancialDocument) => void;
    onStatusChange: (id: string, status: DocumentStatus) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onDownloadAttachment?: (documentId: string) => void;
}

const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
                                                                 isOpen,
                                                                 document,
                                                                 onClose,
                                                                 onEdit,
                                                                 onStatusChange,
                                                                 onDelete,
                                                                 onDownloadAttachment
                                                             }) => {
    if (!isOpen) return null;

    // Helper functions
    const formatDate = (dateString: string): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    const formatAmount = (amount: number, currency: string = 'PLN'): string => {
        return new Intl.NumberFormat('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ` ${currency}`;
    };

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

    const handlePrintDocument = () => {
        window.print();
    };

    const handleStatusChange = (status: DocumentStatus) => {
        if (Object.values(DocumentStatus).includes(status)) {
            onStatusChange(document.id, status);
        }
    };

    const handleDeleteDocument = () => {
        if (window.confirm(`Czy na pewno chcesz usunąć ${DocumentTypeLabels[document.type].toLowerCase()} ${document.number}? Tej operacji nie można cofnąć.`)) {
            onDelete(document.id);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        <DocumentIcon>
                            {getDocumentIcon(document.type)}
                        </DocumentIcon>
                        <TitleText>
                            <span>Podgląd {DocumentTypeLabels[document.type].toLowerCase()}</span>
                            <DocumentNumber>{document.number}</DocumentNumber>
                        </TitleText>
                    </ModalTitle>
                    <ModalActions>
                        <ActionButton title="Edytuj dokument" onClick={() => onEdit(document)}>
                            <FaEdit />
                        </ActionButton>
                        {document.attachments && document.attachments.length > 0 && onDownloadAttachment && (
                            <ActionButton title="Pobierz załącznik" onClick={() => onDownloadAttachment(document.id)}>
                                <FaDownload />
                            </ActionButton>
                        )}
                        <ActionButton title="Drukuj dokument" onClick={handlePrintDocument}>
                            <FaPrint />
                        </ActionButton>
                        <ActionButton
                            title="Usuń dokument"
                            className="delete"
                            onClick={handleDeleteDocument}
                        >
                            <FaTrashAlt />
                        </ActionButton>
                        <CloseButton onClick={onClose}>
                            <FaTimes />
                        </CloseButton>
                    </ModalActions>
                </ModalHeader>

                <ModalContent>
                    {/* Document Header */}
                    <DocumentHeader>
                        <HeaderLeft>
                            <DocumentTypeDisplay>
                                {getDocumentIcon(document.type)}
                                <TypeText>{DocumentTypeLabels[document.type]}</TypeText>
                            </DocumentTypeDisplay>
                            <DocumentNumberDisplay>{document.number}</DocumentNumberDisplay>
                            <DocumentTitle>{document.title}</DocumentTitle>
                            {document.description && (
                                <DocumentDescription>{document.description}</DocumentDescription>
                            )}
                        </HeaderLeft>
                        <HeaderRight>
                            <DirectionBadge direction={document.direction}>
                                {TransactionDirectionLabels[document.direction]}
                            </DirectionBadge>
                        </HeaderRight>
                    </DocumentHeader>

                    {/* Document Details */}
                    <DocumentDetails>
                        <DetailItem>
                            <DetailLabel>Data wystawienia:</DetailLabel>
                            <DetailValue>{formatDate(document.issuedDate)}</DetailValue>
                        </DetailItem>
                        {document.dueDate && (
                            <DetailItem>
                                <DetailLabel>Termin płatności:</DetailLabel>
                                <DetailValue>{formatDate(document.dueDate)}</DetailValue>
                            </DetailItem>
                        )}
                        <DetailItem>
                            <DetailLabel>Metoda płatności:</DetailLabel>
                            <DetailValue>{PaymentMethodLabels[document.paymentMethod]}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                            <DetailLabel>Waluta:</DetailLabel>
                            <DetailValue>{document.currency}</DetailValue>
                        </DetailItem>
                        {document.protocolNumber && (
                            <DetailItem>
                                <DetailLabel>Powiązany protokół:</DetailLabel>
                                <DetailValue>
                                    <ProtocolLink href={`/orders/car-reception/${document.protocolId}`}>
                                        {document.protocolNumber}
                                    </ProtocolLink>
                                </DetailValue>
                            </DetailItem>
                        )}
                    </DocumentDetails>

                    {/* Address Section */}
                    <AddressSection>
                        <AddressBlock>
                            <AddressTitle>Sprzedawca</AddressTitle>
                            <AddressName>{document.sellerName}</AddressName>
                            {document.sellerTaxId && <AddressDetail>NIP: {document.sellerTaxId}</AddressDetail>}
                            {document.sellerAddress && <AddressDetail>{document.sellerAddress}</AddressDetail>}
                        </AddressBlock>
                        <AddressBlock>
                            <AddressTitle>Nabywca</AddressTitle>
                            <AddressName>{document.buyerName}</AddressName>
                            {document.buyerTaxId && <AddressDetail>NIP: {document.buyerTaxId}</AddressDetail>}
                            {document.buyerAddress && <AddressDetail>{document.buyerAddress}</AddressDetail>}
                        </AddressBlock>
                    </AddressSection>

                    {/* Items - only for documents with items */}
                    {document.items && document.items.length > 0 && (
                        <>
                            <SectionTitle>Pozycje dokumentu</SectionTitle>
                            <ItemsTable>
                                <thead>
                                <tr>
                                    <th>Lp.</th>
                                    <th>Nazwa towaru/usługi</th>
                                    <th>Ilość</th>
                                    <th>Cena jedn. netto</th>
                                    <th>VAT %</th>
                                    <th>Wartość netto</th>
                                    <th>Wartość brutto</th>
                                </tr>
                                </thead>
                                <tbody>
                                {document.items.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <ItemName>{item.name}</ItemName>
                                            {item.description && <ItemDescription>{item.description}</ItemDescription>}
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>{formatAmount(item.unitPrice, document.currency)}</td>
                                        <td>{item.taxRate}%</td>
                                        <td>{formatAmount(item.totalNet, document.currency)}</td>
                                        <td>{formatAmount(item.totalGross, document.currency)}</td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                        Razem:
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {formatAmount(document.totalNet, document.currency)}
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {formatAmount(document.totalGross, document.currency)}
                                    </td>
                                </tr>
                                </tfoot>
                            </ItemsTable>
                        </>
                    )}

                    {/* Summary for documents without detailed items */}
                    {(!document.items || document.items.length === 0) && (
                        <>
                            <SectionTitle>Podsumowanie finansowe</SectionTitle>
                            <SummarySection>
                                <SummaryGrid>
                                    <SummaryItem>
                                        <SummaryLabel>Kwota brutto:</SummaryLabel>
                                        <SummaryValue emphasis>{formatAmount(document.totalGross, document.currency)}</SummaryValue>
                                    </SummaryItem>
                                    {document.totalNet > 0 && (
                                        <>
                                            <SummaryItem>
                                                <SummaryLabel>Kwota netto:</SummaryLabel>
                                                <SummaryValue>{formatAmount(document.totalNet, document.currency)}</SummaryValue>
                                            </SummaryItem>
                                            <SummaryItem>
                                                <SummaryLabel>Kwota VAT:</SummaryLabel>
                                                <SummaryValue>{formatAmount(document.totalTax, document.currency)}</SummaryValue>
                                            </SummaryItem>
                                        </>
                                    )}
                                </SummaryGrid>
                            </SummarySection>
                        </>
                    )}

                    {/* Notes */}
                    {document.notes && (
                        <>
                            <SectionTitle>Uwagi</SectionTitle>
                            <NotesSection>
                                {document.notes}
                            </NotesSection>
                        </>
                    )}

                    {/* Status */}
                    <StatusDisplaySection>
                        <StatusTitle>Status dokumentu:</StatusTitle>
                        <StatusInfo>
                            <StatusBadge status={document.status}>
                                {DocumentStatusLabels[document.status]}
                            </StatusBadge>
                        </StatusInfo>
                    </StatusDisplaySection>

                    {/* Attachments */}
                    {document.attachments && document.attachments.length > 0 && (
                        <>
                            <SectionTitle>Załączniki</SectionTitle>
                            <AttachmentsList>
                                {document.attachments.map(att => (
                                    <AttachmentItem key={att.id}>
                                        <AttachmentIcon>
                                            <FaFilePdf />
                                        </AttachmentIcon>
                                        <AttachmentInfo>
                                            <AttachmentName>{att.name}</AttachmentName>
                                            <AttachmentSize>
                                                {Math.round(att.size / 1024)} KB • {new Date(att.uploadedAt).toLocaleDateString('pl-PL')}
                                            </AttachmentSize>
                                        </AttachmentInfo>
                                        {onDownloadAttachment && (
                                            <DownloadLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onDownloadAttachment(document.id);
                                                }}
                                                title="Pobierz załącznik"
                                            >
                                                <FaDownload />
                                            </DownloadLink>
                                        )}
                                    </AttachmentItem>
                                ))}
                            </AttachmentsList>
                        </>
                    )}

                    {/* Status Actions */}
                    <StatusActions>
                        <StatusTitle>Zmień status dokumentu:</StatusTitle>
                        <StatusButtons>
                            {Object.entries(DocumentStatusLabels).map(([key, label]) => {
                                const status = key as DocumentStatus;
                                return (
                                    <StatusButton
                                        key={key}
                                        status={status}
                                        active={document.status === status}
                                        onClick={() => handleStatusChange(status)}
                                        disabled={document.status === status}
                                    >
                                        {label}
                                    </StatusButton>
                                );
                            })}
                        </StatusButtons>
                    </StatusActions>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${brandTheme.zIndex.modal};
    padding: ${brandTheme.spacing.lg};
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background-color: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 95vw;
    max-width: 1200px;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: ${brandTheme.breakpoints.md}) {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const ModalTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const DocumentIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${brandTheme.primaryGhost};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 20px;
`;

const TitleText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;

    span {
        font-size: 20px;
        font-weight: 700;
        color: ${brandTheme.text.primary};
    }
`;

const DocumentNumber = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
`;

const ModalActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: ${brandTheme.surfaceHover};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    font-size: 16px;

    &:hover {
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
        transform: scale(1.05);
    }

    &.delete {
        &:hover {
            background: ${brandTheme.status.errorLight};
            color: ${brandTheme.status.error};
        }
    }

    &:active {
        transform: scale(0.95);
    }
`;

const CloseButton = styled(ActionButton)`
    margin-left: ${brandTheme.spacing.sm};

    &:hover {
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
    }
`;

const ModalContent = styled.div`
    overflow-y: auto;
    flex: 1;
    padding: ${brandTheme.spacing.xl};
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: ${brandTheme.borderHover};
    }
`;

const DocumentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${brandTheme.spacing.xl};
    padding-bottom: ${brandTheme.spacing.lg};
    border-bottom: 2px solid ${brandTheme.border};
`;

const HeaderLeft = styled.div`
    flex: 1;
`;

const HeaderRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${brandTheme.spacing.xs};
`;

const DocumentTypeDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.sm};

    svg {
        font-size: 18px;
        color: ${brandTheme.primary};
    }
`;

const TypeText = styled.span`
    font-size: 14px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
`;

const DocumentNumberDisplay = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${brandTheme.primary};
    margin-bottom: ${brandTheme.spacing.sm};
`;

const DocumentTitle = styled.h1`
    font-size: 24px;
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    color: ${brandTheme.text.primary};
    line-height: 1.2;
    font-weight: 700;
`;

const DocumentDescription = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.muted};
    font-style: italic;
`;

const DirectionBadge = styled.div<{ direction: any }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    background-color: ${props => `${TransactionDirectionColors[props.direction]}22`};
    color: ${props => TransactionDirectionColors[props.direction]};
    border: 1px solid ${props => `${TransactionDirectionColors[props.direction]}44`};
`;

const DocumentDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.xl};
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
`;

const DetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const AddressSection = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xl};
    margin-bottom: ${brandTheme.spacing.xl};

    @media (max-width: ${brandTheme.breakpoints.md}) {
        flex-direction: column;
    }
`;

const AddressBlock = styled.div`
    flex: 1;
    padding: ${brandTheme.spacing.lg};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    background: ${brandTheme.surface};
`;

const AddressTitle = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.sm};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const AddressName = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const AddressDetail = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;
    margin-bottom: ${brandTheme.spacing.xs};

    &:last-child {
        margin-bottom: 0;
    }
`;

const ProtocolLink = styled.a`
    color: ${brandTheme.primary};
    text-decoration: none;
    font-weight: 600;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.primaryGhost};
        text-decoration: underline;
    }
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    color: ${brandTheme.text.primary};
    margin: ${brandTheme.spacing.xl} 0 ${brandTheme.spacing.md} 0;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &:first-of-type {
        margin-top: 0;
    }

    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background: ${brandTheme.primary};
        border-radius: 2px;
    }
`;

const ItemsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: ${brandTheme.spacing.xl};
    font-size: 14px;
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    overflow: hidden;

    th {
        padding: ${brandTheme.spacing.md};
        background: ${brandTheme.surfaceAlt};
        text-align: left;
        font-weight: 600;
        color: ${brandTheme.text.primary};
        border-bottom: 2px solid ${brandTheme.border};
        font-size: 13px;
    }

    td {
        padding: ${brandTheme.spacing.md};
        border-bottom: 1px solid ${brandTheme.borderLight};
        vertical-align: top;
    }

    tbody tr:hover {
        background: ${brandTheme.surfaceAlt};
    }

    tfoot {
        background: ${brandTheme.surfaceAlt};
        font-weight: 600;
    }

    tfoot td {
        padding: ${brandTheme.spacing.md};
        border-top: 2px solid ${brandTheme.border};
        border-bottom: none;
    }
`;

const ItemName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
`;

const ItemDescription = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-style: italic;
`;

const SummarySection = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    margin-bottom: ${brandTheme.spacing.xl};
    border: 1px solid ${brandTheme.border};
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${brandTheme.spacing.md};
`;

const SummaryItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.sm} 0;
    border-bottom: 1px solid ${brandTheme.borderLight};

    &:last-child {
        border-bottom: none;
    }
`;

const SummaryLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 600;
`;

const SummaryValue = styled.div<{ emphasis?: boolean }>`
    font-size: ${props => props.emphasis ? '16px' : '14px'};
    font-weight: ${props => props.emphasis ? '700' : '600'};
    color: ${brandTheme.text.primary};
`;

const NotesSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    margin-bottom: ${brandTheme.spacing.xl};
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
    white-space: pre-line;
    line-height: 1.6;
`;

const StatusDisplaySection = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    margin: ${brandTheme.spacing.xl} 0;
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
`;

const StatusInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const StatusBadge = styled.div<{ status: DocumentStatus }>`
    display: inline-block;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 600;
    background-color: ${props => `${DocumentStatusColors[props.status]}22`};
    color: ${props => DocumentStatusColors[props.status]};
    border: 1px solid ${props => `${DocumentStatusColors[props.status]}44`};
`;

const AttachmentsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.lg};
`;

const AttachmentItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.border};
    font-size: 14px;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
    }
`;

const AttachmentIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: ${brandTheme.radius.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    font-size: 18px;
`;

const AttachmentInfo = styled.div`
    flex: 1;
`;

const AttachmentName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
`;

const AttachmentSize = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
`;

const DownloadLink = styled.a`
    color: ${brandTheme.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xs};
    border-radius: ${brandTheme.radius.sm};
    transition: all ${brandTheme.transitions.normal};
    text-decoration: none;

    &:hover {
        background: ${brandTheme.primary};
        color: white;
    }
`;

const StatusActions = styled.div`
    margin-top: ${brandTheme.spacing.xl};
    border-top: 2px solid ${brandTheme.border};
    padding-top: ${brandTheme.spacing.xl};
`;

const StatusTitle = styled.h4`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &::before {
        content: '';
        width: 3px;
        height: 16px;
        background: ${brandTheme.primary};
        border-radius: 2px;
    }
`;

const StatusButtons = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.sm};
`;

const StatusButton = styled.button<{ status: DocumentStatus; active: boolean }>`
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: ${props => props.active ? 'default' : 'pointer'};
    background-color: ${props => props.active ? `${DocumentStatusColors[props.status]}22` : brandTheme.surface};
   color: ${props => DocumentStatusColors[props.status]};
   border: 2px solid ${props => props.active ? DocumentStatusColors[props.status] : `${DocumentStatusColors[props.status]}44`};
   opacity: ${props => props.active ? 1 : 0.8};
   transition: all ${brandTheme.transitions.normal};
   
   &:hover:not(:disabled) {
       opacity: 1;
       background-color: ${props => `${DocumentStatusColors[props.status]}11`};
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.sm};
   }
   
   &:disabled {
       cursor: default;
       transform: none;
       box-shadow: none;
   }

   &:active:not(:disabled) {
       transform: translateY(0);
   }
`;

export default DocumentViewModal;