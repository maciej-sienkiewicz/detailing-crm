// src/api/employeesApi.ts
/**
 * Production-ready Employees API
 * Handles all employee-related API operations with proper typing and error handling
 */

import { apiClientNew, PaginatedApiResponse, PaginationParams, ApiError } from './apiClientNew';
import { Employee, EmployeeDocument } from '../types';
import { ExtendedEmployee, UserRole, ContractType, EmployeeFilters } from '../types/employeeTypes';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

/**
 * Employee list item (lightweight representation for lists)
 */
export interface EmployeeListItem {
    id: string;
    fullName: string;
    position: string;
    email: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
    hireDate: string;
    lastLoginDate?: string;
    hourlyRate?: number;
    bonusFromRevenue?: number;
    workingHoursPerWeek?: number;
    contractType?: ContractType;
}

/**
 * Employee creation/update payload
 */
export interface EmployeeCreatePayload {
    fullName: string;
    birthDate: string;
    hireDate: string;
    position: string;
    email: string;
    phone: string;
    role: UserRole;
    hourlyRate?: number;
    bonusFromRevenue?: number;
    isActive: boolean;
    workingHoursPerWeek?: number;
    contractType?: ContractType;
    emergencyContact?: {
        name: string;
        phone: string;
    };
    notes?: string;
}

/**
 * Employee update payload (partial)
 */
export interface EmployeeUpdatePayload extends Partial<EmployeeCreatePayload> {
    id: string;
}

/**
 * Employee search parameters
 */
export interface EmployeeSearchParams extends EmployeeFilters, PaginationParams {
    sortBy?: 'fullName' | 'position' | 'email' | 'hireDate' | 'role' | 'hourlyRate' | 'isActive';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Employee statistics
 */
export interface EmployeeStatistics {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    averageAge: number;
    averageTenure: number;
    roleDistribution: Record<UserRole, number>;
    contractTypeDistribution: Record<ContractType, number>;
}

/**
 * Document upload payload
 */
export interface DocumentUploadPayload {
    employeeId: string;
    name: string;
    type: string;
    file?: File;
}

/**
 * Employees API operation result
 */
export interface EmployeesApiResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

// ========================================================================================
// EMPLOYEES API CLASS
// ========================================================================================

/**
 * Production-ready Employees API
 * All methods include proper error handling, logging, and optimizations
 */
class EmployeesApi {
    private readonly baseEndpoint = '/employees';
    private readonly documentsEndpoint = '/employee-documents';

    // Cache for frequently accessed data
    private employeeListCache: Map<string, { data: EmployeeListItem[]; timestamp: number }> = new Map();
    private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

    // ========================================================================================
    // EMPLOYEE CRUD OPERATIONS
    // ========================================================================================

    /**
     * Fetches a paginated list of employees with optional filtering and sorting
     *
     * @param params - Search, filter, and pagination parameters
     * @returns Promise<EmployeesApiResult<PaginatedApiResponse<EmployeeListItem>>>
     *
     * @example
     * ```typescript
     * const result = await employeesApi.getEmployeesList({
     *   role: UserRole.EMPLOYEE,
     *   isActive: true,
     *   page: 0,
     *   size: 20,
     *   sortBy: 'fullName',
     *   sortOrder: 'asc'
     * });
     *
     * if (result.success) {
     *   console.log('Employees:', result.data);
     * }
     * ```
     */
    async getEmployeesList(params: EmployeeSearchParams = {}): Promise<EmployeesApiResult<PaginatedApiResponse<EmployeeListItem>>> {
        try {
            console.log('🔍 Fetching employees list with params:', params);

            const { page = 0, size = 20, sortBy = 'fullName', sortOrder = 'asc', ...filterParams } = params;

            // Check cache first for frequently accessed data
            const cacheKey = this.generateCacheKey(params);
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData && !filterParams.searchQuery) {
                console.log('💾 Using cached employees data');
                return {
                    success: true,
                    data: this.paginateData(cachedData, page, size)
                };
            }

            // Prepare API parameters
            const apiParams = this.prepareSearchParams(filterParams, sortBy, sortOrder);

            // Call the API
            const response = await apiClientNew.getWithPagination<EmployeeListItem>(
                `${this.baseEndpoint}/list`,
                apiParams,
                { page, size },
                { timeout: 15000 }
            );

            console.log('✅ Successfully fetched employees list:', {
                count: response.data.length,
                totalItems: response.pagination.totalItems,
                currentPage: response.pagination.currentPage
            });

            // Cache the full dataset for future use (if not filtered by search)
            if (!filterParams.searchQuery && response.data.length > 0) {
                this.setCache(cacheKey, response.data);
            }

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching employees list:', error);
            return this.createErrorResult(error, params);
        }
    }

    /**
     * Fetches detailed information about a specific employee
     *
     * @param employeeId - The employee ID
     * @returns Promise<EmployeesApiResult<ExtendedEmployee>>
     */
    async getEmployeeById(employeeId: string): Promise<EmployeesApiResult<ExtendedEmployee>> {
        try {
            console.log(`🔍 Fetching employee details for ID: ${employeeId}`);

            const response = await apiClientNew.get<ExtendedEmployee>(
                `${this.baseEndpoint}/${employeeId}`,
                undefined,
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched employee details');
            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error(`❌ Error fetching employee ${employeeId}:`, error);
            return this.createErrorResult(error);
        }
    }

    /**
     * Creates a new employee
     *
     * @param employeeData - The employee data to create
     * @returns Promise<EmployeesApiResult<ExtendedEmployee>>
     */
    async createEmployee(employeeData: EmployeeCreatePayload): Promise<EmployeesApiResult<ExtendedEmployee>> {
        try {
            console.log('📝 Creating new employee:', { name: employeeData.fullName, role: employeeData.role });

            // Validate required fields
            this.validateEmployeeData(employeeData);

            const response = await apiClientNew.post<ExtendedEmployee>(
                this.baseEndpoint,
                employeeData,
                { timeout: 10000 }
            );

            console.log('✅ Successfully created employee:', response.id);

            // Invalidate cache
            this.clearCache();

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error creating employee:', error);
            return this.createErrorResult(error);
        }
    }

    /**
     * Updates an existing employee
     *
     * @param employeeData - The employee data to update
     * @returns Promise<EmployeesApiResult<ExtendedEmployee>>
     */
    async updateEmployee(employeeData: EmployeeUpdatePayload): Promise<EmployeesApiResult<ExtendedEmployee>> {
        try {
            console.log(`📝 Updating employee: ${employeeData.id}`, { name: employeeData.fullName });

            // Validate required fields
            if (!employeeData.id) {
                throw new Error('Employee ID is required for update');
            }

            const response = await apiClientNew.put<ExtendedEmployee>(
                `${this.baseEndpoint}/${employeeData.id}`,
                employeeData,
                { timeout: 10000 }
            );

            console.log('✅ Successfully updated employee:', response.id);

            // Invalidate cache
            this.clearCache();

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error(`❌ Error updating employee ${employeeData.id}:`, error);
            return this.createErrorResult(error);
        }
    }

    /**
     * Deletes an employee
     *
     * @param employeeId - The employee ID to delete
     * @returns Promise<EmployeesApiResult<void>>
     */
    async deleteEmployee(employeeId: string): Promise<EmployeesApiResult<void>> {
        try {
            console.log(`🗑️ Deleting employee: ${employeeId}`);

            await apiClientNew.delete(
                `${this.baseEndpoint}/${employeeId}`,
                { timeout: 10000 }
            );

            console.log('✅ Successfully deleted employee:', employeeId);

            // Invalidate cache
            this.clearCache();

            return {
                success: true
            };

        } catch (error) {
            console.error(`❌ Error deleting employee ${employeeId}:`, error);
            return this.createErrorResult(error);
        }
    }

    // ========================================================================================
    // EMPLOYEE DOCUMENTS OPERATIONS
    // ========================================================================================

    /**
     * Fetches documents for a specific employee
     *
     * @param employeeId - The employee ID
     * @returns Promise<EmployeesApiResult<EmployeeDocument[]>>
     */
    async getEmployeeDocuments(employeeId: string): Promise<EmployeesApiResult<EmployeeDocument[]>> {
        try {
            console.log(`📄 Fetching documents for employee: ${employeeId}`);

            const response = await apiClientNew.get<EmployeeDocument[]>(
                `${this.documentsEndpoint}/employee/${employeeId}`,
                undefined,
                { timeout: 10000 }
            );

            console.log(`✅ Successfully fetched ${response.length} documents`);
            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error(`❌ Error fetching documents for employee ${employeeId}:`, error);
            return this.createErrorResult(error);
        }
    }

    /**
     * Uploads a document for an employee
     *
     * @param payload - Document upload data
     * @param onProgress - Progress callback for file upload
     * @returns Promise<EmployeesApiResult<EmployeeDocument>>
     */
    async uploadEmployeeDocument(
        payload: DocumentUploadPayload,
        onProgress?: (progress: number) => void
    ): Promise<EmployeesApiResult<EmployeeDocument>> {
        try {
            console.log(`📤 Uploading document for employee: ${payload.employeeId}`);

            let response: EmployeeDocument;

            if (payload.file) {
                // Upload with file
                response = await apiClientNew.uploadFile<EmployeeDocument>(
                    `${this.documentsEndpoint}/upload`,
                    payload.file,
                    {
                        employeeId: payload.employeeId,
                        name: payload.name,
                        type: payload.type
                    },
                    onProgress
                );
            } else {
                // Create document record without file
                response = await apiClientNew.post<EmployeeDocument>(
                    this.documentsEndpoint,
                    payload,
                    { timeout: 10000 }
                );
            }

            console.log('✅ Successfully uploaded document:', response.id);
            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error(`❌ Error uploading document for employee ${payload.employeeId}:`, error);
            return this.createErrorResult(error);
        }
    }

    /**
     * Deletes an employee document
     *
     * @param documentId - The document ID to delete
     * @returns Promise<EmployeesApiResult<void>>
     */
    async deleteEmployeeDocument(documentId: string): Promise<EmployeesApiResult<void>> {
        try {
            console.log(`🗑️ Deleting document: ${documentId}`);

            await apiClientNew.delete(
                `${this.documentsEndpoint}/${documentId}`,
                { timeout: 10000 }
            );

            console.log('✅ Successfully deleted document:', documentId);
            return {
                success: true
            };

        } catch (error) {
            console.error(`❌ Error deleting document ${documentId}:`, error);
            return this.createErrorResult(error);
        }
    }

    // ========================================================================================
    // STATISTICS AND ANALYTICS
    // ========================================================================================

    /**
     * Fetches employee statistics
     *
     * @returns Promise<EmployeesApiResult<EmployeeStatistics>>
     */
    async getEmployeeStatistics(): Promise<EmployeesApiResult<EmployeeStatistics>> {
        try {
            console.log('📊 Fetching employee statistics');

            const response = await apiClientNew.get<EmployeeStatistics>(
                `${this.baseEndpoint}/statistics`,
                undefined,
                { timeout: 10000 }
            );

            console.log('✅ Successfully fetched employee statistics');
            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error fetching employee statistics:', error);
            return this.createErrorResult(error);
        }
    }

    // ========================================================================================
    // BULK OPERATIONS
    // ========================================================================================

    /**
     * Updates multiple employees in batch
     *
     * @param updates - Array of employee updates
     * @returns Promise<EmployeesApiResult<ExtendedEmployee[]>>
     */
    async bulkUpdateEmployees(updates: EmployeeUpdatePayload[]): Promise<EmployeesApiResult<ExtendedEmployee[]>> {
        try {
            console.log(`📝 Bulk updating ${updates.length} employees`);

            const response = await apiClientNew.patch<ExtendedEmployee[]>(
                `${this.baseEndpoint}/bulk-update`,
                { updates },
                { timeout: 30000 } // Longer timeout for bulk operations
            );

            console.log(`✅ Successfully updated ${response.length} employees`);

            // Invalidate cache
            this.clearCache();

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error in bulk update:', error);
            return this.createErrorResult(error);
        }
    }

    /**
     * Exports employees data
     *
     * @param format - Export format (csv, xlsx, pdf)
     * @param filters - Optional filters for export
     * @returns Promise<EmployeesApiResult<Blob>>
     */
    async exportEmployees(
        format: 'csv' | 'xlsx' | 'pdf' = 'xlsx',
        filters?: EmployeeFilters
    ): Promise<EmployeesApiResult<Blob>> {
        try {
            console.log(`📤 Exporting employees as ${format.toUpperCase()}`);

            const params = filters ? this.prepareSearchParams(filters) : {};
            params.format = format;

            const response = await fetch(`${apiClientNew['baseUrl']}${this.baseEndpoint}/export`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': `application/${format === 'csv' ? 'csv' : 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'}`
                }
            });

            if (!response.ok) {
                throw new ApiError(response.status, response.statusText);
            }

            const blob = await response.blob();
            console.log(`✅ Successfully exported employees (${blob.size} bytes)`);

            return {
                success: true,
                data: blob
            };

        } catch (error) {
            console.error(`❌ Error exporting employees:`, error);
            return this.createErrorResult(error);
        }
    }

    // ========================================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================================

    /**
     * Prepares search parameters for API call
     */
    private prepareSearchParams(
        params: EmployeeFilters,
        sortBy?: string,
        sortOrder?: string
    ): Record<string, any> {
        const apiParams: Record<string, any> = {};

        // Add filters
        if (params.searchQuery) apiParams.search = params.searchQuery;
        if (params.position) apiParams.position = params.position;
        if (params.role) apiParams.role = params.role;
        if (params.isActive !== undefined) apiParams.isActive = params.isActive;
        if (params.contractType) apiParams.contractType = params.contractType;

        // Add sorting
        if (sortBy) apiParams.sortBy = sortBy;
        if (sortOrder) apiParams.sortOrder = sortOrder;

        return apiParams;
    }

    /**
     * Validates employee data before API calls
     */
    private validateEmployeeData(data: EmployeeCreatePayload): void {
        const errors: string[] = [];

        if (!data.fullName?.trim()) errors.push('Full name is required');
        if (!data.email?.trim()) errors.push('Email is required');
        if (!data.phone?.trim()) errors.push('Phone is required');
        if (!data.position?.trim()) errors.push('Position is required');
        if (!data.birthDate) errors.push('Birth date is required');
        if (!data.hireDate) errors.push('Hire date is required');

        // Email validation
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
        }

        // Date validations
        if (data.birthDate && new Date(data.birthDate) > new Date()) {
            errors.push('Birth date cannot be in the future');
        }

        if (data.hireDate && new Date(data.hireDate) > new Date()) {
            errors.push('Hire date cannot be in the future');
        }

        if (errors.length > 0) {
            throw new Error(`Validation errors: ${errors.join(', ')}`);
        }
    }

    /**
     * Cache management methods
     */
    private generateCacheKey(params: EmployeeSearchParams): string {
        return JSON.stringify({
            role: params.role,
            isActive: params.isActive,
            contractType: params.contractType,
            position: params.position
        });
    }

    private getFromCache(key: string): EmployeeListItem[] | null {
        const cached = this.employeeListCache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
        if (isExpired) {
            this.employeeListCache.delete(key);
            return null;
        }

        return cached.data;
    }

    private setCache(key: string, data: EmployeeListItem[]): void {
        this.employeeListCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    private clearCache(): void {
        this.employeeListCache.clear();
    }

    /**
     * Client-side pagination for cached data
     */
    private paginateData(
        data: EmployeeListItem[],
        page: number,
        size: number
    ): PaginatedApiResponse<EmployeeListItem> {
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedData = data.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            pagination: {
                currentPage: page,
                pageSize: size,
                totalItems: data.length,
                totalPages: Math.ceil(data.length / size),
                hasNext: endIndex < data.length,
                hasPrevious: page > 0
            },
            success: true
        };
    }

    /**
     * Creates standardized error result
     */
    private createErrorResult(error: unknown, params?: any): EmployeesApiResult<any> {
        const errorMessage = this.extractErrorMessage(error);

        return {
            success: false,
            error: errorMessage,
            details: error,
            data: params ? this.createEmptyResponse(params) : undefined
        };
    }

    /**
     * Creates empty response for error cases
     */
    private createEmptyResponse(params: EmployeeSearchParams): PaginatedApiResponse<EmployeeListItem> {
        return {
            data: [],
            pagination: {
                currentPage: params.page || 0,
                pageSize: params.size || 20,
                totalItems: 0,
                totalPages: 0,
                hasNext: false,
                hasPrevious: false
            },
            success: false,
            message: 'Failed to fetch employees'
        };
    }

    /**
     * Extracts user-friendly error message from various error types
     */
    private extractErrorMessage(error: unknown): string {
        if (ApiError.isApiError(error)) {
            switch (error.status) {
                case 401:
                    return 'Sesja wygasła. Zaloguj się ponownie.';
                case 403:
                    return 'Brak uprawnień do tej operacji.';
                case 404:
                    return 'Nie znaleziono pracownika.';
                case 409:
                    return 'Pracownik z tym adresem email już istnieje.';
                case 422:
                    return 'Nieprawidłowe dane pracownika.';
                case 429:
                    return 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.';
                case 500:
                    return 'Błąd serwera. Spróbuj ponownie później.';
                case 503:
                    return 'Serwis tymczasowo niedostępny.';
                default:
                    return error.data?.message || error.message || 'Nieznany błąd API';
            }
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return 'Żądanie zostało anulowane (timeout).';
            }
            if (error.message.includes('fetch')) {
                return 'Błąd połączenia z serwerem.';
            }
            return error.message;
        }

        return 'Wystąpił nieoczekiwany błąd.';
    }
}

// ========================================================================================
// EXPORTS
// ========================================================================================

// Export singleton instance
export const employeesApi = new EmployeesApi();

// Default export
export default employeesApi;