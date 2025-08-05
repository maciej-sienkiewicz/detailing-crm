import React from 'react';
import {
    FaEye,
    FaEdit,
    FaTrash,
    FaCalendarAlt
} from 'react-icons/fa';
import { TableColumn } from './types';
import { getVehicleStatus, formatCurrency, formatDate } from './utils/vehicleUtils';
import {
    StyledTableRow,
    TableCell,
    LicensePlateCell,
    VehicleInfo,
    VehicleName,
    StatusBadge,
    VehicleYear,
    OwnersInfo,
    OwnerName,
    EmptyOwners,
    ServiceCount,
    LastServiceDate,
    EmptyDate,
    RevenueDisplay,
    ActionButtons,
    ActionButton,
    TooltipWrapper
} from './styles/components';
import { VehicleExpanded } from "../../../types";

interface TableRowProps {
    vehicle: VehicleExpanded;
    columns: TableColumn[];
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onQuickAction: (action: string, vehicle: VehicleExpanded, e: React.MouseEvent) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
                                                      vehicle,
                                                      columns,
                                                      onSelectVehicle,
                                                      onQuickAction
                                                  }) => {
    const status = getVehicleStatus(vehicle);

    const renderCellContent = (column: TableColumn) => {
        switch (column.id) {
            case 'licensePlate':
                return (
                    <TooltipWrapper title={`Numer rejestracyjny: ${vehicle.licensePlate}`}>
                        <LicensePlateCell>
                            {vehicle.licensePlate}
                        </LicensePlateCell>
                    </TooltipWrapper>
                );

            case 'vehicle':
                return (
                    <VehicleInfo>
                        <VehicleName>
                            {vehicle.make} {vehicle.model}
                            <StatusBadge $color={status.color}>
                                {status.label}
                            </StatusBadge>
                        </VehicleName>
                        <VehicleYear>Rok: {vehicle.year}</VehicleYear>
                    </VehicleInfo>
                );

            case 'owners':
                return (
                    <TooltipWrapper title={vehicle.owners && vehicle.owners.length > 0 ? `Właściciele: ${vehicle.owners.map(o => o.fullName).join(', ')}` : 'Brak właścicieli'}>
                        <OwnersInfo>
                            {vehicle.owners && vehicle.owners.length > 0 ? (
                                vehicle.owners.slice(0, 2).map((owner, index) => (
                                    <OwnerName key={owner.id}>
                                        {owner.fullName}
                                        {vehicle.owners!.length > 2 && index === 1 && (
                                            <span> (+{vehicle.owners!.length - 2} więcej)</span>
                                        )}
                                    </OwnerName>
                                ))
                            ) : (
                                <EmptyOwners>Brak właścicieli</EmptyOwners>
                            )}
                        </OwnersInfo>
                    </TooltipWrapper>
                );

            case 'services':
                return (
                    <TooltipWrapper title={`Liczba wizyt: ${vehicle.totalServices}`}>
                        <ServiceCount>
                            {vehicle.totalServices}
                        </ServiceCount>
                    </TooltipWrapper>
                );

            case 'lastService':
                return (
                    <TooltipWrapper title={vehicle.lastServiceDate ? `Data ostatniej wizyty: ${formatDate(vehicle.lastServiceDate)}` : 'Brak wizyt'}>
                        <LastServiceDate>
                            {vehicle.lastServiceDate ? (
                                <>
                                    <FaCalendarAlt />
                                    <span>{formatDate(vehicle.lastServiceDate)}</span>
                                </>
                            ) : (
                                <EmptyDate>Brak wizyt</EmptyDate>
                            )}
                        </LastServiceDate>
                    </TooltipWrapper>
                );

            case 'revenue':
                return (
                    <TooltipWrapper title={`Łączne przychody: ${formatCurrency(vehicle.totalSpent)}`}>
                        <RevenueDisplay>
                            {formatCurrency(vehicle.totalSpent)}
                        </RevenueDisplay>
                    </TooltipWrapper>
                );

            case 'actions':
                return (
                    <ActionButtons>
                        <TooltipWrapper title="Zobacz szczegóły pojazdu">
                            <ActionButton
                                onClick={(e) => onQuickAction('view', vehicle, e)}
                                $variant="view"
                            >
                                <FaEye />
                            </ActionButton>
                        </TooltipWrapper>
                        <TooltipWrapper title="Edytuj pojazd">
                            <ActionButton
                                onClick={(e) => onQuickAction('edit', vehicle, e)}
                                $variant="edit"
                            >
                                <FaEdit />
                            </ActionButton>
                        </TooltipWrapper>
                        <TooltipWrapper title="Usuń pojazd">
                            <ActionButton
                                onClick={(e) => onQuickAction('delete', vehicle, e)}
                                $variant="delete"
                            >
                                <FaTrash />
                            </ActionButton>
                        </TooltipWrapper>
                    </ActionButtons>
                );

            default:
                return null;
        }
    };

    return (
        <StyledTableRow
            onClick={() => onSelectVehicle(vehicle)}
        >
            {columns.map(column => (
                <TableCell
                    key={`${vehicle.id}-${column.id}`}
                    $width={column.width}
                >
                    {renderCellContent(column)}
                </TableCell>
            ))}
        </StyledTableRow>
    );
};