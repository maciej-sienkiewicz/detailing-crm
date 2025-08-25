import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo} from 'react';
import {FaArrowLeft, FaExclamationTriangle} from 'react-icons/fa';
import VehicleDetailDrawer from '../components/VehicleDetailDrawer';
import VehicleFormModal from '../components/VehicleFormModal';
import VehicleHistoryModal from '../components/VehicleHistoryModal';

import {useVehicleFilters, useVehicleOperations, useVehiclesPageState} from './hooks';
import {LoadingDisplay} from './components';
import {
    BackButton,
    BackSection,
    ContentContainer,
    ErrorMessage,
    MainContent,
    OwnerInfo,
    OwnerName,
    OwnerTitle,
    PaginationContainer,
    TableContainer
} from './styles';
import {VehicleFilters, VehiclesPageContentProps, VehiclesPageRef} from './types';
import EnhancedVehicleFilters from './EnhancedVehicleFilters';
import Modal from "../../../components/common/Modal";
import VehicleListTable from "../VehicleListTable";
import Pagination from "../../../components/common/Pagination";

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
    const { loadVehicles, loadCompanyStatistics, convertFiltersToApiFormat } = useVehicleFilters();
    const {
        editVehicle,
        deleteVehicle,
        saveVehicle,
        navigateToClient,
        exportVehicles
    } = useVehicleOperations();

    const handleAddVehicle = useCallback(() => {
        updateState({
            selectedVehicle: null,
            showAddModal: true
        });
    }, [updateState]);

    const handleExportVehicles = useCallback(() => {
        exportVehicles();
    }, [exportVehicles]);

    const openVehicleDetail = useCallback((vehicleId: string) => {
        const vehicle = state.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            updateState({
                selectedVehicle: vehicle,
                showDetailDrawer: true,
                manuallyClosedDrawer: false
            });
            onVehicleSelected?.(vehicleId);
        }
    }, [state.vehicles, updateState, onVehicleSelected]);

    const closeVehicleDetail = useCallback(() => {
        updateState({
            showDetailDrawer: false,
            selectedVehicle: null,
            manuallyClosedDrawer: true
        });
        onVehicleClosed?.();
    }, [updateState, onVehicleClosed]);

    const refObject = useMemo(() => ({
        handleAddVehicle,
        handleExportVehicles,
        openVehicleDetail
    }), [handleAddVehicle, handleExportVehicles, openVehicleDetail]);

    useImperativeHandle(ref, () => refObject, [refObject]);

    useEffect(() => {
        if (onSetRef) {
            onSetRef(refObject);
        }
    }, [onSetRef, refObject]);

    useEffect(() => {
        if (initialVehicleId && state.vehicles.length > 0 && !state.manuallyClosedDrawer) {
            const vehicle = state.vehicles.find(v => v.id === initialVehicleId);
            if (vehicle && (!state.showDetailDrawer || state.selectedVehicle?.id !== initialVehicleId)) {
                openVehicleDetail(initialVehicleId);
            }
        }
    }, [initialVehicleId, state.vehicles.length, openVehicleDetail, state.showDetailDrawer, state.selectedVehicle?.id, state.manuallyClosedDrawer]);

    useEffect(() => {
        if (initialVehicleId !== state.selectedVehicle?.id) {
            updateState({ manuallyClosedDrawer: false });
        }
    }, [initialVehicleId, state.selectedVehicle?.id, updateState]);

    const performLoadVehicles = useCallback(async (page: number = 0, filters: VehicleFilters = state.appliedFilters) => {
        updateState({ loading: true, error: null });

        const result = await loadVehicles(page, filters, filterByOwnerId);

        updateState({
            vehicles: result.vehicles,
            currentPage: result.pagination.currentPage,
            totalItems: result.pagination.totalItems,
            totalPages: result.pagination.totalPages,
            ownerName: result.ownerName,
            error: result.error,
            loading: false
        });
    }, [loadVehicles, state.appliedFilters, updateState, filterByOwnerId]);

    useEffect(() => {
        performLoadVehicles(0);
    }, []);

    const handleFiltersChange = useCallback((filters: VehicleFilters) => {
        updateState({ filters });
    }, [updateState]);

    const handleApplyFilters = useCallback(() => {
        updateState({
            appliedFilters: state.filters,
            currentPage: 0
        });
        performLoadVehicles(0, state.filters);
    }, [state.filters, updateState, performLoadVehicles]);

    const handleResetFilters = useCallback(() => {
        const emptyFilters = {
            licensePlate: '',
            make: '',
            model: '',
            ownerName: filterByOwnerId ? state.ownerName || '' : '',
            minServices: '',
            maxServices: ''
        };
        updateState({
            filters: emptyFilters,
            appliedFilters: emptyFilters,
            currentPage: 0
        });
        performLoadVehicles(0, emptyFilters);
    }, [updateState, performLoadVehicles, filterByOwnerId, state.ownerName]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage !== state.currentPage + 1 && newPage >= 1 && newPage <= state.totalPages) {
            performLoadVehicles(newPage - 1, state.appliedFilters);
        }
    }, [state.currentPage, state.totalPages, performLoadVehicles, state.appliedFilters]);

    const handleEditVehicle = useCallback(async (vehicle: any) => {
        updateState({
            selectedVehicle: vehicle,
            showAddModal: true
        });
    }, [updateState]);

    const handleSaveVehicle = useCallback(async (vehicle: any) => {
        const isEdit = !!(state.selectedVehicle && state.selectedVehicle.id);
        const result = await saveVehicle(vehicle, isEdit);

        if (result.success) {
            updateState({ showAddModal: false });
            await performLoadVehicles(state.currentPage, state.appliedFilters);

            if (state.showDetailDrawer && result.vehicle) {
                updateState({ selectedVehicle: result.vehicle });
            }
        }
    }, [state.selectedVehicle, state.currentPage, state.appliedFilters, state.showDetailDrawer, saveVehicle, updateState, performLoadVehicles, filterByOwnerId, loadCompanyStatistics]);

    const handleDeleteClick = useCallback((vehicleId: string) => {
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

        const result = await deleteVehicle(state.selectedVehicle.id);

        if (result.success) {
            updateState({
                showDeleteConfirm: false,
                selectedVehicle: null
            });

            if (state.showDetailDrawer) {
                closeVehicleDetail();
            }

            await performLoadVehicles(state.currentPage, state.appliedFilters);
        }
    }, [state.selectedVehicle, state.showDetailDrawer, state.currentPage, state.appliedFilters, deleteVehicle, updateState, closeVehicleDetail, performLoadVehicles, filterByOwnerId, loadCompanyStatistics]);

    const handleShowHistory = useCallback((vehicle: any) => {
        updateState({
            selectedVehicle: vehicle,
            showHistoryModal: true
        });
    }, [updateState]);

    const handleSelectVehicle = useCallback((vehicle: any) => {
        updateState({
            selectedVehicle: vehicle,
            showDetailDrawer: true,
            manuallyClosedDrawer: false
        });
        onVehicleSelected?.(vehicle.id);
    }, [updateState, onVehicleSelected]);

    const handleBackToOwners = () => {
        if (onClearDetailParams) {
            onClearDetailParams();
        }
    };

    const hasActiveFilters = useMemo(() => {
        return Object.values(state.appliedFilters).some(val => val !== '');
    }, [state.appliedFilters]);

    return (
        <ContentContainer>
            {filterByOwnerId && state.ownerName && (
                <BackSection>
                    <BackButton onClick={handleBackToOwners}>
                        <FaArrowLeft />
                        Powrót do listy klientów
                    </BackButton>
                    <OwnerInfo>
                        <OwnerTitle>Pojazdy klienta:</OwnerTitle>
                        <OwnerName>{state.ownerName}</OwnerName>
                    </OwnerInfo>
                </BackSection>
            )}

            <MainContent>
                {!filterByOwnerId && (
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
                )}

                {state.error && (
                    <ErrorMessage>
                        <FaExclamationTriangle />
                        {state.error}
                    </ErrorMessage>
                )}

                {state.loading ? (
                    <LoadingDisplay hasActiveFilters={hasActiveFilters} />
                ) : (
                    <>
                        <TableContainer>
                            <VehicleListTable
                                vehicles={state.vehicles}
                                onSelectVehicle={handleSelectVehicle}
                                onEditVehicle={handleEditVehicle}
                                onDeleteVehicle={handleDeleteClick}
                                onShowHistory={handleShowHistory}
                            />
                        </TableContainer>

                        {state.totalPages > 1 && (
                            <PaginationContainer>
                                <Pagination
                                    currentPage={state.currentPage + 1}
                                    totalPages={state.totalPages}
                                    onPageChange={handlePageChange}
                                    totalItems={state.totalItems}
                                    pageSize={20}
                                    showTotalItems={true}
                                />
                            </PaginationContainer>
                        )}
                    </>
                )}
            </MainContent>

            <VehicleDetailDrawer
                isOpen={state.showDetailDrawer}
                vehicle={state.selectedVehicle}
                onClose={closeVehicleDetail}
            />

            {state.showAddModal && (
                <VehicleFormModal
                    vehicle={state.selectedVehicle}
                    defaultOwnerId={filterByOwnerId || undefined}
                    onSave={handleSaveVehicle}
                    onCancel={() => updateState({ showAddModal: false })}
                />
            )}

            {state.showHistoryModal && state.selectedVehicle && (
                <VehicleHistoryModal
                    vehicle={state.selectedVehicle}
                    onClose={() => updateState({ showHistoryModal: false })}
                />
            )}

            {state.showDeleteConfirm && state.selectedVehicle && (
                <Modal
                    isOpen={state.showDeleteConfirm}
                    onClose={() => updateState({ showDeleteConfirm: false })}
                    title="Potwierdź usunięcie"
                >
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#fee2e2',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#dc2626',
                                fontSize: '20px'
                            }}>
                                <FaExclamationTriangle />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                                    Czy na pewno chcesz usunąć pojazd?
                                </div>
                                <div style={{
                                    background: '#fafbfc',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <strong>{state.selectedVehicle.make} {state.selectedVehicle.model}</strong>
                                    <span style={{
                                        background: '#1a365d',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>{state.selectedVehicle.licensePlate}</span>
                                </div>
                                <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>
                                    Ta operacja jest nieodwracalna i usunie wszystkie dane serwisowe pojazdu.
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => updateState({ showDeleteConfirm: false })}
                                style={{
                                    padding: '8px 16px',
                                    background: '#ffffff',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                style={{
                                    padding: '8px 16px',
                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
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