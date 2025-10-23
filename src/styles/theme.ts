export const theme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',
    surfaceActive: '#f1f5f9',
    surfaceAlt: '#fafbfc',

    status: {
        success: '#059669',
        error: '#dc2626',
        errorLight: '#fee2e2'
    },

    text: {
        primary: '#0f172a',
        secondary: '#334155',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderActive: '#cbd5e1',
    borderHover: '#cbd5e1',

    success: '#059669',
    successBg: '#ecfdf5',
    warning: '#d97706',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorBg: '#fef2f2',
    info: '#0891b2',
    infoBg: '#f0f9ff',

    fontSize: {
        xs: '10px',
        sm: '11px',
        base: '12px',
        md: '13px',
        lg: '14px',
        xl: '15px',
        xxl: '16px',
        xxxl: '18px'
    },

    spacing: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px',
        xxxl: '24px'
    },

    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    radius: {
        sm: '3px',
        md: '5px',
        lg: '7px',
        xl: '9px',
        xxl: '11px'
    },

    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    },

    breakpoints: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        xxl: '1536px'
    }
} as const;

export const createCSSVariables = () => {
    return `
    :root {
      --brand-primary: ${theme.primary};
      --brand-primary-light: ${theme.primaryLight};
      --brand-primary-dark: ${theme.primaryDark};
      --brand-primary-ghost: ${theme.primaryGhost};
      
      --surface: ${theme.surface};
      --surface-elevated: ${theme.surfaceElevated};
      --surface-hover: ${theme.surfaceHover};
      --surface-active: ${theme.surfaceActive};
      
      --text-primary: ${theme.text.primary};
      --text-secondary: ${theme.text.secondary};
      --text-tertiary: ${theme.text.tertiary};
      --text-muted: ${theme.text.muted};
      
      --border: ${theme.border};
      --border-light: ${theme.borderLight};
      --border-active: ${theme.borderActive};
      
      --success: ${theme.success};
      --success-bg: ${theme.successBg};
      --warning: ${theme.warning};
      --warning-bg: ${theme.warningBg};
      --error: ${theme.error};
      --error-bg: ${theme.errorBg};
      --info: ${theme.info};
      --info-bg: ${theme.infoBg};
    }
  `;
};

export type Theme = typeof theme;