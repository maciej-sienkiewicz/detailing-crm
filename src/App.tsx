// src/App.tsx - Updated with React Query Provider
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createGlobalStyle } from 'styled-components';
import { ToastProvider } from "./components/common/Toast/Toast";
import { AuthProvider } from './context/AuthContext';
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

// Global styles remain the same
const GlobalStyle = createGlobalStyle`
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Roboto', 'Segoe UI', 'Arial', sans-serif;
        background-color: #f8f9fa;
        color: #333;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    h1, h2, h3, h4, h5, h6 {
        margin-bottom: 0.5em;
        color: #2c3e50;
    }

    h1 {
        font-size: 24px;

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

    a {
        color: #3498db;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    button, input, select, textarea {
        font-family: inherit;
    }

    /* Additional styles for better table responsiveness */
    table {
        width: 100%;
        border-collapse: collapse;
    }

    @media (max-width: 768px) {
        .responsive-table {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
    }

    /* Better form responsiveness */
    input, select, textarea {
        max-width: 100%;
    }

    /* Better button visibility on touch devices */
    @media (max-width: 576px) {
        button {
            min-height: 44px;
        }
    }
`;

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <ToastProvider>
                    <GlobalStyle />
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                    {/* React Query DevTools - only in development */}
                    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                </ToastProvider>
            </Router>
        </QueryClientProvider>
    );
};

export default App;