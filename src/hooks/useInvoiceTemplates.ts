import {useCallback, useEffect, useState} from 'react';
import {InvoiceTemplate, InvoiceTemplateFilters, TemplateUploadData} from '../types/invoiceTemplate';
import {invoiceTemplatesApi} from '../api/invoiceTemplatesApi';

export const useInvoiceTemplates = () => {
    const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<InvoiceTemplate[]>([]);
    const [filters, setFilters] = useState<InvoiceTemplateFilters>({
        searchQuery: '',
        sortField: 'updatedAt',
        sortDirection: 'desc'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isActivating, setIsActivating] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await invoiceTemplatesApi.getTemplates();
            setTemplates(response);
        } catch (error: any) {
            console.error('Error fetching templates:', error);
            setError('Nie udało się załadować szablonów faktur.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const uploadTemplate = async (uploadData: TemplateUploadData) => {
        try {
            setIsUploading(true);
            const response = await invoiceTemplatesApi.uploadTemplate(uploadData);
            setTemplates(prev => [...prev, response]);
            setError(null);
        } catch (error: any) {
            console.error('Error uploading template:', error);
            setError('Nie udało się przesłać szablonu. Sprawdź format pliku i spróbuj ponownie.');
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const activateTemplate = async (templateId: string) => {
        try {
            setIsActivating(templateId);
            await invoiceTemplatesApi.activateTemplate(templateId);
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

    const deleteTemplate = async (templateId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten szablon? Ta operacja jest nieodwracalna.')) {
            return;
        }

        try {
            setIsDeleting(templateId);
            await invoiceTemplatesApi.deleteTemplate(templateId);
            setTemplates(prev => prev.filter(template => template.id !== templateId));
            setError(null);
        } catch (error: any) {
            console.error('Error deleting template:', error);
            setError('Nie udało się usunąć szablonu.');
        } finally {
            setIsDeleting(null);
        }
    };

    const previewTemplate = async (template: InvoiceTemplate) => {
        try {
            setIsGeneratingPreview(template.id);
            const blob = await invoiceTemplatesApi.generatePreview(template.id);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (error: any) {
            console.error('Error generating preview:', error);
            setError('Nie udało się wygenerować podglądu szablonu.');
        } finally {
            setIsGeneratingPreview(null);
        }
    };

    const exportTemplate = async (template: InvoiceTemplate) => {
        try {
            const blob = await invoiceTemplatesApi.exportTemplate(template.id);
            const url = URL.createObjectURL(blob);
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

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    useEffect(() => {
        let filtered = [...templates];

        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(query) ||
                template.description?.toLowerCase().includes(query)
            );
        }

        if (filters.sortField && filters.sortDirection) {
            filtered.sort((a, b) => {
                let aValue: any, bValue: any;

// W funkcji sortowania zaktualizuj case dla createdAt:
                switch (filters.sortField) {
                    case 'name':
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                        break;
                    case 'isActive':
                        aValue = a.isActive;
                        bValue = b.isActive;
                        break;
                    case 'createdAt':
                        // Konwersja tablicy dat na Date object dla porównania
                        aValue = new Date(a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2], a.createdAt[3], a.createdAt[4], a.createdAt[5]);
                        bValue = new Date(b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2], b.createdAt[3], b.createdAt[4], b.createdAt[5]);
                        break;
                    case 'updatedAt':
                        aValue = new Date(a.updatedAt[0], a.updatedAt[1] - 1, a.updatedAt[2], a.updatedAt[3], a.updatedAt[4], a.updatedAt[5]);
                        bValue = new Date(b.updatedAt[0], b.updatedAt[1] - 1, b.updatedAt[2], b.updatedAt[3], b.updatedAt[4], b.updatedAt[5]);
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return filters.sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return filters.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredTemplates(filtered);
    }, [templates, filters]);

    return {
        templates: filteredTemplates,
        filters,
        setFilters,
        isLoading,
        isUploading,
        isActivating,
        isDeleting,
        isGeneratingPreview,
        error,
        setError,
        uploadTemplate,
        activateTemplate,
        deleteTemplate,
        previewTemplate,
        exportTemplate
    };
};