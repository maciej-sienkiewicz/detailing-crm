// src/pages/Finances/utils/operationTypeUtils.ts
import { brandTheme } from '../styles/theme';

export enum OperationType {
    ADD = 'ADD',
    SUBTRACT = 'SUBTRACT',
    CORRECTION = 'CORRECTION',
    MANUAL_OVERRIDE = 'MANUAL_OVERRIDE',
    CASH_WITHDRAWAL = 'CASH_WITHDRAWAL',
    CASH_DEPOSIT = 'CASH_DEPOSIT',
    BANK_RECONCILIATION = 'BANK_RECONCILIATION',
    INVENTORY_ADJUSTMENT = 'INVENTORY_ADJUSTMENT',
    CASH_TO_SAFE = 'CASH_TO_SAFE',
    CASH_FROM_SAFE = 'CASH_FROM_SAFE'
}

export const OperationTypeLabels: Record<string, string> = {
    [OperationType.ADD]: 'Dodanie środków',
    [OperationType.SUBTRACT]: 'Odjęcie środków',
    [OperationType.CORRECTION]: 'Korekta sald',
    [OperationType.MANUAL_OVERRIDE]: 'Ręczne nadpisanie',
    [OperationType.CASH_WITHDRAWAL]: 'Wypłata gotówki',
    [OperationType.CASH_DEPOSIT]: 'Wpłata gotówki',
    [OperationType.BANK_RECONCILIATION]: 'Uzgodnienie bankowe',
    [OperationType.INVENTORY_ADJUSTMENT]: 'Korekta inwentarzowa',
    [OperationType.CASH_TO_SAFE]: 'Przeniesienie do sejfu',
    [OperationType.CASH_FROM_SAFE]: 'Pobranie z sejfu'
};

export const OperationTypeColors: Record<string, string> = {
    [OperationType.ADD]: brandTheme.status.success,
    [OperationType.SUBTRACT]: brandTheme.status.error,
    [OperationType.CORRECTION]: brandTheme.status.warning,
    [OperationType.MANUAL_OVERRIDE]: brandTheme.primary,
    [OperationType.CASH_WITHDRAWAL]: brandTheme.status.error,
    [OperationType.CASH_DEPOSIT]: brandTheme.status.success,
    [OperationType.BANK_RECONCILIATION]: brandTheme.status.info,
    [OperationType.INVENTORY_ADJUSTMENT]: brandTheme.status.warning,
    [OperationType.CASH_TO_SAFE]: brandTheme.status.info,
    [OperationType.CASH_FROM_SAFE]: brandTheme.status.info
};

export const OperationTypeDescriptions: Record<string, string> = {
    [OperationType.ADD]: 'Automatyczne dodanie środków na podstawie dokumentu finansowego',
    [OperationType.SUBTRACT]: 'Automatyczne odjęcie środków na podstawie dokumentu finansowego',
    [OperationType.CORRECTION]: 'Korekta błędów w saldach przeprowadzona przez system',
    [OperationType.MANUAL_OVERRIDE]: 'Ręczna zmiana salda przez uprawnionego użytkownika',
    [OperationType.CASH_WITHDRAWAL]: 'Wypłata gotówki z kasy',
    [OperationType.CASH_DEPOSIT]: 'Wpłata gotówki do kasy',
    [OperationType.BANK_RECONCILIATION]: 'Uzgodnienie salda z wyciągiem bankowym',
    [OperationType.INVENTORY_ADJUSTMENT]: 'Korekta na podstawie inwentaryzacji fizycznej',
    [OperationType.CASH_TO_SAFE]: 'Przeniesienie gotówki z kasy do sejfu',
    [OperationType.CASH_FROM_SAFE]: 'Pobranie gotówki z sejfu do kasy'
};

export const getOperationTypeLabel = (operationType: string): string => {
    return OperationTypeLabels[operationType] || operationType;
};

export const getOperationTypeColor = (operationType: string): string => {
    return OperationTypeColors[operationType] || brandTheme.text.secondary;
};

export const getOperationTypeDescription = (operationType: string): string => {
    return OperationTypeDescriptions[operationType] || 'Nieznany typ operacji';
};

export const isPositiveOperation = (operationType: string): boolean => {
    return [
        OperationType.ADD,
        OperationType.CASH_DEPOSIT,
        OperationType.CASH_FROM_SAFE
    ].includes(operationType as OperationType);
};

export const isNegativeOperation = (operationType: string): boolean => {
    return [
        OperationType.SUBTRACT,
        OperationType.CASH_WITHDRAWAL,
        OperationType.CASH_TO_SAFE
    ].includes(operationType as OperationType);
};

export const isCriticalOperation = (operationType: string): boolean => {
    return [
        OperationType.MANUAL_OVERRIDE,
        OperationType.BANK_RECONCILIATION,
        OperationType.INVENTORY_ADJUSTMENT
    ].includes(operationType as OperationType);
};