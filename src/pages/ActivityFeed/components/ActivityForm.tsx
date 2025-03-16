import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaPlus,
    FaTimes,
    FaSave,
    FaTag,
    FaUser,
    FaBell
} from 'react-icons/fa';
import { addActivity } from '../../../api/mocks/activityMocks';
import { fetchClients } from '../../../api/mocks/clientMocks';
import { fetchEmployees } from '../../../api/mocks/employeesMocks';
import { ActivityItem, ActivityCategory, ActivityStatus } from '../../../types/activity';
import { ClientExpanded, Employee } from '../../../types';

interface ActivityFormProps {
    isOpen: boolean;
    onClose: () => void;
    onActivityAdded: (activity: ActivityItem) => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ isOpen, onClose, onActivityAdded }) => {
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<ActivityCategory>('notification');
    const [status, setStatus] = useState<ActivityStatus>('success');
    const [clients, setClients] = useState<ClientExpanded[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Ładowanie danych pomocniczych
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setIsLoading(true);
                try {
                    const [clientsData, employeesData] = await Promise.all([
                        fetchClients(),
                        fetchEmployees()
                    ]);
                    setClients(clientsData);
                    setEmployees(employeesData);

                    // Domyślnie wybierz pierwszego pracownika jako autora
                    if (employeesData.length > 0) {
                        setSelectedEmployeeId(employeesData[0].id);
                    }
                } catch (error) {
                    console.error('Error loading form data:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            loadData();
            resetForm();
        }
    }, [isOpen]);

    // Reset formularza
    const resetForm = () => {
        setMessage('');
        setCategory('notification');
        setStatus('success');
        setSelectedClientId('');
    };

    // Kategorie aktywności dostępne dla użytkownika
    const availableCategories: Array<{id: ActivityCategory; label: string}> = [
        { id: 'notification', label: 'Powiadomienie' },
        { id: 'comment', label: 'Komentarz' },
        { id: 'call', label: 'Rozmowa telefoniczna' },
        { id: 'system', label: 'Informacja systemowa' }
    ];

    // Statusy aktywności
    const statusOptions: Array<{id: ActivityStatus; label: string}> = [
        { id: 'success', label: 'Sukces' },
        { id: 'pending', label: 'W trakcie' },
        { id: 'error', label: 'Błąd' }
    ];

    // Obsługa dodawania nowej aktywności
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        setIsSaving(true);

        try {
            // Przygotowanie danych aktywności
            const newActivityData: Omit<ActivityItem, 'id' | 'timestamp'> = {
                message,
                category,
                status
            };

            // Dodanie danych autora, jeśli wybrano
            if (selectedEmployeeId) {
                const employee = employees.find(e => e.id === selectedEmployeeId);
                if (employee) {
                    newActivityData.userId = employee.id;
                    newActivityData.userName = employee.fullName;
                    newActivityData.userColor = employee.color;
                }
            }

            // Dodanie powiązanego klienta, jeśli wybrano
            if (selectedClientId) {
                const client = clients.find(c => c.id === selectedClientId);
                if (client) {
                    newActivityData.entityType = 'client';
                    newActivityData.entityId = client.id;
                    newActivityData.entities = [
                        {
                            id: client.id,
                            type: 'client',
                            displayName: `${client.firstName} ${client.lastName}`
                        }
                    ];
                }
            }

            // Dodanie metadanych dla rozmowy telefonicznej
            if (category === 'call' && selectedClientId) {
                newActivityData.metadata = {
                    callType: 'outgoing',
                    callResult: 'successful',
                    callDuration: '0:00'
                };
            }

            // Zapisanie aktywności
            const addedActivity = await addActivity(newActivityData);
            onActivityAdded(addedActivity);

            // Zamknięcie formularza
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error adding activity:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        <TitleIcon><FaPlus /></TitleIcon>
                        Dodaj nową aktywność
                    </ModalTitle>
                    <CloseButton onClick={onClose}><FaTimes /></CloseButton>
                </ModalHeader>

                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        {isLoading ? (
                            <LoadingState>Ładowanie danych...</LoadingState>
                        ) : (
                            <>
                                <FormGroup>
                                    <Label htmlFor="message">Treść aktywności*</Label>
                                    <Textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Wprowadź treść aktywności..."
                                        required
                                        rows={3}
                                    />
                                </FormGroup>

                                <FormRow>
                                    <FormGroup>
                                        <Label htmlFor="category">
                                            <FaTag /> Kategoria
                                        </Label>
                                        <Select
                                            id="category"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                                        >
                                            {availableCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </Select>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            id="status"
                                            value={status || ''}
                                            onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                                            ))}
                                        </Select>
                                    </FormGroup>
                                </FormRow>

                                <FormRow>
                                    <FormGroup>
                                        <Label htmlFor="employee">
                                            <FaUser /> Autor
                                        </Label>
                                        <Select
                                            id="employee"
                                            value={selectedEmployeeId}
                                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                        >
                                            <option value="">System</option>
                                            {employees.map(employee => (
                                                <option key={employee.id} value={employee.id}>
                                                    {employee.fullName} ({employee.position})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label htmlFor="client">
                                            <FaBell /> Klient (opcjonalnie)
                                        </Label>
                                        <Select
                                            id="client"
                                            value={selectedClientId}
                                            onChange={(e) => setSelectedClientId(e.target.value)}
                                        >
                                            <option value="">Brak powiązanego klienta</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.firstName} {client.lastName}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormGroup>
                                </FormRow>

                                {category === 'notification' && selectedClientId && (
                                    <NotificationInfo>
                                        Ta aktywność zostanie zapisana jako powiadomienie,
                                        ale nie zostanie faktycznie wysłana do klienta. W rzeczywistej aplikacji
                                        możesz tu dodać opcje wysyłki SMS/email.
                                    </NotificationInfo>
                                )}
                            </>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <CancelButton type="button" onClick={onClose}>
                            <FaTimes /> Anuluj
                        </CancelButton>
                        <SaveButton type="submit" disabled={isSaving || !message.trim()}>
                            <FaSave /> {isSaving ? 'Zapisywanie...' : 'Zapisz aktywność'}
                        </SaveButton>
                    </ModalFooter>
                </form>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    max-width: 90%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #34495e;
  display: flex;
  align-items: center;
`;

const TitleIcon = styled.span`
  color: #3498db;
  margin-right: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #34495e;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
`;

const LoadingState = styled.div`
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  flex: 1;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0;
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #34495e;
  margin-bottom: 8px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
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

const NotificationInfo = styled.div`
  background-color: #f8f9fa;
  border-left: 3px solid #3498db;
  padding: 12px 15px;
  margin-top: 10px;
  font-size: 13px;
  color: #34495e;
`;

const ModalFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #7f8c8d;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SaveButton = styled(Button)<{ disabled: boolean }>`
  background-color: ${props => props.disabled ? '#95a5a6' : '#3498db'};
  color: white;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover:not(:disabled) {
    background-color: #2980b9;
  }
`;

export default ActivityForm;