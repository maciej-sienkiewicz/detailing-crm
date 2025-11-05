// src/utils/dateHelpers.ts

export const parseDateArray = (dateArray: number[]): Date => {
    if (!dateArray || !Array.isArray(dateArray)) {
        return new Date();
    }

    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    return new Date(year, month - 1, day, hour, minute, second);
};

export const formatDateFromArray = (dateArray: number[] | string, includeTime: boolean = false): string => {
    if (!dateArray) return '';

    let date: Date;

    if (Array.isArray(dateArray)) {
        date = parseDateArray(dateArray);
    } else {
        date = new Date(dateArray);
    }

    if (isNaN(date.getTime())) return '';

    const formattedDate = date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    if (includeTime) {
        const time = date.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${formattedDate}, ${time}`;
    }

    return formattedDate;
};

export const shouldShowTime = (dateArray: number[] | string): boolean => {
    if (Array.isArray(dateArray)) {
        return dateArray[3] !== undefined && (dateArray[3] !== 23 || dateArray[4] !== 59);
    }

    if (typeof dateArray === 'string') {
        return dateArray.includes('T') && !dateArray.includes('23:59:59');
    }

    return false;
};