// src/pages/Fleet/FleetRentalDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FleetRental,
    FleetRentalStatus,
    FleetRentalStatusLabels,
    FleetImage
} from '../../types/fleetRental';
import { FleetVehicle, FleetVehicleStatus } from '../../types/fleet';
import { ClientExpanded } from '../../types/client';
import { fleetRentalApi } from '../../api/fleetRentalApi';
import { fleetVehicleApi } from '../../api/fleetApi';
import { clientApi } from '../../api/clientsApi';
import FleetStatusBadge from '../../components/fleet/common/FleetStatusBadge';
import FuelLevelIndicator from '../../components/fleet/common/FuelLevelIndicator';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useToast } from '../../components/common/Toast/Toast';
import { format, isAfter, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaExchangeAlt,
    FaArrowLeft,
    FaPrint,
    FaFileAlt,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaCar,
    FaUser,
    FaTachometerAlt,
    FaGasPump,
    FaExclamationTriangle,
    FaCheck,
    FaCamera,
    FaMobileAlt,
    FaTimes
} from 'react-icons/fa';

const FleetRentalDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [rental, setRental] = useState<FleetRental | null>(null);
    const [vehicle, setVehicle] = useState<FleetVehicle | null>(null);
    const [client, setClient] = useState<ClientExpanded | null>(null);
    const [images, setImages] = useState<FleetImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Stany dla dialogów potwierdzenia
    const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Stan dla podglądu zdjęcia
    const [selectedImage, setSelectedImage] = useState<FleetImage | null>(null);

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
                        setClient(clientData);
                    }
                }

                // Pobieranie zdjęć
                const imagesData = await fleetRentalApi.fetchRentalImages(id);
                setImages(imagesData);
            } catch (err) {
                console.error('Error fetching rental data:', err);
                setError('Wystąpił błąd podczas ładowania danych wypożyczenia');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRentalData();
    }, [id]);

    const handleCancelRental = async () => {
        if (!id || !rental || !vehicle) return;

        setIsProcessing(true);

        try {
            // Aktualizacja statusu wypożyczenia
            await fleetRentalApi.updateRentalStatus(id, FleetRentalStatus.CANCELLED);

            // Aktualizacja statusu pojazdu
            await fleetVehicleApi.updateVehicleStatus(vehicle.id, FleetVehicleStatus.AVAILABLE);

            // Aktualizacja stanu komponentu
            setRental({
                ...rental,
                status: FleetRentalStatus.CANCELLED
            });

            showToast('success', 'Wypożyczenie zostało anulowane', 3000);
        } catch (err) {
            console.error('Error cancelling rental:', err);
            showToast('error', 'Wystąpił błąd podczas anulowania wypożyczenia', 3000);
        } finally {
            setIsProcessing(false);
            setShowCancelDialog(false);
        }
    };

    const handleCompleteRental = async () => {
        if (!id || !rental || !vehicle) return;

        setIsProcessing(true);

        navigate(`/fleet/mobile/rental/${id}/return`);
    };

    const handlePrintContract = () => {
        showToast('info', 'Funkcja drukowania umowy jest w trakcie implementacji', 3000);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: pl });
    };

    const calculateRentalDuration = () => {
        if (!rental) return 0;

        const startDate = new Date(rental.startDate);
        let endDate;

        if (rental.actualEndDate) {
            endDate = new Date(rental.actualEndDate);
        } else if (rental.plannedEndDate) {
            endDate = new Date(rental.plannedEndDate);
        } else {
            return 0;
        }

        // Obliczanie różnicy w dniach
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    const checkIsOverdue = (): boolean => {
        if (!rental || rental.status !== FleetRentalStatus.ACTIVE) return false;

        const now = new Date();
        const plannedEndDate = new Date(rental.plannedEndDate);

        return isAfter(now, plannedEndDate);
    };

    const getMileageDifference = (): number => {
        if (!rental || !rental.endMileage) return 0;

        return rental.endMileage - rental.startMileage;
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
                <ErrorMessage>{error || 'Nie znaleziono wypożyczenia'}</ErrorMessage>
                <BackButton onClick={() => navigate('/fleet/rentals')}>
                    Wróć do listy wypożyczeń
                </BackButton>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <BackLink onClick={() => navigate('/fleet/rentals')}>
                    <FaArrowLeft /> Wróć do listy wypożyczeń
                </BackLink>
                <ActionButtons>
                    {rental.status === FleetRentalStatus.ACTIVE && (
                        <>
                            <MobileReturnButton onClick={() => navigate(`/fleet/mobile/rental/${id}/return`)}>
                                <FaMobileAlt />
                                <span>Zakończ (mobile)</span>
                            </MobileReturnButton>
                            <ActionButton onClick={() => setShowCompleteDialog(true)}>
                                <FaCheck />
                                <span>Zakończ</span>
                            </ActionButton>
                            <CancelButton onClick={() => setShowCancelDialog(true)}>
                                <FaTimes />
                                <span>Anuluj</span>
                            </CancelButton>
                        </>
                    )}
                    <PrintButton onClick={handlePrintContract}>
                        <FaPrint />
                        <span>Drukuj umowę</span>
                    </PrintButton>
                </ActionButtons>
            </PageHeader>

            <RentalHeader>
                <RentalTitle>
                    <FaExchangeAlt />
                    Wypożyczenie #{rental.id.substring(0, 8)}
                </RentalTitle>
                <RentalStatus>
                    <FleetStatusBadge status={rental.status} type="rental" />
                    {checkIsOverdue() && (
                        <OverdueTag>Opóźnione</OverdueTag>
                    )}
                </RentalStatus>
            </RentalHeader>

            <ContentContainer>
                <MainInfo>
                    <InfoSection>
                        <SectionTitle>Informacje podstawowe</SectionTitle>
                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>
                                    <FaCalendarAlt />
                                    Data rozpoczęcia
                                </InfoLabel>
                                <InfoValue>{formatDate(rental.startDate)}</InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>
                                    <FaCalendarAlt />
                                    Planowana data zakończenia
                                </InfoLabel>
                                <InfoValue>{formatDate(rental.plannedEndDate)}</InfoValue>
                            </InfoItem>

                            {rental.actualEndDate && (
                                <InfoItem>
                                    <InfoLabel>
                                        <FaCalendarAlt />
                                        Faktyczna data zakończenia
                                    </InfoLabel>
                                    <InfoValue>{formatDate(rental.actualEndDate)}</InfoValue>
                                </InfoItem>
                            )}

                            <InfoItem>
                                <InfoLabel>
                                    <FaCalendarAlt />
                                    Czas trwania
                                </InfoLabel>
                                <InfoValue>{calculateRentalDuration()} dni</InfoValue>
                            </InfoItem>

                            <InfoItem>
                                <InfoLabel>
                                    <FaFileAlt />
                                    Numer umowy
                                </InfoLabel>
                                <InfoValue>{rental.contractNumber}</InfoValue>
                            </InfoItem>
                        </InfoGrid>
                    </InfoSection>

                    <InfoSectionGrid>
                        <VehicleSection>
                            <SectionTitle>
                                <FaCar />
                                Pojazd
                            </SectionTitle>
                            <VehicleInfo>
                                <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                                <VehiclePlate>{vehicle.licensePlate}</VehiclePlate>
                                <VehicleYear>Rok produkcji: {vehicle.year}</VehicleYear>
                            </VehicleInfo>
                        </VehicleSection>

                        <ClientSection>
                            <SectionTitle>
                                <FaUser />
                                {rental.clientId ? 'Klient' : 'Użytkownik firmowy'}
                            </SectionTitle>
                            {client ? (
                                <ClientInfo>
                                    <ClientName>{client.firstName} {client.lastName}</ClientName>
                                    {client.company && <ClientCompany>{client.company}</ClientCompany>}
                                    <ClientContact>
                                        <div>Tel: {client.phone}</div>
                                        <div>Email: {client.email}</div>
                                    </ClientContact>
                                </ClientInfo>
                            ) : (
                                <PlaceholderText>Brak danych klienta</PlaceholderText>
                            )}
                        </ClientSection>
                    </InfoSectionGrid>

                    <InfoSection>
                        <SectionTitle>Stan pojazdu</SectionTitle>
                        <MileageSection>
                            <MileageItem>
                                <MileageLabel>
                                    <FaTachometerAlt />
                                    Przebieg początkowy
                                </MileageLabel>
                                <MileageValue>{rental.startMileage.toLocaleString()} km</MileageValue>
                            </MileageItem>

                            {rental.endMileage && (
                                <>
                                    <MileageArrow>→</MileageArrow>
                                    <MileageItem>
                                        <MileageLabel>
                                            <FaTachometerAlt />
                                            Przebieg końcowy
                                        </MileageLabel>
                                        <MileageValue>{rental.endMileage.toLocaleString()} km</MileageValue>
                                    </MileageItem>

                                    <MileageDifference>
                                        <span>Różnica:</span>
                                        <strong>{getMileageDifference().toLocaleString()} km</strong>
                                    </MileageDifference>
                                </>
                            )}
                        </MileageSection>

                        <FuelSection>
                            <FuelItem>
                                <FuelLabel>
                                    <FaGasPump />
                                    Poziom paliwa początkowy
                                </FuelLabel>
                                <FuelLevelIndicator level={rental.fuelLevelStart} />
                            </FuelItem>

                            {rental.fuelLevelEnd !== undefined && (
                                <>
                                    <FuelArrow>→</FuelArrow>
                                    <FuelItem>
                                        <FuelLabel>
                                            <FaGasPump />
                                            Poziom paliwa końcowy
                                        </FuelLabel>
                                        <FuelLevelIndicator level={rental.fuelLevelEnd} />
                                    </FuelItem>
                                </>
                            )}
                        </FuelSection>

                        {rental.damageReported && (
                            <DamageSection>
                                <DamageTitle>
                                    <FaExclamationTriangle />
                                    Zgłoszone uszkodzenia
                                </DamageTitle>
                                <DamageDescription>
                                    {rental.damageDescription}
                                </DamageDescription>
                            </DamageSection>
                        )}

                        <NotesSection>
                            <NotesItem>
                                <NotesTitle>Uwagi przy wydaniu</NotesTitle>
                                <NotesContent>
                                    {rental.startConditionNotes || <PlaceholderText>Brak uwag</PlaceholderText>}
                                </NotesContent>
                            </NotesItem>

                            {rental.endConditionNotes && (
                                <NotesItem>
                                    <NotesTitle>Uwagi przy zwrocie</NotesTitle>
                                    <NotesContent>{rental.endConditionNotes}</NotesContent>
                                </NotesItem>
                            )}
                        </NotesSection>
                    </InfoSection>
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
                                    <ImageThumbnail
                                        key={index}
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img src={image.url} alt={`Zdjęcie ${index + 1}`} />
                                    </ImageThumbnail>
                                ))}
                            </ImagesGrid>
                        )}
                    </SidebarSection>
                </Sidebar>
            </ContentContainer>

            {/* Dialog potwierdzenia anulowania */}
            <ConfirmationDialog
                isOpen={showCancelDialog}
                title="Anuluj wypożyczenie"
                message={`Czy na pewno chcesz anulować wypożyczenie pojazdu ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})?`}
                confirmText={isProcessing ? 'Anulowanie...' : 'Anuluj wypożyczenie'}
                cancelText="Nie anuluj"
                onConfirm={handleCancelRental}
                onCancel={() => setShowCancelDialog(false)}
            />

            {/* Dialog potwierdzenia zakończenia */}
            <ConfirmationDialog
                isOpen={showCompleteDialog}
                title="Zakończ wypożyczenie"
                message="Czy chcesz zakończyć wypożyczenie? Zostaniesz przekierowany do formularza zwrotu pojazdu."
                confirmText="Przejdź do zwrotu"
                cancelText="Anuluj"
                onConfirm={handleCompleteRental}
                onCancel={() => setShowCompleteDialog(false)}
            />

            {/* Modal podglądu zdjęcia */}
            {selectedImage && (
                <ImagePreviewModal onClick={() => setSelectedImage(null)}>
                    <ImagePreviewContent onClick={e => e.stopPropagation()}>
                        <CloseButton onClick={() => setSelectedImage(null)}>
                            &times;
                        </CloseButton>
                        <FullSizeImage src={selectedImage.url} alt="Podgląd zdjęcia" />
                        <ImageDescription>
                            {selectedImage.description || 'Brak opisu'}
                        </ImageDescription>
                    </ImagePreviewContent>
                </ImagePreviewModal>
            )}
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

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    
    @media (max-width: 768px) {
        width: 100%;
        flex-wrap: wrap;
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

const CancelButton = styled(ActionButton)`
    background-color: #e74c3c;
    
    &:hover {
        background-color: #c0392b;
    }
`;

// Kontynuacja pliku src/pages/Fleet/FleetRentalDetailsPage.tsx

const PrintButton = styled(ActionButton)`
   background-color: #7f8c8d;
   
   &:hover {
       background-color: #6c7a89;
   }
`;

const MobileReturnButton = styled(ActionButton)`
   background-color: #2ecc71;
   
   &:hover {
       background-color: #27ae60;
   }
`;

const RentalHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   background-color: white;
   border-radius: 8px;
   padding: 20px;
   margin-bottom: 24px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
   
   @media (max-width: 576px) {
       flex-direction: column;
       align-items: flex-start;
       gap: 16px;
   }
`;

const RentalTitle = styled.h1`
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

const RentalStatus = styled.div`
   display: flex;
   flex-direction: column;
   align-items: flex-end;
   gap: 8px;
`;

const OverdueTag = styled.div`
   display: inline-block;
   padding: 4px 8px;
   background-color: #e74c3c;
   color: white;
   border-radius: 4px;
   font-size: 12px;
   font-weight: 500;
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

const InfoSection = styled.div`
   background-color: white;
   border-radius: 8px;
   padding: 20px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const InfoSectionGrid = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 24px;
   
   @media (max-width: 768px) {
       grid-template-columns: 1fr;
   }
`;

const VehicleSection = styled(InfoSection)``;

const ClientSection = styled(InfoSection)``;

const SectionTitle = styled.h2`
   display: flex;
   align-items: center;
   font-size: 18px;
   color: #2c3e50;
   margin: 0 0 16px 0;
   padding-bottom: 12px;
   border-bottom: 1px solid #eee;
   
   svg {
       margin-right: 12px;
       color: #3498db;
   }
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
   margin-bottom: 6px;
   
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

const VehicleInfo = styled.div``;

const VehicleName = styled.div`
   font-size: 18px;
   font-weight: 500;
   color: #2c3e50;
   margin-bottom: 4px;
`;

const VehiclePlate = styled.div`
   font-size: 16px;
   color: #7f8c8d;
   margin-bottom: 8px;
`;

const VehicleYear = styled.div`
   font-size: 14px;
   color: #7f8c8d;
`;

const ClientInfo = styled.div``;

const ClientName = styled.div`
   font-size: 18px;
   font-weight: 500;
   color: #2c3e50;
   margin-bottom: 4px;
`;

const ClientCompany = styled.div`
   font-size: 16px;
   color: #7f8c8d;
   margin-bottom: 8px;
`;

const ClientContact = styled.div`
   font-size: 14px;
   color: #7f8c8d;
   
   div {
       margin-bottom: 4px;
   }
`;

const MileageSection = styled.div`
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   gap: 16px;
   margin-bottom: 24px;
`;

const MileageItem = styled.div`
   flex: 1;
   min-width: 200px;
`;

const MileageLabel = styled.div`
   display: flex;
   align-items: center;
   font-size: 14px;
   color: #7f8c8d;
   margin-bottom: 6px;
   
   svg {
       margin-right: 8px;
       color: #3498db;
   }
`;

const MileageValue = styled.div`
   font-size: 20px;
   font-weight: 500;
   color: #2c3e50;
`;

const MileageArrow = styled.div`
   font-size: 24px;
   color: #7f8c8d;
   
   @media (max-width: 576px) {
       display: none;
   }
`;

const MileageDifference = styled.div`
   display: flex;
   align-items: center;
   gap: 8px;
   padding: 8px 16px;
   background-color: #f8f9fa;
   border-radius: 4px;
   
   span {
       font-size: 14px;
       color: #7f8c8d;
   }
   
   strong {
       font-size: 16px;
       color: #2c3e50;
   }
`;

const FuelSection = styled.div`
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   gap: 16px;
   margin-bottom: 24px;
`;

const FuelItem = styled.div`
   flex: 1;
   min-width: 200px;
`;

const FuelLabel = styled.div`
   display: flex;
   align-items: center;
   font-size: 14px;
   color: #7f8c8d;
   margin-bottom: 8px;
   
   svg {
       margin-right: 8px;
       color: #3498db;
   }
`;

const FuelArrow = styled.div`
   font-size: 24px;
   color: #7f8c8d;
   
   @media (max-width: 576px) {
       display: none;
   }
`;

const DamageSection = styled.div`
   margin-bottom: 24px;
   padding: 16px;
   background-color: #fdedec;
   border-radius: 8px;
   border-left: 4px solid #e74c3c;
`;

const DamageTitle = styled.div`
   display: flex;
   align-items: center;
   font-size: 16px;
   font-weight: 500;
   color: #c0392b;
   margin-bottom: 8px;
   
   svg {
       margin-right: 8px;
       color: #e74c3c;
   }
`;

const DamageDescription = styled.div`
   color: #2c3e50;
`;

const NotesSection = styled.div`
   display: flex;
   flex-direction: column;
   gap: 16px;
`;

const NotesItem = styled.div`
   padding: 16px;
   background-color: #f8f9fa;
   border-radius: 8px;
`;

const NotesTitle = styled.div`
   font-size: 16px;
   font-weight: 500;
   color: #2c3e50;
   margin-bottom: 8px;
`;

const NotesContent = styled.div`
   color: #34495e;
   white-space: pre-line;
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
`;

const ImagesGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
   gap: 8px;
`;

const ImageThumbnail = styled.div`
   width: 100%;
   padding-top: 100%; /* 1:1 Aspect Ratio */
   position: relative;
   overflow: hidden;
   border-radius: 4px;
   cursor: pointer;
   
   img {
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       object-fit: cover;
       transition: transform 0.2s;
   }
   
   &:hover img {
       transform: scale(1.05);
   }
`;

const PlaceholderText = styled.div`
   color: #95a5a6;
   font-style: italic;
`;

const ImagePreviewModal = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background-color: rgba(0, 0, 0, 0.8);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 1000;
   padding: 20px;
`;

const ImagePreviewContent = styled.div`
   position: relative;
   max-width: 90%;
   max-height: 90%;
   background-color: white;
   border-radius: 8px;
   overflow: hidden;
`;

const CloseButton = styled.button`
   position: absolute;
   top: 10px;
   right: 10px;
   background-color: rgba(0, 0, 0, 0.7);
   color: white;
   border: none;
   width: 30px;
   height: 30px;
   border-radius: 50%;
   font-size: 20px;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 10;
   
   &:hover {
       background-color: rgba(0, 0, 0, 0.9);
   }
`;

const FullSizeImage = styled.img`
   display: block;
   width: 100%;
   height: auto;
   max-height: 80vh;
   object-fit: contain;
`;

const ImageDescription = styled.div`
   padding: 16px;
   background-color: white;
   font-size: 14px;
   color: #2c3e50;
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

export default FleetRentalDetailsPage;