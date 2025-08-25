// src/pages/Fleet/FleetMaintenanceFormPage.tsx

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {fleetVehicleApi} from '../../api/fleetApi';
import {fleetMaintenanceApi} from '../../api/fleetMaintenanceApi';
import {FleetVehicle} from '../../types/fleet';
import {FleetFuelEntry, FleetMaintenance, FleetMaintenanceTypeLabels} from '../../types/fleetMaintenance';
import {useToast} from '../../components/common/Toast/Toast';
import {FaArrowLeft, FaGasPump, FaTools} from 'react-icons/fa';

interface MaintenanceFormProps {
    fuel?: boolean;
}

const FleetMaintenanceFormPage: React.FC<MaintenanceFormProps> = ({ fuel = false }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const isFuelEntry = fuel || location.pathname.includes('/fuel/');

    const [vehicle, setVehicle] = useState<FleetVehicle | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Stan dla formularza serwisu
    const [maintenanceData, setMaintenanceData] = useState<Partial<FleetMaintenance>>({
        date: new Date().toISOString().split('T')[0],
        type: 'REGULAR_SERVICE',
        description: '',
        mileage: 0,
        cost: 0,
        garage: '',
        notes: ''
    });

    // Stan dla formularza tankowania
    const [fuelData, setFuelData] = useState<Partial<FleetFuelEntry>>({
        date: new Date().toISOString().split('T')[0],
        mileage: 0,
        fuelAmount: 0,
        fuelPrice: 0,
        totalCost: 0,
        fullTank: true
    });

    // Pobieranie danych pojazdu
    useEffect(() => {
        const fetchVehicleData = async () => {
            if (!id) return;

            setIsLoading(true);
            setError(null);

            try {
                const vehicleData = await fleetVehicleApi.fetchVehicleById(id);
                if (!vehicleData) {
                    setError('Nie znaleziono pojazdu o podanym ID');
                    return;
                }

                setVehicle(vehicleData);

                // Ustawienie aktualnego przebiegu pojazdu w formularzu
                setMaintenanceData(prev => ({
                    ...prev,
                    mileage: vehicleData.currentMileage
                }));

                setFuelData(prev => ({
                    ...prev,
                    mileage: vehicleData.currentMileage
                }));
            } catch (err) {
                console.error('Error fetching vehicle data:', err);
                setError('Wystąpił błąd podczas ładowania danych pojazdu');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicleData();
    }, [id]);

    // Obsługa zmiany danych formularza serwisu
    const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setMaintenanceData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    // Obsługa zmiany danych formularza tankowania
    const handleFuelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFuelData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            const numValue = Number(value);

            setFuelData(prev => {
                const updated = {
                    ...prev,
                    [name]: type === 'number' ? numValue : value
                };

                // Automatyczne przeliczanie kosztu całkowitego
                if (name === 'fuelAmount' || name === 'fuelPrice') {
                    const amount = name === 'fuelAmount' ? numValue : (prev.fuelAmount || 0);
                    const price = name === 'fuelPrice' ? numValue : (prev.fuelPrice || 0);
                    updated.totalCost = Number((amount * price).toFixed(2));
                } else if (name === 'totalCost' && prev.fuelAmount) {
                    // Przeliczanie ceny jednostkowej gdy zmienia się koszt całkowity
                    updated.fuelPrice = Number((numValue / prev.fuelAmount).toFixed(2));
                }

                return updated;
            });
        }
    };

    // Zapisywanie wpisu serwisowego
    const handleMaintenanceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id || !vehicle) return;

        setIsSaving(true);

        try {
            // Dodajemy ID pojazdu
            const submitData = {
                ...maintenanceData,
                vehicleId: id
            };

            // Zapisujemy dane serwisowe
            await fleetMaintenanceApi.addMaintenanceRecord(id, submitData);

            // Jeśli przebieg serwisu jest większy niż aktualny przebieg pojazdu,
            // aktualizujemy przebieg pojazdu
            if (maintenanceData.mileage && maintenanceData.mileage > vehicle.currentMileage) {
                await fleetVehicleApi.updateVehicleMileage(id, maintenanceData.mileage);
            }

            // Aktualizacja przebiegu ostatniego serwisu jeśli to regularny serwis
            if (maintenanceData.type === 'REGULAR_SERVICE' || maintenanceData.type === 'OIL_CHANGE') {
                const updatedVehicle = {
                    lastServiceMileage: maintenanceData.mileage,
                    nextServiceMileage: maintenanceData.mileage ? maintenanceData.mileage + 10000 : vehicle.nextServiceMileage
                };

                await fleetVehicleApi.updateVehicle(id, updatedVehicle);
            }

            showToast('success', 'Wpis serwisowy został dodany', 3000);
            navigate(`/fleet/vehicles/${id}`);
        } catch (err) {
            console.error('Error saving maintenance record:', err);
            showToast('error', 'Wystąpił błąd podczas zapisywania wpisu serwisowego', 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // Zapisywanie wpisu o tankowaniu
    const handleFuelSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id || !vehicle) return;

        setIsSaving(true);

        try {
            // Dodajemy ID pojazdu
            const submitData = {
                ...fuelData,
                vehicleId: id
            };

            // Zapisujemy dane tankowania
            await fleetMaintenanceApi.addFuelEntry(id, submitData);

            // Jeśli przebieg tankowania jest większy niż aktualny przebieg pojazdu,
            // aktualizujemy przebieg pojazdu
            if (fuelData.mileage && fuelData.mileage > vehicle.currentMileage) {
                await fleetVehicleApi.updateVehicleMileage(id, fuelData.mileage);
            }

            showToast('success', 'Wpis o tankowaniu został dodany', 3000);
            navigate(`/fleet/vehicles/${id}`);
        } catch (err) {
            console.error('Error saving fuel entry:', err);
            showToast('error', 'Wystąpił błąd podczas zapisywania wpisu o tankowaniu', 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/fleet/vehicles/${id}`);
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie danych pojazdu...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error || !vehicle) {
        return (
            <ErrorContainer>
                <ErrorMessage>{error || 'Nie znaleziono pojazdu'}</ErrorMessage>
                <BackButton onClick={() => navigate(`/fleet/vehicles`)}>
                    Wróć do listy pojazdów
                </BackButton>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <BackLink onClick={() => navigate(`/fleet/vehicles/${id}`)}>
                    <FaArrowLeft /> Wróć do szczegółów pojazdu
                </BackLink>
                <PageTitle>
                    {isFuelEntry ? (
                        <>
                            <FaGasPump />
                            Dodaj wpis o tankowaniu
                        </>
                    ) : (
                        <>
                            <FaTools />
                            Dodaj wpis serwisowy
                        </>
                    )}
                </PageTitle>
            </PageHeader>

            <VehicleInfoCard>
                <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                <VehiclePlate>{vehicle.licensePlate}</VehiclePlate>
                <VehicleMileage>Aktualny przebieg: {vehicle.currentMileage.toLocaleString()} km</VehicleMileage>
            </VehicleInfoCard>

            {isFuelEntry ? (
                <FormContainer onSubmit={handleFuelSubmit}>
                    <FormSection>
                        <SectionTitle>Informacje o tankowaniu</SectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label htmlFor="date">Data tankowania*</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={fuelData.date}
                                    onChange={handleFuelChange}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="mileage">Przebieg (km)*</Label>
                                <Input
                                    id="mileage"
                                    name="mileage"
                                    type="number"
                                    value={fuelData.mileage}
                                    onChange={handleFuelChange}
                                    required
                                    min={0}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="fuelAmount">Ilość paliwa (litry)*</Label>
                                <Input
                                    id="fuelAmount"
                                    name="fuelAmount"
                                    type="number"
                                    step="0.01"
                                    value={fuelData.fuelAmount}
                                    onChange={handleFuelChange}
                                    required
                                    min={0}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="fuelPrice">Cena za litr (zł)*</Label>
                                <Input
                                    id="fuelPrice"
                                    name="fuelPrice"
                                    type="number"
                                    step="0.01"
                                    value={fuelData.fuelPrice}
                                    onChange={handleFuelChange}
                                    required
                                    min={0}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="totalCost">Koszt całkowity (zł)*</Label>
                                <Input
                                    id="totalCost"
                                    name="totalCost"
                                    type="number"
                                    step="0.01"
                                    value={fuelData.totalCost}
                                    onChange={handleFuelChange}
                                    required
                                    min={0}
                                />
                            </FormGroup>

                            <FormGroup>
                                <CheckboxContainer>
                                    <Checkbox
                                        id="fullTank"
                                        name="fullTank"
                                        type="checkbox"
                                        checked={fuelData.fullTank}
                                        onChange={handleFuelChange}
                                    />
                                    <CheckboxLabel htmlFor="fullTank">
                                        Tankowanie do pełna
                                    </CheckboxLabel>
                                </CheckboxContainer>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="station">Stacja paliw</Label>
                                <Input
                                    id="station"
                                    name="station"
                                    value={fuelData.station || ''}
                                    onChange={handleFuelChange}
                                    placeholder="Nazwa stacji paliw"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="notes">Uwagi</Label>
                                <TextArea
                                    id="notes"
                                    name="notes"
                                    value={fuelData.notes || ''}
                                    rows={3}
                                    placeholder="Dodatkowe informacje o tankowaniu"
                                />
                            </FormGroup>
                        </FormGrid>
                    </FormSection>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={handleCancel} disabled={isSaving}>
                            Anuluj
                        </CancelButton>
                        <SubmitButton type="submit" disabled={isSaving}>
                            {isSaving ? 'Zapisywanie...' : 'Dodaj wpis o tankowaniu'}
                        </SubmitButton>
                    </ButtonGroup>
                </FormContainer>
            ) : (
                <FormContainer onSubmit={handleMaintenanceSubmit}>
                    <FormSection>
                        <SectionTitle>Informacje serwisowe</SectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label htmlFor="date">Data serwisu*</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={maintenanceData.date}
                                    onChange={handleMaintenanceChange}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="type">Typ serwisu*</Label>
                                <Select
                                    id="type"
                                    name="type"
                                    value={maintenanceData.type}
                                    onChange={handleMaintenanceChange}
                                    required
                                >
                                    {Object.entries(FleetMaintenanceTypeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="mileage">Przebieg (km)*</Label>
                                <Input
                                    id="mileage"
                                    name="mileage"
                                    type="number"
                                    value={maintenanceData.mileage}
                                    onChange={handleMaintenanceChange}
                                    required
                                    min={0}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="cost">Koszt (zł)*</Label>
                                <Input
                                    id="cost"
                                    name="cost"
                                    type="number"
                                    step="0.01"
                                    value={maintenanceData.cost}
                                    onChange={handleMaintenanceChange}
                                    required
                                    min={0}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="garage">Warsztat / serwis*</Label>
                                <Input
                                    id="garage"
                                    name="garage"
                                    value={maintenanceData.garage}
                                    onChange={handleMaintenanceChange}
                                    required
                                    placeholder="Nazwa warsztatu / serwisu"
                                />
                            </FormGroup>

                            <FormGroupWide>
                                <Label htmlFor="description">Opis wykonanych prac*</Label>
                                <TextArea
                                    id="description"
                                    name="description"
                                    value={maintenanceData.description}
                                    onChange={handleMaintenanceChange}
                                    rows={3}
                                    required
                                    placeholder="Szczegółowy opis wykonanych czynności serwisowych"
                                />
                            </FormGroupWide>

                            <FormGroupWide>
                                <Label htmlFor="notes">Uwagi</Label>
                                <TextArea
                                    id="notes"
                                    name="notes"
                                    value={maintenanceData.notes || ''}
                                    onChange={handleMaintenanceChange}
                                    rows={3}
                                    placeholder="Dodatkowe uwagi"
                                />
                            </FormGroupWide>
                        </FormGrid>
                    </FormSection>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={handleCancel} disabled={isSaving}>
                            Anuluj
                        </CancelButton>
                        <SubmitButton type="submit" disabled={isSaving}>
                            {isSaving ? 'Zapisywanie...' : 'Dodaj wpis serwisowy'}
                        </SubmitButton>
                    </ButtonGroup>
                </FormContainer>
            )}
        </PageContainer>
    );
};

const PageContainer = styled.div`
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
`;

const BackLink = styled.a`
    display: flex;
    align-items: center;
    color: #3498db;
    font-size: 14px;
    cursor: pointer;
    
    svg {
        margin-right: 8px;
    }
    
    &:hover {
        text-decoration: underline;
    }
`;

const PageTitle = styled.h1`
    display: flex;
    align-items: center;
    font-size: 24px;
    color: #2c3e50;
    margin: 0;
    
    svg {
        margin-right: 12px;
        color: #3498db;
    }
    
    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const VehicleInfoCard = styled.div`
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
    border-left: 4px solid #3498db;
`;

const VehicleName = styled.h2`
    font-size: 18px;
    color: #2c3e50;
    margin: 0 0 4px 0;
`;

const VehiclePlate = styled.div`
    font-size: 16px;
    color: #7f8c8d;
    margin-bottom: 8px;
`;

const VehicleMileage = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const FormContainer = styled.form`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FormSection = styled.div`
    padding: 20px;
    border-bottom: 1px solid #eee;
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    color: #2c3e50;
    margin: 0 0 20px 0;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
`;

const FormGroup = styled.div``;

const FormGroupWide = styled.div`
    grid-column: 1 / -1;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #34495e;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
    
    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    
    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    margin-top: 24px;
`;

const Checkbox = styled.input`
    margin-right: 8px;
`;

const CheckboxLabel = styled.label`
    font-size: 14px;
    color: #34495e;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px;
    
    @media (max-width: 576px) {
        flex-direction: column-reverse;
    }
`;

const Button = styled.button`
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    @media (max-width: 576px) {
        width: 100%;
    }
`;

const CancelButton = styled(Button)`
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    
    &:hover:not(:disabled) {
        background-color: #f5f5f5;
    }
`;

const SubmitButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
`;

const LoadingSpinner = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    color: #7f8c8d;
`;

const ErrorContainer = styled.div`
    text-align: center;
    padding: 40px;
`;

const ErrorMessage = styled.div`
    color: #e74c3c;
    margin-bottom: 16px;
`;

const BackButton = styled.button`
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        background-color: #2980b9;
    }
`;

export default FleetMaintenanceFormPage;