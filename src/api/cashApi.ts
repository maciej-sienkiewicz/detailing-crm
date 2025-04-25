// src/api/cashApi.ts
import { apiClient } from './apiClient';
import { CashTransaction, CashTransactionFilters, TransactionType, PaginatedResponse } from '../types/cash';

// Tymczasowe dane dla mockowania API
const generateMockTransactions = (): CashTransaction[] => {
    const transactions: CashTransaction[] = [];
    const currentDate = new Date();

    // Generowanie 80 transakcji z ostatnich 60 dni (więcej transakcji dla testowania paginacji)
    for (let i = 0; i < 80; i++) {
        const date = new Date();
        date.setDate(currentDate.getDate() - (i % 60));

        const isIncome = i % 3 === 0;
        const amount = Math.round((100 + Math.random() * 1000) * 100) / 100;

        transactions.push({
            id: `trans-${1000 + i}`,
            type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
            description: isIncome
                ? `Płatność za usługę detailingową ${i % 5 === 0 ? 'Premium' : 'Standard'}`
                : `Wypłata na ${i % 4 === 0 ? 'materiały eksploatacyjne' : 'wydatki bieżące'}`,
            date: date.toISOString(),
            visitId: isIncome ? `visit-${900 + i}` : undefined,
            visitNumber: isIncome ? `WIZ/${date.getFullYear()}/${100 + i}` : undefined,
            amount: amount,
            createdAt: new Date(date.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 godziny przed datą transakcji
            createdBy: `user-${1 + (i % 3)}`
        });
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Mock dla aktualnego stanu kasy
const getCurrentCashBalance = (): number => {
    const transactions = generateMockTransactions();
    return transactions.reduce((balance, transaction) => {
        return balance + (transaction.type === TransactionType.INCOME ? transaction.amount : -transaction.amount);
    }, 1000); // Początkowy stan kasy
};

export const cashApi = {
    // Pobieranie transakcji gotówkowych z paginacją
    fetchCashTransactions: async (
        filters?: CashTransactionFilters,
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<CashTransaction>> => {
        // W rzeczywistej implementacji użylibyśmy apiClient
        // return await apiClient.get<PaginatedResponse<CashTransaction>>('/cash/transactions', {
        //    ...filters,
        //    page,
        //    pageSize
        // });

        // Tymczasowo używamy zamockowanych danych
        const mockTransactions = generateMockTransactions();

        // Filtrowanie wyników według kryteriów
        let filteredTransactions = [...mockTransactions];

        if (filters) {
            if (filters.type) {
                filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
            }

            if (filters.description) {
                filteredTransactions = filteredTransactions.filter(t =>
                    t.description.toLowerCase().includes(filters.description!.toLowerCase())
                );
            }

            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom).getTime();
                filteredTransactions = filteredTransactions.filter(t =>
                    new Date(t.date).getTime() >= fromDate
                );
            }

            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo).setHours(23, 59, 59, 999);
                filteredTransactions = filteredTransactions.filter(t =>
                    new Date(t.date).getTime() <= toDate
                );
            }

            if (filters.visitId) {
                filteredTransactions = filteredTransactions.filter(t =>
                    t.visitId === filters.visitId
                );
            }

            if (filters.minAmount !== undefined) {
                filteredTransactions = filteredTransactions.filter(t =>
                    t.amount >= filters.minAmount!
                );
            }

            if (filters.maxAmount !== undefined) {
                filteredTransactions = filteredTransactions.filter(t =>
                    t.amount <= filters.maxAmount!
                );
            }
        }

        // Obliczenia dla paginacji
        const totalItems = filteredTransactions.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

        // Symulacja opóźnienia sieciowego
        await new Promise(resolve => setTimeout(resolve, 300));

        return {
            data: paginatedTransactions,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            }
        };
    },

    // Pobieranie pojedynczej transakcji
    fetchCashTransactionById: async (id: string): Promise<CashTransaction | null> => {
        // W rzeczywistej implementacji: return await apiClient.get<CashTransaction>(`/cash/transactions/${id}`);

        const mockTransactions = generateMockTransactions();
        const transaction = mockTransactions.find(t => t.id === id);
        return transaction || null;
    },

    // Dodawanie nowej transakcji
    createCashTransaction: async (transaction: Omit<CashTransaction, 'id' | 'createdAt' | 'createdBy'>): Promise<CashTransaction> => {
        // W rzeczywistej implementacji: return await apiClient.post<CashTransaction>('/cash/transactions', transaction);

        // Symulacja odpowiedzi serwera
        return {
            ...transaction,
            id: `trans-${Math.floor(Math.random() * 10000)}`,
            createdAt: new Date().toISOString(),
            createdBy: 'current-user'
        };
    },

    // Usuwanie transakcji
    deleteCashTransaction: async (id: string): Promise<boolean> => {
        // W rzeczywistej implementacji: await apiClient.delete(`/cash/transactions/${id}`);

        // Symulacja odpowiedzi serwera
        return true;
    },

    // Pobranie aktualnego stanu kasy
    getCashBalance: async (): Promise<number> => {
        // W rzeczywistej implementacji: return await apiClient.get<number>('/cash/balance');

        // Symulacja odpowiedzi serwera
        return getCurrentCashBalance();
    },

    // Pobieranie statystyk dla bieżącego miesiąca
    getMonthlyStatistics: async (): Promise<{income: number, expense: number}> => {
        // W rzeczywistej implementacji: return await apiClient.get<{income: number, expense: number}>('/cash/statistics/monthly');

        // Symulacja odpowiedzi - obliczenie na podstawie transakcji z bieżącego miesiąca
        const transactions = generateMockTransactions();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const monthlyTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear;
        });

        const income = monthlyTransactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthlyTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        return { income, expense };
    }
};