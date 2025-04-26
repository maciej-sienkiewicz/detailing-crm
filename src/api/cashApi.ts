// src/api/cashApi.ts
import { apiClient } from './apiClient';
import { CashTransaction, CashTransactionFilters, TransactionType, PaginatedResponse } from '../types/cash';

const convertSnakeToCamel = (data: any): any => {
    if (data === null || data === undefined || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => convertSnakeToCamel(item));
    }

    return Object.keys(data).reduce((result, key) => {
        // Konwertuj klucz ze snake_case na camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        // Rekurencyjnie konwertuj wartość jeśli jest obiektem
        result[camelKey] = convertSnakeToCamel(data[key]);

        return result;
    }, {} as Record<string, any>);
};

export const cashApi = {
    // Pobieranie transakcji gotówkowych z paginacją
    fetchCashTransactions: async (
        filters?: CashTransactionFilters,
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedResponse<CashTransaction>> => {
        try {
            // Przygotowanie parametrów zapytania
            const queryParams: Record<string, string> = {
                page: page.toString(),
                size: size.toString()
            };

            // Dodanie filtrów do parametrów zapytania
            if (filters) {
                if (filters.type) queryParams.type = filters.type;
                if (filters.description) queryParams.description = filters.description;
                if (filters.dateFrom) queryParams.dateFrom = filters.dateFrom;
                if (filters.dateTo) queryParams.dateTo = filters.dateTo;
                if (filters.visitId) queryParams.visitId = filters.visitId;
                if (filters.invoiceId) queryParams.invoiceId = filters.invoiceId;
                if (filters.minAmount !== undefined) queryParams.minAmount = filters.minAmount.toString();
                if (filters.maxAmount !== undefined) queryParams.maxAmount = filters.maxAmount.toString();
            }

            // Wywołanie API
            const result =await apiClient.get<any>('/cash/transactions', queryParams);
            return convertSnakeToCamel(result)
        } catch (error) {
            console.error('Error fetching cash transactions:', error);
            throw error;
        }
    },

    // Pobieranie pojedynczej transakcji
    fetchCashTransactionById: async (id: string): Promise<CashTransaction | null> => {
        try {
            return await apiClient.get<CashTransaction>(`/cash/transactions/${id}`);
        } catch (error) {
            console.error(`Error fetching cash transaction ${id}:`, error);
            return null;
        }
    },

    // Dodawanie nowej transakcji
    createCashTransaction: async (transaction: Omit<CashTransaction, 'id' | 'createdAt' | 'createdBy'>): Promise<CashTransaction> => {
        try {
            return await apiClient.post<CashTransaction>('/cash/transactions', transaction);
        } catch (error) {
            console.error('Error creating cash transaction:', error);
            throw error;
        }
    },

    // Aktualizacja transakcji
    updateCashTransaction: async (id: string, transaction: Omit<CashTransaction, 'id' | 'createdAt' | 'createdBy'>): Promise<CashTransaction> => {
        try {
            return await apiClient.put<CashTransaction>(`/cash/transactions/${id}`, transaction);
        } catch (error) {
            console.error(`Error updating cash transaction ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie transakcji
    deleteCashTransaction: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/cash/transactions/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting cash transaction ${id}:`, error);
            return false;
        }
    },

    // Pobranie aktualnego stanu kasy
    getCashBalance: async (): Promise<number> => {
        try {
            const response = await apiClient.get<{balance: number, date: string}>('/cash/balance');
            return response.balance;
        } catch (error) {
            console.error('Error fetching cash balance:', error);
            throw error;
        }
    },

    // Pobieranie statystyk dla bieżącego miesiąca
    getMonthlyStatistics: async (): Promise<{income: number, expense: number}> => {
        try {
            const response = await apiClient.get<any>('/cash/statistics/current-month');
            return {
                income: response.income,
                expense: response.expense
            };
        } catch (error) {
            console.error('Error fetching monthly statistics:', error);
            throw error;
        }
    },

    // Pobieranie statystyk dla określonego okresu
    getStatisticsForPeriod: async (startDate: string, endDate: string): Promise<any> => {
        try {
            return await apiClient.get<any>('/cash/statistics', {
                startDate,
                endDate
            });
        } catch (error) {
            console.error('Error fetching statistics for period:', error);
            throw error;
        }
    }
};