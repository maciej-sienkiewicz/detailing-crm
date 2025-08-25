import React from 'react';
import {FaEdit, FaEye} from 'react-icons/fa';
import {formatCurrency, getVehicleStatus} from './utils/vehicleUtils';
import {
    ActionButton,
    CardActions,
    CardContent,
    CardHeader,
    CardLabel,
    CardRow,
    CardsContainer,
    CardTitle,
    CardValue,
    StatusBadge,
    VehicleCard
} from './styles/components';
import {VehicleExpanded} from "../../../types";

interface CardsViewProps {
    vehicles: VehicleExpanded[];
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onQuickAction: (action: string, vehicle: VehicleExpanded, e: React.MouseEvent) => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
                                                        vehicles,
                                                        onSelectVehicle,
                                                        onQuickAction
                                                    }) => {
    return (
        <CardsContainer>
            {vehicles.map(vehicle => {
                const status = getVehicleStatus(vehicle);

                return (
                    <VehicleCard
                        key={vehicle.id}
                        onClick={() => onSelectVehicle(vehicle)}
                    >
                        <CardHeader>
                            <CardTitle>
                                {vehicle.make} {vehicle.model}
                                <StatusBadge $color={status.color}>
                                    {status.label}
                                </StatusBadge>
                            </CardTitle>
                            <CardActions>
                                <ActionButton
                                    onClick={(e) => onQuickAction('view', vehicle, e)}
                                    title="Zobacz szczegóły"
                                    $variant="view"
                                    $small
                                >
                                    <FaEye />
                                </ActionButton>
                                <ActionButton
                                    onClick={(e) => onQuickAction('edit', vehicle, e)}
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
                    </VehicleCard>
                );
            })}
        </CardsContainer>
    );
};