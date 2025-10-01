// src/pages/Protocols/start-visit/components/StartVisitForm.tsx - POPRAWIONA WERSJA

import React, {useEffect, useState} from 'react';
import {
    CarReceptionProtocol,
    ClientExpanded,
    ProtocolStatus,
    ServiceApprovalStatus,
    VehicleExpanded
} from '../../../../types';
import {protocolsApi} from '../../../../api/protocolsApi';
import {clientsApi} from '../../../../api/clientsApi';
import {vehicleApi} from '../../../../api/vehiclesApi';
import FormHeader from '../../form/components/FormHeader';
import VisitTitleSection from '../../form/components/VisitTitleSection';
import VehicleInfoSection from '../../form/components/VehicleInfoSection';
import ClientInfoSection from '../../form/components/ClientInfoSection';
import ServiceSection from '../../form/components/ServiceSection';
import NotesSection from '../../form/components/NotesSection';
import {DeliveryPersonSection} from '../../form/components/DeliveryPersonSection';
import ScheduleSection from "../../form/components/ScheduleSection";
import {useServiceCalculations} from '../../form/hooks/useServiceCalculations';
import {Button, ErrorMessage, Form, FormActions, FormContainer} from '../../form/styles';
import {AutocompleteOption} from '../../components/AutocompleteField';

interface StartVisitFormProps {
    protocol: CarReceptionProtocol;
    availableServices: Array<{ id: string; name: string; price: number }>;
    onSave: (protocol: CarReceptionProtocol) => void;
    onCancel: () => void;
    isRestoringCancelled?: boolean;
}

// Funkcja do generowania obecnej daty i czasu w formacie ISO
const getCurrentDateTimeISO = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const StartVisitForm: React.FC<StartVisitFormProps> = ({
                                                           protocol,
                                                           availableServices,
                                                           onSave,
                                                           onCancel,
                                                           isRestoringCancelled = false
                                                       }) => {
    // POPRAWKA: Inicjalizacja formData z aktualną datą przyjęcia, ale zachowaniem oryginalnej daty zakończenia
    const [formData, setFormData] = useState<CarReceptionProtocol>(() => {
        const currentDateTime = getCurrentDateTimeISO();

        return {
            ...protocol,
            startDate: currentDateTime, // Ustawiamy na obecny czas
            // endDate pozostaje bez zmian - to planowany termin zakończenia!
            status: ProtocolStatus.IN_PROGRESS // Ustawiamy status na "W realizacji"
        };
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; price: number }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<{ id: string; name: string; price: number } | null>(null);
    const [isDeliveryPersonDifferent, setIsDeliveryPersonDifferent] = useState(false);
    const [autocompleteOptions, setAutocompleteOptions] = useState<AutocompleteOption[]>([]);
    const [loadingAutocompleteData, setLoadingAutocompleteData] = useState(false);

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

    useEffect(() => {
        const loadAutocompleteData = async () => {
            setLoadingAutocompleteData(true);
            try {
                const [clientsResult, vehiclesResult] = await Promise.allSettled([
                    clientsApi.fetchClients(),
                    vehicleApi.fetchVehicles()
                ]);

                let clients: ClientExpanded[] = [];
                if (clientsResult.status === 'fulfilled') clients = clientsResult.value;
                else console.error('Failed to load clients:', clientsResult.reason);

                let vehicles: VehicleExpanded[] = [];
                if (vehiclesResult.status === 'fulfilled') vehicles = vehiclesResult.value;
                else console.error('Failed to load vehicles:', vehiclesResult.reason);

                const options: AutocompleteOption[] = [
                    ...clients.map(client => ({
                        id: client.id,
                        label: `${client.firstName} ${client.lastName}`.trim(),
                        value: `${client.firstName} ${client.lastName}`.trim(),
                        type: 'client' as const,
                        data: client,
                        description: [client.email, client.phone, client.company].filter(Boolean).join(' • ')
                    })),
                    ...vehicles.map(vehicle => ({
                        id: vehicle.id,
                        label: `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}`,
                        value: vehicle.licensePlate,
                        type: 'vehicle' as const,
                        data: vehicle,
                        description: `${vehicle.make} ${vehicle.model} • ${vehicle.year || 'Nieznany rok'}`
                    }))
                ];
                setAutocompleteOptions(options);
            } catch (error) {
                console.error('Error loading autocomplete data:', error);
            } finally {
                setLoadingAutocompleteData(false);
            }
        };
        loadAutocompleteData();
    }, []);

    useEffect(() => {
        if (protocol?.deliveryPerson || formData.deliveryPerson) {
            setIsDeliveryPersonDifferent(true);
        }
    }, [protocol, formData.deliveryPerson]);

    // Uproszczona funkcja formatowania dat
    const formatDateForAPI = (dateString: string): string => {
        if (!dateString) return '';

        try {
            let cleanedDate = dateString.replace('Z', '').split('.')[0];

            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(cleanedDate)) {
                return cleanedDate;
            }

            if (cleanedDate.includes(' ')) {
                cleanedDate = cleanedDate.replace(' ', 'T');
            }

            return cleanedDate;
        } catch (error) {
            console.error('Błąd podczas formatowania daty:', error, dateString);
            return '';
        }
    };

    const prepareDeliveryPersonForApi = (formData: CarReceptionProtocol) => {
        if (!formData.deliveryPerson || !formData.deliveryPerson.name?.trim() || !formData.deliveryPerson.phone?.trim()) {
            return null;
        }
        return {
            id: formData.deliveryPerson.id,
            name: formData.deliveryPerson.name.trim(),
            phone: formData.deliveryPerson.phone.trim()
        };
    };

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            selectedServices: services,
            status: ProtocolStatus.IN_PROGRESS // Upewniamy się że status pozostaje IN_PROGRESS
        }));
    }, [services]);

    const handleServiceCreated = (oldId: string, newService: { id: string; name: string; price: number }) => {
        setServices(prevServices =>
            prevServices.map(service =>
                service.id === oldId
                    ? { ...service, id: newService.id }
                    : service
            )
        );
    };

    const handleDeliveryPersonToggle = (enabled: boolean) => {
        setIsDeliveryPersonDifferent(enabled);
        if (enabled) {
            setFormData(prev => ({ ...prev, deliveryPerson: prev.deliveryPerson || { id: null, name: '', phone: '' } }));
        } else {
            setFormData(prev => ({ ...prev, deliveryPerson: null }));
        }
    };

    const handleDeliveryPersonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, deliveryPerson: { id: null, name: value, phone: prev.deliveryPerson?.phone || '' } }));
    };

    const handleDeliveryPersonPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        setFormData(prev => ({
            ...prev,
            deliveryPerson: {
                id: prev.deliveryPerson?.id || null,
                name: prev.deliveryPerson?.name || '',
                phone: value
            }
        }));
    };

    const handleDeliveryPersonAutocompleteSelect = (option: AutocompleteOption, fieldType: string) => {
        if (option.type === 'client') {
            const client = option.data as ClientExpanded;
            if (fieldType === 'deliveryPersonName') {
                setFormData(prev => ({ ...prev, deliveryPerson: { id: client.id, name: `${client.firstName} ${client.lastName}`.trim(), phone: client.phone || prev.deliveryPerson?.phone || '' } }));
            } else if (fieldType === 'deliveryPersonPhone') {
                setFormData(prev => ({ ...prev, deliveryPerson: { id: client.id, name: prev.deliveryPerson?.name || `${client.firstName} ${client.lastName}`.trim(), phone: client.phone || '' } }));
            }
        }
    };

    // POPRAWKA: Obsługa zmian w formularzu - POZWALAMY NA EDYCJĘ DATY ZAKOŃCZENIA
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
        } else if (name === 'mileage' || name === 'productionYear') {
            setFormData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : 0 }));
        } else if (name === 'startDate') {
            // Dla daty rozpoczęcia, zachowaj format datetime-local
            const formattedDate = formatDateForAPI(value);
            setFormData(prev => ({ ...prev, [name]: formattedDate }));
        } else if (name === 'endDate') {
            // POPRAWKA: POZWALAMY NA EDYCJĘ DATY ZAKOŃCZENIA!
            const formattedDate = formatDateForAPI(value);
            setFormData(prev => ({ ...prev, [name]: formattedDate }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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
            service.name.toLowerCase().includes(query) && !services.some(selected => selected.id === service.id)
        );
        setSearchResults(results);
    };

    const handleSelectService = (service: { id: string; name: string; price: number }) => {
        setSelectedServiceToAdd(service);
        setSearchQuery(service.name);
        setShowResults(false);
    };

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

    // Główna funkcja submit z dokładnym logowaniem
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            // POPRAWKA: Obie daty mogą być modyfikowane i formatowane dla API
            const processedStartDate = formatDateForAPI(formData.startDate || getCurrentDateTimeISO());
            const processedEndDate = formatDateForAPI(formData.endDate || '');

            const updatedProtocol: CarReceptionProtocol = {
                ...formData,
                startDate: processedStartDate,
                endDate: processedEndDate,
                status: ProtocolStatus.IN_PROGRESS,
                statusUpdatedAt: new Date().toISOString(),
                deliveryPerson: prepareDeliveryPersonForApi(formData)
            };

            let savedProtocol;
            if (isRestoringCancelled) {
                savedProtocol = await protocolsApi.restoreProtocol(updatedProtocol.id, {
                    newStatus: ProtocolStatus.IN_PROGRESS,
                    newStartDate: updatedProtocol.startDate,
                    newEndDate: updatedProtocol.endDate
                });
                if (!savedProtocol) {
                    savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);
                }
            } else {
                savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);
            }

            if (!savedProtocol) {
                throw new Error('Nie udało się zaktualizować protokołu');
            }
            onSave(savedProtocol);
        } catch (err) {
            console.error('❌ Błąd podczas rozpoczynania wizyty:', err);
            setError('Wystąpił błąd podczas zapisywania. Spróbuj ponownie.');
        } finally {
            setLoading(false);
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
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Form onSubmit={handleSubmit}>
                <VisitTitleSection
                    title={formData.title || ''}
                    selectedColorId={formData.calendarColorId}
                    onChange={handleChange}
                    error={undefined}
                />

                <ScheduleSection
                    formData={formData}
                    errors={{}}
                    onChange={handleChange}
                    isFullProtocol={true}
                />

                <ClientInfoSection
                    formData={formData}
                    errors={{}}
                    onChange={handleChange}
                    readOnly={true}
                    autocompleteOptions={[]}
                    onAutocompleteSelect={() => {}}
                />

                <VehicleInfoSection
                    formData={formData}
                    errors={{}}
                    onChange={handleChange}
                    isFullProtocol={true}
                    readOnly={true}
                    autocompleteOptions={[]}
                    onAutocompleteSelect={() => {}}
                />

                <DeliveryPersonSection
                    isDeliveryPersonDifferent={isDeliveryPersonDifferent}
                    deliveryPerson={formData.deliveryPerson || null}
                    errors={{}}
                    onDeliveryPersonToggle={handleDeliveryPersonToggle}
                    onDeliveryPersonNameChange={handleDeliveryPersonNameChange}
                    onDeliveryPersonPhoneChange={handleDeliveryPersonPhoneChange}
                    autocompleteOptions={autocompleteOptions}
                    onAutocompleteSelect={handleDeliveryPersonAutocompleteSelect}
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
                    onServiceCreated={handleServiceCreated}
                />

                <NotesSection notes={formData.notes || ''} onChange={handleChange} />

                <FormActions>
                    <Button type="button" secondary onClick={onCancel}>
                        Anuluj
                    </Button>
                    <Button type="submit" primary disabled={loading}>
                        {loading ? 'Zapisywanie...' :
                            isRestoringCancelled ? 'Przywróć wizytę' : 'Rozpocznij wizytę'}
                    </Button>
                </FormActions>
            </Form>
        </FormContainer>
    );
};

export default StartVisitForm;