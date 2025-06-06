// ClientListTable/TableView.tsx
import React from 'react';
import { TableColumn } from './types';
import { ColumnHeader } from './ColumnHeader';
import { TableRow } from './TableRow';
import {
    TableWrapper,
    TableContainer,
    TableHeader,
    TableBody
} from './styles/components';
import {ClientExpanded} from "../../../../types";

type SortDirection = 'asc' | 'desc' | null;

interface TableViewProps {
    clients: ClientExpanded[];
    columns: TableColumn[];
    selectedClientIds: string[];
    sortColumn: string | null;
    sortDirection: SortDirection;
    onToggleSelection: (clientId: string) => void;
    onSelectClient: (client: ClientExpanded) => void;
    onQuickAction: (action: string, client: ClientExpanded, e: React.MouseEvent) => void;
    onMoveColumn: (dragIndex: number, hoverIndex: number) => void;
    onSort: (columnId: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
                                                        clients,
                                                        columns,
                                                        selectedClientIds,
                                                        sortColumn,
                                                        sortDirection,
                                                        onToggleSelection,
                                                        onSelectClient,
                                                        onQuickAction,
                                                        onMoveColumn,
                                                        onSort
                                                    }) => {
    return (
        <TableWrapper>
            <TableContainer>
                <TableHeader>
                    {columns.map((column, index) => (
                        <ColumnHeader
                            key={column.id}
                            column={column}
                            index={index}
                            moveColumn={onMoveColumn}
                            sortColumn={sortColumn}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                    ))}
                </TableHeader>

                <TableBody>
                    {clients.map(client => (
                        <TableRow
                            key={client.id}
                            client={client}
                            columns={columns}
                            selectedClientIds={selectedClientIds}
                            onToggleSelection={onToggleSelection}
                            onSelectClient={onSelectClient}
                            onQuickAction={onQuickAction}
                        />
                    ))}
                </TableBody>
            </TableContainer>
        </TableWrapper>
    );
};