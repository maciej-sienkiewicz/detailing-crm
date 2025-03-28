import { CarReceptionProtocol, ClientProtocolHistory, ProtocolListItem, VehicleImage } from '../types';
import { apiClient } from './apiClient';

// Interfejs dla odpowiedzi z serwera
interface CarReceptionResponse {
    id: string;
    created_at: string;
    updated_at: string;
    status_updated_at: string;
    status: string;
    vehicle_images?: any[];
}

// Konwersja camelCase na snake_case dla API
const convertToSnakeCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(convertToSnakeCase);
    }

    return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        acc[snakeKey] = convertToSnakeCase(obj[key]);
        return acc;
    }, {} as any);
};

// Konwersja snake_case na camelCase dla aplikacji frontendowej
const convertToCamelCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(convertToCamelCase);
    }

    return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = convertToCamelCase(obj[key]);
        return acc;
    }, {} as any);
};

// Funkcja do mapowania obrazów z serwera na format aplikacji
const mapServerImagesToDisplayImages = (serverImages: any[]): VehicleImage[] => {
    if (!serverImages || !Array.isArray(serverImages)) return [];

    return serverImages.map(serverImage => {
        const camelCaseImage = convertToCamelCase(serverImage);

        // Tworzymy URL do obrazu na podstawie identyfikatora przechowywania
        if (camelCaseImage.storageId) {
            camelCaseImage.url = `${apiClient.getBaseUrl()}/images/${camelCaseImage.storageId}`;
        }

        return camelCaseImage as VehicleImage;
    });
};

export const carReceptionApi = {
    // Tworzenie nowego protokołu przyjęcia
    createCarReceptionProtocol: async (protocol: Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt' | 'statusUpdatedAt'>): Promise<CarReceptionProtocol> => {
        try {
            console.log('Sending protocol data to server:', protocol);

            // Sprawdzamy czy mamy zdjęcia z plikami do wysłania
            const hasImages = protocol.vehicleImages && protocol.vehicleImages.length > 0;
            const hasFileImages = hasImages && protocol.vehicleImages!.some(img => img.file);

            // Jeśli mamy zdjęcia z plikami, używamy FormData
            if (hasFileImages) {
                const formData = new FormData();

                // Usuwamy pliki z obiektu protokołu i dodajemy je do FormData
                const protocolWithoutFiles = { ...protocol };

                if (protocolWithoutFiles.vehicleImages) {
                    // Przekształcamy zdjęcia do prostej struktury bez pól File
                    const simplifiedImages = protocolWithoutFiles.vehicleImages.map((img, index) => {
                        const { file, ...imageWithoutFile } = img;

                        // Jeśli mamy plik, dodajemy go do formData
                        if (file) {
                            formData.append(`images[${index}]`, file, file.name);
                        }

                        return {
                            ...imageWithoutFile,
                            hasFile: !!file // Informacja dla backendu, że to zdjęcie ma plik
                        };
                    });

                    protocolWithoutFiles.vehicleImages = simplifiedImages;
                }

                // Konwersja protokołu na snake_case i dodanie do formData jako JSON
                const jsonData = JSON.stringify(convertToSnakeCase(protocolWithoutFiles));
                formData.append('protocol', jsonData);

                // Wysyłanie żądania POST z FormData
                const response = await apiClient.post<CarReceptionResponse>('/receptions/with-files', formData);

                console.log('Server response:', response);

                // Konwertuj odpowiedź na format używany w aplikacji
                const convertedResponse = convertToCamelCase(response);

                // Połącz dane protokołu z odpowiedzią serwera
                const result: CarReceptionProtocol = {
                    ...protocol,
                    id: convertedResponse.id,
                    createdAt: convertedResponse.createdAt,
                    updatedAt: convertedResponse.updatedAt,
                    statusUpdatedAt: convertedResponse.statusUpdatedAt
                } as CarReceptionProtocol;

                // Przetwarzamy obrazy z odpowiedzi serwera jeśli istnieją
                if (convertedResponse.vehicleImages) {
                    result.vehicleImages = mapServerImagesToDisplayImages(convertedResponse.vehicleImages);
                }

                return result;
            } else {
                // Jeśli nie mamy zdjęć z plikami, używamy standardowego JSON
                const requestData = convertToSnakeCase(protocol);

                // Wysyłanie żądania POST z JSON
                const response = await apiClient.post<CarReceptionResponse>('/receptions', requestData);
                console.log('Server response:', response);

                // Konwertuj odpowiedź na format używany w aplikacji
                const convertedResponse = convertToCamelCase(response);

                // Połącz dane protokołu z odpowiedzią serwera
                const result: CarReceptionProtocol = {
                    ...protocol,
                    id: convertedResponse.id,
                    createdAt: convertedResponse.createdAt,
                    updatedAt: convertedResponse.updatedAt,
                    statusUpdatedAt: convertedResponse.statusUpdatedAt
                } as CarReceptionProtocol;

                // Przetwarzamy obrazy z odpowiedzi serwera jeśli istnieją
                if (convertedResponse.vehicleImages) {
                    result.vehicleImages = mapServerImagesToDisplayImages(convertedResponse.vehicleImages);
                }

                return result;
            }
        } catch (error) {
            console.error('Error creating protocol:', error);
            throw error;
        }
    },

    getProtocolsByClientId: async (clientId: string): Promise<ClientProtocolHistory[]> => {
        try {
            // Pobierz dane z API
            const rawData = await apiClient.get<any[]>(`/receptions/${clientId}/protocols`);

            return convertToCamelCase(rawData) as ClientProtocolHistory[];
        } catch (error) {
            console.error('Error fetching protocols list:', error);
            return [];
        }
    },

    // Aktualizacja istniejącego protokołu
    updateCarReceptionProtocol: async (protocol: CarReceptionProtocol): Promise<CarReceptionProtocol> => {
        try {
            // Sprawdzamy czy mamy nowe zdjęcia z plikami do wysłania
            const hasImages = protocol.vehicleImages && protocol.vehicleImages.length > 0;
            const hasFileImages = hasImages && protocol.vehicleImages!.some(img => img.file);

            // Jeśli mamy zdjęcia z plikami, używamy FormData
            if (hasFileImages) {
                const formData = new FormData();

                // Usuwamy pliki z obiektu protokołu i dodajemy je do FormData
                const protocolWithoutFiles = { ...protocol };

                if (protocolWithoutFiles.vehicleImages) {
                    // Przekształcamy zdjęcia do prostej struktury bez pól File
                    const simplifiedImages = protocolWithoutFiles.vehicleImages.map((img, index) => {
                        const { file, ...imageWithoutFile } = img;

                        // Jeśli mamy plik, dodajemy go do formData
                        if (file) {
                            formData.append(`images[${index}]`, file, file.name);
                        }

                        return {
                            ...imageWithoutFile,
                            hasFile: !!file // Informacja dla backendu, że to zdjęcie ma plik
                        };
                    });

                    protocolWithoutFiles.vehicleImages = simplifiedImages;
                }

                // Konwersja protokołu na snake_case i dodanie do formData jako JSON
                const jsonData = JSON.stringify(convertToSnakeCase(protocolWithoutFiles));
                formData.append('protocol', jsonData);

                // Wysyłanie żądania PUT z FormData
                const response = await apiClient.put<CarReceptionResponse>(`/receptions/${protocol.id}/with-files`, formData);

                // Konwertuj odpowiedź na format używany w aplikacji
                const convertedResponse = convertToCamelCase(response);

                // Połącz dane protokołu z odpowiedzią serwera
                const result: CarReceptionProtocol = {
                    ...protocol,
                    updatedAt: convertedResponse.updatedAt,
                    statusUpdatedAt: convertedResponse.statusUpdatedAt
                } as CarReceptionProtocol;

                // Przetwarzamy obrazy z odpowiedzi serwera jeśli istnieją
                if (convertedResponse.vehicleImages) {
                    result.vehicleImages = mapServerImagesToDisplayImages(convertedResponse.vehicleImages);
                }

                return result;
            } else {
                // Jeśli nie mamy zdjęć z plikami, używamy standardowego JSON
                const requestData = convertToSnakeCase(protocol);

                // Wysyłanie żądania PUT
                const response = await apiClient.put<CarReceptionResponse>(`/receptions/${protocol.id}`, requestData);

                // Konwertuj odpowiedź na format używany w aplikacji
                const convertedResponse = convertToCamelCase(response);

                // Połącz dane protokołu z odpowiedzią serwera
                const result: CarReceptionProtocol = {
                    ...protocol,
                    updatedAt: convertedResponse.updatedAt,
                    statusUpdatedAt: convertedResponse.statusUpdatedAt
                } as CarReceptionProtocol;

                // Przetwarzamy obrazy z odpowiedzi serwera jeśli istnieją
                if (convertedResponse.vehicleImages) {
                    result.vehicleImages = mapServerImagesToDisplayImages(convertedResponse.vehicleImages);
                }

                return result;
            }
        } catch (error) {
            console.error('Error updating protocol:', error);
            throw error;
        }
    },

    // Pobieranie protokołów
    fetchCarReceptionProtocols: async (): Promise<CarReceptionProtocol[]> => {
        try {
            const response = await apiClient.get<any[]>('/receptions');

            // Konwertuj odpowiedź na format używany w aplikacji
            return response.map(item => {
                const protocol = convertToCamelCase(item) as CarReceptionProtocol;

                // Jeśli protokół zawiera zdjęcia, przetwarzamy je
                if (protocol.vehicleImages) {
                    protocol.vehicleImages = mapServerImagesToDisplayImages(protocol.vehicleImages);
                }

                return protocol;
            });
        } catch (error) {
            console.error('Error fetching protocols:', error);
            // W przypadku błędu zwracamy puste dane (można też rzucić wyjątek)
            return [];
        }
    },

    // Pobieranie pojedynczego protokołu
    fetchCarReceptionProtocol: async (id: string): Promise<CarReceptionProtocol | null> => {
        try {
            const response = await apiClient.get<any>(`/receptions/${id}`);

            // Konwertuj odpowiedź na format używany w aplikacji
            const protocol = convertToCamelCase(response) as CarReceptionProtocol;

            // Jeśli protokół zawiera zdjęcia, przetwarzamy je
            if (protocol.vehicleImages) {
                protocol.vehicleImages = mapServerImagesToDisplayImages(protocol.vehicleImages);
            }

            return protocol;
        } catch (error) {
            console.error(`Error fetching protocol ${id}:`, error);
            return null;
        }
    },

    // Usuwanie protokołu
    deleteCarReceptionProtocol: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/receptions/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting protocol ${id}:`, error);
            return false;
        }
    },

    // Usuwanie zdjęcia z protokołu
    deleteVehicleImage: async (protocolId: string, imageId: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/receptions/${protocolId}/images/${imageId}`);
            return true;
        } catch (error) {
            console.error(`Error deleting image ${imageId} from protocol ${protocolId}:`, error);
            return false;
        }
    }
};