import React from 'react';
import Modal from '../../../components/common/Modal';
import AppointmentDetails from '../../../components/calendar/AppointmentDetails';
import {useCalendarPageContext} from '../CalendarPageProvider';

export const CalendarPageModals: React.FC = () => {
    const { modals, actions } = useCalendarPageContext();

    return (
        <>
            {/* Appointment Details Modal */}
            {modals.selectedAppointment && (
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
                    />
                </Modal>
            )}
        </>
    );
};