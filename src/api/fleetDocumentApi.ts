// src/api/fleetDocumentApi.ts

import { apiClient } from './apiClient';
import { FleetDocument } from '../types/fleetDocuments';

export const fleetDocumentApi = {
    // Dodawanie dokumentu pojazdu
    addVehicleDocument: async (vehicleId: string, document: Partial<FleetDocument>, file?: File): Promise<FleetDocument> => {
        try {
            // Jeśli mamy plik, używamy FormData
            if (file) {
                const formData = apiClient.createFormDataWithJson(document, 'data', { file });
                return await apiClient.post<FleetDocument>(`/fleet/vehicles/${vehicleId}/documents`, formData);
            }

            // W przeciwnym razie wysyłamy zwykłe JSON
            return await apiClient.post<FleetDocument>(`/fleet/vehicles/${vehicleId}/documents`, document);
        } catch (error) {
            console.error(`Error adding document to vehicle ${vehicleId}:`, error);
            throw error;
        }
    },

    // Aktualizacja dokumentu
    updateDocument: async (id: string, documentData: Partial<FleetDocument>): Promise<FleetDocument> => {
        try {
            return await apiClient.put<FleetDocument>(`/fleet/documents/${id}`, documentData);
        } catch (error) {
            console.error(`Error updating document ${id}:`, error);
            throw error;
        }
    },

    // Usuwanie dokumentu
    deleteDocument: async (id: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/fleet/documents/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting document ${id}:`, error);
            throw error;
        }
    }
};