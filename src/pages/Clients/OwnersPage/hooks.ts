// src/pages/Clients/OwnersPage/hooks.ts - NAPRAWIONE
import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ClientExpanded} from '../../../types';
import {clientsApi} from '../../../api/clientsApi';
import {useToast} from '../../../components/common/Toast/Toast';
import {ClientFilters, ClientStats, OwnersPageState} from './types';

const DEFAULT_PAGE_SIZE = 25;

const initialFilters: ClientFilters = {
    name: '',
    email: '',
    phone: '',
    minVisits: '',
    minVehicles: '',
    minRevenue: ''
};

const initialStats: ClientStats = {
    totalClients: 0,
    vipClients: 0,
    totalRevenue: 0,
    averageRevenue: 0
};

export const useOwnersPageState = () => {
    const [state, setState] = useState<OwnersPageState>({
        clients: [],
        loading: true,
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        showFilters: false,
        showAddModal: false,
        showContactModal: false,
        selectedClient: null,
        showDetailDrawer: false,
        showDeleteConfirm: false,
        manuallyClosedDrawer: false,
        selectedClientIds: [],
        showBulkSmsModal: false,
        bulkSmsText: '',
        selectAll: false,
        filters: initialFilters,
        appliedFilters: initialFilters,
        stats: initialStats
    });

    const updateState = useCallback((updates: Partial<OwnersPageState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    return { state, updateState };
};

export const useClientFilters = () => {
    const { showToast } = useToast();

    const buildApiParams = useCallback((page: number = 0, filters: ClientFilters) => {
        const params: any = {
            page,
            size: DEFAULT_PAGE_SIZE
        };

        if (filters.name?.trim()) {
            params.name = filters.name.trim();
        }

        if (filters.email?.trim()) {
            params.email = filters.email.trim();
        }

        if (filters.phone?.trim()) {
            params.phone = filters.phone.replace(/\s/g, '');
        }

        if (filters.minVisits) {
            const minVisits = parseInt(filters.minVisits);
            if (!isNaN(minVisits) && minVisits > 0) {
                params.minVisits = minVisits;
            }
        }

        // NAPRAWIONE: Prawidłowe mapowanie minVehicles
        if (filters.minVehicles) {
            const minVehicles = parseInt(filters.minVehicles);
            if (!isNaN(minVehicles) && minVehicles > 0) {
                // Przekazujemy liczbę zamiast flagi hasVehicles
                params.minVehicles = minVehicles;
            }
        }

        if (filters.minRevenue) {
            const minRevenue = parseFloat(filters.minRevenue);
            if (!isNaN(minRevenue) && minRevenue > 0) {
                params.minTotalRevenue = minRevenue;
            }
        }

        return params;
    }, []);

    const loadClients = useCallback(async (page: number = 0, filters: ClientFilters) => {
        try {
            const apiParams = buildApiParams(page, filters);

            console.log('🔍 Loading clients with params:', apiParams); // Debug log

            const result = await clientsApi.getClients(apiParams);

            if (result.success && result.data) {
                const clientsData = result.data.data;
                const pagination = result.data.pagination;

                console.log('✅ Clients loaded successfully:', {
                    count: clientsData.length,
                    pagination
                }); // Debug log

                return {
                    success: true,
                    clients: clientsData,
                    pagination
                };
            } else {
                console.error('❌ Failed to load clients:', result.error);
                showToast('error', result.error || 'Nie udało się załadować listy klientów');
                return {
                    success: false,
                    clients: [],
                    pagination: {
                        currentPage: page,
                        pageSize: DEFAULT_PAGE_SIZE,
                        totalItems: 0,
                        totalPages: 0,
                        hasNext: false,
                        hasPrevious: false
                    }
                };
            }
        } catch (err) {
            console.error('❌ Error loading clients:', err);
            showToast('error', 'Nie udało się załadować listy klientów');
            return {
                success: false,
                clients: [],
                pagination: {
                    currentPage: page,
                    pageSize: DEFAULT_PAGE_SIZE,
                    totalItems: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrevious: false
                }
            };
        }
    }, [buildApiParams, showToast]);

    return { loadClients };
};

export const useClientOperations = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const editClient = useCallback(async (client: ClientExpanded) => {
        try {
            console.log('🔧 Editing client:', client.id); // Debug log

            // NAPRAWIONE: Używamy getClientById który zwraca prawidłowe dane
            const result = await clientsApi.getClientById(client.id);

            if (result.success && result.data) {
                console.log('✅ Client data loaded for editing:', result.data); // Debug log
                return { success: true, client: result.data };
            } else {
                console.error('❌ Failed to load client for editing:', result.error);
                showToast('error', result.error || 'Nie udało się pobrać danych klienta');
                return { success: false, client };
            }
        } catch (error) {
            console.error('❌ Error loading client for editing:', error);
            showToast('error', 'Błąd podczas pobierania danych klienta');
            return { success: false, client };
        }
    }, [showToast]);

    const deleteClient = useCallback(async (clientId: string) => {
        try {
            console.log('🗑️ Deleting client:', clientId); // Debug log

            const result = await clientsApi.deleteClient(clientId);
            if (result.success) {
                console.log('✅ Client deleted successfully'); // Debug log
                showToast('success', 'Klient został usunięty');
                return { success: true };
            } else {
                console.error('❌ Failed to delete client:', result.error);
                showToast('error', result.error || 'Nie udało się usunąć klienta');
                return { success: false };
            }
        } catch (err) {
            console.error('❌ Error deleting client:', err);
            showToast('error', 'Nie udało się usunąć klienta');
            return { success: false };
        }
    }, [showToast]);

    const navigateToVehicles = useCallback((clientId: string, onNavigateToVehiclesByOwner?: (ownerId: string) => void) => {
        console.log('🚗 Navigating to vehicles for client:', clientId); // Debug log

        if (onNavigateToVehiclesByOwner) {
            onNavigateToVehiclesByOwner(clientId);
        } else {
            navigate(`/clients-vehicles?tab=vehicles&ownerId=${clientId}`);
        }
    }, [navigate]);

    const updateContactAttempt = useCallback(async (clientId: string) => {
        try {
            console.log('📞 Updating contact attempt for client:', clientId); // Debug log

            const result = await clientsApi.getClientById(clientId);
            if (result.success && result.data) {
                console.log('✅ Contact attempt updated'); // Debug log
                return { success: true, client: result.data };
            }
            return { success: false, client: null };
        } catch (error) {
            console.error('❌ Error updating contact attempt:', error);
            return { success: false, client: null };
        }
    }, []);

    const exportClients = useCallback(() => {
        console.log('📤 Exporting clients...'); // Debug log
        showToast('info', 'Eksport danych klientów - funkcjonalność w przygotowaniu');
    }, [showToast]);

    const sendSMS = useCallback((client: ClientExpanded) => {
        console.log('📱 Sending SMS to client:', client.id); // Debug log
        showToast('info', `Symulacja wysyłania SMS do: ${client.firstName} ${client.lastName} (${client.phone})`);
    }, [showToast]);

    return {
        editClient,
        deleteClient,
        navigateToVehicles,
        updateContactAttempt,
        exportClients,
        sendSMS
    };
};

export const useClientSelection = () => {
    const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    const toggleClientSelection = useCallback((clientId: string) => {
        console.log('☑️ Toggling client selection:', clientId); // Debug log

        setSelectedClientIds(currentSelected => {
            if (currentSelected.includes(clientId)) {
                return currentSelected.filter(id => id !== clientId);
            } else {
                return [...currentSelected, clientId];
            }
        });
    }, []);

    const toggleSelectAll = useCallback((clients: ClientExpanded[]) => {
        const newSelectAll = !selectAll;
        console.log('☑️ Toggling select all:', newSelectAll); // Debug log

        setSelectAll(newSelectAll);

        if (newSelectAll) {
            setSelectedClientIds(clients.map(client => client.id));
        } else {
            setSelectedClientIds([]);
        }
    }, [selectAll]);

    const clearSelection = useCallback(() => {
        console.log('🧹 Clearing selection'); // Debug log
        setSelectedClientIds([]);
        setSelectAll(false);
    }, []);

    return {
        selectedClientIds,
        selectAll,
        toggleClientSelection,
        toggleSelectAll,
        clearSelection,
        setSelectAll
    };
};

export const useFormatters = () => {
    const formatCurrency = useCallback((amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    }, []);

    const formatClientCount = useCallback((count: number): string => {
        if (count === 1) return 'klienta';
        if (count > 1 && count < 5) return 'klientów';
        return 'klientów';
    }, []);

    return {
        formatCurrency,
        formatClientCount
    };
};