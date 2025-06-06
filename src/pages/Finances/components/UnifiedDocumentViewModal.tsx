// src/pages/Finances/components/UnifiedDocumentViewModal.tsx - Professional Premium Automotive CRM
import React, { useRef } from 'react';
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
    FaExchangeAlt,
    FaCalendarAlt,
    FaUser,
    FaBuilding,
    FaMoneyBillWave,
    FaExternalLinkAlt
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
import UnifiedDocumentPrintView from "./UnifiedDocumentPrintView";

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

interface UnifiedDocumentViewModalProps {
    isOpen: boolean;
    document: UnifiedFinancialDocument;
    onClose: () => void;
    onEdit: (document: UnifiedFinancialDocument) => void;
    onStatusChange: (id: string, status: DocumentStatus) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onDownloadAttachment: (documentId: string) => void;
}

const UnifiedDocumentViewModal: React.FC<UnifiedDocumentViewModalProps> = ({
                                                                               isOpen,
                                                                               document,
                                                                               onClose,
                                                                               onEdit,
                                                                               onStatusChange,
                                                                               onDelete,
                                                                               onDownloadAttachment
                                                                           }) => {
    if (!isOpen) return null;

    // Funkcja do formatowania daty
    const formatDate = (dateString: string): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    // Funkcja do formatowania kwoty
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

    // Obsługa wydruku dokumentu
    const handlePrintDocument = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${DocumentTypeLabels[document.type]} ${document.number}</title>
                    </head>
                    <body>
                        <div id="print-root"></div>
                    </body>
                </html>
            `);
            printWindow.document.close();

            const printRoot = printWindow.document.getElementById('print-root');
            if (printRoot) {
                UnifiedDocumentPrintView.render(document, printWindow);
            }
        }
    };

    // Obsługa zmiany statusu dokumentu
    const handleStatusChange = (status: DocumentStatus) => {
        if (Object.values(DocumentStatus).includes(status)) {
            onStatusChange(document.id, status);
        }
    };

    // Obsługa usuwania dokumentu
    const handleDeleteDocument = () => {
        if (window.confirm(`Czy na pewno chcesz usunąć ${DocumentTypeLabels[document.type].toLowerCase()} ${document.number}? Tej operacji nie można cofnąć.`)) {
            onDelete(document.id);
        }
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        <TitleIcon $type={document.type}>
                            {getDocumentIcon(document.type)}
                        </TitleIcon>
                        <TitleContent>
                            <TitleText>
                                <span>Podgląd {DocumentTypeLabels[document.type].toLowerCase()}</span>
                                <DocumentNumber>{document.number}</DocumentNumber>
                            </TitleText>
                            <TitleSubtext>
                                {document.title}
                            </TitleSubtext>
                        </TitleContent>
                    </ModalTitle>
                    <ModalActions>
                        <ActionButton
                            title="Edytuj dokument"
                            $variant="edit"
                            onClick={() => onEdit(document)}
                        >
                            <FaEdit />
                        </ActionButton>
                        {document.attachments && document.attachments.length > 0 && (
                            <ActionButton
                                title="Pobierz załącznik"
                                $variant="download"
                                onClick={() => onDownloadAttachment(document.id)}
                            >
                                <FaDownload />
                            </ActionButton>
                        )}
                        <ActionButton
                            title="Drukuj dokument"
                            $variant="print"
                            onClick={handlePrintDocument}
                        >
                            <FaPrint />
                        </ActionButton>
                        <ActionButton
                            title="Usuń dokument"
                            $variant="delete"
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
                            <DocumentTypeDisplay $type={document.type}>
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
                            <DirectionBadge $direction={document.direction}>
                                {TransactionDirectionLabels[document.direction]}
                            </DirectionBadge>
                            <StatusBadge $status={document.status}>
                                {DocumentStatusLabels[document.status]}
                            </StatusBadge>
                        </HeaderRight>
                    </DocumentHeader>

                    {/* Document Details */}
                    <SectionTitle>
                        <SectionIcon><FaCalendarAlt /></SectionIcon>
                        Szczegóły dokumentu
                    </SectionTitle>
                    <DocumentDetails>
                        <DetailItem>
                            <DetailIcon><FaCalendarAlt /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>Data wystawienia</DetailLabel>
                                <DetailValue>{formatDate(document.issuedDate)}</DetailValue>
                            </DetailContent>
                        </DetailItem>
                        {document.dueDate && (
                            <DetailItem>
                                <DetailIcon><FaCalendarAlt /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Termin płatności</DetailLabel>
                                    <DetailValue>{formatDate(document.dueDate)}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                        )}
                        <DetailItem>
                            <DetailIcon><FaMoneyBillWave /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>Metoda płatności</DetailLabel>
                                <DetailValue>{PaymentMethodLabels[document.paymentMethod]}</DetailValue>
                            </DetailContent>
                        </DetailItem>
                        <DetailItem>
                            <DetailIcon><FaMoneyBillWave /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>Waluta</DetailLabel>
                                <DetailValue>{document.currency}</DetailValue>
                            </DetailContent>
                        </DetailItem>
                        {document.protocolNumber && (
                            <DetailItem>
                                <DetailIcon><FaExternalLinkAlt /></DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Powiązany protokół</DetailLabel>
                                    <DetailValue>
                                        <ProtocolLink href={`/orders/car-reception/${document.protocolId}`}>
                                            {document.protocolNumber}
                                        </ProtocolLink>
                                    </DetailValue>
                                </DetailContent>
                            </DetailItem>
                        )}
                    </DocumentDetails>

                    {/* Address Section */}
                    <SectionTitle>
                        <SectionIcon><FaBuilding /></SectionIcon>
                        Dane kontrahentów
                    </SectionTitle>
                    <AddressSection>
                        <AddressBlock>
                            <AddressHeader>
                                <AddressIcon><FaBuilding /></AddressIcon>
                                <AddressTitle>Sprzedawca</AddressTitle>
                            </AddressHeader>
                            <AddressName>{document.sellerName}</AddressName>
                            {document.sellerTaxId && <AddressDetail>NIP: {document.sellerTaxId}</AddressDetail>}
                            {document.sellerAddress && <AddressDetail>{document.sellerAddress}</AddressDetail>}
                        </AddressBlock>
                        <AddressBlock>
                            <AddressHeader>
                                <AddressIcon><FaUser /></AddressIcon>
                                <AddressTitle>Nabywca</AddressTitle>
                            </AddressHeader>
                            <AddressName>{document.buyerName}</AddressName>
                            {document.buyerTaxId && <AddressDetail>NIP: {document.buyerTaxId}</AddressDetail>}
                            {document.buyerAddress && <AddressDetail>{document.buyerAddress}</AddressDetail>}
                        </AddressBlock>
                    </AddressSection>

                    {/* Items - only for invoices with items */}
                    {document.type === DocumentType.INVOICE && document.items && document.items.length > 0 && (
                        <>
                            <SectionTitle>
                                <SectionIcon><FaFileInvoiceDollar /></SectionIcon>
                                Pozycje dokumentu
                            </SectionTitle>
                            <ItemsTable>
                                <ItemsTableHead>
                                    <ItemsTableRow>
                                        <ItemsTableHeader>Lp.</ItemsTableHeader>
                                        <ItemsTableHeader>Nazwa towaru/usługi</ItemsTableHeader>
                                        <ItemsTableHeader>Ilość</ItemsTableHeader>
                                        <ItemsTableHeader>Cena jedn. netto</ItemsTableHeader>
                                        <ItemsTableHeader>VAT %</ItemsTableHeader>
                                        <ItemsTableHeader>Wartość netto</ItemsTableHeader>
                                        <ItemsTableHeader>Wartość brutto</ItemsTableHeader>
                                    </ItemsTableRow>
                                </ItemsTableHead>
                                <ItemsTableBody>
                                    {document.items.map((item, index) => (
                                        <ItemsTableRow key={item.id || index}>
                                            <ItemsTableCell>{index + 1}</ItemsTableCell>
                                            <ItemsTableCell>
                                                <ItemName>{item.name}</ItemName>
                                                {item.description && <ItemDescription>{item.description}</ItemDescription>}
                                            </ItemsTableCell>
                                            <ItemsTableCell>{item.quantity}</ItemsTableCell>
                                            <ItemsTableCell>{formatAmount(item.unitPrice)} {document.currency}</ItemsTableCell>
                                            <ItemsTableCell>{item.taxRate}%</ItemsTableCell>
                                            <ItemsTableCell>{formatAmount(item.totalNet)} {document.currency}</ItemsTableCell>
                                            <ItemsTableCell>{formatAmount(item.totalGross)} {document.currency}</ItemsTableCell>
                                        </ItemsTableRow>
                                    ))}
                                </ItemsTableBody>
                                <ItemsTableFoot>
                                    <ItemsTableRow>
                                        <ItemsTableCell colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            Razem:
                                        </ItemsTableCell>
                                        <ItemsTableCell style={{ fontWeight: 'bold' }}>
                                            {formatAmount(document.totalNet)} {document.currency}
                                        </ItemsTableCell>
                                        <ItemsTableCell style={{ fontWeight: 'bold' }}>
                                            {formatAmount(document.totalGross)} {document.currency}
                                        </ItemsTableCell>
                                    </ItemsTableRow>
                                </ItemsTableFoot>
                            </ItemsTable>
                        </>
                    )}

                    {/* Summary for documents without detailed items */}
                    {(document.type !== DocumentType.INVOICE || !document.items || document.items.length === 0) && (
                        <>
                            <SectionTitle>
                                <SectionIcon><FaMoneyBillWave /></SectionIcon>
                                Podsumowanie finansowe
                            </SectionTitle>
                            <SummarySection>
                                <SummaryGrid>
                                    <SummaryItem>
                                        <SummaryLabel>Kwota brutto:</SummaryLabel>
                                        <SummaryValue $emphasis>{formatAmount(document.totalGross)} {document.currency}</SummaryValue>
                                    </SummaryItem>
                                    {document.totalNet > 0 && (
                                        <>
                                            <SummaryItem>
                                                <SummaryLabel>Kwota netto:</SummaryLabel>
                                                <SummaryValue>{formatAmount(document.totalNet)} {document.currency}</SummaryValue>
                                            </SummaryItem>
                                            <SummaryItem>
                                                <SummaryLabel>Kwota VAT:</SummaryLabel>
                                                <SummaryValue>{formatAmount(document.totalTax)} {document.currency}</SummaryValue>
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
                            <SectionTitle>
                                <SectionIcon><FaFileInvoiceDollar /></SectionIcon>
                                Uwagi
                            </SectionTitle>
                            <NotesSection>
                                {document.notes}
                            </NotesSection>
                        </>
                    )}

                    {/* Attachments */}
                    {document.attachments && document.attachments.length > 0 && (
                        <>
                            <SectionTitle>
                                <SectionIcon><FaFilePdf /></SectionIcon>
                                Załączniki
                            </SectionTitle>
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
                                    </AttachmentItem>
                                ))}
                            </AttachmentsList>
                        </>
                    )}

                    {/* Status Actions */}
                    <StatusActions>
                        <SectionTitle>
                            <SectionIcon><FaEdit /></SectionIcon>
                            Zmień status dokumentu
                        </SectionTitle>
                        <StatusButtons>
                            {Object.entries(DocumentStatusLabels).map(([key, label]) => {
                                const status = key as DocumentStatus;
                                return (
                                    <StatusButton
                                        key={key}
                                        $status={status}
                                        $active={document.status === status}
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
    width: 1200px;
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

const TitleText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};

    span {
        font-size: 20px;
        font-weight: 600;
        color: ${brandTheme.text.primary};
        letter-spacing: -0.025em;
    }
`;

const DocumentNumber = styled.div`
    font-size: 16px;
    color: ${brandTheme.primary};
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
`;

const TitleSubtext = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.4;
    margin-top: ${brandTheme.spacing.xs};
`;

const ModalActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;
`;

const ActionButton = styled.button<{ $variant: 'edit' | 'download' | 'print' | 'delete' }>`
    width: 44px;
    height: 44px;
    border: 2px solid transparent;
    border-radius: ${brandTheme.radius.lg};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;

    ${({ $variant }) => {
        switch ($variant) {
            case 'edit':
                return `
                    background: linear-gradient(135deg, ${brandTheme.status.warningLight} 0%, #fef3c7 100%);
                    color: ${brandTheme.status.warning};
                    border-color: ${brandTheme.status.warning}30;
                    &:hover {
                        background: linear-gradient(135deg, ${brandTheme.status.warning} 0%, #d97706 100%);
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'download':
                return `
                    background: linear-gradient(135deg, ${brandTheme.status.infoLight} 0%, #e0f2fe 100%);
                    color: ${brandTheme.status.info};
                    border-color: ${brandTheme.status.info}30;
                    &:hover {
                        background: linear-gradient(135deg, ${brandTheme.status.info} 0%, #0284c7 100%);
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'print':
                return `
                    background: linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, rgba(26, 54, 93, 0.02) 100%);
                    color: ${brandTheme.primary};
                    border-color: ${brandTheme.primary}30;
                    &:hover {
                        background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'delete':
                return `
                    background: linear-gradient(135deg, ${brandTheme.status.errorLight} 0%, #fef2f2 100%);
                    color: ${brandTheme.status.error};
                    border-color: ${brandTheme.status.error}30;
                    &:hover {
                        background: linear-gradient(135deg, ${brandTheme.status.error} 0%, #dc2626 100%);
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            default:
                return '';
        }
    }}

    &:active {
        transform: translateY(0);
    }
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
    margin-left: ${brandTheme.spacing.sm};

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
    padding: ${brandTheme.spacing.xl};

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

const DocumentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${brandTheme.spacing.xl};
    padding: ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, ${brandTheme.surface} 100%);
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};
`;

const HeaderLeft = styled.div`
    flex: 1;
`;

const HeaderRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${brandTheme.spacing.sm};
`;

const DocumentTypeDisplay = styled.div<{ $type: DocumentType }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};

    svg {
        font-size: 16px;
    }
`;

const TypeText = styled.span`
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DocumentNumberDisplay = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.primary};
    margin-bottom: ${brandTheme.spacing.sm};
    letter-spacing: 1px;
    text-transform: uppercase;
`;

const DocumentTitle = styled.h1`
    font-size: 28px;
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    color: ${brandTheme.text.primary};
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.025em;
`;

const DocumentDescription = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.tertiary};
    margin-bottom: ${brandTheme.spacing.md};
    font-style: italic;
    line-height: 1.4;
`;

const DirectionBadge = styled.div<{ $direction: any }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
`;

const StatusBadge = styled.div<{ $status: DocumentStatus }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => {
        switch (props.$status) {
            case 'PAID':
                return brandTheme.status.successLight;
            case 'NOT_PAID':
                return brandTheme.status.errorLight;
            case 'PARTIALLY_PAID':
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
            case 'PARTIALLY_PAID':
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
            case 'PARTIALLY_PAID':
                return `${brandTheme.status.warning}30`;
            default:
                return brandTheme.border;
        }
    }};
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 18px;
    color: ${brandTheme.primary};
    margin: ${brandTheme.spacing.xl} 0 ${brandTheme.spacing.lg} 0;
    font-weight: 600;
    padding-bottom: ${brandTheme.spacing.sm};
    border-bottom: 2px solid ${brandTheme.primaryGhost};

    &:first-of-type {
        margin-top: 0;
    }
`;

const SectionIcon = styled.div`
    color: ${brandTheme.primary};
    font-size: 16px;
`;

const DocumentDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.xl};
`;

const DetailItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.borderLight};
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary}30;
    }
`;

const DetailIcon = styled.div`
    width: 32px;
    height: 32px;
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.muted};
    font-size: 14px;
    flex-shrink: 0;
    box-shadow: ${brandTheme.shadow.xs};
`;

const DetailContent = styled.div`
    flex: 1;
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    margin-bottom: ${brandTheme.spacing.xs};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
    font-size: 15px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
`;

const ProtocolLink = styled.a`
    color: ${brandTheme.primary};
    text-decoration: none;
    font-weight: 600;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    background: ${brandTheme.primaryGhost};
    border: 1px solid ${brandTheme.primary}30;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const AddressSection = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xl};
    margin-bottom: ${brandTheme.spacing.xl};

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const AddressBlock = styled.div`
    flex: 1;
    padding: ${brandTheme.spacing.lg};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xl};
    background: ${brandTheme.surfaceAlt};
`;

const AddressHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.md};
`;

const AddressIcon = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.muted};
    font-size: 12px;
`;

const AddressTitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.tertiary};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const AddressName = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.sm};
    line-height: 1.3;
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

const ItemsTable = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xl};
    overflow: hidden;
    margin-bottom: ${brandTheme.spacing.xl};
    box-shadow: ${brandTheme.shadow.xs};
`;

const ItemsTableHead = styled.div`
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
`;

const ItemsTableBody = styled.div`
    background: ${brandTheme.surface};
`;

const ItemsTableFoot = styled.div`
    background: ${brandTheme.surfaceAlt};
    border-top: 2px solid ${brandTheme.border};
`;

const ItemsTableRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${brandTheme.borderLight};

    &:last-child {
        border-bottom: none;
    }

    ${ItemsTableBody} &:hover {
        background: ${brandTheme.surfaceHover};
    }
`;

const ItemsTableHeader = styled.div`
    flex: 1;
    padding: ${brandTheme.spacing.md};
    font-size: 13px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:first-child {
        flex: 0 0 60px;
        text-align: center;
    }
    &:nth-child(3) {
        flex: 0 0 80px;
        text-align: center;
    }
    &:nth-child(4) {
        flex: 0 0 120px;
        text-align: right;
    }
    &:nth-child(5) {
        flex: 0 0 80px;
        text-align: center;
    }
    &:nth-child(6) {
        flex: 0 0 120px;
        text-align: right;
    }
    &:nth-child(7) {
        flex: 0 0 120px;
        text-align: right;
    }
`;

const ItemsTableCell = styled.div`
    flex: 1;
    padding: ${brandTheme.spacing.md};
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    display: flex;
    align-items: center;

    &:first-child {
        flex: 0 0 60px;
        justify-content: center;
        font-weight: 600;
        color: ${brandTheme.text.primary};
    }
    &:nth-child(3) {
        flex: 0 0 80px;
        justify-content: center;
    }
    &:nth-child(4) {
        flex: 0 0 120px;
        justify-content: flex-end;
    }
    &:nth-child(5) {
        flex: 0 0 80px;
        justify-content: center;
    }
    &:nth-child(6) {
        flex: 0 0 120px;
        justify-content: flex-end;
        font-weight: 600;
    }
    &:nth-child(7) {
        flex: 0 0 120px;
        justify-content: flex-end;
        font-weight: 600;
    }
`;

const ItemName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const ItemDescription = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-style: italic;
    line-height: 1.3;
`;

const SummarySection = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.xl};
    margin-bottom: ${brandTheme.spacing.xl};
    border: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${brandTheme.spacing.md};
`;

const SummaryItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md} 0;
    border-bottom: 1px solid ${brandTheme.border};

    &:last-child {
        border-bottom: none;
        padding-top: ${brandTheme.spacing.lg};
        border-top: 2px solid ${brandTheme.primary};
        margin-top: ${brandTheme.spacing.sm};
    }
`;

const SummaryLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const SummaryValue = styled.div<{ $emphasis?: boolean }>`
    font-size: ${props => props.$emphasis ? '18px' : '16px'};
    font-weight: ${props => props.$emphasis ? '700' : '600'};
    color: ${props => props.$emphasis ? brandTheme.primary : brandTheme.text.primary};
`;

const NotesSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.xl};
    margin-bottom: ${brandTheme.spacing.xl};
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
    white-space: pre-line;
    line-height: 1.6;
    border-left: 4px solid ${brandTheme.primary};
    box-shadow: ${brandTheme.shadow.xs};
`;

const AttachmentsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.xl};
`;

const AttachmentItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary}30;
        transform: translateX(4px);
    }
`;

const AttachmentIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: ${brandTheme.radius.lg};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: ${brandTheme.shadow.xs};
`;

const AttachmentInfo = styled.div`
    flex: 1;
`;

const AttachmentName = styled.div`
    font-weight: 500;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    font-size: 15px;
`;

const AttachmentSize = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
    font-weight: 500;
`;

const DownloadLink = styled.a`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: ${brandTheme.radius.md};
    background: ${brandTheme.status.infoLight};
    color: ${brandTheme.status.info};
    text-decoration: none;
    transition: all 0.2s ease;
    border: 1px solid ${brandTheme.status.info}30;

    &:hover {
        background: ${brandTheme.status.info};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const StatusActions = styled.div`
    margin-top: ${brandTheme.spacing.xl};
    border-top: 2px solid ${brandTheme.borderLight};
    padding-top: ${brandTheme.spacing.xl};
`;

const StatusButtons = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.md};
`;

const StatusButton = styled.button<{ $status: DocumentStatus; $active: boolean }>`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 500;
    cursor: ${props => props.$active ? 'default' : 'pointer'};
    transition: all 0.2s ease;
    border: 1px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    opacity: ${props => props.$active ? 1 : 0.8};

    &:hover:not(:disabled) {
        opacity: 1;
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
    }

    &:disabled {
        cursor: default;
    }

    &:active:not(:disabled) {
        transform: none;
    }
`;

export default UnifiedDocumentViewModal;