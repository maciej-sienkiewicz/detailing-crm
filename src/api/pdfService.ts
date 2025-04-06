// src/api/pdfService.ts
import { apiClient } from './apiClient';

export const pdfService = {
    /**
     * Generuje URL do PDF-a dla określonego protokołu
     *
     * @param protocolId - ID protokołu
     * @returns URL do PDF-a
     */
    getProtocolPdfUrl: (protocolId: string): string => {
        return `${apiClient.getBaseUrl()}/printer/protocol/${protocolId}/pdf`;
    },

    /**
     * Pobiera PDF jako Blob i tworzy tymczasowy URL
     *
     * @param protocolId - ID protokołu
     * @returns Promise z URL do podglądu PDF-a
     */
    fetchPdfAsBlob: async (protocolId: string): Promise<string> => {
        try {
            const pdfUrl = pdfService.getProtocolPdfUrl(protocolId);

            // Dodajemy timestamp jako query param, aby uniknąć cachowania
            const urlWithTimestamp = `${pdfUrl}?t=${new Date().getTime()}`;

            const response = await fetch(urlWithTimestamp, {
                method: 'GET',
                headers: {},
                // Ustawiamy credentials, aby ciasteczka sesyjne były przesyłane
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Błąd pobierania PDF: ${response.status} ${response.statusText}`);
            }

            // Pobieramy odpowiedź jako Blob
            const blob = await response.blob();

            // Tworzymy tymczasowy URL dla Bloba
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Błąd podczas pobierania PDF:', error);
            throw error;
        }
    },

    /**
     * Otwiera PDF w nowej karcie
     *
     * @param protocolId - ID protokołu
     */
    openPdfInNewTab: (protocolId: string): void => {
        const pdfUrl = pdfService.getProtocolPdfUrl(protocolId);
        const urlWithTimestamp = `${pdfUrl}?t=${new Date().getTime()}`;
        window.open(urlWithTimestamp, '_blank');
    },

    /**
     * Drukuje protokół PDF bezpośrednio
     *
     * @param protocolId - ID protokołu
     */
    printProtocolPdf: async (protocolId: string): Promise<void> => {
        try {
            // Najpierw pobierz PDF jako Blob
            const blobUrl = await pdfService.fetchPdfAsBlob(protocolId);

            // Otwórz okno z PDF i wydrukuj
            const printWindow = window.open(blobUrl, '_blank');
            if (printWindow) {
                printWindow.addEventListener('load', () => {
                    printWindow.print();
                    // Zwolnij URL Bloba po wydrukowaniu
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                });
            } else {
                // Jeśli nie udało się otworzyć okna, zwolnij URL
                URL.revokeObjectURL(blobUrl);
                throw new Error('Nie udało się otworzyć okna wydruku');
            }
        } catch (error) {
            console.error('Błąd podczas drukowania:', error);
            throw error;
        }
    }
};