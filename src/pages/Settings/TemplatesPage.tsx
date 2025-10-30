// src/pages/Settings/TemplatesPage.tsx - Zaktualizowany z modalem potwierdzenia i ujednoliceniem stylów
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaFileAlt, FaInfoCircle, FaPlus, FaSpinner, FaTimes, FaFilter } from 'react-icons/fa';
import { useTemplates } from '../../hooks/useTemplates';
import { DataTable, TableColumn, HeaderAction } from '../../components/common/DataTable';
import { Template, TemplateFilters } from '../../types/template';
import { TemplateUploadModal } from '../../components/Templates/TemplateUploadModal';
import { TemplateInstructionsModal } from '../../components/Templates/TemplateInstructionsModal';
import { TemplateActionsCell } from '../../components/Templates/TemplateActionsCell';
import { TemplateStatusCell } from '../../components/Templates/TemplateStatusCell';
import { TemplateTypeCell } from '../../components/Templates/TemplateTypeCell';
import { TemplateSizeCell } from '../../components/Templates/TemplateSizeCell';
import { TemplateDateCell } from '../../components/Templates/TemplateDateCell';
import { settingsTheme } from './styles/theme';
import {ConfirmationDialog} from "../../components/common/NewConfirmationDialog";

interface TemplatesPageRef {
    handleAddTemplate: () => void;
}

const TemplatesPage = forwardRef<TemplatesPageRef>((props, ref) => {
    const {
        templates,
        templateTypes,
        filters,
        setFilters,
        stats,
        isLoading,
        isUploading,
        isUpdating,
        isDeleting,
        isDownloading,
        isPreviewing,
        error,
        setError,
        uploadTemplate,
        updateTemplate,
        deleteTemplate,
        downloadTemplate,
        previewTemplate,
        handleSort,
        confirmationState,
        hideConfirmation
    } = useTemplates();

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useImperativeHandle(ref, () => ({
        handleAddTemplate: () => setShowUploadModal(true)
    }));

    const handleUploadTemplate = async (uploadData: any) => {
        await uploadTemplate(uploadData);
        setShowUploadModal(false);
    };

    const handleDeleteTemplate = async (templateId: string, templateName: string) => {
        await deleteTemplate(templateId, templateName);
    };

    const handleItemAction = (action: string, item: Template, e: React.MouseEvent) => {
        if (action && ['name', 'type', 'isActive', 'size', 'updatedAt', 'createdAt'].includes(action)) {
            handleSort(action as any);
        }
    };

    const columns: TableColumn[] = [
        { id: 'name', label: 'Nazwa szablonu', width: '35%', sortable: true },
        { id: 'type', label: 'Typ dokumentu', width: '20%', sortable: true },
        { id: 'isActive', label: 'Status', width: '10%', sortable: true },
        { id: 'updatedAt', label: 'Ostatnia modyfikacja', width: '20%', sortable: true },
        { id: 'actions', label: 'Akcje', width: '15%', sortable: false },
    ];
    // SUMA: 35 + 20 + 10 + 20 + 15 = 100%

    const renderCell = (template: Template, columnId: string): React.ReactNode => {
        switch (columnId) {
            case 'name':
                return (
                    <TemplateNameCell>
                        <TemplateName title={template.name}>{template.name}</TemplateName>
                    </TemplateNameCell>
                );
            case 'type':
                return (
                    <TypeCell>
                        <TemplateTypeCell template={template} />
                    </TypeCell>
                );
            case 'isActive':
                return (
                    <StatusCell>
                        <TemplateStatusCell template={template} />
                    </StatusCell>
                );
            case 'size':
                return (
                    <DataCell>
                        <TemplateSizeCell template={template} />
                    </DataCell>
                );
            case 'updatedAt':
                return (
                    <DataCell>
                        <TemplateDateCell template={template} />
                    </DataCell>
                );
            case 'actions':
                return (
                    <ActionMenuContainer>
                        <TemplateActionsCell
                            template={template}
                            isUpdating={isUpdating === template.id}
                            isDeleting={isDeleting === template.id}
                            isDownloading={isDownloading === template.id}
                            isPreviewing={isPreviewing === template.id}
                            onUpdate={updateTemplate}
                            onDelete={handleDeleteTemplate}
                            onDownload={downloadTemplate}
                            onPreview={previewTemplate}
                        />
                    </ActionMenuContainer>
                );
            default:
                const value = template[columnId as keyof Template];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                return <DataCell>{String(value)}</DataCell>;
        }
    };

    const emptyStateConfig = {
        icon: FaFileAlt,
        title: 'Brak szablonów',
        description: 'Dodaj pierwszy szablon dokumentu, aby rozpocząć automatyczne generowanie profesjonalnych dokumentów.',
        actionText: 'Kliknij przycisk "Dodaj szablon" powyżej'
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some(value => value && value.toString().trim() !== '' && value !== null && value !== undefined);
    };

    const clearAllFilters = () => {
        setFilters({
            searchQuery: '',
            selectedType: undefined,
            selectedStatus: null,
            sortField: filters.sortField, // Zachowaj sortowanie, jeśli nie ma osobnej opcji resetowania
            sortDirection: filters.sortDirection
        });
    };

    const headerActions: HeaderAction[] = [
        {
            id: 'instructions',
            label: 'Instrukcje',
            icon: FaInfoCircle,
            onClick: () => setShowInstructionsModal(true),
            variant: 'secondary'
        },
        {
            id: 'filters',
            label: 'Filtry',
            icon: FaFilter,
            onClick: () => setShowFilters(!showFilters),
            variant: 'filter',
            active: showFilters,
            badge: hasActiveFilters()
        },
        {
            id: 'add',
            label: 'Dodaj szablon',
            icon: FaPlus,
            onClick: () => setShowUploadModal(true),
            variant: 'primary'
        }
    ];

    const filtersComponent = (
        <EnhancedTemplateFilters
            filters={filters}
            templateTypes={templateTypes}
            showFilters={showFilters}
            hasActiveFilters={hasActiveFilters()} // POPRAWKA: Przekazanie wyniku (boolean)
            onFiltersChange={setFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onClearFilters={clearAllFilters}
            resultCount={templates.length}
        />
    );

    return (
        <ContentContainer> {/* Zmieniono z PageContainer na ContentContainer */}
            {/* Error Message */}
            {error && (
                <ErrorMessage> {/* Zmieniono z ErrorContainer na ErrorMessage */}
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                    <CloseErrorButton onClick={() => setError(null)}>
                        <FaTimes />
                    </CloseErrorButton>
                </ErrorMessage>
            )}

            {/* Main Content with DataTable */}
            <DataArea> {/* Zmieniono z ContentArea na DataArea */}
                {isLoading ? (
                    <LoadingContainer>
                        <LoadingSpinner /> {/* Użycie komponentu LoadingSpinner z ServicesPage */}
                        <LoadingText>Ładowanie szablonów...</LoadingText>
                    </LoadingContainer>
                ) : (
                    <DataTable
                        data={templates}
                        columns={columns}
                        title="Szablony dokumentów"
                        emptyStateConfig={emptyStateConfig}
                        enableDragAndDrop={true}
                        renderCell={renderCell}
                        onItemAction={handleItemAction}
                        storageKeys={{
                            viewMode: 'templates_view_mode',
                            columnOrder: 'templates_column_order'
                        }}
                        headerActions={headerActions}
                        expandableContent={filtersComponent}
                        expandableVisible={showFilters}
                    />
                )}
            </DataArea>

            {/* Modals - Pozostają bez zmian w logice */}
            {showUploadModal && (
                <TemplateUploadModal
                    templateTypes={templateTypes}
                    onUpload={handleUploadTemplate}
                    onCancel={() => setShowUploadModal(false)}
                    isLoading={isUploading}
                />
            )}

            {showInstructionsModal && (
                <TemplateInstructionsModal
                    onClose={() => setShowInstructionsModal(false)}
                />
            )}

            {/* Modal potwierdzenia usuwania */}
            <ConfirmationDialog
                isOpen={confirmationState.isOpen}
                title={confirmationState.title}
                message={confirmationState.message}
                confirmText={confirmationState.confirmText}
                cancelText={confirmationState.cancelText}
                onConfirm={confirmationState.onConfirm}
                onCancel={hideConfirmation}
            />
        </ContentContainer>
    );
});

// Komponent Enhanced Template Filters
interface EnhancedTemplateFiltersProps {
    filters: TemplateFilters;
    templateTypes: any[];
    showFilters: boolean;
    hasActiveFilters: boolean; // POPRAWKA: Zmieniono typ na boolean
    onFiltersChange: (filters: TemplateFilters) => void;
    onToggleFilters: () => void;
    onClearFilters: () => void;
    resultCount: number;
}

const EnhancedTemplateFilters: React.FC<EnhancedTemplateFiltersProps> = ({
                                                                             filters,
                                                                             templateTypes,
                                                                             hasActiveFilters, // Teraz jest boolean
                                                                             onFiltersChange,
                                                                             onClearFilters,
                                                                             resultCount
                                                                         }) => {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({
            ...filters,
            searchQuery: e.target.value
        });
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFiltersChange({
            ...filters,
            selectedType: e.target.value || undefined
        });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onFiltersChange({
            ...filters,
            selectedStatus: value === '' ? null : value === 'true'
        });
    };

    return (
        <FiltersContainer>
            <FiltersContent>
                <AdvancedFiltersSection> {/* Nowa sekcja w stylu ServicesPage */}
                    <FiltersGrid $singleRow={!hasActiveFilters}> {/* POPRAWKA: Użycie hasActiveFilters jako boolean */}

                        <FormGroup $fullWidth={!hasActiveFilters}> {/* POPRAWKA: Użycie hasActiveFilters jako boolean */}
                            <Label htmlFor="searchQuery">Wyszukiwanie</Label>
                            <Input
                                id="searchQuery"
                                type="text"
                                placeholder="Szukaj po nazwie lub nazwie pliku..."
                                value={filters.searchQuery}
                                onChange={handleSearchChange}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="typeFilter">Typ dokumentu</Label>
                            <Select id="typeFilter" value={filters.selectedType || ''} onChange={handleTypeChange}>
                                <option value="">Wszystkie typy</option>
                                {templateTypes.map(type => (
                                    <option key={type.type} value={type.type}>
                                        {type.displayName}
                                    </option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="statusFilter">Status aktywności</Label>
                            <Select id="statusFilter" value={filters.selectedStatus === null ? '' : filters.selectedStatus?.toString()} onChange={handleStatusChange}>
                                <option value="">Wszystkie statusy</option>
                                <option value="true">Aktywne</option>
                                <option value="false">Nieaktywne</option>
                            </Select>
                        </FormGroup>

                    </FiltersGrid>

                    {hasActiveFilters && (
                        <FiltersActions> {/* Sekcja akcji filtrów widoczna tylko z aktywnymi filtrami */}
                            <ClearButton onClick={onClearFilters}>
                                <FaTimes />
                                Wyczyść filtry
                            </ClearButton>
                        </FiltersActions>
                    )}
                </AdvancedFiltersSection>

                <ResultsCounter>
                    Znaleziono: <strong>{resultCount}</strong> {resultCount === 1 ? 'szablon' : resultCount > 1 && resultCount < 5 ? 'szablony' : 'szablonów'}
                </ResultsCounter>
            </FiltersContent>
        </FiltersContainer>
    );
};


// 💅 Styled Components (Pozostawione bez zmian)
// ---
// ... (Wszystkie zdefiniowane wcześniej Styled Components) ...

const ContentContainer = styled.div` // Z ServicesPage
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

const ErrorMessage = styled.div` // Z ServicesPage (poprawiona nazwa i styl)
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

const ErrorIcon = styled.div` // Z ServicesPage
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorText = styled.div` // Z ServicesPage
    flex: 1;
    color: ${settingsTheme.status.error};
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
`;

const CloseErrorButton = styled.button` // Z ServicesPage
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: ${settingsTheme.spacing.xs};
    border-radius: ${settingsTheme.radius.sm};
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.status.error}20;
    }
`;

const DataArea = styled.div` // Odpowiednik ContentArea z nową nazwą
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 400px;
`;

const LoadingContainer = styled.div` // Z ServicesPage
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

const LoadingSpinner = styled.div` // Z ServicesPage
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

const LoadingText = styled.div` // Z ServicesPage
    font-size: 16px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const TemplateNameCell = styled.div` // Wzorowane na ServiceNameCell
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    min-width: 0;
    padding-left: ${settingsTheme.spacing.sm};
`;

const TemplateName = styled.div` // Wzorowane na ServiceName
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    font-size: 14px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FileName = styled.div`
    color: ${settingsTheme.text.muted};
    font-size: 11px;
    line-height: 1.2;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DataCell = styled.div`
    font-weight: 400;
    color: ${settingsTheme.text.secondary};
    font-size: 14px;
    text-align: left;
`;

const TypeCell = styled(DataCell)`
    font-weight: 500;
    color: ${settingsTheme.text.primary};
`;

const StatusCell = styled(DataCell)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
`;

const ActionMenuContainer = styled.div` // Z ServicesPage
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
`;


// Styled Components dla filtrów (wzorowane na ServicesPage)
const FiltersContainer = styled.div`
    padding: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surfaceAlt};
    border-top: 1px solid ${settingsTheme.border};
`;

const FiltersContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.md};
`;

const AdvancedFiltersSection = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.lg};
    padding: ${settingsTheme.spacing.lg};
    border: 1px solid ${settingsTheme.border};
`;

const FiltersGrid = styled.div<{ $singleRow?: boolean }>` // Z ServicesPage, rozbudowany
    display: grid;
    grid-template-columns: ${props => props.$singleRow ? '2fr 1fr 1fr' : 'repeat(auto-fit, minmax(280px, 1fr))'};
    gap: ${settingsTheme.spacing.md};
    margin-bottom: ${settingsTheme.spacing.lg};

    // Specjalna obsługa, gdy jest tylko jeden filtr (searchQuery), aby wypełniał całą szerokość
    ${props => props.$singleRow && `
        & > div:first-child {
            grid-column: span 1; // Zapewnienie, że nie zajmuje całego wiersza, gdy są inne filtry
        }
    `}
`;

const FormGroup = styled.div<{ $fullWidth?: boolean }>` // Z ServicesPage, rozbudowany
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
    ${props => props.$fullWidth && `
        grid-column: 1 / -1;
    `}
`;

const Label = styled.label` // Z ServicesPage
    font-size: 14px;
    font-weight: 500;
    color: ${settingsTheme.text.primary};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Input = styled.input` // Z ServicesPage
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 400;
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

const Select = styled.select` // Z ServicesPage
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 400;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all 0.2s ease;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }
`;

const FiltersActions = styled.div` // Z ServicesPage
    display: flex;
    justify-content: flex-end;
    gap: ${settingsTheme.spacing.sm};
    padding-top: ${settingsTheme.spacing.md};
    border-top: 1px solid ${settingsTheme.border};
`;

const ClearButton = styled.button` // Z ServicesPage
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${settingsTheme.status.error};
        color: ${settingsTheme.status.error};
        background: ${settingsTheme.status.errorLight};
    }
`;

const ResultsCounter = styled.div` // Z ServicesPage
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    font-weight: 400;
    text-align: center;
    padding: ${settingsTheme.spacing.sm} 0;

    strong {
        color: ${settingsTheme.primary};
        font-weight: 600;
    }
`;

export default TemplatesPage;