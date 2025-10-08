// src/pages/Finances/FinancialPageWithFixedCosts.tsx
import React, {useCallback, useState} from 'react';
import styled from 'styled-components';
import {
    FaBuilding,
    FaChartLine,
    FaExchangeAlt,
    FaFileInvoiceDollar,
    FaHistory,
    FaSpinner,
    FaSync
} from 'react-icons/fa';
import {PageHeader, PrimaryButton, SecondaryButton} from '../../components/common/PageHeader';

import FinancialSummaryCards from './components/FinancialSummaryCards';
import DocumentFilters from './components/DocumentFilters';
import DocumentTable from './components/DocumentTable';
import DocumentFormModal from './components/DocumentFormModal';
import DocumentViewModal from './components/DocumentViewModal';

import FixedCostsIntegration from './components/FixedCostsIntegration';

import FinancialReportsPage from "./FinancialReportsPage";

import BalanceHistoryModal from './components/BalanceHistoryModal';

import {useFinancialData} from './hooks/useFinancialData';
import {useDocumentActions} from './hooks/useDocumentActions';

import {DocumentType, TransactionDirection} from '../../types/finance';

import {brandTheme} from './styles/theme';
import {useToast} from '../../components/common/Toast/Toast';
import Pagination from '../../components/common/Pagination';
import {companySettingsApi} from "../../api/companySettingsApi";
import {useInvoiceSignature} from "../../hooks/useInvoiceSignature";
import {protocolSignatureApi} from "../../api/protocolSignatureApi";
import {invoicesApi} from "../../api/invoicesApi";
import {invoiceSignatureApi} from "../../api/invoiceSignatureApi";
import {documentPrintService} from "../../api/documentPrintService";
import {Tab} from "../../components/common/PageHeader/PageHeader";

type ActiveTab = 'documents' | 'fixed-costs' | 'reports' | 'balance-history';

const FinancialPageWithFixedCosts: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<ActiveTab>('documents');

    const [fixedCostsRef, setFixedCostsRef] = useState<{ handleAddFixedCost?: () => void }>({});
    const [backingUp, setBackingUp] = useState(false);

    const [showBalanceHistoryModal, setShowBalanceHistoryModal] = useState(false);

    const handleError = useCallback((message: string) => {
        showToast('error', message);
    }, [showToast]);

    const handleSuccess = useCallback((message: string) => {
        showToast('success', message);
    }, [showToast]);

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
        initialDirection,
        handleAddDocument,
        handleEditDocument,
        handleViewDocument,
        handleDeleteDocument,
        handleSaveDocument,
        handleStatusChange,
        handleCloseModals
    } = useDocumentActions(refreshData, showToast);

    const financialTabs: Tab<ActiveTab>[] = [
        {
            id: 'documents',
            label: 'Dokumenty finansowe',
            icon: FaFileInvoiceDollar,
            description: 'Faktury, paragony i inne dokumenty'
        },
        {
            id: 'fixed-costs',
            label: 'Koszty stałe',
            icon: FaBuilding,
            description: 'Zarządzanie kosztami stałymi firmy'
        },
        {
            id: 'reports',
            label: 'Raporty',
            icon: FaChartLine,
            description: 'Analizy WoW, MoM, YoY i break-even'
        }
    ];

    const handleTabChange = useCallback((tabId: ActiveTab) => {
        setActiveTab(tabId);
    }, []);

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

    const handleAddFixedCost = useCallback(() => {
        if (fixedCostsRef.handleAddFixedCost) {
            fixedCostsRef.handleAddFixedCost();
        }
    }, [fixedCostsRef]);

    const handleSetFixedCostsRef = useCallback((ref: { handleAddFixedCost?: () => void }) => {
        setFixedCostsRef(ref);
    }, []);

    const handleBalanceUpdate = useCallback(async (newCashBalance: number, newBankBalance: number) => {
        try {
            handleSuccess('Saldo zostało pomyślnie zaktualizowane');
            await refreshData();
        } catch (error) {
            console.error('Error after balance update:', error);
            handleError('Wystąpił błąd podczas odświeżania danych');
        }
    }, [refreshData, handleSuccess, handleError]);

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

    const handleDownloadAttachment = useCallback(async (documentId: string) => {
        try {
            const result = await documentPrintService.downloadDocument(documentId);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się pobrać podpisanego dokumentu';
            console.error('❌ Error downloading signed document:', err);
            return false;
        }
    }, [handleError]);

    const handleShowBalanceHistory = useCallback(() => {
        setShowBalanceHistoryModal(true);
    }, []);

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

    const getHeaderActions = () => {
        const actions = [];

        if (activeTab === 'documents') {
            actions.push(
                <SecondaryButton key="export" onClick={handleExportDocuments} disabled={backingUp}>
                    {backingUp ? <FaSpinner className="spinning" /> : <FaExchangeAlt />}
                    <span>Eksport księgowy</span>
                </SecondaryButton>
            );

            // Dwa osobne przyciski dla przychodu i wydatku
            actions.push(
                <PrimaryButton
                    key="add-expense"
                    onClick={() => handleAddDocument(DocumentType.INVOICE, TransactionDirection.EXPENSE)}
                >
                    <FaFileInvoiceDollar />
                    <span>Dodaj dokument wychodzący</span>
                </PrimaryButton>
            );

            actions.push(
                <PrimaryButton
                    key="add-income"
                    onClick={() => handleAddDocument(DocumentType.INVOICE, TransactionDirection.INCOME)}
                >
                    <FaFileInvoiceDollar />
                    <span>Dodaj dokument przychodzący</span>
                </PrimaryButton>
            );
        }

        if (activeTab === 'fixed-costs') {
            actions.push(
                <PrimaryButton key="add" onClick={handleAddFixedCost}>
                    <FaBuilding />
                    <span>Dodaj koszt stały</span>
                </PrimaryButton>
            );
        }

        if (activeTab === 'balance-history') {
            actions.push(
                <SecondaryButton key="history" onClick={handleShowBalanceHistory}>
                    <FaHistory />
                    <span>Pokaż pełną historię</span>
                </SecondaryButton>
            );
        }

        if (activeTab === 'reports') {
            actions.push(
                <SecondaryButton key="export-reports" onClick={() => showToast('info', 'Eksport raportów - funkcjonalność w przygotowaniu')}>
                    <FaExchangeAlt />
                    <span>Eksport raportów</span>
                </SecondaryButton>
            );
        }

        return <>{actions}</>;
    };

    return (
        <PageContainer>
            <PageHeader
                icon={FaFileInvoiceDollar}
                title="Moduł Finansów"
                subtitle="Kompleksowe zarządzanie finansami firmy"
                actions={getHeaderActions()}
                tabs={financialTabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {activeTab === 'documents' && summary && (
                <SummarySection>
                    <FinancialSummaryCards
                        summary={summary}
                        isLoading={loading}
                        onBalanceUpdate={handleBalanceUpdate}
                    />
                </SummarySection>
            )}


            <ContentContainer>
                {activeTab === 'documents' && (
                    <>
                        <DocumentFilters
                            activeTypeFilter={activeTypeFilter}
                            filters={filters}
                            onTypeFilterChange={handleTypeFilterChange}
                            onFilterChange={handleFilterChange}
                            onSearch={handleSearch}
                            resultCount={filteredDocuments.length}
                        />

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

                        <DocumentTable
                            documents={filteredDocuments}
                            loading={loading}
                            onView={handleViewDocument}
                            onEdit={handleEditDocument}
                            onDelete={handleDocumentDelete}
                            onStatusChange={handleDocumentStatusChange}
                            onError={handleError}
                        />

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

                        <DocumentFormModal
                            isOpen={showFormModal}
                            document={selectedDocument}
                            initialDirection={initialDirection}
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
                    <FixedCostsIntegration onSetRef={handleSetFixedCostsRef} onDataChange={refreshData}/>
                )}

                {activeTab === 'balance-history' && (
                    <BalanceHistoryContainer>
                        <BalanceHistoryHeader>
                            <HistoryHeaderText>
                                <HistoryTitle>Historia zmian sald</HistoryTitle>
                                <HistorySubtitle>
                                    Przegląd wszystkich operacji wpływających na stan kasy i konta bankowego
                                </HistorySubtitle>
                            </HistoryHeaderText>
                        </BalanceHistoryHeader>
                        <BalanceHistoryContent>
                            <HistoryDescription>
                                W tej sekcji możesz przeglądać szczegółową historię wszystkich zmian sald w systemie.
                                Historia obejmuje zarówno operacje automatyczne (z dokumentów finansowych) jak i manualne korekty.
                            </HistoryDescription>
                            <HistoryActionButton onClick={handleShowBalanceHistory}>
                                <FaHistory />
                                Otwórz pełną historię sald
                            </HistoryActionButton>
                        </BalanceHistoryContent>
                    </BalanceHistoryContainer>
                )}

                {activeTab === 'reports' && (
                    <FinancialReportsPage />
                )}
            </ContentContainer>

            <BalanceHistoryModal
                isOpen={showBalanceHistoryModal}
                onClose={() => setShowBalanceHistoryModal(false)}
            />

            <style>{`
                .spinning {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </PageContainer>
    );
};

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

const BalanceHistoryContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
`;

const BalanceHistoryHeader = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
`;

const HistoryHeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const HistoryTitle = styled.h2`
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const HistorySubtitle = styled.p`
    margin: 0;
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;
`;

const BalanceHistoryContent = styled.div`
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brandTheme.spacing.xl};
    text-align: center;
    min-height: 300px;
    justify-content: center;
`;

const HistoryDescription = styled.p`
    margin: 0;
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    line-height: 1.6;
    max-width: 600px;
`;

const HistoryActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.lg};
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${brandTheme.shadow.md};

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.lg};
    }

    &:active {
        transform: translateY(0);
    }

    svg {
        font-size: 20px;
    }
`;

export default FinancialPageWithFixedCosts;