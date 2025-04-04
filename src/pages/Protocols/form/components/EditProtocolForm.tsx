import React, { useState } from 'react';
import {
    CarReceptionProtocol,
    ProtocolStatus,
    SelectedService
} from '../../../../types';

// Custom hooks
import { useFormData } from '../hooks/useFormData';
import { useClientSearch } from '../hooks/useClientSearch';
import { useVehicleSearch } from '../hooks/useVehicleSearch';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useServiceCalculations } from '../hooks/useServiceCalculations';

// Components
import FormHeader from '../components/FormHeader';
import VisitTitleSection from '../components/VisitTitleSection';
import VehicleInfoSection from '../components/VehicleInfoSection';
import ClientInfoSection from '../components/ClientInfoSection';
import ReferralSourceSection from '../components/ReferralSourceSection';
import ServiceSection from '../components/ServiceSection';
import ImageUploadSection from '../components/ImageUploadSection';
import NotesSection from '../components/NotesSection';
import FormActions from '../components/FormActions';
import ClientSelectionModal from "../../shared/modals/ClientSelectionModal";
import VehicleSelectionModal from "../../shared/modals/VehicleSelectionModal";

// Styles
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

interface EditProtocolFormProps {
    protocol: CarReceptionProtocol | null;
    availableServices: Array<{ id: string; name: string; price: number }>;
    initialData?: Partial<CarReceptionProtocol>;
    appointmentId?: string;
    isFullProtocol?: boolean;
    onSave: (protocol: CarReceptionProtocol, showConfirmationModal: boolean) => void;
    onCancel: () => void;
    onServiceAdded?: () => void; // Nowa funkcja callback do odświeżenia listy usług
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
    // Custom hooks for form management
    const {
        formData,
        setFormData,
        errors,
        validateForm,
        clearFieldError,
        handleChange,
        handleReferralSourceChange,
        handleOtherSourceDetailsChange,
        handleImagesChange
    } = useFormData(protocol, initialData);

    // Custom hook for client search
    const {
        foundClients,
        showClientModal,
        searchError: clientSearchError,
        handleSearchByClientField,
        handleClientSelect,
        setShowClientModal
    } = useClientSearch(formData, setFormData);

    // Custom hook for vehicle search
    const {
        foundVehicles,
        showVehicleModal,
        searchError: vehicleSearchError,
        handleSearchByVehicleField,
        handleVehicleSelect,
        setShowVehicleModal
    } = useVehicleSearch(formData, setFormData, foundClients);

    // Custom hook for form submission
    const {
        loading,
        error: submitError,
        pendingSubmit,
        setPendingSubmit,
        handleSubmit
    } = useFormSubmit(formData, protocol, appointmentId, onSave, false);

    // Custom hook for service calculations
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
        updateQuantity  // Dodana nowa funkcja
    } = useServiceCalculations(formData.selectedServices || []);

    // State for service search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; price: number }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<{ id: string; name: string; price: number } | null>(null);

    // Aggregate all errors
    const error = submitError || clientSearchError || vehicleSearchError;

    // Sync services with form state
    React.useEffect(() => {
        setFormData(prev => ({
            ...prev,
            selectedServices: services,
        }));
    }, [services, setFormData]);

    // Handle search change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowResults(true);
        setSelectedServiceToAdd(null);

        // Filter available services
        if (e.target.value.trim() === '') {
            setSearchResults([]);
            return;
        }

        const query = e.target.value.toLowerCase();
        const results = availableServices.filter(service =>
            service.name.toLowerCase().includes(query) &&
            // Exclude already selected services
            !services.some(selected => selected.id === service.id)
        );

        setSearchResults(results);
    };

    // Select service from search results
    const handleSelectService = (service: { id: string; name: string; price: number }) => {
        setSelectedServiceToAdd(service);
        setSearchQuery(service.name);
        setShowResults(false);
    };

    // Add selected service to table
    const handleAddService = () => {
        if (selectedServiceToAdd) {
            // Add selected existing service
            const newService: Omit<SelectedService, 'finalPrice'> = {
                id: selectedServiceToAdd.id,
                name: selectedServiceToAdd.name,
                price: selectedServiceToAdd.price,
                discountType: "PERCENTAGE" as any,
                discountValue: 0,
                approvalStatus: undefined
            };

            addService(newService);
        } else if (searchQuery.trim() !== '') {
            // Add custom service
            const customId = `custom-${Date.now()}`; // Generate unique ID
            const newService: Omit<SelectedService, 'finalPrice'> = {
                id: customId,
                name: searchQuery.trim(),
                price: 0, // Default price zero, user will update
                discountType: "PERCENTAGE" as any,
                discountValue: 0,
                approvalStatus: undefined
            };

            addService(newService);
        }

        // Reset search field
        setSearchQuery('');
        setSelectedServiceToAdd(null);
        clearFieldError('selectedServices');
    };

    // Add service directly
    const handleAddServiceDirect = (service: { id: string; name: string; price: number }) => {
        const newService: Omit<SelectedService, 'finalPrice'> = {
            id: service.id,
            name: service.name,
            price: service.price,
            discountType: "PERCENTAGE" as any,
            discountValue: 0,
            approvalStatus: undefined
        };

        addService(newService);

        // Reset search
        setSearchQuery('');
        setSelectedServiceToAdd(null);
        clearFieldError('selectedServices');
        setShowResults(false);
    };

    // Wywołanie funkcji odświeżającej po dodaniu nowej usługi
    const handleServiceAdded = () => {
        if (onServiceAdded) {
            onServiceAdded();
        }
    };

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
                    onChange={handleChange}
                    error={errors.title}
                />

                <VehicleInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onSearchByField={handleSearchByVehicleField}
                    isFullProtocol={isFullProtocol}
                />

                <ClientInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onSearchByField={handleSearchByClientField}
                />

                <ReferralSourceSection
                    referralSource={formData.referralSource || null}
                    otherSourceDetails={formData.otherSourceDetails || ''}
                    onSourceChange={handleReferralSourceChange}
                    onOtherDetailsChange={handleOtherSourceDetailsChange}
                />

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
                    onQuantityChange={updateQuantity}  // Dodany nowy prop
                    onAddNote={updateServiceNote}
                    calculateTotals={calculateTotals}
                    allowCustomService={true}
                    onServiceAdded={onServiceAdded}
                />

                <ImageUploadSection
                    images={formData.vehicleImages || []}
                    onImagesChange={handleImagesChange}
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

            {/* Client selection modal */}
            {showClientModal && (
                <ClientSelectionModal
                    clients={foundClients}
                    onSelect={handleClientSelect}
                    onCancel={() => setShowClientModal(false)}
                />
            )}

            {/* Vehicle selection modal */}
            {showVehicleModal && (
                <VehicleSelectionModal
                    vehicles={foundVehicles}
                    onSelect={handleVehicleSelect}
                    onCancel={() => setShowVehicleModal(false)}
                />
            )}

            {/* Confirmation dialog for zero price services */}
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

export default EditProtocolForm;