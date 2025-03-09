import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { Service } from '../../types';
import {
    fetchServices,
    addService,
    updateService,
    deleteService,
    fetchDefaultVatRate
} from '../../api/mocks/servicesMocks';

// Interfejs dla filtrów
interface ServiceFilters {
    name: string;
    description: string;
    minPrice: string;
    maxPrice: string;
    vatRate: string;
}

const ServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [filters, setFilters] = useState<ServiceFilters>({
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
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [defaultVatRate, setDefaultVatRate] = useState(23);

    // Pobieranie listy usług i domyślnej stawki VAT
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Równoległe pobieranie danych dla lepszej wydajności
                const [servicesData, vatRateData] = await Promise.all([
                    fetchServices(),
                    fetchDefaultVatRate()
                ]);

                setServices(servicesData);
                setFilteredServices(servicesData);
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

    // Obsługa wyszukiwania
    useEffect(() => {
        // Filtrowanie usług na podstawie kryteriów
        let result = [...services];

        // Filtrowanie po nazwie
        if (filters.name.trim()) {
            const nameQuery = filters.name.toLowerCase().trim();
            result = result.filter(service =>
                service.name.toLowerCase().includes(nameQuery)
            );
        }

        // Filtrowanie po opisie
        if (filters.description.trim()) {
            const descQuery = filters.description.toLowerCase().trim();
            result = result.filter(service =>
                service.description.toLowerCase().includes(descQuery)
            );
        }

        // Filtrowanie po minimalnej cenie
        if (filters.minPrice.trim()) {
            const minPrice = parseFloat(filters.minPrice);
            if (!isNaN(minPrice)) {
                result = result.filter(service => service.price >= minPrice);
            }
        }

        // Filtrowanie po maksymalnej cenie
        if (filters.maxPrice.trim()) {
            const maxPrice = parseFloat(filters.maxPrice);
            if (!isNaN(maxPrice)) {
                result = result.filter(service => service.price <= maxPrice);
            }
        }

        // Filtrowanie po stawce VAT
        if (filters.vatRate.trim()) {
            const vatRate = parseFloat(filters.vatRate);
            if (!isNaN(vatRate)) {
                result = result.filter(service => service.vatRate === vatRate);
            }
        }

        setFilteredServices(result);
    }, [services, filters]);

    // Obsługa zmiany filtrów
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Resetowanie filtrów
    const resetFilters = () => {
        setFilters({
            name: '',
            description: '',
            minPrice: '',
            maxPrice: '',
            vatRate: ''
        });
    };

    // Sprawdzenie czy jakiekolwiek filtry są aktywne
    const hasActiveFilters = () => {
        return Object.values(filters).some(value => value.trim() !== '');
    };

    // Obsługa dodawania nowej usługi
    const handleAddService = () => {
        setEditingService({
            id: '',
            name: '',
            description: '',
            price: 0,
            vatRate: defaultVatRate
        });
        setShowModal(true);
    };

    // Obsługa edycji istniejącej usługi
    const handleEditService = (service: Service) => {
        setEditingService({...service});
        setShowModal(true);
    };

    // Obsługa usuwania usługi
    const handleDeleteService = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę usługę?')) {
            try {
                const result = await deleteService(id);

                if (result) {
                    // Aktualizacja stanu lokalnego po pomyślnym usunięciu
                    setServices(services.filter(service => service.id !== id));
                }
            } catch (err) {
                setError('Nie udało się usunąć usługi.');
            }
        }
    };

    // Obsługa zapisu usługi (dodawanie lub aktualizacja)
    const handleSaveService = async (service: Service) => {
        try {
            let savedService: Service;

            if (service.id) {
                // Aktualizacja istniejącej usługi
                savedService = await updateService(service);
                // Aktualizacja stanu lokalnego
                setServices(services.map(s => s.id === savedService.id ? savedService : s));
            } else {
                // Dodanie nowej usługi
                const { id, ...serviceWithoutId } = service;
                savedService = await addService(serviceWithoutId);
                // Aktualizacja stanu lokalnego
                setServices([...services, savedService]);
            }

            setShowModal(false);
            setEditingService(null);
        } catch (err) {
            setError('Nie udało się zapisać usługi.');
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <h1>Lista usług i prac</h1>
                <HeaderActions>
                    <FilterToggle onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter /> {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
                    </FilterToggle>
                    <AddButton onClick={handleAddService}>
                        <FaPlus /> Dodaj usługę
                    </AddButton>
                </HeaderActions>
            </PageHeader>

            {showFilters && (
                <FiltersContainer>
                    <FiltersGrid>
                        <FilterGroup>
                            <Label htmlFor="filter-name">Nazwa usługi</Label>
                            <FilterInput
                                id="filter-name"
                                name="name"
                                value={filters.name}
                                onChange={handleFilterChange}
                                placeholder="Filtruj po nazwie..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="filter-description">Opis</Label>
                            <FilterInput
                                id="filter-description"
                                name="description"
                                value={filters.description}
                                onChange={handleFilterChange}
                                placeholder="Filtruj po opisie..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="filter-min-price">Cena min. (zł)</Label>
                            <FilterInput
                                id="filter-min-price"
                                name="minPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                placeholder="Od..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="filter-max-price">Cena maks. (zł)</Label>
                            <FilterInput
                                id="filter-max-price"
                                name="maxPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                placeholder="Do..."
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <Label htmlFor="filter-vat">Stawka VAT (%)</Label>
                            <FilterInput
                                id="filter-vat"
                                name="vatRate"
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={filters.vatRate}
                                onChange={handleFilterChange}
                                placeholder="Stawka VAT..."
                            />
                        </FilterGroup>
                    </FiltersGrid>

                    <FiltersActions>
                        {hasActiveFilters() && (
                            <FilterResults>
                                Znaleziono: {filteredServices.length} {
                                filteredServices.length === 1 ? 'usługę' :
                                    (filteredServices.length > 1 && filteredServices.length < 5) ? 'usługi' : 'usług'
                            }
                            </FilterResults>
                        )}

                        <ClearFiltersButton
                            onClick={resetFilters}
                            disabled={!hasActiveFilters()}
                        >
                            <FaTimes /> Wyczyść filtry
                        </ClearFiltersButton>
                    </FiltersActions>
                </FiltersContainer>
            )}

            {loading ? (
                <LoadingMessage>Ładowanie danych...</LoadingMessage>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <>
                    {services.length === 0 ? (
                        <EmptyState>
                            <p>Brak zdefiniowanych usług. Kliknij "Dodaj usługę", aby utworzyć pierwszą.</p>
                        </EmptyState>
                    ) : filteredServices.length === 0 && hasActiveFilters() ? (
                        <EmptyState>
                            <p>Nie znaleziono usług spełniających kryteria filtrowania.</p>
                        </EmptyState>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Nazwa</TableHeader>
                                        <TableHeader>Opis</TableHeader>
                                        <TableHeader>Cena netto</TableHeader>
                                        <TableHeader>VAT</TableHeader>
                                        <TableHeader>Cena brutto</TableHeader>
                                        <TableHeader>Akcje</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredServices.map(service => (
                                        <TableRow key={service.id}>
                                            <TableCell>{service.name}</TableCell>
                                            <TableCell>{service.description}</TableCell>
                                            <TableCell>{service.price.toFixed(2)} zł</TableCell>
                                            <TableCell>{service.vatRate}%</TableCell>
                                            <TableCell>
                                                {(service.price * (1 + service.vatRate / 100)).toFixed(2)} zł
                                            </TableCell>
                                            <TableCell>
                                                <ActionButtons>
                                                    <ActionButton onClick={() => handleEditService(service)}>
                                                        <FaEdit />
                                                    </ActionButton>
                                                    <ActionButton onClick={() => handleDeleteService(service.id)}>
                                                        <FaTrash />
                                                    </ActionButton>
                                                </ActionButtons>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}

            {showModal && editingService && (
                <ServiceFormModal
                    service={editingService}
                    defaultVatRate={defaultVatRate}
                    onSave={handleSaveService}
                    onCancel={() => {
                        setShowModal(false);
                        setEditingService(null);
                    }}
                />
            )}
        </PageContainer>
    );
};

// Komponent modalu do dodawania/edycji usługi
interface ServiceFormModalProps {
    service: Service;
    defaultVatRate: number;
    onSave: (service: Service) => void;
    onCancel: () => void;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
                                                               service,
                                                               defaultVatRate,
                                                               onSave,
                                                               onCancel
                                                           }) => {
    const [formData, setFormData] = useState<Service>(service);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Parsowanie wartości liczbowych
        if (name === 'price' || name === 'vatRate') {
            const numValue = parseFloat(value);
            setFormData({
                ...formData,
                [name]: isNaN(numValue) ? 0 : numValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // Usuwanie błędów przy edycji pola
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

        if (formData.price < 0) {
            errors.price = 'Cena nie może być ujemna';
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
            onSave(formData);
        }
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <h2>{service.id ? 'Edytuj usługę' : 'Dodaj nową usługę'}</h2>
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
                                required
                            />
                            {formErrors.name && <ErrorText>{formErrors.name}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="description">Opis usługi</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Opis usługi"
                                rows={3}
                            />
                        </FormGroup>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="price">Cena netto (zł)*</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                                {formErrors.price && <ErrorText>{formErrors.price}</ErrorText>}
                            </FormGroup>

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
                        </FormRow>

                        <FormGroup>
                            <Label>Cena brutto</Label>
                            <PriceSummary>
                                {(formData.price * (1 + formData.vatRate / 100)).toFixed(2)} zł
                            </PriceSummary>
                        </FormGroup>

                        <ButtonGroup>
                            <Button type="button" secondary onClick={onCancel}>
                                Anuluj
                            </Button>
                            <Button type="submit" primary>
                                {service.id ? 'Zapisz zmiany' : 'Dodaj usługę'}
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Style komponentów

const PageContainer = styled.div`
    padding: 20px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
        font-size: 24px;
        margin: 0;
    }
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: #2980b9;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
`;

const FilterToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #f9f9f9;
    color: #34495e;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const FiltersContainer = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 20px;
    border: 1px solid #eee;
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const FilterInput = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
`;

const FilterResults = styled.div`
    font-size: 14px;
    color: #7f8c8d;
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  
  &:hover:not(:disabled) {
    text-decoration: underline;
  }
  
  &:disabled {
    color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px;
    font-size: 16px;
    color: #7f8c8d;
`;

const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
`;

const EmptyState = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 30px;
    text-align: center;
    color: #7f8c8d;
`;

const TableContainer = styled.div`
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background-color: #f5f5f5;
    border-bottom: 2px solid #eee;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    &:not(:last-child) {
        border-bottom: 1px solid #eee;
    }

    &:hover {
        background-color: #f9f9f9;
    }
`;

const TableHeader = styled.th`
    text-align: left;
    padding: 12px 16px;
    font-weight: 600;
    color: #333;
`;

const TableCell = styled.td`
    padding: 12px 16px;
    vertical-align: middle;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    color: #7f8c8d;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;

    &:hover {
        color: #3498db;
    }
`;

// Style dla modalu

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
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 600px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;

    h2 {
        margin: 0;
        font-size: 18px;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #7f8c8d;

    &:hover {
        color: #34495e;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const FormRow = styled.div`
    display: flex;
    gap: 16px;

    > ${FormGroup} {
        flex: 1;
    }
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const HelpText = styled.span`
  font-size: 12px;
  color: #7f8c8d;
  font-weight: normal;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Textarea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const PriceSummary = styled.div`
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  color: #34495e;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
`;

const Button = styled.button<{ primary?: boolean; secondary?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  ${props => props.primary && `
    background-color: #3498db;
    color: white;
    border: 1px solid #3498db;
    
    &:hover {
      background-color: #2980b9;
      border-color: #2980b9;
    }
  `}
  
  ${props => props.secondary && `
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover {
      background-color: #f5f5f5;
    }
  `}
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;

export default ServicesPage;