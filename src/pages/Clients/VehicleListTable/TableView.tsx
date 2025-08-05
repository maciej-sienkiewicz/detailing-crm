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
import { VehicleExpanded } from "../../../types";

type SortDirection = 'asc' | 'desc' | null;

interface TableViewProps {
    vehicles: VehicleExpanded[];
    columns: TableColumn[];
    sortColumn: string | null;
    sortDirection: SortDirection;
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onQuickAction: (action: string, vehicle: VehicleExpanded, e: React.MouseEvent) => void;
    onMoveColumn: (dragIndex: number, hoverIndex: number) => void;
    onSort: (columnId: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
                                                        vehicles,
                                                        columns,
                                                        sortColumn,
                                                        sortDirection,
                                                        onSelectVehicle,
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
                    {vehicles.map(vehicle => (
                        <TableRow
                            key={vehicle.id}
                            vehicle={vehicle}
                            columns={columns}
                            onSelectVehicle={onSelectVehicle}
                            onQuickAction={onQuickAction}
                        />
                    ))}
                </TableBody>
            </TableContainer>
        </TableWrapper>
    );
};