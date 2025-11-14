// src/features/reservations/libs/dateParser.ts
/**
 * Centralized date parsing and formatting utilities for reservations
 * Backend always sends dates in format: DD.MM.YYYY HH:mm or DD.MM.YYYY
 */

/**
 * Parses backend date string (DD.MM.YYYY HH:mm or DD.MM.YYYY) to JavaScript Date
 * @param dateString - Date string from backend in format DD.MM.YYYY HH:mm or DD.MM.YYYY
 * @returns JavaScript Date object or null if invalid
 */
export const parseBackendDate = (dateString: string | undefined): Date | null => {
    if (!dateString || dateString.trim() === '') {
        return null;
    }

    try {
        // Handle format: DD.MM.YYYY HH:mm
        const dateTimeMatch = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})(?: (\d{2}):(\d{2}))?$/);

        if (!dateTimeMatch) {
            console.warn('Invalid date format:', dateString);
            return null;
        }

        const [, day, month, year, hours = '00', minutes = '00'] = dateTimeMatch;

        // Create date with local timezone (important!)
        const date = new Date(
            parseInt(year, 10),
            parseInt(month, 10) - 1, // Month is 0-indexed in JavaScript
            parseInt(day, 10),
            parseInt(hours, 10),
            parseInt(minutes, 10),
            0 // seconds
        );

        // Validate the date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date created from:', dateString);
            return null;
        }

        return date;
    } catch (error) {
        console.error('Error parsing date:', dateString, error);
        return null;
    }
};

/**
 * Formats JavaScript Date to backend format (DD.MM.YYYY HH:mm)
 * @param date - JavaScript Date object
 * @returns Formatted string DD.MM.YYYY HH:mm
 */
export const formatDateForBackend = (date: Date | string): string => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date for formatting:', date);
            return '';
        }

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch (error) {
        console.error('Error formatting date:', date, error);
        return '';
    }
};

/**
 * Formats JavaScript Date to backend date-only format (DD.MM.YYYY)
 * @param date - JavaScript Date object
 * @returns Formatted string DD.MM.YYYY
 */
export const formatDateOnlyForBackend = (date: Date | string): string => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date for formatting:', date);
            return '';
        }

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}.${month}.${year}`;
    } catch (error) {
        console.error('Error formatting date:', date, error);
        return '';
    }
};

/**
 * Converts backend date string to ISO format for form inputs (YYYY-MM-DDTHH:mm:ss)
 * @param dateString - Date string from backend
 * @returns ISO format string for inputs
 */
export const backendDateToISO = (dateString: string | undefined): string => {
    const date = parseBackendDate(dateString);
    if (!date) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Extracts date part from ISO string (YYYY-MM-DD)
 * @param isoString - ISO format date string
 * @returns Date part only (YYYY-MM-DD)
 */
export const extractDateFromISO = (isoString: string): string => {
    if (!isoString) return '';
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
};

/**
 * Extracts time part from ISO string (HH:mm)
 * @param isoString - ISO format date string
 * @param defaultTime - Default time if extraction fails
 * @returns Time part only (HH:mm)
 */
export const extractTimeFromISO = (isoString: string, defaultTime = '08:00'): string => {
    if (!isoString) return defaultTime;
    const match = isoString.match(/T(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : defaultTime;
};