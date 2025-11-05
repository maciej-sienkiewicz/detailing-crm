// src/api/userSignatureApi.ts - Updated for base64 signature storage
import {apiClient} from '../shared/api/apiClient';

// Updated interfaces for base64 storage
export interface UserSignature {
    id: string;
    userId: string;
    companyId: string;
    content: string; // Base64 data URL content of signature image
    createdAt: string;
    updatedAt: string;
}

export interface CreateSignatureRequest {
    content: string; // Base64 data URL content
}

export interface UpdateSignatureRequest {
    content: string; // Base64 data URL content
}

export interface SignatureValidationResponse {
    isValid: boolean;
    errors: string[];
}

/**
 * User Signature API - Updated for base64 image storage
 * Single signature per user stored as base64 PNG data URL
 */
export const userSignatureApi = {
    /**
     * Get user signature (single signature)
     * GET /api/company-settings/signature
     */
    async getUserSignature(): Promise<UserSignature | null> {
        try {
            const response = await apiClient.get<UserSignature>('/company-settings/signature');
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // No signature exists
            }
            console.error('Error fetching user signature:', error);
            throw new Error('Nie udało się pobrać podpisu użytkownika');
        }
    },

    /**
     * Create signature (first time)
     * POST /api/company-settings/signature
     */
    async createSignature(data: CreateSignatureRequest): Promise<UserSignature> {
        try {
            const response = await apiClient.post<UserSignature>('/company-settings/signature', data);
            return response;
        } catch (error) {
            console.error('Error creating signature:', error);
            throw new Error('Nie udało się utworzyć podpisu');
        }
    },

    /**
     * Update existing signature
     * PUT /api/company-settings/signature
     */
    async updateSignature(data: UpdateSignatureRequest): Promise<UserSignature> {
        try {
            const response = await apiClient.put<UserSignature>('/company-settings/signature', data);
            return response;
        } catch (error) {
            console.error('Error updating signature:', error);
            throw new Error('Nie udało się zaktualizować podpisu');
        }
    },

    /**
     * Delete signature
     * DELETE /api/company-settings/signature
     */
    async deleteSignature(): Promise<void> {
        try {
            await apiClient.delete('/company-settings/signature');
        } catch (error) {
            console.error('Error deleting signature:', error);
            throw new Error('Nie udało się usunąć podpisu');
        }
    },

    /**
     * Validate signature content
     * POST /api/company-settings/signature/validate
     */
    async validateSignature(data: CreateSignatureRequest): Promise<SignatureValidationResponse> {
        try {
            const response = await apiClient.post<SignatureValidationResponse>('/company-settings/signature/validate', data);
            return response;
        } catch (error) {
            console.error('Error validating signature:', error);
            return {
                isValid: false,
                errors: ['Błąd walidacji podpisu']
            };
        }
    }
};

/**
 * Signature validation utilities - Updated for base64
 */
export const signatureValidation = {
    /**
     * Validate base64 signature content
     */
    validateSignatureContent(content: string): { valid: boolean; error?: string } {
        if (!content || content.trim().length === 0) {
            return { valid: false, error: 'Podpis nie może być pusty' };
        }

        // Check if it's a valid base64 data URL
        if (!content.startsWith('data:image/')) {
            return { valid: false, error: 'Nieprawidłowy format podpisu (oczekiwano data URL)' };
        }

        // Check if it contains base64 data
        const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
        if (!base64Regex.test(content)) {
            return { valid: false, error: 'Nieprawidłowy format base64' };
        }

        // Check size (1MB limit for base64 image)
        if (content.length > 1000000) {
            return { valid: false, error: 'Podpis jest zbyt duży (max 1MB)' };
        }

        // Extract base64 part and validate
        try {
            const base64Data = content.split(',')[1];
            if (!base64Data || base64Data.length < 100) {
                return { valid: false, error: 'Podpis jest zbyt mały lub uszkodzony' };
            }

            // Try to decode base64 to verify it's valid
            atob(base64Data);
        } catch (e) {
            return { valid: false, error: 'Nieprawidłowe dane base64' };
        }

        return { valid: true };
    }
};

/**
 * Signature constants - Updated for base64
 */
export const SIGNATURE_CONSTANTS = {
    MAX_BASE64_SIZE: 1000000, // 1MB
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 200,
    IMAGE_FORMAT: 'image/png' as const,
    IMAGE_QUALITY: 0.9, // For JPEG (not used with PNG)
    PEN_COLORS: {
        smooth: '#1a365d',
        fountain: '#000080',
        marker: '#2d3748',
        ballpoint: '#1a202c'
    }
};