// src/features/reservations/libs/types.ts
/**
 * Types for Reservation Form
 * Lightweight reservation data - no client/vehicle entities created yet
 */

import {ReservationSelectedServiceInput} from "../api/reservationsApi";

/**
 * Form data for creating a reservation
 */
export interface ReservationFormData {
    // Basic Info
    title: string;
    calendarColorId: string;

    // Contact Info (minimal - just phone)
    contactPhone: string;
    contactName?: string;

    // Vehicle Info (minimal - just make and model)
    vehicleMake: string;
    vehicleModel: string;

    // Schedule
    startDate: string; // ISO 8601
    endDate?: string;  // ISO 8601

    // Services
    selectedServices: ReservationSelectedServiceInput[];

    // Notes
    notes?: string;
}

/**
 * Validation errors for the form
 */
export interface ReservationFormErrors {
    title?: string;
    calendarColorId?: string;
    contactPhone?: string;
    contactName?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    startDate?: string;
    endDate?: string;
    selectedServices?: string;
    notes?: string;
}

/**
 * Props for ReservationForm component
 */
export interface ReservationFormProps {
    // Mode
    mode?: 'create' | 'edit';

    // Initial data for edit mode
    initialData?: ReservationFormData;

    // Custom submit handler (for edit mode)
    onSubmit?: (formData: ReservationFormData) => Promise<boolean>;

    // Success callback
    onSuccess?: (reservationId: string) => void;

    // Cancel callback
    onCancel?: () => void;

    // Initial dates (for create mode)
    initialStartDate?: string;
    initialEndDate?: string;

    // External loading state
    loading?: boolean;
}