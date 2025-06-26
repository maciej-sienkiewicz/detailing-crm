// src/api/mocks/employeeDocumentsMocks.ts - Zaktualizowane mocki dokumentów pracowników
import { EmployeeDocument } from '../../types';

// Typy dokumentów pracowniczych
export const documentTypes = [
  'Umowa o pracę',
  'Aneks do umowy',
  'Świadectwo pracy',
  'Zaświadczenie o zatrudnieniu',
  'Badania lekarskie',
  'Szkolenie BHP',
  'Zgoda RODO',
  'NDA',
  'Karta urlopowa',
  'Zwolnienie lekarskie',
  'Delegacja służbowa',
  'Rozliczenie kosztów',
  'Ocena okresowa',
  'Pochwała',
  'Ostrzeżenie',
  'Inne'
];

// Mock dokumentów pracowników - bardziej realistyczne dane
const mockEmployeeDocuments: EmployeeDocument[] = [
  // Dokumenty dla Anny Kowalskiej (ID: 1)
  {
    id: 'doc_1_1',
    employeeId: '1',
    name: 'Umowa o pracę - Kierownik Działu',
    type: 'Umowa o pracę',
    uploadDate: '2022-01-08'
  },
  {
    id: 'doc_1_2',
    employeeId: '1',
    name: 'Badania okresowe 2024',
    type: 'Badania lekarskie',
    uploadDate: '2024-03-15'
  },
  {
    id: 'doc_1_3',
    employeeId: '1',
    name: 'Szkolenie BHP kierownicze',
    type: 'Szkolenie BHP',
    uploadDate: '2024-01-10'
  },
  {
    id: 'doc_1_4',
    employeeId: '1',
    name: 'Ocena roczna 2023',
    type: 'Ocena okresowa',
    uploadDate: '2024-01-31'
  },

  // Dokumenty dla Marcina Nowaka (ID: 2)
  {
    id: 'doc_2_1',
    employeeId: '2',
    name: 'Umowa o pracę - Senior Detailer',
    type: 'Umowa o pracę',
    uploadDate: '2021-06-12'
  },
  {
    id: 'doc_2_2',
    employeeId: '2',
    name: 'Aneks - podwyżka 2024',
    type: 'Aneks do umowy',
    uploadDate: '2024-02-01'
  },
  {
    id: 'doc_2_3',
    employeeId: '2',
    name: 'Certyfikat szkolenia ceramika',
    type: 'Szkolenie BHP',
    uploadDate: '2023-09-20'
  },
  {
    id: 'doc_2_4',
    employeeId: '2',
    name: 'Badania profilaktyczne',
    type: 'Badania lekarskie',
    uploadDate: '2024-06-10'
  },
  {
    id: 'doc_2_5',
    employeeId: '2',
    name: 'Pochwała za szkolenie juniorów',
    type: 'Pochwała',
    uploadDate: '2024-05-15'
  },

  // Dokumenty dla Katarzyny Wiśniewskiej (ID: 3)
  {
    id: 'doc_3_1',
    employeeId: '3',
    name: 'Umowa o pracę - Detailer',
    type: 'Umowa o pracę',
    uploadDate: '2023-03-18'
  },
  {
    id: 'doc_3_2',
    employeeId: '3',
    name: 'Szkolenie wstępne BHP',
    type: 'Szkolenie BHP',
    uploadDate: '2023-03-20'
  },
  {
    id: 'doc_3_3',
    employeeId: '3',
    name: 'Badania wstępne',
    type: 'Badania lekarskie',
    uploadDate: '2023-03-15'
  },

  // Dokumenty dla Pawła Zielińskiego (ID: 4)
  {
    id: 'doc_4_1',
    employeeId: '4',
    name: 'Umowa B2B - Konsultant',
    type: 'Umowa o pracę',
    uploadDate: '2020-08-28'
  },
  {
    id: 'doc_4_2',
    employeeId: '4',
    name: 'NDA - poufność produktów',
    type: 'NDA',
    uploadDate: '2020-09-01'
  },
  {
    id: 'doc_4_3',
    employeeId: '4',
    name: 'Certyfikat technik detailingu',
    type: 'Szkolenie BHP',
    uploadDate: '2021-04-12'
  },

  // Dokumenty dla Michała Jankowskiego (ID: 5)
  {
    id: 'doc_5_1',
    employeeId: '5',
    name: 'Umowa o pracę - Junior',
    type: 'Umowa o pracę',
    uploadDate: '2023-08-12'
  },
  {
    id: 'doc_5_2',
    employeeId: '5',
    name: 'Szkolenie podstawowe',
    type: 'Szkolenie BHP',
    uploadDate: '2023-08-14'
  },
  {
    id: 'doc_5_3',
    employeeId: '5',
    name: 'Badania wstępne do pracy',
    type: 'Badania lekarskie',
    uploadDate: '2023-08-10'
  },

  // Dokumenty dla Roberta Króla (ID: 6)
  {
    id: 'doc_6_1',
    employeeId: '6',
    name: 'Umowa o pracę - Administrator',
    type: 'Umowa o pracę',
    uploadDate: '2019-11-28'
  },
  {
    id: 'doc_6_2',
    employeeId: '6',
    name: 'NDA - dostęp do systemów',
    type: 'NDA',
    uploadDate: '2019-11-30'
  },
  {
    id: 'doc_6_3',
    employeeId: '6',
    name: 'Szkolenie cyberbezpieczeństwo',
    type: 'Szkolenie BHP',
    uploadDate: '2024-01-15'
  },
  {
    id: 'doc_6_4',
    employeeId: '6',
    name: 'Ocena wybitna 2023',
    type: 'Ocena okresowa',
    uploadDate: '2024-02-01'
  },

  // Dokumenty dla Agnieszki Dąbrowskiej (ID: 7)
  {
    id: 'doc_7_1',
    employeeId: '7',
    name: 'Umowa o pracę - Specjalista',
    type: 'Umowa o pracę',
    uploadDate: '2022-05-10'
  },
  {
    id: 'doc_7_2',
    employeeId: '7',
    name: 'Certyfikat języka angielskiego',
    type: 'Szkolenie BHP',
    uploadDate: '2022-06-20'
  },
  {
    id: 'doc_7_3',
    employeeId: '7',
    name: 'Aneks - zmiana godzin pracy',
    type: 'Aneks do umowy',
    uploadDate: '2024-03-01'
  },

  // Dokumenty dla Łukasza Mazurka (ID: 8)
  {
    id: 'doc_8_3',
    employeeId: '8',
    name: 'Delegacja - obsługa klienta w Krakowie',
    type: 'Delegacja służbowa',
    uploadDate: '2024-11-20'
  },

  // Dokumenty dla Joanny Krawczyk (ID: 9)
  {
    id: 'doc_9_1',
    employeeId: '9',
    name: 'Umowa o pracę - Asystent',
    type: 'Umowa o pracę',
    uploadDate: '2023-10-03'
  },
  {
    id: 'doc_9_2',
    employeeId: '9',
    name: 'Wniosek o urlop macierzyński',
    type: 'Karta urlopowa',
    uploadDate: '2024-09-15'
  },
  {
    id: 'doc_9_3',
    employeeId: '9',
    name: 'Zaświadczenie o ciąży',
    type: 'Zwolnienie lekarskie',
    uploadDate: '2024-09-10'
  },

  // Dokumenty dla Adama Kowalczyka (ID: 10)
  {
    id: 'doc_10_1',
    employeeId: '10',
    name: 'Umowa o pracę - Kierownik Sprzedaży',
    type: 'Umowa o pracę',
    uploadDate: '2020-02-12'
  },
  {
    id: 'doc_10_2',
    employeeId: '10',
    name: 'Cele sprzedażowe 2024',
    type: 'Ocena okresowa',
    uploadDate: '2024-01-05'
  },
  {
    id: 'doc_10_3',
    employeeId: '10',
    name: 'Szkolenie techniki sprzedaży',
    type: 'Szkolenie BHP',
    uploadDate: '2023-11-10'
  },
  {
    id: 'doc_10_4',
    employeeId: '10',
    name: 'Rozliczenie kosztów - targi branżowe',
    type: 'Rozliczenie kosztów',
    uploadDate: '2024-10-30'
  },
  {
    id: 'doc_10_5',
    employeeId: '10',
    name: 'Bonus za przekroczenie planów',
    type: 'Pochwała',
    uploadDate: '2024-12-01'
  }
];

// Funkcje API dla dokumentów pracowników
export const fetchEmployeeDocuments = async (employeeId: string): Promise<EmployeeDocument[]> => {
  // Symulacja opóźnienia API
  await new Promise(resolve => setTimeout(resolve, 600));

  return mockEmployeeDocuments.filter(doc => doc.employeeId === employeeId);
};

export const addEmployeeDocument = async (document: Omit<EmployeeDocument, 'id'>): Promise<EmployeeDocument> => {
  // Symulacja opóźnienia API
  await new Promise(resolve => setTimeout(resolve, 500));

  const newDocument: EmployeeDocument = {
    ...document,
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  mockEmployeeDocuments.push(newDocument);
  return newDocument;
};

export const deleteEmployeeDocument = async (documentId: string): Promise<boolean> => {
  // Symulacja opóźnienia API
  await new Promise(resolve => setTimeout(resolve, 400));

  const index = mockEmployeeDocuments.findIndex(doc => doc.id === documentId);
  if (index !== -1) {
    mockEmployeeDocuments.splice(index, 1);
    return true;
  }

  return false;
};

export const getDocumentById = async (documentId: string): Promise<EmployeeDocument | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return mockEmployeeDocuments.find(doc => doc.id === documentId) || null;
};

export const getDocumentsByType = async (type: string): Promise<EmployeeDocument[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  return mockEmployeeDocuments.filter(doc => doc.type === type);
};

// Funkcja do generowania statystyk dokumentów
export const getDocumentStats = async (employeeId?: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const docs = employeeId
      ? mockEmployeeDocuments.filter(doc => doc.employeeId === employeeId)
      : mockEmployeeDocuments;

  // Grupowanie według typów
  const typeStats = docs.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Dokumenty według miesięcy (ostatnie 12 miesięcy)
  const monthlyStats = docs.reduce((acc, doc) => {
    const month = doc.uploadDate.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalDocuments: docs.length,
    typeDistribution: typeStats,
    monthlyDistribution: monthlyStats,
    averageDocumentsPerEmployee: employeeId ? docs.length : Math.round(docs.length / 10)
  };
};

// Mock funkcji do "pobierania" dokumentów
export const downloadDocument = async (documentId: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const document = mockEmployeeDocuments.find(doc => doc.id === documentId);
  if (!document) {
    throw new Error('Dokument nie został znaleziony');
  }

  // W prawdziwej aplikacji zwrócilibyśmy URL do pliku
  return `https://files.detailingpro.pl/documents/${documentId}.pdf`;
};

// Funkcja pomocnicza do tworzenia przykładowych dokumentów dla nowego pracownika
export const createDefaultDocumentsForEmployee = async (employeeId: string, employeeName: string): Promise<EmployeeDocument[]> => {
  const defaultDocs = [
    {
      employeeId,
      name: `Umowa o pracę - ${employeeName}`,
      type: 'Umowa o pracę',
      uploadDate: new Date().toISOString().split('T')[0]
    },
    {
      employeeId,
      name: `Szkolenie wstępne BHP - ${employeeName}`,
      type: 'Szkolenie BHP',
      uploadDate: new Date().toISOString().split('T')[0]
    },
    {
      employeeId,
      name: `Zgoda RODO - ${employeeName}`,
      type: 'Zgoda RODO',
      uploadDate: new Date().toISOString().split('T')[0]
    }
  ];

  const createdDocs: EmployeeDocument[] = [];
  for (const doc of defaultDocs) {
    const created = await addEmployeeDocument(doc);
    createdDocs.push(created);
  }

  return createdDocs;
};