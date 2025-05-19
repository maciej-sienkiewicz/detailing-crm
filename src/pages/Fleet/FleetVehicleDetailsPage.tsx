// src/pages/Fleet/FleetVehicleDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FleetVehicle,
    FleetVehicleStatus,
    FleetVehicleStatusLabels,
    FleetVehicleCategoryLabels,
    FleetVehicleUsageTypeLabels
} from '../../types/fleet';
import { FleetMaintenance, FleetMaintenanceTypeLabels } from '../../types/fleetMaintenance';
import { fleetVehicleApi } from '../../api/fleetApi';
import { fleetMaintenanceApi } from '../../api/fleetMaintenanceApi';
import { fleetRentalApi } from '../../api/fleetRentalApi';
import { fleetImageApi } from '../../api/fleetImageApi';
import FleetStatusBadge from '../../components/fleet/common/FleetStatusBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useToast } from '../../components/common/Toast/Toast';
import EnhancedFuelLevelIndicator from '../../components/fleet/common/EnhancedFuelLevelIndicator';

import {
    FaCar,
    FaEdit,
    FaTrash,
    FaExchangeAlt,
    FaTools,
    FaGasPump,
    FaTachometerAlt,
    FaCalendarAlt,
    FaFileAlt,
    FaHistory,
    FaPlus,
    FaCamera
} from 'react-icons/fa';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const FleetVehicleDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [vehicle, setVehicle] = useState<FleetVehicle | null>(null);
    const [maintenanceHistory, setMaintenanceHistory] = useState<FleetMaintenance[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [images, setImages] = useState<any[]>([]);
    const [vehicleRentals, setVehicleRentals] = useState<any[]>([]);

    // Pobieranie danych pojazdu
    useEffect(() => {
        const fetchVehicleData = async () => {
            if (!id) return;

            setIsLoading(true);
            setError(null);

            try {
                // Pobieranie danych pojazdu
                const vehicleData = await fleetVehicleApi.fetchVehicleById(id);
                if (!vehicleData) {
                    setError('Nie znaleziono pojazdu o podanym ID');
                    return;
                }
                setVehicle(vehicleData);

                // Pobieranie historii serwisowej
                const maintenanceData = await fleetMaintenanceApi.fetchMaintenanceHistory(id);
                setMaintenanceHistory(maintenanceData);

                // Pobieranie zdjęć
                const imagesData = await fleetImageApi.fetchVehicleImages(id);
                setImages(imagesData);

                // Pobieranie wypożyczeń
                const rentalsData = await fleetRentalApi.fetchVehicleRentals(id);
                setVehicleRentals(rentalsData);
            } catch (err) {
                console.error('Error fetching vehicle data:', err);
                setError('Wystąpił błąd podczas ładowania danych pojazdu');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicleData();
    }, [id]);

    const handleEdit = () => {
        navigate(`/fleet/vehicles/edit/${id}`);
    };

    const handleCreateRental = () => {
        navigate(`/fleet/rentals/new?vehicleId=${id}`);
    };

    const handleAddMaintenance = () => {
        navigate(`/fleet/vehicles/${id}/maintenance/new`);
    };

    const handleAddFuel = () => {
        navigate(`/fleet/vehicles/${id}/fuel/new`);
    };

    const handleDeleteConfirm = async () => {
        if (!id) return;

        setIsDeleting(true);

        try {
            await fleetVehicleApi.deleteVehicle(id);
            showToast('success', 'Pojazd został usunięty', 3000);
            navigate('/fleet/vehicles');
        } catch (err) {
            console.error('Error deleting vehicle:', err);
            showToast('error', 'Wystąpił błąd podczas usuwania pojazdu', 3000);
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: pl });
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie danych pojazdu...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error || !vehicle) {
        return (
            <ErrorContainer>
                <ErrorMessage>{error || 'Nie znaleziono pojazdu'}</ErrorMessage>
                <BackButton onClick={() => navigate('/fleet/vehicles')}>
                    Wróć do listy pojazdów
                </BackButton>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <BackLink onClick={() => navigate('/fleet/vehicles')}>
                    &larr; Wróć do listy pojazdów
                </BackLink>
                <ActionButtons>
                    <ActionButton onClick={handleCreateRental} disabled={vehicle.status !== FleetVehicleStatus.AVAILABLE}>
                        <FaExchangeAlt />
                        <span>Wypożycz</span>
                    </ActionButton>
                    <ActionButton onClick={handleEdit}>
                        <FaEdit />
                        <span>Edytuj</span>
                    </ActionButton>
                    <DeleteButton onClick={() => setShowDeleteDialog(true)}>
                        <FaTrash />
                        <span>Usuń</span>
                    </DeleteButton>
                </ActionButtons>
            </PageHeader>

            <ContentContainer>
                <MainInfo>
                    <VehicleHeader>
                        <VehicleIcon>
                            <FaCar />
                        </VehicleIcon>
                        <VehicleHeaderContent>
                            <VehicleTitle>
                                {vehicle.make} {vehicle.model} ({vehicle.year})
                            </VehicleTitle>
                            <VehiclePlate>{vehicle.licensePlate}</VehiclePlate>
                            <FleetStatusBadge status={vehicle.status} type="vehicle" />
                        </VehicleHeaderContent>
                    </VehicleHeader>

                    <BasicInfoSection>
                        <SectionTitle>Podstawowe informacje</SectionTitle>
                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>
                                    <FaTachometerAlt />
                                    Przebieg
                                </InfoLabel>
                                <InfoValue>{vehicle.currentMileage.toLocaleString()} km</InfoValue>
                            </InfoItem>

                            {/* Dodajemy nowy element dla poziomu paliwa */}
                            <InfoItem>
                                <InfoLabel>
                                    <FaGasPump />
                                    Poziom paliwa
                                </InfoLabel>
                                <InfoValue>
                                    <EnhancedFuelLevelIndicator
                                        vehicleId={vehicle.id}
                                        size="medium"
                                        showUpdatedAt={true}
                                    />
                                </InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>
                                    <FaCar />
                                    Kategoria
                                </InfoLabel>
                                <InfoValue>{FleetVehicleCategoryLabels[vehicle.category]}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>
                                    <FaExchangeAlt />
                                    Typ użytkowania
                                </InfoLabel>
                                <InfoValue>{FleetVehicleUsageTypeLabels[vehicle.usageType]}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>
                                    <FaFileAlt />
                                    VIN
                                </InfoLabel>
                                <InfoValue>{vehicle.vin}</InfoValue>
                            </InfoItem>
                        </InfoGrid>
                    </BasicInfoSection>

                    <TechnicalInfoSection>
                        <SectionTitle>Dane techniczne</SectionTitle>
                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>Typ silnika</InfoLabel>
                                <InfoValue>{vehicle.engineType || '-'}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Pojemność</InfoLabel>
                                <InfoValue>{vehicle.engineCapacity ? `${vehicle.engineCapacity} cm³` : '-'}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Paliwo</InfoLabel>
                                <InfoValue>{vehicle.fuelType || '-'}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Skrzynia biegów</InfoLabel>
                                <InfoValue>{vehicle.transmission || '-'}</InfoValue>
                            </InfoItem>
                        </InfoGrid>
                    </TechnicalInfoSection>

                    <MaintenanceInfoSection>
                        <SectionTitle>Informacje serwisowe</SectionTitle>
                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>Ostatni serwis</InfoLabel>
                                <InfoValue>{vehicle.lastServiceMileage.toLocaleString()} km</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>Następny serwis</InfoLabel>
                                <InfoValue>{vehicle.nextServiceMileage.toLocaleString()} km</InfoValue>
                            </InfoItem>
                        </InfoGrid>

                        <SectionActionButtons>
                            <SmallActionButton onClick={handleAddMaintenance}>
                                <FaTools />
                                Dodaj serwis
                            </SmallActionButton>
                            <SmallActionButton onClick={handleAddFuel}>
                                <FaGasPump />
                                Dodaj tankowanie
                            </SmallActionButton>
                        </SectionActionButtons>
                    </MaintenanceInfoSection>

                    <DocumentsSection>
                        <SectionTitle>Dokumenty i terminy</SectionTitle>
                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>
                                    <FaCalendarAlt />
                                    Data zakupu
                                </InfoLabel>
                                <InfoValue>{formatDate(vehicle.purchaseDate)}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>
                                    <FaCalendarAlt />
                                    Data rejestracji
                                </InfoLabel>
                                <InfoValue>{formatDate(vehicle.registrationDate)}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>
                                    <FaCalendarAlt />
                                    Ubezpieczenie do
                                </InfoLabel>
                                <InfoValue>{formatDate(vehicle.insuranceExpiryDate)}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>
                                    <FaCalendarAlt />
                                    Przegląd do
                                </InfoLabel>
                                <InfoValue>{formatDate(vehicle.technicalInspectionDate)}</InfoValue>
                            </InfoItem>
                        </InfoGrid>
                    </DocumentsSection>
                </MainInfo>

                <Sidebar>
                    <SidebarSection>
                        <SidebarSectionTitle>
                            <FaCamera />
                            Zdjęcia
                        </SidebarSectionTitle>

                        {images.length === 0 ? (
                            <EmptyMessage>Brak zdjęć</EmptyMessage>
                        ) : (
                            <ImagesGrid>
                                {images.map((image, index) => (
                                    <ImageThumbnail key={index}>
                                        <img src={image.url} alt={`Zdjęcie ${index + 1}`} />
                                    </ImageThumbnail>
                                ))}
                            </ImagesGrid>
                        )}

                        <AddImageButton>
                            <FaPlus />
                            Dodaj zdjęcie
                        </AddImageButton>
                    </SidebarSection>

                    <SidebarSection>
                        <SidebarSectionTitle>
                            <FaHistory />
                            Historia serwisowa
                        </SidebarSectionTitle>

                        {maintenanceHistory.length === 0 ? (
                            <EmptyMessage>Brak wpisów serwisowych</EmptyMessage>
                        ) : (
                            <MaintenanceList>
                                {maintenanceHistory.map((item, index) => (
                                    <MaintenanceItem key={index}>
                                        <MaintenanceDate>{formatDate(item.date)}</MaintenanceDate>
                                        <MaintenanceType>
                                            {FleetMaintenanceTypeLabels[item.type] || item.type}
                                        </MaintenanceType>
                                        <MaintenanceMileage>
                                            {item.mileage.toLocaleString()} km
                                        </MaintenanceMileage>
                                        <MaintenanceDescription>
                                            {item.description}
                                        </MaintenanceDescription>
                                    </MaintenanceItem>
                                ))}
                            </MaintenanceList>
                        )}

                        <ViewMoreButton onClick={handleAddMaintenance}>
                            <FaPlus />
                            Dodaj wpis serwisowy
                        </ViewMoreButton>
                    </SidebarSection>

                    <SidebarSection>
                        <SidebarSectionTitle>
                            <FaExchangeAlt />
                            Historia wypożyczeń
                        </SidebarSectionTitle>

                        {vehicleRentals.length === 0 ? (
                            <EmptyMessage>Brak historii wypożyczeń</EmptyMessage>
                        ) : (
                            <RentalsList>
                                {vehicleRentals.slice(0, 5).map((rental, index) => (
                                    <RentalItem key={index}>
                                        <RentalDates>
                                            {formatDate(rental.startDate)} - {rental.actualEndDate ? formatDate(rental.actualEndDate) : '...'}
                                        </RentalDates>
                                        <RentalClient>
                                            {rental.clientId ? 'Klient' : 'Pracownik'}
                                        </RentalClient>
                                        <FleetStatusBadge status={rental.status} type="rental" />
                                    </RentalItem>
                                ))}
                            </RentalsList>
                        )}

                        {vehicleRentals.length > 5 && (
                            <ViewMoreButton onClick={() => navigate(`/fleet/vehicles/${id}/rentals`)}>
                                Zobacz wszystkie ({vehicleRentals.length})
                            </ViewMoreButton>
                        )}
                    </SidebarSection>
                </Sidebar>
            </ContentContainer>

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                title="Usuń pojazd"
                message={`Czy na pewno chcesz usunąć pojazd ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})?`}
                confirmText={isDeleting ? 'Usuwanie...' : 'Usuń'}
                cancelText="Anuluj"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </PageContainer>
    );
};

const PageContainer = styled.div`
    padding: 24px;
    max-width: 1400px;
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
        gap: 16px;
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

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    
    @media (max-width: 768px) {
        width: 100%;
    }
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    svg {
        margin-right: 8px;
    }
    
    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
        flex: 1;
        justify-content: center;
    }
    
    @media (max-width: 480px) {
        padding: 8px;
        
        span {
            display: none;
        }
        
        svg {
            margin-right: 0;
        }
    }
`;

const DeleteButton = styled(ActionButton)`
    background-color: #e74c3c;
    
    &:hover {
        background-color: #c0392b;
    }
`;

const ContentContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 24px;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const MainInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const VehicleHeader = styled.div`
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const VehicleIcon = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3498db;
    color: white;
    font-size: 28px;
    margin-right: 20px;
    flex-shrink: 0;
`;

const VehicleHeaderContent = styled.div`
    flex: 1;
`;

const VehicleTitle = styled.h1`
    font-size: 24px;
    color: #2c3e50;
    margin: 0 0 4px 0;
`;

const VehiclePlate = styled.div`
    font-size: 18px;
    color: #7f8c8d;
    margin-bottom: 8px;
`;

const Section = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const BasicInfoSection = styled(Section)``;
const TechnicalInfoSection = styled(Section)``;
const MaintenanceInfoSection = styled(Section)``;
const DocumentsSection = styled(Section)``;

const SectionTitle = styled.h2`
    font-size: 18px;
    color: #2c3e50;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 4px;
    
    svg {
        margin-right: 8px;
        color: #3498db;
    }
`;

const InfoValue = styled.div`
    font-size: 16px;
    color: #2c3e50;
    font-weight: 500;
`;

const SectionActionButtons = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 16px;
    justify-content: flex-end;
    
    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const SmallActionButton = styled.button`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: white;
    color: #3498db;
    border: 1px solid #3498db;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    
    svg {
        margin-right: 8px;
    }
    
    &:hover {
        background-color: #ebf5fb;
    }
    
    @media (max-width: 576px) {
        width: 100%;
        justify-content: center;
    }
`;

const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const SidebarSection = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SidebarSectionTitle = styled.h3`
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #2c3e50;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
    
    svg {
        margin-right: 8px;
        color: #3498db;
    }
`;

const EmptyMessage = styled.div`
    padding: 20px;
    text-align: center;
    color: #7f8c8d;
    background-color: #f8f9fa;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 16px;
`;

const ImagesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    margin-bottom: 16px;
`;

const ImageThumbnail = styled.div`
    width: 100%;
    padding-top: 100%; /* 1:1 Aspect Ratio */
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    
    img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const AddImageButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 8px;
    background-color: white;
    color: #3498db;
    border: 1px dashed #3498db;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    
    svg {
        margin-right: 8px;
    }
    
    &:hover {
        background-color: #ebf5fb;
    }
`;

const MaintenanceList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
`;

const MaintenanceItem = styled.div`
    padding: 12px;
    border-radius: 4px;
    background-color: #f8f9fa;
    border-left: 3px solid #3498db;
`;

const MaintenanceDate = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const MaintenanceType = styled.div`
    font-weight: 500;
    margin: 4px 0;
    color: #2c3e50;
`;

const MaintenanceMileage = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 4px;
`;

const MaintenanceDescription = styled.div`
    font-size: 13px;
    color: #34495e;
`;

const RentalsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
`;

const RentalItem = styled.div`
    padding: 12px;
    border-radius: 4px;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const RentalDates = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #2c3e50;
`;

const RentalClient = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const ViewMoreButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 8px;
    background-color: white;
    color: #3498db;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    
    svg {
        margin-right: 8px;
    }
    
    &:hover {
        background-color: #f8f9fa;
    }
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

export default FleetVehicleDetailsPage;