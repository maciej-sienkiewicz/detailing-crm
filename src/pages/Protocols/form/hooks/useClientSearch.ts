// src/pages/Protocols/form/hooks/useClientSearch.ts
/**
 * Production-ready hook for client search operations in protocol forms
 * Handles search, selection, and form data population with proper error handling
 *
 * CONSISTENT LOGIC: Always show modals when results are found (same as vehicle search)
 */

import { useState, useCallback } from 'react';
import { CarReceptionProtocol, ClientExpanded, VehicleExpanded } from '../../../../types';
import { formSearchService, SearchCriteria } from '../../shared/services/FormSearchService';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export interface UseClientSearchResult {
    foundClients: ClientExpanded[];
    foundVehicles: VehicleExpanded[];
    showClientModal: boolean;
    showVehicleModal: boolean;
    searchError: string | null;
    searchLoading: boolean;
    handleSearchByClientField: (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => Promise<void>;
    handleClientSelect: (client: ClientExpanded) => void;
    handleVehicleSelect: (vehicle: VehicleExpanded) => void;
    setShowClientModal: (show: boolean) => void;
    setShowVehicleModal: (show: boolean) => void;
    clearSearchResults: () => void;
}

// ========================================================================================
// HOOK IMPLEMENTATION
// ========================================================================================

/**
 * Hook for handling client search operations in protocol forms
 *
 * @param formData - Current form data state
 * @param setFormData - Form data setter function
 * @returns Object with search state and handlers
 *
 * @example
 * ```typescript
 * const {
 *   foundClients,
 *   searchError,
 *   handleSearchByClientField,
 *   handleClientSelect
 * } = useClientSearch(formData, setFormData);
 *
 * // Search by client field
 * await handleSearchByClientField('email');
 *
 * // Handle client selection
 * handleClientSelect(selectedClient);
 * ```
 */
export const useClientSearch = (
    formData: Partial<CarReceptionProtocol>,
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>
): UseClientSearchResult => {

    // ========================================================================================
    // STATE MANAGEMENT
    // ========================================================================================

    const [foundClients, setFoundClients] = useState<ClientExpanded[]>([]);
    const [foundVehicles, setFoundVehicles] = useState<VehicleExpanded[]>([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // ========================================================================================
    // FORM DATA POPULATION HANDLERS
    // ========================================================================================

    /**
     * Populates form with client data
     */
    const populateClientData = useCallback((client: ClientExpanded): void => {
        try {
            const clientData = formSearchService.mapClientToFormData(client);

            setFormData(prev => ({
                ...prev,
                ...clientData
            }));
        } catch (error) {
            console.error('[useClientSearch] Failed to populate client data:', error);
            setSearchError('Błąd podczas uzupełniania danych klienta');
        }
    }, [setFormData]);

    /**
     * Populates form with vehicle data
     */
    const populateVehicleData = useCallback((vehicle: VehicleExpanded): void => {
        try {
            const vehicleData = formSearchService.mapVehicleToFormData(vehicle);

            setFormData(prev => ({
                ...prev,
                ...vehicleData
            }));
        } catch (error) {
            console.error('[useClientSearch] Failed to populate vehicle data:', error);
            setSearchError('Błąd podczas uzupełniania danych pojazdu');
        }
    }, [setFormData]);

    // ========================================================================================
    // SEARCH OPERATIONS
    // ========================================================================================

    /**
     * Handles search by client field
     */
    const handleSearchByClientField = useCallback(async (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone'): Promise<void> => {
        const fieldValue = formData[field] as string;

        // Validate input
        if (!fieldValue || fieldValue.trim() === '') {
            setSearchError('Pole wyszukiwania jest puste');
            return;
        }

        setSearchLoading(true);
        setSearchError(null);

        try {
            const criteria: SearchCriteria = { field, value: fieldValue };
            const results = await formSearchService.searchByField(criteria);

            setFoundClients(results.clients);

            // Handle search results based on what was found
            await handleSearchResults(results);

        } catch (error) {
            console.error('[useClientSearch] Search operation failed:', error);
            setSearchError(
                error instanceof Error
                    ? error.message
                    : 'Wystąpił błąd podczas wyszukiwania'
            );
        } finally {
            setSearchLoading(false);
        }
    }, [formData]);

    /**
     * Processes search results and determines appropriate UI flow
     * CONSISTENT LOGIC: Always show modal when clients are found
     */
    const handleSearchResults = useCallback(async (results: { vehicles: VehicleExpanded[], clients: ClientExpanded[] }): Promise<void> => {
        const { vehicles, clients } = results;

        if (clients.length === 0) {
            setSearchError('Nie znaleziono klientów o podanych danych');
            return;
        }

        // CONSISTENT LOGIC: Zawsze pokazuj modal jeśli znajdziesz klientów
        if (clients.length >= 1) {
            // Jeśli znaleziono klientów - pokaż modal wyboru klienta
            setShowClientModal(true);
        }
    }, []);

    // ========================================================================================
    // SELECTION HANDLERS
    // ========================================================================================

    /**
     * Handles client selection from modal
     */
    const handleClientSelect = useCallback((client: ClientExpanded): void => {
        populateClientData(client);
        setShowClientModal(false);

        // Po wyborze klienta, pobierz jego pojazdy
        formSearchService.getVehiclesForClient(client.id)
            .then(vehicles => {
                if (vehicles.length > 0) {
                    setFoundVehicles(vehicles);
                    // CONSISTENT LOGIC: Zawsze pokaż modal wyboru pojazdu jeśli klient ma pojazdy
                    setShowVehicleModal(true);
                } else {
                    // Klient nie ma pojazdów - to jest OK, formularz pozostanie z danymi klienta
                    console.log('[useClientSearch] Client has no vehicles registered');
                }
            })
            .catch(error => {
                console.error('[useClientSearch] Failed to fetch client vehicles:', error);
                // Nie pokazujemy błędu - brak pojazdów nie jest błędem krytycznym
            });
    }, [populateClientData]);

    /**
     * Handles vehicle selection from modal (client's vehicle)
     */
    const handleVehicleSelect = useCallback((vehicle: VehicleExpanded): void => {
        populateVehicleData(vehicle);
        setShowVehicleModal(false);
    }, [populateVehicleData]);

    // ========================================================================================
    // UTILITY FUNCTIONS
    // ========================================================================================

    /**
     * Clears all search results and resets state
     */
    const clearSearchResults = useCallback((): void => {
        setFoundClients([]);
        setFoundVehicles([]);
        setSearchError(null);
        setShowClientModal(false);
        setShowVehicleModal(false);
    }, []);

    // ========================================================================================
    // RETURN INTERFACE
    // ========================================================================================

    return {
        foundClients,
        foundVehicles,
        showClientModal,
        showVehicleModal,
        searchError,
        searchLoading,
        handleSearchByClientField,
        handleClientSelect,
        handleVehicleSelect,
        setShowClientModal,
        setShowVehicleModal,
        clearSearchResults
    };
};