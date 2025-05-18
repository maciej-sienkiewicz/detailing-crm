import React from 'react';
import { FaUsers, FaInfoCircle } from 'react-icons/fa';
import {
    FilterGrid,
    FormGroup,
    FormLabel,
    FormInput,
    FormSelect,
    FormCheckboxWrapper,
    FormCheckbox,
    FormCheckboxLabel,
    FormHelp
} from '../campaign-common/styled/FormComponents';

interface ClientFiltersProps {
    filters: any;
    onFilterChange: (name: string, value: any) => void;
}

/**
 * Komponent z podstawowymi filtrami klientów dla kampanii SMS
 * Zawiera filtry typu klienta, aktywności, wizyt itp.
 */
export const ClientFilters: React.FC<ClientFiltersProps> = ({ filters, onFilterChange }) => {
    // Obsługa zmiany pól formularza
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Obsługa różnych typów inputów
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            onFilterChange(name, checked);
        } else if (type === 'number') {
            const numericValue = value === '' ? 0 : parseInt(value, 10);
            onFilterChange(name, numericValue);
        } else {
            onFilterChange(name, value);
        }
    };

    return (
        <div>
            <FilterGrid>
                <FormGroup>
                    <FormLabel>Typ klienta</FormLabel>
                    <div>
                        <FormCheckboxWrapper>
                            <FormCheckbox
                                type="checkbox"
                                id="includeIndividualClients"
                                name="includeIndividualClients"
                                checked={filters.includeIndividualClients}
                                onChange={handleInputChange}
                            />
                            <FormCheckboxLabel htmlFor="includeIndividualClients">
                                Klienci indywidualni
                            </FormCheckboxLabel>
                        </FormCheckboxWrapper>

                        <FormCheckboxWrapper>
                            <FormCheckbox
                                type="checkbox"
                                id="includeCompanyClients"
                                name="includeCompanyClients"
                                checked={filters.includeCompanyClients}
                                onChange={handleInputChange}
                            />
                            <FormCheckboxLabel htmlFor="includeCompanyClients">
                                Klienci firmowi
                            </FormCheckboxLabel>
                        </FormCheckboxWrapper>
                    </div>
                </FormGroup>

                <FormGroup>
                    <FormLabel>Segment klientów</FormLabel>
                    <FormSelect
                        name="segmentType"
                        value={filters.segmentType}
                        onChange={handleInputChange}
                    >
                        <option value="all">Wszyscy klienci</option>
                        <option value="active">Aktywni klienci</option>
                        <option value="inactive">Nieaktywni klienci</option>
                        <option value="new">Nowi klienci</option>
                        <option value="returning">Powracający klienci</option>
                    </FormSelect>
                </FormGroup>

                <FormGroup>
                    <FormLabel>Minimalna liczba wizyt</FormLabel>
                    <FormInput
                        type="number"
                        name="minTotalVisits"
                        value={filters.minTotalVisits || ''}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="Np. 3"
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel>Ostatnia wizyta (dni)</FormLabel>
                    <FormInput
                        type="number"
                        name="lastVisitDays"
                        value={filters.lastVisitDays || ''}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="Np. 90"
                    />
                    <FormHelp>
                        {filters.segmentType === 'active'
                            ? 'Klienci z wizytą w ciągu ostatnich X dni'
                            : filters.segmentType === 'inactive'
                                ? 'Klienci bez wizyty przez ostatnie X dni'
                                : 'Ustaw 0, aby nie filtrować po dacie ostatniej wizyty'}
                    </FormHelp>
                </FormGroup>
            </FilterGrid>

            <FormHelp style={{ marginTop: '16px' }}>
                <FaInfoCircle style={{ marginRight: '5px' }} />
                Filtry klientów pozwalają zawęzić grupę odbiorców kampanii SMS na podstawie ich podstawowych danych
                i historii wizyt. Aby uzyskać bardziej precyzyjne wyniki, możesz łączyć te filtry
                z filtrami pojazdów, finansów i usług.
            </FormHelp>
        </div>
    );
};

export default ClientFilters;