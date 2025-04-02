import React from 'react';
import { CarReceptionProtocol } from '../../../../types';
import { FormErrors } from '../hooks/useFormValidation';
import {
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    Label,
    ErrorText
} from '../styles';

// Import komponentu pola wyszukiwania
import SearchField from './SearchField';

interface ClientInfoSectionProps {
    formData: Partial<CarReceptionProtocol>;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSearchByField?: (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => void;
}

const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
                                                                 formData,
                                                                 errors,
                                                                 onChange,
                                                                 onSearchByField
                                                             }) => {
    const handleSearchClick = (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => {
        if (onSearchByField) {
            onSearchByField(field);
        }
    };

    // Sprawdzenie, czy którekolwiek z pól kontaktowych jest wypełnione
    const hasContactInfo = !!formData.phone || !!formData.email;

    return (
        <FormSection>
            <SectionTitle>Dane właściciela</SectionTitle>
            <FormRow className="responsive-row">
                <FormGroup>
                    <Label htmlFor="ownerName">Imię i nazwisko*</Label>
                    <SearchField
                        id="ownerName"
                        name="ownerName"
                        value={formData.ownerName || ''}
                        onChange={onChange}
                        placeholder="np. Jan Kowalski"
                        required
                        onSearchClick={() => handleSearchClick('ownerName')}
                        error={errors.ownerName}
                    />
                </FormGroup>
            </FormRow>

            <FormRow className="responsive-row">
                <FormGroup>
                    <Label htmlFor="companyName">Nazwa firmy</Label>
                    <SearchField
                        id="companyName"
                        name="companyName"
                        value={formData.companyName || ''}
                        onChange={onChange}
                        placeholder="np. AutoFirma Sp. z o.o."
                        onSearchClick={() => handleSearchClick('companyName')}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="taxId">NIP</Label>
                    <SearchField
                        id="taxId"
                        name="taxId"
                        value={formData.taxId || ''}
                        onChange={onChange}
                        placeholder="np. 1234567890"
                        onSearchClick={() => handleSearchClick('taxId')}
                    />
                </FormGroup>
            </FormRow>

            <FormRow className="responsive-row">
                <FormGroup>
                    <Label htmlFor="email">Email{!formData.phone ? '*' : ''}</Label>
                    <SearchField
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={onChange}
                        placeholder="np. jan.kowalski@example.com"
                        required={!formData.phone}
                        onSearchClick={() => handleSearchClick('email')}
                        error={errors.email}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="phone">Telefon{!formData.email ? '*' : ''}</Label>
                    <SearchField
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={onChange}
                        placeholder="np. +48 123 456 789"
                        required={!formData.email}
                        onSearchClick={() => handleSearchClick('phone')}
                        error={errors.phone}
                    />
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