// src/api/fleetImageApi.ts

import { apiClient } from './apiClient';
import { FleetImage } from '../types/fleetRental';

export const fleetImageApi = {
    // Dodawanie zdjęcia pojazdu
    uploadVehicleImage: async (vehicleId: string, file: File, description?: string): Promise<FleetImage> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('entityType', 'VEHICLE');
            formData.append('entityId', vehicleId);

            if (description) {
                formData.append('description', description);
            }

            return await apiClient.post<FleetImage>('/fleet/images', formData);
        } catch (error) {
            console.error(`Error uploading image for vehicle ${vehicleId}:`, error);
            throw error;
        }
    },

    // Pobieranie zdjęć pojazdu
    fetchVehicleImages: async (vehicleId: string): Promise<FleetImage[]> => {
        try {
            return await apiClient.get<FleetImage[]>(`/fleet/vehicles/${vehicleId}/images`);
        } catch (error) {
            console.error(`Error fetching images for vehicle ${vehicleId}:`, error);
            return [];
        }
    },

    // Usuwanie zdjęcia
    deleteImage: async (imageId: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/fleet/images/${imageId}`);
            return true;
        } catch (error) {
            console.error(`Error deleting image ${imageId}:`, error);
            throw error;
        }
    }
};