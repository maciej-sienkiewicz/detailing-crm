import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTimes, FaUser, FaBuilding, FaIdCard, FaMapMarkerAlt, FaEnvelope, FaPhone, FaCalendarAlt, FaMoneyBillWave, FaCar, FaEye, FaStickyNote, FaCheckCircle, FaClock, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import {ClientExpanded, ClientStatistics} from '../../../types';
import {clientApi} from "../../../api/clientsApi";
import { visitsApi, ClientVisitHistoryItem } from '../../../api/visitsApiNew';
import { ProtocolStatus, ProtocolStatusLabels, ProtocolStatusColors } from '../../../types/protocol';

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

interface ClientDetailDrawerProps {
    isOpen: boolean;
    client: ClientExpanded | null;
    onClose: () => void;
}

const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
                                                                   isOpen,
                                                                   client,
                                                                   onClose
                                                               }) => {
    const navigate = useNavigate();
    const [visitHistory, setVisitHistory] = useState<ClientVisitHistoryItem[]>([]);
    const [clientStats, setClientStats] = useState<ClientStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadClientData = async () => {
            if (client) {
                setLoading(true);
                setError(null);
                try {
                    console.log('📋 Loading data for client:', client.id);

                    // Load client statistics
                    const clientStats = await clientApi.fetchClientStatsById(client.id);
                    setClientStats(clientStats);
                    console.log('📊 Client stats loaded:', clientStats);

                    // Load visit history (5 most recent visits)
                    const visitResult = await visitsApi.getClientVisitHistory(client.id, { size: 5 });
                    console.log('🏥 Visit history result:', visitResult);

                    if (visitResult.success && visitResult.data) {
                        console.log('✅ Visit history data:', visitResult.data.data);
                        setVisitHistory(visitResult.data.data);
                    } else {
                        console.warn('⚠️ Failed to load visit history:', visitResult.error);
                        setError(visitResult.error || 'Nie udało się załadować historii wizyt');
                        setVisitHistory([]);
                    }
                } catch (error) {
                    console.error('❌ Error loading client data:', error);
                    setError('Nie udało się załadować danych klienta');
                    setVisitHistory([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadClientData();
    }, [client]);

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

    if (!client || !clientStats) return null;

    return (
        <DrawerContainer isOpen={isOpen}>
            <DrawerHeader>
                <HeaderContent>
                    <HeaderIcon>
                        <FaUser />
                    </HeaderIcon>
                    <HeaderText>
                        <HeaderTitle>Szczegóły klienta</HeaderTitle>
                        <HeaderSubtitle>{client.firstName} {client.lastName}</HeaderSubtitle>
                    </HeaderText>
                </HeaderContent>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>
            </DrawerHeader>

            <DrawerContent>
                {/* Client Header Section */}
                <ClientHeaderSection>
                    <ClientTitle>{client.firstName} {client.lastName}</ClientTitle>
                    <ClientEmail>{client.email}</ClientEmail>
                    <ClientBasicInfo>
                        <InfoItem>
                            <InfoIcon><FaPhone /></InfoIcon>
                            <InfoText>{client.phone}</InfoText>
                        </InfoItem>
                        {client.address && (
                            <InfoItem>
                                <InfoIcon><FaMapMarkerAlt /></InfoIcon>
                                <InfoText>{client.address}</InfoText>
                            </InfoItem>
                        )}
                    </ClientBasicInfo>
                </ClientHeaderSection>

                {/* Personal Information */}
                <SectionTitle>
                    <SectionTitleIcon><FaUser /></SectionTitleIcon>
                    Informacje podstawowe
                </SectionTitle>

                <DetailSection>
                    <DetailRow>
                        <DetailIcon><FaUser /></DetailIcon>
                        <DetailContent>
                            <DetailLabel>Imię i nazwisko</DetailLabel>
                            <DetailValue>{client.firstName} {client.lastName}</DetailValue>
                        </DetailContent>
                    </DetailRow>

                    <DetailRow>
                        <DetailIcon><FaEnvelope /></DetailIcon>
                        <DetailContent>
                            <DetailLabel>Email</DetailLabel>
                            <DetailValue>{client.email}</DetailValue>
                        </DetailContent>
                    </DetailRow>

                    <DetailRow>
                        <DetailIcon><FaPhone /></DetailIcon>
                        <DetailContent>
                            <DetailLabel>Telefon</DetailLabel>
                            <DetailValue>{client.phone}</DetailValue>
                        </DetailContent>
                    </DetailRow>

                    {client.address && (
                        <DetailRow>
                            <DetailIcon><FaMapMarkerAlt /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>Adres</DetailLabel>
                                <DetailValue>{client.address}</DetailValue>
                            </DetailContent>
                        </DetailRow>
                    )}
                </DetailSection>

                {/* Company Information */}
                {(client.company || client.taxId) && (
                    <>
                        <SectionTitle>
                            <SectionTitleIcon><FaBuilding /></SectionTitleIcon>
                            Dane firmowe
                        </SectionTitle>

                        <DetailSection>
                            {client.company && (
                                <DetailRow>
                                    <DetailIcon><FaBuilding /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Firma</DetailLabel>
                                        <DetailValue>{client.company}</DetailValue>
                                    </DetailContent>
                                </DetailRow>
                            )}

                            {client.taxId && (
                                <DetailRow>
                                    <DetailIcon><FaIdCard /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>NIP</DetailLabel>
                                        <DetailValue>{client.taxId}</DetailValue>
                                    </DetailContent>
                                </DetailRow>
                            )}
                        </DetailSection>
                    </>
                )}

                {/* Client Statistics */}
                <SectionTitle>
                    <SectionTitleIcon><FaCalendarAlt /></SectionTitleIcon>
                    Statystyki klienta
                </SectionTitle>

                <MetricsGrid>
                    <MetricCard>
                        <MetricIcon $color={brandTheme.status.info}>
                            <FaCalendarAlt />
                        </MetricIcon>
                        <MetricContent>
                            <MetricValue>{clientStats.totalVisits}</MetricValue>
                            <MetricLabel>Liczba wizyt</MetricLabel>
                        </MetricContent>
                    </MetricCard>

                    <MetricCard>
                        <MetricIcon $color={brandTheme.status.success}>
                            <FaMoneyBillWave />
                        </MetricIcon>
                        <MetricContent>
                            <MetricValue>{formatCurrency(clientStats.totalRevenue)}</MetricValue>
                            <MetricLabel>Suma przychodów</MetricLabel>
                        </MetricContent>
                    </MetricCard>

                    <MetricCard>
                        <MetricIcon $color={brandTheme.status.warning}>
                            <FaCar />
                        </MetricIcon>
                        <MetricContent>
                            <MetricValue>{clientStats.vehicleNo}</MetricValue>
                            <MetricLabel>Pojazdy</MetricLabel>
                        </MetricContent>
                    </MetricCard>

                    <MetricCard>
                        <MetricIcon $color={brandTheme.primary}>
                            <FaEye />
                        </MetricIcon>
                        <MetricContent>
                            <MetricValue>{visitHistory.length}</MetricValue>
                            <MetricLabel>Ostatnie wizyty</MetricLabel>
                        </MetricContent>
                    </MetricCard>
                </MetricsGrid>

                {/* Notes Section */}
                {client.notes && (
                    <>
                        <SectionTitle>
                            <SectionTitleIcon><FaStickyNote /></SectionTitleIcon>
                            Notatki
                        </SectionTitle>
                        <NotesContent>{client.notes}</NotesContent>
                    </>
                )}

                {/* Visit History */}
                <SectionTitle>
                    <SectionTitleIcon><FaCar /></SectionTitleIcon>
                    Historia wizyt
                </SectionTitle>

                {loading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie historii wizyt...</LoadingText>
                    </LoadingContainer>
                ) : visitHistory.length === 0 ? (
                    <EmptyMessage>
                        <EmptyIcon><FaCar /></EmptyIcon>
                        <EmptyText>Brak historii wizyt</EmptyText>
                        <EmptySubtext>Ten klient nie ma jeszcze żadnej historii wizyt w systemie</EmptySubtext>
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
                                                {formatDate(visit.startDate)}
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
                                            <VehicleBrand>{visit.make} {visit.model}</VehicleBrand>
                                            <VehiclePlate>{visit.licensePlate}</VehiclePlate>
                                        </VehicleInfo>
                                    </VisitVehicleSection>

                                    <VisitFooter>
                                        <VisitAmount>
                                            <AmountLabel>Wartość</AmountLabel>
                                            <AmountValue>
                                                {formatCurrency(visit.totalAmount)}
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

const ClientHeaderSection = styled.div`
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

const ClientTitle = styled.h2`
   font-size: 24px;
   font-weight: 700;
   color: ${brandTheme.text.primary};
   margin: 0 0 ${brandTheme.spacing.md} 0;
   text-align: center;
   letter-spacing: -0.025em;
`;

const ClientEmail = styled.div`
   background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
   color: white;
   padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.lg};
   border-radius: ${brandTheme.radius.md};
   font-weight: 500;
   font-size: 14px;
   box-shadow: ${brandTheme.shadow.md};
   margin-bottom: ${brandTheme.spacing.md};
`;

const ClientBasicInfo = styled.div`
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

const MetricsGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(2, 1fr);
   gap: ${brandTheme.spacing.md};
   margin-bottom: ${brandTheme.spacing.lg};

   @media (max-width: 600px) {
       grid-template-columns: 1fr;
   }
`;

const MetricCard = styled.div`
   background: ${brandTheme.surfaceAlt};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
   transition: all 0.2s ease;

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

const NotesContent = styled.div`
   background: ${brandTheme.surfaceAlt};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.lg};
   font-size: 14px;
   color: ${brandTheme.text.primary};
   white-space: pre-line;
   line-height: 1.6;
   margin-bottom: ${brandTheme.spacing.lg};
   border-left: 4px solid ${brandTheme.primary};
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

// New styled components for visit history - Professional & Clean Design
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

const VehiclePlate = styled.div`
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

export default ClientDetailDrawer;