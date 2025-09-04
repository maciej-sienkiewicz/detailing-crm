// src/pages/Settings/TemplatesPage.tsx - Zaktualizowany z modalem potwierdzenia
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
        confirmationState, // DODANO: stan modalu potwierdzenia
        hideConfirmation   // DODANO: funkcja zamykania modalu
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

    // DODANO: Wrapper funkcja dla deleteTemplate
    const handleDeleteTemplate = async (templateId: string, templateName: string) => {
        await deleteTemplate(templateId, templateName);
    };

    const handleItemAction = (action: string, item: Template, e: React.MouseEvent) => {
        // Handle column sorting when clicking on sortable headers
        if (action && ['name', 'type', 'isActive', 'size', 'updatedAt', 'createdAt'].includes(action)) {
            handleSort(action as any);
        }
    };

    const columns: TableColumn[] = [
        { id: 'name', label: 'Nazwa szablonu', width: '35%', sortable: true },
        { id: 'type', label: 'Typ dokumentu', width: '20%', sortable: true },
        { id: 'isActive', label: 'Status', width: '10%', sortable: true },
        { id: 'updatedAt', label: 'Ostatnia modyfikacja', width: '15%', sortable: true },
        { id: 'actions', label: 'Akcje', width: '20%', sortable: false },
    ];

    const renderCell = (template: Template, columnId: string): React.ReactNode => {
        switch (columnId) {
            case 'name':
                return (
                    <NameCell>
                        <NameText title={template.name}>{template.name}</NameText>
                    </NameCell>
                );
            case 'type':
                return <TemplateTypeCell template={template} />;
            case 'isActive':
                return <TemplateStatusCell template={template} />;
            case 'size':
                return <TemplateSizeCell template={template} />;
            case 'updatedAt':
                return <TemplateDateCell template={template} />;
            case 'actions':
                return (
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
                );
            default:
                const value = template[columnId as keyof Template];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                return String(value);
        }
    };

    const emptyStateConfig = {
        icon: FaFileAlt,
        title: 'Brak szablonów',
        description: 'Dodaj pierwszy szablon dokumentu, aby rozpocząć automatyczne generowanie profesjonalnych dokumentów.',
        actionText: 'Dodaj szablon za pomocą przycisku powyżej'
    };

    // Sprawdzenie czy jakiekolwiek filtry są aktywne
    const hasActiveFilters = () => {
        return Object.values(filters).some(value => value && value.trim() !== '');
    };

    // Resetowanie filtrów
    const clearAllFilters = () => {
        setFilters({
            searchQuery: '',
            selectedType: undefined,
            selectedStatus: null,
            sortField: 'updatedAt',
            sortDirection: 'desc'
        });
    };

    // Konfiguracja akcji w nagłówku
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

    // Komponent filtrów
    const filtersComponent = (
        <EnhancedTemplateFilters
            filters={filters}
            templateTypes={templateTypes}
            showFilters={showFilters}
            hasActiveFilters={hasActiveFilters()}
            onFiltersChange={setFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onClearFilters={clearAllFilters}
            resultCount={templates.length}
        />
    );

    return (
        <PageContainer>
            {/* Error Message */}
            {error && (
                <ErrorContainer>
                    <ErrorIcon><FaExclamationTriangle /></ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                    <CloseErrorButton onClick={() => setError(null)}>
                        <FaTimes />
                    </CloseErrorButton>
                </ErrorContainer>
            )}

            {/* Main Content with DataTable */}
            <ContentArea>
                {isLoading ? (
                    <LoadingContainer>
                        <LoadingSpinner><FaSpinner /></LoadingSpinner>
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
            </ContentArea>

            {/* Modals */}
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

            {/* DODANO: Modal potwierdzenia usuwania */}
            <ConfirmationDialog
                isOpen={confirmationState.isOpen}
                title={confirmationState.title}
                message={confirmationState.message}
                confirmText={confirmationState.confirmText}
                cancelText={confirmationState.cancelText}
                onConfirm={confirmationState.onConfirm}
                onCancel={hideConfirmation}
            />
        </PageContainer>
    );
});

// Komponent Enhanced Template Filters
interface EnhancedTemplateFiltersProps {
    filters: TemplateFilters;
    templateTypes: any[];
    showFilters: boolean;
    hasActiveFilters: boolean;
    onFiltersChange: (filters: TemplateFilters) => void;
    onToggleFilters: () => void;
    onClearFilters: () => void;
    resultCount: number;
}

const EnhancedTemplateFilters: React.FC<EnhancedTemplateFiltersProps> = ({
                                                                             filters,
                                                                             templateTypes,
                                                                             showFilters,
                                                                             hasActiveFilters,
                                                                             onFiltersChange,
                                                                             onToggleFilters,
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
                <FilterGroup>
                    <SearchContainer>
                        <SearchInput
                            type="text"
                            placeholder="Szukaj szablonów..."
                            value={filters.searchQuery}
                            onChange={handleSearchChange}
                        />
                    </SearchContainer>

                    <Select value={filters.selectedType || ''} onChange={handleTypeChange}>
                        <option value="">Wszystkie typy</option>
                        {templateTypes.map(type => (
                            <option key={type.type} value={type.type}>
                                {type.displayName}
                            </option>
                        ))}
                    </Select>

                    <Select value={filters.selectedStatus === null ? '' : filters.selectedStatus?.toString()} onChange={handleStatusChange}>
                        <option value="">Wszystkie statusy</option>
                        <option value="true">Aktywne</option>
                        <option value="false">Nieaktywne</option>
                    </Select>

                    {hasActiveFilters && (
                        <ClearButton onClick={onClearFilters}>
                            <FaTimes />
                            Wyczyść filtry
                        </ClearButton>
                    )}
                </FilterGroup>

                <ResultsCounter>
                    Znaleziono: <strong>{resultCount}</strong> {resultCount === 1 ? 'szablon' : resultCount > 1 && resultCount < 5 ? 'szablony' : 'szablonów'}
                </ResultsCounter>
            </FiltersContent>
        </FiltersContainer>
    );
};

// Styled Components - pozostają bez zmian
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
    padding: 0 ${settingsTheme.spacing.xl} ${settingsTheme.spacing.xl};
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
        gap: ${settingsTheme.spacing.md};
    }
`;

const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    background: ${settingsTheme.status.errorLight};
    color: ${settingsTheme.status.error};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.lg};
    border: 1px solid ${settingsTheme.status.error}30;
`;

const ErrorIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorText = styled.div`
    flex: 1;
    font-weight: 500;
`;

const CloseErrorButton = styled.button`
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

const ContentArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 400px;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${settingsTheme.spacing.xxl};
    gap: ${settingsTheme.spacing.md};
    min-height: 400px;
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
`;

const LoadingSpinner = styled.div`
    font-size: 24px;
    color: ${settingsTheme.primary};
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

const NameCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

const NameText = styled.div`
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

// Enhanced Filters Styled Components
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

const FilterGroup = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.md};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SearchContainer = styled.div`
    position: relative;
    flex: 1;
    min-width: 300px;

    @media (max-width: 768px) {
        min-width: auto;
        width: 100%;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
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
    min-width: 150px;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    @media (max-width: 768px) {
        min-width: auto;
        width: 100%;
    }
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    white-space: nowrap;

    &:hover {
        background: ${settingsTheme.surfaceHover};
        color: ${settingsTheme.text.primary};
        border-color: ${settingsTheme.borderHover};
    }
`;

const ResultsCounter = styled.div`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
    text-align: center;
    padding: ${settingsTheme.spacing.sm} 0;

    strong {
        color: ${settingsTheme.primary};
        font-weight: 700;
    }
`;

export default TemplatesPage;