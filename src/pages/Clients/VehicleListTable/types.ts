export interface TableColumn {
    id: string;
    label: string;
    width: string;
    sortable?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface VehicleStatus {
    label: string;
    color: string;
}