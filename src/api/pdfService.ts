// src/api/pdfService.ts

import {auth} from "./apiClientNew";

export const pdfService = {


    fetchPdfAsBlob: async (protocolId: string): Promise<string> => {
        try {
            const endpoint = `/printer/protocol/${protocolId}/pdf`;

            console.log('🔍 Pobieranie PDF dla protokołu:', protocolId);
            console.log('📡 Endpoint:', `/api${endpoint}`);
            console.log('🔑 Token:', auth.getToken() ? 'Obecny' : 'Brak');

            // Używamy bezpośrednio fetch z konfiguracją z apiClientNew
            const response = await fetch(`/api${endpoint}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'Authorization': `Bearer ${auth.getToken()}`,
                },
                credentials: 'include'
            });

            console.log('📊 Status odpowiedzi:', response.status);
            console.log('📋 Content-Type:', response.headers.get('Content-Type'));

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorText = await response.text();
                    console.error('📄 Treść błędu:', errorText);

                    // Spróbuj sparsować jako JSON jeśli możliwe
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message || errorJson.error || errorMessage;
                    } catch (jsonError) {
                        // Jeśli nie JSON, użyj tekstu
                        if (errorText) {
                            errorMessage = errorText;
                        }
                    }
                } catch (textError) {
                    console.error('❌ Nie można odczytać treści błędu:', textError);
                }

                throw new Error(`Błąd pobierania PDF: ${errorMessage}`);
            }

            // Sprawdź Content-Type
            const contentType = response.headers.get('Content-Type');
            if (!contentType?.includes('application/pdf')) {
                console.warn('⚠️ Otrzymano nieoczekiwany Content-Type:', contentType);
            }

            // Pobieramy odpowiedź jako Blob
            const blob = await response.blob();
            console.log('📦 Rozmiar blob:', blob.size, 'bytes');

            if (blob.size === 0) {
                throw new Error('Otrzymano pusty plik PDF');
            }

            // Tworzymy tymczasowy URL dla Bloba
            const blobUrl = URL.createObjectURL(blob);
            console.log('✅ PDF URL utworzony:', blobUrl);

            return blobUrl;
        } catch (error) {
            console.error('❌ Błąd podczas pobierania PDF:', error);
            throw error;
        }
    },
};