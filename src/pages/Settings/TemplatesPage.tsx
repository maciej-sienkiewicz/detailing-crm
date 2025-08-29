// src/pages/Settings/TemplatesPage.tsx
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaFileAlt, FaInfoCircle, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';
import { useTemplates } from '../../hooks/useTemplates';
import { DataTable, TableColumn } from '../../components/common/DataTable';
import { Template } from '../../types/template';
import { TemplateUploadModal } from '../../components/Templates/TemplateUploadModal';
import { TemplateInstructionsModal } from '../../components/Templates/TemplateInstructionsModal';
import { TemplateFiltersBar } from '../../components/Templates/TemplateFiltersBar';
import { TemplateActionsCell } from '../../components/Templates/TemplateActionsCell';
import { TemplateStatusCell } from '../../components/Templates/TemplateStatusCell';
import { TemplateTypeCell } from '../../components/Templates/TemplateTypeCell';
import { TemplateSizeCell } from '../../components/Templates/TemplateSizeCell';
import { TemplateDateCell } from '../../components/Templates/TemplateDateCell';
import { settingsTheme } from './styles/theme';

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
        handleSort
    } = useTemplates();

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);

    useImperativeHandle(ref, () => ({
        handleAddTemplate: () => setShowUploadModal(true)
    }));

    const handleUploadTemplate = async (uploadData: any) => {
        await uploadTemplate(uploadData);
        setShowUploadModal(false);
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
                        onDelete={deleteTemplate}
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

    return (
        <PageContainer>
            <TopSection>
                <StatsSection>
                    <StatCard>
                        <StatNumber>{stats.total}</StatNumber>
                        <StatLabel>
                            {stats.total === 1 ? 'szablon' :
                                stats.total <= 4 ? 'szablony' : 'szablonów'}
                        </StatLabel>
                    </StatCard>

                    <StatCard>
                        <StatNumber $color={settingsTheme.status.success}>{stats.active}</StatNumber>
                        <StatLabel>aktywnych</StatLabel>
                    </StatCard>

                    <TypeStatsContainer>
                        {Object.entries(stats.byType).map(([typeName, count]) => (
                            <TypeStat key={typeName}>
                                <TypeStatName>{typeName}</TypeStatName>
                                <TypeStatCount>{count}</TypeStatCount>
                            </TypeStat>
                        ))}
                    </TypeStatsContainer>
                </StatsSection>

                <ActionButtons>
                    <SecondaryButton onClick={() => setShowInstructionsModal(true)}>
                        <FaInfoCircle />
                        Instrukcje
                    </SecondaryButton>
                    <PrimaryButton onClick={() => setShowUploadModal(true)}>
                        <FaPlus />
                        Dodaj szablon
                    </PrimaryButton>
                </ActionButtons>
            </TopSection>

            <TemplateFiltersBar
                filters={filters}
                templateTypes={templateTypes}
                onFiltersChange={setFilters}
            />

            {error && (
                <ErrorContainer>
                    <ErrorIcon><FaExclamationTriangle /></ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                    <CloseErrorButton onClick={() => setError(null)}>
                        <FaTimes />
                    </CloseErrorButton>
                </ErrorContainer>
            )}

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
                    />
                )}
            </ContentArea>

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
        </PageContainer>
    );
});

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xl};
    padding: 0 ${settingsTheme.spacing.xl} ${settingsTheme.spacing.xl};
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg};
        gap: ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
        gap: ${settingsTheme.spacing.md};
    }
`;

const TopSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surface};
    padding: ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${settingsTheme.spacing.md};
    }
`;

const StatsSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.lg};

    @media (max-width: 768px) {
        flex-wrap: wrap;
        justify-content: space-between;
    }
`;

const StatCard = styled.div`
    display: flex;
    align-items: baseline;
    gap: ${settingsTheme.spacing.xs};
`;

const StatNumber = styled.span<{ $color?: string }>`
    font-size: 28px;
    font-weight: 700;
    color: ${props => props.$color || settingsTheme.primary};
    line-height: 1;
`;

const StatLabel = styled.span`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const TypeStatsContainer = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.md};
    padding-left: ${settingsTheme.spacing.lg};
    border-left: 1px solid ${settingsTheme.borderLight};

    @media (max-width: 768px) {
        padding-left: 0;
        border-left: none;
        flex-wrap: wrap;
        width: 100%;
    }
`;

const TypeStat = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
`;

const TypeStatName = styled.span`
    font-size: 12px;
    color: ${settingsTheme.text.tertiary};
    font-weight: 500;
    text-align: center;
`;

const TypeStatCount = styled.span`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;

        > * {
            flex: 1;
        }
    }
`;

const PrimaryButton = styled.button`
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
    min-height: 44px;
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${settingsTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
        box-shadow: ${settingsTheme.shadow.md};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid ${settingsTheme.border};
    white-space: nowrap;
    min-height: 44px;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    box-shadow: ${settingsTheme.shadow.xs};

    &:hover:not(:disabled) {
        background: ${settingsTheme.surfaceHover};
        color: ${settingsTheme.text.primary};
        border-color: ${settingsTheme.borderHover};
        box-shadow: ${settingsTheme.shadow.sm};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        justify-content: center;
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

export default TemplatesPage;