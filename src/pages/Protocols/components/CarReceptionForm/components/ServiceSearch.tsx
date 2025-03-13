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
    AddServiceButton
} from '../styles/styles';

interface ServiceSearchProps {
    searchQuery: string;
    showResults: boolean;
    searchResults: Array<{ id: string; name: string; price: number }>;
    selectedServiceToAdd: { id: string; name: string; price: number } | null;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectService: (service: { id: string; name: string; price: number }) => void;
    onAddService: () => void;
}

const ServiceSearch: React.FC<ServiceSearchProps> = ({
                                                         searchQuery,
                                                         showResults,
                                                         searchResults,
                                                         selectedServiceToAdd,
                                                         onSearchChange,
                                                         onSelectService,
                                                         onAddService
                                                     }) => {
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
                                onClick={() => onSelectService(service)}
                            >
                                <div>{service.name}</div>
                                <SearchResultPrice>{service.price.toFixed(2)} zł</SearchResultPrice>
                            </SearchResultItem>
                        ))}
                    </SearchResultsList>
                )}
            </SearchInputGroup>

            <AddServiceButton
                type="button"
                onClick={onAddService}
                disabled={!selectedServiceToAdd}
            >
                <FaPlus /> Dodaj usługę
            </AddServiceButton>
        </SearchContainer>
    );
};

export default ServiceSearch;