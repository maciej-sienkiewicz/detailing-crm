// src/pages/Protocols/form/hooks/useVehicleSearch.ts
/**
 * Production-ready hook for vehicle search operations in protocol forms
 * Handles search, selection, and form data population with proper error handling
 *
 * UPDATED LOGIC: Always show modals when results are found (consistent with client search)
 */

import { useState, useCallback } from 'react';
import { CarReceptionProtocol, ClientExpanded, VehicleExpanded } from '../../../../types';
import { formSearchService, SearchCriteria } from '../../shared/services/FormSearchService';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export interface UseVehicleSearchResult {
    foundVehicles: VehicleExpanded[];
    foundVehicleOwners: ClientExpanded[];
    showVehicleModal: boolean;
    showClientModal: boolean;
    searchError: string | null;
    searchLoading: boolean;
    handleSearchByVehicleField: (field: 'licensePlate') => Promise<void>;
    handleVehicleSelect: (vehicle: VehicleExpanded) => void;
    handleClientSelect: (client: ClientExpanded) => void;
    setShowVehicleModal: (show: boolean) => void;
    setShowClientModal: (show: boolean) => void;
    clearSearchResults: () => void;
}

// ========================================================================================
// HOOK IMPLEMENTATION
// ========================================================================================

/**
 * Hook for handling vehicle search operations in protocol forms
 *
 * @param formData - Current form data state
 * @param setFormData - Form data setter function
 * @param availableClients - Pre-loaded clients for fallback operations
 * @returns Object with search state and handlers
 *
 * @example
 * ```typescript
 * const {
 *   foundVehicles,
 *   searchError,
 *   handleSearchByVehicleField,
 *   handleVehicleSelect
 * } = useVehicleSearch(formData, setFormData);
 *
 * // Search by license plate
 * await handleSearchByVehicleField('licensePlate');
 *
 * // Handle vehicle selection
 * handleVehicleSelect(selectedVehicle);
 * ```
 */
export const useVehicleSearch = (
    formData: Partial<CarReceptionProtocol>,
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>,
    availableClients: ClientExpanded[] = []
): UseVehicleSearchResult => {

    // ========================================================================================
    // STATE MANAGEMENT
    // ========================================================================================

    const [foundVehicles, setFoundVehicles] = useState<VehicleExpanded[]>([]);
    const [foundVehicleOwners, setFoundVehicleOwners] = useState<ClientExpanded[]>([]);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // ========================================================================================
    // FORM DATA POPULATION HANDLERS
    // ========================================================================================

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
            console.error('[useVehicleSearch] Failed to populate vehicle data:', error);
            setSearchError('Błąd podczas uzupełniania danych pojazdu');
        }
    }, [setFormData]);

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
            console.error('[useVehicleSearch] Failed to populate client data:', error);
            setSearchError('Błąd podczas uzupełniania danych klienta');
        }
    }, [setFormData]);

    // ========================================================================================
    // SEARCH OPERATIONS
    // ========================================================================================

    /**
     * Handles search by vehicle field (currently only license plate)
     */
    const handleSearchByVehicleField = useCallback(async (field: 'licensePlate'): Promise<void> => {
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

            setFoundVehicles(results.vehicles);

            // Handle search results based on what was found
            await handleSearchResults(results);

        } catch (error) {
            console.error('[useVehicleSearch] Search operation failed:', error);
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
     */
    const handleSearchResults = useCallback(async (results: { vehicles: VehicleExpanded[], clients: ClientExpanded[] }): Promise<void> => {
        const { vehicles, clients } = results;

        if (vehicles.length === 0) {
            setSearchError('Nie znaleziono pojazdów o podanym numerze rejestracyjnym');
            return;
        }

        // NOWA LOGIKA: Zawsze pokazuj modal jeśli znajdziesz pojazdy
        if (vehicles.length >= 1) {
            // Jeśli znaleziono pojazdy - pokaż modal wyboru pojazdu
            setShowVehicleModal(true);
        }
    }, []);

    // ========================================================================================
    // SELECTION HANDLERS
    // ========================================================================================

    /**
     * Handles vehicle selection from modal
     */
    const handleVehicleSelect = useCallback((vehicle: VehicleExpanded): void => {
        populateVehicleData(vehicle);
        setShowVehicleModal(false);

        // Po wyborze pojazdu, sprawdź właścicieli
        // NOWA LOGIKA: Jeśli są właściciele, zawsze pokaż modal wyboru
        if (vehicle.owners && vehicle.owners.length > 0) {
            // Konwertuj VehicleOwnerSummary na ClientExpanded
            const ownersAsClients: ClientExpanded[] = vehicle.owners.map(owner => ({
                id: owner.id.toString(),
                firstName: owner.firstName || '',
                lastName: owner.lastName || '',
                fullName: owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
                email: owner.email || '',
                phone: owner.phone || '',

                // Wymagane pola z domyślnymi wartościami
                totalVisits: 0,
                totalTransactions: 0,
                abandonedSales: 0,
                totalRevenue: 0,
                contactAttempts: 0,
                vehicles: []
            }));

            // Zawsze pokaż modal wyboru właściciela
            setFoundVehicleOwners(ownersAsClients);
            setShowClientModal(true);
        } else {
            setSearchError('Wybrany pojazd nie ma przypisanego właściciela');
        }
    }, [populateVehicleData]);

    /**
     * Handles client selection from modal (vehicle owner)
     */
    const handleClientSelect = useCallback((client: ClientExpanded): void => {
        populateClientData(client);
        setShowClientModal(false);
    }, [populateClientData]);

    // ========================================================================================
    // UTILITY FUNCTIONS
    // ========================================================================================

    /**
     * Clears all search results and resets state
     */
    const clearSearchResults = useCallback((): void => {
        setFoundVehicles([]);
        setFoundVehicleOwners([]);
        setSearchError(null);
        setShowVehicleModal(false);
        setShowClientModal(false);
    }, []);

    // ========================================================================================
    // RETURN INTERFACE
    // ========================================================================================

    return {
        foundVehicles,
        foundVehicleOwners,
        showVehicleModal,
        showClientModal,
        searchError,
        searchLoading,
        handleSearchByVehicleField,
        handleVehicleSelect,
        handleClientSelect,
        setShowVehicleModal,
        setShowClientModal,
        clearSearchResults
    };
};