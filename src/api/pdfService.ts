// src/api/pdfService.ts

import {auth} from "./apiClientNew";

export const pdfService = {


    fetchPdfAsBlob: async (protocolId: string): Promise<string> => {
        try {
            const endpoint = `/printer/protocol/${protocolId}/pdf`;

            // Używamy bezpośrednio fetch z konfiguracją z apiClientNew
            const response = await fetch(`/api${endpoint}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'Authorization': `Bearer ${auth.getToken()}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                // <--- Zmiana 1: Przechwytujemy treść błędu jako 'serverErrorContent' --->
                let serverErrorContent = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorText = await response.text();
                    console.error('📄 Treść błędu:', errorText);

                    // Spróbuj sparsować jako JSON jeśli możliwe
                    try {
                        const errorJson = JSON.parse(errorText);
                        // Zwracamy pełną wiadomość błędu lub fallback na JSON
                        serverErrorContent = errorJson.message || errorJson.error || errorText;
                    } catch (jsonError) {
                        // Jeśli nie JSON, użyj tekstu jako pełnej treści błędu
                        if (errorText) {
                            serverErrorContent = errorText;
                        }
                    }
                } catch (textError) {
                    console.error('❌ Nie można odczytać treści błędu:', textError);
                }

                // <--- Zmiana 2: Rzucamy nowy błąd z dokładną wiadomością z serwera --->
                throw new Error(serverErrorContent);
            }

            // Sprawdź Content-Type
            const contentType = response.headers.get('Content-Type');
            if (!contentType?.includes('application/pdf')) {
                console.warn('⚠️ Otrzymano nieoczekiwany Content-Type:', contentType);
            }

            // Pobieramy odpowiedź jako Blob
            const blob = await response.blob();

            if (blob.size === 0) {
                throw new Error('Otrzymano pusty plik PDF');
            }

            // Tworzymy tymczasowy URL dla Bloba
            const blobUrl = URL.createObjectURL(blob);

            return blobUrl;
        } catch (error) {
            console.error('❌ Błąd podczas pobierania PDF:', error);
            throw error;
        }
    },
};