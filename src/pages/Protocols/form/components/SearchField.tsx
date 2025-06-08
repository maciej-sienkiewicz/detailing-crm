import React from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { brandTheme } from '../styles';

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
                    $hasError={!!error}
                />
                <SearchIcon
                    onClick={handleSearchButtonClick}
                    title="Wyszukaj w bazie klientów"
                    type="button"
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

const Input = styled.input<{ $hasError?: boolean }>`
    width: 100%;
    height: 44px;
    padding: 0 48px 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? brandTheme.status.errorLight : brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const SearchIcon = styled.button`
    position: absolute;
    right: ${brandTheme.spacing.sm};
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    background: ${brandTheme.primaryGhost};
    border: 1px solid ${brandTheme.primary}30;
    color: ${brandTheme.primary};
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.primary};
        color: white;
        border-color: ${brandTheme.primary};
        transform: translateY(-50%) translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }

    &:active {
        transform: translateY(-50%) translateY(0);
    }
`;

const ErrorText = styled.div`
    color: ${brandTheme.status.error};
    font-size: 12px;
    font-weight: 500;
    margin-top: ${brandTheme.spacing.xs};
`;

export default SearchField;