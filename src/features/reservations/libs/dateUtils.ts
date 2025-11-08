export const parseDateFromBackend = (dateString: string | undefined): string => {
    if (!dateString) return '';

    const match = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})(?: (\d{2}):(\d{2}))?$/);
    if (!match) return '';

    const [, day, month, year, hours = '00', minutes = '00'] = match;
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
};

export const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';

    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return '';

    const [, year, month, day, hours, minutes] = match;
    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export const extractDate = (dateString: string): string => {
    if (!dateString) return '';

    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
};

export const extractTime = (dateString: string, defaultTime = '08:00'): string => {
    if (!dateString) return defaultTime;

    const match = dateString.match(/T(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : defaultTime;
};