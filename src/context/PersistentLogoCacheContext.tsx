// src/context/PersistentLogoCacheContext.tsx - POPRAWIONA WERSJA
import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {companySettingsApi, type LogoSettings} from '../api/companySettingsApi';

interface LogoCacheData {
    logoDataUrl: string | null;
    logoSettings: LogoSettings | null;
    lastFetched: number;
    logoHash: string | null;
}

interface PersistentLogoCacheContextType {
    logoUrl: string | null;
    logoSettings: LogoSettings | null;
    loading: boolean;
    error: string | null;
    refetchLogo: () => Promise<void>;
    clearCache: () => void;
    updateLogo: (newSettings: LogoSettings) => Promise<void>;
}

const PersistentLogoCacheContext = createContext<PersistentLogoCacheContextType | undefined>(undefined);

interface PersistentLogoCacheProviderProps {
    children: ReactNode;
}

// Cache configuration
const LOGO_CACHE_KEY = 'persistent_company_logo_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dni
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB max

// Utility functions
const generateLogoHash = (logoSettings: LogoSettings | null): string => {
    if (!logoSettings?.hasLogo) return 'no-logo';
    return `${logoSettings.logoFileName}-${logoSettings.logoSize} || 0}`;
};

// POPRAWIONA funkcja kompresji - nie niszczy obrazów
const convertBlobToDataUrl = async (blob: Blob, maxWidth: number = 800, quality: number = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Cannot get canvas context'));
                    return;
                }

                // Calculate new dimensions maintaining aspect ratio
                let { width, height } = img;

                // Only resize if image is larger than maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // KLUCZOWE: Ustaw białe tło przed rysowaniem
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);

                // Draw image
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to data URL with specified quality
                const dataUrl = canvas.toDataURL('image/jpeg', quality);

                console.log('✅ Image converted to data URL:', {
                    originalSize: blob.size,
                    newSize: dataUrl.length,
                    dimensions: `${width}x${height}`,
                    format: 'JPEG'
                });

                resolve(dataUrl);
            };

            img.onerror = () => {
                console.error('❌ Failed to load image for conversion');
                reject(new Error('Failed to load image for conversion'));
            };

            // POPRAWKA: Sprawdź czy dane są prawidłowe
            const result = event.target?.result;
            if (typeof result === 'string') {
                img.src = result;
            } else {
                reject(new Error('Failed to read file as data URL'));
            }
        };

        reader.onerror = () => {
            console.error('❌ FileReader error');
            reject(new Error('Failed to read file'));
        };

        // ALTERNATYWNA metoda - jeśli blob jest niewielki, użyj go bezpośrednio
        if (blob.size < 500 * 1024) { // Jeśli mniejszy niż 500KB
            reader.readAsDataURL(blob);
        } else {
            // Dla większych plików, kompresuj
            reader.readAsDataURL(blob);
        }
    });
};

export const PersistentLogoCacheProvider: React.FC<PersistentLogoCacheProviderProps> = ({ children }) => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoSettings, setLogoSettings] = useState<LogoSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load from persistent cache on mount
    useEffect(() => {
        loadFromPersistentCache();
    }, []);

    const loadFromPersistentCache = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Loading logo from persistent cache...');

            // Try to load from localStorage first
            const cached = localStorage.getItem(LOGO_CACHE_KEY);
            if (cached) {
                const cacheData: LogoCacheData = JSON.parse(cached);
                const now = Date.now();

                // Check if cache is still valid
                if (now - cacheData.lastFetched < CACHE_DURATION && cacheData.logoDataUrl) {
                    console.log('✅ Loading logo from persistent cache');

                    // SPRAWDZENIE: Czy data URL jest prawidłowe
                    if (cacheData.logoDataUrl.startsWith('data:image/')) {
                        setLogoUrl(cacheData.logoDataUrl);
                        setLogoSettings(cacheData.logoSettings);
                        setLoading(false);

                        // Verify cache is still up to date in background
                        verifyAndUpdateCache(cacheData);
                        return;
                    } else {
                        console.warn('⚠️ Invalid data URL in cache, fetching fresh logo');
                    }
                }
            }

            // If no valid cache, fetch from server
            await fetchLogoFromServer();
        } catch (err) {
            console.warn('Failed to load logo from persistent cache:', err);
            await fetchLogoFromServer();
        }
    }, []);

    const verifyAndUpdateCache = useCallback(async (currentCache: LogoCacheData) => {
        try {
            // Get current server settings to check if logo changed
            const settings = await companySettingsApi.getCompanySettings();
            const serverHash = generateLogoHash(settings.logoSettings);

            // If hash doesn't match, refresh logo
            if (serverHash !== currentCache.logoHash) {
                console.log('🔄 Logo changed on server, updating cache');
                await fetchLogoFromServer();
            }
        } catch (err) {
            console.warn('Failed to verify logo cache:', err);
        }
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
                clearPersistentCache();
                return;
            }

            // Extract logoFileId
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
            const response = await fetch(`${apiUrl}/company-settings/logo/${logoFileId}`, {
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
                    clearPersistentCache();
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Empty logo file received');
            }

            console.log('📁 Blob received:', {
                size: blob.size,
                type: blob.type
            });

            // KLUCZOWA POPRAWKA: Najpierw sprawdź czy blob jest obrazem
            if (!blob.type.startsWith('image/')) {
                throw new Error(`Invalid image type: ${blob.type}`);
            }

            // Convert to data URL - POPRAWIONA metoda
            const dataUrl = await convertBlobToDataUrl(blob, 800, 0.9);

            // WALIDACJA: Sprawdź czy data URL jest prawidłowe
            if (!dataUrl || !dataUrl.startsWith('data:image/')) {
                throw new Error('Failed to convert image to data URL');
            }

            // Save to persistent cache
            const logoHash = generateLogoHash(logoSettings);
            const cacheData: LogoCacheData = {
                logoDataUrl: dataUrl,
                logoSettings: logoSettings,
                lastFetched: Date.now(),
                logoHash: logoHash
            };

            try {
                localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(cacheData));
                console.log('💾 Logo saved to persistent cache');
            } catch (cacheError) {
                console.warn('Failed to cache logo (localStorage full?):', cacheError);
                // Continue without caching
            }

            setLogoUrl(dataUrl);
            setLogoSettings(logoSettings);

            console.log('✅ Logo loaded and cached persistently');

        } catch (err: any) {
            console.error('❌ Failed to fetch logo:', err);
            setError(err.message || 'Failed to load logo');
            setLogoUrl(null);
            setLogoSettings(null);
            clearPersistentCache();
        } finally {
            setLoading(false);
        }
    }, []);

    const clearPersistentCache = useCallback(() => {
        try {
            localStorage.removeItem(LOGO_CACHE_KEY);
            console.log('🗑️ Persistent logo cache cleared');
        } catch (err) {
            console.warn('Failed to clear persistent logo cache:', err);
        }
    }, []);

    const clearCache = useCallback(() => {
        console.log('🗑️ Clearing logo cache');
        setLogoUrl(null);
        setLogoSettings(null);
        setError(null);
        clearPersistentCache();
    }, [clearPersistentCache]);

    const refetchLogo = useCallback(async () => {
        console.log('🔄 Force refetching logo');
        clearCache();
        await fetchLogoFromServer();
    }, [clearCache, fetchLogoFromServer]);

    const updateLogo = useCallback(async (newSettings: LogoSettings) => {
        console.log('📝 Updating logo settings');

        // Clear old cache first
        clearPersistentCache();

        // Update settings
        setLogoSettings(newSettings);

        // If logo was removed
        if (!newSettings.hasLogo) {
            setLogoUrl(null);
            return;
        }

        // Fetch new logo
        await fetchLogoFromServer();
    }, [clearPersistentCache, fetchLogoFromServer]);

    const contextValue: PersistentLogoCacheContextType = {
        logoUrl,
        logoSettings,
        loading,
        error,
        refetchLogo,
        clearCache,
        updateLogo
    };

    return (
        <PersistentLogoCacheContext.Provider value={contextValue}>
            {children}
        </PersistentLogoCacheContext.Provider>
    );
};

export const usePersistentLogoCache = (): PersistentLogoCacheContextType => {
    const context = useContext(PersistentLogoCacheContext);
    if (!context) {
        throw new Error('usePersistentLogoCache must be used within a PersistentLogoCacheProvider');
    }
    return context;
};

// Helper hook for components that just need the logo URL
export const useCompanyLogoPersistent = () => {
    const { logoUrl, loading, error, refetchLogo } = usePersistentLogoCache();
    return { logoUrl, loading, error, refetchLogo };
};