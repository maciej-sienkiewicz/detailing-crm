// src/pages/Finances/hooks/useDocumentOperations.ts
import { useCallback, useState } from 'react';
import { documentPrintService } from '../../../api/documentPrintService';
import { UnifiedFinancialDocument } from '../../../types/finance';

interface UseDocumentOperationsProps {
    onError: (message: string) => void;
}

interface DocumentOperationsState {
    printingDocuments: Set<string>;
    downloadingDocuments: Set<string>;
}

export const useDocumentOperations = ({ onError }: UseDocumentOperationsProps) => {
    const [state, setState] = useState<DocumentOperationsState>({
        printingDocuments: new Set(),
        downloadingDocuments: new Set()
    });

    const handlePrintDocument = useCallback(async (document: UnifiedFinancialDocument) => {
        try {
            // Dodaj dokument do stanu "drukowanie"
            setState(prev => ({
                ...prev,
                printingDocuments: new Set([...prev.printingDocuments, document.id])
            }));

            const result = await documentPrintService.previewDocument(document.id);
            if (!result.success) {
                onError(result.error || 'Nie udało się wyświetlić dokumentu');
            }
        } catch (error) {
            console.error('Error printing document:', error);
            onError('Wystąpił błąd podczas przygotowywania dokumentu do wydruku');
        } finally {
            // Usuń dokument ze stanu "drukowanie"
            setState(prev => ({
                ...prev,
                printingDocuments: new Set([...prev.printingDocuments].filter(id => id !== document.id))
            }));
        }
    }, [onError]);

    const handleDownloadDocument = useCallback(async (document: UnifiedFinancialDocument) => {
        try {
            // Dodaj dokument do stanu "pobieranie"
            setState(prev => ({
                ...prev,
                downloadingDocuments: new Set([...prev.downloadingDocuments, document.id])
            }));

            const result = await documentPrintService.downloadDocument(document.id);
            if (!result.success) {
                onError(result.error || 'Nie udało się pobrać dokumentu');
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            onError('Wystąpił błąd podczas pobierania dokumentu');
        } finally {
            // Usuń dokument ze stanu "pobieranie"
            setState(prev => ({
                ...prev,
                downloadingDocuments: new Set([...prev.downloadingDocuments].filter(id => id !== document.id))
            }));
        }
    }, [onError]);

    const isPrinting = useCallback((documentId: string) => {
        return state.printingDocuments.has(documentId);
    }, [state.printingDocuments]);

    const isDownloading = useCallback((documentId: string) => {
        return state.downloadingDocuments.has(documentId);
    }, [state.downloadingDocuments]);

    return {
        handlePrintDocument,
        handleDownloadDocument,
        isPrinting,
        isDownloading
    };
};