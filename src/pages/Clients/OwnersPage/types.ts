import { ClientExpanded } from '../../../types';

export interface OwnersPageContentProps {
    onSetRef?: (ref: {
        handleAddClient?: () => void;
        handleExportClients?: () => void;
        handleOpenBulkSmsModal?: () => void;
        selectedClientIds?: string[];
        openClientDetail?: (clientId: string) => void;
    }) => void;
    initialClientId?: string;
    onNavigateToVehiclesByOwner?: (ownerId: string) => void;
    onClearDetailParams?: () => void;
    onClientSelected?: (clientId: string) => void;
    onClientClosed?: () => void;
}

export interface OwnersPageRef {
    handleAddClient: () => void;
    handleExportClients: () => void;
    handleOpenBulkSmsModal: () => void;
    selectedClientIds: string[];
    openClientDetail: (clientId: string) => void;
}

export interface ClientFilters {
    name: string;
    email: string;
    phone: string;
    minVisits: string;
    minVehicles: string;
    minRevenue: string;
}

export interface ClientStats {
    totalClients: number;
    vipClients: number;
    totalRevenue: number;
    averageRevenue: number;
}

export interface OwnersPageState {
    clients: ClientExpanded[];
    loading: boolean;
    currentPage: number;
    totalItems: number;
    totalPages: number;
    showFilters: boolean;
    showAddModal: boolean;
    showContactModal: boolean;
    selectedClient: ClientExpanded | null;
    showDetailDrawer: boolean;
    showDeleteConfirm: boolean;
    manuallyClosedDrawer: boolean;
    selectedClientIds: string[];
    showBulkSmsModal: boolean;
    bulkSmsText: string;
    selectAll: boolean;
    filters: ClientFilters;
    appliedFilters: ClientFilters;
    stats: ClientStats;
}