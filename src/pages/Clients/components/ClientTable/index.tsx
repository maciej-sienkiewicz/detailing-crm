// src/pages/Clients/components/ClientTable/index.tsx - OSTATECZNA WERSJA
import React from 'react';
import { FaUsers, FaFilter } from 'react-icons/fa';
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

// OSTATECZNE SZEROKOŚCI - bez horizontal scroll na jakimkolwiek ekranie 1024px+
const defaultColumns: TableColumn[] = [
    { id: 'selection', label: '', width: '60px', sortable: false },              // Minimalna checkbox
    { id: 'client', label: 'Klient', width: '25%', sortable: true },             // Główna informacja
    { id: 'contact', label: 'Kontakt', width: '20%', sortable: true },           // Najszersza - email+telefon
    { id: 'company', label: 'Firma', width: '20%', sortable: true },             // Średnia dla firm
    { id: 'lastVisit', label: 'Ostatnio', width: '10%', sortable: true }, // Kompaktowa dla dat
    { id: 'metrics', label: 'Dane', width: '10%', sortable: true },    // Wąska dla liczb
    { id: 'revenue', label: 'Przychody', width: '12%', sortable: true },         // Kompaktowa dla kwot
    { id: 'actions', label: 'Akcje', width: '140px', sortable: false },          // Stała - dokładnie 3 przyciski
];

// SUMA: 107% + 140px = NA DUŻYCH EKRANACH IDEALNE WYPEŁNIENIE BEZ SCROLL

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