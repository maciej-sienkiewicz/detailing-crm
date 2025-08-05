import React from 'react';
import styled from 'styled-components';
import { FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { VisitListItem } from '../../../api/visitsApiNew';
import { ProtocolStatusBadge } from '../../Protocols/shared/components/ProtocolStatusBadge';
import { UseVisitsSelectionReturn } from '../hooks/useVisitsSelection';
import { theme } from '../../../styles/theme';

interface VisitsTableProps {
    visits: VisitListItem[];
    loading?: boolean;
    selection?: UseVisitsSelectionReturn;
    onVisitClick?: (visit: VisitListItem) => void;
    onViewVisit?: (visit: VisitListItem) => void;
    onEditVisit?: (visitId: string) => void;
    onDeleteVisit?: (visitId: string) => void;
}

export const VisitsTable: React.FC<VisitsTableProps> = ({
                                                            visits,
                                                            loading = false,
                                                            selection,
                                                            onVisitClick,
                                                            onViewVisit,
                                                            onEditVisit,
                                                            onDeleteVisit
                                                        }) => {
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        if (dateString.includes('T') && dateString.split('T')[1] !== '23:59:59') {
            const time = date.toLocaleTimeString('pl-PL', {
                hour: '2-digit',
                minute: '2-digit'
            });
            return `${formattedDate}, ${time}`;
        }

        return formattedDate;
    };

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    const handleRowClick = (visit: VisitListItem) => {
        if (onVisitClick) {
            onVisitClick(visit);
        }
    };

    if (loading && visits.length === 0) {
        return (
            <TableContainer>
                <LoadingState>
                    <LoadingSpinner>
                        <FaSpinner />
                    </LoadingSpinner>
                    <LoadingText>Ładowanie wizyt...</LoadingText>
                </LoadingState>
            </TableContainer>
        );
    }

    if (visits.length === 0) {
        return (
            <TableContainer>
                <EmptyState>
                    <EmptyIcon>📋</EmptyIcon>
                    <EmptyTitle>Brak wizyt</EmptyTitle>
                    <EmptyDescription>
                        Nie znaleziono wizyt spełniających kryteria wyszukiwania
                    </EmptyDescription>
                </EmptyState>
            </TableContainer>
        );
    }

    return (
        <TableContainer>
            <Table>
                <TableHeader>
                    <HeaderRow>
                        {selection && (
                            <HeaderCell $width="50px">
                                <Checkbox
                                    type="checkbox"
                                    checked={selection.isAllSelected}
                                    onChange={() => selection.toggleAll(visits)}
                                    ref={(el) => {
                                        if (el) el.indeterminate = selection.isPartiallySelected;
                                    }}
                                />
                            </HeaderCell>
                        )}
                        <HeaderCell $width="200px">Pojazd</HeaderCell>
                        <HeaderCell $width="120px">Nr rejestracyjny</HeaderCell>
                        <HeaderCell $width="180px">Klient</HeaderCell>
                        <HeaderCell $width="200px">Okres wizyty</HeaderCell>
                        <HeaderCell $width="120px">Status</HeaderCell>
                        <HeaderCell $width="100px">Wartość</HeaderCell>
                        <HeaderCell $width="150px">Ostatnia aktualizacja</HeaderCell>
                        <HeaderCell $width="120px">Akcje</HeaderCell>
                    </HeaderRow>
                </TableHeader>

                <TableBody>
                    {visits.map((visit) => (
                        <TableRow
                            key={visit.id}
                            onClick={() => handleRowClick(visit)}
                            $clickable={!!onVisitClick}
                        >
                            {selection && (
                                <TableCell $width="50px">
                                    <Checkbox
                                        type="checkbox"
                                        checked={selection.isVisitSelected(visit.id)}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            selection.toggleVisit(visit.id);
                                        }}
                                    />
                                </TableCell>
                            )}

                            <TableCell $width="200px">
                                <VehicleInfo>
                                    <VehicleName>
                                        {visit.vehicle.make} {visit.vehicle.model}
                                    </VehicleName>
                                    <VehicleYear>
                                        Rok: {visit.vehicle.productionYear || 'Brak danych'}
                                    </VehicleYear>
                                </VehicleInfo>
                            </TableCell>

                            <TableCell $width="120px">
                                <LicensePlate>{visit.vehicle.licensePlate}</LicensePlate>
                            </TableCell>

                            <TableCell $width="180px">
                                <ClientInfo>
                                    <ClientName>{visit.owner.name}</ClientName>
                                    {visit.owner.companyName && (
                                        <CompanyName>{visit.owner.companyName}</CompanyName>
                                    )}
                                </ClientInfo>
                            </TableCell>

                            <TableCell $width="200px">
                                <DateRange>
                                    <DateFrom>Od: {formatDate(visit.period.startDate)}</DateFrom>
                                    <DateTo>Do: {formatDate(visit.period.endDate)}</DateTo>
                                </DateRange>
                            </TableCell>

                            <TableCell $width="120px">
                                <ProtocolStatusBadge status={visit.status} />
                            </TableCell>

                            <TableCell $width="100px">
                                <PriceValue>{visit.totalAmount.toFixed(2)} PLN</PriceValue>
                            </TableCell>

                            <TableCell $width="150px">
                                <LastUpdate>{visit.lastUpdate}</LastUpdate>
                            </TableCell>

                            <TableCell $width="120px">
                                <ActionButtons>
                                    {onViewVisit && (
                                        <ActionButton
                                            onClick={(e) => handleActionClick(e, () => onViewVisit(visit))}
                                            title="Zobacz szczegóły"
                                            $variant="view"
                                        >
                                            <FaEye />
                                        </ActionButton>
                                    )}
                                    {onEditVisit && (
                                        <ActionButton
                                            onClick={(e) => handleActionClick(e, () => onEditVisit(visit.id))}
                                            title="Edytuj"
                                            $variant="edit"
                                        >
                                            <FaEdit />
                                        </ActionButton>
                                    )}
                                    {onDeleteVisit && (
                                        <ActionButton
                                            onClick={(e) => handleActionClick(e, () => onDeleteVisit(visit.id))}
                                            title="Usuń"
                                            $variant="delete"
                                        >
                                            <FaTrash />
                                        </ActionButton>
                                    )}
                                </ActionButtons>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const TableContainer = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.border};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const Table = styled.div`
    width: 100%;
    display: table;
`;

const TableHeader = styled.div`
    display: table-header-group;
    background: ${theme.surfaceAlt};
    border-bottom: 2px solid ${theme.border};
`;

const HeaderRow = styled.div`
    display: table-row;
`;

const HeaderCell = styled.div<{ $width: string }>`
    display: table-cell;
    width: ${props => props.$width};
    padding: ${theme.spacing.lg} ${theme.spacing.lg};
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
    text-align: left;
    vertical-align: middle;
    border-right: 1px solid ${theme.border};

    &:last-child {
        border-right: none;
    }
`;

const TableBody = styled.div`
    display: table-row-group;
    background: ${theme.surface};
`;

const TableRow = styled.div<{ $clickable?: boolean }>`
    display: table-row;
    transition: all ${theme.transitions.normal};
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};

    &:hover {
        background: ${theme.surfaceAlt};
    }

    &:not(:last-child) {
        border-bottom: 1px solid ${theme.border};
    }
`;

const TableCell = styled.div<{ $width: string }>`
    display: table-cell;
    width: ${props => props.$width};
    padding: ${theme.spacing.lg};
    vertical-align: middle;
    border-right: 1px solid ${theme.border};

    &:last-child {
        border-right: none;
    }
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px ${theme.spacing.xl};
    gap: ${theme.spacing.lg};
    color: ${theme.text.tertiary};
`;

const LoadingSpinner = styled.div`
    font-size: 24px;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    font-weight: 500;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px ${theme.spacing.xl};
    text-align: center;
`;

const EmptyIcon = styled.div`
    font-size: 48px;
    margin-bottom: ${theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
    font-size: 16px;
    color: ${theme.text.tertiary};
    margin: 0;
`;

const Checkbox = styled.input`
    width: 16px;
    height: 16px;
    cursor: pointer;
`;

const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const VehicleName = styled.div`
    font-weight: 600;
    color: ${theme.text.primary};
    font-size: 14px;
`;

const VehicleYear = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
`;

const LicensePlate = styled.div`
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.primaryGhost};
    border: 1px solid rgba(37, 99, 235, 0.2);
    border-radius: ${theme.radius.sm};
    font-weight: 700;
    color: ${theme.primary};
    font-size: 13px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
`;

const ClientInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const ClientName = styled.div`
    font-weight: 600;
    color: ${theme.text.primary};
    font-size: 14px;
`;

const CompanyName = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
`;

const DateRange = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    font-size: 13px;
`;

const DateFrom = styled.div`
    color: ${theme.text.primary};
    font-weight: 600;
`;

const DateTo = styled.div`
    color: ${theme.text.tertiary};
`;

const PriceValue = styled.div`
    font-weight: 700;
    color: ${theme.text.primary};
    font-size: 14px;
`;

const LastUpdate = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    align-items: center;
`;

const ActionButton = styled.button<{ $variant: 'view' | 'edit' | 'delete' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${theme.radius.sm};
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    font-size: 14px;

    ${({ $variant }) => {
    switch ($variant) {
        case 'view':
            return `
                    background: ${theme.primaryGhost};
                    color: ${theme.primary};
                    &:hover {
                        background: ${theme.primary};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'edit':
            return `
                    background: ${theme.warningBg};
                    color: ${theme.warning};
                    &:hover {
                        background: ${theme.warning};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'delete':
            return `
                    background: ${theme.errorBg};
                    color: ${theme.error};
                    &:hover {
                        background: ${theme.error};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
    }
}}
`;