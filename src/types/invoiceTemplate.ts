export interface InvoiceTemplate {
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