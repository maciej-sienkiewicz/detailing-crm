// src/pages/Fleet/FleetMobileRentalReturnPage.tsx

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useNavigate, useParams} from 'react-router-dom';
import {FleetRental, FleetRentalStatus} from '../../types/fleetRental';
import {FleetVehicle} from '../../types/fleet';
import {fleetRentalApi} from '../../api/fleetRentalApi';
import {fleetVehicleApi} from '../../api/fleetApi';
import {clientApi} from '../../api/clientsApi';
import MobileRentalReturn from '../../components/fleet/mobile/MobileRentalReturn';
import {useToast} from '../../components/common/Toast/Toast';
import {FaArrowLeft} from 'react-icons/fa';

const FleetMobileRentalReturnPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
// Kontynuacja pliku src/pages/Fleet/FleetMobileRentalReturnPage.tsx

    const [rental, setRental] = useState<FleetRental | null>(null);
    const [vehicle, setVehicle] = useState<FleetVehicle | null>(null);
    const [clientName, setClientName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie danych wypożyczenia
    useEffect(() => {
        const fetchRentalData = async () => {
            if (!id) return;

            setIsLoading(true);
            setError(null);

            try {
                // Pobieranie danych wypożyczenia
                const rentalData = await fleetRentalApi.fetchRentalById(id);
                if (!rentalData) {
                    setError('Nie znaleziono wypożyczenia o podanym ID');
                    return;
                }

                // Sprawdzenie czy wypożyczenie jest aktywne
                if (rentalData.status !== FleetRentalStatus.ACTIVE) {
                    setError('To wypożyczenie nie jest aktywne. Można zakończyć tylko aktywne wypożyczenia.');
                    setRental(rentalData);
                    return;
                }

                setRental(rentalData);

                // Pobieranie danych pojazdu
                const vehicleData = await fleetVehicleApi.fetchVehicleById(rentalData.vehicleId);
                if (vehicleData) {
                    setVehicle(vehicleData);
                }

                // Pobieranie danych klienta, jeśli istnieje
                if (rentalData.clientId) {
                    const clientData = await clientApi.fetchClientById(rentalData.clientId);
                    if (clientData) {
                        setClientName(`${clientData.firstName} ${clientData.lastName}`);
                    }
                }
            } catch (err) {
                console.error('Error fetching rental data:', err);
                setError('Wystąpił błąd podczas ładowania danych wypożyczenia');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRentalData();
    }, [id]);

    const handleUpdateSuccess = () => {
        // Przekierowanie po zakończeniu wypożyczenia
        navigate('/fleet/rentals');
        showToast('success', 'Wypożyczenie zostało zakończone', 3000);
    };

    const goBack = () => {
        navigate(-1);
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie danych wypożyczenia...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error || !rental || !vehicle) {
        return (
            <ErrorContainer>
                <ErrorHeader>
                    <BackButton onClick={goBack}>
                        <FaArrowLeft />
                    </BackButton>
                    <ErrorTitle>Błąd</ErrorTitle>
                </ErrorHeader>
                <ErrorMessage>{error || 'Nie znaleziono danych wypożyczenia'}</ErrorMessage>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <MobileHeader>
                <BackButton onClick={goBack}>
                    <FaArrowLeft />
                </BackButton>
                <HeaderTitle>Zakończ wypożyczenie</HeaderTitle>
            </MobileHeader>

            <MobileRentalReturn
                rental={rental}
                vehicle={vehicle}
                clientName={clientName}
                onSuccess={handleUpdateSuccess}
            />
        </PageContainer>
    );
};

const PageContainer = styled.div`
   max-width: 600px;
   margin: 0 auto;
   padding-bottom: 40px;
`;

const MobileHeader = styled.div`
   display: flex;
   align-items: center;
   padding: 16px;
   border-bottom: 1px solid #eee;
   background-color: white;
   position: sticky;
   top: 0;
   z-index: 100;
`;

const BackButton = styled.button`
   width: 40px;
   height: 40px;
   border-radius: 50%;
   border: none;
   background-color: #f1f1f1;
   color: #333;
   display: flex;
   align-items: center;
   justify-content: center;
   cursor: pointer;
   margin-right: 16px;
   
   &:hover {
       background-color: #e0e0e0;
   }
`;

const HeaderTitle = styled.h1`
   font-size: 18px;
   margin: 0;
   color: #2c3e50;
`;

const LoadingContainer = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   height: 100vh;
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

const ErrorContainer = styled.div`
   padding: 20px;
   max-width: 600px;
   margin: 0 auto;
`;

const ErrorHeader = styled.div`
   display: flex;
   align-items: center;
   margin-bottom: 24px;
`;

const ErrorTitle = styled.h1`
   font-size: 18px;
   margin: 0;
   color: #e74c3c;
`;

const ErrorMessage = styled.div`
   background-color: #fdeded;
   border-left: 4px solid #e74c3c;
   padding: 16px;
   border-radius: 4px;
   color: #c0392b;
`;

export default FleetMobileRentalReturnPage;

