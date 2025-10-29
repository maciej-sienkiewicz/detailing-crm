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
import {Service} from '../../../../types';
import {servicesApi} from "../../../../api/servicesApi";

const EditPriceButton = styled.button.attrs({
    type: 'button', // KLUCZOWA ZMIANA: zapobiega domyślnemu submitowaniu formularza
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
    margin-left: 12px; /* Dystans od ceny */
    white-space: nowrap;

    &:hover {
        background: #0ea5e9;
        color: white;
        border-color: #0ea5e9;
        transform: translateY(-0.5px);
    }
`;


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

    /**
     * Funkcja do otwierania modalu edycji ceny przed wstawieniem usługi.
     */
    const handleEditPriceClick = (e: React.MouseEvent, service: { id: string; name: string; price: number }) => {
        e.stopPropagation(); // Zatrzymuje propagację, aby nie uruchomić handleServiceClick

        setServiceToEdit({
            ...service,
            description: '',
            vatRate: 23,
            isNew: false
        });
        setIsPriceModalOpen(true);
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
                    // Logika dodawania nowej usługi (custom-service)
                    const createdService = await servicesApi.createService({
                        name: serviceToEdit.name,
                        description: serviceToEdit.description || '',
                        price: price, // Netto z modala
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
                // Logika aktualizacji/dodawania istniejącej usługi z inną ceną
                const updatedService = {
                    ...serviceToEdit,
                    price: price // Nowa cena z modala (już netto)
                };

                // Opcjonalnie: aktualizacja ceny w bazie (jeśli zależy nam na persystencji nowej ceny)
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

                // Dodaj usługę do tabeli z nową ceną
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
                                            {/* Lewa sekcja z nazwą i domyślną ceną */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 1, minWidth: 0 }}>
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.name}</div>
                                                <SearchResultPrice>{service.price.toFixed(2)} zł</SearchResultPrice>
                                            </div>

                                            {/* Nowy przycisk "Wstaw z inną ceną" */}
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
                                    {/* Lewa sekcja z nazwą i domyślną ceną */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 1, minWidth: 0 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.name}</div>
                                        <SearchResultPrice>{service.price.toFixed(2)} zł</SearchResultPrice>
                                    </div>

                                    {/* Nowy przycisk "Wstaw z inną ceną" */}
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