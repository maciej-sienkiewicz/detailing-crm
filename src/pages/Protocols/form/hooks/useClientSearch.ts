import { useState } from 'react';
import { CarReceptionProtocol } from '../../../../types';
import { ClientExpanded } from '../../../../types';
import {FormSearchService} from "../../shared/services/FormSearchService";

interface UseClientSearchResult {
    foundClients: ClientExpanded[];
    showClientModal: boolean;
    searchError: string | null;
    searchLoading: boolean;
    handleSearchByClientField: (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => Promise<void>;
    handleClientSelect: (client: ClientExpanded) => void;
    setShowClientModal: (show: boolean) => void;
}

export const useClientSearch = (
    formData: Partial<CarReceptionProtocol>,
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>
): UseClientSearchResult => {
    const [foundClients, setFoundClients] = useState<ClientExpanded[]>([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Funkcja do wypełnienia danych klienta w formularzu
    const fillClientData = (client: ClientExpanded) => {
        const clientData = FormSearchService.mapClientToFormData(client);
        setFormData(prev => ({
            ...prev,
            ...clientData
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

            // Decyzja o pokazaniu modalu
            if (results.clients.length === 0) {
                setSearchError('Nie znaleziono klientów o podanych danych');
            } else if (results.clients.length === 1) {
                // Jeśli znaleziono dokładnie jednego klienta, wypełnij dane
                fillClientData(results.clients[0]);
            } else {
                // Jeśli znaleziono więcej klientów, pokaż modal wyboru klienta
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
        setShowClientModal(false);
    };

    return {
        foundClients,
        showClientModal,
        searchError,
        searchLoading,
        handleSearchByClientField,
        handleClientSelect,
        setShowClientModal
    };
};