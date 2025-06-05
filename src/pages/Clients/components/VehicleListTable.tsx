import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import { VehicleExpanded, VehicleOwner } from '../../../types';
import { vehicleApi } from '../../../api/vehiclesApi';

interface VehicleListTableProps {
    vehicles: VehicleExpanded[];
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onEditVehicle: (vehicle: VehicleExpanded) => void;
    onDeleteVehicle: (vehicleId: string) => void;
    onShowHistory: (vehicle: VehicleExpanded) => void;
}

interface VehicleWithOwners extends VehicleExpanded {
    ownerNames?: string[];
}

const VehicleListTable: React.FC<VehicleListTableProps> = ({
                                                               vehicles,
                                                               onSelectVehicle,
                                                               onEditVehicle,
                                                               onDeleteVehicle,
                                                               onShowHistory
                                                           }) => {
    const [vehiclesWithOwners, setVehiclesWithOwners] = useState<VehicleWithOwners[]>([]);
    const [loading, setLoading] = useState(true);

    // Pobieranie właścicieli dla pojazdów
    useEffect(() => {
        const fetchOwners = async () => {
            setLoading(true);
            try {
                const vehiclesData = await Promise.all(vehicles.map(async (vehicle) => {
                    const owners = await vehicleApi.fetchOwners(vehicle.id);
                    return {
                        ...vehicle,
                        ownerNames: owners.map(owner => owner.ownerName)
                    };
                }));
                setVehiclesWithOwners(vehiclesData);
            } catch (error) {
                console.error('Error fetching vehicle owners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOwners();
    }, [vehicles]);

    // Renderowanie listy właścicieli
    const renderOwners = (owners?: string[]) => {
        if (!owners || owners.length === 0) return '-';

        if (owners.length === 1) {
            return <OwnerName>{owners[0]}</OwnerName>;
        }

        if (owners.length === 2) {
            return (
                <>
                    <OwnerName>{owners[0]}</OwnerName>
                    <OwnerName>{owners[1]}</OwnerName>
                </>
            );
        }

        return (
            <>
                <OwnerName>{owners[0]}</OwnerName>
                <OwnerName>{owners[1]}</OwnerName>
                <MoreOwners>...</MoreOwners>
            </>
        );
    };

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>Pojazd</TableHeader>
                        <TableHeader>Nr rejestracyjny</TableHeader>
                        <TableHeader>Właściciele</TableHeader>
                        <TableHeader>Usługi</TableHeader>
                        <TableHeader>Przychody</TableHeader>
                        <TableHeader>Akcje</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6}>Ładowanie danych właścicieli...</TableCell>
                        </TableRow>
                    ) : (
                        vehiclesWithOwners.map(vehicle => (
                            <TableRow key={vehicle.id} onClick={() => onSelectVehicle(vehicle)}>
                                <TableCell>
                                    <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                                    <VehicleYear>Rok: {vehicle.year}</VehicleYear>
                                </TableCell>
                                <TableCell>
                                    {vehicle.licensePlate}
                                </TableCell>
                                <TableCell>
                                    {renderOwners(vehicle.ownerNames)}
                                </TableCell>
                                <TableCell>
                                    <MetricsContainer>
                                        <MetricValue>{vehicle.totalServices}</MetricValue>
                                        <MetricLabel>usług</MetricLabel>
                                    </MetricsContainer>
                                    {vehicle.lastServiceDate && (
                                        <LastService>Ostatnia: {formatDate(vehicle.lastServiceDate)}</LastService>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Revenue>{vehicle.totalSpent} zł</Revenue>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <ActionButtons>
                                        <ActionButton title="Edytuj pojazd" onClick={() => onEditVehicle(vehicle)}>
                                            <FaEdit />
                                        </ActionButton>


                                        <ActionButton
                                            title="Usuń pojazd"
                                            danger
                                            onClick={() => onDeleteVehicle(vehicle.id)}
                                        >
                                            <FaTrash />
                                        </ActionButton>
                                    </ActionButtons>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Styled components
const TableContainer = styled.div`
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background-color: #f5f5f5;
    border-bottom: 2px solid #eee;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    cursor: pointer;

    &:not(:last-child) {
        border-bottom: 1px solid #eee;
    }

    &:hover {
        background-color: #f9f9f9;
    }
`;

const TableHeader = styled.th`
    text-align: left;
    padding: 12px 16px;
    font-weight: 600;
    color: #333;
`;

const TableCell = styled.td`
    padding: 12px 16px;
    vertical-align: middle;
`;

const VehicleName = styled.div`
    font-weight: 500;
    font-size: 15px;
    color: #34495e;
`;

const VehicleYear = styled.div`
    font-size: 13px;
    color: #7f8c8d;
    margin-top: 2px;
`;

const OwnerName = styled.div`
    font-size: 14px;
    color: #34495e;
    line-height: 1.4;
`;

const MoreOwners = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  font-style: italic;
`;

const MetricsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const MetricValue = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: #3498db;
`;

const MetricLabel = styled.div`
    font-size: 13px;
    color: #7f8c8d;
`;

const LastService = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
`;

const Revenue = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: #2ecc71;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    background: none;
    border: none;
    color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    font-size: 14px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;

    &:hover {
        background-color: ${props => props.danger ? '#fdecea' : '#f0f7ff'};
    }
`;

export default VehicleListTable;