// src/pages/Protocols/form/components/DeliveryPersonSection.tsx
import React from 'react';
import { AutocompleteOption } from '../../components/AutocompleteField';
import { AutocompleteField } from '../../components/AutocompleteField';
import { FormErrors } from '../hooks/useFormValidation';
import { DeliveryPerson } from '../../../../types';
import {
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    CheckboxGroup,
    CheckboxLabel,
    Checkbox,
    ErrorText,
    brandTheme
} from '../styles';
import { LabelWithBadge } from './LabelWithBadge';

interface DeliveryPersonSectionProps {
    isDeliveryPersonDifferent: boolean;
    deliveryPerson: DeliveryPerson | null;
    errors: FormErrors;
    onDeliveryPersonToggle: (enabled: boolean) => void;
    onDeliveryPersonNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeliveryPersonPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autocompleteOptions: AutocompleteOption[];
    onAutocompleteSelect: (option: AutocompleteOption, fieldType: string) => void;
}

export const DeliveryPersonSection: React.FC<DeliveryPersonSectionProps> = ({
                                                                                isDeliveryPersonDifferent,
                                                                                deliveryPerson,
                                                                                errors,
                                                                                onDeliveryPersonToggle,
                                                                                onDeliveryPersonNameChange,
                                                                                onDeliveryPersonPhoneChange,
                                                                                autocompleteOptions,
                                                                                onAutocompleteSelect
                                                                            }) => {
    return (
        <FormSection>
            <SectionTitle>Osoba odbierająca pojazd</SectionTitle>

            <FormRow className="checkbox-row">
                <CheckboxGroup>
                    <CheckboxLabel>
                        <Checkbox
                            type="checkbox"
                            checked={isDeliveryPersonDifferent}
                            onChange={(e) => onDeliveryPersonToggle(e.target.checked)}
                        />
                        Pojazd oddaje inna osoba niż przypisana do rezerwacji
                    </CheckboxLabel>
                </CheckboxGroup>
            </FormRow>

            {isDeliveryPersonDifferent && (
                <FormRow className="responsive-row">
                    <FormGroup>
                        <LabelWithBadge
                            htmlFor="deliveryPersonName"
                            required={true}
                            badgeVariant="modern"
                        >
                            Imię i nazwisko osoby odbierającej
                        </LabelWithBadge>
                        <AutocompleteField
                            id="deliveryPersonName"
                            name="deliveryPersonName"
                            value={deliveryPerson?.name || ''}
                            onChange={onDeliveryPersonNameChange}
                            placeholder="Imię i nazwisko"
                            required
                            error={errors.deliveryPersonName}
                            options={autocompleteOptions}
                            onSelectOption={(option) => onAutocompleteSelect(option, 'deliveryPersonName')}
                            fieldType="ownerName"
                        />
                        {errors.deliveryPersonName && (
                            <ErrorText>{errors.deliveryPersonName}</ErrorText>
                        )}
                    </FormGroup>

                    <FormGroup>
                        <LabelWithBadge
                            htmlFor="deliveryPersonPhone"
                            required={true}
                            badgeVariant="modern"
                        >
                            Numer telefonu
                        </LabelWithBadge>
                        <AutocompleteField
                            id="deliveryPersonPhone"
                            name="deliveryPersonPhone"
                            value={deliveryPerson?.phone || ''}
                            onChange={onDeliveryPersonPhoneChange}
                            placeholder="np. +48 123 456 789"
                            required
                            error={errors.deliveryPersonPhone}
                            type="phone"
                            options={autocompleteOptions}
                            onSelectOption={(option) => onAutocompleteSelect(option, 'deliveryPersonPhone')}
                            fieldType="phone"
                        />
                        {errors.deliveryPersonPhone && (
                            <ErrorText>{errors.deliveryPersonPhone}</ErrorText>
                        )}
                    </FormGroup>
                </FormRow>
            )}
        </FormSection>
    );
};