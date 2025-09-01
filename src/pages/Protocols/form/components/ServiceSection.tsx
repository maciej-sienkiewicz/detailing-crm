import React from 'react';
import {DiscountType, SelectedService} from '../../../../types';
import {FormErrors} from '../hooks/useFormValidation';
import ServiceSearch from './ServiceSearch';
import ServiceTable from './ServiceTable';
import {ErrorText, FormSection, SectionTitle} from '../styles';

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
    onBasePriceChange: (serviceId: string, newPrice: number) => void;
    onAddNote?: (serviceId: string, note: string) => void;
    calculateTotals: () => { totalPrice: number; totalDiscount: number; totalFinalPrice: number };
    allowCustomService: boolean;
    onAddServiceDirect: (service: { id: string; name: string; price: number }) => void;
    onServiceAdded?: () => void;
    onServiceCreated?: (oldId: string, newService: { id: string; name: string; price: number }) => void;
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
                                                           onAddServiceDirect,
                                                           onRemoveService,
                                                           onDiscountTypeChange,
                                                           onDiscountValueChange,
                                                           onBasePriceChange,
                                                           onAddNote,
                                                           calculateTotals,
                                                           allowCustomService,
                                                           onServiceAdded,
                                                           onServiceCreated
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
                onAddServiceDirect={onAddServiceDirect}
                allowCustomService={allowCustomService}
                onServiceAdded={onServiceAdded}
                onServiceCreated={onServiceCreated}
            />

            <ServiceTable
                services={services}
                onRemoveService={onRemoveService}
                onDiscountTypeChange={onDiscountTypeChange}
                onDiscountValueChange={onDiscountValueChange}
                onBasePriceChange={onBasePriceChange}
                onAddNote={onAddNote}
                calculateTotals={calculateTotals}
            />
        </FormSection>
    );
};

export default ServiceSection;