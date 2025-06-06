// src/pages/Finances/UnifiedFinancialPage.tsx - Professional Premium Automotive CRM
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaFileInvoiceDollar, FaReceipt, FaExchangeAlt, FaExclamationTriangle } from 'react-icons/fa';
import {
    UnifiedFinancialDocument,
    UnifiedDocumentFilters,
    UnifiedDocumentSummary,
    DocumentType,
    DocumentStatus
} from '../../types/finance';
import { unifiedFinancialApi } from '../../api/unifiedFinancialApi';
import { useToast } from '../../components/common/Toast/Toast';
import Pagination from '../../components/common/Pagination';

// Components
import FinancialHeader from './components/FinancialHeader';
import FinancialSummaryCards from './components/FinancialSummaryCards';
import FinancialFilters from './components/FinancialFilters';
import FinancialDocumentsList from './components/FinancialDocumentsList';
import FinancialLoadingState from './components/FinancialLoadingState';
import UnifiedDocumentFormModal from './components/UnifiedDocumentFormModal';
import UnifiedDocumentViewModal from './components/UnifiedDocumentViewModal';

// Professional Brand Theme - Premium Automotive CRM
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
    const [activeTypeFilter, setActiveTypeFilter] = useState<DocumentType | 'ALL'>('ALL');

    // Modal state
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [selectedDocument, setSelectedDocument] = useState<UnifiedFinancialDocument | undefined>(undefined);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 15,
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
            <FinancialHeader onAddDocument={handleAddDocument} />

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
                <FinancialFilters
                    filters={filters}
                    activeTypeFilter={activeTypeFilter}
                    onFiltersChange={setFilters}
                    onTypeFilterChange={setActiveTypeFilter}
                    documentsCount={filteredDocuments.length}
                />

                {/* Error Display */}
                {error && (
                    <ErrorMessage>
                        <FaExclamationTriangle />
                        {error}
                    </ErrorMessage>
                )}

                {/* Loading State or Documents List */}
                {loading ? (
                    <FinancialLoadingState />
                ) : (
                    <>
                        {/* Documents List */}
                        <FinancialDocumentsList
                            documents={filteredDocuments}
                            onViewDocument={handleViewDocument}
                            onEditDocument={handleEditDocument}
                            onDeleteDocument={handleDeleteDocument}
                        />

                        {/* Pagination */}
                        {filteredDocuments.length > 0 && pagination.totalPages > 1 && (
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
            {showFormModal && (
                <UnifiedDocumentFormModal
                    isOpen={showFormModal}
                    document={selectedDocument}
                    onSave={handleSaveDocument}
                    onClose={() => setShowFormModal(false)}
                />
            )}

            {selectedDocument && showViewModal && (
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

// Professional Styled Components - Minimal & Elegant (wzorowane na OwnersPage)
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
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

const PaginationContainer = styled.div`
    margin: ${brandTheme.spacing.lg} 0;
    display: flex;
    justify-content: center;
`;

export default UnifiedFinancialPage;