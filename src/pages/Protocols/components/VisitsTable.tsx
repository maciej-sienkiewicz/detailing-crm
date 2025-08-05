import React from 'react';
import styled from 'styled-components';
import { FaEye, FaEdit, FaTrash, FaCheck, FaSpinner } from 'react-icons/fa';
import { VisitListItem } from '../../../api/visitsApiNew';
import { ProtocolStatusBadge } from '../../Protocols/shared/components/ProtocolStatusBadge';
import { UseVisitsSelectionReturn } from '../hooks/useVisitsSelection';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',
    shadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
};

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
                    <FaSpinner className="spinner" />
                    <span>Ładowanie wizyt...</span>
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
  background: ${brandTheme.surface};
  border-radius: 16px;
  border: 1px solid ${brandTheme.border};
  overflow: hidden;
  box-shadow: ${brandTheme.shadow.sm};
`;

const Table = styled.div`
  width: 100%;
  display: table;
`;

const TableHeader = styled.div`
  display: table-header-group;
  background: ${brandTheme.surfaceAlt};
  border-bottom: 2px solid ${brandTheme.border};
`;

const HeaderRow = styled.div`
  display: table-row;
`;

const HeaderCell = styled.div<{ $width: string }>`
  display: table-cell;
  width: ${props => props.$width};
  padding: 16px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: left;
  vertical-align: middle;
  border-right: 1px solid ${brandTheme.border};

  &:last-child {
    border-right: none;
  }
`;

const TableBody = styled.div`
  display: table-row-group;
  background: ${brandTheme.surface};
`;

const TableRow = styled.div<{ $clickable?: boolean }>`
  display: table-row;
  transition: all 0.2s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};

  &:hover {
    background: ${brandTheme.surfaceAlt};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${brandTheme.border};
  }
`;

const TableCell = styled.div<{ $width: string }>`
  display: table-cell;
  width: ${props => props.$width};
  padding: 16px 12px;
  vertical-align: middle;
  border-right: 1px solid ${brandTheme.border};

  &:last-child {
    border-right: none;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: ${brandTheme.neutral};

  .spinner {
    font-size: 24px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  font-size: 16px;
  color: ${brandTheme.neutral};
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
  gap: 4px;
`;

const VehicleName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
`;

const VehicleYear = styled.div`
  font-size: 13px;
  color: ${brandTheme.neutral};
`;

const LicensePlate = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: ${brandTheme.primaryGhost};
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 6px;
  font-weight: 700;
  color: ${brandTheme.primary};
  font-size: 13px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const ClientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ClientName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
`;

const CompanyName = styled.div`
  font-size: 13px;
  color: ${brandTheme.neutral};
`;

const DateRange = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
`;

const DateFrom = styled.div`
  color: #1e293b;
  font-weight: 600;
`;

const DateTo = styled.div`
  color: ${brandTheme.neutral};
`;

const PriceValue = styled.div`
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
`;

const LastUpdate = styled.div`
  font-size: 13px;
  color: ${brandTheme.neutral};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const ActionButton = styled.button<{ $variant: 'view' | 'edit' | 'delete' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  ${({ $variant }) => {
    switch ($variant) {
        case 'view':
            return `
          background: ${brandTheme.primaryGhost};
          color: ${brandTheme.primary};
          &:hover {
            background: ${brandTheme.primary};
            color: white;
            transform: translateY(-1px);
          }
        `;
        case 'edit':
            return `
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          &:hover {
            background: #f59e0b;
            color: white;
            transform: translateY(-1px);
          }
        `;
        case 'delete':
            return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          &:hover {
            background: #ef4444;
            color: white;
            transform: translateY(-1px);
          }
        `;
    }
}}
`;