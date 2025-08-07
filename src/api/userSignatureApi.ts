// src/api/userSignatureApi.ts - Simplified User Signature API
import { apiClient } from './apiClient';

// Simplified interfaces - only drawing signature
export interface UserSignature {
    id: string;
    userId: string;
    companyId: string;
    content: string; // SVG content of drawn signature
    createdAt: string;
    updatedAt: string;
}

export interface CreateSignatureRequest {
    content: string; // SVG content
}

export interface UpdateSignatureRequest {
    content: string; // SVG content
}

export interface SignatureValidationResponse {
    isValid: boolean;
    errors: string[];
}

/**
 * Simplified User Signature API
 * Single drawn signature per user
 */
export const userSignatureApi = {
    /**
     * Get user signature (single signature)
     * GET /api/user/signature
     */
    async getUserSignature(): Promise<UserSignature | null> {
        try {
            const response = await apiClient.get<UserSignature>('/user/signature');
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
     * POST /api/user/signature
     */
    async createSignature(data: CreateSignatureRequest): Promise<UserSignature> {
        try {
            const response = await apiClient.post<UserSignature>('/user/signature', data);
            return response;
        } catch (error) {
            console.error('Error creating signature:', error);
            throw new Error('Nie udało się utworzyć podpisu');
        }
    },

    /**
     * Update existing signature
     * PUT /api/user/signature
     */
    async updateSignature(data: UpdateSignatureRequest): Promise<UserSignature> {
        try {
            const response = await apiClient.put<UserSignature>('/user/signature', data);
            return response;
        } catch (error) {
            console.error('Error updating signature:', error);
            throw new Error('Nie udało się zaktualizować podpisu');
        }
    },

    /**
     * Delete signature
     * DELETE /api/user/signature
     */
    async deleteSignature(): Promise<void> {
        try {
            await apiClient.delete('/user/signature');
        } catch (error) {
            console.error('Error deleting signature:', error);
            throw new Error('Nie udało się usunąć podpisu');
        }
    },

    /**
     * Validate signature content
     * POST /api/user/signature/validate
     */
    async validateSignature(data: CreateSignatureRequest): Promise<SignatureValidationResponse> {
        try {
            const response = await apiClient.post<SignatureValidationResponse>('/user/signature/validate', data);
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
 * Signature validation utilities
 */
export const signatureValidation = {
    /**
     * Validate SVG signature content
     */
    validateSignatureContent(content: string): { valid: boolean; error?: string } {
        if (!content || content.trim().length === 0) {
            return { valid: false, error: 'Podpis nie może być pusty' };
        }

        // Basic SVG validation
        if (!content.includes('<svg') || !content.includes('</svg>')) {
            return { valid: false, error: 'Nieprawidłowy format podpisu' };
        }

        // Check if signature has actual drawing content
        if (!content.includes('<path') && !content.includes('<line') && !content.includes('<polyline')) {
            return { valid: false, error: 'Podpis musi zawierać narysowane elementy' };
        }

        if (content.length > 50000) { // 50KB limit for SVG
            return { valid: false, error: 'Podpis jest zbyt duży' };
        }

        return { valid: true };
    }
};

/**
 * Signature constants
 */
export const SIGNATURE_CONSTANTS = {
    MAX_SVG_SIZE: 50000, // 50KB
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 150,
    PEN_COLOR: '#000000',
    PEN_MIN_WIDTH: 1,
    PEN_MAX_WIDTH: 3
};