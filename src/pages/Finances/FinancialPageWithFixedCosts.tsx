// src/pages/Finances/FinancialPageWithFixedCosts.tsx
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import {
    FaFileInvoiceDollar,
    FaBuilding,
    FaChartLine,
    FaExchangeAlt,
    FaSpinner,
    FaSync
} from 'react-icons/fa';

// Import existing components
import FinancialSummaryCards from './components/FinancialSummaryCards';
import DocumentFilters from './components/DocumentFilters';
import DocumentTable from './components/DocumentTable';
import DocumentFormModal from './components/DocumentFormModal';
import DocumentViewModal from './components/DocumentViewModal';

// Import Fixed Costs components
import FixedCostsIntegration from './components/FixedCostsIntegration';

// Import new Reports component
import FinancialReportsPage from "./FinancialReportsPage";

// Import hooks
import { useFinancialData } from './hooks/useFinancialData';
import { useDocumentActions } from './hooks/useDocumentActions';

// Import types
import { DocumentType } from '../../types/finance';

// Import styles and utilities
import { brandTheme } from './styles/theme';
import { useToast } from '../../components/common/Toast/Toast';
import Pagination from '../../components/common/Pagination';
import { companySettingsApi } from "../../api/companySettingsApi";

type ActiveTab = 'documents' | 'fixed-costs' | 'reports';

const FinancialPageWithFixedCosts: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<ActiveTab>('documents');

    // State for Fixed Costs integration
    const [fixedCostsRef, setFixedCostsRef] = useState<{ handleAddFixedCost?: () => void }>({});
    const [backingUp, setBackingUp] = useState(false);

    // Error handling callback
    const handleError = useCallback((message: string) => {
        showToast('error', message);
    }, [showToast]);

    // Success callback
    const handleSuccess = useCallback((message: string) => {
        showToast('success', message);
    }, [showToast]);

    // Use existing hooks for documents
    const {
        documents,
        filteredDocuments,
        summary,
        loading,
        error,
        pagination,
        filters,
        activeTypeFilter,
        refreshData,
        handleFilterChange,
        handleTypeFilterChange,
        handlePageChange,
        handleSearch
    } = useFinancialData();

    const {
        selectedDocument,
        showFormModal,
        showViewModal,
        handleAddDocument,
        handleEditDocument,
        handleViewDocument,
        handleDeleteDocument,
        handleSaveDocument,
        handleStatusChange,
        handleCloseModals
    } = useDocumentActions(refreshData, showToast);

    // Tab configuration
    const tabs = [
        {
            id: 'documents' as ActiveTab,
            label: 'Dokumenty finansowe',
            icon: FaFileInvoiceDollar,
            description: 'Faktury, paragony i inne dokumenty'
        },
        {
            id: 'fixed-costs' as ActiveTab,
            label: 'Koszty stałe',
            icon: FaBuilding,
            description: 'Zarządzanie kosztami stałymi firmy'
        },
        {
            id: 'reports' as ActiveTab,
            label: 'Raporty',
            icon: FaChartLine,
            description: 'Analizy WoW, MoM, YoY i break-even'
        }
    ];

    // Handle tab change
    const handleTabChange = useCallback((tabId: ActiveTab) => {
        setActiveTab(tabId);
    }, []);

    // Handle export for documents tab
    const handleExportDocuments = useCallback(async () => {
        try {
            setBackingUp(true);
            const result = await companySettingsApi.backupCurrentMonth();

            if (result.status === 'success') {
                handleSuccess('Twoje dane zostały pomyślnie przesłane do Google Drive');
            } else {
                handleError(result.message || 'Nie udało się przesłać danych do Google Drive');
            }
        } catch (err) {
            handleError('Nie udało się przesłać danych do Google Drive');
        } finally {
            setBackingUp(false);
        }
    }, [handleError, handleSuccess]);

    // Handle add fixed cost
    const handleAddFixedCost = useCallback(() => {
        if (fixedCostsRef.handleAddFixedCost) {
            fixedCostsRef.handleAddFixedCost();
        }
    }, [fixedCostsRef]);

    // Handle setting fixed costs ref
    const handleSetFixedCostsRef = useCallback((ref: { handleAddFixedCost?: () => void }) => {
        setFixedCostsRef(ref);
    }, []);

    // Handle balance update from FinancialSummaryCards
    const handleBalanceUpdate = useCallback(async (newCashBalance: number, newBankBalance: number) => {
        try {
            handleSuccess('Saldo zostało pomyślnie zaktualizowane');
            // Refresh data to get updated summary
            await refreshData();
        } catch (error) {
            console.error('Error after balance update:', error);
            handleError('Wystąpił błąd podczas odświeżania danych');
        }
    }, [refreshData, handleSuccess, handleError]);

    // Handle document actions with proper error handling
    const handleDocumentStatusChange = useCallback(async (id: string, status: any) => {
        try {
            await handleStatusChange(id, status);
        } catch (error) {
            console.error('Error changing document status:', error);
            handleError('Wystąpił błąd podczas zmiany statusu dokumentu');
        }
    }, [handleStatusChange, handleError]);

    const handleDocumentDelete = useCallback(async (id: string) => {
        try {
            await handleDeleteDocument(id);
        } catch (error) {
            console.error('Error deleting document:', error);
            handleError('Wystąpił błąd podczas usuwania dokumentu');
        }
    }, [handleDeleteDocument, handleError]);

    // Handle download attachment
    const handleDownloadAttachment = useCallback((documentId: string) => {
        try {
            const attachmentUrl = `http://localhost:8080/api/financial-documents/${documentId}/attachment`;
            window.open(attachmentUrl, '_blank');
        } catch (error) {
            console.error('Error downloading attachment:', error);
            handleError('Nie udało się pobrać załącznika');
        }
    }, [handleError]);

    // Loading state for initial load
    if (loading && documents.length === 0 && activeTab === 'documents') {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie modułu finansów...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header with updated navigation */}
            <HeaderContainer>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaFileInvoiceDollar />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Moduł Finansów</HeaderTitle>
                            <HeaderSubtitle>
                                Kompleksowe zarządzanie finansami firmy
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        {activeTab === 'documents' && (
                            <>
                                <SecondaryButton onClick={handleExportDocuments} disabled={backingUp}>
                                    {backingUp ? <FaSpinner className="spinning" /> : <FaExchangeAlt />}
                                    <span>Eksport księgowy</span>
                                </SecondaryButton>

                                <AddButtonGroup>
                                    <PrimaryButton onClick={() => handleAddDocument(DocumentType.INVOICE)}>
                                        <FaFileInvoiceDollar />
                                        <span>Faktura</span>
                                    </PrimaryButton>
                                </AddButtonGroup>
                            </>
                        )}

                        {activeTab === 'fixed-costs' && (
                            <PrimaryButton onClick={handleAddFixedCost}>
                                <FaBuilding />
                                <span>Dodaj koszt stały</span>
                            </PrimaryButton>
                        )}

                        {activeTab === 'reports' && (
                            <SecondaryButton onClick={() => showToast('info', 'Eksport raportów - funkcjonalność w przygotowaniu')}>
                                <FaExchangeAlt />
                                <span>Eksport raportów</span>
                            </SecondaryButton>
                        )}
                    </HeaderActions>
                </HeaderContent>

                {/* Tab Navigation */}
                <TabNavigation>
                    <TabsList>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <TabButton
                                    key={tab.id}
                                    $active={activeTab === tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    <TabIcon>
                                        <Icon />
                                    </TabIcon>
                                    <TabContent>
                                        <TabLabel>{tab.label}</TabLabel>
                                        <TabDescription>{tab.description}</TabDescription>
                                    </TabContent>
                                </TabButton>
                            );
                        })}
                    </TabsList>
                </TabNavigation>
            </HeaderContainer>

            {/* Summary Cards - only for documents tab with balance edit support */}
            {activeTab === 'documents' && summary && (
                <SummarySection>
                    <FinancialSummaryCards
                        summary={summary}
                        isLoading={loading}
                        onBalanceUpdate={handleBalanceUpdate}
                    />
                </SummarySection>
            )}

            {/* Tab Content */}
            <ContentContainer>
                {activeTab === 'documents' && (
                    <>
                        {/* Document Filters */}
                        <DocumentFilters
                            activeTypeFilter={activeTypeFilter}
                            filters={filters}
                            onTypeFilterChange={handleTypeFilterChange}
                            onFilterChange={handleFilterChange}
                            onSearch={handleSearch}
                            resultCount={filteredDocuments.length}
                        />

                        {/* Error Display */}
                        {error && (
                            <ErrorMessage>
                                <ErrorIcon>⚠️</ErrorIcon>
                                <ErrorText>{error}</ErrorText>
                                <RefreshButton onClick={refreshData}>
                                    <FaSync />
                                    Odśwież
                                </RefreshButton>
                            </ErrorMessage>
                        )}

                        {/* Document Table */}
                        <DocumentTable
                            documents={filteredDocuments}
                            loading={loading}
                            onView={handleViewDocument}
                            onEdit={handleEditDocument}
                            onDelete={handleDocumentDelete}
                            onStatusChange={handleDocumentStatusChange}
                            onError={handleError}
                        />

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <PaginationContainer>
                                <Pagination
                                    currentPage={pagination.currentPage + 1}
                                    totalPages={pagination.totalPages}
                                    onPageChange={(page) => handlePageChange(page - 1)}
                                    totalItems={pagination.totalItems}
                                    pageSize={pagination.pageSize}
                                    showTotalItems={true}
                                />
                            </PaginationContainer>
                        )}

                        {/* Document Modals */}
                        <DocumentFormModal
                            isOpen={showFormModal}
                            document={selectedDocument}
                            onSave={handleSaveDocument}
                            onClose={handleCloseModals}
                        />

                        {showViewModal && selectedDocument && (
                            <DocumentViewModal
                                isOpen={showViewModal}
                                document={selectedDocument}
                                onClose={handleCloseModals}
                                onEdit={handleEditDocument}
                                onStatusChange={handleDocumentStatusChange}
                                onDelete={handleDocumentDelete}
                                onDownloadAttachment={handleDownloadAttachment}
                                onError={handleError}
                            />
                        )}
                    </>
                )}

                {activeTab === 'fixed-costs' && (
                    <FixedCostsIntegration onSetRef={handleSetFixedCostsRef} />
                )}

                {activeTab === 'reports' && (
                    <FinancialReportsPage />
                )}
            </ContentContainer>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
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
    margin: ${brandTheme.spacing.xl};
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

const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
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
    gap: ${brandTheme.spacing.xs};

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
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
            display: block;
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

    @media (max-width: 768px) {
        justify-content: center;
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

    @media (max-width: 768px) {
        justify-content: center;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }
`;

const TabNavigation = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${brandTheme.spacing.xl};
    border-top: 1px solid ${brandTheme.border};

    @media (max-width: 1024px) {
        padding: 0 ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md};
    }
`;

const TabsList = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const TabButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border: none;
    background: ${props => props.$active ? brandTheme.surface : 'transparent'};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.lg} ${brandTheme.radius.lg} 0 0;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    min-width: 200px;
    white-space: nowrap;
    border-bottom: 3px solid ${props => props.$active ? brandTheme.primary : 'transparent'};

    &:hover {
        background: ${props => props.$active ? brandTheme.surface : brandTheme.surfaceHover};
        color: ${props => props.$active ? brandTheme.primary : brandTheme.text.primary};
    }

    @media (max-width: 768px) {
        min-width: 160px;
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    }
`;

const TabIcon = styled.div`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
`;

const TabContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-width: 0;
`;

const TabLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
`;

const TabDescription = styled.div`
    font-size: 12px;
    font-weight: 400;
    opacity: 0.8;
    line-height: 1.2;
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
`;

const ErrorIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorText = styled.div`
    flex: 1;
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    background: ${brandTheme.status.error};
    color: white;
    border: none;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error}dd;
        transform: translateY(-1px);
    }
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: ${brandTheme.spacing.lg} 0;
`;

export default FinancialPageWithFixedCosts;