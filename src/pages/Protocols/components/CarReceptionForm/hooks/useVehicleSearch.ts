import { useState } from 'react';
import { CarReceptionProtocol } from '../../../../../types';
import { ClientExpanded } from '../../../../../types';
import { VehicleExpanded } from '../../../../../types';
import { FormSearchService } from '../../services/FormSearchService';

interface UseVehicleSearchResult {
    foundVehicles: VehicleExpanded[];
    showVehicleModal: boolean;
    searchError: string | null;
    searchLoading: boolean;
    handleSearchByVehicleField: (field: 'licensePlate') => Promise<void>;
    handleVehicleSelect: (vehicle: VehicleExpanded) => void;
    setShowVehicleModal: (show: boolean) => void;
}

export const useVehicleSearch = (
    formData: Partial<CarReceptionProtocol>,
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>,
    foundClients: ClientExpanded[]
): UseVehicleSearchResult => {
    const [foundVehicles, setFoundVehicles] = useState<VehicleExpanded[]>([]);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Funkcja do wypełnienia danych pojazdu w formularzu
    const fillVehicleData = (vehicle: VehicleExpanded) => {
        const vehicleData = FormSearchService.mapVehicleToFormData(vehicle);
        setFormData(prev => ({
            ...prev,
            ...vehicleData
        }));
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
                setSearchError('Nie znaleziono pojazdów o podanym numerze rejestracyjnym');
            } else if (results.vehicles.length === 1) {
                // Jeśli znaleziono dokładnie jeden pojazd, wypełnij dane
                fillVehicleData(results.vehicles[0]);

                // Jeśli pojazd ma więcej niż jednego właściciela, pokaż modal wyboru klienta
                if (results.clients.length > 1) {
                    setShowVehicleModal(true);
                } else if (results.clients.length === 1) {
                    // Jeśli jest tylko jeden właściciel, wypełnij jego dane
                    fillClientData(results.clients[0]);
                }
            } else {
                // Jeśli znaleziono więcej pojazdów, pokaż modal wyboru pojazdu
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

        // Jeśli nie mamy jeszcze danych klienta, a pojazd ma jednego właściciela
        if (!formData.ownerName && vehicle.ownerIds.length === 1) {
            const owner = foundClients.find(client => client.id === vehicle.ownerIds[0]);
            if (owner) {
                fillClientData(owner);
            }
        }
    };

    return {
        foundVehicles,
        showVehicleModal,
        searchError,
        searchLoading,
        handleSearchByVehicleField,
        handleVehicleSelect,
        setShowVehicleModal
    };
};