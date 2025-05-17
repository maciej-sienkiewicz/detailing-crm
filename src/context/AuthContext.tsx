import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

// Definicja typu danych użytkownika
export interface User {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    companyId: number;
    companyName?: string;
    role?: string;
    roles: string[];
    avatar?: string; // Opcjonalny URL do avatara
}

// Interfejs kontekstu autentykacji
interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

// Utworzenie kontekstu autentykacji
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Własny hook do łatwego używania kontekstu autentykacji
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Sprawdzanie czy użytkownik jest zalogowany przy ładowaniu strony
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const storedToken = localStorage.getItem('auth_token');

                if (storedToken) {
                    // Próba pobrania zapisanego użytkownika
                    const storedUser = localStorage.getItem('auth_user');

                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                        setToken(storedToken);
                    } else {
                        // Jeśli mamy token, ale nie mamy danych użytkownika, wyloguj
                        localStorage.removeItem('auth_token');
                    }
                }
            } catch (err) {
                console.error('Error checking authentication status:', err);
                // W przypadku błędu, wyczyść dane logowania
                setUser(null);
                setToken(null);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            } finally {
                setLoading(false);
            }
        };

        checkLoginStatus();
    }, []);

    // Funkcja logowania
    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);

            // Wywołaj API logowania
            const response = await authApi.login(email, password);

            if (response) {
                // Zapisz token i dane użytkownika
                localStorage.setItem('auth_token', response.token);

                // Tworzenie obiektu użytkownika na podstawie odpowiedzi z serwera
                const userData: User = {
                    userId: response.userId,
                    username: response.username,
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    companyId: response.companyId,
                    companyName: response.companyName || 'Detailing Studio',
                    roles: response.roles || []
                };

                localStorage.setItem('auth_user', JSON.stringify(userData));

                setUser(userData);
                setToken(response.token);
            }
        } catch (err: any) {
            console.error('Login error:', err);

            const errorMessage = err.message || 'Nieprawidłowy login lub hasło';
            setError(errorMessage);

            throw err; // Re-throw the error to be caught by the component
        } finally {
            setLoading(false);
        }
    };

    // Funkcja wylogowania
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        navigate('/login');
    };

    // Funkcja czyszczenia błędów
    const clearError = () => {
        setError(null);
    };

    // Wartości dostarczane przez kontekst
    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        logout,
        clearError
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};