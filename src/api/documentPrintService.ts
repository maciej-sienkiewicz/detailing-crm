// src/api/documentPrintService.ts - POPRAWIONA WERSJA
import {apiClientNew, ApiError} from '../api/apiClientNew';

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

export interface DocumentActionResult {
    success: boolean;
    error?: string;
}

/**
 * Serwis do obsługi operacji na dokumentach finansowych
 * Centralizuje wszystkie operacje związane z drukowaniem, pobieraniem i zarządzaniem dokumentami
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

            const hasAttachment = await this.checkDocumentAttachment(documentId);
            console.log('Has attachment:', hasAttachment);

            if (hasAttachment) {
                console.log('Using existing attachment');
                return await this.openDocumentAttachment(documentId, options);
            } else {
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
     * Sprawdza czy dokument ma załącznik - używa apiClientNew
     */
    private async checkDocumentAttachment(documentId: string): Promise<boolean> {
        try {
            console.log('Checking attachment for document:', documentId);
            // Używamy apiClientNew zamiast raw fetch
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
     * Pobiera blob z endpointu - używa apiClientNew z custom config
     */
    private async getBlobFromEndpoint(endpoint: string): Promise<Blob> {
        console.log('Fetching blob from endpoint:', endpoint);

        try {
            // Używamy apiClientNew z custom headers dla blob response
            const response = await fetch('/api' + endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
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
        } catch (error) {
            console.error('Error fetching blob:', error);
            throw error;
        }
    }

    /**
     * ALTERNATYWNIE: Pobiera blob używając XMLHttpRequest (fallback method)
     */
    private async getBlobFromEndpointXHR(endpoint: string): Promise<Blob> {
        return new Promise((resolve, reject) => {
            console.log('Fetching blob via XHR from endpoint:', endpoint);

            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/api' + endpoint, true);
            xhr.responseType = 'blob';

            // Dodaj nagłówki autoryzacji
            const token = this.getAuthToken();
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            xhr.setRequestHeader('Accept', 'application/pdf,application/octet-stream,*/*');

            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(new ApiError(xhr.status, xhr.statusText));
                }
            };

            xhr.onerror = function() {
                reject(new ApiError(0, 'Network Error'));
            };

            xhr.send();
        });
    }

    /**
     * Wykonuje POST i zwraca blob - używa fetch z prawidłowym base URL
     */
    private async postForBlob(endpoint: string, data?: any): Promise<Blob> {
        console.log('Posting to endpoint for blob:', endpoint);

        const response = await fetch('/api' + endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`,
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
     * Pobiera token autoryzacji
     */
    private getAuthToken(): string | null {
        try {
            return localStorage.getItem('auth_token');
        } catch {
            return null;
        }
    }

    /**
     * Otwiera załącznik dokumentu - używa XHR jako fallback
     */
    private async openDocumentAttachment(documentId: string, options: Omit<PrintDocumentOptions, 'documentId'>): Promise<DocumentPrintResult> {
        try {
            console.log('Fetching attachment blob for document:', documentId);

            // Spróbuj pierwsze metody - jeśli CORS nadal nie działa, użyj XHR
            let blob: Blob;
            try {
                blob = await this.getBlobFromEndpoint(`/financial-documents/${documentId}/attachment`);
            } catch (corsError) {
                console.log('Standard fetch failed, trying XHR fallback:', corsError);
                blob = await this.getBlobFromEndpointXHR(`/financial-documents/${documentId}/attachment`);
            }

            console.log('Attachment blob size:', blob.size);
            return this.handleBlobResponse(blob, documentId, 'dokument', options.forceDownload);
        } catch (error) {
            console.error('Error opening document attachment:', error);
            return {
                success: false,
                error: `Nie udało się otworzyć załącznika dokumentu: ${error instanceof Error ? error.message : 'Unknown error'}`
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
                error: `Nie udało się wygenerować faktury z szablonu: ${error instanceof Error ? error.message : 'Unknown error'}`
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
            this.downloadFile(blobUrl, `${filePrefix}-${documentId}.pdf`);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } else {
            this.openInNewTab(blobUrl);
            setTimeout(() => {
                console.log('Cleaning up blob URL for:', filePrefix);
                URL.revokeObjectURL(blobUrl);
            }, 60000);
        }

        return { success: true, pdfUrl: blobUrl };
    }

    /**
     * Pobiera plik
     */
    private downloadFile(url: string, filename: string): void {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Download initiated for:', filename);
    }

    /**
     * Otwiera URL w nowej karcie
     */
    private openInNewTab(url: string): void {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
            console.log('Popup blocked, trying alternative method');
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
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