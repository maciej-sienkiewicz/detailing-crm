import React, {useState, useEffect} from 'react';
import {CarReceptionProtocol, SelectedService, Service} from '../../../../types';

import {useVisitServicesState} from '../../hooks/useVisitServicesState';

import {ServiceSection} from "../../../services";
import {useAddService} from "../../hooks/useAddService";
import {useRemoveService} from "../../hooks/useRemoveService";
import {useUpdateBasePrice} from "../../hooks/useUpdateBasePrice";
import {useUpdateDiscountType} from "../../hooks/useUpdateDiscountType";
import {useUpdateDiscountValue} from "../../hooks/useUpdateDiscountValue";
import {useUpdateServiceNote} from "../../hooks/useUpdateServiceNote";
import {useHandleServiceCreated} from "../../hooks/useHandleServiceCreated";
import {useTotalsCalculation} from "../../hooks/useTotalsCalculation";
import VisitTitleSection from "../../../../pages/Protocols/form/components/VisitTitleSection";
import ScheduleSection from "../../../../pages/Protocols/form/components/ScheduleSection";
import ClientInfoSection from "../../../../pages/Protocols/form/components/ClientInfoSection";
import VehicleInfoSection from "../../../../pages/Protocols/form/components/VehicleInfoSection";
import NotesSection from "../../../../pages/Protocols/form/components/NotesSection";
import {
    Button,
    ConfirmationDialog, DialogActions, DialogContent, DialogText, DialogTitle,
    ErrorMessage,
    Form,
    FormContainer
} from "../../../../pages/Protocols/form/styles";
import VehicleSelectionModal from "../../../../pages/Protocols/shared/modals/VehicleSelectionModal";
import {useFormDataWithAutocomplete} from "../../../../pages/Protocols/form/hooks/useFormData";
import {useFormSubmit} from "../../../../pages/Protocols/form/hooks/useFormSubmit";
import ReferralSourceSection from "../../../../pages/Protocols/form/components/ReferralSourceSection";
import FormActions from "../../../../pages/Protocols/form/components/FormActions";

interface EditVisitFormProps {
    protocol: CarReceptionProtocol | null;
    availableServices: Service[];
    initialData?: Partial<CarReceptionProtocol>;
    appointmentId?: string;
    isFullProtocol?: boolean;
    onSave: (protocol: CarReceptionProtocol, showConfirmationModal: boolean) => void;
    onCancel: () => void;
    onServiceAdded?: () => void;
}

const EditVisitForm: React.FC<EditVisitFormProps> = ({
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
        clearFieldError,
        handleChange,
        handleReferralSourceChange,
        handleOtherSourceDetailsChange,
        isClientFromSearch,
        autocompleteOptions,
        loadingAutocompleteData,
        handleAutocompleteSelect,
        showVehicleModal,
        setShowVehicleModal,
        vehicleModalOptions,
        handleVehicleModalSelect
    } = useFormDataWithAutocomplete(protocol, initialData);

    const {
        loading,
        error: submitError,
        pendingSubmit,
        setPendingSubmit,
        handleSubmit
    } = useFormSubmit(formData, protocol, appointmentId, onSave, false);

    const { services, setServices } = useVisitServicesState(formData.selectedServices || []);

    const addServiceCommand = useAddService(setServices);
    const removeService = useRemoveService(setServices);
    const updateBasePrice = useUpdateBasePrice(setServices);
    const updateDiscountType = useUpdateDiscountType(setServices);
    const updateDiscountValue = useUpdateDiscountValue(setServices);
    const updateServiceNote = useUpdateServiceNote(setServices);
    const handleServiceCreated = useHandleServiceCreated(setServices);
    const calculateTotals = useTotalsCalculation(services);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Service[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<Service | null>(null);

    const error = submitError;

    useEffect(() => {
        console.log('🔄 EditVisitForm: availableServices changed', {
            count: availableServices.length,
            names: availableServices.map(s => s.name),
            searchQuery,
            hasSearchQuery: searchQuery.trim() !== ''
        });

        if (searchQuery.trim() !== '') {
            const lowerQuery = searchQuery.toLowerCase();
            const results = availableServices.filter(service =>
                service.name.toLowerCase().includes(lowerQuery));

            console.log('🔍 Recalculated search results:', {
                query: searchQuery,
                resultsCount: results.length,
                results: results.map(r => r.name)
            });
            setSearchResults(results);
        }
    }, [availableServices, searchQuery, services]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            selectedServices: services,
        }));
    }, [services, setFormData]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        console.log('🔎 Search query changed:', query);
        setSearchQuery(query);
        setShowResults(true);
        setSelectedServiceToAdd(null);

        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        console.log('📋 Available services details:', availableServices.map(s => ({
            id: s.id,
            name: s.name,
            nameLower: s.name.toLowerCase(),
            includes: s.name.toLowerCase().includes(lowerQuery)
        })));

        console.log('📋 Currently selected services:', services.map(s => ({
            id: s.id,
            name: s.name
        })));

        const results = availableServices.filter(service => {
            const nameMatches = service.name.toLowerCase().includes(lowerQuery);

            return nameMatches;
        });

        console.log('🔍 Search results:', {
            query,
            availableServicesCount: availableServices.length,
            resultsCount: results.length,
            results: results.map(r => r.name)
        });
        setSearchResults(results);
    };

    const handleSelectService = (service: Service) => {
        setSelectedServiceToAdd(service);
        setSearchQuery(service.name);
        setShowResults(false);
    };

    const handleAddService = () => {
        let newServiceData: Omit<SelectedService, 'finalPrice'>;

        if (selectedServiceToAdd) {
            newServiceData = {
                id: selectedServiceToAdd.id,
                rowId: `row-${selectedServiceToAdd.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: selectedServiceToAdd.name,
                quantity: 1,
                basePrice: selectedServiceToAdd.price,
                discountType: "PERCENTAGE" as any,
                discountValue: 0,
                approvalStatus: undefined,
            };
        } else if (searchQuery.trim() !== '') {
            const customId = `custom-${Date.now()}`;
            newServiceData = {
                id: customId,
                rowId: `row-new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: searchQuery.trim(),
                quantity: 1,
                basePrice: { priceNetto: 0, priceBrutto: 0, taxAmount: 0 },
                discountType: "PERCENTAGE" as any,
                discountValue: 0,
                approvalStatus: undefined,
            };
        } else {
            return;
        }

        addServiceCommand(newServiceData);
        setSearchQuery('');
        setSelectedServiceToAdd(null);
        clearFieldError('selectedServices');

        console.log('➕ Service added, calling onServiceAdded');
        if (onServiceAdded) {
            onServiceAdded();
        }
    };

    const handleAddServiceDirect = (service: Service) => {
        const newServiceData: Omit<SelectedService, 'finalPrice'> = {
            id: service.id,
            rowId: `row-${service.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: service.name,
            quantity: 1,
            basePrice: service.price,
            discountType: "PERCENTAGE" as any,
            discountValue: 0,
            approvalStatus: undefined,
        };
        addServiceCommand(newServiceData);
        setSearchQuery('');
        setSelectedServiceToAdd(null);
        clearFieldError('selectedServices');
        setShowResults(false);

        console.log('➕ Service added directly, calling onServiceAdded');
        if (onServiceAdded) {
            onServiceAdded();
        }
    };

    if (loadingAutocompleteData) {
        return <FormContainer><div style={{ padding: '2rem', textAlign: 'center' }}>Ładowanie danych klientów i pojazdów...</div></FormContainer>;
    }

    return (
        <FormContainer>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Form onSubmit={handleSubmit}>
                <VisitTitleSection title={formData.title || ''} selectedColorId={formData.calendarColorId} onChange={handleChange} error={errors.title} />
                <ScheduleSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    isFullProtocol={isFullProtocol}
                />
                <ClientInfoSection formData={formData} errors={errors} onChange={handleChange} autocompleteOptions={autocompleteOptions} onAutocompleteSelect={handleAutocompleteSelect} />

                <VehicleInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    isFullProtocol={isFullProtocol}
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
                    availableServices={availableServices}
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
                    onServiceCreated={handleServiceCreated}
                />
                <NotesSection notes={formData.notes || ''} onChange={handleChange} />
                <FormActions onCancel={onCancel} isLoading={loading} isEditing={!!protocol} isFullProtocol={isFullProtocol} />
            </Form>
            {showVehicleModal && <VehicleSelectionModal vehicles={vehicleModalOptions} onSelect={handleVehicleModalSelect} onCancel={() => setShowVehicleModal(false)} />}
            {pendingSubmit && (
                <ConfirmationDialog>
                    <DialogContent>
                        <DialogTitle>Usługi z ceną 0</DialogTitle>
                        <DialogText>W protokole znajdują się usługi z ceną 0. Czy na pewno chcesz zapisać protokół?</DialogText>
                        <DialogActions>
                            <Button secondary onClick={() => setPendingSubmit(false)}>Anuluj</Button>
                            <Button primary onClick={(e) => { setPendingSubmit(false); handleSubmit(e); }}>Zapisz mimo to</Button>
                        </DialogActions>
                    </DialogContent>
                </ConfirmationDialog>
            )}
        </FormContainer>
    );
};
export default EditVisitForm