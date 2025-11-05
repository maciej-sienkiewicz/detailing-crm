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

// Hooks
export { useReservationForm } from './hooks/useReservationForm';
export { useReservationSubmit } from './hooks/useReservationSubmit';
export { useReservationValidation } from './hooks/useReservationValidation';

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