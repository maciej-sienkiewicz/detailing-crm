import React, {useState} from 'react';
import {CarReceptionProtocol, SelectedService} from '../../../../types';
import {Service} from '../../../../types';
import {useFormSubmit} from '../hooks/useFormSubmit';
import {useServiceCalculations} from '../hooks/useServiceCalculations';
import VisitTitleSection from '../components/VisitTitleSection';
import ReferralSourceSection from '../components/ReferralSourceSection';
import NotesSection from '../components/NotesSection';
import FormActions from '../components/FormActions';
import VehicleSelectionModal from "../../shared/modals/VehicleSelectionModal";
import {
    Button,
    ConfirmationDialog,
    DialogActions,
    DialogContent,
    DialogText,
    DialogTitle,
    ErrorMessage,
    Form,
    FormContainer
} from '../styles';
import {useFormDataWithAutocomplete} from "../hooks/useFormData";
import VehicleInfoSection from "./VehicleInfoSection";
import ClientInfoSection from "./ClientInfoSection";
import ScheduleSection from "./ScheduleSection";
import {ServiceSection} from "../../../../features/services";

interface EditProtocolFormProps {
    protocol: CarReceptionProtocol | null;
    availableServices: Service[];
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

    const {
        services,
        setServices,
        addService,
        removeService,
        updateBasePrice,
        updateDiscountType,
        updateDiscountValue,
        updateServiceNote,
        calculateTotals
    } = useServiceCalculations(formData.selectedServices || []);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Service[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<Service | null>(null);

    const error = submitError;

    React.useEffect(() => {
        setFormData(prev => ({
            ...prev,
            selectedServices: services,
        }));
    }, [services, setFormData]);

    const handleServiceCreated = (oldId: string, newService: Service) => {
        setServices(prevServices =>
            prevServices.map(service =>
                service.id === oldId
                    ? {
                        ...service,
                        id: newService.id,
                        basePrice: newService.price,
                        finalPrice: newService.price
                    }
                    : service
            )
        );
    };

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

    const handleSelectService = (service: Service) => {
        setSelectedServiceToAdd(service);
        setSearchQuery(service.name);
        setShowResults(false);
    };

    const handleAddService = () => {
        if (selectedServiceToAdd) {
            const newService: Omit<SelectedService, 'finalPrice'> = {
                id: selectedServiceToAdd.id,
                name: selectedServiceToAdd.name,
                quantity: 1,
                basePrice: selectedServiceToAdd.price,
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
                quantity: 1,
                basePrice: {
                    priceNetto: 0,
                    priceBrutto: 0,
                    taxAmount: 0
                },
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

    const handleAddServiceDirect = (service: Service) => {
        const newService: Omit<SelectedService, 'finalPrice'> = {
            id: service.id,
            name: service.name,
            quantity: 1,
            basePrice: service.price,
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