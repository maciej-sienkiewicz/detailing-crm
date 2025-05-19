// src/components/fleet/FleetCalendar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled, { css } from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FleetRental, FleetRentalStatus, FleetRentalStatusColors } from '../../types/fleetRental';
import { FleetVehicle } from '../../types/fleet';
import { fleetRentalApi } from '../../api/fleetRentalApi';
import { fleetVehicleApi } from '../../api/fleetApi';
import { clientApi } from '../../api/clientsApi';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaCalendarAlt,
    FaCarSide,
    FaUser,
    FaUserClock,
    FaExchangeAlt,
    FaInfoCircle,
    FaChevronRight,
    FaCheck,
    FaTimes,
    FaChevronLeft
} from 'react-icons/fa';

interface FleetCalendarProps {
    selectedVehicleId?: string;
    onRentalClick?: (rentalId: string) => void;
    onDateSelect?: (start: Date, end: Date, vehicleId?: string) => void;
}

interface EventDetails {
    rental: FleetRental;
    vehicleName: string;
    clientName: string;
}

const FleetCalendar: React.FC<FleetCalendarProps> = ({
                                                         selectedVehicleId,
                                                         onRentalClick,
                                                         onDateSelect
                                                     }) => {
    const [rentals, setRentals] = useState<FleetRental[]>([]);
    const [vehicles, setVehicles] = useState<Record<string, { name: string, licensePlate: string }>>({});
    const [clients, setClients] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedView, setSelectedView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
    const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
    const [showEventDetails, setShowEventDetails] = useState<boolean>(false);

    // Pobieranie danych
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Pobierz wszystkie pojazdy
            const vehiclesData = await fleetVehicleApi.fetchVehicles();
            const vehiclesMap: Record<string, { name: string, licensePlate: string }> = {};

            vehiclesData.forEach(vehicle => {
                vehiclesMap[vehicle.id] = {
                    name: `${vehicle.make} ${vehicle.model}`,
                    licensePlate: vehicle.licensePlate
                };
            });

            setVehicles(vehiclesMap);

            // Pobierz wypożyczenia dla wybranego pojazdu lub wszystkie
            let rentalsData: FleetRental[];
            if (selectedVehicleId) {
                rentalsData = await fleetRentalApi.fetchVehicleRentals(selectedVehicleId);
            } else {
                rentalsData = await fleetRentalApi.fetchRentals();
            }

            // Pobierz dane klientów
            const clientsData = await clientApi.fetchClients();
            const clientsMap: Record<string, string> = {};

            clientsData.forEach(client => {
                clientsMap[client.id] = `${client.firstName} ${client.lastName}`;
            });

            setClients(clientsMap);
            setRentals(rentalsData);
        } catch (error) {
            console.error('Error fetching data for calendar:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedVehicleId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Konwersja wypożyczeń na wydarzenia kalendarza
    const rentalEvents = rentals.map(rental => {
        const vehicleName = vehicles[rental.vehicleId]?.name || 'Nieznany pojazd';
        const licensePlate = vehicles[rental.vehicleId]?.licensePlate || '';

        return {
            id: rental.id,
            title: `${vehicleName} (${licensePlate})`,
            start: rental.startDate,
            end: rental.actualEndDate || rental.plannedEndDate,
            backgroundColor: FleetRentalStatusColors[rental.status],
            borderColor: rental.status === FleetRentalStatus.ACTIVE ? '#27ae60' : undefined,
            textColor: 'white',
            extendedProps: {
                rental: rental,
                vehicleName: vehicleName,
                licensePlate: licensePlate,
                clientName: rental.clientId ? clients[rental.clientId] || 'Nieznany klient' : 'Firma'
            }
        };
    });

    // Obsługa kliknięcia w wydarzenie
    const handleEventClick = (info: any) => {
        const rental = info.event.extendedProps.rental;
        const vehicleName = info.event.extendedProps.vehicleName;
        const clientName = info.event.extendedProps.clientName;

        setSelectedEvent({
            rental,
            vehicleName,
            clientName
        });

        setShowEventDetails(true);
    };

    // Obsługa wyboru daty
    const handleDateSelect = (info: any) => {
        if (onDateSelect) {
            onDateSelect(info.start, info.end, selectedVehicleId);
        }
    };

    // Zamknięcie szczegółów wydarzenia
    const handleCloseDetails = () => {
        setShowEventDetails(false);
    };

    // Przejdź do szczegółów wypożyczenia
    const handleViewDetails = () => {
        if (selectedEvent && onRentalClick) {
            onRentalClick(selectedEvent.rental.id);
        }
    };

    return (
        <CalendarContainer>
            <CalendarHeader>
                <LeftSection>
                    <CalendarTitle>
                        <FaCalendarAlt />
                        <span>Kalendarz wypożyczeń</span>
                    </CalendarTitle>
                </LeftSection>

                <RightSection>
                    <ViewToggle>
                        <ViewButton
                            active={selectedView === 'dayGridMonth'}
                            onClick={() => setSelectedView('dayGridMonth')}
                        >
                            Miesiąc
                        </ViewButton>
                        <ViewButton
                            active={selectedView === 'timeGridWeek'}
                            onClick={() => setSelectedView('timeGridWeek')}
                        >
                            Tydzień
                        </ViewButton>
                    </ViewToggle>

                    <RefreshButton onClick={() => fetchData()}>
                        Odśwież dane
                    </RefreshButton>
                </RightSection>
            </CalendarHeader>

            <CalendarContent>
                <LegendContainer>
                    <LegendItem color={FleetRentalStatusColors[FleetRentalStatus.SCHEDULED]}>
                        Zaplanowane
                    </LegendItem>
                    <LegendItem color={FleetRentalStatusColors[FleetRentalStatus.ACTIVE]}>
                        Trwające
                    </LegendItem>
                    <LegendItem color={FleetRentalStatusColors[FleetRentalStatus.COMPLETED]}>
                        Zakończone
                    </LegendItem>
                    <LegendItem color={FleetRentalStatusColors[FleetRentalStatus.CANCELLED]}>
                        Anulowane
                    </LegendItem>
                </LegendContainer>

                {isLoading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie kalendarza wypożyczeń...</LoadingText>
                    </LoadingContainer>
                ) : (
                    <FullCalendarWrapper>
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView={selectedView}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: ''
                            }}
                            events={rentalEvents}
                            eventClick={handleEventClick}
                            selectable={true}
                            selectMirror={true}
                            select={handleDateSelect}
                            height="auto"
                            locale="pl"
                            buttonText={{
                                today: 'Dzisiaj'
                            }}
                            firstDay={1}  // Tydzień zaczyna się od poniedziałku
                            dayMaxEvents={3}
                            businessHours={{
                                daysOfWeek: [1, 2, 3, 4, 5],  // Poniedziałek - piątek
                                startTime: '08:00',
                                endTime: '18:00',
                            }}
                        />
                    </FullCalendarWrapper>
                )}
            </CalendarContent>

            {showEventDetails && selectedEvent && (
                <EventDetailsModal onClick={handleCloseDetails}>
                    <EventDetailsContent onClick={(e) => e.stopPropagation()}>
                        <EventDetailsHeader status={selectedEvent.rental.status}>
                            <EventDetailsTitle>
                                <FaExchangeAlt />
                                <span>Szczegóły wypożyczenia</span>
                            </EventDetailsTitle>
                            <CloseButton onClick={handleCloseDetails}>
                                <FaTimes />
                            </CloseButton>
                        </EventDetailsHeader>

                        <EventDetailsBody>
                            <EventDetailsRow>
                                <EventDetailsLabel>
                                    <FaCarSide />
                                    <span>Pojazd:</span>
                                </EventDetailsLabel>
                                <EventDetailsValue>{selectedEvent.vehicleName}</EventDetailsValue>
                            </EventDetailsRow>

                            <EventDetailsRow>
                                <EventDetailsLabel>
                                    <FaUser />
                                    <span>Klient:</span>
                                </EventDetailsLabel>
                                <EventDetailsValue>{selectedEvent.clientName}</EventDetailsValue>
                            </EventDetailsRow>

                            <EventDetailsRow>
                                <EventDetailsLabel>
                                    <FaUserClock />
                                    <span>Termin:</span>
                                </EventDetailsLabel>
                                <EventDetailsValue>
                                    {format(new Date(selectedEvent.rental.startDate), 'dd.MM.yyyy', { locale: pl })} -
                                    {selectedEvent.rental.actualEndDate
                                        ? format(new Date(selectedEvent.rental.actualEndDate), ' dd.MM.yyyy', { locale: pl })
                                        : format(new Date(selectedEvent.rental.plannedEndDate), ' dd.MM.yyyy', { locale: pl })}
                                </EventDetailsValue>
                            </EventDetailsRow>

                            <EventDetailsRow>
                                <EventDetailsLabel>
                                    <FaInfoCircle />
                                    <span>Status:</span>
                                </EventDetailsLabel>
                                <EventStatusBadge status={selectedEvent.rental.status} />
                            </EventDetailsRow>

                            {selectedEvent.rental.contractNumber && (
                                <EventDetailsRow>
                                    <EventDetailsLabel>
                                        <FaInfoCircle />
                                        <span>Nr umowy:</span>
                                    </EventDetailsLabel>
                                    <EventDetailsValue>{selectedEvent.rental.contractNumber}</EventDetailsValue>
                                </EventDetailsRow>
                            )}
                        </EventDetailsBody>

                        <EventDetailsFooter>
                            <EventActionButton onClick={handleViewDetails}>
                                <FaChevronRight />
                                <span>Przejdź do szczegółów</span>
                            </EventActionButton>
                        </EventDetailsFooter>
                    </EventDetailsContent>
                </EventDetailsModal>
            )}
        </CalendarContainer>
    );
};

const CalendarContainer = styled.div`
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #eaedf0;
`;

const CalendarHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(135deg, #f9f9f9, #f5f5f5);
    border-bottom: 1px solid #eaedf0;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
`;

const LeftSection = styled.div`
    display: flex;
    align-items: center;
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const CalendarTitle = styled.h2`
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
    gap: 10px;

    svg {
        color: #3498db;
    }
`;

const ViewToggle = styled.div`
    display: flex;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
`;

const ViewButton = styled.button<{ active: boolean }>`
    padding: 8px 16px;
    border: none;
    font-weight: 500;
    background-color: ${props => props.active ? '#3498db' : 'white'};
    color: ${props => props.active ? 'white' : '#555'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${props => props.active ? '#2980b9' : '#f5f7fa'};
    }

    &:first-child {
        border-right: 1px solid #e0e0e0;
    }
`;

const RefreshButton = styled.button`
    padding: 8px 16px;
    border: 1px solid #3498db;
    border-radius: 6px;
    background-color: transparent;
    color: #3498db;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: #ebf5fb;
    }
`;

const CalendarContent = styled.div`
    padding: 20px;
`;

const LegendContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
`;

const LegendItem = styled.div<{ color: string }>`
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #555;

    &::before {
        content: '';
        display: block;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        background-color: ${props => props.color};
        margin-right: 8px;
    }
`;

const FullCalendarWrapper = styled.div`
    .fc-day-today {
        background-color: #f7fbff !important;
    }

    .fc-col-header-cell {
        background-color: #f5f7fa;
        font-weight: 600;
    }

    .fc-event {
        border-radius: 4px;
        padding: 2px 4px;
        font-size: 12px;
        border-left-width: 3px;
        cursor: pointer;
        transition: transform 0.1s ease;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    }

    .fc-button-primary {
        background-color: #3498db;
        border-color: #2980b9;

        &:hover {
            background-color: #2980b9;
            border-color: #2980b9;
        }
    }

    .fc-button-primary:not(:disabled):active,
    .fc-button-primary:not(:disabled).fc-button-active {
        background-color: #2c3e50;
        border-color: #2c3e50;
    }

    .fc-daygrid-day-number,
    .fc-timegrid-slot-label-cushion {
        color: #555;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 400px;
    color: #7f8c8d;
    gap: 16px;
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: #7f8c8d;
`;

const EventDetailsModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
`;

const EventDetailsContent = styled.div`
    background-color: white;
    width: 100%;
    max-width: 480px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
`;

const EventDetailsHeader = styled.div<{ status: FleetRentalStatus }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background-color: ${props => FleetRentalStatusColors[props.status]};
    color: white;
`;

const EventDetailsTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 18px;
    font-weight: 500;

    svg {
        font-size: 16px;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;

const EventDetailsBody = styled.div`
    padding: 20px;
`;

const EventDetailsRow = styled.div`
    display: flex;
    margin-bottom: 16px;
    align-items: center;
`;

const EventDetailsLabel = styled.div`
    width: 100px;
    font-size: 14px;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
        color: #3498db;
        font-size: 14px;
    }
`;

const EventDetailsValue = styled.div`
    flex: 1;
    font-size: 14px;
    color: #2c3e50;
    font-weight: 500;
`;

const EventStatusBadge = styled.div<{ status: FleetRentalStatus }>`
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    background-color: ${props => FleetRentalStatusColors[props.status]};
    color: white;
    font-size: 12px;
    font-weight: 500;
`;

const EventDetailsFooter = styled.div`
    padding: 16px 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
`;

// Dokończenie komponentu FleetCalendar

const EventActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #2980b9;
  }
  
  svg {
    font-size: 12px;
  }
`;

export default FleetCalendar;