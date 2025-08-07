// src/hooks/useUserSignature.ts - Simplified hook for signature management
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
}

/**
 * Simplified hook for user signature management
 * Handles single drawn signature per user
 */
export const useUserSignature = (): UseUserSignatureReturn => {
    // State management
    const [signature, setSignature] = useState<UserSignature | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            setError(errorMessage);
            console.error('Error loading signature:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create new signature
    const createSignature = useCallback(async (svgContent: string): Promise<UserSignature | null> => {
        try {
            setSaving(true);
            setError(null);

            // Validate SVG content before sending
            const validation = signatureValidation.validateSignatureContent(svgContent);
            if (!validation.valid) {
                setError(validation.error || 'Nieprawidłowy podpis');
                return null;
            }

            const newSignature = await userSignatureApi.createSignature({ content: svgContent });
            setSignature(newSignature);

            return newSignature;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się utworzyć podpisu';
            setError(errorMessage);
            return null;
        } finally {
            setSaving(false);
        }
    }, []);

    // Update existing signature
    const updateSignature = useCallback(async (svgContent: string): Promise<UserSignature | null> => {
        try {
            setSaving(true);
            setError(null);

            // Validate SVG content before sending
            const validation = signatureValidation.validateSignatureContent(svgContent);
            if (!validation.valid) {
                setError(validation.error || 'Nieprawidłowy podpis');
                return null;
            }

            const updatedSignature = await userSignatureApi.updateSignature({ content: svgContent });
            setSignature(updatedSignature);

            return updatedSignature;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się zaktualizować podpisu';
            setError(errorMessage);
            return null;
        } finally {
            setSaving(false);
        }
    }, []);

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
            setError(errorMessage);
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    // Validate signature data
    const validateSignatureData = useCallback(async (svgContent: string): Promise<SignatureValidationResponse> => {
        try {
            setValidating(true);
            setError(null);

            // Client-side validation first
            const clientValidation = signatureValidation.validateSignatureContent(svgContent);
            if (!clientValidation.valid) {
                return {
                    isValid: false,
                    errors: [clientValidation.error!]
                };
            }

            // Server-side validation
            const serverValidation = await userSignatureApi.validateSignature({ content: svgContent });
            return serverValidation;
        } catch (err) {
            console.error('Error validating signature:', err);
            return {
                isValid: false,
                errors: ['Błąd walidacji podpisu']
            };
        } finally {
            setValidating(false);
        }
    }, []);

    // Helper functions
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Load data on mount
    useEffect(() => {
        loadSignature();
    }, [loadSignature]);

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
        clearError
    };
};