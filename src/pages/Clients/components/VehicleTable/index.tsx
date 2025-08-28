// src/pages/Clients/components/VehicleTable/index.tsx
import React from 'react';
import { FaCar } from 'react-icons/fa';
import { DataTable, TableColumn } from '../../../../components/common/DataTable';
import { VehicleExpanded } from '../../../../types';
import { VehicleCellRenderer } from './VehicleCellRenderer';
import { VehicleCard } from './VehicleCard';

interface VehicleTableProps {
    vehicles: VehicleExpanded[];
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onEditVehicle: (vehicle: VehicleExpanded) => void;
    onDeleteVehicle: (vehicleId: string) => void;
    onShowHistory: (vehicle: VehicleExpanded) => void;
}

const defaultColumns: TableColumn[] = [
    { id: 'licensePlate', label: 'Nr rejestracyjny', width: '200px', sortable: true },
    { id: 'vehicle', label: 'Pojazd', width: '320px', sortable: true },
    { id: 'owners', label: 'Właściciele', width: '300px', sortable: true },
    { id: 'services', label: 'Liczba wizyt', width: '140px', sortable: true },
    { id: 'lastService', label: 'Ostatnia wizyta', width: '160px', sortable: true },
    { id: 'revenue', label: 'Przychody', width: '140px', sortable: true },
    { id: 'actions', label: 'Akcje', width: '320px', sortable: false },
];

const emptyStateConfig = {
    icon: FaCar,
    title: 'Brak pojazdów',
    description: 'Nie znaleziono żadnych pojazdów w bazie danych',
    actionText: 'Kliknij "Dodaj pojazd", aby utworzyć pierwszy wpis'
};

const storageKeys = {
    viewMode: 'vehicle_view_mode',
    columnOrder: 'vehicle_table_columns_order'
};

export const VehicleTable: React.FC<VehicleTableProps> = (props) => {
    const { vehicles, ...handlers } = props;

    const renderCell = (vehicle: VehicleExpanded, columnId: string) => (
        <VehicleCellRenderer
            vehicle={vehicle}
    columnId={columnId}
    {...handlers}
    />
);

    const renderCard = (vehicle: VehicleExpanded) => (
        <VehicleCard
            vehicle={vehicle}
    {...handlers}
    />
);

    return (
        <DataTable
            data={vehicles}
    columns={defaultColumns}
    title="Lista pojazdów"
    emptyStateConfig={emptyStateConfig}
    onItemClick={handlers.onSelectVehicle}
    renderCell={renderCell}
    renderCard={renderCard}
    enableDragAndDrop={true}
    enableViewToggle={true}
    defaultViewMode="table"
    storageKeys={storageKeys}
    />
);
};