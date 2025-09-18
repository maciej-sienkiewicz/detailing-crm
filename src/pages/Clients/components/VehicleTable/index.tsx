// src/pages/Clients/components/VehicleTable/index.tsx - POPRAWIONE SZEROKOŚCI
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaFilter } from 'react-icons/fa';
import { DataTable, TableColumn, HeaderAction } from '../../../../components/common/DataTable';
import { VehicleExpanded } from '../../../../types';
import { VehicleCellRenderer } from './VehicleCellRenderer';
import { VehicleCard } from './VehicleCard';

interface VehicleTableProps {
    vehicles: VehicleExpanded[];
    showFilters: boolean;
    hasActiveFilters: boolean;
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onEditVehicle: (vehicle: VehicleExpanded) => void;
    onDeleteVehicle: (vehicleId: string) => void;
    onShowHistory: (vehicle: VehicleExpanded) => void;
    onToggleFilters: () => void;
    filtersComponent?: React.ReactNode;
}

// POPRAWIONE: Optymalne szerokości dla tabeli pojazdów
const defaultColumns: TableColumn[] = [
    { id: 'licensePlate', label: 'Nr rej.', width: '130px', sortable: true }, // Skrócona nazwa, mniejsza szerokość
    { id: 'vehicle', label: 'Pojazd', width: '28%', sortable: true }, // Największa - marka/model/rok
    { id: 'owners', label: 'Właściciele', width: '20%', sortable: true }, // Bardzo szeroka - może być kilku
    { id: 'services', label: 'Wizyty', width: '8%', sortable: true }, // Minimalna - tylko liczba
    { id: 'lastService', label: 'Ostatnia wizyta', width: '11%', sortable: true }, // Średnia - data
    { id: 'revenue', label: 'Przychody', width: '12%', sortable: true }, // Kompaktowa - kwota
    { id: 'actions', label: 'Akcje', width: '140px', sortable: false }, // Mniejsza - 3 przyciski
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

export const VehicleTable: React.FC<VehicleTableProps> = ({
                                                              vehicles,
                                                              showFilters,
                                                              hasActiveFilters,
                                                              onSelectVehicle,
                                                              onEditVehicle,
                                                              onDeleteVehicle,
                                                              onShowHistory,
                                                              onToggleFilters,
                                                              filtersComponent
                                                          }) => {
    const navigate = useNavigate();

    const handleSelectVehicle = (vehicle: VehicleExpanded) => {
        navigate(`/vehicle/${vehicle.id}`);
    };

    const renderCell = (vehicle: VehicleExpanded, columnId: string) => (
        <VehicleCellRenderer
            vehicle={vehicle}
            columnId={columnId}
            onSelectVehicle={handleSelectVehicle}
            onEditVehicle={onEditVehicle}
            onDeleteVehicle={onDeleteVehicle}
            onShowHistory={onShowHistory}
        />
    );

    const renderCard = (vehicle: VehicleExpanded) => (
        <VehicleCard
            vehicle={vehicle}
            onSelectVehicle={handleSelectVehicle}
            onEditVehicle={onEditVehicle}
            onDeleteVehicle={onDeleteVehicle}
            onShowHistory={onShowHistory}
        />
    );

    const headerActions: HeaderAction[] = [
        {
            id: 'filters',
            label: 'Filtry',
            icon: FaFilter,
            onClick: onToggleFilters,
            variant: 'filter',
            active: showFilters,
            badge: hasActiveFilters
        }
    ];

    return (
        <DataTable
            data={vehicles}
            columns={defaultColumns}
            title="Lista pojazdów"
            emptyStateConfig={emptyStateConfig}
            onItemClick={handleSelectVehicle}
            renderCell={renderCell}
            renderCard={renderCard}
            enableDragAndDrop={true}
            enableViewToggle={true}
            defaultViewMode="table"
            storageKeys={storageKeys}
            headerActions={headerActions}
            expandableContent={filtersComponent}
            expandableVisible={showFilters}
        />
    );
};