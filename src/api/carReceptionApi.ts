// src/api/carReceptionApi.ts - Poprawiona wersja z autoryzacją
import {CarReceptionProtocol, ClientProtocolHistory, VehicleImage} from '../types';
import {apiClient} from './apiClient';

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
 * Funkcja do pobierania obrazu z autoryzacją i konwersji na blob URL
 * @param imageId - ID obrazu
 * @returns Promise z blob URL lub pusty string w przypadku błędu
 */
const fetchAuthorizedImageUrl = async (imageId: string): Promise<string> => {
    try {
        const authToken = apiClient.getAuthToken();
        if (!authToken) {
            console.warn(`No auth token available for image ${imageId}`);
            return '';
        }

        const url = `${apiClient.getBaseUrl()}/v1/protocols/image/${imageId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'image/*',
                'Cache-Control': 'no-cache'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            console.error(`Failed to fetch image ${imageId}: ${response.status}`);
            return '';
        }

        const contentType = response.headers.get('Content-Type') || '';
        if (!contentType.startsWith('image/')) {
            console.error(`Invalid content type for image ${imageId}: ${contentType}`);
            return '';
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error(`Error fetching authorized image ${imageId}:`, error);
        return '';
    }
};


/**
 * Synchroniczna wersja mapowania (bez autoryzowanych URL-i)
 * @param serverImages - Tablica obrazów z serwera
 * @param protocolId - Opcjonalne ID protokołu
 * @returns Tablica obrazów bez autoryzowanych URL-i
 */
const mapServerImagesToDisplayImagesSync = (serverImages: any[], protocolId?: string): VehicleImage[] => {
    if (!serverImages || !Array.isArray(serverImages)) return [];

    return serverImages.map(serverImage => {
        // Używamy funkcji z apiClient do konwersji
        const camelCaseImage = apiClient.parseResponse<VehicleImage>(serverImage);

        // Dodajemy ID protokołu do obiektu obrazu (potrzebne do budowania URL)
        if (protocolId) {
            camelCaseImage.protocolId = protocolId;
        }

        console.log("dupa 3")
        // Dodajemy endpoint URL (bez autoryzacji) - będzie używany do identyfikacji
        if (camelCaseImage.id) {
            camelCaseImage.url = `${apiClient.getBaseUrl()}/v1/protocols/image/${serverImage.id}`;
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

            // Przetwarzamy obrazy z odpowiedzi serwera jeśli istnieją (synchronicznie)
            if (response.vehicleImages) {
                result.vehicleImages = mapServerImagesToDisplayImagesSync(response.vehicleImages);
            }

            return result;
        } catch (error) {
            console.error('Error creating protocol:', error);
            throw error;
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

            // Przetwarzamy obrazy z odpowiedzi serwera jeśli istnieją (synchronicznie)
            if (response.vehicleImages) {
                result.vehicleImages = mapServerImagesToDisplayImagesSync(response.vehicleImages);
            }

            return result;
        } catch (error) {
            console.error('Error updating protocol:', error);
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
     * Usuwa zdjęcie z protokołu
     * @param protocolId - ID protokołu
     * @param imageId - ID zdjęcia do usunięcia
     * @returns true jeśli usunięto pomyślnie, false w przypadku błędu
     */
    deleteVehicleImage: async (protocolId: string, imageId: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/v1/protocols/${protocolId}/image/${imageId}`);
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
            return mapServerImagesToDisplayImagesSync(response, protocolId);
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
            return mapServerImagesToDisplayImagesSync(response, protocolId);
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
                id: response.mediaid, // Używamy mediaid z odpowiedzi
                protocolId: protocolId,
                name: imageData.name,
                tags: imageData.tags,
                createdAt: new Date().toISOString(),
                // Usuwamy file z obiektu po upload
                file: undefined
            };

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

            // Dodaj dodatkowe pola
            updatedImage.protocolId = protocolId;
            updatedImage.url = `${apiClient.getBaseUrl()}/v1/protocols/image/${imageId}`;

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
            // Używamy nowej funkcji z autoryzacją
            return await fetchAuthorizedImageUrl(imageId);
        } catch (error) {
            console.error(`Error fetching image ${imageId}:`, error);
            return ''; // Zwracamy pusty string w przypadku błędu
        }
    },

    /**
     * Utility function - pobiera autoryzowany URL dla obrazu
     * @param imageId - ID obrazu
     * @returns Promise z blob URL
     */
    fetchAuthorizedImageUrl
};

// Eksportuj funkcje mapowania dla użycia w innych miejscach
export { mapServerImagesToDisplayImagesSync, fetchAuthorizedImageUrl };