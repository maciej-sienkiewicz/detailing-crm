import { CarReceptionProtocol, ProtocolStatus } from '../../types';

// Mockowane dane protokołów przyjęcia pojazdu
export const mockCarReceptionProtocols: CarReceptionProtocol[] = [
    {
        id: '1',
        startDate: '2025-03-10',
        endDate: '2025-03-12',
        licensePlate: 'WA12345',
        make: 'Audi',
        model: 'A6',
        productionYear: 2019,
        mileage: 78500,
        keysProvided: true,
        documentsProvided: true,
        ownerName: 'Jan Kowalski',
        companyName: 'AutoFirma Sp. z o.o.',
        taxId: '1234567890',
        email: 'jan.kowalski@example.com',
        phone: '+48 123 456 789',
        notes: 'Klient prosi o szczególną ostrożność przy drzwiach kierowcy.',
        selectedServices: [
            { id: '1', name: 'Detailing kompletny', price: 1200, discount: 10, finalPrice: 1080 },
            { id: '3', name: 'Czyszczenie wnętrza', price: 350, discount: 0, finalPrice: 350 },
            { id: '4', name: 'Nakładanie powłoki ceramicznej', price: 1500, discount: 5, finalPrice: 1425 }
        ],
        status: ProtocolStatus.IN_PROGRESS,
        statusUpdatedAt: '2025-03-10T08:30:00Z',
        createdAt: '2025-03-09T10:15:22Z',
        updatedAt: '2025-03-09T10:15:22Z'
    },
    {
        id: '2',
        startDate: '2025-03-15',
        endDate: '2025-03-16',
        licensePlate: 'PO98765',
        make: 'BMW',
        model: '5',
        productionYear: 2020,
        mileage: 45000,
        keysProvided: true,
        documentsProvided: false,
        ownerName: 'Anna Nowak',
        email: 'anna.nowak@example.com',
        phone: '+48 987 654 321',
        selectedServices: [
            { id: '2', name: 'Korekta lakieru', price: 500, discount: 0, finalPrice: 500 },
            { id: '5', name: 'Pranie tapicerki', price: 300, discount: 0, finalPrice: 300 }
        ],
        status: ProtocolStatus.PENDING_APPROVAL,
        statusUpdatedAt: '2025-03-09T14:30:00Z',
        createdAt: '2025-03-09T14:30:00Z',
        updatedAt: '2025-03-09T14:30:00Z'
    }
];

// Mockowane dane dostępnych usług
export const mockAvailableServices = [
    { id: '1', name: 'Detailing kompletny', price: 1200 },
    { id: '2', name: 'Korekta lakieru', price: 500 },
    { id: '3', name: 'Czyszczenie wnętrza', price: 350 },
    { id: '4', name: 'Nakładanie powłoki ceramicznej', price: 1500 },
    { id: '5', name: 'Pranie tapicerki', price: 300 }
];

// Funkcja symulująca pobieranie protokołów przyjęcia pojazdu
export const fetchCarReceptionProtocols = (): Promise<CarReceptionProtocol[]> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve([...mockCarReceptionProtocols]);
        }, 500);
    });
};

// Funkcja symulująca pobieranie pojedynczego protokołu
export const fetchCarReceptionProtocol = (id: string): Promise<CarReceptionProtocol | null> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const protocol = mockCarReceptionProtocols.find(p => p.id === id) || null;
            resolve(protocol);
        }, 300);
    });
};

// Funkcja symulująca dodawanie nowego protokołu
export const addCarReceptionProtocol = (protocol: Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarReceptionProtocol> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const now = new Date().toISOString();
            const newProtocol: CarReceptionProtocol = {
                ...protocol,
                id: `protocol-${Date.now()}`,
                createdAt: now,
                updatedAt: now,
                statusUpdatedAt: now
            };
            resolve(newProtocol);
        }, 500);
    });
};

// Funkcja symulująca aktualizację protokołu
export const updateCarReceptionProtocol = (protocol: CarReceptionProtocol): Promise<CarReceptionProtocol> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const now = new Date().toISOString();
            const updatedProtocol: CarReceptionProtocol = {
                ...protocol,
                updatedAt: now
            };
            resolve(updatedProtocol);
        }, 500);
    });
};

// Funkcja symulująca aktualizację statusu protokołu
export const updateProtocolStatus = (id: string, status: ProtocolStatus): Promise<CarReceptionProtocol> => {
    return new Promise((resolve, reject) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const protocol = mockCarReceptionProtocols.find(p => p.id === id);
            if (!protocol) {
                reject(new Error('Protokół nie został znaleziony'));
                return;
            }

            const now = new Date().toISOString();
            const updatedProtocol: CarReceptionProtocol = {
                ...protocol,
                status,
                statusUpdatedAt: now,
                updatedAt: now
            };

            resolve(updatedProtocol);
        }, 500);
    });
};

// Funkcja symulująca usuwanie protokołu
export const deleteCarReceptionProtocol = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve(true);
        }, 300);
    });
};

// Funkcja symulująca pobieranie dostępnych usług
export const fetchAvailableServices = (): Promise<typeof mockAvailableServices> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockAvailableServices]);
        }, 300);
    });
};