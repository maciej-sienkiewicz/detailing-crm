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
    isRestoringCancelled?: boolean; // Nowa właściwość wskazująca, czy przywracamy anulowaną wizytę
}

const StartVisitForm: React.FC<StartVisitFormProps> = ({
                                                           protocol,
                                                           availableServices,
                                                           onSave,
                                                           onCancel,
                                                           isRestoringCancelled = false
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

    // NAPRAWKA: Funkcja do formatowania dat - kopiowana z useFormSubmit
    const formatDateForAPI = (dateString: string): string => {
        if (!dateString) return '';

        try {
            // Usuń 'Z' i milisekundy jeśli są
            let cleanedDate = dateString.replace('Z', '').split('.')[0];

            console.log('formatDateForAPI input:', dateString);
            console.log('formatDateForAPI after initial clean:', cleanedDate);

            // Przypadek 1: Format z błędną mieszanką - "2025-08-19 21:57:00T23:59:59"
            if (cleanedDate.includes(' ') && cleanedDate.includes('T')) {
                // Wyciągnij tylko część daty
                const datePart = cleanedDate.split(' ')[0]; // "2025-08-19"
                console.log('formatDateForAPI - mixed format, extracted date:', datePart);
                return datePart;
            }

            // Przypadek 2: Format ze spacją - "2025-08-19 21:57:00"
            if (cleanedDate.includes(' ') && !cleanedDate.includes('T')) {
                // Zamień spację na T
                cleanedDate = cleanedDate.replace(' ', 'T');
                console.log('formatDateForAPI - space format, converted to T:', cleanedDate);
                return cleanedDate;
            }

            // Przypadek 3: Format z T - "2025-08-19T21:57:00"
            if (cleanedDate.includes('T')) {
                console.log('formatDateForAPI - T format, returning as is:', cleanedDate);
                return cleanedDate;
            }

            // Przypadek 4: Tylko data - "2025-08-19"
            if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
                console.log('formatDateForAPI - date only format:', cleanedDate);
                return cleanedDate;
            }

            console.log('formatDateForAPI - fallback, returning as is:', cleanedDate);
            return cleanedDate;

        } catch (error) {
            console.error('Błąd podczas formatowania daty:', error, dateString);
            return '';
        }
    };

    // Ustawienie początkowego statusu w zależności od kontekstu
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            status: ProtocolStatus.IN_PROGRESS
        }));
    }, []);

    // Synchronizacja usług z formularzem
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            selectedServices: services,
            status: ProtocolStatus.IN_PROGRESS // Zawsze ustawiamy status na IN_PROGRESS przy rozpoczynaniu wizyty
        }));
    }, [services]);

    // NAPRAWKA: Obsługa zmiany formularza z prawidłowym formatowaniem dat
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        console.log('handleChange called:', { name, value, type });

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
        } else if (name === 'startDate' || name === 'endDate') {
            // NAPRAWKA: Specjalna obsługa dla dat
            console.log(`Processing ${name} with value:`, value);

            // Dla endDate zawsze ustawiamy 23:59:59
            if (name === 'endDate') {
                const cleanedDate = formatDateForAPI(value);
                let finalDate;

                if (cleanedDate.includes('T')) {
                    const datePart = cleanedDate.split('T')[0];
                    finalDate = `${datePart}T23:59:59`;
                } else {
                    finalDate = `${cleanedDate}T23:59:59`;
                }

                console.log(`Final ${name}:`, finalDate);
                setFormData({
                    ...formData,
                    [name]: finalDate
                });
            } else {
                // Dla startDate formatuj do T jeśli potrzeba
                const cleanedDate = formatDateForAPI(value);
                let finalDate;

                if (cleanedDate.includes('T')) {
                    finalDate = cleanedDate;
                } else {
                    finalDate = `${cleanedDate}T08:00:00`;
                }

                console.log(`Final ${name}:`, finalDate);
                setFormData({
                    ...formData,
                    [name]: finalDate
                });
            }
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

    // NAPRAWKA: Zapisanie formularza z dodatkowym formatowaniem dat
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('=== START VISIT FORM DATA ===');
        console.log('formData.startDate:', formData.startDate);
        console.log('formData.endDate:', formData.endDate);
        console.log('============================');

        try {
            setLoading(true);
            setError(null);

            // NAPRAWKA: Upewnij się że daty są w poprawnym formacie przed wysłaniem
            let processedStartDate = formData.startDate;
            let processedEndDate = formData.endDate;

            // Formatuj startDate
            if (processedStartDate) {
                const cleanedStartDate = formatDateForAPI(processedStartDate);
                if (cleanedStartDate.includes('T')) {
                    processedStartDate = cleanedStartDate;
                } else {
                    processedStartDate = `${cleanedStartDate}T08:00:00`;
                }
            }

            // Formatuj endDate - zawsze 23:59:59
            if (processedEndDate) {
                const cleanedEndDate = formatDateForAPI(processedEndDate);
                const datePart = cleanedEndDate.includes('T')
                    ? cleanedEndDate.split('T')[0]
                    : cleanedEndDate;
                processedEndDate = `${datePart}T23:59:59`;
            }

            // Aktualizacja statusu na IN_PROGRESS
            const updatedProtocol: CarReceptionProtocol = {
                ...formData,
                startDate: processedStartDate,
                endDate: processedEndDate,
                status: ProtocolStatus.IN_PROGRESS,
                statusUpdatedAt: new Date().toISOString()
            };

            console.log('=== UPDATED PROTOCOL DATA ===');
            console.log('updatedProtocol.startDate:', updatedProtocol.startDate);
            console.log('updatedProtocol.endDate:', updatedProtocol.endDate);
            console.log('=============================');

            let savedProtocol;

            if (isRestoringCancelled) {
                // Jeśli przywracamy anulowany protokół, użyjmy dedykowanej metody restore
                savedProtocol = await protocolsApi.restoreProtocol(updatedProtocol.id, {
                    newStatus: ProtocolStatus.IN_PROGRESS,
                    newStartDate: updatedProtocol.startDate,
                    newEndDate: updatedProtocol.endDate
                });

                // Jeśli restore API nie zwróciło protokołu, użyjmy standardowej aktualizacji
                if (!savedProtocol) {
                    savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);
                }
            } else {
                // Standardowa aktualizacja
                savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);
            }

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
                title={isRestoringCancelled ? "Przywracanie anulowanej wizyty" : "Rozpoczęcie wizyty"}
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

                <NotesSection
                    notes={formData.notes || ''}
                    onChange={handleChange}
                />

                <FormActions>
                    <Button type="button" secondary onClick={onCancel}>
                        Anuluj
                    </Button>
                    <Button type="submit" primary disabled={loading}>
                        {loading ? 'Zapisywanie...' : isRestoringCancelled ? 'Przywróć wizytę' : 'Rozpocznij wizytę'}
                    </Button>
                </FormActions>
            </Form>
        </FormContainer>
    );
};

export default StartVisitForm;