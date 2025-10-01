import React, {useEffect, useState} from 'react';
import {FaPlus, FaSearch} from 'react-icons/fa';
import {
    AddServiceButton,
    CustomServiceInfo,
    SearchContainer,
    SearchIcon,
    SearchInput,
    SearchInputGroup,
    SearchInputWrapper,
    SearchResultItem,
    SearchResultPrice,
    SearchResultsList
} from '../styles';
import PriceEditModal from "../../shared/modals/PriceEditModal";
import {Service} from '../../../../types';
import {servicesApi} from "../../../../api/servicesApi";

interface ServiceSearchProps {
    searchQuery: string;
    showResults: boolean;
    searchResults: Array<{ id: string; name: string; price: number }>;
    selectedServiceToAdd: { id: string; name: string; price: number } | null;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectService: (service: { id: string; name: string; price: number }) => void;
    onAddService: () => void;
    onAddServiceDirect: (service: { id: string; name: string; price: number }) => void;
    allowCustomService?: boolean;
    onServiceAdded?: () => void;
    onServiceCreated?: (oldId: string, newService: { id: string; name: string; price: number }) => void;
}

const ServiceSearch: React.FC<ServiceSearchProps> = ({
                                                         searchQuery,
                                                         showResults,
                                                         searchResults,
                                                         selectedServiceToAdd,
                                                         onSearchChange,
                                                         onSelectService,
                                                         onAddService,
                                                         onAddServiceDirect,
                                                         allowCustomService = true,
                                                         onServiceAdded,
                                                         onServiceCreated
                                                     }) => {
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<(Service & { isNew?: boolean }) | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allServices, setAllServices] = useState<Array<{ id: string; name: string; price: number }>>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);

    useEffect(() => {
        const fetchAllServices = async () => {
            try {
                const services = await servicesApi.fetchServices();
                setAllServices(services);
            } catch (error) {
                console.error('Błąd podczas pobierania wszystkich usług:', error);
            }
        };

        fetchAllServices();
    }, []);

    const isCustomService = searchQuery.trim() !== '' &&
        searchResults.length === 0 &&
        !selectedServiceToAdd;

    const handleServiceClick = (service: { id: string; name: string; price: number }) => {
        if (service.price === 0) {
            setServiceToEdit({
                ...service,
                description: '',
                vatRate: 23,
                isNew: false
            });
            setIsPriceModalOpen(true);
        } else {
            onSelectService(service);
            onAddServiceDirect(service);
        }
    };

    const handleAddCustomService = () => {
        if (searchQuery.trim() === '') return;

        if (selectedServiceToAdd) {
            if (selectedServiceToAdd.price === 0) {
                setServiceToEdit({
                    ...selectedServiceToAdd,
                    description: '',
                    vatRate: 23,
                    isNew: false
                });
                setIsPriceModalOpen(true);
            } else {
                onAddService();
            }
        } else if (allowCustomService && isCustomService) {
            const tempId = `custom-${Date.now()}`;
            setServiceToEdit({
                id: tempId,
                name: searchQuery.trim(),
                price: 0,
                description: '',
                vatRate: 23,
                isNew: true
            });
            setIsPriceModalOpen(true);
        }
    };

    const handleSavePrice = async (price: number) => {
        if (!serviceToEdit) return;

        try {
            setIsSubmitting(true);

            if (serviceToEdit.isNew) {
                try {

                    const createdService = await servicesApi.createService({
                        name: serviceToEdit.name,
                        description: serviceToEdit.description || '',
                        price: price,
                        vatRate: serviceToEdit.vatRate || 23
                    });

                    const serviceWithRealId = {
                        id: createdService.id,
                        name: createdService.name,
                        price: price
                    };

                    if (onServiceCreated) {
                        onServiceCreated(serviceToEdit.id, serviceWithRealId);
                    }

                    onSelectService(serviceWithRealId);
                    onAddServiceDirect(serviceWithRealId);

                    setTimeout(() => {
                        if (onServiceAdded) {
                            onServiceAdded();
                        }
                    }, 1000);
                } catch (error) {
                    console.error('Błąd podczas dodawania nowej usługi:', error);
                    const tempService = {
                        id: serviceToEdit.id,
                        name: serviceToEdit.name,
                        price: price
                    };
                    onSelectService(tempService);
                    onAddServiceDirect(tempService);
                }
            } else {
                const updatedService = {
                    ...serviceToEdit,
                    price: price
                };

                try {
                    await servicesApi.updateService(serviceToEdit.id, {
                        name: updatedService.name,
                        description: updatedService.description || '',
                        price: price,
                        vatRate: updatedService.vatRate || 23
                    });

                    if (onServiceAdded) {
                        setTimeout(() => {
                            onServiceAdded();
                        }, 1000);
                    }
                } catch (error) {
                    console.error('Błąd podczas aktualizacji usługi:', error);
                }

                onSelectService(updatedService);
                onAddServiceDirect(updatedService);
            }

        } catch (error) {
            console.error('Błąd podczas przetwarzania usługi:', error);
        } finally {
            setIsPriceModalOpen(false);
            setServiceToEdit(null);
            setIsSubmitting(false);
        }
    };

    const handleInputFocus = () => {
        setIsInputFocused(true);

        if (searchQuery.trim() === '') {
            onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setIsInputFocused(false);
        }, 200);
    };

    const shouldShowResults = isInputFocused && (showResults || searchQuery.trim() === '');

    return (
        <SearchContainer>
            <SearchInputGroup>
                <SearchInputWrapper>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Wyszukaj usługę..."
                        value={searchQuery}
                        onChange={onSearchChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                </SearchInputWrapper>

                {shouldShowResults && (
                    <SearchResultsList>
                        {searchQuery.trim() === '' ? (
                            allServices.length > 0 ? (
                                allServices
                                    .filter(service => !selectedServiceToAdd || service.id !== selectedServiceToAdd.id)
                                    .map(service => (
                                        <SearchResultItem
                                            key={service.id}
                                            onClick={() => handleServiceClick(service)}
                                        >
                                            <div>{service.name}</div>
                                            <SearchResultPrice>{service.price.toFixed(2)} zł</SearchResultPrice>
                                        </SearchResultItem>
                                    ))
                            ) : (
                                <SearchResultItem>
                                    <div>Brak dostępnych usług</div>
                                </SearchResultItem>
                            )
                        ) : searchResults.length > 0 ? (
                            searchResults.map(service => (
                                <SearchResultItem
                                    key={service.id}
                                    onClick={() => handleServiceClick(service)}
                                >
                                    <div>{service.name}</div>
                                    <SearchResultPrice>{service.price.toFixed(2)} zł</SearchResultPrice>
                                </SearchResultItem>
                            ))
                        ) : (
                            <SearchResultItem>
                                <div>Brak wyników dla "{searchQuery}"</div>
                            </SearchResultItem>
                        )}
                    </SearchResultsList>
                )}

                {isCustomService && allowCustomService && (
                    <CustomServiceInfo>
                        Usługa niestandardowa - po dodaniu zostanie zapisana w bazie usług
                    </CustomServiceInfo>
                )}
            </SearchInputGroup>

            <AddServiceButton
                type="button"
                onClick={handleAddCustomService}
                disabled={!(selectedServiceToAdd || (allowCustomService && searchQuery.trim() !== ''))}
            >
                <FaPlus /> Dodaj usługę
            </AddServiceButton>

            {serviceToEdit && (
                <PriceEditModal
                    isOpen={isPriceModalOpen}
                    onClose={() => {
                        setIsPriceModalOpen(false);
                        setServiceToEdit(null);
                    }}
                    onSave={(price) => {
                        void handleSavePrice(price);
                    }}
                    serviceName={serviceToEdit.name}
                    isNewService={serviceToEdit.isNew || false}
                    initialPrice={serviceToEdit.price}
                />
            )}
        </SearchContainer>
    );
};

export default ServiceSearch;