import React, { useState, useEffect } from 'react';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaFileAlt,
    FaCalendarAlt,
    FaEnvelope,
    FaPhone
} from 'react-icons/fa';
import { Employee, EmployeeDocument } from '../../types';
import {
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
} from '../../api/mocks/employeesMocks';
import {
    fetchEmployeeDocuments,
    addEmployeeDocument,
    deleteEmployeeDocument
} from '../../api/mocks/employeeDocumentsMocks';

import { EmployeeFormModal } from './components/EmployeeFormModal';
import { DocumentFormModal } from './components/DocumentFormModal';
import { DocumentsDrawer } from './components/DocumentsDrawer';
import {
    PageContainer,
    PageHeader,
    LoadingMessage,
    ErrorMessage,
    EmptyState,
    EmployeesGrid,
    EmployeeCard,
    ColorBadge,
    EmployeeHeader,
    EmployeeName,
    DocumentsButton,
    EmployeePosition,
    EmployeeDetails,
    EmployeeDetail,
    DetailIcon,
    DetailText,
    EmployeeActions,
    ActionButton,
    AddButton
} from './styles/EmployeesStyles';

// Funkcja pomocnicza do formatowania daty
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const EmployeesPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    // Stan dla panelu dokumentów
    const [showDocumentsDrawer, setShowDocumentsDrawer] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [documentError, setDocumentError] = useState<string | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    // Pobieranie listy pracowników
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await fetchEmployees();
                setEmployees(data);
                setError(null);
            } catch (err) {
                setError('Nie udało się pobrać listy pracowników');
                console.error('Error fetching employees data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Obsługa dodawania nowego pracownika
    const handleAddEmployee = () => {
        // Przygotowanie pustego obiektu pracownika do formularza
        const today = new Date().toISOString().split('T')[0]; // Dzisiejsza data w formacie YYYY-MM-DD
        setEditingEmployee({
            id: '',
            fullName: '',
            birthDate: '',
            hireDate: today,
            position: '',
            email: '',
            phone: '',
            color: '#3498db' // Domyślny kolor
        });
        setShowModal(true);
    };

    // Obsługa edycji istniejącego pracownika
    const handleEditEmployee = (employee: Employee) => {
        setEditingEmployee({...employee});
        setShowModal(true);
    };

    // Obsługa usuwania pracownika
    const handleDeleteEmployee = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć tego pracownika?')) {
            try {
                const result = await deleteEmployee(id);

                if (result) {
                    // Aktualizacja stanu lokalnego po pomyślnym usunięciu
                    setEmployees(employees.filter(employee => employee.id !== id));
                }
            } catch (err) {
                setError('Nie udało się usunąć pracownika');
            }
        }
    };

    // Obsługa zapisu pracownika (dodawanie lub aktualizacja)
    const handleSaveEmployee = async (employee: Employee) => {
        try {
            let savedEmployee: Employee;

            if (employee.id) {
                // Aktualizacja istniejącego pracownika
                savedEmployee = await updateEmployee(employee);
                // Aktualizacja stanu lokalnego
                setEmployees(employees.map(emp => emp.id === savedEmployee.id ? savedEmployee : emp));
            } else {
                // Dodanie nowego pracownika
                const { id, ...employeeWithoutId } = employee;
                savedEmployee = await addEmployee(employeeWithoutId);
                // Aktualizacja stanu lokalnego
                setEmployees([...employees, savedEmployee]);
            }

            setShowModal(false);
            setEditingEmployee(null);
        } catch (err) {
            setError('Nie udało się zapisać pracownika');
        }
    };

    // Obsługa otwierania panelu dokumentów
    const handleOpenDocuments = async (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowDocumentsDrawer(true);

        try {
            setLoadingDocuments(true);
            setDocumentError(null);
            const documents = await fetchEmployeeDocuments(employee.id);
            setEmployeeDocuments(documents);
        } catch (err) {
            setDocumentError('Nie udało się pobrać dokumentów pracownika');
            console.error('Error fetching employee documents:', err);
        } finally {
            setLoadingDocuments(false);
        }
    };

    // Obsługa zamykania panelu dokumentów
    const handleCloseDocuments = () => {
        setShowDocumentsDrawer(false);
        setSelectedEmployee(null);
        setEmployeeDocuments([]);
    };

    // Obsługa dodawania nowego dokumentu
    const handleAddDocument = () => {
        if (!selectedEmployee) return;
        setShowDocumentModal(true);
    };

    // Obsługa usuwania dokumentu
    const handleDeleteDocument = async (documentId: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten dokument?')) {
            try {
                const result = await deleteEmployeeDocument(documentId);

                if (result) {
                    // Aktualizacja stanu lokalnego po pomyślnym usunięciu
                    setEmployeeDocuments(employeeDocuments.filter(doc => doc.id !== documentId));
                }
            } catch (err) {
                setDocumentError('Nie udało się usunąć dokumentu');
            }
        }
    };

    // Obsługa zapisu nowego dokumentu
    const handleSaveDocument = async (document: Omit<EmployeeDocument, 'id'>) => {
        try {
            const savedDocument = await addEmployeeDocument(document);
            setEmployeeDocuments([...employeeDocuments, savedDocument]);
            setShowDocumentModal(false);
        } catch (err) {
            setDocumentError('Nie udało się zapisać dokumentu');
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <h1>Pracownicy</h1>
                <AddButton onClick={handleAddEmployee}>
                    <FaPlus /> Dodaj pracownika
                </AddButton>
            </PageHeader>

            {loading ? (
                <LoadingMessage>Ładowanie danych...</LoadingMessage>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <>
                    {employees.length === 0 ? (
                        <EmptyState>
                            <p>Brak zdefiniowanych pracowników. Kliknij "Dodaj pracownika", aby utworzyć pierwszego.</p>
                        </EmptyState>
                    ) : (
                        <EmployeesGrid>
                            {employees.map(employee => (
                                <EmployeeCard key={employee.id}>
                                    <ColorBadge color={employee.color} />
                                    <EmployeeHeader>
                                        <EmployeeName>
                                            {employee.fullName}
                                            <DocumentsButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDocuments(employee);
                                                }}
                                                title="Pokaż dokumenty"
                                            >
                                                <FaFileAlt />
                                            </DocumentsButton>
                                        </EmployeeName>
                                        <EmployeePosition>{employee.position}</EmployeePosition>
                                    </EmployeeHeader>
                                    <EmployeeDetails>
                                        <EmployeeDetail>
                                            <DetailIcon><FaCalendarAlt /></DetailIcon>
                                            <DetailText>Data urodzenia: {formatDate(employee.birthDate)}</DetailText>
                                        </EmployeeDetail>
                                        <EmployeeDetail>
                                            <DetailIcon><FaCalendarAlt /></DetailIcon>
                                            <DetailText>Data zatrudnienia: {formatDate(employee.hireDate)}</DetailText>
                                        </EmployeeDetail>
                                        <EmployeeDetail>
                                            <DetailIcon><FaEnvelope /></DetailIcon>
                                            <DetailText>{employee.email}</DetailText>
                                        </EmployeeDetail>
                                        <EmployeeDetail>
                                            <DetailIcon><FaPhone /></DetailIcon>
                                            <DetailText>{employee.phone}</DetailText>
                                        </EmployeeDetail>
                                    </EmployeeDetails>
                                    <EmployeeActions>
                                        <ActionButton onClick={() => handleEditEmployee(employee)}>
                                            <FaEdit /> Edytuj
                                        </ActionButton>
                                        <ActionButton danger onClick={() => handleDeleteEmployee(employee.id)}>
                                            <FaTrash /> Usuń
                                        </ActionButton>
                                    </EmployeeActions>
                                </EmployeeCard>
                            ))}
                        </EmployeesGrid>
                    )}
                </>
            )}

            {showModal && editingEmployee && (
                <EmployeeFormModal
                    employee={editingEmployee}
                    onSave={handleSaveEmployee}
                    onCancel={() => {
                        setShowModal(false);
                        setEditingEmployee(null);
                    }}
                />
            )}

            {/* Panel boczny dokumentów */}
            {showDocumentsDrawer && selectedEmployee && (
                <DocumentsDrawer
                    isOpen={showDocumentsDrawer}
                    employee={selectedEmployee}
                    documents={employeeDocuments}
                    loading={loadingDocuments}
                    error={documentError}
                    onClose={handleCloseDocuments}
                    onAddDocument={handleAddDocument}
                    onDeleteDocument={handleDeleteDocument}
                />
            )}

            {/* Modal dodawania dokumentu */}
            {showDocumentModal && selectedEmployee && (
                <DocumentFormModal
                    employeeId={selectedEmployee.id}
                    onSave={handleSaveDocument}
                    onCancel={() => setShowDocumentModal(false)}
                />
            )}
        </PageContainer>
    );
};

export default EmployeesPage;