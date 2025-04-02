import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import {CarReceptionProtocol, ProtocolListItem, ProtocolStatus} from '../../../../types';
import { protocolsApi } from '../../../../api/protocolsApi';
interface UseProtocolActionsResult {
    editingProtocol: CarReceptionProtocol | null;
    formData: Partial<CarReceptionProtocol>;
    handleAddProtocol: () => void;
    handleViewProtocol: (protocol: ProtocolListItem) => void;
    handleEditProtocol: (protocolId: string, isOpenProtocolAction?: boolean) => Promise<void>;
    handleDeleteProtocol: (id: string) => Promise<void>;
    handleSaveProtocol: (protocol: CarReceptionProtocol, showConfirmationModal: boolean) => void;
    handleFormCancel: () => void;
    isShowingConfirmationModal: boolean;
    setIsShowingConfirmationModal: (show: boolean) => void;
    currentProtocol: CarReceptionProtocol | null;
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
    const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
    const [currentProtocol, setCurrentProtocol] = useState<CarReceptionProtocol | null>(null);

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
    const handleEditProtocol = async (protocolId: string, isOpenProtocolAction?: boolean) => {
        try {
            setLoading(true);
            console.log(`Pobieranie protokołu do edycji, id: ${protocolId}, isOpenProtocolAction: ${isOpenProtocolAction}`);

            const protocolDetails = await protocolsApi.getProtocolDetails(protocolId);

            if (protocolDetails) {
                console.log('Protokół pobrany:', protocolDetails);
                // Jeśli mamy flagę isOpenProtocolAction i protokół jest w statusie SCHEDULED,
                // zmieniamy status na IN_PROGRESS
                if (isOpenProtocolAction && protocolDetails.status === ProtocolStatus.SCHEDULED) {
                    // Aktualizujemy status protokołu na IN_PROGRESS
                    protocolDetails.status = ProtocolStatus.IN_PROGRESS;

                    // Zapisujemy zmianę statusu do API
                    await protocolsApi.updateProtocolStatus(protocolId, ProtocolStatus.IN_PROGRESS);

                    console.log('Protokół został zmieniony na status W realizacji:', protocolDetails);
                }

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
    }

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
    const handleSaveProtocol = (protocol: CarReceptionProtocol, showConfirmationModal: boolean) => {
        console.log(`handleSaveProtocol wywołany, protocol.id: ${protocol.id}, showModal: ${showConfirmationModal}`);

        // Zawsze zapisujemy protokół w stanie, niezależnie czy pokazujemy modal czy nie
        setCurrentProtocol(protocol);

        if (showConfirmationModal) {
            console.log('Pokazywanie modalu potwierdzenia');
            setIsShowingConfirmationModal(true);
            // Nie wywołujemy completeProtocolSave - zostanie wywołane po zamknięciu modalu
            // Form pozostaje widoczny, dopóki modal nie zostanie zamknięty
        } else {
            console.log('Bezpośrednie zakończenie procesu zapisu bez modalu');
            // Bezpośrednio kończymy proces zapisywania bez wyświetlania modala
            completeProtocolSave(protocol);
        }
    };

    // Zakończenie procesu zapisywania protokołu po wyświetleniu modala lub bez niego
    const completeProtocolSave = (protocol: CarReceptionProtocol) => {
        console.log(`completeProtocolSave wywołany, protocol.id: ${protocol.id}`);
        refreshProtocolsList();
        setShowForm(false);
        setEditingProtocol(null);
        setCurrentProtocol(null);
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
        isShowingConfirmationModal,
        setIsShowingConfirmationModal,
        currentProtocol
    };
};