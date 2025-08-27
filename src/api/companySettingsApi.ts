// src/api/companySettingsApi.ts - Poprawiona wersja zgodna z backendem
import {apiClient} from './apiClient';

// Nowe interfejsy dla systemowego Google Drive
export interface GoogleDriveFolderSettings {
    isActive: boolean;
    folderId?: string;
    folderName?: string;
    folderUrl?: string;
    lastBackupAt?: string;
    lastBackupStatus?: string;
    backupCount?: number;
    systemEmail: string;
    systemServiceAvailable: boolean;
}

export interface GoogleDriveSystemInfo {
    systemEmail: string;
    systemServiceAvailable: boolean;
    connectionTest: boolean;
    stats: {
        activeIntegrations: number;
        totalIntegrations: number;
        systemEmail: string;
        systemServiceAvailable: boolean;
    };
    instructions: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
        step5: string;
    };
}

export interface ConfigureFolderRequest {
    folderId: string;
    folderName?: string;
}

export interface ValidateFolderResponse {
    status: string;
    valid: boolean;
    message: string;
    systemEmail: string;
    instructions?: {
        step1: string;
        step2: string;
        step3: string;
    };
}

// Zachowane stare interfejsy dla kompatybilności
export interface GoogleDriveSettings {
    isActive: boolean;
    serviceAccountEmail?: string;
    credentialsConfigured: boolean;
    lastBackupDate?: string;
    autoBackupEnabled: boolean;
}

export interface GoogleDriveTestResponse {
    companyId: number;
    isActive: boolean;
    status?: string;
}

// ZAKTUALIZOWANE INTERFEJSY - zgodne z nowym backendem
export interface CompanyBasicInfo {
    companyName: string;
    taxId: string;
    address?: string;
    phone?: string;
    website?: string;
    logoId?: string;
}

export interface BankSettings {
    bankAccountNumber?: string;
    bankName?: string;
    swiftCode?: string;
    accountHolderName?: string;
}

export interface LogoSettings {
    hasLogo: boolean;
    logoFileName?: string;
    logoContentType?: string;
    logoSize?: number;
    logoUrl?: string;
}

// USUNIĘTO EmailSettings z CompanySettingsResponse - teraz jest osobno
export interface CompanySettingsResponse {
    id: number;
    companyId: number;
    basicInfo: CompanyBasicInfo;
    bankSettings: BankSettings;
    logoSettings: LogoSettings;
    createdAt: string;
    updatedAt: string;
}

// ZAKTUALIZOWANO - usunięto emailSettings
export interface UpdateCompanySettingsRequest {
    basicInfo: CompanyBasicInfo;
    bankSettings: BankSettings;
    logoSettings?: LogoSettings;
}

export interface NipValidationResponse {
    nip: string;
    valid: boolean;
    message: string;
}

// NOWE INTERFEJSY EMAIL CONFIGURATION
export interface EmailConfigurationRequest {
    sender_email: string;
    sender_name: string;
    email_password: string;
    smtp_host: string;
    smtp_port: number;
    use_ssl: boolean;
    is_enabled?: boolean;
    send_test_email?: boolean;
}

export interface EmailConfigurationResponse {
    senderEmail: string;
    senderName: string;
    smtpHost: string;
    smtpPort: number;
    useSsl: boolean;
    isEnabled: boolean;
    validationStatus: 'NOT_TESTED' | 'VALID' | 'INVALID_CREDENTIALS' | 'INVALID_SETTINGS' | 'CONNECTION_ERROR';
    validationMessage?: string;
    providerHint?: string;
    testEmailSent: boolean;
}

export interface EmailSuggestionsResponse {
    email: string;
    has_suggestion: boolean;
    suggested_smtp_host: string;
    suggested_smtp_port: number;
    suggested_use_ssl: boolean;
    help_text: string;
}

/**
 * API do zarządzania ustawieniami firmy
 * Kompatybilne z nowym backendem Kotlin/Spring
 */
export const companySettingsApi = {
    /**
     * Pobiera ustawienia firmy dla aktualnej firmy
     * GET /api/company-settings
     */
    async getCompanySettings(): Promise<CompanySettingsResponse> {
        try {
            const response = await apiClient.get<CompanySettingsResponse>('/company');
            return response;
        } catch (error) {
            console.error('Error fetching company settings:', error);
            throw new Error('Nie udało się pobrać ustawień firmy');
        }
    },

    /**
     * Aktualizuje ustawienia firmy
     * PUT /api/company-settings
     */
    async updateCompanySettings(data: UpdateCompanySettingsRequest): Promise<CompanySettingsResponse> {
        try {
            const response = await apiClient.put<CompanySettingsResponse>('/company', data);
            return response;
        } catch (error) {
            console.error('Error updating company settings:', error);
            throw new Error('Nie udało się zaktualizować ustawień firmy');
        }
    },

    // ==========================================
    // NOWE API EMAIL CONFIGURATION
    // ==========================================

    /**
     * Pobiera sugestie konfiguracji email na podstawie domeny
     * GET /api/settings/email/suggestions?email={email}
     */
    async getEmailSuggestions(email: string): Promise<EmailSuggestionsResponse> {
        try {
            const response = await apiClient.get<EmailSuggestionsResponse>(`/settings/email/suggestions?email=${encodeURIComponent(email)}`);
            return response;
        } catch (error) {
            console.error('Error getting email suggestions:', error);
            return {
                email,
                has_suggestion: false,
                suggested_smtp_host: '',
                suggested_smtp_port: 587,
                suggested_use_ssl: true,
                help_text: 'Sprawdź dane SMTP w panelu swojego hostingu'
            };
        }
    },

    /**
     * Zapisuje konfigurację email z walidacją i opcjonalnym testem
     * POST /api/settings/email/save
     */
    async saveEmailConfiguration(data: EmailConfigurationRequest): Promise<EmailConfigurationResponse> {
        try {
            const response = await apiClient.post<EmailConfigurationResponse>('/settings/email/save', data);
            return response;
        } catch (error) {
            console.error('Error saving email configuration:', error);
            throw new Error('Nie udało się zapisać konfiguracji email');
        }
    },

    /**
     * Pobiera aktualną konfigurację email
     * GET /api/settings/email/current
     */
    async getCurrentEmailConfiguration(): Promise<EmailConfigurationResponse | null> {
        try {
            const response = await apiClient.get<EmailConfigurationResponse | null>('/settings/email/current');
            return response;
        } catch (error) {
            console.error('Error fetching current email configuration:', error);
            return null;
        }
    },

    // ==========================================
    // GOOGLE DRIVE API
    // ==========================================

    /**
     * Pobiera status integracji Google Drive (nowy system)
     * GET /api/google-drive/integration-status
     */
    async getGoogleDriveIntegrationStatus(): Promise<GoogleDriveFolderSettings> {
        try {
            const response = await apiClient.get<{
                companyId: number;
                isActive: boolean;
                status: string;
                systemEmail: string;
                systemServiceAvailable: boolean;
                configuration?: {
                    folderId: string;
                    folderName: string;
                    folderUrl: string;
                    lastBackupAt?: string;
                    lastBackupStatus?: string;
                    backupCount: number;
                };
            }>('/google-drive/integration-status');

            return {
                isActive: response.isActive,
                folderId: response.configuration?.folderId,
                folderName: response.configuration?.folderName,
                folderUrl: response.configuration?.folderUrl,
                lastBackupAt: response.configuration?.lastBackupAt,
                lastBackupStatus: response.configuration?.lastBackupStatus,
                backupCount: response.configuration?.backupCount,
                systemEmail: response.systemEmail,
                systemServiceAvailable: response.systemServiceAvailable
            };
        } catch (error) {
            console.error('Error fetching Google Drive integration status:', error);
            return {
                isActive: false,
                systemEmail: '',
                systemServiceAvailable: false
            };
        }
    },

    /**
     * Konfiguruje folder Google Drive dla firmy
     * POST /api/google-drive/configure-folder
     */
    async configureGoogleDriveFolder(data: ConfigureFolderRequest): Promise<{
        status: string;
        message: string;
        data?: {
            folderId: string;
            folderName: string;
            folderUrl: string;
            systemEmail: string;
        };
    }> {
        try {
            const response = await apiClient.post<{
                status: string;
                message: string;
                data?: {
                    folderId: string;
                    folderName: string;
                    folderUrl: string;
                    systemEmail: string;
                };
            }>('/google-drive/configure-folder', data);
            return response;
        } catch (error) {
            console.error('Error configuring Google Drive folder:', error);
            throw new Error('Nie udało się skonfigurować folderu Google Drive');
        }
    },

    /**
     * Waliduje dostęp do folderu Google Drive
     * POST /api/google-drive/validate-folder
     */
    async validateGoogleDriveFolder(folderId: string): Promise<ValidateFolderResponse> {
        try {
            const response = await apiClient.post<ValidateFolderResponse>('/google-drive/validate-folder', {
                folderId
            });
            return response;
        } catch (error) {
            console.error('Error validating Google Drive folder:', error);
            throw new Error('Nie udało się zwalidować folderu Google Drive');
        }
    },

    /**
     * Dezaktywuje integrację Google Drive
     * DELETE /api/google-drive/integration
     */
    async deactivateGoogleDriveIntegration(): Promise<{ status: string; message: string }> {
        try {
            const response = await apiClient.delete<{ status: string; message: string }>('/google-drive/integration');
            return response;
        } catch (error) {
            console.error('Error deactivating Google Drive integration:', error);
            throw new Error('Nie udało się dezaktywować integracji Google Drive');
        }
    },

    /**
     * Pobiera informacje o systemie Google Drive
     * GET /api/google-drive/system-info
     */
    async getGoogleDriveSystemInfo(): Promise<GoogleDriveSystemInfo> {
        try {
            const response = await apiClient.get<GoogleDriveSystemInfo>('/google-drive/system-info');
            return response;
        } catch (error) {
            console.error('Error fetching Google Drive system info:', error);
            throw new Error('Nie udało się pobrać informacji o systemie Google Drive');
        }
    },

    /**
     * Uruchamia backup bieżącego miesiąca
     * POST /api/google-drive/backup-current-month
     */
    async backupCurrentMonth(): Promise<{ status: string; message: string }> {
        try {
            const response = await apiClient.post<{ status: string; message: string }>('/google-drive/backup-current-month', {});
            return response;
        } catch (error) {
            console.error('Error running Google Drive backup:', error);
            throw new Error('Nie udało się uruchomić backup');
        }
    },

    // ==========================================
    // DEPRECATED API (dla kompatybilności wstecznej)
    // ==========================================

    /**
     * @deprecated Użyj getGoogleDriveIntegrationStatus()
     */
    async getIntegrationStatus(): Promise<GoogleDriveSettings> {
        try {
            const newStatus = await this.getGoogleDriveIntegrationStatus();
            return {
                isActive: newStatus.isActive,
                serviceAccountEmail: newStatus.systemEmail,
                credentialsConfigured: newStatus.isActive,
                lastBackupDate: newStatus.lastBackupAt,
                autoBackupEnabled: false
            };
        } catch (error) {
            console.error('Error fetching Google Drive status (deprecated):', error);
            return {
                isActive: false,
                credentialsConfigured: false,
                autoBackupEnabled: false
            };
        }
    },

    /**
     * @deprecated Nie używane w nowym systemie
     */
    async uploadCredentials(file: File, serviceAccountEmail: string): Promise<{ status: string; message: string }> {
        console.warn('uploadCredentials is deprecated. Use configureGoogleDriveFolder instead.');
        throw new Error('Ta funkcjonalność została zastąpiona konfiguracją folderu');
    },

    /**
     * @deprecated Użyj getGoogleDriveIntegrationStatus()
     */
    async testConnection(): Promise<GoogleDriveTestResponse> {
        try {
            const status = await this.getGoogleDriveIntegrationStatus();
            return {
                companyId: 0,
                isActive: status.isActive,
                status: status.isActive ? "ACTIVE" : "INACTIVE"
            };
        } catch (error) {
            console.error('Error testing Google Drive connection (deprecated):', error);
            return {
                companyId: 0,
                isActive: false,
                status: "INACTIVE"
            };
        }
    },

    /**
     * @deprecated Użyj deactivateGoogleDriveIntegration()
     */
    async removeIntegration(): Promise<{ status: string; message: string }> {
        try {
            return await this.deactivateGoogleDriveIntegration();
        } catch (error) {
            console.error('Error removing Google Drive integration (deprecated):', error);
            throw new Error('Nie udało się usunąć integracji');
        }
    },

    // ==========================================
    // POZOSTAŁE API (bez zmian)
    // ==========================================

    /**
     * Przesyła logo firmy
     * POST /api/company-settings/logo
     */
    async uploadLogo(logoFile: File): Promise<CompanySettingsResponse> {
        try {
            const formData = new FormData();
            formData.append('logo', logoFile);

            const response = await apiClient.post<CompanySettingsResponse>(
                '/company-settings/logo',
                formData
            );
            return response;
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw new Error('Nie udało się przesłać logo');
        }
    },

    /**
     * Usuwa logo firmy
     * DELETE /api/company-settings/logo
     */
    async deleteLogo(): Promise<CompanySettingsResponse> {
        try {
            const response = await apiClient.delete<CompanySettingsResponse>('/company/logo');
            return response;
        } catch (error) {
            console.error('Error deleting logo:', error);
            throw new Error('Nie udało się usunąć logo');
        }
    },

    /**
     * Pobiera logo firmy
     * GET /api/company-settings/logo/{logoFileId}
     */
    async getLogoUrl(logoFileId: string): Promise<string> {
        try {
            const token = apiClient.getAuthToken();

            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`${apiClient.getBaseUrl()}/company-settings/logo/${logoFileId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'image/*'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized access to logo');
                }
                if (response.status === 404) {
                    throw new Error('Logo not found');
                }
                throw new Error(`Failed to fetch logo: ${response.status}`);
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error fetching logo:', error);
            throw new Error('Nie udało się pobrać logo');
        }
    },

    /**
     * Pobiera logo jako Base64 z autoryzacją
     */
    async getLogoBase64(logoFileId: string): Promise<string> {
        try {
            const token = apiClient.getAuthToken();

            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`${apiClient.getBaseUrl()}/company-settings/logo/${logoFileId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'image/*'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch logo: ${response.status}`);
            }

            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error fetching logo as base64:', error);
            throw new Error('Nie udało się pobrać logo');
        }
    },

    /**
     * Pobiera bezpośredni URL do loga (dla użycia w src img)
     */
    getLogoDirectUrl(logoFileId: string): string {
        return `${apiClient.getBaseUrl()}/company-settings/logo/${logoFileId}`;
    },

    /**
     * Waliduje polski NIP
     * GET /api/company-settings/validation/nip/{nip}
     */
    async validateNIP(nip: string): Promise<NipValidationResponse> {
        try {
            const cleanNip = nip.replace(/[-\s]/g, '');
            const response = await apiClient.get<NipValidationResponse>(`/company-settings/validation/nip/${cleanNip}`);
            return response;
        } catch (error) {
            console.error('Error validating NIP:', error);
            throw new Error('Nie udało się zwalidować NIP');
        }
    },

    /**
     * Sprawdza czy nazwa koloru kalendarza jest już zajęta
     * GET /api/calendar-colors/check-name?name={name}&excludeId={id}
     */
    async isColorNameTaken(name: string, excludeId?: string): Promise<boolean> {
        try {
            const params: Record<string, any> = { name };
            if (excludeId) {
                params.excludeId = excludeId;
            }

            const response = await apiClient.get<{ taken: boolean }>('/calendar-colors/check-name', params);
            return response.taken;
        } catch (error) {
            console.error('Error checking color name:', error);
            return false;
        }
    }
};

// Eksportujemy także pomocnicze funkcje walidacyjne (bez zmian)
export const companySettingsValidation = {
    /**
     * Waliduje format polskiego NIP
     */
    validatePolishNIP(nip: string): boolean {
        const cleanNip = nip.replace(/[-\s]/g, '');

        if (cleanNip.length !== 10 || !/^\d{10}$/.test(cleanNip)) {
            return false;
        }

        const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        const digits = cleanNip.split('').map(d => parseInt(d));

        const sum = weights.reduce((acc, weight, index) => acc + weight * digits[index], 0);
        const checkDigit = sum % 11;

        return checkDigit === digits[9];
    },

    /**
     * Waliduje format adresu email
     */
    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Waliduje numer portu
     */
    validatePort(port: number): boolean {
        return port > 0 && port <= 65535;
    },

    /**
     * Formatuje NIP z myślnikami
     */
    formatNIP(nip: string): string {
        const cleanNip = nip.replace(/[-\s]/g, '');
        if (cleanNip.length === 10) {
            return `${cleanNip.substring(0, 3)}-${cleanNip.substring(3, 6)}-${cleanNip.substring(6, 8)}-${cleanNip.substring(8, 10)}`;
        }
        return nip;
    },

    /**
     * Waliduje rozmiar pliku logo
     */
    validateLogoFile(file: File): { valid: boolean; error?: string } {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Dozwolone są tylko pliki JPG, PNG i WebP'
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'Plik nie może być większy niż 5MB'
            };
        }

        return { valid: true };
    },

    /**
     * Waliduje format ID folderu Google Drive
     */
    validateGoogleDriveFolderId(folderId: string): { valid: boolean; error?: string } {
        const cleanFolderId = folderId.trim();

        if (!cleanFolderId) {
            return {
                valid: false,
                error: 'ID folderu nie może być puste'
            };
        }

        if (cleanFolderId.length < 10) {
            return {
                valid: false,
                error: 'ID folderu wydaje się zbyt krótkie'
            };
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(cleanFolderId)) {
            return {
                valid: false,
                error: 'ID folderu zawiera niedozwolone znaki'
            };
        }

        return { valid: true };
    }
};

// Stałe używane w module
export const COMPANY_SETTINGS_CONSTANTS = {
    MAX_LOGO_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_LOGO_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    DEFAULT_SMTP_PORT: 587,
    DEFAULT_IMAP_PORT: 993,
    DEFAULT_SMTP_SSL: true,
    DEFAULT_SMTP_TLS: true,

    // Google Drive constants
    GOOGLE_DRIVE: {
        FOLDER_ID_MIN_LENGTH: 10,
        FOLDER_ID_MAX_LENGTH: 100,
        SYSTEM_EMAIL_DEFAULT: 'sienkiewicz.maciej971030@gmail.com',
        BACKUP_STATUSES: {
            SUCCESS: 'SUCCESS',
            PARTIAL_SUCCESS: 'PARTIAL_SUCCESS',
            ERROR: 'ERROR',
            SUCCESS_NO_FILES: 'SUCCESS_NO_FILES'
        }
    },

    // Popularne ustawienia serwerów email
    EMAIL_PROVIDERS: {
        GMAIL: {
            name: 'Gmail',
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            imapHost: 'imap.gmail.com',
            imapPort: 993,
            useSSL: true,
            useTLS: true
        },
        OUTLOOK: {
            name: 'Outlook/Hotmail',
            smtpHost: 'smtp-mail.outlook.com',
            smtpPort: 587,
            imapHost: 'outlook.office365.com',
            imapPort: 993,
            useSSL: true,
            useTLS: true
        },
        YAHOO: {
            name: 'Yahoo',
            smtpHost: 'smtp.mail.yahoo.com',
            smtpPort: 587,
            imapHost: 'imap.mail.yahoo.com',
            imapPort: 993,
            useSSL: true,
            useTLS: true
        }
    }
};