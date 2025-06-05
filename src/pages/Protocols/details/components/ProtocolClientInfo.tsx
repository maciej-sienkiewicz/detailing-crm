import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaUser,
    FaBuilding,
    FaIdCard,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaHistory,
    FaCar,
    FaMoneyBillWave,
    FaExternalLinkAlt,
    FaUserTie,
    FaChartLine,
    FaStar,
    FaCalendarAlt
} from 'react-icons/fa';
import {CarReceptionProtocol, ClientStatistics} from '../../../../types';
import { ClientExpanded, VehicleExpanded } from '../../../../types';
import {
    fetchVehiclesByOwnerId
} from '../../../../api/mocks/clientMocks';
import { useNavigate } from 'react-router-dom';
import { clientApi } from "../../../../api/clientsApi";
import {vehicleApi} from "../../../../api/vehiclesApi";

// Enterprise Design System - Professional Automotive CRM
const enterprise = {
    // Brand Color System
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',

    // Professional Surfaces
    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    surfaceTertiary: '#f1f5f9',

    // Executive Typography
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Professional Borders & States
    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    // Business Status Colors
    success: '#059669',
    successBg: '#ecfdf5',
    successBorder: '#a7f3d0',
    warning: '#d97706',
    warningBg: '#fffbeb',
    info: '#0284c7',
    infoBg: '#e0f2fe',

    // Enterprise Spacing
    space: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Professional Typography Scale
    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        xxl: '24px'
    },

    // Enterprise Shadows
    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    }
};

interface ProtocolClientInfoProps {
    protocol: CarReceptionProtocol;
}

const ProtocolClientInfo: React.FC<ProtocolClientInfoProps> = ({ protocol }) => {
    const navigate = useNavigate();
    const [client, setClient] = useState<ClientExpanded | null>(null);
    const [clientStats, setClientStats] = useState<ClientStatistics | null>(null);
    const [vehicles, setVehicles] = useState<VehicleExpanded[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load client data based on protocol's owner ID
    useEffect(() => {
        const loadClientData = async () => {
            try {
                setLoading(true);

                const clientId = protocol.ownerId
                console.log('Fetching client with ID:', clientId);

                const matchedClient = await clientApi.fetchClientById(clientId);
                const matchedClientStats = await clientApi.fetchClientStatsById(clientId);
                setClientStats(matchedClientStats);

                if (matchedClient) {
                    console.log('Client found:', matchedClient);
                    setClient(matchedClient);

                    const clientVehicles = await vehicleApi.fetchVehiclesByOwnerId(matchedClient.id);
                    setVehicles(clientVehicles);
                } else {
                    console.error('Client not found for ID:', clientId);
                    setError('Nie znaleziono klienta w bazie danych.');
                }
            } catch (err) {
                console.error('Error loading client data:', err);
                setError('Wystąpił błąd podczas ładowania danych klienta.');
            } finally {
                setLoading(false);
            }
        };

        loadClientData();
    }, [protocol]);

    // Format currency for display
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Navigate to client details
    const handleGoToClient = () => {
        if (client) {
            navigate(`/clients/owners?id=${client.id}`);
        }
    };

    // Navigate to vehicle details
    const handleGoToVehicle = (vehicleId: string) => {
        navigate(`/clients/vehicles?id=${vehicleId}`);
    };

    // Calculate client tier based on revenue
    const getClientTier = (revenue: number): { tier: string; color: string; icon: React.ReactElement } => {
        if (revenue >= 50000) {
            return { tier: 'Premium', color: '#d97706', icon: <FaStar /> };
        } else if (revenue >= 20000) {
            return { tier: 'Gold', color: '#059669', icon: <FaChartLine /> };
        } else if (revenue >= 5000) {
            return { tier: 'Silver', color: '#0284c7', icon: <FaUser /> };
        } else {
            return { tier: 'Standard', color: '#64748b', icon: <FaUserTie /> };
        }
    };

    if (loading) {
        return (
            <LoadingState>
                <LoadingSpinner />
                <LoadingText>Ładowanie profilu klienta...</LoadingText>
            </LoadingState>
        );
    }

    if (error) {
        return (
            <ErrorState>
                <ErrorCard>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorMessage>{error}</ErrorMessage>
                    <FallbackClientInfo>
                        <FallbackTitle>Podstawowe informacje</FallbackTitle>
                        <BasicInfoGrid>
                            <ContactItem>
                                <ContactIcon><FaUser /></ContactIcon>
                                <ContactDetails>
                                    <ContactLabel>Właściciel</ContactLabel>
                                    <ContactValue>{protocol.ownerName}</ContactValue>
                                </ContactDetails>
                            </ContactItem>
                            <ContactItem>
                                <ContactIcon><FaPhone /></ContactIcon>
                                <ContactDetails>
                                    <ContactLabel>Telefon</ContactLabel>
                                    <ContactValue>{protocol.phone}</ContactValue>
                                </ContactDetails>
                            </ContactItem>
                            <ContactItem>
                                <ContactIcon><FaEnvelope /></ContactIcon>
                                <ContactDetails>
                                    <ContactLabel>Email</ContactLabel>
                                    <ContactValue>{protocol.email}</ContactValue>
                                </ContactDetails>
                            </ContactItem>
                        </BasicInfoGrid>
                    </FallbackClientInfo>
                </ErrorCard>
            </ErrorState>
        );
    }

    if (!client || !clientStats) {
        return (
            <EmptyState>
                <EmptyIcon><FaUser /></EmptyIcon>
                <EmptyTitle>Brak profilu klienta</EmptyTitle>
                <EmptyDescription>Klient nie został znaleziony w systemie CRM</EmptyDescription>
            </EmptyState>
        );
    }

    const clientTier = getClientTier(clientStats.totalRevenue);

    return (
        <ClientProfilePanel>
            {/* Executive Client Header */}
            <ClientHeader>
                <ClientIdentity>
                    <ClientAvatar>
                        <FaUserTie />
                    </ClientAvatar>
                    <ClientBasicInfo>
                        <ClientName>{client.firstName} {client.lastName}</ClientName>
                        <ClientTier $color={clientTier.color}>
                            {clientTier.icon}
                            <span>Klient {clientTier.tier}</span>
                        </ClientTier>
                        {client.company && (
                            <CompanyInfo>
                                <FaBuilding />
                                <span>{client.company}</span>
                            </CompanyInfo>
                        )}
                    </ClientBasicInfo>
                </ClientIdentity>

                <HeaderActions>
                    <ViewClientButton onClick={handleGoToClient}>
                        <FaExternalLinkAlt />
                        <span>Otwórz profil</span>
                    </ViewClientButton>
                </HeaderActions>
            </ClientHeader>

            {/* Business Metrics Dashboard */}
            <MetricsDashboard>
                <DashboardHeader>
                    <DashboardTitle>Statystyki biznesowe</DashboardTitle>
                </DashboardHeader>
                <MetricsGrid>
                    <MetricCard $variant="revenue">
                        <MetricIcon $color={enterprise.success}>
                            <FaMoneyBillWave />
                        </MetricIcon>
                        <MetricContent>
                            <MetricValue>{formatCurrency(clientStats.totalRevenue)}</MetricValue>
                            <MetricLabel>Łączne przychody</MetricLabel>
                        </MetricContent>
                    </MetricCard>

                    <MetricCard $variant="visits">
                        <MetricIcon $color={enterprise.primary}>
                            <FaHistory />
                        </MetricIcon>
                        <MetricContent>
                            <MetricValue>{clientStats.totalVisits}</MetricValue>
                            <MetricLabel>Liczba wizyt</MetricLabel>
                        </MetricContent>
                    </MetricCard>

                    <MetricCard $variant="vehicles">
                        <MetricIcon $color={enterprise.info}>
                            <FaCar />
                        </MetricIcon>
                        <MetricContent>
                            <MetricValue>{clientStats.vehicleNo}</MetricValue>
                            <MetricLabel>Flota pojazdów</MetricLabel>
                        </MetricContent>
                    </MetricCard>

                    <MetricCard $variant="avg">
                        <MetricIcon $color={enterprise.warning}>
                            <FaChartLine />
                        </MetricIcon>
                        <MetricContent>
                            <MetricValue>
                                {clientStats.totalVisits > 0
                                    ? formatCurrency(clientStats.totalRevenue / clientStats.totalVisits)
                                    : formatCurrency(0)
                                }
                            </MetricValue>
                            <MetricLabel>Średnia wizyta</MetricLabel>
                        </MetricContent>
                    </MetricCard>
                </MetricsGrid>
            </MetricsDashboard>

            {/* Contact Information */}
            <ContactSection>
                <SectionHeader>
                    <SectionTitle>Informacje kontaktowe</SectionTitle>
                </SectionHeader>
                <ContactGrid>
                    <ContactItem>
                        <ContactIcon><FaPhone /></ContactIcon>
                        <ContactDetails>
                            <ContactLabel>Telefon</ContactLabel>
                            <ContactValue>{client.phone}</ContactValue>
                        </ContactDetails>
                    </ContactItem>

                    <ContactItem>
                        <ContactIcon><FaEnvelope /></ContactIcon>
                        <ContactDetails>
                            <ContactLabel>Email</ContactLabel>
                            <ContactValue>{client.email}</ContactValue>
                        </ContactDetails>
                    </ContactItem>

                    {client.address && (
                        <ContactItem>
                            <ContactIcon><FaMapMarkerAlt /></ContactIcon>
                            <ContactDetails>
                                <ContactLabel>Adres</ContactLabel>
                                <ContactValue>{client.address}</ContactValue>
                            </ContactDetails>
                        </ContactItem>
                    )}

                    {client.company && (
                        <ContactItem>
                            <ContactIcon><FaBuilding /></ContactIcon>
                            <ContactDetails>
                                <ContactLabel>Firma</ContactLabel>
                                <ContactValue>{client.company}</ContactValue>
                            </ContactDetails>
                        </ContactItem>
                    )}

                    {client.taxId && (
                        <ContactItem>
                            <ContactIcon><FaIdCard /></ContactIcon>
                            <ContactDetails>
                                <ContactLabel>NIP</ContactLabel>
                                <ContactValue>{client.taxId}</ContactValue>
                            </ContactDetails>
                        </ContactItem>
                    )}
                </ContactGrid>
            </ContactSection>

            {/* Vehicle Fleet */}
            <VehicleSection>
                <SectionHeader>
                    <SectionTitle>Flota pojazdów</SectionTitle>
                    <SectionMeta>{vehicles.length} {vehicles.length === 1 ? 'pojazd' : vehicles.length < 5 ? 'pojazdy' : 'pojazdów'}</SectionMeta>
                </SectionHeader>

                {vehicles.length === 0 ? (
                    <EmptyVehicles>
                        <EmptyVehicleIcon><FaCar /></EmptyVehicleIcon>
                        <EmptyVehicleText>Brak pojazdów w systemie</EmptyVehicleText>
                    </EmptyVehicles>
                ) : (
                    <VehicleGrid>
                        {vehicles.map(vehicle => (
                            <VehicleCard
                                key={vehicle.id}
                                onClick={() => handleGoToVehicle(vehicle.id)}
                                $isActive={vehicle.licensePlate === protocol.licensePlate}
                            >
                                <VehicleHeader>
                                    <VehicleInfo>
                                        <VehicleName>
                                            {vehicle.make} {vehicle.model}
                                        </VehicleName>
                                        <VehicleYear>{vehicle.year}</VehicleYear>
                                    </VehicleInfo>
                                    <VehiclePlate $isActive={vehicle.licensePlate === protocol.licensePlate}>
                                        {vehicle.licensePlate}
                                    </VehiclePlate>
                                </VehicleHeader>

                                <VehicleStats>
                                    <VehicleStat>
                                        <StatIcon><FaHistory /></StatIcon>
                                        <StatContent>
                                            <StatValue>{vehicle.totalServices}</StatValue>
                                            <StatLabel>wizyt</StatLabel>
                                        </StatContent>
                                    </VehicleStat>

                                    <VehicleStat>
                                        <StatIcon><FaMoneyBillWave /></StatIcon>
                                        <StatContent>
                                            <StatValue>{formatCurrency(vehicle.totalSpent)}</StatValue>
                                            <StatLabel>łącznie</StatLabel>
                                        </StatContent>
                                    </VehicleStat>

                                    <VehicleStat>
                                        <StatIcon><FaChartLine /></StatIcon>
                                        <StatContent>
                                            <StatValue>
                                                {vehicle.totalServices > 0
                                                    ? formatCurrency(vehicle.totalSpent / vehicle.totalServices)
                                                    : formatCurrency(0)
                                                }
                                            </StatValue>
                                            <StatLabel>średnio</StatLabel>
                                        </StatContent>
                                    </VehicleStat>
                                </VehicleStats>

                                {vehicle.licensePlate === protocol.licensePlate && (
                                    <CurrentVehicleBadge>
                                        Aktualny pojazd
                                    </CurrentVehicleBadge>
                                )}
                            </VehicleCard>
                        ))}
                    </VehicleGrid>
                )}
            </VehicleSection>

            {/* Client Notes */}
            {client.notes && (
                <NotesSection>
                    <SectionHeader>
                        <SectionTitle>Notatki o kliencie</SectionTitle>
                    </SectionHeader>
                    <NotesContent>{client.notes}</NotesContent>
                </NotesSection>
            )}
        </ClientProfilePanel>
    );
};

// Enterprise-Grade Styled Components
const ClientProfilePanel = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xl};
`;

// Loading States
const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${enterprise.space.xxl};
    gap: ${enterprise.space.lg};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${enterprise.borderLight};
    border-top: 3px solid ${enterprise.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: ${enterprise.fontSize.base};
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

// Error States
const ErrorState = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${enterprise.space.xxl};
`;

const ErrorCard = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.xl};
    padding: ${enterprise.space.xxl};
    box-shadow: ${enterprise.shadow.lg};
    text-align: center;
    max-width: 600px;
    width: 100%;
`;

const ErrorIcon = styled.div`
    font-size: 48px;
    margin-bottom: ${enterprise.space.lg};
`;

const ErrorMessage = styled.div`
    font-size: ${enterprise.fontSize.lg};
    color: #dc2626;
    margin-bottom: ${enterprise.space.xl};
    font-weight: 500;
`;

const FallbackClientInfo = styled.div`
    text-align: left;
`;

const FallbackTitle = styled.h3`
    font-size: ${enterprise.fontSize.lg};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0 0 ${enterprise.space.lg} 0;
    padding-bottom: ${enterprise.space.md};
    border-bottom: 1px solid ${enterprise.border};
`;

const BasicInfoGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.lg};
`;

// Empty States
const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${enterprise.space.xxl};
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${enterprise.surfaceSecondary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${enterprise.textMuted};
    font-size: 32px;
    margin-bottom: ${enterprise.space.xl};
`;

const EmptyTitle = styled.h3`
    font-size: ${enterprise.fontSize.xl};
    font-weight: 600;
    color: ${enterprise.textSecondary};
    margin: 0 0 ${enterprise.space.sm} 0;
`;

const EmptyDescription = styled.p`
    font-size: ${enterprise.fontSize.base};
    color: ${enterprise.textTertiary};
    margin: 0;
`;

// Client Header
const ClientHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${enterprise.space.xl};
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
`;

const ClientIdentity = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.lg};
`;

const ClientAvatar = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: ${enterprise.primary}15;
    color: ${enterprise.primary};
    border-radius: 50%;
    font-size: 32px;
    flex-shrink: 0;
`;

const ClientBasicInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.sm};
`;

const ClientName = styled.h1`
    font-size: ${enterprise.fontSize.xxl};
    font-weight: 700;
    color: ${enterprise.textPrimary};
    margin: 0;
    line-height: 1.2;
`;

const ClientTier = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    color: ${props => props.$color};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
        font-size: ${enterprise.fontSize.base};
    }
`;

const CompanyInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    color: ${enterprise.textTertiary};
    font-size: ${enterprise.fontSize.base};
    font-weight: 500;

    svg {
        font-size: ${enterprise.fontSize.sm};
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${enterprise.space.md};
`;

const ViewClientButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: ${enterprise.primary};
    color: white;
    border: none;
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${enterprise.shadow.sm};

    &:hover {
        background: ${enterprise.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.md};
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

// Business Metrics Dashboard
const MetricsDashboard = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
    overflow: hidden;
`;

const DashboardHeader = styled.div`
    padding: ${enterprise.space.lg} ${enterprise.space.xl};
    background: ${enterprise.surfaceSecondary};
    border-bottom: 1px solid ${enterprise.border};
`;

const DashboardTitle = styled.h2`
    font-size: ${enterprise.fontSize.lg};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1px;
    background: ${enterprise.border};
`;

const MetricCard = styled.div<{ $variant: string }>`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.lg};
    padding: ${enterprise.space.xl};
    background: ${enterprise.surface};
    transition: all 0.2s ease;

    &:hover {
        background: ${enterprise.surfaceSecondary};
    }
`;

const MetricIcon = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${enterprise.radius.lg};
    font-size: 20px;
    flex-shrink: 0;
`;

const MetricContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
`;

const MetricValue = styled.div`
    font-size: ${enterprise.fontSize.xl};
    font-weight: 700;
    color: ${enterprise.textPrimary};
    line-height: 1.2;
`;

const MetricLabel = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

// Contact Section
const ContactSection = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
    overflow: hidden;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${enterprise.space.lg} ${enterprise.space.xl};
    background: ${enterprise.surfaceSecondary};
    border-bottom: 1px solid ${enterprise.border};
`;

const SectionTitle = styled.h3`
    font-size: ${enterprise.fontSize.lg};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0;
`;

const SectionMeta = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const ContactGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${enterprise.space.lg};
    padding: ${enterprise.space.xl};
`;

const ContactItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${enterprise.space.md};
`;

const ContactIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${enterprise.surfaceSecondary};
    color: ${enterprise.textTertiary};
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    flex-shrink: 0;
    margin-top: 2px;
`;

const ContactDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
`;

const ContactLabel = styled.div`
    font-size: ${enterprise.fontSize.xs};
    color: ${enterprise.textTertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ContactValue = styled.div`
    font-size: ${enterprise.fontSize.base};
    color: ${enterprise.textSecondary};
    font-weight: 500;
    line-height: 1.4;
`;

// Vehicle Section
const VehicleSection = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
    overflow: hidden;
`;

const EmptyVehicles = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${enterprise.space.xxl};
    text-align: center;
`;

const EmptyVehicleIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${enterprise.surfaceSecondary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${enterprise.textMuted};
    font-size: 24px;
    margin-bottom: ${enterprise.space.lg};
`;

const EmptyVehicleText = styled.div`
    font-size: ${enterprise.fontSize.base};
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const VehicleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: ${enterprise.space.lg};
    padding: ${enterprise.space.xl};
`;

const VehicleCard = styled.div<{ $isActive: boolean }>`
    background: ${enterprise.surface};
    border: 2px solid ${props => props.$isActive ? enterprise.primary : enterprise.border};
    border-radius: ${enterprise.radius.lg};
    padding: ${enterprise.space.lg};
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    padding-top: ${props => props.$isActive ? '48px' : enterprise.space.lg}; // Extra space for badge

    ${props => props.$isActive && `
        background: ${enterprise.primary}08;
        box-shadow: 0 0 0 1px ${enterprise.primary}40;
    `}

    &:hover {
        border-color: ${props => props.$isActive ? enterprise.primaryDark : enterprise.primary};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.md};
    }
`;

const VehicleHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${enterprise.space.lg};
    gap: ${enterprise.space.md}; // Ensure proper spacing
`;

const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
    flex: 1; // Take available space
    min-width: 0; // Allow text truncation if needed
`;

const VehicleName = styled.h4`
    font-size: ${enterprise.fontSize.base};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0;
    line-height: 1.3;
    word-break: break-word; // Handle long vehicle names
`;

const VehicleYear = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const VehiclePlate = styled.div<{ $isActive: boolean }>`
    padding: ${enterprise.space.sm} ${enterprise.space.md};
    background: ${props => props.$isActive ? enterprise.primary : enterprise.surfaceSecondary};
    color: ${props => props.$isActive ? 'white' : enterprise.textSecondary};
    border: 1px solid ${props => props.$isActive ? enterprise.primary : enterprise.border};
    border-radius: ${enterprise.radius.md};
    font-weight: 700;
    font-size: ${enterprise.fontSize.sm};
    font-family: monospace;
    letter-spacing: 1px;
    text-transform: uppercase;
    flex-shrink: 0; // Don't shrink the plate
    text-align: center;
    min-width: 80px; // Ensure minimum width for plates
`;

const VehicleStats = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${enterprise.space.md};
    margin-bottom: ${enterprise.space.lg};
`;

const VehicleStat = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${enterprise.space.sm};
`;

const StatIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${enterprise.surfaceSecondary};
    color: ${enterprise.textTertiary};
    border-radius: 50%;
    font-size: ${enterprise.fontSize.sm};
`;

const StatContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const StatValue = styled.div`
    font-size: ${enterprise.fontSize.base};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    line-height: 1.2;
    word-break: break-word; // Handle long numbers/currency
`;

const StatLabel = styled.div`
    font-size: ${enterprise.fontSize.xs};
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const CurrentVehicleBadge = styled.div`
    position: absolute;
    top: ${enterprise.space.md};
    left: ${enterprise.space.md};
    right: ${enterprise.space.md};
    padding: ${enterprise.space.xs} ${enterprise.space.sm};
    background: ${enterprise.success};
    color: white;
    border-radius: ${enterprise.radius.sm};
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
    z-index: 10;
`;

// Notes Section
const NotesSection = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
    overflow: hidden;
`;

const NotesContent = styled.div`
    padding: ${enterprise.space.xl};
    font-size: ${enterprise.fontSize.base};
    color: ${enterprise.textSecondary};
    line-height: 1.6;
    white-space: pre-line;
    background: ${enterprise.surfaceSecondary};
    border-left: 4px solid ${enterprise.primary};
`;

export default ProtocolClientInfo;