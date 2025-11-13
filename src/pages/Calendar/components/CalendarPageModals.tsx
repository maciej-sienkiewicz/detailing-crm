// src/pages/Calendar/components/CalendarPageModals.tsx - COMPLETE IMPLEMENTATION
import React from 'react';
import Modal from '../../../components/common/Modal';
import AppointmentDetails from '../../../components/calendar/AppointmentDetails';
import { ReservationDetails } from '../../../features/reservations/components/ReservationDetails/ReservationDetails';
import { useCalendarPageContext } from '../CalendarPageProvider';
import { isReservationAppointment } from '../../../services/CalendarIntegrationService';

export const CalendarPageModals: React.FC = () => {
    const { modals, actions } = useCalendarPageContext();

    // Determine if selected appointment is a reservation
    const isReservation = modals.selectedAppointment
        ? isReservationAppointment(modals.selectedAppointment.id)
        : false;

    // Show reservation modal
    if (modals.selectedAppointment && isReservation && modals.selectedReservation) {
        return (
            <Modal
                isOpen={modals.showAppointmentDetailsModal}
                onClose={() => modals.setShowAppointmentDetailsModal(false)}
                title="Szczegóły rezerwacji"
            >
                <ReservationDetails
                    reservation={modals.selectedReservation}
                    onStartVisit={actions.handleStartVisitFromReservation}
                    onEdit={actions.handleEditReservation}
                    onClose={() => modals.setShowAppointmentDetailsModal(false)}
                />
            </Modal>
        );
    }

    // Show protocol/recurring event modal
    if (modals.selectedAppointment && !isReservation) {
        return (
            <Modal
                isOpen={modals.showAppointmentDetailsModal}
                onClose={() => modals.setShowAppointmentDetailsModal(false)}
                title="Szczegóły wizyty"
            >
                <AppointmentDetails
                    appointment={modals.selectedAppointment}
                    onEdit={actions.handleEditClick}
                    onDelete={actions.handleDeleteAppointment}
                    onStatusChange={actions.handleStatusChange}
                    onCreateProtocol={actions.handleCreateProtocol}
                    onConvertToVisit={actions.handleConvertToVisit}
                />
            </Modal>
        );
    }

    // No modal to show
    return null;
};