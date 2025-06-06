// VehicleDetailDrawer.tsx - Professional Premium Automotive CRM
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaTimes,
    FaCar,
    FaIdCard,
    FaCalendarAlt,
    FaTools,
    FaMoneyBillWave,
    FaUser,
    FaExternalLinkAlt,
    FaPalette,
    FaBarcode,
    FaUsers
} from 'react-icons/fa';
import {
    ClientProtocolHistory,
    ProtocolStatus,
    VehicleExpanded,
    VehicleOwner,
    VehicleStatistics
} from '../../../types';
import { vehicleApi } from '../../../api/vehiclesApi';
import { carReceptionApi } from '../../../api/carReceptionApi';

// Professional Brand Theme - Premium Automotive CRM
const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
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

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
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

const VehicleDetailDrawer: React.FC<VehicleDetailDrawerProps> = ({
                                                                     isOpen,
                                                                     vehicle,
                                                                     onClose
                                                                 }) => {
    const [owners, setOwners] = useState<VehicleOwner[]>([]);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const [protocolHistory, setProtocolHistory] = useState<ClientProtocolHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [vehicleStats, setVehicleStats] = useState<VehicleStatistics | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie właścicieli pojazdu
    useEffect(() => {
        const loadOwners = async () => {
            if (vehicle) {
                setLoadingOwners(true);
                try {
                    setOwners(await vehicleApi.fetchOwners(vehicle.id));
                    setVehicleStats(await vehicleApi.fetchVehicleStatistics(vehicle.id));
                } catch (error) {
                    console.error('Error loading vehicle owners:', error);
                    setError('Nie udało się załadować właścicieli pojazdu');
                } finally {
                    setLoadingOwners(false);
                }
            }
        };

        loadOwners();
    }, [vehicle]);

    // Pobieranie historii serwisowej pojazdu
    useEffect(() => {
        const loadServiceHistory = async () => {
            if (vehicle) {
                setLoadingHistory(true);
                try {
                    const protocols = await carReceptionApi.getProtocolsByClientId(vehicle.ownerIds[0]);
                    setProtocolHistory(protocols);
                } catch (error) {
                    console.error('Error loading service history:', error);
                    setError('Nie udało się załadować historii serwisowej');
                } finally {
                    setLoadingHistory(false);
                }
            }
        };

        loadServiceHistory();
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
        switch (status) {
            case ProtocolStatus.COMPLETED:
                return { label: 'Zakończony', color: brandTheme.status.success };
            case ProtocolStatus.SCHEDULED:
                return { label: 'Zaplanowany', color: brandTheme.status.info };
            case ProtocolStatus.READY_FOR_PICKUP:
                return { label: 'Gotowy do odbioru', color: brandTheme.status.warning };
            case ProtocolStatus.CANCELLED:
                return { label: 'Anulowany', color: brandTheme.status.error };
            case ProtocolStatus.IN_PROGRESS:
                return { label: 'W realizacji', color: brandTheme.status.info };
            default:
                return { label: String(status), color: brandTheme.text.muted };
        }
    };

    if (!vehicle || !vehicleStats) return null;

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
                {/* Vehicle Header Section */}
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

                {/* Vehicle Details */}
                <SectionTitle>Dane pojazdu</SectionTitle>
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

                {/* Owners Section */}
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
                            <OwnerItem key={owner.ownerId}>
                                <OwnerIcon><FaUser /></OwnerIcon>
                                <OwnerInfo>
                                    <OwnerName>{owner.ownerName}</OwnerName>
                                </OwnerInfo>
                            </OwnerItem>
                        ))}
                    </OwnersList>
                )}

                {/* Service Statistics */}
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

                {/* Service History */}
                <SectionTitle>
                    <SectionTitleIcon><FaCalendarAlt /></SectionTitleIcon>
                    Historia serwisowa
                </SectionTitle>

                {loadingHistory ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie historii serwisowej...</LoadingText>
                    </LoadingContainer>
                ) : protocolHistory.length === 0 ? (
                    <EmptyMessage>
                        <EmptyIcon><FaTools /></EmptyIcon>
                        <EmptyText>Brak historii serwisowej</EmptyText>
                        <EmptySubtext>Ten pojazd nie ma jeszcze żadnych wykonanych usług</EmptySubtext>
                    </EmptyMessage>
                ) : (
                    <ServiceHistoryList>
                        {protocolHistory
                            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                            .map(service => {
                                const statusInfo = getStatusInfo(service.status);
                                return (
                                    <ServiceHistoryItem key={service.id}>
                                        <ServiceHeader>
                                            <ServiceDate>
                                                <ServiceDateIcon><FaCalendarAlt /></ServiceDateIcon>
                                                {formatDate(service.startDate)}
                                            </ServiceDate>
                                            <StatusBadge $color={statusInfo.color}>
                                                {statusInfo.label}
                                            </StatusBadge>
                                        </ServiceHeader>

                                        <ServiceInfo>
                                            <ServiceVehicleInfo>
                                                <VehicleInfoText>
                                                    {service.make} {service.model}
                                                </VehicleInfoText>
                                                <LicenseBadge>{service.licensePlate}</LicenseBadge>
                                            </ServiceVehicleInfo>
                                        </ServiceInfo>

                                        <ServiceFooter>
                                            <PriceSection>
                                                <PriceLabel>Kwota usługi:</PriceLabel>
                                                <PriceValue>{formatCurrency(service.totalAmount)}</PriceValue>
                                            </PriceSection>

                                            {service.id && (
                                                <ProtocolLink
                                                    href={`/orders/car-reception/${service.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FaExternalLinkAlt />
                                                    <span>Szczegóły protokołu</span>
                                                </ProtocolLink>
                                            )}
                                        </ServiceFooter>
                                    </ServiceHistoryItem>
                                );
                            })
                        }
                    </ServiceHistoryList>
                )}

                {/* Error Display */}
                {error && (
                    <ErrorMessage>
                        ⚠️ {error}
                    </ErrorMessage>
                )}
            </DrawerContent>
        </DrawerContainer>
    );
};

// Professional Styled Components
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

    /* Custom scrollbar */
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

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary}30;
        transform: translateX(4px);
    }
`;

const OwnerIcon = styled.div`
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, ${brandTheme.primary}15 0%, ${brandTheme.primary}08 100%);
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 14px;
    flex-shrink: 0;
`;

const OwnerInfo = styled.div`
    flex: 1;
`;

const OwnerName = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
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

const ServiceHistoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const ServiceHistoryItem = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    border-left: 4px solid ${brandTheme.primary};
    transition: all 0.2s ease;
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        border-left-color: ${brandTheme.primary};
        transform: translateX(4px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const ServiceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${brandTheme.spacing.md};
    gap: ${brandTheme.spacing.sm};

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${brandTheme.spacing.sm};
    }
`;

const ServiceDate = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const ServiceDateIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
`;

const StatusBadge = styled.div<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.lg};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    white-space: nowrap;
`;

const ServiceInfo = styled.div`
    margin-bottom: ${brandTheme.spacing.md};
`;

const ServiceVehicleInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    flex-wrap: wrap;
`;

const VehicleInfoText = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${brandTheme.text.primary};
`;

const LicenseBadge = styled.span`
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    border: 1px solid ${brandTheme.primary}30;
    border-radius: ${brandTheme.radius.sm};
    padding: 2px 8px;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const ServiceFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.md};

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${brandTheme.spacing.sm};
    }
`;

const PriceSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const PriceLabel = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
`;

const PriceValue = styled.span`
    background: linear-gradient(135deg, ${brandTheme.status.successLight} 0%, #ecfdf5 100%);
    color: ${brandTheme.status.success};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    font-weight: 700;
    font-size: 14px;
    border: 1px solid ${brandTheme.status.success}30;
`;

const ProtocolLink = styled.a`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.status.infoLight};
    color: ${brandTheme.status.info};
    text-decoration: none;
    border-radius: ${brandTheme.radius.md};
    font-size: 13px;
    font-weight: 500;
    border: 1px solid ${brandTheme.status.info}30;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.status.info};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }

    span {
        @media (max-width: 480px) {
            display: none;
        }
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