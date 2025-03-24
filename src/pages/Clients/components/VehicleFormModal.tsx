import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { VehicleExpanded } from '../../../types/vehicle';
import { clientApi } from '../../../api/clientsApi';
import Modal from '../../../components/common/Modal';

interface VehicleFormModalProps {
    vehicle: VehicleExpanded | null;
    defaultOwnerId?: string;
    onSave: (vehicle: VehicleExpanded) => void;
    onCancel: () => void;
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
                                                               vehicle,
                                                               defaultOwnerId,
                                                               onSave,
                                                               onCancel
                                                           }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [owners, setOwners] = useState<{ id: string; name: string }[]>([]);
    const [loadingOwners, setLoadingOwners] = useState(false);

    // Initialize form with vehicle data or empty values
    const [formData, setFormData] = useState<Partial<VehicleExpanded>>(
        vehicle || {
            make: '',
            model: '',
            year: new Date().getFullYear(),
            licensePlate: '',
            color: '',
            vin: '',
            totalServices: 0,
            totalSpent: 0,
            serviceHistory: [],
            ownerIds: defaultOwnerId ? [defaultOwnerId] : []
        }
    );

    // Form validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load owners list
    useEffect(() => {
        const loadOwners = async () => {
            try {
                setLoadingOwners(true);
                const clientsData = await clientApi.fetchClients();

                const ownersData = clientsData.map(client => ({
                    id: client.id,
                    name: `${client.firstName} ${client.lastName}`
                }));

                setOwners(ownersData);
            } catch (err) {
                console.error('Error loading owners:', err);
                setError('Nie udało się załadować listy właścicieli.');
            } finally {
                setLoadingOwners(false);
            }
        };

        loadOwners();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Handle year as number
        if (name === 'year') {
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value) || new Date().getFullYear()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when field is edited
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);

        setFormData(prev => ({
            ...prev,
            ownerIds: selectedOptions
        }));

        // Clear error when field is edited
        if (errors.ownerIds) {
            setErrors({
                ...errors,
                ownerIds: ''
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.make?.trim()) {
            newErrors.make = 'Marka jest wymagana';
        }

        if (!formData.model?.trim()) {
            newErrors.model = 'Model jest wymagany';
        }

        if (!formData.licensePlate?.trim()) {
            newErrors.licensePlate = 'Numer rejestracyjny jest wymagany';
        }

        const currentYear = new Date().getFullYear();
        if (!formData.year || formData.year < 1900 || formData.year > currentYear + 1) {
            newErrors.year = `Rok produkcji musi być pomiędzy 1900 a ${currentYear + 1}`;
        }

        if (!formData.ownerIds?.length) {
            newErrors.ownerIds = 'Wybierz co najmniej jednego właściciela';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // Prepare the vehicle data by copying only necessary fields
        const vehicleData: Partial<VehicleExpanded> = {
            ...vehicle,
            make: formData.make,
            model: formData.model,
            year: formData.year,
            licensePlate: formData.licensePlate,
            color: formData.color,
            vin: formData.vin,
            ownerIds: formData.ownerIds || []
        };

        try {
            onSave(vehicleData as VehicleExpanded);
        } catch (err) {
            setError('Nie udało się zapisać pojazdu. Spróbuj ponownie.');
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={vehicle ? 'Edytuj pojazd' : 'Dodaj pojazd'}
        >
            <FormContainer>
                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Form onSubmit={handleSubmit}>
                    <FormSection>
                        <SectionTitle>Dane pojazdu</SectionTitle>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="make">Marka*</Label>
                                <Input
                                    id="make"
                                    name="make"
                                    value={formData.make || ''}
                                    onChange={handleChange}
                                    placeholder="Marka"
                                    required
                                />
                                {errors.make && <ErrorText>{errors.make}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="model">Model*</Label>
                                <Input
                                    id="model"
                                    name="model"
                                    value={formData.model || ''}
                                    onChange={handleChange}
                                    placeholder="Model"
                                    required
                                />
                                {errors.model && <ErrorText>{errors.model}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="year">Rok produkcji*</Label>
                                <Input
                                    id="year"
                                    name="year"
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    value={formData.year || ''}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.year && <ErrorText>{errors.year}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="licensePlate">Numer rejestracyjny*</Label>
                                <Input
                                    id="licensePlate"
                                    name="licensePlate"
                                    value={formData.licensePlate || ''}
                                    onChange={handleChange}
                                    placeholder="Numer rejestracyjny"
                                    required
                                />
                                {errors.licensePlate && <ErrorText>{errors.licensePlate}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="color">Kolor</Label>
                                <Input
                                    id="color"
                                    name="color"
                                    value={formData.color || ''}
                                    onChange={handleChange}
                                    placeholder="Kolor"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="vin">Numer VIN</Label>
                                <Input
                                    id="vin"
                                    name="vin"
                                    value={formData.vin || ''}
                                    onChange={handleChange}
                                    placeholder="Numer VIN"
                                />
                            </FormGroup>
                        </FormRow>
                    </FormSection>

                    <FormSection>
                        <SectionTitle>Właściciele</SectionTitle>
                        <FormGroup>
                            <Label htmlFor="ownerIds">Wybierz właścicieli*</Label>
                            <Select
                                id="ownerIds"
                                name="ownerIds"
                                multiple
                                size={4}
                                value={formData.ownerIds || []}
                                onChange={handleOwnerChange}
                                disabled={loadingOwners}
                                required
                            >
                                {loadingOwners ? (
                                    <option disabled>Ładowanie właścicieli...</option>
                                ) : (
                                    owners.map(owner => (
                                        <option key={owner.id} value={owner.id}>
                                            {owner.name}
                                        </option>
                                    ))
                                )}
                            </Select>
                            <HelpText>Przytrzymaj Ctrl (lub Cmd na Mac) aby wybrać wielu właścicieli.</HelpText>
                            {errors.ownerIds && <ErrorText>{errors.ownerIds}</ErrorText>}
                        </FormGroup>
                    </FormSection>

                    {/* Only show this section when editing, not for new vehicles */}
                    {vehicle && (
                        <FormSection>
                            <SectionTitle>Statystyki serwisowe</SectionTitle>
                            <HelpText>Pola te są aktualizowane automatycznie przez system i nie można ich edytować ręcznie.</HelpText>

                            <FormRow>
                                <StatItem>
                                    <StatLabel>Liczba usług:</StatLabel>
                                    <StatValue>{vehicle.totalServices}</StatValue>
                                </StatItem>

                                <StatItem>
                                    <StatLabel>Suma wydatków:</StatLabel>
                                    <StatValue>{vehicle.totalSpent.toFixed(2)} zł</StatValue>
                                </StatItem>
                            </FormRow>

                            {vehicle.lastServiceDate && (
                                <StatItem>
                                    <StatLabel>Ostatnia usługa:</StatLabel>
                                    <StatValue>{formatDate(vehicle.lastServiceDate)}</StatValue>
                                </StatItem>
                            )}
                        </FormSection>
                    )}

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onCancel}>
                            Anuluj
                        </CancelButton>
                        <SaveButton type="submit" disabled={loading}>
                            {loading ? 'Zapisywanie...' : (vehicle ? 'Zapisz zmiany' : 'Dodaj pojazd')}
                        </SaveButton>
                    </ButtonGroup>
                </Form>
            </FormContainer>
        </Modal>
    );
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Styled components
const FormContainer = styled.div`
    padding: 0 16px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const FormSection = styled.section`
    margin-bottom: 10px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    color: #3498db;
    margin: 0 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
`;

const FormRow = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #333;
    margin-bottom: 6px;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    &[multiple] {
        height: auto;
        min-height: 110px;
    }
`;

const HelpText = styled.p`
    font-size: 13px;
    color: #7f8c8d;
    margin: 4px 0 0 0;
    font-style: italic;
`;

const StatItem = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin-bottom: 8px;
    flex: 1;
`;

const StatLabel = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #7f8c8d;
`;

const StatValue = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: #34495e;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
`;

const Button = styled.button`
    padding: 10px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const CancelButton = styled(Button)`
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;

    &:hover:not(:disabled) {
        background-color: #e9e9e9;
    }
`;

const SaveButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
`;

const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 14px;
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;

export default VehicleFormModal;