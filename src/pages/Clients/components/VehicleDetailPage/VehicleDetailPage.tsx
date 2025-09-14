// src/pages/Clients/components/VehicleDetailPage/VehicleDetailPage.tsx
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
import {apiClientNew} from "../../../../api/apiClientNew";

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

    const [vehicle, setVehicle] = useState<VehicleExpanded | null>(null);
    const [vehicleDetails, setVehicleDetails] = useState<VehicleDetailsResponse | null>(null);
    const [owners, setOwners] = useState<FullOwnerInfo[]>([]);
    const [vehicleStats, setVehicleStats] = useState<VehicleStatistics | null>(null);
    const [visitHistory, setVisitHistory] = useState<any[]>([]);

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
                    totalRevenue: foundVehicle.totalSpent || 0
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

    const handleEdit = () => {
        console.log('Edycja pojazdu - funkcjonalność w przygotowaniu');
    };

    const handleDelete = () => {
        console.log('Usuwanie pojazdu - funkcjonalność w przygotowaniu');
    };

    const handleOwnerClick = (ownerId: string) => {
        navigate(`/clients-vehicles?tab=owners&clientId=${ownerId}`);
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

    // Prepare vehicle info for gallery component
    const vehicleInfoForGallery = {
        make: displayVehicle.make,
        model: displayVehicle.model,
        licensePlate: displayVehicle.licensePlate
    };

    return (
        <PageContainer>
            <VehicleDetailHeader
                vehicle={displayVehicle}
                onBack={handleBack}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ContentContainer>
                <MainContent>
                    <VehicleBasicInfo vehicle={displayVehicle} />
                    <VehicleOwners owners={owners} onOwnerClick={handleOwnerClick} />
                    {vehicleStats && (
                        <VehicleStatisticsSection
                            stats={vehicleStats}
                            lastServiceDate={vehicle.lastServiceDate}
                        />
                    )}
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
    );
};

export default VehicleDetailPage;