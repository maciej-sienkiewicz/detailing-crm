import React, {useState} from 'react';
import styled from 'styled-components';
import {
    FaBell,
    FaCarSide,
    FaPlus,
    FaTimesCircle,
    FaTrash,
    FaClock,
    FaCheckCircle,
    FaKey,
    FaFileAlt,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaBuilding,
    FaIdCard,
    FaExclamationTriangle,
    FaChartLine,
    FaTachometerAlt,
    FaCalendarCheck,
    FaTools,
    FaCarCrash
} from 'react-icons/fa';
import {
    CarReceptionProtocol,
    DiscountType,
    ProtocolStatus,
    ProtocolStatusLabels,
    SelectedService,
    ServiceApprovalStatus
} from '../../../../types';
import {protocolsApi} from '../../../../api/protocolsApi';
import AddServiceModal from "../../shared/modals/AddServiceModal";
import {servicesApi} from "../../../../api/servicesApi";

// Executive Design System
const executive = {
    // Premium Brand Colors
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: '#1d4ed8',

    // Executive Surface Colors
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',

    // Professional Typography
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textSuccess: '#059669',
    textWarning: '#d97706',
    textError: '#dc2626',

    // Executive Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    // Status Colors
    success: '#059669',
    successBg: '#ecfdf5',
    warning: '#d97706',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorBg: '#fef2f2',
    pending: '#0891b2',
    pendingBg: '#f0f9ff',

    // Executive Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px'
    },

    // Professional Radius
    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px'
    },

    // Executive Shadows
    shadowCard: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    shadowHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
};

interface ProtocolSummaryProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate?: (updatedProtocol: CarReceptionProtocol) => void;
}

const DEFAULT_VAT_RATE = 23;

const ProtocolSummary: React.FC<ProtocolSummaryProps> = ({ protocol, onProtocolUpdate }) => {
    const [showAddServiceModal, setShowAddServiceModal] = useState(false);
    const [availableServices, setAvailableServices] = useState<Array<{id: string; name: string; price: number;}>>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenAddServiceModal = async () => {
        setIsLoading(true);
        try {
            const services = await servicesApi.fetchServices();
            setAvailableServices(services);
        } catch (error) {
            console.error('Błąd podczas pobierania listy usług', error);
        } finally {
            setIsLoading(false);
            setShowAddServiceModal(true);
        }
    };

    const handleCancelService = async (serviceId: string) => {
        if (!window.confirm('Czy na pewno chcesz anulować tę usługę?')) return;

        const updatedServices = protocol.selectedServices.filter(service => service.id !== serviceId);
        const updatedProtocol = {
            ...protocol,
            selectedServices: updatedServices,
            updatedAt: new Date().toISOString()
        };

        try {
            const savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);
            if (onProtocolUpdate) {
                onProtocolUpdate(savedProtocol);
            }
        } catch (error) {
            console.error('Błąd podczas anulowania usługi', error);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę usługę?')) return;

        const updatedServices = protocol.selectedServices.filter(service => service.id !== serviceId);
        const updatedProtocol = {
            ...protocol,
            selectedServices: updatedServices,
            updatedAt: new Date().toISOString()
        };

        try {
            const savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);
            if (onProtocolUpdate) {
                onProtocolUpdate(savedProtocol);
            }
        } catch (error) {
            console.error('Błąd podczas usuwania usługi', error);
        }
    };

    const handleResendNotification = async (serviceId: string) => {
        const service = protocol.selectedServices.find(s => s.id === serviceId);
        if (!service) return;
        alert(`Ponowne wysłanie SMS z prośbą o potwierdzenie usługi: ${service.name}`);
    };

    const handleAddServices = async (servicesData: {
        services: Array<{
            id: string;
            name: string;
            price: number;
            discountType?: DiscountType;
            discountValue?: number;
            finalPrice: number;
            note?: string
        }>;
    }) => {
        if (servicesData.services.length === 0) return;

        try {
            setIsLoading(true);
            const now = new Date().toISOString();

            const newServices: SelectedService[] = servicesData.services.map(serviceData => {
                const newService: SelectedService = {
                    id: `service_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    name: serviceData.name,
                    price: serviceData.price,
                    discountType: serviceData.discountType || 'PERCENTAGE',
                    discountValue: serviceData.discountValue !== undefined ? serviceData.discountValue : 0,
                    finalPrice: serviceData.finalPrice,
                    approvalStatus: ServiceApprovalStatus.PENDING,
                    addedAt: now,
                    confirmationMessage: `Wysłano SMS z prośbą o potwierdzenie usługi`
                };

                if (serviceData.note) {
                    newService.note = serviceData.note;
                }

                return newService;
            });

            const updatedServices = [...protocol.selectedServices, ...newServices];
            const updatedProtocol = {
                ...protocol,
                selectedServices: updatedServices,
                updatedAt: now
            };

            const savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);
            onProtocolUpdate(savedProtocol);
            setShowAddServiceModal(false);

            alert(`Dodano ${newServices.length} ${newServices.length === 1 ? 'usługę' : newServices.length < 5 ? 'usługi' : 'usług'}. SMS zostanie wysłany na numer ${protocol.phone}.`);
        } catch (error) {
            console.error('Błąd podczas dodawania nowych usług:', error);
            alert('Wystąpił błąd podczas dodawania usług. Spróbuj ponownie.');
        } finally {
            setIsLoading(false);
        }
    };

    // Business Logic Calculations
    const calculateNetPrice = (grossPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
        return grossPrice / (1 + vatRate / 100);
    };

    const calculateServicePrices = (service: SelectedService) => {
        const vatRate = DEFAULT_VAT_RATE;
        const baseGrossPrice = service.price;
        const baseNetPrice = calculateNetPrice(baseGrossPrice, vatRate);
        const finalGrossPrice = service.finalPrice;
        const finalNetPrice = calculateNetPrice(finalGrossPrice, vatRate);

        return {
            baseNetPrice,
            baseGrossPrice,
            finalNetPrice,
            finalGrossPrice
        };
    };

    const calculateBusinessMetrics = () => {
        const allServices = protocol.selectedServices;
        const approvedServices = allServices.filter(s => s.approvalStatus === ServiceApprovalStatus.APPROVED);
        const pendingServices = allServices.filter(s => s.approvalStatus === ServiceApprovalStatus.PENDING);

        let approvedTotal = 0;
        let pendingTotal = 0;
        let totalDiscount = 0;
        let totalBase = 0;

        approvedServices.forEach(service => {
            const prices = calculateServicePrices(service);
            approvedTotal += prices.finalGrossPrice;
            totalBase += prices.baseGrossPrice;
            totalDiscount += (prices.baseGrossPrice - prices.finalGrossPrice);
        });

        pendingServices.forEach(service => {
            pendingTotal += service.finalPrice;
        });

        const discountPercentage = totalBase > 0 ? (totalDiscount / totalBase) * 100 : 0;

        return {
            approvedTotal,
            pendingTotal,
            totalRevenue: approvedTotal + pendingTotal,
            totalDiscount,
            discountPercentage,
            servicesCount: allServices.length,
            pendingCount: pendingServices.length
        };
    };

    // Car Logo API Helper
    const getCarLogoUrl = (make: string): string => {
        // Using CarQueryAPI's logo service - free service for car logos
        const cleanMake = make.toLowerCase().replace(/\s+/g, '');
        return `https://cdn.imagin.studio/getImage?customer=hrjavascript-mastery&make=${cleanMake}&modelFamily=suv&zoomType=fullscreen&zoomLevel=1&angle=01&size=400`;
    };

    const metrics = calculateBusinessMetrics();

    return (
        <ExecutiveDashboard>
            {/* Status Timeline - Executive Style */}
            <StatusTimelineSection>
                <TimelineHeader>
                    <TimelineTitle>Status realizacji</TimelineTitle>
                    <StatusProgress>
                        {protocol.status === ProtocolStatus.SCHEDULED && '1/4'}
                        {protocol.status === ProtocolStatus.IN_PROGRESS && '2/4'}
                        {protocol.status === ProtocolStatus.READY_FOR_PICKUP && '3/4'}
                        {protocol.status === ProtocolStatus.COMPLETED && '4/4'}
                        {protocol.status === ProtocolStatus.CANCELLED && 'Anulowane'}
                    </StatusProgress>
                </TimelineHeader>
                <StatusSteps>
                    <StatusStep $active={protocol.status !== ProtocolStatus.CANCELLED} $completed={protocol.status !== ProtocolStatus.SCHEDULED}>
                        <StepIcon $active={protocol.status === ProtocolStatus.SCHEDULED} $completed={protocol.status !== ProtocolStatus.SCHEDULED && protocol.status !== ProtocolStatus.CANCELLED}>
                            <FaCalendarCheck />
                        </StepIcon>
                        <StepLabel>Zaplanowane</StepLabel>
                    </StatusStep>
                    <StatusConnector $active={protocol.status !== ProtocolStatus.SCHEDULED && protocol.status !== ProtocolStatus.CANCELLED} />
                    <StatusStep $active={protocol.status !== ProtocolStatus.CANCELLED} $completed={[ProtocolStatus.READY_FOR_PICKUP, ProtocolStatus.COMPLETED].includes(protocol.status)}>
                        <StepIcon $active={protocol.status === ProtocolStatus.IN_PROGRESS} $completed={[ProtocolStatus.READY_FOR_PICKUP, ProtocolStatus.COMPLETED].includes(protocol.status)}>
                            <FaTools />
                        </StepIcon>
                        <StepLabel>W realizacji</StepLabel>
                    </StatusStep>
                    <StatusConnector $active={[ProtocolStatus.READY_FOR_PICKUP, ProtocolStatus.COMPLETED].includes(protocol.status)} />
                    <StatusStep $active={protocol.status !== ProtocolStatus.CANCELLED} $completed={protocol.status === ProtocolStatus.COMPLETED}>
                        <StepIcon $active={protocol.status === ProtocolStatus.READY_FOR_PICKUP} $completed={protocol.status === ProtocolStatus.COMPLETED}>
                            <FaClock />
                        </StepIcon>
                        <StepLabel>Gotowe</StepLabel>
                    </StatusStep>
                    <StatusConnector $active={protocol.status === ProtocolStatus.COMPLETED} />
                    <StatusStep $active={protocol.status !== ProtocolStatus.CANCELLED} $completed={protocol.status === ProtocolStatus.COMPLETED}>
                        <StepIcon $active={protocol.status === ProtocolStatus.COMPLETED} $completed={protocol.status === ProtocolStatus.COMPLETED}>
                            <FaCarSide />
                        </StepIcon>
                        <StepLabel>Wydane</StepLabel>
                    </StatusStep>
                </StatusSteps>
                <CurrentStatusBadge $status={protocol.status}>
                    {ProtocolStatusLabels[protocol.status]}
                </CurrentStatusBadge>
            </StatusTimelineSection>

            {/* KPI Metrics Row */}
            <MetricsRow>
                <KPICard>
                    <KPIIcon $color={executive.success}>
                        <FaChartLine />
                    </KPIIcon>
                    <KPIContent>
                        <KPIValue>{metrics.totalRevenue.toFixed(0)} zł</KPIValue>
                        <KPILabel>Wartość zlecenia</KPILabel>
                    </KPIContent>
                </KPICard>

                <KPICard>
                    <KPIIcon $color={executive.primary}>
                        <FaFileAlt />
                    </KPIIcon>
                    <KPIContent>
                        <KPIValue>{metrics.servicesCount}</KPIValue>
                        <KPILabel>Usługi</KPILabel>
                    </KPIContent>
                </KPICard>

                {metrics.pendingCount > 0 && (
                    <KPICard $alert>
                        <KPIIcon $color={executive.warning}>
                            <FaExclamationTriangle />
                        </KPIIcon>
                        <KPIContent>
                            <KPIValue>{metrics.pendingCount}</KPIValue>
                            <KPILabel>Oczekuje</KPILabel>
                        </KPIContent>
                    </KPICard>
                )}

                {metrics.discountPercentage > 0 && (
                    <KPICard>
                        <KPIIcon $color={executive.error}>
                            <FaPercent />
                        </KPIIcon>
                        <KPIContent>
                            <KPIValue>{metrics.discountPercentage.toFixed(1)}%</KPIValue>
                            <KPILabel>Rabat</KPILabel>
                        </KPIContent>
                    </KPICard>
                )}
            </MetricsRow>

            {/* Vehicle & Client Info Row */}
            <InfoRow>
                <InfoCard>
                    <InfoCardHeader>
                        <InfoCardIcon><FaCarSide /></InfoCardIcon>
                        <InfoCardTitle>Pojazd</InfoCardTitle>
                    </InfoCardHeader>
                    <InfoCardContent>
                        <PrimaryInfo>
                            <VehicleModelWithLogo>
                                <CarLogo
                                    src={getCarLogoUrl(protocol.make)}
                                    alt={`${protocol.make} logo`}
                                    onError={(e) => {
                                        // Fallback if logo fails to load
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <VehicleModel>{protocol.make} {protocol.model}</VehicleModel>
                            </VehicleModelWithLogo>
                            <VehiclePlate>{protocol.licensePlate}</VehiclePlate>
                        </PrimaryInfo>
                        <SecondaryInfo>
                            <InfoPair>
                                <InfoLabel>Właściciel</InfoLabel>
                                <InfoValue>{protocol.ownerName}</InfoValue>
                            </InfoPair>
                            <InfoPair>
                                <InfoLabel>Rok</InfoLabel>
                                <InfoValue>{protocol.productionYear}</InfoValue>
                            </InfoPair>
                            <InfoPair>
                                <InfoLabel>Przebieg</InfoLabel>
                                <InfoValue>{protocol.mileage} km</InfoValue>
                            </InfoPair>
                        </SecondaryInfo>
                        <StatusRow>
                            <StatusIndicator $status={protocol.keysProvided ? 'completed' : 'pending'}>
                                {protocol.keysProvided ? <FaCheckCircle /> : <FaKey />}
                                <span>Kluczyki</span>
                            </StatusIndicator>
                            <StatusIndicator $status={protocol.documentsProvided ? 'completed' : 'pending'}>
                                {protocol.documentsProvided ? <FaCheckCircle /> : <FaFileAlt />}
                                <span>Dokumenty</span>
                            </StatusIndicator>
                        </StatusRow>
                    </InfoCardContent>
                </InfoCard>

                <InfoCard>
                    <InfoCardHeader>
                        <InfoCardIcon><FaUser /></InfoCardIcon>
                        <InfoCardTitle>Kontakt</InfoCardTitle>
                    </InfoCardHeader>
                    <InfoCardContent>
                        <ContactGrid>
                            <ContactItem>
                                <FaPhone />
                                <span>{protocol.phone}</span>
                            </ContactItem>
                            <ContactItem>
                                <FaEnvelope />
                                <span>{protocol.email}</span>
                            </ContactItem>
                            {protocol.companyName && (
                                <ContactItem>
                                    <FaBuilding />
                                    <span>{protocol.companyName}</span>
                                </ContactItem>
                            )}
                            {protocol.taxId && (
                                <ContactItem>
                                    <FaIdCard />
                                    <span>{protocol.taxId}</span>
                                </ContactItem>
                            )}
                        </ContactGrid>
                    </InfoCardContent>
                </InfoCard>
            </InfoRow>

            {/* Services Table */}
            <ServicesSection>
                <SectionHeader>
                    <SectionTitle>Wykaz usług</SectionTitle>
                    {protocol.status == ProtocolStatus.IN_PROGRESS && (
                        <AddServiceBtn onClick={handleOpenAddServiceModal} disabled={isLoading}>
                            <FaPlus />
                            <span>Dodaj usługę</span>
                        </AddServiceBtn>
                    )}
                </SectionHeader>

                {protocol.selectedServices.length === 0 ? (
                    <EmptyServicesState>
                        <EmptyStateContent>
                            <EmptyIcon><FaFileAlt /></EmptyIcon>
                            <EmptyTitle>Brak usług w protokole</EmptyTitle>
                            <EmptySubtitle>Dodaj usługi aby rozpocząć wycenę</EmptySubtitle>
                        </EmptyStateContent>
                    </EmptyServicesState>
                ) : (
                    <ServicesTable>
                        <TableHeader>
                            <th style={{ width: '40%' }}>Usługa</th>
                            <th style={{ width: '15%' }}>Cena bazowa</th>
                            <th style={{ width: '15%' }}>Rabat</th>
                            <th style={{ width: '15%' }}>Cena końcowa</th>
                            <th style={{ width: '10%' }}>Status</th>
                            <th style={{ width: '5%' }}></th>
                        </TableHeader>
                        <TableBody>
                            {protocol.selectedServices.map((service) => {
                                const prices = calculateServicePrices(service);
                                const isPending = service.approvalStatus === ServiceApprovalStatus.PENDING;

                                return (
                                    <TableRow key={service.id} $pending={isPending}>
                                        <td>
                                            <ServiceDetails>
                                                <ServiceName>{service.name}</ServiceName>
                                                {service.note && (
                                                    <ServiceNote>{service.note}</ServiceNote>
                                                )}
                                            </ServiceDetails>
                                        </td>
                                        <td>
                                            <PriceDisplay>
                                                <PriceAmount>{prices.baseGrossPrice.toFixed(2)} zł</PriceAmount>
                                            </PriceDisplay>
                                        </td>
                                        <td>
                                            {service.discountValue > 0 ? (
                                                <DiscountDisplay>
                                                    <DiscountAmount>
                                                        -{service.discountValue.toFixed(2)}
                                                        {service.discountType === 'PERCENTAGE' ? '%' : 'zł'}
                                                    </DiscountAmount>
                                                    <SavingsAmount>
                                                        (-{(prices.baseGrossPrice - prices.finalGrossPrice).toFixed(2)} zł)
                                                    </SavingsAmount>
                                                </DiscountDisplay>
                                            ) : (
                                                <NoDiscount>—</NoDiscount>
                                            )}
                                        </td>
                                        <td>
                                            <PriceDisplay>
                                                <FinalPriceAmount>{prices.finalGrossPrice.toFixed(2)} zł</FinalPriceAmount>
                                            </PriceDisplay>
                                        </td>
                                        <td>
                                            <ServiceStatusBadge $status={isPending ? 'pending' : 'approved'}>
                                                {isPending ? (
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
                                            </ServiceStatusBadge>
                                        </td>
                                        <td>
                                            {protocol.status !== ProtocolStatus.COMPLETED && protocol.status !== ProtocolStatus.CANCELLED && (
                                                <ActionsMenu>
                                                    {isPending && (
                                                        <>
                                                            <ActionButton
                                                                onClick={() => handleResendNotification(service.id)}
                                                                title="Wyślij ponownie SMS"
                                                                $variant="primary"
                                                            >
                                                                <FaBell />
                                                            </ActionButton>
                                                            <ActionButton
                                                                onClick={() => handleCancelService(service.id)}
                                                                title="Anuluj usługę"
                                                                $variant="warning"
                                                            >
                                                                <FaTimesCircle />
                                                            </ActionButton>
                                                        </>
                                                    )}
                                                    <ActionButton
                                                        onClick={() => handleDeleteService(service.id)}
                                                        title="Usuń usługę"
                                                        $variant="danger"
                                                    >
                                                        <FaTrash />
                                                    </ActionButton>
                                                </ActionsMenu>
                                            )}
                                        </td>
                                    </TableRow>
                                );
                            })}
                        </TableBody>

                        <TableFooter>
                            <tr>
                                <td><TotalLabel>ŁĄCZNIE</TotalLabel></td>
                                <td><TotalAmount>{metrics.approvedTotal + metrics.pendingTotal - metrics.totalDiscount + (protocol.selectedServices.reduce((sum, s) => sum + s.price, 0) - (metrics.approvedTotal + metrics.pendingTotal)).toFixed(2)} zł</TotalAmount></td>
                                <td><TotalAmount>-{metrics.totalDiscount.toFixed(2)} zł</TotalAmount></td>
                                <td><FinalTotalAmount>{metrics.totalRevenue.toFixed(2)} zł</FinalTotalAmount></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </TableFooter>
                    </ServicesTable>
                )}
            </ServicesSection>

            {/* Notes Section */}
            {protocol.notes && (
                <NotesSection>
                    <SectionHeader>
                        <SectionTitle>Uwagi do zlecenia</SectionTitle>
                    </SectionHeader>
                    <NotesContent>{protocol.notes}</NotesContent>
                </NotesSection>
            )}

            {/* Add Service Modal */}
            <AddServiceModal
                isOpen={showAddServiceModal}
                onClose={() => setShowAddServiceModal(false)}
                onAddServices={handleAddServices}
                availableServices={availableServices}
                customerPhone={protocol.phone}
            />
        </ExecutiveDashboard>
    );
};

// Executive Styled Components
const ExecutiveDashboard = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${executive.spacing.xxl};
    max-width: 100%;
`;

// Status Timeline Styles
const StatusTimelineSection = styled.div`
    background: ${executive.surface};
    border: 1px solid ${executive.border};
    border-radius: ${executive.radius.lg};
    box-shadow: ${executive.shadowCard};
    padding: ${executive.spacing.xl};
`;

const TimelineHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${executive.spacing.xl};
`;

const TimelineTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${executive.textPrimary};
    margin: 0;
`;

const StatusProgress = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${executive.textMuted};
    padding: ${executive.spacing.sm} ${executive.spacing.md};
    background: ${executive.surfaceElevated};
    border-radius: ${executive.radius.md};
`;

const StatusSteps = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${executive.spacing.xl};
`;

const StatusStep = styled.div<{ $active: boolean; $completed: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${executive.spacing.sm};
    opacity: ${props => props.$active ? 1 : 0.4};
`;

const StepIcon = styled.div<{ $active: boolean; $completed: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${props => {
    if (props.$completed) return executive.success;
    if (props.$active) return executive.primary;
    return executive.surfaceElevated;
}};
    color: ${props => {
    if (props.$completed || props.$active) return 'white';
    return executive.textMuted;
}};
    border: 3px solid ${props => {
    if (props.$completed) return executive.success;
    if (props.$active) return executive.primary;
    return executive.border;
}};
    font-size: 18px;
    transition: all 0.3s ease;
`;

const StepLabel = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: ${executive.textSecondary};
    text-align: center;
`;

const StatusConnector = styled.div<{ $active: boolean }>`
    flex: 1;
    height: 2px;
    background: ${props => props.$active ? executive.success : executive.border};
    margin: 0 ${executive.spacing.md};
    transition: background 0.3s ease;
`;

const CurrentStatusBadge = styled.div<{ $status: ProtocolStatus }>`
    display: inline-flex;
    align-items: center;
    padding: ${executive.spacing.sm} ${executive.spacing.lg};
    background: ${props => {
    switch (props.$status) {
        case ProtocolStatus.SCHEDULED: return executive.primary + '15';
        case ProtocolStatus.IN_PROGRESS: return executive.warning + '15';
        case ProtocolStatus.READY_FOR_PICKUP: return executive.success + '15';
        case ProtocolStatus.COMPLETED: return executive.surfaceElevated;
        case ProtocolStatus.CANCELLED: return executive.errorBg;
        default: return executive.surfaceElevated;
    }
}};
    color: ${props => {
    switch (props.$status) {
        case ProtocolStatus.SCHEDULED: return executive.primary;
        case ProtocolStatus.IN_PROGRESS: return executive.warning;
        case ProtocolStatus.READY_FOR_PICKUP: return executive.success;
        case ProtocolStatus.COMPLETED: return executive.textMuted;
        case ProtocolStatus.CANCELLED: return executive.error;
        default: return executive.textMuted;
    }
}};
    border: 1px solid ${props => {
    switch (props.$status) {
        case ProtocolStatus.SCHEDULED: return executive.primary + '30';
        case ProtocolStatus.IN_PROGRESS: return executive.warning + '30';
        case ProtocolStatus.READY_FOR_PICKUP: return executive.success + '30';
        case ProtocolStatus.COMPLETED: return executive.border;
        case ProtocolStatus.CANCELLED: return executive.error + '30';
        default: return executive.border;
    }
}};
    border-radius: ${executive.radius.md};
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MetricsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${executive.spacing.lg};
`;

const KPICard = styled.div<{ $alert?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${executive.spacing.lg};
    padding: ${executive.spacing.lg} ${executive.spacing.xl};
    background: ${executive.surface};
    border: 1px solid ${props => props.$alert ? executive.warning + '40' : executive.border};
    border-radius: ${executive.radius.lg};
    box-shadow: ${executive.shadowCard};
    transition: all 0.2s ease;

    &:hover {
        box-shadow: ${executive.shadowHover};
        transform: translateY(-1px);
    }

    ${props => props.$alert && `
        background: ${executive.warningBg};
    `}
`;

const KPIIcon = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${executive.radius.lg};
    font-size: 20px;
`;

const KPIContent = styled.div`
    display: flex;
    flex-direction: column;
`;

const KPIValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: ${executive.textPrimary};
    line-height: 1.2;
`;

const KPILabel = styled.div`
    font-size: 13px;
    color: ${executive.textMuted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${executive.spacing.xxl};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const InfoCard = styled.div`
    background: ${executive.surface};
    border: 1px solid ${executive.border};
    border-radius: ${executive.radius.lg};
    box-shadow: ${executive.shadowCard};
    overflow: hidden;
`;

const InfoCardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${executive.spacing.md};
    padding: ${executive.spacing.lg} ${executive.spacing.xl};
    background: ${executive.surfaceElevated};
    border-bottom: 1px solid ${executive.borderLight};
`;

const InfoCardIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${executive.primary}15;
    color: ${executive.primary};
    border-radius: ${executive.radius.md};
    font-size: 16px;
`;

const InfoCardTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${executive.textPrimary};
    margin: 0;
`;

const InfoCardContent = styled.div`
    padding: ${executive.spacing.xl};
`;

const PrimaryInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${executive.spacing.lg};
    padding-bottom: ${executive.spacing.lg};
    border-bottom: 1px solid ${executive.borderLight};
`;

const VehicleModelWithLogo = styled.div`
    display: flex;
    align-items: center;
    gap: ${executive.spacing.md};
`;

const CarLogo = styled.img`
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: ${executive.radius.sm};
    background: ${executive.surfaceElevated};
    padding: 2px;
`;

const VehicleModel = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${executive.textPrimary};
`;

const VehiclePlate = styled.div`
    padding: ${executive.spacing.sm} ${executive.spacing.md};
    background: ${executive.primary}10;
    border: 2px solid ${executive.primary}30;
    border-radius: ${executive.radius.md};
    font-weight: 700;
    color: ${executive.primary};
    font-family: monospace;
    letter-spacing: 1px;
`;

const SecondaryInfo = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${executive.spacing.lg};
    margin-bottom: ${executive.spacing.lg};
`;

const InfoPair = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${executive.spacing.xs};
`;

const InfoLabel = styled.div`
    font-size: 12px;
    color: ${executive.textMuted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${executive.textPrimary};
`;

const StatusRow = styled.div`
    display: flex;
    gap: ${executive.spacing.lg};
`;

const StatusIndicator = styled.div<{ $status: 'completed' | 'pending' }>`
    display: flex;
    align-items: center;
    gap: ${executive.spacing.sm};
    padding: ${executive.spacing.sm} ${executive.spacing.md};
    background: ${props => props.$status === 'completed' ? executive.successBg : executive.surfaceElevated};
    border: 1px solid ${props => props.$status === 'completed' ? executive.success + '30' : executive.borderLight};
    border-radius: ${executive.radius.md};
    color: ${props => props.$status === 'completed' ? executive.success : executive.textMuted};
    font-size: 13px;
    font-weight: 500;
    flex: 1;
`;

const ContactGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${executive.spacing.lg};
`;

const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${executive.spacing.md};
    font-size: 14px;
    color: ${executive.textSecondary};

    svg {
        color: ${executive.textMuted};
        width: 16px;
    }
`;

const ServicesSection = styled.div`
    background: ${executive.surface};
    border: 1px solid ${executive.border};
    border-radius: ${executive.radius.lg};
    box-shadow: ${executive.shadowCard};
    overflow: hidden;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${executive.spacing.lg} ${executive.spacing.xl};
    background: ${executive.surfaceElevated};
    border-bottom: 1px solid ${executive.borderLight};
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${executive.textPrimary};
    margin: 0;
`;

const AddServiceBtn = styled.button`
    display: flex;
    align-items: center;
    gap: ${executive.spacing.sm};
    padding: ${executive.spacing.sm} ${executive.spacing.lg};
    background: ${executive.primary};
    color: white;
    border: none;
    border-radius: ${executive.radius.md};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${executive.primaryDark};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const EmptyServicesState = styled.div`
    padding: ${executive.spacing.xxl} ${executive.spacing.xl};
`;

const EmptyStateContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: ${executive.spacing.xxl};
`;

const EmptyIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${executive.surfaceElevated};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${executive.textMuted};
    font-size: 24px;
    margin-bottom: ${executive.spacing.lg};
`;

const EmptyTitle = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${executive.textSecondary};
    margin-bottom: ${executive.spacing.sm};
`;

const EmptySubtitle = styled.div`
    font-size: 14px;
    color: ${executive.textMuted};
`;

const ServicesTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.thead`
    th {
        padding: ${executive.spacing.lg} ${executive.spacing.xl};
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        color: ${executive.textMuted};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: ${executive.surfaceElevated};
        border-bottom: 1px solid ${executive.borderLight};
    }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $pending?: boolean }>`
    border-bottom: 1px solid ${executive.borderLight};
    transition: background-color 0.2s ease;
    
    ${props => props.$pending && `
        background: ${executive.pendingBg};
    `}

    &:hover {
        background: ${executive.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }

    td {
        padding: ${executive.spacing.lg} ${executive.spacing.xl};
        vertical-align: top;
    }
`;

const ServiceDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${executive.spacing.sm};
`;

const ServiceName = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${executive.textPrimary};
    line-height: 1.4;
`;

const ServiceNote = styled.div`
    font-size: 13px;
    color: ${executive.textMuted};
    font-style: italic;
    line-height: 1.4;
`;

const PriceDisplay = styled.div`
    display: flex;
    flex-direction: column;
`;

const PriceAmount = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${executive.textPrimary};
`;

const FinalPriceAmount = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${executive.primary};
`;

const DiscountDisplay = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const DiscountAmount = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${executive.error};
`;

const SavingsAmount = styled.div`
    font-size: 12px;
    color: ${executive.textSuccess};
    font-weight: 500;
`;

const NoDiscount = styled.div`
    font-size: 15px;
    color: ${executive.textMuted};
    font-weight: 300;
`;

const ServiceStatusBadge = styled.div<{ $status: 'pending' | 'approved' }>`
    display: flex;
    align-items: center;
    gap: ${executive.spacing.xs};
    padding: ${executive.spacing.xs} ${executive.spacing.sm};
    background: ${props => props.$status === 'pending' ? executive.pendingBg : executive.successBg};
    color: ${props => props.$status === 'pending' ? executive.pending : executive.success};
    border: 1px solid ${props => props.$status === 'pending' ? executive.pending + '30' : executive.success + '30'};
    border-radius: ${executive.radius.sm};
    font-size: 12px;
    font-weight: 500;
    width: fit-content;

    span {
        font-size: 11px;
    }
`;

const ActionsMenu = styled.div`
    display: flex;
    gap: ${executive.spacing.xs};
    opacity: 0.7;
    transition: opacity 0.2s ease;

    ${TableRow}:hover & {
        opacity: 1;
    }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'warning' | 'danger' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: ${executive.radius.sm};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 11px;

    ${props => {
    switch (props.$variant) {
        case 'primary':
            return `
                    background: ${executive.primary}20;
                    color: ${executive.primary};
                    &:hover {
                        background: ${executive.primary};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'warning':
            return `
                    background: ${executive.warning}20;
                    color: ${executive.warning};
                    &:hover {
                        background: ${executive.warning};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'danger':
            return `
                    background: ${executive.error}20;
                    color: ${executive.error};
                    &:hover {
                        background: ${executive.error};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
    }
}}
`;

const TableFooter = styled.tfoot`
    tr {
        background: ${executive.surfaceElevated};
        border-top: 2px solid ${executive.border};
    }

    td {
        padding: ${executive.spacing.lg} ${executive.spacing.xl};
        font-weight: 600;
    }
`;

const TotalLabel = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: ${executive.textPrimary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TotalAmount = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${executive.textPrimary};
`;

const FinalTotalAmount = styled.div`
    font-size: 18px;
    font-weight: 800;
    color: ${executive.primary};
`;

const NotesSection = styled.div`
    background: ${executive.surface};
    border: 1px solid ${executive.border};
    border-radius: ${executive.radius.lg};
    box-shadow: ${executive.shadowCard};
    overflow: hidden;
`;

const NotesContent = styled.div`
    padding: ${executive.spacing.xl};
    font-size: 15px;
    color: ${executive.textSecondary};
    line-height: 1.6;
    white-space: pre-line;
    background: ${executive.surfaceElevated};
    border-left: 4px solid ${executive.primary};
`;

// Missing FaPercent import fix
const FaPercent = styled.div`
    &::before {
        content: '%';
        font-weight: bold;
    }
`;

export default ProtocolSummary;