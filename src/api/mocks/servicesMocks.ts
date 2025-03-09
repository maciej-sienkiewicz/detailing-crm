import { Service } from '../../types';

// Mockowana lista usług
export const mockServices: Service[] = [
    {
        id: '1',
        name: 'Detailing kompletny',
        description: 'Pełny pakiet usług detailingowych: mycie, polerowanie, woskowanie.',
        price: 1200,
        vatRate: 23
    },
    {
        id: '2',
        name: 'Korekta lakieru',
        description: 'Profesjonalna korekta lakieru w celu usunięcia rys i defektów.',
        price: 500,
        vatRate: 23
    },
    {
        id: '3',
        name: 'Czyszczenie wnętrza',
        description: 'Kompleksowe czyszczenie wnętrza pojazdu.',
        price: 350,
        vatRate: 23
    },
    {
        id: '4',
        name: 'Nakładanie powłoki ceramicznej',
        description: 'Aplikacja profesjonalnej powłoki ceramicznej z 3-letnią gwarancją.',
        price: 1500,
        vatRate: 23
    },
    {
        id: '5',
        name: 'Pranie tapicerki',
        description: 'Pranie tapicerki materiałowej lub skórzanej.',
        price: 300,
        vatRate: 23
    },
];

// Funkcja symulująca pobieranie listy usług z API
export const fetchServices = (): Promise<Service[]> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve([...mockServices]);
        }, 500);
    });
};

// Funkcja symulująca dodawanie nowej usługi
export const addService = (service: Omit<Service, 'id'>): Promise<Service> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const newService: Service = {
                ...service,
                id: `service-${Date.now()}`
            };
            resolve(newService);
        }, 500);
    });
};

// Funkcja symulująca aktualizację istniejącej usługi
export const updateService = (service: Service): Promise<Service> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve({...service});
        }, 500);
    });
};

// Funkcja symulująca usuwanie usługi
export const deleteService = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve(true);
        }, 300);
    });
};

// Funkcja symulująca pobieranie domyślnej stawki VAT
export const fetchDefaultVatRate = (): Promise<number> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve(23); // Domyślna stawka VAT
        }, 300);
    });
};