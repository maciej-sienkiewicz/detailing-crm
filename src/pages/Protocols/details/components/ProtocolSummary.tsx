import React, {useState} from 'react';
import {
    FaAward,
    FaBell,
    FaBuilding,
    FaCalendarCheck,
    FaCarSide,
    FaCheckCircle,
    FaClock,
    FaCrown,
    FaEdit,
    FaEnvelope,
    FaExclamationTriangle,
    FaFileAlt,
    FaGem,
    FaHistory,
    FaIdCard,
    FaKey,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaPhone,
    FaPlus,
    FaShieldAlt,
    FaStickyNote,
    FaTachometerAlt,
    FaTools,
    FaTrash,
    FaUserCheck,
    FaUserTie
} from 'react-icons/fa';
import {clientApi} from "../../../../api/clientsApi";
import {servicesApi} from "../../../../features/services/api/servicesApi";
import {visitsApi} from "../../../../api/visitsApiNew";
import {
    CarReceptionProtocol,
    ClientExpanded,
    ClientStatistics,
    ProtocolStatus,
    SelectedService,
    ServiceApprovalStatus,
    PriceResponse
} from "../../../../types";
import AddServiceModal from "../../shared/modals/AddServiceModal";
import EditPricesModal from "./EditPricesModal";
import DeleteServiceModal from "../modals/DeleteServiceModalProps";

// Professional Brand System - Enterprise Automotive Grade
const brand = {
    // Primary Brand Colors - Professional & Trustworthy
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Premium Surface System
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceSubtle: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Professional Typography Hierarchy
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Enterprise Status System
    success: '#059669',
    successBg: '#ecfdf5',
    warning: '#d97706',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorBg: '#fef2f2',
    pending: '#0891b2',
    pendingBg: '#f0f9ff',

    // Professional Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderSubtle: '#f8fafc',

    // Executive Spacing
    space: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px'
    },

    // Premium Shadows
    shadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        soft: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        moderate: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },

    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    }
};

interface ProtocolSummaryProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate?: (updatedProtocol: CarReceptionProtocol) => void;
}

const ProtocolSummary: React.FC<ProtocolSummaryProps> = ({ protocol, onProtocolUpdate }) => {
    const [showAddServiceModal, setShowAddServiceModal] = useState(false);
    const [showEditPricesModal, setShowEditPricesModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);
    const [client, setClient] = useState<ClientExpanded | null>(null);
    const [clientStats, setClientStats] = useState<ClientStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availableServices, setAvailableServices] = useState<Array<{ id: string; name: string; price: PriceResponse }>>([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [addingServices, setAddingServices] = useState(false);
    const [removingServiceId, setRemovingServiceId] = useState<string | null>(null);

    const handleEditPrices = () => {
        setShowEditPricesModal(true);
    };

    const handleSavePrices = async (updatedServices: SelectedService[]) => {
        try {
            // Update protocol with modified services
            const updatedProtocol: CarReceptionProtocol = {
                ...protocol,
                selectedServices: updatedServices
            };

            // Call parent update handler
            if (onProtocolUpdate) {
                onProtocolUpdate(updatedProtocol);
            }

            setShowEditPricesModal(false);

            // Show success message

        } catch (error) {
            console.error('Error updating prices:', error);
            // You might want to show an error toast here
        }
    };

    // Handler for removing a service - UPDATED with modal
    const handleRemoveService = async (serviceId: string, serviceName: string) => {
        setServiceToDelete({ id: serviceId, name: serviceName });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!serviceToDelete) return;

        try {
            setRemovingServiceId(serviceToDelete.id);

            // Call the API to remove service from visit
            const result = await visitsApi.removeServiceFromVisit(
                protocol.id,
                serviceToDelete.id,
                'Usunięto przez użytkownika'
            );

            if (result.success && result.data) {

                // Transform API response to match protocol format
                const updatedServices = result.data.services?.map(service => ({
                    id: service.id,
                    rowId: `row-${service.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: service.name,
                    quantity: service.quantity || 1,
                    basePrice: service.basePrice,
                    discountType: service.discount?.type as DiscountType || DiscountType.PERCENT,
                    discountValue: service.discount?.value || 0,
                    finalPrice: service.finalPrice,
                    note: service.note || '',
                    approvalStatus: service.approvalStatus as ServiceApprovalStatus || ServiceApprovalStatus.PENDING
                })) || [];

                // Update protocol with services from API response
                const updatedProtocol: CarReceptionProtocol = {
                    ...protocol,
                    selectedServices: updatedServices,
                };

                // Call parent update handler
                if (onProtocolUpdate) {
                    onProtocolUpdate(updatedProtocol);
                }

            } else {
                // Handle API error
                const errorMessage = result.error || 'Nie udało się usunąć usługi z wizyty';
                console.error('❌ API error:', errorMessage);

                alert(`Błąd: ${errorMessage}`);
            }

        } catch (error) {
            console.error('❌ Error removing service:', error);

            // Show error to user
            alert('Wystąpił błąd podczas usuwania usługi. Spróbuj ponownie.');
        } finally {
            setRemovingServiceId(null);
            setServiceToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const canEditPrices = protocol.status === ProtocolStatus.READY_FOR_PICKUP;

    // NEW: Check if services can be added/removed
    const canModifyServices = protocol.status !== ProtocolStatus.CANCELLED && protocol.status !== ProtocolStatus.COMPLETED;

    // Load client data based on protocol's owner ID
    React.useEffect(() => {
        const loadClientData = async () => {
            try {
                setLoading(true);
                setError(null);

                const clientId = protocol.ownerId;

                const [matchedClient, matchedClientStats] = await Promise.all([
                    clientApi.fetchClientById(clientId),
                    clientApi.fetchClientStatsById(clientId)
                ]);

                if (matchedClient) {
                    setClient(matchedClient);
                    setClientStats(matchedClientStats);
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

        if (protocol.ownerId) {
            loadClientData();
        }
    }, [protocol.ownerId]);

    // Load available services
    React.useEffect(() => {
        const loadServices = async () => {
            try {
                setServicesLoading(true);
                const services = await servicesApi.fetchServices();

                // Map services to the format expected by AddServiceModal
                // ✅ ZMIANA: Przekazujemy całą strukturę PriceResponse zamiast tylko priceNetto
                const mappedServices = services.map(service => ({
                    id: service.id,
                    name: service.name,
                    price: service.price  // Przekazujemy całą strukturę PriceResponse
                }));

                setAvailableServices(mappedServices);
            } catch (err) {
                console.error('Error loading services:', err);
                // Don't show error to user, just log it
                setAvailableServices([]);
            } finally {
                setServicesLoading(false);
            }
        };

        loadServices();
    }, []);

    // Handler for adding new services
    const handleAddService = () => {
        setShowAddServiceModal(true);
    };

    // Handler for saving new services - UPDATED with API call
    const handleSaveServices = async (data: {
        services: Array<{
            id: string;
            name: string;
            basePrice: PriceResponse;  // ✅ ZMIANA: PriceResponse zamiast number
            discountType?: DiscountType;
            discountValue?: number;
            finalPrice: PriceResponse;  // ✅ ZMIANA: PriceResponse zamiast number
            note?: string;
        }>
    }) => {
        try {
            setAddingServices(true);

            // Call the API to add services to visit
            const result = await visitsApi.addServicesToVisit(protocol.id, data.services);

            if (result.success && result.data) {

                // Transform API response to match protocol format
                const updatedServices = result.data.services?.map(service => ({
                    id: service.id,
                    rowId: `row-${service.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: service.name,
                    quantity: service.quantity || 1,
                    basePrice: service.basePrice,
                    discountType: service.discount?.type as DiscountType || DiscountType.PERCENT,
                    discountValue: service.discount?.value || 0,
                    finalPrice: service.finalPrice,
                    note: service.note || '',
                    approvalStatus: service.approvalStatus as ServiceApprovalStatus || ServiceApprovalStatus.PENDING
                })) || [];

                // Update protocol with services from API response
                const updatedProtocol: CarReceptionProtocol = {
                    ...protocol,
                    selectedServices: updatedServices
                };

                // Call parent update handlern[
                if (onProtocolUpdate) {
                    onProtocolUpdate(updatedProtocol);
                }

                setShowAddServiceModal(false);

                // Show success message

            } else {
                // Handle API error
                const errorMessage = result.error || 'Nie udało się dodać usług do wizyty';
                console.error('❌ API error:', errorMessage);

                // You could show a toast/notification here
                alert(`Błąd: ${errorMessage}`);
            }

        } catch (error) {
            console.error('❌ Error adding services:', error);

            // Show error to user
            alert('Wystąpił błąd podczas dodawania usług. Spróbuj ponownie.');
        } finally {
            setAddingServices(false);
        }
    };

    const DEFAULT_VAT_RATE = 23;

    // Funkcje do obsługi cen - używamy struktury PriceResponse z backendu
    const getBasePriceGross = (service: SelectedService): number => {
        return service.basePrice.priceBrutto;
    };

    const getBasePriceNet = (service: SelectedService): number => {
        return service.basePrice.priceNetto;
    };

    const getFinalPriceGross = (service: SelectedService): number => {
        return service.finalPrice.priceBrutto;
    };

    const getFinalPriceNet = (service: SelectedService): number => {
        return service.finalPrice.priceNetto;
    };

    // Business calculations - sumujemy wartości z PriceResponse
    const totalRevenueNet = protocol.selectedServices.reduce((sum, s) => sum + s.finalPrice.priceNetto, 0);
    const totalRevenueGross = protocol.selectedServices.reduce((sum, s) => sum + s.finalPrice.priceBrutto, 0);
    const totalRevenueTax = protocol.selectedServices.reduce((sum, s) => sum + s.finalPrice.taxAmount, 0);

    const totalDiscountNet = protocol.selectedServices.reduce((sum, s) => sum + (s.basePrice.priceNetto - s.finalPrice.priceNetto), 0);
    const totalDiscountGross = protocol.selectedServices.reduce((sum, s) => sum + (s.basePrice.priceBrutto - s.finalPrice.priceBrutto), 0);
    const totalDiscountTax = protocol.selectedServices.reduce((sum, s) => sum + (s.basePrice.taxAmount - s.finalPrice.taxAmount), 0);

    const totalBasePriceNet = protocol.selectedServices.reduce((sum, s) => sum + s.basePrice.priceNetto, 0);
    const totalBasePriceGross = protocol.selectedServices.reduce((sum, s) => sum + s.basePrice.priceBrutto, 0);
    const totalBasePriceTax = protocol.selectedServices.reduce((sum, s) => sum + s.basePrice.taxAmount, 0);

    const pendingServices = protocol.selectedServices.filter(s => s.approvalStatus === ServiceApprovalStatus.PENDING);
    const approvedServices = protocol.selectedServices.filter(s => s.approvalStatus === ServiceApprovalStatus.APPROVED);

    // Client tier logic
    const getClientTier = (revenue: number) => {
        if (revenue >= 40000) return {
            label: 'Platinum',
            color: '#7c3aed',
            icon: <FaGem />,
            bgColor: 'rgba(124, 58, 237, 0.08)'
        };
        if (revenue >= 20000) return {
            label: 'Gold',
            color: '#d97706',
            icon: <FaCrown />,
            bgColor: 'rgba(217, 119, 6, 0.08)'
        };
        if (revenue >= 10000) return {
            label: 'Silver',
            color: '#059669',
            icon: <FaAward />,
            bgColor: 'rgba(5, 150, 105, 0.08)'
        };
        return {
            label: 'Standard',
            color: '#64748b',
            icon: <FaShieldAlt />,
            bgColor: 'rgba(100, 116, 139, 0.08)'
        };
    };

    const clientTier = clientStats ? getClientTier(clientStats.totalRevenue.totalAmountNetto) : getClientTier(0);

    // Format currency for display
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Status mapping
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return { step: 1, label: 'Przyjęto', time: new Date(protocol.startDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) };
            case 'IN_PROGRESS':
                return { step: 2, label: 'W realizacji', time: 'Teraz' };
            case 'READY_FOR_PICKUP':
                return { step: 3, label: 'Gotowe', time: '~15:30' };
            case 'COMPLETED':
                return { step: 4, label: 'Wydano', time: new Date(protocol.endDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) };
            default:
                return { step: 1, label: 'Przyjęto', time: '--:--' };
        }
    };

    const currentStatus = getStatusInfo(protocol.status);

    // Helper functions to check if notes or delivery person exist
    const hasNotes = protocol.notes && protocol.notes.trim() !== '';
    const hasDeliveryPerson = protocol.deliveryPerson && protocol.deliveryPerson.name && protocol.deliveryPerson.name.trim() !== '';
    const shouldShowAdditionalSection = hasNotes || hasDeliveryPerson;

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <span>Ładowanie danych klienta...</span>
            </LoadingContainer>
        );
    }

    return (
        <Container>
            {/* Enhanced Status Timeline - More Professional */}
            <StatusSection>
                <StatusHeader>
                    <StatusTitle>Status realizacji</StatusTitle>
                    <StatusProgress>Etap {currentStatus.step}/4</StatusProgress>
                </StatusHeader>
                <StatusTimeline>
                    <StatusStep $active={true} $completed={true}>
                        <StepIcon $active={false} $completed={true}>
                            <FaCalendarCheck />
                        </StepIcon>
                        <StepLabel>Przyjęto</StepLabel>
                    </StatusStep>

                    <StatusConnector $active={['IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED'].includes(protocol.status)} />

                    <StatusStep $active={true} $completed={['READY_FOR_PICKUP', 'COMPLETED'].includes(protocol.status)}>
                        <StepIcon $active={protocol.status === 'IN_PROGRESS'} $completed={['READY_FOR_PICKUP', 'COMPLETED'].includes(protocol.status)}>
                            <FaTools />
                        </StepIcon>
                        <StepLabel>W realizacji</StepLabel>
                    </StatusStep>

                    <StatusConnector $active={['READY_FOR_PICKUP', 'COMPLETED'].includes(protocol.status)} />

                    <StatusStep $active={true} $completed={protocol.status === 'COMPLETED'}>
                        <StepIcon $active={protocol.status === 'READY_FOR_PICKUP'} $completed={protocol.status === 'COMPLETED'}>
                            <FaClock />
                        </StepIcon>
                        <StepLabel>Gotowe</StepLabel>
                    </StatusStep>

                    <StatusConnector $active={protocol.status === 'COMPLETED'} />

                    <StatusStep $active={true} $completed={protocol.status === 'COMPLETED'}>
                        <StepIcon $active={protocol.status === 'COMPLETED'} $completed={protocol.status === 'COMPLETED'}>
                            <FaCarSide />
                        </StepIcon>
                        <StepLabel>Wydano</StepLabel>
                    </StatusStep>
                </StatusTimeline>

                {pendingServices.length > 0 && (
                    <AlertBanner>
                        <FaExclamationTriangle />
                        <span>{pendingServices.length} usług oczekuje na potwierdzenie klienta</span>
                    </AlertBanner>
                )}
            </StatusSection>

            {/* Main Content Grid */}
            <ContentGrid>
                {/* Vehicle Card - Enhanced with Professional License Plate */}
                <VehicleCard>
                    <CardHeader>
                        <HeaderIcon $color={brand.primary}>
                            <FaCarSide />
                        </HeaderIcon>
                        <HeaderContent>
                            <CardTitle>Pojazd w serwisie</CardTitle>
                            <CardSubtitle>Informacje podstawowe</CardSubtitle>
                        </HeaderContent>
                    </CardHeader>

                    <VehicleMainInfo>
                        <VehicleIdentity>
                            <VehicleModel>{protocol.make} {protocol.model}</VehicleModel>
                            <VehicleYear>{protocol.productionYear}</VehicleYear>
                        </VehicleIdentity>

                        {/* Professional License Plate Design */}
                        <LicensePlateContainer>
                            <LicensePlate>
                                <PlateFlag>
                                    <EUStars>
                                        ★ ★<br/>
                                        ★ ★<br/>
                                        ★ ★
                                    </EUStars>
                                    <CountryCode>PL</CountryCode>
                                </PlateFlag>
                                <PlateNumber>{protocol.licensePlate}</PlateNumber>
                            </LicensePlate>
                        </LicensePlateContainer>
                    </VehicleMainInfo>

                    <VehicleDetails>
                        <DetailItem>
                            <DetailIcon><FaTachometerAlt /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>Przebieg</DetailLabel>
                                <DetailValue>{protocol.mileage ? protocol.mileage.toLocaleString() : '---'} km</DetailValue>
                            </DetailContent>
                        </DetailItem>

                        <DetailItem>
                            <DetailIcon><FaKey /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>Kluczyki</DetailLabel>
                                <DetailValue $status={protocol.keysProvided ? "provided" : undefined}>
                                    {protocol.keysProvided ? 'Przekazane' : 'Nie przekazane'}
                                </DetailValue>
                            </DetailContent>
                        </DetailItem>

                        <DetailItem>
                            <DetailIcon><FaFileAlt /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>Dokumenty</DetailLabel>
                                <DetailValue $status={protocol.documentsProvided ? "provided" : undefined}>
                                    {protocol.documentsProvided ? 'Przekazane' : 'Nie przekazane'}
                                </DetailValue>
                            </DetailContent>
                        </DetailItem>
                    </VehicleDetails>
                </VehicleCard>

                {/* Enhanced Client Profile Card */}
                <ClientCard>
                    <CardHeader>
                        <HeaderIcon $color={clientTier.color}>
                            <FaUserTie />
                        </HeaderIcon>
                        <HeaderContent>
                            <CardTitle>Profil klienta</CardTitle>
                            <ClientTierBadge $color={clientTier.color} $bgColor={clientTier.bgColor}>
                                {clientTier.icon}
                                <span>Klient {clientTier.label}</span>
                            </ClientTierBadge>
                        </HeaderContent>
                    </CardHeader>

                    {error ? (
                        <ErrorState>
                            <FaExclamationTriangle />
                            <span>{error}</span>
                        </ErrorState>
                    ) : client && clientStats ? (
                        <>
                            <ClientMainInfo>
                                <ClientName>{client.firstName} {client.lastName}</ClientName>
                                {client.company && (
                                    <CompanyName>
                                        <FaBuilding />
                                        <span>{client.company}</span>
                                    </CompanyName>
                                )}
                            </ClientMainInfo>

                            {/* Business Metrics */}
                            <BusinessMetrics>
                                <MetricCard>
                                    <MetricIcon $color={brand.success}>
                                        <FaMoneyBillWave />
                                    </MetricIcon>
                                    <MetricContent>
                                        <MetricValue>{formatCurrency(clientStats.totalRevenue.totalAmountNetto)}</MetricValue>
                                        <MetricLabel>Łączne przychody netto</MetricLabel>
                                    </MetricContent>
                                </MetricCard>

                                <MetricCard>
                                    <MetricIcon $color={brand.primary}>
                                        <FaHistory />
                                    </MetricIcon>
                                    <MetricContent>
                                        <MetricValue>{clientStats.totalVisits}</MetricValue>
                                        <MetricLabel>Wizyty</MetricLabel>
                                    </MetricContent>
                                </MetricCard>

                                <MetricCard>
                                    <MetricIcon $color={brand.warning}>
                                        <FaCarSide />
                                    </MetricIcon>
                                    <MetricContent>
                                        <MetricValue>{clientStats.vehicleNo}</MetricValue>
                                        <MetricLabel>Pojazdy</MetricLabel>
                                    </MetricContent>
                                </MetricCard>
                            </BusinessMetrics>

                            {/* Contact Information */}
                            <ContactSection>
                                <ContactItem>
                                    <ContactIcon><FaPhone /></ContactIcon>
                                    <ContactValue>{protocol.phone}</ContactValue>
                                </ContactItem>

                                <ContactItem>
                                    <ContactIcon><FaEnvelope /></ContactIcon>
                                    <ContactValue>{protocol.email}</ContactValue>
                                </ContactItem>

                                {client.address && (
                                    <ContactItem>
                                        <ContactIcon><FaMapMarkerAlt /></ContactIcon>
                                        <ContactValue>{client.address}</ContactValue>
                                    </ContactItem>
                                )}

                                {protocol.taxId && (
                                    <ContactItem>
                                        <ContactIcon><FaIdCard /></ContactIcon>
                                        <ContactValue>{protocol.taxId}</ContactValue>
                                    </ContactItem>
                                )}
                            </ContactSection>

                            {/* Quick Actions */}
                        </>
                    ) : (
                        <ClientMainInfo>
                            <ClientName>{protocol.ownerName}</ClientName>
                            {protocol.companyName && (
                                <CompanyName>
                                    <FaBuilding />
                                    <span>{protocol.companyName}</span>
                                </CompanyName>
                            )}
                            <ContactSection>
                                <ContactItem>
                                    <ContactIcon><FaPhone /></ContactIcon>
                                    <ContactValue>{protocol.phone}</ContactValue>
                                </ContactItem>
                                <ContactItem>
                                    <ContactIcon><FaEnvelope /></ContactIcon>
                                    <ContactValue>{protocol.email}</ContactValue>
                                </ContactItem>
                            </ContactSection>
                        </ClientMainInfo>
                    )}
                </ClientCard>
            </ContentGrid>

            {/* NEW: Notes and Delivery Person Section */}
            {shouldShowAdditionalSection && (
                <AdditionalInfoSection>
                    <AdditionalInfoGrid $fullWidth={!hasNotes || !hasDeliveryPerson}>
                        {/* Notes Section */}
                        {hasNotes && (
                            <NotesCard>
                                <CardHeader>
                                    <HeaderIcon $color="#8b5cf6">
                                        <FaStickyNote />
                                    </HeaderIcon>
                                    <HeaderContent>
                                        <CardTitle>Notatki</CardTitle>
                                        <CardSubtitle>Dodatkowe informacje</CardSubtitle>
                                    </HeaderContent>
                                </CardHeader>
                                <NotesContent>
                                    <NotesText>{protocol.notes}</NotesText>
                                </NotesContent>
                            </NotesCard>
                        )}

                        {/* Delivery Person Section */}
                        {hasDeliveryPerson && (
                            <DeliveryPersonCard>
                                <CardHeader>
                                    <HeaderIcon $color="#10b981">
                                        <FaUserCheck />
                                    </HeaderIcon>
                                    <HeaderContent>
                                        <CardTitle>Osoba odbierająca</CardTitle>
                                        <CardSubtitle>Dane odbierającego pojazd</CardSubtitle>
                                    </HeaderContent>
                                </CardHeader>
                                <DeliveryPersonContent>
                                    <DeliveryPersonInfo>
                                        <PersonName>{protocol.deliveryPerson!!.name}</PersonName>
                                        {protocol.deliveryPerson!!.phone && (
                                            <PersonContact>
                                                <FaPhone />
                                                <span>{protocol.deliveryPerson!!.phone}</span>
                                            </PersonContact>
                                        )}
                                    </DeliveryPersonInfo>
                                </DeliveryPersonContent>
                            </DeliveryPersonCard>
                        )}
                    </AdditionalInfoGrid>
                </AdditionalInfoSection>
            )}

            {/* Services Section */}
            <ServicesSection>
                <SectionHeader>
                    <HeaderContent>
                        <SectionTitle>Wykaz usług</SectionTitle>
                        <SectionStats>
                            {approvedServices.length} zatwierdzone • {pendingServices.length} oczekujące
                        </SectionStats>
                    </HeaderContent>
                    <HeaderActions>
                        {/* Przycisk "Edytuj ceny" - widoczny tylko gdy status to READY_FOR_PICKUP */}
                        {canEditPrices && (
                            <EditPricesButton onClick={handleEditPrices}>
                                <FaEdit />
                                <span>Edytuj ceny</span>
                            </EditPricesButton>
                        )}

                        {/* UPDATED: Przycisk "Dodaj usługę" - ukryty gdy wizyta anulowana lub zakończona */}
                        {canModifyServices && (
                            <AddServiceButton
                                onClick={handleAddService}
                                disabled={servicesLoading || addingServices}
                            >
                                <FaPlus />
                                <span>
                                    {addingServices ? 'Dodawanie...' : servicesLoading ? 'Ładowanie...' : 'Dodaj usługę'}
                                </span>
                            </AddServiceButton>
                        )}
                    </HeaderActions>
                </SectionHeader>

                <ServicesTable>
                    <TableHeader>
                        <HeaderCell style={{width: '35%'}}>Usługa</HeaderCell>
                        <HeaderCell style={{width: '20%'}}>Cena bazowa</HeaderCell>
                        <HeaderCell style={{width: '15%'}}>Rabat</HeaderCell>
                        <HeaderCell style={{width: '20%'}}>Cena końcowa</HeaderCell>
                        <HeaderCell style={{width: '5%'}}>Status</HeaderCell>
                        <HeaderCell style={{width: '5%'}}></HeaderCell>
                    </TableHeader>

                    <TableBody>
                        {protocol.selectedServices.map((service, index) => (
                            <ServiceRow key={service.id} $pending={service.approvalStatus === ServiceApprovalStatus.PENDING}>
                                <ServiceCell>
                                    <ServiceName>{service.name}</ServiceName>
                                    {service.note && (
                                        <ServiceNote>{service.note}</ServiceNote>
                                    )}
                                </ServiceCell>

                                <PriceCell>
                                    <PriceInfo>
                                        <PriceRow>
                                            <PriceAmount>{getBasePriceGross(service).toFixed(2)} zł</PriceAmount>
                                            <PriceLabel>brutto</PriceLabel>
                                        </PriceRow>
                                        <PriceRow>
                                            <PriceAmount $secondary>
                                                {getBasePriceNet(service).toFixed(2)} zł
                                            </PriceAmount>
                                            <PriceLabel>netto</PriceLabel>
                                        </PriceRow>
                                    </PriceInfo>
                                </PriceCell>

                                <DiscountCell>
                                    {service.discountValue > 0 ? (
                                        <DiscountInfo>
                                            <DiscountAmount>
                                                -{(getBasePriceGross(service)-getFinalPriceGross(service)).toFixed(2)}
                                                {service.discountType === DiscountType.PERCENT ? '%' : 'zł'}
                                            </DiscountAmount>
                                            <SavingsAmount>(-{(getBasePriceNet(service) - getFinalPriceNet(service)).toFixed(2)} zł)</SavingsAmount>
                                        </DiscountInfo>
                                    ) : (
                                        <NoDiscount>—</NoDiscount>
                                    )}
                                </DiscountCell>

                                <FinalPriceCell>
                                    <PriceInfo>
                                        <PriceRow>
                                            <FinalPrice>{getFinalPriceGross(service).toFixed(2)} zł</FinalPrice>
                                            <PriceLabel>brutto</PriceLabel>
                                        </PriceRow>
                                        <PriceRow>
                                            <FinalPrice $secondary>
                                                {getFinalPriceNet(service).toFixed(2)} zł
                                            </FinalPrice>
                                            <PriceLabel>netto</PriceLabel>
                                        </PriceRow>
                                    </PriceInfo>
                                </FinalPriceCell>

                                <StatusCell>
                                    <ServiceStatus $status={service.approvalStatus || ServiceApprovalStatus.PENDING}>
                                        {(service.approvalStatus || ServiceApprovalStatus.PENDING) === ServiceApprovalStatus.PENDING ? (
                                            <>
                                                <FaClock />
                                                <span>Oczekuje</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCheckCircle />
                                                <span>Zatwierdzona</span>
                                            </>
                                        )}
                                    </ServiceStatus>
                                </StatusCell>

                                <ActionsCell>
                                    <ServiceActions>
                                        {(service.approvalStatus || ServiceApprovalStatus.PENDING) === ServiceApprovalStatus.PENDING && (
                                            <ActionIcon $type="notify" title="Wyślij ponownie powiadomienie">
                                                <FaBell />
                                            </ActionIcon>
                                        )}
                                        {/* UPDATED: Przycisk usuwania - ukryty gdy wizyta anulowana lub zakończona */}
                                        {canModifyServices && (
                                            <ActionIcon
                                                $type="delete"
                                                title="Usuń usługę"
                                                disabled={removingServiceId === service.id}
                                                onClick={() => handleRemoveService(service.id, service.name)}
                                            >
                                                {removingServiceId === service.id ? (
                                                    <MiniSpinner />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </ActionIcon>
                                        )}
                                    </ServiceActions>
                                </ActionsCell>
                            </ServiceRow>
                        ))}
                    </TableBody>

                    <TableFooter>
                        <FooterRow>
                            <FooterCell>
                                <TotalLabel>PODSUMOWANIE</TotalLabel>
                            </FooterCell>
                            <FooterCell>
                                <PriceInfo>
                                    <PriceRow>
                                        <TotalAmount>{totalBasePriceGross.toFixed(2)} zł</TotalAmount>
                                        <PriceLabel>brutto</PriceLabel>
                                    </PriceRow>
                                    <PriceRow>
                                        <TotalAmount $secondary>{totalBasePriceNet.toFixed(2)} zł</TotalAmount>
                                        <PriceLabel>netto</PriceLabel>
                                    </PriceRow>
                                </PriceInfo>
                            </FooterCell>
                            <FooterCell>
                                <PriceInfo>
                                    <PriceRow>
                                        <TotalAmount>-{totalDiscountGross.toFixed(2)} zł</TotalAmount>
                                        <PriceLabel>brutto</PriceLabel>
                                    </PriceRow>
                                    <PriceRow>
                                        <TotalAmount $secondary>-{totalDiscountNet.toFixed(2)} zł</TotalAmount>
                                        <PriceLabel>netto</PriceLabel>
                                    </PriceRow>
                                </PriceInfo>
                            </FooterCell>
                            <FooterCell>
                                <PriceInfo>
                                    <PriceRow>
                                        <FinalTotalAmount>{totalRevenueGross.toFixed(2)} zł</FinalTotalAmount>
                                        <PriceLabel>brutto</PriceLabel>
                                    </PriceRow>
                                    <PriceRow>
                                        <FinalTotalAmount $secondary>{totalRevenueNet.toFixed(2)} zł</FinalTotalAmount>
                                        <PriceLabel>netto</PriceLabel>
                                    </PriceRow>
                                </PriceInfo>
                            </FooterCell>
                            <FooterCell></FooterCell>
                            <FooterCell></FooterCell>
                        </FooterRow>
                    </TableFooter>
                </ServicesTable>
            </ServicesSection>

            {/* Add Service Modal */}
            <AddServiceModal
                isOpen={showAddServiceModal}
                onClose={() => setShowAddServiceModal(false)}
                onAddServices={handleSaveServices}
                availableServices={availableServices}
                customerPhone={protocol.phone}
            />

            <EditPricesModal
                isOpen={showEditPricesModal}
                onClose={() => setShowEditPricesModal(false)}
                onSave={handleSavePrices}
                services={protocol.selectedServices}
                protocolId={protocol.id}
            />

            {/* Delete Service Modal */}
            <DeleteServiceModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setServiceToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                serviceName={serviceToDelete?.name || ''}
                isDeleting={removingServiceId === serviceToDelete?.id}
            />
        </Container>
    );
};
import styled from 'styled-components';
import {theme} from '../../../../styles/theme';
import {DiscountType} from "../../../../features/reservations/api/reservationsApi";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    max-width: 100%;
`;

export const StatusSection = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.lg};
    box-shadow: ${theme.shadow.xs};
`;

export const StatusHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.md};
`;

export const StatusTitle = styled.h3`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

export const StatusProgress = styled.div`
    font-size: 11px;
    font-weight: 500;
    color: ${theme.text.tertiary};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.sm};
`;

export const StatusTimeline = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${theme.spacing.md};
`;

export const StatusStep = styled.div<{ $active: boolean; $completed: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xs};
    opacity: ${props => props.$active || props.$completed ? 1 : 0.4};
`;

export const StepIcon = styled.div<{ $active: boolean; $completed: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${props => {
        if (props.$completed) return brand.success;
        if (props.$active) return brand.primary;
        return brand.surfaceSubtle;
    }};
    color: ${props => {
        if (props.$completed || props.$active) return 'white';
        return brand.textMuted;
    }};
    border: 3px solid ${props => {
        if (props.$completed) return brand.success;
        if (props.$active) return brand.primary;
        return brand.border;
    }};
    font-size: 18px;
    transition: all 0.3s ease;
`;

export const StepLabel = styled.div`
    font-size: 10px;
    font-weight: 600;
    color: ${theme.text.secondary};
    text-align: center;
`;

export const StatusConnector = styled.div<{ $active: boolean }>`
    flex: 1;
    height: 2px;
    background: ${props => props.$active ? theme.success : theme.border};
    margin: 0 ${theme.spacing.sm};
    transition: background 0.3s ease;
`;

export const AlertBanner = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.warningBg};
    border: 1px solid rgba(217, 119, 6, 0.3);
    border-radius: ${theme.radius.sm};
    color: ${theme.warning};
    font-size: 11px;
    font-weight: 500;
`;

export const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.lg};

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

export const VehicleCard = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    overflow: hidden;
    box-shadow: ${theme.shadow.xs};
`;

export const ClientCard = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    overflow: hidden;
    box-shadow: ${theme.shadow.xs};
`;

export const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.borderLight};
`;

export const HeaderIcon = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${theme.radius.md};
    font-size: 14px;
`;

export const HeaderContent = styled.div`
    flex: 1;
`;

export const CardTitle = styled.h3`
    font-size: 13px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 2px 0;
`;

export const CardSubtitle = styled.div`
    font-size: 11px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

export const ClientTierBadge = styled.div<{ $color: string; $bgColor: string }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: 2px ${theme.spacing.xs};
    background: ${props => props.$bgColor};
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    border-radius: ${theme.radius.sm};
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    width: fit-content;

    svg {
        font-size: 8px;
    }
`;

export const VehicleMainInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.borderLight};
`;

export const VehicleIdentity = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

export const VehicleModel = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: ${theme.text.primary};
`;

export const VehicleYear = styled.div`
    font-size: 11px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

export const LicensePlateContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const LicensePlate = styled.div`
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 2px solid #2c3e50;
    border-radius: ${theme.radius.sm};
    box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
    overflow: hidden;
    font-family: 'Courier New', 'Monaco', monospace;
    font-weight: 700;
    height: 36px;
`;

export const PlateFlag = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #003399 0%, #004da6 100%);
    color: #ffd700;
    padding: 0 ${theme.spacing.xs};
    height: 100%;
    min-width: 24px;
    position: relative;
`;

export const EUStars = styled.div`
    font-size: 5px;
    line-height: 1;
    text-align: center;
    margin-bottom: 1px;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
`;

export const CountryCode = styled.div`
    font-size: 7px;
    font-weight: 800;
    letter-spacing: 0.3px;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
`;

export const PlateNumber = styled.div`
    padding: 0 ${theme.spacing.md};
    color: #2c3e50;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-align: center;
    min-width: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
`;

export const VehicleDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
`;

export const DetailItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

export const DetailIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: ${theme.surfaceAlt};
    color: ${theme.text.tertiary};
    border-radius: ${theme.radius.sm};
    font-size: 11px;
`;

export const DetailContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
`;

export const DetailLabel = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

export const DetailValue = styled.div<{ $status?: string }>`
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.$status === 'provided' ? theme.success : theme.text.primary};
`;

export const ClientMainInfo = styled.div`
    padding: ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.borderLight};
`;

export const ClientName = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
`;

export const CompanyName = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 11px;
    color: ${theme.text.tertiary};
    font-weight: 500;

    svg {
        font-size: 10px;
    }
`;

export const BusinessMetrics = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.borderLight};
`;

export const MetricCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${theme.spacing.sm};
`;

export const MetricIcon = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${theme.radius.md};
    font-size: 12px;
`;

export const MetricContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export const MetricValue = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: ${theme.text.primary};
`;

export const MetricLabel = styled.div`
    font-size: 9px;
    color: ${theme.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

export const ContactSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.borderLight};
`;

export const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

export const ContactIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: ${theme.text.muted};
    font-size: 10px;
`;

export const ContactValue = styled.div`
    font-size: 11px;
    color: ${theme.text.secondary};
    font-weight: 500;
    flex: 1;
`;

export const AdditionalInfoSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

export const AdditionalInfoGrid = styled.div<{ $fullWidth: boolean }>`
    display: grid;
    grid-template-columns: ${props => props.$fullWidth ? '1fr' : '1fr 1fr'};
    gap: ${theme.spacing.lg};

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

export const NotesCard = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    overflow: hidden;
    box-shadow: ${theme.shadow.xs};
`;

export const DeliveryPersonCard = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    overflow: hidden;
    box-shadow: ${theme.shadow.xs};
`;

export const NotesContent = styled.div`
    padding: ${theme.spacing.lg};
`;

export const NotesText = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
    line-height: 1.5;
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.md};
    border-radius: ${theme.radius.sm};
    border-left: 3px solid #8b5cf6;
    font-style: italic;
`;

export const DeliveryPersonContent = styled.div`
    padding: ${theme.spacing.lg};
`;

export const DeliveryPersonInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

export const PersonName = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: ${theme.text.primary};
`;

export const PersonContact = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 11px;
    color: ${theme.text.secondary};
    font-weight: 500;

    svg {
        font-size: 10px;
        color: ${theme.text.muted};
    }
`;

export const ServicesSection = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    box-shadow: ${theme.shadow.xs};
    overflow: hidden;
`;

export const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.borderLight};
`;

export const SectionTitle = styled.h3`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

export const SectionStats = styled.div`
    font-size: 11px;
    color: ${theme.text.tertiary};
    font-weight: 500;
    margin-top: 2px;
`;

export const HeaderActions = styled.div`
    display: flex;
    gap: ${theme.spacing.xs};
    align-items: center;
`;

export const EditPricesButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.primaryGhost};
    color: ${theme.primary};
    border: 1px solid ${theme.primary}40;
    border-radius: ${theme.radius.sm};
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primary}20;
        border-color: ${theme.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }

    svg {
        font-size: 10px;
    }

    @media (max-width: 768px) {
        span {
            display: none;
        }
        padding: ${theme.spacing.sm};
    }
`;

export const AddServiceButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.primary};
    color: white;
    border: none;
    border-radius: ${theme.radius.sm};
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: 10px;
    }
`;

export const ServicesTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

export const TableHeader = styled.thead``;

export const HeaderCell = styled.th`
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    text-align: left;
    font-size: 10px;
    font-weight: 600;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.3px;
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.borderLight};
`;

export const TableBody = styled.tbody``;

export const ServiceRow = styled.tr<{ $pending?: boolean }>`
    border-bottom: 1px solid ${theme.borderLight};
    transition: background-color 0.2s ease;

    ${props => props.$pending && `
        background: ${theme.infoBg};
    `}

    &:hover {
        background: ${theme.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

export const ServiceCell = styled.td`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    vertical-align: top;
`;

export const PriceCell = styled.td`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    vertical-align: top;
`;

export const DiscountCell = styled.td`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    vertical-align: top;
`;

export const FinalPriceCell = styled.td`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    vertical-align: top;
`;

export const StatusCell = styled.td`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    vertical-align: top;
`;

export const ActionsCell = styled.td`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    vertical-align: top;
`;

export const ServiceName = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.primary};
    line-height: 1.3;
`;

export const ServiceNote = styled.div`
    font-size: 10px;
    color: ${theme.text.muted};
    font-style: italic;
    margin-top: ${theme.spacing.xs};
    line-height: 1.3;
`;

export const PriceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export const PriceRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

export const PriceLabel = styled.span`
    font-size: 9px;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.3px;
    background: ${theme.surfaceElevated};
    padding: 1px 4px;
    border-radius: ${theme.radius.sm};
`;

export const PriceAmount = styled.div<{ $secondary?: boolean }>`
    font-size: ${props => props.$secondary ? '10px' : '11px'};
    font-weight: ${props => props.$secondary ? 500 : 600};
    color: ${props => props.$secondary ? theme.text.secondary : theme.text.primary};
`;

export const DiscountInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export const DiscountAmount = styled.div`
    font-size: 11px;
    font-weight: 600;
    color: ${theme.error};
`;

export const SavingsAmount = styled.div`
    font-size: 10px;
    color: ${theme.success};
    font-weight: 500;
`;

export const NoDiscount = styled.div`
    font-size: 11px;
    color: ${theme.text.muted};
    font-weight: 300;
`;

export const FinalPrice = styled.div<{ $secondary?: boolean }>`
    font-size: ${props => props.$secondary ? '11px' : '12px'};
    font-weight: ${props => props.$secondary ? 600 : 700};
    color: ${props => props.$secondary ? theme.text.secondary : theme.primary};
`;

export const ServiceStatus = styled.div<{ $status: string }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: 2px ${theme.spacing.xs};
    background: ${props => props.$status === 'PENDING' ? theme.infoBg : theme.successBg};
    color: ${props => props.$status === 'PENDING' ? theme.info : theme.success};
    border: 1px solid ${props => props.$status === 'PENDING' ? `${theme.info}30` : `${theme.success}30`};
    border-radius: ${theme.radius.sm};
    font-size: 10px;
    font-weight: 500;
    width: fit-content;

    span {
        font-size: 9px;
    }

    svg {
        font-size: 8px;
    }
`;

export const ServiceActions = styled.div`
    display: flex;
    gap: ${theme.spacing.xs};
    opacity: 0.7;
    transition: opacity 0.2s ease;

    ${ServiceRow}:hover & {
        opacity: 1;
    }
`;

export const ActionIcon = styled.button<{ $type: 'notify' | 'delete'; disabled?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: ${theme.radius.sm};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    font-size: 9px;
    opacity: ${props => props.disabled ? 0.5 : 1};

    ${props => {
        switch (props.$type) {
            case 'notify':
                return `
                    background: ${theme.primary}20;
                    color: ${theme.primary};
                    &:hover:not(:disabled) {
                        background: ${theme.primary};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
            case 'delete':
                return `
                    background: ${theme.error}20;
                    color: ${theme.error};
                    &:hover:not(:disabled) {
                        background: ${theme.error};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        }
    }}

    &:disabled {
        transform: none;
    }
`;

export const TableFooter = styled.tfoot``;

export const FooterRow = styled.tr`
    background: ${theme.surfaceElevated};
    border-top: 2px solid ${theme.border};
`;

export const FooterCell = styled.td`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    font-weight: 600;
`;

export const TotalLabel = styled.div`
    font-size: 11px;
    font-weight: 700;
    color: ${theme.text.primary};
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

export const TotalAmount = styled.div<{ $secondary?: boolean }>`
    font-size: ${props => props.$secondary ? '10px' : '11px'};
    font-weight: ${props => props.$secondary ? 500 : 600};
    color: ${props => props.$secondary ? theme.text.secondary : theme.text.primary};
`;

export const FinalTotalAmount = styled.div<{ $secondary?: boolean }>`
    font-size: ${props => props.$secondary ? '12px' : '14px'};
    font-weight: ${props => props.$secondary ? 600 : 800};
    color: ${props => props.$secondary ? theme.text.secondary : theme.primary};
`;

export const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxl};
    gap: ${theme.spacing.md};
    color: ${theme.text.tertiary};
`;

export const LoadingSpinner = styled.div`
    width: 32px;
    height: 32px;
    border: 2px solid ${theme.borderLight};
    border-top: 2px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const MiniSpinner = styled.div`
    width: 10px;
    height: 10px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const ErrorState = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    color: ${theme.error};
    font-size: 11px;
    font-weight: 500;
    background: ${theme.errorBg};
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: ${theme.radius.sm};
    margin: ${theme.spacing.md} ${theme.spacing.lg};
`;

export default ProtocolSummary;