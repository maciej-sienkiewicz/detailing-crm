import React, {useState} from 'react';
import styled from 'styled-components';
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
import {servicesApi} from "../../../../api/servicesApi";
import {visitsApi} from "../../../../api/visitsApiNew";
import {
    CarReceptionProtocol,
    ClientExpanded,
    ClientStatistics,
    DiscountType,
    ProtocolStatus,
    SelectedService,
    ServiceApprovalStatus
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
    const [availableServices, setAvailableServices] = useState<Array<{ id: string; name: string; price: number }>>([]);
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
            console.log('Prices updated successfully:', updatedServices);

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
            console.log('🗑️ Removing service via API:', serviceToDelete);

            // Call the API to remove service from visit
            const result = await visitsApi.removeServiceFromVisit(
                protocol.id,
                serviceToDelete.id,
                'Usunięto przez użytkownika'
            );

            if (result.success && result.data) {
                console.log('✅ Service removed successfully via API');

                // Transform API response to match protocol format
                const updatedServices = result.data.services?.map(service => ({
                    id: service.id,
                    name: service.name,
                    price: service.basePrice,
                    discountType: service.discount?.type as DiscountType || DiscountType.PERCENTAGE,
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

                // Call parent update handler
                if (onProtocolUpdate) {
                    onProtocolUpdate(updatedProtocol);
                }

                console.log('✅ Service removed and protocol updated');

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
                console.log('Fetching client with ID:', clientId);

                const [matchedClient, matchedClientStats] = await Promise.all([
                    clientApi.fetchClientById(clientId),
                    clientApi.fetchClientStatsById(clientId)
                ]);

                if (matchedClient) {
                    console.log('Client found:', matchedClient);
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
                const mappedServices = services.map(service => ({
                    id: service.id,
                    name: service.name,
                    price: service.price
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
            price: number;
            discountType?: DiscountType;
            discountValue?: number;
            finalPrice: number;
            note?: string;
        }>
    }) => {
        try {
            setAddingServices(true);
            console.log('🔧 Adding services via API:', data.services);

            // Call the API to add services to visit
            const result = await visitsApi.addServicesToVisit(protocol.id, data.services);

            if (result.success && result.data) {
                console.log('✅ Services added successfully via API');

                // Transform API response to match protocol format
                const updatedServices = result.data.services?.map(service => ({
                    id: service.id,
                    name: service.name,
                    price: service.basePrice,
                    discountType: service.discount?.type as DiscountType || DiscountType.PERCENTAGE,
                    discountValue: service.discount?.value || 0,
                    finalPrice: service.finalPrice,
                    note: service.note || '',
                    approvalStatus: service.approvalStatus as ServiceApprovalStatus || ServiceApprovalStatus.PENDING
                })) || [];

                // Update protocol with services from API response
                const updatedProtocol: CarReceptionProtocol = {
                    ...protocol,
                    selectedServices: [...protocol.selectedServices, ...updatedServices]
                };

                // Call parent update handler
                if (onProtocolUpdate) {
                    onProtocolUpdate(updatedProtocol);
                }

                setShowAddServiceModal(false);

                // Show success message
                console.log('✅ Services added and protocol updated:', updatedServices);

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

    // Business calculations
    const totalRevenue = protocol.selectedServices.reduce((sum, s) => sum + s.finalPrice, 0);
    const totalDiscount = protocol.selectedServices.reduce((sum, s) => sum + (s.price - s.finalPrice), 0);
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

    const clientTier = clientStats ? getClientTier(clientStats.totalRevenue) : getClientTier(0);

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
                    <StatusStep $active={true} $completed={protocol.status !== 'SCHEDULED'}>
                        <StepIcon $active={protocol.status === 'SCHEDULED'} $completed={protocol.status !== 'SCHEDULED'}>
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
                                        <MetricValue>{formatCurrency(clientStats.totalRevenue)}</MetricValue>
                                        <MetricLabel>Łączne przychody</MetricLabel>
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
                        <HeaderCell style={{width: '40%'}}>Usługa</HeaderCell>
                        <HeaderCell style={{width: '15%'}}>Cena bazowa</HeaderCell>
                        <HeaderCell style={{width: '15%'}}>Rabat</HeaderCell>
                        <HeaderCell style={{width: '15%'}}>Cena końcowa</HeaderCell>
                        <HeaderCell style={{width: '10%'}}>Status</HeaderCell>
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
                                    <PriceAmount>{service.price.toFixed(2)} zł</PriceAmount>
                                </PriceCell>

                                <DiscountCell>
                                    {service.discountValue > 0 ? (
                                        <DiscountInfo>
                                            <DiscountAmount>
                                                -{service.discountValue.toFixed(2)}
                                                {service.discountType === DiscountType.PERCENTAGE ? '%' : 'zł'}
                                            </DiscountAmount>
                                            <SavingsAmount>(-{(service.price - service.finalPrice).toFixed(2)} zł)</SavingsAmount>
                                        </DiscountInfo>
                                    ) : (
                                        <NoDiscount>—</NoDiscount>
                                    )}
                                </DiscountCell>

                                <FinalPriceCell>
                                    <FinalPrice>{service.finalPrice.toFixed(2)} zł</FinalPrice>
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
                                <TotalAmount>{protocol.selectedServices.reduce((sum, s) => sum + s.price, 0).toFixed(2)} zł</TotalAmount>
                            </FooterCell>
                            <FooterCell>
                                <TotalAmount>-{totalDiscount.toFixed(2)} zł</TotalAmount>
                            </FooterCell>
                            <FooterCell>
                                <FinalTotalAmount>{totalRevenue.toFixed(2)} zł</FinalTotalAmount>
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

// Professional Styled Components
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brand.space.xxxl};
    max-width: 100%;
`;

const StatusSection = styled.div`
    background: ${brand.surface};
    border: 1px solid ${brand.border};
    border-radius: ${brand.radius.xl};
    padding: ${brand.space.xxl};
    box-shadow: ${brand.shadow.soft};
`;

const StatusHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${brand.space.xl};
`;

const StatusTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brand.textPrimary};
    margin: 0;
`;

const StatusProgress = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${brand.textTertiary};
    padding: ${brand.space.sm} ${brand.space.md};
    background: ${brand.surfaceSubtle};
    border-radius: ${brand.radius.md};
`;

const StatusTimeline = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${brand.space.xl};
`;

const StatusStep = styled.div<{ $active: boolean; $completed: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${brand.space.sm};
    opacity: ${props => props.$active || props.$completed ? 1 : 0.4};
`;

const StepIcon = styled.div<{ $active: boolean; $completed: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
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

const StepLabel = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${brand.textSecondary};
    text-align: center;
`;

const StatusConnector = styled.div<{ $active: boolean }>`
    flex: 1;
    height: 3px;
    background: ${props => props.$active ? brand.success : brand.border};
    margin: 0 ${brand.space.lg};
    transition: background 0.3s ease;
`;

const AlertBanner = styled.div`
    display: flex;
    align-items: center;
    gap: ${brand.space.md};
    padding: ${brand.space.md} ${brand.space.lg};
    background: ${brand.warningBg};
    border: 1px solid rgba(217, 119, 6, 0.3);
    border-radius: ${brand.radius.md};
    color: ${brand.warning};
    font-size: 14px;
    font-weight: 500;
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${brand.space.xxxl};

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const VehicleCard = styled.div`
    background: ${brand.surface};
    border: 1px solid ${brand.border};
    border-radius: ${brand.radius.xl};
    overflow: hidden;
    box-shadow: ${brand.shadow.soft};
`;

const ClientCard = styled.div`
    background: ${brand.surface};
    border: 1px solid ${brand.border};
    border-radius: ${brand.radius.xl};
    overflow: hidden;
    box-shadow: ${brand.shadow.soft};
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brand.space.lg};
    padding: ${brand.space.xl} ${brand.space.xxl};
    background: ${brand.surfaceElevated};
    border-bottom: 1px solid ${brand.borderLight};
`;

const HeaderIcon = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${brand.radius.lg};
    font-size: 20px;
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const CardTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${brand.textPrimary};
    margin: 0 0 ${brand.space.xs} 0;
`;

const CardSubtitle = styled.div`
    font-size: 13px;
    color: ${brand.textTertiary};
    font-weight: 500;
`;

const ClientTierBadge = styled.div<{ $color: string; $bgColor: string }>`
    display: flex;
    align-items: center;
    gap: ${brand.space.sm};
    padding: ${brand.space.xs} ${brand.space.sm};
    background: ${props => props.$bgColor};
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    border-radius: ${brand.radius.md};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: fit-content;

    svg {
        font-size: 10px;
    }
`;

const VehicleMainInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brand.space.xxl};
    border-bottom: 1px solid ${brand.borderLight};
`;

const VehicleIdentity = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brand.space.xs};
`;

const VehicleModel = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${brand.textPrimary};
`;

const VehicleYear = styled.div`
    font-size: 14px;
    color: ${brand.textTertiary};
    font-weight: 500;
`;

/* ENHANCED LICENSE PLATE - Professional European Design */
const LicensePlateContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const LicensePlate = styled.div`
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 2px solid #2c3e50;
    border-radius: ${brand.radius.sm};
    box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
    overflow: hidden;
    font-family: 'Courier New', 'Monaco', monospace;
    font-weight: 700;
    height: 52px;
`;

const PlateFlag = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #003399 0%, #004da6 100%);
    color: #ffd700;
    padding: 0 ${brand.space.sm};
    height: 100%;
    min-width: 32px;
    position: relative;
`;

const EUStars = styled.div`
    font-size: 6px;
    line-height: 1;
    text-align: center;
    margin-bottom: 1px;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
`;

const CountryCode = styled.div`
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
`;

const PlateNumber = styled.div`
    padding: 0 ${brand.space.lg};
    color: #2c3e50;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 2px;
    text-align: center;
    min-width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
`;

const VehicleDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brand.space.lg};
    padding: ${brand.space.xxl};
`;

const DetailItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brand.space.md};
`;

const DetailIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brand.surfaceSubtle};
    color: ${brand.textTertiary};
    border-radius: ${brand.radius.md};
    font-size: 14px;
`;

const DetailContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brand.space.xs};
    flex: 1;
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: ${brand.textMuted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DetailValue = styled.div<{ $status?: string }>`
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$status === 'provided' ? brand.success : brand.textPrimary};
`;

/* CLIENT CARD COMPONENTS */
const ClientMainInfo = styled.div`
    padding: ${brand.space.xxl};
    border-bottom: 1px solid ${brand.borderLight};
`;

const ClientName = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${brand.textPrimary};
    margin-bottom: ${brand.space.sm};
`;

const CompanyName = styled.div`
    display: flex;
    align-items: center;
    gap: ${brand.space.sm};
    font-size: 14px;
    color: ${brand.textTertiary};
    font-weight: 500;

    svg {
        font-size: 12px;
    }
`;

const BusinessMetrics = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${brand.space.lg};
    padding: ${brand.space.xl} ${brand.space.xxl};
    border-bottom: 1px solid ${brand.borderLight};
`;

const MetricCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${brand.space.md};
`;

const MetricIcon = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${brand.radius.lg};
    font-size: 16px;
`;

const MetricContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brand.space.xs};
`;

const MetricValue = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${brand.textPrimary};
`;

const MetricLabel = styled.div`
    font-size: 11px;
    color: ${brand.textMuted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ContactSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brand.space.lg};
    padding: ${brand.space.xl} ${brand.space.xxl};
    border-bottom: 1px solid ${brand.borderLight};
`;

const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brand.space.md};
`;

const ContactIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: ${brand.textMuted};
    font-size: 12px;
`;

const ContactValue = styled.div`
    font-size: 14px;
    color: ${brand.textSecondary};
    font-weight: 500;
    flex: 1;
`;

// NEW STYLED COMPONENTS FOR ADDITIONAL INFO SECTION
const AdditionalInfoSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brand.space.lg};
`;

const AdditionalInfoGrid = styled.div<{ $fullWidth: boolean }>`
    display: grid;
    grid-template-columns: ${props => props.$fullWidth ? '1fr' : '1fr 1fr'};
    gap: ${brand.space.xxxl};

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const NotesCard = styled.div`
    background: ${brand.surface};
    border: 1px solid ${brand.border};
    border-radius: ${brand.radius.xl};
    overflow: hidden;
    box-shadow: ${brand.shadow.soft};
`;

const DeliveryPersonCard = styled.div`
    background: ${brand.surface};
    border: 1px solid ${brand.border};
    border-radius: ${brand.radius.xl};
    overflow: hidden;
    box-shadow: ${brand.shadow.soft};
`;

const NotesContent = styled.div`
    padding: ${brand.space.xxl};
`;

const NotesText = styled.div`
    font-size: 15px;
    color: ${brand.textSecondary};
    line-height: 1.6;
    background: ${brand.surfaceSubtle};
    padding: ${brand.space.lg};
    border-radius: ${brand.radius.md};
    border-left: 4px solid #8b5cf6;
    font-style: italic;
`;

const DeliveryPersonContent = styled.div`
    padding: ${brand.space.xxl};
`;

const DeliveryPersonInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brand.space.md};
`;

const PersonName = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${brand.textPrimary};
`;

const PersonContact = styled.div`
    display: flex;
    align-items: center;
    gap: ${brand.space.sm};
    font-size: 14px;
    color: ${brand.textSecondary};
    font-weight: 500;

    svg {
        font-size: 12px;
        color: ${brand.textMuted};
    }
`;

/* SERVICES SECTION */
const ServicesSection = styled.div`
    background: ${brand.surface};
    border: 1px solid ${brand.border};
    border-radius: ${brand.radius.xl};
    box-shadow: ${brand.shadow.soft};
    overflow: hidden;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brand.space.xl} ${brand.space.xxl};
    background: ${brand.surfaceElevated};
    border-bottom: 1px solid ${brand.borderLight};
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brand.textPrimary};
    margin: 0;
`;

const SectionStats = styled.div`
    font-size: 13px;
    color: ${brand.textTertiary};
    font-weight: 500;
    margin-top: ${brand.space.xs};
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brand.space.sm};
    align-items: center;
`;

const EditPricesButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brand.space.sm};
    padding: ${brand.space.md} ${brand.space.lg};
    background: ${brand.primaryGhost};
    color: ${brand.primary};
    border: 2px solid ${brand.primary}40;
    border-radius: ${brand.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brand.primary}20;
        border-color: ${brand.primary};
        transform: translateY(-1px);
        box-shadow: ${brand.shadow.moderate};
    }

    svg {
        font-size: 12px;
    }

    @media (max-width: 768px) {
        span {
            display: none;
        }
        
        padding: ${brand.space.md};
    }
`;

const AddServiceButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brand.space.sm};
   padding: ${brand.space.md} ${brand.space.lg};
   background: ${brand.primary};
   color: white;
   border: none;
   border-radius: ${brand.radius.md};
   font-size: 14px;
   font-weight: 600;
   cursor: pointer;
   transition: all 0.2s ease;

   &:hover:not(:disabled) {
       background: ${brand.primaryDark};
       transform: translateY(-1px);
       box-shadow: ${brand.shadow.moderate};
   }

   &:disabled {
       opacity: 0.6;
       cursor: not-allowed;
       transform: none;
   }

   svg {
       font-size: 12px;
   }
`;

const ServicesTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.thead``;

const HeaderCell = styled.th`
    padding: ${brand.space.lg} ${brand.space.xxl};
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: ${brand.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${brand.surfaceElevated};
    border-bottom: 1px solid ${brand.borderLight};
`;

const TableBody = styled.tbody``;

const ServiceRow = styled.tr<{ $pending?: boolean }>`
    border-bottom: 1px solid ${brand.borderLight};
    transition: background-color 0.2s ease;

    ${props => props.$pending && `
       background: ${brand.pendingBg};
   `}

    &:hover {
        background: ${brand.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const ServiceCell = styled.td`
    padding: ${brand.space.lg} ${brand.space.xxl};
    vertical-align: top;
`;

const PriceCell = styled.td`
    padding: ${brand.space.lg} ${brand.space.xxl};
    vertical-align: top;
`;

const DiscountCell = styled.td`
    padding: ${brand.space.lg} ${brand.space.xxl};
    vertical-align: top;
`;

const FinalPriceCell = styled.td`
   padding: ${brand.space.lg} ${brand.space.xxl};
   vertical-align: top;
`;

const StatusCell = styled.td`
    padding: ${brand.space.lg} ${brand.space.xxl};
    vertical-align: top;
`;

const ActionsCell = styled.td`
    padding: ${brand.space.lg} ${brand.space.xxl};
    vertical-align: top;
`;

const ServiceName = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${brand.textPrimary};
    line-height: 1.4;
`;

const ServiceNote = styled.div`
    font-size: 13px;
    color: ${brand.textMuted};
    font-style: italic;
    margin-top: ${brand.space.xs};
    line-height: 1.4;
`;

const PriceAmount = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${brand.textPrimary};
`;

const DiscountInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const DiscountAmount = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brand.error};
`;

const SavingsAmount = styled.div`
    font-size: 12px;
    color: ${brand.success};
    font-weight: 500;
`;

const NoDiscount = styled.div`
    font-size: 15px;
    color: ${brand.textMuted};
    font-weight: 300;
`;

const FinalPrice = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brand.primary};
`;

const ServiceStatus = styled.div<{ $status: string }>`
    display: flex;
    align-items: center;
    gap: ${brand.space.xs};
    padding: ${brand.space.xs} ${brand.space.sm};
    background: ${props => props.$status === 'PENDING' ? brand.pendingBg : brand.successBg};
    color: ${props => props.$status === 'PENDING' ? brand.pending : brand.success};
    border: 1px solid ${props => props.$status === 'PENDING' ? `${brand.pending}30` : `${brand.success}30`};
    border-radius: ${brand.radius.sm};
    font-size: 12px;
    font-weight: 500;
    width: fit-content;

    span {
        font-size: 11px;
    }

    svg {
        font-size: 10px;
    }
`;

const ServiceActions = styled.div`
    display: flex;
    gap: ${brand.space.xs};
    opacity: 0.7;
    transition: opacity 0.2s ease;

    ${ServiceRow}:hover & {
        opacity: 1;
    }
`;

const ActionIcon = styled.button<{ $type: 'notify' | 'delete'; disabled?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: ${brand.radius.sm};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    font-size: 11px;
    opacity: ${props => props.disabled ? 0.5 : 1};

    ${props => {
    switch (props.$type) {
        case 'notify':
            return `
                   background: ${brand.primary}20;
                   color: ${brand.primary};
                   &:hover:not(:disabled) {
                       background: ${brand.primary};
                       color: white;
                       transform: translateY(-1px);
                   }
               `;
        case 'delete':
            return `
                   background: ${brand.error}20;
                   color: ${brand.error};
                   &:hover:not(:disabled) {
                       background: ${brand.error};
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

const TableFooter = styled.tfoot``;

const FooterRow = styled.tr`
    background: ${brand.surfaceElevated};
    border-top: 2px solid ${brand.border};
`;

const FooterCell = styled.td`
    padding: ${brand.space.lg} ${brand.space.xxl};
    font-weight: 600;
`;

const TotalLabel = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: ${brand.textPrimary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TotalAmount = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${brand.textPrimary};
`;

const FinalTotalAmount = styled.div`
    font-size: 18px;
    font-weight: 800;
    color: ${brand.primary};
`;

// Add missing styled components
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brand.space.xxxl};
    gap: ${brand.space.lg};
    color: ${brand.textTertiary};
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid ${brand.borderLight};
    border-top: 3px solid ${brand.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Mini spinner dla akcji
const MiniSpinner = styled.div`
    width: 12px;
    height: 12px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const ErrorState = styled.div`
   display: flex;
   align-items: center;
   gap: ${brand.space.md};
   padding: ${brand.space.xl} ${brand.space.xxl};
   color: ${brand.error};
   font-size: 14px;
   font-weight: 500;
   background: ${brand.errorBg};
   border: 1px solid rgba(220, 38, 38, 0.3);
   border-radius: ${brand.radius.md};
   margin: ${brand.space.xl} ${brand.space.xxl};
`;

export default ProtocolSummary;