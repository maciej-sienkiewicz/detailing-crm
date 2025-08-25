// src/api/galleryApi.ts - poprawiona wersja
import {apiClient} from './apiClient';

export interface GalleryImage {
    id: string;
    name: string;
    protocolId: string;
    protocolTitle?: string;
    clientName?: string;
    vehicleInfo?: string;
    size: number;
    contentType: string;
    description?: string;
    location?: string;
    tags: string[];
    createdAt: string[];
    thumbnailUrl: string;
    downloadUrl: string;
}

export interface GalleryStats {
    totalImages: number;
    totalSize: number;
    availableTags: TagStat[];
}

export interface TagStat {
    tag: string;
    count: number;
}

export interface GalleryFilters {
    tags?: string[];
    tagMatchMode?: 'ALL' | 'ANY';
    protocolId?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

export const galleryApi = {
    // Wyszukiwanie zdjęć z filtrami
// W galleryApi.ts
    searchImages: async (
        filters: GalleryFilters = {},
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedResponse<GalleryImage>> => {

        try {
            const requestBody: any = {
                page,
                size
            };

                // Dodajemy tylko niepuste filtry
                if (filters.tags && filters.tags.length > 0) {
                    requestBody.tags = filters.tags;
                }

                if (filters.tagMatchMode) {
                    requestBody.tagMatchMode = filters.tagMatchMode;
                }

                if (filters.protocolId && filters.protocolId.trim()) {
                    requestBody.protocolId = filters.protocolId.trim();
                }

                if (filters.name && filters.name.trim()) {
                    requestBody.name = filters.name.trim();
                }

                if (filters.startDate && filters.startDate.trim()) {
                    requestBody.startDate = filters.startDate.trim();
                }

                if (filters.endDate && filters.endDate.trim()) {
                    requestBody.endDate = filters.endDate.trim();
                }

                console.log('🌐 Gallery API - Making request:', requestBody);

                const rawResponse = await apiClient.post<any>('/gallery/search', requestBody);

                console.log('🌐 Gallery API - Raw response:', rawResponse);

                // Mapuj response do oczekiwanej struktury
                const mappedResponse: PaginatedResponse<GalleryImage> = {
                    data: rawResponse.data || [],
                    pagination: {
                        currentPage: rawResponse.page || 0,
                        pageSize: rawResponse.size || 20,
                        totalItems: rawResponse.totalItems || 0,
                        totalPages: rawResponse.totalPages || 0
                    }
                };

                console.log('🌐 Gallery API - Mapped response:', mappedResponse);

                return mappedResponse;
            } catch (error) {
                console.error('🌐 Gallery API Error:', error);
                throw error;
            }
    },

    // Pobieranie statystyk galerii
    getGalleryStats: async (): Promise<GalleryStats> => {
        try {
            return await apiClient.get<GalleryStats>('/gallery/stats');
        } catch (error) {
            console.error('Error fetching gallery stats:', error);
            throw error;
        }
    },

    // Pobieranie wszystkich dostępnych tagów
    getAllTags: async (): Promise<string[]> => {
        try {
            return await apiClient.get<string[]>('/gallery/tags');
        } catch (error) {
            console.error('Error fetching available tags:', error);
            throw error;
        }
    },

    // Generowanie URL do pobrania zdjęcia
    getDownloadUrl: (imageId: string): string => {
        return `${apiClient.getBaseUrl()}/gallery/images/${imageId}/download`;
    },

    // Generowanie URL do miniaturki
    getThumbnailUrl: (imageId: string): string => {
        return `${apiClient.getBaseUrl()}/gallery/images/${imageId}/thumbnail`;
    },

    downloadImage: async (imageId: string): Promise<Blob> => {
        try {
            const authToken = apiClient.getAuthToken();
            if (!authToken) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`${apiClient.getBaseUrl()}/gallery/images/${imageId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.error('Error downloading image:', error);
            throw error;
        }
    },
};