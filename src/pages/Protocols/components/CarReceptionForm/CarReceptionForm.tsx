import React, { useState, useEffect } from 'react';
import {
    CarReceptionProtocol,
    ClientExpanded,
    DiscountType,
    ProtocolStatus,
    SelectedService, ServiceApprovalStatus,
    VehicleExpanded,
    VehicleImage
} from '../../../../types';
import { addCarReceptionProtocol, updateCarReceptionProtocol } from '../../../../api/mocks/carReceptionMocks';
import ReferralSourceSection, { ReferralSource } from './components/ReferralSourceSection';
import { carReceptionApi } from '../../../../api/carReceptionApi';

// Import komponentów
import FormHeader from './components/FormHeader';
import VehicleInfoSection from './components/VehicleInfoSection';
import ClientInfoSection from './components/ClientInfoSection';
import NotesSection from './components/NotesSection';
import ServiceSection from './components/ServiceSection';
import FormActions from './components/FormActions';
import ClientSelectionModal from '../../../Protocols/components/ClientSelectionModal';
import VehicleSelectionModal from '../../../Protocols/components/VehicleSelectionModal';
import ImageUploadSection from './components/ImageUploadSection';

// Import hooków
import { useFormValidation } from './hooks/useFormValidation';
import { useServiceCalculations } from './hooks/useServiceCalculations';

// Import serwisów
import { FormSearchService, SearchCriteria } from '../services/FormSearchService';

// Import styli
import {
    Button,
    ConfirmationDialog, DialogActions,
    DialogContent,
    DialogText,
    DialogTitle,
    ErrorMessage,
    Form,
    FormContainer
} from './styles/styles';
import VisitTitleSection from "./components/VisitTitleSection";

interface CarReceptionFormProps {
    protocol: CarReceptionProtocol | null;
    availableServices: Array<{ id: string; name: string; price: number }>;
    initialData?: Partial<CarReceptionProtocol>;
    appointmentId?: string;
    isFullProtocol?: boolean; // Nowa flaga
    onSave: (protocol: CarReceptionProtocol) => void;
    onCancel: () => void;
}

// Funkcja pomocnicza do inicjalizacji dat z odpowiednim formatem
const initializeDates = () => {
    const today = new Date().toISOString().split('T')[0];
    const startTime = '08:00:00'; // Domyślna godzina rozpoczęcia - 8:00 rano
    const endTime = '23:59:59';   // Koniec dnia dla daty zakończenia

    return {
        startDate: `${today}T${startTime}`,
        endDate: `${today}T${endTime}`
    };
};

export const CarReceptionForm: React.FC<CarReceptionFormProps> = ({
                                                                      protocol,
                                                                      availableServices,
                                                                      initialData,
                                                                      appointmentId,
                                                                      isFullProtocol,
                                                                      onSave,
                                                                      onCancel
                                                                  }) => {
    // Inicjalizacja formularza z danymi protokołu, danymi z wizyty lub pustym obiektem
    const [formData, setFormData] = useState<Partial<CarReceptionProtocol>>(
        protocol || initialData || {
            ...initializeDates(),
            title: '',              // Dodajemy inicjalizację pola title
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
            status: ProtocolStatus.SCHEDULED,
            vehicleImages: [],
            referralSource: undefined,
            otherSourceDetails: ''
        }
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Stan dla wyszukiwania usług
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; price: number }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<{ id: string; name: string; price: number } | null>(null);

    // Stan dla modali wyszukiwania
    const [showClientModal, setShowClientModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [foundClients, setFoundClients] = useState<ClientExpanded[]>([]);
    const [foundVehicles, setFoundVehicles] = useState<VehicleExpanded[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [pendingSubmit, setPendingSubmit] = useState(false);

    // Użycie custom hooków
    const { errors, validateForm, clearFieldError } = useFormValidation(formData);
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

    // Obsługuje zmianę danych formularza
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
        } else if (name === 'startDate' || name === 'endDate') {
            // Specjalna obsługa dla pól daty, które teraz zawierają również czas
            setFormData({
                ...formData,
                [name]: value // Wartość już powinna być w formacie ISO
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

    // Efekt do obsługi startDate z kalendarza
    useEffect(() => {
        if (initialData?.startDate) {
            // Jeśli mamy datę z kalendarzaza to musimy dodać do niej czas (8:00 rano)
            let startDateWithTime = initialData.startDate;
            if (!startDateWithTime.includes('T')) {
                startDateWithTime = `${startDateWithTime}T08:00:00`;
            }

            // Dla endDate zawsze ustawiamy koniec dnia
            let endDateWithTime = initialData.endDate || initialData.startDate;
            if (!endDateWithTime.includes('T')) {
                endDateWithTime = `${endDateWithTime}T23:59:59`;
            } else if (!endDateWithTime.endsWith('23:59:59')) {
                // Jeśli już ma czas, ale nie jest to koniec dnia, zmieniamy na koniec dnia
                endDateWithTime = `${endDateWithTime.split('T')[0]}T23:59:59`;
            }

            setFormData(prev => ({
                ...prev,
                startDate: startDateWithTime,
                endDate: endDateWithTime
            }));
        }
    }, [initialData?.startDate, initialData?.endDate]);

    // Obsługa aktualizacji zdjęć
    const handleImagesChange = (images: VehicleImage[]) => {
        setFormData(prev => ({
            ...prev,
            vehicleImages: images
        }));
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
        if (selectedServiceToAdd) {
            // Dodaj wybraną istniejącą usługę
            const newService: Omit<SelectedService, 'finalPrice'> = {
                id: selectedServiceToAdd.id,
                name: selectedServiceToAdd.name,
                price: selectedServiceToAdd.price,
                discountType: DiscountType.PERCENTAGE,
                discountValue: 0,
                approvalStatus: ServiceApprovalStatus.APPROVED
            };

            addService(newService);
        } else if (searchQuery.trim() !== '') {
            // Dodaj niestandardową usługę
            const customId = `custom-${Date.now()}`; // Generowanie unikalnego ID
            const newService: Omit<SelectedService, 'finalPrice'> = {
                id: customId,
                name: searchQuery.trim(),
                price: 0, // Domyślna cena zero, którą użytkownik będzie musiał zaktualizować
                discountType: DiscountType.PERCENTAGE,
                discountValue: 0,
                approvalStatus: ServiceApprovalStatus.APPROVED
            };

            addService(newService);
        }

        // Resetowanie pola wyszukiwania
        setSearchQuery('');
        setSelectedServiceToAdd(null);
        clearFieldError('selectedServices');
    };

    const handleReferralSourceChange = (source: ReferralSource | null) => {
        // Use type assertion to tell TypeScript this is a valid value
        const referralValue = source as CarReceptionProtocol['referralSource'];

        setFormData({
            ...formData,
            referralSource: referralValue
        });
    };

    const handleOtherSourceDetailsChange = (details: string) => {
        setFormData({
            ...formData,
            otherSourceDetails: details
        });
    };

    // Obsługa wyszukiwania po polach formularza
    const handleSearchByField = async (field: 'licensePlate' | 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone') => {
        const fieldValue = formData[field] as string;

        if (!fieldValue || fieldValue.trim() === '') {
            setSearchError('Pole wyszukiwania jest puste');
            return;
        }

        setSearchLoading(true);
        setSearchError(null);

        try {
            const criteria: SearchCriteria = { field, value: fieldValue };
            const results = await FormSearchService.searchByField(criteria);

            setFoundClients(results.clients);
            setFoundVehicles(results.vehicles);

            // Decyzja o pokazaniu odpowiedniego modala
            if (field === 'licensePlate') {
                if (results.vehicles.length === 0) {
                    setSearchError('Nie znaleziono pojazdów o podanym numerze rejestracyjnym');
                } else if (results.vehicles.length === 1) {
                    // Jeśli znaleziono dokładnie jeden pojazd, wypełnij dane
                    fillVehicleData(results.vehicles[0]);

                    // Jeśli pojazd ma więcej niż jednego właściciela, pokaż modal wyboru klienta
                    if (results.clients.length > 1) {
                        setShowClientModal(true);
                    } else if (results.clients.length === 1) {
                        // Jeśli jest tylko jeden właściciel, wypełnij jego dane
                        fillClientData(results.clients[0]);
                    }
                } else {
                    // Jeśli znaleziono więcej pojazdów, pokaż modal wyboru pojazdu
                    setShowVehicleModal(true);
                }
            } else {
                // Dla innych pól (związanych z klientem)
                if (results.clients.length === 0) {
                    setSearchError('Nie znaleziono klientów o podanych danych');
                } else if (results.clients.length === 1) {
                    // Jeśli znaleziono dokładnie jednego klienta, wypełnij dane
                    fillClientData(results.clients[0]);

                    // Jeśli klient ma więcej niż jeden pojazd, pokaż modal wyboru pojazdu
                    if (results.vehicles.length > 1) {
                        setShowVehicleModal(true);
                    } else if (results.vehicles.length === 1) {
                        // Jeśli jest tylko jeden pojazd, wypełnij jego dane
                        fillVehicleData(results.vehicles[0]);
                    }
                } else {
                    // Jeśli znaleziono więcej klientów, pokaż modal wyboru klienta
                    setShowClientModal(true);
                }
            }
        } catch (err) {
            console.error('Error searching:', err);
            setSearchError('Wystąpił błąd podczas wyszukiwania');
        } finally {
            setSearchLoading(false);
        }
    };

    // Wypełnienie danych pojazdu w formularzu
    const fillVehicleData = (vehicle: VehicleExpanded) => {
        const vehicleData = FormSearchService.mapVehicleToFormData(vehicle);
        setFormData(prev => ({
            ...prev,
            ...vehicleData
        }));
    };

    // Wypełnienie danych klienta w formularzu
    const fillClientData = (client: ClientExpanded) => {
        const clientData = FormSearchService.mapClientToFormData(client);
        setFormData(prev => ({
            ...prev,
            ...clientData
        }));
    };

    // Obsługa wyboru klienta z modalu
    const handleClientSelect = (client: ClientExpanded) => {
        fillClientData(client);
        setShowClientModal(false);

        // Sprawdź czy klient ma pojazdy i czy już wcześniej nie wypełniliśmy danych pojazdu
        if (foundVehicles.length > 0 && !formData.licensePlate) {
            // Pobierz pojazdy dla wybranego klienta
            const clientVehicles = foundVehicles.filter(vehicle =>
                vehicle.ownerIds.includes(client.id)
            );

            if (clientVehicles.length === 1) {
                fillVehicleData(clientVehicles[0]);
            } else if (clientVehicles.length > 1) {
                setFoundVehicles(clientVehicles);
                setShowVehicleModal(true);
            }
        }
    };

    // Obsługa wyboru pojazdu z modalu
    const handleVehicleSelect = (vehicle: VehicleExpanded) => {
        fillVehicleData(vehicle);
        setShowVehicleModal(false);

        // Jeśli nie mamy jeszcze danych klienta, a pojazd ma jednego właściciela
        if (!formData.ownerName && vehicle.ownerIds.length === 1) {
            const owner = foundClients.find(client => client.id === vehicle.ownerIds[0]);
            if (owner) {
                fillClientData(owner);
            }
        }
    };

    // Obsługa zapisania formularza
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Upewniamy się, że daty mają odpowiedni format
        const updatedFormData = {
            ...formData
        };

        // Sprawdźmy format startDate - dodajemy domyślny czas, jeśli go nie ma
        if (updatedFormData.startDate && !updatedFormData.startDate.includes('T')) {
            updatedFormData.startDate = `${updatedFormData.startDate}T08:00:00`;
        }

        // Dla endDate zawsze ustawiamy koniec dnia
        if (updatedFormData.endDate && !updatedFormData.endDate.includes('T')) {
            updatedFormData.endDate = `${updatedFormData.endDate}T23:59:59`;
        } else if (updatedFormData.endDate && !updatedFormData.endDate.endsWith('23:59:59')) {
            // Jeśli już ma czas, ale nie jest to koniec dnia, zmieniamy na koniec dnia
            updatedFormData.endDate = `${updatedFormData.endDate.split('T')[0]}T23:59:59`;
        }

        // Automatycznie ustaw tytuł, jeśli pole jest puste
        if (!updatedFormData.title || updatedFormData.title.trim() === '') {
            // Generujemy tytuł na podstawie marki, modelu i imienia właściciela
            if (updatedFormData.make && updatedFormData.model && updatedFormData.ownerName) {
                updatedFormData.title = `${updatedFormData.make} ${updatedFormData.model} - ${updatedFormData.ownerName}`;
            }
        }

        // Aktualizacja formData
        setFormData(updatedFormData);

        if (!validateForm()) {
            return;
        }

        // Sprawdzamy czy istnieją usługi z ceną 0
        const hasZeroPriceServices = services.some(service => service.finalPrice === 0);

        if (hasZeroPriceServices && !pendingSubmit) {
            setPendingSubmit(true);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let savedProtocol: CarReceptionProtocol;

            if (protocol?.id) {
                // Aktualizacja istniejącego protokołu
                const protocolToUpdate: CarReceptionProtocol = {
                    ...(updatedFormData as CarReceptionProtocol),
                    id: protocol.id,
                    createdAt: protocol.createdAt,
                    updatedAt: new Date().toISOString(),
                    statusUpdatedAt: updatedFormData.status !== protocol.status
                        ? new Date().toISOString()
                        : protocol.statusUpdatedAt || protocol.createdAt,
                    appointmentId: protocol.appointmentId // Zachowujemy powiązanie z wizytą, jeśli istniało
                };

                // Używamy nowego API zamiast mockowanych danych
                savedProtocol = await carReceptionApi.updateCarReceptionProtocol(protocolToUpdate);

                console.log('Protocol updated successfully:', savedProtocol);
            } else {
                // Przygotowanie danych do utworzenia nowego protokołu
                const now = new Date().toISOString();
                const newProtocolData: Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'> = {
                    ...(updatedFormData as Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'>),
                    statusUpdatedAt: now,
                    appointmentId: appointmentId // Powiązanie z wizytą, jeśli tworzymy z wizyty
                };


                // Używamy nowego API zamiast mockowanych danych
                savedProtocol = await carReceptionApi.createCarReceptionProtocol(newProtocolData);

                console.log('Protocol created successfully:', savedProtocol);
            }

            onSave(savedProtocol);
        } catch (err) {
            console.error('Error saving protocol:', err);
            setError('Nie udało się zapisać protokołu. Spróbuj ponownie.');
        } finally {
            setLoading(false);
            setPendingSubmit(false);
        }
    };

    const handleAddServiceNote = (serviceId: string, note: string) => {
        setServices(prevServices =>
            prevServices.map(service =>
                service.id === serviceId
                    ? { ...service, note }
                    : service
            )
        );
    };

    const handleAddServiceDirect = (service: { id: string; name: string; price: number }) => {
        const newService: Omit<SelectedService, 'finalPrice'> = {
            id: service.id,
            name: service.name,
            price: service.price,
            discountType: DiscountType.PERCENTAGE,
            discountValue: 0,
            approvalStatus: ServiceApprovalStatus.APPROVED
        };

        addService(newService);

        // Resetowanie pola wyszukiwania
        setSearchQuery('');
        setSelectedServiceToAdd(null);
        clearFieldError('selectedServices');
        setShowResults(false);
    };

    return (
        <FormContainer>
            <FormHeader
                isEditing={!!protocol}
                appointmentId={appointmentId}
                isFullProtocol={isFullProtocol}
            />

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {searchError && <ErrorMessage>{searchError}</ErrorMessage>}

            <Form onSubmit={handleSubmit}>
                <VisitTitleSection
                    title={formData.title || ''}
                    onChange={handleChange}
                    error={errors.title}
                />
                {/* Sekcja terminów i statusu */}
                <VehicleInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onSearchByField={handleSearchByField}
                    isFullProtocol={isFullProtocol}
                />

                {/* Sekcja danych klienta */}
                <ClientInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onSearchByField={handleSearchByField}
                />

                <ReferralSourceSection
                    referralSource={formData.referralSource || null}
                    otherSourceDetails={formData.otherSourceDetails || ''}
                    onSourceChange={handleReferralSourceChange}
                    onOtherDetailsChange={handleOtherSourceDetailsChange}
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
                    onAddServiceDirect={handleAddServiceDirect}
                    onRemoveService={removeService}
                    onDiscountTypeChange={updateDiscountType}
                    onDiscountValueChange={updateDiscountValue}
                    onBasePriceChange={updateBasePrice}
                    onAddNote={updateServiceNote}  // Dodajemy tę linię
                    calculateTotals={calculateTotals}
                    allowCustomService={true}
                />

                {/* Nowa sekcja zdjęć */}
                <ImageUploadSection
                    images={formData.vehicleImages || []}
                    onImagesChange={handleImagesChange}
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
                    isFullProtocol={isFullProtocol}
                />
            </Form>

            {/* Modalne okno wyboru klienta */}
            {showClientModal && (
                <ClientSelectionModal
                    clients={foundClients}
                    onSelect={handleClientSelect}
                    onCancel={() => setShowClientModal(false)}
                />
            )}

            {/* Modalne okno wyboru pojazdu */}
            {showVehicleModal && (
                <VehicleSelectionModal
                    vehicles={foundVehicles}
                    onSelect={handleVehicleSelect}
                    onCancel={() => setShowVehicleModal(false)}
                />
            )}
        </FormContainer>
    );
};