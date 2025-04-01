import React, { useState } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaCarSide,
    FaTachometerAlt,
    FaCalendarAlt,
    FaSave,
    FaPlus,
    FaExclamationTriangle,
    FaCheck
} from 'react-icons/fa';
import { CarReceptionProtocol } from '../../../../types';
import { updateCarReceptionProtocol } from '../../../../api/mocks/carReceptionMocks';

// Define vehicle issue type
interface VehicleIssue {
    id: string;
    location: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
    createdAt: string;
    resolvedAt?: string;
}

interface ProtocolVehicleStatusProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
}

// Helper function to get severity color based on severity level
const getSeverityColor = (severity: string): string => {
    switch (severity) {
        case 'low':
            return '#27ae60';
        case 'medium':
            return '#f39c12';
        case 'high':
            return '#e74c3c';
        default:
            return '#7f8c8d';
    }
};

const ProtocolVehicleStatus: React.FC<ProtocolVehicleStatusProps> = ({ protocol, onProtocolUpdate }) => {
    // Get vehicle issues from protocol or initialize empty array
    const [vehicleIssues, setVehicleIssues] = useState<VehicleIssue[]>(protocol.vehicleIssues || []);
    const [mileage, setMileage] = useState<number>(protocol.mileage);
    const [isSavingMileage, setIsSavingMileage] = useState(false);
    const [showAddIssueForm, setShowAddIssueForm] = useState(false);

    // Form state for new issue
    const [newIssue, setNewIssue] = useState<Omit<VehicleIssue, 'id' | 'createdAt' | 'resolved'>>({
        location: '',
        description: '',
        severity: 'medium'
    });

    // Format date for display
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: pl });
    };

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: pl });
    };

    // Handle mileage update
    const handleUpdateMileage = async () => {
        if (mileage === protocol.mileage) return;

        setIsSavingMileage(true);
        try {
            const updatedProtocol = {
                ...protocol,
                mileage,
                updatedAt: new Date().toISOString()
            };

            // Save to backend
            const savedProtocol = await updateCarReceptionProtocol(updatedProtocol);
            onProtocolUpdate(savedProtocol);
        } catch (error) {
            console.error('Error updating mileage:', error);
            // Reset to original value if update fails
            setMileage(protocol.mileage);
        } finally {
            setIsSavingMileage(false);
        }
    };

    // Handle adding a new vehicle issue
    const handleAddIssue = async () => {
        if (!newIssue.location.trim() || !newIssue.description.trim()) return;

        try {
            // Create new issue
            const issue: VehicleIssue = {
                id: `issue_${Date.now()}`,
                ...newIssue,
                resolved: false,
                createdAt: new Date().toISOString()
            };

            // Add to local state
            const updatedIssues = [...vehicleIssues, issue];
            setVehicleIssues(updatedIssues);

            // Update protocol with new issue
            const updatedProtocol = {
                ...protocol,
                vehicleIssues: updatedIssues,
                updatedAt: new Date().toISOString()
            };

            // Save to backend
            const savedProtocol = await updateCarReceptionProtocol(updatedProtocol);
            onProtocolUpdate(savedProtocol);

            // Reset form
            setNewIssue({
                location: '',
                description: '',
                severity: 'medium'
            });
            setShowAddIssueForm(false);
        } catch (error) {
            console.error('Error adding vehicle issue:', error);
        }
    };

    // Handle resolving an issue
    const handleToggleIssueResolved = async (issueId: string) => {
        try {
            // Update the issue in local state
            const updatedIssues = vehicleIssues.map(issue => {
                if (issue.id === issueId) {
                    return {
                        ...issue,
                        resolved: !issue.resolved,
                        resolvedAt: issue.resolved ? undefined : new Date().toISOString()
                    };
                }
                return issue;
            });

            setVehicleIssues(updatedIssues);

            // Update protocol with updated issues
            const updatedProtocol = {
                ...protocol,
                vehicleIssues: updatedIssues,
                updatedAt: new Date().toISOString()
            };

            // Save to backend
            const savedProtocol = await updateCarReceptionProtocol(updatedProtocol);
            onProtocolUpdate(savedProtocol);
        } catch (error) {
            console.error('Error updating issue status:', error);
        }
    };

    return (
        <VehicleStatusContainer>
            <Section>
                <SectionTitle>Informacje o pojeździe</SectionTitle>
                <VehicleInfoCard>
                    <VehicleIconWrapper>
                        <FaCarSide />
                    </VehicleIconWrapper>
                    <VehicleDetailsGrid>
                        <VehicleDetailItem>
                            <DetailLabel>Marka i model</DetailLabel>
                            <DetailValue>{protocol.make} {protocol.model}</DetailValue>
                        </VehicleDetailItem>

                        <VehicleDetailItem>
                            <DetailLabel>Numer rejestracyjny</DetailLabel>
                            <DetailValue>{protocol.licensePlate}</DetailValue>
                        </VehicleDetailItem>

                        <VehicleDetailItem>
                            <DetailLabel>Rok produkcji</DetailLabel>
                            <DetailValue>{protocol.productionYear}</DetailValue>
                        </VehicleDetailItem>

                        <VehicleDetailItem>
                            <DetailLabel>Data przyjęcia</DetailLabel>
                            <DetailValue>{formatDateTime(protocol.startDate)}</DetailValue>
                        </VehicleDetailItem>
                    </VehicleDetailsGrid>
                </VehicleInfoCard>
            </Section>

            <Section>
                <SectionTitle>Aktualizacja przebiegu</SectionTitle>
                <MileageUpdateForm>
                    <MileageInputWrapper>
                        <MileageIcon><FaTachometerAlt /></MileageIcon>
                        <MileageInput
                            type="number"
                            value={mileage}
                            onChange={(e) => setMileage(Number(e.target.value))}
                            min="0"
                        />
                        <MileageUnit>km</MileageUnit>
                    </MileageInputWrapper>
                    <SaveMileageButton
                        onClick={handleUpdateMileage}
                        disabled={isSavingMileage || mileage === protocol.mileage}
                    >
                        <FaSave /> {isSavingMileage ? 'Zapisywanie...' : 'Zapisz przebieg'}
                    </SaveMileageButton>
                </MileageUpdateForm>
            </Section>

            <Section>
                <SectionTitleWithAction>
                    <SectionTitle>Lista uszkodzeń i uwag</SectionTitle>
                    {!showAddIssueForm && (
                        <AddIssueButton onClick={() => setShowAddIssueForm(true)}>
                            <FaPlus /> Dodaj uwagę
                        </AddIssueButton>
                    )}
                </SectionTitleWithAction>

                {showAddIssueForm && (
                    <AddIssueForm>
                        <FormRow>
                            <FormGroup>
                                <Label>Lokalizacja uszkodzenia:</Label>
                                <Input
                                    value={newIssue.location}
                                    onChange={(e) => setNewIssue({...newIssue, location: e.target.value})}
                                    placeholder="np. Lewy przedni błotnik"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Poziom istotności:</Label>
                                <Select
                                    value={newIssue.severity}
                                    onChange={(e) => setNewIssue({...newIssue, severity: e.target.value as any})}
                                >
                                    <option value="low">Niski - Drobne / kosmetyczne</option>
                                    <option value="medium">Średni - Wymagające uwagi</option>
                                    <option value="high">Wysoki - Poważne uszkodzenie</option>
                                </Select>
                            </FormGroup>
                        </FormRow>

                        <FormGroup>
                            <Label>Opis uszkodzenia:</Label>
                            <Textarea
                                value={newIssue.description}
                                onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                                placeholder="Szczegółowy opis uszkodzenia..."
                                rows={3}
                            />
                        </FormGroup>

                        <FormActions>
                            <CancelButton onClick={() => setShowAddIssueForm(false)}>
                                Anuluj
                            </CancelButton>
                            <AddButton
                                onClick={handleAddIssue}
                                disabled={!newIssue.location.trim() || !newIssue.description.trim()}
                            >
                                <FaPlus /> Dodaj uszkodzenie
                            </AddButton>
                        </FormActions>
                    </AddIssueForm>
                )}

                {vehicleIssues.length === 0 ? (
                    <EmptyState>
                        Nie zarejestrowano żadnych uszkodzeń ani uwag dla tego pojazdu.
                    </EmptyState>
                ) : (
                    <IssuesList>
                        {vehicleIssues.map(issue => (
                            <IssueItem
                                key={issue.id}
                                $severity={issue.severity}
                                $resolved={issue.resolved}
                            >
                                <IssueMeta>
                                    <IssueLocation>{issue.location}</IssueLocation>
                                    <IssueSeverity $severity={issue.severity}>
                                        <FaExclamationTriangle />
                                        {issue.severity === 'low' && 'Niski'}
                                        {issue.severity === 'medium' && 'Średni'}
                                        {issue.severity === 'high' && 'Wysoki'}
                                    </IssueSeverity>
                                </IssueMeta>
                                <IssueDescription>{issue.description}</IssueDescription>
                                <IssueFooter>
                                    <IssueDate>
                                        <FaCalendarAlt /> Dodano: {formatDate(issue.createdAt)}
                                    </IssueDate>
                                    <ResolveButton
                                        $resolved={issue.resolved}
                                        onClick={() => handleToggleIssueResolved(issue.id)}
                                    >
                                        {issue.resolved ? (
                                            <>
                                                <FaCheck /> Rozwiązane
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck /> Oznacz jako rozwiązane
                                            </>
                                        )}
                                    </ResolveButton>
                                </IssueFooter>
                            </IssueItem>
                        ))}
                    </IssuesList>
                )}
            </Section>
        </VehicleStatusContainer>
    );
};

// Styled components
const VehicleStatusContainer = styled.div``;

const Section = styled.div`
    margin-bottom: 25px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
`;

const SectionTitleWithAction = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;

    ${SectionTitle} {
        margin: 0;
        padding: 0;
        border: none;
    }
`;

const VehicleInfoCard = styled.div`
    display: flex;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
`;

const VehicleIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background-color: #e7f3ff;
    color: #3498db;
    font-size: 32px;
    border-radius: 8px;
    margin-right: 20px;
`;

const VehicleDetailsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    flex: 1;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const VehicleDetailItem = styled.div``;

const DetailLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 3px;
`;

const DetailValue = styled.div`
    font-size: 16px;
    color: #34495e;
    font-weight: 500;
`;

const MileageUpdateForm = styled.div`
    display: flex;
    gap: 15px;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const MileageInputWrapper = styled.div`
    display: flex;
    align-items: center;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0 12px;
    flex: 1;
    max-width: 300px;

    @media (max-width: 768px) {
        width: 100%;
        max-width: none;
    }
`;

const MileageIcon = styled.div`
    color: #7f8c8d;
    margin-right: 10px;
`;

const MileageInput = styled.input`
    flex: 1;
    padding: 10px 0;
    border: none;
    font-size: 16px;
    font-weight: 500;

    &:focus {
        outline: none;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    &[type=number] {
        -moz-appearance: textfield;
    }
`;

const MileageUnit = styled.div`
    color: #7f8c8d;
    font-size: 14px;
    margin-left: 5px;
`;

const SaveMileageButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }

    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const AddIssueButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;

    &:hover {
        background-color: #d5e9f9;
    }
`;

const AddIssueForm = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;
`;

const FormRow = styled.div`
    display: flex;
    gap: 15px;
    margin-bottom: 15px;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const FormGroup = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    font-size: 14px;
    color: #34495e;
    margin-bottom: 5px;
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
`;

const Textarea = styled.textarea`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    font-family: inherit;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const CancelButton = styled.button`
    padding: 8px 16px;
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background-color: #f5f5f5;
    }

    @media (max-width: 768px) {
        order: 2;
    }
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }

    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        order: 1;
        margin-bottom: 10px;
    }
`;

const EmptyState = styled.div`
    padding: 20px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 4px;
    color: #7f8c8d;
    font-size: 14px;
`;

const IssuesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

// Using transient props with $ prefix to avoid DOM attribute warnings
const IssueItem = styled.div<{ $severity: string; $resolved: boolean }>`
    background-color: ${props => props.$resolved ? '#f9f9f9' : 'white'};
    border-left: 3px solid ${props => props.$resolved ? '#95a5a6' : getSeverityColor(props.$severity)};
    border-radius: 4px;
    padding: 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    opacity: ${props => props.$resolved ? 0.7 : 1};
`;

const IssueMeta = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const IssueLocation = styled.div`
    font-weight: 500;
    font-size: 15px;
    color: #34495e;
`;

// Using transient props with $ prefix
const IssueSeverity = styled.div<{ $severity: string }>`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    background-color: ${props => `${getSeverityColor(props.$severity)}15`};
    color: ${props => getSeverityColor(props.$severity)};
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
`;

const IssueDescription = styled.div`
    font-size: 14px;
    color: #34495e;
    margin-bottom: 15px;
    white-space: pre-line;
`;

const IssueFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
`;

const IssueDate = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #7f8c8d;
`;

// Using transient props with $ prefix
const ResolveButton = styled.button<{ $resolved: boolean }>`
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: ${props => props.$resolved ? '#e8f8f5' : '#f0f7ff'};
    color: ${props => props.$resolved ? '#27ae60' : '#3498db'};
    border: 1px solid ${props => props.$resolved ? '#d1f5ea' : '#d5e9f9'};
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;

    &:hover {
        background-color: ${props => props.$resolved ? '#d1f5ea' : '#d5e9f9'};
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

export default ProtocolVehicleStatus;