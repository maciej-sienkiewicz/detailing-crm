// src/pages/Clients/index.tsx - Zaktualizowany z nową strukturą filtrów
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo} from 'react';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { ClientTable } from './components/ClientTable';
import ClientDetailDrawer from './components/ClientDetailDrawer';
import ClientFormModal from './components/ClientFormModal';
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";

import {useClientFilters, useClientOperations, useClientSelection, useOwnersPageState} from './OwnersPage/hooks';
import {
    BulkSmsModalContent,
    EmptyStateDisplay,
    LoadingDisplay,
    SearchResultsDisplay
} from './OwnersPage/components';
import {ContentContainer, MainContent, PaginationContainer} from './OwnersPage/styles';
import {ClientFilters, OwnersPageContentProps, OwnersPageRef} from './OwnersPage/types';
import EnhancedClientFilters from "./OwnersPage/EnhancedClientFilters";

const OwnersPageContent = forwardRef<OwnersPageRef, OwnersPageContentProps>(({
                                                                                 onSetRef,
                                                                                 initialClientId,
                                                                                 onNavigateToVehiclesByOwner,
                                                                                 onClearDetailParams,
                                                                                 onClientSelected,
                                                                                 onClientClosed
                                                                             }, ref) => {
    const { state, updateState } = useOwnersPageState();
    const { loadClients } = useClientFilters();
    const {
        editClient,
        deleteClient,
        navigateToVehicles,
        updateContactAttempt,
        exportClients,
        sendSMS
    } = useClientOperations();
    const {
        selectedClientIds,
        selectAll,
        toggleClientSelection,
        toggleSelectAll,
        clearSelection,
        setSelectAll
    } = useClientSelection();

    const handleAddClient = useCallback(() => {
        updateState({
            selectedClient: null,
            showAddModal: true
        });
    }, [updateState]);

    const handleExportClients = useCallback(() => {
        exportClients();
    }, [exportClients]);

    const handleOpenBulkSmsModal = useCallback(() => {
        if (selectedClientIds.length === 0) {
            return;
        }
        updateState({ showBulkSmsModal: true });
    }, [selectedClientIds.length, updateState]);

    const openClientDetail = useCallback((clientId: string) => {
        const client = state.clients.find(c => c.id === clientId);
        if (client) {
            updateState({
                selectedClient: client,
                showDetailDrawer: true,
                manuallyClosedDrawer: false
            });
            onClientSelected?.(clientId);
        }
    }, [state.clients, updateState, onClientSelected]);

    const closeClientDetail = useCallback(() => {
        updateState({
            showDetailDrawer: false,
            selectedClient: null,
            manuallyClosedDrawer: true
        });
        onClientClosed?.();
    }, [updateState, onClientClosed]);

    const refObject = useMemo(() => ({
        handleAddClient,
        handleExportClients,
        handleOpenBulkSmsModal,
        selectedClientIds,
        openClientDetail
    }), [handleAddClient, handleExportClients, handleOpenBulkSmsModal, selectedClientIds, openClientDetail]);

    useImperativeHandle(ref, () => refObject, [refObject]);

    useEffect(() => {
        if (onSetRef) {
            onSetRef(refObject);
        }
    }, [onSetRef, refObject]);

    useEffect(() => {
        if (initialClientId && state.clients.length > 0 && !state.manuallyClosedDrawer) {
            const client = state.clients.find(c => c.id === initialClientId);
            if (client && (!state.showDetailDrawer || state.selectedClient?.id !== initialClientId)) {
                openClientDetail(initialClientId);
            }
        }
    }, [initialClientId, state.clients.length, openClientDetail, state.showDetailDrawer, state.selectedClient?.id, state.manuallyClosedDrawer]);

    useEffect(() => {
        if (initialClientId !== state.selectedClient?.id) {
            updateState({ manuallyClosedDrawer: false });
        }
    }, [initialClientId, state.selectedClient?.id, updateState]);

    const performLoadClients = useCallback(async (page: number = 0, filters: ClientFilters = state.appliedFilters) => {
        updateState({ loading: true });

        const result = await loadClients(page, filters);

        updateState({
            clients: result.clients,
            currentPage: result.pagination.currentPage,
            totalItems: result.pagination.totalItems,
            totalPages: result.pagination.totalPages,
            loading: false
        });

        clearSelection();
    }, [loadClients, state.appliedFilters, updateState, clearSelection]);

    useEffect(() => {
        performLoadClients(0);
    }, []);

    const handleFiltersChange = useCallback((filters: ClientFilters) => {
        updateState({ filters });
    }, [updateState]);

    const handleApplyFilters = useCallback(() => {
        updateState({
            appliedFilters: state.filters,
            currentPage: 0
        });
        performLoadClients(0, state.filters);
    }, [state.filters, updateState, performLoadClients]);

    const handleResetFilters = useCallback(() => {
        const emptyFilters = {
            name: '',
            email: '',
            phone: '',
            minVisits: '',
            minVehicles: '',
            minRevenue: ''
        };
        updateState({
            filters: emptyFilters,
            appliedFilters: emptyFilters,
            currentPage: 0
        });
        performLoadClients(0, emptyFilters);
    }, [updateState, performLoadClients]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage !== state.currentPage + 1 && newPage >= 1 && newPage <= state.totalPages) {
            performLoadClients(newPage - 1, state.appliedFilters);
        }
    }, [state.currentPage, state.totalPages, performLoadClients, state.appliedFilters]);

    const handleEditClient = useCallback(async (client: any) => {
        updateState({ loading: true });
        const result = await editClient(client);
        updateState({
            selectedClient: result.client,
            showAddModal: true,
            loading: false
        });
    }, [editClient, updateState]);

    const handleSaveClient = useCallback(async () => {
        updateState({ showAddModal: false });
        await performLoadClients(state.currentPage, state.appliedFilters);
    }, [updateState, performLoadClients, state.currentPage, state.appliedFilters]);

    const handleDeleteClick = useCallback((clientId: string) => {
        const client = state.clients.find(c => c.id === clientId);
        if (client) {
            updateState({
                selectedClient: client,
                showDeleteConfirm: true
            });
        }
    }, [state.clients, updateState]);

    const handleConfirmDelete = useCallback(async () => {
        if (!state.selectedClient) return;

        const result = await deleteClient(state.selectedClient.id);

        if (result.success) {
            updateState({
                showDeleteConfirm: false,
                selectedClient: null
            });

            if (state.showDetailDrawer) {
                closeClientDetail();
            }

            performLoadClients(state.currentPage, state.appliedFilters);
        }
    }, [state.selectedClient, deleteClient, updateState, state.showDetailDrawer, closeClientDetail, performLoadClients, state.currentPage, state.appliedFilters]);

    const handleShowVehicles = useCallback((clientId: string) => {
        navigateToVehicles(clientId, onNavigateToVehiclesByOwner);
    }, [navigateToVehicles, onNavigateToVehiclesByOwner]);

    const handleAddContactAttempt = useCallback((client: any) => {
        updateState({
            selectedClient: client,
            showContactModal: true
        });
    }, [updateState]);

    const handleContactSaved = useCallback(async () => {
        if (state.selectedClient) {
            const result = await updateContactAttempt(state.selectedClient.id);
            if (result.success && result.client) {
                updateState({
                    clients: state.clients.map(c =>
                        c.id === result.client!.id ? result.client! : c
                    ),
                    selectedClient: result.client
                });
            }
        }
        updateState({ showContactModal: false });
    }, [state.selectedClient, state.clients, updateContactAttempt, updateState]);

    const handleSendSMS = useCallback((client: any) => {
        sendSMS(client);
    }, [sendSMS]);

    const handleSelectClient = useCallback((client: any) => {
        updateState({
            selectedClient: client,
            showDetailDrawer: true,
            manuallyClosedDrawer: false
        });
        onClientSelected?.(client.id);
    }, [updateState, onClientSelected]);

    const handleToggleSelectAll = useCallback(() => {
        toggleSelectAll(state.clients);
    }, [toggleSelectAll, state.clients]);

    const handleSendBulkSms = useCallback(() => {
        if (state.bulkSmsText.trim() === '') {
            return;
        }

        updateState({
            bulkSmsText: '',
            showBulkSmsModal: false
        });
        clearSelection();
    }, [state.bulkSmsText, updateState, clearSelection]);

    const hasActiveFilters = useMemo(() => {
        return Object.values(state.appliedFilters).some(val => val !== '');
    }, [state.appliedFilters]);

    // Enhanced filters component
    const filtersComponent = (
        <EnhancedClientFilters
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
                        />

                        {state.clients.length === 0 ? (
                            <EmptyStateDisplay
                                hasActiveFilters={hasActiveFilters}
                                onResetFilters={handleResetFilters}
                            />
                        ) : (
                            <ClientTable
                                clients={state.clients}
                                selectedClientIds={selectedClientIds}
                                selectAll={selectAll}
                                showFilters={state.showFilters}
                                hasActiveFilters={hasActiveFilters}
                                onToggleSelection={toggleClientSelection}
                                onSelectClient={handleSelectClient}
                                onEditClient={handleEditClient}
                                onDeleteClient={handleDeleteClick}
                                onShowVehicles={handleShowVehicles}
                                onAddContactAttempt={handleAddContactAttempt}
                                onSendSMS={handleSendSMS}
                                onToggleSelectAll={handleToggleSelectAll}
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

            <ClientDetailDrawer
                isOpen={state.showDetailDrawer}
                client={state.selectedClient}
                onClose={closeClientDetail}
            />

            {state.showAddModal && (
                <ClientFormModal
                    client={state.selectedClient}
                    onSave={handleSaveClient}
                    onCancel={() => updateState({ showAddModal: false })}
                />
            )}

            <DeleteConfirmationModal
                isOpen={state.showDeleteConfirm}
                client={state.selectedClient}
                onConfirm={handleConfirmDelete}
                onCancel={() => updateState({ showDeleteConfirm: false })}
            />

            {state.showBulkSmsModal && (
                <Modal
                    isOpen={state.showBulkSmsModal}
                    onClose={() => updateState({ showBulkSmsModal: false })}
                    title="Masowe wysyłanie SMS"
                >
                    <BulkSmsModalContent
                        selectedClientIds={selectedClientIds}
                        bulkSmsText={state.bulkSmsText}
                        onTextChange={(text) => updateState({ bulkSmsText: text })}
                        onSend={handleSendBulkSms}
                        onCancel={() => updateState({ showBulkSmsModal: false })}
                    />
                </Modal>
            )}
        </ContentContainer>
    );
});

OwnersPageContent.displayName = 'OwnersPageContent';

export default OwnersPageContent;