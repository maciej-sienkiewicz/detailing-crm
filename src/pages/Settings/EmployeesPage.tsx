// src/pages/Settings/EmployeesPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaFileAlt,
    FaCalendarAlt,
    FaEnvelope,
    FaPhone,
    FaUser,
    FaSearch,
    FaChevronDown,
    FaChevronUp,
    FaFilter,
    FaTimes
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
import { settingsTheme } from './styles/theme';

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
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    // Search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [positionFilter, setPositionFilter] = useState('');

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

    // Filtrowanie pracowników
    useEffect(() => {
        let result = [...employees];

        // Filtrowanie po wyszukiwanej frazie
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase().trim();
            result = result.filter(employee =>
                employee.fullName.toLowerCase().includes(query) ||
                employee.email.toLowerCase().includes(query) ||
                employee.phone.includes(query) ||
                employee.position.toLowerCase().includes(query)
            );
        }

        // Filtrowanie po stanowisku
        if (positionFilter.trim()) {
            const posQuery = positionFilter.toLowerCase().trim();
            result = result.filter(employee =>
                employee.position.toLowerCase().includes(posQuery)
            );
        }

        setFilteredEmployees(result);
    }, [employees, searchTerm, positionFilter]);

    // Obsługa dodawania nowego pracownika
    const handleAddEmployee = () => {
        const today = new Date().toISOString().split('T')[0];
        setEditingEmployee({
            id: '',
            fullName: '',
            birthDate: '',
            hireDate: today,
            position: '',
            email: '',
            phone: '',
            color: '#1a365d'
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
                    setEmployees(employees.filter(employee => employee.id !== id));
                }
            } catch (err) {
                setError('Nie udało się usunąć pracownika');
            }
        }
    };

    // Obsługa zapisu pracownika
    const handleSaveEmployee = async (employee: Employee) => {
        try {
            let savedEmployee: Employee;

            if (employee.id) {
                savedEmployee = await updateEmployee(employee);
                setEmployees(employees.map(emp => emp.id === savedEmployee.id ? savedEmployee : emp));
            } else {
                const { id, ...employeeWithoutId } = employee;
                savedEmployee = await addEmployee(employeeWithoutId);
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

    // Clear filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setPositionFilter('');
    };

    const hasActiveFilters = () => {
        return searchTerm.trim() !== '' || positionFilter.trim() !== '';
    };

    // Get unique positions for filter
    const uniquePositions = [...new Set(employees.map(emp => emp.position))];

    return (
        <ContentContainer>
            {/* Filters */}
            <FiltersContainer>
                <QuickSearchSection>
                    <SearchWrapper>
                        <SearchIcon>
                            <FaSearch />
                        </SearchIcon>
                        <SearchInput
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Szybkie wyszukiwanie - imię, nazwisko, email, telefon..."
                        />
                        {searchTerm && (
                            <ClearSearchButton onClick={() => setSearchTerm('')}>
                                <FaTimes />
                            </ClearSearchButton>
                        )}
                    </SearchWrapper>

                    <AdvancedToggle
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        $expanded={showAdvancedFilters}
                    >
                        <FaFilter />
                        Filtry zaawansowane
                        {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                    </AdvancedToggle>
                </QuickSearchSection>

                {showAdvancedFilters && (
                    <AdvancedFiltersSection>
                        <FiltersGrid>
                            <FormGroup>
                                <Label>Stanowisko</Label>
                                <Select
                                    value={positionFilter}
                                    onChange={(e) => setPositionFilter(e.target.value)}
                                >
                                    <option value="">Wszystkie stanowiska</option>
                                    {uniquePositions.map(position => (
                                        <option key={position} value={position}>{position}</option>
                                    ))}
                                </Select>
                            </FormGroup>
                        </FiltersGrid>

                        <FiltersActions>
                            <ClearButton onClick={clearAllFilters}>
                                <FaTimes />
                                Wyczyść wszystkie
                            </ClearButton>
                        </FiltersActions>
                    </AdvancedFiltersSection>
                )}

                <ResultsCounter>
                    Znaleziono: <strong>{filteredEmployees.length}</strong> {filteredEmployees.length === 1 ? 'pracownik' : 'pracowników'}
                </ResultsCounter>
            </FiltersContainer>

            {/* Content */}
            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie pracowników...</LoadingText>
                </LoadingContainer>
            ) : error ? (
                <ErrorMessage>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                </ErrorMessage>
            ) : (
                <>
                    {employees.length === 0 ? (
                        <EmptyStateContainer>
                            <EmptyStateIcon>
                                <FaUser />
                            </EmptyStateIcon>
                            <EmptyStateTitle>Brak pracowników</EmptyStateTitle>
                            <EmptyStateDescription>
                                Nie masz jeszcze żadnych pracowników w systemie
                            </EmptyStateDescription>
                            <EmptyStateAction>
                                Kliknij przycisk "Dodaj pracownika", aby dodać pierwszego pracownika
                            </EmptyStateAction>
                        </EmptyStateContainer>
                    ) : filteredEmployees.length === 0 && hasActiveFilters() ? (
                        <EmptyStateContainer>
                            <EmptyStateIcon>
                                <FaSearch />
                            </EmptyStateIcon>
                            <EmptyStateTitle>Brak wyników</EmptyStateTitle>
                            <EmptyStateDescription>
                                Nie znaleziono pracowników spełniających kryteria wyszukiwania
                            </EmptyStateDescription>
                        </EmptyStateContainer>
                    ) : (
                        <TableContainer>
                            <TableHeader>
                                <TableTitle>
                                    Pracownicy ({filteredEmployees.length})
                                </TableTitle>
                                <AddEmployeeButton onClick={handleAddEmployee}>
                                    <FaPlus />
                                    Dodaj pracownika
                                </AddEmployeeButton>
                            </TableHeader>

                            <EmployeesGrid>
                                {filteredEmployees.map(employee => (
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
                                                <DetailText>Urodzony: {formatDate(employee.birthDate)}</DetailText>
                                            </EmployeeDetail>
                                            <EmployeeDetail>
                                                <DetailIcon><FaCalendarAlt /></DetailIcon>
                                                <DetailText>Zatrudniony: {formatDate(employee.hireDate)}</DetailText>
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
                                            <ActionButton
                                                onClick={() => handleEditEmployee(employee)}
                                                $variant="edit"
                                            >
                                                <FaEdit />
                                                Edytuj
                                            </ActionButton>
                                            <ActionButton
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                $variant="delete"
                                            >
                                                <FaTrash />
                                                Usuń
                                            </ActionButton>
                                        </EmployeeActions>
                                    </EmployeeCard>
                                ))}
                            </EmployeesGrid>
                        </TableContainer>
                    )}
                </>
            )}

            {/* Modals */}
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

            {showDocumentModal && selectedEmployee && (
                <DocumentFormModal
                    employeeId={selectedEmployee.id}
                    onSave={handleSaveDocument}
                    onCancel={() => setShowDocumentModal(false)}
                />
            )}
        </ContentContainer>
    );
};

// Styled Components - Based on Finance Module Style
const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${settingsTheme.spacing.xl} ${settingsTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
        gap: ${settingsTheme.spacing.md};
    }
`;

const FiltersContainer = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    overflow: hidden;
    box-shadow: ${settingsTheme.shadow.sm};
`;

const QuickSearchSection = styled.div`
    padding: ${settingsTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    border-bottom: 1px solid ${settingsTheme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SearchWrapper = styled.div`
    position: relative;
    flex: 1;
    max-width: 500px;

    @media (max-width: 768px) {
        max-width: none;
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${settingsTheme.text.muted};
    font-size: 16px;
    z-index: 2;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 48px 0 48px;
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.lg};
    font-size: 16px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
    }
`;

const ClearSearchButton = styled.button`
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border: none;
    background: ${settingsTheme.surfaceAlt};
    color: ${settingsTheme.text.muted};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.status.error};
        color: white;
    }
`;

const AdvancedToggle = styled.button<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 2px solid ${props => props.$expanded ? settingsTheme.primary : settingsTheme.border};
    background: ${props => props.$expanded ? settingsTheme.primaryGhost : settingsTheme.surface};
    color: ${props => props.$expanded ? settingsTheme.primary : settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        border-color: ${settingsTheme.primary};
        color: ${settingsTheme.primary};
    }
`;

const AdvancedFiltersSection = styled.div`
    padding: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surfaceAlt};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${settingsTheme.spacing.md};
    margin-bottom: ${settingsTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
`;

const Select = styled.select`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${settingsTheme.spacing.sm};
    padding-top: ${settingsTheme.spacing.md};
    border-top: 1px solid ${settingsTheme.border};
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${settingsTheme.status.error};
        color: ${settingsTheme.status.error};
        background: ${settingsTheme.status.errorLight};
    }
`;

const ResultsCounter = styled.div`
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    background: ${settingsTheme.primaryGhost};
    color: ${settingsTheme.primary};
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    border-top: 1px solid ${settingsTheme.border};

    strong {
        font-weight: 700;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${settingsTheme.spacing.xxl};
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    gap: ${settingsTheme.spacing.md};
    min-height: 400px;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${settingsTheme.borderLight};
    border-top: 3px solid ${settingsTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.status.errorLight};
    color: ${settingsTheme.status.error};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.lg};
    border: 1px solid ${settingsTheme.status.error}30;
    font-weight: 500;
    box-shadow: ${settingsTheme.shadow.xs};
`;

const ErrorIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorText = styled.div`
    flex: 1;
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${settingsTheme.spacing.xxl};
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 2px dashed ${settingsTheme.border};
    text-align: center;
    min-height: 400px;
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${settingsTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${settingsTheme.text.tertiary};
    margin-bottom: ${settingsTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${settingsTheme.text.secondary};
    margin: 0 0 ${settingsTheme.spacing.sm} 0;
    line-height: 1.5;
`;

const EmptyStateAction = styled.p`
    font-size: 14px;
    color: ${settingsTheme.primary};
    margin: 0;
    font-weight: 500;
`;

const TableContainer = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    overflow: hidden;
    box-shadow: ${settingsTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${settingsTheme.spacing.lg};
    border-bottom: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surfaceAlt};
    flex-shrink: 0;
`;

const TableTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

const AddEmployeeButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 40px;
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${settingsTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
        box-shadow: ${settingsTheme.shadow.md};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const EmployeesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: ${settingsTheme.spacing.lg};
    padding: ${settingsTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${settingsTheme.spacing.md};
        padding: ${settingsTheme.spacing.md};
    }
`;

const EmployeeCard = styled.div`
    position: relative;
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    overflow: hidden;
    box-shadow: ${settingsTheme.shadow.sm};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${settingsTheme.shadow.lg};
        border-color: ${settingsTheme.primary};
    }
`;

const ColorBadge = styled.div<{ color: string }>`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color};
`;

const EmployeeHeader = styled.div`
    padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg} ${settingsTheme.spacing.md};
    border-bottom: 1px solid ${settingsTheme.borderLight};
`;

const EmployeeName = styled.h3`
    margin: 0 0 ${settingsTheme.spacing.xs} 0;
    font-size: 18px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 1.3;
`;

const DocumentsButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${settingsTheme.radius.sm};
    background: ${settingsTheme.primaryGhost};
    color: ${settingsTheme.primary};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;

    &:hover {
        background: ${settingsTheme.primary};
        color: white;
        transform: scale(1.05);
    }
`;

const EmployeePosition = styled.div`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const EmployeeDetails = styled.div`
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.sm};
`;

const EmployeeDetail = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    font-size: 14px;
`;

const DetailIcon = styled.div`
    width: 16px;
    color: ${settingsTheme.text.tertiary};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const DetailText = styled.div`
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
    line-height: 1.4;
`;

const EmployeeActions = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg};
    border-top: 1px solid ${settingsTheme.borderLight};
`;

const ActionButton = styled.button<{
    $variant: 'edit' | 'delete';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${settingsTheme.spacing.xs};
    flex: 1;
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border: none;
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    ${({ $variant }) => {
        switch ($variant) {
            case 'edit':
                return `
                    background: ${settingsTheme.status.warningLight};
                    color: ${settingsTheme.status.warning};
                    
                    &:hover {
                        background: ${settingsTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
            case 'delete':
                return `
                    background: ${settingsTheme.status.errorLight};
                    color: ${settingsTheme.status.error};
                    
                    &:hover {
                        background: ${settingsTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
        }
    }}
`;

export default EmployeesPage;