import React from 'react';
import Modal from '../../../components/common/Modal';
import AppointmentForm from '../../../components/calendar/AppointmentForm';
import AppointmentDetails from '../../../components/calendar/AppointmentDetails';
import { useCalendarPageContext } from '../CalendarPageProvider';
import { AppointmentStatus } from '../../../types';

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

            {/* Edit Appointment Modal */}
            {modals.selectedAppointment && modals.selectedAppointment.status !== AppointmentStatus.IN_PROGRESS && (
                <Modal
                    isOpen={modals.showEditAppointmentModal}
                    onClose={() => modals.setShowEditAppointmentModal(false)}
                    title="Edycja wizyty"
                >
                    <AppointmentForm
                        selectedDate={modals.selectedAppointment.start}
                        editingAppointment={modals.selectedAppointment}
                        onSave={actions.handleUpdateAppointment}
                        onCancel={() => {
                            modals.setShowEditAppointmentModal(false);
                            modals.setShowAppointmentDetailsModal(true);
                        }}
                    />
                </Modal>
            )}
        </>
    );
};