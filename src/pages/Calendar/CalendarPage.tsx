import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AppointmentCalendar from '../../components/calendar/Calendar';
import Modal from '../../components/common/Modal';
import AppointmentForm from '../../components/calendar/AppointmentForm';
import { Appointment } from '../../types';
import { fetchAppointments, addAppointment } from '../../api/mocks/appointmentMocks';

const CalendarPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Stan dla formularza nowego wydarzenia
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Pobieranie danych przy montowaniu komponentu
    useEffect(() => {
        const loadAppointments = async () => {
            try {
                setLoading(true);
                const data = await fetchAppointments();
                setAppointments(data);
                setError(null);
            } catch (err) {
                setError('Nie udało się załadować danych kalendarza.');
                console.error('Error fetching appointments:', err);
            } finally {
                setLoading(false);
            }
        };

        loadAppointments();
    }, []);

    // Obsługa wyboru wizyty
    const handleAppointmentSelect = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        // Tutaj można by otworzyć modal ze szczegółami wizyty
        console.log('Selected appointment:', appointment);
    };

    // Obsługa zmiany zakresu kalendarza (np. zmiana miesiąca)
    const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
        // Tutaj można by pobrać nowe dane na podstawie wybranego zakresu dat
        console.log('Range changed:', range);
    };

    // Obsługa tworzenia nowej wizyty
    const handleAppointmentCreate = (start: Date, end: Date) => {
        setSelectedDate(start);
        setShowNewAppointmentModal(true);
    };

    // Obsługa kliknięcia przycisku "Nowa wizyta"
    const handleNewAppointmentClick = () => {
        setSelectedDate(new Date());
        setShowNewAppointmentModal(true);
    };

    // Zapisywanie nowej wizyty
    const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        try {
            const newAppointment = await addAppointment(appointmentData);
            setAppointments([...appointments, newAppointment]);
            setShowNewAppointmentModal(false);
        } catch (err) {
            console.error('Error saving appointment:', err);
            setError('Nie udało się zapisać wizyty.');
        }
    };

    return (
        <CalendarPageContainer>
            <CalendarHeader>
                <h1>Kalendarz</h1>
                <CalendarActions>
                    <Button primary onClick={handleNewAppointmentClick}>+ Nowa wizyta</Button>
                </CalendarActions>
            </CalendarHeader>

            {loading && <LoadingIndicator>Ładowanie danych...</LoadingIndicator>}

            {error && <ErrorMessage>{error}</ErrorMessage>}

            {!loading && !error && (
                <AppointmentCalendar
                    events={appointments}
                    onEventSelect={handleAppointmentSelect}
                    onRangeChange={handleRangeChange}
                    onEventCreate={handleAppointmentCreate}
                />
            )}

            {/* Modal formularza nowej wizyty */}
            <Modal
                isOpen={showNewAppointmentModal}
                onClose={() => setShowNewAppointmentModal(false)}
                title="Nowe wydarzenie"
            >
                <AppointmentForm
                    selectedDate={selectedDate}
                    onSave={handleSaveAppointment}
                    onCancel={() => setShowNewAppointmentModal(false)}
                />
            </Modal>
        </CalendarPageContainer>
    );
};

const CalendarPageContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const CalendarHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
        margin: 0;
        font-size: 24px;
        color: #34495e;
    }
`;

const CalendarActions = styled.div`
    display: flex;
    gap: 10px;
`;

const Button = styled.button<{ primary?: boolean }>`
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid;

    ${props => props.primary ? `
    background-color: #3498db;
    color: white;
    border-color: #3498db;
    
    &:hover {
      background-color: #2980b9;
      border-color: #2980b9;
    }
  ` : `
    background-color: white;
    color: #3498db;
    border-color: #3498db;
    
    &:hover {
      background-color: #f5f5f5;
    }
  `}
`;

const LoadingIndicator = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 16px;
    color: #7f8c8d;
`;

const ErrorMessage = styled.div`
    padding: 16px;
    background-color: #ffebee;
    color: #e53935;
    border-radius: 4px;
    margin-bottom: 20px;
`;

export default CalendarPage;