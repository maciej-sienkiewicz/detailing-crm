// src/components/common/LicensePlateField.tsx
import React, {useState} from 'react';
import styled from 'styled-components';
import {FaSearch} from 'react-icons/fa';
import {useToast} from './Toast/Toast';

interface LicensePlateFieldProps {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    onSearchClick: () => void;
    error?: string;
    readOnly?: boolean;
}

const LicensePlateField: React.FC<LicensePlateFieldProps> = ({
                                                                 id,
                                                                 name,
                                                                 value,
                                                                 onChange,
                                                                 placeholder = "np. WA12345",
                                                                 required = false,
                                                                 onSearchClick,
                                                                 error,
                                                                 readOnly = false
                                                             }) => {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const { showToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const originalValue = e.target.value;

        // If the field is becoming empty, clear errors
        if (originalValue === '') {
            setHasError(false);
            setErrorMessage(null);

            // Call onChange with the empty value
            onChange(e);
            return;
        }

        // Check if there are spaces being added
        const hasSpaces = originalValue.includes(' ');

        // Remove spaces from license plate and convert to uppercase
        const inputValue = originalValue.replace(/\s+/g, '').toUpperCase();

        // Create a synthetic event with the modified value
        const syntheticEvent = {
            ...e,
            target: { ...e.target, value: inputValue, name: e.target.name }
        } as React.ChangeEvent<HTMLInputElement>;

        // Call the original onChange function with the modified value
        onChange(syntheticEvent);

        // Handle validation
        if (hasSpaces) {
            setHasError(true);
            setErrorMessage('Tablica rejestracyjna nie może zawierać spacji');

            // Only show toast if this is a new error or first occurrence
            if (!hasError || errorMessage !== 'Tablica rejestracyjna nie może zawierać spacji') {
                showToast('error', 'Tablica rejestracyjna nie może zawierać spacji', 3000);
            }
        } else {
            // Clear the space error if it was previously set
            if (errorMessage === 'Tablica rejestracyjna nie może zawierać spacji') {
                setHasError(false);
                setErrorMessage(null);
            }

            // Only perform other validations if the field has been touched
            if (touched) {
                const isValidFormat = /^[A-Z]{2,3}[A-Z0-9]{4,5}$/.test(inputValue);

                if (!isValidFormat && inputValue.length > 0) {
                    setHasError(true);
                    setErrorMessage('Nieprawidłowy format tablicy rejestracyjnej');
                } else {
                    setHasError(false);
                    setErrorMessage(null);
                }
            }
        }
    };

    const handleBlur = () => {
        setTouched(true);

        // Clear validation if empty
        if (!value || value.trim() === '') {
            if (required) {
                setHasError(true);
                setErrorMessage('Tablica rejestracyjna jest wymagana');
                showToast('error', 'Tablica rejestracyjna jest wymagana', 3000);
            } else {
                setHasError(false);
                setErrorMessage(null);
            }
            return;
        }

        // Check for spaces - should be redundant as they're removed, but keep as a safety check
        if (value.includes(' ')) {
            setHasError(true);
            setErrorMessage('Tablica rejestracyjna nie może zawierać spacji');
            showToast('error', 'Tablica rejestracyjna nie może zawierać spacji', 3000);
            return;
        }

        // Format validation
        const isValidFormat = /^[A-Z]{2,3}[A-Z0-9]{4,5}$/.test(value);
        if (!isValidFormat) {
            setHasError(true);
            setErrorMessage('Nieprawidłowy format tablicy rejestracyjnej');
            showToast('error', 'Nieprawidłowy format tablicy rejestracyjnej', 3000);
        } else {
            setHasError(false);
            setErrorMessage(null);
        }
    };

    const handleSearchButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onSearchClick();
    };

    return (
        <FieldContainer>
            <InputWithIcon>
                <StyledInput
                    id={id}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    hasError={hasError}
                    readOnly={readOnly}
                />
                <SearchIcon
                    onClick={handleSearchButtonClick}
                    title="Wyszukaj w bazie"
                    type="button"
                    disabled={readOnly}
                >
                    <FaSearch />
                </SearchIcon>
            </InputWithIcon>
            {hasError && errorMessage && <ErrorText>{errorMessage}</ErrorText>}
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

const StyledInput = styled.input<{ hasError: boolean; readOnly?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${(props) => (props.hasError ? '#e74c3c' : '#ddd')};
  border-radius: 4px;
  font-size: 14px;
  transition: border 0.2s ease, box-shadow 0.2s ease;
  background-color: ${(props) => (props.readOnly ? '#f9f9f9' : 'white')};
  cursor: ${(props) => (props.readOnly ? 'not-allowed' : 'text')};

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? '#e74c3c' : '#3498db')};
    box-shadow: 0 0 0 2px ${(props) => (props.hasError ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)')};
  }
`;

const SearchIcon = styled.button<{ disabled?: boolean }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.disabled ? '#ccc' : '#7f8c8d'};
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover {
    color: ${props => props.disabled ? '#ccc' : '#3498db'};
    background-color: ${props => props.disabled ? 'transparent' : 'rgba(52, 152, 219, 0.1)'};
  }
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;

export default LicensePlateField;