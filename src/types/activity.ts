// Typy aktywności w systemie CRM dla firmy motoryzacyjno-detailingowej

// Kategorie aktywności (usunięto 'call' - telefony)
export type ActivityCategory =
    | 'APPOINTMENT'  // Wizyty/rezerwacje
    | 'protocol'     // Protokoły przyjęcia pojazdów
    | 'comment'      // Komentarze i notatki
    | 'client'       // Akcje związane z klientami
    | 'vehicle'      // Akcje związane z pojazdami
    | 'notification' // Powiadomienia systemowe
    | 'system';      // Działania systemowe

// Statusy aktywności
export type ActivityStatus = 'success' | 'pending' | 'error' | null;

// Typy encji powiązanych z aktywnościami
export type EntityType =
    | 'APPOINTMENT'  // Wizyta/rezerwacja
    | 'protocol'     // Protokół przyjęcia
    | 'client'       // Klient
    | 'vehicle'      // Pojazd
    | 'invoice'      // Faktura
    | 'comment'      // Komentarz
    | 'service';     // Usługa detailingowa

// Encja powiązana z aktywnością
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
    };
}

// Pojedyncza aktywność w systemie
export interface ActivityItem {
    id: string;
    timestamp: string;
    category: ActivityCategory;
    message: string;
    userId?: string;
    userName?: string;
    userColor?: string;
    entityType?: EntityType;
    entityId?: string;
    entities?: ActivityEntity[];
    status?: ActivityStatus;
    statusText?: string;
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