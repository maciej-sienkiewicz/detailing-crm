// src/pages/Calendar/CalendarPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AppointmentCalendar from '../../components/calendar/Calendar'; // Nowy komponent kalendarza
import Modal from '../../components/common/Modal';
import AppointmentForm from '../../components/calendar/AppointmentForm';
import AppointmentDetails from '../../components/calendar/AppointmentDetails';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import {Appointment, AppointmentStatus, ProtocolStatus} from '../../types';
import {
    fetchAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    updateAppointmentStatus
} from '../../api/mocks/appointmentMocks';
import { fetchProtocolsAsAppointments } from '../../services/ProtocolCalendarService';
import { mapAppointmentToProtocol } from '../../services/ProtocolMappingService';

const CalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Stan dla formularza nowego wydarzenia
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
    const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
    const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
    const [showNewVisitConfirmation, setShowNewVisitConfirmation] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());

    // Pobieranie danych przy montowaniu komponentu
    useEffect(() => {
        const loadAppointmentsAndProtocols = async () => {
            try {
                setLoading(true);

                // Równoległe pobieranie wizyt i protokołów
                const [appointmentsData, protocolsData] = await Promise.all([
                    fetchAppointments(),
                    fetchProtocolsAsAppointments()
                ]);

                // Łączenie danych
                const combinedData = [...appointmentsData, ...protocolsData];
                setAppointments(combinedData);
                setError(null);
            } catch (err) {
                setError('Nie udało się załadować danych kalendarza.');
                console.error('Error fetching appointments or protocols:', err);
            } finally {
                setLoading(false);
            }
        };

        loadAppointmentsAndProtocols();
    }, []);

    // Obsługa wyboru wizyty
    const handleAppointmentSelect = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowAppointmentDetailsModal(true);
    };

    // Obsługa tworzenia protokołu z wizyty
    const handleCreateProtocol = () => {
        if (!selectedAppointment) return;

        // Jeśli to już jest protokół, nie powinniśmy tworzyć nowego
        if ((selectedAppointment.isProtocol && (selectedAppointment.status as unknown as ProtocolStatus) == ProtocolStatus.SCHEDULED) ) {
            navigate(`/orders`, {
                state: {
                    editProtocolId: selectedAppointment.id,
                    isOpenProtocolAction: true
                }
            })
            return;
        }

        if (selectedAppointment.isProtocol) {
            setError('To wydarzenie jest już protokołem.');
            return;
        }


        try {
            // Mapowanie danych wizyty na dane protokołu
            const protocolData = mapAppointmentToProtocol(selectedAppointment);

            // Zamykamy modal szczegółów
            setShowAppointmentDetailsModal(false);

            // Przekierowujemy do strony tworzenia protokołu z przygotowanymi danymi
            navigate('/orders/car-reception?createFromAppointment=true', {
                state: {
                    protocolData,
                    appointmentId: selectedAppointment.id
                }
            });
        } catch (err) {
            console.error('Error creating protocol from appointment:', err);
            setError('Nie udało się utworzyć protokołu z wizyty.');
        }
    };

    // Obsługa zmiany zakresu kalendarza
    const handleRangeChange = (range: { start: Date; end: Date }) => {
        // Tutaj można by pobrać nowe dane na podstawie wybranego zakresu dat
        console.log('Range changed:', range);
    };

    // Obsługa tworzenia nowej wizyty
    const handleAppointmentCreate = (start: Date, end: Date) => {
        setSelectedDate(start);

        const correctedEndDate = new Date(end);
        correctedEndDate.setDate(correctedEndDate.getDate() - 1);

        setSelectedEndDate(correctedEndDate);
        setShowNewVisitConfirmation(true);

        console.log('Zakres dat:', {
            start: start.toISOString(),
            originalEnd: end.toISOString(),
            correctedEnd: correctedEndDate.toISOString()
        });
    };

    // Obsługa potwierdzenia tworzenia nowej wizyty
    const handleConfirmNewVisit = () => {
        setShowNewVisitConfirmation(false);

        // Tworzymy datę początkową w lokalnej strefie czasowej,
        // aby uniknąć problemów ze strefami czasowymi
        const localStartDate = new Date(selectedDate);
        localStartDate.setHours(12, 0, 0, 0); // Ustawiamy godzinę na 12:00

        // Tworzymy datę końcową w lokalnej strefie czasowej
        const localEndDate = new Date(selectedEndDate);
        localEndDate.setHours(23, 59, 0, 0); // Ustawiamy na koniec dnia

        navigate('/orders', {
            state: {
                startDate: localStartDate.toISOString(), // Przekazujemy datę ISO z godziną 12:00
                endDate: localEndDate.toISOString(), // Przekazujemy datę ISO z godziną 23:59
                isFullProtocol: false
            }
        });
    };

    // Obsługa anulowania tworzenia nowej wizyty
    const handleCancelNewVisit = () => {
        setShowNewVisitConfirmation(false);
        // Opcjonalnie możemy tutaj otworzyć standardowy formularz
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

    // Obsługa edycji wizyty
    const handleEditClick = () => {
        // Protokołów nie można edytować z poziomu kalendarza
        if ((selectedAppointment?.isProtocol && (selectedAppointment?.status as unknown as ProtocolStatus) == ProtocolStatus.SCHEDULED)) {
            navigate(`/orders`, {
                state: {
                    editProtocolId: selectedAppointment.id,
                    isOpenProtocolAction: false,
                    isFullProtocol: false
                }
            })
            return;
        }

        setShowAppointmentDetailsModal(false);
        setShowEditAppointmentModal(true);
    };

    // Zapisywanie edytowanej wizyty
    const handleUpdateAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        if (!selectedAppointment) return;

        try {
            const updatedAppointment = await updateAppointment({
                ...appointmentData,
                id: selectedAppointment.id,
            } as Appointment);

            setAppointments(appointments.map(appointment =>
                appointment.id === updatedAppointment.id ? updatedAppointment : appointment
            ));
            setShowEditAppointmentModal(false);
            setShowAppointmentDetailsModal(true);
        } catch (err) {
            console.error('Error updating appointment:', err);
            setError('Nie udało się zaktualizować wizyty.');
        }
    };

    // Usuwanie wizyty
    const handleDeleteAppointment = async () => {
        if (!selectedAppointment) return;

        // Nie pozwalamy na usuwanie protokołów z kalendarza
        if (selectedAppointment.isProtocol) {
            setError('Nie można usunąć protokołu z poziomu kalendarza. Przejdź do widoku protokołów.');
            return;
        }

        if (window.confirm('Czy na pewno chcesz usunąć tę wizytę?')) {
            try {
                await deleteAppointment(selectedAppointment.id);
                setAppointments(appointments.filter(appointment => appointment.id !== selectedAppointment.id));
                setShowAppointmentDetailsModal(false);
                setSelectedAppointment(null);
            } catch (err) {
                console.error('Error deleting appointment:', err);
                setError('Nie udało się usunąć wizyty.');
            }
        }
    };

    // Obsługa zmiany statusu wizyty
    const handleStatusChange = async (newStatus: AppointmentStatus) => {
        if (!selectedAppointment) return;

        try {
            // Dla protokołów, aktualizacja statusu wymaga dodatkowej obsługi
            if (selectedAppointment.isProtocol) {
                // Tu powinno być wywołanie API do aktualizacji statusu protokołu
                // Dla uproszczenia tylko aktualizujemy lokalnie
                const updatedAppointment = {
                    ...selectedAppointment,
                    status: newStatus,
                    statusUpdatedAt: new Date().toISOString()
                };

                setAppointments(appointments.map(appointment =>
                    appointment.id === updatedAppointment.id ? updatedAppointment : appointment
                ));
                setSelectedAppointment(updatedAppointment);
                return;
            }

            // Standardowa obsługa dla zwykłych wizyt
            const updatedAppointment = await updateAppointmentStatus(selectedAppointment.id, newStatus);
            setAppointments(appointments.map(appointment =>
                appointment.id === updatedAppointment.id ? updatedAppointment : appointment
            ));
            setSelectedAppointment(updatedAppointment);
        } catch (err) {
            console.error('Error updating appointment status:', err);
            setError('Nie udało się zmienić statusu wizyty.');
        }
    };

    return (
        <CalendarPageContainer>
            <CalendarHeader>
                <h1>Kalendarz</h1>
                <CalendarActions>
                    <Button primary onClick={handleNewAppointmentClick}>
                        Nowa wizyta
                    </Button>
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
                title="Rezerwacja wizyty"
            >
                <AppointmentForm
                    selectedDate={selectedDate}
                    onSave={handleSaveAppointment}
                    onCancel={() => setShowNewAppointmentModal(false)}
                />
            </Modal>

            {/* Modal szczegółów wizyty */}
            {selectedAppointment && (
                <Modal
                    isOpen={showAppointmentDetailsModal}
                    onClose={() => setShowAppointmentDetailsModal(false)}
                    title="Szczegóły wizyty"
                >
                    <AppointmentDetails
                        appointment={selectedAppointment}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteAppointment}
                        onStatusChange={handleStatusChange}
                        onCreateProtocol={handleCreateProtocol}
                    />
                </Modal>
            )}

            {/* Modal edycji wizyty */}
            {selectedAppointment && selectedAppointment.status !== AppointmentStatus.IN_PROGRESS && (
                <Modal
                    isOpen={showEditAppointmentModal}
                    onClose={() => setShowEditAppointmentModal(false)}
                    title="Edytuj wizytę"
                >
                    <AppointmentForm
                        selectedDate={selectedAppointment.start}
                        editingAppointment={selectedAppointment}
                        onSave={handleUpdateAppointment}
                        onCancel={() => {
                            setShowEditAppointmentModal(false);
                            setShowAppointmentDetailsModal(true);
                        }}
                    />
                </Modal>
            )}

            {/* Dialog potwierdzenia nowej wizyty */}
            <ConfirmationDialog
                isOpen={showNewVisitConfirmation}
                title="Rezerwacja wizyty"
                message="Czy chcesz zarezerwować wizytę?"
                confirmText="Tak"
                cancelText="Nie, dodaję inne wydarzenie"
                onConfirm={handleConfirmNewVisit}
                onCancel={handleCancelNewVisit}
            />
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