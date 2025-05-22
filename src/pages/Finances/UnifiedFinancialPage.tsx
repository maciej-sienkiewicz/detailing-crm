// src/pages/Finances/UnifiedFinancialPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaFileInvoiceDollar,
    FaPlus,
    FaFilter,
    FaChevronDown,
    FaChevronUp,
    FaReceipt,
    FaExchangeAlt,
    FaEdit,
    FaEye,
    FaTrashAlt
} from 'react-icons/fa';
import {
    UnifiedFinancialDocument,
    UnifiedDocumentFilters,
    UnifiedDocumentSummary,
    DocumentType,
    DocumentTypeLabels,
    DocumentStatus,
    DocumentStatusLabels,
    DocumentStatusColors,
    TransactionDirection,
    TransactionDirectionLabels,
    TransactionDirectionColors,
    PaymentMethodLabels
} from '../../types/finance';
import { unifiedFinancialApi } from '../../api/unifiedFinancialApi';
import UnifiedDocumentFormModal from './components/UnifiedDocumentFormModal';
import UnifiedDocumentViewModal from './components/UnifiedDocumentViewModal';
import FinancialSummaryCards from './components/FinancialSummaryCards';
import Pagination from '../../components/common/Pagination';
import { useToast } from '../../components/common/Toast/Toast';

const UnifiedFinancialPage: React.FC = () => {
    // Stan dla dokumentów
    const [documents, setDocuments] = useState<UnifiedFinancialDocument[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<UnifiedFinancialDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Stan dla filtrów
    const [filters, setFilters] = useState<UnifiedDocumentFilters>({});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [activeTypeFilter, setActiveTypeFilter] = useState<DocumentType | 'ALL'>('ALL');

    // Stan dla modali
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [selectedDocument, setSelectedDocument] = useState<UnifiedFinancialDocument | undefined>(undefined);

    // Stan dla paginacji
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // Stan dla podsumowania
    const [summary, setSummary] = useState<UnifiedDocumentSummary | null>(null);
    const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

    const { showToast } = useToast();

    // Pobieranie danych przy pierwszym renderowaniu
    useEffect(() => {
        fetchDocuments();
        fetchSummary();
    }, [pagination.currentPage, filters]);

    // Filtrowanie po zmianie filtrów
    useEffect(() => {
        applyFilters();
    }, [documents, activeTypeFilter, filters]);

    // Funkcja pobierająca dokumenty
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await unifiedFinancialApi.fetchDocuments(
                filters,
                pagination.currentPage,
                pagination.pageSize
            );

            setDocuments(response.data);
            setPagination({
                currentPage: response.pagination.currentPage,
                pageSize: response.pagination.pageSize,
                totalItems: response.pagination.totalItems,
                totalPages: response.pagination.totalPages
            });

            setError(null);
        } catch (err) {
            console.error('Błąd podczas pobierania dokumentów:', err);
            setError('Nie udało się pobrać listy dokumentów. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    // Funkcja pobierająca podsumowanie
    const fetchSummary = async () => {
        try {
            setLoadingSummary(true);
            const summaryData = await unifiedFinancialApi.getFinancialSummary();
            setSummary(summaryData);
        } catch (err) {
            console.error('Błąd podczas pobierania podsumowania:', err);
            showToast('error', 'Nie udało się pobrać podsumowania finansowego');
        } finally {
            setLoadingSummary(false);
        }
    };

    // Funkcja formatująca datę
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    // Funkcja formatująca kwotę
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
                return <FaExchangeAlt />;
        }
    };

    // Obsługa zmiany filtra typu
    const handleTypeFilterChange = (type: DocumentType | 'ALL') => {
        setActiveTypeFilter(type);
        setFilters(prev => {
            const newFilters = { ...prev };
            if (type === 'ALL') {
                delete newFilters.type;
            } else {
                newFilters.type = type;
            }
            return newFilters;
        });
    };

    // Funkcja aplikująca filtry
    const applyFilters = () => {
        if (!documents.length) return;

        let result = [...documents];

        // Filtrowanie po typie
        if (activeTypeFilter !== 'ALL') {
            result = result.filter(doc => doc.type === activeTypeFilter);
        }

        // Pozostałe filtry
        if (Object.keys(filters).length > 0) {
            if (filters.title) {
                result = result.filter(doc =>
                    doc.title.toLowerCase().includes(filters.title!.toLowerCase())
                );
            }

            if (filters.buyerName) {
                result = result.filter(doc =>
                    doc.buyerName.toLowerCase().includes(filters.buyerName!.toLowerCase())
                );
            }

            if (filters.status) {
                result = result.filter(doc => doc.status === filters.status);
            }

            if (filters.direction) {
                result = result.filter(doc => doc.direction === filters.direction);
            }

            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                result = result.filter(doc => new Date(doc.issuedDate) >= fromDate);
            }

            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                result = result.filter(doc => new Date(doc.issuedDate) <= toDate);
            }

            if (filters.minAmount !== undefined) {
                result = result.filter(doc => doc.totalGross >= filters.minAmount!);
            }

            if (filters.maxAmount !== undefined) {
                result = result.filter(doc => doc.totalGross <= filters.maxAmount!);
            }
        }

        setFilteredDocuments(result);
    };

    // Obsługa dodawania nowego dokumentu
    const handleAddDocument = (type?: DocumentType) => {
        setSelectedDocument(undefined);
        // Jeśli typ został określony, przekazujemy go jako initialData
        setShowFormModal(true);
    };

    // Obsługa edycji dokumentu
    const handleEditDocument = (document: UnifiedFinancialDocument) => {
        setSelectedDocument(document);
        setShowFormModal(true);
    };

    // Obsługa zapisu dokumentu
    const handleSaveDocument = async (documentData: Partial<UnifiedFinancialDocument>, file?: File | null) => {
        try {
            setLoading(true);

            if (selectedDocument && selectedDocument.id) {
                // Aktualizacja
                const updatedDocument = await unifiedFinancialApi.updateDocument(
                    selectedDocument.id,
                    documentData,
                    file || undefined
                );

                if (updatedDocument) {
                    setDocuments(prevDocs =>
                        prevDocs.map(doc =>
                            doc.id === updatedDocument.id ? updatedDocument : doc
                        )
                    );
                    showToast('success', 'Dokument został zaktualizowany');
                }
            } else {
                // Tworzenie nowego
                const newDocument = await unifiedFinancialApi.createDocument(
                    documentData,
                    file || undefined
                );

                if (newDocument) {
                    setDocuments(prevDocs => [newDocument, ...prevDocs]);
                    showToast('success', 'Nowy dokument został dodany');
                }
            }

            // Odświeżamy podsumowanie
            fetchSummary();
            setShowFormModal(false);
        } catch (error) {
            console.error('Błąd podczas zapisywania dokumentu:', error);
            showToast('error', 'Wystąpił błąd podczas zapisywania dokumentu');
        } finally {
            setLoading(false);
        }
    };

    // Obsługa podglądu dokumentu
    const handleViewDocument = (document: UnifiedFinancialDocument) => {
        setSelectedDocument(document);
        setShowViewModal(true);
    };

    // Obsługa usuwania dokumentu
    const handleDeleteDocument = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten dokument?')) {
            try {
                setLoading(true);
                const success = await unifiedFinancialApi.deleteDocument(id);

                if (success) {
                    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
                    if (showViewModal && selectedDocument?.id === id) {
                        setShowViewModal(false);
                    }
                    showToast('success', 'Dokument został usunięty');
                    fetchSummary();
                } else {
                    showToast('error', 'Nie udało się usunąć dokumentu');
                }
            } catch (error) {
                console.error('Błąd podczas usuwania dokumentu:', error);
                showToast('error', 'Wystąpił błąd podczas usuwania dokumentu');
            } finally {
                setLoading(false);
            }
        }
    };

    // Obsługa zmiany statusu dokumentu
    const handleStatusChange = async (id: string, status: DocumentStatus) => {
        try {
            const success = await unifiedFinancialApi.updateDocumentStatus(id, status);

            if (success) {
                setDocuments(prevDocs =>
                    prevDocs.map(doc =>
                        doc.id === id ? { ...doc, status } : doc
                    )
                );

                if (showViewModal && selectedDocument?.id === id) {
                    setSelectedDocument({ ...selectedDocument, status });
                }

                showToast('success', 'Status dokumentu został zaktualizowany');
                fetchSummary();
            } else {
                showToast('error', 'Nie udało się zmienić statusu dokumentu');
            }
        } catch (error) {
            console.error('Błąd podczas zmiany statusu dokumentu:', error);
            showToast('error', 'Wystąpił błąd podczas zmiany statusu dokumentu');
        }
    };

    // Obsługa pobierania załącznika
    const handleDownloadAttachment = (documentId: string) => {
        const attachmentUrl = unifiedFinancialApi.getDocumentAttachmentUrl(documentId);
        window.open(attachmentUrl, '_blank');
    };

    // Obsługa zmiany strony
    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage - 1
        }));
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <FaFileInvoiceDollar />
                    <span>Dokumenty finansowe</span>
                </Title>
                <Actions>
                    <AddButtonGroup>
                        <AddButton onClick={() => handleAddDocument(DocumentType.INVOICE)}>
                            <FaFileInvoiceDollar />
                            <span>Dodaj fakturę</span>
                        </AddButton>
                        <AddButton onClick={() => handleAddDocument(DocumentType.RECEIPT)}>
                            <FaReceipt />
                            <span>Dodaj paragon</span>
                        </AddButton>
                        <AddButton onClick={() => handleAddDocument(DocumentType.OTHER)}>
                            <FaExchangeAlt />
                            <span>Inna operacja</span>
                        </AddButton>
                    </AddButtonGroup>
                </Actions>
            </Header>

            {/* Podsumowanie finansowe */}
            {summary && (
                <FinancialSummaryCards
                    summary={summary}
                    isLoading={loadingSummary}
                />
            )}

            {/* Filtry typu dokumentu */}
            <TypeFilterButtons>
                <TypeFilterButton
                    active={activeTypeFilter === 'ALL'}
                    onClick={() => handleTypeFilterChange('ALL')}
                >
                    Wszystkie
                </TypeFilterButton>

                {Object.values(DocumentType).map((type) => (
                    <TypeFilterButton
                        key={type}
                        active={activeTypeFilter === type}
                        onClick={() => handleTypeFilterChange(type)}
                        documentType={type}
                    >
                        {getDocumentIcon(type)}
                        {DocumentTypeLabels[type]}
                    </TypeFilterButton>
                ))}
            </TypeFilterButtons>

            {/* Filtry zaawansowane */}
            <FiltersHeader onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <FilterTitle>
                    <FilterIcon><FaFilter /></FilterIcon>
                    Filtry zaawansowane
                </FilterTitle>
                <FilterExpandIcon>
                    {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                </FilterExpandIcon>
            </FiltersHeader>

            {showAdvancedFilters && (
                <FiltersContainer>
                    <AdvancedFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </FiltersContainer>
            )}

            {/* Tabela dokumentów */}
            {loading ? (
                <LoadingIndicator>Ładowanie dokumentów...</LoadingIndicator>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Typ</TableHeader>
                                <TableHeader>Numer</TableHeader>
                                <TableHeader>Nazwa</TableHeader>
                                <TableHeader>Data wystawienia</TableHeader>
                                <TableHeader>Termin płatności</TableHeader>
                                <TableHeader>Kontrahent</TableHeader>
                                <TableHeader>Kierunek</TableHeader>
                                <TableHeader>Kwota brutto</TableHeader>
                                <TableHeader>Metoda płatności</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Powiązania</TableHeader>
                                <TableHeader>Akcje</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDocuments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                                        Brak dokumentów spełniających kryteria wyszukiwania
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDocuments.map(document => (
                                    <TableRow key={document.id}>
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
                                        <TableCell>
                                            {document.dueDate ? formatDate(document.dueDate) : '-'}
                                        </TableCell>
                                        <TableCell>{document.buyerName}</TableCell>
                                        <TableCell>
                                            <DirectionBadge direction={document.direction}>
                                                {TransactionDirectionLabels[document.direction]}
                                            </DirectionBadge>
                                        </TableCell>
                                        <TableCell>
                                            <AmountCell direction={document.direction}>
                                                {formatAmount(document.totalGross)} {document.currency}
                                                {document.paidAmount !== undefined && document.paidAmount < document.totalGross && (
                                                    <PaidAmount>
                                                        Zapłacono: {formatAmount(document.paidAmount)}
                                                    </PaidAmount>
                                                )}
                                            </AmountCell>
                                        </TableCell>
                                        <TableCell>
                                            {PaymentMethodLabels[document.paymentMethod]}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={document.status}>
                                                {DocumentStatusLabels[document.status]}
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell>
                                            {document.protocolNumber ? (
                                                <ProtocolLink href={`/orders/car-reception/${document.protocolId}`}>
                                                    {document.protocolNumber}
                                                </ProtocolLink>
                                            ) : document.visitId ? (
                                                <ProtocolLink href={`/appointments/${document.visitId}`}>
                                                    Wizyta #{document.visitId}
                                                </ProtocolLink>
                                            ) : (
                                                <NoProtocol>-</NoProtocol>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <ActionButtons>
                                                <ActionButton
                                                    title="Podgląd dokumentu"
                                                    onClick={() => handleViewDocument(document)}
                                                >
                                                    <FaEye />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Edytuj dokument"
                                                    onClick={() => handleEditDocument(document)}
                                                >
                                                    <FaEdit />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Usuń dokument"
                                                    className="delete"
                                                    onClick={() => handleDeleteDocument(document.id)}
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

            {/* Paginacja */}
            {filteredDocuments.length > 0 && (
                <PaginationContainer>
                    <Pagination
                        currentPage={pagination.currentPage + 1}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                        showTotalItems={true}
                    />
                </PaginationContainer>
            )}

            {/* Modal formularza dokumentu */}
            <UnifiedDocumentFormModal
                isOpen={showFormModal}
                document={selectedDocument}
                onSave={handleSaveDocument}
                onClose={() => setShowFormModal(false)}
            />

            {/* Modal podglądu dokumentu */}
            {selectedDocument && (
                <UnifiedDocumentViewModal
                    isOpen={showViewModal}
                    document={selectedDocument}
                    onClose={() => setShowViewModal(false)}
                    onEdit={(document) => {
                        setShowViewModal(false);
                        setTimeout(() => {
                            setSelectedDocument(document);
                            setShowFormModal(true);
                        }, 100);
                    }}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteDocument}
                    onDownloadAttachment={handleDownloadAttachment}
                />
            )}
        </PageContainer>
    );
};

// Komponent filtrów zaawansowanych
const AdvancedFilters: React.FC<{
    filters: UnifiedDocumentFilters;
    onFiltersChange: (filters: UnifiedDocumentFilters) => void;
}> = ({ filters, onFiltersChange }) => {
    const handleChange = (field: keyof UnifiedDocumentFilters, value: any) => {
        const newFilters = { ...filters };
        if (value === '' || value === undefined) {
            delete newFilters[field];
        } else {
            newFilters[field] = value;
        }
        onFiltersChange(newFilters);
    };

    return (
        <FiltersGrid>
            <FormGroup>
                <Label>Nazwa dokumentu</Label>
                <Input
                    value={filters.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Nazwa dokumentu"
                />
            </FormGroup>

            <FormGroup>
                <Label>Kontrahent</Label>
                <Input
                    value={filters.buyerName || ''}
                    onChange={(e) => handleChange('buyerName', e.target.value)}
                    placeholder="Nazwa kontrahenta"
                />
            </FormGroup>

            <FormGroup>
                <Label>Status</Label>
                <Select
                    value={filters.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                >
                    <option value="">Wszystkie statusy</option>
                    {Object.entries(DocumentStatusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </Select>
            </FormGroup>

            <FormGroup>
                <Label>Kierunek</Label>
                <Select
                    value={filters.direction || ''}
                    onChange={(e) => handleChange('direction', e.target.value)}
                >
                    <option value="">Wszystkie</option>
                    {Object.entries(TransactionDirectionLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </Select>
            </FormGroup>

            <FormGroup>
                <Label>Data od</Label>
                <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleChange('dateFrom', e.target.value)}
                />
            </FormGroup>

            <FormGroup>
                <Label>Data do</Label>
                <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleChange('dateTo', e.target.value)}
                />
            </FormGroup>

            <FormGroup>
                <Label>Kwota od</Label>
                <Input
                    type="number"
                    step="0.01"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleChange('minAmount', parseFloat(e.target.value))}
                    placeholder="Minimalna kwota"
                />
            </FormGroup>

            <FormGroup>
                <Label>Kwota do</Label>
                <Input
                    type="number"
                    step="0.01"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleChange('maxAmount', parseFloat(e.target.value))}
                    placeholder="Maksymalna kwota"
                />
            </FormGroup>
        </FiltersGrid>
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

const AddButtonGroup = styled.div`
    display: flex;
    gap: 8px;

    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    background-color: #3498db;
    color: white;
    border: none;

    &:hover {
        background-color: #2980b9;
    }

    @media (max-width: 576px) {
        width: 100%;
    }
`;

const TypeFilterButtons = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const TypeFilterButton = styled.button<{
    active: boolean;
    documentType?: DocumentType
}>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 4px;
    font-weight: ${props => props.active ? '600' : '400'};
    cursor: pointer;
    background-color: ${props => {
    if (props.active) {
        if (props.documentType) {
            switch (props.documentType) {
                case DocumentType.INVOICE:
                    return '#3498db22';
                case DocumentType.RECEIPT:
                    return '#2ecc7122';
                case DocumentType.OTHER:
                    return '#95a5a622';
                default:
                    return '#3498db';
            }
        } else {
            return '#3498db';
        }
    } else {
        return 'white';
    }
}};
    color: ${props => {
    if (props.active) {
        if (props.documentType) {
            switch (props.documentType) {
                case DocumentType.INVOICE:
                    return '#3498db';
                case DocumentType.RECEIPT:
                    return '#2ecc71';
                case DocumentType.OTHER:
                    return '#95a5a6';
                default:
                    return 'white';
            }
        } else {
            return 'white';
        }
    } else {
        return '#2c3e50';
    }
}};
    border: 1px solid ${props => {
    if (props.active) {
        if (props.documentType) {
            switch (props.documentType) {
                case DocumentType.INVOICE:
                    return '#3498db';
                case DocumentType.RECEIPT:
                    return '#2ecc71';
                case DocumentType.OTHER:
                    return '#95a5a6';
                default:
                    return '#3498db';
            }
        } else {
            return '#3498db';
        }
    } else {
        return '#dfe6e9';
    }
}};

    &:hover {
        background-color: ${props => props.active ? (
    props.documentType ? (
        (() => {
            switch (props.documentType) {
                case DocumentType.INVOICE:
                    return '#3498db22';
                case DocumentType.RECEIPT:
                    return '#2ecc7122';
                case DocumentType.OTHER:
                    return '#95a5a622';
                default:
                    return '#2980b9';
            }
        })()
    ) : '#2980b9'
) : '#f5f6fa'};
    }

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
    margin-bottom: 20px;
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

const FiltersContainer = styled.div`
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    padding: 20px;
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
    }

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

const DocumentTypeBadge = styled.span<{ type: DocumentType }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
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
`;

const DocumentDescription = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DirectionBadge = styled.span<{ direction: TransactionDirection }>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => `${TransactionDirectionColors[props.direction]}22`};
    color: ${props => TransactionDirectionColors[props.direction]};
    border: 1px solid ${props => `${TransactionDirectionColors[props.direction]}44`};
`;

const AmountCell = styled.div<{ direction: TransactionDirection }>`
    font-weight: 600;
    color: ${props => TransactionDirectionColors[props.direction]};
`;

const PaidAmount = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    font-weight: normal;
    margin-top: 2px;
`;

const StatusBadge = styled.span<{ status: DocumentStatus }>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => `${DocumentStatusColors[props.status]}22`};
    color: ${props => DocumentStatusColors[props.status]};
    border: 1px solid ${props => `${DocumentStatusColors[props.status]}44`};
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

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
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

const PaginationContainer = styled.div`
    margin: 24px 0;
    display: flex;
    justify-content: center;
`;

export default UnifiedFinancialPage;