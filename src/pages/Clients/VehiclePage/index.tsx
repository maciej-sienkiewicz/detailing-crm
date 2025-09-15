// src/pages/Clients/VehiclePage/index.tsx - NAPRAWIONY
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo} from 'react';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import { VehicleTable } from '../components/VehicleTable';

import {useVehicleFilters, useVehicleOperations, useVehiclesPageState} from './hooks';
import { LoadingDisplay } from './components';
import {ContentContainer, MainContent, PaginationContainer} from './styles';
import {VehicleFilters, VehiclesPageContentProps, VehiclesPageRef} from './types';
import EnhancedVehicleFilters from "./EnhancedVehicleFilters";
import {useFormatters} from './hooks';
import VehicleFormModal from "../components/VehicleFormModal";
import VehicleHistoryModal from "../components/VehicleHistoryModal";

interface SearchResultsDisplayProps {
    hasActiveFilters: boolean;
    totalItems: number;
    onResetFilters: () => void;
    ownerName?: string | null;
}

const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({
                                                                       hasActiveFilters,
                                                                       totalItems,
                                                                       onResetFilters,
                                                                       ownerName
                                                                   }) => {
    const { formatVehicleCount } = useFormatters();

    if (!hasActiveFilters && !ownerName) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #e0f2fe 100%)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            borderRadius: '12px',
            marginBottom: '16px'
        }}>
            <div style={{ fontSize: '20px', flexShrink: 0 }}>🔍</div>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f172a'
                }}>
                    {ownerName
                        ? `Pojazdy właściciela: ${ownerName} - znaleziono ${totalItems} ${formatVehicleCount(totalItems)}`
                        : `Znaleziono ${totalItems} ${formatVehicleCount(totalItems)} spełniających kryteria wyszukiwania`
                    }
                </div>
                {totalItems === 0 && (
                    <div style={{
                        fontSize: '12px',
                        color: '#475569',
                        fontStyle: 'italic',
                        marginTop: '2px'
                    }}>
                        Spróbuj zmienić kryteria wyszukiwania lub wyczyść filtry
                    </div>
                )}
            </div>
        </div>
    );
};

interface EmptyStateDisplayProps {
    hasActiveFilters: boolean;
    onResetFilters: () => void;
    ownerName?: string | null;
}

const EmptyStateDisplay: React.FC<EmptyStateDisplayProps> = ({
                                                                 hasActiveFilters,
                                                                 onResetFilters,
                                                                 ownerName
                                                             }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '2px dashed #e2e8f0',
        textAlign: 'center',
        minHeight: '400px'
    }}>
        <div style={{
            width: '64px',
            height: '64px',
            background: '#fafbfc',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#64748b',
            marginBottom: '24px',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
        }}>
            {hasActiveFilters || ownerName ? '🔍' : '🚗'}
        </div>
        <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 8px 0',
            letterSpacing: '-0.025em'
        }}>
            {hasActiveFilters || ownerName ? 'Brak wyników' : 'Brak pojazdów'}
        </h3>
        <p style={{
            fontSize: '16px',
            color: '#475569',
            margin: '0 0 16px 0',
            lineHeight: '1.5'
        }}>
            {ownerName
                ? `Właściciel ${ownerName} nie ma jeszcze żadnych pojazdów w systemie`
                : hasActiveFilters
                    ? 'Nie znaleziono pojazdów spełniających podane kryteria'
                    : 'Nie znaleziono żadnych pojazdów w bazie danych'
            }
        </p>
        {(hasActiveFilters || ownerName) && (
            <button
                onClick={onResetFilters}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 24px',
                    background: '#1a365d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                Wyczyść filtry
            </button>
        )}
    </div>
);

const VehiclesPageContent = forwardRef<VehiclesPageRef, VehiclesPageContentProps>(({
                                                                                       onSetRef,
                                                                                       initialVehicleId,
                                                                                       filterByOwnerId,
                                                                                       onNavigateToClient,
                                                                                       onClearDetailParams,
                                                                                       onVehicleSelected,
                                                                                       onVehicleClosed
                                                                                   }, ref) => {
    const { state, updateState } = useVehiclesPageState();
    const { loadVehicles } = useVehicleFilters();
    const {
        editVehicle,
        deleteVehicle,
        navigateToClient,
        exportVehicles
    } = useVehicleOperations();

    const handleAddVehicle = useCallback(() => {
        console.log('➕ Opening add vehicle modal');
        updateState({
            selectedVehicle: null,
            showAddModal: true
        });
    }, [updateState]);

    const handleExportVehicles = useCallback(() => {
        exportVehicles();
    }, [exportVehicles]);

    const refObject = useMemo(() => ({
        handleAddVehicle,
        handleExportVehicles
    }), [handleAddVehicle, handleExportVehicles]);

    useImperativeHandle(ref, () => refObject, [refObject]);

    useEffect(() => {
        if (onSetRef) {
            onSetRef(refObject);
        }
    }, [onSetRef, refObject]);

    const performLoadVehicles = useCallback(async (
        page: number = 0,
        filters: VehicleFilters = state.appliedFilters,
        ownerId?: string
    ) => {
        console.log('🔄 Loading vehicles:', { page, filters, ownerId });
        updateState({ loading: true, error: null });

        const result = await loadVehicles(page, filters, ownerId);

        console.log('📊 Load vehicles result:', result);

        updateState({
            vehicles: result.vehicles,
            currentPage: result.pagination.currentPage,
            totalItems: result.pagination.totalItems,
            totalPages: result.pagination.totalPages,
            ownerName: result.ownerName,
            error: result.error,
            loading: false
        });
    }, [loadVehicles, state.appliedFilters, updateState]);

    useEffect(() => {
        performLoadVehicles(0, state.appliedFilters, filterByOwnerId);
    }, [filterByOwnerId]);

    const handleFiltersChange = useCallback((filters: VehicleFilters) => {
        updateState({ filters });
    }, [updateState]);

    const handleApplyFilters = useCallback(() => {
        updateState({
            appliedFilters: state.filters,
            currentPage: 0
        });
        performLoadVehicles(0, state.filters, filterByOwnerId);
    }, [state.filters, updateState, performLoadVehicles, filterByOwnerId]);

    const handleResetFilters = useCallback(() => {
        const emptyFilters = {
            licensePlate: '',
            make: '',
            model: '',
            ownerName: '',
            minServices: '',
            maxServices: ''
        };
        updateState({
            filters: emptyFilters,
            appliedFilters: emptyFilters,
            currentPage: 0
        });
        performLoadVehicles(0, emptyFilters, filterByOwnerId);
    }, [updateState, performLoadVehicles, filterByOwnerId]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage !== state.currentPage + 1 && newPage >= 1 && newPage <= state.totalPages) {
            performLoadVehicles(newPage - 1, state.appliedFilters, filterByOwnerId);
        }
    }, [state.currentPage, state.totalPages, performLoadVehicles, state.appliedFilters, filterByOwnerId]);

    const handleEditVehicle = useCallback(async (vehicle: any) => {
        console.log('✏️ Edit vehicle clicked:', vehicle.id);
        updateState({ loading: true });
        const result = await editVehicle(vehicle);
        updateState({
            selectedVehicle: result.vehicle,
            showAddModal: true,
            loading: false
        });
    }, [editVehicle, updateState]);

    // NAPRAWIONO: Funkcja handleSaveVehicle - przeładowuje dane po zapisaniu
    const handleSaveVehicle = useCallback(async () => {
        console.log('💾 Vehicle saved, reloading data...');
        updateState({ showAddModal: false, selectedVehicle: null });

        // Przeładuj dane pojazdów po zapisaniu
        await performLoadVehicles(state.currentPage, state.appliedFilters, filterByOwnerId);
    }, [updateState, performLoadVehicles, state.currentPage, state.appliedFilters, filterByOwnerId]);

    const handleDeleteClick = useCallback((vehicleId: string) => {
        console.log('🗑️ Delete vehicle clicked:', vehicleId);
        const vehicle = state.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            updateState({
                selectedVehicle: vehicle,
                showDeleteConfirm: true
            });
        }
    }, [state.vehicles, updateState]);

    const handleConfirmDelete = useCallback(async () => {
        if (!state.selectedVehicle) return;

        console.log('🗑️ Confirming vehicle deletion:', state.selectedVehicle.id);

        const result = await deleteVehicle(state.selectedVehicle.id);

        if (result.success) {
            console.log('✅ Vehicle deleted successfully, reloading data...');
            updateState({
                showDeleteConfirm: false,
                selectedVehicle: null
            });
            // Przeładuj dane po usunięciu
            performLoadVehicles(state.currentPage, state.appliedFilters, filterByOwnerId);
        } else {
            console.error('❌ Vehicle deletion failed');
            updateState({
                showDeleteConfirm: false,
                selectedVehicle: null
            });
        }
    }, [state.selectedVehicle, deleteVehicle, updateState, performLoadVehicles, state.currentPage, state.appliedFilters, filterByOwnerId]);

    const handleShowHistory = useCallback((vehicle: any) => {
        console.log('📋 Show history for vehicle:', vehicle.id);
        updateState({
            selectedVehicle: vehicle,
            showHistoryModal: true
        });
    }, [updateState]);

    const hasActiveFilters = useMemo(() => {
        return Object.values(state.appliedFilters).some(val => val !== '');
    }, [state.appliedFilters]);

    const filtersComponent = (
        <EnhancedVehicleFilters
            filters={state.filters}
            appliedFilters={state.appliedFilters}
            showFilters={state.showFilters}
            onToggleFilters={() => updateState({ showFilters: !state.showFilters })}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            resultCount={state.totalItems}
        />
    );

    return (
        <ContentContainer>
            <MainContent>
                {state.loading ? (
                    <LoadingDisplay hasActiveFilters={hasActiveFilters} />
                ) : (
                    <>
                        <SearchResultsDisplay
                            hasActiveFilters={hasActiveFilters}
                            totalItems={state.totalItems}
                            onResetFilters={handleResetFilters}
                            ownerName={state.ownerName}
                        />

                        {state.vehicles.length === 0 ? (
                            <EmptyStateDisplay
                                hasActiveFilters={hasActiveFilters}
                                onResetFilters={handleResetFilters}
                                ownerName={state.ownerName}
                            />
                        ) : (
                            <VehicleTable
                                vehicles={state.vehicles}
                                showFilters={state.showFilters}
                                hasActiveFilters={hasActiveFilters}
                                onSelectVehicle={() => {}}
                                onEditVehicle={handleEditVehicle}
                                onDeleteVehicle={handleDeleteClick}
                                onShowHistory={handleShowHistory}
                                onToggleFilters={() => updateState({ showFilters: !state.showFilters })}
                                filtersComponent={filtersComponent}
                            />
                        )}

                        {state.totalPages > 1 && (
                            <PaginationContainer>
                                <Pagination
                                    currentPage={state.currentPage + 1}
                                    totalPages={state.totalPages}
                                    onPageChange={handlePageChange}
                                    totalItems={state.totalItems}
                                    pageSize={25}
                                    showTotalItems={true}
                                />
                            </PaginationContainer>
                        )}
                    </>
                )}
            </MainContent>

            {/* NAPRAWIONY: Modal z VehicleFormModal - przekazuje tylko callback onSave */}
            {state.showAddModal && (
                <VehicleFormModal
                    vehicle={state.selectedVehicle}
                    defaultOwnerId={filterByOwnerId}
                    onSave={handleSaveVehicle}
                    onCancel={() => updateState({ showAddModal: false, selectedVehicle: null })}
                />
            )}

            {state.showHistoryModal && state.selectedVehicle && (
                <VehicleHistoryModal
                    vehicle={state.selectedVehicle}
                    onClose={() => updateState({ showHistoryModal: false, selectedVehicle: null })}
                />
            )}

            {state.showDeleteConfirm && state.selectedVehicle && (
                <Modal
                    isOpen={state.showDeleteConfirm}
                    onClose={() => updateState({ showDeleteConfirm: false, selectedVehicle: null })}
                    title="Potwierdź usunięcie pojazdu"
                >
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#fee2e2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#dc2626',
                            fontSize: '28px',
                            margin: '0 auto 16px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            🗑️
                        </div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#0f172a',
                            margin: '0 0 16px 0'
                        }}>
                            Czy na pewno chcesz usunąć pojazd?
                        </h3>
                        <div style={{
                            background: '#fafbfc',
                            border: '1px solid #f1f5f9',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#0f172a',
                                marginBottom: '8px'
                            }}>
                                {state.selectedVehicle.make} {state.selectedVehicle.model}
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#475569',
                                fontWeight: '500'
                            }}>
                                {state.selectedVehicle.licensePlate}
                            </div>
                        </div>
                        <p style={{
                            fontSize: '14px',
                            color: '#475569',
                            lineHeight: '1.5',
                            margin: '0 0 24px 0'
                        }}>
                            Ta operacja jest <strong style={{ color: '#dc2626' }}>nieodwracalna</strong>.
                            Wszystkie dane pojazdu zostają permanentnie usunięte.
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => updateState({ showDeleteConfirm: false, selectedVehicle: null })}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: '#ffffff',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minHeight: '44px'
                                }}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minHeight: '44px'
                                }}
                            >
                                Usuń pojazd
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </ContentContainer>
    );
});

VehiclesPageContent.displayName = 'VehiclesPageContent';

export default VehiclesPageContent;