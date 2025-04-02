import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { CarReceptionProtocol, ProtocolListItem } from '../../../../../types';
import { protocolsApi } from '../../../../../api/protocolsApi';
interface UseProtocolActionsResult {
    editingProtocol: CarReceptionProtocol | null;
    formData: Partial<CarReceptionProtocol>;
    handleAddProtocol: () => void;
    handleViewProtocol: (protocol: ProtocolListItem) => void;
    handleEditProtocol: (protocolId: string) => Promise<void>;
    handleDeleteProtocol: (id: string) => Promise<void>;
    handleSaveProtocol: (protocol: CarReceptionProtocol) => void;
    handleFormCancel: () => void;
}

export const useProtocolActions = (
    refreshProtocolsList: () => void,
    setShowForm: (show: boolean) => void,
    navigate: NavigateFunction
): UseProtocolActionsResult => {
    const [editingProtocol, setEditingProtocol] = useState<CarReceptionProtocol | null>(null);
    const [formData, setFormData] = useState<Partial<CarReceptionProtocol>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obsługa dodawania nowego protokołu
    const handleAddProtocol = () => {
        const today = new Date().toISOString().split('T')[0];
        setEditingProtocol(null);
        setFormData({});
        setShowForm(true);
    };

    // Obsługa przejścia do szczegółów protokołu
    const handleViewProtocol = (protocol: ProtocolListItem) => {
        navigate(`/orders/car-reception/${protocol.id}`);
    };

    // Obsługa edytowania protokołu
    const handleEditProtocol = async (protocolId: string) => {
        try {
            setLoading(true);
            const protocolDetails = await protocolsApi.getProtocolDetails(protocolId);

            if (protocolDetails) {
                setEditingProtocol(protocolDetails);
                setShowForm(true);
            } else {
                setError('Nie udało się pobrać danych protokołu do edycji');
            }
        } catch (err) {
            setError('Błąd podczas pobierania danych protokołu do edycji');
            console.error('Error fetching protocol for edit:', err);
        } finally {
            setLoading(false);
        }
    };

    // Obsługa usunięcia protokołu
    const handleDeleteProtocol = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten protokół?')) {
            try {
                const success = await protocolsApi.deleteProtocol(id);

                if (success) {
                    refreshProtocolsList();
                } else {
                    setError('Nie udało się usunąć protokołu');
                }
            } catch (err) {
                setError('Nie udało się usunąć protokołu');
                console.error('Error deleting protocol:', err);
            }
        }
    };

    // Obsługa zapisania protokołu
    const handleSaveProtocol = (protocol: CarReceptionProtocol) => {
        refreshProtocolsList();
        setShowForm(false);
        setEditingProtocol(null);
        navigate(`/orders/car-reception/${protocol.id}`);
    };

    // Obsługa powrotu z formularza
    const handleFormCancel = () => {
        setShowForm(false);
        setEditingProtocol(null);
    };

    return {
        editingProtocol,
        formData,
        handleAddProtocol,
        handleViewProtocol,
        handleEditProtocol,
        handleDeleteProtocol,
        handleSaveProtocol,
        handleFormCancel,
    };
};