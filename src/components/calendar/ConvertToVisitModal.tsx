// src/components/calendar/ConvertToVisitModal.tsx - NAPRAWIONA WERSJA
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaUser, FaCar, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import Modal from '../common/Modal';
import { theme } from '../../styles/theme';
import { useToast } from '../common/Toast/Toast';
import { clientsApi } from '../../api/clientsApi';
import { vehicleApi } from '../../api/vehiclesApi';
import { recurringEventsApi } from '../../api/recurringEventsApi';
import { EventOccurrenceResponse, ConvertToVisitRequest, ConvertToVisitResponse } from '../../types/recurringEvents';
import { ClientExpanded, VehicleExpanded } from '../../types';

// SIMPLIFIED AutocompleteOption - usuwamy fieldType conflicts
interface SimpleAutocompleteOption {
    id: string;
    label: string;
    value: string;
    type: 'client' | 'vehicle';
    data: ClientExpanded | VehicleExpanded;
    description?: string;
}

interface ConvertToVisitModalProps {
    isOpen: boolean;
    occurrence: EventOccurrenceResponse;
    recurringEventDetails?: any;
    onClose: () => void;
    onSuccess: (visitResponse: ConvertToVisitResponse) => void;
}

interface FormData {
    selectedClient: ClientExpanded | null;
    selectedVehicle: VehicleExpanded | null;
    title: string;
    notes: string;
}

const ConvertToVisitModal: React.FC<ConvertToVisitModalProps> = ({
                                                                     isOpen,
                                                                     occurrence,
                                                                     recurringEventDetails,
                                                                     onClose,
                                                                     onSuccess
                                                                 }) => {
    const { showToast } = useToast();

    // Form state
    const [formData, setFormData] = useState<FormData>({
        selectedClient: null,
        selectedVehicle: null,
        title: 'Cykliczna wizyta',
        notes: ''
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [clientOptions, setClientOptions] = useState<SimpleAutocompleteOption[]>([]);
    const [vehicleOptions, setVehicleOptions] = useState<SimpleAutocompleteOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Client search states
    const [clientSearch, setClientSearch] = useState('');
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

    // Load autocomplete data
    useEffect(() => {
        const loadData = async () => {
            setLoadingOptions(true);
            try {
                const [clientsResult, vehiclesResult] = await Promise.allSettled([
                    clientsApi.fetchClients(),
                    vehicleApi.fetchVehicles()
                ]);

                let clients: ClientExpanded[] = [];
                let vehicles: VehicleExpanded[] = [];

                if (clientsResult.status === 'fulfilled') {
                    clients = clientsResult.value;
                }
                if (vehiclesResult.status === 'fulfilled') {
                    vehicles = vehiclesResult.value;
                }

                const clientOpts: SimpleAutocompleteOption[] = clients.map(client => ({
                    id: client.id,
                    label: `${client.firstName} ${client.lastName}`.trim(),
                    value: `${client.firstName} ${client.lastName}`.trim(),
                    type: 'client' as const,
                    data: client,
                    description: [client.email, client.phone, client.company].filter(Boolean).join(' • ')
                }));

                const vehicleOpts: SimpleAutocompleteOption[] = vehicles.map(vehicle => ({
                    id: vehicle.id,
                    label: `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}`,
                    value: vehicle.licensePlate,
                    type: 'vehicle' as const,
                    data: vehicle,
                    description: `${vehicle.make} ${vehicle.model} • ${vehicle.year || 'Nieznany rok'}`
                }));

                setClientOptions(clientOpts);
                setVehicleOptions(vehicleOpts);

                // Pre-fill from visit template if available
                if (recurringEventDetails?.visitTemplate) {
                    const template = recurringEventDetails.visitTemplate;

                    if (template.clientId) {
                        const client = clients.find(c => c.id === template.clientId.toString());
                        if (client) {
                            setFormData(prev => ({ ...prev, selectedClient: client }));
                            setClientSearch(`${client.firstName} ${client.lastName}`.trim());
                        }
                    }

                    if (template.vehicleId) {
                        const vehicle = vehicles.find(v => v.id === template.vehicleId.toString());
                        if (vehicle) {
                            setFormData(prev => ({ ...prev, selectedVehicle: vehicle }));
                            setVehicleSearch(vehicle.licensePlate);
                        }
                    }

                    if (template.notes) {
                        setFormData(prev => ({ ...prev, notes: template.notes }));
                    }
                }

            } catch (error) {
                console.error('Error loading autocomplete data:', error);
                showToast('error', 'Nie udało się załadować danych klientów i pojazdów', 5000);
            } finally {
                setLoadingOptions(false);
            }
        };

        if (isOpen) {
            loadData();
        }
    }, [isOpen, recurringEventDetails, showToast]);

    // Filter clients based on search
    const filteredClients = clientOptions.filter(client =>
        client.label.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.description?.toLowerCase().includes(clientSearch.toLowerCase())
    ).slice(0, 8);

    // Filter vehicles based on search
    const filteredVehicles = vehicleOptions.filter(vehicle =>
        vehicle.label.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        vehicle.value.toLowerCase().includes(vehicleSearch.toLowerCase())
    ).slice(0, 8);

    // Handle client selection
    const handleClientSelect = useCallback((option: SimpleAutocompleteOption) => {
        const client = option.data as ClientExpanded;
        setFormData(prev => ({ ...prev, selectedClient: client }));
        setClientSearch(option.label);
        setShowClientDropdown(false);
        setErrors(prev => ({ ...prev, client: '' }));

        // Auto-select vehicle if client has only one vehicle
        const clientVehicles = vehicleOptions.filter(vOpt => {
            const vehicle = vOpt.data as VehicleExpanded;
            return vehicle.owners?.some(owner => owner.id.toString() === client.id);
        });

        if (clientVehicles.length === 1) {
            const vehicle = clientVehicles[0].data as VehicleExpanded;
            setFormData(prev => ({ ...prev, selectedVehicle: vehicle }));
            setVehicleSearch(clientVehicles[0].value);
            setErrors(prev => ({ ...prev, vehicle: '' }));
        }
    }, [vehicleOptions]);

    // Handle vehicle selection
    const handleVehicleSelect = useCallback((option: SimpleAutocompleteOption) => {
        const vehicle = option.data as VehicleExpanded;
        setFormData(prev => ({ ...prev, selectedVehicle: vehicle }));
        setVehicleSearch(option.value);
        setShowVehicleDropdown(false);
        setErrors(prev => ({ ...prev, vehicle: '' }));

        // Auto-select client if vehicle has only one owner
        if (vehicle.owners && vehicle.owners.length === 1) {
            const owner = vehicle.owners[0];
            const client = clientOptions.find(cOpt => cOpt.id === owner.id.toString())?.data as ClientExpanded;

            if (client) {
                setFormData(prev => ({ ...prev, selectedClient: client }));
                setClientSearch(`${client.firstName} ${client.lastName}`.trim());
                setErrors(prev => ({ ...prev, client: '' }));
            }
        }
    }, [clientOptions]);

    // Validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.selectedClient) {
            newErrors.client = 'Wybór klienta jest wymagany';
        }

        if (!formData.selectedVehicle) {
            newErrors.vehicle = 'Wybór pojazdu jest wymagany';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Tytuł jest wymagany';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const convertRequest: ConvertToVisitRequest = {
                clientId: parseInt(formData.selectedClient!.id),
                vehicleId: parseInt(formData.selectedVehicle!.id),
                additionalServices: [], // Empty for now as per requirements
                notes: formData.notes.trim() || undefined
            };

            const visitResponse = await recurringEventsApi.convertOccurrenceToVisit(
                occurrence.recurringEventId,
                occurrence.id,
                convertRequest
            );

            showToast('success', 'Cykliczna wizyta została przekształcona w wizytę', 4000);
            onSuccess(visitResponse);
            onClose();

        } catch (error) {
            console.error('Error converting to visit:', error);

            if (error instanceof Error) {
                if (error.message.includes('already converted') || error.message.includes('actualVisitId')) {
                    showToast('error', 'Ta cykliczna wizyta została już przekształcona', 5000);
                    onClose(); // Close modal as there's nothing to do
                } else {
                    showToast('error', error.message || 'Nie udało się przekształcić wizyty', 5000);
                }
            } else {
                showToast('error', 'Wystąpił nieoczekiwany błąd podczas przekształcania wizyty', 5000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle field changes
    const handleFieldChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // Handle close
    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (loadingOptions) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title="Przekształć w wizytę">
                <LoadingContainer>
                    <FaSpinner className="spinner" />
                    <LoadingText>Ładowanie danych...</LoadingText>
                </LoadingContainer>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Przekształć w wizytę">
            <FormContainer>
                <form onSubmit={handleSubmit}>
                    <FormSection>
                        <SectionTitle>Szczegóły wizyty</SectionTitle>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="title">
                                    Tytuł wizyty
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleFieldChange('title', e.target.value)}
                                    placeholder="np. Cykliczna wizyta"
                                    disabled={loading}
                                    $hasError={!!errors.title}
                                />
                                {errors.title && <ErrorText>{errors.title}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="client">
                                    <FaUser /> Wybierz klienta *
                                </Label>
                                <AutocompleteContainer>
                                    <Input
                                        id="client"
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setShowClientDropdown(true);
                                            if (!e.target.value) {
                                                setFormData(prev => ({ ...prev, selectedClient: null }));
                                            }
                                        }}
                                        onFocus={() => setShowClientDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                                        placeholder="Wyszukaj klienta"
                                        disabled={loading}
                                        $hasError={!!errors.client}
                                        autoComplete="off"
                                    />

                                    {showClientDropdown && filteredClients.length > 0 && (
                                        <DropdownList>
                                            {filteredClients.map((option) => (
                                                <DropdownItem
                                                    key={option.id}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleClientSelect(option);
                                                    }}
                                                >
                                                    <OptionIcon><FaUser /></OptionIcon>
                                                    <OptionContent>
                                                        <OptionLabel>{option.label}</OptionLabel>
                                                        <OptionDescription>{option.description}</OptionDescription>
                                                    </OptionContent>
                                                </DropdownItem>
                                            ))}
                                        </DropdownList>
                                    )}
                                </AutocompleteContainer>
                                {errors.client && <ErrorText>{errors.client}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="vehicle">
                                    <FaCar /> Wybierz pojazd *
                                </Label>
                                <AutocompleteContainer>
                                    <Input
                                        id="vehicle"
                                        value={vehicleSearch}
                                        onChange={(e) => {
                                            setVehicleSearch(e.target.value);
                                            setShowVehicleDropdown(true);
                                            if (!e.target.value) {
                                                setFormData(prev => ({ ...prev, selectedVehicle: null }));
                                            }
                                        }}
                                        onFocus={() => setShowVehicleDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowVehicleDropdown(false), 200)}
                                        placeholder="Wyszukaj pojazd"
                                        disabled={loading}
                                        $hasError={!!errors.vehicle}
                                        autoComplete="off"
                                    />

                                    {showVehicleDropdown && filteredVehicles.length > 0 && (
                                        <DropdownList>
                                            {filteredVehicles.map((option) => (
                                                <DropdownItem
                                                    key={option.id}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleVehicleSelect(option);
                                                    }}
                                                >
                                                    <OptionIcon><FaCar /></OptionIcon>
                                                    <OptionContent>
                                                        <OptionLabel>{option.label}</OptionLabel>
                                                        <OptionDescription>{option.description}</OptionDescription>
                                                    </OptionContent>
                                                </DropdownItem>
                                            ))}
                                        </DropdownList>
                                    )}
                                </AutocompleteContainer>
                                {errors.vehicle && <ErrorText>{errors.vehicle}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="notes">Notatki</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                                    placeholder="Dodatkowe uwagi do wizyty..."
                                    rows={3}
                                    disabled={loading}
                                />
                            </FormGroup>
                        </FormRow>
                    </FormSection>

                    <ActionButtons>
                        <CancelButton type="button" onClick={handleClose} disabled={loading}>
                            <FaTimes /> Anuluj
                        </CancelButton>
                        <SubmitButton type="submit" disabled={loading || !formData.selectedClient || !formData.selectedVehicle}>
                            {loading ? (
                                <>
                                    <FaSpinner className="spinner" /> Przekształcam...
                                </>
                            ) : (
                                <>
                                    <FaCheck /> Utwórz wizytę
                                </>
                            )}
                        </SubmitButton>
                    </ActionButtons>
                </form>
            </FormContainer>
        </Modal>
    );
};

// Styled Components
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xxxl};
    
    .spinner {
        animation: spin 1s linear infinite;
        font-size: 24px;
        color: ${theme.primary};
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${theme.text.secondary};
`;

const FormContainer = styled.div`
    padding: ${theme.spacing.xl}; /* POPRAWKA: Dodano padding */
    min-width: 600px; /* POPRAWKA: Zwiększono szerokość */
    max-width: 700px;
    width: 100%;
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    padding-bottom: ${theme.spacing.md};
    border-bottom: 1px solid ${theme.border};
`;

const FormRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.primary};

    svg {
        color: ${theme.text.tertiary};
        font-size: 12px;
    }
`;

const AutocompleteContainer = styled.div`
    position: relative;
`;

const Input = styled.input<{ $hasError?: boolean }>`
    padding: ${theme.spacing.md};
    border: 1px solid ${props => props.$hasError ? theme.error : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    transition: all 0.2s ease;
    width: 100%;
    
    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? theme.error : theme.primary};
        box-shadow: 0 0 0 2px ${props => props.$hasError ? theme.error : theme.primary}20;
    }
    
    &:disabled {
        background: ${theme.surfaceAlt};
        color: ${theme.text.tertiary};
        cursor: not-allowed;
    }
    
    &::placeholder {
        color: ${theme.text.muted};
    }
`;

const DropdownList = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    box-shadow: ${theme.shadow.lg};
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
`;

const DropdownItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
    }
`;

const OptionIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${theme.primaryGhost};
    color: ${theme.primary};
    border-radius: ${theme.radius.sm};
    font-size: 14px;
    flex-shrink: 0;
`;

const OptionContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const OptionLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: 2px;
`;

const OptionDescription = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Textarea = styled.textarea`
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    transition: all 0.2s ease;
    resize: vertical;
    font-family: inherit;
    width: 100%;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 2px ${theme.primary}20;
    }

    &:disabled {
        background: ${theme.surfaceAlt};
        color: ${theme.text.tertiary};
        cursor: not-allowed;
    }

    &::placeholder {
        color: ${theme.text.muted};
    }
`;

const ErrorText = styled.span`
    font-size: 12px;
    color: ${theme.error};
    font-weight: 500;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    justify-content: flex-end;
    padding-top: ${theme.spacing.lg};
    border-top: 1px solid ${theme.border};
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    min-height: 40px;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const CancelButton = styled(BaseButton)`
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border-color: ${theme.border};

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
        color: ${theme.text.primary};
    }
`;

const SubmitButton = styled(BaseButton)`
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }
`;

export default ConvertToVisitModal;