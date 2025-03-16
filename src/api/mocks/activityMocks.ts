import {
    ActivityItem,
    ActivityCategory,
    ActivityStatus,
    EntityType,
    DailySummaryData,
    ActivityEntity
} from '../../types/activity';

// Funkcja generująca unikalny identyfikator
const generateId = (): string => `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Mockowane dane aktywności
export const mockActivities: ActivityItem[] = [
    // Wizyty i rezerwacje
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 godziny temu
        category: 'appointment',
        message: 'Zarezerwowano nową wizytę',
        userId: '2',
        userName: 'Anna Nowak',
        userColor: '#e74c3c',
        entityType: 'appointment',
        entityId: '1',
        entities: [
            {
                id: '1',
                type: 'appointment',
                displayName: 'Detailing podstawowy - 10.03.2023, 9:00'
            },
            {
                id: 'cust1',
                type: 'client',
                displayName: 'Jan Kowalski'
            }
        ],
        status: 'success'
    },
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 godzin temu
        category: 'appointment',
        message: 'Zmieniono termin wizyty',
        userId: '2',
        userName: 'Anna Nowak',
        userColor: '#e74c3c',
        entityType: 'appointment',
        entityId: '2',
        entities: [
            {
                id: '2',
                type: 'appointment',
                displayName: 'Korekta lakieru - 15.03.2023, 13:00'
            },
            {
                id: 'cust2',
                type: 'client',
                displayName: 'Anna Nowak'
            }
        ],
        status: 'success'
    },

    // Protokoły przyjęcia
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dzień temu
        category: 'protocol',
        message: 'Utworzono nowy protokół przyjęcia pojazdu',
        userId: '1',
        userName: 'Jan Kowalski',
        userColor: '#3498db',
        entityType: 'protocol',
        entityId: '1',
        entities: [
            {
                id: '1',
                type: 'protocol',
                displayName: 'Protokół #1 - Audi A6 (WA12345)'
            },
            {
                id: 'cust1',
                type: 'client',
                displayName: 'Jan Kowalski'
            },
            {
                id: 'veh1',
                type: 'vehicle',
                displayName: 'Audi A6 (WA12345)'
            }
        ],
        status: 'success'
    },
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 godzin temu
        category: 'protocol',
        message: 'Zmieniono status protokołu na "W realizacji"',
        userId: '3',
        userName: 'Piotr Wiśniewski',
        userColor: '#2ecc71',
        entityType: 'protocol',
        entityId: '1',
        entities: [
            {
                id: '1',
                type: 'protocol',
                displayName: 'Protokół #1 - Audi A6 (WA12345)'
            }
        ],
        status: 'success'
    },

    // Komentarze
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 godzin temu
        category: 'comment',
        message: 'Dodano nowy komentarz do zlecenia',
        userId: '3',
        userName: 'Piotr Wiśniewski',
        userColor: '#2ecc71',
        entityType: 'comment',
        entityId: 'comment1',
        entities: [
            {
                id: 'comment1',
                type: 'comment',
                displayName: 'Komentarz do zlecenia',
                relatedId: '1' // ID protokołu
            },
            {
                id: '1',
                type: 'protocol',
                displayName: 'Protokół #1 - Audi A6 (WA12345)'
            }
        ],
        status: 'success'
    },

    // Rozmowy telefoniczne
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 godziny temu
        category: 'call',
        message: 'Wykonano rozmowę telefoniczną',
        userId: '4',
        userName: 'Magdalena Lewandowska',
        userColor: '#f39c12',
        entityType: 'client',
        entityId: 'cust3',
        entities: [
            {
                id: 'cust3',
                type: 'client',
                displayName: 'Tomasz Wiśniewski'
            }
        ],
        metadata: {
            callDuration: '4:32',
            callType: 'outgoing',
            callResult: 'successful'
        },
        status: 'success'
    },
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 godzin temu
        category: 'call',
        message: 'Odebrano połączenie przychodzące',
        userId: '2',
        userName: 'Anna Nowak',
        userColor: '#e74c3c',
        entityType: 'client',
        entityId: 'cust1',
        entities: [
            {
                id: 'cust1',
                type: 'client',
                displayName: 'Jan Kowalski'
            }
        ],
        metadata: {
            callDuration: '2:45',
            callType: 'incoming',
            callResult: 'successful',
            callNotes: 'Klient pytał o termin odbioru pojazdu'
        },
        status: 'success'
    },

    // Akcje związane z klientami
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(), // 27 godzin temu
        category: 'client',
        message: 'Dodano nowego klienta',
        userId: '2',
        userName: 'Anna Nowak',
        userColor: '#e74c3c',
        entityType: 'client',
        entityId: 'cust5',
        entities: [
            {
                id: 'cust5',
                type: 'client',
                displayName: 'Piotr Dąbrowski'
            }
        ],
        status: 'success'
    },

    // Akcje związane z pojazdami
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28 godzin temu
        category: 'vehicle',
        message: 'Zarejestrowano nowy pojazd',
        userId: '2',
        userName: 'Anna Nowak',
        userColor: '#e74c3c',
        entityType: 'vehicle',
        entityId: 'veh7',
        entities: [
            {
                id: 'veh7',
                type: 'vehicle',
                displayName: 'Volvo XC60 (GD22222)'
            },
            {
                id: 'cust5',
                type: 'client',
                displayName: 'Piotr Dąbrowski'
            }
        ],
        status: 'success'
    },

    // Powiadomienia
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 godziny temu
        category: 'notification',
        message: 'Wysłano powiadomienie SMS',
        userId: '4',
        userName: 'Magdalena Lewandowska',
        userColor: '#f39c12',
        entityType: 'client',
        entityId: 'cust1',
        entities: [
            {
                id: 'cust1',
                type: 'client',
                displayName: 'Jan Kowalski'
            },
            {
                id: '1',
                type: 'protocol',
                displayName: 'Protokół #1 - Audi A6 (WA12345)'
            }
        ],
        metadata: {
            notificationType: 'SMS',
            notificationContent: 'Twój pojazd jest gotowy do odbioru'
        },
        status: 'success'
    },

    // Aktywności systemowe
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 dni temu
        category: 'system',
        message: 'Wykonano kopię zapasową bazy danych',
        status: 'success'
    }
];

// Dodatkowe aktywności dla dzisiejszego dnia
const todayActivities: ActivityItem[] = [
    // Wizyty
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minut temu
        category: 'appointment',
        message: 'Klient potwierdził wizytę',
        userId: '2',
        userName: 'Anna Nowak',
        userColor: '#e74c3c',
        entityType: 'appointment',
        entityId: '3',
        entities: [
            {
                id: '3',
                type: 'appointment',
                displayName: 'Zabezpieczenie ceramiczne - 18.03.2023, 10:00'
            },
            {
                id: 'cust3',
                type: 'client',
                displayName: 'Tomasz Wiśniewski'
            }
        ],
        status: 'success'
    },

    // Komentarze
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minut temu
        category: 'comment',
        message: 'Dodano nowy komentarz dla klienta',
        userId: '1',
        userName: 'Jan Kowalski',
        userColor: '#3498db',
        entityType: 'comment',
        entityId: 'comment2',
        entities: [
            {
                id: 'comment2',
                type: 'comment',
                displayName: 'Informacja dla klienta',
                relatedId: '1' // ID protokołu
            },
            {
                id: '1',
                type: 'protocol',
                displayName: 'Protokół #1 - Audi A6 (WA12345)'
            }
        ],
        status: 'success'
    },

    // Faktury
    {
        id: generateId(),
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 godzina temu
        category: 'system',
        message: 'Wystawiono nową fakturę',
        userId: '2',
        userName: 'Anna Nowak',
        userColor: '#e74c3c',
        entityType: 'invoice',
        entityId: 'inv1',
        entities: [
            {
                id: 'inv1',
                type: 'invoice',
                displayName: 'Faktura FV/2023/03/001'
            },
            {
                id: 'cust1',
                type: 'client',
                displayName: 'Jan Kowalski'
            }
        ],
        status: 'success'
    }
];

// Połącz wszystkie aktywności
export const allActivities = [...todayActivities, ...mockActivities];

// Funkcja do filtrowania aktywności na podstawie daty
export const fetchActivityItems = async (
    startDate: string,
    endDate: string
): Promise<ActivityItem[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const filteredActivities = allActivities.filter(activity => {
                const activityDate = new Date(activity.timestamp);
                return activityDate >= start && activityDate <= end;
            });

            resolve(filteredActivities);
        }, 500);
    });
};

// Mockowane dane podsumowania dziennego
export const mockDailySummary: DailySummaryData = {
    date: new Date().toISOString(),
    callsMade: 8,
    callsReceived: 12,
    appointmentsScheduled: 5,
    vehiclesServiced: 3,
    dailyRevenue: 4520.50,
    newClients: 2
};

// Funkcja do pobierania podsumowania dziennego
export const fetchDailySummary = async (): Promise<DailySummaryData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockDailySummary);
        }, 500);
    });
};

// Funkcja do oznaczania aktywności jako przeczytanej
export const markActivityAsRead = async (activityId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Symulacja aktualizacji w bazie danych - w prawdziwej aplikacji
            // tutaj byłoby faktyczne oznaczenie jako przeczytane
            console.log(`Activity ${activityId} marked as read`);
            resolve(true);
        }, 300);
    });
};

// Funkcja do dodawania nowej aktywności
export const addActivity = async (activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newActivity: ActivityItem = {
                ...activity,
                id: generateId(),
                timestamp: new Date().toISOString()
            };

            // W prawdziwej aplikacji tutaj byłoby dodanie do bazy danych
            console.log(`New activity added:`, newActivity);

            resolve(newActivity);
        }, 300);
    });
};