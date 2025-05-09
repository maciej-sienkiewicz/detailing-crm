// src/components/common/PhoneInput.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useToast } from './Toast/Toast';

interface PhoneInputProps {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    readOnly?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
                                                   id,
                                                   name,
                                                   value,
                                                   onChange,
                                                   placeholder = "np. +48123456789",
                                                   required = false,
                                                   error,
                                                   readOnly = false
                                               }) => {
    const [hasError, setHasError] = useState(false);
    const [touched, setTouched] = useState(false);
    const { showToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove spaces from phone number
        const inputValue = e.target.value.replace(/\s+/g, '');

        // Create a synthetic event with the modified value
        const syntheticEvent = {
            ...e,
            target: { ...e.target, value: inputValue, name: e.target.name }
        } as React.ChangeEvent<HTMLInputElement>;

        // Call the original onChange function with the modified value
        onChange(syntheticEvent);

        // Validate the input
        if (touched) {
            // Basic validation - check if empty when required
            let isValid = !required || inputValue.trim() !== '';

            // Additional validation if the field has a value
            if (isValid && inputValue.trim() !== '') {
                // Check for valid phone number format (basic check)
                isValid = /^[+]?[\d()-]{8,}$/.test(inputValue);
            }

            setHasError(!isValid);

            if (!isValid && error && !hasError) {
                showToast('error', error, 3000);
            }
        }
    };

    const handleBlur = () => {
        setTouched(true);

        // Validate on blur
        let isValid = !required || value.trim() !== '';

        if (isValid && value.trim() !== '') {
            isValid = /^[+]?[\d()-]{8,}$/.test(value);
        }

        setHasError(!isValid);

        if (!isValid && error) {
            showToast('error', error, 3000);
        }
    };

    return (
        <InputContainer>
            <StyledInput
                id={id}
                name={name}
                type="tel"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                required={required}
                hasError={hasError}
                readOnly={readOnly}
            />
            {error && hasError && <ErrorText>{error}</ErrorText>}
        </InputContainer>
    );
};

const InputContainer = styled.div`
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

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;

export default PhoneInput;