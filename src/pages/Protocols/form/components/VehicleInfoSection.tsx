import React, { useEffect } from 'react';
import { CarReceptionProtocol } from '../../../../types';
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
    ErrorText,
    DateTimeContainer
} from '../styles';

// Import komponentu pola wyszukiwania
import SearchField from './SearchField';
import styled from 'styled-components';

interface VehicleInfoSectionProps {
    formData: Partial<CarReceptionProtocol>;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSearchByField?: (field: 'licensePlate') => void;
    isFullProtocol?: boolean;
    readOnly?: boolean; // Dodajemy opcjonalną właściwość readOnly
}

const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({
                                                                   formData,
                                                                   errors,
                                                                   onChange,
                                                                   onSearchByField,
                                                                   isFullProtocol = true,
                                                                   readOnly = false // Dodajemy z wartością domyślną false
                                                               }) => {
    const handleSearchClick = (field: 'licensePlate') => {
        if (onSearchByField && !readOnly) {
            onSearchByField(field);
        }
    };

    // Efekt ustawiający aktualną datę i godzinę dla pełnego protokołu
    useEffect(() => {
        if (isFullProtocol) {
            // Pobieramy aktualną datę i czas
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0]; // Format YYYY-MM-DD

            // Formatujemy godzinę jako HH:MM
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;

            // Tworzymy pełną datę w formacie ISO
            const fullDateTime = `${currentDate}T${currentTime}:00`;

            // Tworzymy syntetyczne zdarzenie dla formularza
            const syntheticEvent = {
                target: {
                    name: 'startDate',
                    value: fullDateTime,
                    type: 'text'
                }
            } as React.ChangeEvent<HTMLInputElement>;

            // Wywołujemy funkcję obsługi zmiany
            onChange(syntheticEvent);
        }
    }, [isFullProtocol]);

    return (
        <>
            <FormSection>
                <SectionTitle>Dane usługi</SectionTitle>
                <FormRow className="responsive-row">
                    <FormGroup className="date-time-group">
                        <Label htmlFor="startDate">Data rozpoczęcia*</Label>
                        <DateTimeContainer>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                                onChange={onChange}
                                required
                                className="date-input"
                            />
                            {isFullProtocol && (
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    value={formData.startDate ? (formData.startDate.split('T')[1]?.substring(0, 5) || '08:00') : '08:00'}
                                    onChange={(e) => {
                                        const date = formData.startDate ? formData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
                                        const newDateTime = `${date}T${e.target.value}:00`;
                                        const syntheticEvent = {
                                            target: {
                                                name: 'startDate',
                                                value: newDateTime,
                                                type: 'text'
                                            }
                                        } as React.ChangeEvent<HTMLInputElement>;
                                        onChange(syntheticEvent);
                                    }}
                                    required
                                    className="time-input"
                                />
                            )}
                        </DateTimeContainer>
                        {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="endDate">Data zakończenia*</Label>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue) {
                                    const newDateTime = `${newValue}T23:59:59`;
                                    const syntheticEvent = {
                                        target: {
                                            name: 'endDate',
                                            value: newDateTime,
                                            type: 'text'
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    onChange(syntheticEvent);
                                } else {
                                    const syntheticEvent = {
                                        target: {
                                            name: 'endDate',
                                            value: '',
                                            type: 'text'
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    onChange(syntheticEvent);
                                }
                            }}
                            required
                        />
                        {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
                    </FormGroup>
                </FormRow>
            </FormSection>

            <FormSection>
                <SectionTitle>Dane pojazdu</SectionTitle>
                <FormRow className="responsive-row">
                    <FormGroup>
                        <Label htmlFor="licensePlate">Tablica rejestracyjna</Label>
                        <SearchField
                            id="licensePlate"
                            name="licensePlate"
                            value={formData.licensePlate || ''}
                            onChange={onChange}
                            placeholder="np. WA12345"
                            onSearchClick={() => handleSearchClick('licensePlate')}
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
                        />
                    </FormGroup>

                    {isFullProtocol && (
                        <FormGroup>
                            <Label htmlFor="mileage">Przebieg (km)</Label>
                            <Input
                                id="mileage"
                                name="mileage"
                                type="number"
                                min="0"
                                value={formData.mileage || ''}
                                onChange={onChange}
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
                )}
            </FormSection>
        </>
    );
};

export default VehicleInfoSection;