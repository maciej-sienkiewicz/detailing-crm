import React from 'react';
import { CarReceptionProtocol } from '../../../../../types';
import { FormErrors } from '../hooks/useFormValidation';
import {
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    Label,
    Input,
    ErrorText
} from '../styles/styles';

interface ClientInfoSectionProps {
    formData: Partial<CarReceptionProtocol>;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
                                                                 formData,
                                                                 errors,
                                                                 onChange
                                                             }) => {
    return (
        <FormSection>
            <SectionTitle>Dane właściciela</SectionTitle>
            <FormRow>
                <FormGroup>
                    <Label htmlFor="ownerName">Imię i nazwisko*</Label>
                    <Input
                        id="ownerName"
                        name="ownerName"
                        value={formData.ownerName || ''}
                        onChange={onChange}
                        placeholder="np. Jan Kowalski"
                        required
                    />
                    {errors.ownerName && <ErrorText>{errors.ownerName}</ErrorText>}
                </FormGroup>
            </FormRow>

            <FormRow>
                <FormGroup>
                    <Label htmlFor="companyName">Nazwa firmy</Label>
                    <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName || ''}
                        onChange={onChange}
                        placeholder="np. AutoFirma Sp. z o.o."
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="taxId">NIP</Label>
                    <Input
                        id="taxId"
                        name="taxId"
                        value={formData.taxId || ''}
                        onChange={onChange}
                        placeholder="np. 1234567890"
                    />
                </FormGroup>
            </FormRow>

            <FormRow>
                <FormGroup>
                    <Label htmlFor="email">Email*</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={onChange}
                        placeholder="np. jan.kowalski@example.com"
                        required
                    />
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="phone">Telefon*</Label>
                    <Input
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={onChange}
                        placeholder="np. +48 123 456 789"
                        required
                    />
                    {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                </FormGroup>
            </FormRow>
        </FormSection>
    );
};

export default ClientInfoSection;