// src/pages/Finances/hooks/useDocumentActions.ts
import {useCallback, useState} from 'react';
import {DocumentStatus, DocumentType, UnifiedFinancialDocument} from '../../../types/finance';
import {unifiedFinancialApi} from '../../../api/unifiedFinancialApi';

// Użyj dokładnie tego samego typu co w Toast.tsx
type ToastType = 'success' | 'error' | 'info';

export const useDocumentActions = (
    refreshData: () => Promise<void>,
    showToast: (type: ToastType, message: string, duration?: number) => void
) => {
    // State
    const [selectedDocument, setSelectedDocument] = useState<UnifiedFinancialDocument | undefined>(undefined);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    // Handle adding new document
    const handleAddDocument = useCallback((type?: DocumentType) => {
        setSelectedDocument(undefined);
        setShowFormModal(true);
    }, []);

    // Handle editing document
    const handleEditDocument = useCallback((document: UnifiedFinancialDocument) => {
        setSelectedDocument(document);
        setShowFormModal(true);
    }, []);

    // Handle viewing document
    const handleViewDocument = useCallback((document: UnifiedFinancialDocument) => {
        setSelectedDocument(document);
        setShowViewModal(true);
    }, []);

    // Handle deleting document
    const handleDeleteDocument = useCallback(async (id: string) => {
        try {
            const success = await unifiedFinancialApi.deleteDocument(id);

            if (success) {
                showToast('success', 'Dokument został usunięty');
                await refreshData();

                // Close modals if deleted document was being viewed/edited
                if (selectedDocument?.id === id) {
                    setShowViewModal(false);
                    setShowFormModal(false);
                    setSelectedDocument(undefined);
                }
            } else {
                showToast('error', 'Nie udało się usunąć dokumentu');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            showToast('error', 'Wystąpił błąd podczas usuwania dokumentu');
        }
    }, [selectedDocument, refreshData, showToast]);

    // Handle saving document (create or update)
    const handleSaveDocument = useCallback(async (
        documentData: Partial<UnifiedFinancialDocument>,
        file?: File | null
    ) => {
        try {
            if (selectedDocument && selectedDocument.id) {
                // Update existing document
                const updatedDocument = await unifiedFinancialApi.updateDocument(
                    selectedDocument.id,
                    documentData,
                    file || undefined
                );

                if (updatedDocument) {
                    showToast('success', 'Dokument został zaktualizowany');
                }
            } else {
                // Create new document
                const newDocument = await unifiedFinancialApi.createDocument(
                    documentData,
                    file || undefined
                );

                if (newDocument) {
                    showToast('success', 'Nowy dokument został dodany');
                }
            }

            // Refresh data and close modal
            await refreshData();
            setShowFormModal(false);
            setSelectedDocument(undefined);

        } catch (error) {
            console.error('Error saving document:', error);
            showToast('error', 'Wystąpił błąd podczas zapisywania dokumentu');
        }
    }, [selectedDocument, refreshData, showToast]);

    // Handle status change
    const handleStatusChange = useCallback(async (id: string, status: DocumentStatus) => {
        try {
            const success = await unifiedFinancialApi.updateDocumentStatus(id, status);

            if (success) {
                showToast('success', 'Status dokumentu został zaktualizowany');
                await refreshData();

                // Update selected document if it's the one being changed
                if (selectedDocument?.id === id) {
                    setSelectedDocument(prev => prev ? { ...prev, status } : prev);
                }
            } else {
                showToast('error', 'Nie udało się zmienić statusu dokumentu');
            }
        } catch (error) {
            console.error('Error changing document status:', error);
            showToast('error', 'Wystąpił błąd podczas zmiany statusu dokumentu');
        }
    }, [selectedDocument, refreshData, showToast]);

    // Handle downloading attachment
    const handleDownloadAttachment = useCallback((documentId: string) => {
        try {
            const attachmentUrl = unifiedFinancialApi.getDocumentAttachmentUrl(documentId);
            window.open(attachmentUrl, '_blank');
        } catch (error) {
            console.error('Error downloading attachment:', error);
            showToast('error', 'Nie udało się pobrać załącznika');
        }
    }, [showToast]);

    // Handle closing modals
    const handleCloseModals = useCallback(() => {
        setShowFormModal(false);
        setShowViewModal(false);
        setSelectedDocument(undefined);
    }, []);

    return {
        // State
        selectedDocument,
        showFormModal,
        showViewModal,

        // Actions
        handleAddDocument,
        handleEditDocument,
        handleViewDocument,
        handleDeleteDocument,
        handleSaveDocument,
        handleStatusChange,
        handleDownloadAttachment,
        handleCloseModals
    };
};