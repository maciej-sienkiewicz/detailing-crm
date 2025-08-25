// src/pages/Protocols/form/hooks/useVehicleSearch.ts - ZAKTUALIZOWANE
import {useCallback, useState} from 'react';
import {CarReceptionProtocol, ClientExpanded, VehicleExpanded} from '../../../../types';
import {formSearchService, SearchCriteria} from '../../shared/services/FormSearchService';

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

export const useVehicleSearch = (
    formData: Partial<CarReceptionProtocol>,
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>,
    availableClients: ClientExpanded[] = [],
    setIsClientFromSearch?: (value: boolean) => void
): UseVehicleSearchResult => {

    const [foundVehicles, setFoundVehicles] = useState<VehicleExpanded[]>([]);
    const [foundVehicleOwners, setFoundVehicleOwners] = useState<ClientExpanded[]>([]);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

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

    const populateClientData = useCallback((client: ClientExpanded): void => {
        try {
            const clientData = formSearchService.mapClientToFormData(client);

            setFormData(prev => ({
                ...prev,
                ...clientData,
                referralSource: 'regular_customer'
            }));
        } catch (error) {
            console.error('[useVehicleSearch] Failed to populate client data:', error);
            setSearchError('Błąd podczas uzupełniania danych klienta');
        }
    }, [setFormData]);

    const handleSearchByVehicleField = useCallback(async (field: 'licensePlate'): Promise<void> => {
        const fieldValue = formData[field] as string;

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

    const handleSearchResults = useCallback(async (results: { vehicles: VehicleExpanded[], clients: ClientExpanded[] }): Promise<void> => {
        const { vehicles, clients } = results;

        if (vehicles.length === 0) {
            setSearchError('Nie znaleziono pojazdów o podanym numerze rejestracyjnym');
            return;
        }

        if (vehicles.length >= 1) {
            setShowVehicleModal(true);
        }
    }, []);

    const handleVehicleSelect = useCallback((vehicle: VehicleExpanded): void => {
        populateVehicleData(vehicle);
        setShowVehicleModal(false);

        if (vehicle.owners && vehicle.owners.length > 0) {
            const ownersAsClients: ClientExpanded[] = vehicle.owners.map(owner => ({
                id: owner.id.toString(),
                firstName: owner.firstName || '',
                lastName: owner.lastName || '',
                fullName: owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
                email: owner.email || '',
                phone: owner.phone || '',

                totalVisits: 0,
                totalTransactions: 0,
                abandonedSales: 0,
                totalRevenue: 0,
                contactAttempts: 0,
                vehicles: []
            }));

            setFoundVehicleOwners(ownersAsClients);
            setShowClientModal(true);
        } else {
            setSearchError('Wybrany pojazd nie ma przypisanego właściciela');
        }
    }, [populateVehicleData]);

    const handleClientSelect = useCallback((client: ClientExpanded): void => {
        populateClientData(client);
        setShowClientModal(false);

        // DODANE: Ustawienie flagi że klient pochodzi z wyszukiwania
        // Ta sama logika co w useClientSearch
        if (setIsClientFromSearch) {
            setIsClientFromSearch(true);
        }
    }, [populateClientData, setIsClientFromSearch]);

    const clearSearchResults = useCallback((): void => {
        setFoundVehicles([]);
        setFoundVehicleOwners([]);
        setSearchError(null);
        setShowVehicleModal(false);
        setShowClientModal(false);
    }, []);

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