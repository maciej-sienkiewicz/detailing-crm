import React from 'react';
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
} from '../styles/styles';

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

    // Funkcja obsługująca kliknięcie na usługę z listy - od razu dodaje usługę
    const handleServiceClick = (service: { id: string; name: string; price: number }) => {
        // Najpierw aktualizujemy stan wybranej usługi (dla zachowania kompatybilności)
        onSelectService(service);
        // Od razu dodajemy usługę do tabeli
        onAddServiceDirect(service);
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
                onClick={onAddService}
                disabled={!(selectedServiceToAdd || (allowCustomService && searchQuery.trim() !== ''))}
            >
                <FaPlus /> Dodaj usługę
            </AddServiceButton>
        </SearchContainer>
    );
};

export default ServiceSearch;