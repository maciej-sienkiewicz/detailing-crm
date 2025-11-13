// src/features/reservations/libs/dateUtils.ts
/**
 * Legacy date utilities - maintained for backward compatibility
 * New code should use dateParser.ts instead
 */

import {
    parseBackendDate,
    formatDateForBackend,
    backendDateToISO,
    extractDateFromISO,
    extractTimeFromISO
} from './dateParser';

// Re-export with original names for backward compatibility
export const parseDateFromBackend = parseBackendDate;
export const formatDateForAPI = formatDateForBackend;
export const extractDate = extractDateFromISO;
export const extractTime = extractTimeFromISO;