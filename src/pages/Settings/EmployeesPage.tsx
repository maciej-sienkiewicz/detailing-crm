import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import {
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
    FaTimes,
    FaEye,
    FaShieldAlt,
    FaMoneyBillWave,
    FaFileDownload,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaEyeSlash,
    FaClock,
    FaUserTie,
    FaCircle,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';
import { Employee, EmployeeDocument } from '../../types';
import {
    ExtendedEmployee,
    UserRole,
    UserRoleLabels,
    ContractType,
    EmployeeHelpers
} from '../../types/employeeTypes';
import { useAuth } from '../../context/AuthContext';
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
import { SalaryModal } from './components/SalaryModal';
import { PermissionsModal } from './components/PermissionsModal';
import { DocumentTemplatesModal } from './components/DocumentTemplatesModal';
import { EmployeeDetailsModal } from './components/EmployeeDetailsModal';

// Professional Brand Theme - zgodny z resztą aplikacji
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
};

// Typy uprawnień użytkowników - export do użytku w innych komponentach
export { UserRole, UserRoleLabels, type ExtendedEmployee } from '../../types/employeeTypes';

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

// Funkcja pomocnicza do obliczania stażu pracy
const calculateWorkExperience = (hireDate: string): string => {
    return EmployeeHelpers.formatTenure(hireDate);
};

type SortField = 'fullName' | 'position' | 'email' | 'hireDate' | 'role' | 'hourlyRate' | 'isActive';
type SortDirection = 'asc' | 'desc' | null;

const EmployeesPage = forwardRef<{ handleAddEmployee: () => void }>((props, ref) => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<ExtendedEmployee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<ExtendedEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Sorting state
    const [sortField, setSortField] = useState<SortField>('fullName');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Modals state
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDocumentsDrawer, setShowDocumentsDrawer] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);

    const [editingEmployee, setEditingEmployee] = useState<ExtendedEmployee | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<ExtendedEmployee | null>(null);

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [positionFilter, setPositionFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Documents state
    const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [documentError, setDocumentError] = useState<string | null>(null);

    // Security check - MOCK: Always admin for demo
    const isAdmin = true;
    const canViewAllEmployees = true;
    const canEditEmployees = true;
    const canManageSalaries = true;
    const canManagePermissions = true;

    // Expose handleAddEmployee method to parent component
    useImperativeHandle(ref, () => ({
        handleAddEmployee: handleAddEmployee
    }));

    // Pobieranie listy pracowników
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let data = await fetchEmployees();

                if (!canViewAllEmployees && user) {
                    data = data.filter(employee => employee.id === user.userId);
                }

                const extendedData = data as ExtendedEmployee[];
                setEmployees(extendedData);
                setError(null);
            } catch (err) {
                setError('Nie udało się pobrać listy pracowników');
                console.error('Error fetching employees data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [canViewAllEmployees, user]);

    // Sorting function
    const sortEmployees = (employees: ExtendedEmployee[]): ExtendedEmployee[] => {
        if (!sortDirection || !sortField) return employees;

        return [...employees].sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            // Handle date sorting
            if (sortField === 'hireDate') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            // Handle string sorting
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Handle sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev =>
                prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
            );
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Get sort icon
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort />;
        if (sortDirection === 'asc') return <FaSortUp />;
        if (sortDirection === 'desc') return <FaSortDown />;
        return <FaSort />;
    };

    // Filtrowanie i sortowanie pracowników
    useEffect(() => {
        let result = [...employees];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(employee =>
                employee.fullName.toLowerCase().includes(query) ||
                employee.email.toLowerCase().includes(query) ||
                employee.phone.includes(query) ||
                employee.position.toLowerCase().includes(query)
            );
        }

        // Apply filters
        if (positionFilter.trim()) {
            const posQuery = positionFilter.toLowerCase().trim();
            result = result.filter(employee =>
                employee.position.toLowerCase().includes(posQuery)
            );
        }

        if (roleFilter) {
            result = result.filter(employee => employee.role === roleFilter);
        }

        if (statusFilter) {
            const isActive = statusFilter === 'active';
            result = result.filter(employee => employee.isActive === isActive);
        }

        // Apply sorting
        result = sortEmployees(result);

        setFilteredEmployees(result);
    }, [employees, searchQuery, positionFilter, roleFilter, statusFilter, sortField, sortDirection]);

    // Handler functions
    const handleAddEmployee = () => {
        if (!canEditEmployees) {
            alert('Nie masz uprawnień do dodawania pracowników');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const newEmployee: ExtendedEmployee = {
            id: '',
            fullName: '',
            birthDate: '',
            hireDate: today,
            position: '',
            email: '',
            phone: '',
            color: '#1a365d',
            role: UserRole.EMPLOYEE,
            hourlyRate: 25.00,
            bonusFromRevenue: 0,
            isActive: true,
            workingHoursPerWeek: 40,
            contractType: ContractType.EMPLOYMENT
        };

        setEditingEmployee(newEmployee);
        setShowModal(true);
    };

    const handleViewEmployee = (employee: ExtendedEmployee) => {
        setSelectedEmployee(employee);
        setShowDetailsModal(true);
    };

    const handleEditEmployee = (employee: ExtendedEmployee) => {
        if (!canEditEmployees && employee.id !== user?.userId) {
            alert('Nie masz uprawnień do edycji tego pracownika');
            return;
        }

        setEditingEmployee({...employee});
        setShowModal(true);
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!canEditEmployees) {
            alert('Nie masz uprawnień do usuwania pracowników');
            return;
        }

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

    const handleSaveEmployee = async (employee: ExtendedEmployee) => {
        try {
            let savedEmployee: ExtendedEmployee;

            if (employee.id) {
                const { role, hourlyRate, bonusFromRevenue, isActive, ...basicEmployee } = employee;
                const updated = await updateEmployee(basicEmployee);
                savedEmployee = { ...updated, role, hourlyRate, bonusFromRevenue, isActive } as ExtendedEmployee;
                setEmployees(employees.map(emp => emp.id === savedEmployee.id ? savedEmployee : emp));
            } else {
                const { id, role, hourlyRate, bonusFromRevenue, isActive, ...employeeWithoutId } = employee;
                const created = await addEmployee(employeeWithoutId);
                savedEmployee = { ...created, role, hourlyRate, bonusFromRevenue, isActive } as ExtendedEmployee;
                setEmployees([...employees, savedEmployee]);
            }

            setShowModal(false);
            setEditingEmployee(null);
        } catch (err) {
            setError('Nie udało się zapisać pracownika');
        }
    };

    // Clear filters
    const clearAllFilters = () => {
        setSearchQuery('');
        setPositionFilter('');
        setRoleFilter('');
        setStatusFilter('');
    };

    const hasActiveFilters = () => {
        return searchQuery.trim() !== '' || positionFilter.trim() !== '' || roleFilter !== '' || statusFilter !== '';
    };

    // Get unique values for filters
    const uniquePositions = [...new Set(employees.map(emp => emp.position))];
    const uniqueRoles = Object.values(UserRole);
    const statusOptions = [
        { value: 'active', label: 'Aktywni' },
        { value: 'inactive', label: 'Nieaktywni' }
    ];

    return (
        <ContentContainer>
            {/* Header Actions */}
            <HeaderActions>
                <ActionButton
                    onClick={() => setShowTemplatesModal(true)}
                    $variant="secondary"
                >
                    <FaFileDownload />
                    Szablony dokumentów
                </ActionButton>
            </HeaderActions>

            {/* Filters */}
            <FiltersContainer>
                <QuickSearchSection>
                    <SearchWrapper>
                        <SearchIcon>
                            <FaSearch />
                        </SearchIcon>
                        <SearchInput
                            type="text"
                            placeholder="Szybkie wyszukiwanie pracowników..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <ClearSearchButton onClick={() => setSearchQuery('')}>
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

                            {canViewAllEmployees && (
                                <>
                                    <FormGroup>
                                        <Label>Rola</Label>
                                        <Select
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                        >
                                            <option value="">Wszystkie role</option>
                                            {uniqueRoles.map(role => (
                                                <option key={role} value={role}>{UserRoleLabels[role]}</option>
                                            ))}
                                        </Select>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Status</Label>
                                        <Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="">Wszystkie statusy</option>
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </Select>
                                    </FormGroup>
                                </>
                            )}
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
                    Znaleziono: <strong>{filteredEmployees.length}</strong> z {employees.length} pracowników
                </ResultsCounter>
            </FiltersContainer>

            {/* Main Table */}
            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie zespołu...</LoadingText>
                </LoadingContainer>
            ) : error ? (
                <ErrorMessage>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                </ErrorMessage>
            ) : (
                <TableContainer>
                    <TableWrapper>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <SortableHeaderCell onClick={() => handleSort('fullName')}>
                                        <HeaderContent>
                                            Pracownik
                                            <SortIcon>{getSortIcon('fullName')}</SortIcon>
                                        </HeaderContent>
                                    </SortableHeaderCell>

                                    <SortableHeaderCell onClick={() => handleSort('position')}>
                                        <HeaderContent>
                                            Stanowisko
                                            <SortIcon>{getSortIcon('position')}</SortIcon>
                                        </HeaderContent>
                                    </SortableHeaderCell>

                                    <TableHeaderCell>Kontakt</TableHeaderCell>

                                    <SortableHeaderCell onClick={() => handleSort('hireDate')}>
                                        <HeaderContent>
                                            Zatrudnienie
                                            <SortIcon>{getSortIcon('hireDate')}</SortIcon>
                                        </HeaderContent>
                                    </SortableHeaderCell>

                                    {canViewAllEmployees && (
                                        <SortableHeaderCell onClick={() => handleSort('role')}>
                                            <HeaderContent>
                                                Rola
                                                <SortIcon>{getSortIcon('role')}</SortIcon>
                                            </HeaderContent>
                                        </SortableHeaderCell>
                                    )}

                                    {canManageSalaries && (
                                        <SortableHeaderCell onClick={() => handleSort('hourlyRate')}>
                                            <HeaderContent>
                                                Stawka
                                                <SortIcon>{getSortIcon('hourlyRate')}</SortIcon>
                                            </HeaderContent>
                                        </SortableHeaderCell>
                                    )}

                                    <SortableHeaderCell onClick={() => handleSort('isActive')}>
                                        <HeaderContent>
                                            Status
                                            <SortIcon>{getSortIcon('isActive')}</SortIcon>
                                        </HeaderContent>
                                    </SortableHeaderCell>

                                    <TableHeaderCell>Akcje</TableHeaderCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredEmployees.map(employee => (
                                    <TableRow
                                        key={employee.id}
                                        onClick={() => handleViewEmployee(employee)}
                                        $clickable
                                    >
                                        <TableCell>
                                            <EmployeeInfo>
                                                <EmployeeAvatar $color={employee.color}>
                                                    {EmployeeHelpers.getInitials(employee.fullName)}
                                                </EmployeeAvatar>
                                                <EmployeeDetails>
                                                    <EmployeeName>{employee.fullName}</EmployeeName>
                                                    <EmployeeEmail>{employee.email}</EmployeeEmail>
                                                </EmployeeDetails>
                                            </EmployeeInfo>
                                        </TableCell>

                                        <TableCell>
                                            <PositionInfo>
                                                <PositionTitle>{employee.position}</PositionTitle>
                                                <WorkHours>
                                                    {employee.workingHoursPerWeek || 40}h/tydzień
                                                </WorkHours>
                                            </PositionInfo>
                                        </TableCell>

                                        <TableCell>
                                            <ContactInfo>
                                                <ContactItem>
                                                    <FaPhone />
                                                    {employee.phone}
                                                </ContactItem>
                                                <ContactItem>
                                                    <FaCalendarAlt />
                                                    {EmployeeHelpers.calculateAge(employee.birthDate)} lat
                                                </ContactItem>
                                            </ContactInfo>
                                        </TableCell>

                                        <TableCell>
                                            <EmploymentInfo>
                                                <HireDate>{formatDate(employee.hireDate)}</HireDate>
                                                <Tenure>{calculateWorkExperience(employee.hireDate)}</Tenure>
                                            </EmploymentInfo>
                                        </TableCell>

                                        {canViewAllEmployees && (
                                            <TableCell>
                                                <RoleBadge $role={employee.role}>
                                                    <FaShieldAlt />
                                                    {UserRoleLabels[employee.role]}
                                                </RoleBadge>
                                            </TableCell>
                                        )}

                                        {canManageSalaries && (
                                            <TableCell>
                                                <SalaryInfo>
                                                    <SalaryAmount>{employee.hourlyRate || 0} zł/h</SalaryAmount>
                                                    {employee.bonusFromRevenue > 0 && (
                                                        <BonusInfo>+{employee.bonusFromRevenue}% bonus</BonusInfo>
                                                    )}
                                                </SalaryInfo>
                                            </TableCell>
                                        )}

                                        <TableCell>
                                            <StatusBadge $isActive={employee.isActive}>
                                                {employee.isActive ? (
                                                    <>
                                                        <FaCheckCircle />
                                                        Aktywny
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaTimesCircle />
                                                        Nieaktywny
                                                    </>
                                                )}
                                            </StatusBadge>
                                        </TableCell>

                                        <TableCell>
                                            <ActionsGroup onClick={(e) => e.stopPropagation()}>
                                                <ActionIconButton
                                                    onClick={() => handleViewEmployee(employee)}
                                                    title="Szczegóły"
                                                >
                                                    <FaEye />
                                                </ActionIconButton>

                                                <ActionIconButton
                                                    onClick={() => handleEditEmployee(employee)}
                                                    title="Edytuj"
                                                    disabled={!canEditEmployees && employee.id !== user?.userId}
                                                >
                                                    <FaEdit />
                                                </ActionIconButton>

                                                <ActionIconButton
                                                    onClick={async () => {
                                                        setSelectedEmployee(employee);
                                                        setShowDocumentsDrawer(true);
                                                        try {
                                                            setLoadingDocuments(true);
                                                            const documents = await fetchEmployeeDocuments(employee.id);
                                                            setEmployeeDocuments(documents);
                                                        } catch (err) {
                                                            setDocumentError('Nie udało się pobrać dokumentów');
                                                        } finally {
                                                            setLoadingDocuments(false);
                                                        }
                                                    }}
                                                    title="Dokumenty"
                                                >
                                                    <FaFileAlt />
                                                </ActionIconButton>

                                                {canEditEmployees && (
                                                    <ActionIconButton
                                                        onClick={() => handleDeleteEmployee(employee.id)}
                                                        title="Usuń"
                                                        $variant="danger"
                                                    >
                                                        <FaTrash />
                                                    </ActionIconButton>
                                                )}
                                            </ActionsGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableWrapper>

                    {filteredEmployees.length === 0 && (
                        <EmptyStateContainer>
                            <EmptyStateIcon>
                                <FaUser />
                            </EmptyStateIcon>
                            <EmptyStateTitle>
                                {hasActiveFilters() ? 'Brak wyników' : 'Brak pracowników'}
                            </EmptyStateTitle>
                            <EmptyStateDescription>
                                {hasActiveFilters()
                                    ? 'Nie znaleziono pracowników spełniających kryteria wyszukiwania'
                                    : 'Nie masz jeszcze żadnych pracowników w systemie'
                                }
                            </EmptyStateDescription>
                        </EmptyStateContainer>
                    )}
                </TableContainer>
            )}

            {/* All Modals */}
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

            {showDetailsModal && selectedEmployee && (
                <EmployeeDetailsModal
                    employee={selectedEmployee}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedEmployee(null);
                    }}
                    onEdit={() => {
                        setShowDetailsModal(false);
                        handleEditEmployee(selectedEmployee);
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
                    onClose={() => {
                        setShowDocumentsDrawer(false);
                        setSelectedEmployee(null);
                        setEmployeeDocuments([]);
                    }}
                    onAddDocument={() => setShowDocumentModal(true)}
                    onDeleteDocument={async (documentId: string) => {
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
                    }}
                />
            )}

            {showDocumentModal && selectedEmployee && (
                <DocumentFormModal
                    employeeId={selectedEmployee.id}
                    onSave={async (document: Omit<EmployeeDocument, 'id'>) => {
                        try {
                            const savedDocument = await addEmployeeDocument(document);
                            setEmployeeDocuments([...employeeDocuments, savedDocument]);
                            setShowDocumentModal(false);
                        } catch (err) {
                            setDocumentError('Nie udało się zapisać dokumentu');
                        }
                    }}
                    onCancel={() => setShowDocumentModal(false)}
                />
            )}

            {showSalaryModal && selectedEmployee && (
                <SalaryModal
                    employee={selectedEmployee}
                    onSave={(updatedEmployee: ExtendedEmployee) => {
                        setEmployees(employees.map(emp =>
                            emp.id === updatedEmployee.id ? updatedEmployee : emp
                        ));
                        setShowSalaryModal(false);
                        setSelectedEmployee(null);
                    }}
                    onCancel={() => {
                        setShowSalaryModal(false);
                        setSelectedEmployee(null);
                    }}
                />
            )}

            {showPermissionsModal && selectedEmployee && (
                <PermissionsModal
                    employee={selectedEmployee}
                    onSave={(updatedEmployee: ExtendedEmployee) => {
                        setEmployees(employees.map(emp =>
                            emp.id === updatedEmployee.id ? updatedEmployee : emp
                        ));
                        setShowPermissionsModal(false);
                        setSelectedEmployee(null);
                    }}
                    onCancel={() => {
                        setShowPermissionsModal(false);
                        setSelectedEmployee(null);
                    }}
                />
            )}

            {showTemplatesModal && (
                <DocumentTemplatesModal
                    onClose={() => setShowTemplatesModal(false)}
                />
            )}
        </ContentContainer>
    );
});

// Styled Components - Modern Professional Design
const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${brandTheme.spacing.xl} ${brandTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${brandTheme.spacing.lg} ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md} ${brandTheme.spacing.md};
        gap: ${brandTheme.spacing.md};
    }
`;

const HeaderActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};

    @media (max-width: 768px) {
        justify-content: stretch;
        
        > * {
            flex: 1;
        }
    }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;

    ${({ $variant }) => {
    switch ($variant) {
        case 'primary':
            return `
                    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
                    color: white;
                    box-shadow: ${brandTheme.shadow.sm};

                    &:hover {
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
        case 'secondary':
            return `
                    background: ${brandTheme.surface};
                    color: ${brandTheme.text.secondary};
                    border-color: ${brandTheme.border};
                    box-shadow: ${brandTheme.shadow.xs};

                    &:hover {
                        background: ${brandTheme.surfaceHover};
                        color: ${brandTheme.text.primary};
                        border-color: ${brandTheme.borderHover};
                        box-shadow: ${brandTheme.shadow.sm};
                    }
                `;
    }
}}

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const FiltersContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
`;

const QuickSearchSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    border-bottom: 1px solid ${brandTheme.border};

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
    color: ${brandTheme.text.muted};
    font-size: 16px;
    z-index: 2;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 48px 0 48px;
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    font-size: 16px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
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
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.muted};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error};
        color: white;
    }
`;

const AdvancedToggle = styled.button<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 2px solid ${props => props.$expanded ? brandTheme.primary : brandTheme.border};
    background: ${props => props.$expanded ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$expanded ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }
`;

const AdvancedFiltersSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const Select = styled.select`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};
    padding-top: ${brandTheme.spacing.md};
    border-top: 1px solid ${brandTheme.border};
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        background: ${brandTheme.status.errorLight};
    }
`;

const ResultsCounter = styled.div`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    border-top: 1px solid ${brandTheme.border};

    strong {
        font-weight: 700;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.md};
    min-height: 400px;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.status.error}30;
    font-weight: 500;
    box-shadow: ${brandTheme.shadow.xs};
`;

const ErrorIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorText = styled.div`
    flex: 1;
`;

const TableContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const TableWrapper = styled.div`
    flex: 1;
    overflow: auto;
    min-height: 0;

    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }

    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${brandTheme.borderHover};
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 1200px;
`;

const TableHead = styled.thead`
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const TableRow = styled.tr<{ $clickable?: boolean }>`
    border-bottom: 1px solid ${brandTheme.borderLight};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    ${({ $clickable }) => $clickable && `
        cursor: pointer;
        
        &:hover {
            background: ${brandTheme.surfaceHover};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
    `}

    &:last-child {
        border-bottom: none;
    }
`;

const TableHeaderCell = styled.th`
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.md};
    text-align: left;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    white-space: nowrap;
    background: ${brandTheme.surfaceAlt};
`;

const SortableHeaderCell = styled(TableHeaderCell)`
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
`;

const SortIcon = styled.span`
    opacity: 0.6;
    font-size: 12px;
    transition: opacity 0.2s ease;

    ${SortableHeaderCell}:hover & {
        opacity: 1;
    }
`;

const TableBody = styled.tbody`
    background: ${brandTheme.surface};
`;

const TableCell = styled.td`
    padding: ${brandTheme.spacing.md};
    vertical-align: middle;
    border-right: 1px solid ${brandTheme.borderLight};

    &:last-child {
        border-right: none;
    }
`;

const EmployeeInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 220px;
`;

const EmployeeAvatar = styled.div<{ $color: string }>`
    width: 44px;
    height: 44px;
    background: ${props => props.$color};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    flex-shrink: 0;
    box-shadow: ${brandTheme.shadow.sm};
`;

const EmployeeDetails = styled.div`
    flex: 1;
    min-width: 0;
`;

const EmployeeName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 15px;
    margin-bottom: 2px;
    line-height: 1.3;
`;

const EmployeeEmail = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
`;

const PositionInfo = styled.div`
    min-width: 180px;
`;

const PositionTitle = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    margin-bottom: 2px;
`;

const WorkHours = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
`;

const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 160px;
`;

const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;

    svg {
        font-size: 11px;
        color: ${brandTheme.text.muted};
        width: 12px;
    }
`;

const EmploymentInfo = styled.div`
    min-width: 140px;
`;

const HireDate = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    margin-bottom: 2px;
`;

const Tenure = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
`;

const RoleBadge = styled.div<{ $role: UserRole }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    min-width: 100px;

    ${({ $role }) => {
        switch ($role) {
            case UserRole.ADMIN:
                return `
                    background: ${brandTheme.status.errorLight};
                    color: ${brandTheme.status.error};
                `;
            case UserRole.MANAGER:
                return `
                    background: ${brandTheme.status.warningLight};
                    color: ${brandTheme.status.warning};
                `;
            case UserRole.EMPLOYEE:
                return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                `;
        }
    }}
`;

const SalaryInfo = styled.div`
    min-width: 120px;
`;

const SalaryAmount = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    margin-bottom: 2px;
`;

const BonusInfo = styled.div`
    font-size: 11px;
    color: ${brandTheme.status.success};
    font-weight: 600;
`;

const StatusBadge = styled.div<{ $isActive: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    min-width: 90px;

    ${({ $isActive }) => $isActive ? `
        background: ${brandTheme.status.successLight};
        color: ${brandTheme.status.success};
    ` : `
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
    `}
`;

const ActionsGroup = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
    min-width: 140px;
`;

const ActionIconButton = styled.button<{ $variant?: 'danger' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 13px;
    position: relative;
    overflow: hidden;

    ${({ $variant }) => {
        if ($variant === 'danger') {
            return `
                background: ${brandTheme.status.errorLight};
                color: ${brandTheme.status.error};
                
                &:hover:not(:disabled) {
                    background: ${brandTheme.status.error};
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: ${brandTheme.shadow.md};
                }
            `;
        } else {
            return `
                background: ${brandTheme.primaryGhost};
                color: ${brandTheme.primary};
                
                &:hover:not(:disabled) {
                    background: ${brandTheme.primary};
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: ${brandTheme.shadow.md};
                }
            `;
        }
    }}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    text-align: center;
    min-height: 300px;
    background: ${brandTheme.surfaceAlt};
    margin: ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surface};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.xs};
`;

const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0;
    line-height: 1.5;
`;

export default EmployeesPage;