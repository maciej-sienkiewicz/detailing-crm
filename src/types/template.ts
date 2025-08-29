// src/types/template.ts
export interface Template {
    id: string;
    name: string;
    type: TemplateType;
    isActive: boolean;
    size: number;
    contentType: string;
    createdAt: string;
    updatedAt: string;
}

export interface TemplateType {
    type: string;
    displayName?: string;
}

export interface TemplateUploadData {
    file: File;
    name: string;
    type: string;
    isActive?: boolean;
}

export interface TemplateUpdateData {
    name: string;
    isActive: boolean;
}

export type TemplateSortField = 'name' | 'type' | 'isActive' | 'updatedAt' | 'createdAt' | 'size';
export type SortDirection = 'asc' | 'desc' | null;

export interface TemplateFilters {
    searchQuery: string;
    selectedType?: string;
    selectedStatus?: boolean | null;
    sortField: TemplateSortField;
    sortDirection: SortDirection;
}

export interface TemplateStats {
    total: number;
    active: number;
    byType: Record<string, number>;
}

export const TEMPLATE_CONTENT_TYPES = {
    PDF: 'application/pdf',
    HTML: 'text/html'
} as const;

export const TEMPLATE_TYPE_DISPLAY_NAMES: Record<string, string> = {
    'SERVICE_AGREEMENT': 'Protokół przyjęcia pojazdu',
    'MARKETING_CONSENT': 'Zgoda marketingowa',
    'VEHICLE_PICKUP': 'Wydanie pojazdu',
    'MAIL_ON_VISIT_STARTED': 'Mail przy rozpoczęciu wizyty',
    'MAIL_ON_VISIT_COMPLETED': 'Mail po zakończeniu wizyty',
    'INVOICE': 'Faktura'
};