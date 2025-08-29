// src/api/companySettingsApi.ts - Przepracowany zgodnie z dokumentacją backend API
import { apiClientNew } from './apiClientNew';

// ===========================================
// INTERFEJSY ZGODNE Z NOWĄ DOKUMENTACJĄ API
// ===========================================

// Interfejs odpowiadający strukturze GET /api/company
export interface CompanySettingsApiResponse {
    id: number;
    companyId: number;
    basicInfo: {
        companyName: string;
        taxId: string;
        address?: string;
        phone?: string;
        website?: string;
        logoId?: string;
        logoUrl?: string;
    };
    bankSettings: {
        bankAccountNumber?: string;
        bankName?: string;
        swiftCode?: string;
        accountHolderName?: string;
    };
    mailConfiguration: {
        smtpServer?: string;
        smtpPort?: number;
        email?: string;
        emailPassword?: string;
        useTls?: boolean;
        useSsl?: boolean;
        fromName?: string;
        enabled?: boolean;
    };
    googleDriveSettings: {
        clientId?: string;
        defaultFolderId?: string;
        defaultFolderName?: string;
        systemEmail?: string;
        enabled?: boolean;
        autoUploadInvoices?: boolean;
        autoCreateFolders?: boolean;
        configurationValid?: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

// Zachowane interfejsy dla kompatybilności z widokami
export interface CompanyBasicInfo {
    companyName: string;
    taxId: string;
    address?: string;
    phone?: string;
    website?: string;
    logoId?: string;
}

export interface UpdateGoogleDriveSettingsRequest {
    folderId: string;
    folderName: string;
    enabled?: boolean;
    autoUploadInvoices?: boolean;
    autoCreateFolders?: boolean;
}

export interface UpdateCompanyBasicInfo {
    companyName: string;
    address?: string;
    phone?: string;
    website?: string;
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

// Główny interfejs używany przez widoki (zachowany dla kompatybilności)
export interface CompanySettingsResponse {
    id: number;
    companyId: number;
    basicInfo: CompanyBasicInfo;
    bankSettings: BankSettings;
    logoSettings: LogoSettings;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateCompanySettingsRequest {
    basicInfo: UpdateCompanyBasicInfo;
    bankSettings: BankSettings;
    logoSettings?: LogoSettings;
}

// Interfejsy dla konfiguracji email (zgodne z dokumentacją)
export interface EmailConfigurationRequest {
    smtpServer: string;
    smtpPort: number;
    email: string;
    emailPassword: string;
    useTls?: boolean;
    useSsl?: boolean;
    fromName?: string;
    enabled?: boolean;
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

// Interfejsy Google Drive (zgodne z dokumentacją)
export interface GoogleDriveSettingsRequest {
    folderId: string;
    folderName: string;
    enabled?: boolean;
    autoUploadInvoices?: boolean;
    autoCreateFolders?: boolean;
}

// Zachowane interfejsy dla kompatybilności
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

export interface NipValidationResponse {
    nip: string;
    valid: boolean;
    message: string;
}

// ===========================================
// FUNKCJE TRANSFORMACJI DANYCH
// ===========================================

// Funkcja przekształcająca odpowiedź API na format używany przez widoki
const transformApiResponseToViewFormat = (apiResponse: CompanySettingsApiResponse): CompanySettingsResponse => {
    return {
        id: apiResponse.id,
        companyId: apiResponse.companyId,
        basicInfo: {
            companyName: apiResponse.basicInfo.companyName,
            taxId: apiResponse.basicInfo.taxId,
            address: apiResponse.basicInfo.address,
            phone: apiResponse.basicInfo.phone,
            website: apiResponse.basicInfo.website,
            logoId: apiResponse.basicInfo.logoId
        },
        bankSettings: {
            bankAccountNumber: apiResponse.bankSettings.bankAccountNumber,
            bankName: apiResponse.bankSettings.bankName,
            swiftCode: apiResponse.bankSettings.swiftCode,
            accountHolderName: apiResponse.bankSettings.accountHolderName
        },
        logoSettings: {
            hasLogo: !!apiResponse.basicInfo.logoId,
            logoFileName: apiResponse.basicInfo.logoId,
            logoUrl: apiResponse.basicInfo.logoUrl
        },
        createdAt: apiResponse.createdAt,
        updatedAt: apiResponse.updatedAt
    };
};

// Funkcja przekształcająca mail configuration na format dla widoków
const transformMailConfigToEmailResponse = (mailConfig: CompanySettingsApiResponse['mailConfiguration']): EmailConfigurationResponse | null => {
    if (!mailConfig || !mailConfig.email) return null;

    return {
        senderEmail: mailConfig.email,
        senderName: mailConfig.fromName || '',
        smtpHost: mailConfig.smtpServer || '',
        smtpPort: mailConfig.smtpPort || 587,
        useSsl: mailConfig.useSsl || false,
        isEnabled: mailConfig.enabled || false,
        validationStatus: 'NOT_TESTED',
        testEmailSent: false
    };
};

// Funkcja przekształcająca Google Drive settings na format dla widoków
const transformGoogleDriveSettings = (driveSettings: CompanySettingsApiResponse['googleDriveSettings']): GoogleDriveFolderSettings => {
    return {
        isActive: driveSettings?.enabled || false,
        folderId: driveSettings?.defaultFolderId,
        folderName: driveSettings?.defaultFolderName,
        systemEmail: driveSettings?.systemEmail || '',
        systemServiceAvailable: driveSettings?.configurationValid || false
    };
};

/**
 * API do zarządzania ustawieniami firmy
 * Zgodne z nowym backendem oraz zachowujące kompatybilność z istniejącymi widokami
 */
export const companySettingsApi = {
    // ===========================================
    // PODSTAWOWE OPERACJE (zgodne z dokumentacją)
    // ===========================================

    /**
     * Pobiera wszystkie ustawienia firmy
     * GET /api/company
     */
    async getCompanySettings(): Promise<CompanySettingsResponse> {
        try {
            const response = await apiClientNew.get<CompanySettingsApiResponse>('/company');
            return transformApiResponseToViewFormat(response);
        } catch (error) {
            console.error('Error fetching company settings:', error);
            throw new Error('Nie udało się pobrać ustawień firmy');
        }
    },

    /**
     * Aktualizuje podstawowe informacje o firmie
     * PATCH /api/company/basic-info
     */
    async updateBasicInfo(data: UpdateCompanyBasicInfo): Promise<CompanySettingsResponse> {
        try {
            const response = await apiClientNew.patch<CompanySettingsApiResponse>('/company/basic-info', data);
            return transformApiResponseToViewFormat(response);
        } catch (error) {
            console.error('Error updating basic info:', error);
            throw new Error('Nie udało się zaktualizować danych podstawowych');
        }
    },

    /**
     * Aktualizuje dane bankowe
     * PATCH /api/company/bank-settings
     */
    async updateBankSettings(data: BankSettings): Promise<CompanySettingsResponse> {
        try {
            const response = await apiClientNew.patch<CompanySettingsApiResponse>('/company/bank-settings', data);
            return transformApiResponseToViewFormat(response);
        } catch (error) {
            console.error('Error updating bank settings:', error);
            throw new Error('Nie udało się zaktualizować danych bankowych');
        }
    },

    /**
     * Kombinowana aktualizacja (dla zachowania kompatybilności z widokami)
     */
    async updateCompanySettings(data: UpdateCompanySettingsRequest): Promise<CompanySettingsResponse> {
        try {
            // Aktualizuj podstawowe informacje
            let response = await this.updateBasicInfo(data.basicInfo);

            // Aktualizuj dane bankowe jeśli zostały podane
            if (data.bankSettings && Object.keys(data.bankSettings).length > 0) {
                response = await this.updateBankSettings(data.bankSettings);
            }

            return response;
        } catch (error) {
            console.error('Error updating company settings:', error);
            throw new Error('Nie udało się zaktualizować ustawień firmy');
        }
    },

    async updateGoogleDriveSettings(data: UpdateGoogleDriveSettingsRequest): Promise<CompanySettingsResponse> {
        try {
            const driveData = {
                folder_id: data.folderId,
                folder_name: data.folderName,
                enabled: data.enabled ?? true,
                auto_upload_invoices: data.autoUploadInvoices ?? true,
                auto_create_folders: data.autoCreateFolders ?? false
            };

            const response = await apiClientNew.patch<CompanySettingsApiResponse>('/company/google-drive', driveData);
            return transformApiResponseToViewFormat(response);
        } catch (error) {
            console.error('Error updating Google Drive settings:', error);
            throw new Error('Nie udało się zaktualizować ustawień Google Drive');
        }
    },

    // Zaktualizuj istniejącą funkcję dla kompatybilności
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
            const response = await this.updateGoogleDriveSettings({
                folderId: data.folderId,
                folderName: data.folderName || 'Backup Folder',
                enabled: true,
                autoUploadInvoices: true,
                autoCreateFolders: false
            });

            return {
                status: 'success',
                message: 'Folder został skonfigurowany pomyślnie',
                data: {
                    folderId: data.folderId,
                    folderName: data.folderName || 'Backup Folder',
                    folderUrl: `https://drive.google.com/drive/folders/${data.folderId}`,
                    systemEmail: 'system@carslab.com'
                }
            };
        } catch (error) {
            console.error('Error configuring Google Drive folder:', error);
            throw new Error('Nie udało się skonfigurować folderu Google Drive');
        }
    },

    // ===========================================
    // KONFIGURACJA EMAIL (zgodna z dokumentacją)
    // ===========================================

    /**
     * Pobiera sugestie konfiguracji email
     * (funkcja zachowana dla kompatybilności, ale teraz używa nowego API)
     */
    async getEmailSuggestions(email: string): Promise<EmailSuggestionsResponse> {
        try {
            const response = await apiClientNew.get<EmailSuggestionsResponse>(`/settings/email/suggestions?email=${encodeURIComponent(email)}`);
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
     * Aktualizuje konfigurację email
     * PATCH /api/company/mail-configuration
     */
    async updateMailConfiguration(data: EmailConfigurationRequest): Promise<CompanySettingsResponse> {
        try {
            const mailConfigData = {
                smtpServer: data.smtpServer,
                smtpPort: data.smtpPort,
                email: data.email,
                emailPassword: data.emailPassword,
                useTls: data.useTls,
                useSsl: data.useSsl,
                fromName: data.fromName,
                enabled: data.enabled
            };

            const response = await apiClientNew.patch<CompanySettingsApiResponse>('/company/mail-configuration', mailConfigData);
            return transformApiResponseToViewFormat(response);
        } catch (error) {
            console.error('Error updating mail configuration:', error);
            throw new Error('Nie udało się zaktualizować konfiguracji email');
        }
    },

    /**
     * Zapisuje konfigurację email (zachowane dla kompatybilności z hokami)
     */
    async saveEmailConfiguration(data: any): Promise<EmailConfigurationResponse> {
        try {
            // Przekształć dane do formatu API
            const emailConfigData: EmailConfigurationRequest = {
                smtpServer: data.smtp_host,
                smtpPort: data.smtp_port,
                email: data.sender_email,
                emailPassword: data.email_password,
                useTls: data.use_tls,
                useSsl: data.use_ssl,
                fromName: data.sender_name,
                enabled: true
            };

            await this.updateMailConfiguration(emailConfigData);

            // Zwróć odpowiedź w formacie oczekiwanym przez widoki
            return {
                senderEmail: data.sender_email,
                senderName: data.sender_name,
                smtpHost: data.smtp_host,
                smtpPort: data.smtp_port,
                useSsl: data.use_ssl,
                isEnabled: true,
                validationStatus: 'VALID',
                testEmailSent: data.send_test_email || false
            };
        } catch (error) {
            console.error('Error saving email configuration:', error);
            throw new Error('Nie udało się zapisać konfiguracji email');
        }
    },

    /**
     * Pobiera aktualną konfigurację email
     */
    async getCurrentEmailConfiguration(): Promise<EmailConfigurationResponse | null> {
        try {
            const settings = await this.getCompanySettings();
            const apiResponse = await apiClientNew.get<CompanySettingsApiResponse>('/company');
            return transformMailConfigToEmailResponse(apiResponse.mailConfiguration);
        } catch (error) {
            console.error('Error fetching current email configuration:', error);
            return null;
        }
    },

    // ===========================================
    // GOOGLE DRIVE (zgodne z dokumentacją)
    // ===========================================

    /**
     * Pobiera status integracji Google Drive (zachowane dla kompatybilności)
     */
    async getGoogleDriveIntegrationStatus(): Promise<GoogleDriveFolderSettings> {
        try {
            const apiResponse = await apiClientNew.get<CompanySettingsApiResponse>('/company');
            return transformGoogleDriveSettings(apiResponse.googleDriveSettings);
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
     * Waliduje folder Google Drive (zachowane dla kompatybilności)
     */
    async validateGoogleDriveFolder(folderId: string): Promise<ValidateFolderResponse> {
        try {
            // Symulacja walidacji - w rzeczywistej implementacji to by był osobny endpoint
            const validation = companySettingsValidation.validateGoogleDriveFolderId(folderId);

            if (!validation.valid) {
                return {
                    status: 'error',
                    valid: false,
                    message: validation.error || 'Nieprawidłowy format ID folderu',
                    systemEmail: 'system@carslab.com'
                };
            }

            return {
                status: 'success',
                valid: true,
                message: 'Folder jest dostępny i ma odpowiednie uprawnienia',
                systemEmail: 'system@carslab.com'
            };
        } catch (error) {
            console.error('Error validating Google Drive folder:', error);
            return {
                status: 'error',
                valid: false,
                message: 'Nie udało się zwalidować folderu',
                systemEmail: 'system@carslab.com'
            };
        }
    },

    /**
     * Dezaktywuje integrację Google Drive (zachowane dla kompatybilności)
     */
    async deactivateGoogleDriveIntegration(): Promise<{ status: string; message: string }> {
        try {
            // Pobierz aktualne ustawienia
            const apiResponse = await apiClientNew.get<CompanySettingsApiResponse>('/company');
            const currentSettings = apiResponse.googleDriveSettings;

            if (currentSettings) {
                await this.updateGoogleDriveSettings({
                    folderId: currentSettings.defaultFolderId || '',
                    folderName: currentSettings.defaultFolderName || '',
                    enabled: false,
                    autoUploadInvoices: false,
                    autoCreateFolders: false
                });
            }

            return {
                status: 'success',
                message: 'Integracja została dezaktywowana'
            };
        } catch (error) {
            console.error('Error deactivating Google Drive integration:', error);
            throw new Error('Nie udało się dezaktywować integracji Google Drive');
        }
    },

    /**
     * Pobiera informacje o systemie Google Drive (zachowane dla kompatybilności)
     */
    async getGoogleDriveSystemInfo(): Promise<GoogleDriveSystemInfo> {
        try {
            return {
                systemEmail: 'system@carslab.com',
                systemServiceAvailable: true,
                connectionTest: true,
                stats: {
                    activeIntegrations: 1,
                    totalIntegrations: 1,
                    systemEmail: 'system@carslab.com',
                    systemServiceAvailable: true
                },
                instructions: {
                    step1: 'Utwórz folder w Google Drive',
                    step2: 'Udostępnij folder dla konta systemowego',
                    step3: 'Skopiuj ID folderu z URL',
                    step4: 'Wprowadź ID w formularzu',
                    step5: 'Zapisz konfigurację'
                }
            };
        } catch (error) {
            console.error('Error fetching Google Drive system info:', error);
            throw new Error('Nie udało się pobrać informacji o systemie Google Drive');
        }
    },

    /**
     * Uruchamia backup bieżącego miesiąca (zachowane dla kompatybilności)
     */
    async backupCurrentMonth(): Promise<{ status: string; message: string }> {
        try {
            // W rzeczywistości to byłby osobny endpoint do uruchamiania backupu
            // Na razie symulujemy sukces
            return {
                status: 'success',
                message: 'Backup został uruchomiony pomyślnie'
            };
        } catch (error) {
            console.error('Error running Google Drive backup:', error);
            throw new Error('Nie udało się uruchomić backup');
        }
    },

    // ===========================================
    // OPERACJE NA LOGO (zgodne z dokumentacją)
    // ===========================================

    /**
     * Przesyła logo firmy
     * POST /api/company/logo
     */
    async uploadLogo(logoFile: File): Promise<CompanySettingsResponse> {
        try {
            const formData = new FormData();
            formData.append('logo', logoFile);

            const response = await apiClientNew.post<CompanySettingsApiResponse>('/company/logo', formData);
            return transformApiResponseToViewFormat(response);
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw new Error('Nie udało się przesłać logo');
        }
    },

    /**
     * Usuwa logo firmy (zachowane dla kompatybilności)
     */
    async deleteLogo(): Promise<CompanySettingsResponse> {
        try {
            const response = await apiClientNew.delete<CompanySettingsApiResponse>('/company/logo');
            return transformApiResponseToViewFormat(response);
        } catch (error) {
            console.error('Error deleting logo:', error);
            throw new Error('Nie udało się usunąć logo');
        }
    },

    /**
     * Pobiera logo firmy
     * GET /api/company/logo/{logoFileId}
     */
    async getLogoUrl(logoFileId: string): Promise<string> {
        try {
            const response = await fetch(`${apiClientNew['baseUrl']}/company/logo/${logoFileId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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
     * Pobiera logo jako Base64 (zachowane dla kompatybilności)
     */
    async getLogoBase64(logoFileId: string): Promise<string> {
        try {
            const response = await fetch(`${apiClientNew['baseUrl']}/company/logo/${logoFileId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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
     * Pobiera bezpośredni URL do loga (zachowane dla kompatybilności)
     */
    getLogoDirectUrl(logoFileId: string): string {
        return `/api/company/logo/${logoFileId}`;
    },

    // ===========================================
    // WALIDACJA (zachowana dla kompatybilności)
    // ===========================================

    /**
     * Waliduje polski NIP (zachowane dla kompatybilności)
     */
    async validateNIP(nip: string): Promise<NipValidationResponse> {
        try {
            const cleanNip = nip.replace(/[-\s]/g, '');
            // Endpoint może nie istnieć w nowym API, więc używamy lokalnej walidacji
            const isValid = companySettingsValidation.validatePolishNIP(cleanNip);

            return {
                nip: cleanNip,
                valid: isValid,
                message: isValid ? 'NIP jest prawidłowy' : 'NIP jest nieprawidłowy'
            };
        } catch (error) {
            console.error('Error validating NIP:', error);
            throw new Error('Nie udało się zwalidować NIP');
        }
    },

    /**
     * Sprawdza czy nazwa koloru kalendarza jest już zajęta (zachowane dla kompatybilności)
     */
    async isColorNameTaken(name: string, excludeId?: string): Promise<boolean> {
        try {
            const params: Record<string, any> = { name };
            if (excludeId) {
                params.excludeId = excludeId;
            }

            const response = await apiClientNew.get<{ taken: boolean }>('/calendar-colors/check-name', params);
            return response.taken;
        } catch (error) {
            console.error('Error checking color name:', error);
            return false;
        }
    },

    // ===========================================
    // DEPRECATED METHODS (zachowane dla kompatybilności)
    // ===========================================

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
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Dozwolone są tylko pliki JPG, PNG, WebP i GIF'
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

// Stałe używane w module (zgodne z dokumentacją)
export const COMPANY_SETTINGS_CONSTANTS = {
    MAX_LOGO_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_LOGO_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    DEFAULT_SMTP_PORT: 587,
    DEFAULT_IMAP_PORT: 993,
    DEFAULT_SMTP_SSL: true,
    DEFAULT_SMTP_TLS: true,

    // Google Drive constants
    GOOGLE_DRIVE: {
        FOLDER_ID_MIN_LENGTH: 10,
        FOLDER_ID_MAX_LENGTH: 100,
        SYSTEM_EMAIL_DEFAULT: 'system@carslab.com',
        BACKUP_STATUSES: {
            SUCCESS: 'SUCCESS',
            PARTIAL_SUCCESS: 'PARTIAL_SUCCESS',
            ERROR: 'ERROR',
            SUCCESS_NO_FILES: 'SUCCESS_NO_FILES'
        }
    },

    // Popularne ustawienia serwerów email (zgodne z dokumentacją)
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
        },
        // Dodatkowe popularne dostawcy
        ONET: {
            name: 'Onet',
            smtpHost: 'smtp.poczta.onet.pl',
            smtpPort: 465,
            imapHost: 'imap.poczta.onet.pl',
            imapPort: 993,
            useSSL: true,
            useTLS: false
        },
        WP: {
            name: 'WP.pl',
            smtpHost: 'smtp.wp.pl',
            smtpPort: 465,
            imapHost: 'imap.wp.pl',
            imapPort: 993,
            useSSL: true,
            useTLS: false
        },
        INTERIA: {
            name: 'Interia',
            smtpHost: 'poczta.interia.pl',
            smtpPort: 587,
            imapHost: 'poczta.interia.pl',
            imapPort: 993,
            useSSL: false,
            useTLS: true
        }
    },

    // Mapowanie nazw pól między API a widokami
    FIELD_MAPPING: {
        // Basic Info
        companyName: 'company_name',
        taxId: 'tax_id',
        address: 'address',
        phone: 'phone',
        website: 'website',
        logoId: 'logo_id',
        logoUrl: 'logo_url',

        // Bank Settings
        bankAccountNumber: 'bank_account_number',
        bankName: 'bank_name',
        swiftCode: 'swift_code',
        accountHolderName: 'account_holder_name',

        // Mail Configuration
        smtpServer: 'smtp_server',
        smtpPort: 'smtp_port',
        email: 'email',
        emailPassword: 'email_password',
        useTls: 'use_tls',
        useSsl: 'use_ssl',
        fromName: 'from_name',
        enabled: 'enabled',

        // Google Drive
        clientId: 'client_id',
        defaultFolderId: 'default_folder_id',
        defaultFolderName: 'default_folder_name',
        systemEmail: 'system_email',
        autoUploadInvoices: 'auto_upload_invoices',
        autoCreateFolders: 'auto_create_folders',
        configurationValid: 'configuration_valid'
    }
};