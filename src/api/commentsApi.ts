import { apiClient } from './apiClient';

// Interfejs dla komentarza
export interface Comment {
    id?: string;
    protocolId: string;
    author: string;
    content: string;
    timestamp?: string;
    type: 'internal' | 'customer' | 'system';
}

// Konwersja snake_case na camelCase dla odpowiedzi z API
const convertSnakeToCamel = (data: any): any => {
    if (data === null || data === undefined || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => convertSnakeToCamel(item));
    }

    return Object.keys(data).reduce((result, key) => {
        // Konwertuj klucz ze snake_case na camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        // Rekurencyjnie konwertuj wartość jeśli jest obiektem
        result[camelKey] = convertSnakeToCamel(data[key]);

        return result;
    }, {} as Record<string, any>);
};

// Konwersja camelCase na snake_case dla wysyłanych danych
const convertCamelToSnake = (data: any): any => {
    if (data === null || data === undefined || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => convertCamelToSnake(item));
    }

    return Object.keys(data).reduce((result, key) => {
        // Konwertuj klucz z camelCase na snake_case
        const snakeKey = key.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);

        // Rekurencyjnie konwertuj wartość jeśli jest obiektem
        result[snakeKey] = convertCamelToSnake(data[key]);

        return result;
    }, {} as Record<string, any>);
};

export const commentsApi = {
    // Pobieranie komentarzy dla protokołu
    getComments: async (protocolId: string): Promise<Comment[]> => {
        try {
            const data = await apiClient.get<any[]>(`/receptions/comments/${protocolId}`);
            return convertSnakeToCamel(data) as Comment[];
        } catch (error) {
            console.error(`Error fetching comments for protocol ${protocolId}:`, error);
            return [];
        }
    },

    // Dodawanie nowego komentarza
    addComment: async (comment: Comment): Promise<Comment | null> => {
        try {
            const response = await apiClient.postNot<any>('/receptions/comments', comment);
            return convertSnakeToCamel(response) as Comment;
        } catch (error) {
            console.error('Error adding comment:', error);
            return null;
        }
    }
};