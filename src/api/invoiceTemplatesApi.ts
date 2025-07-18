import { apiClientNew } from './apiClientNew';
import { InvoiceTemplate, TemplateUploadData } from '../types/invoiceTemplate';

class InvoiceTemplatesApi {
    private readonly baseEndpoint = '/invoice-templates';

    async getTemplates(): Promise<InvoiceTemplate[]> {
        return await apiClientNew.get<InvoiceTemplate[]>(this.baseEndpoint);
    }

    async uploadTemplate(uploadData: TemplateUploadData): Promise<InvoiceTemplate> {
        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('name', uploadData.name);
        if (uploadData.description) {
            formData.append('description', uploadData.description);
        }

        return await apiClientNew.postFormData<InvoiceTemplate>(
            this.baseEndpoint,
            formData
        );
    }

    async activateTemplate(templateId: string): Promise<void> {
        await apiClientNew.post(`${this.baseEndpoint}/${templateId}/activate`);
    }

    async deleteTemplate(templateId: string): Promise<void> {
        await apiClientNew.delete(`${this.baseEndpoint}/${templateId}`);
    }

    async generatePreview(templateId: string): Promise<Blob> {
        const response = await fetch(`${apiClientNew['baseUrl']}/invoice-templates/${templateId}/preview`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });

        if (!response.ok) throw new Error('Preview generation failed');
        return await response.blob();
    }

    async exportTemplate(templateId: string): Promise<Blob> {
        const response = await fetch(`${apiClientNew['baseUrl']}/invoice-templates/${templateId}/export`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });

        if (!response.ok) throw new Error('Export failed');
        return await response.blob();
    }
}

export const invoiceTemplatesApi = new InvoiceTemplatesApi();