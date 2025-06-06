// src/pages/Finances/UnifiedFinancialPage.tsx - Professional Premium Automotive CRM
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
    FaTrashAlt,
    FaSearch,
    FaCheck,
    FaTimes,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaExclamationTriangle
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

const UnifiedFinancialPage: React.FC = () => {
    // State management
    const [documents, setDocuments] = useState<UnifiedFinancialDocument[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<UnifiedFinancialDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filters state
    const [filters, setFilters] = useState<UnifiedDocumentFilters>({});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [activeTypeFilter, setActiveTypeFilter] = useState<DocumentType | 'ALL'>('ALL');

    // Modal state
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [selectedDocument, setSelectedDocument] = useState<UnifiedFinancialDocument | undefined>(undefined);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // Summary state
    const [summary, setSummary] = useState<UnifiedDocumentSummary | null>(null);
    const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

    const { showToast } = useToast();

    // Load data on component mount
    useEffect(() => {
        fetchDocuments();
        fetchSummary();
    }, [pagination.currentPage, filters]);

    // Apply filters when documents or filters change
    useEffect(() => {
        applyFilters();
    }, [documents, activeTypeFilter, filters]);

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
            console.error('Error fetching documents:', err);
            setError('Nie udało się pobrać listy dokumentów. Spróbuj ponownie później.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            setLoadingSummary(true);
            const summaryData = await unifiedFinancialApi.getFinancialSummary();
            setSummary(summaryData);
        } catch (err) {
            console.error('Error fetching summary:', err);
            showToast('error', 'Nie udało się pobrać podsumowania finansowego');
        } finally {
            setLoadingSummary(false);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
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
                return <FaExchangeAlt />;
        }
    };

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

    const applyFilters = () => {
        if (!documents.length) return;

        let result = [...documents];

        if (activeTypeFilter !== 'ALL') {
            result = result.filter(doc => doc.type === activeTypeFilter);
        }

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

    const handleAddDocument = (type?: DocumentType) => {
        setSelectedDocument(undefined);
        setShowFormModal(true);
    };

    const handleEditDocument = (document: UnifiedFinancialDocument) => {
        setSelectedDocument(document);
        setShowFormModal(true);
    };

    const handleSaveDocument = async (documentData: Partial<UnifiedFinancialDocument>, file?: File | null) => {
        try {
            setLoading(true);

            if (selectedDocument && selectedDocument.id) {
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
                const newDocument = await unifiedFinancialApi.createDocument(
                    documentData,
                    file || undefined
                );

                if (newDocument) {
                    setDocuments(prevDocs => [newDocument, ...prevDocs]);
                    showToast('success', 'Nowy dokument został dodany');
                }
            }

            fetchSummary();
            setShowFormModal(false);
        } catch (error) {
            console.error('Error saving document:', error);
            showToast('error', 'Wystąpił błąd podczas zapisywania dokumentu');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (document: UnifiedFinancialDocument) => {
        setSelectedDocument(document);
        setShowViewModal(true);
    };

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
                console.error('Error deleting document:', error);
                showToast('error', 'Wystąpił błąd podczas usuwania dokumentu');
            } finally {
                setLoading(false);
            }
        }
    };

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
            console.error('Error changing document status:', error);
            showToast('error', 'Wystąpił błąd podczas zmiany statusu dokumentu');
        }
    };

    const handleDownloadAttachment = (documentId: string) => {
        const attachmentUrl = unifiedFinancialApi.getDocumentAttachmentUrl(documentId);
        window.open(attachmentUrl, '_blank');
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage - 1
        }));
    };

    return (
        <PageContainer>
            {/* Professional Header */}
            <PageHeader>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaFileInvoiceDollar />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Dokumenty finansowe</HeaderTitle>
                            <HeaderSubtitle>
                                Zarządzanie dokumentacją finansową premium detailing
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        <AddButtonGroup>
                            <PrimaryButton onClick={() => handleAddDocument(DocumentType.INVOICE)}>
                                <FaFileInvoiceDollar />
                                <span>Dodaj fakturę</span>
                            </PrimaryButton>
                            <PrimaryButton onClick={() => handleAddDocument(DocumentType.RECEIPT)}>
                                <FaReceipt />
                                <span>Dodaj paragon</span>
                            </PrimaryButton>
                            <SecondaryButton onClick={() => handleAddDocument(DocumentType.OTHER)}>
                                <FaExchangeAlt />
                                <span>Inna operacja</span>
                            </SecondaryButton>
                        </AddButtonGroup>
                    </HeaderActions>
                </HeaderContent>
            </PageHeader>

            {/* Financial Summary Cards */}
            {summary && (
                <SummarySection>
                    <FinancialSummaryCards
                        summary={summary}
                        isLoading={loadingSummary}
                    />
                </SummarySection>
            )}

            {/* Content Container */}
            <ContentContainer>
                {/* Advanced Filters */}
                <FiltersContainer $expanded={showAdvancedFilters}>
                    <FiltersToggle onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} $hasActiveFilters={Object.keys(filters).length > 0 || activeTypeFilter !== 'ALL'}>
                        <ToggleLeft>
                            <FilterIcon $active={Object.keys(filters).length > 0 || activeTypeFilter !== 'ALL'}>
                                <FaFilter />
                            </FilterIcon>
                            <ToggleContent>
                                <ToggleTitle>
                                    Filtry i wyszukiwanie
                                    {(Object.keys(filters).length > 0 || activeTypeFilter !== 'ALL') && (
                                        <ActiveFiltersBadge>{Object.keys(filters).length + (activeTypeFilter !== 'ALL' ? 1 : 0)}</ActiveFiltersBadge>
                                    )}
                                </ToggleTitle>
                                <ToggleSubtitle>
                                    {(Object.keys(filters).length > 0 || activeTypeFilter !== 'ALL')
                                        ? `Wyniki: ${filteredDocuments.length} dokumentów`
                                        : 'Kliknij aby otworzyć opcje filtrowania i wyszukiwania dokumentów'
                                    }
                                </ToggleSubtitle>
                            </ToggleContent>
                        </ToggleLeft>

                        <ToggleActions>
                            {(Object.keys(filters).length > 0 || activeTypeFilter !== 'ALL') && (
                                <ClearFiltersButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFilters({});
                                        setActiveTypeFilter('ALL');
                                    }}
                                >
                                    <FaTimes />
                                    <span>Wyczyść</span>
                                </ClearFiltersButton>
                            )}
                            <ExpandIcon $expanded={showAdvancedFilters}>
                                {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                            </ExpandIcon>
                        </ToggleActions>
                    </FiltersToggle>

                    {showAdvancedFilters && (
                        <FiltersContent>
                            {/* Type Filter Buttons */}
                            <TypeFilterSection>
                                Typ dokumentu
                                <TypeFilterButtons>
                                    <TypeFilterButton
                                        $active={activeTypeFilter === 'ALL'}
                                        onClick={() => handleTypeFilterChange('ALL')}
                                    >
                                        Wszystkie
                                    </TypeFilterButton>

                                    {Object.values(DocumentType).map((type) => (
                                        <TypeFilterButton
                                            key={type}
                                            $active={activeTypeFilter === type}
                                            onClick={() => handleTypeFilterChange(type)}
                                            $documentType={type}
                                        >
                                            {getDocumentIcon(type)}
                                            {DocumentTypeLabels[type]}
                                        </TypeFilterButton>
                                    ))}
                                </TypeFilterButtons>
                            </TypeFilterSection>

                            {/* Advanced Filters */}
                                Wyszukiwanie zaawansowane
                                <AdvancedFilters
                                    filters={filters}
                                    onFiltersChange={setFilters}
                                />
                        </FiltersContent>
                    )}
                </FiltersContainer>

                {/* Error Display */}
                {error && (
                    <ErrorMessage>
                        <FaExclamationTriangle />
                        {error}
                    </ErrorMessage>
                )}

                {/* Loading State */}
                {loading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie dokumentów finansowych...</LoadingText>
                    </LoadingContainer>
                ) : (
                    <>
                        {/* Documents Table */}
                        <TableContainer>
                            <DocumentsTable
                                documents={filteredDocuments}
                                onViewDocument={handleViewDocument}
                                onEditDocument={handleEditDocument}
                                onDeleteDocument={handleDeleteDocument}
                                formatDate={formatDate}
                                formatAmount={formatAmount}
                                getDocumentIcon={getDocumentIcon}
                            />
                        </TableContainer>

                        {/* Pagination */}
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
                    </>
                )}
            </ContentContainer>

            {/* Modals */}
            <UnifiedDocumentFormModal
                isOpen={showFormModal}
                document={selectedDocument}
                onSave={handleSaveDocument}
                onClose={() => setShowFormModal(false)}
            />

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

// Advanced Filters Component
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
                <FilterLabel htmlFor="title">
                    <FilterLabelIcon><FaSearch /></FilterLabelIcon>
                    Nazwa dokumentu
                </FilterLabel>
                <FilterInputWrapper>
                    <FilterInput
                        id="title"
                        value={filters.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Wyszukaj po nazwie dokumentu..."
                        $hasValue={!!filters.title}
                    />
                    {filters.title && (
                        <ClearInputButton
                            onClick={() => handleChange('title', '')}
                        >
                            <FaTimes />
                        </ClearInputButton>
                    )}
                </FilterInputWrapper>
            </FormGroup>

            <FormGroup>
                <FilterLabel htmlFor="buyerName">
                    <FilterLabelIcon><FaSearch /></FilterLabelIcon>
                    Kontrahent
                </FilterLabel>
                <FilterInputWrapper>
                    <FilterInput
                        id="buyerName"
                        value={filters.buyerName || ''}
                        onChange={(e) => handleChange('buyerName', e.target.value)}
                        placeholder="Wyszukaj po nazwie kontrahenta..."
                        $hasValue={!!filters.buyerName}
                    />
                    {filters.buyerName && (
                        <ClearInputButton
                            onClick={() => handleChange('buyerName', '')}
                        >
                            <FaTimes />
                        </ClearInputButton>
                    )}
                </FilterInputWrapper>
            </FormGroup>

            <FormGroup>
                <FilterLabel htmlFor="status">
                    <FilterLabelIcon><FaFilter /></FilterLabelIcon>
                    Status
                </FilterLabel>
                <FilterSelect
                    id="status"
                    value={filters.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                    $hasValue={!!filters.status}
                >
                    <option value="">Wszystkie statusy</option>
                    {Object.entries(DocumentStatusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </FilterSelect>
            </FormGroup>

            <FormGroup>
                <FilterLabel htmlFor="direction">
                    <FilterLabelIcon><FaExchangeAlt /></FilterLabelIcon>
                    Kierunek
                </FilterLabel>
                <FilterSelect
                    id="direction"
                    value={filters.direction || ''}
                    onChange={(e) => handleChange('direction', e.target.value)}
                    $hasValue={!!filters.direction}
                >
                    <option value="">Wszystkie</option>
                    {Object.entries(TransactionDirectionLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </FilterSelect>
            </FormGroup>

            <FormGroup>
                <FilterLabel htmlFor="dateFrom">
                    <FilterLabelIcon><FaCalendarAlt /></FilterLabelIcon>
                    Data od
                </FilterLabel>
                <FilterInput
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleChange('dateFrom', e.target.value)}
                    $hasValue={!!filters.dateFrom}
                />
            </FormGroup>

            <FormGroup>
                <FilterLabel htmlFor="dateTo">
                    <FilterLabelIcon><FaCalendarAlt /></FilterLabelIcon>
                    Data do
                </FilterLabel>
                <FilterInput
                    id="dateTo"
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleChange('dateTo', e.target.value)}
                    $hasValue={!!filters.dateTo}
                />
            </FormGroup>

            <FormGroup>
                <FilterLabel htmlFor="minAmount">
                    <FilterLabelIcon><FaMoneyBillWave /></FilterLabelIcon>
                    Kwota od
                </FilterLabel>
                <FilterInput
                    id="minAmount"
                    type="number"
                    step="0.01"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleChange('minAmount', parseFloat(e.target.value))}
                    placeholder="Minimalna kwota"
                    $hasValue={!!filters.minAmount}
                />
            </FormGroup>

            <FormGroup>
                <FilterLabel htmlFor="maxAmount">
                    <FilterLabelIcon><FaMoneyBillWave /></FilterLabelIcon>
                    Kwota do
                </FilterLabel>
                <FilterInput
                    id="maxAmount"
                    type="number"
                    step="0.01"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleChange('maxAmount', parseFloat(e.target.value))}
                    placeholder="Maksymalna kwota"
                    $hasValue={!!filters.maxAmount}
                />
            </FormGroup>
        </FiltersGrid>
    );
};

// Documents Table Component
const DocumentsTable: React.FC<{
    documents: UnifiedFinancialDocument[];
    onViewDocument: (document: UnifiedFinancialDocument) => void;
    onEditDocument: (document: UnifiedFinancialDocument) => void;
    onDeleteDocument: (id: string) => void;
    formatDate: (date: string) => string;
    formatAmount: (amount: number) => string;
    getDocumentIcon: (type: DocumentType) => JSX.Element;
}> = ({
          documents,
          onViewDocument,
          onEditDocument,
          onDeleteDocument,
          formatDate,
          formatAmount,
          getDocumentIcon
      }) => {
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
                <ListTitle>
                    Lista dokumentów ({documents.length})
                </ListTitle>
            </ListHeader>

            <TableWrapper>
                <TableContent>
                    <TableHead>
                        <HeaderCell $width="15%">Typ</HeaderCell>
                        <HeaderCell $width="20%">Dokument</HeaderCell>
                        <HeaderCell $width="15%">Daty</HeaderCell>
                        <HeaderCell $width="20%">Kontrahent</HeaderCell>
                        <HeaderCell $width="10%">Kierunek</HeaderCell>
                        <HeaderCell $width="10%">Kwota</HeaderCell>
                        <HeaderCell $width="10%">Akcje</HeaderCell>
                    </TableHead>

                    <TableBody>
                        {documents.map(document => (
                            <StyledTableRow
                                key={document.id}
                                onClick={() => onViewDocument(document)}
                            >
                                <TableCell $width="20%">
                                    <DocumentInfo>
                                        <DocumentHeader>
                                            <DocumentTypeDisplay $type={document.type}>
                                                {getDocumentIcon(document.type)}
                                                <DocumentTypeText>{DocumentTypeLabels[document.type]}</DocumentTypeText>
                                            </DocumentTypeDisplay>
                                        </DocumentHeader>
                                        <DocumentDetails>
                                            <DocumentNumber>{document.number}</DocumentNumber>
                                            <DocumentTitle>{document.title}</DocumentTitle>
                                            {document.description && (
                                                <DocumentDescription>{document.description}</DocumentDescription>
                                            )}
                                        </DocumentDetails>
                                    </DocumentInfo>
                                </TableCell>

                                <TableCell $width="15%">
                                    <DateInfo>
                                        <DateItem>
                                            <FaCalendarAlt />
                                                <DateLabel>Termin</DateLabel>
                                                <DateValue>{formatDate(document.dueDate)}</DateValue>
                                        </DateItem>
                                    </DateInfo>
                                </TableCell>

                                <TableCell $width="20%">
                                    <ContractorInfo>
                                        <ContractorName>{document.buyerName}</ContractorName>
                                        {document.buyerTaxId && (
                                            <ContractorDetail>NIP: {document.buyerTaxId}</ContractorDetail>
                                        )}
                                        <PaymentMethod>{PaymentMethodLabels[document.paymentMethod]}</PaymentMethod>
                                    </ContractorInfo>
                                </TableCell>

                                <TableCell $width="10%">
                                    <DirectionBadge $direction={document.direction}>
                                        {TransactionDirectionLabels[document.direction]}
                                    </DirectionBadge>
                                </TableCell>

                                <TableCell $width="15%">
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
                                </TableCell>

                                <TableCell $width="10%">
                                    <StatusBadge $status={document.status}>
                                        {DocumentStatusLabels[document.status]}
                                    </StatusBadge>
                                </TableCell>

                                <TableCell $width="10%" onClick={(e) => e.stopPropagation()}>
                                    <ActionButtons>
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
                                    </ActionButtons>
                                </TableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </TableContent>
            </TableWrapper>
        </ListContainer>
    );
};

// Professional Styled Components - Identical to VehiclesPage styling
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const PageHeader = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const HeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${brandTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.xs};

        > * {
            width: 100%;
        }
    }
`;

const AddButtonGroup = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
        gap: ${brandTheme.spacing.xs};
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    span {
        @media (max-width: 480px) {
            display: none;
        }
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const SummarySection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md} 0;
    }
`;

const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${brandTheme.spacing.xl} ${brandTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
    min-height: 0;
    overflow: hidden;

    @media (max-width: 1024px) {
        padding: 0 ${brandTheme.spacing.lg} ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md} ${brandTheme.spacing.md};
        gap: ${brandTheme.spacing.md};
    }
`;

const TypeFilterSection = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    padding: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.sm};
`;

const TypeFilterButtons = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const TypeFilterButton = styled.button<{
    $active: boolean;
    $documentType?: DocumentType;
}>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-weight: ${props => props.$active ? '600' : '400'};
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    white-space: nowrap;
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};

    &:hover {
        background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surfaceHover};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-start;
    }
`;

const FiltersContainer = styled.div<{ $expanded: boolean }>`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${props => props.$expanded ? brandTheme.border : brandTheme.borderLight};
    overflow: hidden;
    box-shadow: ${props => props.$expanded ? brandTheme.shadow.sm : brandTheme.shadow.xs};
    transition: all 0.3s ease;
`;

const FiltersToggle = styled.button<{ $hasActiveFilters?: boolean }>`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${props => props.$hasActiveFilters ? brandTheme.primaryGhost : brandTheme.surface};
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    border-radius: ${brandTheme.radius.md};

    &:hover {
        background: ${props => props.$hasActiveFilters ? brandTheme.primaryGhost : brandTheme.surfaceHover};
    }
`;

const ToggleLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    flex: 1;
    min-width: 0;
`;

const FilterIcon = styled.div<{ $active: boolean }>`
    width: 40px;
    height: 40px;
    background: ${props => props.$active
    ? `linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%)`
    : brandTheme.surfaceElevated
};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$active ? 'white' : brandTheme.text.tertiary};
    font-size: 16px;
    box-shadow: ${props => props.$active ? brandTheme.shadow.sm : brandTheme.shadow.xs};
    transition: all 0.2s ease;
    flex-shrink: 0;
`;

const ToggleContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const ToggleTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 16px;
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
`;

const ActiveFiltersBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background: ${brandTheme.primary};
    color: white;
    border-radius: ${brandTheme.radius.lg};
    font-size: 12px;
    font-weight: 700;
    padding: 0 ${brandTheme.spacing.xs};
    box-shadow: ${brandTheme.shadow.sm};
`;

const ToggleSubtitle = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.4;
`;

const ToggleActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const ClearFiltersButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    border: 1px solid ${brandTheme.status.error}30;
    border-radius: ${brandTheme.radius.md};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    span {
        @media (max-width: 640px) {
            display: none;
        }
    }
`;

const ExpandIcon = styled.div<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: ${brandTheme.text.tertiary};
    font-size: 14px;
    transition: all 0.2s ease;
    transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const FiltersContent = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-top: 1px solid ${brandTheme.borderLight};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${brandTheme.spacing.lg};
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const FilterLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const FilterLabelIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
`;

const FilterInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const FilterInput = styled.input<{ $hasValue: boolean }>`
    width: 100%;
    height: 48px;
    padding: 0 ${brandTheme.spacing.md};
    padding-right: ${props => props.$hasValue ? '40px' : brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    ${props => props.$hasValue && `
        font-weight: 600;
    `}
`;

const FilterSelect = styled.select<{ $hasValue: boolean }>`
    width: 100%;
    height: 48px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasValue ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${props => props.$hasValue ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
        background: ${brandTheme.surface};
    }

    ${props => props.$hasValue && `
        font-weight: 600;
    `}
`;

const ClearInputButton = styled.button`
    position: absolute;
    right: ${brandTheme.spacing.sm};
    width: 24px;
    height: 24px;
    border: none;
    background: ${brandTheme.text.muted};
    color: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error};
        transform: scale(1.1);
    }
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.status.error}30;
    font-weight: 500;
    box-shadow: ${brandTheme.shadow.xs};

    svg {
        font-size: 18px;
        flex-shrink: 0;
    }
`;

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

const TableContainer = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 400px);

    @media (max-width: 1024px) {
        max-height: calc(100vh - 350px);
    }

    @media (max-width: 768px) {
        max-height: calc(100vh - 300px);
    }
`;

const ListContainer = styled.div`
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

const ListHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const ListTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

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
    transition: background-color 0.2s ease;
    background: ${brandTheme.surface};

    &:hover {
        background: ${brandTheme.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    padding: ${brandTheme.spacing.md};
    display: flex;
    align-items: center;
    min-height: 64px;
    border-right: 1px solid ${brandTheme.borderLight};

    &:last-child {
        border-right: none;
    }
`;

// Document Info Components
const DocumentInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
    width: 100%;
`;

const DocumentHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const DocumentTypeText = styled.span`
    font-size: 10px;
    font-weight: 500;
`;

const DocumentDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const DocumentNumber = styled.div`
    font-size: 12px;
    color: ${brandTheme.primary};
    font-weight: 600;
    font-family: monospace;
    letter-spacing: 0.5px;
`;

const DocumentTitle = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};
    line-height: 1.3;
`;

const DocumentDescription = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    font-weight: 400;
    line-height: 1.3;
`;

// Date Info Components - simplified for two lines
const DateInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
    width: 100%;
`;

const DateItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const DateLabel = styled.div`
    font-size: 10px;
    color: ${brandTheme.text.muted};
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DateValue = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

// Document Type Info Components
const DocumentTypeInfo = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
`;

const DocumentTypeDisplay = styled.div<{ $type: DocumentType }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};

    svg {
        font-size: 12px;
    }
`;

// Contractor Info Components
const ContractorInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    width: 100%;
`;

const ContractorName = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};
    line-height: 1.3;
`;

const ContractorDetail = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.tertiary};
    font-weight: 400;
`;

const PaymentMethod = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    font-weight: 400;
`;

// Direction Badge Component
const DirectionBadge = styled.div<{ $direction: TransactionDirection }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.secondary};
    border: 1px solid ${brandTheme.border};
    white-space: nowrap;
`;

// Amount Components
const AmountDisplay = styled.div<{ $direction: TransactionDirection }>`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${brandTheme.spacing.xs};
`;

const AmountValue = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    line-height: 1.2;
`;

const AmountNet = styled.div`
    font-size: 10px;
    color: ${brandTheme.text.muted};
    font-weight: 400;
`;

// Status Badge Component
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
    white-space: nowrap;
`;

// Action Components
const ActionButtons = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
    flex-wrap: wrap;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'info' | 'success' | 'secondary';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 11px;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};

    &:hover {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
    }

    ${({ $variant }) => {
    if ($variant === 'delete') {
        return `
                &:hover {
                    background: ${brandTheme.status.error};
                    border-color: ${brandTheme.status.error};
                    color: white;
                }
            `;
    }
    return '';
}}
`;

// Empty State Components
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
    margin: ${brandTheme.spacing.lg};
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

const PaginationContainer = styled.div`
    margin: ${brandTheme.spacing.lg} 0;
    display: flex;
    justify-content: center;
`;

export default UnifiedFinancialPage;