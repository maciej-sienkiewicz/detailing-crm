// Kategorie aktywności
export type ActivityCategory =
    | 'APPOINTMENT'  // Wizyty/rezerwacje
    | 'PROTOCOL'     // Protokoły przyjęcia pojazdów
    | 'COMMENT'      // Komentarze i notatki
    | 'CLIENT'       // Akcje związane z klientami
    | 'VEHICLE'      // Akcje związane z pojazdami
    | 'NOTIFICATION' // Powiadomienia systemowe
    | 'SYSTEM';      // Działania systemowe

// Statusy aktywności
export type ActivityStatus = 'success' | 'pending' | 'error' | null;

// Typy encji powiązanych z aktywnościami
export type EntityType =
    | 'APPOINTMENT'  // Wizyta/rezerwacja
    | 'PROTOCOL'     // Protokół przyjęcia
    | 'CLIENT'       // Klient
    | 'VEHICLE'      // Pojazd
    | 'INVOICE'      // Faktura
    | 'COMMENT'      // Komentarz
    | 'SERVICE';     // Usługa detailingowa

// ✅ POPRAWKA: Nowa struktura encji zgodna z odpowiedzią serwera
export interface RelatedEntity {
    id: string;
    type: EntityType;
    name: string;
}

// Encja powiązana z aktywnością (stara struktura - dla kompatybilności)
export interface ActivityEntity {
    id: string;
    type: EntityType;
    displayName: string;
    relatedId?: string;
    metadata?: {
        vehicleRegistration?: string;
        clientPhone?: string;
        serviceType?: string;
        appointmentDate?: string;
        protocolStatus?: string;
    };
}

// ✅ POPRAWKA: Zaktualizowana struktura ActivityItem zgodna z nową odpowiedzią serwera
export interface ActivityItem {
    id: string;
    timestamp: string;
    category: ActivityCategory;
    message: string;
    description?: string | null;       // Opis aktywności
    user_id?: string;                  // ID użytkownika (snake_case z serwera)
    user_name?: string;                // Nazwa użytkownika (snake_case z serwera)
    userName?: string;                 // Nazwa użytkownika (camelCase po konwersji)
    userColor?: string;                // Kolor użytkownika
    status?: ActivityStatus | null;
    status_text?: string | null;       // Tekst statusu (snake_case z serwera)
    statusText?: string;               // Tekst statusu (camelCase po konwersji)
    primary_entity?: any | null;       // Główna encja (snake_case z serwera)
    related_entities?: RelatedEntity[]; // Powiązane encje (snake_case z serwera)
    relatedEntities?: RelatedEntity[];  // ✅ KLUCZOWA ZMIANA: Powiązane encje (camelCase po konwersji)
    entities?: ActivityEntity[];       // Stara struktura (dla kompatybilności)
    metadata?: {
        notes?: string;
        previousValue?: string;
        newValue?: string;
        appointmentDuration?: number;
        servicesList?: string[];
        vehicleCondition?: string;
        damageCount?: number;
        commentType?: 'internal' | 'client';
        isResolved?: boolean;
        notificationType?: 'reminder' | 'alert' | 'info';
        notificationContent?: string;
        isRead?: boolean;
        systemAction?: string;
        affectedRecords?: number;
    };
}

// Filtr dla aktywności
export interface ActivityFilter {
    type: 'category' | 'entity' | 'user' | 'all';
    value: string;
}

// Dane podsumowania
export interface DailySummaryData {
    date: string;
    appointmentsScheduled: number;
    protocolsCompleted: number;
    vehiclesServiced: number;
    newClients: number;
    commentsAdded: number;
    totalActivities: number;
}