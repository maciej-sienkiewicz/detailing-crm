import React, { useState, useEffect } from 'react';
import {
    CarReceptionProtocol,
    ProtocolStatus,
    DiscountType,
    SelectedService
} from '../../../../types';
import { addCarReceptionProtocol, updateCarReceptionProtocol } from '../../../../api/mocks/carReceptionMocks';

// Import komponentów
import FormHeader from './components/FormHeader';
import VehicleInfoSection from './components/VehicleInfoSection';
import ClientInfoSection from './components/ClientInfoSection';
import NotesSection from './components/NotesSection';
import ServiceSection from './components/ServiceSection';
import FormActions from './components/FormActions';

// Import hooków
import { useFormValidation } from './hooks/useFormValidation';
import { useServiceCalculations } from './hooks/useServiceCalculations';

// Import styli
import { FormContainer, Form, ErrorMessage } from './styles/styles';

interface CarReceptionFormProps {
    protocol: CarReceptionProtocol | null;
    availableServices: Array<{ id: string; name: string; price: number }>;
    initialData?: Partial<CarReceptionProtocol>;
    appointmentId?: string;
    onSave: (protocol: CarReceptionProtocol) => void;
    onCancel: () => void;
}

export const CarReceptionForm: React.FC<CarReceptionFormProps> = ({
                                                                      protocol,
                                                                      availableServices,
                                                                      initialData,
                                                                      appointmentId,
                                                                      onSave,
                                                                      onCancel
                                                                  }) => {
    const today = new Date().toISOString().split('T')[0];

    // Inicjalizacja formularza z danymi protokołu, danymi z wizyty lub pustym obiektem
    const [formData, setFormData] = useState<Partial<CarReceptionProtocol>>(
        protocol || initialData || {
            startDate: today,
            endDate: today,
            licensePlate: '',
            make: '',
            model: '',
            productionYear: new Date().getFullYear(),
            mileage: 0,
            keysProvided: true,
            documentsProvided: true,
            ownerName: '',
            companyName: '',
            taxId: '',
            email: '',
            phone: '',
            notes: '',
            selectedServices: [],
            status: ProtocolStatus.PENDING_APPROVAL // Domyślny status - Do zatwierdzenia
        }
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stan dla wyszukiwania usług
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; price: number }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<{ id: string; name: string; price: number } | null>(null);

    // Użycie custom hooków
    const { errors, validateForm, clearFieldError } = useFormValidation(formData);
    const {
        services,
        setServices,
        calculateTotals,
        addService,
        removeService,
        updateDiscountType,
        updateDiscountValue
    } = useServiceCalculations(formData.selectedServices || []);

    // Wyszukiwanie usług na podstawie zapytania
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = availableServices.filter(service =>
            service.name.toLowerCase().includes(query) &&
            // Wykluczamy usługi, które są już wybrane
            !services.some(selected => selected.id === service.id)
        );

        setSearchResults(results);
    }, [searchQuery, availableServices, services]);

    // Synchronizuj services ze stanem formularza
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            selectedServices: services
        }));
    }, [services]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData({
                ...formData,
                [name]: checkbox.checked
            });
        } else if (name === 'productionYear' || name === 'mileage') {
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

        // Usuwanie błędów przy edycji pola
        clearFieldError(name);
    };

    // Obsługa wyszukiwania usług
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowResults(true);
        setSelectedServiceToAdd(null);
    };

    // Wybór usługi z wyników wyszukiwania
    const handleSelectService = (service: { id: string; name: string; price: number }) => {
        setSelectedServiceToAdd(service);
        setSearchQuery(service.name);
        setShowResults(false);
    };

    // Dodanie wybranej usługi do tabeli
    const handleAddService = () => {
        if (!selectedServiceToAdd) return;

        const newService: Omit<SelectedService, 'finalPrice'> = {
            id: selectedServiceToAdd.id,
            name: selectedServiceToAdd.name,
            price: selectedServiceToAdd.price,
            discountType: DiscountType.PERCENTAGE,
            discountValue: 0
        };

        addService(newService);

        // Resetowanie pola wyszukiwania
        setSearchQuery('');
        setSelectedServiceToAdd(null);
        clearFieldError('selectedServices');
    };

    // Obsługa zmiany statusu
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({
            ...formData,
            status: e.target.value as ProtocolStatus
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let savedProtocol: CarReceptionProtocol;

            if (protocol?.id) {
                // Aktualizacja istniejącego protokołu
                savedProtocol = await updateCarReceptionProtocol({
                    ...(formData as CarReceptionProtocol),
                    id: protocol.id,
                    createdAt: protocol.createdAt,
                    updatedAt: new Date().toISOString(),
                    statusUpdatedAt: formData.status !== protocol.status
                        ? new Date().toISOString()
                        : protocol.statusUpdatedAt || protocol.createdAt,
                    appointmentId: protocol.appointmentId // Zachowujemy powiązanie z wizytą, jeśli istniało
                });
            } else {
                // Dodanie nowego protokołu
                const now = new Date().toISOString();
                savedProtocol = await addCarReceptionProtocol({
                    ...(formData as Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'>),
                    statusUpdatedAt: now,
                    appointmentId: appointmentId // Powiązanie z wizytą, jeśli tworzymy z wizyty
                });
            }

            onSave(savedProtocol);
        } catch (err) {
            setError('Nie udało się zapisać protokołu. Spróbuj ponownie.');
            console.error('Error saving protocol:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <FormHeader
                isEditing={!!protocol}
                appointmentId={appointmentId}
            />

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleSubmit}>
                {/* Sekcja terminów i statusu */}
                <VehicleInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onStatusChange={handleStatusChange}
                />

                {/* Sekcja danych klienta */}
                <ClientInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                />

                {/* Sekcja usług */}
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
                    onRemoveService={removeService}
                    onDiscountTypeChange={updateDiscountType}
                    onDiscountValueChange={updateDiscountValue}
                    calculateTotals={calculateTotals}
                />

                {/* Sekcja uwag */}
                <NotesSection
                    notes={formData.notes || ''}
                    onChange={handleChange}
                />

                {/* Przyciski akcji */}
                <FormActions
                    onCancel={onCancel}
                    isLoading={loading}
                    isEditing={!!protocol}
                />
            </Form>
        </FormContainer>
    );
};