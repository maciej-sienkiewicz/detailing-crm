// src/types/service.ts
// Typy związane z usługami

// Definicja typu dla usługi
export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    vatRate: number;
}