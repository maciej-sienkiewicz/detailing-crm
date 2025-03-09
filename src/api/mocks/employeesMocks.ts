import { Employee } from '../../types';

// Mockowane dane pracowników
export const mockEmployees: Employee[] = [
    {
        id: '1',
        fullName: 'Jan Kowalski',
        birthDate: '1985-05-15',
        hireDate: '2020-03-01',
        position: 'Detailer',
        email: 'jan.kowalski@example.com',
        phone: '+48 123 456 789',
        color: '#3498db'
    },
    {
        id: '2',
        fullName: 'Anna Nowak',
        birthDate: '1990-07-22',
        hireDate: '2019-11-15',
        position: 'Kierownik',
        email: 'anna.nowak@example.com',
        phone: '+48 987 654 321',
        color: '#e74c3c'
    },
    {
        id: '3',
        fullName: 'Piotr Wiśniewski',
        birthDate: '1988-12-10',
        hireDate: '2021-01-10',
        position: 'Detailer',
        email: 'piotr.wisniewski@example.com',
        phone: '+48 555 444 333',
        color: '#2ecc71'
    },
    {
        id: '4',
        fullName: 'Magdalena Lewandowska',
        birthDate: '1992-03-28',
        hireDate: '2022-06-15',
        position: 'Recepcjonistka',
        email: 'magdalena.lewandowska@example.com',
        phone: '+48 111 222 333',
        color: '#f39c12'
    }
];

// Funkcja symulująca pobieranie listy pracowników z API
export const fetchEmployees = (): Promise<Employee[]> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve([...mockEmployees]);
        }, 500);
    });
};

// Funkcja symulująca dodawanie nowego pracownika
export const addEmployee = (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            const newEmployee: Employee = {
                ...employee,
                id: `employee-${Date.now()}`
            };
            resolve(newEmployee);
        }, 500);
    });
};

// Funkcja symulująca aktualizację istniejącego pracownika
export const updateEmployee = (employee: Employee): Promise<Employee> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve({...employee});
        }, 500);
    });
};

// Funkcja symulująca usuwanie pracownika
export const deleteEmployee = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        // Symulacja opóźnienia sieciowego
        setTimeout(() => {
            resolve(true);
        }, 300);
    });
};