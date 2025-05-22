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
            const endpoint = `/printer/protocol/${protocolId}/pdf`;

            // Dodajemy timestamp jako query param, aby uniknąć cachowania
            const queryParams = { t: new Date().getTime().toString() };

            // Używamy apiClient do wykonania żądania z automatyczną autoryzacją
            const response = await fetch(`${apiClient.getBaseUrl()}${endpoint}?t=${queryParams.t}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    ...(apiClient.getAuthToken() ? { 'Authorization': `Bearer ${apiClient.getAuthToken()}` } : {})
                },
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
    openPdfInNewTab: async (protocolId: string): Promise<void> => {
        try {
            // Najpierw pobierz PDF jako Blob z autoryzacją
            const blobUrl = await pdfService.fetchPdfAsBlob(protocolId);

            // Otwórz PDF w nowej karcie
            window.open(blobUrl, '_blank');
        } catch (error) {
            console.error('Błąd podczas otwierania PDF w nowej karcie:', error);
            throw error;
        }
    },

    /**
     * Drukuje protokół PDF bezpośrednio
     *
     * @param protocolId - ID protokołu
     */
    printProtocolPdf: async (protocolId: string): Promise<void> => {
        try {
            // Najpierw pobierz PDF jako Blob z autoryzacją
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
    },

    /**
     * Alternatywna metoda pobierania PDF używająca apiClient bezpośrednio
     * (dla przypadków gdy potrzebujemy bardziej zaawansowanej obsługi błędów)
     *
     * @param protocolId - ID protokołu
     * @returns Promise z URL do podglądu PDF-a
     */
    fetchPdfWithApiClient: async (protocolId: string): Promise<string> => {
        try {
            const endpoint = `/printer/protocol/${protocolId}/pdf`;

            // Używamy bezpośrednio fetch z konfiguracją apiClient
            const response = await fetch(`${apiClient.getBaseUrl()}${endpoint}?t=${new Date().getTime()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'Content-Type': 'application/json',
                    ...(apiClient.getAuthToken() ? { 'Authorization': `Bearer ${apiClient.getAuthToken()}` } : {})
                },
                credentials: 'include'
            });

            // Używamy tej samej obsługi błędów co w apiClient
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized access - brak autoryzacji');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden - brak uprawnień');
                }
                if (response.status === 404) {
                    throw new Error('Protokół nie został znaleziony');
                }

                // Próba uzyskania informacji o błędzie z odpowiedzi JSON
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error ${response.status}`);
                } catch (e) {
                    throw new Error(`HTTP error ${response.status}`);
                }
            }

            // Pobieramy odpowiedź jako Blob
            const blob = await response.blob();

            // Sprawdzamy czy rzeczywiście otrzymaliśmy PDF
            if (blob.type !== 'application/pdf' && !blob.type.includes('pdf')) {
                console.warn('Otrzymano blob o typie:', blob.type);
            }

            // Tworzymy tymczasowy URL dla Bloba
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Błąd podczas pobierania PDF przez apiClient:', error);
            throw error;
        }
    }
};