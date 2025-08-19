// src/types/activity.ts
// Updated types for new server response model

// Kategorie aktywności - dopasowane do serwera
export type ActivityCategory =
    | 'APPOINTMENT'  // Wizyty/rezerwacje
    | 'protocol'     // Protokoły przyjęcia pojazdów
    | 'comment'      // Komentarze i notatki (lowercase dla kompatybilności)
    | 'COMMENT'      // Komentarze (uppercase z serwera)
    | 'client'       // Akcje związane z klientami
    | 'vehicle'      // Akcje związane z pojazdami
    | 'notification' // Powiadomienia systemowe
    | 'system'       // Działania systemowe (lowercase)
    | 'SYSTEM';      // Działania systemowe (uppercase z serwera)

// Statusy aktywności - dopasowane do serwera
export type ActivityStatus = 'success' | 'pending' | 'error' | null;

// Typy encji powiązanych z aktywnościami
export type EntityType =
    | 'APPOINTMENT'  // Wizyta/rezerwacja
    | 'protocol'     // Protokół przyjęcia
    | 'client'       // Klient
    | 'vehicle'      // Pojazd
    | 'invoice'      // Faktura
    | 'comment'      // Komentarz
    | 'COMMENT'      // Komentarz (uppercase)
    | 'service';     // Usługa detailingowa

// Encja powiązana z aktywnością - zaktualizowana struktura
export interface ActivityEntity {
    id: string;
    type: EntityType;
    displayName: string;
    relatedId?: string; // ID encji nadrzędnej (np. protokół dla komentarza)
    metadata?: {
        // Dodatkowe metadane specyficzne dla typu encji
        vehicleRegistration?: string;  // Numer rejestracyjny pojazdu
        clientPhone?: string;          // Telefon klienta
        serviceType?: string;          // Typ usługi detailingowej
        appointmentDate?: string;      // Data wizyty
        protocolStatus?: string;       // Status protokołu
        [key: string]: any;            // Elastyczność dla dodatkowych pól
    };
}

// Pojedyncza aktywność w systemie - zaktualizowana struktura
export interface ActivityItem {
    id: string;
    timestamp: string;
    category: ActivityCategory;
    message: string;
    description?: string; // Opcjonalny opis
    userId?: string;           // Zmienione z user_id
    userName?: string;         // Zmienione z user_name
    userColor?: string;        // Generowane po stronie klienta
    entityType?: EntityType;   // Dla kompatybilności wstecznej
    entityId?: string;         // Dla kompatybilności wstecznej
    entities?: ActivityEntity[]; // Połączone primary_entity + related_entities
    status?: ActivityStatus;   // Znormalizowane z serwera
    statusText?: string;       // Zmienione z status_text
    metadata?: {
        // Metadane dla różnych typów aktywności
        notes?: string;                    // Dodatkowe notatki
        previousValue?: string;            // Poprzednia wartość (dla zmian)
        newValue?: string;                 // Nowa wartość (dla zmian)

        // Dla aktywności związanych z wizytami
        appointmentDuration?: number;      // Czas trwania wizyty w minutach
        servicesList?: string[];           // Lista zaplanowanych usług

        // Dla protokołów przyjęcia
        vehicleCondition?: string;         // Stan pojazdu
        damageCount?: number;              // Liczba uszkodzeń

        // Dla komentarzy
        commentType?: 'internal' | 'client'; // Typ komentarza
        isResolved?: boolean;              // Czy komentarz został rozwiązany

        // Dla powiadomień
        notificationType?: 'reminder' | 'alert' | 'info'; // Typ powiadomienia
        notificationContent?: string;      // Treść powiadomienia
        isRead?: boolean;                  // Czy powiadomienie zostało przeczytane

        // Dla działań systemowych
        systemAction?: string;             // Typ działania systemowego
        affectedRecords?: number;          // Liczba zmienionych rekordów

        // Elastyczność dla dodatkowych pól z serwera
        [key: string]: any;
    };
}

// Filtr dla aktywności
export interface ActivityFilter {
    type: 'category' | 'entity' | 'user' | 'all';
    value: string;
}

// Dane podsumowania (uproszczone, bez telefonów)
export interface DailySummaryData {
    date: string;
    appointmentsScheduled: number;      // Zaplanowane wizyty
    protocolsCompleted: number;         // Zakończone protokoły
    vehiclesServiced: number;           // Obsłużone pojazdy
    newClients: number;                 // Nowi klienci
    commentsAdded: number;              // Dodane komentarze
    totalActivities: number;            // Całkowita liczba aktywności
}

// Mapowanie kategorii dla wyświetlania
export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
    'APPOINTMENT': 'Wizyty i rezerwacje',
    'protocol': 'Protokoły przyjęcia',
    'comment': 'Komentarze',
    'COMMENT': 'Komentarze',
    'client': 'Operacje na klientach',
    'vehicle': 'Operacje na pojazdach',
    'notification': 'Powiadomienia',
    'system': 'Działania systemowe',
    'SYSTEM': 'Działania systemowe'
};

// Mapowanie kolorów kategorii
export const CATEGORY_COLORS: Record<string, string> = {
    'APPOINTMENT': '#3498db',
    'protocol': '#2ecc71',
    'comment': '#9b59b6',
    'COMMENT': '#9b59b6',
    'client': '#f39c12',
    'vehicle': '#1abc9c',
    'notification': '#34495e',
    'system': '#95a5a6',
    'SYSTEM': '#95a5a6'
};

// Helper funkcje
export const getCategoryLabel = (category: ActivityCategory): string => {
    return CATEGORY_LABELS[category] || category;
};

export const getCategoryColor = (category: ActivityCategory | string): string => {
    return CATEGORY_COLORS[category] || '#95a5a6';
};

export const normalizeCategory = (category: string): ActivityCategory => {
    // Normalizuje kategorie z serwera do spójnego formatu
    const normalized = category.toUpperCase();

    switch (normalized) {
        case 'SYSTEM':
            return 'SYSTEM';
        case 'APPOINTMENT':
            return 'APPOINTMENT';
        case 'PROTOCOL':
            return 'protocol';
        case 'COMMENT':
            return 'COMMENT';
        case 'CLIENT':
            return 'client';
        case 'VEHICLE':
            return 'vehicle';
        case 'NOTIFICATION':
            return 'notification';
        default:
            return category as ActivityCategory;
    }
};