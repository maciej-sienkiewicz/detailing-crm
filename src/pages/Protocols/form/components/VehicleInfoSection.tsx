// src/pages/Protocols/form/components/VehicleInfoSection.tsx
import React, {useState} from 'react';
import {CarReceptionProtocol} from '../../../../types';
import {FormErrors} from '../hooks/useFormValidation';
import {
    Checkbox,
    CheckboxGroup,
    CheckboxLabel,
    ErrorText,
    FormGroup,
    FormRow,
    FormSection,
    Input,
    Label,
    SectionTitle
} from '../styles';
import {useToast} from "../../../../components/common/Toast/Toast";
import {LabelWithBadge} from './LabelWithBadge';
import {AutocompleteField, AutocompleteOption} from "../../components/AutocompleteField";
import {BrandAutocomplete} from "../../components/BrandAutocomplete";

interface VehicleInfoSectionProps {
    formData: Partial<CarReceptionProtocol>;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    isFullProtocol?: boolean;
    readOnly?: boolean;
    autocompleteOptions: AutocompleteOption[];
    onAutocompleteSelect: (option: AutocompleteOption, fieldType: string) => void;
}

const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({
                                                                   formData,
                                                                   errors,
                                                                   onChange,
                                                                   isFullProtocol = true,
                                                                   readOnly = false,
                                                                   autocompleteOptions,
                                                                   onAutocompleteSelect
                                                               }) => {
    const { showToast } = useToast();
    const [licensePlateError, setLicensePlateError] = useState<string | null>(null);

    const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const originalValue = e.target.value;
        if (originalValue === '') {
            setLicensePlateError(null);
            onChange(e);
            return;
        }

        const hasSpaces = originalValue.includes(' ');
        const inputValue = originalValue.replace(/\s+/g, '').toUpperCase();
        const syntheticEvent = { ...e, target: { ...e.target, value: inputValue, name: e.target.name } } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);

        if (hasSpaces) {
            setLicensePlateError('Tablica rejestracyjna nie może zawierać spacji');
            showToast('error', 'Tablica rejestracyjna nie może zawierać spacji', 3000);
        } else {
            if (licensePlateError === 'Tablica rejestracyjna nie może zawierać spacji') setLicensePlateError(null);
            if (inputValue.length > 0) {
                const isValidFormat = /^[A-Z]{2,3}[A-Z0-9]{4,5}$/.test(inputValue);
                if (!isValidFormat) setLicensePlateError('Nieprawidłowy format tablicy rejestracyjnej');
                else setLicensePlateError(null);
            }
        }
    };

    return (
        <FormSection>
            <SectionTitle>Informacje o pojeździe</SectionTitle>
            <FormRow className="responsive-row">
                <FormGroup>
                    <LabelWithBadge htmlFor="licensePlate" required={true} badgeVariant="modern">
                        Tablica rejestracyjna
                    </LabelWithBadge>
                    {readOnly ? (
                        <Input
                            id="licensePlate"
                            name="licensePlate"
                            value={formData.licensePlate || ''}
                            placeholder="np. WA12345"
                            readOnly={true}
                            style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}
                        />
                    ) : (
                        <AutocompleteField
                            id="licensePlate"
                            name="licensePlate"
                            value={formData.licensePlate || ''}
                            onChange={handleLicensePlateChange}
                            placeholder="np. WA12345"
                            required
                            error={errors.licensePlate || licensePlateError || undefined}
                            options={autocompleteOptions}
                            onSelectOption={(option) => onAutocompleteSelect(option, 'licensePlate')}
                            fieldType="licensePlate"
                        />
                    )}
                </FormGroup>

                <FormGroup>
                    <LabelWithBadge htmlFor="make" required={true} badgeVariant="modern">
                        Marka pojazdu
                    </LabelWithBadge>
                    {readOnly ? (
                        <Input
                            id="make"
                            name="make"
                            value={formData.make || ''}
                            placeholder="Wybierz lub wpisz markę"
                            readOnly={true}
                            style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed', height: '44px' }}
                            $hasError={!!errors.make}
                        />
                    ) : (
                        <div style={{ height: '44px' }}>
                            <BrandAutocomplete
                                value={formData.make || ''}
                                onChange={(value) => {
                                    const syntheticEvent = { target: { name: 'make', value: value, type: 'text' } } as React.ChangeEvent<HTMLInputElement>;
                                    onChange(syntheticEvent);
                                }}
                                placeholder="Wybierz lub wpisz markę"
                                required
                                error={errors.make}
                            />
                        </div>
                    )}
                </FormGroup>

                <FormGroup>
                    <LabelWithBadge htmlFor="model" required={true} badgeVariant="modern">
                        Model pojazdu
                    </LabelWithBadge>
                    <Input
                        id="model"
                        name="model"
                        value={formData.model || ''}
                        onChange={onChange}
                        placeholder="np. A6, Golf, Corolla"
                        required
                        $hasError={!!errors.model}
                    />
                    {errors.model && <ErrorText>{errors.model}</ErrorText>}
                </FormGroup>
            </FormRow>

            <FormRow className="responsive-row">
                <FormGroup>
                    <Label htmlFor="productionYear">Rok produkcji</Label>
                    <Input
                        id="productionYear"
                        name="productionYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={formData.productionYear || ''}
                        onChange={onChange}
                        placeholder="np. 2020"
                    />
                </FormGroup>

                {isFullProtocol && (
                    <FormGroup>
                        <Label htmlFor="mileage">Przebieg pojazdu (km)</Label>
                        <Input
                            id="mileage"
                            name="mileage"
                            type="number"
                            min="0"
                            value={formData.mileage || ''}
                            onChange={onChange}
                            placeholder="np. 150000"
                            $hasError={!!errors.mileage}
                        />
                        {errors.mileage && <ErrorText>{errors.mileage}</ErrorText>}
                    </FormGroup>
                )}
            </FormRow>

            {isFullProtocol && (
                <FormRow className="responsive-row checkbox-row">
                    <CheckboxGroup>
                        <CheckboxLabel>
                            <Checkbox
                                name="keysProvided"
                                checked={formData.keysProvided !== undefined ? formData.keysProvided : true}
                                onChange={onChange}
                                type="checkbox"
                            />
                            Przekazano kluczyki pojazdu
                        </CheckboxLabel>
                    </CheckboxGroup>

                    <CheckboxGroup>
                        <CheckboxLabel>
                            <Checkbox
                                name="documentsProvided"
                                checked={formData.documentsProvided !== undefined ? formData.documentsProvided : false}
                                onChange={onChange}
                                type="checkbox"
                            />
                            Przekazano dokumenty pojazdu
                        </CheckboxLabel>
                    </CheckboxGroup>
                </FormRow>
            )}
        </FormSection>
    );
};

export default VehicleInfoSection;