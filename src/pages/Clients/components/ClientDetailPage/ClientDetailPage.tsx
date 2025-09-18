import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ClientDetailHeader from './ClientDetailHeader';
import ClientBasicInfo from './ClientBasicInfo';
import ClientStatistics from './ClientStatistics';
import ClientVehicles from './ClientVehicles';
import ClientVisitHistory from './ClientVisitHistory';
import ClientFormModal from '../ClientFormModal'; // DODANE: Import modala
import { PageContainer, ContentContainer, MainContent, Sidebar } from './ClientDetailStyles';
import { ClientExpanded, VehicleExpanded } from '../../../../types';
import { ClientProtocolHistory } from '../../../../types';
import { clientsApi } from '../../../../api/clientsApi';
import { vehicleApi } from '../../../../api/vehiclesApi';
import { visitsApi } from '../../../../api/visitsApiNew';
import { ClientDetailErrorDisplay, ClientDetailLoadingDisplay } from "../../OwnersPage/components";
import { useToast } from '../../../../components/common/Toast/Toast'; // DODANE: Toast notifications

const ClientDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast(); // DODANE: Hook dla toastów

    const [client, setClient] = useState<ClientExpanded | null>(null);
    const [clientVehicles, setClientVehicles] = useState<VehicleExpanded[]>([]);
    const [clientVisits, setClientVisits] = useState<ClientProtocolHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // DODANE: Stan dla modala edycji
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (!id) {
            setError('Nie podano ID klienta');
            setLoading(false);
            return;
        }

        loadClientData();
    }, [id]);

    const loadClientData = async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            // Pobierz dane klienta
            const clientResult = await clientsApi.getClientById(id);

            if (!clientResult.success || !clientResult.data) {
                setError(clientResult.error || 'Nie znaleziono klienta o podanym ID');
                return;
            }

            setClient(clientResult.data);

            // Pobierz pojazdy klienta
            try {
                const vehicles = await vehicleApi.fetchVehiclesByOwnerId(id);
                setClientVehicles(vehicles);
            } catch (vehiclesError) {
                console.warn('Nie udało się pobrać pojazdów klienta:', vehiclesError);
                setClientVehicles([]);
            }

            // Pobierz historię wizyt klienta - ZAKTUALIZOWANE
            try {
                const visitsResult = await visitsApi.getClientVisitHistory(id, { page: 0, size: 10 });
                if (visitsResult.success && visitsResult.data) {
                    // Mapuj z ClientVisitHistoryItem na ClientProtocolHistory
                    const mappedVisits: ClientProtocolHistory[] = visitsResult.data.data.map(visit => ({
                        id: visit.id,
                        startDate: visit.startDate,
                        endDate: visit.endDate,
                        status: visit.status,
                        carMake: visit.make,
                        carModel: visit.model,
                        licensePlate: visit.licensePlate,
                        totalAmount: visit.totalAmount
                    }));
                    setClientVisits(mappedVisits);
                }
            } catch (visitsError) {
                console.warn('Nie udało się pobrać historii wizyt:', visitsError);
                setClientVisits([]);
            }

        } catch (err) {
            console.error('Błąd podczas ładowania danych klienta:', err);
            setError('Nie udało się załadować danych klienta');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/clients-vehicles?tab=owners');
    };

    // ZMIANA: handleEdit teraz otwiera modal zamiast przekierowywać
    const handleEdit = () => {
        setShowEditModal(true);
    };

    // DODANE: Funkcja obsługująca zapisanie zmian w modalu
    const handleSaveClient = async (updatedClient: ClientExpanded) => {
        try {
            // Aktualizuj lokalny stan klienta
            setClient(updatedClient);

            // Zamknij modal
            setShowEditModal(false);

            // Pokaż komunikat o sukcesie
            showToast('success', 'Dane klienta zostały zaktualizowane');

            // Opcjonalnie: odśwież dane klienta z serwera
            await loadClientData();

        } catch (error) {
            console.error('Błąd podczas aktualizacji klienta:', error);
            showToast('error', 'Nie udało się zaktualizować danych klienta');
        }
    };

    // DODANE: Funkcja anulowania modala
    const handleCancelEdit = () => {
        setShowEditModal(false);
    };

    const handleDelete = () => {
        navigate(`/clients-vehicles?tab=owners&clientId=${id}&action=delete`);
    };

    const handleVehicleClick = (vehicleId: string) => {
        navigate(`/clients-vehicles?tab=vehicles&vehicleId=${vehicleId}`);
    };

    const handleVisitClick = (visitId: string) => {
        navigate(`/visits/${visitId}`);
    };

    if (loading) {
        return <ClientDetailLoadingDisplay />;
    }

    if (error || !client) {
        return <ClientDetailErrorDisplay message={error || 'Nie znaleziono klienta'} onBack={handleBack} />;
    }

    return (
        <PageContainer>
            <ClientDetailHeader
                client={client}
                onBack={handleBack}
                onEdit={handleEdit} // ZMIANA: Teraz wywołuje handleEdit która otwiera modal
                onDelete={handleDelete}
            />

            <ContentContainer>
                <MainContent>
                    <ClientBasicInfo client={client} />
                    <ClientStatistics client={client} />
                </MainContent>

                <Sidebar>
                    <ClientVehicles
                        vehicles={clientVehicles}
                        onVehicleClick={handleVehicleClick}
                    />
                    <ClientVisitHistory
                        visits={clientVisits}
                        onVisitClick={handleVisitClick}
                        clientName={`${client.firstName} ${client.lastName}`}
                    />
                </Sidebar>
            </ContentContainer>

            {/* DODANE: Modal do edycji klienta */}
            {showEditModal && (
                <ClientFormModal
                    client={client}
                    onSave={handleSaveClient}
                    onCancel={handleCancelEdit}
                />
            )}
        </PageContainer>
    );
};

export default ClientDetailPage;