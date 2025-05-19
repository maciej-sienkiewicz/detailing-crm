// src/pages/Fleet/FleetMobileUpdatePage.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FleetVehicle } from '../../types/fleet';
import { fleetVehicleApi } from '../../api/fleetApi';
import MobileVehicleUpdate from '../../components/fleet/mobile/MobileVehicleUpdate';
import { useToast } from '../../components/common/Toast/Toast';
import { FaArrowLeft } from 'react-icons/fa';

const FleetMobileUpdatePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [vehicle, setVehicle] = useState<FleetVehicle | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie danych pojazdu
    useEffect(() => {
        const fetchVehicle = async () => {
            if (!id) return;

            setIsLoading(true);
            setError(null);

            try {
                const data = await fleetVehicleApi.fetchVehicleById(id);
                if (!data) {
                    setError('Nie znaleziono pojazdu o podanym ID');
                    return;
                }
                setVehicle(data);
            } catch (err) {
                console.error('Error fetching vehicle:', err);
                setError('Wystąpił błąd podczas ładowania danych pojazdu');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicle();
    }, [id]);

    const handleUpdateSuccess = () => {
        // Odświeżenie danych pojazdu
        if (id) {
            fleetVehicleApi.fetchVehicleById(id)
                .then(data => {
                    if (data) {
                        setVehicle(data);
                        showToast('success', 'Dane pojazdu zostały zaktualizowane', 3000);
                    }
                })
                .catch(err => {
                    console.error('Error refreshing vehicle data:', err);
                });
        }
    };

    const goBack = () => {
        navigate(-1);
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error || !vehicle) {
        return (
            <ErrorContainer>
                <ErrorHeader>
                    <BackButton onClick={goBack}>
                        <FaArrowLeft />
                    </BackButton>
                    <ErrorTitle>Błąd</ErrorTitle>
                </ErrorHeader>
                <ErrorMessage>{error || 'Nie znaleziono pojazdu'}</ErrorMessage>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <MobileHeader>
                <BackButton onClick={goBack}>
                    <FaArrowLeft />
                </BackButton>
                <HeaderTitle>Aktualizuj pojazd</HeaderTitle>
            </MobileHeader>

            <MobileVehicleUpdate
                vehicle={vehicle}
                onUpdateSuccess={handleUpdateSuccess}
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

export default FleetMobileUpdatePage;