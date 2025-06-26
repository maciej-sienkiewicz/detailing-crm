// src/types/employeeTypes.ts
// Rozszerzone typy dla modułu pracowników - zaktualizowane

import { Employee, EmployeeDocument } from './employee';

// Typy uprawnień użytkowników
export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE'
}

export const UserRoleLabels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.MANAGER]: 'Menedżer',
    [UserRole.EMPLOYEE]: 'Pracownik'
};

// Typy umów
export enum ContractType {
    EMPLOYMENT = 'EMPLOYMENT',
    B2B = 'B2B',
    MANDATE = 'MANDATE'
}

export const ContractTypeLabels: Record<ContractType, string> = {
    [ContractType.EMPLOYMENT]: 'Umowa o pracę',
    [ContractType.B2B]: 'Umowa B2B',
    [ContractType.MANDATE]: 'Umowa zlecenie'
};

// Rozszerzony typ pracownika z dodatkowymi danymi HR
export interface ExtendedEmployee extends Employee {
    role: UserRole;
    hourlyRate?: number;
    bonusFromRevenue?: number; // procent od obrotu
    isActive: boolean;
    lastLoginDate?: string;
    workingHoursPerWeek?: number;
    contractType?: ContractType;
    emergencyContact?: {
        name: string;
        phone: string;
    };
    permissions?: string[]; // Lista uprawnień użytkownika
    notes?: string; // Dodatkowe notatki o pracowniku
}

// Typy uprawnień w systemie
export interface Permission {
    id: string;
    name: string;
    description: string;
    category: 'employees' | 'clients' | 'finances' | 'settings' | 'reports' | 'system';
    level: 'view' | 'edit' | 'delete' | 'admin';
}

// Dane do tworzenia/edycji pracownika
export interface EmployeeFormData {
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

// Filtry dla listy pracowników
export interface EmployeeFilters {
    searchQuery?: string;
    position?: string;
    role?: UserRole;
    isActive?: boolean;
    contractType?: ContractType;
}

// Statystyki pracowników
export interface EmployeeStats {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    averageAge: number;
    averageTenure: number; // w miesiącach
    roleDistribution: Record<UserRole, number>;
    contractTypeDistribution: Record<ContractType, number>;
}

// Dane wynagrodzenia
export interface SalaryData {
    employeeId: string;
    hourlyRate: number;
    bonusFromRevenue: number;
    workingHoursPerWeek: number;
    contractType: ContractType;
    overtimeRate: number;
    vacationDays: number;
    sickLeaveDays: number;
    notes?: string;
    effectiveDate: string; // Data wejścia w życie
}

// Historia zmian wynagrodzenia
export interface SalaryHistory {
    id: string;
    employeeId: string;
    previousRate: number;
    newRate: number;
    changeDate: string;
    changeReason: string;
    changedBy: string;
}

// Szablon dokumentu
export interface DocumentTemplate {
    id: string;
    name: string;
    description: string;
    category: 'hr' | 'legal' | 'forms' | 'reports';
    fileType: 'pdf' | 'doc' | 'xlsx';
    downloadUrl: string;
    lastUpdated: string;
    isPopular?: boolean;
    requiredRole?: UserRole; // Minimalna rola do dostępu
}

// Akcje użytkownika (dla audytu)
export interface UserAction {
    id: string;
    userId: string;
    userName: string;
    action: string;
    targetType: 'employee' | 'document' | 'salary' | 'permissions';
    targetId: string;
    details: string;
    timestamp: string;
    ipAddress?: string;
}

// Dane do API pracowników
export interface EmployeeApiResponse {
    employees: ExtendedEmployee[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        pageSize: number;
    };
    stats?: EmployeeStats;
}

export interface EmployeeApiRequest {
    filters?: EmployeeFilters;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Helpery do pracy z pracownikami
export const EmployeeHelpers = {
    /**
     * Sprawdza czy użytkownik ma uprawnienia do wykonania akcji
     */
    hasPermission: (userRole: UserRole, requiredRole: UserRole): boolean => {
        const roleHierarchy = {
            [UserRole.EMPLOYEE]: 1,
            [UserRole.MANAGER]: 2,
            [UserRole.ADMIN]: 3
        };

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    },

    /**
     * Oblicza wiek na podstawie daty urodzenia
     */
    calculateAge: (birthDate: string): number => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    },

    /**
     * Oblicza staż pracy w miesiącach
     */
    calculateTenureInMonths: (hireDate: string): number => {
        if (!hireDate) return 0;
        const today = new Date();
        const hire = new Date(hireDate);

        const yearsDiff = today.getFullYear() - hire.getFullYear();
        const monthsDiff = today.getMonth() - hire.getMonth();

        return yearsDiff * 12 + monthsDiff;
    },

    /**
     * Formatuje staż pracy dla wyświetlenia
     */
    formatTenure: (hireDate: string): string => {
        const months = EmployeeHelpers.calculateTenureInMonths(hireDate);

        if (months < 1) return 'Mniej niż miesiąc';
        if (months < 12) return `${months} ${months === 1 ? 'miesiąc' : months < 5 ? 'miesiące' : 'miesięcy'}`;

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        let result = `${years} ${years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}`;
        if (remainingMonths > 0) {
            result += ` i ${remainingMonths} ${remainingMonths === 1 ? 'miesiąc' : remainingMonths < 5 ? 'miesiące' : 'miesięcy'}`;
        }

        return result;
    },

    /**
     * Oblicza miesięczne wynagrodzenie
     */
    calculateMonthlySalary: (hourlyRate: number, hoursPerWeek: number): number => {
        return hourlyRate * hoursPerWeek * 4.33; // 4.33 tygodni w miesiącu średnio
    },

    /**
     * Generuje inicjały pracownika
     */
    getInitials: (fullName: string): string => {
        return fullName
            .split(' ')
            .map(name => name.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    },

    /**
     * Generuje deterministyczny kolor na podstawie imienia
     */
    generateColor: (fullName: string): string => {
        const colors = [
            '#1a365d', '#2c5aa0', '#0f2027', '#059669', '#d97706',
            '#dc2626', '#0ea5e9', '#7c3aed', '#059669', '#be123c',
            '#0369a1', '#7c2d12', '#166534', '#92400e', '#b91c1c'
        ];

        // Prosty hash na podstawie imienia
        let hash = 0;
        for (let i = 0; i < fullName.length; i++) {
            hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    },

    /**
     * Sprawdza czy pracownik jest aktywny
     */
    isActiveEmployee: (employee: ExtendedEmployee): boolean => {
        return employee.isActive && !!employee.hireDate;
    },

    /**
     * Filtruje pracowników według kryteriów
     */
    filterEmployees: (employees: ExtendedEmployee[], filters: EmployeeFilters): ExtendedEmployee[] => {
        return employees.filter(employee => {
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const searchFields = [
                    employee.fullName,
                    employee.email,
                    employee.phone,
                    employee.position
                ].join(' ').toLowerCase();

                if (!searchFields.includes(query)) return false;
            }

            if (filters.position && !employee.position.toLowerCase().includes(filters.position.toLowerCase())) {
                return false;
            }

            if (filters.role && employee.role !== filters.role) {
                return false;
            }

            if (filters.isActive !== undefined && employee.isActive !== filters.isActive) {
                return false;
            }

            if (filters.contractType && employee.contractType !== filters.contractType) {
                return false;
            }

            return true;
        });
    }
};