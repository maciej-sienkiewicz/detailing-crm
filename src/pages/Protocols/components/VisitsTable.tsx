import React from 'react';
import { FaClipboardCheck, FaFilter, FaEye, FaTrash, FaEdit } from 'react-icons/fa';
import { DataTable, TableColumn, HeaderAction, ActionButtons } from '../../../components/common/DataTable';
import { ContextMenu, ContextMenuItem } from '../../../components/common/ContextMenu';
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
    { id: 'vehicle', label: 'Pojazd', width: '18%', sortable: true },
    { id: 'licensePlate', label: 'Nr rej.', width: '90px', sortable: true },
    { id: 'client', label: 'Klient', width: '16%', sortable: true },
    { id: 'period', label: 'Okres', width: '18%', sortable: true },
    { id: 'status', label: 'Status', width: '11%', sortable: true },
    { id: 'value', label: 'Wartość', width: '10%', sortable: true },
    { id: 'lastUpdate', label: 'Aktualizacja', width: '13%', sortable: true },
    { id: 'actions', label: 'Akcje', width: '60px', sortable: false },
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
    const formatDate = (dateValue: string | number[]): string => {
        if (!dateValue) return '';

        let date: Date;

        if (Array.isArray(dateValue)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
            date = new Date(year, month - 1, day, hour, minute, second);
        } else {
            date = new Date(dateValue);
        }

        if (isNaN(date.getTime())) return '';

        const formattedDate = date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const hasTime = Array.isArray(dateValue)
            ? (dateValue[3] !== undefined && (dateValue[3] !== 23 || dateValue[4] !== 59))
            : (typeof dateValue === 'string' && dateValue.includes('T') && !dateValue.includes('23:59:59'));

        if (hasTime) {
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12px' }}>
                            {visit.vehicle.make} {visit.vehicle.model}
                        </div>
                        {visit.vehicle.productionYear > 0 && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Rok: {visit.vehicle.productionYear}
                            </div>
                        )}
                    </div>
                );

            case 'licensePlate':
                if (!visit.vehicle.licensePlate || visit.vehicle.licensePlate.trim() === '') {
                    return null;
                }
                return (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 6px',
                        background: 'rgba(26, 54, 93, 0.04)',
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        borderRadius: '4px',
                        fontWeight: 700,
                        color: 'var(--brand-primary, #1a365d)',
                        fontSize: '11px',
                        letterSpacing: '0.4px',
                        textTransform: 'uppercase' as const
                    }}>
                        {visit.vehicle.licensePlate}
                    </div>
                );

            case 'client':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12px' }}>
                            {visit.owner.name}
                        </div>
                        {visit.owner.companyName && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {visit.owner.companyName}
                            </div>
                        )}
                    </div>
                );

            case 'period':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '12px' }}>
                            {visit.totalAmountNetto.toFixed(2)} PLN (netto)
                        </div>
                        <div style={{ color: '#64748b' }}>
                            {visit.totalAmountBrutto.toFixed(2)} PLN (brutto)
                        </div>
                    </div>
                );

            case 'lastUpdate':
                return (
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {typeof visit.lastUpdate === 'string'
                            ? visit.lastUpdate
                            : formatDate(visit.lastUpdate)
                        }
                    </div>
                );

            case 'actions':
                const menuItems: ContextMenuItem[] = [
                    {
                        id: 'view',
                        label: 'Zobacz szczegóły',
                        icon: FaEye,
                        onClick: () => onViewVisit?.(visit),
                        variant: 'primary'
                    },
                    {
                        id: 'delete',
                        label: 'Usuń wizytę',
                        icon: FaTrash,
                        onClick: () => onDeleteVisit?.(visit.id),
                        variant: 'danger',
                        hidden: !onDeleteVisit
                    }
                ];

                return (
                    <ActionButtons onClick={(e) => e.stopPropagation()}>
                        <ContextMenu items={menuItems} size="medium" />
                    </ActionButtons>
                );

            default:
                return null;
        }
    };

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
            enableViewToggle={false}
            defaultViewMode="table"
            storageKeys={storageKeys}
            headerActions={headerActions}
            expandableContent={filtersComponent}
            expandableVisible={showFilters}
        />
    );
};