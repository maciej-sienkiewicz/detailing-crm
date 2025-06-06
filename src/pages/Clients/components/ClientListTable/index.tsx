// ClientListTable/index.tsx - Main Component
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaList, FaTable } from 'react-icons/fa';
import { ClientExpanded } from '../../../../types';
import { TableView } from './TableView';
import { CardsView } from './CardsView';
import { EmptyState } from './EmptyState';
import { useTableConfiguration } from './hooks/useTableConfiguration';
import { useClientSorting } from './hooks/useClientSorting';
import { brandTheme } from './styles/theme';
import {
    ListContainer,
    ListHeader,
    ListTitle,
    ViewControls,
    ViewButton
} from './styles/components';

type ViewMode = 'table' | 'cards';

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
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem('client_view_mode');
        return (saved as ViewMode) || 'table';
    });

    // Custom hooks for table management
    const { columns, moveColumn } = useTableConfiguration();
    const { sortedClients, sortColumn, sortDirection, handleSort } = useClientSorting(clients);

    // Save view mode preference
    useEffect(() => {
        try {
            localStorage.setItem('client_view_mode', viewMode);
        } catch (e) {
            console.error("Error saving view mode:", e);
        }
    }, [viewMode]);

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
            {/* Header with view controls */}
            <ListHeader>
                <ListTitle>
                    Lista klientów ({clients.length})
                </ListTitle>
                <ViewControls>
                    <ViewButton
                        $active={viewMode === 'table'}
                        onClick={() => setViewMode('table')}
                        title="Widok tabeli"
                    >
                        <FaTable />
                    </ViewButton>
                    <ViewButton
                        $active={viewMode === 'cards'}
                        onClick={() => setViewMode('cards')}
                        title="Widok kart"
                    >
                        <FaList />
                    </ViewButton>
                </ViewControls>
            </ListHeader>

            {/* Content based on view mode */}
            {viewMode === 'table' ? (
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
            ) : (
                <CardsView
                    clients={sortedClients}
                    selectedClientIds={selectedClientIds}
                    onToggleSelection={onToggleSelection}
                    onSelectClient={onSelectClient}
                    onQuickAction={handleQuickAction}
                />
            )}
        </ListContainer>
    );
};

export default ClientListTable;