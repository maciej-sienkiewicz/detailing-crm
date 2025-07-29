import { useState, useCallback } from 'react';
import { CarReceptionProtocol, ClientExpanded, VehicleExpanded } from '../../../../types';
import { formSearchService, SearchCriteria } from '../../shared/services/FormSearchService';

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

export const useClientSearch = (
    formData: Partial<CarReceptionProtocol>,
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>,
    setIsClientFromSearch?: (value: boolean) => void
): UseClientSearchResult => {

    const [foundClients, setFoundClients] = useState<ClientExpanded[]>([]);
    const [foundVehicles, setFoundVehicles] = useState<VehicleExpanded[]>([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const populateClientData = useCallback((client: ClientExpanded): void => {
        try {
            const clientData = formSearchService.mapClientToFormData(client);

            setFormData(prev => ({
                ...prev,
                ...clientData,
                referralSource: 'regular_customer'
            }));
        } catch (error) {
            console.error('[useClientSearch] Failed to populate client data:', error);
            setSearchError('Błąd podczas uzupełniania danych klienta');
        }
    }, [setFormData]);

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

    const handleSearchByClientField = useCallback(async (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone'): Promise<void> => {
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

            setFoundClients(results.clients);

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

    const handleSearchResults = useCallback(async (results: { vehicles: VehicleExpanded[], clients: ClientExpanded[] }): Promise<void> => {
        const { vehicles, clients } = results;

        if (clients.length === 0) {
            setSearchError('Nie znaleziono klientów o podanych danych');
            return;
        }

        if (clients.length >= 1) {
            setShowClientModal(true);
        }
    }, []);

    const handleClientSelect = useCallback((client: ClientExpanded): void => {
        populateClientData(client);
        setShowClientModal(false);

        if (setIsClientFromSearch) {
            setIsClientFromSearch(true);
        }

        formSearchService.getVehiclesForClient(client.id)
            .then(vehicles => {
                if (vehicles.length > 0) {
                    setFoundVehicles(vehicles);
                    setShowVehicleModal(true);
                }
            })
            .catch(error => {
                console.error('[useClientSearch] Failed to fetch client vehicles:', error);
            });
    }, [populateClientData, setIsClientFromSearch]);

    const handleVehicleSelect = useCallback((vehicle: VehicleExpanded): void => {
        populateVehicleData(vehicle);
        setShowVehicleModal(false);
    }, [populateVehicleData]);

    const clearSearchResults = useCallback((): void => {
        setFoundClients([]);
        setFoundVehicles([]);
        setSearchError(null);
        setShowClientModal(false);
        setShowVehicleModal(false);
    }, []);

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