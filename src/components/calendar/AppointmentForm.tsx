import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Appointment, AppointmentStatus, AppointmentStatusLabels } from '../../types';

interface AppointmentFormProps {
    selectedDate: Date;
    onSave: (appointment: Omit<Appointment, 'id'>) => void;
    onCancel: () => void;
    editingAppointment?: Appointment | null;
}

type EventType = 'reservation' | 'reminder';

const AppointmentForm: React.FC<AppointmentFormProps> = ({
                                                             selectedDate,
                                                             onSave,
                                                             onCancel,
                                                             editingAppointment = null
                                                         }) => {
    const [eventType, setEventType] = useState<EventType>('reservation');
    const [title, setTitle] = useState('');
    const [fullName, setFullName] = useState('');
    const [endDate, setEndDate] = useState<string>('');
    const [note, setNote] = useState('');
    const [responsiblePerson, setResponsiblePerson] = useState('');
    const [status, setStatus] = useState<AppointmentStatus>(AppointmentStatus.PENDING_APPROVAL); // Domyślny status

    // Inicjalizacja daty końcowej na ten sam dzień co data początkowa lub z edytowanej wizyty
    useEffect(() => {
        if (editingAppointment) {
            setTitle(editingAppointment.title);
            setFullName(editingAppointment.customerId || '');
            setEndDate(format(editingAppointment.end, 'yyyy-MM-dd'));
            setNote(editingAppointment.notes || '');
            setStatus(editingAppointment.status);
            setEventType(editingAppointment.serviceType as EventType);
        } else {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            setEndDate(formattedDate);
        }
    }, [selectedDate, editingAppointment]);

    const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEventType(e.target.value as EventType);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value as AppointmentStatus);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const startTime = new Date(selectedDate);
        startTime.setHours(8, 0, 0); // Domyślnie ustawiamy na 8:00

        const endTime = new Date(endDate);
        endTime.setHours(16, 0, 0); // Domyślnie ustawiamy na 16:00

        const commonFields = {
            title,
            start: editingAppointment ? editingAppointment.start : startTime,
            end: editingAppointment ? new Date(endDate) : endTime,
            notes: note,
            serviceType: eventType,
            status: status
        };

        if (eventType === 'reservation') {
            onSave({
                ...commonFields,
                customerId: fullName, // Tymczasowo używamy fullName jako customerId
            });
        } else {
            onSave({
                ...commonFields,
                customerId: responsiblePerson, // Tymczasowo używamy responsiblePerson jako customerId
            });
        }
    };

    return (
        <FormContainer onSubmit={handleSubmit}>
            <FormGroup>
                <Label htmlFor="eventType">Typ wydarzenia</Label>
                <Select
                    id="eventType"
                    value={eventType}
                    onChange={handleEventTypeChange}
                >
                    <option value="reservation">Rezerwacja</option>
                    <option value="reminder">Przypomnienie</option>
                </Select>
            </FormGroup>

            <FormGroup>
                <Label htmlFor="title">Nazwa wydarzenia</Label>
                <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="status">Status wizyty</Label>
                <Select
                    id="status"
                    value={status}
                    onChange={handleStatusChange}
                >
                    {Object.entries(AppointmentStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </Select>
            </FormGroup>

            {eventType === 'reservation' ? (
                <>
                    <FormGroup>
                        <Label htmlFor="fullName">Imię i nazwisko</Label>
                        <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="endDate">Data zakończenia</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="note">Notatka</Label>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                        />
                    </FormGroup>
                </>
            ) : (
                <>
                    <FormGroup>
                        <Label htmlFor="note">Notatka</Label>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="responsiblePerson">Osoba odpowiedzialna</Label>
                        <Input
                            id="responsiblePerson"
                            type="text"
                            value={responsiblePerson}
                            onChange={(e) => setResponsiblePerson(e.target.value)}
                            required
                        />
                    </FormGroup>
                </>
            )}

            <ButtonGroup>
                <Button type="button" onClick={onCancel} secondary>
                    Anuluj
                </Button>
                <Button type="submit" primary>
                    {editingAppointment ? 'Aktualizuj' : 'Zapisz'}
                </Button>
            </ButtonGroup>
        </FormContainer>
    );
};

const FormContainer = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #333;
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

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
`;

const Button = styled.button<{ primary?: boolean; secondary?: boolean }>`
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid;

    ${props => props.primary && `
    background-color: #3498db;
    color: white;
    border-color: #3498db;
    
    &:hover {
      background-color: #2980b9;
      border-color: #2980b9;
    }
  `}

    ${props => props.secondary && `
    background-color: white;
    color: #333;
    border-color: #ddd;
    
    &:hover {
      background-color: #f5f5f5;
    }
  `}
`;

export default AppointmentForm;