import React from 'react';
import { DiscountType, SelectedService } from '../.././../../../types';
import { FormErrors } from '../hooks/useFormValidation';
import ServiceSearch from './ServiceSearch';
import ServiceTable from './ServiceTable';
import {
    FormSection,
    SectionTitle,
    ErrorText
} from '../styles/styles';

interface ServiceSectionProps {
    searchQuery: string;
    showResults: boolean;
    searchResults: Array<{ id: string; name: string; price: number }>;
    selectedServiceToAdd: { id: string; name: string; price: number } | null;
    services: SelectedService[];
    errors: FormErrors;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectService: (service: { id: string; name: string; price: number }) => void;
    onAddService: () => void;
    onRemoveService: (serviceId: string) => void;
    onDiscountTypeChange: (serviceId: string, discountType: DiscountType) => void;
    onDiscountValueChange: (serviceId: string, discountValue: number) => void;
    calculateTotals: () => { totalPrice: number; totalDiscount: number; totalFinalPrice: number };
}

const ServiceSection: React.FC<ServiceSectionProps> = ({
                                                           searchQuery,
                                                           showResults,
                                                           searchResults,
                                                           selectedServiceToAdd,
                                                           services,
                                                           errors,
                                                           onSearchChange,
                                                           onSelectService,
                                                           onAddService,
                                                           onRemoveService,
                                                           onDiscountTypeChange,
                                                           onDiscountValueChange,
                                                           calculateTotals
                                                       }) => {
    return (
        <FormSection>
            <SectionTitle>Lista usług</SectionTitle>
            {errors.selectedServices && <ErrorText>{errors.selectedServices}</ErrorText>}

            <ServiceSearch
                searchQuery={searchQuery}
                showResults={showResults}
                searchResults={searchResults}
                selectedServiceToAdd={selectedServiceToAdd}
                onSearchChange={onSearchChange}
                onSelectService={onSelectService}
                onAddService={onAddService}
            />

            <ServiceTable
                services={services}
                onRemoveService={onRemoveService}
                onDiscountTypeChange={onDiscountTypeChange}
                onDiscountValueChange={onDiscountValueChange}
                calculateTotals={calculateTotals}
            />
        </FormSection>
    );
};

export default ServiceSection;