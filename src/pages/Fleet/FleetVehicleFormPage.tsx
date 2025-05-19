// src/pages/Fleet/FleetVehicleFormPage.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FleetVehicle } from '../../types/fleet';
import { fleetVehicleApi } from '../../api/fleetApi';
import VehicleForm from '../../components/fleet/forms/VehicleForm';
import { useToast } from '../../components/common/Toast/Toast';
import { FaCar, FaPlus, FaEdit } from 'react-icons/fa';

const FleetVehicleFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [vehicle, setVehicle] = useState<FleetVehicle | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Określenie czy to edycja czy tworzenie nowego pojazdu
    const isEditMode = !!id;

    // Pobieranie danych pojazdu w przypadku edycji
    useEffect(() => {
        if (isEditMode) {
            const fetchVehicle = async () => {
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
        }
    }, [id, isEditMode]);

    const handleSubmit = async (data: Partial<FleetVehicle>) => {
        setIsSaving(true);

        try {
            if (isEditMode && id) {
                // Aktualizacja istniejącego pojazdu
                await fleetVehicleApi.updateVehicle(id, data);
                showToast('success', 'Pojazd został zaktualizowany', 3000);
            } else {
                // Tworzenie nowego pojazdu
                await fleetVehicleApi.createVehicle(data);
                showToast('success', 'Pojazd został dodany do floty', 3000);
            }

            // Nawigacja do listy pojazdów po zapisie
            navigate('/fleet/vehicles');
        } catch (err) {
            console.error('Error saving vehicle:', err);
            showToast('error', 'Wystąpił błąd podczas zapisywania pojazdu', 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(-1); // Powrót do poprzedniej strony
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie danych pojazdu...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error) {
        return (
            <ErrorContainer>
                <ErrorMessage>{error}</ErrorMessage>
                <BackButton onClick={() => navigate('/fleet/vehicles')}>
                    Wróć do listy pojazdów
                </BackButton>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>
                    {isEditMode ? (
                        <>
                            <FaEdit />
                            Edycja pojazdu
                        </>
                    ) : (
                        <>
                            <FaPlus />
                            Dodawanie nowego pojazdu
                        </>
                    )}
                </PageTitle>
                <BackLink onClick={() => navigate('/fleet/vehicles')}>
                    &larr; Wróć do listy pojazdów
                </BackLink>
            </PageHeader>

            <FormContainer>
                <VehicleForm
                    initialData={vehicle || undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
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

const BackLink = styled.a`
    display: inline-block;
    color: #3498db;
    font-size: 14px;
    cursor: pointer;
    
    &:hover {
        text-decoration: underline;
    }
`;

const FormContainer = styled.div`
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
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

const ErrorContainer = styled.div`
    text-align: center;
    padding: 40px;
`;

const ErrorMessage = styled.div`
    color: #e74c3c;
    margin-bottom: 16px;
`;

const BackButton = styled.button`
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        background-color: #2980b9;
    }
`;

export default FleetVehicleFormPage;