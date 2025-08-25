// src/components/fleet/forms/VehicleForm.tsx

import React, {useState} from 'react';
import styled from 'styled-components';
import {
    FleetVehicle,
    FleetVehicleCategory,
    FleetVehicleCategoryLabels,
    FleetVehicleStatus,
    FleetVehicleUsageType,
    FleetVehicleUsageTypeLabels
} from '../../../types/fleet';

interface VehicleFormProps {
    initialData?: Partial<FleetVehicle>;
    onSubmit: (data: Partial<FleetVehicle>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
                                                     initialData = {},
                                                     onSubmit,
                                                     onCancel,
                                                     isLoading = false
                                                 }) => {
    const [formData, setFormData] = useState<Partial<FleetVehicle>>({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        vin: '',
        color: '',
        category: FleetVehicleCategory.STANDARD,
        usageType: FleetVehicleUsageType.REPLACEMENT,
        status: FleetVehicleStatus.AVAILABLE,
        engineType: '',
        engineCapacity: 0,
        fuelType: '',
        transmission: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        registrationDate: new Date().toISOString().split('T')[0],
        insuranceExpiryDate: new Date().toISOString().split('T')[0],
        technicalInspectionDate: new Date().toISOString().split('T')[0],
        currentMileage: 0,
        lastServiceMileage: 0,
        nextServiceMileage: 10000,
        ...initialData
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <FormContainer onSubmit={handleSubmit}>
            <FormSection>
                <SectionTitle>Informacje podstawowe</SectionTitle>
                <FormGrid>
                    <FormGroup>
                        <Label htmlFor="make">Marka*</Label>
                        <Input
                            id="make"
                            name="make"
                            value={formData.make}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="model">Model*</Label>
                        <Input
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="year">Rok produkcji*</Label>
                        <Input
                            id="year"
                            name="year"
                            type="number"
                            value={formData.year}
                            onChange={handleChange}
                            required
                            min={1900}
                            max={new Date().getFullYear() + 1}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="licensePlate">Nr rejestracyjny*</Label>
                        <Input
                            id="licensePlate"
                            name="licensePlate"
                            value={formData.licensePlate}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="vin">VIN*</Label>
                        <Input
                            id="vin"
                            name="vin"
                            value={formData.vin}
                            onChange={handleChange}
                            required
                            maxLength={17}
                            minLength={17}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="color">Kolor</Label>
                        <Input
                            id="color"
                            name="color"
                            value={formData.color || ''}
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="category">Kategoria*</Label>
                        <Select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            {Object.entries(FleetVehicleCategoryLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="usageType">Typ użytkowania*</Label>
                        <Select
                            id="usageType"
                            name="usageType"
                            value={formData.usageType}
                            onChange={handleChange}
                            required
                        >
                            {Object.entries(FleetVehicleUsageTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                    </FormGroup>
                </FormGrid>
            </FormSection>

            <FormSection>
                <SectionTitle>Dane techniczne</SectionTitle>
                <FormGrid>
                    <FormGroup>
                        <Label htmlFor="engineType">Typ silnika</Label>
                        <Input
                            id="engineType"
                            name="engineType"
                            value={formData.engineType || ''}
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="engineCapacity">Pojemność silnika (cm³)</Label>
                        <Input
                            id="engineCapacity"
                            name="engineCapacity"
                            type="number"
                            value={formData.engineCapacity || 0}
                            onChange={handleChange}
                            min={0}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="fuelType">Rodzaj paliwa</Label>
                        <Select
                            id="fuelType"
                            name="fuelType"
                            value={formData.fuelType || ''}
                            onChange={handleChange}
                        >
                            <option value="">Wybierz rodzaj paliwa</option>
                            <option value="benzyna">Benzyna</option>
                            <option value="diesel">Diesel</option>
                            <option value="lpg">LPG</option>
                            <option value="hybrid">Hybryda</option>
                            <option value="electric">Elektryczny</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="transmission">Skrzynia biegów</Label>
                        <Select
                            id="transmission"
                            name="transmission"
                            value={formData.transmission || ''}
                            onChange={handleChange}
                        >
                            <option value="">Wybierz rodzaj skrzyni</option>
                            <option value="manual">Manualna</option>
                            <option value="automatic">Automatyczna</option>
                            <option value="semi_automatic">Półautomatyczna</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="currentMileage">Aktualny przebieg (km)*</Label>
                        <Input
                            id="currentMileage"
                            name="currentMileage"
                            type="number"
                            value={formData.currentMileage}
                            onChange={handleChange}
                            required
                            min={0}
                        />
                    </FormGroup>
                </FormGrid>
            </FormSection>

            <FormSection>
                <SectionTitle>Dane administracyjne</SectionTitle>
                <FormGrid>
                    <FormGroup>
                        <Label htmlFor="purchaseDate">Data zakupu</Label>
                        <Input
                            id="purchaseDate"
                            name="purchaseDate"
                            type="date"
                            value={formData.purchaseDate || ''}
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="registrationDate">Data rejestracji</Label>
                        <Input
                            id="registrationDate"
                            name="registrationDate"
                            type="date"
                            value={formData.registrationDate || ''}
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="insuranceExpiryDate">Data ważności ubezpieczenia</Label>
                        <Input
                            id="insuranceExpiryDate"
                            name="insuranceExpiryDate"
                            type="date"
                            value={formData.insuranceExpiryDate || ''}
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="technicalInspectionDate">Data ważności przeglądu</Label>
                        <Input
                            id="technicalInspectionDate"
                            name="technicalInspectionDate"
                            type="date"
                            value={formData.technicalInspectionDate || ''}
                            onChange={handleChange}
                        />
                    </FormGroup>
                </FormGrid>
            </FormSection>

            <FormSection>
                <SectionTitle>Dane serwisowe</SectionTitle>
                <FormGrid>
                    <FormGroup>
                        <Label htmlFor="lastServiceMileage">Przebieg ostatniego serwisu (km)</Label>
                        <Input
                            id="lastServiceMileage"
                            name="lastServiceMileage"
                            type="number"
                            value={formData.lastServiceMileage || 0}
                            onChange={handleChange}
                            min={0}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="nextServiceMileage">Przebieg następnego serwisu (km)</Label>
                        <Input
                            id="nextServiceMileage"
                            name="nextServiceMileage"
                            type="number"
                            value={formData.nextServiceMileage || 0}
                            onChange={handleChange}
                            min={0}
                        />
                    </FormGroup>
                </FormGrid>
            </FormSection>

            <ButtonGroup>
                <CancelButton type="button" onClick={onCancel} disabled={isLoading}>
                    Anuluj
                </CancelButton>
                <SubmitButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Zapisywanie...' : initialData.id ? 'Zapisz zmiany' : 'Dodaj pojazd'}
                </SubmitButton>
            </ButtonGroup>
        </FormContainer>
    );
};

const FormContainer = styled.form`
    max-width: 1000px;
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

const Select = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
    
    &:focus {
        border-color: #3498db;
        outline: none;
    }
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

export default VehicleForm;