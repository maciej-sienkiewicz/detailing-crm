import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ClientDetailHeader from './ClientDetailHeader';
import ClientBasicInfo from './ClientBasicInfo';
import ClientVehicles from './ClientVehicles';
import ClientVisitHistory from './ClientVisitHistory';
import ClientFormModal from '../ClientFormModal';
import { PageContainer, ContentContainer, MainContent, Sidebar } from './ClientDetailStyles';
import { ClientExpanded, VehicleExpanded } from '../../../../types';
import { clientsApi } from '../../../../api/clientsApi';
import { vehicleApi } from '../../../../api/vehiclesApi';
import { visitsApi } from '../../../../api/visitsApiNew';
import { ClientDetailErrorDisplay, ClientDetailLoadingDisplay } from "../../OwnersPage/components";
import { useToast } from '../../../../components/common/Toast/Toast';
import ClientAnalyticsSection from "../../../../components/ClientAnalytics/ClientAnalyticsSection";

interface PriceDetails {
    totalAmountNetto: number;
    totalAmountBrutto: number;
    totalTaxAmount: number;
}

// ✅ UPDATED: Interface for client visit history with new price structure
interface ClientVisitHistoryItem {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    carMake: string;
    carModel: string;
    licensePlate: string;
    revenue: PriceDetails
}

const ClientDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [client, setClient] = useState<ClientExpanded | null>(null);
    const [clientVehicles, setClientVehicles] = useState<VehicleExpanded[]>([]);
    const [clientVisits, setClientVisits] = useState<ClientVisitHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

            // ✅ UPDATED: Pobierz historię wizyt z nową strukturą cen
            try {
                const visitsResult = await visitsApi.getClientVisitHistory(id, { page: 0, size: 10 });
                if (visitsResult.success && visitsResult.data) {
                    const mappedVisits: ClientVisitHistoryItem[] = visitsResult.data.data.map(visit => ({
                        id: visit.id,
                        startDate: visit.startDate,
                        endDate: visit.endDate,
                        status: visit.status,
                        carMake: visit.make,
                        carModel: visit.model,
                        licensePlate: visit.licensePlate,
                        revenue: {
                            totalAmountNetto: visit.revenue.priceNetto,
                            totalAmountBrutto: visit.revenue.priceBrutto,
                            totalTaxAmount: visit.revenue.taxAmount,
                        },
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

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleSaveClient = async (updatedClient: ClientExpanded) => {
        try {
            setClient(updatedClient);
            setShowEditModal(false);
            showToast('success', 'Dane klienta zostały zaktualizowane');
            await loadClientData();
        } catch (error) {
            console.error('Błąd podczas aktualizacji klienta:', error);
            showToast('error', 'Nie udało się zaktualizować danych klienta');
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
    };

    const handleDelete = () => {
        navigate(`/clients-vehicles?tab=owners&clientId=${id}&action=delete`);
    };

    const handleVehicleClick = (vehicleId: string) => {
        navigate(`/vehicle/${vehicleId}`);
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
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ContentContainer>
                <MainContent>
                    <ClientBasicInfo client={client} />

                    <ClientAnalyticsSection
                        clientId={id}
                        clientName={`${client.firstName} ${client.lastName}`}
                    />
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