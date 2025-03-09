import { EmployeeDocument } from '../../types';

// Mockowane dane dokumentów pracowników
export const mockEmployeeDocuments: EmployeeDocument[] = [
  {
    id: '1',
    employeeId: '1',
    name: 'Umowa o pracę',
    type: 'Umowa',
    uploadDate: '2020-03-01'
  },
  {
    id: '2',
    employeeId: '1',
    name: 'Świadectwo pracy z poprzedniego miejsca',
    type: 'Dokumenty',
    uploadDate: '2020-03-02'
  },
  {
    id: '3',
    employeeId: '1',
    name: 'Wniosek urlopowy - Lato 2022',
    type: 'Wnioski Urlopowe',
    uploadDate: '2022-06-10'
  },
  {
    id: '4',
    employeeId: '2',
    name: 'Umowa o pracę',
    type: 'Umowa',
    uploadDate: '2019-11-15'
  },
  {
    id: '5',
    employeeId: '2',
    name: 'Aneks do umowy',
    type: 'Umowa',
    uploadDate: '2021-04-21'
  },
  {
    id: '6',
    employeeId: '2',
    name: 'Zwolnienie lekarskie - Styczeń 2023',
    type: 'Zwolnienia',
    uploadDate: '2023-01-15'
  },
  {
    id: '7',
    employeeId: '3',
    name: 'Umowa o pracę',
    type: 'Umowa',
    uploadDate: '2021-01-10'
  },
  {
    id: '8',
    employeeId: '4',
    name: 'Umowa o pracę',
    type: 'Umowa',
    uploadDate: '2022-06-15'
  },
  {
    id: '9',
    employeeId: '4',
    name: 'Wniosek urlopowy - Wrzesień 2023',
    type: 'Wnioski Urlopowe',
    uploadDate: '2023-08-12'
  }
];

// Dostępne typy dokumentów
export const documentTypes = [
  'Umowa',
  'Zwolnienia',
  'Wnioski Urlopowe',
  'Oświadczenia',
  'Zaświadczenia',
  'Certyfikaty',
  'Dokumenty'
];

// Funkcja symulująca pobieranie dokumentów pracownika
export const fetchEmployeeDocuments = (employeeId: string): Promise<EmployeeDocument[]> => {
  return new Promise((resolve) => {
    // Symulacja opóźnienia sieciowego
    setTimeout(() => {
      const documents = mockEmployeeDocuments.filter(doc => doc.employeeId === employeeId);
      resolve([...documents]);
    }, 300);
  });
};

// Funkcja symulująca dodawanie nowego dokumentu
export const addEmployeeDocument = (document: Omit<EmployeeDocument, 'id'>): Promise<EmployeeDocument> => {
  return new Promise((resolve) => {
    // Symulacja opóźnienia sieciowego
    setTimeout(() => {
      const newDocument: EmployeeDocument = {
        ...document,
        id: `doc-${Date.now()}`
      };
      resolve(newDocument);
    }, 300);
  });
};

// Funkcja symulująca usuwanie dokumentu
export const deleteEmployeeDocument = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Symulacja opóźnienia sieciowego
    setTimeout(() => {
      resolve(true);
    }, 300);
  });
};