import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaArrowRight} from 'react-icons/fa';
import {DiscountType, Reservation} from '../../api/reservationsApi';
import {ConvertFormData, useConvertReservationToVisit} from '../../hooks/useConvertReservationToVisit';
import VisitTitleSection from '../../../../pages/Protocols/form/components/VisitTitleSection';
import ScheduleSection from '../../../../pages/Protocols/form/components/ScheduleSection';
import ClientInfoSection from '../../../../pages/Protocols/form/components/ClientInfoSection';
import VehicleInfoSection from '../../../../pages/Protocols/form/components/VehicleInfoSection';
import ReferralSourceSection, {ReferralSource} from '../../../../pages/Protocols/form/components/ReferralSourceSection';
import NotesSection from '../../../../pages/Protocols/form/components/NotesSection';
import {ServiceSection} from '../../../services';
import {servicesApi} from '../../../services/api/servicesApi';
import {SelectedService, Service} from '../../../../types';
import {useVisitServicesState} from '../../../visits/hooks/useVisitServicesState';
import {useAddService} from '../../../visits/hooks/useAddService';
import {useRemoveService} from '../../../visits/hooks/useRemoveService';
import {useUpdateBasePrice} from '../../../visits/hooks/useUpdateBasePrice';
import {useUpdateDiscountType} from '../../../visits/hooks/useUpdateDiscountType';
import {useUpdateDiscountValue} from '../../../visits/hooks/useUpdateDiscountValue';
import {useUpdateServiceNote} from '../../../visits/hooks/useUpdateServiceNote';
import {useHandleServiceCreated} from '../../../visits/hooks/useHandleServiceCreated';
import {useTotalsCalculation} from '../../../visits/hooks/useTotalsCalculation';
import {useFormDataWithAutocomplete} from '../../../../pages/Protocols/form/hooks/useFormData';
import VehicleSelectionModal from '../../../../pages/Protocols/shared/modals/VehicleSelectionModal';
import {parseDateFromBackend} from "../../libs/utils";

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    status: {
        info: '#0ea5e9',
        infoLight: '#e0f2fe',
        error: '#dc2626',
        errorLight: '#fee2e2'
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
        md: '8px',
        lg: '12px',
        xl: '16px'
    },
    shadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    transitions: {
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

interface ConvertReservationToVisitFormProps {
    reservation: Reservation;
    onSuccess?: (visitId: string) => void;
    onCancel: () => void;
}

export const ConvertReservationToVisitForm: React.FC<ConvertReservationToVisitFormProps> = ({
                                                                                                reservation,
                                                                                                onSuccess,
                                                                                                onCancel
                                                                                            }) => {
    const {
        getInitialFormData,
        convertToVisit,
        loading,
        error
    } = useConvertReservationToVisit({
        reservation,
        onSuccess
    });

    const initialFormData = getInitialFormData();

    const {
        formData,
        setFormData,
        errors,
        handleChange,
        handleReferralSourceChange,
        handleOtherSourceDetailsChange,
        autocompleteOptions,
        loadingAutocompleteData,
        handleAutocompleteSelect,
        showVehicleModal,
        setShowVehicleModal,
        vehicleModalOptions,
        handleVehicleModalSelect
    } = useFormDataWithAutocomplete(null, initialFormData);

    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);

    const initialServices: SelectedService[] = reservation.services.map(service => {
        return {
            id: service.id,
            rowId: `row-${service.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: service.name,
            quantity: service.quantity,
            basePrice: service.basePrice,
            discountType: service.discount?.discountType || DiscountType.PERCENT,
            discountValue: service.discount?.discountValue || 0,
            finalPrice: service.finalPrice,
            note: service.note,
            approvalStatus: undefined
        };
    });

    const { services, setServices } = useVisitServicesState(initialServices);
    const addServiceCommand = useAddService(setServices);
    const removeService = useRemoveService(setServices);
    const updateBasePrice = useUpdateBasePrice(setServices);
    const updateDiscountType = useUpdateDiscountType(setServices);
    const updateDiscountValue = useUpdateDiscountValue(setServices);
    const updateServiceNote = useUpdateServiceNote(setServices);
    const handleServiceCreated = useHandleServiceCreated(setServices);
    const calculateTotals = useTotalsCalculation(services);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Service[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<Service | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoadingServices(true);
                const fetchedServices = await servicesApi.fetchServices();
                setAvailableServices(fetchedServices);
            } catch (error) {
                console.error('Error loading services:', error);
            } finally {
                setLoadingServices(false);
            }
        };

        fetchServices();
    }, []);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            vehicleMake: reservation.vehicleMake,
            make: reservation.vehicleMake,
            vehicleModel: reservation.vehicleModel,
            model: reservation.vehicleModel,
            title: reservation.title,
            calendarColorId: reservation.calendarColorId,
            startDate: parseDateFromBackend(reservation.startDate),
            endDate: parseDateFromBackend(reservation.endDate),
            contactPhone: reservation.contactPhone,
            phone: reservation.contactPhone,
            contactName: reservation.contactName,
            ownerName: reservation.contactName || '',
            notes: reservation.notes
        }));
    }, [reservation, setFormData]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setShowResults(true);
        setSelectedServiceToAdd(null);

        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = availableServices.filter(service =>
            service.name.toLowerCase().includes(lowerQuery) &&
            !services.some(selected => selected.id === service.id)
        );
        setSearchResults(results);
    };

    const handleSelectService = (service: Service) => {
        setSelectedServiceToAdd(service);
        setSearchQuery(service.name);
        setShowResults(false);
    };

    const handleAddService = () => {
        let newServiceData: Omit<SelectedService, 'finalPrice' | 'rowId'>;

        if (selectedServiceToAdd) {
            newServiceData = {
                id: selectedServiceToAdd.id,
                name: selectedServiceToAdd.name,
                quantity: 1,
                basePrice: selectedServiceToAdd.price,
                discountType: DiscountType.PERCENT,
                discountValue: 0,
                approvalStatus: undefined,
            };
        } else if (searchQuery.trim() !== '') {
            const customId = `custom-${Date.now()}`;
            newServiceData = {
                id: customId,
                name: searchQuery.trim(),
                quantity: 1,
                basePrice: { priceNetto: 0, priceBrutto: 0, taxAmount: 0 },
                discountType: DiscountType.PERCENT,
                discountValue: 0,
                approvalStatus: undefined,
            };
        } else {
            return;
        }

        addServiceCommand(newServiceData);
        setSearchQuery('');
        setSelectedServiceToAdd(null);
    };

    const handleAddServiceDirect = (service: Service, note?: string) => {
        const newServiceData: Omit<SelectedService, 'finalPrice' | 'rowId'> = {
            id: service.id,
            name: service.name,
            quantity: 1,
            basePrice: service.price,
            discountType: DiscountType.PERCENT,
            discountValue: 0,
            approvalStatus: undefined,
        };
        addServiceCommand(newServiceData, note);
        setSearchQuery('');
        setSelectedServiceToAdd(null);
        setShowResults(false);
    };

    const refreshServices = async () => {
        try {
            const fetchedServices = await servicesApi.fetchServices();
            setAvailableServices(fetchedServices);
        } catch (error) {
            console.error('Error refreshing services:', error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.ownerName?.trim()) {
            newErrors.ownerName = 'Imię i nazwisko jest wymagane';
        }
        if (!formData.phone?.trim()) {
            newErrors.phone = 'Numer telefonu jest wymagany';
        }
        if (!formData.licensePlate?.trim()) {
            newErrors.licensePlate = 'Numer rejestracyjny jest wymagany';
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const updatedFormData: ConvertFormData = {
            ...formData as any,
            services: services
        };

        await convertToVisit(updatedFormData);
    };

    if (loadingAutocompleteData) {
        return (
            <FormContainer>
                <LoadingMessage>Ładowanie danych klientów i pojazdów...</LoadingMessage>
            </FormContainer>
        );
    }

    return (
        <FormContainer>
            <FormHeader>
                <HeaderIcon>
                    <FaArrowRight />
                </HeaderIcon>
                <HeaderText>
                    <Title>Rozpocznij wizytę</Title>
                    <Subtitle>Uzupełnij brakujące dane aby przekonwertować rezerwację na pełną wizytę</Subtitle>
                </HeaderText>
            </FormHeader>

            <InfoBanner>
                <InfoIcon>💡</InfoIcon>
                <InfoText>
                    <strong>Dane z rezerwacji:</strong> Podstawowe informacje zostały już wypełnione.
                    Uzupełnij tylko brakujące szczegóły klienta i pojazdu.
                </InfoText>
            </InfoBanner>

            {error && (
                <ErrorMessage>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                </ErrorMessage>
            )}

            <Form onSubmit={handleSubmit}>
                <VisitTitleSection
                    title={formData.title || ''}
                    selectedColorId={formData.calendarColorId || ''}
                    onChange={handleChange}
                    error={errors.title}
                />

                <ScheduleSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    isFullProtocol={true}
                />

                <SectionWithBadge>
                    <SectionBadge>Wymagane</SectionBadge>
                    <ClientInfoSection
                        formData={formData}
                        errors={errors}
                        onChange={handleChange}
                        autocompleteOptions={autocompleteOptions}
                        onAutocompleteSelect={handleAutocompleteSelect}
                    />
                </SectionWithBadge>

                <SectionWithBadge>
                    <SectionBadge>Wymagane</SectionBadge>
                    <VehicleInfoSection
                        formData={formData}
                        errors={errors}
                        onChange={handleChange}
                        isFullProtocol={true}
                        autocompleteOptions={autocompleteOptions}
                        onAutocompleteSelect={handleAutocompleteSelect}
                    />
                </SectionWithBadge>

                <ReferralSourceSection
                    referralSource={formData.referralSource || null}
                    otherSourceDetails={formData.otherSourceDetails || ''}
                    onSourceChange={handleReferralSourceChange}
                    onOtherDetailsChange={handleOtherSourceDetailsChange}
                />

                <ServicesSectionWrapper>
                    <ServiceSection
                        searchQuery={searchQuery}
                        showResults={showResults}
                        searchResults={searchResults}
                        selectedServiceToAdd={selectedServiceToAdd}
                        services={services}
                        errors={errors}
                        onSearchChange={handleSearchChange}
                        onSelectService={handleSelectService}
                        onAddService={handleAddService}
                        onAddServiceDirect={handleAddServiceDirect}
                        onRemoveService={removeService}
                        onDiscountTypeChange={updateDiscountType}
                        onDiscountValueChange={updateDiscountValue}
                        onBasePriceChange={updateBasePrice}
                        onAddNote={updateServiceNote}
                        calculateTotals={calculateTotals}
                        allowCustomService={true}
                        onServiceAdded={refreshServices}
                        onServiceCreated={handleServiceCreated}
                        availableServices={availableServices}
                    />
                </ServicesSectionWrapper>

                <NotesSection
                    notes={formData.notes || ''}
                    onChange={handleChange}
                />

                <ActionsContainer>
                    <SecondaryButton type="button" onClick={onCancel} disabled={loading}>
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={loading}>
                        <FaArrowRight />
                        <span>
                            {loading ? 'Konwertowanie...' : 'Rozpocznij wizytę'}
                        </span>
                    </PrimaryButton>
                </ActionsContainer>
            </Form>

            {showVehicleModal && (
                <VehicleSelectionModal
                    vehicles={vehicleModalOptions}
                    onSelect={handleVehicleModalSelect}
                    onCancel={() => setShowVehicleModal(false)}
                />
            )}
        </FormContainer>
    );
};

const FormContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    max-width: 1200px;
    margin: 0 auto;
`;

const FormHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, #ffffff 100%);
    border-bottom: 1px solid ${brandTheme.border};
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.sm};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const Subtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const InfoBanner = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.xl};
    background: ${brandTheme.status.infoLight};
    border-bottom: 1px solid ${brandTheme.border};
`;

const InfoIcon = styled.span`
    font-size: 20px;
    flex-shrink: 0;
    line-height: 1;
`;

const InfoText = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;

    strong {
        color: ${brandTheme.text.primary};
        font-weight: 600;
    }
`;

const ErrorMessage = styled.div`
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: 16px 32px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    border-bottom: 1px solid ${brandTheme.border};
`;

const ErrorIcon = styled.span`
    font-size: 18px;
`;

const ErrorText = styled.span`
    font-size: 14px;
`;

const Form = styled.form`
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
`;

const SectionWithBadge = styled.div`
    position: relative;
`;

const SectionBadge = styled.div`
    position: absolute;
    top: -8px;
    right: 0;
    background: ${brandTheme.primary};
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 10;
`;

const ServicesSectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const ActionsContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    margin-top: ${brandTheme.spacing.xl};
    padding-top: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    min-height: 44px;
    min-width: 140px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const PrimaryButton = styled(Button)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: 2px solid transparent;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const SecondaryButton = styled(Button)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 2px solid ${brandTheme.border};

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: #cbd5e1;
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const LoadingMessage = styled.div`
    padding: ${brandTheme.spacing.xxl};
    text-align: center;
    color: ${brandTheme.text.secondary};
    font-size: 14px;
`;