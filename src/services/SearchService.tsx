import { ClientExpanded, VehicleExpanded } from '../types';
import {
    mockClients,
    mockVehicles,
    fetchVehiclesByOwnerId,
    fetchClientById
} from '../api/mocks/clientMocks';

// Interfejs dla wyników wyszukiwania
export interface SearchResults {
    vehicles: VehicleExpanded[];
    clients: ClientExpanded[];
}

/**
 * Serwis do wyszukiwania pojazdów i klientów
 */
export class SearchService {
    /**
     * Wyszukiwanie pojazdu na podstawie numeru rejestracyjnego
     */
    static async searchVehicleByLicensePlate(licensePlate: string): Promise<SearchResults> {
        // Sprawdzamy czy dostaliśmy jakąś wartość
        if (!licensePlate.trim()) {
            return { vehicles: [], clients: [] };
        }

        try {
            // W prawdziwej implementacji uderzalibyśmy tu do API
            // Na potrzeby mockowe filtrujemy dane lokalnie
            const foundVehicles = mockVehicles.filter(vehicle =>
                vehicle.licensePlate.toLowerCase().includes(licensePlate.toLowerCase())
            );

            // Jeśli znaleziono pojazdy, szukamy ich właścicieli
            const ownerIds = new Set<string>();
            foundVehicles.forEach(vehicle => {
                vehicle.ownerIds.forEach(id => ownerIds.add(id));
            });

            // Pobieramy dane klientów
            const foundClients: ClientExpanded[] = [];
            for (const id of ownerIds) {
                const client = await fetchClientById(id);
                if (client) {
                    foundClients.push(client);
                }
            }

            return {
                vehicles: foundVehicles,
                clients: foundClients
            };
        } catch (error) {
            console.error('Error searching vehicle by license plate:', error);
            throw new Error('Failed to search for vehicles');
        }
    }

    /**
     * Wyszukiwanie klienta na podstawie imienia i nazwiska
     */
    static async searchClientByName(name: string): Promise<SearchResults> {
        if (!name.trim()) {
            return { vehicles: [], clients: [] };
        }

        try {
            // Filtrujemy klientów po imieniu i nazwisku
            const searchTermLower = name.toLowerCase();
            const foundClients = mockClients.filter(client => {
                const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
                return fullName.includes(searchTermLower);
            });

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await fetchVehiclesByOwnerId(client.id);
                foundVehicles.push(...clientVehicles);
            }

            return {
                vehicles: foundVehicles,
                clients: foundClients
            };
        } catch (error) {
            console.error('Error searching client by name:', error);
            throw new Error('Failed to search for clients');
        }
    }

    /**
     * Wyszukiwanie klienta na podstawie numeru NIP
     */
    static async searchClientByTaxId(taxId: string): Promise<SearchResults> {
        if (!taxId.trim()) {
            return { vehicles: [], clients: [] };
        }

        try {
            // Filtrujemy klientów po NIP
            const foundClients = mockClients.filter(client =>
                client.taxId && client.taxId.includes(taxId)
            );

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await fetchVehiclesByOwnerId(client.id);
                foundVehicles.push(...clientVehicles);
            }

            return {
                vehicles: foundVehicles,
                clients: foundClients
            };
        } catch (error) {
            console.error('Error searching client by tax ID:', error);
            throw new Error('Failed to search for clients');
        }
    }

    /**
     * Wyszukiwanie klienta na podstawie adresu email
     */
    static async searchClientByEmail(email: string): Promise<SearchResults> {
        if (!email.trim()) {
            return { vehicles: [], clients: [] };
        }

        try {
            // Filtrujemy klientów po emailu
            const foundClients = mockClients.filter(client =>
                client.email.toLowerCase().includes(email.toLowerCase())
            );

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await fetchVehiclesByOwnerId(client.id);
                foundVehicles.push(...clientVehicles);
            }

            return {
                vehicles: foundVehicles,
                clients: foundClients
            };
        } catch (error) {
            console.error('Error searching client by email:', error);
            throw new Error('Failed to search for clients');
        }
    }

    /**
     * Wyszukiwanie klienta na podstawie numeru telefonu
     */
    static async searchClientByPhone(phone: string): Promise<SearchResults> {
        if (!phone.trim()) {
            return { vehicles: [], clients: [] };
        }

        try {
            // Filtrujemy klientów po telefonie
            const foundClients = mockClients.filter(client =>
                client.phone.includes(phone)
            );

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await fetchVehiclesByOwnerId(client.id);
                foundVehicles.push(...clientVehicles);
            }

            return {
                vehicles: foundVehicles,
                clients: foundClients
            };
        } catch (error) {
            console.error('Error searching client by phone:', error);
            throw new Error('Failed to search for clients');
        }
    }

    /**
     * Wyszukiwanie klienta na podstawie nazwy firmy
     */
    static async searchClientByCompany(company: string): Promise<SearchResults> {
        if (!company.trim()) {
            return { vehicles: [], clients: [] };
        }

        try {
            // Filtrujemy klientów po nazwie firmy
            const foundClients = mockClients.filter(client =>
                client.company && client.company.toLowerCase().includes(company.toLowerCase())
            );

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await fetchVehiclesByOwnerId(client.id);
                foundVehicles.push(...clientVehicles);
            }

            return {
                vehicles: foundVehicles,
                clients: foundClients
            };
        } catch (error) {
            console.error('Error searching client by company:', error);
            throw new Error('Failed to search for clients');
        }
    }

    /**
     * Pobieranie pojazdów dla danego klienta
     */
    static async getVehiclesForClient(clientId: string): Promise<VehicleExpanded[]> {
        try {
            return await fetchVehiclesByOwnerId(clientId);
        } catch (error) {
            console.error('Error fetching vehicles for client:', error);
            throw new Error('Failed to fetch vehicles');
        }
    }
}