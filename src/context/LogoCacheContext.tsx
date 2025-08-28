// src/context/LogoCacheContext.tsx
import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {companySettingsApi, type LogoSettings} from '../api/companySettingsApi';

interface LogoCacheData {
    logoUrl: string | null;
    logoSettings: LogoSettings | null;
    lastFetched: number;
}

interface LogoCacheContextType {
    logoUrl: string | null;
    logoSettings: LogoSettings | null;
    loading: boolean;
    error: string | null;
    refetchLogo: () => Promise<void>;
    clearCache: () => void;
    updateLogo: (newSettings: LogoSettings) => Promise<void>;
}

const LogoCacheContext = createContext<LogoCacheContextType | undefined>(undefined);

interface LogoCacheProviderProps {
    children: ReactNode;
}

// Cache key for localStorage
const LOGO_CACHE_KEY = 'company_logo_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const LogoCacheProvider: React.FC<LogoCacheProviderProps> = ({ children }) => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoSettings, setLogoSettings] = useState<LogoSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        loadFromCache();
    }, []);

    const loadFromCache = useCallback(() => {
        try {
            const cached = localStorage.getItem(LOGO_CACHE_KEY);
            if (cached) {
                const cacheData: LogoCacheData = JSON.parse(cached);
                const now = Date.now();

                // Check if cache is still valid
                if (now - cacheData.lastFetched < CACHE_DURATION && cacheData.logoUrl) {
                    console.log('✅ Loading logo from cache');
                    setLogoUrl(cacheData.logoUrl);
                    setLogoSettings(cacheData.logoSettings);
                    setLoading(false);
                    return;
                }
            }
        } catch (err) {
            console.warn('Failed to load logo from cache:', err);
        }

        // If no valid cache, fetch from server
        fetchLogoFromServer();
    }, []);

    const fetchLogoFromServer = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Fetching logo from server');

            // Get company settings to check if logo exists
            const settings = await companySettingsApi.getCompanySettings();
            const logoSettings = settings.logoSettings;

            if (!logoSettings?.hasLogo || !logoSettings.logoFileName) {
                console.log('❌ No logo configured');
                setLogoUrl(null);
                setLogoSettings(logoSettings);
                clearCacheStorage();
                return;
            }

            // Extract logoFileId from logoUrl or use logoFileName
            let logoFileId = logoSettings.logoFileName;
            if (logoSettings.logoUrl) {
                const match = logoSettings.logoUrl.match(/\/logo\/([^?]+)/);
                if (match) {
                    logoFileId = match[1];
                }
            }

            if (!logoFileId) {
                throw new Error('No logo file ID available');
            }

            // Fetch the actual logo blob
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No authentication token');
            }

            const apiUrl = 'http://localhost:8080/api';
            const response = await fetch(`${apiUrl}/company/logo/${logoFileId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'image/*'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('❌ Logo not found on server');
                    setLogoUrl(null);
                    setLogoSettings(logoSettings);
                    clearCacheStorage();
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Empty logo file received');
            }

            // Create object URL
            const objectUrl = URL.createObjectURL(blob);

            // Save to cache
            const cacheData: LogoCacheData = {
                logoUrl: objectUrl,
                logoSettings: logoSettings,
                lastFetched: Date.now()
            };

            try {
                localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(cacheData));
            } catch (cacheError) {
                console.warn('Failed to cache logo:', cacheError);
            }

            setLogoUrl(objectUrl);
            setLogoSettings(logoSettings);

            console.log('✅ Logo loaded and cached successfully');

        } catch (err: any) {
            console.error('❌ Failed to fetch logo:', err);
            setError(err.message || 'Failed to load logo');
            setLogoUrl(null);
            setLogoSettings(null);
            clearCacheStorage();
        } finally {
            setLoading(false);
        }
    }, []);

    const clearCacheStorage = useCallback(() => {
        try {
            localStorage.removeItem(LOGO_CACHE_KEY);
        } catch (err) {
            console.warn('Failed to clear logo cache:', err);
        }
    }, []);

    const clearCache = useCallback(() => {
        console.log('🗑️ Clearing logo cache');

        // Revoke old object URL
        if (logoUrl) {
            URL.revokeObjectURL(logoUrl);
        }

        setLogoUrl(null);
        setLogoSettings(null);
        setError(null);
        clearCacheStorage();
    }, [logoUrl]);

    const refetchLogo = useCallback(async () => {
        console.log('🔄 Refetching logo');
        clearCache();
        await fetchLogoFromServer();
    }, [clearCache, fetchLogoFromServer]);

    const updateLogo = useCallback(async (newSettings: LogoSettings) => {
        console.log('📝 Updating logo settings');

        // Clear old cache first
        if (logoUrl) {
            URL.revokeObjectURL(logoUrl);
        }
        clearCacheStorage();

        // Update settings
        setLogoSettings(newSettings);

        // If logo was removed
        if (!newSettings.hasLogo) {
            setLogoUrl(null);
            return;
        }

        // Fetch new logo
        await fetchLogoFromServer();
    }, [logoUrl, clearCacheStorage, fetchLogoFromServer]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (logoUrl) {
                URL.revokeObjectURL(logoUrl);
            }
        };
    }, [logoUrl]);

    const contextValue: LogoCacheContextType = {
        logoUrl,
        logoSettings,
        loading,
        error,
        refetchLogo,
        clearCache,
        updateLogo
    };

    return (
        <LogoCacheContext.Provider value={contextValue}>
            {children}
        </LogoCacheContext.Provider>
    );
};

export const useLogoCache = (): LogoCacheContextType => {
    const context = useContext(LogoCacheContext);
    if (!context) {
        throw new Error('useLogoCache must be used within a LogoCacheProvider');
    }
    return context;
};

// Helper hook for components that just need the logo URL
export const useCompanyLogo = () => {
    const { logoUrl, loading, error } = useLogoCache();
    return { logoUrl, loading, error };
};