import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaPlus, FaFileInvoiceDollar, FaEdit, FaFilePdf, FaEye, FaTrashAlt } from 'react-icons/fa';
import { Invoice, InvoiceStatus, InvoiceStatusLabels, InvoiceStatusColors, InvoiceFilters, InvoiceType, InvoiceTypeLabels } from '../../types';
import InvoiceFormModal from './components/InvoiceFormModal';
import InvoiceViewModal from './components/InvoiceViewModal';
import { invoicesApi } from '../../api/invoicesApi';

const InvoicesPage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<InvoiceFilters>({});
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Pobieranie danych przy pierwszym renderowaniu i przy zmianie filtrów
    useEffect(() => {
        fetchInvoices();
    }, []);

    // Funkcja pobierająca faktury z serwera
    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const fetchedInvoices = await invoicesApi.fetchInvoices(filters);
            setInvoices(fetchedInvoices);
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

    // Obsługa zmiany filtrów
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Obsługa czyszczenia filtrów
    const handleClearFilters = () => {
        setFilters({});
    };

    // Obsługa wysyłki formularza filtrów
    const handleSubmitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        fetchInvoices();
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
                    <SearchButton onClick={() => setShowFilters(!showFilters)}>
                        <FaSearch />
                        <span>Wyszukaj</span>
                    </SearchButton>
                    <AddButton onClick={handleAddInvoice}>
                        <FaPlus />
                        <span>Dodaj fakturę</span>
                    </AddButton>
                </Actions>
            </Header>

            {showFilters && (
                <FiltersContainer>
                    <FiltersForm onSubmit={handleSubmitFilters}>
                        <FiltersTitle>Filtry wyszukiwania</FiltersTitle>
                        <FiltersGrid>
                            <FormGroup>
                                <Label htmlFor="number">Numer faktury</Label>
                                <Input
                                    id="number"
                                    name="number"
                                    value={filters.number || ''}
                                    onChange={handleFilterChange}
                                    placeholder="Np. FV/2024/101"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="title">Nazwa faktury</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={filters.title || ''}
                                    onChange={handleFilterChange}
                                    placeholder="Np. Usługi detailingowe"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="buyerName">Płatnik</Label>
                                <Input
                                    id="buyerName"
                                    name="buyerName"
                                    value={filters.buyerName || ''}
                                    onChange={handleFilterChange}
                                    placeholder="Nazwa klienta"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    id="status"
                                    name="status"
                                    value={filters.status || ''}
                                    onChange={handleFilterChange as any}
                                >
                                    <option value="">Wszystkie statusy</option>
                                    {Object.entries(InvoiceStatusLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="type">Typ faktury</Label>
                                <Select
                                    id="type"
                                    name="type"
                                    value={filters.type || ''}
                                    onChange={handleFilterChange as any}
                                >
                                    <option value="">Wszystkie typy</option>
                                    {Object.entries(InvoiceTypeLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="dateFrom">Data od</Label>
                                <Input
                                    id="dateFrom"
                                    name="dateFrom"
                                    type="date"
                                    value={filters.dateFrom || ''}
                                    onChange={handleFilterChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="dateTo">Data do</Label>
                                <Input
                                    id="dateTo"
                                    name="dateTo"
                                    type="date"
                                    value={filters.dateTo || ''}
                                    onChange={handleFilterChange}
                                />
                            </FormGroup>
                        </FiltersGrid>
                        <FiltersActions>
                            <ButtonSecondary type="button" onClick={handleClearFilters}>
                                Wyczyść filtry
                            </ButtonSecondary>
                            <ButtonPrimary type="submit">
                                Zastosuj filtry
                            </ButtonPrimary>
                        </FiltersActions>
                    </FiltersForm>
                </FiltersContainer>
            )}

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
                                <TableHeader>Płatnik</TableHeader>
                                <TableHeader>Wizyta</TableHeader>
                                <TableHeader>Kwota brutto</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Załączniki</TableHeader>
                                <TableHeader>Akcje</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} style={{ textAlign: 'center' }}>
                                        Brak faktur spełniających kryteria wyszukiwania
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map(invoice => (
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

const SearchButton = styled(Button)`
    background-color: #ecf0f1;
    color: #2c3e50;
    border: 1px solid #dfe6e9;

    &:hover {
        background-color: #dfe6e9;
    }
`;

const AddButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;

    &:hover {
        background-color: #2980b9;
    }
`;

const FiltersContainer = styled.div`
    margin-bottom: 24px;
`;

const FiltersForm = styled.form`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 20px;
`;

const FiltersTitle = styled.h3`
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #2c3e50;
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    font-size: 14px;
    color: #34495e;
    font-weight: 500;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;

    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const ButtonPrimary = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;

    &:hover {
        background-color: #2980b9;
    }
`;

const ButtonSecondary = styled(Button)`
    background-color: white;
    color: #2c3e50;
    border: 1px solid #dfe6e9;

    &:hover {
        background-color: #f8f9fa;
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