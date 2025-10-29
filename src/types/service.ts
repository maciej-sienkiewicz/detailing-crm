// src/types/service.ts
// Typy związane z usługami

// Typ ceny - NET (netto) lub GROSS (brutto) - używany przy tworzeniu/edycji
export enum PriceType {
    NET = 'netto',
    GROSS = 'brutto'
}

// Etykiety dla typów cen
export const PriceTypeLabels: Record<PriceType, string> = {
    [PriceType.NET]: 'Netto',
    [PriceType.GROSS]: 'Brutto'
};

// Struktura ceny dla REQUEST (tworzenie/edycja usługi)
export interface ServicePriceInput {
    inputPrice: number;
    inputType: PriceType;
}

// Struktura ceny dla RESPONSE (odpowiedź z backendu - wyliczone wartości)
export interface PriceResponse {
    priceNetto: number;
    priceBrutto: number;
    taxAmount: number;
}

// Definicja typu dla usługi (RESPONSE z backendu)
export interface Service {
    id: string;
    name: string;
    description?: string;
    price: PriceResponse;  // Backend zwraca już wyliczone wartości
    vatRate: number;
    createdAt?: string;
    updatedAt?: string;
}