// src/api/mocks/employeesMocks.ts - Zaktualizowane mocki pracowników
import { Employee } from '../../types';
import { ExtendedEmployee, UserRole, ContractType } from '../../types/employeeTypes';


export const mockEmployees: Employee[] = []

// Rozszerzone dane pracowników z pełnymi informacjami HR
const mockExtendedEmployees: ExtendedEmployee[] = [
    {
        id: '1',
        fullName: 'Anna Kowalska',
        birthDate: '1990-03-15',
        hireDate: '2022-01-10',
        position: 'Kierownik Działu Detailingu',
        email: 'anna.kowalska@detailingpro.pl',
        phone: '+48 123 456 789',
        color: '#e74c3c',
        role: UserRole.MANAGER,
        hourlyRate: 45.00,
        bonusFromRevenue: 5.0,
        isActive: true,
        lastLoginDate: '2024-12-15T09:30:00Z',
        workingHoursPerWeek: 40,
        contractType: ContractType.EMPLOYMENT,
        emergencyContact: {
            name: 'Tomasz Kowalski',
            phone: '+48 987 654 321',
            relation: 'Mąż'
        },
        notes: 'Bardzo doświadczona w zarządzaniu zespołem. Specjalizuje się w detailingu premium.'
    },
    {
        id: '2',
        fullName: 'Marcin Nowak',
        birthDate: '1985-07-22',
        hireDate: '2021-06-15',
        position: 'Senior Detailer',
        email: 'marcin.nowak@detailingpro.pl',
        phone: '+48 234 567 890',
        color: '#3498db',
        role: UserRole.EMPLOYEE,
        hourlyRate: 35.00,
        bonusFromRevenue: 3.0,
        isActive: true,
        lastLoginDate: '2024-12-15T14:20:00Z',
        workingHoursPerWeek: 40,
        contractType: ContractType.EMPLOYMENT,
        emergencyContact: {
            name: 'Maria Nowak',
            phone: '+48 876 543 210',
            relation: 'Żona'
        },
        notes: 'Ekspert w ceramice i zabezpieczeniach. Prowadzi szkolenia dla nowych pracowników.'
    },
    {
        id: '3',
        fullName: 'Katarzyna Wiśniewska',
        birthDate: '1992-11-08',
        hireDate: '2023-03-20',
        position: 'Detailer',
        email: 'katarzyna.wisniewska@detailingpro.pl',
        phone: '+48 345 678 901',
        color: '#9b59b6',
        role: UserRole.EMPLOYEE,
        hourlyRate: 28.00,
        bonusFromRevenue: 2.0,
        isActive: true,
        lastLoginDate: '2024-12-14T16:45:00Z',
        workingHoursPerWeek: 32,
        contractType: ContractType.EMPLOYMENT,
        emergencyContact: {
            name: 'Jan Wiśniewski',
            phone: '+48 765 432 109',
            relation: 'Ojciec'
        },
        notes: 'Specjalizuje się w detailingu wnętrz. Bardzo precyzyjna w pracy.'
    },
    {
        id: '4',
        fullName: 'Paweł Zieliński',
        birthDate: '1988-12-03',
        hireDate: '2020-09-01',
        position: 'Konsultant Techniczny',
        email: 'pawel.zielinski@detailingpro.pl',
        phone: '+48 456 789 012',
        color: '#f39c12',
        role: UserRole.EMPLOYEE,
        hourlyRate: 32.00,
        bonusFromRevenue: 4.0,
        isActive: true,
        lastLoginDate: '2024-12-15T11:15:00Z',
        workingHoursPerWeek: 40,
        contractType: ContractType.B2B,
        emergencyContact: {
            name: 'Agnieszka Zielińska',
            phone: '+48 654 321 098',
            relation: 'Żona'
        },
        notes: 'Odpowiedzialny za konsultacje techniczne i dobór produktów do konkretnych projektów.'
    },
    {
        id: '5',
        fullName: 'Michał Jankowski',
        birthDate: '1995-05-18',
        hireDate: '2023-08-14',
        position: 'Junior Detailer',
        email: 'michal.jankowski@detailingpro.pl',
        phone: '+48 567 890 123',
        color: '#2ecc71',
        role: UserRole.EMPLOYEE,
        hourlyRate: 22.00,
        bonusFromRevenue: 1.5,
        isActive: true,
        lastLoginDate: '2024-12-15T08:00:00Z',
        workingHoursPerWeek: 40,
        contractType: ContractType.EMPLOYMENT,
        emergencyContact: {
            name: 'Barbara Jankowska',
            phone: '+48 543 210 987',
            relation: 'Matka'
        },
        notes: 'Nowy w branży, ale bardzo chętny do nauki. Szybko przyswaja nowe umiejętności.'
    },
    {
        id: '6',
        fullName: 'Robert Król',
        birthDate: '1983-09-25',
        hireDate: '2019-11-30',
        position: 'Administrator Systemu',
        email: 'robert.krol@detailingpro.pl',
        phone: '+48 678 901 234',
        color: '#34495e',
        role: UserRole.ADMIN,
        hourlyRate: 50.00,
        bonusFromRevenue: 2.0,
        isActive: true,
        lastLoginDate: '2024-12-15T07:45:00Z',
        workingHoursPerWeek: 40,
        contractType: ContractType.EMPLOYMENT,
        emergencyContact: {
            name: 'Monika Król',
            phone: '+48 432 109 876',
            relation: 'Żona'
        },
        notes: 'Odpowiedzialny za IT i administrację systemu. Ma pełny dostęp do wszystkich funkcji.'
    },
    {
        id: '7',
        fullName: 'Agnieszka Dąbrowska',
        birthDate: '1991-02-14',
        hireDate: '2022-05-12',
        position: 'Specjalista ds. Klienta',
        email: 'agnieszka.dabrowska@detailingpro.pl',
        phone: '+48 789 012 345',
        color: '#e67e22',
        role: UserRole.EMPLOYEE,
        hourlyRate: 26.00,
        bonusFromRevenue: 3.5,
        isActive: true,
        lastLoginDate: '2024-12-14T17:30:00Z',
        workingHoursPerWeek: 36,
        contractType: ContractType.EMPLOYMENT,
        emergencyContact: {
            name: 'Krzysztof Dąbrowski',
            phone: '+48 321 098 765',
            relation: 'Brat'
        },
        notes: 'Obsługuje VIP klientów. Doskonała znajomość języków obcych.'
    },
    {
        id: '8',
        fullName: 'Łukasz Mazurek',
        birthDate: '1987-10-30',
        hireDate: '2021-01-18',
        position: 'Detailer Mobilny',
        email: 'lukasz.mazurek@detailingpro.pl',
        phone: '+48 890 123 456',
        color: '#1abc9c',
        role: UserRole.EMPLOYEE,
        hourlyRate: 30.00,
        bonusFromRevenue: 2.5,
        isActive: true,
        lastLoginDate: '2024-12-15T13:20:00Z',
        workingHoursPerWeek: 42,
        contractType: ContractType.MANDATE,
        emergencyContact: {
            name: 'Ewa Mazurek',
            phone: '+48 210 987 654',
            relation: 'Matka'
        },
        notes: 'Specjalizuje się w usługach mobilnych. Obsługuje klientów w całym regionie.'
    },
    {
        id: '9',
        fullName: 'Joanna Krawczyk',
        birthDate: '1993-06-12',
        hireDate: '2023-10-05',
        position: 'Asystent Detailera',
        email: 'joanna.krawczyk@detailingpro.pl',
        phone: '+48 901 234 567',
        color: '#8e44ad',
        role: UserRole.EMPLOYEE,
        hourlyRate: 20.00,
        bonusFromRevenue: 1.0,
        isActive: false, // Nieaktywna - na urlopie macierzyńskim
        lastLoginDate: '2024-11-20T10:00:00Z',
        workingHoursPerWeek: 40,
        contractType: ContractType.EMPLOYMENT,
        emergencyContact: {
            name: 'Piotr Krawczyk',
            phone: '+48 109 876 543',
            relation: 'Mąż'
        },
        notes: 'Obecnie na urlopie macierzyńskim. Planowany powrót w marcu 2025.'
    },
    {
        id: '10',
        fullName: 'Adam Kowalczyk',
        birthDate: '1986-04-07',
        hireDate: '2020-02-14',
        position: 'Kierownik Sprzedaży',
        email: 'adam.kowalczyk@detailingpro.pl',
        phone: '+48 012 345 678',
        color: '#d35400',
        role: UserRole.MANAGER,
        hourlyRate: 42.00,
        bonusFromRevenue: 8.0,
        isActive: true,
        lastLoginDate: '2024-12-15T12:10:00Z',
        workingHoursPerWeek: 40,
        contractType: ContractType.EMPLOYMENT,
        emergencyContact: {
            name: 'Justyna Kowalczyk',
            phone: '+48 098 765 432',
            relation: 'Żona'
        },
        notes: 'Odpowiedzialny za sprzedaż i rozwój biznesu. Doskonałe wyniki w pozyskiwaniu nowych klientów.'
    }
];

// Funkcje API - zaktualizowane do ExtendedEmployee
export const fetchEmployees = async (): Promise<ExtendedEmployee[]> => {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 800));

    return mockExtendedEmployees;
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<ExtendedEmployee> => {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 600));

    const newEmployee: ExtendedEmployee = {
        ...employeeData,
        id: `emp_${Date.now()}`,
        role: UserRole.EMPLOYEE,
        hourlyRate: 25.00,
        bonusFromRevenue: 0,
        isActive: true,
        workingHoursPerWeek: 40,
        contractType: ContractType.EMPLOYMENT,
        lastLoginDate: new Date().toISOString()
    };

    mockExtendedEmployees.push(newEmployee);
    return newEmployee;
};

export const updateEmployee = async (employee: Employee): Promise<ExtendedEmployee> => {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 600));

    const index = mockExtendedEmployees.findIndex(emp => emp.id === employee.id);
    if (index !== -1) {
        // Zachowaj rozszerzone właściwości, zaktualizuj tylko podstawowe
        mockExtendedEmployees[index] = {
            ...mockExtendedEmployees[index],
            ...employee
        };
        return mockExtendedEmployees[index];
    }

    throw new Error('Pracownik nie został znaleziony');
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockExtendedEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
        mockExtendedEmployees.splice(index, 1);
        return true;
    }

    return false;
};

// Dodatkowe funkcje pomocnicze dla testowania
export const getEmployeeById = async (id: string): Promise<ExtendedEmployee | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockExtendedEmployees.find(emp => emp.id === id) || null;
};

export const getEmployeesByRole = async (role: UserRole): Promise<ExtendedEmployee[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    return mockExtendedEmployees.filter(emp => emp.role === role);
};

export const getActiveEmployees = async (): Promise<ExtendedEmployee[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    return mockExtendedEmployees.filter(emp => emp.isActive);
};

// Mock danych statystycznych
export const getEmployeeStats = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const totalEmployees = mockExtendedEmployees.length;
    const activeEmployees = mockExtendedEmployees.filter(emp => emp.isActive).length;
    const inactiveEmployees = totalEmployees - activeEmployees;

    // Oblicz średni wiek
    const averageAge = mockExtendedEmployees.reduce((sum, emp) => {
        const age = new Date().getFullYear() - new Date(emp.birthDate).getFullYear();
        return sum + age;
    }, 0) / totalEmployees;

    // Rozkład według ról
    const roleDistribution = {
        [UserRole.ADMIN]: mockExtendedEmployees.filter(emp => emp.role === UserRole.ADMIN).length,
        [UserRole.MANAGER]: mockExtendedEmployees.filter(emp => emp.role === UserRole.MANAGER).length,
        [UserRole.EMPLOYEE]: mockExtendedEmployees.filter(emp => emp.role === UserRole.EMPLOYEE).length,
    };

    // Rozkład według typów umów
    const contractTypeDistribution = {
        [ContractType.EMPLOYMENT]: mockExtendedEmployees.filter(emp => emp.contractType === ContractType.EMPLOYMENT).length,
        [ContractType.B2B]: mockExtendedEmployees.filter(emp => emp.contractType === ContractType.B2B).length,
        [ContractType.MANDATE]: mockExtendedEmployees.filter(emp => emp.contractType === ContractType.MANDATE).length,
    };

    return {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        averageAge: Math.round(averageAge),
        roleDistribution,
        contractTypeDistribution
    };
};

// Funkcja do symulacji różnych scenariuszy
export const createTestScenarios = () => {
    return {
        // Scenariusz z dużą liczbą pracowników
        largeDepartment: () => {
            const additionalEmployees = Array.from({ length: 15 }, (_, i) => ({
                id: `test_${i + 100}`,
                fullName: `Pracownik ${i + 1} Testowy`,
                birthDate: `199${Math.floor(Math.random() * 10)}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
                hireDate: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                position: ['Detailer', 'Senior Detailer', 'Asystent', 'Specjalista'][Math.floor(Math.random() * 4)],
                email: `pracownik${i + 1}@detailingpro.pl`,
                phone: `+48 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
                color: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'][Math.floor(Math.random() * 5)],
                role: [UserRole.EMPLOYEE, UserRole.MANAGER][Math.floor(Math.random() * 2)],
                hourlyRate: Math.floor(Math.random() * 30) + 20,
                bonusFromRevenue: Math.random() * 5,
                isActive: Math.random() > 0.1, // 90% aktywnych
                workingHoursPerWeek: [32, 36, 40, 42][Math.floor(Math.random() * 4)],
                contractType: [ContractType.EMPLOYMENT, ContractType.B2B, ContractType.MANDATE][Math.floor(Math.random() * 3)],
                lastLoginDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            }));

            return [...mockExtendedEmployees, ...additionalEmployees] as ExtendedEmployee[];
        }
    };
};