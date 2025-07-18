// src/pages/Settings/InvoiceTemplatesPage.tsx
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import {
    FaFileInvoice,
    FaUpload,
    FaDownload,
    FaEye,
    FaEdit,
    FaTrash,
    FaCode,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaSpinner,
    FaPlus,
    FaInfoCircle,
    FaCopy,
    FaFileAlt,
    FaPalette,
    FaSearch,
    FaTimes,
    FaSort,
    FaSortUp,
    FaSortDown
} from 'react-icons/fa';
import { apiClientNew } from '../../api/apiClientNew';
import { settingsTheme } from './styles/theme';

// ========================================================================================
// TYPES & INTERFACES
// ========================================================================================

interface InvoiceTemplate {
    id: string;
    companyId: number;
    name: string;
    description?: string;
    templateType: 'SYSTEM_DEFAULT' | 'COMPANY_CUSTOM';
    isActive: boolean;
    htmlTemplate: string;
    cssStyles: string;
    logoPlacement: {
        position: 'TOP_LEFT' | 'TOP_RIGHT' | 'TOP_CENTER';
        maxWidth: number;
        maxHeight: number;
    };
    layout: {
        pageSize: 'A4' | 'LETTER';
        margins: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
        headerHeight?: number;
        footerHeight?: number;
        fontFamily: string;
        fontSize: number;
    };
    metadata: {
        version: string;
        author?: string;
        tags: string[];
        legalCompliance: {
            country: string;
            vatCompliant: boolean;
            requiredFields: string[];
            lastLegalReview?: string;
        };
        supportedLanguages: string[];
    };
    createdAt: string;
    updatedAt: string;
}

interface TemplateUploadData {
    file: File;
    name: string;
    description?: string;
}

type SortField = 'name' | 'templateType' | 'isActive' | 'updatedAt';
type SortDirection = 'asc' | 'desc' | null;

interface InvoiceTemplatesPageRef {
    handleAddTemplate: () => void;
}

// ========================================================================================
// MAIN COMPONENT
// ========================================================================================

const InvoiceTemplatesPage = forwardRef<InvoiceTemplatesPageRef>((props, ref) => {
    // State management
    const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<InvoiceTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isActivating, setIsActivating] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState<string | null>(null);

    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        handleAddTemplate: () => setShowUploadModal(true)
    }));

    // ========================================================================================
    // DATA FETCHING
    // ========================================================================================

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiClientNew.get<InvoiceTemplate[]>('/invoice-templates');
            setTemplates(response);
        } catch (error: any) {
            console.error('Error fetching templates:', error);
            setError('Nie udało się załadować szablonów faktur.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial data load
    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // ========================================================================================
    // FILTERING & SORTING
    // ========================================================================================

    useEffect(() => {
        let filtered = [...templates];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(query) ||
                template.description?.toLowerCase().includes(query) ||
                template.metadata.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply sorting
        if (sortField && sortDirection) {
            filtered.sort((a, b) => {
                let aValue: any, bValue: any;

                switch (sortField) {
                    case 'name':
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                        break;
                    case 'templateType':
                        aValue = a.templateType;
                        bValue = b.templateType;
                        break;
                    case 'isActive':
                        aValue = a.isActive;
                        bValue = b.isActive;
                        break;
                    case 'updatedAt':
                        aValue = new Date(a.updatedAt);
                        bValue = new Date(b.updatedAt);
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredTemplates(filtered);
    }, [templates, searchQuery, sortField, sortDirection]);

    // ========================================================================================
    // TEMPLATE OPERATIONS
    // ========================================================================================

    const handleUploadTemplate = async (uploadData: TemplateUploadData) => {
        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('file', uploadData.file);
            formData.append('name', uploadData.name);
            if (uploadData.description) {
                formData.append('description', uploadData.description);
            }

            const response = await apiClientNew.postFormData<InvoiceTemplate>(
                '/invoice-templates',
                formData
            );

            setTemplates(prev => [...prev, response]);
            setShowUploadModal(false);
            setError(null);
        } catch (error: any) {
            console.error('Error uploading template:', error);
            setError('Nie udało się przesłać szablonu. Sprawdź format pliku i spróbuj ponownie.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleActivateTemplate = async (templateId: string) => {
        try {
            setIsActivating(templateId);
            await apiClientNew.post(`/invoice-templates/${templateId}/activate`);

            // Update local state - deactivate all others and activate selected
            setTemplates(prev => prev.map(template => ({
                ...template,
                isActive: template.id === templateId
            })));

            setError(null);
        } catch (error: any) {
            console.error('Error activating template:', error);
            setError('Nie udało się aktywować szablonu.');
        } finally {
            setIsActivating(null);
        }
    };

    const handlePreviewTemplate = async (template: InvoiceTemplate) => {
        try {
            setIsGeneratingPreview(template.id);

            // Generate preview PDF
            const response = await fetch(`${apiClientNew['baseUrl']}/invoice-templates/${template.id}/preview`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) throw new Error('Preview generation failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Open in new tab
            window.open(url, '_blank');

            // Clean up URL after a delay
            setTimeout(() => URL.revokeObjectURL(url), 10000);

        } catch (error: any) {
            console.error('Error generating preview:', error);
            setError('Nie udało się wygenerować podglądu szablonu.');
        } finally {
            setIsGeneratingPreview(null);
        }
    };

    const handleExportTemplate = async (template: InvoiceTemplate) => {
        try {
            const response = await fetch(`${apiClientNew['baseUrl']}/invoice-templates/${template.id}/export`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Download file
            const a = document.createElement('a');
            a.href = url;
            a.download = `szablon-faktury-${template.name}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error('Error exporting template:', error);
            setError('Nie udało się wyeksportować szablonu.');
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten szablon? Ta operacja jest nieodwracalna.')) {
            return;
        }

        try {
            setIsDeleting(templateId);
            await apiClientNew.delete(`/invoice-templates/${templateId}`);
            setTemplates(prev => prev.filter(template => template.id !== templateId));
            setError(null);
        } catch (error: any) {
            console.error('Error deleting template:', error);
            setError('Nie udało się usunąć szablonu.');
        } finally {
            setIsDeleting(null);
        }
    };

    // ========================================================================================
    // SORTING HELPERS
    // ========================================================================================

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort />;
        if (sortDirection === 'asc') return <FaSortUp />;
        if (sortDirection === 'desc') return <FaSortDown />;
        return <FaSort />;
    };

    // ========================================================================================
    // UTILITY FUNCTIONS
    // ========================================================================================

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTemplateTypeLabel = (type: string) => {
        switch (type) {
            case 'SYSTEM_DEFAULT': return 'Systemowy';
            case 'COMPANY_CUSTOM': return 'Firmowy';
            default: return type;
        }
    };

    const getTemplateTypeColor = (type: string) => {
        switch (type) {
            case 'SYSTEM_DEFAULT': return settingsTheme.status.info;
            case 'COMPANY_CUSTOM': return settingsTheme.primary;
            default: return settingsTheme.text.muted;
        }
    };

    // ========================================================================================
    // RENDER
    // ========================================================================================

    return (
        <PageContainer>
            {/* Header Section */}
            <HeaderContainer>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaFileInvoice />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Szablony faktur</HeaderTitle>
                            <HeaderSubtitle>
                                Zarządzaj szablonami HTML dla automatycznego generowania faktur
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>
                    <HeaderActions>
                        <SecondaryButton onClick={() => setShowInstructionsModal(true)}>
                            <FaInfoCircle />
                            Instrukcje
                        </SecondaryButton>
                        <PrimaryButton onClick={() => setShowUploadModal(true)}>
                            <FaPlus />
                            Dodaj szablon
                        </PrimaryButton>
                    </HeaderActions>
                </HeaderContent>
            </HeaderContainer>

            {/* Search & Filters */}
            <FiltersContainer>
                <SearchContainer>
                    <SearchInput
                        type="text"
                        placeholder="Wyszukaj szablon po nazwie, opisie lub tagach..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <ClearSearchButton onClick={() => setSearchQuery('')}>
                            <FaTimes />
                        </ClearSearchButton>
                    )}
                </SearchContainer>
                <FilterInfo>
                    Wyświetlane: <strong>{filteredTemplates.length}</strong> z {templates.length} szablonów
                </FilterInfo>
            </FiltersContainer>

            {/* Error Display */}
            {error && (
                <ErrorContainer>
                    <ErrorIcon><FaExclamationTriangle /></ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                    <CloseErrorButton onClick={() => setError(null)}>
                        <FaTimes />
                    </CloseErrorButton>
                </ErrorContainer>
            )}

            {/* Main Content */}
            <ContentContainer>
                {isLoading ? (
                    <LoadingContainer>
                        <LoadingSpinner><FaSpinner /></LoadingSpinner>
                        <LoadingText>Ładowanie szablonów...</LoadingText>
                    </LoadingContainer>
                ) : filteredTemplates.length === 0 ? (
                    <EmptyStateContainer>
                        <EmptyStateIcon><FaFileInvoice /></EmptyStateIcon>
                        <EmptyStateTitle>
                            {searchQuery ? 'Brak wyników wyszukiwania' : 'Brak szablonów faktur'}
                        </EmptyStateTitle>
                        <EmptyStateDescription>
                            {searchQuery
                                ? 'Nie znaleziono szablonów spełniających podane kryteria.'
                                : 'Dodaj pierwszy szablon faktury, aby rozpocząć automatyczne generowanie profesjonalnych faktur.'
                            }
                        </EmptyStateDescription>
                        {!searchQuery && (
                            <EmptyStateActions>
                                <PrimaryButton onClick={() => setShowUploadModal(true)}>
                                    <FaPlus />
                                    Dodaj pierwszy szablon
                                </PrimaryButton>
                                <SecondaryButton onClick={() => setShowInstructionsModal(true)}>
                                    <FaInfoCircle />
                                    Zobacz instrukcje
                                </SecondaryButton>
                            </EmptyStateActions>
                        )}
                    </EmptyStateContainer>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeaderCell onClick={() => handleSort('name')}>
                                        <HeaderCellContent>
                                            Szablon
                                            <SortIcon>{getSortIcon('name')}</SortIcon>
                                        </HeaderCellContent>
                                    </SortableHeaderCell>
                                    <SortableHeaderCell onClick={() => handleSort('templateType')}>
                                        <HeaderCellContent>
                                            Typ
                                            <SortIcon>{getSortIcon('templateType')}</SortIcon>
                                        </HeaderCellContent>
                                    </SortableHeaderCell>
                                    <TableHeaderCell>Zgodność prawna</TableHeaderCell>
                                    <SortableHeaderCell onClick={() => handleSort('isActive')}>
                                        <HeaderCellContent>
                                            Status
                                            <SortIcon>{getSortIcon('isActive')}</SortIcon>
                                        </HeaderCellContent>
                                    </SortableHeaderCell>
                                    <SortableHeaderCell onClick={() => handleSort('updatedAt')}>
                                        <HeaderCellContent>
                                            Ostatnia modyfikacja
                                            <SortIcon>{getSortIcon('updatedAt')}</SortIcon>
                                        </HeaderCellContent>
                                    </SortableHeaderCell>
                                    <TableHeaderCell>Akcje</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTemplates.map(template => (
                                    <TableRow key={template.id}>
                                        <TableCell>
                                            <TemplateInfo>
                                                <TemplateName>{template.name}</TemplateName>
                                                {template.description && (
                                                    <TemplateDescription>{template.description}</TemplateDescription>
                                                )}
                                                <TemplateTags>
                                                    {template.metadata.tags.map(tag => (
                                                        <TemplateTag key={tag}>{tag}</TemplateTag>
                                                    ))}
                                                </TemplateTags>
                                            </TemplateInfo>
                                        </TableCell>
                                        <TableCell>
                                            <TypeBadge color={getTemplateTypeColor(template.templateType)}>
                                                {getTemplateTypeLabel(template.templateType)}
                                            </TypeBadge>
                                        </TableCell>
                                        <TableCell>
                                            <ComplianceInfo>
                                                <ComplianceItem>
                                                    <ComplianceIcon $compliant={template.metadata.legalCompliance.vatCompliant}>
                                                        {template.metadata.legalCompliance.vatCompliant ? <FaCheckCircle /> : <FaTimesCircle />}
                                                    </ComplianceIcon>
                                                    <ComplianceText>
                                                        VAT {template.metadata.legalCompliance.vatCompliant ? 'zgodny' : 'niezgodny'}
                                                    </ComplianceText>
                                                </ComplianceItem>
                                                <ComplianceCountry>{template.metadata.legalCompliance.country}</ComplianceCountry>
                                            </ComplianceInfo>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge $isActive={template.isActive}>
                                                {template.isActive ? (
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
                                            <DateInfo>
                                                <DateValue>{formatDate(template.updatedAt)}</DateValue>
                                                <VersionInfo>v{template.metadata.version}</VersionInfo>
                                            </DateInfo>
                                        </TableCell>
                                        <TableCell>
                                            <ActionsGroup>
                                                <ActionButton
                                                    onClick={() => handlePreviewTemplate(template)}
                                                    disabled={isGeneratingPreview === template.id}
                                                    title="Podgląd szablonu"
                                                >
                                                    {isGeneratingPreview === template.id ? (
                                                        <FaSpinner className="spinning" />
                                                    ) : (
                                                        <FaEye />
                                                    )}
                                                </ActionButton>

                                                <ActionButton
                                                    onClick={() => handleExportTemplate(template)}
                                                    title="Eksportuj szablon"
                                                >
                                                    <FaDownload />
                                                </ActionButton>

                                                {!template.isActive && (
                                                    <ActionButton
                                                        onClick={() => handleActivateTemplate(template.id)}
                                                        disabled={isActivating === template.id}
                                                        title="Aktywuj szablon"
                                                        $variant="success"
                                                    >
                                                        {isActivating === template.id ? (
                                                            <FaSpinner className="spinning" />
                                                        ) : (
                                                            <FaCheckCircle />
                                                        )}
                                                    </ActionButton>
                                                )}

                                                {template.templateType === 'COMPANY_CUSTOM' && (
                                                    <ActionButton
                                                        onClick={() => handleDeleteTemplate(template.id)}
                                                        disabled={isDeleting === template.id || template.isActive}
                                                        title={template.isActive ? "Nie można usunąć aktywnego szablonu" : "Usuń szablon"}
                                                        $variant="danger"
                                                    >
                                                        {isDeleting === template.id ? (
                                                            <FaSpinner className="spinning" />
                                                        ) : (
                                                            <FaTrash />
                                                        )}
                                                    </ActionButton>
                                                )}
                                            </ActionsGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </ContentContainer>

            {/* Upload Modal */}
            {showUploadModal && (
                <TemplateUploadModal
                    onUpload={handleUploadTemplate}
                    onCancel={() => setShowUploadModal(false)}
                    isLoading={isUploading}
                />
            )}

            {/* Instructions Modal */}
            {showInstructionsModal && (
                <InstructionsModal
                    onClose={() => setShowInstructionsModal(false)}
                />
            )}
        </PageContainer>
    );
});

// ========================================================================================
// UPLOAD MODAL COMPONENT
// ========================================================================================

interface TemplateUploadModalProps {
    onUpload: (data: TemplateUploadData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const TemplateUploadModal: React.FC<TemplateUploadModalProps> = ({ onUpload, onCancel, isLoading }) => {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/html' && !selectedFile.name.endsWith('.html')) {
                setError('Plik musi mieć rozszerzenie .html');
                return;
            }
            if (selectedFile.size > 1024 * 1024) { // 1MB limit
                setError('Plik nie może być większy niż 1MB');
                return;
            }
            setFile(selectedFile);
            setError(null);
            if (!name) {
                setName(selectedFile.name.replace('.html', ''));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name.trim()) {
            setError('Wybierz plik i podaj nazwę szablonu');
            return;
        }
        onUpload({ file, name: name.trim(), description: description.trim() || undefined });
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <h2>Dodaj nowy szablon faktury</h2>
                    <CloseButton onClick={onCancel} disabled={isLoading}>×</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>Plik HTML szablonu *</Label>
                            <FileUploadArea>
                                <FileInput
                                    type="file"
                                    accept=".html,text/html"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                />
                                <FileUploadContent>
                                    <FaUpload />
                                    <FileUploadText>
                                        {file ? file.name : 'Wybierz plik HTML lub przeciągnij tutaj'}
                                    </FileUploadText>
                                    <FileUploadHint>
                                        Maksymalny rozmiar: 1MB, format: HTML z wbudowanym CSS
                                    </FileUploadHint>
                                </FileUploadContent>
                            </FileUploadArea>
                        </FormGroup>

                        <FormGroup>
                            <Label>Nazwa szablonu *</Label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="np. Profesjonalny szablon firmowy"
                                required
                                disabled={isLoading}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Opis szablonu</Label>
                            <TextArea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Opcjonalny opis szablonu..."
                                rows={3}
                                disabled={isLoading}
                            />
                        </FormGroup>

                        {error && (
                            <ErrorText>
                                <FaExclamationTriangle />
                                {error}
                            </ErrorText>
                        )}

                        <ModalActions>
                            <SecondaryButton type="button" onClick={onCancel} disabled={isLoading}>
                                Anuluj
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={!file || !name.trim() || isLoading}>
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="spinning" />
                                        Przesyłanie...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload />
                                        Dodaj szablon
                                    </>
                                )}
                            </PrimaryButton>
                        </ModalActions>
                    </form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// ========================================================================================
// INSTRUCTIONS MODAL COMPONENT
// ========================================================================================

interface InstructionsModalProps {
    onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'variables' | 'requirements' | 'examples'>('overview');

    return (
        <ModalOverlay>
            <LargeModalContainer>
                <ModalHeader>
                    <h2>Instrukcja tworzenia szablonów faktur</h2>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>
                <InstructionsContent>
                    <InstructionsTabs>
                        <InstructionsTab
                            $active={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                        >
                            <FaInfoCircle />
                            Przegląd
                        </InstructionsTab>
                        <InstructionsTab
                            $active={activeTab === 'variables'}
                            onClick={() => setActiveTab('variables')}
                        >
                            <FaCode />
                            Zmienne
                        </InstructionsTab>
                        <InstructionsTab
                            $active={activeTab === 'requirements'}
                            onClick={() => setActiveTab('requirements')}
                        >
                            <FaCheckCircle />
                            Wymagania
                        </InstructionsTab>
                        <InstructionsTab
                            $active={activeTab === 'examples'}
                            onClick={() => setActiveTab('examples')}
                        >
                            <FaFileAlt />
                            Przykłady
                        </InstructionsTab>
                    </InstructionsTabs>

                    <InstructionsTabContent>
                        {activeTab === 'overview' && (
                            <TabPanel>
                                <SectionTitle>Jak tworzyć szablony faktur?</SectionTitle>
                                <InstructionsList>
                                    <InstructionItem>
                                        <strong>Format pliku:</strong> Szablon musi być plikiem HTML (.html) z wbudowanym CSS
                                    </InstructionItem>
                                    <InstructionItem>
                                        <strong>Maksymalny rozmiar:</strong> 1MB
                                    </InstructionItem>
                                    <InstructionItem>
                                        <strong>Kodowanie:</strong> UTF-8
                                    </InstructionItem>
                                    <InstructionItem>
                                        <strong>Zmienne:</strong> System automatycznie podstawi dane faktury używając składni Thymeleaf
                                    </InstructionItem>
                                    <InstructionItem>
                                        <strong>Zgodność prawna:</strong> Szablon jest automatycznie sprawdzany pod kątem zgodności z polskim prawem
                                    </InstructionItem>
                                </InstructionsList>

                                <SectionTitle>Struktura pliku HTML</SectionTitle>
                                <CodeBlock>
                                    {`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Faktura</title>
    <style>
        /* Tutaj umieść wszystkie style CSS */
        body { font-family: Arial, sans-serif; }
        .invoice-header { margin-bottom: 30px; }
        /* ... pozostałe style */
    </style>
</head>
<body>
    <!-- Tutaj treść szablonu faktury -->
    <div class="invoice-header">
        <h1>FAKTURA <span th:text="\${invoice.number}">001/2024</span></h1>
    </div>
    <!-- ... pozostała zawartość -->
</body>
</html>`}
                                </CodeBlock>

                                <WarningBox>
                                    <FaExclamationTriangle />
                                    <div>
                                        <strong>Ważne:</strong> Wszystkie style CSS muszą być wewnątrz tagu &lt;style&gt; w sekcji &lt;head&gt;.
                                        Nie używaj zewnętrznych plików CSS ani inline styles.
                                    </div>
                                </WarningBox>
                            </TabPanel>
                        )}

                        {activeTab === 'variables' && (
                            <TabPanel>
                                <SectionTitle>Dostępne zmienne w szablonie</SectionTitle>

                                <VariableGroup>
                                    <VariableGroupTitle>Dane faktury</VariableGroupTitle>
                                    <VariablesList>
                                        <VariableItem>
                                            <VariableCode>${invoice.number}</VariableCode>
                                            <VariableDescription>Numer faktury</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${invoice.title}</VariableCode>
                                            <VariableDescription>Tytuł faktury</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${issuedDate}</VariableCode>
                                            <VariableDescription>Data wystawienia (format: dd.MM.yyyy)</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${dueDate}</VariableCode>
                                            <VariableDescription>Termin płatności (format: dd.MM.yyyy)</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${totalNetFormatted}</VariableCode>
                                            <VariableDescription>Suma netto (z "zł")</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${totalTaxFormatted}</VariableCode>
                                            <VariableDescription>Suma VAT (z "zł")</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${totalGrossFormatted}</VariableCode>
                                            <VariableDescription>Suma brutto (z "zł")</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${paymentMethod}</VariableCode>
                                            <VariableDescription>Sposób płatności (po polsku)</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${invoice.notes}</VariableCode>
                                            <VariableDescription>Uwagi do faktury</VariableDescription>
                                        </VariableItem>
                                    </VariablesList>
                                </VariableGroup>

                                <VariableGroup>
                                    <VariableGroupTitle>Dane firmy (sprzedawca)</VariableGroupTitle>
                                    <VariablesList>
                                        <VariableItem>
                                            <VariableCode>${sellerName}</VariableCode>
                                            <VariableDescription>Nazwa firmy</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${sellerAddress}</VariableCode>
                                            <VariableDescription>Adres firmy</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${sellerTaxId}</VariableCode>
                                            <VariableDescription>NIP firmy</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${sellerPhone}</VariableCode>
                                            <VariableDescription>Telefon firmy</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${sellerWebsite}</VariableCode>
                                            <VariableDescription>Strona internetowa</VariableDescription>
                                        </VariableItem>
                                    </VariablesList>
                                </VariableGroup>

                                <VariableGroup>
                                    <VariableGroupTitle>Dane klienta (nabywca)</VariableGroupTitle>
                                    <VariablesList>
                                        <VariableItem>
                                            <VariableCode>${buyerName}</VariableCode>
                                            <VariableDescription>Nazwa klienta</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${buyerAddress}</VariableCode>
                                            <VariableDescription>Adres klienta</VariableDescription>
                                        </VariableItem>
                                        <VariableItem>
                                            <VariableCode>${buyerTaxId}</VariableCode>
                                            <VariableDescription>NIP klienta</VariableDescription>
                                        </VariableItem>
                                    </VariablesList>
                                </VariableGroup>

                                <VariableGroup>
                                    <VariableGroupTitle>Logo firmy</VariableGroupTitle>
                                    <CodeBlock>
                                        {`<div th:if="\${hasLogo}">
    <img th:src="'data:image/png;base64,' + \${logoBase64}" 
         alt="Logo" 
         style="max-width: 150px;"/>
</div>`}
                                    </CodeBlock>
                                </VariableGroup>

                                <VariableGroup>
                                    <VariableGroupTitle>Pozycje faktury (tabela)</VariableGroupTitle>
                                    <CodeBlock>
                                        {`<tr th:each="item : \${formattedItems}">
    <td th:text="\${item.name}">Nazwa usługi</td>
    <td th:text="\${item.quantity}">1</td>
    <td th:text="\${item.unitPrice}">100,00 zł</td>
    <td th:text="\${item.taxRate}">23%</td>
    <td th:text="\${item.totalNet}">100,00 zł</td>
    <td th:text="\${item.totalGross}">123,00 zł</td>
</tr>`}
                                    </CodeBlock>
                                </VariableGroup>

                                <VariableGroup>
                                    <VariableGroupTitle>Podsumowanie VAT</VariableGroupTitle>
                                    <CodeBlock>
                                        {`<tr th:each="vat : \${vatSummary}">
    <td th:text="\${vat.taxRate}">23%</td>
    <td th:text="\${vat.netSum}">100,00 zł</td>
    <td th:text="\${vat.taxSum}">23,00 zł</td>
    <td th:text="\${vat.grossSum}">123,00 zł</td>
</tr>`}
                                    </CodeBlock>
                                </VariableGroup>
                            </TabPanel>
                        )}

                        {activeTab === 'requirements' && (
                            <TabPanel>
                                <SectionTitle>Wymagania techniczne</SectionTitle>

                                <RequirementGroup>
                                    <RequirementTitle>✅ Zalecane praktyki</RequirementTitle>
                                    <RequirementsList>
                                        <RequirementItem>Używaj czcionek bezpiecznych dla PDF: Arial, Times New Roman, Courier</RequirementItem>
                                        <RequirementItem>Wszystkie style CSS w tagu &lt;style&gt; w sekcji &lt;head&gt;</RequirementItem>
                                        <RequirementItem>Używaj tylko zmiennych z dostępnej listy</RequirementItem>
                                        <RequirementItem>Testuj szablon z funkcją podglądu</RequirementItem>
                                        <RequirementItem>Używaj prostych layoutów (unikaj position: fixed)</RequirementItem>
                                    </RequirementsList>
                                </RequirementGroup>

                                <RequirementGroup>
                                    <RequirementTitle>❌ Czego unikać</RequirementTitle>
                                    <RequirementsList>
                                        <RequirementItem>Nie używaj zewnętrznych plików CSS (&lt;link&gt;)</RequirementItem>
                                        <RequirementItem>Nie używaj JavaScript</RequirementItem>
                                        <RequirementItem>Nie używaj zewnętrznych obrazków (tylko logo przez zmienną)</RequirementItem>
                                        <RequirementItem>Nie używaj position: fixed (problemy z PDF)</RequirementItem>
                                        <RequirementItem>Unikaj skomplikowanych layoutów (flexbox/grid może nie działać w PDF)</RequirementItem>
                                    </RequirementsList>
                                </RequirementGroup>

                                <RequirementGroup>
                                    <RequirementTitle>📐 Style do druku</RequirementTitle>
                                    <CodeBlock>
                                        {`@media print {
    body { margin: 0; }
    .no-print { display: none; }
}

@page {
    margin: 15mm;
    size: A4;
}`}
                                    </CodeBlock>
                                </RequirementGroup>

                                <RequirementGroup>
                                    <RequirementTitle>📱 Responsywność</RequirementTitle>
                                    <CodeBlock>
                                        {`@media screen and (max-width: 768px) {
    table { font-size: 12px; }
    .invoice-header { text-align: center; }
}`}
                                    </CodeBlock>
                                </RequirementGroup>
                            </TabPanel>
                        )}

                        {activeTab === 'examples' && (
                            <TabPanel>
                                <SectionTitle>Przykładowy szablon faktury</SectionTitle>

                                <CodeBlock>
                                    {`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Faktura</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            color: #2c3e50;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
        }
        .company-info { text-align: right; }
        .invoice-title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1a365d;
            margin: 20px 0;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px 8px; 
            text-align: left; 
        }
        th { 
            background-color: #1a365d;
            color: white;
            font-weight: bold;
        }
        .totals { 
            text-align: right; 
            margin-top: 20px;
            font-size: 16px;
        }
        .total-amount {
            font-size: 18px;
            font-weight: bold;
            color: #1a365d;
        }
        .company-logo img {
            max-width: 150px;
            max-height: 80px;
        }
        
        @media print {
            body { margin: 0; }
        }
        
        @page {
            margin: 15mm;
            size: A4;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-logo" th:if="\${hasLogo}">
            <img th:src="'data:image/png;base64,' + \${logoBase64}" alt="Logo"/>
        </div>
        <div class="company-info">
            <h2 th:text="\${sellerName}">Nazwa firmy</h2>
            <p th:text="\${sellerAddress}">Adres firmy</p>
            <p>NIP: <span th:text="\${sellerTaxId}">123456789</span></p>
            <p th:text="\${sellerPhone}">+48 123 456 789</p>
        </div>
    </div>

    <div class="invoice-title">
        FAKTURA <span th:text="\${invoice.number}">001/2024</span>
    </div>

    <div class="invoice-details">
        <p><strong>Data wystawienia:</strong> <span th:text="\${issuedDate}">01.01.2024</span></p>
        <p><strong>Termin płatności:</strong> <span th:text="\${dueDate}">15.01.2024</span></p>
        <p><strong>Sposób płatności:</strong> <span th:text="\${paymentMethod}">Przelew</span></p>
    </div>

    <h3>Nabywca:</h3>
    <div class="buyer-info">
        <p><strong th:text="\${buyerName}">Nazwa klienta</strong></p>
        <p th:text="\${buyerAddress}">Adres klienta</p>
        <p>NIP: <span th:text="\${buyerTaxId}">987654321</span></p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Lp.</th>
                <th>Nazwa usługi</th>
                <th>Ilość</th>
                <th>Cena netto</th>
                <th>VAT</th>
                <th>Wartość netto</th>
                <th>Wartość brutto</th>
            </tr>
        </thead>
        <tbody>
            <tr th:each="item,iterStat : \${formattedItems}">
                <td th:text="\${iterStat.count}">1</td>
                <td th:text="\${item.name}">Detailing Premium</td>
                <td th:text="\${item.quantity}">1</td>
                <td th:text="\${item.unitPrice}">800,00 zł</td>
                <td th:text="\${item.taxRate}">23%</td>
                <td th:text="\${item.totalNet}">800,00 zł</td>
                <td th:text="\${item.totalGross}">984,00 zł</td>
            </tr>
        </tbody>
    </table>

    <!-- Podsumowanie VAT -->
    <h4>Podsumowanie VAT:</h4>
    <table style="width: 400px; margin-left: auto;">
        <thead>
            <tr>
                <th>Stawka VAT</th>
                <th>Netto</th>
                <th>VAT</th>
                <th>Brutto</th>
            </tr>
        </thead>
        <tbody>
            <tr th:each="vat : \${vatSummary}">
                <td th:text="\${vat.taxRate}">23%</td>
                <td th:text="\${vat.netSum}">800,00 zł</td>
                <td th:text="\${vat.taxSum}">184,00 zł</td>
                <td th:text="\${vat.grossSum}">984,00 zł</td>
            </tr>
        </tbody>
    </table>

    <div class="totals">
        <p>Suma netto: <span th:text="\${totalNetFormatted}">800,00 zł</span></p>
        <p>Suma VAT: <span th:text="\${totalTaxFormatted}">184,00 zł</span></p>
        <p class="total-amount">
            <strong>SUMA BRUTTO: <span th:text="\${totalGrossFormatted}">984,00 zł</span></strong>
        </p>
    </div>

    <!-- Uwagi opcjonalne -->
    <div th:if="\${invoice.notes}" style="margin-top: 30px;">
        <h4>Uwagi:</h4>
        <p th:text="\${invoice.notes}"></p>
    </div>

    <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #7f8c8d;">
        Dziękujemy za skorzystanie z naszych usług!
    </div>
</body>
</html>`}
                                </CodeBlock>

                                <InfoBox>
                                    <FaInfoCircle />
                                    <div>
                                        <strong>Wskazówka:</strong> Ten przykład zawiera wszystkie podstawowe elementy faktury zgodnej z polskim prawem.
                                        Możesz go użyć jako punkt wyjścia do tworzenia własnych szablonów.
                                    </div>
                                </InfoBox>

                                <SectionTitle>Dodatkowe funkcje Thymeleaf</SectionTitle>
                                <CodeBlock>
                                    {`<!-- Warunki -->
<div th:if="\${invoice.notes}">
    <h4>Uwagi:</h4>
    <p th:text="\${invoice.notes}"></p>
</div>

<!-- Numeracja w pętli -->
<td th:text="\${itemStat.count}">1</td>

<!-- Formatowanie własne -->
<span th:text="\${#numbers.formatDecimal(amount, 2, 2)} + ' zł'">100,00 zł</span>`}
                                </CodeBlock>
                            </TabPanel>
                        )}
                    </InstructionsTabContent>
                </InstructionsContent>
            </LargeModalContainer>
        </ModalOverlay>
    );
};

// ========================================================================================
// STYLED COMPONENTS
// ========================================================================================

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

const HeaderContainer = styled.div`
    margin-bottom: ${settingsTheme.spacing.md};
`;

const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${settingsTheme.spacing.lg};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${settingsTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    border-radius: ${settingsTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${settingsTheme.shadow.md};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    flex: 1;
    min-width: 0;
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.xs} 0;
    letter-spacing: -0.025em;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${settingsTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
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

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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
`;

const FiltersContainer = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    padding: ${settingsTheme.spacing.lg};
    box-shadow: ${settingsTheme.shadow.sm};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${settingsTheme.spacing.md};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SearchContainer = styled.div`
    position: relative;
    flex: 1;
    max-width: 500px;

    @media (max-width: 768px) {
        max-width: none;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    padding-right: 40px;
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.lg};
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

const ClearSearchButton = styled.button`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border: none;
    background: ${settingsTheme.surfaceAlt};
    color: ${settingsTheme.text.muted};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.status.error};
        color: white;
    }
`;

const FilterInfo = styled.div`
    color: ${settingsTheme.text.secondary};
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;

    strong {
        color: ${settingsTheme.primary};
        font-weight: 700;
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
    position: relative;
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

const ContentContainer = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    overflow: hidden;
    box-shadow: ${settingsTheme.shadow.sm};
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

const EmptyStateContainer = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${settingsTheme.spacing.xxl};
   text-align: center;
   min-height: 400px;
   background: ${settingsTheme.surface};
`;

const EmptyStateIcon = styled.div`
   width: 80px;
   height: 80px;
   background: ${settingsTheme.surfaceAlt};
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 32px;
   color: ${settingsTheme.text.muted};
   margin-bottom: ${settingsTheme.spacing.lg};
   box-shadow: ${settingsTheme.shadow.xs};
`;

const EmptyStateTitle = styled.h3`
   font-size: 24px;
   font-weight: 700;
   color: ${settingsTheme.text.primary};
   margin: 0 0 ${settingsTheme.spacing.sm} 0;
   letter-spacing: -0.025em;
`;

const EmptyStateDescription = styled.p`
   font-size: 16px;
   color: ${settingsTheme.text.secondary};
   margin: 0 0 ${settingsTheme.spacing.lg} 0;
   line-height: 1.5;
   max-width: 500px;
`;

const EmptyStateActions = styled.div`
   display: flex;
   gap: ${settingsTheme.spacing.sm};
   margin-top: ${settingsTheme.spacing.md};

   @media (max-width: 768px) {
       flex-direction: column;
       width: 100%;
       max-width: 300px;
   }
`;

const TableContainer = styled.div`
   flex: 1;
   overflow: auto;
   min-height: 0;

   &::-webkit-scrollbar {
       width: 8px;
       height: 8px;
   }

   &::-webkit-scrollbar-track {
       background: ${settingsTheme.surfaceAlt};
   }

   &::-webkit-scrollbar-thumb {
       background: ${settingsTheme.border};
       border-radius: 4px;
   }

   &::-webkit-scrollbar-thumb:hover {
       background: ${settingsTheme.borderHover};
   }
`;

const Table = styled.table`
   width: 100%;
   border-collapse: collapse;
   min-width: 1200px;
`;

const TableHeader = styled.thead`
   background: ${settingsTheme.surfaceAlt};
   border-bottom: 2px solid ${settingsTheme.border};
   position: sticky;
   top: 0;
   z-index: 10;
`;

const TableRow = styled.tr`
   border-bottom: 1px solid ${settingsTheme.borderLight};
   transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

   &:hover {
       background: ${settingsTheme.surfaceHover};
   }

   &:last-child {
       border-bottom: none;
   }
`;

const TableHeaderCell = styled.th`
   padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.md};
   text-align: left;
   font-weight: 600;
   color: ${settingsTheme.text.primary};
   font-size: 14px;
   white-space: nowrap;
   background: ${settingsTheme.surfaceAlt};
`;

const SortableHeaderCell = styled(TableHeaderCell)`
   cursor: pointer;
   user-select: none;
   transition: all 0.2s ease;

   &:hover {
       background: ${settingsTheme.primaryGhost};
       color: ${settingsTheme.primary};
   }
`;

const HeaderCellContent = styled.div`
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.xs};
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
   background: ${settingsTheme.surface};
`;

const TableCell = styled.td`
   padding: ${settingsTheme.spacing.md};
   vertical-align: middle;
   border-right: 1px solid ${settingsTheme.borderLight};

   &:last-child {
       border-right: none;
   }
`;

const TemplateInfo = styled.div`
   min-width: 250px;
`;

const TemplateName = styled.div`
   font-weight: 600;
   color: ${settingsTheme.text.primary};
   font-size: 15px;
   margin-bottom: 4px;
   line-height: 1.3;
`;

const TemplateDescription = styled.div`
   font-size: 13px;
   color: ${settingsTheme.text.tertiary};
   margin-bottom: 6px;
   line-height: 1.3;
`;

const TemplateTags = styled.div`
   display: flex;
   gap: 4px;
   flex-wrap: wrap;
`;

const TemplateTag = styled.span`
   display: inline-block;
   padding: 2px 6px;
   background: ${settingsTheme.primaryGhost};
   color: ${settingsTheme.primary};
   border-radius: ${settingsTheme.radius.sm};
   font-size: 10px;
   font-weight: 600;
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const TypeBadge = styled.div<{ color: string }>`
   display: inline-flex;
   align-items: center;
   padding: 6px 12px;
   border-radius: ${settingsTheme.radius.md};
   font-size: 12px;
   font-weight: 600;
   color: ${props => props.color};
   background: ${props => props.color}15;
   border: 1px solid ${props => props.color}30;
   min-width: 80px;
   justify-content: center;
`;

const ComplianceInfo = styled.div`
   min-width: 120px;
`;

const ComplianceItem = styled.div`
   display: flex;
   align-items: center;
   gap: 6px;
   margin-bottom: 4px;
`;

const ComplianceIcon = styled.div<{ $compliant: boolean }>`
   color: ${props => props.$compliant ? settingsTheme.status.success : settingsTheme.status.error};
   font-size: 12px;
`;

const ComplianceText = styled.div`
   font-size: 12px;
   color: ${settingsTheme.text.secondary};
   font-weight: 500;
`;

const ComplianceCountry = styled.div`
   font-size: 11px;
   color: ${settingsTheme.text.muted};
   font-weight: 600;
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const StatusBadge = styled.div<{ $isActive: boolean }>`
   display: inline-flex;
   align-items: center;
   gap: 6px;
   padding: 6px 12px;
   border-radius: ${settingsTheme.radius.md};
   font-size: 12px;
   font-weight: 600;
   min-width: 90px;
   justify-content: center;

   ${({ $isActive }) => $isActive ? `
       background: ${settingsTheme.status.successLight};
       color: ${settingsTheme.status.success};
       border: 1px solid ${settingsTheme.status.success}30;
   ` : `
       background: ${settingsTheme.status.errorLight};
       color: ${settingsTheme.status.error};
       border: 1px solid ${settingsTheme.status.error}30;
   `}
`;

const DateInfo = styled.div`
   min-width: 140px;
`;

const DateValue = styled.div`
   font-weight: 500;
   color: ${settingsTheme.text.primary};
   font-size: 13px;
   margin-bottom: 2px;
`;

const VersionInfo = styled.div`
   font-size: 11px;
   color: ${settingsTheme.text.muted};
   font-weight: 600;
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const ActionsGroup = styled.div`
   display: flex;
   gap: ${settingsTheme.spacing.xs};
   align-items: center;
   min-width: 150px;
`;

const ActionButton = styled.button<{ $variant?: 'success' | 'danger' }>`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 32px;
   height: 32px;
   border: none;
   border-radius: ${settingsTheme.radius.sm};
   cursor: pointer;
   transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
   font-size: 13px;
   position: relative;
   overflow: hidden;

   ${({ $variant }) => {
    switch ($variant) {
        case 'success':
            return `
                   background: ${settingsTheme.status.successLight};
                   color: ${settingsTheme.status.success};
                   
                   &:hover:not(:disabled) {
                       background: ${settingsTheme.status.success};
                       color: white;
                       transform: translateY(-1px);
                       box-shadow: ${settingsTheme.shadow.md};
                   }
               `;
        case 'danger':
            return `
                   background: ${settingsTheme.status.errorLight};
                   color: ${settingsTheme.status.error};
                   
                   &:hover:not(:disabled) {
                       background: ${settingsTheme.status.error};
                       color: white;
                       transform: translateY(-1px);
                       box-shadow: ${settingsTheme.shadow.md};
                   }
               `;
        default:
            return `
                   background: ${settingsTheme.primaryGhost};
                   color: ${settingsTheme.primary};
                   
                   &:hover:not(:disabled) {
                       background: ${settingsTheme.primary};
                       color: white;
                       transform: translateY(-1px);
                       box-shadow: ${settingsTheme.shadow.md};
                   }
               `;
    }
}}

   &:disabled {
       opacity: 0.5;
       cursor: not-allowed;
       transform: none;
   }

   .spinning {
       animation: spin 1s linear infinite;
   }

   @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
   }
`;

// Modal Components
const ModalOverlay = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-color: rgba(0, 0, 0, 0.5);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: ${settingsTheme.zIndex.modal};
   padding: ${settingsTheme.spacing.lg};
   backdrop-filter: blur(4px);
   animation: fadeIn 0.2s ease;

   @keyframes fadeIn {
       from { opacity: 0; }
       to { opacity: 1; }
   }
`;

const ModalContainer = styled.div`
   background-color: ${settingsTheme.surface};
   border-radius: ${settingsTheme.radius.xl};
   box-shadow: ${settingsTheme.shadow.xl};
   width: 95vw;
   max-width: 500px;
   max-height: 95vh;
   display: flex;
   flex-direction: column;
   overflow: hidden;
   animation: slideUp 0.3s ease;

   @keyframes slideUp {
       from {
           opacity: 0;
           transform: translateY(20px) scale(0.95);
       }
       to {
           opacity: 1;
           transform: translateY(0) scale(1);
       }
   }

   @media (max-width: ${settingsTheme.breakpoints.md}) {
       width: 100vw;
       height: 100vh;
       max-height: 100vh;
       border-radius: 0;
   }
`;

const LargeModalContainer = styled(ModalContainer)`
   max-width: 900px;
   max-height: 90vh;
`;

const ModalHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.xl};
   border-bottom: 1px solid ${settingsTheme.border};
   background: ${settingsTheme.surfaceAlt};
   flex-shrink: 0;

   h2 {
       margin: 0;
       font-size: 20px;
       font-weight: 700;
       color: ${settingsTheme.text.primary};
       letter-spacing: -0.025em;
   }
`;

const CloseButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 40px;
   height: 40px;
   border: none;
   background: ${settingsTheme.surfaceHover};
   color: ${settingsTheme.text.secondary};
   border-radius: ${settingsTheme.radius.md};
   cursor: pointer;
   transition: all ${settingsTheme.transitions.normal};
   font-size: 18px;

   &:hover:not(:disabled) {
       background: ${settingsTheme.status.errorLight};
       color: ${settingsTheme.status.error};
       transform: scale(1.05);
   }

   &:active {
       transform: scale(0.95);
   }

   &:disabled {
       opacity: 0.5;
       cursor: not-allowed;
   }
`;

const ModalBody = styled.div`
   overflow-y: auto;
   flex: 1;
   padding: ${settingsTheme.spacing.xl};
   
   &::-webkit-scrollbar {
       width: 8px;
   }
   
   &::-webkit-scrollbar-track {
       background: ${settingsTheme.surfaceAlt};
   }
   
   &::-webkit-scrollbar-thumb {
       background: ${settingsTheme.border};
       border-radius: 4px;
   }
   
   &::-webkit-scrollbar-thumb:hover {
       background: ${settingsTheme.borderHover};
   }
`;

const FormGroup = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${settingsTheme.spacing.xs};
   margin-bottom: ${settingsTheme.spacing.lg};
`;

const Label = styled.label`
   font-weight: 600;
   font-size: 14px;
   color: ${settingsTheme.text.primary};
`;

const Input = styled.input`
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

   &:disabled {
       background: ${settingsTheme.surfaceAlt};
       opacity: 0.6;
       cursor: not-allowed;
   }
`;

const TextArea = styled.textarea`
   min-height: 80px;
   padding: ${settingsTheme.spacing.md};
   border: 2px solid ${settingsTheme.border};
   border-radius: ${settingsTheme.radius.md};
   font-size: 14px;
   font-weight: 500;
   background: ${settingsTheme.surface};
   color: ${settingsTheme.text.primary};
   resize: vertical;
   transition: all 0.2s ease;
   font-family: inherit;

   &:focus {
       outline: none;
       border-color: ${settingsTheme.primary};
       box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
   }

   &::placeholder {
       color: ${settingsTheme.text.muted};
       font-weight: 400;
   }

   &:disabled {
       background: ${settingsTheme.surfaceAlt};
       opacity: 0.6;
       cursor: not-allowed;
   }
`;

const FileUploadArea = styled.div`
   position: relative;
   border: 2px dashed ${settingsTheme.border};
   border-radius: ${settingsTheme.radius.lg};
   padding: ${settingsTheme.spacing.xl};
   text-align: center;
   transition: all 0.2s ease;
   cursor: pointer;

   &:hover {
       border-color: ${settingsTheme.primary};
       background: ${settingsTheme.primaryGhost};
   }
`;

const FileInput = styled.input`
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   opacity: 0;
   cursor: pointer;

   &:disabled {
       cursor: not-allowed;
   }
`;

const FileUploadContent = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: ${settingsTheme.spacing.sm};
   pointer-events: none;
`;

const FileUploadText = styled.div`
   font-size: 14px;
   font-weight: 600;
   color: ${settingsTheme.text.primary};
`;

const FileUploadHint = styled.div`
   font-size: 12px;
   color: ${settingsTheme.text.muted};
`;

const ModalActions = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${settingsTheme.spacing.sm};
   margin-top: ${settingsTheme.spacing.lg};
   padding-top: ${settingsTheme.spacing.lg};
   border-top: 1px solid ${settingsTheme.border};

   @media (max-width: 576px) {
       flex-direction: column;
   }
`;

// Instructions Modal Components
const InstructionsContent = styled.div`
   display: flex;
   flex-direction: column;
   height: 100%;
   overflow: hidden;
`;

const InstructionsTabs = styled.div`
   display: flex;
   border-bottom: 1px solid ${settingsTheme.border};
   background: ${settingsTheme.surfaceAlt};
   flex-shrink: 0;
`;

const InstructionsTab = styled.button<{ $active: boolean }>`
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.xs};
   padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
   border: none;
   background: ${props => props.$active ? settingsTheme.surface : 'transparent'};
   color: ${props => props.$active ? settingsTheme.primary : settingsTheme.text.secondary};
   font-weight: 600;
   font-size: 13px;
   cursor: pointer;
   transition: all 0.2s ease;
   border-bottom: 3px solid ${props => props.$active ? settingsTheme.primary : 'transparent'};
   white-space: nowrap;

   &:hover {
       background: ${props => props.$active ? settingsTheme.surface : settingsTheme.surfaceHover};
       color: ${props => props.$active ? settingsTheme.primary : settingsTheme.text.primary};
   }
`;

const InstructionsTabContent = styled.div`
   flex: 1;
   overflow-y: auto;
   padding: ${settingsTheme.spacing.xl};

   &::-webkit-scrollbar {
       width: 8px;
   }
   
   &::-webkit-scrollbar-track {
       background: ${settingsTheme.surfaceAlt};
   }
   
   &::-webkit-scrollbar-thumb {
       background: ${settingsTheme.border};
       border-radius: 4px;
   }
`;

const TabPanel = styled.div`
   animation: fadeIn 0.2s ease;

   @keyframes fadeIn {
       from { opacity: 0; transform: translateY(10px); }
       to { opacity: 1; transform: translateY(0); }
   }
`;

const SectionTitle = styled.h3`
   font-size: 18px;
   font-weight: 700;
   color: ${settingsTheme.text.primary};
   margin: 0 0 ${settingsTheme.spacing.md} 0;
   padding-bottom: ${settingsTheme.spacing.sm};
   border-bottom: 2px solid ${settingsTheme.surfaceAlt};
`;

const InstructionsList = styled.ul`
   list-style: none;
   padding: 0;
   margin: 0 0 ${settingsTheme.spacing.lg} 0;
`;

const InstructionItem = styled.li`
   padding: ${settingsTheme.spacing.sm} 0;
   border-bottom: 1px solid ${settingsTheme.borderLight};
   font-size: 14px;
   line-height: 1.5;
   color: ${settingsTheme.text.secondary};

   &:last-child {
       border-bottom: none;
   }

   strong {
       color: ${settingsTheme.text.primary};
       font-weight: 600;
   }
`;

const CodeBlock = styled.pre`
   background: ${settingsTheme.surfaceAlt};
   border: 1px solid ${settingsTheme.border};
   border-radius: ${settingsTheme.radius.md};
   padding: ${settingsTheme.spacing.md};
   font-size: 12px;
   font-family: 'Courier New', monospace;
   color: ${settingsTheme.text.primary};
   overflow-x: auto;
   margin: ${settingsTheme.spacing.md} 0;
   white-space: pre-wrap;
   word-wrap: break-word;

   &::-webkit-scrollbar {
       height: 6px;
   }
   
   &::-webkit-scrollbar-track {
       background: ${settingsTheme.surfaceAlt};
   }
   
   &::-webkit-scrollbar-thumb {
       background: ${settingsTheme.border};
       border-radius: 3px;
   }
`;

const WarningBox = styled.div`
   display: flex;
   gap: ${settingsTheme.spacing.sm};
   background: ${settingsTheme.status.warningLight};
   border: 1px solid ${settingsTheme.status.warning}30;
   border-radius: ${settingsTheme.radius.md};
   padding: ${settingsTheme.spacing.md};
   margin: ${settingsTheme.spacing.md} 0;
   font-size: 13px;
   color: ${settingsTheme.status.warning};

   svg {
       flex-shrink: 0;
       margin-top: 2px;
   }

   strong {
       font-weight: 700;
   }
`;

const InfoBox = styled.div`
   display: flex;
   gap: ${settingsTheme.spacing.sm};
   background: ${settingsTheme.primaryGhost};
   border: 1px solid ${settingsTheme.primary}30;
   border-radius: ${settingsTheme.radius.md};
   padding: ${settingsTheme.spacing.md};
   margin: ${settingsTheme.spacing.md} 0;
   font-size: 13px;
   color: ${settingsTheme.primary};

   svg {
       flex-shrink: 0;
       margin-top: 2px;
   }

   strong {
       font-weight: 700;
   }
`;

const VariableGroup = styled.div`
   margin-bottom: ${settingsTheme.spacing.lg};
`;

const VariableGroupTitle = styled.h4`
   font-size: 16px;
   font-weight: 600;
   color: ${settingsTheme.text.primary};
   margin: 0 0 ${settingsTheme.spacing.sm} 0;
   padding: ${settingsTheme.spacing.sm} 0;
   border-bottom: 1px solid ${settingsTheme.border};
`;

const VariablesList = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${settingsTheme.spacing.xs};
`;

const VariableItem = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   padding: ${settingsTheme.spacing.sm};
   background: ${settingsTheme.surface};
   border: 1px solid ${settingsTheme.border};
   border-radius: ${settingsTheme.radius.sm};
   gap: ${settingsTheme.spacing.md};

   @media (max-width: 768px) {
       flex-direction: column;
       gap: ${settingsTheme.spacing.xs};
   }
`;

const VariableCode = styled.code`
   background: ${settingsTheme.surfaceAlt};
   color: ${settingsTheme.primary};
   padding: 2px 6px;
   border-radius: ${settingsTheme.radius.sm};
   font-family: 'Courier New', monospace;
   font-size: 12px;
   font-weight: 600;
   white-space: nowrap;
   border: 1px solid ${settingsTheme.primary}20;
`;

const VariableDescription = styled.div`
   color: ${settingsTheme.text.secondary};
   font-size: 13px;
   flex: 1;
   text-align: right;

   @media (max-width: 768px) {
       text-align: left;
   }
`;

const RequirementGroup = styled.div`
   margin-bottom: ${settingsTheme.spacing.lg};
`;

const RequirementTitle = styled.h4`
   font-size: 16px;
   font-weight: 600;
   color: ${settingsTheme.text.primary};
   margin: 0 0 ${settingsTheme.spacing.sm} 0;
   display: flex;
   align-items: center;
   gap: ${settingsTheme.spacing.xs};
`;

const RequirementsList = styled.ul`
   list-style: none;
   padding: 0;
   margin: 0;
`;

const RequirementItem = styled.li`
   padding: ${settingsTheme.spacing.xs} 0;
   font-size: 14px;
   line-height: 1.5;
   color: ${settingsTheme.text.secondary};
   position: relative;
   padding-left: ${settingsTheme.spacing.md};

   &:before {
       content: '•';
       color: ${settingsTheme.primary};
       font-weight: bold;
       position: absolute;
       left: 0;
   }
`;

export default InvoiceTemplatesPage;