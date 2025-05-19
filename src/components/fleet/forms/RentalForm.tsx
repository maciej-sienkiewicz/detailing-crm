// src/components/fleet/forms/RentalForm.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FleetRental,
    FleetRentalStatus
} from '../../../types/fleetRental';
import { FleetVehicle } from '../../../types/fleet';
import { ClientExpanded } from '../../../types/client';
import FuelLevelIndicator from '../common/FuelLevelIndicator';

interface RentalFormProps {
    initialData?: Partial<FleetRental>;
    onSubmit: (data: Partial<FleetRental>) => void;
    onCancel: () => void;
    vehicles?: FleetVehicle[];
    clients?: ClientExpanded[];
    isLoading?: boolean;
}

const RentalForm: React.FC<RentalFormProps> = ({
                                                   initialData = {},
                                                   onSubmit,
                                                   onCancel,
                                                   vehicles = [],
                                                   clients = [],
                                                   isLoading = false
                                               }) => {
    const [formData, setFormData] = useState<Partial<FleetRental>>({
        vehicleId: '',
        clientId: '',
        status: FleetRentalStatus.SCHEDULED,
        startDate: new Date().toISOString().split('T')[0],
        plannedEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startMileage: 0,
        fuelLevelStart: 1,
        startConditionNotes: '',
        damageReported: false,
        contractNumber: '',
        ...initialData
    });

    const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);

    // Aktualizacja przebiegu początkowego na podstawie wybranego pojazdu
    useEffect(() => {
        if (formData.vehicleId && vehicles.length > 0 && !initialData.id) {
            const vehicle = vehicles.find(v => v.id === formData.vehicleId);
            if (vehicle) {
                setSelectedVehicle(vehicle);
                setFormData(prev => ({
                    ...prev,
                    startMileage: vehicle.currentMileage
                }));
            }
        }
    }, [formData.vehicleId, vehicles, initialData.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? Number(value) : value
            }));
        }
    };

    const handleFuelLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) / 100;
        setFormData(prev => ({
            ...prev,
            fuelLevelStart: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getVehicleOptions = () => {
        const availableVehicles = vehicles.filter(v =>
            v.status === 'AVAILABLE' || v.id === formData.vehicleId
        );

        return (
            <>
                <option value="">Wybierz pojazd</option>
                {availableVehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </option>
                ))}
            </>
        );
    };

    const getClientOptions = () => {
        return (
            <>
                <option value="">Wybierz klienta</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} {client.company ? `(${client.company})` : ''}
                    </option>
                ))}
            </>
        );
    };

    // Generowanie numeru umowy
    useEffect(() => {
        if (!formData.contractNumber && !initialData.id) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

            setFormData(prev => ({
                ...prev,
                contractNumber: `W/${year}/${month}/${day}/${randomPart}`
            }));
        }
    }, [formData.contractNumber, initialData.id]);

    return (
        <FormContainer onSubmit={handleSubmit}>
            <FormSection>
                <SectionTitle>Informacje podstawowe</SectionTitle>
                <FormGrid>
                    <FormGroup>
                        <Label htmlFor="vehicleId">Pojazd*</Label>
                        <Select
                            id="vehicleId"
                            name="vehicleId"
                            value={formData.vehicleId}
                            onChange={handleChange}
                            required
                            disabled={!!initialData.id}
                        >
                            {getVehicleOptions()}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="clientId">Klient</Label>
                        <Select
                            id="clientId"
                            name="clientId"
                            value={formData.clientId || ''}
                            onChange={handleChange}
                        >
                            {getClientOptions()}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="startDate">Data rozpoczęcia*</Label>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="plannedEndDate">Planowana data zakończenia*</Label>
                        <Input
                            id="plannedEndDate"
                            name="plannedEndDate"
                            type="date"
                            value={formData.plannedEndDate}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="contractNumber">Numer umowy*</Label>
                        <Input
                            id="contractNumber"
                            name="contractNumber"
                            value={formData.contractNumber}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                </FormGrid>
            </FormSection>

            <FormSection>
                <SectionTitle>Stan pojazdu przy wydaniu</SectionTitle>
                <FormGrid>
                    <FormGroup>
                        <Label htmlFor="startMileage">Przebieg początkowy (km)*</Label>
                        <Input
                            id="startMileage"
                            name="startMileage"
                            type="number"
                            value={formData.startMileage}
                            onChange={handleChange}
                            required
                            min={0}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="fuelLevelStart">Poziom paliwa*</Label>
                        <FuelLevel>
                            <RangeInput
                                id="fuelLevelStart"
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={formData.fuelLevelStart * 100}
                                onChange={handleFuelLevelChange}
                            />
                            <FuelLevelIndicator level={formData.fuelLevelStart} />
                        </FuelLevel>
                    </FormGroup>

                    <FormGroupFullWidth>

                        <Label htmlFor="startConditionNotes">Uwagi dotyczące stanu pojazdu</Label>
                        <TextArea
                            id="startConditionNotes"
                            name="startConditionNotes"
                            value={formData.startConditionNotes || ''}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Opisz stan pojazdu przy wydaniu (np. stan karoserii, wnętrza, wyposażenia)"
                        />
                    </FormGroupFullWidth>

                    <FormGroup>
                        <Label htmlFor="damageReported">Zgłoszone uszkodzenia</Label>
                        <CheckboxContainer>
                            <Checkbox
                                id="damageReported"
                                name="damageReported"
                                type="checkbox"
                                checked={formData.damageReported || false}
                                onChange={handleChange}
                            />
                            <CheckboxLabel htmlFor="damageReported">
                                Pojazd posiada zgłoszone uszkodzenia
                            </CheckboxLabel>
                        </CheckboxContainer>
                    </FormGroup>

                    {formData.damageReported && (
                        <FormGroupFullWidth>
                            <Label htmlFor="damageDescription">Opis uszkodzeń</Label>
                            <TextArea
                                id="damageDescription"
                                name="damageDescription"
                                value={formData.damageDescription || ''}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Opisz szczegółowo istniejące uszkodzenia pojazdu"
                            />
                        </FormGroupFullWidth>
                    )}
                </FormGrid>
            </FormSection>

            <FormNote>
                Uwaga: Po zapisaniu formularza pamiętaj o zrobieniu zdjęć dokumentujących stan pojazdu oraz zebraniu podpisu klienta na umowie.
            </FormNote>

            <ButtonGroup>
                <CancelButton type="button" onClick={onCancel} disabled={isLoading}>
                    Anuluj
                </CancelButton>
                <SubmitButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Zapisywanie...' : initialData.id ? 'Zapisz zmiany' : 'Utwórz wypożyczenie'}
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

export default RentalForm;