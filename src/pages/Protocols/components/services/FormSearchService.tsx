import { SearchService, SearchResults } from '../../../../services/SearchService';
import { ClientExpanded, VehicleExpanded } from '../../../../types';

export interface SearchCriteria {
    field: 'licensePlate' | 'ownerName' | 'companyName' | 'taxId' | 'email' | 'phone';
    value: string;
}

export class FormSearchService {
    /**
     * Wyszukuje dane na podstawie określonego kryterium
     */
    static async searchByField(criteria: SearchCriteria): Promise<SearchResults> {
        try {
            let results: SearchResults = { vehicles: [], clients: [] };

            switch (criteria.field) {
                case 'licensePlate':
                    // Wyszukiwanie po numerze rejestracyjnym pojazdu
                    results = await SearchService.searchVehicleByLicensePlate(criteria.value);
                    break;

                case 'ownerName':
                    // Wyszukiwanie po imieniu i nazwisku właściciela
                    results = await SearchService.searchClientByName(criteria.value);
                    break;

                case 'companyName':
                    // Wyszukiwanie po nazwie firmy
                    results = await SearchService.searchClientByCompany(criteria.value);
                    break;

                case 'taxId':
                    // Wyszukiwanie po numerze NIP
                    results = await SearchService.searchClientByTaxId(criteria.value);
                    break;

                case 'email':
                    // Wyszukiwanie po adresie email
                    results = await SearchService.searchClientByEmail(criteria.value);
                    break;

                case 'phone':
                    // Wyszukiwanie po numerze telefonu
                    results = await SearchService.searchClientByPhone(criteria.value);
                    break;
            }

            return results;
        } catch (error) {
            console.error(`Error searching by ${criteria.field}:`, error);
            throw new Error(`Failed to search by ${criteria.field}`);
        }
    }

    /**
     * Pobierz pojazdy dla danego klienta
     */
    static async getVehiclesForClient(clientId: string): Promise<VehicleExpanded[]> {
        try {
            return await SearchService.getVehiclesForClient(clientId);
        } catch (error) {
            console.error('Error fetching vehicles for client:', error);
            throw new Error('Failed to fetch vehicles for client');
        }
    }

    /**
     * Przygotowuje dane klienta do uzupełnienia formularza
     */
    static mapClientToFormData(client: ClientExpanded) {
        return {
            ownerName: `${client.firstName} ${client.lastName}`,
            companyName: client.company || '',
            taxId: client.taxId || '',
            email: client.email,
            phone: client.phone
        };
    }

    /**
     * Przygotowuje dane pojazdu do uzupełnienia formularza
     */
    static mapVehicleToFormData(vehicle: VehicleExpanded) {
        return {
            licensePlate: vehicle.licensePlate,
            make: vehicle.make,
            model: vehicle.model,
            productionYear: vehicle.year,
            vin: vehicle.vin || '',
            color: vehicle.color || ''
        };
    }
}