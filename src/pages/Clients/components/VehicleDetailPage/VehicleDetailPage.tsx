// src/pages/Clients/components/VehicleDetailPage/VehicleDetailPage.tsx - NAPRAWIONY przycisk Edycji
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VehicleDetailHeader from './VehicleDetailHeader';
import VehicleBasicInfo from './VehicleBasicInfo';
import VehicleOwners from './VehicleOwners';
import VehicleStatisticsSection from './VehicleStatisticsSection';
import VehicleVisitHistory from './VehicleVisitHistory';
import { LoadingDisplay, ErrorDisplay } from './VehicleDetailComponents';
import { PageContainer, ContentContainer, MainContent, Sidebar } from './VehicleDetailStyles';
import VehicleGallerySection from "./VehicleGallerySection";
import {VehicleExpanded, VehicleStatistics} from "../../../../types";
import {vehicleApi} from "../../../../api/vehiclesApi";
import {apiClientNew} from "../../../../shared/api/apiClientNew";
import VehicleAnalyticsSection from "../../../../components/VehicleAnalytics/VehicleAnalyticsSection";
// DODANY IMPORT dla VehicleFormModal
import VehicleFormModal from "../VehicleFormModal";
import Modal from "../../../../components/common/Modal";
import {useToast} from "../../../../components/common/Toast/Toast";

interface VehicleDetailsResponse {
    id: string;
    make: string;
    model: string;
    year?: number;
    licensePlate: string;
    color?: string;
    vin?: string;
    mileage?: number;
    display_name: string;
    created_at: string;
    updated_at: string;
}

interface VehicleOwnerResponse {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
}

interface FullOwnerInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    fullName: string;
}

const VehicleDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [vehicle, setVehicle] = useState<VehicleExpanded | null>(null);
    const [vehicleDetails, setVehicleDetails] = useState<VehicleDetailsResponse | null>(null);
    const [owners, setOwners] = useState<FullOwnerInfo[]>([]);
    const [vehicleStats, setVehicleStats] = useState<VehicleStatistics | null>(null);
    const [visitHistory, setVisitHistory] = useState<any[]>([]);

    // NAPRAWIONE STANY - modal edycji zamiast drawer'a
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState<VehicleExpanded | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('Nie podano ID pojazdu');
            setLoading(false);
            return;
        }

        loadVehicleData();
    }, [id]);

    const loadVehicleData = async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const vehicleResponse = await vehicleApi.fetchVehiclesForTable({ page: 0, size: 100 });
            const foundVehicle = vehicleResponse.data.find(v => v.id === id);

            if (!foundVehicle) {
                setError('Nie znaleziono pojazdu o podanym ID');
                return;
            }

            setVehicle(foundVehicle);

            try {
                const response = await apiClientNew.get<VehicleDetailsResponse>(
                    `/vehicles/${id}`,
                    undefined,
                    { timeout: 10000 }
                );
                setVehicleDetails(response);
            } catch (detailsError) {
                console.warn('Nie udało się pobrać szczegółów pojazdu, używam danych z tabeli');
            }

            if (foundVehicle.owners && foundVehicle.owners.length > 0) {
                const ownerData = foundVehicle.owners.map(owner => ({
                    id: owner.id.toString(),
                    firstName: owner.firstName,
                    lastName: owner.lastName,
                    email: owner.email || '',
                    phone: owner.phone || '',
                    fullName: owner.fullName || `${owner.firstName} ${owner.lastName}`
                }));
                setOwners(ownerData);
            }

            try {
                const stats = await vehicleApi.fetchVehicleStatistics(id);
                setVehicleStats(stats);
            } catch (statsError) {
                setVehicleStats({
                    servicesNo: foundVehicle.totalServices || 0,
                    totalRevenue: foundVehicle.totalSpent.totalAmountNetto || 0
                });
            }

            try {
                const response = await apiClientNew.get<any>(
                    `/v1/protocols/vehicles/${id}`,
                    { page: 0, size: 5 },
                    { timeout: 10000 }
                );

                if (response && response.content) {
                    setVisitHistory(response.content);
                }
            } catch (historyError) {
                console.warn('Nie udało się pobrać historii wizyt');
                setVisitHistory([]);
            }

        } catch (err) {
            console.error('Błąd podczas ładowania danych pojazdu:', err);
            setError('Nie udało się załadować danych pojazdu');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/clients-vehicles?tab=vehicles');
    };

    // NAPRAWIONA FUNKCJA handleEdit - teraz otwiera VehicleFormModal
    const handleEdit = () => {
        if (vehicle) {
            console.log('🔧 Opening edit modal for vehicle:', vehicle.id);
            setVehicleToEdit(vehicle);
            setShowEditModal(true);
        }
    };

    // DODANA FUNKCJA do zamykania modalu edycji
    const handleCloseEditModal = () => {
        console.log('❌ Closing edit modal');
        setShowEditModal(false);
        setVehicleToEdit(null);
    };

    // DODANA FUNKCJA do zapisywania zmian i przeładowania danych
    const handleSaveEdit = async () => {
        console.log('💾 Vehicle saved, reloading data...');
        setShowEditModal(false);
        setVehicleToEdit(null);

        // Przeładuj dane pojazdu po zapisaniu
        await loadVehicleData();
    };

    // NAPRAWIONA FUNKCJA handleDelete - teraz pokazuje modal potwierdzenia
    const handleDelete = () => {
        if (vehicle) {
            console.log('🗑️ Opening delete confirmation for vehicle:', vehicle.id);
            setShowDeleteConfirm(true);
        }
    };

    // DODANA FUNKCJA do potwierdzenia usunięcia
    const handleConfirmDelete = async () => {
        if (!vehicle) return;

        try {
            console.log('🗑️ Deleting vehicle:', vehicle.id);

            const success = await vehicleApi.deleteVehicle(vehicle.id);

            if (success) {
                showToast('success', 'Pojazd został usunięty pomyślnie');
                // Po usunięciu, wróć do listy pojazdów
                navigate('/clients-vehicles?tab=vehicles');
            } else {
                showToast('error', 'Nie udało się usunąć pojazdu');
                setShowDeleteConfirm(false);
            }
        } catch (error: any) {
            console.error('❌ Error deleting vehicle:', error);

            let errorMessage = 'Nie udało się usunąć pojazdu';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.status === 409) {
                errorMessage = 'Nie można usunąć pojazdu - posiada powiązane wizyty';
            } else if (error.status === 404) {
                errorMessage = 'Pojazd nie został znaleziony';
            }

            showToast('error', errorMessage);
            setShowDeleteConfirm(false);
        }
    };

    const handleOwnerClick = (ownerId: string) => {
        navigate(`/clients/${ownerId}`);
    };

    const handleVisitClick = (visitId: string) => {
        navigate(`/visits/${visitId}`);
    };

    if (loading) {
        return <LoadingDisplay />;
    }

    if (error || !vehicle) {
        return <ErrorDisplay message={error || 'Nie znaleziono pojazdu'} onBack={handleBack} />;
    }

    const displayVehicle = vehicleDetails ? {
        id: vehicleDetails.id,
        make: vehicleDetails.make,
        model: vehicleDetails.model,
        year: vehicleDetails.year || vehicle.year,
        licensePlate: vehicleDetails.licensePlate,
        color: vehicleDetails.color || vehicle.color,
        vin: vehicleDetails.vin || vehicle.vin,
        displayName: vehicleDetails.display_name
    } : vehicle;

    const vehicleInfoForGallery = {
        make: displayVehicle.make,
        model: displayVehicle.model,
        licensePlate: displayVehicle.licensePlate
    };

    return (
        <>
            <PageContainer>
                <VehicleDetailHeader
                    vehicle={displayVehicle}
                    onBack={handleBack}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <ContentContainer>
                    <MainContent>
                        <VehicleOwners owners={owners} onOwnerClick={handleOwnerClick} />
                        <VehicleAnalyticsSection vehicleId={id} />
                    </MainContent>

                    <Sidebar>
                        <VehicleGallerySection
                            vehicleId={id}
                            vehicleInfo={vehicleInfoForGallery}
                        />
                        <VehicleVisitHistory
                            visitHistory={visitHistory}
                            onVisitClick={handleVisitClick}
                            vehicleDisplay={displayVehicle}
                        />
                    </Sidebar>
                </ContentContainer>
            </PageContainer>

            {/* DODANY VehicleFormModal - modal edycji pojazdu */}
            {showEditModal && vehicleToEdit && (
                <VehicleFormModal
                    vehicle={vehicleToEdit}
                    onSave={handleSaveEdit}
                    onCancel={handleCloseEditModal}
                />
            )}

            {/* DODANY Modal potwierdzenia usunięcia */}
            {showDeleteConfirm && vehicle && (
                <Modal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Potwierdź usunięcie pojazdu"
                >
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#fee2e2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#dc2626',
                            fontSize: '28px',
                            margin: '0 auto 16px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            🗑️
                        </div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#0f172a',
                            margin: '0 0 16px 0'
                        }}>
                            Czy na pewno chcesz usunąć pojazd?
                        </h3>
                        <div style={{
                            background: '#fafbfc',
                            border: '1px solid #f1f5f9',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#0f172a',
                                marginBottom: '8px'
                            }}>
                                {vehicle.make} {vehicle.model}
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#475569',
                                fontWeight: '500'
                            }}>
                                {vehicle.licensePlate}
                            </div>
                        </div>
                        <p style={{
                            fontSize: '14px',
                            color: '#475569',
                            lineHeight: '1.5',
                            margin: '0 0 24px 0'
                        }}>
                            Ta operacja jest <strong style={{ color: '#dc2626' }}>nieodwracalna</strong>.
                            Wszystkie dane pojazdu zostaną permanentnie usunięte.
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: '#ffffff',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minHeight: '44px'
                                }}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minHeight: '44px'
                                }}
                            >
                                Usuń pojazd
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default VehicleDetailPage;