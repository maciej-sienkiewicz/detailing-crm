// Dodajemy enum dla statusów protokołu
export enum ProtocolStatus {
    SCHEDULED = 'SCHEDULED',                  // Zaplanowano
    IN_PROGRESS = 'IN_PROGRESS',              // W realizacji
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',    // Oczekiwanie na odbiór
    COMPLETED = 'COMPLETED'                   // Wydano
}

// Dodajemy enum dla statusów wizyt - używamy tych samych co dla protokołów
export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',                  // Zaplanowano
    IN_PROGRESS = 'IN_PROGRESS',              // W realizacji
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',    // Oczekiwanie na odbiór
    COMPLETED = 'COMPLETED'                   // Wydano
}

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',  // Rabat procentowy (np. 10%)
    AMOUNT = 'AMOUNT',          // Rabat kwotowy (np. obniżka o 100 zł)
    FIXED_PRICE = 'FIXED_PRICE' // Stała cena (ustalona kwota końcowa)
}

// Etykiety dla typów rabatów
export const DiscountTypeLabels: Record<DiscountType, string> = {
    [DiscountType.PERCENTAGE]: 'Rabat procentowy',
    [DiscountType.AMOUNT]: 'Rabat kwotowy',
    [DiscountType.FIXED_PRICE]: 'Cena finalna'
};

// Definicja typu dla usługi wybranej w protokole
// Dodanie do modelu typu usługi - stan zatwierdzenia
export enum ServiceApprovalStatus {
    PENDING = 'PENDING',       // Oczekiwanie na potwierdzenie
    APPROVED = 'APPROVED',     // Zatwierdzona przez klienta
    REJECTED = 'REJECTED'      // Odrzucona przez klienta
}

// Rozszerzenie interfejsu SelectedService o nowe pola
export interface SelectedService {
    id: string;
    name: string;
    price: number;
    discountType: DiscountType;
    discountValue: number;
    finalPrice: number;
    approvalStatus?: ServiceApprovalStatus; // Status zatwierdzenia usługi
    addedAt?: string;                      // Data dodania usługi
    approvedAt?: string;                   // Data zatwierdzenia usługi
    rejectedAt?: string;                   // Data odrzucenia usługi
    confirmationMessage?: string;          // Wiadomość wysłana do klienta
    clientMessage?: string;                // Odpowiedź klienta
}

// Obiekty pomocnicze dla statusów zatwierdzenia usług
export const ServiceApprovalStatusLabels: Record<ServiceApprovalStatus, string> = {
    [ServiceApprovalStatus.PENDING]: 'Oczekiwanie na potwierdzenie',
    [ServiceApprovalStatus.APPROVED]: 'Zatwierdzona',
    [ServiceApprovalStatus.REJECTED]: 'Odrzucona'
};

export const ServiceApprovalStatusColors: Record<ServiceApprovalStatus, string> = {
    [ServiceApprovalStatus.PENDING]: '#95a5a6',     // Szary
    [ServiceApprovalStatus.APPROVED]: '#2ecc71',    // Zielony
    [ServiceApprovalStatus.REJECTED]: '#e74c3c'     // Czerwony
};

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
    status: ProtocolStatus;
    statusUpdatedAt?: string;
    createdAt: string;
    updatedAt: string;
    appointmentId?: string;
    referralSource?: 'regular_customer' | 'recommendation' | 'search_engine' | 'social_media' | 'local_ad' | 'other';
    otherSourceDetails?: string;

    // Dodane i istniejące rozszerzenia
    comments?: any[];
    purchaseInvoices?: any[];
    vehicleIssues?: any[];
    vehicleImages?: VehicleImage[]; // Nowe pole dla zdjęć pojazdu
}

export interface VehicleImage {
    id: string;
    url: string;
    name: string;
    size: number;
    type: string;
    createdAt: string;
    description?: string; // Opcjonalny opis zdjęcia
    location?: string;    // Opcjonalna lokalizacja uszkodzenia/zdjęcia
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
    status: AppointmentStatus;
    notes?: string;
    statusUpdatedAt?: string;
    isProtocol?: boolean; // Flag wskazujący, czy wydarzenie pochodzi z protokołu
}

// Expanded client interface with CRM features
export interface ClientExpanded {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    taxId?: string;

    // CRM metrics
    totalVisits: number;
    totalTransactions: number;
    abandonedSales: number;
    totalRevenue: number;
    contactAttempts: number;
    lastVisitDate?: string;
    notes?: string;

    // Relations
    vehicles: string[]; // IDs of vehicles
}

// Extended vehicle interface with tracking features
export interface VehicleExpanded {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    vin?: string;

    // Tracking metrics
    totalServices: number;
    lastServiceDate?: string;
    serviceHistory: ServiceHistoryItem[];
    totalSpent: number;

    // Relations
    ownerIds: string[]; // IDs of owners (can have multiple)
}

// Service history tracking
export interface ServiceHistoryItem {
    id: string;
    date: string;
    serviceType: string;
    description: string;
    price: number;
    protocolId?: string;
}

// Contact attempt tracking
export interface ContactAttempt {
    id: string;
    clientId: string;
    date: string;
    type: 'PHONE' | 'EMAIL' | 'SMS' | 'OTHER';
    description: string;
    result: 'SUCCESS' | 'NO_ANSWER' | 'CALLBACK_REQUESTED' | 'REJECTED';
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

// Obiekty pomocnicze dla statusów protokołów
export const ProtocolStatusLabels: Record<ProtocolStatus, string> = {
    [ProtocolStatus.SCHEDULED]: 'Stworzono zlecenie',
    [ProtocolStatus.IN_PROGRESS]: 'W realizacji',
    [ProtocolStatus.READY_FOR_PICKUP]: 'Oczekiwanie na odbiór',
    [ProtocolStatus.COMPLETED]: 'Wydano'
};

export const ProtocolStatusColors: Record<ProtocolStatus, string> = {
    [ProtocolStatus.SCHEDULED]: '#3498db',        // Niebieski
    [ProtocolStatus.IN_PROGRESS]: '#9b59b6',      // Fioletowy
    [ProtocolStatus.READY_FOR_PICKUP]: '#2ecc71', // Zielony
    [ProtocolStatus.COMPLETED]: '#7f8c8d'         // Szary
};

// Obiekty pomocnicze dla statusów wizyt
export const AppointmentStatusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: 'Stworzono zlecenie',
    [AppointmentStatus.IN_PROGRESS]: 'W realizacji',
    [AppointmentStatus.READY_FOR_PICKUP]: 'Oczekiwanie na odbiór',
    [AppointmentStatus.COMPLETED]: 'Wydano'
};

export const AppointmentStatusColors: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: '#3498db',        // Niebieski
    [AppointmentStatus.IN_PROGRESS]: '#9b59b6',      // Fioletowy
    [AppointmentStatus.READY_FOR_PICKUP]: '#2ecc71', // Zielony
    [AppointmentStatus.COMPLETED]: '#7f8c8d'         // Szary
};