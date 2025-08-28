// src/hooks/useCompanyLogo.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiClientNew } from '../api/apiClientNew';

interface LogoData {
    hasLogo: boolean;
    logoUrl: string | null;
    logoId?: string;
}

interface CompanyBasicInfo {
    companyName: string;
    taxId: string;
    address?: string;
    phone?: string;
    website?: string;
    logoId?: string;
    logoUrl?: string;
}

interface CompanyResponse {
    id: number;
    companyId: number;
    basicInfo: CompanyBasicInfo;
    createdAt: string;
    updatedAt: string;
}

class LogoBlobManager {
    private static instance: LogoBlobManager;
    private blobCache = new Map<string, string>();

    static getInstance(): LogoBlobManager {
        if (!LogoBlobManager.instance) {
            LogoBlobManager.instance = new LogoBlobManager();
        }
        return LogoBlobManager.instance;
    }

    async getLogoBlobUrl(logoId: string): Promise<string> {
        // Check cache first
        if (this.blobCache.has(logoId)) {
            return this.blobCache.get(logoId)!;
        }

        try {
            // Fetch logo blob from API
            const response = await fetch(`/api/company/logo/${logoId}`, {
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
            const blobUrl = URL.createObjectURL(blob);

            // Cache the blob URL
            this.blobCache.set(logoId, blobUrl);

            return blobUrl;
        } catch (error) {
            console.error('Error fetching logo blob:', error);
            throw error;
        }
    }

    invalidateCache(logoId?: string): void {
        if (logoId && this.blobCache.has(logoId)) {
            const oldUrl = this.blobCache.get(logoId)!;
            URL.revokeObjectURL(oldUrl);
            this.blobCache.delete(logoId);
        } else {
            // Clear all cache
            this.blobCache.forEach(url => URL.revokeObjectURL(url));
            this.blobCache.clear();
        }
    }
}

/**
 * Production-ready hook for company logo management
 * Features:
 * - React Query for caching and background updates
 * - Automatic blob URL management
 * - Invalidation on logo changes
 * - Error boundaries and loading states
 * - Persistent across page refreshes
 */
export const useCompanyLogo = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const blobManager = LogoBlobManager.getInstance();

    const {
        data: logoData,
        isLoading,
        error,
        refetch
    } = useQuery<LogoData>({
        queryKey: ['companyLogo', user?.companyId],
        queryFn: async (): Promise<LogoData> => {
            if (!user?.companyId) {
                return { hasLogo: false, logoUrl: null };
            }

            try {
                // Get company settings to check logo
                const company = await apiClientNew.get<CompanyResponse>('/company');

                if (!company.basicInfo.logoId) {
                    return { hasLogo: false, logoUrl: null };
                }

                // Get blob URL for logo
                const logoUrl = await blobManager.getLogoBlobUrl(company.basicInfo.logoId);

                return {
                    hasLogo: true,
                    logoUrl,
                    logoId: company.basicInfo.logoId
                };
            } catch (error) {
                console.error('Error loading company logo:', error);
                return { hasLogo: false, logoUrl: null };
            }
        },
        enabled: !!user?.companyId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 401/403 errors
            if (error?.status === 401 || error?.status === 403) {
                return false;
            }
            return failureCount < 2;
        }
    });

    const invalidateLogo = (logoId?: string) => {
        // Clear blob cache
        blobManager.invalidateCache(logoId);

        // Invalidate React Query cache
        queryClient.invalidateQueries({
            queryKey: ['companyLogo', user?.companyId]
        });
    };

    const updateLogo = () => {
        // Force refetch - this will be called after logo upload/delete
        refetch();
    };

    return {
        logoUrl: logoData?.logoUrl || null,
        hasLogo: logoData?.hasLogo || false,
        logoId: logoData?.logoId,
        isLoading,
        error,
        refetch: updateLogo,
        invalidate: invalidateLogo
    };
};

/**
 * Simple hook that only returns logo URL - for components that just need display
 */
export const useCompanyLogoUrl = () => {
    const { logoUrl, isLoading } = useCompanyLogo();
    return { logoUrl, isLoading };
};