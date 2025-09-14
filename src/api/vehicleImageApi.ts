// src/api/vehicleImageApi.ts
/**
 * Vehicle Image API - handles image upload and management for vehicles
 * Integrates with the backend VehicleController endpoints
 */

import {apiClientNew, ApiError, auth} from './apiClientNew';

export interface VehicleImageUploadRequest {
    vehicleId: string;
    file: File;
    name: string;
    tags: string[];
    onProgress?: (progress: number) => void; // <-- DODAJ TĘ LINIĘ
}

export interface VehicleImageUploadResponse {
    success: boolean;
    message: string;
    data: {
        mediaId: string;
        vehicleId: string;
    };
}

export interface VehicleImageResponse {
    id: string;
    url: string;
    thumbnailUrl: string;
    filename: string;
    uploadedAt: string;
}

export interface VehicleImageCountResponse {
    vehicleId: string;
    totalImages: number;
    hasImages: boolean;
}

/**
 * Vehicle Image API operations
 */
class VehicleImageApi {

    /**
     * Upload image to vehicle using multipart form data
     * Uses the IMAGE_ARRAY format expected by MediaRequestExtractor
     */
    async uploadVehicleImage({
                                 vehicleId,
                                 file,
                                 name,
                                 tags = [],
                                 onProgress
                             }: VehicleImageUploadRequest): Promise<VehicleImageUploadResponse> {

        const imageMetadata = {
            name: name || file.name.split('.').slice(0, -1).join('.'),
            size: file.size,
            type: file.type,
            tags: tags || [],
            has_file: true
        };

        const formData = new FormData();
        formData.append('images[0]', file);
        formData.append('image', JSON.stringify(imageMetadata));

        // Zamiast apiClientNew.post, używamy logiki z XHR, aby mieć postęp
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const endpoint = `/vehicles/${vehicleId}/images`;
            const url = `/api${endpoint}`; // Załóżmy, że prefix to /api

            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = (event.loaded / event.total) * 100;
                        onProgress(progress);
                    }
                });
            }

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response as VehicleImageUploadResponse);
                    } catch (e) {
                        reject(new Error("Failed to parse server response."));
                    }
                } else {
                    reject(new ApiError(xhr.status, xhr.statusText, xhr.responseText));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new ApiError(0, 'Network Error', 'Request failed to send.'));
            });

            xhr.open('POST', url);

            const token = auth.getToken();
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.send(formData);
        });
    }

    /**
     * Upload multiple images to vehicle
     */
    async uploadMultipleVehicleImages(
        vehicleId: string,
        images: Array<{
            file: File;
            name: string;
            tags: string[];
        }>
    ): Promise<VehicleImageUploadResponse[]> {
        try {
            console.log(`🖼️ Uploading ${images.length} images to vehicle:`, vehicleId);

            // Upload images in parallel (but limit concurrency to avoid overwhelming the server)
            const uploadPromises = images.map(image =>
                this.uploadVehicleImage({
                    vehicleId,
                    file: image.file,
                    name: image.name,
                    tags: image.tags
                })
            );

            const results = await Promise.allSettled(uploadPromises);

            const successful: VehicleImageUploadResponse[] = [];
            const failed: string[] = [];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successful.push(result.value);
                } else {
                    failed.push(`${images[index].name}: ${result.reason?.message || 'Unknown error'}`);
                }
            });

            console.log(`✅ Upload completed: ${successful.length} successful, ${failed.length} failed`);

            if (failed.length > 0) {
                console.warn('❌ Failed uploads:', failed);
            }

            return successful;

        } catch (error) {
            console.error('❌ Error uploading multiple vehicle images:', error);
            throw new Error('Failed to upload images. Please try again.');
        }
    }

    /**
     * Get all vehicle images (direct + from visits)
     */
    async getAllVehicleImages(vehicleId: string): Promise<VehicleImageResponse[]> {
        try {
            console.log('🖼️ Fetching all vehicle images for:', vehicleId);

            const response = await apiClientNew.get<VehicleImageResponse[]>(
                `/vehicles/${vehicleId}/images`,
                undefined,
                { timeout: 10000 }
            );

            console.log(`✅ Fetched ${response.length} vehicle images`);
            return response;

        } catch (error) {
            console.error('❌ Error fetching vehicle images:', error);

            if (ApiError.isApiError(error) && error.status === 404) {
                return []; // No images found
            }

            throw new Error('Failed to fetch vehicle images');
        }
    }

    /**
     * Get vehicle image thumbnails with pagination
     */
    async getVehicleImageThumbnails(
        vehicleId: string,
        page: number = 0,
        size: number = 10
    ): Promise<{
        content: VehicleImageResponse[];
        totalElements: number;
        totalPages: number;
        size: number;
        numberOfElements: number;
    }> {
        try {
            console.log('🖼️ Fetching vehicle image thumbnails:', { vehicleId, page, size });

            const response = await apiClientNew.get<any>(
                `/vehicles/${vehicleId}/images/thumbnails`,
                { page, size },
                { timeout: 10000 }
            );

            console.log(`✅ Fetched ${response.numberOfElements} image thumbnails`);
            return response;

        } catch (error) {
            console.error('❌ Error fetching vehicle image thumbnails:', error);

            if (ApiError.isApiError(error) && error.status === 404) {
                return {
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    size,
                    numberOfElements: 0
                };
            }

            throw new Error('Failed to fetch vehicle image thumbnails');
        }
    }

    /**
     * Get only direct vehicle images (excluding visit images)
     */
    async getDirectVehicleImages(vehicleId: string): Promise<VehicleImageResponse[]> {
        try {
            console.log('🖼️ Fetching direct vehicle images for:', vehicleId);

            const response = await apiClientNew.get<VehicleImageResponse[]>(
                `/vehicles/${vehicleId}/images/direct`,
                undefined,
                { timeout: 10000 }
            );

            console.log(`✅ Fetched ${response.length} direct vehicle images`);
            return response;

        } catch (error) {
            console.error('❌ Error fetching direct vehicle images:', error);

            if (ApiError.isApiError(error) && error.status === 404) {
                return []; // No images found
            }

            throw new Error('Failed to fetch direct vehicle images');
        }
    }

    /**
     * Delete vehicle image
     */
    async deleteVehicleImage(vehicleId: string, imageId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            vehicleId: string;
            imageId: string;
        };
    }> {
        try {
            console.log('🗑️ Deleting vehicle image:', { vehicleId, imageId });

            const response = await apiClientNew.delete<any>(
                `/vehicles/${vehicleId}/images/${imageId}`,
                { timeout: 10000 }
            );

            console.log('✅ Vehicle image deleted successfully');
            return response;

        } catch (error) {
            console.error('❌ Error deleting vehicle image:', error);

            if (ApiError.isApiError(error)) {
                throw new Error(`Delete failed: ${error.data?.message || error.message}`);
            }

            throw new Error('Failed to delete image. Please try again.');
        }
    }

    /**
     * Get vehicle images count
     */
    async getVehicleImagesCount(vehicleId: string): Promise<VehicleImageCountResponse> {
        try {
            console.log('🔢 Fetching vehicle images count for:', vehicleId);

            const response = await apiClientNew.get<VehicleImageCountResponse>(
                `/vehicles/${vehicleId}/images/count`,
                undefined,
                { timeout: 5000 }
            );

            console.log(`✅ Vehicle has ${response.totalImages} images`);
            return response;

        } catch (error) {
            console.error('❌ Error fetching vehicle images count:', error);

            if (ApiError.isApiError(error) && error.status === 404) {
                return {
                    vehicleId,
                    totalImages: 0,
                    hasImages: false
                };
            }

            throw new Error('Failed to fetch vehicle images count');
        }
    }

    /**
     * Update image metadata (name and tags)
     * Note: This would require a backend endpoint to be implemented
     */
    async updateImageMetadata(
        vehicleId: string,
        imageId: string,
        metadata: {
            name: string;
            tags: string[];
        }
    ): Promise<VehicleImageResponse> {
        try {
            console.log('✏️ Updating image metadata:', { vehicleId, imageId, metadata });

            // This endpoint doesn't exist in the current controller but would be useful
            const response = await apiClientNew.put<VehicleImageResponse>(
                `/vehicles/${vehicleId}/images/${imageId}/metadata`,
                metadata,
                { timeout: 10000 }
            );

            console.log('✅ Image metadata updated successfully');
            return response;

        } catch (error) {
            console.error('❌ Error updating image metadata:', error);
            throw new Error('Failed to update image metadata. This feature may not be available yet.');
        }
    }
}

// Export singleton instance
export const vehicleImageApi = new VehicleImageApi();

// Default export
export default vehicleImageApi;