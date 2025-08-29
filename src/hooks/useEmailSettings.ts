// src/hooks/useEmailSettings.ts - Poprawiona wersja bez getSuggestions
import {useCallback, useEffect, useState} from 'react';
import {
    companySettingsApi,
    EmailConfigurationRequest,
    EmailConfigurationResponse
} from '../api/companySettingsApi';

interface UseEmailSettingsReturn {
    // Stan
    configuration: EmailConfigurationResponse | null;
    loading: boolean;
    saving: boolean;
    error: string | null;

    // Akcje
    loadConfiguration: () => Promise<void>;
    saveConfiguration: (data: EmailConfigurationRequest) => Promise<boolean>;

    // Helpery
    clearError: () => void;
    isConfigured: boolean;
    needsConfiguration: boolean;
}

export const useEmailSettings = (): UseEmailSettingsReturn => {
    const [configuration, setConfiguration] = useState<EmailConfigurationResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
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

    const saveConfiguration = useCallback(async (data: EmailConfigurationRequest): Promise<boolean> => {
        try {
            setSaving(true);
            setError(null);

            const response = await companySettingsApi.saveEmailConfiguration({
                sender_email: data.email,
                sender_name: data.fromName || '',
                email_password: data.emailPassword,
                smtp_host: data.smtpServer,
                smtp_port: data.smtpPort,
                use_ssl: data.useSsl,
                use_tls: data.useTls,
                send_test_email: false // Można dodać jako opcjonalny parametr
            });

            setConfiguration(response);

            if (response.validationStatus === 'VALID') {
                return true;
            } else {
                setError(response.validationMessage || 'Konfiguracja jest nieprawidłowa');
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

    const isConfigured = Boolean(configuration?.isEnabled && configuration?.validationStatus === 'VALID');
    const needsConfiguration = !configuration || configuration.validationStatus !== 'VALID';

    useEffect(() => {
        loadConfiguration();
    }, [loadConfiguration]);

    return {
        configuration,
        loading,
        saving,
        error,
        loadConfiguration,
        saveConfiguration,
        clearError,
        isConfigured,
        needsConfiguration
    };
};