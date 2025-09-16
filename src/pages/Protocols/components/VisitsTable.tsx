// src/pages/Protocols/components/VisitsTable.tsx - Refactored to use DataTable
import React from 'react';
import { FaClipboardCheck, FaFilter, FaEye, FaTrash } from 'react-icons/fa';
import { DataTable, TableColumn, HeaderAction, SelectAllConfig, TooltipWrapper, ActionButton, ActionButtons } from '../../../components/common/DataTable';
import { VisitListItem } from '../../../api/visitsApiNew';
import { ProtocolStatusBadge } from '../shared/components/ProtocolStatusBadge';

interface VisitsTableProps {
    visits: VisitListItem[];
    loading?: boolean;
    showFilters: boolean;
    hasActiveFilters: boolean;
    onVisitClick?: (visit: VisitListItem) => void;
    onViewVisit?: (visit: VisitListItem) => void;
    onEditVisit?: (visitId: string) => void;
    onDeleteVisit?: (visitId: string) => void;
    onToggleFilters: () => void;
    filtersComponent?: React.ReactNode;
}

const defaultColumns: TableColumn[] = [
    { id: 'vehicle', label: 'Pojazd', width: '24%', sortable: true }, // Szeroka - marka+model
    { id: 'licensePlate', label: 'Nr rej.', width: '100px', sortable: true }, // Minimalna stała
    { id: 'client', label: 'Klient', width: '20%', sortable: true }, // Średnia - nazwa+firma
    { id: 'period', label: 'Okres', width: '18%', sortable: true }, // Średnia - dwie daty
    { id: 'status', label: 'Status', width: '12%', sortable: true }, // Kompaktowa - badge
    { id: 'value', label: 'Wartość', width: '10%', sortable: true }, // Wąska - kwota
    { id: 'lastUpdate', label: 'Aktualizacja', width: '14%', sortable: true }, // Średnia - data+czas
    { id: 'actions', label: 'Akcje', width: '130px', sortable: false }, // Minimalna - tylko 2 przyciski
];

const emptyStateConfig = {
    icon: FaClipboardCheck,
    title: 'Brak wizyt',
    description: 'Nie znaleziono wizyt spełniających kryteria wyszukiwania',
    actionText: 'Spróbuj zmienić kryteria filtrowania lub dodać nową wizytę'
};

const storageKeys = {
    viewMode: 'visits_view_mode',
    columnOrder: 'visits_table_columns_order'
};

export const VisitsTable: React.FC<VisitsTableProps> = ({
                                                            visits,
                                                            loading = false,
                                                            showFilters,
                                                            hasActiveFilters,
                                                            onVisitClick,
                                                            onViewVisit,
                                                            onEditVisit,
                                                            onDeleteVisit,
                                                            onToggleFilters,
                                                            filtersComponent
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

    const renderCell = (visit: VisitListItem, columnId: string) => {
        const handleActionClick = (e: React.MouseEvent, action: () => void) => {
            e.stopPropagation();
            action();
        };

        switch (columnId) {
            case 'vehicle':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                            {visit.vehicle.make} {visit.vehicle.model}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                            Rok: {visit.vehicle.productionYear || 'Brak danych'}
                        </div>
                    </div>
                );

            case 'licensePlate':
                return (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        background: 'rgba(26, 54, 93, 0.04)',
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        borderRadius: '6px',
                        fontWeight: 700,
                        color: 'var(--brand-primary, #1a365d)',
                        fontSize: '13px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase' as const
                    }}>
                        {visit.vehicle.licensePlate}
                    </div>
                );

            case 'client':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                            {visit.owner.name}
                        </div>
                        {visit.owner.companyName && (
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                {visit.owner.companyName}
                            </div>
                        )}
                    </div>
                );

            case 'period':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                        <div style={{ color: '#0f172a', fontWeight: 600 }}>
                            Od: {formatDate(visit.period.startDate)}
                        </div>
                        <div style={{ color: '#64748b' }}>
                            Do: {formatDate(visit.period.endDate)}
                        </div>
                    </div>
                );

            case 'status':
                return <ProtocolStatusBadge status={visit.status} />;

            case 'value':
                return (
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                        {visit.totalAmount.toFixed(2)} PLN
                    </div>
                );

            case 'lastUpdate':
                return (
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {visit.lastUpdate}
                    </div>
                );

            case 'actions':
                return (
                    <ActionButtons>
                        {onViewVisit && (
                            <TooltipWrapper title="Zobacz szczegóły">
                                <ActionButton
                                    onClick={(e) => handleActionClick(e, () => onViewVisit(visit))}
                                    $variant="view"
                                >
                                    <FaEye />
                                </ActionButton>
                            </TooltipWrapper>
                        )}
                        {onDeleteVisit && (
                            <TooltipWrapper title="Usuń wizytę">
                                <ActionButton
                                    onClick={(e) => handleActionClick(e, () => onDeleteVisit(visit.id))}
                                    $variant="delete"
                                >
                                    <FaTrash />
                                </ActionButton>
                            </TooltipWrapper>
                        )}
                    </ActionButtons>
                );

            default:
                return null;
        }
    };

    // Konfiguracja akcji w nagłówku
    const headerActions: HeaderAction[] = [
        {
            id: 'filters',
            label: 'Filtrowanie',
            icon: FaFilter,
            onClick: onToggleFilters,
            variant: 'filter',
            active: showFilters,
            badge: hasActiveFilters
        }
    ];

    return (
        <DataTable
            data={visits}
            columns={defaultColumns}
            title="Lista wizyt"
            emptyStateConfig={emptyStateConfig}
            onItemClick={onVisitClick}
            renderCell={renderCell}
            enableDragAndDrop={true}
            enableViewToggle={false} // Wyłączone dla wizyt
            defaultViewMode="table"
            storageKeys={storageKeys}
            headerActions={headerActions}
            expandableContent={filtersComponent}
            expandableVisible={showFilters}
        />
    );
};