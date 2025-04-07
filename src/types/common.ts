// src/types/common.ts
// Wspólne typy używane w różnych częściach aplikacji

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

// Status zatwierdzenia usługi
export enum ServiceApprovalStatus {
    PENDING = 'PENDING',       // Oczekiwanie na potwierdzenie
    APPROVED = 'APPROVED',     // Zatwierdzona przez klienta
    REJECTED = 'REJECTED'      // Odrzucona przez klienta
}


// Definicja typu dla usługi wybranej w protokole
export interface SelectedService {
    id: string;
    name: string;
    price: number;         // Cena jednostkowa
    discountType: DiscountType;
    discountValue: number;
    finalPrice: number;    // Cena końcowa (po uwzględnieniu ilości i rabatu)
    approvalStatus?: ServiceApprovalStatus;
    addedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    confirmationMessage?: string;
    clientMessage?: string;
    note?: string;
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