// src/pages/Protocols/form/components/ClientInfoSection.tsx
import React from 'react';
import { CarReceptionProtocol } from '../../../../types';
import { FormErrors } from '../hooks/useFormValidation';
import {
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    Label,
    ErrorText,
    Input // Dodajemy Input na wypadek, gdybyśmy potrzebowali go zamiast SearchField
} from '../styles';

// Import komponentu pola wyszukiwania
import SearchField from './SearchField';

interface ClientInfoSectionProps {
    formData: Partial<CarReceptionProtocol>;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSearchByField?: (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => void;
    readOnly?: boolean; // Dodajemy opcjonalną właściwość readOnly
}

const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
                                                                 formData,
                                                                 errors,
                                                                 onChange,
                                                                 onSearchByField,
                                                                 readOnly = false // Domyślnie false
                                                             }) => {
    const handleSearchClick = (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => {
        if (onSearchByField && !readOnly) {
            onSearchByField(field);
        }
    };

    // Sprawdzenie, czy którekolwiek z pól kontaktowych jest wypełnione
    const hasContactInfo = !!formData.phone || !!formData.email;

    // Funkcja renderująca pole - zależnie od readOnly użyje Input lub SearchField
    const renderField = (
        id: string,
        name: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone',
        value: string,
        placeholder: string,
        required: boolean = false,
        error?: string
    ) => {
        if (readOnly) {
            return (
                <Input
                    id={id}
                    name={name}
                    value={value || ''}
                    placeholder={placeholder}
                    required={required}
                    readOnly={true}
                    style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}
                />
            );
        }

        return (
            <SearchField
                id={id}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                onSearchClick={() => handleSearchClick(name)}
                error={error}
            />
        );
    };

    return (
        <FormSection>
            <SectionTitle>Dane właściciela</SectionTitle>
            <FormRow className="responsive-row">
                <FormGroup>
                    <Label htmlFor="ownerName">Imię i nazwisko*</Label>
                    {renderField(
                        "ownerName",
                        "ownerName",
                        formData.ownerName || '',
                        "np. Jan Kowalski",
                        true,
                        errors.ownerName
                    )}
                </FormGroup>
            </FormRow>

            <FormRow className="responsive-row">
                <FormGroup>
                    <Label htmlFor="companyName">Nazwa firmy</Label>
                    {renderField(
                        "companyName",
                        "companyName",
                        formData.companyName || '',
                        "np. AutoFirma Sp. z o.o."
                    )}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="taxId">NIP</Label>
                    {renderField(
                        "taxId",
                        "taxId",
                        formData.taxId || '',
                        "np. 1234567890"
                    )}
                </FormGroup>
            </FormRow>

            <FormRow className="responsive-row">
                <FormGroup>
                    <Label htmlFor="email">Email{!formData.phone ? '*' : ''}</Label>
                    {renderField(
                        "email",
                        "email",
                        formData.email || '',
                        "np. jan.kowalski@example.com",
                        !formData.phone,
                        errors.email
                    )}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="phone">Telefon{!formData.email ? '*' : ''}</Label>
                    {renderField(
                        "phone",
                        "phone",
                        formData.phone || '',
                        "np. +48 123 456 789",
                        !formData.email,
                        errors.phone
                    )}
                </FormGroup>
            </FormRow>

            {!hasContactInfo && errors.contactInfo && (
                <ErrorText style={{ marginTop: '5px' }}>
                    {errors.contactInfo}
                </ErrorText>
            )}
        </FormSection>
    );
};

export default ClientInfoSection;