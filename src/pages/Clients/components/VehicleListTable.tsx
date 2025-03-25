import React from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import { VehicleExpanded } from '../../../types';

interface VehicleListTableProps {
    vehicles: VehicleExpanded[];
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onEditVehicle: (vehicle: VehicleExpanded) => void;
    onDeleteVehicle: (vehicleId: string) => void;
    onShowHistory: (vehicle: VehicleExpanded) => void;
}

const VehicleListTable: React.FC<VehicleListTableProps> = ({
                                                               vehicles,
                                                               onSelectVehicle,
                                                               onEditVehicle,
                                                               onDeleteVehicle,
                                                               onShowHistory
                                                           }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>Pojazd</TableHeader>
                        <TableHeader>Nr rejestracyjny</TableHeader>
                        <TableHeader>VIN</TableHeader>
                        <TableHeader>Usługi</TableHeader>
                        <TableHeader>Przychody</TableHeader>
                        <TableHeader>Akcje</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {vehicles.map(vehicle => (
                        <TableRow key={vehicle.id} onClick={() => onSelectVehicle(vehicle)}>
                            <TableCell>
                                <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                                <VehicleYear>Rok: {vehicle.year}</VehicleYear>
                            </TableCell>
                            <TableCell>
                                <LicensePlate>{vehicle.licensePlate}</LicensePlate>
                            </TableCell>
                            <TableCell>
                                {vehicle.vin || '-'}
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
                                <Revenue>{vehicle.totalSpent.toFixed(2)} zł</Revenue>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <ActionButtons>
                                    <ActionButton title="Edytuj pojazd" onClick={() => onEditVehicle(vehicle)}>
                                        <FaEdit />
                                    </ActionButton>

                                    <ActionButton title="Historia usług" onClick={() => onShowHistory(vehicle)}>
                                        <FaHistory />
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
                    ))}
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

const LicensePlate = styled.div`
  display: inline-block;
  background-color: #f0f7ff;
  color: #3498db;
  border: 1px solid #d5e9f9;
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: 500;
  font-size: 14px;
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