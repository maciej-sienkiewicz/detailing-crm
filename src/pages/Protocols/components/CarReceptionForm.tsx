import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaPercent, FaTrash } from 'react-icons/fa';
import { CarReceptionProtocol, SelectedService } from '../../../types';
import { addCarReceptionProtocol, updateCarReceptionProtocol } from '../../../api/mocks/carReceptionMocks';

interface CarReceptionFormProps {
    protocol: CarReceptionProtocol | null;
    availableServices: Array<{ id: string; name: string; price: number }>;
    onSave: (protocol: CarReceptionProtocol) => void;
    onCancel: () => void;
}

export const CarReceptionForm: React.FC<CarReceptionFormProps> = ({
                                                                      protocol,
                                                                      availableServices,
                                                                      onSave,
                                                                      onCancel
                                                                  }) => {
    const today = new Date().toISOString().split('T')[0];

    // Inicjalizacja formularza z danymi protokołu lub pustym obiektem
    const [formData, setFormData] = useState<Partial<CarReceptionProtocol>>(
        protocol || {
            startDate: today,
            endDate: today,
            licensePlate: '',
            make: '',
            model: '',
            productionYear: new Date().getFullYear(),
            mileage: 0,
            keysProvided: true,
            documentsProvided: true,
            ownerName: '',
            companyName: '',
            taxId: '',
            email: '',
            phone: '',
            notes: '',
            selectedServices: []
        }
    );

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stan dla wyszukiwania usług
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; price: number }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<{ id: string; name: string; price: number } | null>(null);

    // Obliczanie sum w tabeli usług
    const totalPrice = (formData.selectedServices || []).reduce((sum, service) => sum + service.price, 0);
    const totalDiscount = (formData.selectedServices || []).reduce((sum, service) =>
        sum + (service.price * service.discount / 100), 0);
    const totalFinalPrice = (formData.selectedServices || []).reduce((sum, service) => sum + service.finalPrice, 0);

    // Wyszukiwanie usług na podstawie zapytania
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = availableServices.filter(service =>
            service.name.toLowerCase().includes(query) &&
            // Wykluczamy usługi, które są już wybrane
            !(formData.selectedServices || []).some(selected => selected.id === service.id)
        );

        setSearchResults(results);
    }, [searchQuery, availableServices, formData.selectedServices]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData({
                ...formData,
                [name]: checkbox.checked
            });
        } else if (name === 'productionYear' || name === 'mileage') {
            setFormData({
                ...formData,
                [name]: value ? parseInt(value, 10) : 0
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

    // Obsługa wyszukiwania usług
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowResults(true);
        setSelectedServiceToAdd(null);
    };

    // Wybór usługi z wyników wyszukiwania
    const handleSelectService = (service: { id: string; name: string; price: number }) => {
        setSelectedServiceToAdd(service);
        setSearchQuery(service.name);
        setShowResults(false);
    };

    // Dodanie wybranej usługi do tabeli
    const handleAddService = () => {
        if (!selectedServiceToAdd) return;

        const newService: SelectedService = {
            id: selectedServiceToAdd.id,
            name: selectedServiceToAdd.name,
            price: selectedServiceToAdd.price,
            discount: 0,
            finalPrice: selectedServiceToAdd.price
        };

        setFormData({
            ...formData,
            selectedServices: [...(formData.selectedServices || []), newService]
        });

        // Resetowanie pola wyszukiwania
        setSearchQuery('');
        setSelectedServiceToAdd(null);

        // Usuwanie błędu usług, jeśli istnieje
        if (formErrors.selectedServices) {
            setFormErrors({
                ...formErrors,
                selectedServices: ''
            });
        }
    };

    // Usunięcie usługi z tabeli
    const handleRemoveService = (serviceId: string) => {
        setFormData({
            ...formData,
            selectedServices: (formData.selectedServices || []).filter(s => s.id !== serviceId)
        });
    };

    // Aktualizacja rabatu usługi
    const handleDiscountChange = (serviceId: string, discount: number) => {
        if (discount < 0) discount = 0;
        if (discount > 100) discount = 100;

        const updatedServices = (formData.selectedServices || []).map(service => {
            if (service.id === serviceId) {
                const newDiscount = discount;
                const newFinalPrice = service.price - (service.price * newDiscount / 100);
                return {
                    ...service,
                    discount: newDiscount,
                    finalPrice: newFinalPrice
                };
            }
            return service;
        });

        setFormData({
            ...formData,
            selectedServices: updatedServices
        });
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.licensePlate?.trim()) {
            errors.licensePlate = 'Numer rejestracyjny jest wymagany';
        }

        if (!formData.make?.trim()) {
            errors.make = 'Marka pojazdu jest wymagana';
        }

        if (!formData.model?.trim()) {
            errors.model = 'Model pojazdu jest wymagany';
        }

        if (!formData.productionYear || formData.productionYear < 1900 || formData.productionYear > new Date().getFullYear() + 1) {
            errors.productionYear = 'Podaj prawidłowy rok produkcji';
        }

        if (!formData.mileage && formData.mileage !== 0) {
            errors.mileage = 'Przebieg jest wymagany';
        }

        if (!formData.ownerName?.trim()) {
            errors.ownerName = 'Imię i nazwisko właściciela jest wymagane';
        }

        if (!formData.email?.trim()) {
            errors.email = 'Adres email jest wymagany';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Podaj prawidłowy adres email';
        }

        if (!formData.phone?.trim()) {
            errors.phone = 'Numer telefonu jest wymagany';
        }

        if (!formData.startDate) {
            errors.startDate = 'Data rozpoczęcia usługi jest wymagana';
        }

        if (!formData.endDate) {
            errors.endDate = 'Data zakończenia usługi jest wymagana';
        } else if (formData.startDate && formData.endDate < formData.startDate) {
            errors.endDate = 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia';
        }

        if (!formData.selectedServices || formData.selectedServices.length === 0) {
            errors.selectedServices = 'Wybierz co najmniej jedną usługę';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let savedProtocol: CarReceptionProtocol;

            if (protocol?.id) {
                // Aktualizacja istniejącego protokołu
                savedProtocol = await updateCarReceptionProtocol({
                    ...(formData as CarReceptionProtocol),
                    id: protocol.id,
                    createdAt: protocol.createdAt,
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Dodanie nowego protokołu
                savedProtocol = await addCarReceptionProtocol(formData as Omit<CarReceptionProtocol, 'id' | 'createdAt' | 'updatedAt'>);
            }

            onSave(savedProtocol);
        } catch (err) {
            setError('Nie udało się zapisać protokołu. Spróbuj ponownie.');
            console.error('Error saving protocol:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <FormHeader>
                <h2>{protocol ? 'Edycja protokołu przyjęcia pojazdu' : 'Nowy protokół przyjęcia pojazdu'}</h2>
            </FormHeader>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleSubmit}>
                <FormSection>
                    <SectionTitle>Dane usługi</SectionTitle>
                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="startDate">Data rozpoczęcia*</Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                value={formData.startDate || ''}
                                onChange={handleChange}
                                required
                            />
                            {formErrors.startDate && <ErrorText>{formErrors.startDate}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="endDate">Data zakończenia*</Label>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                value={formData.endDate || ''}
                                onChange={handleChange}
                                required
                            />
                            {formErrors.endDate && <ErrorText>{formErrors.endDate}</ErrorText>}
                        </FormGroup>
                    </FormRow>
                </FormSection>

                <FormSection>
                    <SectionTitle>Dane pojazdu</SectionTitle>
                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="licensePlate">Tablica rejestracyjna*</Label>
                            <Input
                                id="licensePlate"
                                name="licensePlate"
                                value={formData.licensePlate || ''}
                                onChange={handleChange}
                                placeholder="np. WA12345"
                                required
                            />
                            {formErrors.licensePlate && <ErrorText>{formErrors.licensePlate}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="make">Marka*</Label>
                            <Input
                                id="make"
                                name="make"
                                value={formData.make || ''}
                                onChange={handleChange}
                                placeholder="np. Audi"
                                required
                            />
                            {formErrors.make && <ErrorText>{formErrors.make}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="model">Model*</Label>
                            <Input
                                id="model"
                                name="model"
                                value={formData.model || ''}
                                onChange={handleChange}
                                placeholder="np. A6"
                                required
                            />
                            {formErrors.model && <ErrorText>{formErrors.model}</ErrorText>}
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="productionYear">Rok produkcji*</Label>
                            <Input
                                id="productionYear"
                                name="productionYear"
                                type="number"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                value={formData.productionYear || ''}
                                onChange={handleChange}
                                required
                            />
                            {formErrors.productionYear && <ErrorText>{formErrors.productionYear}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="mileage">Przebieg (km)*</Label>
                            <Input
                                id="mileage"
                                name="mileage"
                                type="number"
                                min="0"
                                value={formData.mileage || ''}
                                onChange={handleChange}
                                required
                            />
                            {formErrors.mileage && <ErrorText>{formErrors.mileage}</ErrorText>}
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <CheckboxGroup>
                            <CheckboxLabel>
                                <Checkbox
                                    name="keysProvided"
                                    checked={formData.keysProvided || false}
                                    onChange={handleChange}
                                    type="checkbox"
                                />
                                Przekazano kluczyk
                            </CheckboxLabel>
                        </CheckboxGroup>

                        <CheckboxGroup>
                            <CheckboxLabel>
                                <Checkbox
                                    name="documentsProvided"
                                    checked={formData.documentsProvided || false}
                                    onChange={handleChange}
                                    type="checkbox"
                                />
                                Przekazano dokumenty
                            </CheckboxLabel>
                        </CheckboxGroup>
                    </FormRow>
                </FormSection>

                <FormSection>
                    <SectionTitle>Dane właściciela</SectionTitle>
                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="ownerName">Imię i nazwisko*</Label>
                            <Input
                                id="ownerName"
                                name="ownerName"
                                value={formData.ownerName || ''}
                                onChange={handleChange}
                                placeholder="np. Jan Kowalski"
                                required
                            />
                            {formErrors.ownerName && <ErrorText>{formErrors.ownerName}</ErrorText>}
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="companyName">Nazwa firmy</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                value={formData.companyName || ''}
                                onChange={handleChange}
                                placeholder="np. AutoFirma Sp. z o.o."
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="taxId">NIP</Label>
                            <Input
                                id="taxId"
                                name="taxId"
                                value={formData.taxId || ''}
                                onChange={handleChange}
                                placeholder="np. 1234567890"
                            />
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="email">Email*</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                placeholder="np. jan.kowalski@example.com"
                                required
                            />
                            {formErrors.email && <ErrorText>{formErrors.email}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="phone">Telefon*</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                placeholder="np. +48 123 456 789"
                                required
                            />
                            {formErrors.phone && <ErrorText>{formErrors.phone}</ErrorText>}
                        </FormGroup>
                    </FormRow>
                </FormSection>

                <FormSection>
                    <SectionTitle>Uwagi</SectionTitle>
                    <FormGroup>
                        <Label htmlFor="notes">Uwagi dodatkowe</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            placeholder="Dodatkowe informacje, uwagi, zalecenia..."
                            rows={4}
                        />
                    </FormGroup>
                </FormSection>

                <FormSection>
                    <SectionTitle>Lista usług</SectionTitle>
                    {formErrors.selectedServices && <ErrorText>{formErrors.selectedServices}</ErrorText>}

                    <SearchContainer>
                        <SearchInputGroup>
                            <SearchInputWrapper>
                                <SearchIcon>
                                    <FaSearch />
                                </SearchIcon>
                                <SearchInput
                                    type="text"
                                    placeholder="Wyszukaj usługę..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={() => setShowResults(true)}
                                />
                            </SearchInputWrapper>

                            {showResults && searchResults.length > 0 && (
                                <SearchResultsList>
                                    {searchResults.map(service => (
                                        <SearchResultItem
                                            key={service.id}
                                            onClick={() => handleSelectService(service)}
                                        >
                                            <div>{service.name}</div>
                                            <SearchResultPrice>{service.price.toFixed(2)} zł</SearchResultPrice>
                                        </SearchResultItem>
                                    ))}
                                </SearchResultsList>
                            )}
                        </SearchInputGroup>

                        <AddServiceButton
                            type="button"
                            onClick={handleAddService}
                            disabled={!selectedServiceToAdd}
                        >
                            <FaPlus /> Dodaj usługę
                        </AddServiceButton>
                    </SearchContainer>

                    <ServicesTableContainer>
                        <ServicesTable>
                            <thead>
                            <tr>
                                <TableHeader>Nazwa</TableHeader>
                                <TableHeader>Cena</TableHeader>
                                <TableHeader>Rabat (%)</TableHeader>
                                <TableHeader>Cena końcowa</TableHeader>
                                <TableHeader>Akcje</TableHeader>
                            </tr>
                            </thead>
                            <tbody>
                            {(formData.selectedServices || []).length === 0 ? (
                                <tr>
                                    <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                        Brak wybranych usług. Użyj pola wyszukiwania, aby dodać usługi.
                                    </TableCell>
                                </tr>
                            ) : (
                                (formData.selectedServices || []).map(service => (
                                    <tr key={service.id}>
                                        <TableCell>{service.name}</TableCell>
                                        <TableCell>{service.price.toFixed(2)} zł</TableCell>
                                        <TableCell>
                                            <DiscountContainer>
                                                <DiscountInput
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={service.discount}
                                                    onChange={(e) => handleDiscountChange(service.id, parseInt(e.target.value, 10) || 0)}
                                                />
                                                <DiscountIcon>
                                                    <FaPercent />
                                                </DiscountIcon>
                                            </DiscountContainer>
                                        </TableCell>
                                        <TableCell>{service.finalPrice.toFixed(2)} zł</TableCell>
                                        <TableCell>
                                            <ActionButton
                                                type="button"
                                                onClick={() => handleRemoveService(service.id)}
                                                title="Usuń usługę"
                                            >
                                                <FaTrash />
                                            </ActionButton>
                                        </TableCell>
                                    </tr>
                                ))
                            )}
                            </tbody>
                            <tfoot>
                            <tr>
                                <TableFooterCell>Suma:</TableFooterCell>
                                <TableFooterCell>{totalPrice.toFixed(2)} zł</TableFooterCell>
                                <TableFooterCell>{totalDiscount.toFixed(2)} zł</TableFooterCell>
                                <TableFooterCell>{totalFinalPrice.toFixed(2)} zł</TableFooterCell>
                                <TableFooterCell></TableFooterCell>
                            </tr>
                            </tfoot>
                        </ServicesTable>
                    </ServicesTableContainer>
                </FormSection>

                <FormActions>
                    <Button type="button" secondary onClick={onCancel}>
                        Anuluj
                    </Button>
                    <Button type="submit" primary disabled={loading}>
                        {loading ? 'Zapisywanie...' : (protocol ? 'Zapisz zmiany' : 'Utwórz protokół')}
                    </Button>
                </FormActions>
            </Form>
        </FormContainer>
    );
};

// Style komponentów

const FormContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px;
`;

const FormHeader = styled.div`
    padding: 16px 20px;
    border-bottom: 1px solid #eee;

    h2 {
        margin: 0;
        font-size: 18px;
        color: #34495e;
    }
`;

const Form = styled.form`
    padding: 20px;
`;

const FormSection = styled.section`
    margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    color: #3498db;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
`;

const FormRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 15px;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 15px;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 200px;

    @media (max-width: 768px) {
        min-width: 100%;
    }
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #333;
    margin-bottom: 6px;
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

const CheckboxGroup = styled.div`
    display: flex;
    align-items: center;
    margin-right: 20px;
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #34495e;
    cursor: pointer;
`;

const Checkbox = styled.input`
    margin-right: 8px;
    cursor: pointer;
`;

// Style dla wyszukiwania usług
const SearchContainer = styled.div`
    display: flex;
    margin-bottom: 20px;
    gap: 15px;
    align-items: flex-start;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SearchInputGroup = styled.div`
    position: relative;
    flex: 1;
`;

const SearchInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 12px;
    color: #95a5a6;
    font-size: 14px;
`;

const SearchInput = styled.input`
    padding: 10px 12px 10px 36px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const SearchResultsList = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 5;
    max-height: 200px;
    overflow-y: auto;
`;

const SearchResultItem = styled.div`
    padding: 10px 15px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;

    &:not(:last-child) {
        border-bottom: 1px solid #eee;
    }

    &:hover {
        background-color: #f5f5f5;
    }
`;

const SearchResultPrice = styled.div`
    font-weight: 500;
    color: #3498db;
`;

const AddServiceButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 15px;
    font-size: 14px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }

    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
        opacity: 0.7;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

// Style dla tabeli usług
const ServicesTableContainer = styled.div`
    margin-top: 10px;
    overflow-x: auto;
`;

const ServicesTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
`;

const TableHeader = styled.th`
    text-align: left;
    padding: 12px;
    background-color: #f5f5f5;
    border-bottom: 2px solid #eee;
    font-weight: 600;
    color: #333;
`;

const TableCell = styled.td`
    padding: 12px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
`;

const TableFooterCell = styled.td`
    padding: 12px;
    font-weight: 600;
    background-color: #f9f9f9;
    border-top: 2px solid #eee;
`;

const DiscountContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100px;
    position: relative;
`;

const DiscountInput = styled.input`
    padding: 8px 30px 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    &[type=number] {
        -moz-appearance: textfield;
    }
`;

const DiscountIcon = styled.div`
    position: absolute;
    right: 10px;
    font-size: 12px;
    color: #7f8c8d;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    color: #e74c3c;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
        background-color: #fdecea;
    }
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
`;

const Button = styled.button<{ primary?: boolean; secondary?: boolean }>`
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;

    ${props => props.primary && `
    background-color: #3498db;
    color: white;
    border: 1px solid #3498db;
    
    &:hover:not(:disabled) {
      background-color: #2980b9;
      border-color: #2980b9;
    }
    
    &:disabled {
      background-color: #95a5a6;
      border-color: #95a5a6;
      cursor: not-allowed;
      opacity: 0.7;
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

const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 12px 20px;
    margin: 0 20px 20px;
    border-radius: 4px;
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;