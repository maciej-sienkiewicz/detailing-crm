// ClientListTable/index.tsx - Updated Main Component
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ClientExpanded } from '../../../../types';
import { TableView } from './TableView';
import { EmptyState } from './EmptyState';
import { useTableConfiguration } from './hooks/useTableConfiguration';
import { useClientSorting } from './hooks/useClientSorting';
import {
    ListContainer,
    ListHeader,
    ListTitle
} from './styles/components';

interface ClientListTableProps {
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

const ClientListTable: React.FC<ClientListTableProps> = ({
                                                             clients,
                                                             selectedClientIds,
                                                             onToggleSelection,
                                                             onSelectClient,
                                                             onEditClient,
                                                             onDeleteClient,
                                                             onShowVehicles,
                                                             onAddContactAttempt,
                                                             onSendSMS
                                                         }) => {
    // Custom hooks for table management
    const { columns, moveColumn } = useTableConfiguration();
    const { sortedClients, sortColumn, sortDirection, handleSort } = useClientSorting(clients);

    const handleQuickAction = (action: string, client: ClientExpanded, e: React.MouseEvent) => {
        e.stopPropagation();

        switch (action) {
            case 'view':
                onSelectClient(client);
                break;
            case 'edit':
                onEditClient(client);
                break;
            case 'delete':
                if (window.confirm('Czy na pewno chcesz usunąć tego klienta?')) {
                    onDeleteClient(client.id);
                }
                break;
            case 'vehicles':
                onShowVehicles(client.id);
                break;
            case 'contact':
                onAddContactAttempt(client);
                break;
            case 'sms':
                onSendSMS(client);
                break;
        }
    };

    if (clients.length === 0) {
        return <EmptyState />;
    }

    return (
        <ListContainer>
            {/* Header - Removed view controls */}
            <ListHeader>
                <ListTitle>
                    Lista klientów ({clients.length})
                </ListTitle>
            </ListHeader>

            {/* Content - Only table view */}
            <DndProvider backend={HTML5Backend}>
                <TableView
                    clients={sortedClients}
                    columns={columns}
                    selectedClientIds={selectedClientIds}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onToggleSelection={onToggleSelection}
                    onSelectClient={onSelectClient}
                    onQuickAction={handleQuickAction}
                    onMoveColumn={moveColumn}
                    onSort={handleSort}
                />
            </DndProvider>
        </ListContainer>
    );
};

export default ClientListTable;