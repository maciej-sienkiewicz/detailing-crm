// src/api/templatesApi.ts
import { apiClientNew } from './apiClientNew';

export interface TemplateResponse {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    size: number;
    contentType: string;
    createdAt: string;
    updatedAt: string;
}

export interface TemplateTypeResponse {
    type: string;
    displayName: string;
}

export interface UploadTemplateRequest {
    file: File;
    name: string;
    type: string;
    isActive?: boolean;
}

export interface UpdateTemplateRequest {
    name: string;
    isActive: boolean;
}

export interface TemplateDownloadResponse {
    resource: Blob;
    contentType: string;
    originalName: string;
}

export interface TemplateFilters {
    type?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
}

export const templatesApi = {
    async getTemplates(filters: TemplateFilters = {}): Promise<{ data: TemplateResponse[], totalElements: number }> {
        const apiParams = {
            page: filters.page,
            size: filters.size,
            type: filters.type,
            isActive: filters.isActive,
            sortBy: filters.sortBy,
            sortDirection: filters.sortDirection
        };

        // Popraw oczekiwany typ na zgodny z odpowiedzią (po konwersji na camelCase)
        const response = await apiClientNew.get<{ data: TemplateResponse[], totalItems: number }>(
            '/v1/templates',
            apiParams
        );

        console.log("dupa")

        return {
            // Użyj poprawnych pól: response.data i response.totalItems
            data: response.data || [],
            totalElements: response.totalItems || 0
        };
    },

    async getTemplateTypes(): Promise<TemplateTypeResponse[]> {
        return await apiClientNew.get<TemplateTypeResponse[]>('/v1/templates/types');
    },

    async uploadTemplate(request: UploadTemplateRequest): Promise<TemplateResponse> {
        const formData = new FormData();
        formData.append('file', request.file);
        formData.append('name', request.name);
        formData.append('type', request.type);

        if (request.isActive !== undefined) {
            formData.append('is_active', request.isActive.toString());
        }

        return await apiClientNew.post<TemplateResponse>('/v1/templates', formData);
    },

    async updateTemplate(templateId: string, request: UpdateTemplateRequest): Promise<TemplateResponse> {
        return await apiClientNew.put<TemplateResponse>(`/v1/templates/${templateId}`, request);
    },

    async deleteTemplate(templateId: string): Promise<void> {
        await apiClientNew.delete(`/v1/templates/${templateId}`);
    },

    async downloadTemplate(templateId: string): Promise<Blob> {
        const response = await fetch(`${apiClientNew['baseUrl']}/v1/templates/${templateId}/download`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to download template: ${response.status}`);
        }

        return await response.blob();
    },

    async previewTemplate(templateId: string): Promise<Blob> {
        const response = await fetch(`${apiClientNew['baseUrl']}/v1/templates/${templateId}/preview`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to preview template: ${response.status}`);
        }

        return await response.blob();
    }
};