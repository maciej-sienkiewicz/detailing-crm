import { useState, useCallback, useEffect } from 'react';
import {
    companySettingsApi,
    EmailConfigurationRequest,
    EmailConfigurationResponse,
    EmailSuggestionsResponse
} from '../api/companySettingsApi';

interface UseEmailSettingsReturn {
    // Stan
    configuration: EmailConfigurationResponse | null;
    suggestions: EmailSuggestionsResponse | null;
    loading: boolean;
    saving: boolean;
    validating: boolean;
    error: string | null;

    // Akcje
    loadConfiguration: () => Promise<void>;
    getSuggestions: (email: string) => Promise<void>;
    saveConfiguration: (data: EmailConfigurationRequest) => Promise<boolean>;

    // Helpery
    clearError: () => void;
    isConfigured: boolean;
    needsConfiguration: boolean;
}

export const useEmailSettings = (): UseEmailSettingsReturn => {
    const [configuration, setConfiguration] = useState<EmailConfigurationResponse | null>(null);
    const [suggestions, setSuggestions] = useState<EmailSuggestionsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadConfiguration = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await companySettingsApi.getCurrentEmailConfiguration();
            setConfiguration(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się załadować konfiguracji email');
        } finally {
            setLoading(false);
        }
    }, []);

    const getSuggestions = useCallback(async (email: string) => {
        if (!email || !email.includes('@')) return;

        try {
            setValidating(true);
            setError(null);
            const data = await companySettingsApi.getEmailSuggestions(email);
            setSuggestions(data);
        } catch (err) {
            console.error('Error getting email suggestions:', err);
            setSuggestions(null);
        } finally {
            setValidating(false);
        }
    }, []);

    const saveConfiguration = useCallback(async (data: EmailConfigurationRequest): Promise<boolean> => {
        try {
            setSaving(true);
            setError(null);

            const response = await companySettingsApi.saveEmailConfiguration(data);
            setConfiguration(response);

            if (response.validation_status === 'VALID') {
                return true;
            } else {
                setError(response.validation_message || 'Konfiguracja jest nieprawidłowa');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się zapisać konfiguracji');
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const isConfigured = Boolean(configuration?.is_enabled && configuration?.validation_status === 'VALID');
    const needsConfiguration = !configuration || configuration.validation_status !== 'VALID';

    useEffect(() => {
        loadConfiguration();
    }, [loadConfiguration]);

    return {
        configuration,
        suggestions,
        loading,
        saving,
        validating,
        error,
        loadConfiguration,
        getSuggestions,
        saveConfiguration,
        clearError,
        isConfigured,
        needsConfiguration
    };
};