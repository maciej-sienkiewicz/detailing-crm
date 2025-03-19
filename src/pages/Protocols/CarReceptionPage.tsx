import React from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaEye, FaFileAlt } from 'react-icons/fa';
import { ProtocolListItem, ProtocolStatus, ProtocolStatusColors, ProtocolStatusLabels } from '../../types/protocol';

interface ProtocolsTableProps {
    protocols: ProtocolListItem[];
    onViewProtocol: (protocol: ProtocolListItem) => void;
    onEditProtocol: (protocol: ProtocolListItem) => void;
    onDeleteProtocol: (id: string) => void;
    onPrintProtocol: (id: string) => void;
    loading: boolean;
}

const ProtocolsTable: React.FC<ProtocolsTableProps> = ({
                                                           protocols,
                                                           onViewProtocol,
                                                           onEditProtocol,
                                                           onDeleteProtocol,
                                                           onPrintProtocol,
                                                           loading
                                                       }) => {
    // Formatowanie daty
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Formatowanie kwoty
    const formatAmount = (amount: number): string => {
        return amount.toLocaleString('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' zł';
    };

    if (loading) {
        return <LoadingMessage>Ładowanie danych...</LoadingMessage>;
    }

    if (protocols.length === 0) {
        return (
            <EmptyState>
                <p>Brak protokołów przyjęcia. Kliknij "Nowy protokół", aby utworzyć pierwszy.</p>
            </EmptyState>
        );
    }

    return (
        <TableContainer>
            <Table>
                <thead>
                <tr>
                    <TableHeader>Pojazd</TableHeader>
                    <TableHeader>Data</TableHeader>
                    <TableHeader>Właściciel</TableHeader>
                    <TableHeader>Nr rejestracyjny</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Wartość</TableHeader>
                    <TableHeader>Akcje</TableHeader>
                </tr>
                </thead>
                <tbody>
                {protocols.map((protocol) => (
                    <TableRow key={protocol.id} onClick={() => onViewProtocol(protocol)}>
                        <TableCell>
                            <CarInfo>
                                <strong>{protocol.vehicle.make} {protocol.vehicle.model}</strong>
                                <span>Rok: {protocol.vehicle.productionYear}</span>
                            </CarInfo>
                        </TableCell>
                        <TableCell>
                            <DateRange>
                                <span>Od: {formatDate(protocol.period.startDate)}</span>
                                <span>Do: {formatDate(protocol.period.endDate)}</span>
                            </DateRange>
                        </TableCell>
                        <TableCell>
                            <OwnerInfo>
                                <div>{protocol.owner.name}</div>
                                {protocol.owner.companyName && (
                                    <CompanyInfo>{protocol.owner.companyName}</CompanyInfo>
                                )}
                            </OwnerInfo>
                        </TableCell>
                        <TableCell>
                            <LicensePlate>{protocol.vehicle.licensePlate}</LicensePlate>
                        </TableCell>
                        <TableCell>
                            <StatusBadge status={protocol.status}>
                                {ProtocolStatusLabels[protocol.status]}
                            </StatusBadge>
                            <ServiceCount>{protocol.totalServiceCount} usług</ServiceCount>
                        </TableCell>
                        <TableCell>
                            <TotalAmount>{formatAmount(protocol.totalAmount)}</TotalAmount>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                            <ActionButtons>
                                <ActionButton title="Zobacz szczegóły" onClick={() => onViewProtocol(protocol)}>
                                    <FaEye />
                                </ActionButton>
                                <ActionButton title="Edytuj" onClick={() => onEditProtocol(protocol)}>
                                    <FaEdit />
                                </ActionButton>
                                <ActionButton
                                    danger
                                    title="Usuń"
                                    onClick={() => {
                                        if (window.confirm('Czy na pewno chcesz usunąć ten protokół?')) {
                                            onDeleteProtocol(protocol.id);
                                        }
                                    }}
                                >
                                    <FaTrash />
                                </ActionButton>
                                <ActionButton
                                    title="Drukuj protokół"
                                    onClick={() => onPrintProtocol(protocol.id)}
                                >
                                    <FaFileAlt />
                                </ActionButton>
                            </ActionButtons>
                        </TableCell>
                    </TableRow>
                ))}
                </tbody>
            </Table>
        </TableContainer>
    );
};

// Styled components
const TableContainer = styled.div`
    overflow-x: auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.th`
    text-align: left;
    padding: 12px 16px;
    background-color: #f5f5f5;
    border-bottom: 2px solid #eee;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
`;

const TableRow = styled.tr`
    cursor: pointer;

    &:not(:last-child) {
        border-bottom: 1px solid #eee;
    }

    &:hover {
        background-color: #f9f9f9;
    }
`;

const TableCell = styled.td`
    padding: 12px 16px;
    vertical-align: middle;
`;

const CarInfo = styled.div`
    display: flex;
    flex-direction: column;

    strong {
        margin-bottom: 2px;
        color: #34495e;
    }

    span {
        font-size: 13px;
        color: #7f8c8d;
    }
`;

const DateRange = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: #34495e;

    span {
        margin-bottom: 4px;
    }
`;

const OwnerInfo = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: #34495e;
`;

const CompanyInfo = styled.div`
    font-size: 13px;
    color: #7f8c8d;
    margin-top: 2px;
`;

const LicensePlate = styled.div`
    display: inline-block;
    padding: 4px 8px;
    background-color: #f0f7ff;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    font-weight: 500;
    color: #3498db;
`;

interface StatusBadgeProps {
    status: ProtocolStatus;
}

const StatusBadge = styled.div<StatusBadgeProps>`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    color: white;
    background-color: ${props => ProtocolStatusColors[props.status]};
    margin-bottom: 4px;
`;

const ServiceCount = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const TotalAmount = styled.div`
    font-weight: 600;
    color: #2ecc71;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    background: none;
    border: none;
    color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
        background-color: ${props => props.danger ? '#fdecea' : '#f0f7ff'};
    }
`;

const LoadingMessage = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px;
    font-size: 16px;
    color: #7f8c8d;
`;

const EmptyState = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 30px;
    text-align: center;
    color: #7f8c8d;
`;

export default ProtocolsTable;