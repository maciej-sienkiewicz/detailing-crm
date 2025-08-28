// src/pages/Clients/components/ClientTable/index.tsx
import React from 'react';
import { FaUsers } from 'react-icons/fa';
import { DataTable, TableColumn, BaseDataItem } from '../../../../components/common/DataTable';
import { ClientExpanded } from '../../../../types';
import { ClientCellRenderer } from './ClientCellRenderer';
import { ClientCard } from './ClientCard';

interface ClientTableProps {
    clients: ClientExpanded[];
    selectedClientIds: string[];
    onToggleSelection: (clientId: string) => void;
    onSelectClient: (client: ClientExpanded) => void;
    onEditClient: (client: ClientExpanded) => void;
    onDeleteClient: (clientId: string) => void;
    onShowVehicles: (clientId: string) => void;
    onAddContactAttempt: (client: ClientExpanded) => void;
    onSendSMS: (client: ClientExpanded) => void;
}

const defaultColumns: TableColumn[] = [
    { id: 'selection', label: '', width: '60px', sortable: false },
    { id: 'client', label: 'Klient', width: '200px', sortable: true },
    { id: 'contact', label: 'Kontakt', width: '220px', sortable: true },
    { id: 'company', label: 'Firma', width: '180px', sortable: true },
    { id: 'lastVisit', label: 'Ostatnia wizyta', width: '140px', sortable: true },
    { id: 'metrics', label: 'Wizyty / Pojazdy', width: '140px', sortable: true },
    { id: 'revenue', label: 'Przychody', width: '120px', sortable: true },
    { id: 'actions', label: 'Akcje', width: '120px', sortable: false },
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

export const ClientTable: React.FC<ClientTableProps> = (props) => {
    const { clients, selectedClientIds, ...handlers } = props;

    const renderCell = (client: ClientExpanded, columnId: string) => (
        <ClientCellRenderer
            client={client}
            columnId={columnId}
            selectedClientIds={selectedClientIds}
            {...handlers}
        />
    );

    const renderCard = (client: ClientExpanded) => (
        <ClientCard
            client={client}
            selectedClientIds={selectedClientIds}
            {...handlers}
        />
    );

    return (
        <DataTable
            data={clients}
            columns={defaultColumns}
            title="Lista klientów"
            emptyStateConfig={emptyStateConfig}
            onItemClick={handlers.onSelectClient}
            renderCell={renderCell}
            renderCard={renderCard}
            enableDragAndDrop={true}
            enableViewToggle={true}
            defaultViewMode="table"
            storageKeys={storageKeys}
        />
    );
};