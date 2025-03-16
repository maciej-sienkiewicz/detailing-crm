// Typy aktywności w systemie

// Kategorie aktywności
export type ActivityCategory =
    | 'appointment'  // Wizyty/spotkania
    | 'protocol'     // Protokoły przyjęcia
    | 'comment'      // Komentarze
    | 'call'         // Telefony
    | 'client'       // Akcje związane z klientami
    | 'vehicle'      // Akcje związane z pojazdami
    | 'notification' // Powiadomienia
    | 'system';      // Aktywności systemowe

// Statusy aktywności
export type ActivityStatus = 'success' | 'pending' | 'error' | null;

// Typy encji powiązanych z aktywnościami
export type EntityType =
    | 'appointment'
    | 'protocol'
    | 'client'
    | 'vehicle'
    | 'invoice'
    | 'comment';

// Encja powiązana z aktywnością
export interface ActivityEntity {
    id: string;
    type: EntityType;
    displayName: string;
    relatedId?: string; // ID encji nadrzędnej (np. protokół dla komentarza)
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
    metadata?: Record<string, any>;
}

// Filtr dla aktywności
export interface ActivityFilter {
    type: 'category' | 'entity' | 'user' | 'all';
    value: string;
}

// Dane podsumowania dziennego
export interface DailySummaryData {
    date: string;
    callsMade: number;
    callsReceived: number;
    appointmentsScheduled: number;
    vehiclesServiced: number;
    dailyRevenue: number;
    newClients: number;
}