// Dodajemy enum dla statusów protokołu
export enum ProtocolStatus {
    PENDING_APPROVAL = 'PENDING_APPROVAL',  // Do zatwierdzenia
    CONFIRMED = 'CONFIRMED',                // Potwierdzona
    IN_PROGRESS = 'IN_PROGRESS',            // W realizacji
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',  // Oczekiwanie na odbiór
    COMPLETED = 'COMPLETED'                 // Wydano
}

// Definicja typu dla usługi wybranej w protokole
export interface SelectedService {
    id: string;
    name: string;
    price: number;
    discount: number;  // wartość rabatu w procentach
    finalPrice: number; // cena po rabacie
}

// Definicja typu dla protokołu przyjęcia pojazdu
export interface CarReceptionProtocol {
    id: string;
    startDate: string;
    endDate: string;
    licensePlate: string;
    make: string;
    model: string;
    productionYear: number;
    mileage: number;
    keysProvided: boolean;
    documentsProvided: boolean;
    ownerName: string;
    companyName?: string;
    taxId?: string;
    email: string;
    phone: string;
    notes?: string;
    selectedServices: SelectedService[];
    status: ProtocolStatus; // Nowe pole statusu
    statusUpdatedAt?: string; // Data ostatniej aktualizacji statusu
    createdAt: string;
    updatedAt: string;
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

// Definicja typu dla pracownika
export interface Employee {
    id: string;
    fullName: string;
    birthDate: string;
    hireDate: string;
    position: string;
    email: string;
    phone: string;
    color: string;
}

// Definicja typu dla usługi
export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    vatRate: number;
}

// Definicje typów dla całej aplikacji
export interface Appointment {
    id: string;
    title: string;
    start: Date;
    end: Date;
    customerId?: string;
    vehicleId?: string;
    serviceType: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    notes?: string;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    vehicles: Vehicle[];
}

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    customerId: string;
}

export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'manager' | 'employee';
}

// Typ do obsługi bocznego menu
export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path?: string;
    submenu?: MenuItem[];
    expanded?: boolean;
}

// Obiekty pomocnicze dla statusów
export const ProtocolStatusLabels: Record<ProtocolStatus, string> = {
    [ProtocolStatus.PENDING_APPROVAL]: 'Do zatwierdzenia',
    [ProtocolStatus.CONFIRMED]: 'Potwierdzona',
    [ProtocolStatus.IN_PROGRESS]: 'W realizacji',
    [ProtocolStatus.READY_FOR_PICKUP]: 'Oczekiwanie na odbiór',
    [ProtocolStatus.COMPLETED]: 'Wydano'
};

export const ProtocolStatusColors: Record<ProtocolStatus, string> = {
    [ProtocolStatus.PENDING_APPROVAL]: '#f39c12', // Pomarańczowy
    [ProtocolStatus.CONFIRMED]: '#3498db',        // Niebieski
    [ProtocolStatus.IN_PROGRESS]: '#9b59b6',      // Fioletowy
    [ProtocolStatus.READY_FOR_PICKUP]: '#2ecc71', // Zielony
    [ProtocolStatus.COMPLETED]: '#7f8c8d'         // Szary
};