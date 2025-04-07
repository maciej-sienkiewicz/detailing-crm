import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaEdit, FaStickyNote } from 'react-icons/fa';
import { DiscountType, DiscountTypeLabels, SelectedService } from '../../../../types';
import {
    ServicesTableContainer,
    ServicesTable as Table,
    TableHeader,
    TableCell,
    TableFooterCell,
    DiscountContainer,
    DiscountInputGroup,
    DiscountInput,
    DiscountTypeSelect,
    DiscountPercentage,
    ActionButton,
    AddItemRow,
    TotalAmount,
    TotalValue
} from '../styles';
import styled from 'styled-components';
import ServiceNoteModal from "../../shared/modals/SerivceNoteModal";

// Stałe
const DEFAULT_VAT_RATE = 23; // Domyślna stawka VAT (23%)

// Rozszerzone typy rabatu - używamy enum dla TypeScript
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

// Funkcja do mapowania standardowych typów na rozszerzone
const getExtendedDiscountType = (standardType: DiscountType): ExtendedDiscountType => {
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

// Styl dla menu kontekstowego
const ContextMenu = styled.div`
    position: absolute;
    z-index: 100;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 5px 0;
    min-width: 150px;
`;

const MenuItem = styled.div`
    padding: 8px 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #f5f5f5;
    }
`;

// Styl dla komórki tabeli z ceną bazową (edytowalna)
const EditablePriceCell = styled(TableCell)`
    cursor: pointer;
    position: relative;
    height: 100%;

    &:hover {
        background-color: #f5f5f5;
    }
`;

// Styl dla komórek cen
const PriceCell = styled(TableCell)`
    min-width: 120px;
`;

const PriceContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
`;

const PriceValue = styled.span`
    flex: 1;
`;

const PriceLabel = styled.div`
    font-size: 11px;
    color: #7f8c8d;
    margin-top: 2px;
`;

const PriceWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const EditIcon = styled.span`
    font-size: 14px;
    color: #3498db;
    margin-left: 10px;
    display: flex;
    align-items: center;
`;

// Nowy komponent dla pola ilości
const QuantityInput = styled.input`
    width: 60px;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    text-align: center;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    @media (max-width: 768px) {
        width: 50px;
        padding: 4px 6px;
    }
`;

// Nowy komponent dla notatki
const ServiceNote = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
    font-style: italic;
    line-height: 1.4;
    padding-top: 4px;
    border-top: 1px dashed #eee;
    word-break: break-word;
`;

// Kontener dla nazwy usługi i notatki
const ServiceNameContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const ServiceName = styled.div`
    font-weight: normal;
    color: #34495e;
`;

// Nowy komponent dla komórki z rabatem
const DiscountCell = styled(TableCell)`
    min-width: 220px;
    width: 220px;

    @media (max-width: 768px) {
        min-width: 180px;
        width: 180px;
    }

    @media (max-width: 576px) {
        min-width: 160px;
        width: 160px;
    }

    @media (max-width: 480px) {
        min-width: 140px;
        width: 100%;
    }
`;

// Styl dla okna edycji
const EditPricePopup = styled.div`
    position: absolute;
    z-index: 100;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 15px;
    width: 300px;
`;

const PopupTitle = styled.div`
    font-weight: 500;
    font-size: 15px;
    margin-bottom: 10px;
    color: #34495e;
`;

const EditPriceForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const EditPriceInput = styled.input`
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

const PriceTypeSelector = styled.div`
    display: flex;
    margin-bottom: 10px;
`;

const PriceTypeOption = styled.div<{ selected: boolean }>`
    flex: 1;
    padding: 8px;
    text-align: center;
    cursor: pointer;
    border: 1px solid ${props => props.selected ? '#3498db' : '#ddd'};
    background-color: ${props => props.selected ? '#f0f7ff' : 'white'};
    color: ${props => props.selected ? '#3498db' : '#333'};
    font-weight: ${props => props.selected ? '500' : 'normal'};

    &:first-child {
        border-radius: 4px 0 0 4px;
    }

    &:last-child {
        border-radius: 0 4px 4px 0;
    }

    &:hover {
        background-color: ${props => props.selected ? '#f0f7ff' : '#f9f9f9'};
    }
`;

const EditPriceButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

const Button = styled.button<{ primary?: boolean }>`
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    ${props => props.primary ? `
        background-color: #3498db;
        color: white;
        border: none;
        
        &:hover {
            background-color: #2980b9;
        }
    ` : `
        background-color: white;
        color: #333;
        border: 1px solid #ddd;
        
        &:hover {
            background-color: #f5f5f5;
        }
    `}
`;

// Nowy komponent dla zawartości komórki rabatu
const DiscountCellContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
`;

// Zaktualizowany komponent DiscountContainer
const StyledDiscountContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

// Kontener dla przycisków akcji
const ActionButtonsContainer = styled.div`
    display: flex;
    gap: 5px;
`;

// Nowy styl dla podkreślenia cen netto/brutto
const PriceType = styled.div`
    font-size: 10px;
    color: #7f8c8d;
    margin-top: 2px;
`;

// Rozszerzenie interfejsu SelectedService o pole note i vatRate
interface ServiceWithNote extends SelectedService {
    note?: string;
    vatRate?: number; // Stawka VAT dla usługi
    extendedDiscountType?: ExtendedDiscountType; // Dodatkowe pole dla rozszerzonego typu rabatu
}

interface ServiceTableProps {
    services: ServiceWithNote[];
    onRemoveService: (serviceId: string) => void;
    onDiscountTypeChange: (serviceId: string, discountType: DiscountType) => void;
    onDiscountValueChange: (serviceId: string, discountValue: number) => void;
    onBasePriceChange: (serviceId: string, newPrice: number) => void;
    onQuantityChange: (serviceId: string, quantity: number) => void;  // Funkcja do obsługi zmiany ilości
    onAddNote?: (serviceId: string, note: string) => void;
    calculateTotals: () => { totalPrice: number; totalDiscount: number; totalFinalPrice: number };
}

const ServiceTable: React.FC<ServiceTableProps> = ({
                                                       services,
                                                       onRemoveService,
                                                       onDiscountTypeChange,
                                                       onDiscountValueChange,
                                                       onBasePriceChange,
                                                       onQuantityChange,
                                                       onAddNote,
                                                       calculateTotals
                                                   }) => {
    const { totalPrice, totalDiscount, totalFinalPrice } = calculateTotals();

    // Stan dla menu kontekstowego
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        serviceId: string;
    }>({
        visible: false,
        x: 0,
        y: 0,
        serviceId: ''
    });

    // State dla wyskakującego okna edycji
    const [editPopup, setEditPopup] = useState<{
        visible: boolean;
        x: number;
        y: number;
        serviceId: string;
        currentPrice: number;
        isGrossPrice: boolean; // Czy edytujemy cenę brutto
    }>({
        visible: false,
        x: 0,
        y: 0,
        serviceId: '',
        currentPrice: 0,
        isGrossPrice: true // Domyślnie edytujemy cenę brutto
    });

    // State dla modalu notatki
    const [noteModal, setNoteModal] = useState<{
        visible: boolean;
        serviceId: string;
        serviceName: string;
        currentNote: string;
    }>({
        visible: false,
        serviceId: '',
        serviceName: '',
        currentNote: ''
    });

    // State dla ilości (jako tekst) dla każdej usługi
    const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});

    // State do przechowywania nowej ceny jako string, aby uniknąć problemów z zerami wiodącymi
    const [newPrice, setNewPrice] = useState<string>('');

    // Stan dla usług z dodatkowym polem extendedDiscountType
    const [enhancedServices, setEnhancedServices] = useState<ServiceWithNote[]>(() =>
        services.map(service => ({
            ...service,
            extendedDiscountType: service.extendedDiscountType || getExtendedDiscountType(service.discountType)
        }))
    );

    useEffect(() => {
        setEnhancedServices(prevServices => {
            // Zachowaj extendedDiscountType dla istniejących usług
            const updatedServices = services.map(service => {
                const existingService = prevServices.find(s => s.id === service.id);
                return {
                    ...service,
                    extendedDiscountType: existingService?.extendedDiscountType ||
                        service.extendedDiscountType ||
                        getExtendedDiscountType(service.discountType)
                };
            });
            return updatedServices;
        });
    }, [services]);

    // Funkcje pomocnicze do obliczeń cen netto/brutto
    const calculateNetPrice = (grossPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
        return grossPrice / (1 + vatRate / 100);
    };

    const calculateGrossPrice = (netPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
        return netPrice * (1 + vatRate / 100);
    };

    // Funkcja do sprawdzania typu rabatu dla obliczeń
    const isNetPriceDiscountType = (discountType: ExtendedDiscountType | DiscountType): boolean => {
        return discountType === ExtendedDiscountType.AMOUNT_NET ||
            discountType === ExtendedDiscountType.FIXED_PRICE_NET;
    };

    // Funkcja do przetwarzania rabatu z uwzględnieniem typów netto/brutto
    const calculateDiscountedPrice = (
        basePrice: number,
        discountValue: number,
        discountType: ExtendedDiscountType | DiscountType,
        quantity: number,
        vatRate: number
    ): number => {
        const totalBasePrice = basePrice * quantity;
        let finalPrice: number;

        switch(discountType) {
            case ExtendedDiscountType.PERCENTAGE:
            case DiscountType.PERCENTAGE:
                // Rabat procentowy działa tak samo dla netto i brutto
                finalPrice = totalBasePrice * (1 - discountValue / 100);
                break;

            case ExtendedDiscountType.AMOUNT_GROSS:
            case DiscountType.AMOUNT:
                // Rabat kwotowy brutto - odejmujemy wartość od ceny brutto
                finalPrice = Math.max(0, totalBasePrice - discountValue);
                break;

            case ExtendedDiscountType.AMOUNT_NET:
                // Rabat kwotowy netto - najpierw przeliczamy rabat na brutto
                const discountGross = calculateGrossPrice(discountValue, vatRate);
                finalPrice = Math.max(0, totalBasePrice - discountGross);
                break;

            case ExtendedDiscountType.FIXED_PRICE_GROSS:
            case DiscountType.FIXED_PRICE:
                // Ustawienie ceny końcowej brutto
                finalPrice = discountValue;
                break;

            case ExtendedDiscountType.FIXED_PRICE_NET:
                // Ustawienie ceny końcowej netto - przeliczamy na brutto
                finalPrice = calculateGrossPrice(discountValue, vatRate);
                break;

            default:
                finalPrice = totalBasePrice;
        }

        return finalPrice;
    };

    // Aktualizacja stanu usług przy zmianie props
    useEffect(() => {
        setEnhancedServices(services.map(service => ({
            ...service,
            extendedDiscountType: service.extendedDiscountType || getExtendedDiscountType(service.discountType)
        })));
    }, [services]);

    // Obsługa kliknięcia prawym przyciskiem na cenę
    const handlePriceRightClick = (e: React.MouseEvent, service: ServiceWithNote) => {
        e.preventDefault(); // Zapobiegaj domyślnemu menu kontekstowemu przeglądarki

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            serviceId: service.id
        });
    };

    // Obsługa kliknięcia na opcję edycji w menu kontekstowym
    const handleEditPrice = () => {
        // Znajdź usługę, której cena ma być edytowana
        const service = services.find(s => s.id === contextMenu.serviceId);
        if (!service) return;

        // Ukryj menu kontekstowe
        setContextMenu({...contextMenu, visible: false});

        // Pokaż okno edycji ceny
        const rect = document.getElementById(`price-${service.id}`)?.getBoundingClientRect();

        if (rect) {
            setEditPopup({
                visible: true,
                x: rect.left,
                y: rect.bottom + window.scrollY,
                serviceId: service.id,
                currentPrice: service.price,
                isGrossPrice: true // Domyślnie edytujemy cenę brutto
            });

            setNewPrice(service.price.toString());
        }
    };

    // Obsługa kliknięcia lewym przyciskiem myszy na cenę
    const handlePriceClick = (e: React.MouseEvent, service: ServiceWithNote) => {
        // Otwórz okno edycji
        const rect = e.currentTarget.getBoundingClientRect();
        setEditPopup({
            visible: true,
            x: rect.left,
            y: rect.bottom + window.scrollY,
            serviceId: service.id,
            currentPrice: service.price,
            isGrossPrice: true // Domyślnie edytujemy cenę brutto
        });
        setNewPrice(service.price.toString());
    };

    // Obsługa zmiany typu ceny (netto/brutto) w oknie edycji
    const handlePriceTypeChange = (isGross: boolean) => {
        // Znajdź usługę
        const service = services.find(s => s.id === editPopup.serviceId);
        if (!service) return;

        const vatRate = service.vatRate || DEFAULT_VAT_RATE;
        let newPriceValue = parseFloat(newPrice) || service.price;

        // Przelicz cenę z aktualnego typu na nowy
        if (editPopup.isGrossPrice && !isGross) {
            // Zmiana z brutto na netto
            newPriceValue = calculateNetPrice(newPriceValue, vatRate);
        } else if (!editPopup.isGrossPrice && isGross) {
            // Zmiana z netto na brutto
            newPriceValue = calculateGrossPrice(newPriceValue, vatRate);
        }

        // Aktualizuj stan
        setEditPopup({
            ...editPopup,
            isGrossPrice: isGross
        });

        // Aktualizuj wartość w polu
        setNewPrice(newPriceValue.toFixed(2));
    };

    // Zapisz nową cenę
    const handleSavePrice = () => {
        // Konwertuj string na liczbę, ale tylko jeśli nie jest pusty
        const parsedPrice = newPrice.trim() === '' ? 0 : parseFloat(newPrice);

        if (!isNaN(parsedPrice) && parsedPrice >= 0) {
            // Znajdź usługę
            const service = services.find(s => s.id === editPopup.serviceId);
            if (!service) return;

            // Oblicz odpowiednią cenę (brutto lub netto) w zależności od wyboru
            const vatRate = service.vatRate || DEFAULT_VAT_RATE;
            let finalPrice = parsedPrice;

            // Jeśli wprowadziliśmy cenę netto, to przelicz ją na brutto dla modelu danych
            if (!editPopup.isGrossPrice) {
                finalPrice = calculateGrossPrice(parsedPrice, vatRate);
            }

            onBasePriceChange(editPopup.serviceId, finalPrice);
        }

        setEditPopup({...editPopup, visible: false});
    };

    // Obsługa zmiany ilości - aktualizuje stan lokalny pola wprowadzania
    const handleQuantityInputChange = (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Aktualizacja stanu lokalnego pola wprowadzania - pozwala na naturalne edytowanie
        setQuantityInputs({
            ...quantityInputs,
            [serviceId]: value
        });
    };

    // Obsługa zatwierdzenia ilości - wywoływane na blur lub enter
    const handleQuantityBlur = (serviceId: string) => {
        const inputValue = quantityInputs[serviceId] || '';
        const parsedValue = parseInt(inputValue, 10);

        // Jeśli wartość jest prawidłową liczbą i nie jest taka sama jak bieżąca ilość
        if (!isNaN(parsedValue) && parsedValue > 0) {
            onQuantityChange(serviceId, parsedValue);
        } else {
            // Jeśli wartość jest nieprawidłowa, przywróć aktualną ilość z usługi
            const service = services.find(s => s.id === serviceId);
            if (service) {
                setQuantityInputs({
                    ...quantityInputs,
                    [serviceId]: String(service.quantity || 1)
                });
            }
        }
    };

    // Obsługa klawisza Enter w polu ilości
    const handleQuantityKeyDown = (serviceId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleQuantityBlur(serviceId);
        }
    };

    // Inicjalizacja/aktualizacja wartości pola ilości na podstawie usługi
    useEffect(() => {
        const newInputs: Record<string, string> = {};

        services.forEach(service => {
            // Użyj istniejącej wartości (jeśli użytkownik edytuje) lub weź z usługi
            if (!(service.id in quantityInputs)) {
                newInputs[service.id] = String(service.quantity || 1);
            }
        });

        if (Object.keys(newInputs).length > 0) {
            setQuantityInputs(prev => ({
                ...prev,
                ...newInputs
            }));
        }
    }, [services]);

    // Otwórz modal dodawania/edycji notatki
    const handleOpenNoteModal = (service: ServiceWithNote) => {
        setNoteModal({
            visible: true,
            serviceId: service.id,
            serviceName: service.name,
            currentNote: service.note || ''
        });
    };

    // Zapisz notatkę
    const handleSaveNote = (note: string) => {
        if (onAddNote && noteModal.serviceId) {
            onAddNote(noteModal.serviceId, note);
        }
    };

    // Handler do obsługi zmiany typu rabatu z rozszerzonym typem
    const handleExtendedDiscountTypeChange = (serviceId: string, newExtendedTypeValue: string) => {
        // Konwertuj wartość string na enum
        const newExtendedType = newExtendedTypeValue as ExtendedDiscountType;

        // Znajdź usługę
        const service = enhancedServices.find(s => s.id === serviceId);
        if (!service) return;

        // Mapuj rozszerzony typ na standardowy typ dla API
        const standardType = mapToStandardDiscountType(newExtendedType);

        // Przelicz wartość rabatu przy zmianie typu
        const vatRate = service.vatRate || DEFAULT_VAT_RATE;
        const quantity = service.quantity || 1;
        const basePrice = service.price;
        let newDiscountValue = service.discountValue;

        // Konwersja wartości rabatu przy zmianie typu
        const currentType = service.extendedDiscountType || getExtendedDiscountType(service.discountType);

        if (currentType !== newExtendedType) {
            // Najpierw oblicz aktualną cenę końcową
            const currentFinalPrice = service.finalPrice;
            const currentFinalPriceNet = calculateNetPrice(currentFinalPrice, vatRate);

            switch (newExtendedType) {
                case ExtendedDiscountType.PERCENTAGE:
                    // Konwersja na procent
                    const discount = basePrice * quantity - currentFinalPrice;
                    newDiscountValue = (discount / (basePrice * quantity)) * 100;
                    if (newDiscountValue > 100) newDiscountValue = 100;
                    if (newDiscountValue < 0) newDiscountValue = 0;
                    break;

                case ExtendedDiscountType.AMOUNT_GROSS:
                    // Konwersja na kwotę brutto
                    newDiscountValue = basePrice * quantity - currentFinalPrice;
                    if (newDiscountValue < 0) newDiscountValue = 0;
                    break;

                case ExtendedDiscountType.AMOUNT_NET:
                    // Konwersja na kwotę netto
                    const discountGross = basePrice * quantity - currentFinalPrice;
                    newDiscountValue = calculateNetPrice(discountGross, vatRate);
                    if (newDiscountValue < 0) newDiscountValue = 0;
                    break;

                case ExtendedDiscountType.FIXED_PRICE_GROSS:
                    // Ustawienie ceny końcowej brutto
                    newDiscountValue = currentFinalPrice;
                    break;

                case ExtendedDiscountType.FIXED_PRICE_NET:
                    // Ustawienie ceny końcowej netto
                    newDiscountValue = currentFinalPriceNet;
                    break;
            }
        }

        // Oblicz nową cenę końcową
        const newFinalPrice = calculateDiscountedPrice(
            basePrice,
            newDiscountValue,
            newExtendedType,
            quantity,
            vatRate
        );

        // Debugowanie
        console.log('Zmiana typu rabatu:', {
            serviceId,
            nowType: newExtendedType,
            wasType: currentType,
            newDiscountValue,
            newFinalPrice
        });

        // Zapisz rozszerzony typ w stanie lokalnym
        setEnhancedServices(prev => {
            const updatedServices = prev.map(s => {
                if (s.id === serviceId) {
                    return {
                        ...s,
                        extendedDiscountType: newExtendedType,
                        discountValue: parseFloat(newDiscountValue.toFixed(2)),
                        finalPrice: parseFloat(newFinalPrice.toFixed(2))
                    };
                }
                return s;
            });
            return updatedServices;
        });

        // Wywołaj oryginalną funkcję z typem standardowym i nową wartością rabatu
        onDiscountTypeChange(serviceId, standardType);
        onDiscountValueChange(serviceId, parseFloat(newDiscountValue.toFixed(2)));
    };

    // Aktualizacja wartości rabatu z uwzględnieniem rozszerzonych typów
    const handleExtendedDiscountValueChange = (serviceId: string, newValue: number) => {
        // Znajdź usługę
        const service = enhancedServices.find(s => s.id === serviceId);
        if (!service) return;

        const vatRate = service.vatRate || DEFAULT_VAT_RATE;
        const quantity = service.quantity || 1;
        const basePrice = service.price;
        const discountType = service.extendedDiscountType || getExtendedDiscountType(service.discountType);

        // Oblicz nową cenę końcową z uwzględnieniem typu rabatu (netto/brutto)
        const newFinalPrice = calculateDiscountedPrice(
            basePrice,
            newValue,
            discountType,
            quantity,
            vatRate
        );

        // Aktualizuj stan lokalny
        const updatedServices = enhancedServices.map(s => {
            if (s.id === serviceId) {
                return {
                    ...s,
                    discountValue: newValue,
                    finalPrice: parseFloat(newFinalPrice.toFixed(2))
                };
            }
            return s;
        });

        setEnhancedServices(updatedServices);

        // Wywołaj oryginalną funkcję
        onDiscountValueChange(serviceId, newValue);
    };

    // Zamknij menu kontekstowe przy kliknięciu na stronę
    useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu({...contextMenu, visible: false});
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenu]);
// Zamknij okno edycji przy kliknięciu Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditPopup({...editPopup, visible: false});
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editPopup]);

    // Funkcja obliczająca wszystkie potrzebne ceny dla usługi
    const calculateServicePrices = (service: ServiceWithNote) => {
        const vatRate = service.vatRate || DEFAULT_VAT_RATE;
        const quantity = service.quantity || 1;

        // Cena bazowa brutto (podawana przez użytkownika)
        const baseGrossPrice = service.price;
        // Cena bazowa netto
        const baseNetPrice = calculateNetPrice(baseGrossPrice, vatRate);

        // Cena końcowa brutto (po uwzględnieniu rabatu)
        const finalGrossPrice = service.finalPrice;
        // Cena końcowa netto
        const finalNetPrice = calculateNetPrice(finalGrossPrice, vatRate);

        // Wartość netto (cena końcowa netto × ilość)
        const totalNetValue = finalNetPrice * quantity;
        // Wartość brutto (cena końcowa brutto × ilość)
        const totalGrossValue = finalGrossPrice * quantity;

        return {
            baseNetPrice,
            baseGrossPrice,
            finalNetPrice,
            finalGrossPrice,
            totalNetValue,
            totalGrossValue
        };
    };

    // Oblicz łączne sumy netto i brutto
    const calculateNetGrossTotals = () => {
        let totalNetValue = 0;
        let totalGrossValue = 0;
        let totalBaseNetValue = 0;
        let totalBaseGrossValue = 0;
        let totalDiscountValue = 0;

        services.forEach(service => {
            const {
                totalNetValue: netValue,
                totalGrossValue: grossValue,
                baseNetPrice,
                baseGrossPrice,
            } = calculateServicePrices(service);

            const quantity = service.quantity || 1;

            // Obliczanie wartości bazowych (przed rabatem)
            const baseTotalNet = baseNetPrice * quantity;
            const baseTotalGross = baseGrossPrice * quantity;

            // Obliczanie wartości rabatu
            const discountValueGross = baseTotalGross - grossValue;

            totalNetValue += netValue;
            totalGrossValue += grossValue;
            totalBaseNetValue += baseTotalNet;
            totalBaseGrossValue += baseTotalGross;
            totalDiscountValue += discountValueGross;
        });

        return {
            totalNetValue,
            totalGrossValue,
            totalBaseNetValue,
            totalBaseGrossValue,
            totalDiscountValue
        };
    };

    const {
        totalNetValue,
        totalGrossValue,
        totalBaseNetValue,
        totalBaseGrossValue,
        totalDiscountValue
    } = calculateNetGrossTotals();

    return (
        <ServicesTableContainer>
            <Table>
                <thead>
                <tr>
                    <TableHeader>Nazwa</TableHeader>
                    <TableHeader>Cena bazowa</TableHeader>
                    <TableHeader>Ilość</TableHeader>
                    <TableHeader>Rabat</TableHeader>
                    <TableHeader>Cena końcowa</TableHeader>
                    <TableHeader>Akcje</TableHeader>
                </tr>
                </thead>
                <tbody>
                {services.length === 0 ? (
                    <tr>
                        <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                            Brak wybranych usług. Użyj pola wyszukiwania, aby dodać usługi.
                        </TableCell>
                    </tr>
                ) : (
                    enhancedServices.map(service => {
                        const prices = calculateServicePrices(service);

                        return (
                            <tr key={service.id}>
                                <TableCell>
                                    <ServiceNameContainer>
                                        <ServiceName>{service.name}</ServiceName>
                                        {service.note && (
                                            <ServiceNote>{service.note}</ServiceNote>
                                        )}
                                    </ServiceNameContainer>
                                </TableCell>
                                <EditablePriceCell
                                    id={`price-${service.id}`}
                                    onContextMenu={(e) => handlePriceRightClick(e, service)}
                                    onClick={(e) => handlePriceClick(e, service)}
                                >
                                    <PriceContainer>
                                        <PriceWrapper>
                                            <PriceValue>
                                                {prices.baseGrossPrice.toFixed(2)} zł
                                                <PriceType>brutto</PriceType>
                                            </PriceValue>
                                            <PriceValue>
                                                {prices.baseNetPrice.toFixed(2)} zł
                                                <PriceType>netto</PriceType>
                                            </PriceValue>
                                        </PriceWrapper>
                                        <EditIcon>
                                            <FaEdit />
                                        </EditIcon>
                                    </PriceContainer>
                                </EditablePriceCell>
                                {/* Komórka z polem do wprowadzania ilości */}
                                <TableCell>
                                    <QuantityInput
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={quantityInputs[service.id] || ''}
                                        onChange={(e) => handleQuantityInputChange(service.id, e)}
                                        onBlur={() => handleQuantityBlur(service.id)}
                                        onKeyDown={(e) => handleQuantityKeyDown(service.id, e)}
                                    />
                                </TableCell>
                                <DiscountCell>
                                    <DiscountCellContent>
                                        <StyledDiscountContainer>
                                            <DiscountInputGroup>
                                                <DiscountTypeSelect
                                                    value={service.extendedDiscountType || ExtendedDiscountType.PERCENTAGE}
                                                    onChange={(e) => handleExtendedDiscountTypeChange(service.id, e.target.value as ExtendedDiscountType)}
                                                >
                                                    {Object.entries(DiscountTypeLabelsExtended).map(([value, label]) => (
                                                        <option key={value} value={value}>
                                                            {label}
                                                        </option>
                                                    ))}
                                                </DiscountTypeSelect>
                                                <DiscountInput
                                                    type="number"
                                                    min="0"
                                                    max={service.extendedDiscountType === ExtendedDiscountType.PERCENTAGE ? 100 : undefined}
                                                    value={service.discountValue}
                                                    onChange={(e) => handleExtendedDiscountValueChange(service.id, parseFloat(e.target.value) || 0)}
                                                />
                                            </DiscountInputGroup>
                                            {service.extendedDiscountType === ExtendedDiscountType.PERCENTAGE && (
                                                <DiscountPercentage>
                                                    ({(service.price * (service.quantity || 1) * service.discountValue / 100).toFixed(2)} zł)
                                                </DiscountPercentage>
                                            )}
                                        </StyledDiscountContainer>
                                    </DiscountCellContent>
                                </DiscountCell>
                                <PriceCell>
                                    <PriceWrapper>
                                        <PriceValue>
                                            {prices.finalGrossPrice.toFixed(2)} zł
                                            <PriceType>brutto</PriceType>
                                        </PriceValue>
                                        <PriceValue>
                                            {prices.finalNetPrice.toFixed(2)} zł
                                            <PriceType>netto</PriceType>
                                        </PriceValue>
                                    </PriceWrapper>
                                </PriceCell>
                                <TableCell>
                                    <ActionButtonsContainer>
                                        <ActionButton
                                            type="button"
                                            onClick={() => handleOpenNoteModal(service)}
                                            title="Dodaj notatkę"
                                            note={!!service.note}
                                        >
                                            <FaStickyNote />
                                        </ActionButton>
                                        <ActionButton
                                            type="button"
                                            onClick={() => onRemoveService(service.id)}
                                            title="Usuń usługę"
                                            danger
                                        >
                                            <FaTrash />
                                        </ActionButton>
                                    </ActionButtonsContainer>
                                </TableCell>
                            </tr>
                        )})
                )}
                </tbody>
                <tfoot>
                <tr>
                    <TableFooterCell>Suma:</TableFooterCell>
                    <TableFooterCell>
                        <PriceWrapper>
                            <TotalValue>{totalBaseGrossValue.toFixed(2)} zł</TotalValue>
                            <PriceType>brutto</PriceType>
                            <TotalValue>{totalBaseNetValue.toFixed(2)} zł</TotalValue>
                            <PriceType>netto</PriceType>
                        </PriceWrapper>
                    </TableFooterCell>
                    <TableFooterCell colSpan={1}></TableFooterCell>
                    <TableFooterCell>
                        <PriceWrapper>
                            <TotalValue>{totalDiscountValue.toFixed(2)} zł</TotalValue>
                            <PriceType>brutto</PriceType>
                        </PriceWrapper>
                    </TableFooterCell>
                    <TableFooterCell>
                        <PriceWrapper>
                            <TotalValue>{totalFinalPrice.toFixed(2)} zł</TotalValue>
                            <PriceType>brutto</PriceType>
                            <TotalValue>{calculateNetPrice(totalFinalPrice, DEFAULT_VAT_RATE).toFixed(2)} zł</TotalValue>
                            <PriceType>netto</PriceType>
                        </PriceWrapper>
                    </TableFooterCell>
                    <TableFooterCell></TableFooterCell>
                </tr>
                </tfoot>
            </Table>

            {/* Menu kontekstowe */}
            {contextMenu.visible && (
                <ContextMenu
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MenuItem onClick={handleEditPrice}>
                        <FaEdit /> Edytuj cenę bazową
                    </MenuItem>
                </ContextMenu>
            )}

            {/* Okno edycji ceny */}
            {editPopup.visible && (
                <EditPricePopup
                    style={{
                        position: 'absolute',
                        top: editPopup.y,
                        left: editPopup.x
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <PopupTitle>Edytuj cenę bazową</PopupTitle>
                    <EditPriceForm>
                        <PriceTypeSelector>
                            <PriceTypeOption
                                selected={editPopup.isGrossPrice}
                                onClick={() => handlePriceTypeChange(true)}
                            >
                                Cena brutto
                            </PriceTypeOption>
                            <PriceTypeOption
                                selected={!editPopup.isGrossPrice}
                                onClick={() => handlePriceTypeChange(false)}
                            >
                                Cena netto
                            </PriceTypeOption>
                        </PriceTypeSelector>

                        <EditPriceInput
                            type="text"
                            value={newPrice}
                            onChange={(e) => {
                                // Pozwól na wprowadzanie tylko cyfr i kropki/przecinka
                                const value = e.target.value;
                                if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                                    setNewPrice(value);
                                }
                            }}
                            placeholder={`Wprowadź cenę ${editPopup.isGrossPrice ? 'brutto' : 'netto'}`}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSavePrice();
                                }
                            }}
                        />
                        <EditPriceButtons>
                            <Button onClick={() => setEditPopup({...editPopup, visible: false})}>
                                Anuluj
                            </Button>
                            <Button primary onClick={handleSavePrice}>
                                Zapisz
                            </Button>
                        </EditPriceButtons>
                    </EditPriceForm>
                </EditPricePopup>
            )}

            {/* Modal notatki */}
            <ServiceNoteModal
                isOpen={noteModal.visible}
                onClose={() => setNoteModal({...noteModal, visible: false})}
                onSave={handleSaveNote}
                serviceName={noteModal.serviceName}
                initialNote={noteModal.currentNote}
            />
        </ServicesTableContainer>
    );
};

export default ServiceTable;