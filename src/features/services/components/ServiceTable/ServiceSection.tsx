// src/features/services/components/ServiceSection.tsx
import React from 'react';
import styled from 'styled-components';
import { DiscountType, SelectedService, Service } from '../../../../types';
import { ServiceSearch } from './ServiceSearch';
import { ServiceTable } from './ServiceTable';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
    },
    spacing: {
        md: '16px',
    }
};

interface ServiceSectionProps {
    searchQuery: string;
    showResults: boolean;
    searchResults: Service[];
    selectedServiceToAdd: Service | null;
    services: SelectedService[];
    errors?: Record<string, string>;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectService: (service: Service) => void;
    onAddService: () => void;
    onRemoveService: (serviceId: string) => void;
    onDiscountTypeChange: (serviceId: string, discountType: DiscountType) => void;
    onDiscountValueChange: (serviceId: string, discountValue: number) => void;
    onBasePriceChange: (serviceId: string, newPrice: number) => void;
    onAddNote?: (serviceId: string, note: string) => void;
    calculateTotals: () => { totalPrice: number; totalDiscount: number; totalFinalPrice: number };
    allowCustomService: boolean;
    onAddServiceDirect: (service: Service) => void;
    onServiceAdded?: () => void;
    onServiceCreated?: (oldId: string, newService: Service) => void;
    readOnly?: boolean;
}

export const ServiceSection: React.FC<ServiceSectionProps> = ({
                                                                  searchQuery,
                                                                  showResults,
                                                                  searchResults,
                                                                  selectedServiceToAdd,
                                                                  services,
                                                                  errors = {},
                                                                  onSearchChange,
                                                                  onSelectService,
                                                                  onAddService,
                                                                  onAddServiceDirect,
                                                                  onRemoveService,
                                                                  onDiscountTypeChange,
                                                                  onDiscountValueChange,
                                                                  onBasePriceChange,
                                                                  onAddNote,
                                                                  calculateTotals,
                                                                  allowCustomService,
                                                                  onServiceAdded,
                                                                  onServiceCreated,
                                                                  readOnly = false
                                                              }) => {
    return (
        <FormSection>
            <SectionTitle>Lista usług</SectionTitle>
            {errors.selectedServices && <ErrorText>{errors.selectedServices}</ErrorText>}

            {!readOnly && (
                <ServiceSearch
                    searchQuery={searchQuery}
                    showResults={showResults}
                    searchResults={searchResults}
                    selectedServiceToAdd={selectedServiceToAdd}
                    onSearchChange={onSearchChange}
                    onSelectService={onSelectService}
                    onAddService={onAddService}
                    onAddServiceDirect={onAddServiceDirect}
                    allowCustomService={allowCustomService}
                    onServiceAdded={onServiceAdded}
                    onServiceCreated={onServiceCreated}
                />
            )}

            <ServiceTable
                services={services}
                onRemoveService={onRemoveService}
                onDiscountTypeChange={onDiscountTypeChange}
                onDiscountValueChange={onDiscountValueChange}
                onBasePriceChange={onBasePriceChange}
                onAddNote={onAddNote}
                calculateTotals={calculateTotals}
                readOnly={readOnly}
            />
        </FormSection>
    );
};

const FormSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background: ${brandTheme.primary};
        border-radius: 2px;
    }
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
`;