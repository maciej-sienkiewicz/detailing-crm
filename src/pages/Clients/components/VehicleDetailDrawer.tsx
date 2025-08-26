// src/pages/Clients/components/VehicleDetailDrawer.tsx - NAPRAWIONE
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {
    FaArrowRight,
    FaBarcode,
    FaCalendarAlt,
    FaCar,
    FaCheckCircle,
    FaClock,
    FaEnvelope,
    FaExclamationTriangle,
    FaIdCard,
    FaMoneyBillWave,
    FaPalette,
    FaPhone,
    FaTimes,
    FaTools,
    FaUser,
    FaUsers
} from 'react-icons/fa';
import {VehicleExpanded, VehicleStatistics} from '../../../types';
import {vehicleApi} from '../../../api/vehiclesApi';
import {clientsApi} from '../../../api/clientsApi';
import {ProtocolStatus, ProtocolStatusColors, ProtocolStatusLabels} from '../../../types/protocol';

// NAPRAWIONY: Nowe API dla wizyt pojazdów
import {apiClientNew} from '../../../api/apiClientNew';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface VehicleDetailDrawerProps {
    isOpen: boolean;
    vehicle: VehicleExpanded | null;
    onClose: () => void;
}

interface FullOwnerInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    fullName: string;
}

// NAPRAWIONY: Interfejs odpowiadający VisitResponse z backendu
interface VehicleVisitHistoryItem {
    id: string;
    title: string;
    client_id: string;
    vehicle_id: string;
    start_date: string;
    end_date: string;
    status: ProtocolStatus;
    total_amount: number;
    service_count: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface VehicleVisitsResponse {
    content: VehicleVisitHistoryItem[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const VehicleDetailDrawer: React.FC<VehicleDetailDrawerProps> = ({
                                                                     isOpen,
                                                                     vehicle,
                                                                     onClose
                                                                 }) => {
    const navigate = useNavigate();
    const [owners, setOwners] = useState<FullOwnerInfo[]>([]);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const [visitHistory, setVisitHistory] = useState<VehicleVisitHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [vehicleStats, setVehicleStats] = useState<VehicleStatistics | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOwnersDetails = async () => {
            if (!vehicle) return;

            setLoadingOwners(true);
            try {
                let ownerData: FullOwnerInfo[] = [];

                if (vehicle.ownerIds && vehicle.ownerIds.length > 0) {
                    const ownerPromises = vehicle.ownerIds.map(async (ownerId) => {
                        const numericId = typeof ownerId === 'string' ? parseInt(ownerId, 10) : ownerId;
                        const result = await clientsApi.getClientById(numericId);
                        if (result.success && result.data) {
                            return {
                                id: result.data.id,
                                firstName: result.data.firstName,
                                lastName: result.data.lastName,
                                email: result.data.email,
                                phone: result.data.phone,
                                fullName: result.data.fullName || `${result.data.firstName} ${result.data.lastName}`
                            };
                        }
                        return null;
                    });

                    const ownerResults = await Promise.all(ownerPromises);
                    ownerData = ownerResults.filter((owner): owner is FullOwnerInfo => owner !== null);
                }

                if (ownerData.length === 0 && vehicle.owners && vehicle.owners.length > 0) {
                    ownerData = vehicle.owners.map(owner => ({
                        id: owner.id.toString(),
                        firstName: owner.firstName,
                        lastName: owner.lastName,
                        email: owner.email || '',
                        phone: owner.phone || '',
                        fullName: owner.fullName || `${owner.firstName} ${owner.lastName}`
                    }));
                }

                setOwners(ownerData);

                const stats = await vehicleApi.fetchVehicleStatistics(vehicle.id);
                setVehicleStats(stats);

            } catch (error) {
                if (vehicle.owners && vehicle.owners.length > 0) {
                    const fallbackOwners = vehicle.owners.map(owner => ({
                        id: owner.id.toString(),
                        firstName: owner.firstName,
                        lastName: owner.lastName,
                        email: owner.email || '',
                        phone: owner.phone || '',
                        fullName: owner.fullName || `${owner.firstName} ${owner.lastName}`
                    }));
                    setOwners(fallbackOwners);
                } else {
                    setError('Nie udało się załadować danych właścicieli pojazdu');
                }
            } finally {
                setLoadingOwners(false);
            }
        };

        loadOwnersDetails();
    }, [vehicle]);

    // NAPRAWIONY: Nowa funkcja do pobierania wizyt pojazdu
    useEffect(() => {
        const loadVehicleVisitHistory = async () => {
            if (!vehicle) return;

            setLoadingHistory(true);
            try {
                // NAPRAWIONE: Używamy prawidłowego endpointa /api/v1/protocols/vehicles/{id}
                const response = await apiClientNew.get<VehicleVisitsResponse>(
                    `/v1/protocols/vehicles/${vehicle.id}`,
                    { page: 0, size: 5 }, // Pobieramy tylko 5 najnowszych wizyt
                    { timeout: 10000 }
                );

                if (response && response.content) {
                    setVisitHistory(response.content);
                } else {
                    setVisitHistory([]);
                }

            } catch (error) {
                console.error('Error loading vehicle visit history:', error);
                setError('Nie udało się załadować historii wizyt pojazdu');
                setVisitHistory([]);
            } finally {
                setLoadingHistory(false);
            }
        };

        loadVehicleVisitHistory();
    }, [vehicle]);

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    const getStatusInfo = (status: ProtocolStatus) => {
        return {
            label: ProtocolStatusLabels[status] || status,
            color: ProtocolStatusColors[status] || brandTheme.text.muted,
            icon: getStatusIcon(status)
        };
    };

    const getStatusIcon = (status: ProtocolStatus) => {
        switch (status) {
            case ProtocolStatus.COMPLETED:
                return <FaCheckCircle />;
            case ProtocolStatus.IN_PROGRESS:
                return <FaClock />;
            case ProtocolStatus.READY_FOR_PICKUP:
                return <FaCheckCircle />;
            case ProtocolStatus.SCHEDULED:
                return <FaCalendarAlt />;
            case ProtocolStatus.CANCELLED:
                return <FaExclamationTriangle />;
            default:
                return <FaClock />;
        }
    };

    const handleVisitClick = (visitId: string) => {
        navigate(`/visits/${visitId}`);
    };

    const handleOwnerClick = (ownerId: string) => {
        navigate(`/clients-vehicles?tab=owners&clientId=${ownerId}`);
    };

    if (!vehicle) return null;

    return (
        <DrawerContainer isOpen={isOpen}>
            <DrawerHeader>
                <HeaderContent>
                    <HeaderIcon>
                        <FaCar />
                    </HeaderIcon>
                    <HeaderText>
                        <HeaderTitle>Szczegóły pojazdu</HeaderTitle>
                        <HeaderSubtitle>{vehicle.make} {vehicle.model}</HeaderSubtitle>
                    </HeaderText>
                </HeaderContent>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>
            </DrawerHeader>

            <DrawerContent>
                <VehicleHeaderSection>
                    <VehicleTitle>{vehicle.make} {vehicle.model}</VehicleTitle>
                    <LicensePlate>{vehicle.licensePlate}</LicensePlate>
                    <VehicleBasicInfo>
                        <InfoItem>
                            <InfoIcon><FaCalendarAlt /></InfoIcon>
                            <InfoText>Rocznik: {vehicle.year}</InfoText>
                        </InfoItem>
                        {vehicle.color && (
                            <InfoItem>
                                <InfoIcon><FaPalette /></InfoIcon>
                                <InfoText>Kolor: {vehicle.color}</InfoText>
                            </InfoItem>
                        )}
                    </VehicleBasicInfo>
                </VehicleHeaderSection>

                <SectionTitle>
                    <SectionTitleIcon><FaCar /></SectionTitleIcon>
                    Dane pojazdu
                </SectionTitle>
                <DetailSection>
                    {vehicle.vin && (
                        <DetailRow>
                            <DetailIcon><FaBarcode /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>Numer VIN</DetailLabel>
                                <DetailValue>{vehicle.vin}</DetailValue>
                            </DetailContent>
                        </DetailRow>
                    )}

                    <DetailRow>
                        <DetailIcon><FaIdCard /></DetailIcon>
                        <DetailContent>
                            <DetailLabel>Numer rejestracyjny</DetailLabel>
                            <DetailValue>{vehicle.licensePlate}</DetailValue>
                        </DetailContent>
                    </DetailRow>

                    <DetailRow>
                        <DetailIcon><FaCalendarAlt /></DetailIcon>
                        <DetailContent>
                            <DetailLabel>Rok produkcji</DetailLabel>
                            <DetailValue>{vehicle.year}</DetailValue>
                        </DetailContent>
                    </DetailRow>
                </DetailSection>

                <SectionTitle>
                    <SectionTitleIcon><FaUsers /></SectionTitleIcon>
                    Właściciele pojazdu
                </SectionTitle>

                {loadingOwners ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie właścicieli...</LoadingText>
                    </LoadingContainer>
                ) : owners.length === 0 ? (
                    <EmptyMessage>
                        <EmptyIcon><FaUser /></EmptyIcon>
                        <EmptyText>Brak przypisanych właścicieli</EmptyText>
                    </EmptyMessage>
                ) : (
                    <OwnersList>
                        {owners.map(owner => (
                            <OwnerItem
                                key={owner.id}
                                onClick={() => handleOwnerClick(owner.id)}
                            >
                                <OwnerIcon><FaUser /></OwnerIcon>
                                <OwnerInfo>
                                    <OwnerName>{owner.fullName}</OwnerName>
                                    <OwnerContact>
                                        <ContactItem>
                                            <FaEnvelope />
                                            <span>{owner.email}</span>
                                        </ContactItem>
                                        <ContactItem>
                                            <FaPhone />
                                            <span>{owner.phone}</span>
                                        </ContactItem>
                                    </OwnerContact>
                                </OwnerInfo>
                                <OwnerActionIcon>
                                    <FaArrowRight />
                                </OwnerActionIcon>
                            </OwnerItem>
                        ))}
                    </OwnersList>
                )}

                {vehicleStats && (
                    <>
                        <SectionTitle>
                            <SectionTitleIcon><FaTools /></SectionTitleIcon>
                            Statystyki serwisowe
                        </SectionTitle>

                        <MetricsGrid>
                            <MetricCard>
                                <MetricIcon $color={brandTheme.status.info}>
                                    <FaTools />
                                </MetricIcon>
                                <MetricContent>
                                    <MetricValue>{vehicleStats.servicesNo}</MetricValue>
                                    <MetricLabel>Liczba usług</MetricLabel>
                                </MetricContent>
                            </MetricCard>

                            <MetricCard>
                                <MetricIcon $color={brandTheme.status.success}>
                                    <FaMoneyBillWave />
                                </MetricIcon>
                                <MetricContent>
                                    <MetricValue>{formatCurrency(vehicleStats.totalRevenue)}</MetricValue>
                                    <MetricLabel>Suma przychodów</MetricLabel>
                                </MetricContent>
                            </MetricCard>

                            {vehicle.lastServiceDate && (
                                <MetricCard $fullWidth>
                                    <MetricIcon $color={brandTheme.status.warning}>
                                        <FaCalendarAlt />
                                    </MetricIcon>
                                    <MetricContent>
                                        <MetricValue>{formatDate(vehicle.lastServiceDate)}</MetricValue>
                                        <MetricLabel>Ostatnia usługa</MetricLabel>
                                    </MetricContent>
                                </MetricCard>
                            )}
                        </MetricsGrid>
                    </>
                )}

                <SectionTitle>
                    <SectionTitleIcon><FaCalendarAlt /></SectionTitleIcon>
                    Historia wizyt
                </SectionTitle>

                {loadingHistory ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie historii wizyt...</LoadingText>
                    </LoadingContainer>
                ) : visitHistory.length === 0 ? (
                    <EmptyMessage>
                        <EmptyIcon><FaCar /></EmptyIcon>
                        <EmptyText>Brak historii wizyt</EmptyText>
                        <EmptySubtext>Ten pojazd nie ma jeszcze żadnej historii wizyt w systemie</EmptySubtext>
                    </EmptyMessage>
                ) : (
                    <VisitHistoryList>
                        {visitHistory.map(visit => {
                            const statusInfo = getStatusInfo(visit.status);
                            return (
                                <VisitHistoryCard
                                    key={visit.id}
                                    onClick={() => handleVisitClick(visit.id)}
                                    $status={visit.status}
                                >
                                    <VisitCardHeader>
                                        <VisitMetadata>
                                            <VisitDate>
                                                {formatDate(visit.start_date)}
                                            </VisitDate>
                                            <VisitTitle>
                                                {visit.title}
                                            </VisitTitle>
                                        </VisitMetadata>
                                        <VisitStatusIndicator $status={visit.status}>
                                            <StatusDot $color={statusInfo.color} />
                                            <StatusText>{statusInfo.label}</StatusText>
                                        </VisitStatusIndicator>
                                    </VisitCardHeader>

                                    <VisitVehicleSection>
                                        <VehicleInfo>
                                            <VehicleBrand>{vehicle.make} {vehicle.model}</VehicleBrand>
                                            <VehiclePlateDisplay>{vehicle.licensePlate}</VehiclePlateDisplay>
                                        </VehicleInfo>
                                    </VisitVehicleSection>

                                    <VisitFooter>
                                        <VisitAmount>
                                            <AmountLabel>Wartość</AmountLabel>
                                            <AmountValue>
                                                {formatCurrency(visit.total_amount)}
                                            </AmountValue>
                                        </VisitAmount>
                                        <VisitActionIcon>
                                            <FaArrowRight />
                                        </VisitActionIcon>
                                    </VisitFooter>
                                </VisitHistoryCard>
                            );
                        })}
                    </VisitHistoryList>
                )}

                {error && (
                    <ErrorMessage>
                        ⚠️ {error}
                    </ErrorMessage>
                )}
            </DrawerContent>
        </DrawerContainer>
    );
};

// Styled Components - bez zmian, użyj istniejących stylów...
const DrawerContainer = styled.div<{ isOpen: boolean }>`
    position: fixed;
    top: 0;
    right: 0;
    width: 480px;
    max-width: 90vw;
    height: 100vh;
    background: ${brandTheme.surface};
    box-shadow: ${brandTheme.shadow.xl};
    z-index: 1000;
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    border-left: 1px solid ${brandTheme.border};
`;

const DrawerHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, ${brandTheme.surface} 100%);
    flex-shrink: 0;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    box-shadow: ${brandTheme.shadow.sm};
`;

const HeaderText = styled.div`
    flex: 1;
`;

const HeaderTitle = styled.h2`
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const HeaderSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    background: ${brandTheme.surfaceElevated};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    color: ${brandTheme.text.tertiary};
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
        border-color: ${brandTheme.status.error}30;
        transform: scale(1.05);
    }
`;

const DrawerContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: ${brandTheme.spacing.xl};

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }
    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 3px;
    }
`;

const VehicleHeaderSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: ${brandTheme.spacing.xl};
    padding: ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, ${brandTheme.surface} 100%);
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};
`;

const VehicleTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
    text-align: center;
    letter-spacing: -0.025em;
`;

const LicensePlate = styled.div`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 2px;
    text-transform: uppercase;
    box-shadow: ${brandTheme.shadow.md};
    margin-bottom: ${brandTheme.spacing.md};
`;

const VehicleBasicInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.borderLight};
`;

const InfoIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
`;

const InfoText = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.primary};
    margin: ${brandTheme.spacing.xl} 0 ${brandTheme.spacing.md} 0;
    padding-bottom: ${brandTheme.spacing.sm};
    border-bottom: 2px solid ${brandTheme.primaryGhost};

    &:first-of-type {
        margin-top: 0;
    }
`;

const SectionTitleIcon = styled.div`
    color: ${brandTheme.primary};
    font-size: 14px;
`;

const DetailSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};
`;

const DetailRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.borderLight};
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary}30;
    }
`;

const DetailIcon = styled.div`
    width: 32px;
    height: 32px;
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.muted};
    font-size: 14px;
    flex-shrink: 0;
    box-shadow: ${brandTheme.shadow.xs};
`;

const DetailContent = styled.div`
    flex: 1;
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    margin-bottom: ${brandTheme.spacing.xs};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
    font-size: 15px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xl};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    gap: ${brandTheme.spacing.md};
`;

const LoadingSpinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    text-align: center;
`;

const EmptyMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xl};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.surface};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: ${brandTheme.text.tertiary};
    margin-bottom: ${brandTheme.spacing.md};
    box-shadow: ${brandTheme.shadow.xs};
`;

const EmptyText = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.secondary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const EmptySubtext = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.muted};
    font-style: italic;
`;

const OwnersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const OwnerItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.borderLight};
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary}30;
        transform: translateX(4px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const OwnerIcon = styled.div`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${brandTheme.primary}15 0%, ${brandTheme.primary}08 100%);
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 16px;
    flex-shrink: 0;
`;

const OwnerInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const OwnerName = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const OwnerContact = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 13px;
    color: ${brandTheme.text.secondary};

    svg {
        font-size: 11px;
        color: ${brandTheme.text.muted};
        width: 12px;
    }

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const OwnerActionIcon = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.muted};
    font-size: 10px;
    transition: all 0.15s ease;

    ${OwnerItem}:hover & {
        color: ${brandTheme.primary};
        transform: translateX(2px);
    }
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const MetricCard = styled.div<{ $fullWidth?: boolean }>`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    transition: all 0.2s ease;

    ${props => props.$fullWidth && `
        grid-column: 1 / -1;
    `}

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const MetricIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: ${brandTheme.shadow.xs};
`;

const MetricContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const MetricValue = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    line-height: 1.2;
`;

const MetricLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const VisitHistoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const VisitHistoryCard = styled.div<{ $status: ProtocolStatus }>`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    padding: ${brandTheme.spacing.md};
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    border-left: 3px solid ${props => ProtocolStatusColors[props.$status] || brandTheme.text.muted};

    &:hover {
        border-color: ${brandTheme.borderHover};
        border-left-color: ${props => ProtocolStatusColors[props.$status] || brandTheme.text.muted};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transform: translateX(2px);
    }

    &:active {
        transform: translateX(1px);
    }
`;

const VisitCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${brandTheme.spacing.md};
`;

const VisitMetadata = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const VisitDate = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.01em;
`;

const VisitTitle = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    font-style: italic;
`;

const VisitStatusIndicator = styled.div<{ $status: ProtocolStatus }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
`;

const StatusDot = styled.div<{ $color: string }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$color};
    flex-shrink: 0;
`;

const StatusText = styled.span`
    font-size: 11px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const VisitVehicleSection = styled.div`
    margin-bottom: ${brandTheme.spacing.md};
`;

const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const VehicleBrand = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.01em;
`;

const VehiclePlateDisplay = styled.div`
    display: inline-block;
    background: ${brandTheme.text.primary};
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Monaco', 'Consolas', monospace;
    width: fit-content;
`;

const VisitFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: ${brandTheme.spacing.sm};
    border-top: 1px solid ${brandTheme.borderLight};
`;

const VisitAmount = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const AmountLabel = styled.div`
    font-size: 10px;
    color: ${brandTheme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
`;

const AmountValue = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.01em;
`;

const VisitActionIcon = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.text.muted};
    font-size: 10px;
    transition: all 0.15s ease;

    ${VisitHistoryCard}:hover & {
        color: ${brandTheme.text.secondary};
        transform: translateX(2px);
    }
`;

const ErrorMessage = styled.div`
    background: linear-gradient(135deg, ${brandTheme.status.errorLight} 0%, #fef2f2 100%);
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.status.error}30;
    font-weight: 500;
    margin-top: ${brandTheme.spacing.md};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    box-shadow: ${brandTheme.shadow.xs};
`;

export default VehicleDetailDrawer;