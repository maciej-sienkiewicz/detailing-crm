// src/features/reservations/index.ts
/**
 * Main export file for reservations feature
 */

// Components
export { ReservationForm } from './components/ReservationForm/ReservationForm';
export { ReservationFormHeader } from './components/ReservationForm/ReservationFormHeader';
export { ReservationContactSection } from './components/ReservationForm/ReservationContactSection';
export { ReservationVehicleSection } from './components/ReservationForm/ReservationVehicleSection';
export { ReservationScheduleSection } from './components/ReservationForm/ReservationScheduleSection';
export { ReservationServicesSection } from './components/ReservationForm/ReservationServicesSection';
export { ReservationNotesSection } from './components/ReservationForm/ReservationNotesSection';
export { ReservationFormActions } from './components/ReservationForm/ReservationFormActions';
export { ReservationDetails } from './components/ReservationDetails/ReservationDetails';

// Hooks
export { useReservationForm } from './hooks/useReservationForm';
export { useReservationSubmit } from './hooks/useReservationSubmit';
export { useReservationValidation } from './hooks/useReservationValidation';
export { useReservationEdit } from './hooks/useReservationEdit';
export { useFetchReservation } from './hooks/useFetchReservation';

// Types
export type {
    ReservationFormData,
    ReservationFormErrors,
    ReservationFormProps
} from './libs/types';

// Utils
export {
    formatDateForAPI,
    extractDateFromISO,
    extractTimeFromISO,
    formatPhoneNumber,
    isValidPhoneNumber,
    generateReservationTitle
} from './libs/utils';

// API Types
export type {
    Reservation,
    ReservationStatus,
    ReservationService,
    ReservationSelectedServiceInput
} from './api/reservationsApi';