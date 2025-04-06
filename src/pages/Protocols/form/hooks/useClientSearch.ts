import { useState } from 'react';
import { CarReceptionProtocol } from '../../../../types';
import { ClientExpanded, VehicleExpanded } from '../../../../types';
import { FormSearchService } from "../../shared/services/FormSearchService";

interface UseClientSearchResult {
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
}

export const useClientSearch = (
    formData: Partial<CarReceptionProtocol>,
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>
): UseClientSearchResult => {
    const [foundClients, setFoundClients] = useState<ClientExpanded[]>([]);
    const [foundVehicles, setFoundVehicles] = useState<VehicleExpanded[]>([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientExpanded | null>(null);

    // Funkcja do wypełnienia danych klienta w formularzu
    const fillClientData = (client: ClientExpanded) => {
        const clientData = FormSearchService.mapClientToFormData(client);
        setFormData(prev => ({
            ...prev,
            ...clientData
        }));
    };

    // Funkcja do wypełnienia danych pojazdu w formularzu
    const fillVehicleData = (vehicle: VehicleExpanded) => {
        const vehicleData = FormSearchService.mapVehicleToFormData(vehicle);
        setFormData(prev => ({
            ...prev,
            ...vehicleData
        }));
    };

    // Obsługa wyszukiwania po polach klienta
    const handleSearchByClientField = async (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => {
        const fieldValue = formData[field] as string;

        if (!fieldValue || fieldValue.trim() === '') {
            setSearchError('Pole wyszukiwania jest puste');
            return;
        }

        setSearchLoading(true);
        setSearchError(null);

        try {
            const criteria = { field, value: fieldValue };
            const results = await FormSearchService.searchByField(criteria);

            setFoundClients(results.clients);

            // Podejmowanie decyzji w zależności od wyników wyszukiwania
            if (results.clients.length === 0) {
                // Brak wyników
                setSearchError('Nie znaleziono klientów o podanych danych');
            } else if (results.clients.length === 1) {
                // Znaleziono dokładnie jednego klienta
                const client = results.clients[0];
                fillClientData(client);
                setSelectedClient(client);

                // Sprawdzamy czy klient ma pojazdy
                if (client.vehicles && client.vehicles.length > 0) {
                    try {
                        // Pobieramy pojazdy klienta
                        const vehicles = await FormSearchService.getVehiclesForClient(client.id);

                        if (vehicles.length === 1) {
                            // Jeśli klient ma dokładnie jeden pojazd, automatycznie go wybieramy
                            fillVehicleData(vehicles[0]);
                        } else if (vehicles.length > 1) {
                            // Jeśli klient ma wiele pojazdów, pokazujemy modal wyboru pojazdu
                            setFoundVehicles(vehicles);
                            setShowVehicleModal(true);
                        }
                    } catch (err) {
                        console.error('Error fetching vehicles for client:', err);
                    }
                }
            } else {
                // Znaleziono wielu klientów, pokazujemy modal wyboru
                setShowClientModal(true);
            }
        } catch (err) {
            console.error('Error searching:', err);
            setSearchError('Wystąpił błąd podczas wyszukiwania');
        } finally {
            setSearchLoading(false);
        }
    };

    // Obsługa wyboru klienta z modalu
    const handleClientSelect = (client: ClientExpanded) => {
        fillClientData(client);
        setSelectedClient(client);
        setShowClientModal(false);

        // Po wyborze klienta, sprawdzamy czy ma pojazdy
        if (client.vehicles && client.vehicles.length > 0) {
            FormSearchService.getVehiclesForClient(client.id)
                .then(vehicles => {
                    if (vehicles.length === 1) {
                        // Jeśli klient ma dokładnie jeden pojazd, automatycznie go wybieramy
                        fillVehicleData(vehicles[0]);
                    } else if (vehicles.length > 1) {
                        // Jeśli klient ma wiele pojazdów, pokazujemy modal wyboru pojazdu
                        setFoundVehicles(vehicles);
                        setShowVehicleModal(true);
                    }
                })
                .catch(err => {
                    console.error('Error fetching vehicles for client:', err);
                });
        }
    };

    // Obsługa wyboru pojazdu z modalu
    const handleVehicleSelect = (vehicle: VehicleExpanded) => {
        fillVehicleData(vehicle);
        setShowVehicleModal(false);
    };

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
        setShowVehicleModal
    };
};