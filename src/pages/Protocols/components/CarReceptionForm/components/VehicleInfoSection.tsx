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
    CheckboxGroup,
    CheckboxLabel,
    Checkbox,
    ErrorText
} from '../styles/styles';

// Import komponentu pola wyszukiwania
import SearchField from './SearchField';

interface VehicleInfoSectionProps {
    formData: Partial<CarReceptionProtocol>;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSearchByField?: (field: 'licensePlate') => void;
}

const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({
                                                                   formData,
                                                                   errors,
                                                                   onChange,
                                                                   onSearchByField
                                                               }) => {
    const handleSearchClick = (field: 'licensePlate') => {
        if (onSearchByField) {
            onSearchByField(field);
        }
    };

    return (
        <>
            <FormSection>
                <SectionTitle>Dane usługi</SectionTitle>
                <FormRow>
                    <FormGroup>
                        <Label htmlFor="startDate">Data rozpoczęcia*</Label>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate || ''}
                            onChange={onChange}
                            required
                        />
                        {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="endDate">Data zakończenia*</Label>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={formData.endDate || ''}
                            onChange={onChange}
                            required
                        />
                        {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
                    </FormGroup>
                </FormRow>
            </FormSection>

            <FormSection>
                <SectionTitle>Dane pojazdu</SectionTitle>
                <FormRow>
                    <FormGroup>
                        <Label htmlFor="licensePlate">Tablica rejestracyjna*</Label>
                        <SearchField
                            id="licensePlate"
                            name="licensePlate"
                            value={formData.licensePlate || ''}
                            onChange={onChange}
                            placeholder="np. WA12345"
                            required
                            onSearchClick={() => handleSearchClick('licensePlate')}
                            error={errors.licensePlate}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="make">Marka*</Label>
                        <Input
                            id="make"
                            name="make"
                            value={formData.make || ''}
                            onChange={onChange}
                            placeholder="np. Audi"
                            required
                        />
                        {errors.make && <ErrorText>{errors.make}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="model">Model*</Label>
                        <Input
                            id="model"
                            name="model"
                            value={formData.model || ''}
                            onChange={onChange}
                            placeholder="np. A6"
                            required
                        />
                        {errors.model && <ErrorText>{errors.model}</ErrorText>}
                    </FormGroup>
                </FormRow>

                <FormRow>
                    <FormGroup>
                        <Label htmlFor="productionYear">Rok produkcji*</Label>
                        <Input
                            id="productionYear"
                            name="productionYear"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            value={formData.productionYear || ''}
                            onChange={onChange}
                            required
                        />
                        {errors.productionYear && <ErrorText>{errors.productionYear}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="mileage">Przebieg (km)*</Label>
                        <Input
                            id="mileage"
                            name="mileage"
                            type="number"
                            min="0"
                            value={formData.mileage || ''}
                            onChange={onChange}
                            required
                        />
                        {errors.mileage && <ErrorText>{errors.mileage}</ErrorText>}
                    </FormGroup>
                </FormRow>

                <FormRow>
                    <CheckboxGroup>
                        <CheckboxLabel>
                            <Checkbox
                                name="keysProvided"
                                checked={formData.keysProvided || false}
                                onChange={onChange}
                                type="checkbox"
                            />
                            Przekazano kluczyk
                        </CheckboxLabel>
                    </CheckboxGroup>

                    <CheckboxGroup>
                        <CheckboxLabel>
                            <Checkbox
                                name="documentsProvided"
                                checked={formData.documentsProvided || false}
                                onChange={onChange}
                                type="checkbox"
                            />
                            Przekazano dokumenty
                        </CheckboxLabel>
                    </CheckboxGroup>
                </FormRow>
            </FormSection>
        </>
    );
};

export default VehicleInfoSection;