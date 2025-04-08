import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTimes, FaSearch, FaSpinner, FaStickyNote, FaEdit } from 'react-icons/fa';
import {DiscountType} from "../../../../types";

// Rozszerzone typy rabatu - zamieniamy na enum dla zgodności
enum ExtendedDiscountType {
    PERCENTAGE = 'PERCENTAGE',
    AMOUNT_GROSS = 'AMOUNT_GROSS',
    AMOUNT_NET = 'AMOUNT_NET',
    FIXED_PRICE_GROSS = 'FIXED_PRICE_GROSS',
    FIXED_PRICE_NET = 'FIXED_PRICE_NET'
}

// Nowe wersje etykiet rabatu uwzględniające ceny netto/brutto
const DiscountTypeLabelsExtended: Record<ExtendedDiscountType, string> = {
    [ExtendedDiscountType.PERCENTAGE]: "Procent",
    [ExtendedDiscountType.AMOUNT_GROSS]: "Kwota (brutto)",
    [ExtendedDiscountType.AMOUNT_NET]: "Kwota (netto)",
    [ExtendedDiscountType.FIXED_PRICE_GROSS]: "Cena końcowa (brutto)",
    [ExtendedDiscountType.FIXED_PRICE_NET]: "Cena końcowa (netto)"
};

// Funkcja do mapowania typów rabatu
const mapToStandardDiscountType = (extendedType: ExtendedDiscountType): DiscountType => {
    switch (extendedType) {
        case ExtendedDiscountType.PERCENTAGE:
            return DiscountType.PERCENTAGE;
        case ExtendedDiscountType.AMOUNT_GROSS:
        case ExtendedDiscountType.AMOUNT_NET:
            return DiscountType.AMOUNT;
        case ExtendedDiscountType.FIXED_PRICE_GROSS:
        case ExtendedDiscountType.FIXED_PRICE_NET:
            return DiscountType.FIXED_PRICE;
        default:
            return DiscountType.PERCENTAGE;
    }
};

// Stałe
const DEFAULT_VAT_RATE = 23; // Domyślna stawka VAT (23%)

interface AddServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddServices: (data: {
        services: Array<{
            id: string;
            name: string;
            price: number;
            discountType?: DiscountType;
            discountValue?: number;
            finalPrice: number;
            note?: string
        }>
    }) => void;
    availableServices: Array<{ id: string; name: string; price: number }>;
    customerPhone?: string;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             onAddServices,
                                                             availableServices,
                                                             customerPhone
                                                         }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedServices, setSelectedServices] = useState<Array<{
        id: string;
        name: string;
        price: number;
        discountType: DiscountType;
        extendedDiscountType: ExtendedDiscountType;
        discountValue: number;
        finalPrice: number;
        note?: string;
    }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState<Array<{
        id: string;
        name: string;
        price: number;
    }>>([]);
    const [customServiceMode, setCustomServiceMode] = useState(false);
    const [customServiceName, setCustomServiceName] = useState('');
    const [customServicePrice, setCustomServicePrice] = useState('');
    const [addingServiceNote, setAddingServiceNote] = useState<{
        index: number;
        open: boolean;
        note: string;
    }>({ index: -1, open: false, note: '' });
    const [editingDiscount, setEditingDiscount] = useState<{
        index: number;
        open: boolean;
    }>({ index: -1, open: false });

    // Funkcje do przeliczania cen netto/brutto
    const calculateNetPrice = (grossPrice: number): number => {
        return grossPrice / (1 + DEFAULT_VAT_RATE / 100);
    };

    const calculateGrossPrice = (netPrice: number): number => {
        return netPrice * (1 + DEFAULT_VAT_RATE / 100);
    };

    // Funkcja obliczająca cenę końcową po rabacie
    const calculateFinalPrice = (
        price: number,
        discountType: DiscountType,
        extendedDiscountType: ExtendedDiscountType,
        discountValue: number
    ): number => {
        let finalPrice = price;

        switch (discountType) {
            case DiscountType.PERCENTAGE:
                // Rabat procentowy
                finalPrice = price * (1 - discountValue / 100);
                break;
            case DiscountType.AMOUNT:
                // Rabat kwotowy
                if (extendedDiscountType === ExtendedDiscountType.AMOUNT_NET) {
                    // Przeliczamy rabat kwotowy netto na brutto
                    const discountValueGross = calculateGrossPrice(discountValue);
                    finalPrice = Math.max(0, price - discountValueGross);
                } else {
                    // Rabat kwotowy brutto
                    finalPrice = Math.max(0, price - discountValue);
                }
                break;
            case DiscountType.FIXED_PRICE:
                // Cena końcowa
                if (extendedDiscountType === ExtendedDiscountType.FIXED_PRICE_NET) {
                    // Przeliczamy cenę końcową netto na brutto
                    finalPrice = calculateGrossPrice(discountValue);
                } else {
                    // Cena końcowa brutto
                    finalPrice = discountValue;
                }
                break;
        }

        return parseFloat(finalPrice.toFixed(2));
    };

    useEffect(() => {
        // Reset stanu po zamknięciu modalu
        if (!isOpen) {
            setSelectedServices([]);
            setSearchQuery('');
            setSearchResults([]);
            setShowResults(false);
            setCustomServiceMode(false);
            setCustomServiceName('');
            setCustomServicePrice('');
        }
    }, [isOpen]);

    // Obsługa wyszukiwania
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === '') {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setShowResults(true);

        // Filtruj dostępne usługi
        const filteredServices = availableServices.filter(service =>
            service.name.toLowerCase().includes(query.toLowerCase()) &&
            !selectedServices.some(selected => selected.id === service.id)
        );

        setSearchResults(filteredServices);
    };

    // Dodawanie usługi z wyników wyszukiwania
    const handleAddServiceFromSearch = (service: { id: string; name: string; price: number }) => {
        const newService = {
            ...service,
            discountType: DiscountType.PERCENTAGE,
            extendedDiscountType: ExtendedDiscountType.PERCENTAGE,
            discountValue: 0,
            finalPrice: service.price
        };

        setSelectedServices([...selectedServices, newService]);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    // Dodawanie niestandardowej usługi
    const handleAddCustomService = () => {
        if (customServiceName.trim() === '' || !customServicePrice) return;

        const price = parseFloat(customServicePrice);
        if (isNaN(price)) return;

        const newService = {
            id: `custom-${Date.now()}`,
            name: customServiceName.trim(),
            price,
            discountType: DiscountType.PERCENTAGE,
            extendedDiscountType: ExtendedDiscountType.PERCENTAGE,
            discountValue: 0,
            finalPrice: price
        };

        setSelectedServices([...selectedServices, newService]);
        setCustomServiceName('');
        setCustomServicePrice('');
        setCustomServiceMode(false);
    };

    // Usuwanie usługi z listy wybranych
    const handleRemoveService = (index: number) => {
        const updatedServices = [...selectedServices];
        updatedServices.splice(index, 1);
        setSelectedServices(updatedServices);
    };

    // Otwieranie modalu do dodawania notatki
    const handleOpenNoteModal = (index: number) => {
        setAddingServiceNote({
            index,
            open: true,
            note: selectedServices[index].note || ''
        });
    };

    // Zapisywanie notatki
    const handleSaveNote = () => {
        if (addingServiceNote.index >= 0) {
            const updatedServices = [...selectedServices];
            updatedServices[addingServiceNote.index] = {
                ...updatedServices[addingServiceNote.index],
                note: addingServiceNote.note
            };
            setSelectedServices(updatedServices);
        }

        setAddingServiceNote({ index: -1, open: false, note: '' });
    };

    // Zamykanie bez zapisywania
    const handleCancelNote = () => {
        setAddingServiceNote({ index: -1, open: false, note: '' });
    };

    // Otwieranie modalu do edycji rabatu
    const handleOpenDiscountModal = (index: number) => {
        setEditingDiscount({
            index,
            open: true
        });
    };

    // Zapisywanie zmian rabatu
    const handleChangeDiscountType = (index: number, newExtendedType: ExtendedDiscountType) => {
        const updatedServices = [...selectedServices];
        const service = updatedServices[index];
        const standardType = mapToStandardDiscountType(newExtendedType);

        // Konwersja wartości rabatu przy zmianie typu
        let newDiscountValue = service.discountValue;

        // Obsługa konwersji rabatu w zależności od poprzedniego i nowego typu
        if (service.extendedDiscountType !== newExtendedType) {
            // Dla prostoty resetujemy wartość rabatu przy zmianie typu
            if (standardType === DiscountType.PERCENTAGE) {
                newDiscountValue = 0; // Domyślny rabat procentowy: 0%
            } else if (standardType === DiscountType.AMOUNT) {
                newDiscountValue = 0; // Domyślny rabat kwotowy: 0 zł
            } else if (standardType === DiscountType.FIXED_PRICE) {
                // Domyślna cena końcowa: aktualna cena
                newDiscountValue = newExtendedType === ExtendedDiscountType.FIXED_PRICE_NET
                    ? calculateNetPrice(service.price)
                    : service.price;
            }
        }

        // Aktualizacja usługi
        updatedServices[index] = {
            ...service,
            discountType: standardType,
            extendedDiscountType: newExtendedType,
            discountValue: newDiscountValue,
            finalPrice: calculateFinalPrice(service.price, standardType, newExtendedType, newDiscountValue)
        };

        setSelectedServices(updatedServices);
    };

    // Zmiana wartości rabatu
    const handleChangeDiscountValue = (index: number, value: number) => {
        const updatedServices = [...selectedServices];
        const service = updatedServices[index];

        // Walidacja wartości rabatu
        let validatedValue = value;

        // Dla rabatu procentowego ograniczamy wartość do 0-100%
        if (service.discountType === DiscountType.PERCENTAGE && validatedValue > 100) {
            validatedValue = 100;
        }

        // Dla rabatu kwotowego i ceny końcowej wartość nie może być ujemna
        if (validatedValue < 0) {
            validatedValue = 0;
        }

        // Aktualizacja usługi
        updatedServices[index] = {
            ...service,
            discountValue: validatedValue,
            finalPrice: calculateFinalPrice(
                service.price,
                service.discountType,
                service.extendedDiscountType,
                validatedValue
            )
        };

        setSelectedServices(updatedServices);
    };

    // Zapisywanie i dodawanie usług
    const handleSubmit = () => {
        if (selectedServices.length === 0) return;

        // Przygotowanie danych w odpowiednim formacie
        const servicesData = selectedServices.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            discountType: service.discountType,
            discountValue: service.discountValue,
            finalPrice: service.finalPrice,
            note: service.note
        }));

        onAddServices({
            services: servicesData
        });
    };

    // Obliczanie sumy
    const calculateTotals = () => {
        const totalBasePrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
        const totalDiscountGross = selectedServices.reduce((sum, service) => sum + (service.price - service.finalPrice), 0);
        const totalFinalPrice = selectedServices.reduce((sum, service) => sum + service.finalPrice, 0);

        const totalBaseNetPrice = calculateNetPrice(totalBasePrice);
        const totalFinalNetPrice = calculateNetPrice(totalFinalPrice);
        const totalDiscountNet = totalBaseNetPrice - totalFinalNetPrice;

        return {
            totalBasePrice,
            totalDiscountGross,
            totalDiscountNet,
            totalFinalPrice,
            totalBaseNetPrice,
            totalFinalNetPrice
        };
    };

    const {
        totalBasePrice,
        totalDiscountGross,
        totalDiscountNet,
        totalFinalPrice,
        totalBaseNetPrice,
        totalFinalNetPrice
    } = calculateTotals();

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>Dodaj usługi do zlecenia</ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>

                <ModalBody>
                    {customerPhone && (
                        <InfoMessage>
                            Po dodaniu usług, klient otrzyma SMS z prośbą o potwierdzenie na numer <strong>{customerPhone}</strong>.
                        </InfoMessage>
                    )}

                    {/* Wyszukiwarka usług */}
                    <SearchContainer>
                        <SearchLabel>Wyszukaj usługę</SearchLabel>
                        <SearchInputContainer>
                            <SearchIcon><FaSearch /></SearchIcon>
                            <SearchInput
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Wpisz nazwę usługi..."
                                disabled={customServiceMode}
                            />
                        </SearchInputContainer>

                        {/* Wyniki wyszukiwania */}
                        {showResults && searchResults.length > 0 && (
                            <SearchResultsContainer>
                                {searchResults.map(service => (
                                    <SearchResultItem
                                        key={service.id}
                                        onClick={() => handleAddServiceFromSearch(service)}
                                    >
                                        <SearchResultName>{service.name}</SearchResultName>
                                        <SearchResultPrices>
                                            <PriceValue>{service.price.toFixed(2)} zł</PriceValue>
                                            <PriceType>brutto</PriceType>
                                            <PriceValue>{calculateNetPrice(service.price).toFixed(2)} zł</PriceValue>
                                            <PriceType>netto</PriceType>
                                        </SearchResultPrices>
                                    </SearchResultItem>
                                ))}
                            </SearchResultsContainer>
                        )}

                        {showResults && searchResults.length === 0 && searchQuery.trim() !== '' && (
                            <NoResultsMessage>
                                Nie znaleziono usług. Możesz dodać nową usługę.
                            </NoResultsMessage>
                        )}
                    </SearchContainer>

                    {/* Przycisk przełączający do trybu dodawania niestandardowej usługi */}
                    <ToggleButtonContainer>
                        {!customServiceMode ? (
                            <ToggleButton onClick={() => setCustomServiceMode(true)}>
                                <FaPlus /> Dodaj niestandardową usługę
                            </ToggleButton>
                        ) : (
                            <ToggleButton onClick={() => setCustomServiceMode(false)}>
                                <FaTimes /> Anuluj dodawanie niestandardowej usługi
                            </ToggleButton>
                        )}
                    </ToggleButtonContainer>

                    {/* Formularz dodawania niestandardowej usługi */}
                    {customServiceMode && (
                        <CustomServiceForm>
                            <FormGroup>
                                <Label>Nazwa usługi</Label>
                                <Input
                                    type="text"
                                    value={customServiceName}
                                    onChange={e => setCustomServiceName(e.target.value)}
                                    placeholder="Wprowadź nazwę usługi"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Cena (brutto)</Label>
                                <Input
                                    type="number"
                                    value={customServicePrice}
                                    onChange={e => setCustomServicePrice(e.target.value)}
                                    placeholder="Wprowadź cenę brutto"
                                    min="0"
                                    step="0.01"
                                />
                                {customServicePrice && !isNaN(parseFloat(customServicePrice)) && (
                                    <PriceInfo>
                                        Netto: {calculateNetPrice(parseFloat(customServicePrice)).toFixed(2)} zł
                                    </PriceInfo>
                                )}
                            </FormGroup>
                            <AddCustomButton
                                onClick={handleAddCustomService}
                                disabled={customServiceName.trim() === '' || !customServicePrice || isNaN(parseFloat(customServicePrice))}
                            >
                                <FaPlus /> Dodaj usługę
                            </AddCustomButton>
                        </CustomServiceForm>
                    )}

                    {/* Lista wybranych usług */}
                    <SelectedServicesSection>
                        <SectionTitle>Wybrane usługi</SectionTitle>

                        {selectedServices.length === 0 ? (
                            <EmptyState>
                                Brak wybranych usług. Wyszukaj lub dodaj niestandardową usługę.
                            </EmptyState>
                        ) : (
                            <ServicesTableContainer>
                                <ServicesTable>
                                    <TableHeader>
                                        <HeaderCell width="40%">Nazwa usługi</HeaderCell>
                                        <HeaderCell width="15%">Cena bazowa</HeaderCell>
                                        <HeaderCell width="20%">Rabat</HeaderCell>
                                        <HeaderCell width="15%">Cena końcowa</HeaderCell>
                                        <HeaderCell width="10%">Akcje</HeaderCell>
                                    </TableHeader>

                                    <TableBody>
                                        {selectedServices.map((service, index) => (
                                            <TableRow key={index}>
                                                <TableCell width="40%">
                                                    <ServiceNameContainer>
                                                        <ServiceName>{service.name}</ServiceName>
                                                        {service.note && (
                                                            <ServiceNote>{service.note}</ServiceNote>
                                                        )}
                                                    </ServiceNameContainer>
                                                </TableCell>
                                                <TableCell width="15%">
                                                    <PriceWrapper>
                                                        <PriceValue>{service.price.toFixed(2)} zł</PriceValue>
                                                        <PriceType>brutto</PriceType>
                                                        <PriceValue>{calculateNetPrice(service.price).toFixed(2)} zł</PriceValue>
                                                        <PriceType>netto</PriceType>
                                                    </PriceWrapper>
                                                </TableCell>
                                                <TableCell width="20%">
                                                    <DiscountContainer>
                                                        <DiscountTypeSelect
                                                            value={service.extendedDiscountType}
                                                            onChange={(e) => handleChangeDiscountType(
                                                                index,
                                                                e.target.value as ExtendedDiscountType
                                                            )}
                                                        >
                                                            {Object.entries(DiscountTypeLabelsExtended).map(([value, label]) => (
                                                                <option key={value} value={value}>
                                                                    {label}
                                                                </option>
                                                            ))}
                                                        </DiscountTypeSelect>
                                                        <DiscountInputGroup>
                                                            <DiscountInput
                                                                type="number"
                                                                min="0"
                                                                max={service.discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                                                                value={service.discountValue}
                                                                onChange={(e) => handleChangeDiscountValue(
                                                                    index,
                                                                    parseFloat(e.target.value) || 0
                                                                )}
                                                            />
                                                            {service.discountType === DiscountType.PERCENTAGE && (
                                                                <DiscountPercentage>
                                                                    ({(service.price * service.discountValue / 100).toFixed(2)} zł)
                                                                </DiscountPercentage>
                                                            )}
                                                        </DiscountInputGroup>
                                                    </DiscountContainer>
                                                </TableCell>
                                                <TableCell width="15%">
                                                    <PriceWrapper>
                                                        <PriceValue>{service.finalPrice.toFixed(2)} zł</PriceValue>
                                                        <PriceType>brutto</PriceType>
                                                        <PriceValue>{calculateNetPrice(service.finalPrice).toFixed(2)} zł</PriceValue>
                                                        <PriceType>netto</PriceType>
                                                    </PriceWrapper>
                                                </TableCell>
                                                <TableCell width="10%">
                                                    <ActionButtons>
                                                        <ActionButton onClick={() => handleOpenNoteModal(index)} title="Dodaj notatkę">
                                                            <FaStickyNote />
                                                        </ActionButton>
                                                        <ActionButton danger onClick={() => handleRemoveService(index)} title="Usuń usługę">
                                                            <FaTimes />
                                                        </ActionButton>
                                                    </ActionButtons>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>

                                    <TableFooter>
                                        <FooterCell width="40%">Razem:</FooterCell>
                                        <FooterCell width="15%">
                                            <PriceWrapper>
                                                <TotalValue>{totalBasePrice.toFixed(2)} zł</TotalValue>
                                                <PriceType>brutto</PriceType>
                                                <TotalValue>{totalBaseNetPrice.toFixed(2)} zł</TotalValue>
                                                <PriceType>netto</PriceType>
                                            </PriceWrapper>
                                        </FooterCell>
                                        <FooterCell width="20%">
                                            <PriceWrapper>
                                                <TotalValue>{totalDiscountGross.toFixed(2)} zł</TotalValue>
                                                <PriceType>brutto</PriceType>
                                                <TotalValue>{totalDiscountNet.toFixed(2)} zł</TotalValue>
                                                <PriceType>netto</PriceType>
                                            </PriceWrapper>
                                        </FooterCell>
                                        <FooterCell width="15%">
                                            <PriceWrapper>
                                                <TotalValue highlight>{totalFinalPrice.toFixed(2)} zł</TotalValue>
                                                <PriceType>brutto</PriceType>
                                                <TotalValue>{totalFinalNetPrice.toFixed(2)} zł</TotalValue>
                                                <PriceType>netto</PriceType>
                                            </PriceWrapper>
                                        </FooterCell>
                                        <FooterCell width="10%"></FooterCell>
                                    </TableFooter>
                                </ServicesTable>
                            </ServicesTableContainer>
                        )}
                    </SelectedServicesSection>
                </ModalBody>

                <ModalFooter>
                    <CancelButton onClick={onClose}>
                        Anuluj
                    </CancelButton>
                    <SubmitButton
                        onClick={handleSubmit}
                        disabled={selectedServices.length === 0}
                    >
                        Dodaj {selectedServices.length} {
                        selectedServices.length === 1 ? 'usługę' :
                            selectedServices.length < 5 ? 'usługi' : 'usług'
                    }
                    </SubmitButton>
                </ModalFooter>

                {/* Modal dla notatki */}
                {addingServiceNote.open && (
                    <NoteModalOverlay>
                        <NoteModalContainer>
                            <NoteModalHeader>
                                <NoteModalTitle>Dodaj notatkę do usługi</NoteModalTitle>
                                <CloseButton onClick={handleCancelNote}>&times;</CloseButton>
                            </NoteModalHeader>
                            <NoteModalBody>
                                <NoteTextarea
                                    value={addingServiceNote.note}
                                    onChange={(e) => setAddingServiceNote({
                                        ...addingServiceNote,
                                        note: e.target.value
                                    })}
                                    placeholder="Wpisz notatkę dotyczącą usługi..."
                                    rows={5}
                                />
                            </NoteModalBody>
                            <NoteModalFooter>
                                <CancelButton onClick={handleCancelNote}>
                                    Anuluj
                                </CancelButton>
                                <SubmitButton onClick={handleSaveNote}>
                                    Zapisz notatkę
                                </SubmitButton>
                            </NoteModalFooter>
                        </NoteModalContainer>
                    </NoteModalOverlay>
                )}
            </ModalContainer>
        </ModalOverlay>
    );
};
// Wszystkie komponenty stylizowane z AddServiceModal.tsx

// Główny kontener modalu
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
    width: 800px;
    max-width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1001;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #34495e;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    color: #7f8c8d;
    
    &:hover {
        color: #34495e;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
    overflow-y: auto;
    max-height: calc(90vh - 130px);
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
`;

// Wiadomość informacyjna
const InfoMessage = styled.div`
    background-color: #f0f7ff;
    color: #3498db;
    padding: 12px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 14px;
`;

// Komponenty wyszukiwania
const SearchContainer = styled.div`
    margin-bottom: 20px;
`;

const SearchLabel = styled.label`
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 14px;
    color: #34495e;
`;

const SearchInputContainer = styled.div`
    position: relative;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #95a5a6;
    font-size: 14px;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 10px 12px 10px 36px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }
`;

const SearchResultsContainer = styled.div`
    margin-top: 10px;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const SearchResultItem = styled.div`
    padding: 10px 15px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:not(:last-child) {
        border-bottom: 1px solid #eee;
    }
    
    &:hover {
        background-color: #f5f5f5;
    }
`;

const SearchResultName = styled.div`
    font-size: 14px;
    color: #2c3e50;
    font-weight: 500;
`;

const SearchResultPrices = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const NoResultsMessage = styled.div`
    color: #95a5a6;
    text-align: center;
    padding: 15px;
    font-size: 14px;
`;

// Przycisk przełączający dodawanie niestandardowej usługi
const ToggleButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 15px 0;
`;

const ToggleButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
    
    &:hover {
        background-color: #2980b9;
    }
    
    svg {
        font-size: 14px;
    }
`;

// Komponenty formularza niestandardowej usługi
const CustomServiceForm = styled.div`
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
`;

const FormGroup = styled.div`
    margin-bottom: 15px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    color: #34495e;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
`;

const PriceInfo = styled.div`
    margin-top: 5px;
    font-size: 12px;
    color: #7f8c8d;
`;

const AddCustomButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
    
    &:hover:not(:disabled) {
        background-color: #27ae60;
    }
    
    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }
    
    svg {
        font-size: 14px;
    }
`;

// Komponenty sekcji wybranych usług
const SelectedServicesSection = styled.div`
    margin-top: 20px;
`;

const SectionTitle = styled.h3`
    margin-bottom: 15px;
    font-size: 16px;
    color: #34495e;
`;

const EmptyState = styled.div`
    text-align: center;
    color: #7f8c8d;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 4px;
`;

// Tabela z wybranymi usługami
const ServicesTableContainer = styled.div`
    width: 100%;
    overflow-x: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const ServicesTable = styled.div`
    width: 100%;
    display: table;
    border-collapse: collapse;
`;

const TableHeader = styled.div`
    display: flex;
    background-color: #f1f4f7;
    font-weight: 600;
    color: #34495e;
`;

const HeaderCell = styled.div<{ width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    padding: 12px 15px;
    font-size: 14px;
    text-align: left;
`;

const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

const TableRow = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:hover {
        background-color: #f9f9f9;
    }
`;

const TableCell = styled.div<{ width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    padding: 12px 15px;
    font-size: 14px;
`;

const ServiceNameContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const ServiceName = styled.span`
    font-weight: 500;
    color: #2c3e50;
`;

const ServiceNote = styled.span`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
`;

// Komponenty związane z ceną
const PriceValue = styled.span`
    font-weight: 600;
    color: #2980b9;
`;

const PriceType = styled.span`
    font-size: 12px;
    color: #7f8c8d;
    text-transform: uppercase;
`;

const PriceWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

// Komponenty związane z rabatem
const DiscountContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const DiscountTypeSelect = styled.select`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    width: 100%;
`;

const DiscountInputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const DiscountInput = styled.input`
    width: 80px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    text-align: right;
`;

const DiscountPercentage = styled.span`
    font-size: 12px;
    color: #7f8c8d;
`;

// Komponenty przycisków akcji
const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
    justify-content: center;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
        background-color: ${props => props.danger ? '#c0392b' : '#2980b9'};
    }
    
    svg {
        font-size: 14px;
    }
`;

// Komponenty stopki tabeli
const TableFooter = styled.div`
    display: flex;
    background-color: #f1f4f7;
    font-weight: 600;
    border-top: 1px solid #ddd;
`;

const FooterCell = styled.div<{ width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    padding: 12px 15px;
    font-size: 14px;
    text-align: left;
`;

const TotalValue = styled.span<{ highlight?: boolean }>`
    font-weight: ${props => props.highlight ? 700 : 600};
    color: ${props => props.highlight ? '#2c3e50' : '#2980b9'};
`;

// Komponenty modalu notatki
const NoteModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
`;

const NoteModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 500px;
    max-width: 90%;
    display: flex;
    flex-direction: column;
    z-index: 1101;
`;

const NoteModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
`;

const NoteModalTitle = styled.h3`
    margin: 0;
    font-size: 16px;
    color: #34495e;
`;

const NoteModalBody = styled.div`
    padding: 20px;
`;

const NoteTextarea = styled.textarea`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-size: 14px;
    min-height: 120px;
`;

const NoteModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
`;

// Komponenty przycisków
const CancelButton = styled.button`
    padding: 10px 15px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
    
    &:hover {
        background-color: #c0392b;
    }
`;

const SubmitButton = styled.button`
    padding: 10px 15px;
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
    
    &:hover:not(:disabled) {
        background-color: #27ae60;
    }
    
    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }
`;

export default AddServiceModal;