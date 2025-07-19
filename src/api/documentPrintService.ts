// src/services/documentPrintService.ts
import { apiClientNew, ApiError } from '../api/apiClientNew';

export interface PrintDocumentOptions {
    documentId: string;
    templateId?: string;
    openInNewTab?: boolean;
    forceDownload?: boolean;
}

export interface DocumentPrintResult {
    success: boolean;
    pdfUrl?: string;
    error?: string;
}

/**
 * Serwis do obsługi drukowania dokumentów finansowych
 * Implementuje logikę wyboru między załącznikami a generowaniem z szablonu
 */
class DocumentPrintService {

    /**
     * Główna metoda do drukowania/wyświetlania dokumentu
     */
    async printDocument(documentId: string, options: Omit<PrintDocumentOptions, 'documentId'> = {}): Promise<DocumentPrintResult> {
        try {
            console.log('=== Print Document Service ===');
            console.log('Document ID:', documentId);
            console.log('Options:', options);

            // Sprawdź czy dokument ma załącznik
            const hasAttachment = await this.checkDocumentAttachment(documentId);
            console.log('Has attachment:', hasAttachment);

            if (hasAttachment) {
                // Użyj załącznika z /api/financial-documents/{id}/attachment
                console.log('Using existing attachment');
                return await this.openDocumentAttachment(documentId, options);
            } else {
                // Wygeneruj z szablonu z /api/invoice-templates/documents/{id}/generate
                console.log('Generating from template');
                return await this.generateAndOpenInvoice(documentId, options);
            }
        } catch (error) {
            console.error('Error printing document:', error);
            return {
                success: false,
                error: 'Wystąpił błąd podczas przygotowywania dokumentu do wydruku'
            };
        }
    }

    /**
     * Sprawdza czy dokument ma załącznik używając apiClientNew
     */
    private async checkDocumentAttachment(documentId: string): Promise<boolean> {
        try {
            console.log('Checking attachment for document:', documentId);

            // Używamy get z pustymi parametrami - jeśli zwróci dane to znaczy że załącznik istnieje
            // Jeśli rzuci błąd 404, to znaczy że nie ma załącznika
            await apiClientNew.get(`/financial-documents/${documentId}/attachment`);

            console.log('Document has attachment: true');
            return true;
        } catch (error) {
            if (ApiError.isApiError(error) && error.status === 404) {
                console.log('Document has attachment: false (404)');
                return false;
            }
            console.error('Error checking attachment:', error);
            return false;
        }
    }

    /**
     * Pobiera blob z endpointu używając niższego poziomu API
     */
    private async getBlobFromEndpoint(endpoint: string): Promise<Blob> {
        // Używamy tego samego base URL co apiClientNew: http://localhost:8080/api
        const url = `http://localhost:8080/api${endpoint}`;

        console.log('Fetching blob from URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/pdf,application/octet-stream,*/*',
            },
        });

        if (!response.ok) {
            throw new ApiError(
                response.status,
                response.statusText,
                null,
                `Failed to fetch blob from ${endpoint}`
            );
        }

        return await response.blob();
    }

    /**
     * Wykonuje POST i zwraca blob
     */
    private async postForBlob(endpoint: string, data?: any): Promise<Blob> {
        // Używamy tego samego base URL co apiClientNew: http://localhost:8080/api
        const url = `http://localhost:8080/api${endpoint}`;

        console.log('Posting to URL for blob:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/pdf,application/octet-stream,*/*',
            },
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(
                response.status,
                response.statusText,
                { message: errorText },
                `Failed to generate PDF: ${response.status} - ${errorText}`
            );
        }

        return await response.blob();
    }

    /**
     * Otwiera załącznik dokumentu
     */
    private async openDocumentAttachment(documentId: string, options: Omit<PrintDocumentOptions, 'documentId'>): Promise<DocumentPrintResult> {
        try {
            console.log('Fetching attachment blob for document:', documentId);

            const blob = await this.getBlobFromEndpoint(`/financial-documents/${documentId}/attachment`);
            console.log('Attachment blob size:', blob.size);

            return this.handleBlobResponse(blob, documentId, 'dokument', options.forceDownload);
        } catch (error) {
            console.error('Error opening document attachment:', error);
            return {
                success: false,
                error: `Nie udało się otworzyć załącznika dokumentu:`
            };
        }
    }

    /**
     * Generuje fakturę z szablonu i otwiera ją
     */
    private async generateAndOpenInvoice(documentId: string, options: Omit<PrintDocumentOptions, 'documentId'>): Promise<DocumentPrintResult> {
        try {
            let endpoint = `/invoice-templates/documents/${documentId}/generate`;
            if (options.templateId) {
                endpoint += `?templateId=${encodeURIComponent(options.templateId)}`;
            }

            console.log('Generating invoice from endpoint:', endpoint);

            const blob = await this.postForBlob(endpoint);
            console.log('Generated invoice blob size:', blob.size);

            return this.handleBlobResponse(blob, documentId, 'faktura', options.forceDownload);
        } catch (error) {
            console.error('Error generating invoice:', error);
            return {
                success: false,
                error: `Nie udało się wygenerować faktury z szablonu:`
            };
        }
    }

    /**
     * Obsługuje blob response - otwiera lub pobiera plik
     */
    private handleBlobResponse(
        blob: Blob,
        documentId: string,
        filePrefix: string,
        forceDownload?: boolean
    ): DocumentPrintResult {
        const blobUrl = URL.createObjectURL(blob);

        if (forceDownload) {
            // Force download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${filePrefix}-${documentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('Download initiated for:', filePrefix);

            // Cleanup blob URL quickly for downloads
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } else {
            // Open in new tab for preview
            console.log('Opening', filePrefix, 'in new tab...');

            const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

            if (!newWindow) {
                // Fallback if popup is blocked
                console.log('Popup blocked, trying alternative method');
                const link = document.createElement('a');
                link.href = blobUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Cleanup blob URL after longer time for preview
            setTimeout(() => {
                console.log('Cleaning up blob URL for:', filePrefix);
                URL.revokeObjectURL(blobUrl);
            }, 60000);
        }

        return { success: true, pdfUrl: blobUrl };
    }

    /**
     * Metoda pomocnicza do pobrania dokumentu
     */
    async downloadDocument(documentId: string, templateId?: string): Promise<DocumentPrintResult> {
        return await this.printDocument(documentId, {
            forceDownload: true,
            templateId,
            openInNewTab: false
        });
    }

    /**
     * Metoda pomocnicza do podglądu dokumentu w nowej karcie
     */
    async previewDocument(documentId: string, templateId?: string): Promise<DocumentPrintResult> {
        return await this.printDocument(documentId, {
            openInNewTab: true,
            forceDownload: false,
            templateId
        });
    }
}

// Eksportuj singleton
export const documentPrintService = new DocumentPrintService();