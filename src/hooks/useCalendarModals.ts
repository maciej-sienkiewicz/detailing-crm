// src/pages/Calendar/hooks/useCalendarModals.ts
import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Appointment, AppointmentStatus, ProtocolStatus} from "../types";
import {useToast} from "../components/common/Toast/Toast";

interface UseCalendarModalsProps {
    updateAppointmentData: (appointment: Appointment) => Promise<void>;
    removeAppointment: (id: string) => Promise<void>;
    changeAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
}

export const useCalendarModals = ({
                                      updateAppointmentData,
                                      removeAppointment,
                                      changeAppointmentStatus
                                  }: UseCalendarModalsProps) => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Modal states
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
    const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);

    const selectAppointment = useCallback((appointment: Appointment) => {
        if (!appointment?.id) {
            showToast('error', 'Nieprawidłowe dane wizyty', 3000);
            return;
        }
        setSelectedAppointment(appointment);
        setShowAppointmentDetailsModal(true);
    }, [showToast]);

    const handleCreateProtocol = useCallback(async () => {
        if (!selectedAppointment) {
            showToast('error', 'Nie wybrano wizyty', 3000);
            return;
        }

        if (selectedAppointment.isProtocol &&
            (selectedAppointment.status as unknown as ProtocolStatus) === ProtocolStatus.SCHEDULED) {
            navigate(`/visits`, {
                state: {
                    editProtocolId: selectedAppointment.id,
                    isOpenProtocolAction: true
                }
            });
            return;
        }

        if (selectedAppointment.isProtocol) {
            showToast('info', 'To wydarzenie jest już protokołem', 3000);
            return;
        }
    }, [selectedAppointment, navigate, showToast]);

    const handleEditClick = useCallback(() => {
        if (!selectedAppointment) return;

        if (selectedAppointment.isProtocol &&
            (selectedAppointment.status as unknown as ProtocolStatus) === ProtocolStatus.SCHEDULED) {
            navigate(`/visits`, {
                state: {
                    editProtocolId: selectedAppointment.id,
                    isOpenProtocolAction: false,
                    isFullProtocol: false
                }
            });
            return;
        }

        setShowAppointmentDetailsModal(false);
        setShowEditAppointmentModal(true);
    }, [selectedAppointment, navigate]);

    const handleUpdateAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>) => {
        if (!selectedAppointment) return;

        try {
            await updateAppointmentData({
                ...appointmentData,
                id: selectedAppointment.id,
            } as Appointment);

            setSelectedAppointment(prev => prev ? { ...prev, ...appointmentData } : null);
            setShowEditAppointmentModal(false);
            setShowAppointmentDetailsModal(true);
        } catch (err) {
            console.error('Error updating appointment:', err);
        }
    }, [selectedAppointment, updateAppointmentData]);

    const handleDeleteAppointment = useCallback(async () => {
        if (!selectedAppointment) return;

        if (selectedAppointment.isProtocol) {
            showToast('info', 'Protokoły należy usuwać z widoku protokołów', 4000);
            return;
        }

        const confirmDelete = window.confirm(
            `Czy na pewno chcesz usunąć wizytę "${selectedAppointment.title}"?\n\nTa akcja jest nieodwracalna.`
        );

        if (!confirmDelete) return;

        try {
            await removeAppointment(selectedAppointment.id);
            setShowAppointmentDetailsModal(false);
            setSelectedAppointment(null);
        } catch (err) {
            console.error('Error deleting appointment:', err);
        }
    }, [selectedAppointment, removeAppointment, showToast]);

    const handleStatusChange = useCallback(async (newStatus: AppointmentStatus) => {
        if (!selectedAppointment) return;

        try {
            if (selectedAppointment.isProtocol) {
                const updatedAppointment = {
                    ...selectedAppointment,
                    status: newStatus,
                    statusUpdatedAt: new Date().toISOString()
                };
                setSelectedAppointment(updatedAppointment);
                showToast('info', 'Status protokołu został zaktualizowany', 3000);
                return;
            }

            await changeAppointmentStatus(selectedAppointment.id, newStatus);
            setSelectedAppointment(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (err) {
            console.error('Error updating appointment status:', err);
        }
    }, [selectedAppointment, changeAppointmentStatus, showToast]);

    const closeModals = useCallback(() => {
        setShowAppointmentDetailsModal(false);
        setShowEditAppointmentModal(false);
        setSelectedAppointment(null);
    }, []);

    return {
        selectedAppointment,
        showAppointmentDetailsModal,
        showEditAppointmentModal,
        selectAppointment,
        handleCreateProtocol,
        handleEditClick,
        handleUpdateAppointment,
        handleDeleteAppointment,
        handleStatusChange,
        closeModals,
        setShowAppointmentDetailsModal,
        setShowEditAppointmentModal
    };
};