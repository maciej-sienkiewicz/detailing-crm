// src/api/balanceOverrideApi.ts
import { apiClientNew } from './apiClientNew';

export enum BalanceType {
    CASH = 'CASH',
    BANK = 'BANK'
}

export interface CashMoveRequest {
    amount: number;
    description: string;
}

export interface BankReconciliationRequest {
    statementBalance: number;
    description: string;
}

export interface CashInventoryRequest {
    countedAmount: number;
    notes: string;
}

export interface ManualOverrideRequest {
    balanceType: BalanceType;
    newBalance: number;
    description: string;
}

export interface BalanceOverrideResult {
    success: boolean;
    operationId?: number;
    previousBalance?: number;
    newBalance: number;
    difference?: number;
    message: string;
    error?: string;
    pendingApprovalId?: string;
}

export interface CompanyBalance {
    companyId: number;
    cashBalance: number;
    bankBalance: number;
    lastUpdated: string;
    version: number;
}

// Historia zmian sald
export interface BalanceHistoryResponse {
    operationId: number;
    balanceType: string;
    balanceBefore: number;
    balanceAfter: number;
    amountChanged: number;
    operationType: string;
    operationDescription: string;
    documentId?: string;
    userId: string;
    timestamp: string;
    ipAddress?: string;
    relatedOperationId?: number;
}

export interface BalanceHistoryPageResponse {
    content: BalanceHistoryResponse[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isFirst: boolean;
    isLast: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Spring Data Page format dla kompatybilności z backend
export interface SpringPageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

export interface BalanceStatisticsResponse {
    periodStart: string;
    periodEnd: string;
    balanceType: string;
    totalOperations: number;
    totalAmountChanged: number;
    positiveChangesCount: number;
    negativeChangesCount: number;
    startBalance: number;
    endBalance: number;
    netChange: number;
    averageOperationSize: number;
}

export interface LastOperationResponse {
    hasOperations: boolean;
    lastOperation?: BalanceHistoryResponse;
}

export interface BalanceHistorySearchRequest {
    balanceType?: string;
    userId?: string;
    documentId?: string;
    startDate?: string;
    endDate?: string;
    searchText?: string;
    page?: number;
    size?: number;
}

export const balanceOverrideApi = {
    // Pobieranie aktualnych sald
    getCurrentBalances: async (): Promise<CompanyBalance> => {
        try {
            return await apiClientNew.get<CompanyBalance>('/financial-documents/current');
        } catch (error) {
            console.error('Error fetching current balances:', error);
            throw error;
        }
    },

    // Przeniesienie gotówki do sejfu
    moveCashToSafe: async (request: CashMoveRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClientNew.post<BalanceOverrideResult>('/balance-override/cash/to-safe', request);
        } catch (error) {
            console.error('Error moving cash to safe:', error);
            throw error;
        }
    },

    // Pobranie gotówki z sejfu
    moveCashFromSafe: async (request: CashMoveRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClientNew.post<BalanceOverrideResult>('/balance-override/cash/from-safe', request);
        } catch (error) {
            console.error('Error moving cash from safe:', error);
            throw error;
        }
    },

    // Uzgodnienie z wyciągiem bankowym
    reconcileWithBankStatement: async (request: BankReconciliationRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClientNew.post<BalanceOverrideResult>('/balance-override/bank/reconcile', request);
        } catch (error) {
            console.error('Error reconciling with bank statement:', error);
            throw error;
        }
    },

    // Inwentaryzacja kasy
    performCashInventory: async (request: CashInventoryRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClientNew.post<BalanceOverrideResult>('/balance-override/cash/inventory', request);
        } catch (error) {
            console.error('Error performing cash inventory:', error);
            throw error;
        }
    },

    // Manualne nadpisanie salda
    manualOverride: async (request: ManualOverrideRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClientNew.post<BalanceOverrideResult>('/balance-override/manual', request);
        } catch (error) {
            console.error('Error performing manual override:', error);
            throw error;
        }
    },

    // Historia zmian sald
    getBalanceHistory: async (
        filters?: BalanceHistorySearchRequest,
        page: number = 0,
        size: number = 20
    ): Promise<SpringPageResponse<BalanceHistoryResponse>> => {
        try {
            const params = {
                ...filters,
                page,
                size
            };
            return await apiClientNew.get<SpringPageResponse<BalanceHistoryResponse>>('/balance-override/history', params);
        } catch (error) {
            console.error('Error fetching balance history:', error);
            throw error;
        }
    },

    // Historia zmian dla konkretnego typu salda
    getBalanceHistoryByType: async (
        balanceType: BalanceType,
        page: number = 0,
        size: number = 20
    ): Promise<any> => { // Backend zwraca Page<BalanceHistoryEntity>, nie Response
        try {
            const params = { page, size };
            return await apiClientNew.get<any>(`/balance-override/history/${balanceType}`, params);
        } catch (error) {
            console.error('Error fetching balance history by type:', error);
            throw error;
        }
    },

    // Historia zmian dla konkretnego dokumentu
    getBalanceHistoryByDocument: async (documentId: string): Promise<any[]> => { // Backend zwraca List<BalanceHistoryEntity>
        try {
            return await apiClientNew.get<any[]>(`/balance-override/history/document/${documentId}`);
        } catch (error) {
            console.error('Error fetching balance history by document:', error);
            throw error;
        }
    },

    // Statystyki zmian sald
    getBalanceStatistics: async (
        balanceType: BalanceType,
        startDate: string,
        endDate: string
    ): Promise<any> => { // Backend zwraca BalanceStatistics, nie Response
        try {
            const params = { startDate, endDate };
            return await apiClientNew.get<any>(`/balance-override/statistics/${balanceType}`, params);
        } catch (error) {
            console.error('Error fetching balance statistics:', error);
            throw error;
        }
    },

    // Ostatnia operacja dla typu salda
    getLastOperation: async (balanceType: BalanceType): Promise<any> => { // Backend zwraca BalanceHistoryEntity?, nie Response
        try {
            return await apiClientNew.get<any>(`/balance-override/history/last/${balanceType}`);
        } catch (error) {
            console.error('Error fetching last operation:', error);
            throw error;
        }
    }
};