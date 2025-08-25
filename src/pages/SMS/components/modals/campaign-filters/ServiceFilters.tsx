import React, {useEffect, useState} from 'react';
import {FaInfoCircle} from 'react-icons/fa';
import {
    CheckboxGroup,
    FilterGrid,
    FormCheckbox,
    FormCheckboxLabel,
    FormCheckboxWrapper,
    FormGroup,
    FormHelp,
    FormLabel,
    FormSelect
} from '../campaign-common/styled/FormComponents';

interface ServiceFiltersProps {
    filters: any;
    onFilterChange: (name: string, value: any) => void;
}

/**
 * Komponent z filtrami usług dla kampanii SMS
 * Pozwala na filtrowanie odbiorców według rodzajów usług i historii serwisowej
 */
export const ServiceFilters: React.FC<ServiceFiltersProps> = ({ filters, onFilterChange }) => {
    // Stany lokalne
    const [availableServiceTypes, setAvailableServiceTypes] = useState<Array<{id: string, name: string}>>([]);

    // Efekt pobierania dostępnych typów usług
    useEffect(() => {
        // W rzeczywistej implementacji pobierałbyś dane z API
        // Tutaj używamy przykładowych danych
        setAvailableServiceTypes([
            { id: 'basic_detailing', name: 'Podstawowy detailing' },
            { id: 'advanced_detailing', name: 'Zaawansowany detailing' },
            { id: 'premium_detailing', name: 'Premium detailing' },
            { id: 'interior_cleaning', name: 'Czyszczenie wnętrza' },
            { id: 'exterior_cleaning', name: 'Czyszczenie zewnętrzne' },
            { id: 'ceramic_coating', name: 'Powłoka ceramiczna' },
            { id: 'paint_correction', name: 'Korekta lakieru' },
            { id: 'ppf_installation', name: 'Montaż folii ochronnej' },
            { id: 'wheel_detailing', name: 'Detailing felg' },
            { id: 'headlight_restoration', name: 'Regeneracja reflektorów' }
        ]);
    }, []);

    // Obsługa zmiany ostatniego typu usługi
    const handleLastServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        onFilterChange('lastServiceType', value);
    };

    // Obsługa zmiany checkboxów z typami usług
    const handleServiceTypeChange = (serviceId: string, checked: boolean) => {
        const currentServiceTypes = [...(filters.serviceTypes || [])];

        if (checked && !currentServiceTypes.includes(serviceId)) {
            // Dodaj usługę do zaznaczonych
            onFilterChange('serviceTypes', [...currentServiceTypes, serviceId]);
        } else if (!checked && currentServiceTypes.includes(serviceId)) {
            // Usuń usługę z zaznaczonych
            onFilterChange('serviceTypes', currentServiceTypes.filter(id => id !== serviceId));
        }
    };

    // Sprawdzanie czy usługa jest zaznaczona
    const isServiceSelected = (serviceId: string): boolean => {
        return (filters.serviceTypes || []).includes(serviceId);
    };

    // Obsługa wyboru wszystkich/żadnej usługi
    const handleSelectAllServices = (select: boolean) => {
        if (select) {
            // Zaznacz wszystkie usługi
            onFilterChange('serviceTypes', availableServiceTypes.map(service => service.id));
        } else {
            // Odznacz wszystkie usługi
            onFilterChange('serviceTypes', []);
        }
    };

    // Obliczanie dni od ostatniej usługi
    const calculateDaysSinceService = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const days = value ? parseInt(value, 10) : 0;
        onFilterChange('daysSinceLastService', days);
    };

    return (
        <div>
            <FilterGrid>
                <FormGroup>
                    <FormLabel>Ostatnia usługa</FormLabel>
                    <FormSelect
                        name="lastServiceType"
                        value={filters.lastServiceType || ''}
                        onChange={handleLastServiceChange}
                    >
                        <option value="">Wszystkie usługi</option>
                        {availableServiceTypes.map(service => (
                            <option key={service.id} value={service.id}>
                                {service.name}
                            </option>
                        ))}
                    </FormSelect>
                    <FormHelp>
                        Klienci, których ostatnia wizyta obejmowała wybraną usługę
                    </FormHelp>
                </FormGroup>

                <FormGroup>
                    <FormLabel>Dni od ostatniej usługi</FormLabel>
                    <FormSelect
                        name="daysSinceLastServiceOption"
                        value={filters.daysSinceLastServiceOption || ''}
                        onChange={(e) => onFilterChange('daysSinceLastServiceOption', e.target.value)}
                    >
                        <option value="">Dowolny okres</option>
                        <option value="30">Ostatnie 30 dni</option>
                        <option value="90">Ostatnie 3 miesiące</option>
                        <option value="180">Ostatnie 6 miesięcy</option>
                        <option value="365">Ostatni rok</option>
                        <option value="over365">Ponad rok temu</option>
                        <option value="custom">Własny okres...</option>
                    </FormSelect>
                </FormGroup>

                {filters.daysSinceLastServiceOption === 'custom' && (
                    <FormGroup>
                        <FormLabel>Własny okres (dni)</FormLabel>
                        <input
                            type="number"
                            name="daysSinceLastService"
                            value={filters.daysSinceLastService || ''}
                            onChange={calculateDaysSinceService}
                            min="0"
                            placeholder="Np. 45"
                        />
                    </FormGroup>
                )}
            </FilterGrid>

            {/* Sekcja wyboru usług */}
            <FormGroup style={{ marginTop: '20px' }}>
                <FormLabel>Klienci korzystający z usług</FormLabel>
                <div style={{ marginBottom: '10px' }}>
                    <button
                        type="button"
                        onClick={() => handleSelectAllServices(true)}
                        style={{ marginRight: '10px', padding: '4px 8px', fontSize: '12px' }}
                    >
                        Zaznacz wszystkie
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSelectAllServices(false)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                        Odznacz wszystkie
                    </button>
                </div>

                <CheckboxGroup>
                    {availableServiceTypes.map(service => (
                        <FormCheckboxWrapper key={service.id}>
                            <FormCheckbox
                                type="checkbox"
                                id={`service_${service.id}`}
                                checked={isServiceSelected(service.id)}
                                onChange={(e) => handleServiceTypeChange(service.id, e.target.checked)}
                            />
                            <FormCheckboxLabel htmlFor={`service_${service.id}`}>
                                {service.name}
                            </FormCheckboxLabel>
                        </FormCheckboxWrapper>
                    ))}
                </CheckboxGroup>

                <FormHelp>
                    Klienci, którzy korzystali z zaznaczonych usług (co najmniej jednej)
                </FormHelp>
            </FormGroup>

            {/* Sekcja kombinacji logicznej */}
            <FormGroup style={{ marginTop: '16px' }}>
                <FormLabel>Kryteria usług</FormLabel>
                <FormSelect
                    name="serviceFilterLogic"
                    value={filters.serviceFilterLogic || 'any'}
                    onChange={(e) => onFilterChange('serviceFilterLogic', e.target.value)}
                >
                    <option value="any">Klient korzystał z DOWOLNEJ z zaznaczonych usług</option>
                    <option value="all">Klient korzystał ze WSZYSTKICH zaznaczonych usług</option>
                    <option value="none">Klient NIE KORZYSTAŁ z żadnej z zaznaczonych usług</option>
                </FormSelect>
            </FormGroup>

            <FormHelp style={{ marginTop: '16px' }}>
                <FaInfoCircle style={{ marginRight: '5px' }} />
                Filtry usług pozwalają wybrać klientów na podstawie historii korzystania z określonych usług.
                Jest to przydatne na przykład przy promocji nowych usług dla wybranych grup klientów lub przy
                przypominaniu o konieczności ponowienia usługi.
            </FormHelp>
        </div>
    );
};

export default ServiceFilters;