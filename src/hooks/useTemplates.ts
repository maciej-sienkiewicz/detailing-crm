// src/hooks/useTemplates.ts
import { useCallback, useEffect, useState } from 'react';
import { Template, TemplateType, TemplateFilters, TemplateUploadData, TemplateUpdateData, TemplateSortField, TEMPLATE_TYPE_DISPLAY_NAMES } from '../types/template';
import { templatesApi } from '../api/templatesApi';

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

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const filterParams = {
                type: filters.selectedType,
                isActive: filters.selectedStatus === null ? undefined : filters.selectedStatus,
                sortBy: filters.sortField,
                sortDirection: filters.sortDirection || undefined
            };

            const response = await templatesApi.getTemplates(filterParams);
            console.log("dupa2")

            const parseDateArray = (dateArray?: number[]): string => {
                if (!dateArray || dateArray.length < 6) {
                    return new Date().toISOString(); // Zwróć aktualną datę jako fallback
                }
                // Miesiące w JS Date są 0-indeksowane (0=Styczeń, 1=Luty...), więc odejmujemy 1
                return new Date(
                    dateArray[0], dateArray[1] - 1, dateArray[2],
                    dateArray[3], dateArray[4], dateArray[5]
                ).toISOString();
            };

            const mappedTemplates = response.data.map(item => ({
                id: item.id,
                name: item.name,
                type: {
                    type: item.type,
                    displayName: TEMPLATE_TYPE_DISPLAY_NAMES[item.type] || item.type
                },
                isActive: item.isActive,
                size: item.size,
                contentType: item.contentType,
                // Użyj funkcji pomocniczej do konwersji dat
                createdAt: parseDateArray(item.createdAt as any),
                updatedAt: parseDateArray(item.updatedAt as any)
            }));

            setTemplates(mappedTemplates);
            setTotalCount(response.totalElements);
        } catch (error: any) {
            console.error('Error fetching templates:', error);
            setError('Nie udało się załadować szablonów.');
        } finally {
            setIsLoading(false);
        }
    }, [filters.selectedType, filters.selectedStatus, filters.sortField, filters.sortDirection, templateTypes]);

    const fetchTemplateTypes = useCallback(async () => {
        try {
            const types = await templatesApi.getTemplateTypes();
            const typesWithDisplayNames = types.map(type => ({
                ...type,
                displayName: TEMPLATE_TYPE_DISPLAY_NAMES[type.type] || type.type
            }));
            setTemplateTypes(typesWithDisplayNames);
        } catch (error) {
            console.error('Error fetching template types:', error);
        }
    }, []);

    const uploadTemplate = async (uploadData: TemplateUploadData) => {
        try {
            setIsUploading(true);
            setError(null);

            const response = await templatesApi.uploadTemplate(uploadData);

            const newTemplate: Template = {
                id: response.id,
                name: response.name,
                type: {
                    type: response.type,
                    displayName: TEMPLATE_TYPE_DISPLAY_NAMES[response.type] || response.type
                },
                isActive: response.isActive,
                size: response.size,
                contentType: response.contentType,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt
            };

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
                    ? {
                        ...template,
                        name: response.name,
                        isActive: response.isActive,
                        updatedAt: response.updatedAt
                    }
                    : template
            ));
        } catch (error: any) {
            console.error('Error updating template:', error);
            setError('Nie udało się zaktualizować szablonu.');
        } finally {
            setIsUpdating(null);
        }
    };

    const deleteTemplate = async (templateId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten szablon? Ta operacja jest nieodwracalna.')) {
            return;
        }

        try {
            setIsDeleting(templateId);
            setError(null);

            await templatesApi.deleteTemplate(templateId);

            setTemplates(prev => prev.filter(template => template.id !== templateId));
            setTotalCount(prev => prev - 1);
        } catch (error: any) {
            console.error('Error deleting template:', error);
            setError('Nie udało się usunąć szablonu.');
        } finally {
            setIsDeleting(null);
        }
    };

    const downloadTemplate = async (template: Template) => {
        try {
            setIsDownloading(template.id);

            const blob = await templatesApi.downloadTemplate(template.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = `${template.name}.${template.contentType === 'application/pdf' ? 'pdf' : 'html'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
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

            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (error: any) {
            console.error('Error previewing template:', error);
            setError('Nie udało się wygenerować podglądu szablonu.');
        } finally {
            setIsPreviewing(null);
        }
    };

    const handleSort = (field: TemplateSortField) => {
        if (filters.sortField === field) {
            const newDirection =
                filters.sortDirection === 'asc' ? 'desc' :
                    filters.sortDirection === 'desc' ? null : 'asc';
            setFilters({ ...filters, sortDirection: newDirection, sortField: newDirection ? field : 'updatedAt' });
        } else {
            setFilters({ ...filters, sortField: field, sortDirection: 'asc' });
        }
    };

    useEffect(() => {
        fetchTemplateTypes();
    }, [fetchTemplateTypes]);

    useEffect(() => {
        if (templateTypes.length > 0) {
            fetchTemplates();
        }
    }, [fetchTemplates, templateTypes]);

    useEffect(() => {
        let filtered = [...templates];

        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(query) ||
                (template.type.displayName && template.type.displayName.toLowerCase().includes(query))
            );
        }

        if (filters.selectedType) {
            filtered = filtered.filter(template => template.type.type === filters.selectedType);
        }

        if (filters.selectedStatus !== null) {
            filtered = filtered.filter(template => template.isActive === filters.selectedStatus);
        }

        setFilteredTemplates(filtered);
    }, [templates, filters.searchQuery, filters.selectedType, filters.selectedStatus]);

    const stats = {
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
        refetch: fetchTemplates
    };
};