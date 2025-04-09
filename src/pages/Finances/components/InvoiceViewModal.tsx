import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaFilePdf, FaEdit, FaDownload, FaPrint } from 'react-icons/fa';
import { Invoice, InvoiceStatusLabels, InvoiceStatusColors, PaymentMethodLabels } from '../../../types';

interface InvoiceViewModalProps {
    isOpen: boolean;
    invoice: Invoice;
    onClose: () => void;
    onEdit: (invoice: Invoice) => void;
}

const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
                                                               isOpen,
                                                               invoice,
                                                               onClose,
                                                               onEdit
                                                           }) => {
    if (!isOpen) return null;

    // Funkcja do formatowania daty
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    // Funkcja do formatowania kwoty
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        Podgląd faktury {invoice.number}
                    </ModalTitle>
                    <ModalActions>
                        <ActionButton title="Edytuj fakturę" onClick={() => onEdit(invoice)}>
                            <FaEdit />
                        </ActionButton>
                        <ActionButton title="Pobierz fakturę" onClick={() => console.log('Pobieranie faktury')}>
                            <FaDownload />
                        </ActionButton>
                        <ActionButton title="Drukuj fakturę" onClick={() => console.log('Drukowanie faktury')}>
                            <FaPrint />
                        </ActionButton>
                        <CloseButton onClick={onClose}>
                            <FaTimes />
                        </CloseButton>
                    </ModalActions>
                </ModalHeader>
                <ModalContent>
                    <InvoiceHeader>
                        <div>
                            <HeaderTitle>Faktura VAT</HeaderTitle>
                            <InvoiceNumber>{invoice.number}</InvoiceNumber>
                            <InvoiceTitle>{invoice.title}</InvoiceTitle>
                        </div>
                        <InvoiceStatus status={invoice.status}>
                            {InvoiceStatusLabels[invoice.status]}
                        </InvoiceStatus>
                    </InvoiceHeader>

                    <InvoiceDetails>
                        <DetailItem>
                            <DetailLabel>Data wystawienia:</DetailLabel>
                            <DetailValue>{formatDate(invoice.issuedDate)}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                            <DetailLabel>Termin płatności:</DetailLabel>
                            <DetailValue>{formatDate(invoice.dueDate)}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                            <DetailLabel>Metoda płatności:</DetailLabel>
                            <DetailValue>{PaymentMethodLabels[invoice.paymentMethod]}</DetailValue>
                        </DetailItem>
                        {invoice.protocolNumber && (
                            <DetailItem>
                                <DetailLabel>Protokół:</DetailLabel>
                                <DetailValue>
                                    <ProtocolLink href={`/orders/car-reception/${invoice.protocolId}`}>
                                        {invoice.protocolNumber}
                                    </ProtocolLink>
                                </DetailValue>
                            </DetailItem>
                        )}
                    </InvoiceDetails>

                    <AddressSection>
                        <AddressBlock>
                            <AddressTitle>Sprzedawca</AddressTitle>
                            <AddressName>{invoice.sellerName}</AddressName>
                            {invoice.sellerTaxId && <AddressDetail>NIP: {invoice.sellerTaxId}</AddressDetail>}
                            {invoice.sellerAddress && <AddressDetail>{invoice.sellerAddress}</AddressDetail>}
                        </AddressBlock>
                        <AddressBlock>
                            <AddressTitle>Nabywca</AddressTitle>
                            <AddressName>{invoice.buyerName}</AddressName>
                            {invoice.buyerTaxId && <AddressDetail>NIP: {invoice.buyerTaxId}</AddressDetail>}
                            {invoice.buyerAddress && <AddressDetail>{invoice.buyerAddress}</AddressDetail>}
                        </AddressBlock>
                    </AddressSection>

                    <SectionTitle>Pozycje faktury</SectionTitle>
                    <ItemsTable>
                        <thead>
                        <tr>
                            <th>Lp.</th>
                            <th>Nazwa</th>
                            <th>Ilość</th>
                            <th>Cena jedn. netto</th>
                            <th>VAT %</th>
                            <th>Wartość netto</th>
                            <th>Wartość brutto</th>
                        </tr>
                        </thead>
                        <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <ItemName>{item.name}</ItemName>
                                    {item.description && <ItemDescription>{item.description}</ItemDescription>}
                                </td>
                                <td>{item.quantity}</td>
                                <td>{formatAmount(item.unitPrice)} {invoice.currency}</td>
                                <td>{item.taxRate}%</td>
                                <td>{formatAmount(item.totalNet)} {invoice.currency}</td>
                                <td>{formatAmount(item.totalGross)} {invoice.currency}</td>
                            </tr>
                        ))}
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                Razem:
                            </td>
                            <td>{formatAmount(invoice.totalNet)} {invoice.currency}</td>
                            <td>{formatAmount(invoice.totalGross)} {invoice.currency}</td>
                        </tr>
                        </tfoot>
                    </ItemsTable>

                    {invoice.notes && (
                        <>
                            <SectionTitle>Uwagi</SectionTitle>
                            <NotesSection>
                                {invoice.notes}
                            </NotesSection>
                        </>
                    )}

                    {invoice.attachments.length > 0 && (
                        <>
                            <SectionTitle>Załączniki</SectionTitle>
                            <AttachmentsList>
                                {invoice.attachments.map(att => (
                                    <AttachmentItem key={att.id}>
                                        <FaFilePdf />
                                        <AttachmentName>{att.name}</AttachmentName>
                                        <AttachmentSize>
                                            {Math.round(att.size / 1024)} KB
                                        </AttachmentSize>
                                        <DownloadLink href="#" onClick={(e) => { e.preventDefault(); console.log(`Pobieranie załącznika: ${att.name}`); }}>
                                            <FaDownload />
                                        </DownloadLink>
                                    </AttachmentItem>
                                ))}
                            </AttachmentsList>
                        </>
                    )}
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
    width: 900px;
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

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
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
    padding: 4px;
    
    &:hover {
        color: #2980b9;
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
    padding: 0;
    margin-left: 8px;
    
    &:hover {
        color: #34495e;
    }
`;

const ModalContent = styled.div`
    overflow-y: auto;
    padding: 24px;
`;

const InvoiceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
`;

const HeaderTitle = styled.h1`
    font-size: 24px;
    margin: 0 0 8px 0;
    color: #2c3e50;
`;

const InvoiceNumber = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: #3498db;
    margin-bottom: 4px;
`;

const InvoiceTitle = styled.div`
    font-size: 16px;
    color: #7f8c8d;
`;

const InvoiceStatus = styled.div<{ status: string }>`
    display: inline-block;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    background-color: ${props => `${InvoiceStatusColors[props.status]}22`};
    color: ${props => InvoiceStatusColors[props.status]};
    border: 1px solid ${props => `${InvoiceStatusColors[props.status]}44`};
`;

const InvoiceDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
    background-color: #f8f9fa;
    padding: 16px;
    border-radius: 4px;
`;

const DetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const DetailValue = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
`;

const AddressSection = styled.div`
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const AddressBlock = styled.div`
    flex: 1;
    padding: 16px;
    border: 1px solid #eef2f7;
    border-radius: 4px;
`;

const AddressTitle = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 8px;
`;

const AddressName = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 4px;
`;

const AddressDetail = styled.div`
    font-size: 14px;
    color: #34495e;
    line-height: 1.4;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    color: #2c3e50;
    margin: 0 0 16px 0;
    font-weight: 600;
`;

const ItemsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 14px;
    
    th {
        padding: 12px 8px;
        background-color: #f8f9fa;
        text-align: left;
        font-weight: 600;
        color: #2c3e50;
        border-bottom: 2px solid #eef2f7;
    }
    
    td {
        padding: 8px;
        border-bottom: 1px solid #eef2f7;
        vertical-align: middle;
    }
    
    tbody tr:hover {
        background-color: #f8f9fa;
    }
`;

const ItemName = styled.div`
    font-weight: 500;
    color: #2c3e50;
`;

const ItemDescription = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
`;

const NotesSection = styled.div`
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 24px;
    font-size: 14px;
    color: #34495e;
    border: 1px solid #eef2f7;
    white-space: pre-line;
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
    
    svg {
        color: #e74c3c;
        font-size: 20px;
    }
`;

const AttachmentName = styled.div`
    flex: 1;
    font-weight: 500;
    color: #2c3e50;
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
    padding: 4px;
    
    &:hover {
        color: #2980b9;
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

export default InvoiceViewModal;