// src/App.tsx - Fixed version without CSS variables errors
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createGlobalStyle } from 'styled-components';
import { ToastProvider } from "./components/common/Toast/Toast";
import { AuthProvider } from './context/AuthContext';
import { BrandColorProvider } from './context/BrandColorContext';
import AppRoutes from './routes';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
            retry: (failureCount, error: any) => {
                // Don't retry on authentication errors
                if (error?.status === 401 || error?.status === 403) {
                    return false;
                }
                // Retry up to 2 times for other errors
                return failureCount < 2;
            },
            refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
        },
        mutations: {
            retry: 1,
        }
    }
});

// Global styles with CSS variables (no TypeScript errors)
const GlobalStyle = createGlobalStyle`
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    :root {
        /* Brand colors - will be overridden by BrandColorProvider */
        --brand-primary: #1a365d;
        --brand-primary-light: #2c5aa0;
        --brand-primary-dark: #0f2027;
        --brand-primary-ghost: rgba(26, 54, 93, 0.08);
        --brand-primary-hover: rgba(26, 54, 93, 0.12);
        --brand-primary-active: rgba(26, 54, 93, 0.16);

        /* Surface colors */
        --surface: #ffffff;
        --surface-alt: #f8fafc;
        --surface-elevated: #f1f5f9;
        --surface-hover: #e2e8f0;

        /* Text colors */
        --text-primary: #0f172a;
        --text-secondary: #475569;
        --text-tertiary: #64748b;
        --text-muted: #94a3b8;
        --text-disabled: #cbd5e1;

        /* Border colors */
        --border: #e2e8f0;
        --border-light: #f1f5f9;
        --border-hover: #cbd5e1;

        /* Status colors */
        --status-success: #059669;
        --status-success-light: #d1fae5;
        --status-warning: #d97706;
        --status-warning-light: #fef3c7;
        --status-error: #dc2626;
        --status-error-light: #fee2e2;
        --status-info: #0ea5e9;
        --status-info-light: #e0f2fe;

        /* Shadows */
        --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

        /* Transitions */
        --transition-fast: 0.15s ease;
        --transition-normal: 0.2s ease;
        --transition-slow: 0.3s ease;
        --transition-spring: 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        /* Border radius */
        --radius-sm: 6px;
        --radius-md: 8px;
        --radius-lg: 12px;
        --radius-xl: 16px;

        /* Spacing */
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 16px;
        --spacing-lg: 24px;
        --spacing-xl: 32px;
        --spacing-xxl: 48px;
    }

    body {
        font-family: 'Roboto', 'Segoe UI', 'Arial', sans-serif;
        background-color: #f8fafc; /* fallback for var(--surface-alt) */
        color: #0f172a; /* fallback for var(--text-primary) */
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        /* Prevent flash of unstyled content */
        transition: background-color 0.2s ease;
    }

    h1, h2, h3, h4, h5, h6 {
        margin-bottom: 0.5em;
        color: #0f172a; /* fallback for var(--text-primary) */
        font-weight: 600;
        line-height: 1.2;
    }

    h1 {
        font-size: 24px;
        font-weight: 700;

        @media (max-width: 768px) {
            font-size: 22px;
        }

        @media (max-width: 576px) {
            font-size: 20px;
        }
    }

    h2 {
        font-size: 20px;

        @media (max-width: 768px) {
            font-size: 18px;
        }

        @media (max-width: 576px) {
            font-size: 16px;
        }
    }

    h3 {
        font-size: 18px;

        @media (max-width: 768px) {
            font-size: 16px;
        }
    }

    a {
        color: #1a365d; /* fallback for var(--brand-primary) */
        text-decoration: none;
        transition: color 0.15s ease;

        &:hover {
            color: #0f2027; /* fallback for var(--brand-primary-dark) */
            text-decoration: underline;
        }
    }

    button, input, select, textarea {
        font-family: inherit;
        font-size: inherit;
    }

    /* Enhanced button styles using CSS variables */
    .btn-primary {
        background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);
        color: white;
        border: 1px solid #1a365d;
        border-radius: 8px;
        padding: 8px 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            background: linear-gradient(135deg, #0f2027 0%, #1a365d 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        &:active {
            transform: translateY(0);
        }
    }

    .btn-secondary {
        background: rgba(26, 54, 93, 0.08);
        color: #1a365d;
        border: 1px solid #1a365d;
        border-radius: 8px;
        padding: 8px 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            background: rgba(26, 54, 93, 0.12);
            transform: translateY(-1px);
        }
    }

    /* Enhanced table responsiveness */
    table {
        width: 100%;
        border-collapse: collapse;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    @media (max-width: 768px) {
        .responsive-table {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;

            &::-webkit-scrollbar {
                height: 8px;
            }

            &::-webkit-scrollbar-track {
                background: #f8fafc;
            }

            &::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 4px;
            }
        }
    }

    /* Better form responsiveness */
    input, select, textarea {
        max-width: 100%;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;

        &:focus {
            outline: none;
            border-color: #1a365d;
            box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.08);
        }
    }

    /* Better button visibility on touch devices */
    @media (max-width: 576px) {
        button {
            min-height: 44px;
            font-size: 16px; /* Prevent zoom on iOS */
        }

        input, select, textarea {
            min-height: 44px;
            font-size: 16px; /* Prevent zoom on iOS */
        }
    }

    /* Loading states */
    .loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid #e2e8f0;
        border-top: 2px solid #1a365d;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Status messages */
    .error-message {
        background: #fee2e2;
        color: #dc2626;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #fecaca;
        font-weight: 500;
    }

    .success-message {
        background: #d1fae5;
        color: #166534;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #bbf7d0;
        font-weight: 500;
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* Focus management */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    /* Dynamic CSS variables support - these will be updated by BrandColorProvider */
    body:not(.loading) {
        background-color: var(--surface-alt, #f8fafc);
        color: var(--text-primary, #0f172a);
    }

    body:not(.loading) h1,
    body:not(.loading) h2,
    body:not(.loading) h3,
    body:not(.loading) h4,
    body:not(.loading) h5,
    body:not(.loading) h6 {
        color: var(--text-primary, #0f172a);
    }

    body:not(.loading) a {
        color: var(--brand-primary, #1a365d);

        &:hover {
            color: var(--brand-primary-dark, #0f2027);
        }
    }

    body:not(.loading) .btn-primary {
        background: linear-gradient(135deg, var(--brand-primary, #1a365d) 0%, var(--brand-primary-light, #2c5aa0) 100%);
        border-color: var(--brand-primary, #1a365d);

        &:hover {
            background: linear-gradient(135deg, var(--brand-primary-dark, #0f2027) 0%, var(--brand-primary, #1a365d) 100%);
        }
    }

    body:not(.loading) .btn-secondary {
        background: var(--brand-primary-ghost, rgba(26, 54, 93, 0.08));
        color: var(--brand-primary, #1a365d);
        border-color: var(--brand-primary, #1a365d);

        &:hover {
            background: var(--brand-primary-hover, rgba(26, 54, 93, 0.12));
        }
    }

    body:not(.loading) input:focus,
    body:not(.loading) select:focus,
    body:not(.loading) textarea:focus {
        border-color: var(--brand-primary, #1a365d);
        box-shadow: 0 0 0 3px var(--brand-primary-ghost, rgba(26, 54, 93, 0.08));
    }

    body:not(.loading) .loading-spinner {
        border-color: var(--border, #e2e8f0);
        border-top-color: var(--brand-primary, #1a365d);
    }
`;

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <BrandColorProvider>
                    <ToastProvider>
                        <GlobalStyle />
                        <AuthProvider>
                            <AppRoutes />
                        </AuthProvider>
                        {/* React Query DevTools - only in development */}
                        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                    </ToastProvider>
                </BrandColorProvider>
            </Router>
        </QueryClientProvider>
    );
};

export default App;