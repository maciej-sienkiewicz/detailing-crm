// src/api/cashApi.ts
import {apiClient, PaginatedResponse} from './apiClient';
import {CashTransaction, CashTransactionFilters} from '../types/cash';

/**
 * API do zarządzania transakcjami gotówkowymi
 */
export const cashApi = {
    // Pobieranie transakcji gotówkowych z paginacją
    fetchCashTransactions: async (
        filters?: CashTransactionFilters,
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedResponse<CashTransaction>> => {
        try {
            return await apiClient.getWithPagination<CashTransaction>(
                '/cash/transactions',
                filters || {},  // Przekazujemy filtry jako query params
                { page, size }  // Opcje paginacji
            );
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
            return await apiClient.get<{income: number, expense: number}>('/cash/statistics/current-month');
        } catch (error) {
            console.error('Error fetching monthly statistics:', error);
            throw error;
        }
    },

    // Pobieranie statystyk dla określonego okresu
    getStatisticsForPeriod: async (startDate: string, endDate: string): Promise<any> => {
        try {
            return await apiClient.get<any>('/cash/statistics', { startDate, endDate });
        } catch (error) {
            console.error('Error fetching statistics for period:', error);
            throw error;
        }
    }
};