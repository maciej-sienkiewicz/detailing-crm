export interface InvoiceTemplate {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: number[]; // Format z serwera: [year, month, day, hour, minute, second, nanosecond]
    updatedAt: number[];
}

export interface TemplateUploadData {
    file: File;
    name: string;
    description?: string;
}

export type SortField = 'name' | 'templateType' | 'isActive' | 'updatedAt' | 'createdAt';
export type SortDirection = 'asc' | 'desc' | null;

export interface InvoiceTemplateFilters {
    searchQuery: string;
    sortField: SortField;
    sortDirection: SortDirection;
}