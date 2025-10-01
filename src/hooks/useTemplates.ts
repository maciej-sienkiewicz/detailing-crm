// src/hooks/useTemplates.ts - POPRAWIONA WERSJA Z MODALEM
import { useCallback, useEffect, useState } from 'react';
import { Template, TemplateType, TemplateFilters, TemplateUploadData, TemplateUpdateData, TemplateSortField, TEMPLATE_TYPE_DISPLAY_NAMES } from '../types/template';
import { templatesApi, TemplateResponse, TemplateTypeResponse } from '../api/templatesApi';

interface UseTemplatesStats {
    total: number;
    active: number;
    byType: Record<string, number>;
}

// NOWY: Interface dla modalu potwierdzenia
interface ConfirmationState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
}

export const useTemplates = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [templateTypes, setTemplateTypes] = useState<TemplateType[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [filters, setFilters] = useState<TemplateFilters>({
        searchQuery: '',
        selectedType: undefined,
        selectedStatus: null,
        sortField: 'updatedAt',
        sortDirection: 'desc'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    // NOWY: Stan dla modalu potwierdzenia
    const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Tak',
        cancelText: 'Anuluj',
        onConfirm: () => {}
    });

    // Pomocnicza funkcja do konwersji dat
    const parseDateFromBackend = (dateValue: any): string => {
        try {
            if (typeof dateValue === 'string') {
                return dateValue;
            }

            if (Array.isArray(dateValue) && dateValue.length >= 6) {
                const date = new Date(
                    dateValue[0],      // rok
                    dateValue[1] - 1,  // miesiąc (0-11)
                    dateValue[2],      // dzień
                    dateValue[3] || 0, // godzina
                    dateValue[4] || 0, // minuta
                    dateValue[5] || 0  // sekunda
                );
                return date.toISOString();
            }

            console.warn('Unknown date format, using current date:', dateValue);
            return new Date().toISOString();
        } catch (error) {
            console.error('Error parsing date:', dateValue, error);
            return new Date().toISOString();
        }
    };

    // Konwertuj response z API do Template
    const convertApiResponseToTemplate = useCallback((apiResponse: TemplateResponse): Template => {
        return {
            id: apiResponse.id,
            name: apiResponse.name,
            type: {
                type: apiResponse.type,
                displayName: TEMPLATE_TYPE_DISPLAY_NAMES[apiResponse.type] || apiResponse.type
            },
            isActive: apiResponse.isActive,
            size: apiResponse.size,
            contentType: apiResponse.contentType,
            createdAt: parseDateFromBackend(apiResponse.createdAt),
            updatedAt: parseDateFromBackend(apiResponse.updatedAt)
        };
    }, []);

    // NOWY: Funkcje do obsługi modalu potwierdzenia
    const showConfirmation = useCallback((config: Omit<ConfirmationState, 'isOpen'>) => {
        setConfirmationState({
            ...config,
            isOpen: true
        });
    }, []);

    const hideConfirmation = useCallback(() => {
        setConfirmationState(prev => ({
            ...prev,
            isOpen: false
        }));
    }, []);

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const filterParams = {
                type: filters.selectedType,
                isActive: filters.selectedStatus === null ? undefined : filters.selectedStatus,
                sortBy: filters.sortField,
                sortDirection: filters.sortDirection || undefined,
                page: 0,
                size: 1000
            };

            const response = await templatesApi.getTemplates(filterParams);

            const convertedTemplates = response.data.map(convertApiResponseToTemplate);

            setTemplates(convertedTemplates);
            setTotalCount(response.totalElements);

        } catch (error: any) {
            console.error('Error fetching templates:', error);
            setError('Nie udało się załadować szablonów.');
            setTemplates([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [filters.selectedType, filters.selectedStatus, filters.sortField, filters.sortDirection, convertApiResponseToTemplate]);

    const fetchTemplateTypes = useCallback(async () => {
        try {
            const apiTypes = await templatesApi.getTemplateTypes();

            const convertedTypes: TemplateType[] = apiTypes.map(apiType => ({
                type: apiType.type,
                displayName: apiType.displayName || TEMPLATE_TYPE_DISPLAY_NAMES[apiType.type] || apiType.type
            }));

            setTemplateTypes(convertedTypes);
        } catch (error) {
            console.error('Error fetching template types:', error);
        }
    }, []);

    const uploadTemplate = async (uploadData: TemplateUploadData) => {
        try {
            setIsUploading(true);
            setError(null);

            const response = await templatesApi.uploadTemplate({
                file: uploadData.file,
                name: uploadData.name,
                type: uploadData.type,
                isActive: uploadData.isActive
            });

            const newTemplate = convertApiResponseToTemplate(response);
            setTemplates(prev => [newTemplate, ...prev]);
            setTotalCount(prev => prev + 1);

        } catch (error: any) {
            console.error('Error uploading template:', error);
            setError('Nie udało się przesłać szablonu. Sprawdź format pliku i spróbuj ponownie.');
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const updateTemplate = async (templateId: string, updateData: TemplateUpdateData) => {
        try {
            setIsUpdating(templateId);
            setError(null);

            const response = await templatesApi.updateTemplate(templateId, updateData);

            setTemplates(prev => prev.map(template =>
                template.id === templateId
                    ? convertApiResponseToTemplate(response)
                    : template
            ));

        } catch (error: any) {
            console.error('Error updating template:', error);
            setError('Nie udało się zaktualizować szablonu.');
        } finally {
            setIsUpdating(null);
        }
    };

    // POPRAWIONA: Funkcja usuwania z modalem potwierdzenia
    const deleteTemplate = async (templateId: string, templateName: string) => {
        const performDelete = async () => {
            try {
                setIsDeleting(templateId);
                setError(null);

                await templatesApi.deleteTemplate(templateId);

                setTemplates(prev => prev.filter(template => template.id !== templateId));
                setTotalCount(prev => prev - 1);

                hideConfirmation();

            } catch (error: any) {
                console.error('Error deleting template:', error);
                setError('Nie udało się usunąć szablonu.');
            } finally {
                setIsDeleting(null);
            }
        };

        // Pokaż modal potwierdzenia
        showConfirmation({
            title: 'Usuwanie szablonu',
            message: `Czy na pewno chcesz usunąć szablon "${templateName}"? Ta operacja jest nieodwracalna.`,
            confirmText: 'Usuń',
            cancelText: 'Anuluj',
            onConfirm: performDelete
        });
    };

    const downloadTemplate = async (template: Template) => {
        try {
            setIsDownloading(template.id);

            const blob = await templatesApi.downloadTemplate(template.id);

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const extension = template.contentType === 'application/pdf' ? 'pdf' :
                template.contentType === 'text/html' ? 'html' : 'file';
            link.download = `${template.name}.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error('Error downloading template:', error);
            setError('Nie udało się pobrać szablonu.');
        } finally {
            setIsDownloading(null);
        }
    };

    const previewTemplate = async (template: Template) => {
        try {
            setIsPreviewing(template.id);

            const blob = await templatesApi.previewTemplate(template.id);
            const url = URL.createObjectURL(blob);

            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                throw new Error('Popup został zablokowany. Zezwól na wyskakujące okna dla tej strony.');
            }

            setTimeout(() => URL.revokeObjectURL(url), 10000);

        } catch (error: any) {
            console.error('Error previewing template:', error);
            setError('Nie udało się otworzyć podglądu szablonu.');
        } finally {
            setIsPreviewing(null);
        }
    };

    const handleSort = (field: TemplateSortField) => {
        setFilters(currentFilters => {
            if (currentFilters.sortField === field) {
                const newDirection =
                    currentFilters.sortDirection === 'asc' ? 'desc' :
                        currentFilters.sortDirection === 'desc' ? null : 'asc';

                return {
                    ...currentFilters,
                    sortDirection: newDirection,
                    sortField: newDirection ? field : 'updatedAt'
                };
            } else {
                return { ...currentFilters, sortField: field, sortDirection: 'asc' };
            }
        });
    };

    // Effects
    useEffect(() => {
        fetchTemplateTypes();
    }, [fetchTemplateTypes]);

    useEffect(() => {
        if (templateTypes.length > 0) {
            fetchTemplates();
        }
    }, [fetchTemplates, templateTypes.length]);

    useEffect(() => {
        let filtered = [...templates];

        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(query) ||
                template.type.type.toLowerCase().includes(query) ||
                (template.type.displayName && template.type.displayName.toLowerCase().includes(query))
            );
        }

        if (filters.selectedType && !filters.selectedType) {
            filtered = filtered.filter(template => template.type.type === filters.selectedType);
        }

        if (filters.selectedStatus !== null && filters.selectedStatus === null) {
            filtered = filtered.filter(template => template.isActive === filters.selectedStatus);
        }

        setFilteredTemplates(filtered);
    }, [templates, filters.searchQuery]);

    // Statystyki
    const stats: UseTemplatesStats = {
        total: templates.length,
        active: templates.filter(t => t.isActive).length,
        byType: templates.reduce((acc, template) => {
            const displayName = template.type.displayName || template.type.type;
            acc[displayName] = (acc[displayName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    };

    return {
        templates: filteredTemplates,
        templateTypes,
        filters,
        setFilters,
        stats,
        totalCount,
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
        refreshTemplates: fetchTemplates,
        confirmationState,
        hideConfirmation
    };
};