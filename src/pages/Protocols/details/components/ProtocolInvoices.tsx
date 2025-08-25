import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';
import {useNavigate} from 'react-router-dom';
import {
    FaBuilding,
    FaCalendarAlt,
    FaEdit,
    FaEye,
    FaFileDownload,
    FaFileInvoiceDollar,
    FaPercent,
    FaPlus,
    FaSitemap,
    FaTrashAlt
} from 'react-icons/fa';
import {CarReceptionProtocol} from '../../../../types';
import {DocumentStatus, DocumentType, TransactionDirection, UnifiedFinancialDocument} from '../../../../types/finance';
import {unifiedFinancialApi} from '../../../../api/unifiedFinancialApi';
import InvoiceFormModal from '../../../Finances/components/InvoiceFormModal';
import InvoiceViewModal from '../../../Finances/components/InvoiceViewModal';
import {useToast} from '../../../../components/common/Toast/Toast';

interface ProtocolInvoicesProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
}

const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    neutral: '#64748b',
    border: '#e2e8f0'
};

const ProtocolInvoices: React.FC<ProtocolInvoicesProps> = ({ protocol, onProtocolUpdate }) => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<UnifiedFinancialDocument[]>([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<UnifiedFinancialDocument | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    // Pobierz faktury powiązane z tym protokołem
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setIsLoading(true);
                // Wywołaj API do pobrania dokumentów związanych z protokołem
                const documentsResponse = await unifiedFinancialApi.fetchDocuments({
                    protocolId: protocol.id,
                    direction: TransactionDirection.EXPENSE // Filtrujemy tylko wydatki (faktury kosztowe)
                });

                // Wyciągnij dokumenty z odpowiedzi paginowanej
                const expenseDocuments = documentsResponse.data || [];

                setInvoices(expenseDocuments);
            } catch (error) {
                console.error('Błąd podczas pobierania faktur dla protokołu:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoices();
    }, [protocol.id]);

    // Format date for display
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd.MM.yyyy', { locale: pl });
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Obsługa zapisu faktury
    const handleSaveInvoice = async (invoiceData: any, file?: File | null) => {
        try {
            setIsLoading(true);

            // Dodaj ID protokołu i ustaw typ dokumentu jako faktura oraz kierunek jako wydatek
            const invoiceWithProtocolData = {
                ...invoiceData,
                protocolId: protocol.id,
                protocolNumber: `Protokół #${protocol.id}`,
                type: DocumentType.INVOICE,
                direction: TransactionDirection.EXPENSE,
            };

            if (selectedInvoice && selectedInvoice.id) {
                // Aktualizacja istniejącego dokumentu
                const updatedInvoice = await unifiedFinancialApi.updateDocument(
                    selectedInvoice.id,
                    invoiceWithProtocolData,
                    file
                );

                if (updatedInvoice) {
                    setInvoices(prevInvoices =>
                        prevInvoices.map(item =>
                            item.id === updatedInvoice.id ? updatedInvoice : item
                        )
                    );
                }
            } else {
                // Dodawanie nowego dokumentu
                const newInvoice = await unifiedFinancialApi.createDocument(invoiceWithProtocolData, file);

                if (newInvoice) {
                    setInvoices(prevInvoices => [...prevInvoices, newInvoice]);

                    // Wyświetl powiadomienie o dodaniu nowej faktury
                    showToast('info', 'Dodano nową pozycję w archiwum faktur', 3000);
                }
            }

            // Zamknij modal
            setShowFormModal(false);
            setSelectedInvoice(null);
        } catch (error) {
            console.error('Błąd podczas zapisywania faktury:', error);
            alert('Wystąpił błąd podczas zapisywania faktury. Spróbuj ponownie.');
        } finally {
            setIsLoading(false);
        }
    };

    // Obsługa usuwania faktury
    const handleDeleteInvoice = async (invoiceId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę fakturę?')) {
            return;
        }

        try {
            setIsLoading(true);
            // Wywołaj API do usunięcia dokumentu
            const success = await unifiedFinancialApi.deleteDocument(invoiceId);

            if (success) {
                // Usuń fakturę z lokalnego stanu
                setInvoices(prevInvoices => prevInvoices.filter(inv => inv.id !== invoiceId));

                // Jeśli to była wyświetlana faktura, zamknij podgląd
                if (showViewModal && selectedInvoice?.id === invoiceId) {
                    setShowViewModal(false);
                    setSelectedInvoice(null);
                }
            } else {
                alert('Nie udało się usunąć faktury. Spróbuj ponownie później.');
            }
        } catch (error) {
            console.error('Błąd podczas usuwania faktury:', error);
            alert('Wystąpił błąd podczas usuwania faktury.');
        } finally {
            setIsLoading(false);
        }
    };

    // Obsługa pobierania załącznika faktury
    const handleDownloadAttachment = (invoiceId: string) => {
        const attachmentUrl = unifiedFinancialApi.getDocumentAttachmentUrl(invoiceId);
        window.open(attachmentUrl, '_blank');
    };

    // Obsługa podglądu faktury
    const handleViewInvoice = (invoice: UnifiedFinancialDocument) => {
        setSelectedInvoice(invoice);
        setShowViewModal(true);
    };

    const handleEditInvoice = (invoice: UnifiedFinancialDocument) => {
        setSelectedInvoice(invoice);
        setShowFormModal(true);
    };

    // Obsługa zmiany statusu faktury
    const handleStatusChange = async (id: string, status: DocumentStatus) => {
        try {
            setIsLoading(true);
            // Aktualizuj status dokumentu
            const success = await unifiedFinancialApi.updateDocumentStatus(id, status);

            if (success) {
                // Aktualizuj stan lokalny
                setInvoices(prevInvoices =>
                    prevInvoices.map(invoice =>
                        invoice.id === id ? { ...invoice, status } : invoice
                    )
                );

                // Aktualizuj wybraną fakturę, jeśli jest aktualnie wyświetlana
                if (selectedInvoice?.id === id) {
                    setSelectedInvoice({ ...selectedInvoice, status });
                }
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji statusu faktury:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <InvoicesContainer>
            <SectionTitleWithAction>
                <SectionTitle>Faktury zakupowe</SectionTitle>
                <AddInvoiceButton onClick={() => setShowFormModal(true)} disabled={isLoading}>
                    <FaPlus /> {isLoading ? 'Ładowanie...' : 'Dodaj fakturę'}
                </AddInvoiceButton>
            </SectionTitleWithAction>

            {isLoading && invoices.length === 0 ? (
                <LoadingContainer>Ładowanie faktur...</LoadingContainer>
            ) : invoices.length === 0 ? (
                <EmptyState>
                    <EmptyIcon><FaFileInvoiceDollar /></EmptyIcon>
                    <EmptyText>
                        Brak faktur zakupowych dla tego zlecenia. Faktury zakupowe pozwalają śledzić koszty materiałów i usług zewnętrznych poniesionych podczas realizacji zlecenia.
                    </EmptyText>
                </EmptyState>
            ) : (
                <>
                    <InvoicesList>
                        {invoices.map(invoice => (
                            <InvoiceCard key={invoice.id}>
                                <InvoiceCardHeader>
                                    <InvoiceIconContainer>
                                        <FaFileInvoiceDollar />
                                    </InvoiceIconContainer>
                                    <InvoiceHeaderContent>
                                        <InvoiceMetaInfo>
                                            <InvoiceNumber>{invoice.number}</InvoiceNumber>
                                            <InvoiceDate>
                                                <FaCalendarAlt /> {formatDate(invoice.issuedDate)}
                                            </InvoiceDate>
                                        </InvoiceMetaInfo>
                                        <InvoiceTitle>{invoice.title}</InvoiceTitle>
                                    </InvoiceHeaderContent>
                                    <InvoiceAmount expense>{formatCurrency(invoice.totalGross)}</InvoiceAmount>
                                </InvoiceCardHeader>

                                <InvoiceCardBody>
                                    <InvoiceDetailsGrid>
                                        <InvoiceDetailItem>
                                            <DetailLabel><FaBuilding /> Dostawca</DetailLabel>
                                            <DetailValue>{invoice.sellerName}</DetailValue>
                                        </InvoiceDetailItem>

                                        <InvoiceDetailItem>
                                            <DetailLabel><FaCalendarAlt /> Termin płatności</DetailLabel>
                                            <DetailValue>{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</DetailValue>
                                        </InvoiceDetailItem>

                                        <InvoiceDetailItem>
                                            <DetailLabel><FaSitemap /> Wartość netto</DetailLabel>
                                            <DetailValue expense>{formatCurrency(invoice.totalNet)}</DetailValue>
                                        </InvoiceDetailItem>

                                        <InvoiceDetailItem>
                                            <DetailLabel><FaPercent /> Podatek VAT</DetailLabel>
                                            <DetailValue expense>{formatCurrency(invoice.totalTax)}</DetailValue>
                                        </InvoiceDetailItem>
                                    </InvoiceDetailsGrid>

                                    {invoice.items.length > 0 && (
                                        <ItemsSummary>
                                            <ItemsCount>{invoice.items.length} {invoice.items.length === 1 ? 'pozycja' : invoice.items.length < 5 ? 'pozycje' : 'pozycji'}</ItemsCount>
                                            <ItemsList>
                                                {invoice.items.slice(0, 2).map((item, index) => (
                                                    <ItemSummary key={item.id || index}>
                                                        {item.name} {item.quantity > 1 ? `(${item.quantity} szt.)` : ''}
                                                    </ItemSummary>
                                                ))}
                                                {invoice.items.length > 2 && (
                                                    <ItemSummary>... i {invoice.items.length - 2} {(invoice.items.length - 2) === 1 ? 'więcej' : 'więcej'}</ItemSummary>
                                                )}
                                            </ItemsList>
                                        </ItemsSummary>
                                    )}
                                </InvoiceCardBody>

                                <InvoiceCardFooter>
                                    <InvoiceStatusBadge status={invoice.status}>
                                        {invoice.status === DocumentStatus.PAID
                                            ? 'Opłacona'
                                            : invoice.status === DocumentStatus.NOT_PAID
                                                ? 'Nieopłacona'
                                                : invoice.status === DocumentStatus.OVERDUE
                                                    ? 'Przeterminowana'
                                                    : 'Anulowana'}
                                    </InvoiceStatusBadge>
                                    <InvoiceActions>
                                        <ActionButton title="Podgląd faktury" onClick={() => handleViewInvoice(invoice)}>
                                            <FaEye />
                                        </ActionButton>
                                        <ActionButton title="Edytuj fakturę" onClick={() => handleEditInvoice(invoice)}>
                                            <FaEdit />
                                        </ActionButton>
                                        {invoice.attachments && invoice.attachments.length > 0 && (
                                            <ActionButton title="Pobierz załącznik" onClick={() => handleDownloadAttachment(invoice.id)}>
                                                <FaFileDownload />
                                            </ActionButton>
                                        )}
                                        <ActionButton
                                            title="Usuń fakturę"
                                            className="delete"
                                            onClick={() => handleDeleteInvoice(invoice.id)}
                                        >
                                            <FaTrashAlt />
                                        </ActionButton>
                                    </InvoiceActions>
                                </InvoiceCardFooter>
                            </InvoiceCard>
                        ))}
                    </InvoicesList>

                    <SummarySection>
                        <SummaryTitle>Podsumowanie kosztów</SummaryTitle>
                        <SummaryDetails>
                            <SummaryStat>
                                <StatLabel>Faktury</StatLabel>
                                <StatValue>{invoices.length}</StatValue>
                            </SummaryStat>
                            <SummaryStat>
                                <StatLabel>Wartość netto</StatLabel>
                                <StatValue expense>{formatCurrency(invoices.reduce((sum, inv) => sum + inv.totalNet, 0))}</StatValue>
                            </SummaryStat>
                            <SummaryStat>
                                <StatLabel>Podatek VAT</StatLabel>
                                <StatValue expense>{formatCurrency(invoices.reduce((sum, inv) => sum + inv.totalTax, 0))}</StatValue>
                            </SummaryStat>
                            <SummaryStat primary>
                                <StatLabel>Łączna wartość</StatLabel>
                                <StatValue expense>{formatCurrency(invoices.reduce((sum, inv) => sum + inv.totalGross, 0))}</StatValue>
                            </SummaryStat>
                        </SummaryDetails>
                    </SummarySection>
                </>
            )}

            {/* Modal formularza faktury */}
            <InvoiceFormModal
                isOpen={showFormModal}
                invoice={selectedInvoice || undefined}
                onSave={handleSaveInvoice}
                onClose={() => {
                    setShowFormModal(false);
                    setSelectedInvoice(null);
                }}
                initialData={{
                    protocolId: protocol.id,
                    protocolNumber: `Protokół #${protocol.id}`,
                    type: DocumentType.INVOICE,
                    direction: TransactionDirection.EXPENSE,
                }}
            />

            {/* Modal podglądu faktury */}
            {selectedInvoice && (
                <InvoiceViewModal
                    isOpen={showViewModal}
                    invoice={selectedInvoice}
                    onClose={() => setShowViewModal(false)}
                    onEdit={() => {
                        setShowViewModal(false);
                    }}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteInvoice}
                    onDownloadAttachment={handleDownloadAttachment}
                />
            )}
        </InvoicesContainer>
    );
};

// Styled components pozostają bez zmian
const InvoicesContainer = styled.div`
    margin-bottom: 30px;
`;

const SectionTitleWithAction = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.025em;
`;

const AddInvoiceButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    &:hover:not(:disabled) {
        background: ${brandTheme.primary};
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    &:disabled {
        background: #94a3b8;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    svg {
        font-size: 13px;
    }

    /* Professional loading state */
    &:disabled svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #3498db;
    font-weight: 500;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
    color: #7f8c8d;
`;

const EmptyIcon = styled.div`
    font-size: 48px;
    color: #bdc3c7;
    margin-bottom: 20px;
`;

const EmptyText = styled.p`
    color: #7f8c8d;
    font-size: 14px;
    max-width: 600px;
    margin: 0 0 20px 0;
    line-height: 1.5;
`;

const AddFirstButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: #2980b9;
    }
`;

const InvoicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
`;

const InvoiceCard = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.2s;

    &:hover {
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }
`;

const InvoiceCardHeader = styled.div`
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #f0f0f0;
`;

const InvoiceIconContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: #fcecec;
    color: #e74c3c;
    font-size: 20px;
    margin-right: 16px;
    flex-shrink: 0;
`;

const InvoiceHeaderContent = styled.div`
    flex-grow: 1;
`;

const InvoiceMetaInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 4px;
`;

const InvoiceNumber = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: #34495e;
`;

const InvoiceDate = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: #7f8c8d;
`;

const InvoiceTitle = styled.div`
    font-size: 15px;
    color: #34495e;
`;

const InvoiceAmount = styled.div<{ expense?: boolean }>`
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.expense ? '#e74c3c' : '#27ae60'};
    text-align: right;
    white-space: nowrap;
    flex-shrink: 0;
`;

const InvoiceCardBody = styled.div`
    padding: 16px;
`;

const InvoiceDetailsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 16px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const InvoiceDetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const DetailLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #7f8c8d;

    svg {
        font-size: 12px;
    }
`;

const DetailValue = styled.div<{ expense?: boolean }>`
    font-size: 14px;
    color: ${props => props.expense ? '#e74c3c' : '#34495e'};
    font-weight: ${props => props.expense ? '500' : 'normal'};
`;

const ItemsSummary = styled.div`
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 12px;
`;

const ItemsCount = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #34495e;
    margin-bottom: 6px;
`;

const ItemsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ItemSummary = styled.div`
    font-size: 13px;
    color: #7f8c8d;
`;

const InvoiceCardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f9f9f9;
    border-top: 1px solid #f0f0f0;
`;

const InvoiceStatusBadge = styled.div<{ status: DocumentStatus }>`
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => {
    switch (props.status) {
        case DocumentStatus.PAID: return '#eafaf1';
        case DocumentStatus.NOT_PAID: return '#eaf6fd';
        case DocumentStatus.OVERDUE: return '#fef2f2';
        default: return '#f5f5f5';
    }
}};
    color: ${props => {
    switch (props.status) {
        case DocumentStatus.PAID: return '#27ae60';
        case DocumentStatus.NOT_PAID: return '#3498db';
        case DocumentStatus.OVERDUE: return '#e74c3c';
        default: return '#7f8c8d';
    }
}};
    border: 1px solid ${props => {
    switch (props.status) {
        case DocumentStatus.PAID: return '#d1f5ea';
        case DocumentStatus.NOT_PAID: return '#d5e9f9';
        case DocumentStatus.OVERDUE: return '#fde8e8';
        default: return '#eee';
    }
}};
`;

const InvoiceActions = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    font-size: 16px;
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background-color: rgba(52, 152, 219, 0.1);
    }

    &.delete {
        color: #e74c3c;

        &:hover {
            background-color: rgba(231, 76, 60, 0.1);
        }
    }
`;

const SummarySection = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 16px;
`;

const SummaryTitle = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #34495e;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
`;

const SummaryDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
`;

const SummaryStat = styled.div<{ primary?: boolean }>`
    background-color: ${props => props.primary ? '#fcecec' : '#f9f9f9'};
    border-radius: 6px;
    padding: 12px;
    text-align: center;
`;

const StatLabel = styled.div`
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 6px;
`;

const StatValue = styled.div<{ expense?: boolean }>`
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.expense ? '#e74c3c' : '#34495e'};
`;

export default ProtocolInvoices;