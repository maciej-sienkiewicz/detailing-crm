// src/pages/Finances/components/InvoiceFiltersComponent.tsx
import React from 'react';
import styled from 'styled-components';
import { InvoiceStatus, InvoiceStatusLabels } from '../../../types';

interface InvoiceFiltersProps {
    activeFilter: InvoiceStatus | 'ALL';
    onFilterChange: (filter: InvoiceStatus | 'ALL') => void;
}

const InvoiceFiltersComponent: React.FC<InvoiceFiltersProps> = ({ activeFilter, onFilterChange }) => {
    return (
        <FilterButtons>
            <FilterButton
                active={activeFilter === 'ALL'}
                onClick={() => onFilterChange('ALL')}
            >
                Wszystkie
            </FilterButton>

            {Object.values(InvoiceStatus).map((status) => (
                <FilterButton
                    key={status}
                    active={activeFilter === status}
                    onClick={() => onFilterChange(status)}
                    status={status}
                >
                    {InvoiceStatusLabels[status]}
                </FilterButton>
            ))}
        </FilterButtons>
    );
};

const FilterButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const FilterButton = styled.button<{ active: boolean; status?: InvoiceStatus }>`
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  background-color: ${props => {
    if (props.active) {
        if (props.status) {
            switch (props.status) {
                case InvoiceStatus.PAID:
                    return '#2ecc7122';
                case InvoiceStatus.NOT_PAID:
                    return '#3498db22';
                case InvoiceStatus.OVERDUE:
                    return '#e74c3c22';
                case InvoiceStatus.CANCELLED:
                    return '#95a5a622';
                default:
                    return '#3498db';
            }
        } else {
            return '#3498db';
        }
    } else {
        return 'white';
    }
}};
  color: ${props => {
    if (props.active) {
        if (props.status) {
            switch (props.status) {
                case InvoiceStatus.PAID:
                    return '#2ecc71';
                case InvoiceStatus.NOT_PAID:
                    return '#3498db';
                case InvoiceStatus.OVERDUE:
                    return '#e74c3c';
                case InvoiceStatus.CANCELLED:
                    return '#95a5a6';
                default:
                    return 'white';
            }
        } else {
            return 'white';
        }
    } else {
        return '#2c3e50';
    }
}};
  border: 1px solid ${props => {
    if (props.active) {
        if (props.status) {
            switch (props.status) {
                case InvoiceStatus.PAID:
                    return '#2ecc71';
                case InvoiceStatus.NOT_PAID:
                    return '#3498db';
                case InvoiceStatus.OVERDUE:
                    return '#e74c3c';
                case InvoiceStatus.CANCELLED:
                    return '#95a5a6';
                default:
                    return '#3498db';
            }
        } else {
            return '#3498db';
        }
    } else {
        return '#dfe6e9';
    }
}};
  
  &:hover {
    background-color: ${props => props.active ? (
    props.status ? (
        (() => {
            switch (props.status) {
                case InvoiceStatus.PAID:
                    return '#2ecc7122';
                case InvoiceStatus.NOT_PAID:
                    return '#3498db22';
                case InvoiceStatus.OVERDUE:
                    return '#e74c3c22';
                case InvoiceStatus.CANCELLED:
                    return '#95a5a622';
                default:
                    return '#2980b9';
            }
        })()
    ) : '#2980b9'
) : '#f5f6fa'};
  }
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

export default InvoiceFiltersComponent;