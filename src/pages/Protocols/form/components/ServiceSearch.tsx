import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaPlus, FaSearch, FaEuroSign} from 'react-icons/fa';
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
import {Service, PriceType} from '../../../../types';
import {servicesApi} from "../../../../api/servicesApi";

const EditPriceButton = styled.button.attrs({
    type: 'button',
})`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: #e0f2fe; /* infoLight */
    color: #0ea5e9; /* info */
    border: 1px solid #0ea5e9;
    border-radius: 4px;
    font-weight: 500;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-left: 12px;
    white-space: nowrap;

    &:hover {
        background: #0ea5e9;
        color: white;
        border-color: #0ea5e9;
        transform: translateY(-0.5px);
    }
`;

// Typ dla uproszczonej usługi używanej w komponencie
interface SimpleService {
    id: string;
    name: string;
    priceNetto: number;
}

interface ServiceSearchProps {
    searchQuery: string;
    showResults: boolean;
    searchResults: SimpleService[];
    selectedServiceToAdd: SimpleService | null;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectService: (service: SimpleService) => void;
    onAddService: () => void;
    onAddServiceDirect: (service: SimpleService) => void;
    allowCustomService?: boolean;
    onServiceAdded?: () => void;
    onServiceCreated?: (oldId: string, newService: SimpleService) => void;
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
    const [allServices, setAllServices] = useState<SimpleService[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);

    useEffect(() => {
        const fetchAllServices = async () => {
            try {
                const services = await servicesApi.fetchServices();
                // Konwersja Service[] (z PriceResponse) na SimpleService[] (z priceNetto)
                const simpleServices: SimpleService[] = services.map(service => ({
                    id: service.id,
                    name: service.name,
                    priceNetto: service.price.priceNetto
                }));
                setAllServices(simpleServices);
            } catch (error) {
                console.error('Błąd podczas pobierania wszystkich usług:', error);
            }
        };

        fetchAllServices();
    }, []);

    const isCustomService = searchQuery.trim() !== '' &&
        searchResults.length === 0 &&
        !selectedServiceToAdd;

    const handleServiceClick = (service: SimpleService) => {
        if (service.priceNetto === 0) {
            // Usługa bez ceny - otwórz modal edycji
            setServiceToEdit({
                id: service.id,
                name: service.name,
                price: {
                    priceNetto: 0,
                    priceBrutto: 0,
                    taxAmount: 0
                },
                description: '',
                vatRate: 23,
                isNew: false
            });
            setIsPriceModalOpen(true);
        } else {
            // Usługa z ceną - dodaj bezpośrednio
            onSelectService(service);
            onAddServiceDirect(service);
        }
    };

    /**
     * Funkcja do otwierania modalu edycji ceny przed wstawieniem usługi.
     */
    const handleEditPriceClick = (e: React.MouseEvent, service: SimpleService) => {
        e.stopPropagation();

        setServiceToEdit({
            id: service.id,
            name: service.name,
            price: {
                priceNetto: service.priceNetto,
                priceBrutto: service.priceNetto * 1.23, // Przykładowe wyliczenie
                taxAmount: service.priceNetto * 0.23
            },
            description: '',
            vatRate: 23,
            isNew: false
        });
        setIsPriceModalOpen(true);
    };

    const handleAddCustomService = () => {
        if (searchQuery.trim() === '') return;

        if (selectedServiceToAdd) {
            if (selectedServiceToAdd.priceNetto === 0) {
                setServiceToEdit({
                    id: selectedServiceToAdd.id,
                    name: selectedServiceToAdd.name,
                    price: {
                        priceNetto: 0,
                        priceBrutto: 0,
                        taxAmount: 0
                    },
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
                price: {
                    priceNetto: 0,
                    priceBrutto: 0,
                    taxAmount: 0
                },
                description: '',
                vatRate: 23,
                isNew: true
            });
            setIsPriceModalOpen(true);
        }
    };

    const handleSavePrice = async (inputPrice: number, inputType: PriceType) => {
        if (!serviceToEdit) return;

        try {
            setIsSubmitting(true);

            if (serviceToEdit.isNew) {
                try {
                    // Logika dodawania nowej usługi (custom-service)
                    const createdService = await servicesApi.createService({
                        name: serviceToEdit.name,
                        description: serviceToEdit.description || '',
                        price: {
                            inputPrice: inputPrice,
                            inputType: inputType
                        },
                        vatRate: serviceToEdit.vatRate || 23
                    });

                    // Backend zwraca Service z PriceResponse
                    const serviceWithRealId: SimpleService = {
                        id: createdService.id,
                        name: createdService.name,
                        priceNetto: createdService.price.priceNetto
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
                    // Fallback - użyj tymczasowej usługi
                    // W przypadku błędu API nie znamy dokładnej wartości netto, więc przyjmujemy inputPrice jako netto
                    const tempService: SimpleService = {
                        id: serviceToEdit.id,
                        name: serviceToEdit.name,
                        priceNetto: inputType === PriceType.NET ? inputPrice : inputPrice / 1.23
                    };
                    onSelectService(tempService);
                    onAddServiceDirect(tempService);
                }
            } else {
                // Logika aktualizacji/dodawania istniejącej usługi z inną ceną
                try {
                    const updatedService = await servicesApi.updateService(serviceToEdit.id, {
                        name: serviceToEdit.name,
                        description: serviceToEdit.description || '',
                        price: {
                            inputPrice: inputPrice,
                            inputType: inputType
                        },
                        vatRate: serviceToEdit.vatRate || 23
                    });

                    // Dodaj usługę do tabeli z zaktualizowaną ceną (backend zwraca przeliczoną wartość)
                    const simpleService: SimpleService = {
                        id: updatedService.id,
                        name: updatedService.name,
                        priceNetto: updatedService.price.priceNetto
                    };

                    onSelectService(simpleService);
                    onAddServiceDirect(simpleService);

                    if (onServiceAdded) {
                        setTimeout(() => {
                            onServiceAdded();
                        }, 1000);
                    }
                } catch (error) {
                    console.error('Błąd podczas aktualizacji usługi:', error);
                    // Fallback - użyj usługi z nową ceną
                    const fallbackService: SimpleService = {
                        id: serviceToEdit.id,
                        name: serviceToEdit.name,
                        priceNetto: inputType === PriceType.NET ? inputPrice : inputPrice / 1.23
                    };
                    onSelectService(fallbackService);
                    onAddServiceDirect(fallbackService);
                }
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
                                            {/* Lewa sekcja z nazwą i domyślną ceną netto */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 1, minWidth: 0 }}>
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {service.name}
                                                </div>
                                                <SearchResultPrice>
                                                    {service.priceNetto.toFixed(2)} zł
                                                </SearchResultPrice>
                                            </div>

                                            {/* Przycisk "Wstaw z inną ceną" */}
                                            <EditPriceButton
                                                onClick={(e) => handleEditPriceClick(e, service)}
                                            >
                                                <FaEuroSign /> Wstaw z inną ceną
                                            </EditPriceButton>
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
                                    {/* Lewa sekcja z nazwą i domyślną ceną netto */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 1, minWidth: 0 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {service.name}
                                        </div>
                                        <SearchResultPrice>
                                            {service.priceNetto.toFixed(2)} zł
                                        </SearchResultPrice>
                                    </div>

                                    {/* Przycisk "Wstaw z inną ceną" */}
                                    <EditPriceButton
                                        onClick={(e) => handleEditPriceClick(e, service)}
                                    >
                                        <FaEuroSign /> Wstaw z inną ceną
                                    </EditPriceButton>
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
                    onSave={(inputPrice, inputType) => {
                        void handleSavePrice(inputPrice, inputType);
                    }}
                    serviceName={serviceToEdit.name}
                    isNewService={serviceToEdit.isNew || false}
                    initialPrice={serviceToEdit.price.priceNetto}
                    initialPriceType={PriceType.NET}
                />
            )}
        </SearchContainer>
    );
};

export default ServiceSearch;