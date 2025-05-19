// src/pages/Finances/components/InvoiceAdvancedFilters.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { InvoiceStatus, InvoiceStatusLabels, InvoiceType, InvoiceTypeLabels, InvoiceFilters } from '../../../types';

interface InvoiceAdvancedFiltersProps {
    onSearch: (filters: InvoiceFilters) => void;
}

const InvoiceAdvancedFilters: React.FC<InvoiceAdvancedFiltersProps> = ({ onSearch }) => {
    const [filters, setFilters] = useState<InvoiceFilters>({});

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (value === '') {
            // Usuwamy pusty filtr
            const updatedFilters = { ...filters };
            delete updatedFilters[name as keyof InvoiceFilters];
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
            delete updatedFilters[name as keyof InvoiceFilters];
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
            <FiltersForm onSubmit={handleSubmit}>
                <FiltersTitle>
                    <span>Filtry zaawansowane</span>
                    <ClearButton type="button" onClick={handleClearFilters}>
                        <FaTimes />
                        <span>Wyczyść filtry</span>
                    </ClearButton>
                </FiltersTitle>

                <FiltersGrid>
                    <FormGroup>
                        <Label htmlFor="number">Numer faktury</Label>
                        <Input
                            id="number"
                            name="number"
                            value={filters.number || ''}
                            onChange={handleFilterChange}
                            placeholder="Np. FV/2024/101"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="title">Tytuł faktury</Label>
                        <Input
                            id="title"
                            name="title"
                            value={filters.title || ''}
                            onChange={handleFilterChange}
                            placeholder="Np. Usługi detailingowe"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="buyerName">Płatnik</Label>
                        <Input
                            id="buyerName"
                            name="buyerName"
                            value={filters.buyerName || ''}
                            onChange={handleFilterChange}
                            placeholder="Nazwa klienta"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="status">Status faktury</Label>
                        <Select
                            id="status"
                            name="status"
                            value={filters.status || ''}
                            onChange={handleFilterChange}
                        >
                            <option value="">Wszystkie statusy</option>
                            {Object.entries(InvoiceStatusLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="type">Typ faktury</Label>
                        <Select
                            id="type"
                            name="type"
                            value={filters.type || ''}
                            onChange={handleFilterChange}
                        >
                            <option value="">Wszystkie typy</option>
                            {Object.entries(InvoiceTypeLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="protocolId">ID protokołu</Label>
                        <Input
                            id="protocolId"
                            name="protocolId"
                            value={filters.protocolId || ''}
                            onChange={handleFilterChange}
                            placeholder="ID protokołu"
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
                        <Label htmlFor="minAmount">Kwota od (PLN)</Label>
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
                        <Label htmlFor="maxAmount">Kwota do (PLN)</Label>
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
                </FiltersGrid>

                <FiltersActions>
                    <SearchButton type="submit">
                        <FaSearch />
                        <span>Wyszukaj faktury</span>
                    </SearchButton>
                </FiltersActions>
            </FiltersForm>
        </FiltersContainer>
    );
};

const FiltersContainer = styled.div`
  margin-bottom: 24px;
`;

const FiltersForm = styled.form`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
`;

const FiltersTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

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
  padding: 8px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
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

const FiltersActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #2980b9;
  }
`;

export default InvoiceAdvancedFilters;