import React, {useEffect, useState} from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import styled from 'styled-components';
import {FaList, FaTable} from 'react-icons/fa';
import {VehicleExpanded} from '../../../types';
import {useVehicleTableConfiguration} from './hooks/useVehicleTableConfiguration';
import {useVehicleSorting} from './hooks/useVehicleSorting';
import {TableView} from './TableView';
import {CardsView} from './CardsView';
import {EmptyState} from './EmptyState';
import {ListContainer, ListHeader, ListTitle} from './styles/components';

type ViewMode = 'table' | 'cards';
const VIEW_MODE_KEY = 'vehicle_view_mode';

const ViewControls = styled.div`
    display: flex;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
`;

const ViewButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 36px;
    border: none;
    background: ${props => props.$active ? 'var(--brand-primary, #1a365d)' : '#ffffff'};
    color: ${props => props.$active ? 'white' : '#64748b'};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;

    &:hover {
        background: ${props => props.$active ? 'var(--brand-primary-dark, #0f2027)' : 'rgba(26, 54, 93, 0.04)'};
        color: ${props => props.$active ? 'white' : 'var(--brand-primary, #1a365d)'};
    }

    &:not(:last-child) {
        border-right: 1px solid #e2e8f0;
    }
`;

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
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem(VIEW_MODE_KEY);
        return (saved as ViewMode) || 'table';
    });

    const { columns, moveColumn } = useVehicleTableConfiguration();
    const { sortedVehicles, sortColumn, sortDirection, handleSort } = useVehicleSorting(vehicles);

    useEffect(() => {
        try {
            localStorage.setItem(VIEW_MODE_KEY, viewMode);
        } catch (e) {
            console.error("Error saving view mode:", e);
        }
    }, [viewMode]);

    const handleQuickAction = (action: string, vehicle: VehicleExpanded, e: React.MouseEvent) => {
        e.stopPropagation();

        switch (action) {
            case 'view':
                onSelectVehicle(vehicle);
                break;
            case 'edit':
                onEditVehicle(vehicle);
                break;
            case 'delete':
                if (window.confirm('Czy na pewno chcesz usunąć ten pojazd?')) {
                    onDeleteVehicle(vehicle.id);
                }
                break;
            case 'history':
                onShowHistory(vehicle);
                break;
        }
    };

    if (vehicles.length === 0) {
        return (
            <ListContainer>
                <EmptyState />
            </ListContainer>
        );
    }

    return (
        <ListContainer>
            <ListHeader>
                <ListTitle>
                    Lista pojazdów ({vehicles.length})
                </ListTitle>
                <ViewControls>
                    <ViewButton
                        $active={viewMode === 'table'}
                        onClick={() => setViewMode('table')}
                        title="Widok tabeli"
                    >
                        <FaTable />
                    </ViewButton>
                    <ViewButton
                        $active={viewMode === 'cards'}
                        onClick={() => setViewMode('cards')}
                        title="Widok kart"
                    >
                        <FaList />
                    </ViewButton>
                </ViewControls>
            </ListHeader>

            {viewMode === 'table' ? (
                <DndProvider backend={HTML5Backend}>
                    <TableView
                        vehicles={sortedVehicles}
                        columns={columns}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSelectVehicle={onSelectVehicle}
                        onQuickAction={handleQuickAction}
                        onMoveColumn={moveColumn}
                        onSort={handleSort}
                    />
                </DndProvider>
            ) : (
                <CardsView
                    vehicles={sortedVehicles}
                    onSelectVehicle={onSelectVehicle}
                    onQuickAction={handleQuickAction}
                />
            )}
        </ListContainer>
    );
};

export default VehicleListTable;