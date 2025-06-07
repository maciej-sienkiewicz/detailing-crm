// src/pages/Finances/FinancialPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaFileInvoiceDollar, FaPlus, FaChartLine } from 'react-icons/fa';
import {
    UnifiedFinancialDocument,
    DocumentType,
    DocumentStatus,
    TransactionDirection
} from '../../types/finance';
import { unifiedFinancialApi } from '../../api/unifiedFinancialApi';
import { useToast } from '../../components/common/Toast/Toast';

// Components
import FinancialHeader from './components/FinancialHeader';
import FinancialSummaryCards from './components/FinancialSummaryCards';
import DocumentFilters from './components/DocumentFilters';
import DocumentTable from './components/DocumentTable';
import DocumentFormModal from './components/DocumentFormModal';
import DocumentViewModal from './components/DocumentViewModal';
import Pagination from '../../components/common/Pagination';

// Hooks
import { useFinancialData } from './hooks/useFinancialData';
import { useDocumentActions } from './hooks/useDocumentActions';

// Styles
import { brandTheme } from './styles/theme';

const FinancialPage: React.FC = () => {
    const { showToast } = useToast();

    // Custom hooks
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

    // Loading state
    if (loading && documents.length === 0) {
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
            {/* Header Section */}
            <FinancialHeader
                onAddDocument={handleAddDocument}
                onExport={handleExportDocuments}
            />

            {/* Summary Cards */}
            {summary && (
                <FinancialSummaryCards
                    summary={summary}
                    isLoading={loading}
                />
            )}

            {/* Content Container */}
            <ContentContainer>
                {/* Filters */}
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
                    </ErrorMessage>
                )}

                {/* Document Table */}
                <DocumentTable
                    documents={filteredDocuments}
                    loading={loading}
                    onView={handleViewDocument}
                    onEdit={handleEditDocument}
                    onDelete={handleDeleteDocument}
                    onStatusChange={handleStatusChange}
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
            </ContentContainer>

            {/* Modals */}
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
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteDocument}
                />
            )}
        </PageContainer>
    );

    // Helper functions
    function handleExportDocuments() {
        showToast('info', 'Eksport dokumentów - funkcjonalność w przygotowaniu');
    }
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
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

const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: ${brandTheme.spacing.lg} 0;
`;

export default FinancialPage;