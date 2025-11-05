// src/pages/Settings/ServicesPage.tsx - ZREFAKTORYZOWANE (z paddingiem kolumny Nazwa)
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
    FaEdit,
    FaFilter,
    FaSave,
    FaTimes,
    FaTrash,
    FaWrench,
    FaPlus
} from 'react-icons/fa';
import { Service, PriceType, PriceTypeLabels, ServicePriceInput } from '../../types';
import { servicesApi, ServiceData } from '../../features/services/api/servicesApi';
import { DataTable, TableColumn, HeaderAction } from '../../components/common/DataTable';
import { settingsTheme } from './styles/theme';
import { ConfirmationDialog } from "../../components/common/NewConfirmationDialog";
import { ContextMenu, ContextMenuItem } from '../../components/common/ContextMenu';

// Interface dla filtrów
interface ServiceFilters {
    searchQuery: string;
    name: string;
    description: string;
    minPrice: string;
    maxPrice: string;
    vatRate: string;
}

// Interface dla modalu potwierdzenia
interface ConfirmationState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
}

// Interface dla formularza edycji (używa ServicePriceInput do wprowadzania danych)
interface ServiceFormData {
    id: string;
    name: string;
    description?: string;
    priceInput: ServicePriceInput;  // Do wprowadzania danych
    vatRate: number;
}

const ServicesPage = forwardRef<{ handleAddService: () => void }>((props, ref) => {
    const [services, setServices] = useState<Service[]>([]);
    const [filters, setFilters] = useState<ServiceFilters>({
        searchQuery: '',
        name: '',
        description: '',
        minPrice: '',
        maxPrice: '',
        vatRate: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<ServiceFormData | null>(null);
    const [defaultVatRate, setDefaultVatRate] = useState(23);

    const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Tak',
        cancelText: 'Anuluj',
        onConfirm: () => {}
    });

    const showConfirmation = (config: Omit<ConfirmationState, 'isOpen'>) => {
        setConfirmationState({
            ...config,
            isOpen: true
        });
    };

    const hideConfirmation = () => {
        setConfirmationState(prev => ({
            ...prev,
            isOpen: false
        }));
    };

    useImperativeHandle(ref, () => ({
        handleAddService: handleAddService
    }));

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [servicesData, vatRateData] = await Promise.all([
                    servicesApi.fetchServices(),
                    servicesApi.fetchDefaultVatRate()
                ]);
                setServices(servicesData);
                setDefaultVatRate(vatRateData);
                setError(null);
            } catch (err) {
                setError('Nie udało się pobrać danych. Spróbuj ponownie później.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredServices = useMemo(() => {
        let result = [...services];

        if (filters.searchQuery.trim()) {
            const searchQuery = filters.searchQuery.toLowerCase().trim();
            result = result.filter(service =>
                service.name.toLowerCase().includes(searchQuery) ||
                (service.description && service.description.toLowerCase().includes(searchQuery))
            );
        }

        if (filters.name.trim()) {
            const nameQuery = filters.name.toLowerCase().trim();
            result = result.filter(service =>
                service.name.toLowerCase().includes(nameQuery)
            );
        }

        if (filters.description.trim()) {
            const descQuery = filters.description.toLowerCase().trim();
            result = result.filter(service =>
                service.description && service.description.toLowerCase().includes(descQuery)
            );
        }

        if (filters.minPrice.trim()) {
            const minPrice = parseFloat(filters.minPrice);
            if (!isNaN(minPrice)) {
                result = result.filter(service => service.price.priceNetto >= minPrice);
            }
        }

        if (filters.maxPrice.trim()) {
            const maxPrice = parseFloat(filters.maxPrice);
            if (!isNaN(maxPrice)) {
                result = result.filter(service => service.price.priceNetto <= maxPrice);
            }
        }

        if (filters.vatRate.trim()) {
            const vatRate = parseFloat(filters.vatRate);
            if (!isNaN(vatRate)) {
                result = result.filter(service => service.vatRate === vatRate);
            }
        }

        return result;
    }, [services, filters]);

    const hasActiveFilters = () => {
        return Object.values(filters).some(value => value.trim() !== '');
    };

    const clearAllFilters = () => {
        setFilters({
            searchQuery: '',
            name: '',
            description: '',
            minPrice: '',
            maxPrice: '',
            vatRate: ''
        });
    };

    const handleAddService = () => {
        setEditingService({
            id: '',
            name: '',
            description: '',
            priceInput: {
                inputPrice: 0,
                inputType: PriceType.NET
            },
            vatRate: defaultVatRate
        });
        setShowModal(true);
    };

    const handleEditService = (service: Service) => {
        // Konwertuj Service (z PriceResponse) na ServiceFormData (z ServicePriceInput)
        // Domyślnie używamy ceny netto jako inputPrice
        setEditingService({
            id: service.id,
            name: service.name,
            description: service.description,
            priceInput: {
                inputPrice: service.price.priceNetto,
                inputType: PriceType.NET
            },
            vatRate: service.vatRate
        });
        setShowModal(true);
    };

    const handleDeleteService = async (serviceId: string, serviceName: string) => {
        const performDelete = async () => {
            try {
                const result = await servicesApi.deleteService(serviceId);
                if (result) {
                    setServices(services.filter(service => service.id !== serviceId));
                }
                hideConfirmation();
            } catch (err) {
                setError('Nie udało się usunąć usługi.');
            }
        };

        showConfirmation({
            title: 'Usuwanie usługi',
            message: `Czy na pewno chcesz usunąć usługę "${serviceName}"? Ta operacja jest nieodwracalna.`,
            confirmText: 'Usuń',
            cancelText: 'Anuluj',
            onConfirm: performDelete
        });
    };

    const handleSaveService = async (formData: ServiceFormData) => {
        try {
            // Konwertuj ServiceFormData na ServiceData dla API
            const serviceData: ServiceData = {
                name: formData.name,
                description: formData.description,
                price: formData.priceInput,
                vatRate: formData.vatRate
            };

            let savedService: Service;

            if (formData.id) {
                savedService = await servicesApi.updateService(formData.id, serviceData);
                setServices(services.map(s => s.id === savedService.id ? savedService : s));
            } else {
                try {
                    savedService = await servicesApi.createService(serviceData);
                    if (savedService) {
                        setServices([...services, savedService]);
                    }
                } catch (error) {
                    console.error('Błąd podczas tworzenia usługi:', error);
                    setError('Nie udało się zapisać usługi w bazie danych.');
                    throw error;
                }
            }

            setShowModal(false);
            setEditingService(null);
        } catch (err) {
            console.error('Nie udało się zapisać usługi:', err);
            setError('Nie udało się zapisać usługi.');
        }
    };

    const columns: TableColumn[] = [
        { id: 'name', label: 'Nazwa', width: '25%', sortable: true },
        { id: 'description', label: 'Opis', width: '35%', sortable: true },
        { id: 'price', label: 'Cena netto', width: '12%', sortable: true },
        { id: 'vatRate', label: 'VAT', width: '8%', sortable: true },
        { id: 'grossPrice', label: 'Brutto', width: '12%', sortable: true },
        { id: 'actions', label: ' ', width: '8%', sortable: false },
    ];
    // SUMA: 25 + 35 + 12 + 8 + 12 + 8 = 100%

    const renderCell = (service: Service, columnId: string): React.ReactNode => {
        switch (columnId) {
            case 'name':
                return (
                    <ServiceNameCell>
                        <ServiceName title={service.name}>
                            {service.name}
                        </ServiceName>
                    </ServiceNameCell>
                );
            case 'description':
                return (
                    <ServiceDescription title={service.description || ''}>
                        {service.description || '—'}
                    </ServiceDescription>
                );
            case 'price':
                return (
                    <PriceCell>
                        {service.price.priceNetto.toFixed(2)} zł
                    </PriceCell>
                );
            case 'vatRate':
                return <VatCell><VatBadge>{service.vatRate}%</VatBadge></VatCell>;
            case 'grossPrice':
                return (
                    <PriceCell $total>
                        {service.price.priceBrutto.toFixed(2)} zł
                    </PriceCell>
                );
            case 'actions':
                const menuItems: ContextMenuItem[] = [
                    {
                        id: 'edit',
                        label: 'Edytuj',
                        icon: FaEdit,
                        onClick: () => handleEditService(service),
                        variant: 'default',
                    },
                    {
                        id: 'delete',
                        label: 'Usuń',
                        icon: FaTrash,
                        onClick: () => handleDeleteService(service.id, service.name),
                        variant: 'danger',
                    }
                ];

                return (
                    <ActionMenuContainer>
                        <ContextMenu items={menuItems} size="small" />
                    </ActionMenuContainer>
                );
            default:
                const value = service[columnId as keyof Service];
                if (value === null || value === undefined) return '';
                return String(value);
        }
    };

    const emptyStateConfig = {
        icon: FaWrench,
        title: 'Brak usług',
        description: 'Nie masz jeszcze żadnych usług w systemie',
        actionText: 'Kliknij przycisk "Dodaj usługę", aby utworzyć pierwszą usługę'
    };

    const headerActions: HeaderAction[] = [
        {
            id: 'filters',
            label: 'Filtry',
            icon: FaFilter,
            onClick: () => setShowFilters(!showFilters),
            variant: 'filter',
            active: showFilters,
            badge: hasActiveFilters()
        },
        {
            id: 'add',
            label: 'Dodaj usługę',
            icon: FaPlus,
            onClick: handleAddService,
            variant: 'primary'
        }
    ];

    const filtersComponent = (
        <EnhancedServiceFilters
            filters={filters}
            showFilters={showFilters}
            hasActiveFilters={hasActiveFilters()}
            onFiltersChange={setFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onClearFilters={clearAllFilters}
            resultCount={filteredServices.length}
        />
    );

    return (
        <ContentContainer>
            {error && (
                <ErrorMessage>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                    <CloseErrorButton onClick={() => setError(null)}>
                        <FaTimes />
                    </CloseErrorButton>
                </ErrorMessage>
            )}

            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie usług...</LoadingText>
                </LoadingContainer>
            ) : (
                <DataTable
                    data={filteredServices}
                    columns={columns}
                    title="Lista usług"
                    emptyStateConfig={emptyStateConfig}
                    renderCell={renderCell}
                    enableDragAndDrop={true}
                    enableViewToggle={false}
                    storageKeys={{
                        viewMode: 'services_view_mode',
                        columnOrder: 'services_column_order'
                    }}
                    headerActions={headerActions}
                    expandableContent={filtersComponent}
                    expandableVisible={showFilters}
                />
            )}

            {showModal && editingService && (
                <ServiceFormModal
                    serviceFormData={editingService}
                    defaultVatRate={defaultVatRate}
                    onSave={handleSaveService}
                    onCancel={() => {
                        setShowModal(false);
                        setEditingService(null);
                    }}
                />
            )}

            <ConfirmationDialog
                isOpen={confirmationState.isOpen}
                title={confirmationState.title}
                message={confirmationState.message}
                confirmText={confirmationState.confirmText}
                cancelText={confirmationState.cancelText}
                onConfirm={confirmationState.onConfirm}
                onCancel={hideConfirmation}
            />
        </ContentContainer>
    );
});

// Komponent filtrów
interface EnhancedServiceFiltersProps {
    filters: ServiceFilters;
    showFilters: boolean;
    hasActiveFilters: boolean;
    onFiltersChange: (filters: ServiceFilters) => void;
    onToggleFilters: () => void;
    onClearFilters: () => void;
    resultCount: number;
}

const EnhancedServiceFilters: React.FC<EnhancedServiceFiltersProps> = ({
                                                                           filters,
                                                                           hasActiveFilters,
                                                                           onFiltersChange,
                                                                           onClearFilters,
                                                                           resultCount
                                                                       }) => {
    const handleFilterChange = (field: keyof ServiceFilters, value: string) => {
        onFiltersChange({
            ...filters,
            [field]: value
        });
    };

    return (
        <FiltersContainer>
            <FiltersContent>
                <AdvancedFiltersSection>
                    <FiltersGrid>
                        <FormGroup>
                            <Label>Nazwa usługi</Label>
                            <Input
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                placeholder="Filtruj po nazwie..."
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Opis</Label>
                            <Input
                                value={filters.description}
                                onChange={(e) => handleFilterChange('description', e.target.value)}
                                placeholder="Filtruj po opisie..."
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Cena min. (zł netto)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                placeholder="Od..."
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Cena maks. (zł netto)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                placeholder="Do..."
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Stawka VAT (%)</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={filters.vatRate}
                                onChange={(e) => handleFilterChange('vatRate', e.target.value)}
                                placeholder="Stawka VAT..."
                            />
                        </FormGroup>
                    </FiltersGrid>

                    {hasActiveFilters && (
                        <FiltersActions>
                            <ClearButton onClick={onClearFilters}>
                                <FaTimes />
                                Wyczyść wszystkie
                            </ClearButton>
                        </FiltersActions>
                    )}
                </AdvancedFiltersSection>

                <ResultsCounter>
                    Znaleziono: <strong>{resultCount}</strong> {resultCount === 1 ? 'usługę' : resultCount > 1 && resultCount < 5 ? 'usługi' : 'usług'}
                </ResultsCounter>
            </FiltersContent>
        </FiltersContainer>
    );
};

// Modal formularza
interface ServiceFormModalProps {
    serviceFormData: ServiceFormData;
    defaultVatRate: number;
    onSave: (formData: ServiceFormData) => void;
    onCancel: () => void;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
                                                               serviceFormData,
                                                               defaultVatRate,
                                                               onSave,
                                                               onCancel
                                                           }) => {
    const [formData, setFormData] = useState<ServiceFormData>(serviceFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Funkcja do lokalnego obliczania podglądu cen (tylko dla UI)
    const calculatePreviewPrices = () => {
        const { inputPrice, inputType } = formData.priceInput;
        const vatMultiplier = 1 + formData.vatRate / 100;

        let netPrice: number;
        let grossPrice: number;

        if (inputType === PriceType.NET) {
            netPrice = inputPrice;
            grossPrice = inputPrice * vatMultiplier;
        } else {
            grossPrice = inputPrice;
            netPrice = inputPrice / vatMultiplier;
        }

        const taxAmount = grossPrice - netPrice;

        return { netPrice, grossPrice, taxAmount };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'inputPrice') {
            // Pozwalamy na puste pole - wtedy pojawi się placeholder
            if (value === '') {
                setFormData({
                    ...formData,
                    priceInput: {
                        ...formData.priceInput,
                        inputPrice: 0
                    }
                });
            } else {
                // Walidacja: tylko liczby z maksymalnie 2 miejscami po przecinku, bez leading zeros
                // Dozwolone: 0, 0., 0.5, 0.50, 1, 10, 123.45 itd.
                // Niedozwolone: 01, 001, 0123 itd.
                const regex = /^(0(\.\d{0,2})?|[1-9]\d*(\.\d{0,2})?)$/;
                if (regex.test(value)) {
                    const numValue = parseFloat(value);
                    setFormData({
                        ...formData,
                        priceInput: {
                            ...formData.priceInput,
                            inputPrice: numValue
                        }
                    });
                }
            }
        } else if (name === 'inputType') {
            setFormData({
                ...formData,
                priceInput: {
                    ...formData.priceInput,
                    inputType: value as PriceType
                }
            });
        } else if (name === 'vatRate') {
            const numValue = parseFloat(value);
            setFormData({
                ...formData,
                vatRate: isNaN(numValue) ? 0 : numValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Nazwa usługi jest wymagana';
        }

        if (formData.name.length > 100) {
            errors.name = 'Nazwa nie może przekraczać 100 znaków';
        }

        if (formData.description && formData.description.length > 500) {
            errors.description = 'Opis nie może przekraczać 500 znaków';
        }

        if (formData.priceInput.inputPrice < 0) {
            errors.inputPrice = 'Cena nie może być ujemna';
        }

        // Sprawdź, czy cena ma maksymalnie 2 miejsca po przecinku
        const priceString = formData.priceInput.inputPrice.toString();
        const decimalPart = priceString.split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
            errors.inputPrice = 'Cena może mieć maksymalnie 2 miejsca po przecinku';
        }

        if (formData.vatRate < 0 || formData.vatRate > 100) {
            errors.vatRate = 'Stawka VAT musi być wartością od 0 do 100';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Zaokrąglij cenę do 2 miejsc po przecinku przed zapisem
            const roundedFormData = {
                ...formData,
                priceInput: {
                    ...formData.priceInput,
                    inputPrice: Math.round(formData.priceInput.inputPrice * 100) / 100
                }
            };
            onSave(roundedFormData);
        }
    };

    const { netPrice, grossPrice, taxAmount } = calculatePreviewPrices();

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <h2>{serviceFormData.id ? 'Edytuj usługę' : 'Dodaj nową usługę'}</h2>
                    <CloseButton onClick={onCancel}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="name">Nazwa usługi*</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nazwa usługi"
                                maxLength={100}
                                required
                            />
                            {formErrors.name && <ErrorText>{formErrors.name}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="description">Opis usługi</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                placeholder="Opis usługi"
                                maxLength={500}
                                rows={3}
                            />
                            {formErrors.description && <ErrorText>{formErrors.description}</ErrorText>}
                        </FormGroup>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="inputType">Typ ceny*</Label>
                                <Select
                                    id="inputType"
                                    name="inputType"
                                    value={formData.priceInput.inputType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value={PriceType.NET}>Cena netto</option>
                                    <option value={PriceType.GROSS}>Cena brutto</option>
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="inputPrice">
                                    {formData.priceInput.inputType === PriceType.NET ? 'Cena netto (zł)*' : 'Cena brutto (zł)*'}
                                </Label>
                                <Input
                                    id="inputPrice"
                                    name="inputPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.priceInput.inputPrice || ''}
                                    onChange={handleChange}
                                    placeholder="np. 99.99"
                                    required
                                />
                                {formErrors.inputPrice && <ErrorText>{formErrors.inputPrice}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormGroup>
                            <Label htmlFor="vatRate">
                                Stawka VAT (%)*
                                <HelpText>Domyślnie: {defaultVatRate}%</HelpText>
                            </Label>
                            <Input
                                id="vatRate"
                                name="vatRate"
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={formData.vatRate}
                                onChange={handleChange}
                                required
                            />
                            {formErrors.vatRate && <ErrorText>{formErrors.vatRate}</ErrorText>}
                        </FormGroup>

                        <PriceSummarySection>
                            <PriceSummaryTitle>Podgląd cen:</PriceSummaryTitle>
                            <PriceRow>
                                <PriceLabel>Cena netto:</PriceLabel>
                                <PriceValue>{netPrice.toFixed(2)} zł</PriceValue>
                            </PriceRow>
                            <PriceRow>
                                <PriceLabel>VAT ({formData.vatRate}%):</PriceLabel>
                                <PriceValue>{taxAmount.toFixed(2)} zł</PriceValue>
                            </PriceRow>
                            <PriceRow $highlight>
                                <PriceLabel>Cena brutto:</PriceLabel>
                                <PriceValue>{grossPrice.toFixed(2)} zł</PriceValue>
                            </PriceRow>
                        </PriceSummarySection>

                        <ButtonGroup>
                            <SecondaryButton type="button" onClick={onCancel}>
                                Anuluj
                            </SecondaryButton>
                            <PrimaryButton type="submit">
                                <FaSave />
                                {serviceFormData.id ? 'Zapisz zmiany' : 'Dodaj usługę'}
                            </PrimaryButton>
                        </ButtonGroup>
                    </Form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${settingsTheme.spacing.xl} ${settingsTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
        gap: ${settingsTheme.spacing.md};
    }
`;

const ServiceNameCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    min-width: 0;
    padding-left: ${settingsTheme.spacing.sm}; // ZMIANA: Dodany padding
`;

const ServiceName = styled.div`
    font-weight: 500;
    color: ${settingsTheme.text.primary};
    font-size: 14px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ServiceDescription = styled.div`
    color: ${settingsTheme.text.secondary};
    font-size: 12px;
    line-height: 1.35;
    font-weight: 400;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 30px;
`;

const PriceCell = styled.div<{ $total?: boolean }>`
    font-weight: ${props => props.$total ? '600' : '500'};
    color: ${props => props.$total ? settingsTheme.primary : settingsTheme.text.primary};
    font-size: 14px;
    text-align: right;
    font-family: monospace;
    white-space: nowrap;
`;

const VatCell = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
`;

const VatBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    border-radius: ${settingsTheme.radius.sm};
    font-size: 12px;
    font-weight: 500;
    background-color: ${settingsTheme.surfaceAlt};
    color: ${settingsTheme.text.secondary};
    border: 1px solid ${settingsTheme.border};
    min-width: 40px;
`;

const ActionMenuContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.status.errorLight};
    color: ${settingsTheme.status.error};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.lg};
    border: 1px solid ${settingsTheme.status.error}30;
    font-weight: 500;
    box-shadow: ${settingsTheme.shadow.xs};
`;

const ErrorIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorText = styled.div`
    flex: 1;
    color: ${settingsTheme.status.error};
    font-size: 12px;
    font-weight: 500;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
`;

const CloseErrorButton = styled.button`
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: ${settingsTheme.spacing.xs};
    border-radius: ${settingsTheme.radius.sm};
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.status.error}20;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${settingsTheme.spacing.xxl};
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    gap: ${settingsTheme.spacing.md};
    min-height: 400px;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${settingsTheme.borderLight};
    border-top: 3px solid ${settingsTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const FiltersContainer = styled.div`
    padding: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surfaceAlt};
    border-top: 1px solid ${settingsTheme.border};
`;

const FiltersContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.md};
`;

const AdvancedFiltersSection = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.lg};
    padding: ${settingsTheme.spacing.lg};
    border: 1px solid ${settingsTheme.border};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${settingsTheme.spacing.md};
    margin-bottom: ${settingsTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: ${settingsTheme.text.primary};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Input = styled.input`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 400;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
    }
`;

const Select = styled.select`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 400;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all 0.2s ease;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${settingsTheme.spacing.sm};
    padding-top: ${settingsTheme.spacing.md};
    border-top: 1px solid ${settingsTheme.border};
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${settingsTheme.status.error};
        color: ${settingsTheme.status.error};
        background: ${settingsTheme.status.errorLight};
    }
`;

const ResultsCounter = styled.div`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    font-weight: 400;
    text-align: center;
    padding: ${settingsTheme.spacing.sm} 0;

    strong {
        color: ${settingsTheme.primary};
        font-weight: 600;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: ${settingsTheme.spacing.lg};
    backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
    background-color: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    box-shadow: ${settingsTheme.shadow.xl};
    width: 95vw;
    max-width: 600px;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.xl};
    border-bottom: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surfaceAlt};

    h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: ${settingsTheme.text.primary};
        letter-spacing: -0.025em;
    }
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: ${settingsTheme.surfaceHover};
    color: ${settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 18px;

    &:hover {
        background: ${settingsTheme.status.errorLight};
        color: ${settingsTheme.status.error};
    }
`;

const ModalBody = styled.div`
    overflow-y: auto;
    flex: 1;
    padding: ${settingsTheme.spacing.xl};
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

const FormRow = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.md};

    > ${FormGroup} {
        flex: 1;
    }

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const Textarea = styled.textarea`
    min-height: 80px;
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 400;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all 0.2s ease;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
    }
`;

const HelpText = styled.span`
    font-size: 12px;
    color: ${settingsTheme.text.muted};
    font-weight: 400;
`;

const PriceSummarySection = styled.div`
    padding: ${settingsTheme.spacing.md};
    background-color: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.md};
    border: 2px solid ${settingsTheme.primaryGhost};
`;

const PriceSummaryTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin-bottom: ${settingsTheme.spacing.sm};
`;

const PriceRow = styled.div<{ $highlight?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${settingsTheme.spacing.xs} 0;

    ${props => props.$highlight && `
        margin-top: ${settingsTheme.spacing.xs};
        padding-top: ${settingsTheme.spacing.sm};
        border-top: 1px solid ${settingsTheme.border};
    `}
`;

const PriceLabel = styled.span`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    font-weight: 400;
`;

const PriceValue = styled.span`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.primary};
    font-family: monospace;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${settingsTheme.spacing.sm};
    margin-top: ${settingsTheme.spacing.md};
    padding-top: ${settingsTheme.spacing.lg};
    border-top: 1px solid ${settingsTheme.border};

    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    border-color: ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.xs};

    &:hover {
        background: ${settingsTheme.surfaceHover};
        color: ${settingsTheme.text.primary};
        border-color: ${settingsTheme.borderHover};
        box-shadow: ${settingsTheme.shadow.sm};
        transform: translateY(-1px);
    }

    @media (max-width: 576px) {
        justify-content: center;
        order: 2;
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${settingsTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
        box-shadow: ${settingsTheme.shadow.md};
        transform: translateY(-1px);
    }

    @media (max-width: 576px) {
        justify-content: center;
        order: 1;
    }
`;

export default ServicesPage;