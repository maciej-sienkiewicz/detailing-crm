// Typy aktywności w systemie CRM dla firmy motoryzacyjno-detailingowej

// Kategorie aktywności (usunięto 'call' - telefony)
export type ActivityCategory =
    | 'appointment'  // Wizyty/rezerwacje
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
    | 'appointment'  // Wizyta/rezerwacja
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

// Konfiguracja kategorii aktywności z metadanymi
export const ActivityCategoryConfig = {
    appointment: {
        label: 'Wizyty i rezerwacje',
        color: '#3498db',
        icon: 'calendar-alt',
        description: 'Planowanie i zarządzanie wizytami klientów'
    },
    protocol: {
        label: 'Protokoły przyjęcia',
        color: '#2ecc71',
        icon: 'clipboard-check',
        description: 'Dokumentowanie stanu pojazdów przy przyjęciu'
    },
    comment: {
        label: 'Komentarze',
        color: '#9b59b6',
        icon: 'comment',
        description: 'Notatki i komentarze zespołu'
    },
    client: {
        label: 'Operacje na klientach',
        color: '#f39c12',
        icon: 'user',
        description: 'Dodawanie, edycja i zarządzanie klientami'
    },
    vehicle: {
        label: 'Operacje na pojazdach',
        color: '#1abc9c',
        icon: 'car',
        description: 'Zarządzanie bazą pojazdów klientów'
    },
    notification: {
        label: 'Powiadomienia',
        color: '#34495e',
        icon: 'bell',
        description: 'Powiadomienia systemowe i przypomnienia'
    },
    system: {
        label: 'Działania systemowe',
        color: '#95a5a6',
        icon: 'cog',
        description: 'Automatyczne działania systemu'
    }
} as const;

// Helpery do pracy z aktywnościami
export const ActivityHelpers = {
    /**
     * Formatuje czas aktywności dla wyświetlenia
     */
    formatActivityTime: (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Generuje link do powiązanej encji
     */
    generateEntityLink: (entity: ActivityEntity): string => {
        switch (entity.type) {
            case 'appointment':
                return `/calendar?highlight=${entity.id}`;
            case 'client':
                return `/clients/owners?search=${encodeURIComponent(entity.displayName)}`;
            case 'vehicle':
                return `/clients/vehicles?search=${encodeURIComponent(entity.displayName)}`;
            case 'protocol':
                return `/orders/car-reception/${entity.id}`;
            case 'invoice':
                return `/finances/documents?search=${entity.id}`;
            case 'service':
                return `/services/${entity.id}`;
            default:
                return '#';
        }
    },

    /**
     * Sprawdza czy aktywność jest z dzisiaj
     */
    isToday: (timestamp: string): boolean => {
        const today = new Date();
        const activityDate = new Date(timestamp);
        return today.toDateString() === activityDate.toDateString();
    },

    /**
     * Sprawdza czy aktywność jest z wczoraj
     */
    isYesterday: (timestamp: string): boolean => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const activityDate = new Date(timestamp);
        return yesterday.toDateString() === activityDate.toDateString();
    },

    /**
     * Grupuje aktywności według daty
     */
    groupActivitiesByDate: (activities: ActivityItem[]): { [date: string]: ActivityItem[] } => {
        return activities.reduce((groups, activity) => {
            const date = new Date(activity.timestamp).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(activity);
            return groups;
        }, {} as { [date: string]: ActivityItem[] });
    },

    /**
     * Filtruje aktywności według kryteriów
     */
    filterActivities: (
        activities: ActivityItem[],
        filters: ActivityFilter[]
    ): ActivityItem[] => {
        return activities.filter(activity => {
            // Sprawdź filtr kategorii
            const categoryFilter = filters.find(f => f.type === 'category');
            if (categoryFilter && categoryFilter.value !== 'all' &&
                activity.category !== categoryFilter.value) {
                return false;
            }

            // Sprawdź filtr użytkownika
            const userFilter = filters.find(f => f.type === 'user');
            if (userFilter && userFilter.value !== 'all' &&
                activity.userId !== userFilter.value) {
                return false;
            }

            // Sprawdź filtr encji
            const entityFilter = filters.find(f => f.type === 'entity');
            if (entityFilter && entityFilter.value !== 'all' &&
                activity.entityType !== entityFilter.value) {
                return false;
            }

            return true;
        });
    }
};

// Typy dla API aktywności
export interface ActivityApiResponse {
    activities: ActivityItem[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        pageSize: number;
    };
    summary?: DailySummaryData;
}

export interface ActivityFiltersRequest {
    category?: ActivityCategory;
    userId?: string;
    entityType?: EntityType;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}