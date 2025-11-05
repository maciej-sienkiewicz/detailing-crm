import {apiClientNew, ApiError, PaginatedApiResponse, PaginationParams} from '../shared/api/apiClientNew';
import {EmployeeDocument} from '../types';
import {ContractType, EmployeeFilters, ExtendedEmployee, UserRole} from '../types/employeeTypes';

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

export interface EmployeeUpdatePayload extends Partial<EmployeeCreatePayload> {
    id: string;
}

export interface EmployeeSearchParams extends EmployeeFilters, PaginationParams {
    sortBy?: 'fullName' | 'position' | 'email' | 'hireDate' | 'role' | 'hourlyRate' | 'isActive';
    sortOrder?: 'asc' | 'desc';
}

export interface EmployeeStatistics {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    averageAge: number;
    averageTenure: number;
    roleDistribution: Record<UserRole, number>;
    contractTypeDistribution: Record<ContractType, number>;
}

export interface DocumentUploadPayload {
    employeeId: string;
    name: string;
    type: string;
    description?: string;
    file: File;
}

export interface DocumentUploadResponse {
    success: boolean;
    message: string;
    id: string;
}

export interface EmployeesApiResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

class EmployeesApi {
    private readonly baseEndpoint = '/employees';
    private employeeListCache: Map<string, { data: EmployeeListItem[]; timestamp: number }> = new Map();
    private readonly cacheTimeout = 5 * 60 * 1000;

    async getEmployeesList(params: EmployeeSearchParams = {}): Promise<EmployeesApiResult<PaginatedApiResponse<EmployeeListItem>>> {
        try {
            const { page = 0, size = 20, sortBy = 'fullName', sortOrder = 'asc', ...filterParams } = params;

            const cacheKey = this.generateCacheKey(params);
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData && !filterParams.searchQuery) {
                return {
                    success: true,
                    data: this.paginateData(cachedData, page, size)
                };
            }

            const apiParams = this.prepareSearchParams(filterParams, sortBy, sortOrder);

            const response = await apiClientNew.getWithPagination<EmployeeListItem>(
                `${this.baseEndpoint}/list`,
                apiParams,
                { page, size },
                { timeout: 15000 }
            );

            if (!filterParams.searchQuery && response.data.length > 0) {
                this.setCache(cacheKey, response.data);
            }

            return {
                success: true,
                data: response
            };

        } catch (error) {
            return this.createErrorResult(error, params);
        }
    }

    async getEmployeeById(employeeId: string): Promise<EmployeesApiResult<ExtendedEmployee>> {
        try {
            const response = await apiClientNew.get<ExtendedEmployee>(
                `${this.baseEndpoint}/${employeeId}`,
                undefined,
                { timeout: 10000 }
            );

            return {
                success: true,
                data: response
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async createEmployee(employeeData: EmployeeCreatePayload): Promise<EmployeesApiResult<ExtendedEmployee>> {
        try {
            this.validateEmployeeData(employeeData);

            const response = await apiClientNew.post<ExtendedEmployee>(
                this.baseEndpoint,
                employeeData,
                { timeout: 10000 }
            );

            this.clearCache();

            return {
                success: true,
                data: response
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async updateEmployee(employeeData: EmployeeUpdatePayload): Promise<EmployeesApiResult<ExtendedEmployee>> {
        try {
            if (!employeeData.id) {
                throw new Error('Employee ID is required for update');
            }

            const response = await apiClientNew.put<ExtendedEmployee>(
                `${this.baseEndpoint}/${employeeData.id}`,
                employeeData,
                { timeout: 10000 }
            );

            this.clearCache();

            return {
                success: true,
                data: response
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async deleteEmployee(employeeId: string): Promise<EmployeesApiResult<void>> {
        try {
            await apiClientNew.delete(
                `${this.baseEndpoint}/${employeeId}`,
                { timeout: 10000 }
            );

            this.clearCache();

            return {
                success: true
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async getEmployeeDocuments(employeeId: string): Promise<EmployeesApiResult<EmployeeDocument[]>> {
        try {
            const response = await apiClientNew.get<EmployeeDocument[]>(
                `${this.baseEndpoint}/${employeeId}/documents`,
                undefined,
                { timeout: 10000 }
            );

            return {
                success: true,
                data: response
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async uploadEmployeeDocument(
        payload: DocumentUploadPayload,
        onProgress?: (progress: number) => void
    ): Promise<EmployeesApiResult<DocumentUploadResponse>> {
        try {
            if (!payload.file) {
                throw new Error('File is required for document upload');
            }

            const formData = new FormData();
            formData.append('employeeId', payload.employeeId);
            formData.append('name', payload.name);
            formData.append('type', payload.type);
            if (payload.description) {
                formData.append('description', payload.description);
            }
            formData.append('file', payload.file);

            // Użyj bezpośrednio fetch z właściwymi headerami
            const response = await fetch(`${apiClientNew['baseUrl']}${this.baseEndpoint}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    // NIE dodawaj Content-Type - browser ustawi automatycznie multipart/form-data
                },
                body: formData
            });

            if (!response.ok) {
                throw new ApiError(response.status, response.statusText);
            }

            const result = await response.json();

            return {
                success: true,
                data: result
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async deleteEmployeeDocument(documentId: string): Promise<EmployeesApiResult<void>> {
        try {
            await apiClientNew.delete(
                `${this.baseEndpoint}/documents/${documentId}`,
                { timeout: 10000 }
            );

            return {
                success: true
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async downloadEmployeeDocument(documentId: string): Promise<EmployeesApiResult<{ blob: Blob; filename: string }>> {
        try {

            const baseUrl = 'http://localhost:8080/api';
            const token = localStorage.getItem('auth_token');

            if (!token) {
                throw new Error('Brak tokenu autoryzacji');
            }

            // 🔧 Użyj fetch dla pobierania plików binarnych
            const response = await fetch(`${baseUrl}/employees/documents/${documentId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/octet-stream'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Dokument nie został znaleziony');
                } else if (response.status === 403) {
                    throw new Error('Brak uprawnień do pobrania dokumentu');
                } else {
                    throw new Error(`Błąd serwera: ${response.status} ${response.statusText}`);
                }
            }

            // Pobierz blob
            const blob = await response.blob();

            // Wyciągnij nazwę pliku z nagłówka Content-Disposition
            let filename = `document_${documentId}`;
            const contentDisposition = response.headers.get('Content-Disposition');

            if (contentDisposition) {
                // Szukaj filename= w nagłówku
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            return {
                success: true,
                data: { blob, filename }
            };

        } catch (error: any) {
            console.error('❌ Error downloading document:', error);

            return {
                success: false,
                error: error.message || 'Nie udało się pobrać dokumentu',
                details: error
            };
        }
    }

    async getDocumentDownloadUrl(documentId: string, expirationMinutes: number = 60): Promise<EmployeesApiResult<{downloadUrl: string, expiresInMinutes: number}>> {
        try {
            const response = await apiClientNew.get<{downloadUrl: string, expiresInMinutes: number}>(
                `${this.baseEndpoint}/documents/${documentId}/url`,
                { expirationMinutes },
                { timeout: 10000 }
            );

            return {
                success: true,
                data: response
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async getEmployeeStatistics(): Promise<EmployeesApiResult<EmployeeStatistics>> {
        try {
            const response = await apiClientNew.get<EmployeeStatistics>(
                `${this.baseEndpoint}/statistics`,
                undefined,
                { timeout: 10000 }
            );

            return {
                success: true,
                data: response
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async bulkUpdateEmployees(updates: EmployeeUpdatePayload[]): Promise<EmployeesApiResult<ExtendedEmployee[]>> {
        try {
            const response = await apiClientNew.patch<ExtendedEmployee[]>(
                `${this.baseEndpoint}/bulk-update`,
                { updates },
                { timeout: 30000 }
            );

            this.clearCache();

            return {
                success: true,
                data: response
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async exportEmployees(
        format: 'csv' | 'xlsx' | 'pdf' = 'xlsx',
        filters?: EmployeeFilters
    ): Promise<EmployeesApiResult<Blob>> {
        try {
            const params = filters ? this.prepareSearchParams(filters) : {};
            params.format = format;

            const baseUrl = apiClientNew['baseUrl'];
            const url = new URL(`${baseUrl}${this.baseEndpoint}/export`);

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value.toString());
                }
            });

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': format === 'csv' ? 'text/csv' :
                        format === 'pdf' ? 'application/pdf' :
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            if (!response.ok) {
                throw new ApiError(response.status, response.statusText);
            }

            const blob = await response.blob();

            return {
                success: true,
                data: blob
            };

        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    private prepareSearchParams(
        params: EmployeeFilters,
        sortBy?: string,
        sortOrder?: string
    ): Record<string, any> {
        const apiParams: Record<string, any> = {};

        if (params.searchQuery) apiParams.search = params.searchQuery;
        if (params.position) apiParams.position = params.position;
        if (params.role) apiParams.role = params.role;
        if (params.isActive !== undefined) apiParams.isActive = params.isActive;
        if (params.contractType) apiParams.contractType = params.contractType;

        if (sortBy) apiParams.sortBy = sortBy;
        if (sortOrder) apiParams.sortOrder = sortOrder;

        return apiParams;
    }

    private validateEmployeeData(data: EmployeeCreatePayload): void {
        const errors: string[] = [];

        if (!data.fullName?.trim()) errors.push('Full name is required');
        if (!data.email?.trim()) errors.push('Email is required');
        if (!data.phone?.trim()) errors.push('Phone is required');
        if (!data.position?.trim()) errors.push('Position is required');
        if (!data.birthDate) errors.push('Birth date is required');
        if (!data.hireDate) errors.push('Hire date is required');

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
        }

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

    private createErrorResult(error: unknown, params?: any): EmployeesApiResult<any> {
        const errorMessage = this.extractErrorMessage(error);

        return {
            success: false,
            error: errorMessage,
            details: error,
            data: params ? this.createEmptyResponse(params) : undefined
        };
    }

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

export const employeesApi = new EmployeesApi();
