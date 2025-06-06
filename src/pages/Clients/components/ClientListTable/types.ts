// ClientListTable/types.ts
export interface TableColumn {
    id: string;
    label: string;
    width: string;
    sortable?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface ClientStatus {
    label: string;
    color: string;
}