import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import {
    SearchContainer,
    SearchInputGroup,
    SearchInputWrapper,
    SearchIcon,
    SearchInput,
    SearchResultsList,
    SearchResultItem,
    SearchResultPrice,
    AddServiceButton,
    CustomServiceInfo
} from '../styles';
import PriceEditModal from "../../shared/modals/PriceEditModal";

interface ServiceSearchProps {
    searchQuery: string;
    showResults: boolean;
    searchResults: Array<{ id: string; name: string; price: number }>;
    selectedServiceToAdd: { id: string; name: string; price: number } | null;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectService: (service: { id: string; name: string; price: number }) => void;
    onAddService: () => void;
    onAddServiceDirect: (service: { id: string; name: string; price: number }) => void;
    allowCustomService: boolean;
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
                                                         allowCustomService
                                                     }) => {
    const isCustomService = searchQuery.trim() !== '' &&
        searchResults.length === 0 &&
        !selectedServiceToAdd;

    // Stan dla modalu edycji ceny
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<{ id: string; name: string; price: number; isNew: boolean } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Funkcja obsługująca kliknięcie na usługę z listy
    const handleServiceClick = (service: { id: string; name: string; price: number }) => {
        // Jeśli usługa ma cenę 0, pokaż modal do wprowadzenia ceny
        if (service.price === 0) {
            setServiceToEdit({
                id: service.id,
                name: service.name,
                price: service.price,
                isNew: false
            });
            setIsPriceModalOpen(true);
        } else {
            // Dla usług z ceną > 0, zachowaj standardowe zachowanie
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
                    id: selectedServiceToAdd.id,
                    name: selectedServiceToAdd.name,
                    price: selectedServiceToAdd.price,
                    isNew: false
                });
                setIsPriceModalOpen(true);
            } else {
                // Dla usług z ceną > 0, zachowaj standardowe zachowanie
                onAddService();
            }
        } else if (allowCustomService && isCustomService) {
            // Dla niestandardowych usług, pokaż modal do wprowadzenia ceny
            setServiceToEdit({
                id: `custom-${Date.now()}`,
                name: searchQuery.trim(),
                price: 0,
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
                // Tutaj miejsce na zapytanie do API, aby dodać nową usługę
                try {
                    // Przykładowa integracja z API - dostosuj do rzeczywistego API
                    // const createdService = await servicesApi.createService({
                    //    name: serviceToEdit.name,
                    //    price: price
                    // });

                    // Dla teraz, symulujemy odpowiedź
                    const createdService = {
                        id: serviceToEdit.id,
                        name: serviceToEdit.name,
                        price: price
                    };

                    // Dodaj nowo utworzoną usługę do protokołu
                    onAddServiceDirect(createdService);
                } catch (error) {
                    console.error('Błąd podczas dodawania nowej usługi:', error);
                    // Nawet jeśli wystąpił błąd przy dodawaniu do bazy, dodajmy usługę do protokołu
                    onAddServiceDirect({
                        id: serviceToEdit.id,
                        name: serviceToEdit.name,
                        price: price
                    });
                }
            } else {
                // Jeśli to istniejąca usługa, tylko zaktualizuj cenę
                onAddServiceDirect({
                    id: serviceToEdit.id,
                    name: serviceToEdit.name,
                    price: price
                });
            }

            // Wyczyść pole wyszukiwania
            onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);

        } catch (error) {
            console.error('Błąd podczas przetwarzania usługi:', error);
        } finally {
            setIsPriceModalOpen(false);
            setServiceToEdit(null);
            setIsSubmitting(false);
        }
    };

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
                        onFocus={() => showResults}
                    />
                </SearchInputWrapper>

                {showResults && searchResults.length > 0 && (
                    <SearchResultsList>
                        {searchResults.map(service => (
                            <SearchResultItem
                                key={service.id}
                                onClick={() => handleServiceClick(service)}
                            >
                                <div>{service.name}</div>
                                <SearchResultPrice>{service.price.toFixed(2)} zł</SearchResultPrice>
                            </SearchResultItem>
                        ))}
                    </SearchResultsList>
                )}

                {isCustomService && allowCustomService && (
                    <CustomServiceInfo>
                        Usługa niestandardowa - po dodaniu należy ustawić cenę
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
                        void handleSavePrice(price); // Ignorujemy Promise
                    }}
                    serviceName={serviceToEdit.name}
                    isNewService={serviceToEdit.isNew}
                    initialPrice={serviceToEdit.price}
                />
            )}
        </SearchContainer>
    );
};

export default ServiceSearch;