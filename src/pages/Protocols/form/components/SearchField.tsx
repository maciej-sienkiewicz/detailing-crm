// src/pages/Protocols/form/components/SearchField.tsx
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
    type?: 'text' | 'email' | 'phone';
}

const SearchField: React.FC<SearchFieldProps> = ({
                                                     id,
                                                     name,
                                                     value,
                                                     placeholder,
                                                     required,
                                                     onChange,
                                                     onSearchClick,
                                                     error,
                                                     type = 'text'
                                                 }) => {
    // Funkcja obsługująca kliknięcie przycisku wyszukiwania
    const handleSearchButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onSearchClick();
    };

    // Specjalna obsługa dla pola telefonu
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'phone') {
            let inputValue = e.target.value;

            // Usuń wszystkie znaki oprócz cyfr
            inputValue = inputValue.replace(/[^\d]/g, '');

            // Formatuj numer - dodaj spacje co 3 cyfry dla lepszej czytelności
            if (inputValue.length > 0) {
                inputValue = inputValue.replace(/(\d{3})(?=\d)/g, '$1 ');
            }

            // Ograniczenie do 11 cyfr (9 cyfr polskiego numeru + opcjonalnie 2 dodatkowe)
            if (inputValue.replace(/\s/g, '').length > 11) {
                return;
            }

            // Tworzenie syntetycznego eventu z oczyszczoną wartością
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    name,
                    value: inputValue
                }
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(syntheticEvent);
        } else {
            onChange(e);
        }
    };

    return (
        <FieldContainer>
            <InputWithIcon>
                {type === 'phone' && <PhonePrefix>+48</PhonePrefix>}
                <Input
                    id={id}
                    name={name}
                    type={type === 'email' ? 'email' : 'text'}
                    value={value}
                    onChange={handlePhoneChange}
                    placeholder={placeholder}
                    required={required}
                    $hasError={!!error}
                    $isPhone={type === 'phone'}
                    autoComplete={type === 'email' ? 'email' : type === 'phone' ? 'tel' : 'off'}
                    inputMode={type === 'phone' ? 'numeric' : undefined}
                />
                <SearchIcon
                    onClick={handleSearchButtonClick}
                    title={`Wyszukaj w bazie klientów po ${
                        type === 'email' ? 'adresie email' :
                            type === 'phone' ? 'numerze telefonu' :
                                name === 'ownerName' ? 'imieniu i nazwisku' :
                                    name === 'companyName' ? 'nazwie firmy' :
                                        name === 'taxId' ? 'numerze NIP' : 'polu'
                    }`}
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

const PhonePrefix = styled.span`
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${brandTheme.text.muted};
    font-weight: 500;
    font-size: 14px;
    pointer-events: none;
    z-index: 2;
`;

const Input = styled.input<{ $hasError?: boolean; $isPhone?: boolean }>`
    width: 100%;
    height: 44px;
    padding: 0 48px 0 ${props => props.$isPhone ? '48px' : brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};
    ${props => props.$isPhone && 'font-variant-numeric: tabular-nums;'}

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