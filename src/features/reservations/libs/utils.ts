// src/features/reservations/libs/utils.ts
/**
 * Utility functions for reservation form
 * Fixed to handle backend date format (array of numbers)
 */

/**
 * Converts backend date format (array or string) to ISO string
 */
const convertBackendDateToISO = (dateValue: string | number[]): string => {
    if (!dateValue) return '';

    // Handle array format from backend: [year, month, day, hour?, minute?, second?]
    if (Array.isArray(dateValue)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        const date = new Date(year, month - 1, day, hour, minute, second);

        if (!isNaN(date.getTime())) {
            // Format as ISO without timezone: YYYY-MM-DDTHH:MM:SS
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
        }

        console.warn('⚠️ Invalid date array:', dateValue);
        return '';
    }

    // Handle string format
    return String(dateValue);
};

/**
 * Formats date for API (ensures proper ISO format without timezone)
 */
export const formatDateForAPI = (dateString: string | number[]): string => {
    if (!dateString) return '';

    try {
        // Convert to ISO string first if array
        let isoString = Array.isArray(dateString)
            ? convertBackendDateToISO(dateString)
            : dateString;

        if (!isoString) return '';

        // Remove 'Z' and milliseconds if present
        let cleanedDate = isoString.replace('Z', '').split('.')[0];

        // Handle space format like "2025-09-25 23:59:59"
        if (cleanedDate.includes(' ') && !cleanedDate.includes('T')) {
            cleanedDate = cleanedDate.replace(' ', 'T');
        }

        // If already in correct ISO format (YYYY-MM-DDTHH:MM:SS), return as is
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(cleanedDate)) {
            return cleanedDate;
        }

        if (/^\d{2}.\d{2}.\d{4} \d{2}:\d{2}$/.test(cleanedDate)) {
            // Dzieli string na '25-10-2023' i '14:30'
            const [datePart, timePart] = cleanedDate.split(' ');

            // Przetwarza '25-10-2023'
            const [day, month, year] = datePart.split('-');

            // Przetwarza '14:30' i dodaje sekundy
            return `${year}-${month}-${day}T${timePart}:00`;
        }

        // If just date (YYYY-MM-DD), add default time
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
            return `${cleanedDate}T08:00:00`;
        }

        // Fallback - try to create proper date
        const date = new Date(isoString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('.')[0];
        }

        console.warn('⚠️ Cannot format date:', dateString);
        return cleanedDate;

    } catch (error) {
        console.error('❌ Error formatting date:', error, dateString);
        return '';
    }
};

/**
 * Extracts date part from ISO string or array
 */
export const extractDateFromISO = (dateString: string | number[]): string => {
    if (!dateString) return '';

    try {
        // Convert to ISO string first if array
        let isoString = Array.isArray(dateString)
            ? convertBackendDateToISO(dateString)
            : dateString;

        if (!isoString) return '';

        let cleanedDate = isoString.replace('Z', '').split('.')[0];

        if (cleanedDate.includes('T')) {
            return cleanedDate.split('T')[0];
        }

        if (cleanedDate.includes(' ')) {
            return cleanedDate.split(' ')[0];
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
            return cleanedDate;
        }

        const date = new Date(isoString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }

        return '';
    } catch (e) {
        console.warn('⚠️ Cannot parse date:', dateString, e);
        return '';
    }
};

/**
 * Extracts time part from ISO string or array
 */
export const extractTimeFromISO = (dateString: string | number[], defaultTime = '08:00'): string => {
    if (!dateString) return defaultTime;

    try {
        // Convert to ISO string first if array
        let isoString = Array.isArray(dateString)
            ? convertBackendDateToISO(dateString)
            : dateString;

        if (!isoString) return defaultTime;

        let cleanedDate = isoString.replace('Z', '').split('.')[0];

        if (cleanedDate.includes('T')) {
            const timePart = cleanedDate.split('T')[1];
            if (timePart) {
                return timePart.substring(0, 5); // HH:MM
            }
        }

        if (cleanedDate.includes(' ')) {
            const timePart = cleanedDate.split(' ')[1];
            if (timePart) {
                return timePart.substring(0, 5); // HH:MM
            }
        }

        return defaultTime;
    } catch (e) {
        console.warn('⚠️ Error extracting time:', dateString, e);
        return defaultTime;
    }
};

/**
 * Formats phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Format with spaces for better readability
    if (digits.length > 0) {
        return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
    }

    return phone;
};

/**
 * Validates phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone) return false;

    const digits = phone.replace(/\D/g, '');

    // Polish phone number: 9 digits
    return digits.length >= 9 && digits.length <= 11;
};

/**
 * Generates default reservation title
 */
export const generateReservationTitle = (
    vehicleMake: string,
    vehicleModel: string,
    contactName?: string
): string => {
    const parts: string[] = [];

    if (vehicleMake && vehicleModel) {
        parts.push(`${vehicleMake} ${vehicleModel}`);
    } else if (vehicleMake) {
        parts.push(vehicleMake);
    } else if (vehicleModel) {
        parts.push(vehicleModel);
    }

    if (contactName) {
        parts.push(contactName);
    }

    return parts.length > 0 ? parts.join(' - ') : 'Nowa rezerwacja';
};