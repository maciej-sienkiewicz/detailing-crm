// src/pages/Finances/components/UnifiedDocumentViewModal.tsx
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
    const documentContentRef = useRef<HTMLDivElement>(null);

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
        const printContent = documentContentRef.current;
        if (printContent) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>${DocumentTypeLabels[document.type]} ${document.number}</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    margin: 20px;
                                    color: #333;
                                }
                                .no-print {
                                    display: none !important;
                                }
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin: 20px 0;
                                }
                                th, td {
                                    border: 1px solid #ddd;
                                    padding: 8px;
                                    text-align: left;
                                }
                                th {
                                    background-color: #f5f5f5;
                                }
                                .document-header {
                                    display: flex;
                                    justify-content: space-between;
                                    margin-bottom: 20px;
                                }
                                .address-section {
                                    display: flex;
                                    gap: 20px;
                                    margin: 20px 0;
                                }
                                .address-block {
                                    flex: 1;
                                    border: 1px solid #ddd;
                                    padding: 15px;
                                }
                                .section-title {
                                    font-size: 16px;
                                    font-weight: bold;
                                    margin: 20px 0 10px 0;
                                }
                                .detail-grid {
                                    display: grid;
                                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                                    gap: 15px;
                                    margin: 20px 0;
                                    padding: 15px;
                                    background-color: #f9f9f9;
                                }
                            </style>
                        </head>
                        <body>
                            ${printContent.innerHTML}
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
                printWindow.close();
            }
        }
    };

    // Obsługa zmiany statusu dokumentu
    const handleStatusChange = (status: DocumentStatus) => {
        if (Object.values(DocumentStatus).includes(status)) {
            onStatusChange(document.id, status);
        } else {
            console.error('Nieprawidłowy status dokumentu:', status);
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
                        {getDocumentIcon(document.type)}
                        <TitleText>
                            <span>Podgląd {DocumentTypeLabels[document.type].toLowerCase()}</span>
                            <DocumentNumber>{document.number}</DocumentNumber>
                        </TitleText>
                    </ModalTitle>
                    <ModalActions>
                        <ActionButton title="Edytuj dokument" onClick={() => onEdit(document)}>
                            <FaEdit />
                        </ActionButton>
                        {document.attachments && document.attachments.length > 0 && (
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
                    {/* Zawartość dokumentu do wydruku */}
                    <DocumentContent id="document-content" ref={documentContentRef}>
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
                            {document.visitId && (
                                <DetailItem>
                                    <DetailLabel>Powiązana wizyta:</DetailLabel>
                                    <DetailValue>
                                        <ProtocolLink href={`/appointments/${document.visitId}`}>
                                            Wizyta #{document.visitId}
                                        </ProtocolLink>
                                    </DetailValue>
                                </DetailItem>
                            )}
                        </DocumentDetails>

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

                        {/* Pozycje - tylko dla faktur z pozycjami */}
                        {document.type === DocumentType.INVOICE && document.items && document.items.length > 0 && (
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
                                            <td>{formatAmount(item.unitPrice)} {document.currency}</td>
                                            <td>{item.taxRate}%</td>
                                            <td>{formatAmount(item.totalNet)} {document.currency}</td>
                                            <td>{formatAmount(item.totalGross)} {document.currency}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            Razem:
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>
                                            {formatAmount(document.totalNet)} {document.currency}
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>
                                            {formatAmount(document.totalGross)} {document.currency}
                                        </td>
                                    </tr>
                                    </tfoot>
                                </ItemsTable>
                            </>
                        )}

                        {/* Podsumowanie kwot - dla dokumentów bez szczegółowych pozycji */}
                        {(document.type !== DocumentType.INVOICE || !document.items || document.items.length === 0) && (
                            <>
                                <SectionTitle>Podsumowanie finansowe</SectionTitle>
                                <SummarySection>
                                    <SummaryGrid>
                                        <SummaryItem>
                                            <SummaryLabel>Kwota brutto:</SummaryLabel>
                                            <SummaryValue emphasis>{formatAmount(document.totalGross)} {document.currency}</SummaryValue>
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
                                        {document.paidAmount !== undefined && document.paidAmount > 0 && (
                                            <SummaryItem>
                                                <SummaryLabel>Kwota zapłacona:</SummaryLabel>
                                                <SummaryValue>{formatAmount(document.paidAmount)} {document.currency}</SummaryValue>
                                            </SummaryItem>
                                        )}
                                    </SummaryGrid>
                                </SummarySection>
                            </>
                        )}

                        {document.notes && (
                            <>
                                <SectionTitle>Uwagi</SectionTitle>
                                <NotesSection>
                                    {document.notes}
                                </NotesSection>
                            </>
                        )}
                    </DocumentContent>

                    {/* Sekcja statusu - widoczna tylko w interfejsie, nie w wersji do druku */}
                    <StatusDisplaySection className="no-print">
                        <StatusTitle>Status dokumentu:</StatusTitle>
                        <StatusInfo>
                            <StatusBadge status={document.status as DocumentStatus}>
                                {DocumentStatusLabels[document.status]}
                            </StatusBadge>
                            {document.paidAmount !== undefined && document.paidAmount < document.totalGross && (
                                <PaidAmountInfo>
                                    Zapłacono: {formatAmount(document.paidAmount)} {document.currency} z {formatAmount(document.totalGross)} {document.currency}
                                </PaidAmountInfo>
                            )}
                        </StatusInfo>
                    </StatusDisplaySection>

                    {/* Załączniki - widoczne tylko w interfejsie */}
                    {document.attachments && document.attachments.length > 0 && (
                        <AttachmentsSection className="no-print">
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
                        </AttachmentsSection>
                    )}

                    {/* Akcje na statusie - widoczne tylko w interfejsie */}
                    <StatusActions className="no-print">
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

// Style komponentów
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
    z-index: 1000;
    padding: 20px;
`;

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 1000px;
    max-width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    background-color: #f8f9fa;
`;

const ModalTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    
    svg {
        font-size: 24px;
        color: #3498db;
    }
`;

const TitleText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    span {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
    }
`;

const DocumentNumber = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    font-weight: normal;
`;

const ModalActions = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #3498db;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        background-color: rgba(52, 152, 219, 0.1);
        color: #2980b9;
    }

    &.delete {
        color: #e74c3c;

        &:hover {
            background-color: rgba(231, 76, 60, 0.1);
            color: #c0392b;
        }
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 4px;
    margin-left: 8px;
    transition: all 0.2s;

    &:hover {
        background-color: rgba(127, 140, 141, 0.1);
        color: #34495e;
    }
`;

const ModalContent = styled.div`
    overflow-y: auto;
    padding: 24px;
`;

const DocumentContent = styled.div`
    /* Style dla wersji drukowanej */
    @media print {
        .no-print {
            display: none !important;
        }
    }
`;

const DocumentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #eef2f7;
`;

const HeaderLeft = styled.div`
    flex: 1;
`;

const HeaderRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
`;

const DocumentTypeDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    svg {
        font-size: 20px;
        color: #3498db;
    }
`;

const TypeText = styled.span`
    font-size: 16px;
    color: #7f8c8d;
    font-weight: 500;
`;

const DocumentNumberDisplay = styled.div`
    font-size: 20px;
    font-weight: 600;
    color: #3498db;
    margin-bottom: 8px;
`;

const DocumentTitle = styled.h1`
    font-size: 24px;
    margin: 0 0 8px 0;
    color: #2c3e50;
    line-height: 1.2;
`;

const DocumentDescription = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 16px;
    font-style: italic;
`;

const DirectionBadge = styled.div<{ direction: any }>`
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    background-color: ${props => `${TransactionDirectionColors[props.direction]}22`};
    color: ${props => TransactionDirectionColors[props.direction]};
    border: 1px solid ${props => `${TransactionDirectionColors[props.direction]}44`};
`;

const DocumentDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
    border: 1px solid #eef2f7;
`;

const DetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
`;

const AddressSection = styled.div`
    display: flex;
    gap: 24px;
    margin-bottom: 32px;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const AddressBlock = styled.div`
    flex: 1;
    padding: 20px;
    border: 1px solid #eef2f7;
    border-radius: 6px;
    background-color: #fdfdfd;
`;

const AddressTitle = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const AddressName = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
`;

const AddressDetail = styled.div`
    font-size: 14px;
    color: #34495e;
    line-height: 1.5;
    margin-bottom: 4px;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const ProtocolLink = styled.a`
    color: #3498db;
    text-decoration: none;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    color: #2c3e50;
    margin: 32px 0 16px 0;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &:first-of-type {
        margin-top: 0;
    }
    
    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background-color: #3498db;
        border-radius: 2px;
    }
`;

const ItemsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 14px;
    border: 1px solid #eef2f7;
    border-radius: 6px;
    overflow: hidden;

    th {
        padding: 12px 10px;
        background-color: #f8f9fa;
        text-align: left;
        font-weight: 600;
        color: #2c3e50;
        border-bottom: 2px solid #eef2f7;
        font-size: 13px;
    }

    td {
        padding: 12px 10px;
        border-bottom: 1px solid #eef2f7;
        vertical-align: top;
    }

    tbody tr:hover {
        background-color: #f8f9fa;
    }

    tfoot {
        background-color: #f1f2f6;
        font-weight: 600;
    }

    tfoot td {
        padding: 14px 10px;
        border-top: 2px solid #eef2f7;
        border-bottom: none;
    }
`;

const ItemName = styled.div`
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 2px;
`;

const ItemDescription = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    font-style: italic;
`;

const SummarySection = styled.div`
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
    margin-bottom: 24px;
    border: 1px solid #eef2f7;
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
`;

const SummaryItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #eef2f7;
    
    &:last-child {
        border-bottom: none;
    }
`;

const SummaryLabel = styled.div`
    font-size: 14px;
    color: #34495e;
    font-weight: 500;
`;

const SummaryValue = styled.div<{ emphasis?: boolean }>`
    font-size: ${props => props.emphasis ? '18px' : '16px'};
    font-weight: ${props => props.emphasis ? '700' : '600'};
    color: ${props => props.emphasis ? '#2c3e50' : '#2c3e50'};
`;

const NotesSection = styled.div`
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 24px;
    font-size: 14px;
    color: #34495e;
    border: 1px solid #eef2f7;
    white-space: pre-line;
    line-height: 1.6;
`;

const StatusDisplaySection = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 24px 0;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #eef2f7;
`;

const StatusInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const StatusBadge = styled.div<{ status: DocumentStatus }>`
    display: inline-block;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    background-color: ${props => `${DocumentStatusColors[props.status]}22`};
color: ${props => DocumentStatusColors[props.status]};
   border: 1px solid ${props => `${DocumentStatusColors[props.status]}44`};
`;

const PaidAmountInfo = styled.div`
   font-size: 14px;
   color: #7f8c8d;
   background-color: white;
   padding: 6px 12px;
   border-radius: 4px;
   border: 1px solid #eef2f7;
`;

const AttachmentsSection = styled.div`
   margin: 24px 0;
`;

const AttachmentsList = styled.div`
   display: flex;
   flex-direction: column;
   gap: 8px;
   margin-bottom: 16px;
`;

const AttachmentItem = styled.div`
   display: flex;
   align-items: center;
   gap: 12px;
   padding: 12px;
   background-color: #f8f9fa;
   border-radius: 4px;
   border: 1px solid #eef2f7;
   font-size: 14px;
   transition: all 0.2s;

   &:hover {
       background-color: #e8f4fd;
       border-color: #3498db;
   }
`;

const AttachmentIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 40px;
   height: 40px;
   border-radius: 6px;
   background-color: #fdf2f2;
   color: #e74c3c;
   font-size: 20px;
`;

const AttachmentInfo = styled.div`
   flex: 1;
`;

const AttachmentName = styled.div`
   font-weight: 500;
   color: #2c3e50;
   margin-bottom: 2px;
`;

const AttachmentSize = styled.div`
   color: #7f8c8d;
   font-size: 12px;
`;

const DownloadLink = styled.a`
   color: #3498db;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 8px;
   border-radius: 4px;
   transition: all 0.2s;
   text-decoration: none;

   &:hover {
       background-color: #3498db;
       color: white;
   }
`;

const StatusActions = styled.div`
   margin-top: 32px;
   border-top: 2px solid #eef2f7;
   padding-top: 24px;
`;

const StatusTitle = styled.h4`
   font-size: 16px;
   font-weight: 600;
   color: #2c3e50;
   margin: 0 0 16px 0;
   display: flex;
   align-items: center;
   gap: 8px;

   &::before {
       content: '';
       width: 3px;
       height: 16px;
       background-color: #3498db;
       border-radius: 2px;
   }
`;

const StatusButtons = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: 12px;
`;

const StatusButton = styled.button<{ status: DocumentStatus; active: boolean }>`
   padding: 10px 16px;
   border-radius: 4px;
   font-size: 14px;
   font-weight: 500;
   cursor: ${props => props.active ? 'default' : 'pointer'};
   background-color: ${props => props.active ? `${DocumentStatusColors[props.status]}22` : 'white'};
   color: ${props => DocumentStatusColors[props.status]};
   border: 2px solid ${props => props.active ? DocumentStatusColors[props.status] : `${DocumentStatusColors[props.status]}44`};
   opacity: ${props => props.active ? 1 : 0.8};
   transition: all 0.2s;
   
   &:hover:not(:disabled) {
       opacity: 1;
       background-color: ${props => `${DocumentStatusColors[props.status]}11`};
       transform: translateY(-1px);
       box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

export default UnifiedDocumentViewModal;