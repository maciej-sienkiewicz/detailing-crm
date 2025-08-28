// src/context/BrandColorContext.tsx - Context Provider dla koloru marki
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useBrandColor } from '../hooks/useBrandColor';

interface BrandColorContextValue {
    brandColor: string;
    isLoading: boolean;
    error: string | null;
    updateBrandColor: (color: string) => void;
    resetBrandColor: () => void;
    validateColor: (color: string) => boolean;
    generateColorVariants: (color?: string) => any;
    defaultColor: string;
    isDefault: boolean;
}

const BrandColorContext = createContext<BrandColorContextValue | undefined>(undefined);

interface BrandColorProviderProps {
    children: ReactNode;
}

/**
 * Provider dla globalnego zarządzania kolorem marki
 * Zapewnia jednolity dostęp do koloru marki w całej aplikacji
 */
export const BrandColorProvider: React.FC<BrandColorProviderProps> = ({ children }) => {
    const brandColorHook = useBrandColor();

    // Aplikuj CSS variables przy każdej zmianie koloru
    useEffect(() => {
        // CSS variables są już aplikowane w hook'u, ale dodajemy dodatkową walidację
        if (brandColorHook.brandColor && !brandColorHook.isLoading) {
            console.log('BrandColorProvider: Color applied -', brandColorHook.brandColor);
        }
    }, [brandColorHook.brandColor, brandColorHook.isLoading]);

    // Obsługa błędów na poziomie aplikacji
    useEffect(() => {
        if (brandColorHook.error) {
            console.error('BrandColorProvider: Error -', brandColorHook.error);

            // Możesz tutaj dodać toast notification lub inne powiadomienie
            // np. toast.error(brandColorHook.error);
        }
    }, [brandColorHook.error]);

    return (
        <BrandColorContext.Provider value={brandColorHook}>
            {children}
        </BrandColorContext.Provider>
    );
};

/**
 * Hook do używania kontekstu koloru marki
 * Zapewnia type-safe dostęp do wszystkich funkcjonalności
 */
export const useBrandColorContext = (): BrandColorContextValue => {
    const context = useContext(BrandColorContext);

    if (context === undefined) {
        throw new Error(
            'useBrandColorContext must be used within a BrandColorProvider. ' +
            'Make sure to wrap your app with <BrandColorProvider>.'
        );
    }

    return context;
};

/**
 * HOC dla komponentów wymagających dostępu do koloru marki
 */
export const withBrandColor = <P extends object>(
    Component: React.ComponentType<P & { brandColor: string }>
) => {
    const WithBrandColorComponent = (props: P) => {
        const { brandColor } = useBrandColorContext();

        return <Component {...props} brandColor={brandColor} />;
    };

    WithBrandColorComponent.displayName = `withBrandColor(${Component.displayName || Component.name})`;

    return WithBrandColorComponent;
};