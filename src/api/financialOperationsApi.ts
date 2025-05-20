// src/api/financialOperationsApi.ts
import { apiClient, PaginatedResponse } from './apiClient';
import {
    FinancialOperation,
    FinancialOperationFilters,
    FinancialSummary,
    FinancialOperationType,
    TransactionDirection,
    PaymentStatus,
    PaymentMethod
} from '../types';

export interface ExtractedInvoiceData {
    generalInfo: {
        title?: string;
        issuedDate: string;
        dueDate: string;
    };
    seller: {
        name: string;
        taxId?: string;
        address?: string;
    };
    buyer: {
        name: string;
        taxId?: string;
        address?: string;
    };
    items: {
        name: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        totalNet: number;
        totalGross: number;
    }[];
    summary: {
        totalNet: number;
        totalTax: number;
        totalGross: number;
    };
    notes?: string;
}

export const extractInvoiceData = async (file: File): Promise<ExtractedInvoiceData | null> => {
    // Symulacja opóźnienia odpowiedzi
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        // W rzeczywistej aplikacji wysłalibyśmy plik do API
        // Tutaj zwracamy mock danych
        return {
            generalInfo: {
                title: `Faktura za usługi - ${file.name}`,
                issuedDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            seller: {
                name: 'Auto Detailing Pro Sp. z o.o.',
                taxId: 'PL1234567890',
                address: 'ul. Polerska 15, 00-123 Warszawa'
            },
            buyer: {
                name: 'Klient Testowy Sp. z o.o.',
                taxId: 'PL9876543210',
                address: 'ul. Klienta 42, 00-456 Warszawa'
            },
            items: [
                {
                    name: 'Usługi detailingowe Premium',
                    description: 'Pełny pakiet detailingu z zabezpieczeniem ceramicznym',
                    quantity: 1,
                    unitPrice: 2000,
                    taxRate: 23,
                    totalNet: 2000,
                    totalGross: 2460
                },
                {
                    name: 'Materiały eksploatacyjne',
                    quantity: 5,
                    unitPrice: 100,
                    taxRate: 23,
                    totalNet: 500,
                    totalGross: 615
                }
            ],
            summary: {
                totalNet: 2500,
                totalTax: 575,
                totalGross: 3075
            },
            notes: 'Faktura za wykonane usługi detailingowe'
        };
    } catch (error) {
        console.error('Error extracting invoice data:', error);
        return null;
    }
};

// Pomocnicze funkcje do generowania danych mock
const generateMockOperations = (count: number = 50): FinancialOperation[] => {
    return Array.from({ length: count }, (_, index) => createMockOperation(index));
};

const createMockOperation = (index: number): FinancialOperation => {
    const date = new Date();
    date.setDate(date.getDate() - (index % 60)); // Operacje z ostatnich 60 dni

    const isIncome = index % 2 === 0;
    const amount = Math.round((200 + Math.random() * 5000) * 100) / 100;

    // Ustal typ operacji
    const operationTypes = [
        FinancialOperationType.INVOICE,
        FinancialOperationType.RECEIPT,
        FinancialOperationType.OTHER
    ];
    const type = operationTypes[index % operationTypes.length];

    // Ustal kierunek przepływu (przychód/wydatek)
    const direction = isIncome ? TransactionDirection.INCOME : TransactionDirection.EXPENSE;

    // Ustal status płatności
    const statuses = [
        PaymentStatus.PAID,
        PaymentStatus.UNPAID,
        PaymentStatus.PARTIALLY_PAID,
        PaymentStatus.OVERDUE
    ];
    const status = statuses[index % statuses.length];

    // Ustal metodę płatności
    const paymentMethods = [
        PaymentMethod.CASH,
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.CARD,
        PaymentMethod.MOBILE_PAYMENT
    ];
    const paymentMethod = paymentMethods[index % paymentMethods.length];

    // Przygotuj dokumentNumber w zależności od typu operacji
    let documentNumber;
    if (type === FinancialOperationType.INVOICE) {
        documentNumber = `FV/${date.getFullYear()}/${100 + index}`;
    } else if (type === FinancialOperationType.RECEIPT) {
        documentNumber = `P/${date.getFullYear()}/${200 + index}`;
    }

    // Ustal tytuł operacji
    let title;
    if (direction === TransactionDirection.INCOME) {
        title = type === FinancialOperationType.INVOICE
            ? `Usługi detailingowe ${index % 3 === 0 ? 'Premium' : 'Standard'}`
            : `Sprzedaż produktów detailingowych`;
    } else {
        title = type === FinancialOperationType.INVOICE
            ? `Zakup materiałów ${index % 4 === 0 ? 'eksploatacyjnych' : 'do detailingu'}`
            : `Wydatki operacyjne`;
    }

    // Ustal kwotę zapłaconą
    let paidAmount = undefined;
    if (status === PaymentStatus.PARTIALLY_PAID) {
        paidAmount = Math.round(amount * (0.3 + Math.random() * 0.5) * 100) / 100;
    } else if (status === PaymentStatus.PAID) {
        paidAmount = amount;
    } else if (status === PaymentStatus.UNPAID || status === PaymentStatus.OVERDUE) {
        paidAmount = 0;
    }

    const createdAt = new Date(date);
    createdAt.setHours(createdAt.getHours() - 1);

    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 14);

    return {
        id: `op-${1000 + index}`,
        type,
        documentNumber,
        title,
        description: index % 3 === 0 ? `Dodatkowy opis dla operacji #${index + 1}` : undefined,
        date: date.toISOString(),
        dueDate: dueDate.toISOString(),
        direction,
        paymentMethod,
        counterpartyName: direction === TransactionDirection.INCOME
            ? `Klient ${index % 10 + 1}`
            : `Dostawca ${index % 8 + 1}`,
        counterpartyId: `cnt-${2000 + index}`,
        amount,
        netAmount: direction === TransactionDirection.INCOME ? Math.round(amount / 1.23 * 100) / 100 : undefined,
        taxAmount: direction === TransactionDirection.INCOME ? Math.round((amount - amount / 1.23) * 100) / 100 : undefined,
        paidAmount,
        status,
        currency: 'PLN',
        protocolId: index % 5 === 0 ? `prot-${3000 + index}` : undefined,
        visitId: index % 7 === 0 ? `visit-${4000 + index}` : undefined,
        sourceId: `src-${5000 + index}`,
        sourceType: type,
        createdAt: createdAt.toISOString(),
        updatedAt: date.toISOString(),
        attachments: index % 4 === 0 ? [
            {
                name: `dokument-${index + 1}.pdf`,
                size: 1024 * (10 + Math.floor(Math.random() * 90))
            }
        ] : []
    };
};

// Mock dla podsumowania finansowego
const generateMockSummary = (): FinancialSummary => {
    return {
        cashBalance: 12547.89,
        totalIncome: 67890.54,
        totalExpense: 41250.65,
        bankAccountBalance: 35670.22,
        receivables: 15230.45,
        receivablesOverdue: 3560.78,
        liabilities: 8920.33,
        liabilitiesOverdue: 1200.45,
        profit: 26639.89,
        cashFlow: 26639.89,
        incomeByMethod: {
            [PaymentMethod.CASH]: 12450.77,
            [PaymentMethod.BANK_TRANSFER]: 42560.33,
            [PaymentMethod.CARD]: 10230.44,
            [PaymentMethod.MOBILE_PAYMENT]: 2650.00,
            [PaymentMethod.OTHER]: 0
        },
        expenseByMethod: {
            [PaymentMethod.CASH]: 5670.44,
            [PaymentMethod.BANK_TRANSFER]: 32450.21,
            [PaymentMethod.CARD]: 3130.00,
            [PaymentMethod.MOBILE_PAYMENT]: 0,
            [PaymentMethod.OTHER]: 0
        },
        receivablesByTimeframe: {
            current: 7890.22,
            within30Days: 3670.55,
            within60Days: 2340.23,
            within90Days: 770.33,
            over90Days: 560.12
        },
        liabilitiesByTimeframe: {
            current: 4560.12,
            within30Days: 2780.00,
            within60Days: 1120.33,
            within90Days: 240.45,
            over90Days: 220.43
        }
    };
};

// Filtrowanie danych mock według przekazanych filtrów
const filterMockOperations = (operations: FinancialOperation[], filters: FinancialOperationFilters): FinancialOperation[] => {
    return operations.filter(operation => {
        // Filtrowanie po typie operacji
        if (filters.type && operation.type !== filters.type) {
            return false;
        }

        // Filtrowanie po kierunku
        if (filters.direction && operation.direction !== filters.direction) {
            return false;
        }

        // Filtrowanie po statusie
        if (filters.status && operation.status !== filters.status) {
            return false;
        }

        // Filtrowanie po metodzie płatności
        if (filters.paymentMethod && operation.paymentMethod !== filters.paymentMethod) {
            return false;
        }

        // Filtrowanie po kontrahencie
        if (filters.counterpartyName && !operation.counterpartyName.toLowerCase().includes(filters.counterpartyName.toLowerCase())) {
            return false;
        }

        // Filtrowanie po numerze dokumentu
        if (filters.documentNumber && (!operation.documentNumber || !operation.documentNumber.toLowerCase().includes(filters.documentNumber.toLowerCase()))) {
            return false;
        }

        // Filtrowanie po dacie od
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            const operationDate = new Date(operation.date);
            if (operationDate < fromDate) {
                return false;
            }
        }

        // Filtrowanie po dacie do
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999); // Koniec dnia
            const operationDate = new Date(operation.date);
            if (operationDate > toDate) {
                return false;
            }
        }

        // Filtrowanie po minimalnej kwocie
        if (filters.minAmount !== undefined && operation.amount < filters.minAmount) {
            return false;
        }

        // Filtrowanie po maksymalnej kwocie
        if (filters.maxAmount !== undefined && operation.amount > filters.maxAmount) {
            return false;
        }

        // Filtrowanie po ID protokołu
        if (filters.protocolId && (!operation.protocolId || !operation.protocolId.includes(filters.protocolId))) {
            return false;
        }

        // Filtrowanie po ID wizyty
        if (filters.visitId && (!operation.visitId || !operation.visitId.includes(filters.visitId))) {
            return false;
        }

        return true;
    });
};

// Stałe dane mock
const mockOperations = generateMockOperations(100);
const mockSummary = generateMockSummary();

/**
 * API do zarządzania operacjami finansowymi
 */
export const financialOperationsApi = {
    // Pobieranie operacji finansowych z paginacją
    fetchFinancialOperations: async (
        filters?: FinancialOperationFilters,
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedResponse<FinancialOperation>> => {
        // Symulacja opóźnienia odpowiedzi
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // Filtruj dane mock
            const filteredOperations = filterMockOperations(mockOperations, filters || {});

            // Paginacja
            const startIndex = page * size;
            const endIndex = startIndex + size;
            const paginatedOperations = filteredOperations.slice(startIndex, endIndex);

            // Przygotuj odpowiedź z paginacją
            return {
                data: paginatedOperations,
                pagination: {
                    currentPage: page,
                    pageSize: size,
                    totalItems: filteredOperations.length,
                    totalPages: Math.ceil(filteredOperations.length / size)
                }
            };
        } catch (error) {
            console.error('Error fetching financial operations:', error);
            throw error;
        }
    },

    extractInvoiceData,

    // Pobieranie pojedynczej operacji finansowej
    fetchFinancialOperationById: async (id: string): Promise<FinancialOperation | null> => {
        // Symulacja opóźnienia odpowiedzi
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const operation = mockOperations.find(op => op.id === id);
            return operation || null;
        } catch (error) {
            console.error(`Error fetching financial operation ${id}:`, error);
            return null;
        }
    },

    // Dodawanie nowej operacji finansowej
    createFinancialOperation: async (operation: Omit<FinancialOperation, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialOperation> => {
        // Symulacja opóźnienia odpowiedzi
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const now = new Date().toISOString();
            const newOperation: FinancialOperation = {
                ...operation as any,
                id: `op-${Math.floor(Math.random() * 10000)}`,
                createdAt: now,
                updatedAt: now
            };

            // W rzeczywistej aplikacji zapisalibyśmy to do bazy danych
            // Tutaj tylko symulujemy
            mockOperations.unshift(newOperation);

            return newOperation;
        } catch (error) {
            console.error('Error creating financial operation:', error);
            throw error;
        }
    },

    // Aktualizacja operacji finansowej
    updateFinancialOperation: async (id: string, operation: Partial<FinancialOperation>): Promise<FinancialOperation> => {
        // Symulacja opóźnienia odpowiedzi
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const index = mockOperations.findIndex(op => op.id === id);
            if (index === -1) {
                throw new Error('Operation not found');
            }

            const updatedOperation: FinancialOperation = {
                ...mockOperations[index],
                ...operation,
                updatedAt: new Date().toISOString()
            };

            mockOperations[index] = updatedOperation;

            return updatedOperation;
        } catch (error) {
            console.error(`Error updating financial operation ${id}:`, error);
            throw error;
        }
    },

    // Aktualizacja statusu operacji finansowej
    updateOperationStatus: async (id: string, status: PaymentStatus, paidAmount?: number): Promise<FinancialOperation> => {
        // Symulacja opóźnienia odpowiedzi
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const index = mockOperations.findIndex(op => op.id === id);
            if (index === -1) {
                throw new Error('Operation not found');
            }

            const updatedOperation: FinancialOperation = {
                ...mockOperations[index],
                status,
                paidAmount: paidAmount !== undefined ? paidAmount : mockOperations[index].paidAmount,
                updatedAt: new Date().toISOString()
            };

            mockOperations[index] = updatedOperation;

            return updatedOperation;
        } catch (error) {
            console.error(`Error updating financial operation status ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie operacji finansowej
    deleteFinancialOperation: async (id: string): Promise<boolean> => {
        // Symulacja opóźnienia odpowiedzi
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const index = mockOperations.findIndex(op => op.id === id);
            if (index !== -1) {
                mockOperations.splice(index, 1);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Error deleting financial operation ${id}:`, error);
            return false;
        }
    },

    // Pobieranie podsumowania finansowego
    getFinancialSummary: async (dateFrom?: string, dateTo?: string): Promise<FinancialSummary> => {
        // Symulacja opóźnienia odpowiedzi
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // W rzeczywistej aplikacji filtrowalibyśmy dane według dat
            // Tutaj zwracamy statyczne dane mock
            return mockSummary;
        } catch (error) {
            console.error('Error fetching financial summary:', error);
            throw error;
        }
    },

    // Pobieranie danych do wykresów
    getFinancialChartData: async (period: 'month' | 'quarter' | 'year' = 'month'): Promise<any> => {
        // Symulacja opóźnienia odpowiedzi
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Generowanie przykładowych danych do wykresu
            const labels = Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - 11 + i);
                return date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' });
            });

            const incomeData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 5000 + 3000));
            const expenseData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 3000 + 1000));

            return {
                labels,
                datasets: [
                    {
                        label: 'Przychody',
                        data: incomeData,
                        backgroundColor: '#2ecc7133',
                        borderColor: '#2ecc71',
                        borderWidth: 2
                    },
                    {
                        label: 'Wydatki',
                        data: expenseData,
                        backgroundColor: '#e74c3c33',
                        borderColor: '#e74c3c',
                        borderWidth: 2
                    }
                ]
            };
        } catch (error) {
            console.error('Error fetching financial chart data:', error);
            throw error;
        }
    }
};