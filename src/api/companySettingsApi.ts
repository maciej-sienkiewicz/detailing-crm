// src/api/companySettingsApi.ts
import { apiClient } from './apiClient';

export interface GoogleDriveSettings {
    isActive: boolean;
    serviceAccountEmail?: string;
    credentialsConfigured: boolean;
    lastBackupDate?: string;
    autoBackupEnabled: boolean;
}

export interface GoogleDriveTestResponse {
    success: boolean;
    message: string;
    errorDetails?: string;
}

// Interfejsy TypeScript dla ustawień firmy
export interface CompanyBasicInfo {
    companyName: string;
    taxId: string;
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

export interface EmailSettings {
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    imapHost?: string;
    imapPort?: number;
    imapUsername?: string;
    imapPassword?: string;
    senderEmail?: string;
    senderName?: string;
    useSSL: boolean;
    useTLS: boolean;
    // Pola tylko do odczytu z backendu
    smtpPasswordConfigured?: boolean;
    imapPasswordConfigured?: boolean;
    smtpConfigured?: boolean;
    imapConfigured?: boolean;
}

export interface LogoSettings {
    hasLogo: boolean;
    logoFileName?: string;
    logoContentType?: string;
    logoSize?: number;
    logoUrl?: string;
}

export interface CompanySettingsResponse {
    id: number;
    companyId: number;
    basicInfo: CompanyBasicInfo;
    bankSettings: BankSettings;
    emailSettings: EmailSettings;
    logoSettings: LogoSettings;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateCompanySettingsRequest {
    basicInfo: CompanyBasicInfo;
    bankSettings: BankSettings;
    emailSettings: EmailSettings;
    logoSettings?: LogoSettings;
}

export interface TestEmailConnectionRequest {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    useSSL: boolean;
    useTLS: boolean;
    testEmail: string;
}

export interface EmailTestResponse {
    success: boolean;
    message: string;
    errorDetails?: string;
}

export interface NipValidationResponse {
    nip: string;
    valid: boolean;
    message: string;
}

/**
 * API do zarządzania ustawieniami firmy
 * Kompatybilne z istniejącym backendem Kotlin/Spring
 */
export const companySettingsApi = {
    /**
     * Pobiera ustawienia firmy dla aktualnej firmy
     * GET /api/company-settings
     */
    async getCompanySettings(): Promise<CompanySettingsResponse> {
        try {
            const response = await apiClient.get<CompanySettingsResponse>('/company-settings');
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
            const response = await apiClient.put<CompanySettingsResponse>('/company-settings', data);
            return response;
        } catch (error) {
            console.error('Error updating company settings:', error);
            throw new Error('Nie udało się zaktualizować ustawień firmy');
        }
    },

    async getIntegrationStatus(): Promise<GoogleDriveSettings> {
        try {
            const response = await apiClient.getNot<{
                companyId: number;
                isActive: boolean;
                status: string;
                serviceAccountEmail?: string;
                lastBackupDate?: string;
            }>('/google-drive/integration-status');

            return {
                isActive: response.isActive,
                serviceAccountEmail: response.serviceAccountEmail,
                credentialsConfigured: response.isActive,
                lastBackupDate: response.lastBackupDate,
                autoBackupEnabled: false // TODO: dodać do backendu
            };
        } catch (error) {
            console.error('Error fetching Google Drive status:', error);
            return {
                isActive: false,
                credentialsConfigured: false,
                autoBackupEnabled: false
            };
        }
    },

    async uploadCredentials(file: File, serviceAccountEmail: string): Promise<{ status: string; message: string }> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('serviceAccountEmail', serviceAccountEmail);

            const response = await apiClient.postNotCamel<{ status: string; message: string }>(
                '/google-drive/credentials',
                formData
            );
            return response;
        } catch (error) {
            console.error('Error uploading Google Drive credentials:', error);
            throw new Error('Nie udało się przesłać credentials');
        }
    },

    async testConnection(): Promise<GoogleDriveTestResponse> {
        try {
            const response = await apiClient.getNot<GoogleDriveTestResponse>(
                '/google-drive/integration-status',
                {}
            );
            return response;
        } catch (error) {
            console.error('Error testing Google Drive connection:', error);
            return {
                success: false,
                message: 'Nie udało się przetestować połączenia',
                errorDetails: error instanceof Error ? error.message : 'Nieznany błąd'
            };
        }
    },

    async backupCurrentMonth(): Promise<{ status: string; message: string }> {
        try {
            const response = await apiClient.postNotCamel<{ status: string; message: string }>(
                '/google-drive/backup-current-month',
                {}
            );
            return response;
        } catch (error) {
            console.error('Error running Google Drive backup:', error);
            throw new Error('Nie udało się uruchomić backup');
        }
    },

    async removeIntegration(): Promise<{ status: string; message: string }> {
        try {
            const response = await apiClient.delete<{ status: string; message: string }>('/google-drive/credentials');
            return response;
        } catch (error) {
            console.error('Error removing Google Drive integration:', error);
            throw new Error('Nie udało się usunąć integracji');
        }
    },

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
            const response = await apiClient.delete<CompanySettingsResponse>('/company-settings/logo');
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

            // Konwertuj blob na Base64
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
     * Zwraca URL z tokenem jako parametr jeśli potrzebny
     */
    getLogoDirectUrl(logoFileId: string): string {
        const token = apiClient.getAuthToken();
        const baseUrl = `${apiClient.getBaseUrl()}/company-settings/logo/${logoFileId}`;

        // Dla środowisk które wymagają tokena w parametrach URL (nie zalecane w produkcji ze względów bezpieczeństwa)
        // return token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;

        // Dla autoryzacji przez nagłówki (zalecane)
        return baseUrl;
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
     * Testuje połączenie z serwerem email
     * POST /api/company-settings/test-email-connection
     */
    async testEmailConnection(data: TestEmailConnectionRequest): Promise<EmailTestResponse> {
        try {
            const response = await apiClient.post<EmailTestResponse>('/company-settings/test-email-connection', data);
            return response;
        } catch (error) {
            console.error('Error testing email connection:', error);
            // W przypadku błędu połączenia, zwracamy strukturę błędu
            if (error instanceof Error) {
                return {
                    success: false,
                    message: 'Nie udało się połączyć z serwerem email',
                    errorDetails: error.message
                };
            }
            throw new Error('Nie udało się przetestować połączenia email');
        }
    },

    /**
     * Sprawdza czy nazwa koloru kalendarza jest już zajęta (wykorzystuje istniejące API)
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
            // W przypadku błędu, zakładamy że nazwa nie jest zajęta
            return false;
        }
    }
};

// Eksportujemy także pomocnicze funkcje walidacyjne
export const companySettingsValidation = {
    /**
     * Waliduje format polskiego NIP
     */
    validatePolishNIP(nip: string): boolean {
        const cleanNip = nip.replace(/[-\s]/g, '');

        // Sprawdź długość i czy składa się tylko z cyfr
        if (cleanNip.length !== 10 || !/^\d{10}$/.test(cleanNip)) {
            return false;
        }

        // Walidacja sumy kontrolnej NIP
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
    }
};

// Eksportujemy również stałe używane w module
export const COMPANY_SETTINGS_CONSTANTS = {
    MAX_LOGO_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_LOGO_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    DEFAULT_SMTP_PORT: 587,
    DEFAULT_IMAP_PORT: 993,
    DEFAULT_SMTP_SSL: true,
    DEFAULT_SMTP_TLS: true,

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