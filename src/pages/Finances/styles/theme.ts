// src/pages/Finances/styles/theme.ts
// Professional Brand Theme - Premium Automotive CRM
export const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },

    // Financial specific colors
    financial: {
        income: '#059669',
        incomeLight: '#d1fae5',
        expense: '#dc2626',
        expenseLight: '#fee2e2',
        neutral: '#64748b',
        neutralLight: '#f1f5f9'
    },

    // Document type colors
    documentTypes: {
        invoice: {
            primary: '#3498db',
            light: '#ebf5fb',
            border: 'rgba(52, 152, 219, 0.3)'
        },
        receipt: {
            primary: '#2ecc71',
            light: '#eafaf1',
            border: 'rgba(46, 204, 113, 0.3)'
        },
        other: {
            primary: '#95a5a6',
            light: '#f4f6f7',
            border: 'rgba(149, 165, 166, 0.3)'
        }
    },

    // Transitions
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    },

    // Z-index scale - FIXED: Increased modal z-index values
    zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        modalEdit: 1060, // Added higher z-index for edit modals
        popover: 1070,
        tooltip: 1080
    },

    // Breakpoints
    breakpoints: {
        xs: '480px',
        sm: '768px',
        md: '992px',
        lg: '1200px',
        xl: '1400px'
    }
};