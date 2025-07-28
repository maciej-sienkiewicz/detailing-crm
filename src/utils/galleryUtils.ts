// src/utils/galleryUtils.ts
export const parseJavaLocalDateTime = (dateArray: any): Date => {
    if (Array.isArray(dateArray) && dateArray.length >= 6) {
        const [year, month, day, hour, minute, second, nanosecond] = dateArray;
        const millisecond = nanosecond ? Math.floor(nanosecond / 1000000) : 0;
        return new Date(year, month - 1, day, hour, minute, second, millisecond);
    }

    if (typeof dateArray === 'string') {
        return new Date(dateArray);
    }

    return new Date();
};

export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Nieprawidłowa data';

        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Błąd daty';
    }
};

export const getFileExtension = (contentType: string): string => {
    const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/bmp': 'bmp',
        'image/svg+xml': 'svg',
        'image/tiff': 'tiff'
    };
    return mimeToExt[contentType?.toLowerCase()] || 'jpg';
};

export const getFileNameWithExtension = (name: string, contentType: string, id: string): string => {
    if (name && name.includes('.')) return name;

    const extension = getFileExtension(contentType);
    const baseName = name || `image_${id}`;
    return `${baseName}.${extension}`;
};