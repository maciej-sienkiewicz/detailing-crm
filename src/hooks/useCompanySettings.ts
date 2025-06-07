// src/hooks/useCompanySettings.ts
import { useState, useEffect, useCallback } from 'react';
import {
    companySettingsApi,
    CompanySettingsResponse,
    UpdateCompanySettingsRequest,
    EmailTestResponse,
    NipValidationResponse
} from '../api/companySettingsApi';

interface UseCompanySettingsReturn {
    // Stan
    settings: CompanySettingsResponse | null;
    loading: boolean;
    saving: boolean;
    error: string | null;

    // Akcje
    loadSettings: () => Promise<void>;
    updateSettings: (data: UpdateCompanySettingsRequest) => Promise<boolean>;
    uploadLogo: (file: File) => Promise<boolean>;
    deleteLogo: () => Promise<boolean>;
    testEmailConnection: (emailData: any) => Promise<EmailTestResponse>;
    validateNIP: (nip: string) => Promise<NipValidationResponse>;

    // Helpery
    clearError: () => void;
    hasUnsavedChanges: (formData: any) => boolean;
}

/**
 * Custom hook do zarządzania ustawieniami firmy
 * Zapewnia prosty interfejs do wszystkich operacji na ustawieniach
 */
export const useCompanySettings = (): UseCompanySettingsReturn => {
    const [settings, setSettings] = useState<CompanySettingsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ładowanie ustawień
    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await companySettingsApi.getCompanySettings();
            setSettings(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się załadować ustawień');
        } finally {
            setLoading(false);
        }
    }, []);

    // Aktualizacja ustawień
    const updateSettings = useCallback(async (data: UpdateCompanySettingsRequest): Promise<boolean> => {
        try {
            setSaving(true);
            setError(null);
            const updatedSettings = await companySettingsApi.updateCompanySettings(data);
            setSettings(updatedSettings);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się zaktualizować ustawień');
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    // Upload logo
    const uploadLogo = useCallback(async (file: File): Promise<boolean> => {
        try {
            setSaving(true);
            setError(null);
            const updatedSettings = await companySettingsApi.uploadLogo(file);
            setSettings(prev => prev ? { ...prev, logoSettings: updatedSettings.logoSettings } : null);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się przesłać logo');
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    // Usuwanie logo
    const deleteLogo = useCallback(async (): Promise<boolean> => {
        try {
            setSaving(true);
            setError(null);
            const updatedSettings = await companySettingsApi.deleteLogo();
            setSettings(prev => prev ? { ...prev, logoSettings: updatedSettings.logoSettings } : null);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się usunąć logo');
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    // Test połączenia email
    const testEmailConnection = useCallback(async (emailData: any): Promise<EmailTestResponse> => {
        try {
            setError(null);
            return await companySettingsApi.testEmailConnection(emailData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Błąd testu połączenia email';
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage
            };
        }
    }, []);

    // Walidacja NIP
    const validateNIP = useCallback(async (nip: string): Promise<NipValidationResponse> => {
        try {
            setError(null);
            return await companySettingsApi.validateNIP(nip);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Błąd walidacji NIP';
            setError(errorMessage);
            return {
                nip,
                valid: false,
                message: errorMessage
            };
        }
    }, []);

    // Czyszczenie błędów
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Sprawdzanie czy są niezapisane zmiany
    const hasUnsavedChanges = useCallback((formData: any): boolean => {
        if (!settings) return false;

        // Porównaj formData z aktualnymi ustawieniami
        // Implementacja może być dostosowana do specyficznych potrzeb
        const currentData = {
            basicInfo: settings.basicInfo,
            bankSettings: settings.bankSettings,
            emailSettings: {
                ...settings.emailSettings,
                smtpPassword: '', // Hasła zawsze są puste w formularzu
                imapPassword: ''
            }
        };

        return JSON.stringify(formData) !== JSON.stringify(currentData);
    }, [settings]);

    // Ładowanie przy montowaniu
    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    return {
        // Stan
        settings,
        loading,
        saving,
        error,

        // Akcje
        loadSettings,
        updateSettings,
        uploadLogo,
        deleteLogo,
        testEmailConnection,
        validateNIP,

        // Helpery
        clearError,
        hasUnsavedChanges
    };
};

// Dodatkowy hook do walidacji formularza ustawień firmy
export const useCompanySettingsValidation = () => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validateForm = useCallback((formData: any) => {
        const errors: Record<string, string> = {};

        // Walidacja podstawowych informacji
        if (!formData.basicInfo?.companyName?.trim()) {
            errors['basicInfo.companyName'] = 'Nazwa firmy jest wymagana';
        }

        if (!formData.basicInfo?.taxId?.trim()) {
            errors['basicInfo.taxId'] = 'NIP jest wymagany';
        }

        // Walidacja email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (formData.emailSettings?.senderEmail && !emailRegex.test(formData.emailSettings.senderEmail)) {
            errors['emailSettings.senderEmail'] = 'Nieprawidłowy format adresu email';
        }

        if (formData.emailSettings?.smtpUsername && !emailRegex.test(formData.emailSettings.smtpUsername)) {
            errors['emailSettings.smtpUsername'] = 'Nieprawidłowy format adresu email';
        }

        if (formData.emailSettings?.imapUsername && !emailRegex.test(formData.emailSettings.imapUsername)) {
            errors['emailSettings.imapUsername'] = 'Nieprawidłowy format adresu email';
        }

        // Walidacja portów
        if (formData.emailSettings?.smtpPort && (formData.emailSettings.smtpPort < 1 || formData.emailSettings.smtpPort > 65535)) {
            errors['emailSettings.smtpPort'] = 'Port SMTP musi być liczbą od 1 do 65535';
        }

        if (formData.emailSettings?.imapPort && (formData.emailSettings.imapPort < 1 || formData.emailSettings.imapPort > 65535)) {
            errors['emailSettings.imapPort'] = 'Port IMAP musi być liczbą od 1 do 65535';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, []);

    const clearValidationError = useCallback((field: string) => {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const clearAllValidationErrors = useCallback(() => {
        setValidationErrors({});
    }, []);

    return {
        validationErrors,
        validateForm,
        clearValidationError,
        clearAllValidationErrors
    };
};

// Hook do zarządzania stanem logo
export const useLogoManagement = () => {
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const selectLogoFile = useCallback((file: File) => {
        // Walidacja pliku

        setLogoFile(file);

        // Tworzenie podglądu
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setLogoPreview(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }, []);

    const clearLogo = useCallback(() => {
        setLogoFile(null);
        setLogoPreview(null);
    }, []);

    const setLogoPreviewFromUrl = useCallback((url: string) => {
        setLogoPreview(url);
        setLogoFile(null);
    }, []);

    return {
        logoFile,
        logoPreview,
        uploadingLogo,
        setUploadingLogo,
        selectLogoFile,
        clearLogo,
        setLogoPreviewFromUrl
    };
};

// Eksportujemy również walidację z API
export { companySettingsValidation } from '../api/companySettingsApi';