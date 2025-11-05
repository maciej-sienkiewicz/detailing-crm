// src/features/reservations/index.ts
/**
 * Main export file for reservations feature
 */

// Components
export { ReservationForm } from './components/ReservationForm';
export { ReservationFormHeader } from './components/ReservationFormHeader';
export { ReservationContactSection } from './components/ReservationContactSection';
export { ReservationVehicleSection } from './components/ReservationVehicleSection';
export { ReservationScheduleSection } from './components/ReservationScheduleSection';
export { ReservationServicesSection } from './components/ReservationServicesSection';
export { ReservationNotesSection } from './components/ReservationNotesSection';
export { ReservationFormActions } from './components/ReservationFormActions';

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