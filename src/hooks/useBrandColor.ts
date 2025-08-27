// src/hooks/useBrandColor.ts
import { useState, useEffect, useCallback } from 'react';

const BRAND_COLOR_KEY = 'brand_color_preference';
const DEFAULT_COLOR = '#1a365d';

// Color utilities
const lightenColor = (color: string, percent: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * (1 + percent / 100)));
    const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * (1 + percent / 100)));
    const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * (1 + percent / 100)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const darkenColor = (color: string, percent: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - percent / 100)));
    const g = Math.max(0, Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - percent / 100)));
    const b = Math.max(0, Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - percent / 100)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Apply CSS custom properties
const applyCSSVariables = (color: string) => {
    const root = document.documentElement;

    root.style.setProperty('--brand-primary', color);
    root.style.setProperty('--brand-primary-light', lightenColor(color, 15));
    root.style.setProperty('--brand-primary-dark', darkenColor(color, 15));
    root.style.setProperty('--brand-primary-ghost', `${color}0D`); // 5% opacity

    console.log('Applied brand color:', color);
};

/**
 * Simple hook for managing brand color with localStorage persistence
 * Automatically applies CSS custom properties on color changes
 */
export const useBrandColor = () => {
    const [brandColor, setBrandColor] = useState<string>(DEFAULT_COLOR);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved color on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(BRAND_COLOR_KEY);
            const color = saved || DEFAULT_COLOR;

            setBrandColor(color);
            applyCSSVariables(color);
            setIsLoading(false);

            console.log('Loaded brand color from localStorage:', color);
        } catch (error) {
            console.warn('Failed to load brand color from localStorage:', error);
            setBrandColor(DEFAULT_COLOR);
            applyCSSVariables(DEFAULT_COLOR);
            setIsLoading(false);
        }
    }, []);

    // Update color and persist
    const updateBrandColor = useCallback((newColor: string) => {
        try {
            setBrandColor(newColor);
            localStorage.setItem(BRAND_COLOR_KEY, newColor);
            applyCSSVariables(newColor);

            // Dispatch event for other components/tabs
            window.dispatchEvent(new CustomEvent('brandColorChanged', {
                detail: { color: newColor }
            }));

            console.log('Updated brand color:', newColor);
        } catch (error) {
            console.error('Failed to save brand color:', error);
        }
    }, []);

    // Listen for color changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === BRAND_COLOR_KEY && e.newValue) {
                setBrandColor(e.newValue);
                applyCSSVariables(e.newValue);
                console.log('Brand color updated from another tab:', e.newValue);
            }
        };

        const handleCustomColorChange = (e: CustomEvent) => {
            const newColor = e.detail.color;
            if (newColor !== brandColor) {
                setBrandColor(newColor);
                applyCSSVariables(newColor);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('brandColorChanged', handleCustomColorChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('brandColorChanged', handleCustomColorChange as EventListener);
        };
    }, [brandColor]);

    // Reset to default
    const resetBrandColor = useCallback(() => {
        updateBrandColor(DEFAULT_COLOR);
    }, [updateBrandColor]);

    return {
        brandColor,
        isLoading,
        updateBrandColor,
        resetBrandColor,
        defaultColor: DEFAULT_COLOR
    };
};

/**
 * Simple hook that only returns current brand color - for components that just need the value
 */
export const useBrandColorValue = () => {
    const { brandColor, isLoading } = useBrandColor();
    return { brandColor, isLoading };
};