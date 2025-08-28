// src/pages/Clients/components/VehicleTable/VehicleCard.tsx
import React from 'react';
import { FaEdit, FaEye } from 'react-icons/fa';
import { VehicleExpanded } from '../../../../types';
import { Card, ActionButton, StatusBadge } from '../../../../components/common/DataTable';
import { formatCurrency, getVehicleStatus } from './utils';
import {
    CardHeader,
    CardTitle,
    CardActions,
    CardContent,
    CardRow,
    CardLabel,
    CardValue
} from './styled';

interface VehicleCardProps {
    vehicle: VehicleExpanded;
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onEditVehicle: (vehicle: VehicleExpanded) => void;
    onDeleteVehicle: (vehicleId: string) => void;
    onShowHistory: (vehicle: VehicleExpanded) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
                                                            vehicle,
                                                            onSelectVehicle,
                                                            onEditVehicle,
                                                            onShowHistory
                                                        }) => {
    const status = getVehicleStatus(vehicle);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {vehicle.make} {vehicle.model}
                    <StatusBadge $color={status.color}>
                        {status.label}
                    </StatusBadge>
                </CardTitle>
                <CardActions>
                    <ActionButton
                        onClick={(e) => handleActionClick(e, () => onSelectVehicle(vehicle))}
                        title="Zobacz szczegóły"
                        $variant="view"
                        $small
                    >
                        <FaEye />
                    </ActionButton>
                    <ActionButton
                        onClick={(e) => handleActionClick(e, () => onEditVehicle(vehicle))}
                        title="Edytuj"
                        $variant="edit"
                        $small
                    >
                        <FaEdit />
                    </ActionButton>
                </CardActions>
            </CardHeader>

            <CardContent>
                <CardRow>
                    <CardLabel>Nr rejestracyjny:</CardLabel>
                    <CardValue>{vehicle.licensePlate}</CardValue>
                </CardRow>
                <CardRow>
                    <CardLabel>Rok produkcji:</CardLabel>
                    <CardValue>{vehicle.year}</CardValue>
                </CardRow>
                {vehicle.color && (
                    <CardRow>
                        <CardLabel>Kolor:</CardLabel>
                        <CardValue>{vehicle.color}</CardValue>
                    </CardRow>
                )}
                <CardRow>
                    <CardLabel>Właściciele:</CardLabel>
                    <CardValue>
                        {vehicle.owners?.length || 0} właścicieli
                    </CardValue>
                </CardRow>
                <CardRow>
                    <CardLabel>Liczba wizyt:</CardLabel>
                    <CardValue>{vehicle.totalServices}</CardValue>
                </CardRow>
                <CardRow>
                    <CardLabel>Przychody:</CardLabel>
                    <CardValue>{formatCurrency(vehicle.totalSpent)}</CardValue>
                </CardRow>
            </CardContent>
        </Card>
    );
};