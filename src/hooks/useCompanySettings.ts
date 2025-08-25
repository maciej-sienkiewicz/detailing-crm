// src/hooks/useCompanySettings.ts - Zaktualizowany hook z nowym Google Drive API
import {useCallback, useEffect, useState} from 'react';
import {
    companySettingsApi,
    CompanySettingsResponse,
    ConfigureFolderRequest,
    GoogleDriveFolderSettings,
    GoogleDriveSystemInfo,
    NipValidationResponse,
    UpdateCompanySettingsRequest,
    ValidateFolderResponse
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
    validateNIP: (nip: string) => Promise<NipValidationResponse>;

    // Helpery
    clearError: () => void;
    hasUnsavedChanges: (formData: any) => boolean;
}

// ==========================================
// NOWY HOOK DLA GOOGLE DRIVE
// ==========================================

interface UseGoogleDriveIntegrationReturn {
    // Stan
    settings: GoogleDriveFolderSettings | null;
    systemInfo: GoogleDriveSystemInfo | null;
    loading: boolean;
    configuring: boolean;
    validating: boolean;
    testing: boolean;
    backing: boolean;
    error: string | null;

    // Akcje
    loadSettings: () => Promise<void>;
    loadSystemInfo: () => Promise<void>;
    configureFolder: (data: ConfigureFolderRequest) => Promise<boolean>;
    validateFolder: (folderId: string) => Promise<ValidateFolderResponse>;
    testConnection: () => Promise<boolean>;
    backupCurrentMonth: () => Promise<boolean>;
    deactivateIntegration: () => Promise<boolean>;

    // Helpery
    clearError: () => void;
    isConfigured: boolean;
    canBackup: boolean;
}

/**
 * Custom hook do zarządzania integracją Google Drive
 * Nowy systemowy hook dla uproszczonej integracji
 */
export const useGoogleDriveIntegration = (): UseGoogleDriveIntegrationReturn => {
    const [settings, setSettings] = useState<GoogleDriveFolderSettings | null>(null);
    const [systemInfo, setSystemInfo] = useState<GoogleDriveSystemInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [configuring, setConfiguring] = useState(false);
    const [validating, setValidating] = useState(false);
    const [testing, setTesting] = useState(false);
    const [backing, setBacking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ładowanie ustawień integracji
    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await companySettingsApi.getGoogleDriveIntegrationStatus();
            setSettings(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się załadować ustawień Google Drive');
        } finally {
            setLoading(false);
        }
    }, []);

    // Ładowanie informacji o systemie
    const loadSystemInfo = useCallback(async () => {
        try {
            setError(null);
            const data = await companySettingsApi.getGoogleDriveSystemInfo();
            setSystemInfo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się załadować informacji o systemie');
        }
    }, []);

    // Konfiguracja folderu
    const configureFolder = useCallback(async (data: ConfigureFolderRequest): Promise<boolean> => {
        try {
            setConfiguring(true);
            setError(null);
            const result = await companySettingsApi.configureGoogleDriveFolder(data);

            if (result.status === 'success') {
                // Odśwież ustawienia po pomyślnej konfiguracji
                await loadSettings();
                return true;
            } else {
                setError(result.message || 'Nie udało się skonfigurować folderu');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się skonfigurować folderu');
            return false;
        } finally {
            setConfiguring(false);
        }
    }, [loadSettings]);

    // Walidacja folderu
    const validateFolder = useCallback(async (folderId: string): Promise<ValidateFolderResponse> => {
        try {
            setValidating(true);
            setError(null);
            return await companySettingsApi.validateGoogleDriveFolder(folderId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Błąd walidacji folderu';
            setError(errorMessage);
            return {
                status: 'error',
                valid: false,
                message: errorMessage,
                systemEmail: settings?.systemEmail || ''
            };
        } finally {
            setValidating(false);
        }
    }, [settings]);

    // Test połączenia
    const testConnection = useCallback(async (): Promise<boolean> => {
        try {
            setTesting(true);
            setError(null);
            const result = await companySettingsApi.getGoogleDriveIntegrationStatus();
            return result.systemServiceAvailable && result.isActive;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd testu połączenia');
            return false;
        } finally {
            setTesting(false);
        }
    }, []);

    // Backup bieżącego miesiąca
    const backupCurrentMonth = useCallback(async (): Promise<boolean> => {
        try {
            setBacking(true);
            setError(null);
            const result = await companySettingsApi.backupCurrentMonth();

            if (result.status === 'success') {
                // Odśwież ustawienia po backup
                await loadSettings();
                return true;
            } else {
                setError(result.message || 'Nie udało się wykonać backup');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się wykonać backup');
            return false;
        } finally {
            setBacking(false);
        }
    }, [loadSettings]);

    // Dezaktywacja integracji
    const deactivateIntegration = useCallback(async (): Promise<boolean> => {
        try {
            setError(null);
            const result = await companySettingsApi.deactivateGoogleDriveIntegration();

            if (result.status === 'success') {
                // Odśwież ustawienia po dezaktywacji
                await loadSettings();
                return true;
            } else {
                setError(result.message || 'Nie udało się dezaktywować integracji');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się dezaktywować integracji');
            return false;
        }
    }, [loadSettings]);

    // Czyszczenie błędów
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Computed properties
    const isConfigured = Boolean(settings?.isActive && settings?.folderId);
    const canBackup = Boolean(isConfigured && settings?.systemServiceAvailable);

    // Ładowanie przy montowaniu
    useEffect(() => {
        loadSettings();
        loadSystemInfo();
    }, [loadSettings, loadSystemInfo]);

    return {
        // Stan
        settings,
        systemInfo,
        loading,
        configuring,
        validating,
        testing,
        backing,
        error,

        // Akcje
        loadSettings,
        loadSystemInfo,
        configureFolder,
        validateFolder,
        testConnection,
        backupCurrentMonth,
        deactivateIntegration,

        // Helpery
        clearError,
        isConfigured,
        canBackup
    };
};

// Dodatkowy hook do walidacji formularza ustawień firmy (bez zmian)
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

// Hook do zarządzania stanem logo (bez zmian)
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