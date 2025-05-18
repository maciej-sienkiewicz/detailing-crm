import React, { useState, useEffect } from 'react';
import { FaCar, FaInfoCircle } from 'react-icons/fa';
import {
    FilterGrid,
    FormGroup,
    FormLabel,
    FormInput,
    FormSelect,
    FormHelp
} from '../campaign-common/styled/FormComponents';

interface VehicleFiltersProps {
    filters: any;
    onFilterChange: (name: string, value: any) => void;
}

/**
 * Komponent z filtrami pojazdów dla kampanii SMS
 * Pozwala na filtrowanie odbiorców według marki, modelu, rocznika pojazdu
 */
export const VehicleFilters: React.FC<VehicleFiltersProps> = ({ filters, onFilterChange }) => {
    // Stany lokalne
    const [availableMakes, setAvailableMakes] = useState<string[]>([]);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Efekt do pobierania dostępnych marek pojazdów
    useEffect(() => {
        // W rzeczywistej implementacji pobierałbyś dane z API
        // Tutaj używamy przykładowych danych
        setAvailableMakes([
            'Audi',
            'BMW',
            'Ford',
            'Mercedes-Benz',
            'Toyota',
            'Volkswagen',
            'Volvo'
        ]);
    }, []);

    // Efekt do aktualizacji dostępnych modeli po zmianie marki
    useEffect(() => {
        if (filters.vehicleMake) {
            setLoading(true);

            // Symulacja pobierania modeli dla wybranej marki
            setTimeout(() => {
                // Przykładowe dane dla różnych marek
                const modelsByMake: Record<string, string[]> = {
                    'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7'],
                    'BMW': ['Seria 3', 'Seria 5', 'X3', 'X5', 'X7'],
                    'Ford': ['Focus', 'Mondeo', 'Kuga', 'Mustang'],
                    'Mercedes-Benz': ['Klasa A', 'Klasa C', 'Klasa E', 'GLC', 'GLE'],
                    'Toyota': ['Corolla', 'Camry', 'RAV4', 'Land Cruiser'],
                    'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Touareg'],
                    'Volvo': ['S60', 'S90', 'XC60', 'XC90']
                };

                setAvailableModels(modelsByMake[filters.vehicleMake] || []);
                setLoading(false);
            }, 300);
        } else {
            setAvailableModels([]);
        }
    }, [filters.vehicleMake]);

    // Obsługa zmiany marki pojazdu
    const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        onFilterChange('vehicleMake', value);
        onFilterChange('vehicleModel', ''); // Reset modelu przy zmianie marki
    };

    // Obsługa zmiany rocznika od/do
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const yearValue = value ? parseInt(value, 10) : 0;
        onFilterChange(name, yearValue);
    };

    // Obsługa zmiany modelu pojazdu
    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        onFilterChange('vehicleModel', value);
    };

    // Aktualny rok do walidacji
    const currentYear = new Date().getFullYear();

    return (
        <div>
            <FilterGrid>
                <FormGroup>
                    <FormLabel>Marka pojazdu</FormLabel>
                    <FormSelect
                        name="vehicleMake"
                        value={filters.vehicleMake || ''}
                        onChange={handleMakeChange}
                    >
                        <option value="">Wszystkie marki</option>
                        {availableMakes.map(make => (
                            <option key={make} value={make}>
                                {make}
                            </option>
                        ))}
                    </FormSelect>
                </FormGroup>

                <FormGroup>
                    <FormLabel>Model pojazdu (w trakcie rozwoju)</FormLabel>
                    <FormSelect
                        name="vehicleModel"
                        value={filters.vehicleModel || ''}
                        onChange={handleModelChange}
                        disabled={true}
                    >
                        <option value="">Wszystkie modele</option>
                        {availableModels.map(model => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </FormSelect>
                    <FormHelp>
                        Funkcja filtrowania po modelach jest w trakcie rozwoju
                    </FormHelp>
                </FormGroup>

                <FormGroup>
                    <FormLabel>Rocznik od</FormLabel>
                    <FormInput
                        type="number"
                        name="vehicleYearFrom"
                        value={filters.vehicleYearFrom || ''}
                        onChange={handleYearChange}
                        min="1900"
                        max={currentYear}
                        placeholder="Np. 2010"
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel>Rocznik do</FormLabel>
                    <FormInput
                        type="number"
                        name="vehicleYearTo"
                        value={filters.vehicleYearTo || ''}
                        onChange={handleYearChange}
                        min="1900"
                        max={currentYear}
                        placeholder="Np. 2023"
                    />
                </FormGroup>
            </FilterGrid>

            <FormHelp>
                <FaInfoCircle style={{ marginRight: '5px' }} />
                Filtrowanie po pojazdach pozwala wybrać klientów, którzy posiadają co najmniej jeden pojazd spełniający wybrane kryteria.
            </FormHelp>
        </div>
    );
};

export default VehicleFilters;