// src/pages/Fleet/FleetRentalFormPage.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FleetRental,
    FleetRentalStatus
} from '../../types/fleetRental';
import {
    FleetVehicle,
    FleetVehicleStatus
} from '../../types/fleet';
import { ClientExpanded } from '../../types/client';
import { fleetVehicleApi } from '../../api/fleetApi';
import { fleetRentalApi } from '../../api/fleetRentalApi';
import { clientApi } from '../../api/clientsApi';
import RentalForm from '../../components/fleet/forms/RentalForm';
import { useToast } from '../../components/common/Toast/Toast';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';

const FleetRentalFormPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    // Pobierz vehicleId z query params, jeśli istnieje
    const queryParams = new URLSearchParams(location.search);
    const vehicleIdParam = queryParams.get('vehicleId');

    const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
    const [clients, setClients] = useState<ClientExpanded[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Domyślne dane wypożyczenia
    const initialRentalData = {
        vehicleId: vehicleIdParam || '',
        status: FleetRentalStatus.SCHEDULED,
        startDate: new Date().toISOString().split('T')[0],
        plannedEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startMileage: 0,
        fuelLevelStart: 1,
        startConditionNotes: '',
        damageReported: false,
        contractNumber: `W/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    };

    // Pobieranie danych pojazdów i klientów
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Pobieranie dostępnych pojazdów
                const vehiclesData = await fleetVehicleApi.fetchVehicles({
                    status: FleetVehicleStatus.AVAILABLE
                });
                setVehicles(vehiclesData);

                // Pobieranie klientów
                const clientsData = await clientApi.fetchClients();
                setClients(clientsData);

                // Jeśli podano vehicleId w parametrach, sprawdź czy pojazd jest dostępny
                if (vehicleIdParam) {
                    const vehicle = vehiclesData.find(v => v.id === vehicleIdParam);
                    if (!vehicle) {
                        setError('Wybrany pojazd nie jest dostępny lub nie istnieje');
                    } else if (vehicle.status !== FleetVehicleStatus.AVAILABLE) {
                        setError('Wybrany pojazd nie jest dostępny do wypożyczenia');
                    }
                }
            } catch (err) {
                console.error('Error fetching form data:', err);
                setError('Wystąpił błąd podczas ładowania danych. Spróbuj odświeżyć stronę.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [vehicleIdParam]);

    const handleSubmit = async (data: Partial<FleetRental>) => {
        setIsSaving(true);

        try {
            // Dodatkowe sprawdzenia
            if (!data.vehicleId) {
                showToast('error', 'Wybierz pojazd do wypożyczenia', 3000);
                setIsSaving(false);
                return;
            }

            // Znajdź pojazd, aby zaktualizować jego przebieg
            const vehicle = vehicles.find(v => v.id === data.vehicleId);
            if (!vehicle) {
                showToast('error', 'Wybrany pojazd nie istnieje', 3000);
                setIsSaving(false);
                return;
            }

            // Jeśli przebieg początkowy jest mniejszy niż aktualny przebieg pojazdu,
            // użyj aktualnego przebiegu pojazdu
            if (data.startMileage && data.startMileage < vehicle.currentMileage) {
                data.startMileage = vehicle.currentMileage;
            }

            // Utworzenie wypożyczenia
            const response = await fleetRentalApi.createRental({
                ...data,
                status: FleetRentalStatus.ACTIVE, // Od razu ustawiamy jako aktywne
                createdAt: new Date().toISOString()
            });

            // Aktualizacja statusu pojazdu
            await fleetVehicleApi.updateVehicleStatus(data.vehicleId, FleetVehicleStatus.RENTED);

            showToast('success', 'Wypożyczenie zostało utworzone', 3000);
            navigate('/fleet/rentals');
        } catch (err) {
            console.error('Error creating rental:', err);
            showToast('error', 'Wystąpił błąd podczas tworzenia wypożyczenia', 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/fleet/rentals');
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie danych...</LoadingText>
            </LoadingContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <BackLink onClick={() => navigate('/fleet/rentals')}>
                    <FaArrowLeft /> Wróć do listy wypożyczeń
                </BackLink>
                <PageTitle>
                    <FaPlus />
                    Nowe wypożyczenie
                </PageTitle>
            </PageHeader>

            {error && (
                <ErrorAlert>
                    {error}
                </ErrorAlert>
            )}

            <FormContainer>
                <RentalForm
                    initialData={initialRentalData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    vehicles={vehicles}
                    clients={clients}
                    isLoading={isSaving}
                />
            </FormContainer>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
`;

const BackLink = styled.a`
    display: flex;
    align-items: center;
    color: #3498db;
    font-size: 14px;
    cursor: pointer;
    
    svg {
        margin-right: 8px;
    }
    
    &:hover {
        text-decoration: underline;
    }
`;

const PageTitle = styled.h1`
    display: flex;
    align-items: center;
    font-size: 24px;
    color: #2c3e50;
    margin: 0;
    
    svg {
        margin-right: 12px;
        color: #3498db;
    }
`;

const FormContainer = styled.div`
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
`;

const ErrorAlert = styled.div`
    padding: 16px;
    background-color: #fdedec;
    color: #c0392b;
    border-radius: 4px;
    margin-bottom: 20px;
    border-left: 4px solid #e74c3c;
    font-size: 14px;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
`;

const LoadingSpinner = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    color: #7f8c8d;
`;

export default FleetRentalFormPage;