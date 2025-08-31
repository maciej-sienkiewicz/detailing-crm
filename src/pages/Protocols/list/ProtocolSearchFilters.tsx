export interface SearchCriteria {
    clientName?: string;
    licensePlate?: string;
    make?: string;
    model?: string;
    title?: string;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    serviceName?: string;
    price?: {
        min?: number;
        max?: number;
    };
    [key: string]: string | Date | null | { min?: number; max?: number; } | undefined;
};