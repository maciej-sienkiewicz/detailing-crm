import React from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';

interface SearchFieldProps {
    id: string;
    name: string;
    value: string;
    placeholder: string;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchClick: () => void;
    error?: string;
}

const SearchField: React.FC<SearchFieldProps> = ({
                                                     id,
                                                     name,
                                                     value,
                                                     placeholder,
                                                     required,
                                                     onChange,
                                                     onSearchClick,
                                                     error
                                                 }) => {

    // Funkcja obsługująca kliknięcie przycisku wyszukiwania
    const handleSearchButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Zapobiegamy domyślnej akcji przycisku wewnątrz formularza
        e.preventDefault();
        // Zapobiegamy propagacji zdarzenia do formularza
        e.stopPropagation();
        // Wywołujemy naszą funkcję wyszukiwania
        onSearchClick();
    };

    return (
        <FieldContainer>
            <InputWithIcon>
                <Input
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                />
                <SearchIcon
                    onClick={handleSearchButtonClick}
                    title="Wyszukaj w bazie"
                    type="button" // Wyraźnie ustawiamy typ na "button", aby zapobiec wysłaniu formularza
                >
                    <FaSearch />
                </SearchIcon>
            </InputWithIcon>
            {error && <ErrorText>{error}</ErrorText>}
        </FieldContainer>
    );
};

const FieldContainer = styled.div`
    width: 100%;
`;

const InputWithIcon = styled.div`
    position: relative;
    width: 100%;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
    padding-right: 40px; /* Space for the icon */

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const SearchIcon = styled.button`
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #7f8c8d;
    font-size: 16px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: #3498db;
        background-color: rgba(52, 152, 219, 0.1);
    }
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;

export default SearchField;