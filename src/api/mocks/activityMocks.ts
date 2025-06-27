// src/api/mocks/activityMocks.ts - Zaktualizowane mocki bez telefonów
import { ActivityItem, DailySummaryData, ActivityCategory } from '../../types/activity';
import { format, subDays, addHours, subHours } from 'date-fns';

// Mock dane użytkowników systemu
const mockUsers = [
    { id: 'user-1', name: 'Anna Kowalska', color: '#3498db' },
    { id: 'user-2', name: 'Marcin Nowak', color: '#2ecc71' },
    { id: 'user-3', name: 'Katarzyna Wiśniewska', color: '#9b59b6' },
    { id: 'user-4', name: 'Paweł Zieliński', color: '#f39c12' },
    { id: 'system', name: 'System', color: '#95a5a6' }
];

// Funkcja generująca przykładowe aktywności
const generateMockActivities = (startDate: string, endDate: string): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generujemy aktywności dla każdego dnia w zakresie
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayActivities = generateDayActivities(date);
        activities.push(...dayActivities);
    }

    // Sortujemy według czasu (najnowsze pierwsze)
    return activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
};

// Generowanie aktywności dla konkretnego dnia
const generateDayActivities = (date: Date): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const dayStart = new Date(date);
    dayStart.setHours(8, 0, 0, 0); // Początek dnia pracy

    // Różne scenariusze aktywności dla każdego dnia
    const scenarios = [
        () => generateAppointmentActivities(dayStart),
        () => generateProtocolActivities(dayStart),
        () => generateClientActivities(dayStart),
        () => generateVehicleActivities(dayStart),
        () => generateCommentActivities(dayStart),
        () => generateSystemActivities(dayStart)
    ];

    // Losowo wybieramy 3-6 scenariuszy na dzień
    const selectedScenarios = scenarios
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 3);

    selectedScenarios.forEach(scenario => {
        activities.push(...scenario());
    });

    return activities;
};

// Generowanie aktywności związanych z wizytami
const generateAppointmentActivities = (baseTime: Date): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const user = mockUsers[Math.floor(Math.random() * (mockUsers.length - 1))]; // Bez systemu

    // Nowa rezerwacja
    activities.push({
        id: `appointment-${Date.now()}-${Math.random()}`,
        timestamp: addHours(baseTime, Math.random() * 8).toISOString(),
        category: 'appointment' as ActivityCategory,
        message: 'Zarezerwowano nową wizytę na detailing zewnętrzny',
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        entities: [
            {
                id: `client-${Math.random()}`,
                type: 'client',
                displayName: 'Jan Kowalski',
                metadata: { clientPhone: '+48 123 456 789' }
            },
            {
                id: `vehicle-${Math.random()}`,
                type: 'vehicle',
                displayName: 'BMW X5 2020',
                metadata: { vehicleRegistration: 'WW 12345' }
            },
            {
                id: `appointment-${Math.random()}`,
                type: 'appointment',
                displayName: 'Detailing zewnętrzny - 15.01.2025 10:00',
                metadata: {
                    appointmentDate: '2025-01-15T10:00:00',
                    serviceType: 'external_detailing'
                }
            }
        ],
        status: 'success',
        metadata: {
            appointmentDuration: 180,
            servicesList: ['Mycie zewnętrzne', 'Woskowanie', 'Czyszczenie felg'],
            notes: 'Klient prosi o szczególną uwagę na felgi'
        }
    });

    return activities;
};

// Generowanie aktywności protokołów przyjęcia
const generateProtocolActivities = (baseTime: Date): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const user = mockUsers[Math.floor(Math.random() * (mockUsers.length - 1))];

    activities.push({
        id: `protocol-${Date.now()}-${Math.random()}`,
        timestamp: addHours(baseTime, Math.random() * 8).toISOString(),
        category: 'protocol' as ActivityCategory,
        message: 'Utworzono protokół przyjęcia pojazdu z dokumentacją fotograficzną',
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        entities: [
            {
                id: `protocol-${Math.random()}`,
                type: 'protocol',
                displayName: 'Protokół #PR-2025-001',
                metadata: { protocolStatus: 'completed' }
            },
            {
                id: `vehicle-${Math.random()}`,
                type: 'vehicle',
                displayName: 'Audi A4 2019',
                metadata: { vehicleRegistration: 'KR 98765' }
            }
        ],
        status: 'success',
        metadata: {
            vehicleCondition: 'Dobre - drobne zarysowania na prawych drzwiach',
            damageCount: 2,
            notes: 'Pojazd w dobrej kondycji, zidentyfikowano drobne uszkodzenia lakieru'
        }
    });

    return activities;
};

// Generowanie aktywności klientów
const generateClientActivities = (baseTime: Date): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const user = mockUsers[Math.floor(Math.random() * (mockUsers.length - 1))];

    activities.push({
        id: `client-${Date.now()}-${Math.random()}`,
        timestamp: addHours(baseTime, Math.random() * 8).toISOString(),
        category: 'client' as ActivityCategory,
        message: 'Dodano nowego klienta do bazy wraz z danymi kontaktowymi',
        userId: user.id,
        userName: user.name,
        userColor: null,
        entities: [
            {
                id: `client-${Math.random()}`,
                type: 'client',
                displayName: 'Maria Nowak',
                metadata: { clientPhone: '+48 987 654 321' }
            }
        ],
        status: 'success',
        metadata: {
            previousValue: "Stary klienta - Jan Kowalski",
            newValue: 'Nowy klient - Maria Nowak',
            notes: 'Klient polecony przez Jana Kowalskiego'
        }
    });

    return activities;
};

// Generowanie aktywności pojazdów
const generateVehicleActivities = (baseTime: Date): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const user = mockUsers[Math.floor(Math.random() * (mockUsers.length - 1))];

    activities.push({
        id: `vehicle-${Date.now()}-${Math.random()}`,
        timestamp: addHours(baseTime, Math.random() * 8).toISOString(),
        category: 'vehicle' as ActivityCategory,
        message: 'Zaktualizowano dane pojazdu - zmiana numeru rejestracyjnego',
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        entities: [
            {
                id: `vehicle-${Math.random()}`,
                type: 'vehicle',
                displayName: 'Mercedes C-Class 2021',
                metadata: { vehicleRegistration: 'GD 11111' }
            },
            {
                id: `client-${Math.random()}`,
                type: 'client',
                displayName: 'Piotr Wiśniewski'
            }
        ],
        status: 'success',
        metadata: {
            previousValue: 'WA 54321',
            newValue: 'GD 11111',
            notes: 'Klient przeprowadził się do Gdańska'
        }
    });

    return activities;
};

// Generowanie komentarzy
const generateCommentActivities = (baseTime: Date): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const user = mockUsers[Math.floor(Math.random() * (mockUsers.length - 1))];

    activities.push({
        id: `comment-${Date.now()}-${Math.random()}`,
        timestamp: addHours(baseTime, Math.random() * 8).toISOString(),
        category: 'comment' as ActivityCategory,
        message: 'Dodano komentarz wewnętrzny do protokołu przyjęcia',
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        entities: [
            {
                id: `comment-${Math.random()}`,
                type: 'comment',
                displayName: 'Komentarz do protokołu #PR-2025-001',
                relatedId: 'protocol-123'
            }
        ],
        status: 'success',
        metadata: {
            commentType: 'internal',
            isResolved: false,
            notes: 'Proszę zwrócić uwagę na stan felg podczas mycia'
        }
    });

    return activities;
};

// Generowanie aktywności systemowych
const generateSystemActivities = (baseTime: Date): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    activities.push({
        id: `system-${Date.now()}-${Math.random()}`,
        timestamp: addHours(baseTime, Math.random() * 2).toISOString(),
        category: 'system' as ActivityCategory,
        message: 'System automatycznie wysłał przypomnienia o nadchodzących wizytach',
        userId: 'system',
        userName: 'System',
        userColor: '#95a5a6',
        status: 'success',
        metadata: {
            systemAction: 'send_reminders',
            affectedRecords: 5,
            notes: 'Wysłano 5 powiadomień SMS do klientów'
        }
    });

    return activities;
};

// Generowanie podsumowania dziennego
const generateDailySummary = (): DailySummaryData => {
    const today = new Date();

    return {
        date: format(today, 'yyyy-MM-dd'),
        appointmentsScheduled: Math.floor(Math.random() * 8) + 3,
        protocolsCompleted: Math.floor(Math.random() * 6) + 2,
        vehiclesServiced: Math.floor(Math.random() * 10) + 5,
        newClients: Math.floor(Math.random() * 3) + 1,
        commentsAdded: Math.floor(Math.random() * 12) + 4,
        totalActivities: Math.floor(Math.random() * 25) + 15
    };
};

// Eksportowane funkcje API
export const fetchActivityItems = async (
    startDate: string,
    endDate: string
): Promise<ActivityItem[]> => {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 800));

    return generateMockActivities(startDate, endDate);
};

export const fetchDailySummary = async (): Promise<DailySummaryData> => {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 500));

    return generateDailySummary();
};

// Funkcja do testowania różnych scenariuszy
export const generateTestActivityScenarios = () => {
    const scenarios = {
        busyDay: () => {
            // Symulacja bardzo pracowitego dnia
            const activities: ActivityItem[] = [];
            const today = new Date();

            for (let i = 0; i < 15; i++) {
                const user = mockUsers[Math.floor(Math.random() * (mockUsers.length - 1))];
                activities.push({
                    id: `test-${i}`,
                    timestamp: addHours(today, i * 0.5).toISOString(),
                    category: ['appointment', 'protocol', 'client', 'vehicle', 'comment'][
                        Math.floor(Math.random() * 5)
                        ] as ActivityCategory,
                    message: `Testowa aktywność #${i + 1}`,
                    userId: user.id,
                    userName: user.name,
                    userColor: user.color,
                    status: 'success'
                });
            }

            return activities;
        },

        quietDay: () => {
            // Symulacja spokojnego dnia
            return generateDayActivities(new Date()).slice(0, 3);
        }
    };

    return scenarios;
};