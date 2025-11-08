import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {PriceType, Service} from '../../../../types';
import {servicesApi} from '../../../services/api/servicesApi';
import {
    ReservationSelectedServiceInput,
    DiscountType as ReservationDiscountType,
    DiscountType
} from '../../api/reservationsApi';
import {ServiceSection, useServiceCalculations, calculateLocalFinalPrice} from '../../../services';
import {
    ServiceWithExtendedDiscount,
} from '../../utils/discountMapping';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
    },
    spacing: {
        md: '16px',
    }
};

const generateRowId = () => `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface ReservationServicesSectionProps {
    services: ReservationSelectedServiceInput[];
    onChange?: (services: ReservationSelectedServiceInput[]) => void;
    readOnly?: boolean;
}

export const ReservationServicesSection: React.FC<ReservationServicesSectionProps> = ({
                                                                                          services: initialServices,
                                                                                          onChange,
                                                                                          readOnly = false
                                                                                      }) => {
    const convertedServices: ServiceWithExtendedDiscount[] = initialServices.map(service => {
        const basePrice = {
            priceNetto: service.basePrice.inputType === 'netto'
                ? service.basePrice.inputPrice
                : service.basePrice.inputPrice / 1.23,
            priceBrutto: service.basePrice.inputType === 'brutto'
                ? service.basePrice.inputPrice
                : service.basePrice.inputPrice * 1.23,
            taxAmount: service.basePrice.inputType === 'netto'
                ? service.basePrice.inputPrice * 0.23
                : service.basePrice.inputPrice - (service.basePrice.inputPrice / 1.23)
        };

        const discountType = service.discount?.discountType || DiscountType.PERCENT;
        const discountValue = service.discount?.discountValue || 0;

        const finalPrice = calculateLocalFinalPrice(basePrice, discountType, discountValue);

        return {
            id: service.serviceId,
            rowId: generateRowId(),
            name: service.name,
            quantity: service.quantity,
            basePrice: basePrice,
            discountType: discountType,
            discountValue: discountValue,
            finalPrice: finalPrice,
            note: service.note
        };
    });

    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Service[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<Service | null>(null);

    const [extendedDiscountTypes, setExtendedDiscountTypes] = useState<Record<string, ReservationDiscountType>>({});

    const {
        services: managedServices,
        setServices,
        addService,
        removeService,
        updateBasePrice,
        updateDiscountType,
        updateDiscountValue,
        updateServiceNote,
        calculateTotals
    } = useServiceCalculations(convertedServices);

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
        if (onChange) {
            const reservationServices: ReservationSelectedServiceInput[] = managedServices.map(service => {
                return {
                    serviceId: service.id,
                    name: service.name,
                    basePrice: {
                        inputPrice: service.basePrice.priceNetto,
                        inputType: PriceType.NET
                    },
                    quantity: service.quantity,
                    discount: {
                        discountType: service.discountType,
                        discountValue: service.discountValue,
                    },
                    note: service.note
                };
            });

            onChange(reservationServices);
        }
    }, [managedServices, extendedDiscountTypes, onChange]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowResults(true);
        setSelectedServiceToAdd(null);

        if (e.target.value.trim() === '') {
            setSearchResults([]);
            return;
        }

        const query = e.target.value.toLowerCase();
        const results = availableServices.filter(service =>
            service.name.toLowerCase().includes(query) &&
            !managedServices.some(selected => selected.id === service.id)
        );
        setSearchResults(results);
    };

    const handleSelectService = (service: Service) => {
        setSelectedServiceToAdd(service);
        setSearchQuery(service.name);
        setShowResults(false);
    };

    const handleAddService = () => {
        if (selectedServiceToAdd) {
            const newService = {
                id: selectedServiceToAdd.id,
                name: selectedServiceToAdd.name,
                quantity: 1,
                basePrice: selectedServiceToAdd.price,
                discountType: DiscountType.PERCENT,
                discountValue: 0,
                approvalStatus: undefined,
            };
            addService(newService);

            setExtendedDiscountTypes(prev => ({
                ...prev,
                [selectedServiceToAdd.id]: ReservationDiscountType.PERCENT
            }));
        } else if (searchQuery.trim() !== '') {
            const customId = `custom-${Date.now()}`;
            const newService = {
                id: customId,
                name: searchQuery.trim(),
                quantity: 1,
                basePrice: {
                    priceNetto: 0,
                    priceBrutto: 0,
                    taxAmount: 0
                },
                discountType: DiscountType.PERCENT,
                discountValue: 0,
                approvalStatus: undefined,
            };
            addService(newService);

            setExtendedDiscountTypes(prev => ({
                ...prev,
                [customId]: ReservationDiscountType.PERCENT
            }));
        }
        setSearchQuery('');
        setSelectedServiceToAdd(null);
    };

    const handleAddServiceDirect = (service: Service, note?: string) => {
        const newService = {
            id: service.id,
            name: service.name,
            quantity: 1,
            basePrice: service.price,
            discountType: DiscountType.PERCENT,
            discountValue: 0,
            approvalStatus: undefined,
        };
        addService(newService, note);

        setExtendedDiscountTypes(prev => ({
            ...prev,
            [service.id]: ReservationDiscountType.PERCENT
        }));

        setSearchQuery('');
        setSelectedServiceToAdd(null);
        setShowResults(false);
    };

    const handleServiceCreated = async (oldId: string, newService: Service) => {
        setServices(prevServices =>
            prevServices.map(service =>
                service.id === oldId
                    ? {
                        ...service,
                        id: newService.id,
                        basePrice: newService.price,
                        finalPrice: newService.price
                    }
                    : service
            )
        );

        setExtendedDiscountTypes(prev => {
            const oldType = prev[oldId];
            const newTypes = { ...prev };
            delete newTypes[oldId];
            if (oldType) {
                newTypes[newService.id] = oldType;
            }
            return newTypes;
        });

        try {
            const fetchedServices = await servicesApi.fetchServices();
            setAvailableServices(fetchedServices);
        } catch (error) {
            console.error('Error refreshing services:', error);
        }
    };

    const refreshServices = async () => {
        try {
            const fetchedServices = await servicesApi.fetchServices();
            setAvailableServices(fetchedServices);
        } catch (error) {
            console.error('Error refreshing services:', error);
        }
    };

    if (loadingServices) {
        return (
            <Section>
                <SectionTitle>Usługi</SectionTitle>
                <LoadingMessage>Ładowanie usług...</LoadingMessage>
            </Section>
        );
    }

    return (
        <Section>
            <ServiceSection
                searchQuery={searchQuery}
                showResults={showResults}
                searchResults={searchResults}
                selectedServiceToAdd={selectedServiceToAdd}
                services={managedServices}
                errors={{}}
                onSearchChange={handleSearchChange}
                onSelectService={handleSelectService}
                onAddService={handleAddService}
                onRemoveService={removeService}
                onDiscountTypeChange={updateDiscountType}
                onDiscountValueChange={updateDiscountValue}
                onBasePriceChange={updateBasePrice}
                onAddNote={updateServiceNote}
                calculateTotals={calculateTotals}
                allowCustomService={true}
                onAddServiceDirect={handleAddServiceDirect}
                onServiceAdded={refreshServices}
                onServiceCreated={handleServiceCreated}
                readOnly={readOnly}
            />
        </Section>
    );
};

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background: ${brandTheme.primary};
        border-radius: 2px;
    }
`;

const LoadingMessage = styled.div`
    padding: 24px;
    text-align: center;
    color: ${brandTheme.text.secondary};
    font-size: 14px;
    font-style: italic;
`;