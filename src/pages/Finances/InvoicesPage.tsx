import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaPlus, FaFileInvoiceDollar, FaEdit, FaFilePdf, FaEye, FaTrashAlt, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Invoice, InvoiceStatus, InvoiceStatusLabels, InvoiceStatusColors, InvoiceFilters, InvoiceType, InvoiceTypeLabels } from '../../types';
import InvoiceFormModal from './components/InvoiceFormModal';
import InvoiceViewModal from './components/InvoiceViewModal';
import InvoiceAdvancedFilters from './components/InvoiceAdvancedFilters';
import ActiveFiltersDisplay from './components/ActiveFiltersDisplay';
import { invoicesApi } from '../../api/invoicesApi';
import InvoiceFiltersComponent from './components/InvoiceFiltersComponent';


const InvoicesPage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<InvoiceFilters>({});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [activeStatusFilter, setActiveStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Pobieranie danych przy pierwszym renderowaniu
    useEffect(() => {
        fetchInvoices();
    }, []);

    // Obsługa filtrowania po zmianie filtrów
    useEffect(() => {
        applyFilters();
    }, [invoices, activeStatusFilter, filters]);

    // Funkcja pobierająca faktury z serwera
    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const fetchedInvoices = await invoicesApi.fetchInvoices({});
            setInvoices(fetchedInvoices);
            setFilteredInvoices(fetchedInvoices);
            setError(null);
        } catch (err) {
            console.error('Błąd podczas pobierania faktur:', err);
            setError('Nie udało się pobrać listy faktur. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    // Funkcja do formatowania daty
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    // Funkcja do formatowania kwoty
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    // Obsługa dodawania nowej faktury
    const handleAddInvoice = () => {
        setSelectedInvoice(undefined);
        setSelectedFile(null);
        setShowFormModal(true);
    };

    // Obsługa edycji faktury
    const handleEditInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setSelectedFile(null);
        setShowFormModal(true);
    };

    // Obsługa zapisu formularza faktury
    const handleSaveInvoice = async (invoice: Partial<Invoice>, file?: File | null) => {
        try {
            setLoading(true);

            if (selectedInvoice && selectedInvoice.id) {
                // Aktualizacja istniejącej faktury
                const updatedInvoice = await invoicesApi.updateInvoice(
                    selectedInvoice.id,
                    invoice as Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>,
                    file || undefined // Używamy przekazanego pliku zamiast selectedFile
                );

                if (updatedInvoice) {
                    setInvoices(prevInvoices =>
                        prevInvoices.map(item =>
                            item.id === updatedInvoice.id ? updatedInvoice : item
                        )
                    );
                }
            } else {
                // Dodawanie nowej faktury
                const newInvoice = await invoicesApi.createInvoice(
                    invoice as Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>,
                    file || undefined // Używamy przekazanego pliku zamiast selectedFile
                );

                if (newInvoice) {
                    setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
                }
            }

            // Zamykamy modal
            setShowFormModal(false);
            setSelectedFile(null);
        } catch (error) {
            console.error('Błąd podczas zapisywania faktury:', error);
            setError('Nie udało się zapisać faktury. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    // Obsługa podglądu faktury
    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowViewModal(true);
    };

    // Obsługa zmiany filtra statusu
    const handleStatusFilterChange = (status: InvoiceStatus | 'ALL') => {
        setActiveStatusFilter(status);
    };

    // Obsługa zmiany zaawansowanych filtrów
    const handleAdvancedSearch = (advancedFilters: InvoiceFilters) => {
        setFilters(advancedFilters);
    };

    // Usunięcie pojedynczego filtra
    const handleRemoveFilter = (key: keyof InvoiceFilters) => {
        const updatedFilters = { ...filters };
        delete updatedFilters[key];
        setFilters(updatedFilters);
    };

    // Wyczyszczenie wszystkich filtrów
    const handleClearAllFilters = () => {
        setFilters({});
    };

    // Przełączanie widoku filtrów zaawansowanych
    const toggleAdvancedFilters = () => {
        setShowAdvancedFilters(!showAdvancedFilters);
    };

    // Funkcja aplikująca filtry do listy faktur
    const applyFilters = () => {
        if (!invoices.length) return;

        let result = [...invoices];

        // Filtrowanie po statusie
        if (activeStatusFilter !== 'ALL') {
            result = result.filter(invoice => invoice.status === activeStatusFilter);
        }

        // Filtrowanie po zaawansowanych filtrach
        if (Object.keys(filters).length > 0) {
            // Filtrowanie po numerze faktury
            if (filters.number) {
                result = result.filter(invoice =>
                    invoice.number.toLowerCase().includes(filters.number!.toLowerCase())
                );
            }

            // Filtrowanie po tytule faktury
            if (filters.title) {
                result = result.filter(invoice =>
                    invoice.title.toLowerCase().includes(filters.title!.toLowerCase())
                );
            }

            // Filtrowanie po płatniku
            if (filters.buyerName) {
                result = result.filter(invoice =>
                    invoice.buyerName.toLowerCase().includes(filters.buyerName!.toLowerCase())
                );
            }

            // Filtrowanie po statusie (z zaawansowanych filtrów)
            if (filters.status) {
                result = result.filter(invoice => invoice.status === filters.status);
            }

            // Filtrowanie po typie faktury
            if (filters.type) {
                result = result.filter(invoice => invoice.type === filters.type);
            }

            // Filtrowanie po ID protokołu
            if (filters.protocolId) {
                result = result.filter(invoice =>
                    invoice.protocolId === filters.protocolId ||
                    (invoice.protocolNumber && invoice.protocolNumber.includes(filters.protocolId!))
                );
            }

            // Filtrowanie po dacie od
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                result = result.filter(invoice => new Date(invoice.issuedDate) >= fromDate);
            }

            // Filtrowanie po dacie do
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999); // Koniec dnia
                result = result.filter(invoice => new Date(invoice.issuedDate) <= toDate);
            }

            // Filtrowanie po minimalnej kwocie
            if (filters.minAmount) {
                result = result.filter(invoice => invoice.totalGross >= filters.minAmount!);
            }

            // Filtrowanie po maksymalnej kwocie
            if (filters.maxAmount) {
                result = result.filter(invoice => invoice.totalGross <= filters.maxAmount!);
            }
        }

        setFilteredInvoices(result);
    };

    // Obsługa usuwania faktury
    const handleDeleteInvoice = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę fakturę?')) {
            try {
                setLoading(true);
                const success = await invoicesApi.deleteInvoice(id);

                if (success) {
                    setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== id));
                    if (showViewModal && selectedInvoice?.id === id) {
                        setShowViewModal(false);
                    }
                } else {
                    setError('Nie udało się usunąć faktury. Spróbuj ponownie później.');
                }
            } catch (error) {
                console.error('Błąd podczas usuwania faktury:', error);
                setError('Nie udało się usunąć faktury. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        }
    };

    // Obsługa zmiany statusu faktury
    const handleStatusChange = async (id: string, status: InvoiceStatus) => {
        try {
            setLoading(true);
            const success = await invoicesApi.updateInvoiceStatus(id, status);

            if (success) {
                setInvoices(prevInvoices =>
                    prevInvoices.map(invoice =>
                        invoice.id === id ? { ...invoice, status } : invoice
                    )
                );

                if (showViewModal && selectedInvoice?.id === id) {
                    setSelectedInvoice({ ...selectedInvoice, status });
                }
            } else {
                setError('Nie udało się zmienić statusu faktury. Spróbuj ponownie później.');
            }
        } catch (error) {
            console.error('Błąd podczas zmiany statusu faktury:', error);
            setError('Nie udało się zmienić statusu faktury. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    // Obsługa pobierania załącznika faktury
    const handleDownloadAttachment = (invoiceId: string) => {
        const attachmentUrl = invoicesApi.getInvoiceAttachmentUrl(invoiceId);
        window.open(attachmentUrl, '_blank');
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <FaFileInvoiceDollar />
                    <span>Faktury</span>
                </Title>
                <Actions>
                    <AddButton onClick={handleAddInvoice}>
                        <FaPlus />
                        <span>Dodaj fakturę</span>
                    </AddButton>
                </Actions>
            </Header>

            {/* Filtry statusu */}
            <InvoiceFiltersComponent
                activeFilter={activeStatusFilter}
                onFilterChange={handleStatusFilterChange}
            />

            {/* Nagłówek filtrów zaawansowanych */}
            <FiltersHeader onClick={toggleAdvancedFilters}>
                <FilterTitle>
                    <FilterIcon><FaFilter /></FilterIcon>
                    Filtry zaawansowane
                </FilterTitle>
                <FilterExpandIcon>
                    {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                </FilterExpandIcon>
            </FiltersHeader>

            {/* Filtry zaawansowane */}
            <FiltersContainer expanded={showAdvancedFilters}>
                {showAdvancedFilters && (
                    <InvoiceAdvancedFilters onSearch={handleAdvancedSearch} />
                )}
            </FiltersContainer>

            {/* Wyświetlanie aktywnych filtrów */}
            <ActiveFiltersDisplay
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
            />

            {loading ? (
                <LoadingIndicator>Ładowanie faktur...</LoadingIndicator>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Numer</TableHeader>
                                <TableHeader>Typ</TableHeader>
                                <TableHeader>Nazwa faktury</TableHeader>
                                <TableHeader>Data wystawienia</TableHeader>
                                <TableHeader>Termin płatności</TableHeader>
                                <TableHeader>Identyfikator</TableHeader>
                                <TableHeader>Wizyta</TableHeader>
                                <TableHeader>Kwota brutto</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Załączniki</TableHeader>
                                <TableHeader>Akcje</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInvoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} style={{ textAlign: 'center' }}>
                                        Brak faktur spełniających kryteria wyszukiwania
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInvoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>{invoice.number}</TableCell>
                                        <TableCell>
                                            <InvoiceTypeBadge type={invoice.type}>
                                                {InvoiceTypeLabels[invoice.type]}
                                            </InvoiceTypeBadge>
                                        </TableCell>
                                        <TableCell>{invoice.title}</TableCell>
                                        <TableCell>{formatDate(invoice.issuedDate)}</TableCell>
                                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                        <TableCell>{invoice.buyerName}</TableCell>
                                        <TableCell>
                                            {invoice.protocolNumber ? (
                                                <ProtocolLink href={`/orders/car-reception/${invoice.protocolId}`}>
                                                    {invoice.protocolNumber}
                                                </ProtocolLink>
                                            ) : (
                                                <NoProtocol>-</NoProtocol>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatAmount(invoice.totalGross)} {invoice.currency}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={invoice.status}>
                                                {InvoiceStatusLabels[invoice.status]}
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell>
                                            {invoice.attachments && invoice.attachments.length > 0 ? (
                                                <AttachmentsList>
                                                    {invoice.attachments.map(att => (
                                                        <AttachmentItem key={att.id} onClick={() => handleDownloadAttachment(invoice.id)}>
                                                            <FaFilePdf />
                                                            <span>{att.name}</span>
                                                        </AttachmentItem>
                                                    ))}
                                                </AttachmentsList>
                                            ) : (
                                                <NoAttachments>Brak</NoAttachments>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <ActionButtons>
                                                <ActionButton
                                                    title="Podgląd faktury"
                                                    onClick={() => handleViewInvoice(invoice)}
                                                >
                                                    <FaEye />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Edytuj fakturę"
                                                    onClick={() => handleEditInvoice(invoice)}
                                                >
                                                    <FaEdit />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Usuń fakturę"
                                                    className="delete"
                                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                                >
                                                    <FaTrashAlt />
                                                </ActionButton>
                                            </ActionButtons>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Modal formularza faktury */}
            <InvoiceFormModal
                isOpen={showFormModal}
                invoice={selectedInvoice}
                onSave={handleSaveInvoice}
                onClose={() => setShowFormModal(false)}
            />

            {/* Modal podglądu faktury */}
            {selectedInvoice && (
                <InvoiceViewModal
                    isOpen={showViewModal}
                    invoice={selectedInvoice}
                    onClose={() => setShowViewModal(false)}
                    onEdit={(invoice) => {
                        setShowViewModal(false);
                        setTimeout(() => {
                            setSelectedInvoice(invoice);
                            setShowFormModal(true);
                        }, 100);
                    }}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteInvoice}
                    onDownloadAttachment={handleDownloadAttachment}
                />
            )}
        </PageContainer>
    );
};

// Style komponentów
const PageContainer = styled.div`
    padding: 20px;
    background-color: #f8f9fa;
    min-height: calc(100vh - 60px);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
`;

const Title = styled.h1`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    margin: 0;
    color: #2c3e50;

    svg {
        color: #3498db;
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 12px;

    @media (max-width: 576px) {
        width: 100%;
        flex-direction: column;
    }
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

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

const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    @media (max-width: 576px) {
        width: 100%;
    }
`;

const FiltersHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: ${props => (props.expanded ? '0' : '20px')};
    user-select: none;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const FilterTitle = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
    display: flex;
    align-items: center;
`;

const FilterIcon = styled.span`
    margin-right: 8px;
    color: #3498db;
    font-size: 14px;
`;

const FilterExpandIcon = styled.span`
    color: #7f8c8d;
    font-size: 12px;
`;

const FiltersContainer = styled.div<{ expanded: boolean }>`
    margin-bottom: ${props => props.expanded ? '20px' : '0'};
    transition: all 0.3s ease;
    background-color: white;
    border-radius: 0 0 6px 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: ${props => props.expanded ? 'block' : 'none'};
`;

const AddButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;

    &:hover {
        background-color: #2980b9;
    }
`;

const TableContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background-color: #f8f9fa;
    border-bottom: 2px solid #eef2f7;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    border-bottom: 1px solid #eef2f7;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: #f8f9fa;
    }
`;

const TableHeader = styled.th`
    padding: 14px 16px;
    text-align: left;
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
`;

const TableCell = styled.td`
    padding: 14px 16px;
    color: #34495e;
    font-size: 14px;
`;

const StatusBadge = styled.span<{ status: InvoiceStatus }>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => `${InvoiceStatusColors[props.status]}22`};
    color: ${props => InvoiceStatusColors[props.status]};
    border: 1px solid ${props => `${InvoiceStatusColors[props.status]}44`};
`;

const InvoiceTypeBadge = styled.span<{ type: InvoiceType }>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => props.type === InvoiceType.INCOME ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)'};
    color: ${props => props.type === InvoiceType.INCOME ? '#27ae60' : '#c0392b'};
    border: 1px solid ${props => props.type === InvoiceType.INCOME ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'};
`;

const ProtocolLink = styled.a`
    color: #3498db;
    text-decoration: none;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
`;

const NoProtocol = styled.span`
    color: #95a5a6;
    font-style: italic;
`;

const AttachmentsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const AttachmentItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    cursor: pointer;

    &:hover {
        color: #3498db;
    }

    svg {
        color: #e74c3c;
        font-size: 16px;
    }
`;

const NoAttachments = styled.span`
    color: #95a5a6;
    font-style: italic;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const LoadingIndicator = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    color: #3498db;
    font-weight: 500;
`;

const ErrorMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    background-color: #fef2f2;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    color: #e74c3c;
    font-weight: 500;
`;

export default InvoicesPage;