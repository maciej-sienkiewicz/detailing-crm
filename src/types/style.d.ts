// src/types/styled.d.ts - TypeScript definitions for CSS variables
import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        // Brand colors
        brandPrimary: string;
        brandPrimaryLight: string;
        brandPrimaryDark: string;
        brandPrimaryGhost: string;
        brandPrimaryHover: string;
        brandPrimaryActive: string;

        // Surface colors
        surface: string;
        surfaceAlt: string;
        surfaceElevated: string;
        surfaceHover: string;

        // Text colors
        textPrimary: string;
        textSecondary: string;
        textTertiary: string;
        textMuted: string;
        textDisabled: string;

        // Border colors
        border: string;
        borderLight: string;
        borderHover: string;

        // Status colors
        statusSuccess: string;
        statusSuccessLight: string;
        statusWarning: string;
        statusWarningLight: string;
        statusError: string;
        statusErrorLight: string;
        statusInfo: string;
        statusInfoLight: string;

        // Shadows
        shadowXs: string;
        shadowSm: string;
        shadowMd: string;
        shadowLg: string;
        shadowXl: string;

        // Transitions
        transitionFast: string;
        transitionNormal: string;
        transitionSlow: string;
        transitionSpring: string;

        // Border radius
        radiusSm: string;
        radiusMd: string;
        radiusLg: string;
        radiusXl: string;

        // Spacing
        spacingXs: string;
        spacingSm: string;
        spacingMd: string;
        spacingLg: string;
        spacingXl: string;
        spacingXxl: string;
    }
}

// CSS Variables helper functions
export const cssVar = (variable: string): string => `var(${variable})`;

// Pre-defined CSS variables for better IntelliSense
export const CSSVariables = {
    // Brand colors
    brandPrimary: 'var(--brand-primary)',
    brandPrimaryLight: 'var(--brand-primary-light)',
    brandPrimaryDark: 'var(--brand-primary-dark)',
    brandPrimaryGhost: 'var(--brand-primary-ghost)',
    brandPrimaryHover: 'var(--brand-primary-hover)',
    brandPrimaryActive: 'var(--brand-primary-active)',

    // Surface colors
    surface: 'var(--surface)',
    surfaceAlt: 'var(--surface-alt)',
    surfaceElevated: 'var(--surface-elevated)',
    surfaceHover: 'var(--surface-hover)',

    // Text colors
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textTertiary: 'var(--text-tertiary)',
    textMuted: 'var(--text-muted)',
    textDisabled: 'var(--text-disabled)',

    // Border colors
    border: 'var(--border)',
    borderLight: 'var(--border-light)',
    borderHover: 'var(--border-hover)',

    // Status colors
    statusSuccess: 'var(--status-success)',
    statusSuccessLight: 'var(--status-success-light)',
    statusWarning: 'var(--status-warning)',
    statusWarningLight: 'var(--status-warning-light)',
    statusError: 'var(--status-error)',
    statusErrorLight: 'var(--status-error-light)',
    statusInfo: 'var(--status-info)',
    statusInfoLight: 'var(--status-info-light)',

    // Shadows
    shadowXs: 'var(--shadow-xs)',
    shadowSm: 'var(--shadow-sm)',
    shadowMd: 'var(--shadow-md)',
    shadowLg: 'var(--shadow-lg)',
    shadowXl: 'var(--shadow-xl)',

    // Transitions
    transitionFast: 'var(--transition-fast)',
    transitionNormal: 'var(--transition-normal)',
    transitionSlow: 'var(--transition-slow)',
    transitionSpring: 'var(--transition-spring)',

    // Border radius
    radiusSm: 'var(--radius-sm)',
    radiusMd: 'var(--radius-md)',
    radiusLg: 'var(--radius-lg)',
    radiusXl: 'var(--radius-xl)',

    // Spacing
    spacingXs: 'var(--spacing-xs)',
    spacingSm: 'var(--spacing-sm)',
    spacingMd: 'var(--spacing-md)',
    spacingLg: 'var(--spacing-lg)',
    spacingXl: 'var(--spacing-xl)',
    spacingXxl: 'var(--spacing-xxl)',
} as const;

// Theme object for styled-components ThemeProvider (optional)
export const defaultTheme = {
    brandPrimary: CSSVariables.brandPrimary,
    brandPrimaryLight: CSSVariables.brandPrimaryLight,
    brandPrimaryDark: CSSVariables.brandPrimaryDark,
    brandPrimaryGhost: CSSVariables.brandPrimaryGhost,
    brandPrimaryHover: CSSVariables.brandPrimaryHover,
    brandPrimaryActive: CSSVariables.brandPrimaryActive,

    surface: CSSVariables.surface,
    surfaceAlt: CSSVariables.surfaceAlt,
    surfaceElevated: CSSVariables.surfaceElevated,
    surfaceHover: CSSVariables.surfaceHover,

    textPrimary: CSSVariables.textPrimary,
    textSecondary: CSSVariables.textSecondary,
    textTertiary: CSSVariables.textTertiary,
    textMuted: CSSVariables.textMuted,
    textDisabled: CSSVariables.textDisabled,

    border: CSSVariables.border,
    borderLight: CSSVariables.borderLight,
    borderHover: CSSVariables.borderHover,

    statusSuccess: CSSVariables.statusSuccess,
    statusSuccessLight: CSSVariables.statusSuccessLight,
    statusWarning: CSSVariables.statusWarning,
    statusWarningLight: CSSVariables.statusWarningLight,
    statusError: CSSVariables.statusError,
    statusErrorLight: CSSVariables.statusErrorLight,
    statusInfo: CSSVariables.statusInfo,
    statusInfoLight: CSSVariables.statusInfoLight,

    shadowXs: CSSVariables.shadowXs,
    shadowSm: CSSVariables.shadowSm,
    shadowMd: CSSVariables.shadowMd,
    shadowLg: CSSVariables.shadowLg,
    shadowXl: CSSVariables.shadowXl,

    transitionFast: CSSVariables.transitionFast,
    transitionNormal: CSSVariables.transitionNormal,
    transitionSlow: CSSVariables.transitionSlow,
    transitionSpring: CSSVariables.transitionSpring,

    radiusSm: CSSVariables.radiusSm,
    radiusMd: CSSVariables.radiusMd,
    radiusLg: CSSVariables.radiusLg,
    radiusXl: CSSVariables.radiusXl,

    spacingXs: CSSVariables.spacingXs,
    spacingSm: CSSVariables.spacingSm,
    spacingMd: CSSVariables.spacingMd,
    spacingLg: CSSVariables.spacingLg,
    spacingXl: CSSVariables.spacingXl,
    spacingXxl: CSSVariables.spacingXxl,
};