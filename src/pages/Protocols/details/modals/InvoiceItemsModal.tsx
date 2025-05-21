// Modyfikacja komponentu InvoiceItemsModal.tsx

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaCheck, FaTimesCircle, FaTimes, FaPencilAlt, FaTrash, FaLayerGroup} from 'react-icons/fa';
import {DiscountType, SelectedService} from '../../../../types';
import {protocolsApi} from '../../../../api/protocolsApi';
import {useToast} from "../../../../components/common/Toast/Toast";

// Importujemy ExtendedDiscountType i funkcje pomocnicze
enum ExtendedDiscountType {
    PERCENTAGE = 'PERCENTAGE',
    AMOUNT_GROSS = 'AMOUNT_GROSS',
    AMOUNT_NET = 'AMOUNT_NET',
    FIXED_PRICE_GROSS = 'FIXED_PRICE_GROSS',
    FIXED_PRICE_NET = 'FIXED_PRICE_NET'
}

// Etykiety dla rozszerzonych typów rabatu
const DiscountTypeLabelsExtended: Record<ExtendedDiscountType, string> = {
    [ExtendedDiscountType.PERCENTAGE]: "Procent",
    [ExtendedDiscountType.AMOUNT_GROSS]: "Kwota (brutto)",
    [ExtendedDiscountType.AMOUNT_NET]: "Kwota (netto)",
    [ExtendedDiscountType.FIXED_PRICE_GROSS]: "Cena końcowa (brutto)",
    [ExtendedDiscountType.FIXED_PRICE_NET]: "Cena końcowa (netto)"
};

// Funkcje do mapowania typów rabatu
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

// Mapowanie standardowego typu rabatu na rozszerzony typ
const mapFromStandardDiscountType = (standardType: DiscountType): ExtendedDiscountType => {
    switch (standardType) {
        case DiscountType.PERCENTAGE:
            return ExtendedDiscountType.PERCENTAGE;
        case DiscountType.AMOUNT:
            return ExtendedDiscountType.AMOUNT_GROSS;
        case DiscountType.FIXED_PRICE:
            return ExtendedDiscountType.FIXED_PRICE_GROSS;
        default:
            return ExtendedDiscountType.PERCENTAGE;
    }
};

// Stałe
const DEFAULT_VAT_RATE = 23; // Domyślna stawka VAT (23%)

// Funkcje pomocnicze dla obliczeń kwot brutto/netto
const calculateNetPrice = (grossPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
    return grossPrice / (1 + vatRate / 100);
};

const calculateGrossPrice = (netPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
    return netPrice * (1 + vatRate / 100);
};

// Rozszerzamy typ usługi o dodatkowe pola
interface ServiceExtended extends SelectedService {
    isModified?: boolean;
    originalName?: string;
    originalPrice?: number;
    originalFinalPrice?: number;
    originalDiscountType?: DiscountType;
    originalDiscountValue?: number;
    extendedDiscountType?: ExtendedDiscountType;
    mergedFrom?: SelectedService[];
}

interface InvoiceItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (items: SelectedService[]) => void;
    services: SelectedService[];
    protocolId: string; // Dodany parametr ID protokołu, aby umożliwić bezpośrednią aktualizację
}

const InvoiceItemsModal: React.FC<InvoiceItemsModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onSave,
                                                                 services,
                                                                 protocolId
                                                             }) => {
    const [editedServices, setEditedServices] = useState<ServiceExtended[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [isPriceGross, setIsPriceGross] = useState(true); // Domyślnie edytujemy cenę brutto
    const [isLoading, setIsLoading] = useState(false); // Stan ładowania podczas zapisywania

    // Używamy komponentu Toast dla powiadomień
    const { showToast } = useToast();

    // Stan do przechowywania rozszerzonych typów rabatów dla każdej usługi
    const [extendedDiscountTypes, setExtendedDiscountTypes] = useState<Record<string, ExtendedDiscountType>>({});

    // Inicjalizacja stanu po otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            // Tworzymy głęboką kopię usług, aby zachować oryginalne dane
            const initialServices = services.map(service => ({
                ...service,
                // Dodajemy flagi śledzące, czy usługa była modyfikowana
                isModified: false,
                originalName: service.name,
                originalPrice: service.price,
                originalFinalPrice: service.finalPrice,
                originalDiscountType: service.discountType,
                originalDiscountValue: service.discountValue
            }));

            setEditedServices(initialServices);
            setIsEditing(null);

            // Inicjalizuj rozszerzone typy rabatów
            const initialExtendedTypes: Record<string, ExtendedDiscountType> = {};
            services.forEach(service => {
                initialExtendedTypes[service.id] = mapFromStandardDiscountType(service.discountType);
            });
            setExtendedDiscountTypes(initialExtendedTypes);
        }
    }, [isOpen, services]);

    // Rozpocznij edycję pozycji
    const handleStartEdit = (index: number) => {
        const service = editedServices[index];
        setIsEditing(index);
        setEditName(service.name);

        // Ustawiamy cenę w zależności od tego, czy edytujemy brutto czy netto
        if (isPriceGross) {
            setEditPrice(service.price.toString());
        } else {
            // Konwertujemy cenę brutto na netto
            setEditPrice(calculateNetPrice(service.price).toFixed(2));
        }
    };

    // Zapisz edytowaną pozycję
    const handleSaveEdit = () => {
        if (isEditing === null) return;

        const parsedPrice = parseFloat(editPrice);
        if (isNaN(parsedPrice) || parsedPrice <= 0) return;

        const updatedServices = [...editedServices];
        const originalService = updatedServices[isEditing];

        // Obliczamy właściwą cenę w zależności od tego, czy edytujemy brutto czy netto
        const finalPrice = isPriceGross ? parsedPrice : calculateGrossPrice(parsedPrice);

        // Sprawdzamy, czy którekolwiek pole zostało zmienione
        const isNameChanged = editName !== originalService.originalName;
        const isPriceChanged = Math.abs(finalPrice - (originalService.originalPrice || 0)) > 0.01;

        updatedServices[isEditing] = {
            ...originalService,
            name: editName,
            // Jeśli edytujemy cenę, aktualizujemy price oraz finalPrice
            price: finalPrice,
            finalPrice: finalPrice,
            // Oznaczamy, że usługa została zmodyfikowana
            isModified: isNameChanged || isPriceChanged
        };

        setEditedServices(updatedServices);
        setIsEditing(null);
    };

    // Anuluj edycję
    const handleCancelEdit = () => {
        setIsEditing(null);
    };

    // Usuń pozycję
    const handleRemoveItem = (index: number) => {
        const updatedServices = [...editedServices];
        updatedServices.splice(index, 1);
        setEditedServices(updatedServices);
    };

    // Obsługa zmiany rozszerzonego typu rabatu
    const handleExtendedDiscountTypeChange = (serviceId: string, newExtendedType: ExtendedDiscountType) => {
        const standardType = mapToStandardDiscountType(newExtendedType);
        const serviceIndex = editedServices.findIndex(s => s.id === serviceId);

        if (serviceIndex === -1) return;

        // Aktualizuj stan lokalny rozszerzonych typów
        setExtendedDiscountTypes({
            ...extendedDiscountTypes,
            [serviceId]: newExtendedType
        });

        // Aktualizuj też typ rabatu w usłudze
        const updatedServices = [...editedServices];
        const service = updatedServices[serviceIndex];

        // Konwersja wartości rabatu przy zmianie typu
        let newDiscountValue = service.discountValue;

        // Jeśli zmieniamy typ, zresetujmy wartość rabatu
        if (service.discountType !== standardType) {
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

        // Aktualizujemy usługę
        updatedServices[serviceIndex] = {
            ...service,
            discountType: standardType,
            discountValue: newDiscountValue,
            // Obliczamy nową cenę końcową po zastosowaniu rabatu
            finalPrice: calculateFinalPrice(service.price, standardType, newExtendedType, newDiscountValue),
            isModified: true
        };

        setEditedServices(updatedServices);
    };

    // Funkcja obliczająca cenę końcową po rabacie
    const calculateFinalPrice = (
        price: number,
        discountType: DiscountType,
        extendedType: ExtendedDiscountType,
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
                if (extendedType === ExtendedDiscountType.AMOUNT_NET) {
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
                if (extendedType === ExtendedDiscountType.FIXED_PRICE_NET) {
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

    // Obsługa zmiany wartości rabatu
    const handleDiscountValueChange = (serviceId: string, value: number) => {
        const serviceIndex = editedServices.findIndex(s => s.id === serviceId);

        if (serviceIndex === -1) return;

        const updatedServices = [...editedServices];
        const service = updatedServices[serviceIndex];
        const extendedType = extendedDiscountTypes[serviceId] ||
            mapFromStandardDiscountType(service.discountType);

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

        // Aktualizujemy usługę
        updatedServices[serviceIndex] = {
            ...service,
            discountValue: validatedValue,
            finalPrice: calculateFinalPrice(service.price, service.discountType, extendedType, validatedValue),
            isModified: true
        };

        setEditedServices(updatedServices);
    };

    // Połącz wszystkie pozycje w jedną
    const handleMergeAll = () => {
        // Obliczamy sumę wszystkich cen końcowych
        const totalPrice = editedServices.reduce(
            (sum, service) => sum + service.finalPrice, 0
        );

        // Zachowujemy oryginalne usługi, aby nie stracić informacji o rabatach
        const originalServices = [...editedServices];

        // Tworzymy nową usługę z sumą wszystkich
        const mergedService: ServiceExtended = {
            id: `merged_${Date.now()}`,
            name: 'Usługi detailingowe', // Domyślna nazwa dla połączonych usług
            price: totalPrice,
            discountType: DiscountType.PERCENTAGE,
            discountValue: 0,
            finalPrice: totalPrice,
            // Oznaczamy jako zmodyfikowane
            isModified: true,
            // Zachowujemy referencję do oryginalnych usług
            mergedFrom: originalServices,
            // Pusta notatka zgodnie z wymaganiem
            note: ''
        };

        setEditedServices([mergedService]);

        // Aktualizuj również rozszerzone typy rabatów
        setExtendedDiscountTypes({
            [mergedService.id]: ExtendedDiscountType.PERCENTAGE
        });
    };

    // Funkcja do aktualizacji protokołu na serwerze
    const updateProtocol = async (newServices: SelectedService[]) => {
        setIsLoading(true);
        try {
            // Pobierz szczegóły protokołu
            const protocolDetails = await protocolsApi.getProtocolDetails(protocolId);

            if (!protocolDetails) {
                throw new Error('Nie udało się pobrać danych protokołu');
            }

            // Aktualizuj usługi w protokole
            const updatedProtocol = {
                ...protocolDetails,
                selectedServices: newServices,
                updatedAt: new Date().toISOString()
            };

            // Zapisz zaktualizowany protokół
            const result = await protocolsApi.updateProtocol(updatedProtocol);

            if (result) {
                showToast('success', 'Pozycje faktury zostały zaktualizowane', 3000);
                return true;
            } else {
                throw new Error('Nie udało się zaktualizować protokołu');
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji protokołu:', error);
            showToast('error', 'Wystąpił błąd podczas aktualizacji protokołu', 3000);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Zapisz zmiany i zamknij modal
    const handleSave = async () => {
        // Przygotowanie danych do zapisu
        // Usuwamy dodatkowe pola, które dodaliśmy tylko na potrzeby edycji
        const itemsToSave = editedServices.map(service => {
            const {
                isModified,
                originalName,
                originalPrice,
                originalFinalPrice,
                originalDiscountType,
                originalDiscountValue,
                extendedDiscountType,
                mergedFrom,
                ...serviceData
            } = service;

            // Zwracamy tylko te pola, które są częścią SelectedService
            return serviceData as SelectedService;
        });

        // Oblicz sumę
        const newTotal = itemsToSave.reduce((sum, item) => sum + item.finalPrice, 0);
        const originalTotal = services.reduce((sum, item) => sum + item.finalPrice, 0);

        // Jeśli suma się zmieniła znacząco, pokaż potwierdzenie
        if (Math.abs(newTotal - originalTotal) > 0.01) {
            const confirmed = window.confirm(
                `Suma po modyfikacji (${newTotal.toFixed(2)} zł) różni się od oryginalnej kwoty (${originalTotal.toFixed(2)} zł). Czy na pewno chcesz zapisać zmiany?`
            );

            if (!confirmed) {
                return;
            }
        }

        // Zapisz zmiany w protokole i wywołaj callback
        const success = await updateProtocol(itemsToSave);

        if (success) {
            onSave(itemsToSave);
            onClose();
        }
    };

    // Obliczanie sum
    const calculateTotals = () => {
        const totalPrice = editedServices.reduce((sum, service) => sum + service.price, 0);
        const totalDiscount = editedServices.reduce((sum, service) => sum + (service.price - service.finalPrice), 0);
        const totalFinalPrice = editedServices.reduce((sum, service) => sum + service.finalPrice, 0);

        return {
            totalPrice,
            totalDiscount,
            totalFinalPrice
        };
    };

    const { totalPrice, totalDiscount, totalFinalPrice } = calculateTotals();

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>Edytuj pozycje faktury</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>
                <ModalBody>
                    <InfoMessage>
                        Możesz edytować nazwy i ceny poszczególnych usług, które pojawią się na fakturze, lub połączyć wszystkie usługi w jedną pozycję.
                    </InfoMessage>

                    <MergeAllButton onClick={handleMergeAll}>
                        <FaLayerGroup /> Połącz w jedną pozycję
                    </MergeAllButton>

                    <ServicesTableContainer>
                        <Table>
                            <thead>
                            <tr>
                                <TableHeader>Nazwa</TableHeader>
                                <TableHeader>Cena bazowa</TableHeader>
                                <TableHeader>Rabat</TableHeader>
                                <TableHeader>Cena końcowa</TableHeader>
                                <TableHeader>Akcje</TableHeader>
                            </tr>
                            </thead>
                            <tbody>
                            {editedServices.length === 0 ? (
                                <tr>
                                    <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                        Brak usług do wyświetlenia
                                    </TableCell>
                                </tr>
                            ) : (
                                editedServices.map((service, index) => {
                                    const extendedType = extendedDiscountTypes[service.id] ||
                                        mapFromStandardDiscountType(service.discountType);

                                    return (
                                        <tr key={service.id}>
                                            {isEditing === index ? (
                                                <>
                                                    <TableCell>
                                                        <EditInput
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            placeholder="Nazwa usługi"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <EditPriceInput
                                                            type="text"
                                                            value={editPrice}
                                                            onChange={(e) => {
                                                                // Pozwól na wprowadzanie tylko cyfr i kropki/przecinka
                                                                const value = e.target.value;
                                                                if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                                                                    setEditPrice(value);
                                                                }
                                                            }}
                                                            placeholder={`Cena ${isPriceGross ? 'brutto' : 'netto'}`}
                                                        />
                                                        <PriceTypeToggle>
                                                            <PriceTypeButton
                                                                selected={isPriceGross}
                                                                onClick={() => setIsPriceGross(true)}
                                                            >
                                                                Brutto
                                                            </PriceTypeButton>
                                                            <PriceTypeButton
                                                                selected={!isPriceGross}
                                                                onClick={() => setIsPriceGross(false)}
                                                            >
                                                                Netto
                                                            </PriceTypeButton>
                                                        </PriceTypeToggle>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DiscountInfo>
                                                            {service.discountValue > 0 ?
                                                                service.discountType === DiscountType.PERCENTAGE ?
                                                                    `${service.discountValue}%` :
                                                                    `${service.discountValue} zł`
                                                                : '-'
                                                            }
                                                        </DiscountInfo>
                                                    </TableCell>
                                                    <TableCell>
                                                        <PricePreview>
                                                            {isPriceGross ?
                                                                parseFloat(editPrice || '0').toFixed(2) :
                                                                calculateGrossPrice(parseFloat(editPrice || '0')).toFixed(2)
                                                            } zł (brutto)
                                                        </PricePreview>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ActionButtonsContainer>
                                                            <ActionButton onClick={handleSaveEdit} title="Zapisz">
                                                                <FaCheck />
                                                            </ActionButton>
                                                            <ActionButton onClick={handleCancelEdit} title="Anuluj" danger>
                                                                <FaTimes />
                                                            </ActionButton>
                                                        </ActionButtonsContainer>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>
                                                        <ServiceNameContainer>
                                                            <ServiceName>
                                                                {service.name}
                                                                {service.isModified && <ModifiedBadge>zmodyfikowano</ModifiedBadge>}
                                                            </ServiceName>
                                                            {service.note && (
                                                                <ServiceNote>{service.note}</ServiceNote>
                                                            )}
                                                        </ServiceNameContainer>
                                                    </TableCell>
                                                    <TableCell>
                                                        <PriceWrapper>
                                                            <PriceValue>{service.price.toFixed(2)} zł</PriceValue>
                                                            <PriceType>brutto</PriceType>
                                                            <PriceValue>{calculateNetPrice(service.price).toFixed(2)} zł</PriceValue>
                                                            <PriceType>netto</PriceType>
                                                        </PriceWrapper>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StyledDiscountContainer>
                                                            <DiscountTypeSelect
                                                                value={extendedType}
                                                                onChange={(e) => handleExtendedDiscountTypeChange(
                                                                    service.id,
                                                                    e.target.value as ExtendedDiscountType
                                                                )}
                                                            >
                                                                {Object.entries(DiscountTypeLabelsExtended).map(([value, label]) => (
                                                                    <option key={value} value={value}>{label}</option>
                                                                ))}
                                                            </DiscountTypeSelect>
                                                            <DiscountInputGroup>
                                                                <DiscountInput
                                                                    type="number"
                                                                    min="0"
                                                                    max={service.discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                                                                    value={service.discountValue}
                                                                    onChange={(e) => handleDiscountValueChange(
                                                                        service.id,
                                                                        parseFloat(e.target.value) || 0
                                                                    )}
                                                                />
                                                                {service.discountType === DiscountType.PERCENTAGE && (
                                                                    <DiscountPercentage>
                                                                        ({(service.price * service.discountValue / 100).toFixed(2)} zł)
                                                                    </DiscountPercentage>
                                                                )}
                                                            </DiscountInputGroup>
                                                        </StyledDiscountContainer>
                                                    </TableCell>
                                                    <TableCell>
                                                        <PriceWrapper>
                                                            <PriceValue>{service.finalPrice.toFixed(2)} zł</PriceValue>
                                                            <PriceType>brutto</PriceType>
                                                            <PriceValue>{calculateNetPrice(service.finalPrice).toFixed(2)} zł</PriceValue>
                                                            <PriceType>netto</PriceType>
                                                        </PriceWrapper>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ActionButtonsContainer>
                                                            <ActionButton onClick={() => handleStartEdit(index)} title="Edytuj">
                                                                <FaPencilAlt />
                                                            </ActionButton>
                                                            <ActionButton onClick={() => handleRemoveItem(index)} title="Usuń" danger>
                                                                <FaTrash />
                                                            </ActionButton>
                                                        </ActionButtonsContainer>
                                                    </TableCell>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                            <tfoot>
                            <tr>
                                <TableFooterCell>Suma:</TableFooterCell>
                                <TableFooterCell>
                                    <PriceWrapper>
                                        <TotalValue>{totalPrice.toFixed(2)} zł</TotalValue>
                                        <PriceType>brutto</PriceType>
                                        <TotalValue>{calculateNetPrice(totalPrice).toFixed(2)} zł</TotalValue>
                                        <PriceType>netto</PriceType>
                                    </PriceWrapper>
                                </TableFooterCell>
                                <TableFooterCell>
                                    <PriceWrapper>
                                        <TotalValue>{totalDiscount.toFixed(2)} zł</TotalValue>
                                        <PriceType>brutto</PriceType>
                                        <TotalValue>{calculateNetPrice(totalDiscount).toFixed(2)} zł</TotalValue>
                                        <PriceType>netto</PriceType>
                                    </PriceWrapper>
                                </TableFooterCell>
                                <TableFooterCell>
                                    <PriceWrapper>
                                        <TotalValue>{totalFinalPrice.toFixed(2)} zł</TotalValue>
                                        <PriceType>brutto</PriceType>
                                        <TotalValue>{calculateNetPrice(totalFinalPrice).toFixed(2)} zł</TotalValue>
                                        <PriceType>netto</PriceType>
                                    </PriceWrapper>
                                </TableFooterCell>
                                <TableFooterCell></TableFooterCell>
                            </tr>
                            </tfoot>
                        </Table>
                    </ServicesTableContainer>
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={onClose}>
                        Anuluj
                    </CancelButton>
                    <SaveButton
                        onClick={handleSave}
                        disabled={editedServices.length === 0 || isLoading}
                    >
                        {isLoading ? (
                            <>Zapisywanie...</>
                        ) : (
                            <><FaCheck /> Zastosuj zmiany</>
                        )}
                    </SaveButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Używamy tych samych styli, które są używane w ServiceTable.tsx
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
    z-index: 1100;
`;

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 900px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1101;
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

const InfoMessage = styled.div`
    background-color: #f0f7ff;
    color: #3498db;
    padding: 12px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 14px;
`;

const MergeAllButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 20px;
    
    &:hover {
        background-color: #d5e9f9;
    }
`;

// Używamy tych samych styli tabel co w ServiceTable.tsx
const ServicesTableContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
`;

const TableHeader = styled.th`
    background-color: #f8f9fa;
    color: #2c3e50;
    font-weight: 600;
    text-align: left;
    padding: 12px 15px;
    border-bottom: 2px solid #e9ecef;
`;

const TableCell = styled.td`
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
`;

const TableFooterCell = styled(TableCell)`
    font-weight: 600;
    background-color: rgba(192, 215, 241, 0.49);
`;

// Style dla nazwy usługi
const ServiceNameContainer = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 1.4;
`;

const ServiceName = styled.div`
    font-weight: 500;
    color: #2c3e50;
`;

const ServiceNote = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    font-style: italic;
    margin-top: 4px;
    word-break: break-word;
`;

// Style dla ceny
const PriceWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const PriceValue = styled.span`
    font-weight: 500;
    color: #2c3e50;
`;

const PriceType = styled.div`
    font-size: 11px;
    color: #7f8c8d;
    text-transform: uppercase;
`;

// Style dla rabatu
const StyledDiscountContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

const DiscountTypeSelect = styled.select`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    height: 38px;
`;

const DiscountInputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const DiscountInput = styled.input`
    width: 80px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    text-align: right;
    height: 38px;
`;

const DiscountPercentage = styled.span`
    font-size: 12px;
    color: #7f8c8d;
    white-space: nowrap;
`;

const DiscountInfo = styled.div`
    font-size: 13px;
    color: #7f8c8d;
`;

// Style dla przycisków akcji
const ActionButtonsContainer = styled.div`
    display: flex;
    gap: 8px;
    justify-content: center;
`;

const ActionButton = styled.button<{ danger?: boolean, note?: boolean }>`
    background: none;
    border: none;
    cursor: pointer;
    color: ${props =>
    props.danger ? '#e74c3c' :
        props.note ? '#f39c12' :
            '#3498db'
};
    font-size: 16px;
    padding: 6px;
    border-radius: 4px;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
        background-color: ${props =>
    props.danger ? 'rgba(231, 76, 60, 0.1)' :
        props.note ? 'rgba(243, 156, 18, 0.1)' :
            'rgba(52, 152, 219, 0.1)'
};
    }
`;

// Style dla pola edycji cen
const EditInput = styled.input`
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const EditPriceInput = styled(EditInput)`
    margin-bottom: 8px;
`;

const PriceTypeToggle = styled.div`
    display: flex;
    gap: 5px;
`;

const PriceTypeButton = styled.button<{ selected: boolean }>`
    flex: 1;
    padding: 4px 8px;
    background-color: ${props => props.selected ? '#3498db' : '#f0f0f0'};
    color: ${props => props.selected ? 'white' : '#7f8c8d'};
    border: 1px solid ${props => props.selected ? '#2980b9' : '#ddd'};
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    
    &:hover {
        background-color: ${props => props.selected ? '#2980b9' : '#e0e0e0'};
    }
`;

const PricePreview = styled.div`
    margin-top: 6px;
    color: #2c3e50;
    font-size: 14px;
`;

// Style dla oznaczania zmodyfikowanych pozycji
const ModifiedBadge = styled.span`
    display: inline-block;
    font-size: 10px;
    background-color: #3498db;
    color: white;
    padding: 2px 4px;
    border-radius: 3px;
    margin-left: 6px;
    vertical-align: middle;
`;

// Wartości sumaryczne
const TotalValue = styled.span`
    font-weight: 600;
    color: #2c3e50;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
`;

const CancelButton = styled.button`
    padding: 10px 16px;
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: #f5f5f5;
    }
`;

const SaveButton = styled.button<{ disabled?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: ${props => props.disabled ? '#95a5a6' : '#2ecc71'};
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    
    &:hover:not(:disabled) {
        background-color: #27ae60;
    }
`;

export default InvoiceItemsModal;