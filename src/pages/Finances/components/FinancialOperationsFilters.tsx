// src/pages/Finances/components/FinancialOperationsFilters.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import {
    FinancialOperationFilters,
    FinancialOperationType,
    FinancialOperationTypeLabels,
    TransactionDirection,
    TransactionDirectionLabels,
    PaymentStatus,
    PaymentStatusLabels,
    PaymentMethod,
    PaymentMethodLabels
} from '../../../types';

interface FinancialOperationsFiltersProps {
    onSearch: (filters: FinancialOperationFilters) => void;
    initialFilters?: FinancialOperationFilters;
}

const FinancialOperationsFilters: React.FC<FinancialOperationsFiltersProps> = ({
                                                                                   onSearch,
                                                                                   initialFilters = {}
                                                                               }) => {
    const [filters, setFilters] = useState<FinancialOperationFilters>(initialFilters);
    const [expanded, setExpanded] = useState<boolean>(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (value === '') {
            // Usuwamy pusty filtr
            const updatedFilters = { ...filters };
            delete updatedFilters[name as keyof FinancialOperationFilters];
            setFilters(updatedFilters);
        } else {
            // Aktualizujemy filtr
            setFilters({ ...filters, [name]: value });
        }
    };

    const handleNumericFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (value === '') {
            // Usuwamy pusty filtr
            const updatedFilters = { ...filters };
            delete updatedFilters[name as keyof FinancialOperationFilters];
            setFilters(updatedFilters);
        } else {
            // Aktualizujemy filtr z konwersją na liczbę
            setFilters({ ...filters, [name]: parseFloat(value) });
        }
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(filters);
    };

    return (
        <FiltersContainer>
            <FiltersHeader onClick={() => setExpanded(!expanded)}>
                <FilterTitle>
                    <FilterIcon><FaFilter /></FilterIcon>
                    Filtry operacji finansowych
                </FilterTitle>
                <FilterExpandIcon>
                    {expanded ? <FaChevronUp /> : <FaChevronDown />}
                </FilterExpandIcon>
            </FiltersHeader>

            {expanded && (
                <FiltersForm onSubmit={handleSubmit}>
                    <FiltersGrid>
                        <FormGroup>
                            <Label htmlFor="type">Typ operacji</Label>
                            <Select
                                id="type"
                                name="type"
                                value={filters.type || ''}
                                onChange={handleFilterChange}
                            >
                                <option value="">Wszystkie typy</option>
                                {Object.entries(FinancialOperationTypeLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="direction">Kierunek</Label>
                            <Select
                                id="direction"
                                name="direction"
                                value={filters.direction || ''}
                                onChange={handleFilterChange}
                            >
                                <option value="">Wszystkie</option>
                                {Object.entries(TransactionDirectionLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="status">Status płatności</Label>
                            <Select
                                id="status"
                                name="status"
                                value={filters.status || ''}
                                onChange={handleFilterChange}
                            >
                                <option value="">Wszystkie statusy</option>
                                {Object.entries(PaymentStatusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="paymentMethod">Metoda płatności</Label>
                            <Select
                                id="paymentMethod"
                                name="paymentMethod"
                                value={filters.paymentMethod || ''}
                                onChange={handleFilterChange}
                            >
                                <option value="">Wszystkie metody</option>
                                {Object.entries(PaymentMethodLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="counterpartyName">Kontrahent</Label>
                            <Input
                                id="counterpartyName"
                                name="counterpartyName"
                                value={filters.counterpartyName || ''}
                                onChange={handleFilterChange}
                                placeholder="Nazwa kontrahenta"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="documentNumber">Numer dokumentu</Label>
                            <Input
                                id="documentNumber"
                                name="documentNumber"
                                value={filters.documentNumber || ''}
                                onChange={handleFilterChange}
                                placeholder="Np. FV/2023/123"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="dateFrom">Data od</Label>
                            <Input
                                id="dateFrom"
                                name="dateFrom"
                                type="date"
                                value={filters.dateFrom || ''}
                                onChange={handleFilterChange}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="dateTo">Data do</Label>
                            <Input
                                id="dateTo"
                                name="dateTo"
                                type="date"
                                value={filters.dateTo || ''}
                                onChange={handleFilterChange}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="minAmount">Kwota od</Label>
                            <Input
                                id="minAmount"
                                name="minAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={filters.minAmount || ''}
                                onChange={handleNumericFilterChange}
                                placeholder="Minimalna kwota"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="maxAmount">Kwota do</Label>
                            <Input
                                id="maxAmount"
                                name="maxAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={filters.maxAmount || ''}
                                onChange={handleNumericFilterChange}
                                placeholder="Maksymalna kwota"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="protocolId">ID protokołu</Label>
                            <Input
                                id="protocolId"
                                name="protocolId"
                                value={filters.protocolId || ''}
                                onChange={handleFilterChange}
                                placeholder="ID powiązanego protokołu"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="visitId">ID wizyty</Label>
                            <Input
                                id="visitId"
                                name="visitId"
                                value={filters.visitId || ''}
                                onChange={handleFilterChange}
                                placeholder="ID powiązanej wizyty"
                            />
                        </FormGroup>
                    </FiltersGrid>

                    <ButtonContainer>
                        <ResetButton type="button" onClick={handleClearFilters}>
                            <FaTimes /> Wyczyść filtry
                        </ResetButton>
                        <SearchButton type="submit">
                            <FaSearch /> Zastosuj filtry
                        </SearchButton>
                    </ButtonContainer>
                </FiltersForm>
            )}
        </FiltersContainer>
    );
};

const FiltersContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  overflow: hidden;
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const FilterTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #2c3e50;
`;

const FilterIcon = styled.span`
  color: #3498db;
`;

const FilterExpandIcon = styled.span`
  color: #7f8c8d;
`;

const FiltersForm = styled.form`
  padding: 0 20px 20px;
  border-top: 1px solid #eef2f7;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #34495e;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2;
    &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;

  @media (max-width: 576px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const ResetButton = styled(Button)`
  background-color: white;
  color: #7f8c8d;
  border: 1px solid #dfe6e9;

  &:hover {
    background-color: #f8f9fa;
    color: #e74c3c;
  }
`;

const SearchButton = styled(Button)`
  background-color: #3498db;
  color: white;
  border: none;

  &:hover {
    background-color: #2980b9;
  }
`;

export default FinancialOperationsFilters;