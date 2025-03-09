import { Appointment, AppointmentStatus } from '../../types';

// Pomocnicza funkcja do generowania dat
const createDate = (year: number, month: number, day: number, hour: number = 0, minute: number = 0) => {
    return new Date(year, month, day, hour, minute);
};

// Aktualny miesiąc do generowania przykładowych danych
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

// Mockowane dane spotkań
export const mockAppointments: Appointment[] = [
    {
        id: '1',
        title: 'Detailing podstawowy',
        start: createDate(currentYear, currentMonth, 10, 9, 0),
        end: createDate(currentYear, currentMonth, 10, 12, 0),
        customerId: 'cust1',
        vehicleId: 'veh1',
        serviceType: 'basic_detailing',
        status: AppointmentStatus.CONFIRMED,
        notes: 'Pierwsza wizyta klienta',
        statusUpdatedAt: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Korekta lakieru',
        start: createDate(currentYear, currentMonth, 15, 13, 0),
        end: createDate(currentYear, currentMonth, 15, 17, 0),
        customerId: 'cust2',
        vehicleId: 'veh2',
        serviceType: 'paint_correction',
        status: AppointmentStatus.PENDING_APPROVAL,
        statusUpdatedAt: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Zabezpieczenie ceramiczne',
        start: createDate(currentYear, currentMonth, 18, 10, 0),
        end: createDate(currentYear, currentMonth, 18, 16, 0),
        customerId: 'cust3',
        vehicleId: 'veh3',
        serviceType: 'ceramic_coating',
        status: AppointmentStatus.IN_PROGRESS,
        statusUpdatedAt: new Date().toISOString()
    },
    {
        id: '4',
        title: 'Czyszczenie wnętrza',
        start: createDate(currentYear, currentMonth, 20, 14, 0),
        end: createDate(currentYear, currentMonth, 20, 16, 30),
        customerId: 'cust1',
        vehicleId: 'veh1',
        serviceType: 'interior_cleaning',
        status: AppointmentStatus.READY_FOR_PICKUP,
        statusUpdatedAt: new Date().toISOString()
    },
    {
        id: '5',
        title: 'Polerowanie reflektorów',
        start: createDate(currentYear, currentMonth, 22, 11, 0),
        end: createDate(currentYear, currentMonth, 22, 12, 30),
        customerId: 'cust4',
        vehicleId: 'veh4',
        serviceType: 'headlight_restoration',
        status: AppointmentStatus.COMPLETED,
        statusUpdatedAt: new Date().toISOString()
    }
];

// Funkcja symulująca pobieranie danych z API
export const fetchAppointments = (): Promise<Appointment[]> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve(mockAppointments);
        }, 500);
    });
};

// Funkcja symulująca dodawanie nowego spotkania
export const addAppointment = (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const now = new Date().toISOString();
            const newAppointment: Appointment = {
                ...appointment,
                id: `app${Math.floor(Math.random() * 10000)}`,
                statusUpdatedAt: now
            };

            // Tutaj w rzeczywistym API wysyłalibyśmy dane do backendu
            // W wersji mockowej tylko zwracamy utworzony obiekt

            resolve(newAppointment);
        }, 500);
    });
};

// Funkcja symulująca aktualizację spotkania
export const updateAppointment = (appointment: Appointment): Promise<Appointment> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const now = new Date().toISOString();
            const updatedAppointment: Appointment = {
                ...appointment,
                statusUpdatedAt: now
            };
            resolve(updatedAppointment);
        }, 500);
    });
};

// Funkcja symulująca zmianę statusu wizyty
export const updateAppointmentStatus = (id: string, status: AppointmentStatus): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const appointment = mockAppointments.find(app => app.id === id);
            if (!appointment) {
                reject(new Error('Wizyta nie została znaleziona'));
                return;
            }

            const now = new Date().toISOString();
            const updatedAppointment: Appointment = {
                ...appointment,
                status,
                statusUpdatedAt: now
            };

            resolve(updatedAppointment);
        }, 500);
    });
};

// Funkcja symulująca usuwanie spotkania
export const deleteAppointment = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve(true);
        }, 500);
    });
};