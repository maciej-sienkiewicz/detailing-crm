// src/api/fixedCostsApi.ts
import { apiClient, PaginatedResponse } from './apiClient';

// Types for Fixed Costs
export interface FixedCostCategory {
    OTHER: 'OTHER';
    LICENSES: 'LICENSES';
    LOCATION: 'LOCATION';
    MARKETING: 'MARKETING';
    FINANCIAL: 'FINANCIAL';
    UTILITIES: 'UTILITIES';
    EQUIPMENT: 'EQUIPMENT';
    PERSONNEL: 'PERSONNEL';
    INSURANCE: 'INSURANCE';
}

export const FixedCostCategoryLabels = {
    OTHER: 'Inne',
    LICENSES: 'Licencje i pozwolenia',
    LOCATION: 'Lokalizacja',
    MARKETING: 'Marketing',
    FINANCIAL: 'Usługi finansowe',
    UTILITIES: 'Media',
    EQUIPMENT: 'Sprzęt i wyposażenie',
    PERSONNEL: 'Personel',
    INSURANCE: 'Ubezpieczenia'
};

export interface CostFrequency {
    MONTHLY: 'MONTHLY';
    QUARTERLY: 'QUARTERLY';
    YEARLY: 'YEARLY';
    WEEKLY: 'WEEKLY';
    ONE_TIME: 'ONE_TIME';
}

export const CostFrequencyLabels = {
    MONTHLY: 'Miesięcznie',
    QUARTERLY: 'Kwartalnie',
    YEARLY: 'Rocznie',
    WEEKLY: 'Tygodniowo',
    ONE_TIME: 'Jednorazowo'
};

export interface FixedCostStatus {
    ACTIVE: 'ACTIVE';
    INACTIVE: 'INACTIVE';
    SUSPENDED: 'SUSPENDED';
}

export const FixedCostStatusLabels = {
    ACTIVE: 'Aktywny',
    INACTIVE: 'Nieaktywny',
    SUSPENDED: 'Zawieszony'
};

export const FixedCostStatusColors = {
    ACTIVE: '#2ecc71',
    INACTIVE: '#95a5a6',
    SUSPENDED: '#f39c12'
};

export interface PaymentStatus {
    PAID: 'PAID';
    PENDING: 'PENDING';
    OVERDUE: 'OVERDUE';
    CANCELLED: 'CANCELLED';
}

export const PaymentStatusLabels = {
    PAID: 'Opłacone',
    PENDING: 'Oczekujące',
    OVERDUE: 'Przeterminowane',
    CANCELLED: 'Anulowane'
};

export interface SupplierInfo {
    name: string;
    taxId?: string;
}

export interface FixedCostPayment {
    id: string;
    paymentDate: string;
    amount: number;
    plannedAmount: number;
    variance: number;
    status: keyof PaymentStatus;
    statusDisplay: string;
    paymentMethod?: string;
    paymentMethodDisplay?: string;
    documentId?: string;
    notes?: string;
    createdAt: string;
}

export interface FixedCost {
    id: string;
    name: string;
    description?: string;
    category: keyof FixedCostCategory;
    categoryDisplay: string;
    monthlyAmount: number;
    frequency: keyof CostFrequency;
    frequencyDisplay: string;
    startDate: string;
    endDate?: string;
    status: keyof FixedCostStatus;
    statusDisplay: string;
    autoRenew: boolean;
    supplierInfo?: SupplierInfo;
    contractNumber?: string;
    notes?: string;
    calculatedMonthlyAmount: number;
    totalPaid: number;
    totalPlanned: number;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
    paymentsCount: number;
    isActiveInCurrentMonth: boolean;
    createdAt: string;
    updatedAt: string;
    payments: FixedCostPayment[];
}

export interface CreateFixedCostRequest {
    name: string;
    description?: string;
    category: keyof FixedCostCategory;
    monthlyAmount: number;
    frequency: keyof CostFrequency;
    startDate: string;
    endDate?: string;
    status?: keyof FixedCostStatus;
    autoRenew?: boolean;
    supplierInfo?: SupplierInfo;
    contractNumber?: string;
    notes?: string;
}

export interface UpdateFixedCostRequest extends CreateFixedCostRequest {
    status: keyof FixedCostStatus;
}

export interface RecordPaymentRequest {
    paymentDate: string;
    amount: number;
    plannedAmount: number;
    status: keyof PaymentStatus;
    paymentMethod?: string;
    documentId?: string;
    notes?: string;
}

export interface FixedCostFilters {
    name?: string;
    category?: keyof FixedCostCategory;
    status?: keyof FixedCostStatus;
    frequency?: keyof CostFrequency;
    supplierName?: string;
    contractNumber?: string;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    activeInPeriod?: string;
}

export interface CategoryBreakdown {
    category: keyof FixedCostCategory;
    categoryDisplay: string;
    totalAmount: number;
    percentage: number;
    activeCosts: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    topCosts: Array<{
        id: string;
        name: string;
        amount: number;
        percentage: number;
        status: keyof FixedCostStatus;
    }>;
}

export interface CategorySummary {
    categories: CategoryBreakdown[];
    totalFixedCosts: number;
    period: string;
    activeCostsCount: number;
    inactiveCostsCount: number;
}

export interface UpcomingPayment {
    fixedCostId: string;
    fixedCostName: string;
    category: keyof FixedCostCategory;
    categoryDisplay: string;
    dueDate: string;
    amount: number;
    status: keyof PaymentStatus;
    statusDisplay: string;
    isOverdue: boolean;
    daysOverdue?: number;
    supplierName?: string;
}

export interface UpcomingPayments {
    period: string;
    totalAmount: number;
    paymentsCount: number;
    overdueCount: number;
    overdueAmount: number;
    payments: UpcomingPayment[];
}

export const fixedCostsApi = {
    // Get all fixed costs with filters and pagination
    fetchFixedCosts: async (
        filters?: FixedCostFilters,
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedResponse<FixedCost>> => {
        try {
            const params = new URLSearchParams();

            // Add pagination
            params.append('page', page.toString());
            params.append('size', size.toString());

            // Add filters
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        params.append(key, value.toString());
                    }
                });
            }

            const response = await apiClient.get<any>(
                `/fixed-costs?${params.toString()}`
            );

            // Handle different response structures
            if (response.data && Array.isArray(response.data)) {
                // Response has data and pagination properties
                return {
                    data: response.data,
                    pagination: {
                        currentPage: response.page || page,
                        pageSize: response.size || size,
                        totalItems: response.total_items || response.totalItems || response.data.length,
                        totalPages: response.total_pages || response.totalPages || Math.ceil((response.total_items || response.data.length) / size)
                    }
                };
            } else if (Array.isArray(response)) {
                // Response is just an array
                return {
                    data: response,
                    pagination: {
                        currentPage: page,
                        pageSize: size,
                        totalItems: response.length,
                        totalPages: Math.ceil(response.length / size)
                    }
                };
            } else {
                // Unexpected response structure
                return {
                    data: [],
                    pagination: {
                        currentPage: page,
                        pageSize: size,
                        totalItems: 0,
                        totalPages: 0
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching fixed costs:', error);
            return {
                data: [],
                pagination: {
                    currentPage: page,
                    pageSize: size,
                    totalItems: 0,
                    totalPages: 0
                }
            };
        }
    },

    // Get fixed cost by ID
    fetchFixedCostById: async (id: string): Promise<FixedCost | null> => {
        try {
            return await apiClient.get<FixedCost>(`/fixed-costs/${id}`);
        } catch (error) {
            console.error(`Error fetching fixed cost ${id}:`, error);
            return null;
        }
    },

    // Create new fixed cost
    createFixedCost: async (data: CreateFixedCostRequest): Promise<FixedCost | null> => {
        try {
            return await apiClient.postNot<FixedCost>('/fixed-costs', data);
        } catch (error) {
            console.error('Error creating fixed cost:', error);
            throw error;
        }
    },

    // Update fixed cost
    updateFixedCost: async (id: string, data: UpdateFixedCostRequest): Promise<FixedCost | null> => {
        try {
            return await apiClient.putNot<FixedCost>(`/fixed-costs/${id}`, data);
        } catch (error) {
            console.error(`Error updating fixed cost ${id}:`, error);
            throw error;
        }
    },

    // Delete fixed cost
    deleteFixedCost: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/fixed-costs/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting fixed cost ${id}:`, error);
            return false;
        }
    },

    // Record payment
    recordPayment: async (id: string, data: RecordPaymentRequest): Promise<FixedCostPayment | null> => {
        try {
            return await apiClient.postNot<FixedCostPayment>(`/fixed-costs/${id}/payments`, data);
        } catch (error) {
            console.error(`Error recording payment for fixed cost ${id}:`, error);
            throw error;
        }
    },

    // Get category summary
    getCategorySummary: async (period?: string): Promise<CategorySummary> => {
        try {
            const params = period ? `?period=${period}` : '';
            return await apiClient.get<CategorySummary>(`/fixed-costs/categories/summary${params}`);
        } catch (error) {
            console.error('Error fetching category summary:', error);
            throw error;
        }
    },

    // Get upcoming payments
    getUpcomingPayments: async (days: number = 30): Promise<UpcomingPayments> => {
        try {
            return await apiClient.get<UpcomingPayments>(`/fixed-costs/payments/upcoming?days=${days}`);
        } catch (error) {
            console.error('Error fetching upcoming payments:', error);
            throw error;
        }
    },

    // Get payments for specific period
    getPaymentsForPeriod: async (
        id: string,
        startDate: string,
        endDate: string
    ): Promise<FixedCostPayment[]> => {
        try {
            const params = new URLSearchParams({
                startDate,
                endDate
            });
            return await apiClient.get<FixedCostPayment[]>(`/fixed-costs/${id}/payments?${params.toString()}`);
        } catch (error) {
            console.error('Error fetching payments for period:', error);
            return [];
        }
    },

    // Get active fixed costs in period
    getActiveFixedCostsInPeriod: async (startDate: string, endDate: string): Promise<FixedCost[]> => {
        try {
            const params = new URLSearchParams({
                startDate,
                endDate
            });
            return await apiClient.get<FixedCost[]>(`/fixed-costs/active?${params.toString()}`);
        } catch (error) {
            console.error('Error fetching active fixed costs:', error);
            return [];
        }
    },

    // Calculate total fixed costs for period
    calculateTotalFixedCosts: async (startDate: string, endDate: string): Promise<{
        startDate: string;
        endDate: string;
        totalFixedCosts: number;
        period: string;
    }> => {
        try {
            const params = new URLSearchParams({
                startDate,
                endDate
            });
            return await apiClient.get(`/fixed-costs/total?${params.toString()}`);
        } catch (error) {
            console.error('Error calculating total fixed costs:', error);
            throw error;
        }
    }
};