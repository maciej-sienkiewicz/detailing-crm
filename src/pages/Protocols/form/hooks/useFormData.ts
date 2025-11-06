// src/pages/Protocols/form/hooks/useFormData.ts - POPRAWIONA WERSJA
import {useCallback, useEffect, useState} from 'react';
import {CarReceptionProtocol, ClientExpanded, ProtocolStatus, VehicleExpanded, VehicleImage} from '../../../../types';
import {FormErrors, useFormValidation} from './useFormValidation';
import {ReferralSource} from '../components/ReferralSourceSection';
import {clientsApi} from '../../../../api/clientsApi';
import {vehicleApi} from '../../../../api/vehiclesApi';
import {AutocompleteOption} from "../../components/AutocompleteField";

interface UseFormDataWithAutocompleteResult {
    formData: Partial<CarReceptionProtocol>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>;
    errors: FormErrors;
    validateForm: () => boolean;
    clearFieldError: (fieldName: string) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleReferralSourceChange: (source: ReferralSource | null) => void;
    handleOtherSourceDetailsChange: (details: string) => void;
    handleImagesChange: (images: VehicleImage[]) => void;
    isClientFromSearch: boolean;
    setIsClientFromSearch: (value: boolean) => void;
    // Autocomplete specific
    autocompleteOptions: AutocompleteOption[];
    loadingAutocompleteData: boolean;
    handleAutocompleteSelect: (option: AutocompleteOption, fieldType: string) => void;
    showVehicleModal: boolean;
    setShowVehicleModal: (show: boolean) => void;
    vehicleModalOptions: VehicleExpanded[];
    handleVehicleModalSelect: (vehicle: VehicleExpanded) => void;
    // NOWE: Delivery Person
    isDeliveryPersonDifferent: boolean;
    handleDeliveryPersonToggle: (enabled: boolean) => void;
    handleDeliveryPersonNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeliveryPersonPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeliveryPersonAutocompleteSelect: (option: AutocompleteOption, fieldType: string) => void;
}

const initializeDates = () => {
    const today = new Date().toISOString().split('T')[0];
    const startTime = '08:00:00';
    const endTime = '23:59:59';

    return {
        startDate: `${today}T${startTime}`,
        endDate: `${today}T${endTime}`
    };
};

export const useFormDataWithAutocomplete = (
    protocol: CarReceptionProtocol | null,
    initialData?: Partial<CarReceptionProtocol>
): UseFormDataWithAutocompleteResult => {
    const [formData, setFormData] = useState<Partial<CarReceptionProtocol>>(
        protocol || initialData || {
            ...initializeDates(),
            title: '',
            calendarColorId: '',
            licensePlate: '',
            make: '',
            model: '',
            productionYear: null,
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
            status: ProtocolStatus.IN_PROGRESS,
            vehicleImages: [],
            referralSource: undefined,
            otherSourceDetails: '',
            deliveryPerson: null,
            // KLUCZOWE: clientId nie jest inicjalizowany automatycznie
            ownerId: undefined
        }
    );

    const [isClientFromSearch, setIsClientFromSearch] = useState(false);
    const [autocompleteOptions, setAutocompleteOptions] = useState<AutocompleteOption[]>([]);
    const [loadingAutocompleteData, setLoadingAutocompleteData] = useState(false);
    const [allClients, setAllClients] = useState<ClientExpanded[]>([]);
    const [allVehicles, setAllVehicles] = useState<VehicleExpanded[]>([]);

    // Modal state for vehicle selection
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vehicleModalOptions, setVehicleModalOptions] = useState<VehicleExpanded[]>([]);

    // NOWE: Stan dla delivery person
    const [isDeliveryPersonDifferent, setIsDeliveryPersonDifferent] = useState(false);

    const { errors, validateForm, clearFieldError } = useFormValidation(formData);

    // Load all clients and vehicles for autocomplete
    useEffect(() => {
        const loadAutocompleteData = async () => {
            setLoadingAutocompleteData(true);
            try {
                const [clientsResult, vehiclesResult] = await Promise.allSettled([
                    clientsApi.fetchClients(),
                    vehicleApi.fetchVehicles()
                ]);

                let clients: ClientExpanded[] = [];
                let vehicles: VehicleExpanded[] = [];

                if (clientsResult.status === 'fulfilled') {
                    clients = clientsResult.value;
                    setAllClients(clients);
                } else {
                    console.error('Failed to load clients:', clientsResult.reason);
                }

                if (vehiclesResult.status === 'fulfilled') {
                    vehicles = vehiclesResult.value;
                    setAllVehicles(vehicles);
                } else {
                    console.error('Failed to load vehicles:', vehiclesResult.reason);
                }

                // Create autocomplete options
                const options: AutocompleteOption[] = [
                    // Client options
                    ...clients.map(client => ({
                        id: client.id,
                        label: `${client.firstName} ${client.lastName}`.trim(),
                        value: `${client.firstName} ${client.lastName}`.trim(),
                        type: 'client' as const,
                        data: client,
                        description: [client.email, client.phone, client.company].filter(Boolean).join(' • ')
                    })),
                    // Vehicle options
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

    // NOWE: Efekt do ustawiania stanu delivery person na podstawie danych z protokołu
    useEffect(() => {
        if (protocol?.deliveryPerson || formData.deliveryPerson) {
            setIsDeliveryPersonDifferent(true);
        }
    }, [protocol, formData.deliveryPerson]);

    // Handle initial data dates
    useEffect(() => {
        if (initialData?.startDate) {
            let startDateWithTime: string = initialData.startDate;

            if (startDateWithTime.includes('T')) {
                // Data już ma format ISO z czasem
            } else {
                startDateWithTime = `${startDateWithTime}T08:00:00`;
            }

            let endDateWithTime: string;

            if (initialData.endDate) {
                endDateWithTime = initialData.endDate;

                if (!endDateWithTime.includes('T')) {
                    endDateWithTime = `${endDateWithTime}T23:59:59`;
                } else if (!endDateWithTime.endsWith('23:59:59')) {
                    endDateWithTime = `${endDateWithTime.split('T')[0]}T23:59:59`;
                }
            } else {
                endDateWithTime = `${startDateWithTime.split('T')[0]}T23:59:59`;
            }

            setFormData(prev => ({
                ...prev,
                startDate: startDateWithTime,
                endDate: endDateWithTime
            }));
        }
    }, [initialData?.startDate, initialData?.endDate]);

    // POPRAWIONA WERSJA handleChange - usuwa clientId przy manualnym wpisywaniu
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
            setFormData({
                ...formData,
                [name]: value
            });
        } else {
            // KLUCZOWE: Gdy użytkownik wpisuje dane ręcznie, usuwamy clientId
            const updatedData = {
                ...formData,
                [name]: value
            };

            // Jeśli to pole klienta i nie pochodzi z autocomplete, usuń clientId
            if (['ownerName', 'email', 'phone', 'companyName', 'taxId', 'address'].includes(name)) {
                updatedData.ownerId = undefined; // Lub null, w zależności od API
                setIsClientFromSearch(false);
            }

            // Podobnie dla pól pojazdu
            if (['licensePlate', 'make', 'model'].includes(name)) {
                // Jeśli masz vehicleId, też go usuń
                // updatedData.vehicleId = undefined;
            }

            setFormData(updatedData);
        }

        clearFieldError(name);
    };

    const handleReferralSourceChange = (source: ReferralSource | null) => {
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

    const handleImagesChange = (images: VehicleImage[]) => {
        setFormData(prev => ({
            ...prev,
            vehicleImages: images
        }));
    };

    // NOWE: Obsługa delivery person toggle
    const handleDeliveryPersonToggle = useCallback((enabled: boolean) => {
        setIsDeliveryPersonDifferent(enabled);

        if (enabled) {
            // Inicjalizuj delivery person jeśli jest włączony
            setFormData(prev => ({
                ...prev,
                deliveryPerson: prev.deliveryPerson || { id: null, name: '', phone: '' }
            }));
        } else {
            // Wyczyść delivery person jeśli jest wyłączony
            setFormData(prev => ({
                ...prev,
                deliveryPerson: null
            }));
            // Wyczyść błędy walidacji
            clearFieldError('deliveryPersonName');
            clearFieldError('deliveryPersonPhone');
        }
    }, [clearFieldError]);

    // NOWE: Obsługa zmiany imienia delivery person
    const handleDeliveryPersonNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        setFormData(prev => ({
            ...prev,
            deliveryPerson: {
                id: null, // Reset ID gdy użytkownik wpisuje manualnie
                name: value,
                phone: prev.deliveryPerson?.phone || ''
            }
        }));

        clearFieldError('deliveryPersonName');
    }, [clearFieldError]);

    // NOWE: Obsługa zmiany telefonu delivery person
    const handleDeliveryPersonPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        setFormData(prev => ({
            ...prev,
            deliveryPerson: {
                id: prev.deliveryPerson?.id || null,
                name: prev.deliveryPerson?.name || '',
                phone: value
            }
        }));

        clearFieldError('deliveryPersonPhone');
    }, [clearFieldError]);

    // NOWE: Obsługa autocomplete dla delivery person
    const handleDeliveryPersonAutocompleteSelect = useCallback((option: AutocompleteOption, fieldType: string) => {
        if (option.type === 'client') {
            const client = option.data as ClientExpanded;

            if (fieldType === 'deliveryPersonName') {
                setFormData(prev => ({
                    ...prev,
                    deliveryPerson: {
                        id: client.id,
                        name: `${client.firstName} ${client.lastName}`.trim(),
                        phone: client.phone || prev.deliveryPerson?.phone || ''
                    }
                }));
            } else if (fieldType === 'deliveryPersonPhone') {
                setFormData(prev => ({
                    ...prev,
                    deliveryPerson: {
                        id: client.id,
                        name: prev.deliveryPerson?.name || `${client.firstName} ${client.lastName}`.trim(),
                        phone: client.phone || ''
                    }
                }));
            }

            clearFieldError('deliveryPersonName');
            clearFieldError('deliveryPersonPhone');
        }
    }, [clearFieldError]);

    // POPRAWIONA WERSJA: Populate client data - ustawia ownerId tylko przy wyborze z listy
    const populateClientData = useCallback((client: ClientExpanded) => {

        setFormData(prev => ({
            ...prev,
            // KLUCZOWE: ownerId ustawiany TYLKO gdy klient został wybrany z listy
            ownerId: parseInt(client.id), // Konwersja na number jeśli API tego wymaga
            ownerName: `${client.firstName} ${client.lastName}`.trim(),
            email: client.email || '',
            phone: client.phone || '',
            companyName: client.company || '',
            taxId: client.taxId || '',
            address: client.address || '',
            referralSource: 'regular_customer'
        }));

        setIsClientFromSearch(true);
    }, []);

    // Populate form data from vehicle
    const populateVehicleData = useCallback((vehicle: VehicleExpanded) => {

        setFormData(prev => ({
            ...prev,
            licensePlate: vehicle.licensePlate,
            make: vehicle.make,
            model: vehicle.model,
            productionYear: vehicle.year || null,
            vin: vehicle.vin || '',
            color: vehicle.color || ''
            // Jeśli masz vehicleId, ustaw go tutaj:
            // vehicleId: vehicle.id
        }));
    }, []);

    // POPRAWIONA WERSJA: Handle autocomplete selection - ownerId tylko przy kliknięciu
    const handleAutocompleteSelect = useCallback((option: AutocompleteOption, fieldType: string) => {

        // NOWE: Obsługa delivery person fields
        if (fieldType === 'deliveryPersonName' || fieldType === 'deliveryPersonPhone') {
            handleDeliveryPersonAutocompleteSelect(option, fieldType);
            return;
        }

        // Istniejąca logika dla zwykłych pól
        if (option.type === 'client') {
            const client = option.data as ClientExpanded;
            populateClientData(client); // To ustawi ownerId

            // Check if client has vehicles
            const clientVehicles = allVehicles.filter(vehicle =>
                    vehicle.owners && vehicle.owners.some(owner =>
                        owner.id.toString() === client.id ||
                        owner.fullName === `${client.firstName} ${client.lastName}`.trim()
                    )
            );

            if (clientVehicles.length > 1) {
                // Show vehicle selection modal
                setVehicleModalOptions(clientVehicles);
                setShowVehicleModal(true);
            } else if (clientVehicles.length === 1) {
                // Auto-populate vehicle data
                populateVehicleData(clientVehicles[0]);
            }
        } else if (option.type === 'vehicle') {
            const vehicle = option.data as VehicleExpanded;
            populateVehicleData(vehicle);

            // Auto-populate owner data if available
            if (vehicle.owners && vehicle.owners.length > 0) {
                const owner = vehicle.owners[0];

                setFormData(prev => ({
                    ...prev,
                    // KLUCZOWE: ownerId ustawiany gdy wybrano pojazd z właścicielem
                    ownerId: parseInt(owner.id.toString()),
                    ownerName: owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
                    email: owner.email || '',
                    phone: owner.phone || '',
                    referralSource: 'regular_customer'
                }));
                setIsClientFromSearch(true);
            }
        }
    }, [populateClientData, populateVehicleData, allVehicles, handleDeliveryPersonAutocompleteSelect]);

    // Handle vehicle modal selection
    const handleVehicleModalSelect = useCallback((vehicle: VehicleExpanded) => {
        populateVehicleData(vehicle);
        setShowVehicleModal(false);
        setVehicleModalOptions([]);
    }, [populateVehicleData]);

    return {
        formData,
        setFormData,
        errors,
        validateForm,
        clearFieldError,
        handleChange, // POPRAWIONA WERSJA
        handleReferralSourceChange,
        handleOtherSourceDetailsChange,
        handleImagesChange,
        isClientFromSearch,
        setIsClientFromSearch,
        autocompleteOptions,
        loadingAutocompleteData,
        handleAutocompleteSelect, // POPRAWIONA WERSJA
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
    };
};