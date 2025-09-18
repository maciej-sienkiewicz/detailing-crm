// src/pages/Settings/EmployeesPage.tsx - Refactored with Real API
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import styled from 'styled-components';
import {
    FaCheckCircle,
    FaChevronDown,
    FaChevronUp,
    FaClock,
    FaEdit,
    FaExclamationTriangle,
    FaEye,
    FaFileDownload,
    FaFilter,
    FaMoneyBillWave,
    FaPhone,
    FaSearch,
    FaShieldAlt,
    FaSort,
    FaSortDown,
    FaSortUp,
    FaTimes,
    FaTimesCircle,
    FaTrash,
    FaUser,
    FaUserPlus,
    FaUserTie
} from 'react-icons/fa';
import {
    ContractType,
    EmployeeFilters,
    EmployeeHelpers,
    ExtendedEmployee,
    UserRole,
    UserRoleLabels
} from '../../types/employeeTypes';
import {useAuth} from '../../context/AuthContext';
import {useEmployees} from '../../hooks/useEmployees';
import {EmployeeFormModal} from './components/EmployeeFormModal';
import {DocumentTemplatesModal} from './components/DocumentTemplatesModal';
import {EmployeeDetailsModal} from './components/EmployeeDetailsModal';
import {PageHeader, SecondaryButton, PrimaryButton} from '../../components/common/PageHeader';
import {theme} from "../../styles/theme";

// Professional Brand Theme
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

export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

type SortField = 'fullName' | 'position' | 'email' | 'hireDate' | 'role' | 'hourlyRate' | 'isActive';
type SortDirection = 'asc' | 'desc' | null;

interface EmployeesPageRef {
    handleAddEmployee: () => void;
}

const EmployeesPage = forwardRef<EmployeesPageRef>((props, ref) => {
    const { user } = useAuth();

    // API Hook with optimized configuration
    const {
        employees,
        filteredEmployees,
        selectedEmployee,
        currentPage,
        totalPages,
        totalItems,
        pageSize,
        hasNext,
        hasPrevious,
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        isLoadingDocuments,
        error,
        validationErrors,
        documents,
        documentError,
        fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        selectEmployee,
        setFilters,
        clearFilters,
        setPage,
        setPageSize,
        nextPage,
        previousPage,
        fetchDocuments,
        uploadDocument,
        deleteDocument,
        refreshData,
        clearError,
        searchEmployees,
        sortEmployees
    } = useEmployees({
        initialPageSize: 20,
        autoFetch: true,
        enableCaching: true,
        refreshInterval: 5 * 60 * 1000
    });

    // Local state for UI
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sortField, setSortField] = useState<SortField>('fullName');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<ExtendedEmployee | null>(null);

    // Filters state
    const [filters, setFiltersState] = useState<EmployeeFilters>({});

    // Security checks
    const isAdmin = user?.role === UserRole.ADMIN;
    const canViewAllEmployees = true;
    const canEditEmployees= true;
    const canManageSalaries = true;
    const canManagePermissions = true;

    // Expose API to parent
    useImperativeHandle(ref, () => ({
        handleAddEmployee: handleAddEmployee
    }));

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery !== (filters.searchQuery || '')) {
                const newFilters = { ...filters, searchQuery: searchQuery || undefined };
                setFiltersState(newFilters);
                setFilters(newFilters);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, filters, setFilters]);

    // Handle sorting with API integration
    const handleSort = useCallback((field: SortField) => {
        let newDirection: SortDirection;

        if (sortField === field) {
            newDirection = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';
        } else {
            newDirection = 'asc';
        }

        setSortField(field);
        setSortDirection(newDirection);

        if (newDirection) {
            sortEmployees(field, newDirection);
        }
    }, [sortField, sortDirection, sortEmployees]);

    // Get sort icon
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort />;
        if (sortDirection === 'asc') return <FaSortUp />;
        if (sortDirection === 'desc') return <FaSortDown />;
        return <FaSort />;
    };

    // Handler functions with API integration
    const handleAddEmployee = useCallback(() => {
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
            role: UserRole.EMPLOYEE,
            hourlyRate: 25.00,
            bonusFromRevenue: 0,
            isActive: true,
            workingHoursPerWeek: 40,
            contractType: ContractType.EMPLOYMENT
        };

        setEditingEmployee(newEmployee);
        setShowModal(true);
    }, [canEditEmployees]);

    const handleViewEmployee = useCallback(async (employee: ExtendedEmployee) => {
        await selectEmployee(employee);
        setShowDetailsModal(true);
    }, [selectEmployee]);

    const handleEditEmployee = useCallback((employee: ExtendedEmployee) => {
        if (!canEditEmployees && employee.id !== String(user?.userId)) {
            alert('Nie masz uprawnień do edycji tego pracownika');
            return;
        }

        setEditingEmployee({ ...employee });
        setShowModal(true);
    }, [canEditEmployees, user?.userId]);

    const handleDeleteEmployee = useCallback(async (id: string) => {
        if (!canEditEmployees) {
            alert('Nie masz uprawnień do usuwania pracowników');
            return;
        }

        if (window.confirm('Czy na pewno chcesz usunąć tego pracownika?')) {
            const success = await deleteEmployee(id);
            if (!success && error) {
                alert(`Błąd podczas usuwania: ${error}`);
            }
        }
    }, [canEditEmployees, deleteEmployee, error]);

    const handleSaveEmployee = useCallback(async (employee: ExtendedEmployee) => {
        let result: ExtendedEmployee | null = null;

        if (employee.id) {
            result = await updateEmployee({
                ...employee
            });
        } else {
            result = await createEmployee({
                fullName: employee.fullName,
                birthDate: employee.birthDate,
                hireDate: employee.hireDate,
                position: employee.position,
                email: employee.email,
                phone: employee.phone,
                role: employee.role,
                hourlyRate: employee.hourlyRate,
                bonusFromRevenue: employee.bonusFromRevenue,
                isActive: employee.isActive,
                workingHoursPerWeek: employee.workingHoursPerWeek,
                contractType: employee.contractType,
                emergencyContact: employee.emergencyContact,
                notes: employee.notes
            });
        }

        if (result) {
            setShowModal(false);
            setEditingEmployee(null);
        } else if (error) {
            alert(`Błąd podczas zapisywania: ${error}`);
        }
    }, [updateEmployee, createEmployee, error]);

    // Filter handlers
    const handleFilterChange = useCallback((filterKey: keyof EmployeeFilters, value: any) => {
        const newFilters = { ...filters, [filterKey]: value || undefined };
        setFiltersState(newFilters);
        setFilters(newFilters);
    }, [filters, setFilters]);

    const clearAllFilters = useCallback(() => {
        setSearchQuery('');
        setFiltersState({});
        clearFilters();
    }, [clearFilters]);

    const hasActiveFilters = () => {
        return Object.values(filters).some(value => value !== undefined && value !== '');
    };

    // Get unique values for filters
    const uniquePositions = [...new Set(employees.map(emp => emp.position))];
    const uniqueRoles = Object.values(UserRole);
    const statusOptions = [
        { value: 'active', label: 'Aktywni' },
        { value: 'inactive', label: 'Nieaktywni' }
    ];

    // Error handling with retry
    const handleRetry = useCallback(() => {
        clearError();
        refreshData();
    }, [clearError, refreshData]);

    // Header configuration
    const teamSubtitle = `Zarządzaj pracownikami i ich uprawnieniami w systemie • ${filteredEmployees.length} ${filteredEmployees.length === 1 ? 'pracownik' : 'pracowników'}`;

    const headerActions = (
        <>
            <PrimaryButton
                onClick={handleAddEmployee}
                disabled={isLoading || isCreating}
            >
                {isCreating ? <LoadingSpinner size="small" /> : <FaUserPlus />}
                Dodaj pracownika
            </PrimaryButton>
        </>
    );

    return (
        <ContentContainer>
            <PageHeader
                icon={FaUser}
                title="Zespół"
                subtitle={teamSubtitle}
                actions={headerActions}
            />
            {/* Enhanced Search and Filters */}
            <FiltersContainer>
                <QuickSearchSection>
                    <SearchWrapper>
                        <SearchIcon>
                            <FaSearch />
                        </SearchIcon>
                        <SearchInput
                            type="text"
                            placeholder="Szukaj pracowników po nazwisku, stanowisku lub emailu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isLoading}
                        />
                        {searchQuery && (
                            <ClearSearchButton onClick={() => setSearchQuery('')}>
                                <FaTimes />
                            </ClearSearchButton>
                        )}
                    </SearchWrapper>

                    <FilterActions>
                        <AdvancedToggle
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            $expanded={showAdvancedFilters}
                            disabled={isLoading}
                        >
                            <FaFilter />
                            Filtry zaawansowane
                            {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                        </AdvancedToggle>
                    </FilterActions>
                </QuickSearchSection>

                {showAdvancedFilters && (
                    <AdvancedFiltersSection>
                        <FiltersGrid>
                            <FormGroup>
                                <Label>Stanowisko</Label>
                                <Select
                                    value={filters.position || ''}
                                    onChange={(e) => handleFilterChange('position', e.target.value)}
                                    disabled={isLoading}
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
                                        <Label>Rola w systemie</Label>
                                        <Select
                                            value={filters.role || ''}
                                            onChange={(e) => handleFilterChange('role', e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="">Wszystkie role</option>
                                            {uniqueRoles.map(role => (
                                                <option key={role} value={role}>{UserRoleLabels[role]}</option>
                                            ))}
                                        </Select>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Status konta</Label>
                                        <Select
                                            value={filters.isActive === undefined ? '' : (filters.isActive ? 'active' : 'inactive')}
                                            onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'active')}
                                            disabled={isLoading}
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

                        <FiltersActionsRow>
                            <ResultsInfo>
                                Wyświetlane: <strong>{filteredEmployees.length}</strong> z {totalItems} pracowników
                                {hasActiveFilters() && <FilterIndicator>• Aktywne filtry</FilterIndicator>}
                            </ResultsInfo>

                            {hasActiveFilters() && (
                                <ClearButton onClick={clearAllFilters} disabled={isLoading}>
                                    <FaTimes />
                                    Wyczyść filtry
                                </ClearButton>
                            )}
                        </FiltersActionsRow>
                    </AdvancedFiltersSection>
                )}
            </FiltersContainer>

            {/* Error Handling */}
            {error && (
                <ErrorContainer>
                    <ErrorIcon>
                        <FaExclamationTriangle />
                    </ErrorIcon>
                    <ErrorContent>
                        <ErrorText>{error}</ErrorText>
                        <RetryButton onClick={handleRetry}>
                            Spróbuj ponownie
                        </RetryButton>
                    </ErrorContent>
                </ErrorContainer>
            )}

            {/* Main Table Content */}
            {isLoading && employees.length === 0 ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie zespołu...</LoadingText>
                </LoadingContainer>
            ) : (
                <TableContainer>
                    <TableWrapper>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <SortableHeaderCell onClick={() => handleSort('fullName')}>
                                        <HeaderCellContent>
                                            Pracownik
                                            <SortIcon>{getSortIcon('fullName')}</SortIcon>
                                        </HeaderCellContent>
                                    </SortableHeaderCell>

                                    <SortableHeaderCell onClick={() => handleSort('position')}>
                                        <HeaderCellContent>
                                            Stanowisko
                                            <SortIcon>{getSortIcon('position')}</SortIcon>
                                        </HeaderCellContent>
                                    </SortableHeaderCell>

                                    <TableHeaderCell>Kontakt</TableHeaderCell>

                                    <SortableHeaderCell onClick={() => handleSort('hireDate')}>
                                        <HeaderCellContent>
                                            Zatrudnienie
                                            <SortIcon>{getSortIcon('hireDate')}</SortIcon>
                                        </HeaderCellContent>
                                    </SortableHeaderCell>

                                    {canViewAllEmployees && (
                                        <SortableHeaderCell onClick={() => handleSort('role')}>
                                            <HeaderCellContent>
                                                Rola
                                                <SortIcon>{getSortIcon('role')}</SortIcon>
                                            </HeaderCellContent>
                                        </SortableHeaderCell>
                                    )}

                                    {canManageSalaries && (
                                        <SortableHeaderCell onClick={() => handleSort('hourlyRate')}>
                                            <HeaderCellContent>
                                                Wynagrodzenie
                                                <SortIcon>{getSortIcon('hourlyRate')}</SortIcon>
                                            </HeaderCellContent>
                                        </SortableHeaderCell>
                                    )}

                                    <SortableHeaderCell onClick={() => handleSort('isActive')}>
                                        <HeaderCellContent>
                                            Status
                                            <SortIcon>{getSortIcon('isActive')}</SortIcon>
                                        </HeaderCellContent>
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
                                        $loading={isDeleting}
                                    >
                                        <TableCell>
                                            <EmployeeInfo>
                                                <EmployeeAvatar>
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
                                                <WorkInfo>
                                                    <FaClock />
                                                    {employee.workingHoursPerWeek || 40}h/tydzień
                                                </WorkInfo>
                                            </PositionInfo>
                                        </TableCell>

                                        <TableCell>
                                            <ContactInfo>
                                                <ContactItem>
                                                    <FaPhone />
                                                    <span>{employee.phone}</span>
                                                </ContactItem>
                                                <ContactItem>
                                                    <FaUserTie />
                                                    <span>{EmployeeHelpers.calculateAge(employee.birthDate)} lat</span>
                                                </ContactItem>
                                            </ContactInfo>
                                        </TableCell>

                                        <TableCell>
                                            <EmploymentInfo>
                                                <HireDate>{formatDate(employee.hireDate)}</HireDate>
                                                <Tenure>
                                                    <FaUserTie />
                                                    {EmployeeHelpers.formatTenure(employee.hireDate)}
                                                </Tenure>
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
                                                    <SalaryAmount>
                                                        <FaMoneyBillWave />
                                                        {employee.hourlyRate || 0} zł/h
                                                    </SalaryAmount>
                                                    {(employee.bonusFromRevenue || 0) > 0 && (
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
                                                    title="Szczegóły pracownika"
                                                    disabled={isLoading}
                                                >
                                                    <FaEye />
                                                </ActionIconButton>

                                                <ActionIconButton
                                                    onClick={() => handleEditEmployee(employee)}
                                                    title="Edytuj pracownika"
                                                    disabled={(!canEditEmployees && employee.id !== String(user?.userId)) || isUpdating}
                                                >
                                                    {isUpdating ? <LoadingSpinner size="small" /> : <FaEdit />}
                                                </ActionIconButton>

                                                {canEditEmployees && (
                                                    <ActionIconButton
                                                        onClick={() => handleDeleteEmployee(employee.id)}
                                                        title="Usuń pracownika"
                                                        $variant="danger"
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting ? <LoadingSpinner size="small" /> : <FaTrash />}
                                                    </ActionIconButton>
                                                )}
                                            </ActionsGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableWrapper>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <PaginationContainer>
                            <PaginationInfo>
                                Strona {currentPage + 1} z {totalPages} ({totalItems} pracowników)
                            </PaginationInfo>
                            <PaginationControls>
                                <PaginationButton
                                    onClick={previousPage}
                                    disabled={!hasPrevious || isLoading}
                                >
                                    Poprzednia
                                </PaginationButton>
                                <PaginationButton
                                    onClick={nextPage}
                                    disabled={!hasNext || isLoading}
                                >
                                    Następna
                                </PaginationButton>
                            </PaginationControls>
                        </PaginationContainer>
                    )}

                    {filteredEmployees.length === 0 && !isLoading && (
                        <EmptyStateContainer>
                            <EmptyStateIcon>
                                <FaUser />
                            </EmptyStateIcon>
                            <EmptyStateTitle>
                                {hasActiveFilters() ? 'Brak wyników wyszukiwania' : 'Brak pracowników'}
                            </EmptyStateTitle>
                            <EmptyStateDescription>
                                {hasActiveFilters()
                                    ? 'Nie znaleziono pracowników spełniających podane kryteria. Spróbuj zmienić filtry wyszukiwania.'
                                    : 'Nie masz jeszcze żadnych pracowników w systemie. Dodaj pierwszego pracownika, aby rozpocząć zarządzanie zespołem.'
                                }
                            </EmptyStateDescription>
                            {!hasActiveFilters() && (
                                <EmptyStateAction>
                                    <PrimaryButton onClick={handleAddEmployee}>
                                        <FaUserPlus />
                                        Dodaj pierwszego pracownika
                                    </PrimaryButton>
                                </EmptyStateAction>
                            )}
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
                    canManageRoles={canManagePermissions}
                    isLoading={isCreating || isUpdating}
                    validationErrors={validationErrors}
                />
            )}

            {showDetailsModal && selectedEmployee && (
                <EmployeeDetailsModal
                    employee={selectedEmployee}
                    onClose={() => {
                        setShowDetailsModal(false);
                        selectEmployee(null);
                    }}
                    onEdit={() => {
                        setShowDetailsModal(false);
                        handleEditEmployee(selectedEmployee);
                    }}
                    documents={documents}
                    isLoadingDocuments={isLoadingDocuments}
                    documentError={documentError}
                    onFetchDocuments={fetchDocuments}
                    onUploadDocument={uploadDocument}
                    onDeleteDocument={deleteDocument}
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

// Styled Components with loading states
const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const LoadingSpinner = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
    width: ${props => props.size === 'small' ? '16px' : props.size === 'large' ? '48px' : '24px'};
    height: ${props => props.size === 'small' ? '16px' : props.size === 'large' ? '48px' : '24px'};
    border: 2px solid ${brandTheme.borderLight};
    border-top: 2px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;


// Error handling components
const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.status.error}30;
    margin-bottom: ${brandTheme.spacing.md};
`;

const ErrorIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorContent = styled.div`
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const ErrorText = styled.div`
    font-weight: 500;
`;

const RetryButton = styled.button`
    background: ${brandTheme.status.error};
    color: white;
    border: none;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.error}dd;
        transform: translateY(-1px);
    }
`;

// Filters Section
const FiltersContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    margin:  ${brandTheme.spacing.lg};
`;

const QuickSearchSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SearchWrapper = styled.div`
    position: relative;
    flex: 1;
    max-width: 600px;

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

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        opacity: 0.6;
        cursor: not-allowed;
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

const FilterActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
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

    &:hover:not(:disabled) {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const AdvancedFiltersSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-top: 1px solid ${brandTheme.border};
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

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const FiltersActionsRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: ${brandTheme.spacing.md};
    border-top: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const ResultsInfo = styled.div`
    color: ${brandTheme.primary};
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    strong {
        font-weight: 700;
    }
`;

const FilterIndicator = styled.span`
    color: ${brandTheme.status.warning};
    font-weight: 600;
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

    &:hover:not(:disabled) {
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        background: ${brandTheme.status.errorLight};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

// Table Components
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

const TableRow = styled.tr<{ $clickable?: boolean; $loading?: boolean }>`
    border-bottom: 1px solid ${brandTheme.borderLight};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    ${({ $clickable }) => $clickable && `
        cursor: pointer;
        
        &:hover {
            background: ${brandTheme.surfaceHover};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
    `}

    ${({ $loading }) => $loading && `
        opacity: 0.6;
        pointer-events: none;
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

const HeaderCellContent = styled.div`
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

// Pagination
const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.md};
    }
`;

const PaginationInfo = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const PaginationControls = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
`;

const PaginationButton = styled.button`
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: 1px solid ${brandTheme.border};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// Employee specific components (existing ones updated with loading states)
const EmployeeInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 220px;
`;

const EmployeeAvatar = styled.div`
    width: 44px;
    height: 44px;
    background: ${brandTheme.primary};
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
    margin-bottom: 4px;
`;

const WorkInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;

    svg {
        font-size: 10px;
    }
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
        flex-shrink: 0;
    }

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const EmploymentInfo = styled.div`
    min-width: 140px;
`;

const HireDate = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    margin-bottom: 4px;
`;

const Tenure = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;

    svg {
        font-size: 10px;
    }
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
    min-width: 140px;
`;

const SalaryAmount = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    margin-bottom: 2px;

    svg {
        font-size: 12px;
        color: ${brandTheme.status.success};
    }
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
    min-width: 110px;
`;

const ActionIconButton = styled.button<{ $variant?: 'danger'; disabled?: boolean }>`
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
    min-height: 400px;
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 2px dashed ${brandTheme.border};
    margin: ${brandTheme.spacing.lg};
`;

const EmptyStateIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.xs};
`;

const EmptyStateTitle = styled.h3`
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0 0 ${brandTheme.spacing.lg} 0;
    line-height: 1.5;
    max-width: 500px;
`;

const EmptyStateAction = styled.div`
    margin-top: ${brandTheme.spacing.md};
`;

export default EmployeesPage;