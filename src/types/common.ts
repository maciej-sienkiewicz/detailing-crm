import { PriceResponse } from './service';

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    AMOUNT = 'AMOUNT',
    FIXED_PRICE = 'FIXED_PRICE'
}

// Status zatwierdzenia usługi
export enum ServiceApprovalStatus {
    PENDING = 'PENDING',       // Oczekiwanie na potwierdzenie
    APPROVED = 'APPROVED',     // Zatwierdzona przez klienta
    REJECTED = 'REJECTED'      // Odrzucona przez klienta
}

export interface SelectedService {
    id: string;
    name: string;
    quantity: number;
    basePrice: PriceResponse;
    discountType: DiscountType;
    discountValue: number;
    finalPrice: PriceResponse;
    approvalStatus?: ServiceApprovalStatus;
    addedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    confirmationMessage?: string;
    clientMessage?: string;
    note?: string;
}