// src/pages/Protocols/form/components/VehicleInfoSectionWithAutocomplete.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
    DateTimeContainer,
    brandTheme
} from '../styles';

import { useToast } from "../../../../components/common/Toast/Toast";
import { LabelWithBadge } from './LabelWithBadge';
import {AutocompleteField, AutocompleteOption} from "../../components/AutocompleteField";

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
    isFullProtocol?: boolean;
    readOnly?: boolean;
    // Autocomplete props
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
    const [dateError, setDateError] = useState<string | null>(null);
    const [licensePlateError, setLicensePlateError] = useState<string | null>(null);
    const [isAllDay, setIsAllDay] = useState(false);

    // Enhanced license plate change handler with validation
    const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const originalValue = e.target.value;

        // If the field is becoming empty, clear errors
        if (originalValue === '') {
            setLicensePlateError(null);
            onChange(e);
            return;
        }

        // Check if there are spaces being added
        const hasSpaces = originalValue.includes(' ');

        // Remove spaces from license plate and convert to uppercase
        const inputValue = originalValue.replace(/\s+/g, '').toUpperCase();

        // Create a synthetic event with the modified value
        const syntheticEvent = {
            ...e,
            target: { ...e.target, value: inputValue, name: e.target.name }
        } as React.ChangeEvent<HTMLInputElement>;

        // Call the original onChange function with the modified value
        onChange(syntheticEvent);

        // Handle validation
        if (hasSpaces) {
            setLicensePlateError('Tablica rejestracyjna nie może zawierać spacji');
            showToast('error', 'Tablica rejestracyjna nie może zawierać spacji', 3000);
        } else {
            // Clear the space error if it was previously set
            if (licensePlateError === 'Tablica rejestracyjna nie może zawierać spacji') {
                setLicensePlateError(null);
            }

            // Perform format validation
            if (inputValue.length > 0) {
                const isValidFormat = /^[A-Z]{2,3}[A-Z0-9]{4,5}$/.test(inputValue);
                if (!isValidFormat) {
                    setLicensePlateError('Nieprawidłowy format tablicy rejestracyjnej');
                } else {
                    setLicensePlateError(null);
                }
            }
        }
    };

    // Handle all day toggle
    const handleAllDayToggle = () => {
        const newIsAllDay = !isAllDay;
        setIsAllDay(newIsAllDay);

        if (newIsAllDay) {
            // Set to all day - from 00:00 to 23:59, but use the same date for start and end
            const currentDate = formData.startDate ? formData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];

            const startDateTime = `${currentDate}T00:00:00`;
            const endDateTime = `${currentDate}T23:59:59`;

            // Update start date
            const startEvent = {
                target: {
                    name: 'startDate',
                    value: startDateTime,
                    type: 'text'
                }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(startEvent);

            // Update end date to the same day
            const endEvent = {
                target: {
                    name: 'endDate',
                    value: endDateTime,
                    type: 'text'
                }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(endEvent);
        }
    };

    // Handle date change with validation
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

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
                    const startDateObj = new Date(formData.startDate.replace(' ', 'T'));
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
        } else if (name === 'startDate') {
            if (value) {
                const newDateTime = value.includes('T') ? value : `${value}T08:00:00`;
                const syntheticEvent = {
                    target: {
                        name: 'startDate',
                        value: newDateTime,
                        type: 'text'
                    }
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
            } else {
                onChange(e);
            }
        } else {
            onChange(e);
        }
    };

    // Effect to set current date and time for full protocol
    useEffect(() => {
        if (isFullProtocol && !formData.startDate) {
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;
            const fullDateTime = `${currentDate}T${currentTime}:00`;

            const syntheticEvent = {
                target: {
                    name: 'startDate',
                    value: fullDateTime,
                    type: 'text'
                }
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(syntheticEvent);
        }
    }, [isFullProtocol, formData.startDate, onChange]);

    // Function to safely extract date from different formats
    const extractDateFromISO = (dateString: string): string => {
        if (!dateString) return '';

        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }

        if (dateString.includes(' ')) {
            return dateString.split(' ')[0];
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }

        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        } catch (e) {
            console.warn('Nie można sparsować daty:', dateString);
        }

        return '';
    };

    return (
        <>
            <FormSection>
                <SectionTitle>Harmonogram wizyty</SectionTitle>
                <FormRow className="responsive-row">
                    <FormGroup className="date-time-group">
                        <DateLabelContainer>
                            <InlineLabelContainer>
                                <LabelWithBadge
                                    htmlFor="startDate"
                                    required={true}
                                    badgeVariant="modern"
                                >
                                    Data i godzina rozpoczęcia
                                </LabelWithBadge>
                                <AllDayToggleContainer>
                                    <AllDayLabel>Cały dzień</AllDayLabel>
                                    <ToggleSwitch
                                        $isActive={isAllDay}
                                        onClick={handleAllDayToggle}
                                        type="button"
                                    >
                                        <ToggleSlider $isActive={isAllDay} />
                                    </ToggleSwitch>
                                </AllDayToggleContainer>
                            </InlineLabelContainer>
                        </DateLabelContainer>

                        <DateTimeContainer>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                value={extractDateFromISO(formData.startDate || '')}
                                onChange={handleDateChange}
                                required
                                className="date-input"
                                $hasError={!!errors.startDate}
                            />
                            {!isAllDay && (
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    value={(() => {
                                        if (!formData.startDate) return '08:00';

                                        if (formData.startDate.includes('T')) {
                                            return formData.startDate.split('T')[1]?.substring(0, 5) || '08:00';
                                        }

                                        if (formData.startDate.includes(' ')) {
                                            const timePart = formData.startDate.split(' ')[1];
                                            return timePart?.substring(0, 5) || '08:00';
                                        }

                                        return '08:00';
                                    })()}
                                    onChange={(e) => {
                                        const date = extractDateFromISO(formData.startDate || new Date().toISOString());
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

                    {!isAllDay && (
                        <FormGroup>
                            <LabelWithBadge
                                htmlFor="endDate"
                                required={true}
                                badgeVariant="modern"
                            >
                                Data zakończenia
                            </LabelWithBadge>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                value={extractDateFromISO(formData.endDate || '')}
                                onChange={handleDateChange}
                                required
                                $hasError={!!(errors.endDate || dateError)}
                            />
                            {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
                            {dateError && <ErrorText>{dateError}</ErrorText>}
                        </FormGroup>
                    )}
                </FormRow>
            </FormSection>

            <FormSection>
                <SectionTitle>Informacje o pojeździe</SectionTitle>
                <FormRow className="responsive-row">
                    <FormGroup>
                        <LabelWithBadge
                            htmlFor="licensePlate"
                            required={true}
                            badgeVariant="modern"
                        >
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
                        <LabelWithBadge
                            htmlFor="make"
                            required={true}
                            badgeVariant="modern"
                        >
                            Marka pojazdu
                        </LabelWithBadge>
                        <Input
                            id="make"
                            name="make"
                            list="carBrandsList"
                            value={formData.make || ''}
                            onChange={onChange}
                            placeholder="Wybierz lub wpisz markę"
                            required
                            $hasError={!!errors.make}
                        />
                        <datalist id="carBrandsList">
                            {carBrands.map(brand => (
                                <option key={brand.toLowerCase().replace(/[^a-z0-9]/g, '-')} value={brand} />
                            ))}
                        </datalist>
                        {errors.make && <ErrorText>{errors.make}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <LabelWithBadge
                            htmlFor="model"
                            required={true}
                            badgeVariant="modern"
                        >
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
        </>
    );
};

// Styled Components for All Day Toggle
const DateLabelContainer = styled.div`
    margin-bottom: ${brandTheme.spacing.xs};
`;

const InlineLabelContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    width: 100%;
`;

const AllDayToggleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    margin-left: auto;
`;

const AllDayLabel = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
`;

const ToggleSwitch = styled.button<{ $isActive: boolean }>`
    position: relative;
    width: 44px;
    height: 22px;
    background: ${props => props.$isActive ? brandTheme.primary : brandTheme.text.muted};
    border: none;
    border-radius: 11px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    outline: none;

    &:hover {
        background: ${props => props.$isActive ? brandTheme.primaryDark : brandTheme.text.secondary};
    }

    &:focus {
        box-shadow: 0 0 0 3px ${props => props.$isActive ? brandTheme.primaryGhost : 'rgba(148, 163, 184, 0.2)'};
    }
`;

const ToggleSlider = styled.div<{ $isActive: boolean }>`
    position: absolute;
    top: 2px;
    left: ${props => props.$isActive ? '24px' : '2px'};
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    transition: all ${brandTheme.transitions.spring};
    box-shadow: ${brandTheme.shadow.sm};
`;

export default VehicleInfoSection;