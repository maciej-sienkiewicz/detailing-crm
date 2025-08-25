import {ClientExpanded, VehicleExpanded} from '../types';
import {clientApi} from '../api/clientsApi';
import {vehicleApi} from '../api/vehiclesApi';

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
            // Pobieramy wszystkie pojazdy i filtrujemy lokalnie (w prawdziwej implementacji
            // backend miałby endpoint do wyszukiwania, lub używalibyśmy parametrów zapytania)
            const allVehicles = await vehicleApi.fetchVehicles();

            const foundVehicles = allVehicles.filter(vehicle =>
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
                const client = await clientApi.fetchClientById(id);
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
            // Pobieramy wszystkich klientów i filtrujemy lokalnie
            const allClients = await clientApi.fetchClients();

            const searchTermLower = name.toLowerCase();
            const foundClients = allClients.filter(client => {
                const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
                return fullName.includes(searchTermLower);
            });

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await vehicleApi.fetchVehiclesByOwnerId(client.id);
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
            // Pobieramy wszystkich klientów i filtrujemy lokalnie
            const allClients = await clientApi.fetchClients();

            const foundClients = allClients.filter(client =>
                client.taxId && client.taxId.includes(taxId)
            );

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await vehicleApi.fetchVehiclesByOwnerId(client.id);
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
            // Pobieramy wszystkich klientów i filtrujemy lokalnie
            const allClients = await clientApi.fetchClients();

            const foundClients = allClients.filter(client =>
                client.email.toLowerCase().includes(email.toLowerCase())
            );

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await vehicleApi.fetchVehiclesByOwnerId(client.id);
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
            // Pobieramy wszystkich klientów i filtrujemy lokalnie
            const allClients = await clientApi.fetchClients();

            const foundClients = allClients.filter(client =>
                client.phone.includes(phone)
            );

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await vehicleApi.fetchVehiclesByOwnerId(client.id);
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
            // Pobieramy wszystkich klientów i filtrujemy lokalnie
            const allClients = await clientApi.fetchClients();

            const foundClients = allClients.filter(client =>
                client.company && client.company.toLowerCase().includes(company.toLowerCase())
            );

            // Jeśli znaleziono klientów, zbieramy ich pojazdy
            const foundVehicles: VehicleExpanded[] = [];
            for (const client of foundClients) {
                const clientVehicles = await vehicleApi.fetchVehiclesByOwnerId(client.id);
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
            return await vehicleApi.fetchVehiclesByOwnerId(clientId);
        } catch (error) {
            console.error('Error fetching vehicles for client:', error);
            throw new Error('Failed to fetch vehicles');
        }
    }

    /**
     * Pobieranie właścicieli dla danego pojazdu
     * Ta metoda jest implementowana lokalnie na podstawie danych z pojazdu
     */
    static async getOwnersForVehicle(vehicleId: string): Promise<ClientExpanded[]> {
        try {
            // Najpierw pobieramy dane pojazdu
            const vehicle = await vehicleApi.fetchVehicleById(vehicleId);

            if (!vehicle) {
                throw new Error(`Vehicle with ID ${vehicleId} not found`);
            }

            // Następnie pobieramy dane właścicieli
            const owners: ClientExpanded[] = [];
            for (const ownerId of vehicle.ownerIds) {
                const owner = await clientApi.fetchClientById(ownerId);
                if (owner) {
                    owners.push(owner);
                }
            }

            return owners;
        } catch (error) {
            console.error('Error fetching owners for vehicle:', error);
            throw new Error('Failed to fetch vehicle owners');
        }
    }
}