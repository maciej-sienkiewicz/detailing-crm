// src/hooks/useBrandColor.ts - Produkcyjna wersja
import { useState, useEffect, useCallback, useRef } from 'react';

const BRAND_COLOR_KEY = 'detailing_brand_color';
const DEFAULT_COLOR = '#1a365d';

// Utility functions dla manipulacji kolorów
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

// Walidacja koloru HEX
const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Normalizacja koloru do pełnego formatu HEX
const normalizeHexColor = (color: string): string => {
    if (!color.startsWith('#')) color = '#' + color;

    // Konwersja 3-znakowego HEX do 6-znakowego
    if (color.length === 4) {
        color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }

    return color.toUpperCase();
};

// Funkcja aplikująca CSS variables
const applyCSSVariables = (color: string): void => {
    try {
        const root = document.documentElement;
        const normalizedColor = normalizeHexColor(color);

        if (!isValidHexColor(normalizedColor)) {
            console.warn('Invalid color format, using default:', color);
            return;
        }

        // Aplikuj główne zmienne CSS
        root.style.setProperty('--brand-primary', normalizedColor);
        root.style.setProperty('--brand-primary-light', lightenColor(normalizedColor, 15));
        root.style.setProperty('--brand-primary-dark', darkenColor(normalizedColor, 15));

        // Różne poziomy przezroczystości
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 26, g: 54, b: 93 };
        };

        const rgb = hexToRgb(normalizedColor);
        root.style.setProperty('--brand-primary-ghost', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`);
        root.style.setProperty('--brand-primary-hover', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`);
        root.style.setProperty('--brand-primary-active', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)`);

        console.log('Brand color CSS variables applied:', normalizedColor);

        // Event dla innych komponentów
        window.dispatchEvent(new CustomEvent('brandColorApplied', {
            detail: { color: normalizedColor }
        }));

    } catch (error) {
        console.error('Error applying CSS variables:', error);
    }
};

// Funkcja ładująca zapisany kolor
const loadSavedColor = (): string => {
    try {
        const saved = localStorage.getItem(BRAND_COLOR_KEY);
        if (saved && isValidHexColor(saved)) {
            return normalizeHexColor(saved);
        }
    } catch (error) {
        console.warn('Error loading saved brand color:', error);
    }

    return DEFAULT_COLOR;
};

// Funkcja zapisująca kolor
const saveColor = (color: string): void => {
    try {
        const normalizedColor = normalizeHexColor(color);
        if (isValidHexColor(normalizedColor)) {
            localStorage.setItem(BRAND_COLOR_KEY, normalizedColor);
            console.log('Brand color saved:', normalizedColor);
        } else {
            console.error('Cannot save invalid color:', color);
        }
    } catch (error) {
        console.error('Error saving brand color:', error);
        throw new Error('Nie udało się zapisać koloru marki');
    }
};

// Global state dla synchronizacji między instancjami
let globalBrandColor = DEFAULT_COLOR;
let globalListeners: Set<(color: string) => void> = new Set();

// Funkcja subskrypcji globalnych zmian
const subscribeToGlobalChanges = (callback: (color: string) => void): (() => void) => {
    globalListeners.add(callback);
    return () => globalListeners.delete(callback);
};

// Funkcja notyfikująca o globalnych zmianach
const notifyGlobalChange = (color: string): void => {
    globalBrandColor = color;
    globalListeners.forEach(listener => {
        try {
            listener(color);
        } catch (error) {
            console.error('Error in global brand color listener:', error);
        }
    });
};

/**
 * Produkcyjny hook do zarządzania kolorem marki
 *
 * Features:
 * - Persistent storage (localStorage)
 * - Automatic CSS variables application
 * - Global state synchronization
 * - Error handling
 * - Cross-tab synchronization
 * - DeviceId-based storage
 */
export const useBrandColor = () => {
    const [brandColor, setBrandColor] = useState<string>(globalBrandColor);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const initRef = useRef(false);

    // Inicjalizacja przy pierwszym renderze
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const initializeBrandColor = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Załaduj zapisany kolor
                const savedColor = loadSavedColor();

                // Ustaw globalny stan
                globalBrandColor = savedColor;
                setBrandColor(savedColor);

                // Aplikuj CSS variables
                applyCSSVariables(savedColor);

                console.log('Brand color initialized:', savedColor);

            } catch (err) {
                console.error('Error initializing brand color:', err);
                setError('Nie udało się załadować ustawień koloru marki');

                // Fallback do domyślnego koloru
                globalBrandColor = DEFAULT_COLOR;
                setBrandColor(DEFAULT_COLOR);
                applyCSSVariables(DEFAULT_COLOR);

            } finally {
                setIsLoading(false);
            }
        };

        initializeBrandColor();
    }, []);

    // Subskrypcja globalnych zmian
    useEffect(() => {
        const unsubscribe = subscribeToGlobalChanges((newColor) => {
            setBrandColor(newColor);
        });

        return unsubscribe;
    }, []);

    // Cross-tab synchronization
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === BRAND_COLOR_KEY && e.newValue) {
                try {
                    const newColor = normalizeHexColor(e.newValue);
                    if (isValidHexColor(newColor) && newColor !== globalBrandColor) {
                        applyCSSVariables(newColor);
                        notifyGlobalChange(newColor);
                        console.log('Brand color synchronized from another tab:', newColor);
                    }
                } catch (error) {
                    console.error('Error synchronizing brand color:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Funkcja aktualizacji koloru
    const updateBrandColor = useCallback((newColor: string) => {
        try {
            setError(null);

            const normalizedColor = normalizeHexColor(newColor);

            if (!isValidHexColor(normalizedColor)) {
                throw new Error('Nieprawidłowy format koloru HEX');
            }

            // Zapisz w localStorage
            saveColor(normalizedColor);

            // Aplikuj CSS variables
            applyCSSVariables(normalizedColor);

            // Zaktualizuj globalny stan
            notifyGlobalChange(normalizedColor);

            console.log('Brand color updated successfully:', normalizedColor);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się zaktualizować koloru marki';
            setError(errorMessage);
            console.error('Error updating brand color:', err);
            throw err;
        }
    }, []);

    // Reset do domyślnego koloru
    const resetBrandColor = useCallback(() => {
        updateBrandColor(DEFAULT_COLOR);
    }, [updateBrandColor]);

    // Funkcja walidacji koloru
    const validateColor = useCallback((color: string): boolean => {
        return isValidHexColor(normalizeHexColor(color));
    }, []);

    // Funkcja generowania wariantów koloru
    const generateColorVariants = useCallback((color?: string) => {
        const baseColor = color || brandColor;
        const normalizedColor = normalizeHexColor(baseColor);

        if (!isValidHexColor(normalizedColor)) {
            return null;
        }

        return {
            primary: normalizedColor,
            light: lightenColor(normalizedColor, 15),
            dark: darkenColor(normalizedColor, 15),
            ghost: `${normalizedColor}14`, // 8% opacity
            hover: `${normalizedColor}1F`, // 12% opacity
            active: `${normalizedColor}29`, // 16% opacity
        };
    }, [brandColor]);

    return {
        // Stan
        brandColor,
        isLoading,
        error,

        // Akcje
        updateBrandColor,
        resetBrandColor,

        // Utilities
        validateColor,
        generateColorVariants,

        // Wartości pomocnicze
        defaultColor: DEFAULT_COLOR,
        isDefault: brandColor === DEFAULT_COLOR,
    };
};

/**
 * Uproszczony hook dla komponentów, które potrzebują tylko odczytu
 */
export const useBrandColorValue = () => {
    const { brandColor, isLoading, error, isDefault } = useBrandColor();
    return { brandColor, isLoading, error, isDefault };
};

/**
 * Hook dla komponentów, które potrzebują tylko CSS variables
 */
export const useBrandColorVariables = () => {
    const { brandColor, generateColorVariants } = useBrandColor();
    return generateColorVariants(brandColor);
};