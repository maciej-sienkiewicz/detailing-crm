import { useState } from 'react';
import { CarReceptionProtocol } from '../../../../types';
import { ClientExpanded } from '../../../../types';
import { VehicleExpanded } from '../../../../types';
import {FormSearchService} from "../../shared/services/FormSearchService";

interface UseVehicleSearchResult {
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
}

export const useVehicleSearch = (
    formData: Partial<CarReceptionProtocol>,
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>,
    availableClients: ClientExpanded[] = []
): UseVehicleSearchResult => {
    const [foundVehicles, setFoundVehicles] = useState<VehicleExpanded[]>([]);
    const [foundVehicleOwners, setFoundVehicleOwners] = useState<ClientExpanded[]>([]);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleExpanded | null>(null);

    // Funkcja do wypełnienia danych pojazdu w formularzu
    const fillVehicleData = (vehicle: VehicleExpanded) => {
        const vehicleData = FormSearchService.mapVehicleToFormData(vehicle);
        setFormData(prev => ({
            ...prev,
            ...vehicleData
        }));

        // Zapisujemy wybrany pojazd do stanu
        setSelectedVehicle(vehicle);
    };

    // Funkcja do wypełnienia danych klienta w formularzu
    const fillClientData = (client: ClientExpanded) => {
        const clientData = FormSearchService.mapClientToFormData(client);
        setFormData(prev => ({
            ...prev,
            ...clientData
        }));
    };

    // Obsługa wyszukiwania po numerze rejestracyjnym
    const handleSearchByVehicleField = async (field: 'licensePlate') => {
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

            setFoundVehicles(results.vehicles);

            // Decyzja o pokazaniu odpowiedniego modala
            if (results.vehicles.length === 0) {
                // Nie znaleziono pojazdów
                setSearchError('Nie znaleziono pojazdów o podanym numerze rejestracyjnym');
            } else if (results.vehicles.length === 1) {
                // Znaleziono dokładnie jeden pojazd
                const vehicle = results.vehicles[0];
                fillVehicleData(vehicle);

                // Sprawdzamy właścicieli pojazdu
                if (results.clients.length === 0) {
                    // Pojazd nie ma przypisanych właścicieli
                    setSearchError('Pojazd nie ma przypisanego właściciela');
                } else if (results.clients.length === 1) {
                    // Pojazd ma jednego właściciela - automatycznie uzupełniamy jego dane
                    fillClientData(results.clients[0]);
                } else {
                    // Pojazd ma wielu właścicieli - wyświetlamy modal wyboru
                    setFoundVehicleOwners(results.clients);
                    setShowClientModal(true);
                }
            } else {
                // Znaleziono więcej pojazdów - wyświetlamy modal wyboru pojazdu
                setShowVehicleModal(true);
            }
        } catch (err) {
            console.error('Error searching:', err);
            setSearchError('Wystąpił błąd podczas wyszukiwania');
        } finally {
            setSearchLoading(false);
        }
    };

    // Obsługa wyboru pojazdu z modalu
    const handleVehicleSelect = (vehicle: VehicleExpanded) => {
        fillVehicleData(vehicle);
        setShowVehicleModal(false);

        // Po wyborze pojazdu, sprawdzamy czy ma właścicieli
        if (vehicle.ownerIds && vehicle.ownerIds.length > 0) {
            // Filtrujemy dostępnych klientów, aby znaleźć właścicieli pojazdu
            const owners = availableClients.filter(client =>
                vehicle.ownerIds.includes(client.id)
            );

            if (owners.length === 0) {
                // Nie znaleziono właścicieli w dostępnych klientach
                // Można spróbować pobrać ich z API
                console.warn('No owners found in available clients. Consider fetching from API.');
            } else if (owners.length === 1) {
                // Pojazd ma jednego właściciela - automatycznie uzupełniamy jego dane
                fillClientData(owners[0]);
            } else {
                // Pojazd ma wielu właścicieli - wyświetlamy modal wyboru
                setFoundVehicleOwners(owners);
                setShowClientModal(true);
            }
        }
    };

    // Obsługa wyboru klienta z modalu (właściciela pojazdu)
    const handleClientSelect = (client: ClientExpanded) => {
        fillClientData(client);
        setShowClientModal(false);
    };

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
        setShowClientModal
    };
};