// src/pages/Protocols/shared/services/FormSearchService.ts
/**
 * Production-ready Form Search Service
 * Handles search operations for protocol forms with proper error handling and logging
 */

import {ClientExpanded, VehicleExpanded} from '../../../../types';
import {clientsApi} from '../../../../api/clientsApi';
import {vehicleApi} from '../../../../api/vehiclesApi';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

/**
 * Search criteria for form field search operations
 */
export interface SearchCriteria {
    field: 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone' | 'licensePlate';
    value: string;
}

/**
 * Combined search results containing both clients and vehicles
 */
export interface SearchResults {
    clients: ClientExpanded[];
    vehicles: VehicleExpanded[];
}

/**
 * Form search operation result
 */
export interface FormSearchResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

/**
 * Form field data mapping for client information
 */
export interface ClientFormData {
    ownerName: string;
    companyName: string;
    taxId: string;
    email: string;
    phone: string;
}

/**
 * Form field data mapping for vehicle information
 */
export interface VehicleFormData {
    licensePlate: string;
    make: string;
    model: string;
    productionYear: number;
    mileage: number;
}

// ========================================================================================
// FORM SEARCH SERVICE CLASS
// ========================================================================================

/**
 * Production-ready service for handling form search operations
 * Includes proper error handling, logging, and data validation
 */
class FormSearchService {
    private readonly isDevelopment = process.env.NODE_ENV === 'development';

    /**
     * Main search method that handles different field types
     *
     * @param criteria - Search criteria including field and value
     * @returns Promise<SearchResults> with clients and vehicles
     *
     * @example
     * ```typescript
     * const results = await FormSearchService.searchByField({
     *   field: 'licensePlate',
     *   value: 'ABC123'
     * });
     *
     * if (results.vehicles.length > 0) {
     *   // Handle vehicle selection
     * }
     * ```
     */
    async searchByField(criteria: SearchCriteria): Promise<SearchResults> {
        try {
            this.logDebug('Initiating search operation', { criteria });

            // Validate input
            this.validateSearchCriteria(criteria);

            // Route to appropriate search method
            if (criteria.field === 'licensePlate') {
                return await this.searchByLicensePlate(criteria.value);
            } else {
                return await this.searchByClientField(criteria);
            }
        } catch (error) {
            this.logError('Search operation failed', error, { criteria });
            throw this.createSearchError('Błąd podczas wyszukiwania', error);
        }
    }

    /**
     * Retrieves vehicles associated with a specific client
     *
     * @param clientId - Client identifier
     * @returns Promise<VehicleExpanded[]> list of client's vehicles
     */
    async getVehiclesForClient(clientId: string): Promise<VehicleExpanded[]> {
        try {
            this.logDebug('Fetching vehicles for client', { clientId });

            const vehicles = await vehicleApi.fetchVehiclesByOwnerId(clientId);

            this.logDebug('Successfully retrieved client vehicles', {
                clientId,
                vehicleCount: vehicles.length
            });

            return vehicles;
        } catch (error) {
            this.logError('Failed to fetch client vehicles', error, { clientId });
            return [];
        }
    }

    /**
     * Maps client data to form field structure
     *
     * @param client - Client data from API
     * @returns Partial form data for client fields
     */
    mapClientToFormData(client: ClientExpanded): Partial<ClientFormData> {
        try {
            this.logDebug('Mapping client data to form', { clientId: client.id });

            // Determine the best source for client name
            const ownerName = this.extractClientName(client);

            const mappedData: Partial<ClientFormData> = {
                ownerName,
                companyName: client.company || '',
                taxId: client.taxId || '',
                email: client.email || '',
                phone: client.phone || ''
            };

            this.logDebug('Client data mapped successfully', {
                clientId: client.id,
                hasName: !!ownerName,
                hasCompany: !!client.company,
                hasTaxId: !!client.taxId
            });

            return mappedData;
        } catch (error) {
            this.logError('Failed to map client data', error, { clientId: client.id });
            return {};
        }
    }

    /**
     * Maps vehicle data to form field structure
     *
     * @param vehicle - Vehicle data from API
     * @returns Partial form data for vehicle fields
     */
    mapVehicleToFormData(vehicle: VehicleExpanded): Partial<VehicleFormData> {
        try {
            this.logDebug('Mapping vehicle data to form', { vehicleId: vehicle.id });

            const mappedData: Partial<VehicleFormData> = {
                licensePlate: vehicle.licensePlate || '',
                make: vehicle.make || '',
                model: vehicle.model || '',
                productionYear: vehicle.year || new Date().getFullYear(),
                mileage: vehicle.mileage || 0
            };

            this.logDebug('Vehicle data mapped successfully', {
                vehicleId: vehicle.id,
                hasLicensePlate: !!vehicle.licensePlate
            });

            return mappedData;
        } catch (error) {
            this.logError('Failed to map vehicle data', error, { vehicleId: vehicle.id });
            return {};
        }
    }

    // ========================================================================================
    // PRIVATE SEARCH METHODS
    // ========================================================================================

    /**
     * Searches for vehicles by license plate and retrieves associated owners
     */
    private async searchByLicensePlate(licensePlate: string): Promise<SearchResults> {
        try {
            this.logDebug('Searching by license plate', { licensePlate });

            // Fetch vehicles from API
            const vehicleResponse = await vehicleApi.fetchVehiclesForTable({
                page: 0,
                size: 1000
            });

            // Filter vehicles by license plate
            const matchingVehicles = vehicleResponse.data.filter(vehicle =>
                vehicle.licensePlate?.toLowerCase().includes(licensePlate.toLowerCase())
            );

            this.logDebug('Vehicle search completed', {
                searchTerm: licensePlate,
                matchCount: matchingVehicles.length
            });

            // Collect unique clients from vehicle owners
            const clientsMap = new Map<string, ClientExpanded>();

            await Promise.allSettled(
                matchingVehicles.flatMap(vehicle =>
                    (vehicle.owners || []).map(async owner => {
                        try {
                            const clientResult = await clientsApi.getClientById(owner.id.toString());
                            if (clientResult.success && clientResult.data && !clientsMap.has(clientResult.data.id)) {
                                clientsMap.set(clientResult.data.id, clientResult.data);
                            }
                        } catch (error) {
                            this.logError('Failed to fetch client data', error, {
                                ownerId: owner.id
                            });
                        }
                    })
                )
            );

            const clients = Array.from(clientsMap.values());

            this.logDebug('License plate search completed', {
                vehicleCount: matchingVehicles.length,
                clientCount: clients.length
            });

            return {
                vehicles: matchingVehicles,
                clients
            };
        } catch (error) {
            this.logError('License plate search failed', error, { licensePlate });
            throw error;
        }
    }

    /**
     * Searches for clients by various field criteria
     * Supports search by name, email, phone, company, or tax ID
     */
    private async searchByClientField(criteria: SearchCriteria): Promise<SearchResults> {
        try {
            this.logDebug('Searching by client field', { criteria });

            // Use the search functionality from clientsApi
            const searchResult = await clientsApi.searchClients(criteria.value, 50);

            if (!searchResult.success) {
                throw new Error(searchResult.error || 'Failed to search clients');
            }

            const clients = searchResult.data || [];

            this.logDebug('Client field search completed', {
                searchTerm: criteria.value,
                field: criteria.field,
                matchCount: clients.length
            });

            // For client searches, we don't typically return vehicles
            // Vehicles will be fetched separately when a client is selected
            return {
                vehicles: [],
                clients
            };
        } catch (error) {
            this.logError('Client field search failed', error, { criteria });
            throw error;
        }
    }

    // ========================================================================================
    // PRIVATE UTILITY METHODS
    // ========================================================================================

    /**
     * Validates search criteria before processing
     */
    private validateSearchCriteria(criteria: SearchCriteria): void {
        if (!criteria.field) {
            throw new Error('Search field is required');
        }

        if (!criteria.value || criteria.value.trim() === '') {
            throw new Error('Search value cannot be empty');
        }

        const validFields = ['ownerName', 'companyName', 'taxId', 'email', 'phone', 'licensePlate'];
        if (!validFields.includes(criteria.field)) {
            throw new Error(`Invalid search field: ${criteria.field}`);
        }
    }

    /**
     * Extracts client name from various possible field combinations
     */
    private extractClientName(client: ClientExpanded): string {
        // Try fullName first (if available)
        if (client.fullName && client.fullName.trim() !== '') {
            return client.fullName.trim();
        }

        // Combine firstName and lastName
        if (client.firstName && client.lastName) {
            return `${client.firstName} ${client.lastName}`.trim();
        }

        // Fall back to individual fields
        if (client.firstName) {
            return client.firstName.trim();
        }

        if (client.lastName) {
            return client.lastName.trim();
        }

        return '';
    }

    /**
     * Creates a standardized error for search operations
     */
    private createSearchError(message: string, originalError?: any): Error {
        const error = new Error(message);
        error.name = 'FormSearchError';

        if (originalError) {
            (error as any).originalError = originalError;
        }

        return error;
    }

    /**
     * Logs debug information (only in development)
     */
    private logDebug(message: string, data?: any): void {
        if (this.isDevelopment) {
            console.log(`[FormSearchService] ${message}`, data || '');
        }
    }

    /**
     * Logs error information (always logged)
     */
    private logError(message: string, error: any, context?: any): void {
        console.error(`[FormSearchService] ${message}`, {
            error: error?.message || error,
            context,
            stack: this.isDevelopment ? error?.stack : undefined
        });
    }
}

// ========================================================================================
// EXPORTS
// ========================================================================================

// Export singleton instance
export const formSearchService = new FormSearchService();

// Export class for testing purposes
export { FormSearchService };

// Default export
export default formSearchService;