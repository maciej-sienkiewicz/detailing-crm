import React from 'react';
import { CarReceptionProtocol } from '../../../../types';
import { FormErrors } from '../hooks/useFormValidation';
import {
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    ErrorText,
    Input,
} from '../styles';

import SearchField from './SearchField';
import {LabelWithBadge} from "./LabelWithBadge";

interface ClientInfoSectionProps {
    formData: Partial<CarReceptionProtocol>;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSearchByField?: (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => void;
    readOnly?: boolean;
}

const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
                                                                 formData,
                                                                 errors,
                                                                 onChange,
                                                                 onSearchByField,
                                                                 readOnly = false
                                                             }) => {
    const handleSearchClick = (field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => {
        if (onSearchByField && !readOnly) {
            onSearchByField(field);
        }
    };

    const hasContactInfo = !!formData.phone || !!formData.email;

    const renderField = (
        id: string,
        name: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone',
        value: string,
        placeholder: string,
        required: boolean = false,
        error?: string,
        type: 'text' | 'email' | 'phone' = 'text'
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
                    $hasError={!!error}
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
                type={type}
            />
        );
    };

    return (
        <FormSection>
            <SectionTitle>Dane właściciela pojazdu</SectionTitle>
            <FormRow className="responsive-row">
                <FormGroup style={{ gridColumn: '1 / 3' }}>
                    <LabelWithBadge htmlFor="ownerName" required badgeVariant="modern">
                        Imię i nazwisko właściciela
                    </LabelWithBadge>
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
                    <LabelWithBadge
                        htmlFor="email"
                        required={!formData.phone}
                        optional={!!formData.phone}
                        badgeVariant="modern"
                    >
                        Adres e-mail
                    </LabelWithBadge>
                    {renderField(
                        "email",
                        "email",
                        formData.email || '',
                        "np. jan.kowalski@example.com",
                        !formData.phone,
                        errors.email,
                        'email'
                    )}
                </FormGroup>

                <FormGroup>
                    <LabelWithBadge
                        htmlFor="phone"
                        required={!formData.email}
                        optional={!!formData.email}
                        badgeVariant="modern"
                    >
                        Numer telefonu
                    </LabelWithBadge>
                    {renderField(
                        "phone",
                        "phone",
                        formData.phone || '',
                        "123 456 789",
                        !formData.email,
                        errors.phone,
                        'phone'
                    )}
                </FormGroup>
            </FormRow>

            <FormRow className="responsive-row">
                <FormGroup style={{ gridColumn: '1 / 3' }}>
                    <label htmlFor="address">
                        Adres
                    </label>
                    {readOnly ? (
                        <Input
                            id="address"
                            name="address"
                            value={formData.address || ''}
                            placeholder="np. ul. Przykładowa 123, 00-001 Warszawa"
                            readOnly={true}
                            style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}
                            $hasError={!!errors.address}
                        />
                    ) : (
                        <Input
                            id="address"
                            name="address"
                            value={formData.address || ''}
                            onChange={onChange}
                            placeholder="np. ul. Przykładowa 123, 00-001 Warszawa"
                            $hasError={!!errors.address}
                        />
                    )}
                    {errors.address && <ErrorText>{errors.address}</ErrorText>}
                </FormGroup>
            </FormRow>

            <FormRow className="responsive-row">
                <FormGroup>
                    <label htmlFor="companyName">
                        Nazwa firmy
                    </label>
                    {renderField(
                        "companyName",
                        "companyName",
                        formData.companyName || '',
                        "np. AutoDetailing Sp. z o.o."
                    )}
                </FormGroup>

                <FormGroup>
                    <label htmlFor="taxId">
                        NIP firmy
                    </label>
                    {renderField(
                        "taxId",
                        "taxId",
                        formData.taxId || '',
                        "np. 1234567890"
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