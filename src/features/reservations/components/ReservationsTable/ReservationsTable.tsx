// src/features/reservations/components/ReservationsTable/ReservationsTable.tsx
import React from 'react';
import { FaCalendarAlt, FaFilter, FaEye, FaEdit, FaBan, FaTrash, FaArrowRight } from 'react-icons/fa';
import {Reservation, ReservationStatus} from "../../api/reservationsApi";
import {ActionButtons, DataTable, HeaderAction, TableColumn} from "../../../../components/common/DataTable";
import {ContextMenu, ContextMenuItem} from "../../../../components/common/ContextMenu";

interface ReservationsTableProps {
    reservations: Reservation[];
    loading?: boolean;
    showFilters?: boolean;
    hasActiveFilters?: boolean;
    onReservationClick?: (reservation: Reservation) => void;
    onViewReservation?: (reservation: Reservation) => void;
    onEditReservation?: (reservationId: string) => void;
    onStartVisit: (reservation: Reservation) => void;
    onCancelReservation?: (reservationId: string) => void;
    onDeleteReservation?: (reservationId: string) => void;
    onToggleFilters?: () => void;
    filtersComponent?: React.ReactNode;
}

const defaultColumns: TableColumn[] = [
    { id: 'vehicle', label: 'Pojazd', width: '20%', sortable: true },
    { id: 'contact', label: 'Kontakt', width: '18%', sortable: true },
    { id: 'scheduledDate', label: 'Planowany przyjazd', width: '16%', sortable: true },
    { id: 'value', label: 'Wartość', width: '14%', sortable: true },
    { id: 'lastUpdate', label: 'Aktualizacja', width: '14%', sortable: true },
    { id: 'actions', label: 'Akcje', width: '60px', sortable: false },
];

const emptyStateConfig = {
    icon: FaCalendarAlt,
    title: 'Brak rezerwacji',
    description: 'Nie znaleziono rezerwacji spełniających kryteria wyszukiwania',
    actionText: 'Spróbuj zmienić kryteria filtrowania lub dodać nową rezerwację'
};

const storageKeys = {
    viewMode: 'reservations_view_mode',
    columnOrder: 'reservations_table_columns_order'
};

export const ReservationsTable: React.FC<ReservationsTableProps> = ({
                                                                        reservations,
                                                                        loading = false,
                                                                        showFilters = false,
                                                                        hasActiveFilters = false,
                                                                        onReservationClick,
                                                                        onViewReservation,
                                                                        onEditReservation,
                                                                        onStartVisit,
                                                                        onCancelReservation,
                                                                        onDeleteReservation,
                                                                        onToggleFilters,
                                                                        filtersComponent
                                                                    }) => {
    const formatDate = (dateValue: string): string => {
        return dateValue
    };

    const renderCell = (reservation: Reservation, columnId: string) => {
        switch (columnId) {
            case 'vehicle':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12px' }}>
                            {reservation.vehicleMake} {reservation.vehicleModel}
                        </div>
                    </div>
                );

            case 'contact':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                        {reservation.contactName && (
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12px' }}>
                                {reservation.contactName}
                            </div>
                        )}
                        <div style={{
                            fontSize: '11px',
                            color: reservation.contactName ? '#64748b' : '#0f172a',
                            fontWeight: reservation.contactName ? 400 : 600
                        }}>
                            {reservation.contactPhone}
                        </div>
                    </div>
                );

            case 'scheduledDate':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
                        <div style={{ color: '#0f172a', fontWeight: 600 }}>
                            {formatDate(reservation.startDate)}
                        </div>
                        {reservation.endDate && (
                            <div style={{ color: '#64748b' }}>
                                do: {formatDate(reservation.endDate)}
                            </div>
                        )}
                    </div>
                );

            case 'value':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '12px' }}>
                            {reservation.totalPriceNetto.toFixed(2)} PLN (netto)
                        </div>
                        <div style={{ fontWeight: 600, color: '#475569', fontSize: '11px', marginTop: '2px' }}>
                            {reservation.totalPriceBrutto.toFixed(2)} PLN (brutto)
                        </div>
                    </div>
                );

            case 'lastUpdate':
                return (
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {formatDate(reservation.updatedAt)}
                    </div>
                );

            case 'actions':
                const menuItems: ContextMenuItem[] = [];

                menuItems.push(
                    {
                        id: 'view',
                        label: 'Podgląd',
                        icon: FaEye,
                        onClick: () => onViewReservation?.(reservation),
                        variant: 'primary'
                    },
                    {
                        id: 'edit',
                        label: 'Edytuj',
                        icon: FaEdit,
                        onClick: () => onEditReservation?.(reservation.id),
                        variant: 'primary'
                    },
                    {
                        id: 'start-visit',
                        label: 'Rozpocznij wizytę',
                        icon: FaArrowRight,
                        onClick: () => onStartVisit(reservation),
                        variant: 'primary'
                    }
                );

                // Show cancel only for non-cancelled reservations
                if (reservation.status !== ReservationStatus.CANCELLED && reservation.status !== ReservationStatus.CONVERTED) {
                    menuItems.push({
                        id: 'cancel',
                        label: 'Anuluj',
                        icon: FaBan,
                        onClick: () => onCancelReservation?.(reservation.id),
                        variant: 'primary'
                    });
                }

                menuItems.push({
                    id: 'delete',
                    label: 'Usuń',
                    icon: FaTrash,
                    onClick: () => onDeleteReservation?.(reservation.id),
                    variant: 'danger'
                });

                return (
                    <ActionButtons onClick={(e) => e.stopPropagation()}>
                        <ContextMenu items={menuItems} size="medium" />
                    </ActionButtons>
                );

            default:
                return null;
        }
    };

    const headerActions: HeaderAction[] = onToggleFilters ? [
        {
            id: 'filters',
            label: 'Filtrowanie',
            icon: FaFilter,
            onClick: onToggleFilters,
            variant: 'filter',
            active: showFilters,
            badge: hasActiveFilters
        }
    ] : [];

    return (
        <DataTable
            data={reservations}
            columns={defaultColumns}
            title="Lista rezerwacji"
            emptyStateConfig={emptyStateConfig}
            onItemClick={onReservationClick}
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