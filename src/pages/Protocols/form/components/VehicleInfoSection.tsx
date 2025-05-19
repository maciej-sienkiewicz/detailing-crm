// src/pages/Protocols/form/components/VehicleInfoSection.tsx
import React, { useState, useEffect } from 'react';
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

// Import our LicensePlateField component
import SearchField from './SearchField';
import {useToast} from "../../../../components/common/Toast/Toast";
import LicensePlateField from "../../../../components/common/LicensePlateField";

// List of car brands
const carBrands = [
    "Abarth", "Acura", "Aito", "Aiways", "Aixam", "Alfa Romeo", "Alpine",
    "Arcfox", "Asia", "Aston Martin", "Audi", "Austin", "Autobianchi",
    "AVATR", "Baic", "BAW", "Bentley", "Bestune", "Biro", "BMW",
    "BMW-ALPINA", "Brilliance", "Bugatti", "Buick", "BYD", "Cadillac",
    "Casalini", "Caterham", "Cenntro", "Changan", "Chatenet", "Chery",
    "Chevrolet", "Chrysler", "Citroën", "Cupra", "Dacia", "Daewoo",
    "Daihatsu", "DeLorean", "Denza", "DFM", "DFSK", "DKW", "Dodge",
    "Doosan", "DR MOTOR", "DS Automobiles", "e.GO", "Elaris", "FAW",
    "FENDT", "Ferrari", "Fiat", "Fisker", "Ford", "Forthing", "Gaz",
    "Geely", "Genesis", "GMC", "GWM", "HiPhi", "Honda", "Hongqi",
    "Hummer", "Hyundai", "iamelectric", "Ineos", "Infiniti", "Isuzu",
    "Iveco", "JAC", "Jaecoo", "Jaguar", "Jeep", "Jetour", "Jinpeng",
    "Kia", "KTM", "Lada", "Lamborghini", "Lancia", "Land Rover",
    "Leapmotor", "LEVC", "Lexus", "Li", "Ligier", "Lincoln", "Lixiang",
    "Lotus", "LTI", "Lucid", "Lynk & Co", "MAN", "Maserati", "MAXIMUS",
    "Maxus", "Maybach", "Mazda", "McLaren", "Mercedes-Benz", "Mercury",
    "MG", "Microcar", "MINI", "Mitsubishi", "Morgan", "NIO", "Nissan",
    "Nysa", "Oldsmobile", "Omoda", "Opel", "Peugeot", "Piaggio",
    "Plymouth", "Polestar", "Polonez", "Pontiac", "Porsche", "RAM",
    "Renault", "Rolls-Royce", "Rover", "Saab", "SARINI", "Saturn",
    "Seat", "Seres", "Shuanghuan", "Skoda", "Skywell", "Skyworth",
    "Smart", "SsangYong/KGM", "Subaru", "Suzuki", "Syrena", "Tarpan",
    "Tata", "Tesla", "Toyota", "Trabant", "Triumph", "TUATARA", "Uaz",
    "Vauxhall", "VELEX", "Volkswagen", "Volvo", "Voyah", "WALTRA",
    "Warszawa", "Wartburg", "Wey", "Wołga", "Xiaomi", "XPeng",
    "Zaporożec", "Zastava", "ZEEKR", "Zefir", "Zhidou", "Żuk"
];

interface VehicleInfoSectionProps {
    formData: Partial<CarReceptionProtocol>;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSearchByField?: (field: 'licensePlate') => void;
    isFullProtocol?: boolean;
    readOnly?: boolean;
}

const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({
                                                                   formData,
                                                                   errors,
                                                                   onChange,
                                                                   onSearchByField,
                                                                   isFullProtocol = true,
                                                                   readOnly = false
                                                               }) => {
    const { showToast } = useToast();
    const [dateError, setDateError] = useState<string | null>(null);

    const handleSearchClick = (field: 'licensePlate') => {
        if (onSearchByField && !readOnly) {
            onSearchByField(field);
        }
    };

    // Handle date change with validation
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // For end date, add validation
        if (name === 'endDate') {
            if (value) {
                const newDateTime = `${value}T23:59:59`;
                const syntheticEvent = {
                    target: {
                        name: 'endDate',
                        value: newDateTime,
                        type: 'text'
                    }
                } as React.ChangeEvent<HTMLInputElement>;

                // Check if end date is valid compared to start date
                if (formData.startDate) {
                    const startDateObj = new Date(formData.startDate);
                    const endDateObj = new Date(newDateTime);

                    if (endDateObj < startDateObj) {
                        setDateError('Data zakończenia nie może być wcześniejsza niż data rozpoczęcia');
                        showToast('error', 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia', 3000);
                    } else {
                        setDateError(null);
                    }
                }

                onChange(syntheticEvent);
            } else {
                // If value is empty, just pass an empty string
                const syntheticEvent = {
                    target: {
                        name: 'endDate',
                        value: '',
                        type: 'text'
                    }
                } as React.ChangeEvent<HTMLInputElement>;

                onChange(syntheticEvent);
                setDateError(null);
            }
        } else {
            // For other inputs, just pass the event as is
            onChange(e);
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
                            onChange={handleDateChange}
                            required
                            style={{ borderColor: dateError ? '#e74c3c' : undefined }}
                        />
                        {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
                        {dateError && <ErrorText>{dateError}</ErrorText>}
                    </FormGroup>
                </FormRow>
            </FormSection>

            <FormSection>
                <SectionTitle>Dane pojazdu</SectionTitle>
                <FormRow className="responsive-row">
                    <FormGroup>
                        <Label htmlFor="licensePlate">Tablica rejestracyjna</Label>
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
                            <LicensePlateField
                                id="licensePlate"
                                name="licensePlate"
                                value={formData.licensePlate || ''}
                                onChange={onChange}
                                placeholder="np. WA12345"
                                onSearchClick={() => handleSearchClick('licensePlate')}
                                error={errors.licensePlate || "Tablica rejestracyjna nie może zawierać spacji"}
                                readOnly={readOnly}
                                required
                            />
                        )}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="make">Marka*</Label>
                        <Input
                            id="make"
                            name="make"
                            list="carBrandsList"
                            value={formData.make || ''}
                            onChange={onChange}
                            placeholder="Wpisz lub wybierz markę"
                            required
                        />
                        <datalist id="carBrandsList">
                            {carBrands.map(brand => (
                                <option key={brand.toLowerCase().replace(/[^a-z0-9]/g, '-')} value={brand} />
                            ))}
                        </datalist>
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