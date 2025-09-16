// src/components/calendar/ConvertToVisitModal.tsx - IMPROVED STYLING VERSION
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaUser, FaCar, FaTimes, FaCheck, FaSpinner, FaCalendarAlt, FaClock, FaFileAlt } from 'react-icons/fa';
import Modal from '../common/Modal';
import { theme } from '../../styles/theme';
import { useToast } from '../common/Toast/Toast';
import { clientsApi } from '../../api/clientsApi';
import { vehicleApi } from '../../api/vehiclesApi';
import { recurringEventsApi } from '../../api/recurringEventsApi';
import { EventOccurrenceResponse, ConvertToVisitRequest, ConvertToVisitResponse } from '../../types/recurringEvents';
import { ClientExpanded, VehicleExpanded } from '../../types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

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
                    <LoadingSpinner>
                        <FaSpinner />
                    </LoadingSpinner>
                    <LoadingText>Ładowanie danych...</LoadingText>
                </LoadingContainer>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Przekształć w wizytę">
            <ModalBody>
                {/* Event Summary */}
                <EventSummary>
                    <SummaryHeader>
                        <SummaryIcon>
                            <FaCalendarAlt />
                        </SummaryIcon>
                        <SummaryContent>
                            <SummaryTitle>{recurringEventDetails?.title || 'Cykliczne wydarzenie'}</SummaryTitle>
                            <SummaryMeta>
                                <SummaryMetaItem>
                                    <FaClock />
                                    <span>{format(new Date(occurrence.scheduledDate), 'EEEE, dd MMMM yyyy • HH:mm', { locale: pl })}</span>
                                </SummaryMetaItem>
                            </SummaryMeta>
                        </SummaryContent>
                    </SummaryHeader>
                </EventSummary>

                <form onSubmit={handleSubmit}>
                    <FormContainer>
                        <FormSection>
                            <SectionHeader>
                                <SectionIcon><FaFileAlt /></SectionIcon>
                                <SectionTitle>Szczegóły wizyty</SectionTitle>
                            </SectionHeader>

                            <FormGrid>
                                <FormGroup $fullWidth>
                                    <Label htmlFor="title">
                                        Tytuł wizyty *
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

                                <FormGroup>
                                    <Label htmlFor="client">
                                        <FaUser /> Klient *
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
                                            placeholder="Wyszukaj klienta..."
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

                                <FormGroup>
                                    <Label htmlFor="vehicle">
                                        <FaCar /> Pojazd *
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
                                            placeholder="Wyszukaj pojazd..."
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

                                <FormGroup $fullWidth>
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
                            </FormGrid>
                        </FormSection>
                    </FormContainer>

                    <ActionButtons>
                        <CancelButton type="button" onClick={handleClose} disabled={loading}>
                            <FaTimes /> Anuluj
                        </CancelButton>
                        <SubmitButton type="submit" disabled={loading || !formData.selectedClient || !formData.selectedVehicle}>
                            {loading ? (
                                <>
                                    <LoadingSpinner small>
                                        <FaSpinner />
                                    </LoadingSpinner>
                                    <span>Przekształcam...</span>
                                </>
                            ) : (
                                <>
                                    <FaCheck />
                                    <span>Utwórz wizytę</span>
                                </>
                            )}
                        </SubmitButton>
                    </ActionButtons>
                </form>
            </ModalBody>
        </Modal>
    );
};

// Styled Components
const ModalBody = styled.div`
    padding: 0;
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xxxl};
    min-height: 200px;
`;

const LoadingSpinner = styled.div<{ small?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${props => props.small ? '16px' : '32px'};
    height: ${props => props.small ? '16px' : '32px'};
    color: ${theme.primary};
    
    svg {
        font-size: ${props => props.small ? '16px' : '24px'};
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: ${theme.text.secondary};
`;

const EventSummary = styled.div`
    background: linear-gradient(135deg, ${theme.primary}08 0%, ${theme.primary}15 100%);
    border: 1px solid ${theme.primary}30;
    border-radius: ${theme.radius.lg};
    margin-bottom: ${theme.spacing.xl};
    overflow: hidden;
`;

const SummaryHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
`;

const SummaryIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${theme.primary};
    color: white;
    border-radius: ${theme.radius.lg};
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px ${theme.primary}25;
`;

const SummaryContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const SummaryTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
    line-height: 1.3;
`;

const SummaryMeta = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const SummaryMetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.secondary};

    svg {
        font-size: 12px;
        color: ${theme.primary};
        flex-shrink: 0;
    }
`;

const FormContainer = styled.div`
    width: 100%;
`;

const FormSection = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const SectionIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: ${theme.radius.md};
    font-size: 14px;
`;

const SectionTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xl};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

const FormGroup = styled.div<{ $fullWidth?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    
    ${props => props.$fullWidth && `
        grid-column: 1 / -1;
    `}
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};

    svg {
        color: ${theme.primary};
        font-size: 13px;
    }
`;

const AutocompleteContainer = styled.div`
    position: relative;
`;

const Input = styled.input<{ $hasError?: boolean }>`
    width: 100%;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border: 1px solid ${props => props.$hasError ? theme.error : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${theme.surface};
    color: ${theme.text.primary};
    transition: all 0.2s ease;
    
    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? theme.error : theme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? theme.error : theme.primary}20;
    }
    
    &:disabled {
        background: ${theme.surfaceElevated};
        color: ${theme.text.tertiary};
        cursor: not-allowed;
        opacity: 0.7;
    }
    
    &::placeholder {
        color: ${theme.text.muted};
        font-weight: 400;
    }
`;

const DropdownList = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    box-shadow: ${theme.shadow.lg};
    z-index: 1000;
    max-height: 240px;
    overflow-y: auto;
`;

const DropdownItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid ${theme.borderLight};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${theme.surfaceHover};
        transform: translateX(2px);
    }
`;

const OptionIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: ${theme.radius.md};
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
    line-height: 1.3;
`;

const OptionDescription = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Textarea = styled.textarea`
    width: 100%;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${theme.surface};
    color: ${theme.text.primary};
    transition: all 0.2s ease;
    resize: vertical;
    font-family: inherit;
    min-height: 80px;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }

    &:disabled {
        background: ${theme.surfaceElevated};
        color: ${theme.text.tertiary};
        cursor: not-allowed;
        opacity: 0.7;
    }

    &::placeholder {
        color: ${theme.text.muted};
        font-weight: 400;
    }
`;

const ErrorText = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.error};
    margin-top: ${theme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    justify-content: flex-end;
    padding: ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
    margin-top: ${theme.spacing.xl};
    border-radius: 0 0 ${theme.radius.lg} ${theme.radius.lg};
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    min-height: 44px;
    min-width: 120px;
    justify-content: center;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
    }

    &:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:not(:disabled):active {
        transform: translateY(0);
    }
`;

const CancelButton = styled(BaseButton)`
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border-color: ${theme.border};

    &:not(:disabled):hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.primary};
        color: ${theme.text.primary};
    }
`;

const SubmitButton = styled(BaseButton)`
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};

    &:not(:disabled):hover {
        background: ${theme.primaryDark || theme.primary};
        border-color: ${theme.primaryDark || theme.primary};
    }
`;

export default ConvertToVisitModal;