// src/pages/Clients/components/VehicleTable/VehicleCellRenderer.tsx
import React from 'react';
import { FaCalendarAlt, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { VehicleExpanded } from '../../../../types';
import {
    TooltipWrapper,
    ActionButton,
    ActionButtons,
    StatusBadge
} from '../../../../components/common/DataTable';
import { formatCurrency, formatDate, getVehicleStatus } from './utils';
import {
    LicensePlateCell,
    VehicleInfo,
    VehicleName,
    VehicleYear,
    OwnersInfo,
    OwnerName,
    EmptyOwners,
    ServiceCount,
    LastServiceDate,
    EmptyDate,
    RevenueDisplay
} from './styled';

interface VehicleCellRendererProps {
    vehicle: VehicleExpanded;
    columnId: string;
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onEditVehicle: (vehicle: VehicleExpanded) => void;
    onDeleteVehicle: (vehicleId: string) => void;
    onShowHistory: (vehicle: VehicleExpanded) => void;
}

export const VehicleCellRenderer: React.FC<VehicleCellRendererProps> = ({
    vehicle,
    columnId,
    onSelectVehicle,
    onEditVehicle,
    onDeleteVehicle,
    onShowHistory
}) => {
    const status = getVehicleStatus(vehicle);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    switch (columnId) {
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
                            onClick={(e) => handleActionClick(e, () => onSelectVehicle(vehicle))}
                            $variant="view"
                        >
                            <FaEye />
                        </ActionButton>
                    </TooltipWrapper>
                    <TooltipWrapper title="Edytuj pojazd">
                        <ActionButton
                            onClick={(e) => handleActionClick(e, () => onEditVehicle(vehicle))}
                            $variant="edit"
                        >
                            <FaEdit />
                        </ActionButton>
                    </TooltipWrapper>
                    <TooltipWrapper title="Usuń pojazd">
                        <ActionButton
                            onClick={(e) => handleActionClick(e, () => onDeleteVehicle(vehicle.id))}
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