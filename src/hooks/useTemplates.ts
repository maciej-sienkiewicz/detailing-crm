// src/hooks/useTemplates.ts - KOMPLETNA NAPRAWKA
import { useCallback, useEffect, useState } from 'react';
import { Template, TemplateType, TemplateFilters, TemplateUploadData, TemplateUpdateData, TemplateSortField, TEMPLATE_TYPE_DISPLAY_NAMES } from '../types/template';
import { templatesApi, TemplateResponse, TemplateTypeResponse } from '../api/templatesApi';

interface UseTemplatesStats {
    total: number;
    active: number;
    byType: Record<string, number>;
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

    // 🔧 FIX: Pomocnicza funkcja do konwersji dat
    const parseDateFromBackend = (dateValue: any): string => {
        try {
            // Jeśli to już jest string w formacie ISO, zwróć go
            if (typeof dateValue === 'string') {
                return dateValue;
            }

            // Jeśli to tablica liczb [2024, 12, 15, 10, 30, 45]
            if (Array.isArray(dateValue) && dateValue.length >= 6) {
                // Miesiące w JS Date są 0-indeksowane, więc odejmujemy 1
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

            // Fallback - aktualna data
            console.warn('Unknown date format, using current date:', dateValue);
            return new Date().toISOString();
        } catch (error) {
            console.error('Error parsing date:', dateValue, error);
            return new Date().toISOString();
        }
    };

    // 🔧 FIX: Konwertuj response z API do Template
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

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🔄 Fetching templates with filters:', filters);

            const filterParams = {
                type: filters.selectedType,
                isActive: filters.selectedStatus === null ? undefined : filters.selectedStatus,
                sortBy: filters.sortField,
                sortDirection: filters.sortDirection || undefined,
                page: 0,
                size: 1000 // Pobierz wszystkie dla client-side filtering
            };

            const response = await templatesApi.getTemplates(filterParams);
            console.log('✅ Templates API response:', response);

            // 🔧 FIX: Konwertuj wszystkie szablony
            const convertedTemplates = response.data.map(convertApiResponseToTemplate);

            setTemplates(convertedTemplates);
            setTotalCount(response.totalElements);

        } catch (error: any) {
            console.error('❌ Error fetching templates:', error);
            setError('Nie udało się załadować szablonów.');
            setTemplates([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [filters.selectedType, filters.selectedStatus, filters.sortField, filters.sortDirection, convertApiResponseToTemplate]);

    const fetchTemplateTypes = useCallback(async () => {
        try {
            console.log('🔄 Fetching template types...');
            const apiTypes = await templatesApi.getTemplateTypes();

            // 🔧 FIX: Konwertuj API response do TemplateType
            const convertedTypes: TemplateType[] = apiTypes.map(apiType => ({
                type: apiType.type,
                displayName: apiType.displayName || TEMPLATE_TYPE_DISPLAY_NAMES[apiType.type] || apiType.type
            }));

            setTemplateTypes(convertedTypes);
            console.log('✅ Template types fetched:', convertedTypes);
        } catch (error) {
            console.error('❌ Error fetching template types:', error);
            // Nie pokazuj błędu - typy szablonów nie są krytyczne
        }
    }, []);

    const uploadTemplate = async (uploadData: TemplateUploadData) => {
        try {
            setIsUploading(true);
            setError(null);

            console.log('🔄 Uploading template:', uploadData);

            const response = await templatesApi.uploadTemplate({
                file: uploadData.file,
                name: uploadData.name,
                type: uploadData.type,
                isActive: uploadData.isActive
            });

            console.log('✅ Template uploaded, response:', response);

            // 🔧 FIX: Konwertuj response do Template
            const newTemplate = convertApiResponseToTemplate(response);

            // Dodaj nowy szablon na początek listy
            setTemplates(prev => [newTemplate, ...prev]);
            setTotalCount(prev => prev + 1);

            console.log('✅ Template added to state:', newTemplate);

        } catch (error: any) {
            console.error('❌ Error uploading template:', error);
            setError('Nie udało się przesłać szablonu. Sprawdź format pliku i spróbuj ponownie.');
            throw error; // Re-throw żeby komponent mógł obsłużyć błąd
        } finally {
            setIsUploading(false);
        }
    };

    const updateTemplate = async (templateId: string, updateData: TemplateUpdateData) => {
        try {
            setIsUpdating(templateId);
            setError(null);

            console.log('🔄 Updating template:', templateId, updateData);

            const response = await templatesApi.updateTemplate(templateId, updateData);
            console.log('✅ Template updated, response:', response);

            // 🔧 FIX: Zaktualizuj szablon w state
            setTemplates(prev => prev.map(template =>
                template.id === templateId
                    ? convertApiResponseToTemplate(response)
                    : template
            ));

        } catch (error: any) {
            console.error('❌ Error updating template:', error);
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

            console.log('🔄 Deleting template:', templateId);

            await templatesApi.deleteTemplate(templateId);
            console.log('✅ Template deleted successfully');

            // Usuń szablon ze state
            setTemplates(prev => prev.filter(template => template.id !== templateId));
            setTotalCount(prev => prev - 1);

        } catch (error: any) {
            console.error('❌ Error deleting template:', error);
            setError('Nie udało się usunąć szablonu.');
        } finally {
            setIsDeleting(null);
        }
    };

    const downloadTemplate = async (template: Template) => {
        try {
            setIsDownloading(template.id);
            console.log('📥 Downloading template:', template.name);

            const blob = await templatesApi.downloadTemplate(template.id);

            // Stwórz link do pobrania
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // 🔧 FIX: Poprawne rozszerzenie pliku na podstawie content type
            const extension = template.contentType === 'application/pdf' ? 'pdf' :
                template.contentType === 'text/html' ? 'html' : 'file';
            link.download = `${template.name}.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('✅ Template downloaded successfully');

        } catch (error: any) {
            console.error('❌ Error downloading template:', error);
            setError('Nie udało się pobrać szablonu.');
        } finally {
            setIsDownloading(null);
        }
    };

    const previewTemplate = async (template: Template) => {
        try {
            setIsPreviewing(template.id);
            console.log('👁️ Previewing template:', template.name);

            const blob = await templatesApi.previewTemplate(template.id);
            const url = URL.createObjectURL(blob);

            // Otwórz w nowej karcie
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                throw new Error('Popup został zablokowany. Zezwól na wyskakujące okna dla tej strony.');
            }

            // Zwolnij URL po pewnym czasie
            setTimeout(() => URL.revokeObjectURL(url), 10000);

            console.log('✅ Template preview opened successfully');

        } catch (error: any) {
            console.error('❌ Error previewing template:', error);
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

    // Effect do ładowania typów szablonów
    useEffect(() => {
        fetchTemplateTypes();
    }, [fetchTemplateTypes]);

    // Effect do ładowania szablonów (uruchom po załadowaniu typów)
    useEffect(() => {
        if (templateTypes.length > 0) {
            fetchTemplates();
        }
    }, [fetchTemplates, templateTypes.length]);

    // Effect do client-side filtrowania
    useEffect(() => {
        let filtered = [...templates];

        // Filtruj po zapytaniu tekstowym
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(query) ||
                template.type.type.toLowerCase().includes(query) ||
                (template.type.displayName && template.type.displayName.toLowerCase().includes(query))
            );
        }

        // Filtruj po typie (tylko jeśli nie jest już filtrowane server-side)
        if (filters.selectedType && !filters.selectedType) {
            filtered = filtered.filter(template => template.type.type === filters.selectedType);
        }

        // Filtruj po statusie (tylko jeśli nie jest już filtrowane server-side)
        if (filters.selectedStatus !== null && filters.selectedStatus === null) {
            filtered = filtered.filter(template => template.isActive === filters.selectedStatus);
        }

        setFilteredTemplates(filtered);
    }, [templates, filters.searchQuery]);

    // Oblicz statystyki
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
        refreshTemplates: fetchTemplates
    };
};