// src/api/logoApi.ts
import { apiClientNew } from './apiClientNew';

export interface LogoUploadResponse {
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
    createdAt: string;
    updatedAt: string;
}

export interface LogoResource {
    url: string;
    contentType: string;
    size: number;
}

/**
 * API do zarządzania logo firmy
 * Zgodne z endpointami Kotlin/Spring z CompanyController
 */
export const logoApi = {
    /**
     * Przesyła nowe logo firmy
     * POST /api/company/logo
     */
    async uploadLogo(logoFile: File): Promise<LogoUploadResponse> {
        try {
            const formData = new FormData();
            formData.append('logo', logoFile);

            // Użyj bezpośrednio fetch aby mieć pełną kontrolę nad headers
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/company/logo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // NIE dodajemy Content-Type - przegłądarka ustawi automatycznie multipart/form-data z boundary
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Convert snake_case to camelCase
            return {
                id: data.id,
                companyId: data.company_id || data.companyId,
                basicInfo: {
                    companyName: data.basic_info?.company_name || data.basicInfo?.companyName,
                    taxId: data.basic_info?.tax_id || data.basicInfo?.taxId,
                    address: data.basic_info?.address || data.basicInfo?.address,
                    phone: data.basic_info?.phone || data.basicInfo?.phone,
                    website: data.basic_info?.website || data.basicInfo?.website,
                    logoId: data.basic_info?.logo_id || data.basicInfo?.logoId,
                    logoUrl: data.basic_info?.logo_url || data.basicInfo?.logoUrl,
                },
                bankSettings: {
                    bankAccountNumber: data.bank_settings?.bank_account_number || data.bankSettings?.bankAccountNumber,
                    bankName: data.bank_settings?.bank_name || data.bankSettings?.bankName,
                    swiftCode: data.bank_settings?.swift_code || data.bankSettings?.swiftCode,
                    accountHolderName: data.bank_settings?.account_holder_name || data.bankSettings?.accountHolderName,
                },
                createdAt: data.created_at || data.createdAt,
                updatedAt: data.updated_at || data.updatedAt
            };
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw new Error('Nie udało się przesłać logo');
        }
    },

    /**
     * Pobiera logo firmy jako zasób
     * GET /api/company/logo/{logoFileId}
     */
    async getLogo(logoFileId: string): Promise<LogoResource> {
        try {
            const response = await fetch(`/api/company/logo/${logoFileId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            return {
                url,
                contentType: response.headers.get('Content-Type') || 'image/jpeg',
                size: blob.size
            };
        } catch (error) {
            console.error('Error fetching logo:', error);
            throw new Error('Nie udało się pobrać logo');
        }
    },

    /**
     * Pobiera bezpośredni URL do logo (dla użycia w src img)
     */
    getLogoUrl(logoFileId: string): string {
        return `/api/company/logo/${logoFileId}`;
    },

    /**
     * Usuwa logo firmy
     * DELETE /api/company/logo (implementacja będzie potrzebna w CompanyController)
     */
    async deleteLogo(): Promise<LogoUploadResponse> {
        try {
            const response = await apiClientNew.delete<LogoUploadResponse>('/company/logo');
            return response;
        } catch (error) {
            console.error('Error deleting logo:', error);
            throw new Error('Nie udało się usunąć logo');
        }
    },

    /**
     * Waliduje plik logo przed przesłaniem
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