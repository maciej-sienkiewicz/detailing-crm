// src/components/common/DataTable/types.ts
export interface TableColumn {
    id: string;
    label: string;
    width: string;
    sortable?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export type ViewMode = 'table' | 'cards';

export interface BaseDataItem {
    id: string;
    [key: string]: any;
}

export interface DataTableProps<T extends BaseDataItem> {
    data: T[];
    columns: TableColumn[];
    title: string;
    emptyStateConfig: EmptyStateConfig;
    onItemClick?: (item: T) => void;
    onItemAction?: (action: string, item: T, e: React.MouseEvent) => void;
    renderCell: (item: T, columnId: string) => React.ReactNode;
    renderCard?: (item: T) => React.ReactNode;
    enableDragAndDrop?: boolean;
    enableViewToggle?: boolean;
    defaultViewMode?: ViewMode;
    storageKeys?: {
        viewMode: string;
        columnOrder: string;
    };
}

export interface EmptyStateConfig {
    icon: React.ComponentType;
    title: string;
    description: string;
    actionText: string;
}

export interface TableHeaderProps {
    columns: TableColumn[];
    sortColumn: string | null;
    sortDirection: SortDirection;
    onSort?: (columnId: string) => void;
    onMoveColumn?: (dragIndex: number, hoverIndex: number) => void;
    enableDragAndDrop?: boolean;
}

export interface TableBodyProps<T extends BaseDataItem> {
    data: T[];
    columns: TableColumn[];
    renderCell: (item: T, columnId: string) => React.ReactNode;
    onItemClick?: (item: T) => void;
}

export interface CardsViewProps<T extends BaseDataItem> {
    data: T[];
    renderCard: (item: T) => React.ReactNode;
    onItemClick?: (item: T) => void;
}