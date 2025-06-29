import { CarReceptionProtocol, ClientProtocolHistory, ProtocolListItem, VehicleImage } from '../types';
import { apiClient } from './apiClient';


export interface ProtocolDocument {
    storageId: string;
    protocolId: string;
    originalName: string;
    fileSize: number;
    contentType: string;
    documentType: string;
    documentTypeDisplay: string;
    description?: string;
    createdAt: string;
    uploadedBy: string;
    downloadUrl: string;
}

export interface ImageUploadResponse {
    mediaId: string;
    protocolId: string;
    message: string;
}


/**
 * Funkcja do mapowania obrazów z serwera na format aplikacji
 * @param serverImages - Tablica obrazów z serwera
 * @param protocolId - Opcjonalne ID protokołu dla uzupełnienia URL
 * @returns Tablica obrazów przygotowanych do wyświetlenia
 */
const mapServerImagesToDisplayImages = (serverImages: any[], protocolId?: string): VehicleImage[] => {
    if (!serverImages || !Array.isArray(serverImages)) return [];

    return serverImages.map(serverImage => {
        // Używamy funkcji z apiClient do konwersji
        const camelCaseImage = apiClient.parseResponse<VehicleImage>(serverImage);

        // Dodajemy ID protokołu do obiektu obrazu (potrzebne do budowania URL)
        if (protocolId) {
            camelCaseImage.protocolId = protocolId;
        }

        // Tworzymy URL do obrazu na podstawie endpointu API
        if (camelCaseImage.id) {
            camelCaseImage.url = `${apiClient.getBaseUrl()}/v1/visits/image/${serverImage.id}`;
        }

        return camelCaseImage;
    });
};

/**
 * API do zarządzania protokołami przyjęcia samochodu
 * Obsługuje protokoły, zdjęcia i inne załączniki
 */
export const carReceptionApi = {
    /**
     * Tworzy nowy protokół przyjęcia
     * @param protocol - Dane protokołu bez ID i innych pól generowanych przez serwer
     * @returns Utworzony protokół z ID i datami
     */
    createCarReceptionProtocol: async (
        protocol: Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt' | 'statusUpdatedAt'>
    ): Promise<CarReceptionProtocol> => {
        try {
            // Sprawdzamy czy mamy zdjęcia z plikami do wysłania
            const hasImages = protocol.vehicleImages && protocol.vehicleImages.length > 0;
            const hasFileImages = hasImages && protocol.vehicleImages!.some(img => img.file);

            // Przygotowujemy dane protokołu, upewniając się że daty mają odpowiedni format
            const protocolData = {
                ...protocol,
                startDate: protocol.startDate,  // Format ISO: "YYYY-MM-DDTHH:MM:SS"
                endDate: protocol.endDate       // Format ISO: "YYYY-MM-DDTHH:MM:SS" (zawsze 23:59:59)
            };

            let response;

            // Jeśli mamy zdjęcia z plikami, używamy FormData
            if (hasFileImages) {
                // Usuwamy pliki z obiektu protokołu i przygotowujemy je osobno
                const protocolWithoutFiles = { ...protocolData };
                const files: Record<string, File> = {};

                if (protocolWithoutFiles.vehicleImages) {
                    // Przekształcamy zdjęcia do prostej struktury bez pól File
                    const simplifiedImages = protocolWithoutFiles.vehicleImages.map((img, index) => {
                        const { file, ...imageWithoutFile } = img;

                        // Jeśli mamy plik, dodajemy go do kolekcji plików
                        if (file) {
                            files[`images[${index}]`] = file;
                        }

                        return {
                            ...imageWithoutFile,
                            hasFile: !!file // Informacja dla backendu, że to zdjęcie ma plik
                        };
                    });

                    protocolWithoutFiles.vehicleImages = simplifiedImages;
                }

                // Tworzymy formData z obiektem protokołu i plikami
                const formDataWithFiles = apiClient.createFormDataWithJson(
                    protocolWithoutFiles,
                    'protocol',
                    files
                );

                // Wysyłanie żądania POST z FormData
                response = await apiClient.post<any>('/v1/protocols/with-files', formDataWithFiles);
            } else {
                // Jeśli nie mamy zdjęć z plikami, używamy standardowego JSON
                response = await apiClient.post<any>('/v1/protocols', protocolData);
            }

            // Połącz dane protokołu z odpowiedzią serwera
            const result: CarReceptionProtocol = {
                ...protocolData,
                id: response.id,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt,
                statusUpdatedAt: response.statusUpdatedAt
            } as CarReceptionProtocol;

            // Przetwarzamy obrazy z odpowiedzi serwera jeśli istnieją
            if (response.vehicleImages) {
                result.vehicleImages = mapServerImagesToDisplayImages(response.vehicleImages);
            }

            return result;
        } catch (error) {
            console.error('Error creating protocol:', error);
            throw error;
        }
    },

    /**
     * Pobiera listę protokołów dla klienta
     * @param clientId - ID klienta
     * @returns Lista protokołów dla klienta
     */
    getProtocolsByClientId: async (clientId: string): Promise<ClientProtocolHistory[]> => {
        try {
            return await apiClient.get<ClientProtocolHistory[]>(`/receptions/${clientId}/protocols`);
        } catch (error) {
            console.error('Error fetching protocols list:', error);
            return [];
        }
    },

    /**
     * Aktualizuje istniejący protokół
     * @param protocol - Pełne dane protokołu do aktualizacji
     * @returns Zaktualizowany protokół
     */
    updateCarReceptionProtocol: async (protocol: CarReceptionProtocol): Promise<CarReceptionProtocol> => {
        try {
            // Sprawdzamy czy mamy nowe zdjęcia z plikami do wysłania
            const hasImages = protocol.vehicleImages && protocol.vehicleImages.length > 0;
            const hasFileImages = hasImages && protocol.vehicleImages!.some(img => img.file);

            let response;

            // Jeśli mamy zdjęcia z plikami, używamy FormData
            if (hasFileImages) {
                // Usuwamy pliki z obiektu protokołu i przygotowujemy je osobno
                const protocolWithoutFiles = { ...protocol };
                const files: Record<string, File> = {};

                if (protocolWithoutFiles.vehicleImages) {
                    // Przekształcamy zdjęcia do prostej struktury bez pól File
                    const simplifiedImages = protocolWithoutFiles.vehicleImages.map((img, index) => {
                        const { file, ...imageWithoutFile } = img;

                        // Jeśli mamy plik, dodajemy go do kolekcji plików
                        if (file) {
                            files[`images[${index}]`] = file;
                        }

                        return {
                            ...imageWithoutFile,
                            hasFile: !!file // Informacja dla backendu, że to zdjęcie ma plik
                        };
                    });

                    protocolWithoutFiles.vehicleImages = simplifiedImages;
                }

                // Tworzymy formData z obiektem protokołu i plikami
                const formDataWithFiles = apiClient.createFormDataWithJson(
                    protocolWithoutFiles,
                    'protocol',
                    files
                );

                // Wysyłanie żądania PUT z FormData
                response = await apiClient.put<any>(`/receptions/${protocol.id}/with-files`, formDataWithFiles);
            } else {
                // Jeśli nie mamy zdjęć z plikami, używamy standardowego JSON
                response = await apiClient.put<any>(`/receptions/${protocol.id}`, protocol);
            }

            // Połącz dane protokołu z odpowiedzią serwera
            const result: CarReceptionProtocol = {
                ...protocol,
                updatedAt: response.updatedAt,
                statusUpdatedAt: response.statusUpdatedAt
            } as CarReceptionProtocol;

            // Przetwarzamy obrazy z odpowiedzi serwera jeśli istnieją
            if (response.vehicleImages) {
                result.vehicleImages = mapServerImagesToDisplayImages(response.vehicleImages);
            }

            return result;
        } catch (error) {
            console.error('Error updating protocol:', error);
            throw error;
        }
    },

    /**
     * Pobiera listę dokumentów protokołu
     * @param protocolId - ID protokołu
     * @returns Lista dokumentów protokołu
     */
    getProtocolDocuments: async (protocolId: string): Promise<ProtocolDocument[]> => {
        try {
            return await apiClient.get<ProtocolDocument[]>(`/v1/protocols/${protocolId}/documents`);
        } catch (error) {
            console.error('Error fetching protocol documents:', error);
            return [];
        }
    },

    /**
     * Przesyła dokument do protokołu
     * @param protocolId - ID protokołu
     * @param file - Plik do przesłania
     * @param documentType - Typ dokumentu
     * @param description - Opcjonalny opis dokumentu
     * @returns Odpowiedź z serwera
     */
    uploadProtocolDocument: async (
        protocolId: string,
        file: File,
        documentType: string,
        description?: string
    ): Promise<any> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            if (description) {
                formData.append('description', description);
            }

            return await apiClient.post(`/v1/protocols/${protocolId}/document`, formData);
        } catch (error) {
            console.error('Error uploading protocol document:', error);
            throw error;
        }
    },

    /**
     * Usuwa dokument protokołu
     * @param protocolId - ID protokołu
     * @param documentId - ID dokumentu do usunięcia
     * @returns true jeśli usunięto pomyślnie, false w przypadku błędu
     */
    deleteProtocolDocument: async (protocolId: string, documentId: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/v1/protocols/${protocolId}/document/${documentId}`);
            return true;
        } catch (error) {
            console.error(`Error deleting document ${documentId} from protocol ${protocolId}:`, error);
            return false;
        }
    },

    /**
     * Generuje URL do pobrania dokumentu
     * @param documentId - ID dokumentu
     * @returns URL do pobrania dokumentu
     */
    getProtocolDocumentDownloadUrl: (documentId: string): string => {
        return `${apiClient.getBaseUrl()}/v1/protocols/document/${documentId}`;
    },

    /**
     * Pobiera wszystkie protokoły
     * @returns Lista wszystkich protokołów
     */
    fetchCarReceptionProtocols: async (): Promise<CarReceptionProtocol[]> => {
        try {
            const response = await apiClient.get<any[]>('/receptions');

            // Konwertuj odpowiedź i przetwarzamy zdjęcia dla każdego protokołu
            return response.map(item => {
                const protocol = apiClient.parseResponse<CarReceptionProtocol>(item);

                // Jeśli protokół zawiera zdjęcia, przetwarzamy je
                if (protocol.vehicleImages) {
                    protocol.vehicleImages = mapServerImagesToDisplayImages(
                        protocol.vehicleImages,
                        protocol.id
                    );
                }

                return protocol;
            });
        } catch (error) {
            console.error('Error fetching protocols:', error);
            // W przypadku błędu zwracamy puste dane
            return [];
        }
    },

    /**
     * Pobiera pojedynczy protokół po ID
     * @param id - ID protokołu
     * @returns Protokół lub null jeśli nie znaleziono
     */
    fetchCarReceptionProtocol: async (id: string): Promise<CarReceptionProtocol | null> => {
        try {
            const response = await apiClient.get<any>(`/receptions/${id}`);
            const protocol = apiClient.parseResponse<CarReceptionProtocol>(response);

            // Jeśli protokół zawiera zdjęcia, przetwarzamy je
            if (protocol.vehicleImages) {
                protocol.vehicleImages = mapServerImagesToDisplayImages(
                    protocol.vehicleImages,
                    protocol.id
                );
            }

            return protocol;
        } catch (error) {
            console.error(`Error fetching protocol ${id}:`, error);
            return null;
        }
    },

    /**
     * Usuwa protokół
     * @param id - ID protokołu do usunięcia
     * @returns true jeśli usunięto pomyślnie, false w przypadku błędu
     */
    deleteCarReceptionProtocol: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/receptions/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting protocol ${id}:`, error);
            return false;
        }
    },

    /**
     * Usuwa zdjęcie z protokołu
     * @param protocolId - ID protokołu
     * @param imageId - ID zdjęcia do usunięcia
     * @returns true jeśli usunięto pomyślnie, false w przypadku błędu
     */
    deleteVehicleImage: async (protocolId: string, imageId: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/receptions/${protocolId}/image/${imageId}`);
            return true;
        } catch (error) {
            console.error(`Error deleting image ${imageId} from protocol ${protocolId}:`, error);
            return false;
        }
    },

    /**
     * Pobiera wszystkie zdjęcia dla danego protokołu
     * @param protocolId - ID protokołu
     * @returns Lista zdjęć protokołu
     */
    fetchVehicleImages: async (protocolId: string): Promise<VehicleImage[]> => {
        try {
            const response = await apiClient.get<any[]>(`/v1/protocols/${protocolId}/images`);
            return mapServerImagesToDisplayImages(response, protocolId);
        } catch (error) {
            console.error(`Error fetching images for protocol ${protocolId}:`, error);
            return [];
        }
    },

    /**
     * Dodaje wiele zdjęć do protokołu
     * @param protocolId - ID protokołu
     * @param files - Tablica plików do dodania
     * @returns Lista dodanych zdjęć
     */
    addVehicleImages: async (protocolId: string, files: File[]): Promise<VehicleImage[]> => {
        try {
            // Tworzymy FormData dla plików
            const formData = new FormData();

            // Dodaj każdy plik do FormData
            files.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            // Wysyłanie żądania POST z FormData
            const response = await apiClient.post<any[]>(`/v1/protocols/${protocolId}/images`, formData);

            // Konwertuj odpowiedź na format używany w aplikacji
            return mapServerImagesToDisplayImages(response, protocolId);
        } catch (error) {
            console.error(`Error adding images to protocol ${protocolId}:`, error);
            throw error;
        }
    },

    /**
     * Wysyła pojedyncze zdjęcie do protokołu
     * @param protocolId - ID protokołu
     * @param image - Dane zdjęcia do wysłania
     * @returns Dane dodanego zdjęcia z serwera
     */
    uploadVehicleImage: async (
        protocolId: string,
        image: VehicleImage
    ): Promise<VehicleImage> => {
        try {
            // Sprawdzamy czy mamy plik do wysłania
            if (!image.file) {
                throw new Error('No file provided for upload');
            }

            // Wyłuskujemy nazwę pliku bez rozszerzenia jako domyślną nazwę
            const defaultName = image.file.name.replace(/\.[^/.]+$/, "");

            // Przygotowujemy podstawowe dane obrazu
            const imageData = {
                id: image.id && image.id.startsWith('temp_') ? undefined : image.id,
                name: image.name || defaultName,
                size: image.size,
                type: image.type,
                tags: Array.isArray(image.tags) ? image.tags : [],
                hasFile: true
            };

            // Tworzymy FormData i dodajemy plik oraz metadane
            const formData = new FormData();
            formData.append('images[0]', image.file, image.file.name);
            formData.append('image', JSON.stringify(apiClient.convertCamelToSnake(imageData)));

            // Wysyłamy żądanie POST z FormData
            const response = await apiClient.post<{mediaid: string, protocolid: string, message: string}>(
                `/v1/protocols/${protocolId}/media`,
                formData
            );

            // Tworzymy zaktualizowany obiekt obrazu z odpowiedzią z serwera
            const updatedImage: VehicleImage = {
                ...image,
                id: response.protocolid,
                protocolId: protocolId,
                name: imageData.name,
                tags: imageData.tags,
                createdAt: new Date().toISOString()
            };

            console.log(updatedImage);

            return updatedImage;
        } catch (error) {
            console.error('Error uploading vehicle image:', error);
            throw error;
        }
    },

    /**
     * Aktualizuje metadane zdjęcia
     * @param protocolId - ID protokołu
     * @param imageId - ID zdjęcia
     * @param metadata - Nowe metadane zdjęcia
     * @returns Zaktualizowane dane zdjęcia lub null w przypadku błędu
     */
    updateVehicleImage: async (protocolId: string, imageId: string, metadata: {
        description?: string,
        location?: string,
        name?: string,
        tags?: string[]
    }): Promise<VehicleImage | null> => {
        try {
            // Wysyłanie żądania PATCH
            const response = await apiClient.patch<any>(`/v1/protocols/${protocolId}/image/${imageId}`, metadata);

            // Konwertuj odpowiedź na format używany w aplikacji
            const updatedImage = apiClient.parseResponse<VehicleImage>(response);

            // Dodaj URL do obrazu
            updatedImage.url = `${apiClient.getBaseUrl()}/v1/protocols/image/${imageId}`;
            updatedImage.protocolId = protocolId;

            return updatedImage;
        } catch (error) {
            console.error(`Error updating image ${imageId} metadata:`, error);
            return null;
        }
    },

    /**
     * Pobiera zawartość obrazu jako URL data lub Blob URL
     * @param imageId - ID obrazu
     * @returns Promise z URL do obrazu
     */
    fetchVehicleImageAsUrl: async (imageId: string): Promise<string> => {
        try {
            // Konstruujemy URL z wykorzystaniem naszej funkcji getVehicleImageUrl
            const url = `${apiClient.getBaseUrl()}/v1/protocols/image/${imageId}`;

            console.log('Fetching image with URL:', url); // Dodajemy logging dla debugowania
            console.log('Auth token present:', !!apiClient.getAuthToken()); // Sprawdzamy czy token jest dostępny

            // Pobieramy obraz z użyciem funkcji fetch z ręcznie dodanymi nagłówkami autoryzacyjnymi
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'image/*',
                    ...(apiClient.getAuthToken() ? { 'Authorization': `Bearer ${apiClient.getAuthToken()}` } : {})
                },
                // Dodajemy credentials, aby zapewnić, że ciasteczka są przesyłane
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Błąd podczas pobierania obrazu: ${response.status}`);
            }

            // Konwertujemy odpowiedź na blob
            const blob = await response.blob();

            // Tworzymy URL dla blobu
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error(`Error fetching image ${imageId}:`, error);
            return ''; // Zwracamy pusty string w przypadku błędu
        }
    },

};