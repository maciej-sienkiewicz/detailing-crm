// src/hooks/useVehicleImageUpload.ts - FIXED VERSION
/**
 * Custom hook for managing vehicle image uploads
 * Provides state management and utility functions for image upload operations
 */

import { useState, useCallback } from 'react';
import { vehicleImageApi, VehicleImageUploadRequest } from '../api/vehicleImageApi';

// FIXED: Changed uploadErrors type to match expected Record<string, string>
export interface UploadState {
    isUploading: boolean;
    uploadProgress: Record<string, number>;
    uploadErrors: Record<string, string>; // FIXED: Removed undefined union
    successfulUploads: string[];
}

export interface UseVehicleImageUploadReturn {
    uploadState: UploadState;
    uploadSingleImage: (request: VehicleImageUploadRequest) => Promise<boolean>;
    uploadMultipleImages: (vehicleId: string, images: Array<{
        file: File;
        name: string;
        tags: string[];
    }>) => Promise<{ successful: number; failed: number; errors: string[] }>;
    resetUploadState: () => void;
    getUploadProgress: (imageId: string) => number;
    getUploadError: (imageId: string) => string | undefined;
    isImageUploading: (imageId: string) => boolean;
}

/**
 * Hook for managing vehicle image uploads with progress tracking and error handling
 */
export const useVehicleImageUpload = (): UseVehicleImageUploadReturn => {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        uploadProgress: {},
        uploadErrors: {},
        successfulUploads: []
    });

    /**
     * Upload a single image with progress tracking
     */
    const uploadSingleImage = useCallback(async (request: VehicleImageUploadRequest): Promise<boolean> => {
        const imageId = `${request.vehicleId}-${request.file.name}-${Date.now()}`;

        try {
            setUploadState(prev => ({
                ...prev,
                isUploading: true,
                uploadProgress: { ...prev.uploadProgress, [imageId]: 0 },
                // FIXED: Remove undefined from the error, just don't include the key
                uploadErrors: Object.fromEntries(
                    Object.entries(prev.uploadErrors).filter(([key]) => key !== imageId)
                )
            }));

            // Simulate progress updates (in real implementation, this would come from the API)
            const progressInterval = setInterval(() => {
                setUploadState(prev => {
                    const currentProgress = prev.uploadProgress[imageId] || 0;
                    if (currentProgress < 90) {
                        return {
                            ...prev,
                            uploadProgress: {
                                ...prev.uploadProgress,
                                [imageId]: currentProgress + 10
                            }
                        };
                    }
                    return prev;
                });
            }, 200);

            const response = await vehicleImageApi.uploadVehicleImage(request);

            clearInterval(progressInterval);

            setUploadState(prev => ({
                ...prev,
                uploadProgress: { ...prev.uploadProgress, [imageId]: 100 },
                successfulUploads: [...prev.successfulUploads, imageId]
            }));
            return true;

        } catch (error) {
            console.error('❌ Upload failed:', error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';

            setUploadState(prev => ({
                ...prev,
                uploadProgress: { ...prev.uploadProgress, [imageId]: 0 },
                // FIXED: Ensure we're setting a string value, not undefined
                uploadErrors: { ...prev.uploadErrors, [imageId]: errorMessage }
            }));

            return false;
        } finally {
            setUploadState(prev => {
                const isStillUploading = Object.entries(prev.uploadProgress)
                    .some(([id, progress]) => id !== imageId && progress > 0 && progress < 100);

                return {
                    ...prev,
                    isUploading: isStillUploading
                };
            });
        }
    }, []);

    /**
     * Upload multiple images with batch processing
     */
    const uploadMultipleImages = useCallback(async (
        vehicleId: string,
        images: Array<{ file: File; name: string; tags: string[] }>
    ) => {

        setUploadState(prev => ({
            ...prev,
            isUploading: true,
            uploadProgress: {},
            uploadErrors: {},
            successfulUploads: []
        }));

        const results = {
            successful: 0,
            failed: 0,
            errors: [] as string[]
        };

        // Process uploads in parallel but limit concurrency
        const BATCH_SIZE = 3;
        const batches = [];

        for (let i = 0; i < images.length; i += BATCH_SIZE) {
            batches.push(images.slice(i, i + BATCH_SIZE));
        }

        for (const batch of batches) {
            const batchPromises = batch.map(async (image) => {
                const success = await uploadSingleImage({
                    vehicleId,
                    file: image.file,
                    name: image.name,
                    tags: image.tags
                });

                if (success) {
                    results.successful++;
                } else {
                    results.failed++;
                    const imageId = `${vehicleId}-${image.file.name}-${Date.now()}`;
                    const error = getUploadError(imageId);
                    if (error) {
                        results.errors.push(`${image.name}: ${error}`);
                    }
                }

                return success;
            });

            await Promise.all(batchPromises);
        }

        setUploadState(prev => ({
            ...prev,
            isUploading: false
        }));
        return results;
    }, [uploadSingleImage]);

    /**
     * Reset upload state
     */
    const resetUploadState = useCallback(() => {
        setUploadState({
            isUploading: false,
            uploadProgress: {},
            uploadErrors: {},
            successfulUploads: []
        });
    }, []);

    /**
     * Get upload progress for a specific image
     */
    const getUploadProgress = useCallback((imageId: string): number => {
        return uploadState.uploadProgress[imageId] || 0;
    }, [uploadState.uploadProgress]);

    /**
     * Get upload error for a specific image
     */
    const getUploadError = useCallback((imageId: string): string | undefined => {
        return uploadState.uploadErrors[imageId];
    }, [uploadState.uploadErrors]);

    /**
     * Check if a specific image is currently uploading
     */
    const isImageUploading = useCallback((imageId: string): boolean => {
        const progress = uploadState.uploadProgress[imageId] || 0;
        return progress > 0 && progress < 100;
    }, [uploadState.uploadProgress]);

    return {
        uploadState,
        uploadSingleImage,
        uploadMultipleImages,
        resetUploadState,
        getUploadProgress,
        getUploadError,
        isImageUploading
    };
};

export default useVehicleImageUpload;