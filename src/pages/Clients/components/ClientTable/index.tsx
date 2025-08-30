// src/pages/Clients/components/ClientTable/index.tsx - Uproszczony z użyciem rozszerzonego DataTable
import React from 'react';
import { FaUsers, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { DataTable, TableColumn, HeaderAction, SelectAllConfig } from '../../../../components/common/DataTable';
import { ClientExpanded } from '../../../../types';
import { ClientCellRenderer } from './ClientCellRenderer';
import { ClientCard } from './ClientCard';

interface ClientTableProps {
    clients: ClientExpanded[];
    selectedClientIds: string[];
    selectAll: boolean;
    showFilters: boolean;
    hasActiveFilters: boolean;
    onToggleSelection: (clientId: string) => void;
    onSelectClient: (client: ClientExpanded) => void;
    onEditClient: (client: ClientExpanded) => void;
    onDeleteClient: (clientId: string) => void;
    onShowVehicles: (clientId: string) => void;
    onAddContactAttempt: (client: ClientExpanded) => void;
    onSendSMS: (client: ClientExpanded) => void;
    onToggleSelectAll: () => void;
    onToggleFilters: () => void;
    filtersComponent?: React.ReactNode;
}

const defaultColumns: TableColumn[] = [
    { id: 'selection', label: '', width: '60px', sortable: false },
    { id: 'client', label: 'Klient', width: '200px', sortable: true },
    { id: 'contact', label: 'Kontakt', width: '320px', sortable: true },
    { id: 'company', label: 'Firma', width: '180px', sortable: true },
    { id: 'lastVisit', label: 'Ostatnia wizyta', width: '140px', sortable: true },
    { id: 'metrics', label: 'Wizyty / Pojazdy', width: '140px', sortable: true },
    { id: 'revenue', label: 'Przychody', width: '120px', sortable: true },
    { id: 'actions', label: 'Akcje', width: '320px', sortable: false },
];

const emptyStateConfig = {
    icon: FaUsers,
    title: 'Brak klientów',
    description: 'Nie znaleziono żadnych klientów w bazie danych',
    actionText: 'Kliknij "Nowy klient", aby utworzyć pierwszy wpis'
};

const storageKeys = {
    viewMode: 'client_view_mode',
    columnOrder: 'client_table_columns_order'
};

export const ClientTable: React.FC<ClientTableProps> = ({
                                                            clients,
                                                            selectedClientIds,
                                                            selectAll,
                                                            showFilters,
                                                            hasActiveFilters,
                                                            onToggleSelection,
                                                            onSelectClient,
                                                            onEditClient,
                                                            onDeleteClient,
                                                            onShowVehicles,
                                                            onAddContactAttempt,
                                                            onSendSMS,
                                                            onToggleSelectAll,
                                                            onToggleFilters,
                                                            filtersComponent
                                                        }) => {
    const renderCell = (client: ClientExpanded, columnId: string) => (
        <ClientCellRenderer
            client={client}
            columnId={columnId}
            selectedClientIds={selectedClientIds}
            onToggleSelection={onToggleSelection}
            onSelectClient={onSelectClient}
            onEditClient={onEditClient}
            onDeleteClient={onDeleteClient}
            onShowVehicles={onShowVehicles}
            onAddContactAttempt={onAddContactAttempt}
            onSendSMS={onSendSMS}
        />
    );

    const renderCard = (client: ClientExpanded) => (
        <ClientCard
            client={client}
            selectedClientIds={selectedClientIds}
            onToggleSelection={onToggleSelection}
            onSelectClient={onSelectClient}
            onEditClient={onEditClient}
            onDeleteClient={onDeleteClient}
            onShowVehicles={onShowVehicles}
            onAddContactAttempt={onAddContactAttempt}
            onSendSMS={onSendSMS}
        />
    );

    // Konfiguracja akcji w nagłówku
    const headerActions: HeaderAction[] = [
        {
            id: 'filters',
            label: 'Filtry',
            icon: FaFilter,
            onClick: onToggleFilters,
            variant: 'filter',
            active: showFilters,
            badge: hasActiveFilters
        }
    ];

    // Konfiguracja checkboxa "Zaznacz wszystkich"
    const selectAllConfig: SelectAllConfig = {
        selectedCount: selectedClientIds.length,
        totalCount: clients.length,
        selectAll: selectAll,
        onToggleSelectAll: onToggleSelectAll,
        label: `Zaznacz wszystkich (${clients.length})`
    };

    return (
        <DataTable
            data={clients}
            columns={defaultColumns}
            title="Lista klientów"
            emptyStateConfig={emptyStateConfig}
            onItemClick={onSelectClient}
            renderCell={renderCell}
            renderCard={renderCard}
            enableDragAndDrop={true}
            enableViewToggle={true}
            defaultViewMode="table"
            storageKeys={storageKeys}
            headerActions={headerActions}
            selectAllConfig={clients.length > 0 ? selectAllConfig : undefined}
            expandableContent={filtersComponent}
            expandableVisible={showFilters}
        />
    );
};