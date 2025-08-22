// src/pages/Protocols/form/components/EditProtocolForm.tsx - ZAKTUALIZOWANA WERSJA
import React, { useState } from 'react';
import {
    CarReceptionProtocol,
    ProtocolStatus,
    SelectedService
} from '../../../../types';

import { useFormSubmit } from '../hooks/useFormSubmit';
import { useServiceCalculations } from '../hooks/useServiceCalculations';

import FormHeader from '../components/FormHeader';
import VisitTitleSection from '../components/VisitTitleSection';
import ReferralSourceSection from '../components/ReferralSourceSection';
import ServiceSection from '../components/ServiceSection';
import NotesSection from '../components/NotesSection';
import FormActions from '../components/FormActions';
import VehicleSelectionModal from "../../shared/modals/VehicleSelectionModal";
import { DeliveryPersonSection } from './DeliveryPersonSection'; // NOWY IMPORT

import {
    FormContainer,
    Form,
    ErrorMessage,
    ConfirmationDialog,
    DialogContent,
    DialogTitle,
    DialogText,
    DialogActions,
    Button
} from '../styles';
import {useFormDataWithAutocomplete} from "../hooks/useFormData";
import VehicleInfoSection from "./VehicleInfoSection";
import ClientInfoSection from "./ClientInfoSection";

interface EditProtocolFormProps {
    protocol: CarReceptionProtocol | null;
    availableServices: Array<{ id: string; name: string; price: number }>;
    initialData?: Partial<CarReceptionProtocol>;
    appointmentId?: string;
    isFullProtocol?: boolean;
    onSave: (protocol: CarReceptionProtocol, showConfirmationModal: boolean) => void;
    onCancel: () => void;
    onServiceAdded?: () => void;
}

export const EditProtocolForm: React.FC<EditProtocolFormProps> = ({
                                                                      protocol,
                                                                      availableServices,
                                                                      initialData,
                                                                      appointmentId,
                                                                      isFullProtocol = true,
                                                                      onSave,
                                                                      onCancel,
                                                                      onServiceAdded
                                                                  }) => {
    const {
        formData,
        setFormData,
        errors,
        validateForm,
        clearFieldError,
        handleChange,
        handleReferralSourceChange,
        handleOtherSourceDetailsChange,
        handleImagesChange,
        isClientFromSearch,
        setIsClientFromSearch,
        autocompleteOptions,
        loadingAutocompleteData,
        handleAutocompleteSelect,
        showVehicleModal,
        setShowVehicleModal,
        vehicleModalOptions,
        handleVehicleModalSelect,
        // NOWE: Delivery Person
        isDeliveryPersonDifferent,
        handleDeliveryPersonToggle,
        handleDeliveryPersonNameChange,
        handleDeliveryPersonPhoneChange,
        handleDeliveryPersonAutocompleteSelect
    } = useFormDataWithAutocomplete(protocol, initialData);

    const {
        loading,
        error: submitError,
        pendingSubmit,
        setPendingSubmit,
        handleSubmit
    } = useFormSubmit(formData, protocol, appointmentId, onSave, false);

    const {
        services,
        setServices,
        calculateTotals,
        addService,
        removeService,
        updateBasePrice,
        updateDiscountType,
        updateDiscountValue,
        updateServiceNote,
    } = useServiceCalculations(formData.selectedServices || []);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; price: number }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<{ id: string; name: string; price: number } | null>(null);

    const error = submitError;

    React.useEffect(() => {
        setFormData(prev => ({
            ...prev,
            selectedServices: services,
        }));
    }, [services, setFormData]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowResults(true);
        setSelectedServiceToAdd(null);

        if (e.target.value.trim() === '') {
            setSearchResults([]);
            return;
        }

        const query = e.target.value.toLowerCase();
        const results = availableServices.filter(service =>
            service.name.toLowerCase().includes(query) &&
            !services.some(selected => selected.id === service.id)
        );

        setSearchResults(results);
    };

    const handleSelectService = (service: { id: string; name: string; price: number }) => {
        setSelectedServiceToAdd(service);
        setSearchQuery(service.name);
        setShowResults(false);
    };

    const handleAddService = () => {
        if (selectedServiceToAdd) {
            const newService: Omit<SelectedService, 'finalPrice'> = {
                id: selectedServiceToAdd.id,
                name: selectedServiceToAdd.name,
                price: selectedServiceToAdd.price,
                discountType: "PERCENTAGE" as any,
                discountValue: 0,
                approvalStatus: undefined,
            };

            addService(newService);
        } else if (searchQuery.trim() !== '') {
            const customId = `custom-${Date.now()}`;
            const newService: Omit<SelectedService, 'finalPrice'> = {
                id: customId,
                name: searchQuery.trim(),
                price: 0,
                discountType: "PERCENTAGE" as any,
                discountValue: 0,
                approvalStatus: undefined,
            };

            addService(newService);
        }

        setSearchQuery('');
        setSelectedServiceToAdd(null);
        clearFieldError('selectedServices');
    };

    const handleAddServiceDirect = (service: { id: string; name: string; price: number }) => {
        const newService: Omit<SelectedService, 'finalPrice'> = {
            id: service.id,
            name: service.name,
            price: service.price,
            discountType: "PERCENTAGE" as any,
            discountValue: 0,
            approvalStatus: undefined,
        };

        addService(newService);

        setSearchQuery('');
        setSelectedServiceToAdd(null);
        clearFieldError('selectedServices');
        setShowResults(false);
    };

    const handleServiceAdded = () => {
        if (onServiceAdded) {
            onServiceAdded();
        }
    };

    if (loadingAutocompleteData) {
        return (
            <FormContainer>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    Ładowanie danych klientów i pojazdów...
                </div>
            </FormContainer>
        );
    }

    return (
        <FormContainer>
            <FormHeader
                isEditing={!!protocol}
                appointmentId={appointmentId}
                isFullProtocol={isFullProtocol}
            />

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleSubmit}>
                <VisitTitleSection
                    title={formData.title || ''}
                    selectedColorId={formData.calendarColorId}
                    onChange={handleChange}
                    error={errors.title}
                />

                <VehicleInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    isFullProtocol={isFullProtocol}
                    autocompleteOptions={autocompleteOptions}
                    onAutocompleteSelect={handleAutocompleteSelect}
                />

                <ClientInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    autocompleteOptions={autocompleteOptions}
                    onAutocompleteSelect={handleAutocompleteSelect}
                />

                {!isClientFromSearch && (
                    <ReferralSourceSection
                        referralSource={formData.referralSource || null}
                        otherSourceDetails={formData.otherSourceDetails || ''}
                        onSourceChange={handleReferralSourceChange}
                        onOtherDetailsChange={handleOtherSourceDetailsChange}
                    />
                )}

                <ServiceSection
                    searchQuery={searchQuery}
                    showResults={showResults}
                    searchResults={searchResults}
                    selectedServiceToAdd={selectedServiceToAdd}
                    services={services}
                    errors={errors}
                    onSearchChange={handleSearchChange}
                    onSelectService={handleSelectService}
                    onAddService={handleAddService}
                    onAddServiceDirect={handleAddServiceDirect}
                    onRemoveService={removeService}
                    onDiscountTypeChange={updateDiscountType}
                    onDiscountValueChange={updateDiscountValue}
                    onBasePriceChange={updateBasePrice}
                    onAddNote={updateServiceNote}
                    calculateTotals={calculateTotals}
                    allowCustomService={true}
                    onServiceAdded={onServiceAdded}
                />

                <NotesSection
                    notes={formData.notes || ''}
                    onChange={handleChange}
                />

                <FormActions
                    onCancel={onCancel}
                    isLoading={loading}
                    isEditing={!!protocol}
                    isFullProtocol={isFullProtocol}
                />
            </Form>

            {showVehicleModal && (
                <VehicleSelectionModal
                    vehicles={vehicleModalOptions}
                    onSelect={handleVehicleModalSelect}
                    onCancel={() => setShowVehicleModal(false)}
                />
            )}

            {pendingSubmit && (
                <ConfirmationDialog>
                    <DialogContent>
                        <DialogTitle>Usługi z ceną 0</DialogTitle>
                        <DialogText>
                            W protokole znajdują się usługi z ceną 0. Czy na pewno chcesz zapisać protokół?
                        </DialogText>
                        <DialogActions>
                            <Button secondary onClick={() => setPendingSubmit(false)}>
                                Anuluj
                            </Button>
                            <Button primary onClick={(e) => {
                                setPendingSubmit(false);
                                handleSubmit(e);
                            }}>
                                Zapisz mimo to
                            </Button>
                        </DialogActions>
                    </DialogContent>
                </ConfirmationDialog>
            )}
        </FormContainer>
    );
};