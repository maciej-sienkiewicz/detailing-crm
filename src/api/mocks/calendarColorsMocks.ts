// Mock danych dla kolorów kalendarza
import {CalendarColor} from "../../types/calendar";

let mockCalendarColors: CalendarColor[] = [
    {
        id: '1',
        name: 'Jan Kowalski',
        color: '#3498db'
    },
    {
        id: '2',
        name: 'Anna Nowak',
        color: '#9b59b6'
    },
    {
        id: '3',
        name: 'Detailing ceramiczny',
        color: '#e74c3c'
    },
    {
        id: '4',
        name: 'Korekta lakieru',
        color: '#f39c12'
    },
    {
        id: '5',
        name: 'Pojazdy w serwisie',
        color: '#2ecc71'
    }
];

// Pobieranie wszystkich kolorów
export const fetchCalendarColors = async (): Promise<CalendarColor[]> => {
    // Symulacja opóźnienia sieciowego
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockCalendarColors];
};

// Pobieranie pojedynczego koloru
export const fetchCalendarColor = async (id: string): Promise<CalendarColor | null> => {
    // Symulacja opóźnienia sieciowego
    await new Promise(resolve => setTimeout(resolve, 300));
    const color = mockCalendarColors.find(c => c.id === id);
    return color ? { ...color } : null;
};

// Tworzenie nowego koloru
export const createCalendarColor = async (colorData: Omit<CalendarColor, 'id'>): Promise<CalendarColor> => {
    // Symulacja opóźnienia sieciowego
    await new Promise(resolve => setTimeout(resolve, 600));

    const newColor: CalendarColor = {
        id: "0",
        ...colorData
    };

    mockCalendarColors.push(newColor);
    return { ...newColor };
};

// Aktualizacja istniejącego koloru
export const updateCalendarColor = async (id: string, colorData: Omit<CalendarColor, 'id'>): Promise<CalendarColor | null> => {
    // Symulacja opóźnienia sieciowego
    await new Promise(resolve => setTimeout(resolve, 600));

    const colorIndex = mockCalendarColors.findIndex(c => c.id === id);
    if (colorIndex === -1) return null;

    const updatedColor: CalendarColor = {
        ...colorData,
        id // Zachowaj oryginalne ID
    };

    mockCalendarColors[colorIndex] = updatedColor;
    return { ...updatedColor };
};

// Usuwanie koloru
export const deleteCalendarColor = async (id: string): Promise<boolean> => {
    // Symulacja opóźnienia sieciowego
    await new Promise(resolve => setTimeout(resolve, 500));

    const initialLength = mockCalendarColors.length;
    mockCalendarColors = mockCalendarColors.filter(c => c.id !== id);

    return mockCalendarColors.length < initialLength;
};

// Sprawdzenie, czy dana nazwa koloru jest już zajęta
export const isColorNameTaken = async (name: string, excludeId?: string): Promise<boolean> => {
    // Symulacja opóźnienia sieciowego
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockCalendarColors.some(c =>
        c.name.toLowerCase() === name.toLowerCase() &&
        (!excludeId || c.id !== excludeId)
    );
};