// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Typ dla użytkownika
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    role: string;
    avatar?: string;
}

// Typ dla kontekstu autoryzacji
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

// Wartości domyślne kontekstu
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: false,
    error: null,
    login: async () => {},
    logout: () => {},
    isAuthenticated: false,
});

// Własny hook do użycia kontekstu autoryzacji
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Sprawdzanie, czy użytkownik jest zalogowany przy ładowaniu aplikacji
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                // Pobierz dane użytkownika z localStorage
                const storedUser = localStorage.getItem('user');

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error('Error checking authentication:', err);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    // Funkcja logowania
    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            // W rzeczywistej aplikacji, tutaj byłoby zapytanie do backendu
            // Dla demonstracji używam symulowanego logowania

            // Symulacja opóźnienia zapytania sieciowego
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Prosty warunek logowania dla demonstracji
            if (email === 'demo@example.com' && password === 'password') {
                const userData: User = {
                    id: '1',
                    firstName: 'Jan',
                    lastName: 'Kowalski',
                    email: 'demo@example.com',
                    companyName: 'Auto Detailing Sp. z o.o.',
                    role: 'Admin'
                };

                // Zapisz dane użytkownika do localStorage
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            } else {
                throw new Error('Nieprawidłowy email lub hasło');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas logowania');
        } finally {
            setLoading(false);
        }
    };

    // Funkcja wylogowania
    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAuthenticated = !!user;

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};