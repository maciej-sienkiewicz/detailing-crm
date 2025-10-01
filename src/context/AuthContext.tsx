import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {authApi} from '../api/authApi';

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

    // Funkcja wylogowania - wyodrębniona aby móc ją używać w wielu miejscach
    const logout = React.useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        navigate('/login', { replace: true });
    }, [navigate]);

    // ✅ NOWE: Globalny listener dla storage events
    // Pozwala synchronizować wylogowanie między zakładkami przeglądarki
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // Jeśli token został usunięty w innej zakładce, wyloguj również tutaj
            if (e.key === 'auth_token' && e.newValue === null) {
                setUser(null);
                setToken(null);
                navigate('/login', { replace: true });
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [navigate]);

    // ✅ NOWE: Globalny listener dla custom event - dla komunikacji z apiClient
    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
        };

        // Nasłuchuj na custom event wysyłany przez apiClient
        window.addEventListener('unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('unauthorized', handleUnauthorized);
        };
    }, [logout]);

    // Sprawdzanie czy użytkownik jest zalogowany przy ładowaniu strony
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const storedToken = localStorage.getItem('auth_token');

                if (storedToken) {
                    // Próba pobrania zapisanego użytkownika
                    const storedUser = localStorage.getItem('auth_user');

                    if (storedUser) {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            setUser(parsedUser);
                            setToken(storedToken);

                            // ✅ OPCJONALNE: Walidacja tokenu przy starcie aplikacji
                            // Odkomentuj jeśli chcesz weryfikować token przy każdym odświeżeniu
                            /*
                            try {
                                const isValid = await authApi.validateToken();
                                if (!isValid) {
                                    console.warn('Token is invalid - logging out');
                                    logout();
                                }
                            } catch (validationError) {
                                console.warn('Token validation failed - logging out');
                                logout();
                            }
                            */
                        } catch (parseError) {
                            console.error('Error parsing stored user:', parseError);
                            // Jeśli nie można sparsować danych, wyczyść wszystko
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('auth_user');
                        }
                    } else {
                        // Jeśli mamy token, ale nie mamy danych użytkownika, wyloguj
                        console.warn('Token exists but no user data - clearing auth');
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
    }, [logout]);

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