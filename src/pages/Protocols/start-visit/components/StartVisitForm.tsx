import React, { useState, useEffect } from 'react';
import { CarReceptionProtocol, ProtocolStatus, ServiceApprovalStatus } from '../../../../types';
import { protocolsApi } from '../../../../api/protocolsApi';

// Sekcje formularza
import FormHeader from '../../form/components/FormHeader';
import VisitTitleSection from '../../form/components/VisitTitleSection';
import VehicleInfoSection from '../../form/components/VehicleInfoSection';
import ClientInfoSection from '../../form/components/ClientInfoSection';
import ServiceSection from '../../form/components/ServiceSection';
import ImageUploadSection from '../../form/components/ImageUploadSection';
import NotesSection from '../../form/components/NotesSection';

// Hooks
import { useServiceCalculations } from '../../form/hooks/useServiceCalculations';

// Style
import {
    FormContainer,
    Form,
    ErrorMessage,
    FormActions,
    Button
} from '../../form/styles';

interface StartVisitFormProps {
    protocol: CarReceptionProtocol;
    availableServices: Array<{ id: string; name: string; price: number }>;
    onSave: (protocol: CarReceptionProtocol) => void;
    onCancel: () => void;
}

const StartVisitForm: React.FC<StartVisitFormProps> = ({
                                                           protocol,
                                                           availableServices,
                                                           onSave,
                                                           onCancel
                                                       }) => {
    const [formData, setFormData] = useState<CarReceptionProtocol>({...protocol});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stan dla wyszukiwania usług
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; price: number }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<{ id: string; name: string; price: number } | null>(null);

    // Custom hook dla obliczeń usług
    const {
        services,
        setServices,
        calculateTotals,
        addService,
        removeService,
        updateBasePrice,
        updateDiscountType,
        updateDiscountValue,
        updateServiceNote
    } = useServiceCalculations(formData.selectedServices || []);

    // Synchronizacja usług z formularzem
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            selectedServices: services,
            status: ProtocolStatus.IN_PROGRESS // Zawsze ustawiamy status na IN_PROGRESS przy rozpoczynaniu wizyty
        }));
    }, [services]);

    // Obsługa zmiany formularza
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData({
                ...formData,
                [name]: checkbox.checked
            });
        } else if (name === 'mileage' || name === 'productionYear') {
            setFormData({
                ...formData,
                [name]: value ? parseInt(value, 10) : 0
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Obsługa zmiany obrazów pojazdu
    const handleImagesChange = (images: any[]) => {
        setFormData({
            ...formData,
            vehicleImages: images
        });
    };

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

    // Add service directly
    const handleAddServiceDirect = (service: { id: string; name: string; price: number }) => {
        const newService = {
            id: service.id,
            name: service.name,
            price: service.price,
            discountType: "PERCENTAGE" as any,
            discountValue: 0,
            finalPrice: service.price,
            approvalStatus: ServiceApprovalStatus.APPROVED,
            addedAt: new Date().toISOString()
        };

        addService(newService);
        setSearchQuery('');
        setSelectedServiceToAdd(null);
        setShowResults(false);
    };

    // Zapisanie formularza
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            // Aktualizacja statusu na IN_PROGRESS
            const updatedProtocol: CarReceptionProtocol = {
                ...formData,
                status: ProtocolStatus.IN_PROGRESS,
                statusUpdatedAt: new Date().toISOString()
            };

            const savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);

            if (!savedProtocol) {
                throw new Error('Nie udało się zaktualizować protokołu');
            }

            onSave(savedProtocol);
        } catch (err) {
            console.error('Błąd podczas rozpoczynania wizyty:', err);
            setError('Wystąpił błąd podczas zapisywania. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <FormHeader
                isEditing={true}
                isFullProtocol={true}
                title="Rozpoczęcie wizyty"
            />

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleSubmit}>
                <VisitTitleSection
                    title={formData.title || ''}
                    selectedColorId={formData.calendarColorId} // Dodane pole calendarColorId
                    onChange={handleChange}
                    error={undefined}
                />

                <VehicleInfoSection
                    formData={formData}
                    errors={{}}
                    onChange={handleChange}
                    isFullProtocol={true}
                    readOnly={true} // Tylko do odczytu, nie można edytować danych pojazdu
                />

                <ClientInfoSection
                    formData={formData}
                    errors={{}}
                    onChange={handleChange}
                    readOnly={true} // Tylko do odczytu, nie można edytować danych klienta
                />

                <ServiceSection
                    searchQuery={searchQuery}
                    showResults={showResults}
                    searchResults={searchResults}
                    selectedServiceToAdd={selectedServiceToAdd}
                    services={services}
                    errors={{}}
                    onSearchChange={handleSearchChange}
                    onSelectService={handleSelectService}
                    onAddService={() => {}}
                    onRemoveService={removeService}
                    onDiscountTypeChange={updateDiscountType}
                    onDiscountValueChange={updateDiscountValue}
                    onBasePriceChange={updateBasePrice}
                    onAddNote={updateServiceNote}
                    calculateTotals={calculateTotals}
                    allowCustomService={true}
                    onAddServiceDirect={handleAddServiceDirect}
                />

                <ImageUploadSection
                    images={formData.vehicleImages || []}
                    onImagesChange={handleImagesChange}
                />

                <NotesSection
                    notes={formData.notes || ''}
                    onChange={handleChange}
                />

                <FormActions>
                    <Button type="button" secondary onClick={onCancel}>
                        Anuluj
                    </Button>
                    <Button type="submit" primary disabled={loading}>
                        {loading ? 'Zapisywanie...' : 'Rozpocznij wizytę'}
                    </Button>
                </FormActions>
            </Form>
        </FormContainer>
    );
};

export default StartVisitForm;