// src/api/balanceOverrideApi.ts
import { apiClient } from './apiClient';

export enum BalanceType {
    CASH = 'CASH',
    BANK = 'BANK'
}

export enum OverrideReason {
    CASH_TO_SAFE = 'CASH_TO_SAFE',
    CASH_FROM_SAFE = 'CASH_FROM_SAFE',
    BANK_STATEMENT_RECONCILIATION = 'BANK_STATEMENT_RECONCILIATION',
    INVENTORY_COUNT = 'INVENTORY_COUNT',
    ERROR_CORRECTION = 'ERROR_CORRECTION',
    EXTERNAL_PAYMENT = 'EXTERNAL_PAYMENT',
    MANAGER_ADJUSTMENT = 'MANAGER_ADJUSTMENT',
    SYSTEM_MIGRATION = 'SYSTEM_MIGRATION',
    OTHER = 'OTHER'
}

export const OverrideReasonLabels: Record<OverrideReason, string> = {
    [OverrideReason.CASH_TO_SAFE]: 'Przeniesienie gotówki do sejfu',
    [OverrideReason.CASH_FROM_SAFE]: 'Pobranie gotówki z sejfu',
    [OverrideReason.BANK_STATEMENT_RECONCILIATION]: 'Uzgodnienie z wyciągiem bankowym',
    [OverrideReason.INVENTORY_COUNT]: 'Rezultat inwentaryzacji kasy',
    [OverrideReason.ERROR_CORRECTION]: 'Korekta błędu księgowego',
    [OverrideReason.EXTERNAL_PAYMENT]: 'Płatność zewnętrzna nie odnotowana w systemie',
    [OverrideReason.MANAGER_ADJUSTMENT]: 'Korekta menedżerska',
    [OverrideReason.SYSTEM_MIGRATION]: 'Migracja danych systemowych',
    [OverrideReason.OTHER]: 'Inna przyczyna'
};

export interface CashMoveRequest {
    amount: number;
    description?: string;
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
    reason: OverrideReason;
    description?: string;
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

export const balanceOverrideApi = {
    // Pobieranie aktualnych sald
    getCurrentBalances: async (): Promise<CompanyBalance> => {
        try {
            return await apiClient.get<CompanyBalance>('/financial-documents/current');
        } catch (error) {
            console.error('Error fetching current balances:', error);
            throw error;
        }
    },

    // Przeniesienie gotówki do sejfu
    moveCashToSafe: async (request: CashMoveRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClient.postNot<BalanceOverrideResult>('/balance-override/cash/to-safe', request);
        } catch (error) {
            console.error('Error moving cash to safe:', error);
            throw error;
        }
    },

    // Pobranie gotówki z sejfu
    moveCashFromSafe: async (request: CashMoveRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClient.postNot<BalanceOverrideResult>('/balance-override/cash/from-safe', request);
        } catch (error) {
            console.error('Error moving cash from safe:', error);
            throw error;
        }
    },

    // Uzgodnienie z wyciągiem bankowym
    reconcileWithBankStatement: async (request: BankReconciliationRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClient.postNot<BalanceOverrideResult>('/balance-override/bank/reconcile', request);
        } catch (error) {
            console.error('Error reconciling with bank statement:', error);
            throw error;
        }
    },

    // Inwentaryzacja kasy
    performCashInventory: async (request: CashInventoryRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClient.postNot<BalanceOverrideResult>('/balance-override/cash/inventory', request);
        } catch (error) {
            console.error('Error performing cash inventory:', error);
            throw error;
        }
    },

    // Manualne nadpisanie salda
    manualOverride: async (request: ManualOverrideRequest): Promise<BalanceOverrideResult> => {
        try {
            return await apiClient.postNot<BalanceOverrideResult>('/balance-override/manual', request);
        } catch (error) {
            console.error('Error performing manual override:', error);
            throw error;
        }
    }
};