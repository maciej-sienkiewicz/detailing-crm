// src/types/employee.ts
// Typy związane z pracownikami

// Definicja typu dla pracownika
export interface Employee {
    id: string;
    fullName: string;
    birthDate: string;
    hireDate: string;
    position: string;
    email: string;
    phone: string;
}

// Definicja typu dla dokumentu pracownika
export interface EmployeeDocument {
    id: string;
    employeeId: string;
    name: string;
    type: string;
    uploadDate: string;
    fileUrl?: string;
}