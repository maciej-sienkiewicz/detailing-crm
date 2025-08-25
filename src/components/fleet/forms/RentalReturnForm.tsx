// src/components/fleet/forms/RentalReturnForm.tsx

import React, {useState} from 'react';
import styled from 'styled-components';
import {FleetRental} from '../../../types/fleetRental';
import FuelLevelIndicator from '../common/FuelLevelIndicator';

interface RentalReturnFormProps {
    rental: FleetRental;
    onSubmit: (data: {
        endMileage: number;
        fuelLevelEnd: number;
        actualEndDate: string;
        endConditionNotes: string;
        damageReported: boolean;
        damageDescription?: string;
    }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const RentalReturnForm: React.FC<RentalReturnFormProps> = ({
                                                               rental,
                                                               onSubmit,
                                                               onCancel,
                                                               isLoading = false
                                                           }) => {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        endMileage: rental.endMileage || rental.startMileage,
        fuelLevelEnd: rental.fuelLevelEnd || rental.fuelLevelStart,
        actualEndDate: rental.actualEndDate || today,
        endConditionNotes: rental.endConditionNotes || '',
        damageReported: rental.damageReported || false,
        damageDescription: rental.damageDescription || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? Number(value) : value
            }));
        }
    };

    const handleFuelLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) / 100;
        setFormData(prev => ({ ...prev, fuelLevelEnd: value }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (formData.endMileage < rental.startMileage) {
            newErrors.endMileage = 'Przebieg końcowy nie może być mniejszy niż początkowy';
        }

        if (!formData.actualEndDate) {
            newErrors.actualEndDate = 'Data zwrotu jest wymagana';
        }

        if (formData.damageReported && !formData.damageDescription.trim()) {
            newErrors.damageDescription = 'Opis uszkodzeń jest wymagany gdy zgłoszono uszkodzenia';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <FormContainer onSubmit={handleSubmit}>
            <FormSection>
                <SectionTitle>Zwrot pojazdu</SectionTitle>

                <FormGrid>
                    <FormGroup>
                        <Label htmlFor="endMileage">Przebieg końcowy (km)*</Label>
                        <Input
                            id="endMileage"
                            name="endMileage"
                            type="number"
                            value={formData.endMileage}
                            onChange={handleChange}
                            required
                            min={rental.startMileage}
                        />
                        {errors.endMileage && <ErrorMessage>{errors.endMileage}</ErrorMessage>}
                        <HelpText>Przebieg początkowy: {rental.startMileage} km</HelpText>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="fuelLevelEnd">Poziom paliwa*</Label>
                        <FuelLevel>
                            <RangeInput
                                id="fuelLevelEnd"
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={formData.fuelLevelEnd * 100}
                                onChange={handleFuelLevelChange}
                            />
                            <FuelLevelIndicator level={formData.fuelLevelEnd} />
                        </FuelLevel>
                        <HelpText>Poziom początkowy: {Math.round(rental.fuelLevelStart * 100)}%</HelpText>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="actualEndDate">Data zwrotu*</Label>
                        <Input
                            id="actualEndDate"
                            name="actualEndDate"
                            type="date"
                            value={formData.actualEndDate}
                            onChange={handleChange}
                            required
                        />
                        {errors.actualEndDate && <ErrorMessage>{errors.actualEndDate}</ErrorMessage>}
                    </FormGroup>

                    <FormGroupFullWidth>
                        <Label htmlFor="endConditionNotes">Uwagi dotyczące stanu pojazdu</Label>
                        <TextArea
                            id="endConditionNotes"
                            name="endConditionNotes"
                            value={formData.endConditionNotes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Opisz stan pojazdu przy zwrocie"
                        />
                    </FormGroupFullWidth>

                    <FormGroup>
                        <Label htmlFor="damageReported">Nowe uszkodzenia</Label>
                        <CheckboxContainer>
                            <Checkbox
                                id="damageReported"
                                name="damageReported"
                                type="checkbox"
                                checked={formData.damageReported}
                                onChange={handleChange}
                            />
                            <CheckboxLabel htmlFor="damageReported">
                                Wykryto nowe uszkodzenia pojazdu
                            </CheckboxLabel>
                        </CheckboxContainer>
                    </FormGroup>

                    {formData.damageReported && (
                        <FormGroupFullWidth>
                            <Label htmlFor="damageDescription">Opis nowych uszkodzeń*</Label>
                            <TextArea
                                id="damageDescription"
                                name="damageDescription"
                                value={formData.damageDescription}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Opisz szczegółowo wykryte uszkodzenia pojazdu"
                                required={formData.damageReported}
                            />
                            {errors.damageDescription && <ErrorMessage>{errors.damageDescription}</ErrorMessage>}
                        </FormGroupFullWidth>
                    )}
                </FormGrid>
            </FormSection>

            <FormNote>
                Uwaga: Po zapisaniu formularza pamiętaj o zrobieniu zdjęć dokumentujących stan pojazdu przy zwrocie.
            </FormNote>

            <ButtonGroup>
                <CancelButton type="button" onClick={onCancel} disabled={isLoading}>
                    Anuluj
                </CancelButton>
                <SubmitButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Zapisywanie...' : 'Zamknij wypożyczenie'}
                </SubmitButton>
            </ButtonGroup>
        </FormContainer>
    );
};

const FormContainer = styled.form`
    max-width: 800px;
    margin: 0 auto;
`;

const FormSection = styled.div`
    margin-bottom: 24px;
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 16px 0;
    color: #2c3e50;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
`;

const FormGroup = styled.div`
    margin-bottom: 16px;
`;

const FormGroupFullWidth = styled(FormGroup)`
    grid-column: 1 / -1;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    color: #34495e;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        border-color: #3498db;
        outline: none;
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    
    &:focus {
        border-color: #3498db;
        outline: none;
    }
`;

const FuelLevel = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const RangeInput = styled.input`
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    border-radius: 4px;
    background: #eee;
    outline: none;
    
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #3498db;
        cursor: pointer;
    }
    
    &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #3498db;
        cursor: pointer;
        border: none;
    }
`;

const HelpText = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
`;

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
`;

const Checkbox = styled.input`
    margin-right: 8px;
`;

const CheckboxLabel = styled.label`
    font-size: 14px;
    color: #34495e;
`;

const FormNote = styled.p`
    font-size: 13px;
    color: #7f8c8d;
    font-style: italic;
    margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
`;

const Button = styled.button`
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const CancelButton = styled(Button)`
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    
    &:hover:not(:disabled) {
        background-color: #f5f5f5;
    }
`;

const SubmitButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
`;

export default RentalReturnForm;