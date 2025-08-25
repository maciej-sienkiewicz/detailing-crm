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
    onServiceAdded?: () => void; // Nowa funkcja callback do odświeżenia listy usług
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
                                                         onServiceAdded
                                                     }) => {
    // Stan dla modalu edycji ceny
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<(Service & { isNew?: boolean }) | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allServices, setAllServices] = useState<Array<{ id: string; name: string; price: number }>>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Pobierz wszystkie usługi przy inicjalizacji komponentu
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

    // Sprawdzenie, czy to niestandardowa usługa
    const isCustomService = searchQuery.trim() !== '' &&
        searchResults.length === 0 &&
        !selectedServiceToAdd;

    // Obsługa kliknięcia na usługę z listy
    const handleServiceClick = (service: { id: string; name: string; price: number }) => {
        // Jeśli usługa ma cenę 0, pokaż modal do wprowadzenia ceny
        if (service.price === 0) {
            setServiceToEdit({
                ...service,
                description: '',
                vatRate: 23,
                isNew: false
            });
            setIsPriceModalOpen(true);
        } else {
            // Dla usług z ceną > 0, dodaj usługę bezpośrednio
            onSelectService(service);
            onAddServiceDirect(service);
        }
    };

    // Obsługa dodania usługi po wprowadzeniu niestandardowego tekstu
    const handleAddCustomService = () => {
        if (searchQuery.trim() === '') return;

        // Jeśli wybrano usługę z listy
        if (selectedServiceToAdd) {
            // Jeśli usługa ma cenę 0, pokaż modal
            if (selectedServiceToAdd.price === 0) {
                setServiceToEdit({
                    ...selectedServiceToAdd,
                    description: '',
                    vatRate: 23,
                    isNew: false
                });
                setIsPriceModalOpen(true);
            } else {
                // Dla usług z ceną > 0, dodaj usługę
                onAddService();
            }
        } else if (allowCustomService && isCustomService) {
            // Dla niestandardowych usług, pokaż modal do wprowadzenia ceny
            setServiceToEdit({
                id: `custom-${Date.now()}`,
                name: searchQuery.trim(),
                price: 0,
                description: '',
                vatRate: 23,
                isNew: true
            });
            setIsPriceModalOpen(true);
        }
    };

    // Obsługa zapisania ceny z modalu
    const handleSavePrice = async (price: number) => {
        if (!serviceToEdit) return;

        try {
            setIsSubmitting(true);

            // Jeśli to nowa usługa (nie istnieje w bazie)
            if (serviceToEdit.isNew) {
                try {
                    console.log("Tworzenie nowej usługi w bazie:", serviceToEdit.name, price);

                    // Stwórz nową usługę przez API - dane o usłudze będą już sformatowane
                    // przez servicesApi.createService dla formatu {value: "id"}
                    const createdService = await servicesApi.createService({
                        name: serviceToEdit.name,
                        description: serviceToEdit.description || '',
                        price: price,
                        vatRate: serviceToEdit.vatRate || 23
                    });

                    console.log("Utworzono nową usługę:", createdService);

                    // Dodaj nowo utworzoną usługę do protokołu
                    onSelectService(createdService);
                    onAddServiceDirect(createdService);

                    // Odświeżamy listę usług po 1 sekundzie
                    setTimeout(() => {
                        if (onServiceAdded) {
                            console.log("Odświeżanie listy usług po utworzeniu nowej");
                            onServiceAdded();
                        }
                    }, 1000);
                } catch (error) {
                    console.error('Błąd podczas dodawania nowej usługi:', error);
                    // Nawet jeśli wystąpił błąd przy dodawaniu do bazy, dodajmy usługę do protokołu
                    const tempService = {
                        id: serviceToEdit.id,
                        name: serviceToEdit.name,
                        price: price
                    };
                    onSelectService(tempService);
                    onAddServiceDirect(tempService);
                }
            } else {
                // Jeśli to istniejąca usługa, tylko zaktualizuj cenę
                const updatedService = {
                    ...serviceToEdit,
                    price: price
                };

                try {
                    // Zaktualizuj usługę przez API
                    await servicesApi.updateService(serviceToEdit.id, {
                        name: updatedService.name,
                        description: updatedService.description || '',
                        price: price,
                        vatRate: updatedService.vatRate || 23
                    });

                    // Planujemy odświeżenie listy usług na później
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
            // Zamykamy modal
            setIsPriceModalOpen(false);
            setServiceToEdit(null);
            setIsSubmitting(false);
        }
    };

    // Obsługa focus i blur na polu wyszukiwania
    const handleInputFocus = () => {
        setIsInputFocused(true);

        // Wyświetl wszystkie usługi, gdy pole jest puste i otrzyma focus
        if (searchQuery.trim() === '') {
            onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const handleInputBlur = () => {
        // Opóźnij ukrycie wyników, aby umożliwić kliknięcie na nich
        setTimeout(() => {
            setIsInputFocused(false);
        }, 200);
    };

    // Ustal, czy pokazać wyniki wyszukiwania
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
                            // Pokaż wszystkie dostępne usługi, gdy pole jest puste
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
                            // Pokaż wyniki wyszukiwania, gdy pole nie jest puste
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

            {/* Modal edycji ceny */}
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