// src/hooks/useUserSignature.ts - Fixed hook for signature management
import { useState, useEffect, useCallback } from 'react';
import {
    userSignatureApi,
    signatureValidation,
    type UserSignature,
    type CreateSignatureRequest,
    type UpdateSignatureRequest,
    type SignatureValidationResponse
} from '../api/userSignatureApi';

interface UseUserSignatureReturn {
    // State
    signature: UserSignature | null;
    hasSignature: boolean;
    loading: boolean;
    saving: boolean;
    validating: boolean;
    error: string | null;

    // Actions
    loadSignature: () => Promise<void>;
    createSignature: (svgContent: string) => Promise<UserSignature | null>;
    updateSignature: (svgContent: string) => Promise<UserSignature | null>;
    deleteSignature: () => Promise<boolean>;
    validateSignatureData: (svgContent: string) => Promise<SignatureValidationResponse>;

    // Helpers
    clearError: () => void;
    refreshSignature: () => Promise<void>;
}

/**
 * Enhanced hook for user signature management
 * Handles single drawn signature per user with base64 storage
 */
export const useUserSignature = (): UseUserSignatureReturn => {
    // State management
    const [signature, setSignature] = useState<UserSignature | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

    // Computed values
    const hasSignature = signature !== null;

    // Load user signature
    const loadSignature = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await userSignatureApi.getUserSignature();
            setSignature(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się załadować podpisu';
            console.error('Error loading signature:', err);
            setError(errorMessage);
            // Don't throw here - let component handle the error state
        } finally {
            setLoading(false);
            setHasInitiallyLoaded(true);
        }
    }, []);

    // Refresh signature (alias for loadSignature for clarity)
    const refreshSignature = useCallback(async () => {
        await loadSignature();
    }, [loadSignature]);

    // Validate signature content before submission (updated for base64)
    const performValidation = useCallback((signatureData: string): { valid: boolean; error?: string } => {
        if (!signatureData?.trim()) {
            return { valid: false, error: 'Podpis nie może być pusty' };
        }

        // Check if it's a valid base64 data URL
        if (!signatureData.startsWith('data:image/')) {
            return { valid: false, error: 'Nieprawidłowy format podpisu (oczekiwano base64)' };
        }

        // Check size (limit to 1MB for base64 image)
        if (signatureData.length > 1000000) {
            return { valid: false, error: 'Podpis jest zbyt duży (max 1MB)' };
        }

        return { valid: true };
    }, []);

    // Create new signature
    const createSignature = useCallback(async (svgContent: string): Promise<UserSignature | null> => {
        try {
            setSaving(true);
            setError(null);

            // Client-side validation
            const validation = performValidation(svgContent);
            if (!validation.valid) {
                setError(validation.error || 'Nieprawidłowy podpis');
                return null;
            }

            // Create signature via API
            const newSignature = await userSignatureApi.createSignature({
                content: svgContent.trim()
            });

            setSignature(newSignature);
            return newSignature;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się utworzyć podpisu';
            console.error('Error creating signature:', err);
            setError(errorMessage);
            return null;
        } finally {
            setSaving(false);
        }
    }, [performValidation]);

    // Update existing signature
    const updateSignature = useCallback(async (svgContent: string): Promise<UserSignature | null> => {
        try {
            setSaving(true);
            setError(null);

            // Client-side validation
            const validation = performValidation(svgContent);
            if (!validation.valid) {
                setError(validation.error || 'Nieprawidłowy podpis');
                return null;
            }

            // Update signature via API
            const updatedSignature = await userSignatureApi.updateSignature({
                content: svgContent.trim()
            });

            setSignature(updatedSignature);
            return updatedSignature;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się zaktualizować podpisu';
            console.error('Error updating signature:', err);
            setError(errorMessage);
            return null;
        } finally {
            setSaving(false);
        }
    }, [performValidation]);

    // Delete signature
    const deleteSignature = useCallback(async (): Promise<boolean> => {
        try {
            setSaving(true);
            setError(null);

            await userSignatureApi.deleteSignature();
            setSignature(null);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć podpisu';
            console.error('Error deleting signature:', err);
            setError(errorMessage);
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    // Validate signature data (updated for base64)
    const validateSignatureData = useCallback(async (signatureData: string): Promise<SignatureValidationResponse> => {
        try {
            setValidating(true);
            setError(null);

            // Client-side validation first
            const clientValidation = performValidation(signatureData);
            if (!clientValidation.valid) {
                return {
                    isValid: false,
                    errors: [clientValidation.error!]
                };
            }

            // Server-side validation
            const serverValidation = await userSignatureApi.validateSignature({
                content: signatureData.trim()
            });

            return serverValidation;
        } catch (err) {
            console.error('Error validating signature:', err);
            return {
                isValid: false,
                errors: ['Błąd walidacji podpisu na serwerze']
            };
        } finally {
            setValidating(false);
        }
    }, [performValidation]);

    // Clear error state
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Load signature on mount
    useEffect(() => {
        if (!hasInitiallyLoaded) {
            loadSignature();
        }
    }, [loadSignature, hasInitiallyLoaded]);

    // Clear error when signature changes (successful operation)
    useEffect(() => {
        if (signature && error) {
            setError(null);
        }
    }, [signature, error]);

    return {
        // State
        signature,
        hasSignature,
        loading,
        saving,
        validating,
        error,

        // Actions
        loadSignature,
        createSignature,
        updateSignature,
        deleteSignature,
        validateSignatureData,

        // Helpers
        clearError,
        refreshSignature
    };
};