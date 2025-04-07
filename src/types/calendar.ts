// src/types/calendar.ts
// Typy związane z kalendarzem i zarządzaniem kolorami

// Definicja typu dla koloru kalendarza
export interface CalendarColor {
    id: string;
    name: string;  // Nazwa identyfikująca kolor (np. nazwa usługi lub nazwisko pracownika)
    color: string; // Wartość koloru w formacie HEX (np. #3498db)
}