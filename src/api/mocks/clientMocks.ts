// src/api/mocks/clientMocks.ts
import {ClientExpanded, ContactAttempt, Employee, VehicleExpanded} from '../../types';

// Mock data for clients
export const mockClients: ClientExpanded[] = [
    {
        id: 'client1',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan.kowalski@example.com',
        phone: '+48 123 456 789',
        address: 'ul. Warszawska 10, 00-001 Warszawa',
        company: 'Kowalski & Sons',
        taxId: '1234567890',
        totalVisits: 8,
        totalTransactions: 6,
        abandonedSales: 1,
        totalRevenue: 5600,
        contactAttempts: 12,
        lastVisitDate: '2025-02-15',
        notes: 'Preferuje kontakt telefoniczny. Zainteresowany ceramiczną powłoką.',
        vehicles: ['veh1', 'veh2']
    },
    {
        id: 'client2',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna.nowak@example.com',
        phone: '+48 987 654 321',
        address: 'ul. Krakowska 25, 30-001 Kraków',
        totalVisits: 3,
        totalTransactions: 3,
        abandonedSales: 0,
        totalRevenue: 2800,
        contactAttempts: 4,
        lastVisitDate: '2025-01-20',
        vehicles: ['veh3']
    },
    {
        id: 'client3',
        firstName: 'Tomasz',
        lastName: 'Wiśniewski',
        email: 'tomasz.wisniewski@example.com',
        phone: '+48 111 222 333',
        address: 'ul. Wrocławska 5, 50-001 Wrocław',
        company: 'Wisniewski Transport Sp. z o.o.',
        taxId: '9876543210',
        totalVisits: 12,
        totalTransactions: 10,
        abandonedSales: 2,
        totalRevenue: 12400,
        contactAttempts: 15,
        lastVisitDate: '2025-03-01',
        notes: 'Firma posiada flotę pojazdów, potencjał na większe zlecenia.',
        vehicles: ['veh4', 'veh5', 'veh6']
    },
    {
        id: 'client4',
        firstName: 'Magdalena',
        lastName: 'Lewandowska',
        email: 'magdalena.lewandowska@example.com',
        phone: '+48 444 555 666',
        totalVisits: 1,
        totalTransactions: 0,
        abandonedSales: 1,
        totalRevenue: 0,
        contactAttempts: 3,
        vehicles: []
    },
    {
        id: 'client5',
        firstName: 'Piotr',
        lastName: 'Dąbrowski',
        email: 'piotr.dabrowski@example.com',
        phone: '+48 777 888 999',
        address: 'ul. Gdańska 15, 80-001 Gdańsk',
        totalVisits: 6,
        totalTransactions: 5,
        abandonedSales: 0,
        totalRevenue: 4200,
        contactAttempts: 7,
        lastVisitDate: '2025-02-28',
        vehicles: ['veh7']
    }
];

// Mock data for vehicles
export const mockVehicles: VehicleExpanded[] = [
    {
        id: 'veh1',
        make: 'Audi',
        model: 'A6',
        year: 2019,
        licensePlate: 'WA12345',
        color: 'Czarny',
        vin: 'WAUZZZ4G1JN123456',
        totalServices: 5,
        lastServiceDate: '2025-02-15',
        serviceHistory: [
            {
                id: 'serv1',
                date: '2025-02-15',
                serviceType: 'Detailing kompleksowy',
                description: 'Pełen detailing wnętrza i karoserii',
                price: 1200,
                protocolId: '1'
            },
            {
                id: 'serv2',
                date: '2024-12-10',
                serviceType: 'Korekta lakieru',
                description: 'Usunięcie rys oraz aplikacja wosku',
                price: 800,
                protocolId: '2'
            }
        ],
        totalSpent: 2000,
        ownerIds: ['client1']
    },
    {
        id: 'veh2',
        make: 'BMW',
        model: 'X5',
        year: 2020,
        licensePlate: 'WA54321',
        color: 'Biały',
        vin: 'WBAKJ4C50KL123456',
        totalServices: 3,
        lastServiceDate: '2025-01-10',
        serviceHistory: [
            {
                id: 'serv3',
                date: '2025-01-10',
                serviceType: 'Czyszczenie tapicerki',
                description: 'Czyszczenie tapicerki skórzanej',
                price: 600,
                protocolId: '3'
            }
        ],
        totalSpent: 600,
        ownerIds: ['client1']
    },
    {
        id: 'veh3',
        make: 'Toyota',
        model: 'Corolla',
        year: 2018,
        licensePlate: 'KR98765',
        color: 'Srebrny',
        totalServices: 3,
        lastServiceDate: '2025-01-20',
        serviceHistory: [
            {
                id: 'serv4',
                date: '2025-01-20',
                serviceType: 'Detailing podstawowy',
                description: 'Mycie, woskowanie i czyszczenie wnętrza',
                price: 500,
                protocolId: '4'
            }
        ],
        totalSpent: 500,
        ownerIds: ['client2']
    },
    {
        id: 'veh4',
        make: 'Mercedes-Benz',
        model: 'Sprinter',
        year: 2021,
        licensePlate: 'WR11111',
        color: 'Biały',
        vin: 'WDB9066571S123456',
        totalServices: 4,
        lastServiceDate: '2025-03-01',
        serviceHistory: [
            {
                id: 'serv5',
                date: '2025-03-01',
                serviceType: 'Detailing kompleksowy',
                description: 'Detailing pełny dla auta dostawczego',
                price: 1500,
                protocolId: '5'
            }
        ],
        totalSpent: 1500,
        ownerIds: ['client3']
    },
    {
        id: 'veh5',
        make: 'Mercedes-Benz',
        model: 'Actros',
        year: 2020,
        licensePlate: 'WR22222',
        color: 'Czerwony',
        totalServices: 2,
        lastServiceDate: '2025-02-15',
        serviceHistory: [
            {
                id: 'serv6',
                date: '2025-02-15',
                serviceType: 'Mycie ciężarówki',
                description: 'Mycie zewnętrzne ciężarówki',
                price: 800,
                protocolId: '6'
            }
        ],
        totalSpent: 800,
        ownerIds: ['client3']
    },
    {
        id: 'veh6',
        make: 'Volkswagen',
        model: 'Caddy',
        year: 2019,
        licensePlate: 'WR33333',
        color: 'Biały',
        totalServices: 3,
        lastServiceDate: '2025-01-25',
        serviceHistory: [
            {
                id: 'serv7',
                date: '2025-01-25',
                serviceType: 'Czyszczenie wnętrza',
                description: 'Dokładne czyszczenie wnętrza',
                price: 350,
                protocolId: '7'
            }
        ],
        totalSpent: 350,
        ownerIds: ['client3']
    },
    {
        id: 'veh7',
        make: 'Volvo',
        model: 'XC60',
        year: 2022,
        licensePlate: 'GD22222',
        color: 'Grafitowy',
        vin: 'YV1DZ8256L1234567',
        totalServices: 5,
        lastServiceDate: '2025-02-28',
        serviceHistory: [
            {
                id: 'serv8',
                date: '2025-02-28',
                serviceType: 'Powłoka ceramiczna',
                description: 'Aplikacja powłoki ceramicznej',
                price: 2000,
                protocolId: '8'
            },
            {
                id: 'serv9',
                date: '2024-12-15',
                serviceType: 'Korekta lakieru',
                description: 'Korekta lakieru przed powłoką',
                price: 1200,
                protocolId: '9'
            }
        ],
        totalSpent: 3200,
        ownerIds: ['client5']
    }
];

// Mock contact attempts
export const mockContactAttempts: ContactAttempt[] = [
    {
        id: 'contact1',
        clientId: 'client1',
        date: '2025-02-10',
        type: 'PHONE',
        description: 'Rozmowa o zaplanowaniu detailingu',
        result: 'SUCCESS'
    },
    {
        id: 'contact2',
        clientId: 'client1',
        date: '2025-01-15',
        type: 'EMAIL',
        description: 'Oferta powłoki ceramicznej',
        result: 'SUCCESS'
    },
    {
        id: 'contact3',
        clientId: 'client2',
        date: '2025-01-05',
        type: 'PHONE',
        description: 'Przypomnienie o terminie wizyty',
        result: 'SUCCESS'
    },
    {
        id: 'contact4',
        clientId: 'client3',
        date: '2025-02-20',
        type: 'EMAIL',
        description: 'Oferta flotowa',
        result: 'CALLBACK_REQUESTED'
    },
    {
        id: 'contact5',
        clientId: 'client4',
        date: '2025-02-12',
        type: 'PHONE',
        description: 'Próba umówienia wizyty',
        result: 'NO_ANSWER'
    }
];

// Mock API functions

// Clients
export const fetchClients = (): Promise<ClientExpanded[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockClients]);
        }, 500);
    });
};

export const fetchClientById = (id: string): Promise<ClientExpanded | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const client = mockClients.find(c => c.id === id) || null;
            resolve(client);
        }, 300);
    });
};

export const addClient = (client: Omit<ClientExpanded, 'id'>): Promise<ClientExpanded> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newClient: ClientExpanded = {
                ...client,
                id: `client${Date.now()}`
            };
            resolve(newClient);
        }, 500);
    });
};

export const updateClient = (client: ClientExpanded): Promise<ClientExpanded> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({...client});
        }, 500);
    });
};

export const deleteClient = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 300);
    });
};

// Vehicles
export const fetchVehicles = (): Promise<VehicleExpanded[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockVehicles]);
        }, 500);
    });
};

export const fetchVehicleById = (id: string): Promise<VehicleExpanded | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const vehicle = mockVehicles.find(v => v.id === id) || null;
            resolve(vehicle);
        }, 300);
    });
};

export const fetchVehiclesByOwnerId = (ownerId: string): Promise<VehicleExpanded[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const vehicles = mockVehicles.filter(v => v.ownerIds.includes(ownerId));
            resolve(vehicles);
        }, 500);
    });
};

export const addVehicle = (vehicle: Omit<VehicleExpanded, 'id'>): Promise<VehicleExpanded> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newVehicle: VehicleExpanded = {
                ...vehicle,
                id: `veh${Date.now()}`
            };
            resolve(newVehicle);
        }, 500);
    });
};

export const updateVehicle = (vehicle: VehicleExpanded): Promise<VehicleExpanded> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({...vehicle});
        }, 500);
    });
};

export const deleteVehicle = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 300);
    });
};

// Contact attempts
export const fetchContactAttemptsByClientId = (clientId: string): Promise<ContactAttempt[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const attempts = mockContactAttempts.filter(a => a.clientId === clientId);
            resolve(attempts);
        }, 300);
    });
};

export const addContactAttempt = (attempt: Omit<ContactAttempt, 'id'>): Promise<ContactAttempt> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newAttempt: ContactAttempt = {
                ...attempt,
                id: `contact${Date.now()}`
            };
            resolve(newAttempt);
        }, 300);
    });
};