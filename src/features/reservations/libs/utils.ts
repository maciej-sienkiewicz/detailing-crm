export {
    parseDateFromBackend,
    formatDateForAPI,
    extractDate as extractDateFromISO,
    extractTime as extractTimeFromISO
} from './dateUtils';

export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    const digits = phone.replace(/\D/g, '');

    if (digits.length > 0) {
        return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
    }

    return phone;
};

export const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone) return false;

    const digits = phone.replace(/\D/g, '');

    return digits.length >= 9 && digits.length <= 11;
};

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