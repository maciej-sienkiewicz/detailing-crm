// src/components/ProtectedRoute.tsx
import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import Layout from './layout/Layout';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Wyświetl placeholder ładowania, jeśli jeszcze sprawdzamy stan autoryzacji
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#f8f9fa'
            }}>
                <div>
                    <div style={{
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        margin: '0 auto',
                        border: '3px solid #f3f3f3',
                        borderTop: '3px solid #3498db',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: '20px', color: '#7f8c8d' }}>Ładowanie...</p>
                </div>
                <style>
                    {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
                </style>
            </div>
        );
    }

    // Przekieruj na stronę logowania, jeśli użytkownik nie jest zalogowany
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Jeśli użytkownik jest zalogowany, renderuj dzieci (chronioną zawartość) wewnątrz Layout
    return (
        <Layout>
            {children || <Outlet />}
        </Layout>
    );
};

export default ProtectedRoute;