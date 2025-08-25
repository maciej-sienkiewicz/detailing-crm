import {Appointment, AppointmentStatus} from '../../types';

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
export const addAppointment = (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const now = new Date().toISOString();
            const newAppointment: Appointment = {
                ...appointmentData,
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